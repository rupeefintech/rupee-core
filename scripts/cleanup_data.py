#!/usr/bin/env python3
"""
cleanup_data.py — BankInfoHub One-Shot Data Quality Fix
=========================================================
Fixes ALL data quality issues in your Neon PostgreSQL database:

  1. Districts — removes junk entries (Urban, Rural, Metro, Semi Urban etc),
                 merges spelling variants, removes non-district localities
  2. Pincodes  — extracts 6-digit pincodes from ADDRESS field for all 177K branches
  3. Bank metadata — adds short_name, bank_type, website for major Indian banks
  4. State codes — adds ISO 3166-2 codes for all Indian states

Run from your project root:
    python scripts/cleanup_data.py

Requirements: pip install psycopg2-binary tqdm colorama
"""

import os
import re
import sys
import time
from pathlib import Path
from typing import Optional

# ── Auto-install deps ─────────────────────────────────────────────────────────
try:
    import psycopg2
    import psycopg2.extras
    from tqdm import tqdm
    from colorama import Fore, Style, init as colorama_init
except ImportError:
    print("📦 Installing dependencies...")
    os.system(f"{sys.executable} -m pip install psycopg2-binary tqdm colorama -q")
    import psycopg2
    import psycopg2.extras
    from tqdm import tqdm
    from colorama import Fore, Style, init as colorama_init

colorama_init(autoreset=True)

# ── Load .env ─────────────────────────────────────────────────────────────────
SCRIPTS_DIR = Path(__file__).parent.resolve()
BASE_DIR    = SCRIPTS_DIR.parent

for candidate in [BASE_DIR / ".env", SCRIPTS_DIR / ".env"]:
    if candidate.exists():
        with open(candidate) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and not os.environ.get(k):
                    os.environ[k] = v
        print(f"✅ Loaded env from: {candidate}")
        break


# ═════════════════════════════════════════════════════════════════════════════
# CONFIGURATION DATA
# ═════════════════════════════════════════════════════════════════════════════

# ── Defunct/Closed Banks ──────────────────────────────────────────────────────
DEFUNCT_BANKS = {
    "Andhra Bank",  # Merged with Bank of Baroda (2020)
    "Vijaya Bank",  # Merged with Bank of Baroda (2019)
    "Dena Bank",    # Merged with Bank of Baroda (2019)
    "Allahabad Bank",  # Merged with Indian Bank (2020)
    "Syndicate Bank",  # Merged with Canara Bank (2020)
}

# ── Junk district names to delete entirely ────────────────────────────────────
# These are RBI branch category codes / generic words — not real districts
JUNK_DISTRICTS = {
    "Urban", "Rural", "Metro", "Semi Urban", "Semiurban", "Semi-Urban",
    "Urban Bank", "Rural Bank", "Metropolitan", "Suburban",
    "Unknown", "Na", "N/A", "Nil", "None", "Test", "Dummy", "Other",
    # Localities that are not revenue districts
    "Kukatpally", "Malkajgiri", "Ameerpet", "Secunderabad",
    "Hanamkonda", "Kodad", "Godavarikhani", "Serilingampally",
    "Seri Lingampally", "Seri-Lingampally",
    "Jammikunta", "Armoor", "Bhongir", "Bodhan", "Huzurabad",
    "Gadwal", "Sircilla", "Bhongir",
}

