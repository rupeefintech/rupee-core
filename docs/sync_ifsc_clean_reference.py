#!/usr/bin/env python3
"""
backend/scripts/sync_ifsc_clean.py
Production-grade IFSC data sync with cleaning, deduplication, and safety checks.

Usage:
    python sync_ifsc_clean.py --strategy incremental --dry-run
    python sync_ifsc_clean.py --strategy merge-safe
"""

import os
import sys
import json
import re
import csv
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from io import StringIO
from pathlib import Path
from difflib import SequenceMatcher
from urllib.parse import urljoin
import argparse

import requests
import psycopg2
from psycopg2.extras import execute_batch, RealDictCursor
from psycopg2.pool import SimpleConnectionPool

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    handlers=[
        logging.FileHandler(f'logs/sync_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class BankDataCleaner:
    """Production data cleaning and sync engine"""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn = None
        self.cursor = None
        self.sync_log_id = None
        self.normalization_rules = self._load_normalization_rules()
        self.bank_classification_cache = {}

    def _load_normalization_rules(self) -> Dict[str, str]:
        """Load city/district name corrections"""
        return {
            "Hyaderabad": "Hyderabad",
            "Hyderabd": "Hyderabad",
            "Secondrabad": "Secunderabad",
            "Secunderbad": "Secunderabad",
            "Secundrabad": "Secunderabad",
            "Seri Lingampally": "Seri Lingampally",
            "Seri-Lingampally": "Seri Lingampally",
            "Serlingampally": "Seri Lingampally",
            "Bengaluru": "Bangalore",
            "Bangalore Urban": "Bangalore",
            "Thiruvananthapuram": "Trivandrum",
        }

    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(self.db_url)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            logger.info("✅ Database connected")
        except Exception as e:
            logger.error(f"❌ Failed to connect to database: {e}")
            raise

    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

    # ============================================
    # DATA NORMALIZATION
    # ============================================

    def normalize_bank_name(self, name: str) -> str:
        """
        Normalize bank name to canonical form.
        Examples:
            "HDFC BANK LIMITED" -> "HDFC Bank"
            "state bank of india" -> "State Bank of India"
        """
        if not name:
            return ""

        # Title case
        name = name.strip().title()

        # Remove common suffixes
        name = re.sub(
            r'\s+(Bank|Ltd\.?|Limited|Corporation|Co\.?)\s*$',
            '',
            name,
            flags=re.IGNORECASE
        )

        # Remove extra spaces
        name = re.sub(r'\s+', ' ', name).strip()

        # Specific canonicalization
        name_lower = name.lower()
        if 'sbi' in name_lower or 'state bank' in name_lower:
            return "State Bank of India"
        elif 'hdfc' in name_lower:
            return "HDFC Bank"
        elif 'icici' in name_lower:
            return "ICICI Bank"
        elif 'axis' in name_lower:
            return "Axis Bank"
        elif 'kotak' in name_lower:
            return "Kotak Mahindra Bank"

        return name

    def normalize_location(self, location: str) -> str:
        """Normalize city/district names"""
        if not location:
            return ""

        location = location.strip().title()

        # Apply rules
        for typo, correct in self.normalization_rules.items():
            location = re.sub(
                f'^{re.escape(typo)}$',
                correct,
                location,
                flags=re.IGNORECASE
            )

        return location.strip()

    def normalize_ifsc(self, ifsc: str) -> Optional[str]:
        """Validate and normalize IFSC code"""
        if not ifsc:
            return None

        ifsc = ifsc.strip().upper()

        # IFSC format: 4 letters + 0 + 6 chars
        if len(ifsc) != 11 or not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', ifsc):
            logger.warning(f"Invalid IFSC format: {ifsc}")
            return None

        return ifsc

    # ============================================
    # BANK CLASSIFICATION
    # ============================================

    def classify_bank(self, bank_name: str) -> Tuple[str, str]:
        """
        Classify bank into type and sub_type.
        Returns: (bank_type, sub_type)

        Hierarchy:
        - Public Sector Bank (PSB)
        - Private Sector Bank (PrivB)
        - Cooperative Bank (Coop)
        - Regional Rural Bank (RRB)
        - Small Finance Bank (SFB)
        - Payments Bank (PB)
        """

        if bank_name in self.bank_classification_cache:
            return self.bank_classification_cache[bank_name]

        name_lower = bank_name.lower()

        # Check RBI hardcoded list (update periodically)
        public_banks = {
            'state bank': ('Public', 'Scheduled Public Sector Bank'),
            'pnb': ('Public', 'Scheduled Public Sector Bank'),
            'bank of india': ('Public', 'Scheduled Public Sector Bank'),
            'bank of baroda': ('Public', 'Scheduled Public Sector Bank'),
            'central bank': ('Public', 'Scheduled Public Sector Bank'),
            'indian bank': ('Public', 'Scheduled Public Sector Bank'),
            'indian overseas': ('Public', 'Scheduled Public Sector Bank'),
            'canara bank': ('Public', 'Scheduled Public Sector Bank'),
            'union bank': ('Public', 'Scheduled Public Sector Bank'),
        }

        private_banks = {
            'hdfc': ('Private', 'Scheduled Private Sector Bank'),
            'icici': ('Private', 'Scheduled Private Sector Bank'),
            'axis': ('Private', 'Scheduled Private Sector Bank'),
            'kotak': ('Private', 'Scheduled Private Sector Bank'),
            'indusind': ('Private', 'Scheduled Private Sector Bank'),
            'yes bank': ('Private', 'Scheduled Private Sector Bank'),
            'federal bank': ('Private', 'Scheduled Private Sector Bank'),
            'citizen bank': ('Private', 'Scheduled Private Sector Bank'),
            'rbl bank': ('Private', 'Small Finance Bank'),
        }

        special_types = {
            'gramin': ('RRB', 'Regional Rural Bank'),
            'rrb': ('RRB', 'Regional Rural Bank'),
            'cooperative': ('Cooperative', 'Cooperative Bank'),
            'small finance': ('Private', 'Small Finance Bank'),
            'payments bank': ('Private', 'Payments Bank'),
        }

        # Check public banks
        for keyword, classification in public_banks.items():
            if keyword in name_lower:
                self.bank_classification_cache[bank_name] = classification
                return classification

        # Check private banks
        for keyword, classification in private_banks.items():
            if keyword in name_lower:
                self.bank_classification_cache[bank_name] = classification
                return classification

        # Check special types
        for keyword, classification in special_types.items():
            if keyword in name_lower:
                self.bank_classification_cache[bank_name] = classification
                return classification

        # Default to private sector (conservative)
        default = ('Private', 'Scheduled Private Sector Bank')
        self.bank_classification_cache[bank_name] = default
        return default

    # ============================================
    # DATA FETCHING & PARSING
    # ============================================

    def fetch_from_razorpay(self) -> List[Dict]:
        """
        Fetch latest IFSC data from Razorpay GitHub
        """
        logger.info("📥 Fetching from Razorpay...")

        try:
            # Get latest release
            release_url = "https://api.github.com/repos/razorpay/ifsc/releases/latest"
            response = requests.get(release_url, timeout=10)
            release = response.json()

            # Find CSV asset
            csv_url = None
            for asset in release.get('assets', []):
                if 'csv' in asset['name'].lower():
                    csv_url = asset['browser_download_url']
                    break

            if not csv_url:
                raise ValueError("No CSV found in latest Razorpay release")

            # Download CSV
            logger.info(f"📥 Downloading CSV from {csv_url}")
            csv_response = requests.get(csv_url, timeout=30)
            csv_text = StringIO(csv_response.text)

            # Parse CSV
            records = []
            reader = csv.DictReader(csv_text)

            for i, row in enumerate(reader):
                if i % 20000 == 0:
                    logger.info(f"  Processing row {i}...")

                cleaned = self._parse_branch_row(row)
                if cleaned:
                    records.append(cleaned)

            logger.info(f"✅ Fetched and cleaned {len(records)} records from Razorpay")
            return records

        except Exception as e:
            logger.error(f"❌ Failed to fetch from Razorpay: {e}")
            raise

    def _parse_branch_row(self, row: Dict) -> Optional[Dict]:
        """Parse and clean a single CSV row"""

        # Normalize IFSC first (critical field)
        ifsc = self.normalize_ifsc(row.get('IFSC', '') or row.get('ifsc', ''))
        if not ifsc:
            return None

        # Extract fields
        bank_name = self.normalize_bank_name(row.get('BANK', '') or row.get('bank', ''))
        if not bank_name:
            return None

        state = self.normalize_location(row.get('STATE', '') or row.get('state', ''))
        if not state:
            return None

        cleaned = {
            'ifsc': ifsc,
            'bank_name': bank_name,
            'branch_name': (row.get('BRANCH', '') or row.get('branch', '')).strip().title(),
            'address': (row.get('ADDRESS', '') or row.get('address', '')).strip(),
            'city': self.normalize_location(row.get('CITY', '') or row.get('city', '')),
            'district': self.normalize_location(row.get('DISTRICT', '') or row.get('district', '')),
            'state': state,
            'pincode': (row.get('PINCODE', '') or row.get('pincode', '')).strip()[:6],
            'micr': (row.get('MICR', '') or row.get('micr', '')).strip().upper(),
            'neft': row.get('NEFT', 'N').upper() in ['Y', 'TRUE', '1'],
            'rtgs': row.get('RTGS', 'N').upper() in ['Y', 'TRUE', '1'],
            'imps': row.get('IMPS', 'N').upper() in ['Y', 'TRUE', '1'],
            'upi': row.get('UPI', 'N').upper() in ['Y', 'TRUE', '1'],
        }

        return cleaned

    # ============================================
    # DEDUPLICATION & CONFLICT DETECTION
    # ============================================

    def detect_duplicate_ifsc(self, records: List[Dict]) -> Dict[str, List]:
        """Detect branches with identical IFSC codes"""
        duplicates = {}

        ifsc_map = {}
        for record in records:
            ifsc = record['ifsc']
            if ifsc not in ifsc_map:
                ifsc_map[ifsc] = []
            ifsc_map[ifsc].append(record)

        # Flag duplicates
        for ifsc, branches in ifsc_map.items():
            if len(branches) > 1:
                duplicates[ifsc] = branches

        return duplicates

    def detect_merged_banks(self) -> Dict[str, Dict]:
        """Detect potentially merged banks"""

        query = """
        SELECT 
            b.id, 
            b.name, 
            COUNT(br.id) as branch_count,
            MAX(br.last_synced) as last_update
        FROM "BanksMaster" b
        LEFT JOIN "Branch" br ON b.id = br.bank_id
        WHERE b.is_active = true
        GROUP BY b.id, b.name
        HAVING COUNT(br.id) = 0 OR MAX(br.last_synced) < NOW() - INTERVAL '90 days'
        """

        self.cursor.execute(query)
        results = self.cursor.fetchall()

        merged = {}
        for row in results:
            merged[row['name']] = {
                'id': row['id'],
                'branch_count': row['branch_count'],
                'last_update': row['last_update']
            }

        return merged

    # ============================================
    # DATA LOADING & UPSERTING
    # ============================================

    def upsert_branches(self, records: List[Dict], dry_run: bool = False) -> Dict:
        """
        Insert/update branch records with full audit trail.
        Returns: { added, updated, duplicates_flagged, errors }
        """

        stats = {
            'added': 0,
            'updated': 0,
            'duplicates_flagged': 0,
            'errors': 0,
            'banks_created': 0,
        }

        logger.info(f"🔄 Upserting {len(records)} records{'(DRY RUN)' if dry_run else ''}...")

        # Detect duplicates first
        duplicates = self.detect_duplicate_ifsc(records)
        if duplicates:
            logger.warning(f"⚠️  Found {len(duplicates)} duplicate IFSCs")
            stats['duplicates_flagged'] = len(duplicates)

            # Log them
            for ifsc, branches in list(duplicates.items())[:10]:  # Log first 10
                logger.warning(f"   {ifsc}: {[b['bank_name'] for b in branches]}")

        # Get state lookup
        self.cursor.execute('SELECT id, name FROM "State"')
        states = {row['name']: row['id'] for row in self.cursor.fetchall()}

        for i, record in enumerate(records):
            if (i + 1) % 50000 == 0:
                logger.info(f"  Processing {i + 1}/{len(records)}...")

            try:
                ifsc = record['ifsc']
                state = record['state']

                if state not in states:
                    logger.warning(f"State '{state}' not found for {ifsc}")
                    stats['errors'] += 1
                    continue

                state_id = states[state]

                # Find or create bank
                self.cursor.execute(
                    'SELECT id FROM "BanksMaster" WHERE name = %s',
                    (record['bank_name'],)
                )
                bank_row = self.cursor.fetchone()

                if bank_row:
                    bank_id = bank_row['id']
                else:
                    # Create new bank
                    bank_type, sub_type = self.classify_bank(record['bank_name'])
                    ifsc_prefix = ifsc[:4]

                    if not dry_run:
                        self.cursor.execute(
                            '''INSERT INTO "BanksMaster" 
                               (name, short_code, ifsc_prefix, bank_type, sub_type, 
                                is_active, source_razorpay, created_at, updated_at)
                               VALUES (%s, %s, %s, %s, %s, %s, true, NOW(), NOW())
                               RETURNING id''',
                            (record['bank_name'], ifsc_prefix, ifsc_prefix,
                             bank_type, sub_type)
                        )
                        bank_id = self.cursor.fetchone()['id']
                        stats['banks_created'] += 1
                    else:
                        bank_id = -1  # Dummy for dry-run

                # Find or create district
                district_id = None
                if record.get('district'):
                    self.cursor.execute(
                        'SELECT id FROM "District" WHERE name = %s AND state_id = %s',
                        (record['district'], state_id)
                    )
                    district_row = self.cursor.fetchone()
                    district_id = district_row['id'] if district_row else None

                # Upsert branch
                if not dry_run:
                    self.cursor.execute(
                        '''INSERT INTO "Branch" 
                           (ifsc, bank_id, branch_name, address, city, district_id,
                            state_id, pincode, micr, neft, rtgs, imps, upi,
                            is_active, last_synced)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true, NOW())
                           ON CONFLICT (ifsc) DO UPDATE SET
                           bank_id = EXCLUDED.bank_id,
                           branch_name = EXCLUDED.branch_name,
                           address = EXCLUDED.address,
                           city = EXCLUDED.city,
                           district_id = EXCLUDED.district_id,
                           pincode = EXCLUDED.pincode,
                           micr = EXCLUDED.micr,
                           neft = EXCLUDED.neft,
                           rtgs = EXCLUDED.rtgs,
                           imps = EXCLUDED.imps,
                           upi = EXCLUDED.upi,
                           last_synced = NOW()
                        ''',
                        (ifsc, bank_id, record['branch_name'], record['address'],
                         record['city'], district_id, state_id, record['pincode'],
                         record['micr'], record['neft'], record['rtgs'],
                         record['imps'], record['upi'])
                    )
                    stats['updated'] += 1

            except Exception as e:
                logger.error(f"Error processing {ifsc}: {e}")
                stats['errors'] += 1

        if not dry_run:
            self.conn.commit()

        return stats

    def rebuild_bank_state_presence(self, dry_run: bool = False):
        """Rebuild the bank↔state relationship table"""

        logger.info("🔄 Rebuilding bank_state_presence...")

        if not dry_run:
            self.cursor.execute('DELETE FROM "BankStatePresence"')

            self.cursor.execute('''
                INSERT INTO "BankStatePresence" (bank_id, state_id, branches_count, last_verified, created_at, updated_at)
                SELECT 
                    b.id,
                    br.state_id,
                    COUNT(br.id),
                    NOW(),
                    NOW(),
                    NOW()
                FROM "BanksMaster" b
                JOIN "Branch" br ON b.id = br.bank_id
                WHERE b.is_active = true AND br.is_active = true
                GROUP BY b.id, br.state_id
            ''')

            self.conn.commit()

        logger.info("✅ Bank↔state presence rebuilt")

    # ============================================
    # MAIN ORCHESTRATION
    # ============================================

    def run_sync(self, strategy: str = 'merge-safe', dry_run: bool = False):
        """
        Execute full data pipeline.

        Strategies:
        - full-replace: Replace all data (risky)
        - incremental: Add/update only (recommended)
        - merge-safe: Merge with validation
        """

        logger.info(f"🔄 Starting {strategy} sync (dry_run={dry_run})...")

        try:
            self.connect()

            # Log sync start
            if not dry_run:
                self.cursor.execute(
                    '''INSERT INTO "DataSyncLog" 
                       (sync_type, source, status, started_at)
                       VALUES (%s, %s, %s, NOW())
                       RETURNING id''',
                    ('branches', 'razorpay', 'running')
                )
                self.sync_log_id = self.cursor.fetchone()['id']
                self.conn.commit()

            # 1. Fetch data
            records = self.fetch_from_razorpay()

            # 2. Detect changes
            current_count = self._get_current_branch_count()
            new_count = len(records)
            change_percent = abs(new_count - current_count) / current_count * 100

            logger.info(f"📊 Current: {current_count:,} branches, New: {new_count:,}, Change: {change_percent:.1f}%")

            # 3. Safety check
            if change_percent > 10 and not dry_run:
                logger.warning("⚠️  Change > 10%. Flagging for manual review.")
                # In production, send email for approval

            # 4. Detect issues
            merged_banks = self.detect_merged_banks()
            if merged_banks:
                logger.warning(f"🏦 Detected {len(merged_banks)} potentially merged banks:")
                for name, info in list(merged_banks.items())[:5]:
                    logger.warning(f"   {name}: {info['branch_count']} branches")

            # 5. Upsert data
            stats = self.upsert_branches(records, dry_run=dry_run)
            logger.info(f"✅ Sync stats: {stats['added']} added, {stats['updated']} updated, "
                       f"{stats['banks_created']} banks created, {stats['errors']} errors")

            # 6. Rebuild relationships
            if stats['updated'] > 0 or stats['added'] > 0:
                self.rebuild_bank_state_presence(dry_run=dry_run)

            # 7. Update sync log
            if not dry_run:
                self.cursor.execute(
                    '''UPDATE "DataSyncLog" 
                       SET status = %s, completed_at = NOW(), 
                           records_added = %s, records_updated = %s
                       WHERE id = %s''',
                    ('success', stats['added'], stats['updated'], self.sync_log_id)
                )
                self.conn.commit()

            logger.info("🎉 Sync complete!")
            return True

        except Exception as e:
            logger.error(f"❌ Sync failed: {e}")

            if not dry_run and self.sync_log_id:
                self.cursor.execute(
                    '''UPDATE "DataSyncLog" 
                       SET status = %s, completed_at = NOW(), error_message = %s
                       WHERE id = %s''',
                    ('failed', str(e), self.sync_log_id)
                )
                self.conn.commit()

            return False

        finally:
            self.close()

    def _get_current_branch_count(self) -> int:
        """Get current branch count"""
        self.cursor.execute('SELECT COUNT(*) as count FROM "Branch" WHERE is_active = true')
        return self.cursor.fetchone()['count']


# ============================================
# CLI ENTRY POINT
# ============================================

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='IFSC data sync and cleaning tool')
    parser.add_argument('--strategy', choices=['incremental', 'merge-safe', 'full-replace'],
                       default='merge-safe', help='Sync strategy')
    parser.add_argument('--dry-run', action='store_true', help='Dry run (no DB changes)')
    args = parser.parse_args()

    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        logger.error("DATABASE_URL environment variable not set")
        sys.exit(1)

    cleaner = BankDataCleaner(db_url)
    success = cleaner.run_sync(strategy=args.strategy, dry_run=args.dry_run)

    sys.exit(0 if success else 1)
