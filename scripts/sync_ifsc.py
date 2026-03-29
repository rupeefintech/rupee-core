#!/usr/bin/env python3
"""
sync_ifsc.py — BankInfoHub Data Sync
=====================================
Downloads the latest Razorpay IFSC dataset and syncs it into SQLite or PostgreSQL.

KEY DATA QUALITY FIX
--------------------
The Razorpay dataset uses several fields that sound like "district" but mean
different things:

  DISTRICT  – Actual RBI district name. The most correct field.
              BUT many records leave this blank or use a city name.
  CENTRE    – RBI clearing-house centre. Usually a city name, NOT a district.
  CITY      – City/locality name. Not a district.

Old approach (broken): fallback chain  DISTRICT → CENTRE → CITY
  Result: every city/locality becomes a "district" → hundreds of fake districts.

New approach (correct):
  1. Use DISTRICT if it is a non-trivial, non-numeric, real-looking value.
  2. Otherwise use CENTRE (clearing-house centre is the best proxy for district).
  3. Normalise: strip, title-case, remove duplicates like "Hyderabad Hyderabad".
  4. Never use a bare PIN code or single-word junk as a district name.

This produces district lists that closely match what users expect
(e.g. HDFC Bank in Telangana → ~8 real districts, not 100+ cities).

Usage:
    python sync_ifsc.py                    # Full sync
    python sync_ifsc.py --state Telangana  # One state only
    python sync_ifsc.py --dry-run          # Preview, no DB writes
    python sync_ifsc.py --stats            # Show DB stats and exit
    python sync_ifsc.py --force            # Force re-download
    python sync_ifsc.py --fix-districts    # Repair district data (no download)

Requirements:  pip install requests tqdm colorama psycopg2-binary
"""

import os
import re
import sys
import json
import sqlite3
import logging
import argparse
import tarfile
import zipfile
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Iterator

# ── Auto-install deps ─────────────────────────────────────────────────────────
def _ensure_deps():
    try:
        import requests, tqdm, colorama
    except ImportError:
        print("📦 Installing: requests tqdm colorama ...")
        os.system(f"{sys.executable} -m pip install requests tqdm colorama -q")

_ensure_deps()

import requests
from tqdm import tqdm
from colorama import Fore, Style, init as colorama_init
colorama_init(autoreset=True)

# ── Auto-install psycopg2 if needed ──────────────────────────────────────────
try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("📦 Installing psycopg2-binary...")
    os.system(f"{sys.executable} -m pip install psycopg2-binary -q")
    import psycopg2
    import psycopg2.extras


# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPTS_DIR = Path(__file__).parent.resolve()
BASE_DIR    = SCRIPTS_DIR.parent
DEFAULT_DB  = BASE_DIR / "backend" / "data" / "bankinfohub.db"
CACHE_DIR   = SCRIPTS_DIR / ".cache"
LOG_FILE    = SCRIPTS_DIR / "sync.log"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# ── Load .env from project root automatically ─────────────────────────────────
def _load_env():
    for candidate in [BASE_DIR / ".env", SCRIPTS_DIR / ".env"]:
        if candidate.exists():
            with open(candidate) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, _, val = line.partition("=")
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and not os.environ.get(key):
                        os.environ[key] = val
            print(f"✅ Loaded env from: {candidate}")
            return
    print("⚠️  No .env file found — set DIRECT_URL manually if targeting PostgreSQL")

_load_env()


def generate_short_name(name: str) -> str:
    if not name:
        return "Unknown-Bank"

    # Remove common noise words
    REMOVE_WORDS = {
        "bank", "limited", "ltd", "co", "co.", "cooperative",
        "co-operative", "sahakari", "nagari", "urban",
        "state", "the"
    }

    words = re.split(r"[^\w']+", name)

    # Clean + filter
    clean_words = [
        w for w in words
        if w and w.lower() not in REMOVE_WORDS
    ]

    # If nothing left, fallback to first 2 words
    if not clean_words:
        clean_words = words[:2]

    # Take max 2–3 meaningful words
    short = "".join(clean_words[:2])

    # Limit length (VERY IMPORTANT)
    short = short[:20]

    return f"{short}-Bank"

    bank_metadata = load_bank_metadata()
    bank_rows = []

    VALID_BANK_TYPES = {"Public", "Private", "Regional", "Cooperative"}

    for name, code in unique_banks.items():
        meta = bank_metadata.get(name, {})

        short_name = meta.get("short_name") or generate_short_name(name)
        bank_type = meta.get("bank_type")
        if bank_type not in VALID_BANK_TYPES:
                bank_type = infer_bank_type(name)
        bank_rows.append((
            name,
            short_name,
            code,
            bank_type,            
            meta.get("headquarters"),
            meta.get("website"),
            meta.get("logo_url")
        ))