# ── Canonical district name mapping ──────────────────────────────────────────
# Maps bad/variant names → correct official name
# Format: "bad name as stored in DB (Title Case)" : "Correct Name"
DISTRICT_CANONICAL = {
    # Telangana
    "Rangareddi":               "Rangareddy",
    "Ranga Reddy":              "Rangareddy",
    "Hyderabad-I":              "Hyderabad",
    "Hyderabad-Ii":             "Hyderabad",
    "Hyderabad - I":            "Hyderabad",
    "Hyderabad - Ii":           "Hyderabad",
    "Mahabubnagar":             "Mahbubnagar",
    "Mahabubabad":              "Mahbubnagar",
    "Kothagudem":               "Bhadradri Kothagudem",
    "Warangal Urban":           "Warangal",
    "Warangal Rural":           "Warangal",
    "Secunderabad Cantonment":  "Hyderabad",
    "Yadadri":                  "Yadadri Bhuvanagiri",
    "Jogulamba Gadwal":         "Jogulamba",

    # Andhra Pradesh
    "Visakhapatnam":            "Visakhapatnam",
    "Vizag":                    "Visakhapatnam",
    "Vishakhapatnam":           "Visakhapatnam",
    "Sri Potti Sriramulu Nellore": "Nellore",
    "Spsr Nellore":             "Nellore",

    # Karnataka
    "Bangalore":                "Bengaluru",
    "Bangalore Rural":          "Bengaluru Rural",
    "Bangalore Urban":          "Bengaluru Urban",
    "Bangaluru":                "Bengaluru",

    # Maharashtra
    "Mum Bai":                  "Mumbai",
    "Mumbai Suburban":          "Mumbai",
    "Mumbai City":              "Mumbai",
    "Thane District":           "Thane",

    # Delhi
    "New Delhi":                "Delhi",
    "Newdelhi":                 "Delhi",
    "New Delhi District":       "Delhi",
    "North Delhi":              "Delhi",
    "South Delhi":              "Delhi",
    "East Delhi":               "Delhi",
    "West Delhi":               "Delhi",
    "Central Delhi":            "Delhi",
    "North East Delhi":         "Delhi",
    "North West Delhi":         "Delhi",
    "South East Delhi":         "Delhi",
    "South West Delhi":         "Delhi",
    "Shahdara":                 "Delhi",

    # Punjab
    "S A S Nagar Mohali":       "Sahibzada Ajit Singh Nagar",
    "S.A.S. Nagar Mohali":      "Sahibzada Ajit Singh Nagar",
    "S.A.S.Nagar Mohali":       "Sahibzada Ajit Singh Nagar",
    "Sa S Nagar Mohali":        "Sahibzada Ajit Singh Nagar",
    "Sas Nagar - Mohali":       "Sahibzada Ajit Singh Nagar",
    "Sas Nagar Mohali":         "Sahibzada Ajit Singh Nagar",
    "Sas Nagar,Mohali":         "Sahibzada Ajit Singh Nagar",
    "Sas Nagar-Mohali":         "Sahibzada Ajit Singh Nagar",
    "Sas Nagarmohali":          "Sahibzada Ajit Singh Nagar",
    "Sasnagar Mohali":          "Sahibzada Ajit Singh Nagar",
    "Sasnagarmohali":           "Sahibzada Ajit Singh Nagar",
    "Mohali":                   "Sahibzada Ajit Singh Nagar",

    # Uttarakhand
    "Dehra Dun":                "Dehradun",

    # General spacing variants
    "Ram Nagar":                "Ramnagar",
    "Ram Garh":                 "Ramgarh",
    "Gandhi Nagar":             "Gandhinagar",
    "Ashok Nagar":              "Ashoknagar",
    "Jawahar Nagar":            "Jawaharnagar",
    "Naya Gaon":                "Nayagaon",
    "Kota 1":                   "Kota",
    "Sri Nagar":                "Srinagar",

    # Jharkhand
    "Raghunath Pur":            "Raghunathpur",
    "Saraikela-Kharsawan":      "Saraikela Kharsawan",
}

