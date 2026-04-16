#!/usr/bin/env python3
"""
backup_data.py — BankInfoHub Database Backup & Restore
========================================================
Exports all key tables to CSV files (backup) or imports them back (restore).

Usage:
    python scripts/backup_data.py backup              # → creates scripts/backups/<timestamp>/
    python scripts/backup_data.py backup --dir mydir   # → creates scripts/backups/mydir/
    python scripts/backup_data.py restore <folder>     # ← restores from scripts/backups/<folder>/
    python scripts/backup_data.py list                 # show available backups

Requirements: pip install psycopg2-binary tqdm colorama
"""

import os
import sys
import csv
import time
from datetime import datetime
from pathlib import Path

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
BACKUPS_DIR = SCRIPTS_DIR / "backups"

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
# TABLE DEFINITIONS — order matters for FK constraints (parents first)
# ═════════════════════════════════════════════════════════════════════════════

# (filename, DB table name)
TABLES = [
    ("states.csv",               '"State"'),
    ("districts.csv",            '"District"'),
    ("cities.csv",               '"City"'),
    ("banks.csv",                '"Bank"'),
    ("branches.csv",             '"Branch"'),
    ("bank_state_presence.csv",  '"bank_state_presence"'),
    ("data_overrides.csv",       '"data_overrides"'),
    ("search_logs.csv",          '"search_logs"'),
    ("sync_log.csv",             '"sync_log"'),
]


# ═════════════════════════════════════════════════════════════════════════════
# DATABASE CONNECTION
# ═════════════════════════════════════════════════════════════════════════════

def get_conn():
    url = os.environ.get("DIRECT_URL") or os.environ.get("DATABASE_URL", "")
    if not url:
        print(f"{Fore.RED}❌ No DATABASE_URL or DIRECT_URL found in environment.")
        sys.exit(1)
    url = url.replace("&pgbouncer=true", "").replace("?pgbouncer=true", "")
    conn = psycopg2.connect(url, connect_timeout=30)
    conn.autocommit = False
    return conn


# ═════════════════════════════════════════════════════════════════════════════
# BACKUP — Export tables to CSV
# ═════════════════════════════════════════════════════════════════════════════

