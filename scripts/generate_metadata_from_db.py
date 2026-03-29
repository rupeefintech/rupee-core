#!/usr/bin/env python3
"""
generate_metadata_from_rbi.py
Scrapes RBI bank links page and updates bank_metadata.json
"""

import os
import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.resolve()
OUTPUT_FILE = BASE_DIR / "bank_metadata.json"

# Load existing metadata if exists
if OUTPUT_FILE.exists():
    with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
        bank_metadata = json.load(f)
else:
    bank_metadata = {}

RBI_BANK_LINKS_URL = "https://www.rbi.org.in/scripts/banklinks.aspx"

print(f"🔗 Fetching RBI bank links from {RBI_BANK_LINKS_URL} ...")
resp = requests.get(RBI_BANK_LINKS_URL)
resp.raise_for_status()

soup = BeautifulSoup(resp.text, 'html.parser')

# RBI page has <table> with banks
# We'll parse all <a> tags inside the main table
rbi_table = soup.find("table")
if not rbi_table:
    print("❌ Could not find bank links table on RBI page")
    exit(1)

updated_count = 0
for a in rbi_table.find_all("a", href=True):
    bank_name = a.text.strip()
    bank_website = a['href'].strip()

    if not bank_name or not bank_website:
        continue

    if bank_name in bank_metadata:
        # Update website if missing or empty
        if not bank_metadata[bank_name].get("website"):
            bank_metadata[bank_name]["website"] = bank_website
            updated_count += 1
    else:
        # Add new entry with basic metadata
        bank_metadata[bank_name] = {
            "short_name": bank_name.replace(" ", "-"),
            "bank_type": "",  # Will infer later if needed
            "website": bank_website,
            "logo_url": ""
        }
        updated_count += 1

for bank_name in all_banks:
    if bank_name not in bank_metadata:
        bank_metadata[bank_name] = {
            "short_name": bank_name.replace(" ", "-"),
            "bank_type": get_bank_type_from_name(bank_name),
            "website": "",  # unknown
            "logo_url": ""
        }

# Save updated metadata
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(bank_metadata, f, indent=2, ensure_ascii=False)

print(f"✅ Updated bank_metadata.json with RBI data. Total updated/added: {updated_count}")