# ── Bank metadata ─────────────────────────────────────────────────────────────
BANK_METADATA = {
    "SBIN": {"short_name": "SBI",      "bank_type": "PSB",     "website": "https://sbi.co.in"},
    "HDFC": {"short_name": "HDFC",     "bank_type": "Private", "website": "https://hdfcbank.com"},
    "ICIC": {"short_name": "ICICI",    "bank_type": "Private", "website": "https://icicibank.com"},
    "UTIB": {"short_name": "Axis",     "bank_type": "Private", "website": "https://axisbank.com"},
    "KKBK": {"short_name": "Kotak",    "bank_type": "Private", "website": "https://kotak.com"},
    "PUNB": {"short_name": "PNB",      "bank_type": "PSB",     "website": "https://pnbindia.in"},
    "CNRB": {"short_name": "Canara",   "bank_type": "PSB",     "website": "https://canarabank.com"},
    "UBIN": {"short_name": "UBI",      "bank_type": "PSB",     "website": "https://unionbankofindia.co.in"},
    "BARB": {"short_name": "BOB",      "bank_type": "PSB",     "website": "https://bankofbaroda.in"},
    "BKID": {"short_name": "BOI",      "bank_type": "PSB",     "website": "https://bankofindia.co.in"},
    "IOBA": {"short_name": "IOB",      "bank_type": "PSB",     "website": "https://iob.in"},
    "IDIB": {"short_name": "IB",       "bank_type": "PSB",     "website": "https://indianbank.in"},
    "MAHB": {"short_name": "BOM",      "bank_type": "PSB",     "website": "https://bankofmaharashtra.in"},
    "CBIN": {"short_name": "CBI",      "bank_type": "PSB",     "website": "https://centralbankofindia.co.in"},
    "PSIB": {"short_name": "PSB",      "bank_type": "PSB",     "website": "https://punjabandsindbank.co.in"},
    "UCBA": {"short_name": "UCO",      "bank_type": "PSB",     "website": "https://ucobank.com"},
    "YESB": {"short_name": "Yes",      "bank_type": "Private", "website": "https://yesbank.in"},
    "FDRL": {"short_name": "Federal",  "bank_type": "Private", "website": "https://federalbank.co.in"},
    "KVBL": {"short_name": "KVB",      "bank_type": "Private", "website": "https://kvb.co.in"},
    "SIBL": {"short_name": "SIB",      "bank_type": "Private", "website": "https://southindianbank.com"},
    "RATN": {"short_name": "RBL",      "bank_type": "Private", "website": "https://rblbank.com"},
    "BDBL": {"short_name": "Bandhan",  "bank_type": "Private", "website": "https://bandhanbank.com"},
    "IDFB": {"short_name": "IDFC",     "bank_type": "Private", "website": "https://idfcfirstbank.com"},
    "AUBL": {"short_name": "AU",       "bank_type": "SFB",     "website": "https://aubank.in"},
    "ESAF": {"short_name": "ESAF",     "bank_type": "SFB",     "website": "https://esafbank.com"},
    "UJVN": {"short_name": "Ujjivan",  "bank_type": "SFB",     "website": "https://ujjivansfb.in"},
    "DLXB": {"short_name": "Dhanlaxmi","bank_type": "Private", "website": "https://dhanbank.com"},
    "CSBK": {"short_name": "CSB",      "bank_type": "Private", "website": "https://csb.co.in"},
    "KARB": {"short_name": "Karnataka","bank_type": "Private", "website": "https://ktkbank.com"},
    "JAKA": {"short_name": "J&K Bank", "bank_type": "Private", "website": "https://jkbank.com"},
    "LAVB": {"short_name": "LVB",      "bank_type": "Private", "website": "https://dbs.com/in"},
    "NKGS": {"short_name": "NKGSB",   "bank_type": "Coop",    "website": "https://nkgsb-bank.com"},
    "IDFC": {"short_name": "IDFC",     "bank_type": "Private", "website": "https://idfcfirstbank.com"},
    "AIRP": {"short_name": "Airtel",   "bank_type": "Payments","website": "https://airtel.in/bank"},
    "FINO": {"short_name": "Fino",     "bank_type": "Payments","website": "https://finobank.com"},
    "Corp": {"short_name": "Corp",     "bank_type": "PSB",     "website": "https://unionbankofindia.co.in"},
}