def backup(target_dir: Path):
    target_dir.mkdir(parents=True, exist_ok=True)

    conn = get_conn()
    cur = conn.cursor()
    t0 = time.time()
    total_rows = 0

    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Backing up to: {target_dir}")
    print(f"{'═'*60}{Style.RESET_ALL}\n")

    for filename, table in TABLES:
        filepath = target_dir / filename
        try:
            # Get row count first
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]

            # Get column names
            cur.execute(f"SELECT * FROM {table} LIMIT 0")
            columns = [desc[0] for desc in cur.description]

            # Stream rows to CSV
            cur.execute(f"SELECT * FROM {table} ORDER BY id")
            with open(filepath, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(columns)
                rows_written = 0
                while True:
                    rows = cur.fetchmany(5000)
                    if not rows:
                        break
                    for row in rows:
                        writer.writerow(row)
                        rows_written += 1

            total_rows += rows_written
            size_kb = filepath.stat().st_size / 1024
            print(f"  {Fore.GREEN}✓{Style.RESET_ALL} {filename:<30} {rows_written:>10,} rows  ({size_kb:,.0f} KB)")

        except psycopg2.errors.UndefinedTable:
            conn.rollback()
            print(f"  {Fore.YELLOW}⊘{Style.RESET_ALL} {filename:<30} table not found — skipped")
        except Exception as e:
            conn.rollback()
            print(f"  {Fore.RED}✗{Style.RESET_ALL} {filename:<30} ERROR: {e}")

    # Write a manifest with timestamp and row counts
    manifest = target_dir / "manifest.txt"
    with open(manifest, "w") as f:
        f.write(f"Backup created: {datetime.now().isoformat()}\n")
        f.write(f"Total rows: {total_rows:,}\n\n")
        for filename, table in TABLES:
            fp = target_dir / filename
            if fp.exists():
                line_count = sum(1 for _ in open(fp, encoding="utf-8")) - 1  # minus header
                f.write(f"{filename}: {line_count:,} rows\n")

    duration = time.time() - t0
    print(f"\n{Fore.GREEN}✅ Backup complete — {total_rows:,} total rows in {duration:.1f}s{Style.RESET_ALL}")
    print(f"   Location: {target_dir}\n")

    cur.close()
    conn.close()


# ═════════════════════════════════════════════════════════════════════════════
# RESTORE — Import tables from CSV
# ═════════════════════════════════════════════════════════════════════════════

def restore(source_dir: Path):
    if not source_dir.exists():
        print(f"{Fore.RED}❌ Backup folder not found: {source_dir}")
        sys.exit(1)

    # Show manifest if available
    manifest = source_dir / "manifest.txt"
    if manifest.exists():
        print(f"\n{Fore.CYAN}Manifest:{Style.RESET_ALL}")
        print(manifest.read_text())

    # Confirm before proceeding
    print(f"{Fore.YELLOW}⚠  This will TRUNCATE all tables and replace with backup data.{Style.RESET_ALL}")
    confirm = input(f"Type 'yes' to proceed: ").strip().lower()
    if confirm != "yes":
        print("Aborted.")
        return

    conn = get_conn()
    cur = conn.cursor()
    t0 = time.time()
    total_rows = 0

    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Restoring from: {source_dir}")
    print(f"{'═'*60}{Style.RESET_ALL}\n")

    try:
        # Disable FK constraints during restore
        cur.execute("SET session_replication_role = 'replica'")

        # Truncate in reverse order (children first)
        for filename, table in reversed(TABLES):
            filepath = source_dir / filename
            if filepath.exists():
                cur.execute(f"TRUNCATE {table} CASCADE")

        # Import in forward order (parents first)
        for filename, table in TABLES:
            filepath = source_dir / filename
            if not filepath.exists():
                print(f"  {Fore.YELLOW}⊘{Style.RESET_ALL} {filename:<30} not in backup — skipped")
                continue

            with open(filepath, "r", newline="", encoding="utf-8") as f:
                reader = csv.reader(f)
                columns = next(reader)  # header row

                col_list = ", ".join(columns)
                placeholders = ", ".join(["%s"] * len(columns))
                insert_sql = f"INSERT INTO {table} ({col_list}) VALUES ({placeholders})"

                batch = []
                row_count = 0
                for row in reader:
                    # Convert empty strings to None for nullable fields
                    cleaned = [None if v == "" else v for v in row]
                    batch.append(cleaned)
                    row_count += 1

                    if len(batch) >= 5000:
                        psycopg2.extras.execute_batch(cur, insert_sql, batch, page_size=1000)
                        batch = []

                if batch:
                    psycopg2.extras.execute_batch(cur, insert_sql, batch, page_size=1000)

            total_rows += row_count
            print(f"  {Fore.GREEN}✓{Style.RESET_ALL} {filename:<30} {row_count:>10,} rows restored")

        # Reset sequences to max(id) + 1 for all tables with serial ids
        for filename, table in TABLES:
            try:
                cur.execute(f"SELECT MAX(id) FROM {table}")
                max_id = cur.fetchone()[0]
                if max_id:
                    seq_name = f"{table.strip('\"')}_id_seq"
                    cur.execute(f"SELECT setval('\"{seq_name}\"', %s)", (max_id,))
            except Exception:
                conn.rollback()
                cur.execute("SET session_replication_role = 'replica'")

        # Re-enable FK constraints
        cur.execute("SET session_replication_role = 'origin'")
        conn.commit()

        duration = time.time() - t0
        print(f"\n{Fore.GREEN}✅ Restore complete — {total_rows:,} total rows in {duration:.1f}s{Style.RESET_ALL}\n")

    except Exception as e:
        conn.rollback()
        print(f"\n{Fore.RED}❌ Restore failed: {e}{Style.RESET_ALL}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


# ═════════════════════════════════════════════════════════════════════════════
# LIST — Show available backups
# ═════════════════════════════════════════════════════════════════════════════

def list_backups():
    if not BACKUPS_DIR.exists():
        print("No backups directory found.")
        return

    dirs = sorted([d for d in BACKUPS_DIR.iterdir() if d.is_dir()], reverse=True)
    if not dirs:
        print("No backups found.")
        return

    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  Available Backups")
    print(f"{'═'*60}{Style.RESET_ALL}\n")

    for d in dirs:
        manifest = d / "manifest.txt"
        csv_count = len(list(d.glob("*.csv")))
        total_size = sum(f.stat().st_size for f in d.glob("*.csv")) / (1024 * 1024)

        created = "unknown"
        row_info = ""
        if manifest.exists():
            lines = manifest.read_text().splitlines()
            for line in lines:
                if line.startswith("Backup created:"):
                    created = line.split(": ", 1)[1].split("T")[0]
                if line.startswith("Total rows:"):
                    row_info = line.split(": ", 1)[1]

        print(f"  {Fore.GREEN}{d.name}{Style.RESET_ALL}")
        print(f"    Created: {created}  |  {csv_count} tables  |  {total_size:.1f} MB  |  {row_info} rows")
        print()


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    command = sys.argv[1].lower()

    if command == "backup":
        dir_name = sys.argv[3] if len(sys.argv) > 3 and sys.argv[2] == "--dir" else datetime.now().strftime("%Y%m%d_%H%M%S")
        target = BACKUPS_DIR / dir_name
        backup(target)

    elif command == "restore":
        if len(sys.argv) < 3:
            print(f"{Fore.RED}Usage: python backup_data.py restore <folder_name>{Style.RESET_ALL}")
            print(f"Run 'python backup_data.py list' to see available backups.")
            sys.exit(1)
        folder = sys.argv[2]
        source = BACKUPS_DIR / folder
        restore(source)

    elif command == "list":
        list_backups()

    else:
        print(f"{Fore.RED}Unknown command: {command}{Style.RESET_ALL}")
        print("Commands: backup, restore <folder>, list")
        sys.exit(1)


if __name__ == "__main__":
    main()
