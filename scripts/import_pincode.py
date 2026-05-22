#!/usr/bin/env python3
"""
import_pincode.py — India Post PIN code directory importer
==========================================================
Reads a CSV or JSON file downloaded from data.gov.in and imports it into
the post_offices table in Neon PostgreSQL.

Format is auto-detected from the file extension (.csv / .json).

Dataset source (free, open government data):
  https://data.gov.in/catalog/all-india-pincode-directory
  Download as CSV → save as scripts/pincode_data.csv
  Download as JSON → save as scripts/pincode_data.json

Usage:
    python import_pincode.py                              # auto-finds pincode_data.csv or .json
    python import_pincode.py --file /path/to/data.csv
    python import_pincode.py --file /path/to/data.json
    python import_pincode.py --dry-run                    # parse only, no DB writes
    python import_pincode.py --truncate                   # drop existing rows first
    python import_pincode.py --stats                      # show DB row counts and exit

Requirements:
    pip install psycopg2-binary tqdm colorama python-dotenv
"""

import os
import sys
import csv
import json
import argparse
import time
from pathlib import Path
from typing import Optional

try:
    import psycopg2
    import psycopg2.extras
    from tqdm import tqdm
    from colorama import Fore, Style, init as colorama_init
    from dotenv import load_dotenv
except ImportError:
    print("Missing deps. Run: pip install psycopg2-binary tqdm colorama python-dotenv")
    sys.exit(1)

colorama_init(autoreset=True)

# Force UTF-8 output on Windows to avoid cp1252 encode errors
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')  # type: ignore

SCRIPT_DIR    = Path(__file__).parent
DEFAULT_CSV   = SCRIPT_DIR / "pincode_data.csv"
DEFAULT_JSON  = SCRIPT_DIR / "pincode_data.json"
BATCH_SIZE    = 1000

# Column name variants — exact data.gov.in CSV names listed first
COL_ALIASES = {
    "pin_code":    ["pincode",    "Pincode",    "PIN",        "PINCode",        "pin_code"   ],
    "office_name": ["officename", "OfficeName", "Office Name","PostOfficeName",  "office_name"],
    "office_type": ["officetype", "OfficeType", "Office Type","office_type"                  ],
    "delivery":    ["delivery",   "Delivery",   "DeliveryStatus", "Delivery Status"          ],
    "district":    ["district",   "District",   "DistrictName",   "District Name"            ],
    "division":    ["divisionname","DivisionName","Division",  "division"                    ],
    "region":      ["regionname", "RegionName", "Region",     "region"                       ],
    "circle":      ["circlename", "CircleName", "Circle",     "circle"                       ],
    "state_name":  ["statename",  "StateName",  "State",      "State Name",      "state_name"],
    "latitude":    ["latitude",   "Latitude",   "lat"                                        ],
    "longitude":   ["longitude",  "Longitude",  "lon",        "long"                         ],
}

def ok(msg):   print(f"{Fore.GREEN}  ✓{Style.RESET_ALL}  {msg}")
def info(msg): print(f"{Fore.CYAN}  →{Style.RESET_ALL}  {msg}")
def warn(msg): print(f"{Fore.YELLOW}  ⚠{Style.RESET_ALL}  {msg}")
def err(msg):  print(f"{Fore.RED}  ✗{Style.RESET_ALL}  {msg}")


def get_db_url() -> str:
    load_dotenv(SCRIPT_DIR / ".env")
    # Prefer DIRECT_URL (no pgbouncer), fall back to DATABASE_URL
    url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not url:
        err("DATABASE_URL not set. Add it to scripts/.env or export it.")
        sys.exit(1)
    url = url.replace("postgres://", "postgresql://", 1)
    # Strip params psycopg2 doesn't understand (pgbouncer, etc.)
    if "?" in url:
        from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
        parsed = urlparse(url)
        allowed = {"sslmode", "sslrootcert", "sslcert", "sslkey", "connect_timeout"}
        qs = {k: v for k, v in parse_qs(parsed.query).items() if k in allowed}
        url = urlunparse(parsed._replace(query=urlencode(qs, doseq=True)))
    return url


def resolve_col(headers: list, field: str) -> Optional[str]:
    for alias in COL_ALIASES.get(field, [field]):
        if alias in headers:
            return alias
    return None


def build_col_map(headers: list) -> dict:
    col_map = {}
    for field in COL_ALIASES:
        col = resolve_col(headers, field)
        if col:
            col_map[field] = col
    return col_map


def parse_delivery(val: str) -> bool:
    return val.strip().lower() not in ("non-delivery", "non delivery", "false", "0", "n", "nd")