# ── State ISO codes ───────────────────────────────────────────────────────────
STATE_CODES = {
    "Andhra Pradesh":           "IN-AP",
    "Arunachal Pradesh":        "IN-AR",
    "Assam":                    "IN-AS",
    "Bihar":                    "IN-BR",
    "Chhattisgarh":             "IN-CT",
    "Goa":                      "IN-GA",
    "Gujarat":                  "IN-GJ",
    "Haryana":                  "IN-HR",
    "Himachal Pradesh":         "IN-HP",
    "Jharkhand":                "IN-JH",
    "Karnataka":                "IN-KA",
    "Kerala":                   "IN-KL",
    "Madhya Pradesh":           "IN-MP",
    "Maharashtra":              "IN-MH",
    "Manipur":                  "IN-MN",
    "Meghalaya":                "IN-ML",
    "Mizoram":                  "IN-MZ",
    "Nagaland":                 "IN-NL",
    "Odisha":                   "IN-OR",
    "Punjab":                   "IN-PB",
    "Rajasthan":                "IN-RJ",
    "Sikkim":                   "IN-SK",
    "Tamil Nadu":               "IN-TN",
    "Telangana":                "IN-TG",
    "Tripura":                  "IN-TR",
    "Uttar Pradesh":            "IN-UP",
    "Uttarakhand":              "IN-UT",
    "West Bengal":              "IN-WB",
    # Union Territories
    "Andaman And Nicobar Islands": "IN-AN",
    "Andaman & Nicobar Islands":   "IN-AN",
    "Chandigarh":               "IN-CH",
    "Dadra And Nagar Haveli And Daman And Diu": "IN-DH",
    "Delhi":                    "IN-DL",
    "Jammu And Kashmir":        "IN-JK",
    "Jammu & Kashmir":          "IN-JK",
    "Ladakh":                   "IN-LA",
    "Lakshadweep":              "IN-LD",
    "Puducherry":               "IN-PY",
    "Pondicherry":              "IN-PY",
}


# ═════════════════════════════════════════════════════════════════════════════
# PINCODE EXTRACTION
# ═════════════════════════════════════════════════════════════════════════════

def extract_pincode(address: str) -> Optional[str]:
    """Extract 6-digit Indian pincode from address string."""
    if not address or len(address) < 6:
        return None

    # Pattern 1: explicit PIN/PINCODE label (handles spaces in number like "395 003")
    m = re.search(r'\bPIN(?:CODE)?[-:\s]+(\d[\s\d]{4,7}\d)', address, re.IGNORECASE)
    if m:
        digits = re.sub(r'\s+', '', m.group(1))
        if len(digits) == 6 and digits[0] != '0':
            return digits

    # Pattern 2: standalone 6-digit number (most common — appears at end)
    m = re.search(r'(?<!\d)([1-9]\d{5})(?!\d)', address)
    if m:
        return m.group(1)

    return None


# ═════════════════════════════════════════════════════════════════════════════
# DATABASE CONNECTION
# ═════════════════════════════════════════════════════════════════════════════

def get_conn():
    """Get a fresh direct PostgreSQL connection."""
    url = os.environ.get("DIRECT_URL") or os.environ.get("DATABASE_URL", "")
    if not url:
        print(f"{Fore.RED}❌ No DATABASE_URL or DIRECT_URL found in environment.")
        sys.exit(1)
    # Strip pgbouncer param — psycopg2 doesn't understand it
    url = url.replace("&pgbouncer=true", "").replace("?pgbouncer=true", "")
    conn = psycopg2.connect(url, connect_timeout=30)
    conn.autocommit = False
    return conn


# ═════════════════════════════════════════════════════════════════════════════
# STEP 1 — FIX DISTRICTS
# ═════════════════════════════════════════════════════════════════════════════

