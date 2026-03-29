import os
import json
import psycopg2
import requests
from pathlib import Path
from bs4 import BeautifulSoup

SCRIPTS_DIR = Path(__file__).parent.resolve()
BASE_DIR = SCRIPTS_DIR.parent

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

_load_env()

DATABASE_URL = os.environ.get("DIRECT_URL") or os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not set")
    exit(1)

print("🔗 Connecting to database...")
try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

# Fallback metadata for major banks (manual data)
BANK_METADATA_MANUAL = {
    "SBIN": {"short_name": "SBI-Bank", "bank_type": "Public Sector", "website": "https://www.sbi.co.in", "logo_url": "https://www.sbi.co.in/assets/images/logo-2023.png"},
    "HDFC": {"short_name": "HDFC-Bank", "bank_type": "Private", "website": "https://www.hdfcbank.com", "logo_url": "https://www.hdfcbank.com/content/dam/hdfcbank/images/header/logo.png"},
    "ICIC": {"short_name": "ICICI-Bank", "bank_type": "Private", "website": "https://www.icicibank.com", "logo_url": "https://www.icicibank.com/-/media/project/websitefiles/images/logo/ic_logo.svg"},
    "UTIB": {"short_name": "Axis-Bank", "bank_type": "Private", "website": "https://www.axisbank.com", "logo_url": "https://www.axisbank.com/images/logo.png"},
    "KKBK": {"short_name": "Kotak-Bank", "bank_type": "Private", "website": "https://www.kotak.com", "logo_url": "https://www.kotak.com/images/kotak-logo.png"},
    "PUNB": {"short_name": "PNB-Bank", "bank_type": "Public Sector", "website": "https://www.pnbindia.com", "logo_url": "https://www.pnbindia.com/css/img/pnb-logo.png"},
    "CNRB": {"short_name": "Canara-Bank", "bank_type": "Public Sector", "website": "https://www.canarabank.com", "logo_url": "https://www.canarabank.com/en/images/logo.png"},
    "UBIN": {"short_name": "UBI-Bank", "bank_type": "Public Sector", "website": "https://www.unionbankofindia.com", "logo_url": "https://www.unionbankofindia.com/images/logo_black.png"},
    "BARB": {"short_name": "BOB-Bank", "bank_type": "Public Sector", "website": "https://www.bankofbaroda.in", "logo_url": "https://www.bankofbaroda.in/documents/20126/0/BOB_Logo.png"},
    "BKID": {"short_name": "BOI-Bank", "bank_type": "Public Sector", "website": "https://www.bankofindia.co.in", "logo_url": "https://www.bankofindia.co.in/documents/20126/0/BOI+Logo.png"},
    "IDIB": {"short_name": "IndianBank-Bank", "bank_type": "Public Sector", "website": "https://www.indianbank.in", "logo_url": "https://www.indianbank.in/images/indianbank-logo.svg"},
    "CBIN": {"short_name": "CBI-Bank", "bank_type": "Public Sector", "website": "https://www.centralbankofindia.co.in", "logo_url": "https://www.centralbankofindia.co.in/cbi/static/images/cb_logo.png"},
    "YESB": {"short_name": "YesBank-Bank", "bank_type": "Private", "website": "https://www.yesbank.in", "logo_url": "https://www.yesbank.in/images/logo.png"},
    "FDRL": {"short_name": "Federal-Bank", "bank_type": "Private", "website": "https://www.federalbank.co.in", "logo_url": "https://www.federalbank.co.in/images/logo.png"},
    "RATN": {"short_name": "RBL-Bank", "bank_type": "Private", "website": "https://www.rblbank.com", "logo_url": "https://www.rblbank.com/images/rbl-logo.png"},
}

def fetch_rbi_bank_links():
    """Fetch bank websites from RBI official page"""
    print("\n📡 Fetching bank links from RBI website...")
    
    try:
        url = "https://www.rbi.org.in/scripts/banklinks.aspx"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract bank links from RBI page
        bank_websites = {}
        
        # Find all bank links (usually in tables)
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href', '').strip()
            text = link.get_text().strip()
            
            # Filter to get bank websites
            if href.startswith('http') and len(text) > 2:
                # Map website to bank name (approximate matching)
                bank_name = text.lower()
                if any(word in bank_name for word in ['bank', 'cooperative', 'credit']):
                    bank_websites[text] = href
        
        print(f"✅ Found {len(bank_websites)} banks on RBI page")
        return bank_websites
        
    except Exception as e:
        print(f"⚠️  Failed to fetch from RBI: {e}")
        print("   Will use manual data for major banks")
        return {}

def get_bank_type_from_name(bank_name):
    """Infer bank type from bank name"""
    bank_name_lower = bank_name.lower()
    
    if 'cooperative' in bank_name_lower or 'sahakari' in bank_name_lower:
        return "Cooperative"
    elif 'small finance' in bank_name_lower or 'sfb' in bank_name_lower:
        return "Small Finance Bank"
    elif any(word in bank_name_lower for word in ['hdfc', 'icici', 'axis', 'kotak', 'yes', 'federal', 'rbl', 'bandhan', 'indusind']):
        return "Private"
    else:
        return "Public Sector"

# Get ALL banks from database
print("🔗 Fetching banks from database...")
cur.execute('SELECT DISTINCT name FROM "Bank" ORDER BY name;')
all_banks = [row[0] for row in cur.fetchall()]
print(f"✅ Total banks in database: {len(all_banks)}")

# Get bank codes
cur.execute('SELECT name, bank_code FROM "Bank" WHERE bank_code IS NOT NULL;')
bank_codes = {row[0]: row[1].strip().upper() for row in cur.fetchall()}
print(f"✅ Banks with valid codes: {len(bank_codes)}")

# Fetch from RBI
rbi_bank_websites = fetch_rbi_bank_links()

# Generate metadata
print("\n📝 Generating metadata for all banks...")
metadata = {}
from_rbi = 0
from_manual = 0
without_data = 0

for bank_name in all_banks:
    code = bank_codes.get(bank_name)
    
    # Try manual metadata first (for major banks)
    if code and code in BANK_METADATA_MANUAL:
        metadata[bank_name] = BANK_METADATA_MANUAL[code]
        from_manual += 1
        print(f"  ✓ {bank_name}: {BANK_METADATA_MANUAL[code]['short_name']} (manual)")
    
    # Try RBI data
    elif bank_name in rbi_bank_websites:
        metadata[bank_name] = {
            "short_name": bank_name.replace(' ', '-'),
            "bank_type": get_bank_type_from_name(bank_name),
            "website": rbi_bank_websites[bank_name],
            "logo_url": ""
        }
        from_rbi += 1
        print(f"  ✓ {bank_name}: {rbi_bank_websites[bank_name]} (RBI)")
    
    # No data available
    else:
        metadata[bank_name] = {
            "short_name": "",
            "website": "",
            "bank_type": "",
            "logo_url": ""
        }
        without_data += 1

# Save metadata
output_file = Path("bank_metadata.json")
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print(f"\n✅ Metadata generated successfully!")
print(f"   Total banks: {len(metadata)}")
print(f"   From manual data: {from_manual}")
print(f"   From RBI: {from_rbi}")
print(f"   Without metadata: {without_data}")
print(f"   File: {output_file}")

cur.close()
conn.close()