def clean(val: str) -> str:
    if not val or val.lower() in ("nan", "none", "null", ""):
        return ""
    return val.strip().title()


def clean_office_type(val: str) -> str:
    v = val.strip().upper().replace(" ", "")
    mapping = {
        "H.O": "H.O", "HO": "H.O", "HEADOFFICE": "H.O",
        "S.O": "S.O", "SO": "S.O", "SUBOFFICE": "S.O", "SUBPOSTOFFICE": "S.O",
        "B.O": "B.O", "BO": "B.O", "BRANCHOFFICE": "B.O", "BRANCHPOSTOFFICE": "B.O",
    }
    return mapping.get(v, val.strip()[:5] if val.strip() else "")


def parse_float(val: str) -> Optional[float]:
    try:
        v = float(val.strip())
        return v if v != 0.0 else None
    except (ValueError, AttributeError):
        return None


def map_row(row: dict, col_map: dict) -> Optional[dict]:
    pin = str(row.get(col_map.get("pin_code", ""), "") or "").strip()
    if pin.endswith(".0"):
        pin = pin[:-2]
    if not pin or not pin.isdigit() or len(pin) != 6:
        return None

    office = str(row.get(col_map.get("office_name", ""), "") or "").strip()
    if not office or office.lower() in ("nan", "none", "null"):
        return None

    state = clean(str(row.get(col_map.get("state_name", ""), "") or ""))
    if not state:
        return None

    lat_raw = str(row.get(col_map.get("latitude",  ""), "") or "")
    lon_raw = str(row.get(col_map.get("longitude", ""), "") or "")

    return {
        "pin_code":    pin,
        "office_name": office[:200],
        "office_type": clean_office_type(str(row.get(col_map.get("office_type", ""), "") or "")),
        "delivery":    parse_delivery(str(row.get(col_map.get("delivery", ""), "") or "")),
        "district":    clean(str(row.get(col_map.get("district", ""), "") or ""))[:100] or None,
        "division":    clean(str(row.get(col_map.get("division", ""), "") or ""))[:100] or None,
        "region":      clean(str(row.get(col_map.get("region",   ""), "") or ""))[:100] or None,
        "circle":      clean(str(row.get(col_map.get("circle",   ""), "") or ""))[:100] or None,
        "state_name":  state[:100],
        "latitude":    parse_float(lat_raw),
        "longitude":   parse_float(lon_raw),
    }


# ── Loaders ───────────────────────────────────────────────────────────────────

def load_csv(path: Path) -> list[dict]:
    info(f"Reading CSV: {path} …")
    for enc in ("utf-8-sig", "utf-8", "latin-1", "cp1252"):
        try:
            with open(path, encoding=enc, errors="replace") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            info(f"Loaded {len(rows):,} rows (encoding={enc})")
            return rows
        except Exception:
            continue
    err(f"Could not read {path}")
    sys.exit(1)


def load_json(path: Path) -> list[dict]:
    info(f"Reading JSON: {path} …")
    try:
        with open(path, encoding="utf-8-sig", errors="replace") as f:
            raw = json.load(f)
    except json.JSONDecodeError as e:
        err(f"JSON parse error: {e}")
        sys.exit(1)

    if isinstance(raw, list):
        records = raw
    elif isinstance(raw, dict):
        for key in ("records", "data", "result", "rows", "items"):
            if key in raw and isinstance(raw[key], list):
                records = raw[key]
                info(f"Unwrapped from key '{key}'")
                break
        else:
            err(f"Cannot find records list. Keys: {list(raw.keys())}")
            sys.exit(1)
    else:
        err(f"Unexpected JSON root type: {type(raw)}")
        sys.exit(1)

    # Normalize nested {"value": ...} objects (some data.gov.in exports do this)
    normalized = []
    for rec in records:
        if not isinstance(rec, dict):
            continue
        flat = {}
        for k, v in rec.items():
            if isinstance(v, dict) and "value" in v:
                flat[k] = str(v["value"]) if v["value"] is not None else ""
            else:
                flat[k] = str(v) if v is not None else ""
        normalized.append(flat)

    info(f"Loaded {len(normalized):,} records")
    return normalized


def load_file(path: Path) -> list[dict]:
    ext = path.suffix.lower()
    if ext == ".csv":
        return load_csv(path)
    elif ext == ".json":
        return load_json(path)
    else:
        err(f"Unsupported file type: {ext}. Use .csv or .json")
        sys.exit(1)


# ── Stats ─────────────────────────────────────────────────────────────────────