def fix_districts(conn):
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Step 1 — Fixing districts")
    print(f"{'═'*60}{Style.RESET_ALL}")

    cur = conn.cursor()

    # 1a. Count before
    cur.execute('SELECT COUNT(*) FROM "District"')
    before = cur.fetchone()[0]
    print(f"  Districts before: {before:,}")

    # 1b. Delete junk districts — reassign branches to NULL first
    junk_deleted = 0
    for junk_name in JUNK_DISTRICTS:
        cur.execute(
            'SELECT id FROM "District" WHERE lower(name) = lower(%s)',
            (junk_name,)
        )
        rows = cur.fetchall()
        for (did,) in rows:
            cur.execute(
                'UPDATE "Branch" SET district_id = NULL WHERE district_id = %s',
                (did,)
            )
            cur.execute('DELETE FROM "District" WHERE id = %s', (did,))
            junk_deleted += 1

    conn.commit()
    print(f"  Junk districts removed: {junk_deleted}")

    # 1c. Apply canonical name mapping
    merged = 0
    for bad_name, canonical_name in DISTRICT_CANONICAL.items():
        # Find all districts with the bad name
        cur.execute(
            'SELECT id, state_id FROM "District" WHERE name = %s',
            (bad_name,)
        )
        bad_rows = cur.fetchall()
        if not bad_rows:
            continue

        for (bad_id, state_id) in bad_rows:
            # Find or create the canonical district in the same state
            cur.execute(
                'SELECT id FROM "District" WHERE name = %s AND state_id = %s',
                (canonical_name, state_id)
            )
            canonical_row = cur.fetchone()

            if canonical_row:
                canonical_id = canonical_row[0]
                # Reassign all branches from bad district to canonical
                cur.execute(
                    'UPDATE "Branch" SET district_id = %s WHERE district_id = %s',
                    (canonical_id, bad_id)
                )
                cur.execute('DELETE FROM "District" WHERE id = %s', (bad_id,))
            else:
                # Rename the bad district to the canonical name
                cur.execute(
                    'UPDATE "District" SET name = %s WHERE id = %s',
                    (canonical_name, bad_id)
                )
            merged += 1

    conn.commit()
    print(f"  District names normalised: {merged}")

    # 1d. Merge duplicates — same name+state_id, keep lowest id
    cur.execute("""
        SELECT name, state_id, array_agg(id ORDER BY id) as ids
        FROM "District"
        GROUP BY name, state_id
        HAVING COUNT(*) > 1
    """)
    dupes = cur.fetchall()
    deduped = 0
    for (name, state_id, ids) in dupes:
        keep_id = ids[0]
        for dup_id in ids[1:]:
            cur.execute(
                'UPDATE "Branch" SET district_id = %s WHERE district_id = %s',
                (keep_id, dup_id)
            )
            cur.execute('DELETE FROM "District" WHERE id = %s', (dup_id,))
            deduped += 1

    conn.commit()
    print(f"  Duplicate districts merged: {deduped}")

    # 1e. Count after
    cur.execute('SELECT COUNT(*) FROM "District"')
    after = cur.fetchone()[0]
    print(f"  Districts after:  {after:,}  (removed {before - after:,})")
    cur.close()


# ═════════════════════════════════════════════════════════════════════════════
# STEP 2 — EXTRACT PINCODES FROM ADDRESS
# ═════════════════════════════════════════════════════════════════════════════

def fix_pincodes(conn):
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Step 2 — Extracting pincodes from addresses")
    print(f"{'═'*60}{Style.RESET_ALL}")

    cur = conn.cursor()

    # Fetch all branches with address but no pincode
    cur.execute("""
        SELECT id, address FROM "Branch"
        WHERE pincode IS NULL
        AND address IS NOT NULL
        AND address != ''
    """)
    rows = cur.fetchall()
    print(f"  Branches needing pincode extraction: {len(rows):,}")

    updates = []
    found = 0
    for (branch_id, address) in rows:
        pincode = extract_pincode(address)
        if pincode:
            updates.append((pincode, branch_id))
            found += 1

    if updates:
        psycopg2.extras.execute_batch(
            cur,
            'UPDATE "Branch" SET pincode = %s WHERE id = %s',
            updates,
            page_size=1000
        )
        conn.commit()

    print(f"  Pincodes extracted and saved: {found:,}")
    print(f"  Branches still without pincode: {len(rows) - found:,} (genuinely missing in source data)")
    cur.close()


