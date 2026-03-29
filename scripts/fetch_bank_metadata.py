#!/usr/bin/env python3
"""
fetch_bank_metadata.py — Scrape and prepare bank metadata for BankInfoHub
Generates bank_metadata.json with fields: short_name, bank_code, bank_type, website.
"""
import os
import json
import re
import requests
from bs4 import BeautifulSoup
from pathlib import Path
import psycopg2



# ── Paths ─────────────────────────────────────────────────────────────────────

OUTPUT_FILE = Path(__file__).parent / "bank_metadata.json"
WIKI_URL = "https://en.wikipedia.org/wiki/List_of_banks_in_India"
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


def clean_name(name: str) -> str:
    """Produce short_name in HDFC-Bank style."""
    name = name.strip()
    if not name.endswith("Bank"):
        name += "-Bank"
    # Remove double words like "Bank-Bank"
    name = re.sub(r"Bank[- ]*Bank$", "Bank", name)
    return name

def scrape_banks() -> dict:
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    r = requests.get(WIKI_URL, headers=headers)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")
    tables = soup.select("table.wikitable")

    banks = {}
    for table in tables:
        rows = table.find_all("tr")[1:]  # skip header
        for row in rows:
            cols = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
            if len(cols) < 2:
                continue

            bank_name = cols[0]
            if not bank_name:
                continue

            short_name = clean_name(bank_name)
            bank_type = cols[1] if len(cols) > 1 else "Unknown"
            website = ""
            link = row.find("a", href=True)
            if link and "http" in link["href"]:
                website = link["href"]

            # Default IFSC bank code = first 4 letters of short_name without dash
            bank_code = re.sub(r"[^A-Za-z]", "", short_name)[:4].upper()

            banks[bank_name] = {
                "short_name": short_name,
                "bank_type": bank_type,
                "website": website,
                "bank_code": bank_code
            }

    return banks

def format_short_name(name):
    # Replace spaces with empty string except before 'Bank'
    parts = name.split()
    if parts[-1].lower() == 'bank':
        return ''.join(parts[:-1]) + '-Bank'
    return '-'.join(parts)

if __name__ == "__main__":
    # Clear existing metadata
    if OUTPUT_FILE.exists():
        OUTPUT_FILE.unlink()
        print(f"⚠️ Cleared old metadata at {OUTPUT_FILE}")

    banks = scrape_banks()
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(banks, f, indent=4, ensure_ascii=False)
    print(f"✅ Saved {len(banks)} banks to {OUTPUT_FILE}")