def show_stats(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*), COUNT(DISTINCT pin_code), COUNT(DISTINCT state_name) FROM post_offices")
        total, pins, states = cur.fetchone()
    print(f"\n  DB stats:")
    print(f"    Total rows    : {total:,}")
    print(f"    Unique PINs   : {pins:,}")
    print(f"    States        : {states}\n")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # Auto-detect default file
    default_file = str(DEFAULT_CSV if DEFAULT_CSV.exists() else DEFAULT_JSON)

    parser = argparse.ArgumentParser(description="Import India Post PIN code data (CSV or JSON) into PostgreSQL")
    parser.add_argument("--file",     default=default_file, help="Path to CSV or JSON file")
    parser.add_argument("--dry-run",  action="store_true", help="Parse + validate only, no DB writes")
    parser.add_argument("--truncate", action="store_true", help="Delete all existing rows before import")
    parser.add_argument("--stats",    action="store_true", help="Show current DB row counts and exit")
    args = parser.parse_args()

    print(f"\n{Fore.CYAN}===  India Post PIN Code Importer  ==={Style.RESET_ALL}\n")

    # --stats and actual import need DB; --dry-run does not
    def get_conn():
        db_url = get_db_url()
        c = psycopg2.connect(db_url)
        c.autocommit = False
        return c

    if args.stats:
        conn = get_conn()
        show_stats(conn)
        conn.close()
        return

    path = Path(args.file)
    if not path.exists():
        err(f"File not found: {path}")
        print(f"\n  Download from: https://data.gov.in/catalog/all-india-pincode-directory")
        print(f"  Save as: {DEFAULT_CSV}  (CSV)  or  {DEFAULT_JSON}  (JSON)\n")
        sys.exit(1)

    records = load_file(path)
    if not records:
        err("No records found in file")
        sys.exit(1)

    headers = list(records[0].keys())
    col_map = build_col_map(headers)

    required = ["pin_code", "office_name", "state_name"]
    missing  = [f for f in required if f not in col_map]
    if missing:
        err(f"Required columns not found: {missing}")
        info(f"Columns in file: {headers}")
        sys.exit(1)

    info(f"Column map: { {k: col_map[k] for k in col_map} }")

    # Map + validate
    mapped, skipped = [], 0
    for row in records:
        r = map_row(row, col_map)
        if r:
            mapped.append(r)
        else:
            skipped += 1

    info(f"Valid: {len(mapped):,} rows  |  Skipped (bad PIN/name): {skipped:,}")

    # Deduplicate on (pin_code, office_name)
    seen, deduped = set(), []
    for r in mapped:
        key = (r["pin_code"], r["office_name"].lower())
        if key not in seen:
            seen.add(key)
            deduped.append(r)
    if len(deduped) < len(mapped):
        warn(f"Removed {len(mapped) - len(deduped):,} duplicate (pin + office_name) pairs")

    unique_pins = len({r["pin_code"] for r in deduped})
    ok(f"Ready: {len(deduped):,} rows across {unique_pins:,} unique PINs")

    if args.dry_run:
        print(f"\n  Sample (first 5):")
        for r in deduped[:5]:
            print(f"    {r}")
        print()
        ok("Dry run complete — no DB writes")
        return

    conn = get_conn()

    if args.truncate:
        warn("Truncating post_offices table …")
        with conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE post_offices RESTART IDENTITY CASCADE")
        conn.commit()
        ok("Truncated")

    INSERT_SQL = """
        INSERT INTO post_offices
            (pin_code, office_name, office_type, delivery, district,
             division, region, circle, state_name, latitude, longitude)
        VALUES
            (%(pin_code)s, %(office_name)s, %(office_type)s, %(delivery)s,
             %(district)s, %(division)s, %(region)s, %(circle)s,
             %(state_name)s, %(latitude)s, %(longitude)s)
        ON CONFLICT DO NOTHING
    """

    inserted, start = 0, time.time()
    info(f"Inserting in batches of {BATCH_SIZE} …\n")

    with tqdm(total=len(deduped), unit="rows", colour="green") as pbar:
        for i in range(0, len(deduped), BATCH_SIZE):
            batch = deduped[i : i + BATCH_SIZE]
            try:
                with conn.cursor() as cur:
                    psycopg2.extras.execute_batch(cur, INSERT_SQL, batch, page_size=BATCH_SIZE)
                conn.commit()
                inserted += len(batch)
                pbar.update(len(batch))
            except Exception as e:
                conn.rollback()
                err(f"Batch {i // BATCH_SIZE + 1} failed: {e}")
                raise

    elapsed = time.time() - start
    print()
    ok(f"Inserted {inserted:,} rows in {elapsed:.1f}s  ({inserted / elapsed:.0f} rows/s)")
    show_stats(conn)
    conn.close()


if __name__ == "__main__":
    main()