# ═════════════════════════════════════════════════════════════════════════════
# STEP 3 — ADD BANK METADATA
# ═════════════════════════════════════════════════════════════════════════════

def reset_all_bank_metadata(conn):
    """Reset all bank metadata to NULL to start fresh"""
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Resetting all bank metadata to NULL")
    print(f"{'═'*60}{Style.RESET_ALL}")

    cur = conn.cursor()
    cur.execute('''
        UPDATE "Bank"
        SET 
            short_name = NULL,
            website = NULL,
            bank_type = NULL,
            headquarters = NULL,
            logo_url = NULL
    ''')
    
    updated = cur.rowcount
    conn.commit()
    print(f"  ✓ Reset metadata for {updated} banks")
    cur.close()

def fix_bank_metadata(conn):
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Step 3 — Adding bank metadata")
    print(f"{'═'*60}{Style.RESET_ALL}")

    cur = conn.cursor()
    cur.execute('SELECT id, bank_code FROM "Bank" WHERE bank_code IS NOT NULL')
    banks = cur.fetchall()

    updated = 0
    for (bank_id, bank_code) in banks:
        code = (bank_code or "").strip().upper()
        meta = BANK_METADATA.get(code)
        if meta:
            cur.execute("""
                UPDATE "Bank"
                SET short_name = %s,
                    bank_type  = %s,
                    website    = %s
                WHERE id = %s
                AND (short_name IS NULL OR bank_type IS NULL OR website IS NULL)
            """, (
                meta["short_name"],
                meta["bank_type"],
                meta["website"],
                bank_id
            ))
            if cur.rowcount > 0:
                updated += 1

    conn.commit()
    print(f"  Banks updated with metadata: {updated}")

    cur.execute('SELECT COUNT(*) FROM "Bank" WHERE website IS NOT NULL')
    with_website = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM "Bank"')
    total_banks = cur.fetchone()[0]
    print(f"  Banks with website: {with_website}/{total_banks}")
    cur.close()


# ═════════════════════════════════════════════════════════════════════════════
# STEP 4 — ADD STATE ISO CODES
# ═════════════════════════════════════════════════════════════════════════════

def fix_state_codes(conn):
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Step 4 — Adding state ISO codes")
    print(f"{'═'*60}{Style.RESET_ALL}")

    cur = conn.cursor()
    cur.execute('SELECT id, name FROM "State"')
    states = cur.fetchall()

    updated = 0
    not_found = []
    for (state_id, state_name) in states:
        code = STATE_CODES.get(state_name)
        if code:
            cur.execute(
                'UPDATE "State" SET code = %s WHERE id = %s',
                (code, state_id)
            )
            updated += 1
        else:
            not_found.append(state_name)

    conn.commit()
    print(f"  States updated with ISO codes: {updated}")
    if not_found:
        print(f"  States without code mapping: {not_found}")
    cur.close()



def remove_defunct_banks(conn):
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Removing defunct/closed banks")
    print(f"{'═'*60}{Style.RESET_ALL}")

    cur = conn.cursor()
    cur.execute('SELECT id, name FROM "Bank" WHERE name = ANY(%s)', (list(DEFUNCT_BANKS),))
    defunct = cur.fetchall()

    if not defunct:
        print(f"  No defunct banks found")
        cur.close()
        return

    for bank_id, name in defunct:
        cur.execute('DELETE FROM "Branch" WHERE bank_id = %s', (bank_id,))
        branches_deleted = cur.rowcount
        cur.execute('DELETE FROM "Bank" WHERE id = %s', (bank_id,))
        print(f"  ✓ {name} ({branches_deleted} branches removed)")

    conn.commit()
    cur.close()

# ═════════════════════════════════════════════════════════════════════════════
# STEP 5 — PRINT FINAL STATS
# ═════════════════════════════════════════════════════════════════════════════