def load_bank_metadata() -> dict:
    """Load bank metadata from JSON file."""
    metadata_file = SCRIPTS_DIR / "bank_metadata.json"
    if not metadata_file.exists():
        log.warning(f"⚠️  Bank metadata file not found: {metadata_file}")
        return {}
    try:
        with open(metadata_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        log.error(f"❌ Error loading metadata: {e}")
        return {}

def infer_bank_type(name: str):
    n = name.lower()
    if "co-operative" in n or "cooperative" in n:
        return "Cooperative"
    if "regional rural" in n:
        return "Regional"
    return None





# ── Config ────────────────────────────────────────────────────────────────────
GITHUB_API     = "https://api.github.com/repos/razorpay/ifsc/releases/latest"
ASSET_PRIORITY = ["by-banks.tar.gz", "IFSC.zip", "by-banks.zip"]
CACHE_HOURS    = 12
BATCH_SIZE     = 500
TIMEOUT        = 120

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("sync_ifsc")


# ═════════════════════════════════════════════════════════════════════════════
# DISTRICT NAME NORMALISATION
# ═════════════════════════════════════════════════════════════════════════════

_JUNK_PATTERNS = re.compile(
    r"^(\d+|na|n/a|nil|none|not\s+applicable|unknown|test|dummy)$",
    re.IGNORECASE
)

def resolve_district(raw_district: str, centre: str, city: str) -> str:
    def clean(s: str) -> str:
        s = (s or "").strip()
        s = re.sub(r"\(.*?\)", "", s).strip()
        s = s.title()
        words = s.split()
        deduped = [words[0]] if words else []
        for w in words[1:]:
            if w.lower() != deduped[-1].lower():
                deduped.append(w)
        return " ".join(deduped).strip()

    def is_valid(s: str) -> bool:
        if not s:
            return False
        if s.isdigit():
            return False
        if _JUNK_PATTERNS.match(s):
            return False
        if len(s) < 3:
            return False
        return True

    for raw in (raw_district, centre, city):
        val = clean(raw)
        if is_valid(val):
            return val

    return ""


# ═════════════════════════════════════════════════════════════════════════════
# DATABASE
# ═════════════════════════════════════════════════════════════════════════════

# Wrapper so we can attach _is_postgres to SQLite connections too.
# Python 3.12+ made sqlite3.Connection a C extension object that does not
# allow setting arbitrary attributes — this wrapper solves that cleanly.
class DbConn:
    """Thin wrapper around either a sqlite3 or psycopg2 connection.
    Exposes _is_postgres so the rest of the code can detect dialect.
    All other attribute access is forwarded to the underlying connection.
    """
    def __init__(self, conn, is_postgres: bool):
        object.__setattr__(self, '_conn', conn)
        object.__setattr__(self, '_is_postgres', is_postgres)

    # Forward everything except our two custom attrs to the real connection
    def __getattr__(self, name):
        return getattr(object.__getattribute__(self, '_conn'), name)

    def __setattr__(self, name, value):
        if name in ('_conn', '_is_postgres'):
            object.__setattr__(self, name, value)
        else:
            setattr(object.__getattribute__(self, '_conn'), name, value)


def _get_pg_direct_url() -> str:
    """Return the clean direct (non-pooler) PostgreSQL URL."""
    database_url = os.environ.get("DATABASE_URL", "")
    clean = database_url.replace("&pgbouncer=true", "").replace("?pgbouncer=true", "")
    direct = os.environ.get("DIRECT_URL", clean)
    return direct.replace("&pgbouncer=true", "").replace("?pgbouncer=true", "")


def _fresh_pg_conn():
    """Open a brand-new psycopg2 connection. Used to reconnect after timeout."""
    url = _get_pg_direct_url()
    raw = psycopg2.connect(
        url,
        connect_timeout=30,
        keepalives=1,
        keepalives_idle=30,
        keepalives_interval=10,
        keepalives_count=5,
    )
    raw.autocommit = False
    return raw


def open_db(db_path: Path) -> DbConn:
    """Open SQLite or PostgreSQL depending on DATABASE_URL / DIRECT_URL env var."""
    database_url = os.environ.get("DATABASE_URL", "")

    if database_url.startswith("postgresql://") or database_url.startswith("postgres://"):
        log.info("   Connecting to PostgreSQL (Neon)...")
        raw = _fresh_pg_conn()
        return DbConn(raw, is_postgres=True)
    else:
        log.info(f"   Connecting to SQLite: {db_path}")
        db_path.parent.mkdir(parents=True, exist_ok=True)
        raw = sqlite3.connect(str(db_path))
        raw.row_factory = sqlite3.Row
        raw.execute("PRAGMA journal_mode=WAL")
        raw.execute("PRAGMA synchronous=NORMAL")
        raw.execute("PRAGMA foreign_keys=ON")
        raw.execute("PRAGMA cache_size=20000")
        return DbConn(raw, is_postgres=False)


def ensure_schema(conn) -> None:
    is_pg = getattr(conn, '_is_postgres', False)

    if is_pg:
        # Prisma owns the PostgreSQL schema entirely.
        # Tables are created by `npx prisma migrate dev` using Prisma's
        # PascalCase naming convention ("Branch", "Bank", "State", "District").
        # This script must never CREATE TABLE here — doing so would create
        # a second set of lowercase tables ("branches", "banks") that the
        # API does not read, which is exactly the bug we are fixing.
        log.info("   PostgreSQL schema managed by Prisma — skipping DDL")
        return
    else:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS states (
                id   INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                code TEXT
            );
            CREATE TABLE IF NOT EXISTS districts (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                name     TEXT NOT NULL,
                state_id INTEGER NOT NULL,
                UNIQUE(name, state_id)
            );
            CREATE TABLE IF NOT EXISTS banks (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                name         TEXT NOT NULL UNIQUE,
                short_name   TEXT,
                bank_code    TEXT,
                bank_type    TEXT,
                headquarters TEXT,
                website      TEXT
            );
            CREATE TABLE IF NOT EXISTS branches (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                ifsc         TEXT NOT NULL UNIQUE,
                micr         TEXT,
                bank_id      INTEGER NOT NULL REFERENCES banks(id),
                branch_name  TEXT NOT NULL,
                address      TEXT,
                city         TEXT,
                centre       TEXT,
                district_id  INTEGER REFERENCES districts(id),
                state_id     INTEGER NOT NULL REFERENCES states(id),
                pincode      TEXT,
                phone        TEXT,
                neft         INTEGER DEFAULT 1,
                rtgs         INTEGER DEFAULT 1,
                imps         INTEGER DEFAULT 1,
                upi          INTEGER DEFAULT 1,
                latitude     REAL,
                longitude    REAL,
                swift        TEXT,
                iso3166      TEXT,
                bank_code    TEXT,
                last_updated TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS sync_log (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                release_tag    TEXT,
                release_date   TEXT,
                records_synced INTEGER DEFAULT 0,
                duration_secs  REAL,
                status         TEXT,
                error_msg      TEXT,
                created_at     TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS search_logs (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                search_type   TEXT,
                query         TEXT,
                results_count INTEGER,
                ip_hash       TEXT,
                created_at    TEXT DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_branches_ifsc     ON branches(ifsc);
            CREATE INDEX IF NOT EXISTS idx_branches_bank     ON branches(bank_id);
            CREATE INDEX IF NOT EXISTS idx_branches_state    ON branches(state_id);
            CREATE INDEX IF NOT EXISTS idx_branches_district ON branches(district_id);
            CREATE INDEX IF NOT EXISTS idx_branches_pincode  ON branches(pincode);
            CREATE INDEX IF NOT EXISTS idx_branches_micr     ON branches(micr);
            CREATE INDEX IF NOT EXISTS idx_districts_state   ON districts(state_id);
        """)
        conn.commit()


# ═════════════════════════════════════════════════════════════════════════════
# GITHUB RELEASE
# ═════════════════════════════════════════════════════════════════════════════

def get_latest_release() -> dict:
    log.info("🔍 Fetching latest release info from GitHub...")
    headers = {"Accept": "application/vnd.github+json"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    resp = requests.get(GITHUB_API, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    tag          = data["tag_name"]
    published_at = data.get("published_at", "")[:10]
    assets       = {a["name"]: a["browser_download_url"] for a in data.get("assets", [])}

    log.info(f"   Latest release: {tag}  ({published_at})")

    chosen_name = chosen_url = None
    for name in ASSET_PRIORITY:
        if name in assets:
            chosen_name = name
            chosen_url  = assets[name]
            break
    if not chosen_url:
        for name, url in assets.items():
            if name.endswith((".tar.gz", ".zip")):
                chosen_name, chosen_url = name, url
                break

    if not chosen_url:
        raise RuntimeError(f"No usable asset found. Available: {list(assets.keys())}")

    log.info(f"   Asset: {chosen_name}")
    return {"tag": tag, "published_at": published_at, "asset_name": chosen_name, "asset_url": chosen_url}


def download_asset(url: str, name: str, force: bool = False) -> Path:
    cache_file = CACHE_DIR / name
    if cache_file.exists() and not force:
        age_hours = (time.time() - cache_file.stat().st_mtime) / 3600
        if age_hours < CACHE_HOURS:
            log.info(f"   Using cached file ({age_hours:.1f}h old): {cache_file.name}")
            return cache_file

    log.info(f"⬇️  Downloading {name} ...")
    headers = {}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    resp = requests.get(url, headers=headers, stream=True, timeout=TIMEOUT)
    resp.raise_for_status()

    total = int(resp.headers.get("content-length", 0))
    with open(cache_file, "wb") as f, tqdm(total=total, unit="B", unit_scale=True, desc=f"  {name}") as bar:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
            bar.update(len(chunk))

    log.info(f"   Saved to: {cache_file}")
    return cache_file


# ═════════════════════════════════════════════════════════════════════════════
# BRANCH ITERATOR
# ═════════════════════════════════════════════════════════════════════════════

def iter_branches(local_file: Path, filter_state: Optional[str] = None) -> Iterator[dict]:
    """Yield one branch dict at a time from tar.gz or zip."""
    name = local_file.name.lower()

    def _yield_from_data(data):
        if isinstance(data, dict):
            for ifsc, rec in data.items():
                if isinstance(rec, dict):
                    rec["IFSC"] = ifsc
                    if filter_state and rec.get("STATE", "").lower() != filter_state.lower():
                        continue
                    yield rec
        elif isinstance(data, list):
            for rec in data:
                if isinstance(rec, dict):
                    if filter_state and rec.get("STATE", "").lower() != filter_state.lower():
                        continue
                    yield rec

    if name.endswith(".tar.gz"):
        with tarfile.open(local_file, "r:gz") as tar:
            for member in tar.getmembers():
                if not member.name.endswith(".json"):
                    continue
                f = tar.extractfile(member)
                if not f:
                    continue
                try:
                    data = json.load(f)
                except Exception:
                    continue
                yield from _yield_from_data(data)

    elif name.endswith(".zip"):
        with zipfile.ZipFile(local_file, "r") as zf:
            for zname in zf.namelist():
                if not zname.endswith(".json"):
                    continue
                with zf.open(zname) as f:
                    try:
                        data = json.load(f)
                    except Exception:
                        continue
                    yield from _yield_from_data(data)
    else:
        raise RuntimeError(f"Unknown file format: {local_file.name}")

def normalize_bank_type(bt):
    if not bt:
        return None
    bt = bt.lower()
    if "public" in bt:
        return "Public"
    if "private" in bt:
        return "Private"
    if "regional" in bt:
        return "Regional"
    if "cooperative" in bt:
        return "Cooperative"
    return None

# ═════════════════════════════════════════════════════════════════════════════
# SYNC
# ═════════════════════════════════════════════════════════════════════════════

def run_sync(conn, filter_state=None, dry_run=False, force_download=False):
    log.info("\n" + "═"*60)
    log.info(f"🏦  BankInfoHub IFSC Sync  [{datetime.now().strftime('%Y-%m-%d %H:%M')}]")
    if filter_state: log.info(f"   State filter : {filter_state}")
    if dry_run:      log.info(f"   Mode         : DRY RUN")
    log.info("═"*60)

    t0     = time.time()
    counts = {"synced": 0, "skipped": 0, "errors": 0, "no_district": 0}
    is_pg  = getattr(conn, '_is_postgres', False)

    release    = get_latest_release()
    local_file = download_asset(release["asset_url"], release["asset_name"], force=force_download)

    # ═══════════════════════════════════════════════════════════════════════════
    # PASS 1 — scan entire dataset in memory, collect unique states/banks/districts
    # No DB calls here — pure Python. Fast.
    # ═══════════════════════════════════════════════════════════════════════════
    log.info("\n📋 Pass 1 — scanning dataset for unique states, banks, districts...")

    # state_name → None (will hold id after insert)
    unique_states:    dict = {}   # {state_name: None}
    # bank_name → bank_code
    unique_banks:     dict = {}   # {bank_name: bank_code}
    # (district_name, state_name) → None
    unique_districts: dict = {}   # {(district_name, state_name): None}
    # All raw records stored in memory for pass 2
    all_records:      list = []

    for rec in iter_branches(local_file, filter_state):
        ifsc = (rec.get("IFSC") or "").strip().upper()
        if not ifsc or len(ifsc) != 11:
            counts["skipped"] += 1
            continue

        state_name   = (rec.get("STATE")    or "Unknown").strip().title()
        bank_name    = (rec.get("BANK")     or "Unknown").strip()
        bank_code    = (rec.get("BANKCODE") or ifsc[:4]).strip().upper()
        raw_district = (rec.get("DISTRICT") or "").strip()
        centre       = (rec.get("CENTRE")   or "").strip()
        city         = (rec.get("CITY")     or "").strip()
        district_nm  = resolve_district(raw_district, centre, city)

        unique_states[state_name] = None
        unique_banks[bank_name]   = bank_code
        if district_nm:
            unique_districts[(district_nm, state_name)] = None

        all_records.append(rec)

    log.info(f"   States    : {len(unique_states)}")
    log.info(f"   Banks     : {len(unique_banks)}")
    log.info(f"   Districts : {len(unique_districts)}")
    log.info(f"   Branches  : {len(all_records)}")

    if dry_run:
        counts["synced"] = len(all_records)
        log.info("   ⚠️  DRY RUN — skipping DB writes")
        log.info("═"*60)
        return

    # ═══════════════════════════════════════════════════════════════════════════
    # PASS 2 — bulk insert states, banks, districts in 3 round trips total
    # ═══════════════════════════════════════════════════════════════════════════
    log.info("\n🏗  Pass 2 — bulk inserting states, banks, districts...")

    if is_pg:
        # Prisma table naming rule (confirmed from schema.prisma + db pull):
        #   Table names  → PascalCase, MUST be double-quoted: "State", "Bank", etc.
        #   Column names → snake_case via @map(), no quotes needed: bank_code, state_id, etc.
        # Mixing these up is what caused every previous "column does not exist" error.
        cur = conn.cursor()

        # ── States ────────────────────────────────────────────────────────────
        psycopg2.extras.execute_batch(
            cur,
            'INSERT INTO "State"(name) VALUES(%s) ON CONFLICT(name) DO NOTHING',
            [(s,) for s in unique_states],
            page_size=500
        )
        conn.commit()
        cur.execute('SELECT id, name FROM "State"')
        state_cache = {row[1]: row[0] for row in cur.fetchall()}

        # ── Banks — column is bank_code (snake_case via @map) ─────────────────
        bank_metadata = load_bank_metadata()
        bank_rows = [
            (
                name,
                bank_metadata.get(name, {}).get('short_name'),
                code,
                bank_metadata.get(name, {}).get('bank_type'),
                bank_metadata.get(name, {}).get('headquarters'),
                bank_metadata.get(name, {}).get('website'),
                bank_metadata.get(name, {}).get('logo_url')
            )
            for name, code in unique_banks.items()
        ]


        psycopg2.extras.execute_batch(
            cur,
            '''
            INSERT INTO banks_master (name, short_name, bank_code, bank_type, website)
            VALUES (%s,%s,%s,%s,%s)
            ON CONFLICT (name) DO UPDATE SET
                bank_code = EXCLUDED.bank_code,
                short_name = COALESCE(banks_master.short_name, EXCLUDED.short_name),
                bank_type = COALESCE(banks_master.bank_type, EXCLUDED.bank_type),
                website = COALESCE(banks_master.website, EXCLUDED.website),
                updated_at = CURRENT_TIMESTAMP
            ''',
            [
                (
                    name,
                    # ✅ FIX HERE
                    (bank_metadata.get(name, {}).get('short_name')
                    or generate_short_name(name)),

                    code,  # IFSC prefix
                    (
                        t
                        if (t := bank_metadata.get(name, {}).get("bank_type"))
                        in {"Public", "Private", "Regional", "Cooperative"}
                        else None
                    ),
                    bank_metadata.get(name, {}).get('website')
                )
                for name, code in unique_banks.items()
            ],
            page_size=500
        )
        conn.commit()

        cur.execute('SELECT name, short_name, bank_code, bank_type, website FROM banks_master')
        master_rows = cur.fetchall()

        psycopg2.extras.execute_batch(
            cur,
            '''INSERT INTO "Bank"(name, short_name, bank_code, bank_type, headquarters, website, logo_url)
                VALUES(%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT(name) DO UPDATE SET
                    short_name=EXCLUDED.short_name,
                    bank_code=EXCLUDED.bank_code,
                    bank_type=EXCLUDED.bank_type,
                    headquarters=EXCLUDED.headquarters,
                    website=EXCLUDED.website,
                    logo_url=EXCLUDED.logo_url''',
            bank_rows,
            page_size=500
        )

        conn.commit()
        cur.execute('SELECT id, name FROM "Bank"')
        bank_cache = {row[1]: row[0] for row in cur.fetchall()}

        # ── Districts — column is state_id (snake_case via @map) ─────────────
        psycopg2.extras.execute_batch(
            cur,
            'INSERT INTO "District"(name, state_id) VALUES(%s,%s) ON CONFLICT(name, state_id) DO NOTHING',
            [(d, state_cache[s]) for d, s in unique_districts if s in state_cache],
            page_size=500
        )
        conn.commit()
        cur.execute('SELECT id, name, state_id FROM "District"')
        district_cache = {(row[1], row[2]): row[0] for row in cur.fetchall()}
        cur.close()

    else:
        # ── SQLite ────────────────────────────────────────────────────────────
        conn.executemany(
            "INSERT OR IGNORE INTO states(name) VALUES(?)",
            [(s,) for s in unique_states]
        )
        conn.commit()
        state_cache = {r["name"]: r["id"]
                        for r in conn.execute("SELECT id, name FROM states").fetchall()}

        conn.executemany(
            "INSERT OR IGNORE INTO banks(name, bank_code) VALUES(?,?)",
            [(name, code) for name, code in unique_banks.items()]
        )
        conn.commit()
        bank_cache = {r["name"]: r["id"]
                        for r in conn.execute("SELECT id, name FROM banks").fetchall()}

        conn.executemany(
            "INSERT OR IGNORE INTO districts(name, state_id) VALUES(?,?)",
            [(d, state_cache[s]) for d, s in unique_districts if s in state_cache]
        )
        conn.commit()
        district_cache = {(r["name"], r["state_id"]): r["id"]
                            for r in conn.execute(
                                "SELECT id, name, state_id FROM districts"
                            ).fetchall()}

    log.info("   ✅ States, banks, districts loaded into DB")

    # ── UPSERT: "Branch" table (PascalCase quoted), snake_case columns via @map ─
    if is_pg:
        UPSERT = """
            INSERT INTO "Branch"
                (ifsc, micr, bank_id, branch_name, address, city, centre,
                 district_id, state_id, pincode, phone, neft, rtgs, imps, upi,
                 swift, iso3166, bank_code, last_updated)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT(ifsc) DO UPDATE SET
                micr         = EXCLUDED.micr,
                bank_id      = EXCLUDED.bank_id,
                branch_name  = EXCLUDED.branch_name,
                address      = EXCLUDED.address,
                city         = EXCLUDED.city,
                centre       = EXCLUDED.centre,
                district_id  = EXCLUDED.district_id,
                state_id     = EXCLUDED.state_id,
                pincode      = EXCLUDED.pincode,
                phone        = EXCLUDED.phone,
                neft         = EXCLUDED.neft,
                rtgs         = EXCLUDED.rtgs,
                imps         = EXCLUDED.imps,
                upi          = EXCLUDED.upi,
                swift        = EXCLUDED.swift,
                iso3166      = EXCLUDED.iso3166,
                bank_code    = EXCLUDED.bank_code,
                last_updated = EXCLUDED.last_updated
        """
    else:
        UPSERT = """
            INSERT INTO branches
                (ifsc,micr,bank_id,branch_name,address,city,centre,
                 district_id,state_id,pincode,phone,neft,rtgs,imps,upi,
                 swift,iso3166,bank_code,last_updated)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(ifsc) DO UPDATE SET
                micr=excluded.micr, bank_id=excluded.bank_id,
                branch_name=excluded.branch_name, address=excluded.address,
                city=excluded.city, centre=excluded.centre,
                district_id=excluded.district_id, state_id=excluded.state_id,
                pincode=excluded.pincode, phone=excluded.phone,
                neft=excluded.neft, rtgs=excluded.rtgs,
                imps=excluded.imps, upi=excluded.upi,
                swift=excluded.swift, iso3166=excluded.iso3166,
                bank_code=excluded.bank_code, last_updated=excluded.last_updated
        """

    # ── Pass 3a: build ALL branch rows in memory (pure Python, zero DB calls) ──
    log.info("\n⚙️  Pass 3 — building branch rows in memory...")
    branch_rows = []
    now_str     = datetime.now().isoformat()

    for rec in all_records:
        try:
            ifsc         = (rec.get("IFSC")     or "").strip().upper()
            state_name   = (rec.get("STATE")    or "Unknown").strip().title()
            bank_name    = (rec.get("BANK")     or "Unknown").strip()
            bank_code    = (rec.get("BANKCODE") or ifsc[:4]).strip().upper()
            branch_name  = (rec.get("BRANCH")   or ifsc).strip()
            address      = (rec.get("ADDRESS")  or "").strip()
            city         = (rec.get("CITY")     or "").strip()
            centre       = (rec.get("CENTRE")   or "").strip()
            raw_district = (rec.get("DISTRICT") or "").strip()
            district_nm  = resolve_district(raw_district, centre, city)

            pincode = str(rec.get("PINCODE") or "").strip() or None
            phone   = str(rec.get("CONTACT") or "").strip() or None
            micr    = str(rec.get("MICR")    or "").strip() or None
            swift   = str(rec.get("SWIFT")   or "").strip() or None
            iso3166 = str(rec.get("ISO3166")  or "").strip() or None
            neft    = bool(rec.get("NEFT"))
            rtgs    = bool(rec.get("RTGS"))
            imps    = bool(rec.get("IMPS"))
            upi     = bool(rec.get("UPI"))

            sid = state_cache.get(state_name)
            bid = bank_cache.get(bank_name)
            if sid is None or bid is None:
                counts["errors"] += 1
                continue

            did = district_cache.get((district_nm, sid)) if district_nm else None
            if not did:
                counts["no_district"] += 1

            branch_rows.append((
                ifsc, micr, bid, branch_name, address, city, centre,
                did, sid, pincode, phone, neft, rtgs, imps, upi,
                swift, iso3166, bank_code, now_str
            ))
        except Exception as e:
            counts["errors"] += 1
            log.debug(f"Row build error ({rec.get('IFSC','?')}): {e}")

    log.info(f"   Built {len(branch_rows):,} rows — starting DB inserts...")

    # ── Pass 3b: insert in large chunks, each with a FRESH connection ──────────
    # Fresh connection per chunk = immune to Neon idle timeout regardless of
    # how long the previous chunk took to prepare.
    # 10K rows per chunk = ~18 total connections for 177K rows.
    CHUNK = 10_000

    def insert_chunk_pg(rows: list, attempt: int = 1):
        """Insert one chunk using a brand-new connection. Retries once on error."""
        raw = _fresh_pg_conn()
        try:
            cur = raw.cursor()
            psycopg2.extras.execute_batch(cur, UPSERT, rows, page_size=1000)
            raw.commit()
            cur.close()
        except Exception as e:
            raw.rollback()
            raw.close()
            if attempt == 1:
                log.warning(f"   Chunk failed (attempt 1), retrying: {e}")
                time.sleep(3)
                insert_chunk_pg(rows, attempt=2)
            else:
                raise
        else:
            raw.close()

    total = len(branch_rows)
    with tqdm(total=total, desc="  Inserting", unit=" rows", colour="green") as bar:
        for start in range(0, total, CHUNK):
            chunk = branch_rows[start: start + CHUNK]
            if is_pg:
                insert_chunk_pg(chunk)
            else:
                conn.executemany(UPSERT, chunk)
                conn.commit()
            counts["synced"] += len(chunk)
            bar.update(len(chunk))

    duration = time.time() - t0

    # ── Write sync log using fresh connection ──────────────────────────────────
    # SyncLog model has @@map("sync_log") → real PG table is sync_log (no quotes)
    # Column names also use @map snake_case: release_tag, records_synced etc.
    if is_pg:
        raw = _fresh_pg_conn()
        try:
            cur = raw.cursor()
            cur.execute(
                "INSERT INTO sync_log(release_tag, release_date, records_synced, duration_secs, status) "
                "VALUES(%s,%s,%s,%s,'SUCCESS')",
                (release["tag"], release["published_at"], counts["synced"], duration)
            )
            raw.commit()
            cur.close()
        finally:
            raw.close()
    else:
        conn.execute(
            "INSERT INTO sync_log(release_tag,release_date,records_synced,duration_secs,status) "
            "VALUES(?,?,?,?,'success')",
            (release["tag"], release["published_at"], counts["synced"], duration)
        )
        conn.commit()

    log.info("\n" + "═"*60)
    log.info("✅ Sync complete!")
    log.info(f"   Release      : {release['tag']}  ({release['published_at']})")
    log.info(f"   Synced       : {counts['synced']:,}")
    log.info(f"   Skipped      : {counts['skipped']:,}")
    log.info(f"   Errors       : {counts['errors']:,}")
    log.info(f"   No district  : {counts['no_district']:,}  (stored with NULL district_id)")
    log.info(f"   Duration     : {duration:.1f}s")
    if dry_run:
        log.info("   ⚠️  DRY RUN — nothing written")
    log.info("═"*60)


# ═════════════════════════════════════════════════════════════════════════════
# POST-SYNC DISTRICT DEDUP
# ═════════════════════════════════════════════════════════════════════════════

def fix_districts(conn):
    """Merge duplicate district names. Works for both SQLite and PostgreSQL."""
    is_pg = getattr(conn, '_is_postgres', False)
    log.info("🔧 Fixing district duplicates in existing DB...")

    if is_pg:
        cur = conn.cursor()
        # Prisma table names: "District" and "Branch" (PascalCase quoted)
        # Column names: snake_case via @map — state_id, district_id
        cur.execute(
            'SELECT id, name FROM "District" WHERE name ~ \'^[0-9]+$\' OR length(name) < 3'
        )
        junk = cur.fetchall()
        if junk:
            log.info(f"   Removing {len(junk)} junk district entries...")
            for row in junk:
                cur.execute(
                    'UPDATE "Branch" SET district_id = NULL WHERE district_id = %s', (row[0],)
                )
                cur.execute('DELETE FROM "District" WHERE id = %s', (row[0],))
        conn.commit()

        # Merge case-insensitive duplicates within same state
        cur.execute("""
            SELECT lower(name) as lname, state_id, count(*) as cnt
            FROM "District"
            GROUP BY lower(name), state_id
            HAVING count(*) > 1
        """)
        dupes = cur.fetchall()

        merged = 0
        for d in dupes:
            cur.execute(
                'SELECT id FROM "District" WHERE lower(name)=%s AND state_id=%s ORDER BY id',
                (d[0], d[1])
            )
            ids = [r[0] for r in cur.fetchall()]
            keep = ids[0]
            for dup_id in ids[1:]:
                cur.execute(
                    'UPDATE "Branch" SET district_id=%s WHERE district_id=%s', (keep, dup_id)
                )
                cur.execute('DELETE FROM "District" WHERE id=%s', (dup_id,))
                merged += 1

        conn.commit()
        cur.close()
    else:
        # SQLite path — lowercase tables, no quotes needed
        junk = conn.execute(
            "SELECT id, name FROM districts WHERE name GLOB '[0-9]*' OR length(name) < 3"
        ).fetchall()
        if junk:
            log.info(f"   Removing {len(junk)} junk district entries...")
            for row in junk:
                conn.execute(
                    "UPDATE branches SET district_id = NULL WHERE district_id = ?", (row["id"],)
                )
                conn.execute("DELETE FROM districts WHERE id = ?", (row["id"],))
        conn.commit()

        dupes = conn.execute("""
            SELECT lower(name) as lname, state_id, count(*) as cnt
            FROM districts
            GROUP BY lower(name), state_id
            HAVING cnt > 1
        """).fetchall()

        merged = 0
        for d in dupes:
            ids = [r["id"] for r in conn.execute(
                "SELECT id FROM districts WHERE lower(name)=? AND state_id=? ORDER BY id",
                (d["lname"], d["state_id"])
            ).fetchall()]
            keep = ids[0]
            for dup_id in ids[1:]:
                conn.execute(
                    "UPDATE branches SET district_id=? WHERE district_id=?", (keep, dup_id)
                )
                conn.execute("DELETE FROM districts WHERE id=?", (dup_id,))
                merged += 1
        conn.commit()

    log.info(f"   Merged {merged} duplicate district entries.")
    log.info("✅ District fix complete.")


# ═════════════════════════════════════════════════════════════════════════════
# STATS
# ═════════════════════════════════════════════════════════════════════════════

def print_stats(conn):
    """Print DB stats. Works for both SQLite and PostgreSQL."""
    is_pg = getattr(conn, '_is_postgres', False)

    print(f"\n{Fore.CYAN}{'─'*50}")
    print(f"  📊  BankInfoHub Database Stats")
    print(f"{'─'*50}{Style.RESET_ALL}")

    if is_pg:
        queries = [
            ("Branches (IFSC codes)", 'SELECT COUNT(*) FROM "Branch"'),
            ("Banks",                  'SELECT COUNT(*) FROM "Bank"'),
            ("States / UTs",           'SELECT COUNT(*) FROM "State"'),
            ("Districts",              'SELECT COUNT(*) FROM "District"'),
            ("Branches with district", 'SELECT COUNT(*) FROM "Branch" WHERE district_id IS NOT NULL'),
            ("UPI enabled",            'SELECT COUNT(*) FROM "Branch" WHERE upi = TRUE'),
            ("NEFT enabled",           'SELECT COUNT(*) FROM "Branch" WHERE neft = TRUE'),
        ]
    else:
        queries = [
            ("Branches (IFSC codes)", "SELECT COUNT(*) FROM branches"),
            ("Banks",                  "SELECT COUNT(*) FROM banks"),
            ("States / UTs",           "SELECT COUNT(*) FROM states"),
            ("Districts",              "SELECT COUNT(*) FROM districts"),
            ("Branches with district", "SELECT COUNT(*) FROM branches WHERE district_id IS NOT NULL"),
            ("UPI enabled",            "SELECT COUNT(*) FROM branches WHERE upi=1"),
            ("NEFT enabled",           "SELECT COUNT(*) FROM branches WHERE neft=1"),
        ]

    for label, sql in queries:
        if is_pg:
            cur = conn.cursor()
            cur.execute(sql)
            val = cur.fetchone()[0]
            cur.close()
        else:
            val = conn.execute(sql).fetchone()[0]
        print(f"  {label:<35} {Fore.GREEN}{val:>10,}{Style.RESET_ALL}")

    # Last sync entry
    if is_pg:
        cur = conn.cursor()
        # SyncLog @@map("sync_log") → table is sync_log, columns are snake_case via @map
        cur.execute('SELECT * FROM sync_log ORDER BY created_at DESC LIMIT 1')
        cols = [desc[0] for desc in cur.description]
        row  = cur.fetchone()
        cur.close()
        last = dict(zip(cols, row)) if row else None
        if last:
            print(f"\n{Fore.CYAN}  Last Sync:{Style.RESET_ALL}")
            print(f"    Release  : {last.get('release_tag','?')}")
            print(f"    Records  : {last.get('records_synced',0):,}")
            print(f"    Duration : {last.get('duration_secs',0):.1f}s")
            print(f"    Status   : {Fore.GREEN}{last.get('status','?')}{Style.RESET_ALL}")
    else:
        last = conn.execute("SELECT * FROM sync_log ORDER BY created_at DESC LIMIT 1").fetchone()
        last = dict(last) if last else None
        if last:
            print(f"\n{Fore.CYAN}  Last Sync:{Style.RESET_ALL}")
            print(f"    Release  : {last['release_tag']}")
            print(f"    Records  : {last['records_synced']:,}")
            print(f"    Duration : {last['duration_secs']:.1f}s")
            print(f"    Status   : {Fore.GREEN}{last['status']}{Style.RESET_ALL}")
    print()


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="BankInfoHub — IFSC Data Sync",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python sync_ifsc.py                    # Full sync
  python sync_ifsc.py --state Telangana  # One state only
  python sync_ifsc.py --dry-run          # Preview, no writes
  python sync_ifsc.py --stats            # Stats only
  python sync_ifsc.py --force            # Force re-download
  python sync_ifsc.py --fix-districts    # Repair district data in existing DB
        """
    )
    parser.add_argument("--state",         help="Sync only a specific state")
    parser.add_argument("--dry-run",       action="store_true")
    parser.add_argument("--stats",         action="store_true")
    parser.add_argument("--force",         action="store_true")
    parser.add_argument("--fix-districts", action="store_true",
                        help="Repair district data in existing DB without re-syncing")
    parser.add_argument("--db",            default=str(DEFAULT_DB), help="Override SQLite DB path")
    args = parser.parse_args()

    # open_db() automatically uses PostgreSQL if DATABASE_URL is set,
    # otherwise falls back to SQLite at args.db
    db_path = Path(args.db)
    conn    = open_db(db_path)
    ensure_schema(conn)

    if args.stats:
        print_stats(conn)
        conn.close()
        return

    if args.fix_districts:
        fix_districts(conn)
        print_stats(conn)
        conn.close()
        return

    try:
        run_sync(conn, filter_state=args.state, dry_run=args.dry_run, force_download=args.force)
        print_stats(conn)

        if not args.dry_run:
            api_url = os.environ.get("API_URL", "http://localhost:3001")
            try:
                import urllib.request
                req = urllib.request.Request(f"{api_url}/api/cache/clear", method="POST")
                urllib.request.urlopen(req, timeout=3)
                log.info("✅ API cache cleared — stats will update immediately")
            except Exception:
                log.info("ℹ️  API server not reachable — restart it to see updated stats")

    except KeyboardInterrupt:
        log.warning("\n⚠️  Interrupted — rolling back")
        conn.rollback()
        sys.exit(130)
    except Exception as e:
        log.error(f"❌ Sync failed: {e}")
        conn.rollback()
        is_pg = getattr(conn, '_is_postgres', False)
        try:
            if is_pg:
                cur = conn.cursor()
                cur.execute(
                    "INSERT INTO sync_log(status,error_msg,duration_secs) VALUES(%s,%s,0)",
                    ('failed', str(e))
                )
                conn.commit()
                cur.close()
            else:
                conn.execute(
                    "INSERT INTO sync_log(status,error_msg,duration_secs) VALUES('failed',?,0)",
                    (str(e),)
                )
                conn.commit()
        except Exception:
            pass
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