def print_final_stats(conn):
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Final Database Stats")
    print(f"{'═'*60}{Style.RESET_ALL}")

    cur = conn.cursor()
    stats = [
        ("Total branches",             'SELECT COUNT(*) FROM "Branch"'),
        ("Branches with district",     'SELECT COUNT(*) FROM "Branch" WHERE district_id IS NOT NULL'),
        ("Branches with pincode",      'SELECT COUNT(*) FROM "Branch" WHERE pincode IS NOT NULL'),
        ("Branches with phone",        'SELECT COUNT(*) FROM "Branch" WHERE phone IS NOT NULL'),
        ("Total districts (clean)",    'SELECT COUNT(*) FROM "District"'),
        ("Total banks",                'SELECT COUNT(*) FROM "Bank"'),
        ("Banks with website",         'SELECT COUNT(*) FROM "Bank" WHERE website IS NOT NULL'),
        ("States with ISO code",       'SELECT COUNT(*) FROM "State" WHERE code IS NOT NULL'),
    ]

    for label, sql in stats:
        cur.execute(sql)
        val = cur.fetchone()[0]
        print(f"  {label:<35} {Fore.GREEN}{val:>10,}{Style.RESET_ALL}")

    cur.close()

def fix_corrupted_bank_codes(conn):
    """Remove or null out bank_code for cooperative/small banks with corrupted codes"""
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Fixing corrupted bank codes")
    print(f"{'═'*60}{Style.RESET_ALL}")

    cur = conn.cursor()

    # Find cooperative banks
    cur.execute('''
        SELECT b.id, b.name, b.bank_code, COUNT(br.id) as branch_count
        FROM "Bank" b
        LEFT JOIN "Branch" br ON b.id = br.bank_id
        WHERE b.name LIKE '%Co-operative%' 
           OR b.name LIKE '%co-op%'
           OR b.name LIKE '%Urban Bank%'
        GROUP BY b.id, b.name, b.bank_code
        ORDER BY branch_count ASC
    ''')
    
    coop_banks = cur.fetchall()
    print(f"  Found {len(coop_banks)} cooperative/small banks")

    deleted = 0
    nulled = 0

    for bank_id, name, code, branch_count in coop_banks:
        # If < 5 branches, delete it
        if branch_count < 5:
            cur.execute('DELETE FROM "Branch" WHERE bank_id = %s', (bank_id,))
            cur.execute('DELETE FROM "Bank" WHERE id = %s', (bank_id,))
            deleted += 1
            print(f"  ✓ Deleted: {name} ({branch_count} branches)")
        else:
            # Otherwise set bank_code to NULL so it doesn't get wrong metadata
            cur.execute('UPDATE "Bank" SET bank_code = NULL WHERE id = %s', (bank_id,))
            nulled += 1
            print(f"  ✓ Nulled code: {name} ({branch_count} branches)")

    conn.commit()
    print(f"  Deleted: {deleted} banks, Nulled codes: {nulled} banks")
    cur.close()

# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

def main():
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  BankInfoHub — Data Quality Cleanup")
    print(f"{'═'*60}{Style.RESET_ALL}")

    conn = get_conn()
    t0 = time.time()

    try:
        reset_all_bank_metadata(conn)
        fix_districts(conn)
        remove_defunct_banks(conn)
        #fix_corrupted_bank_codes(conn)
        fix_pincodes(conn)
        fix_bank_metadata(conn)
        fix_state_codes(conn)
        print_final_stats(conn)

        duration = time.time() - t0
        print(f"\n{Fore.GREEN}✅ Cleanup complete in {duration:.1f}s{Style.RESET_ALL}\n")

        # Clear API cache so changes are visible immediately
        api_url = os.environ.get("API_URL", "http://localhost:3001")
        try:
            import urllib.request
            req = urllib.request.Request(f"{api_url}/api/cache/clear", method="POST")
            urllib.request.urlopen(req, timeout=5)
            print(f"✅ API cache cleared — changes visible immediately")
        except Exception:
            print(f"ℹ️  API cache not cleared (server not reachable) — restart backend to see changes")

    except Exception as e:
        conn.rollback()
        print(f"\n{Fore.RED}❌ Cleanup failed: {e}{Style.RESET_ALL}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
