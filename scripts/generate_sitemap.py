#!/usr/bin/env python3
"""
File: scripts/generate_sitemap.py
Generate static sitemap.xml for all IFSC codes
Includes static pages + all 177K+ branch pages
Schedule: Run weekly via GitHub Actions after data sync
"""

import sys
import os
import sqlite3
import psycopg2
from datetime import datetime
from pathlib import Path

# ── Load .env from project root automatically ──────────────────────────────────
def load_env():
    """Load environment variables from .env file."""
    base_dir = Path(__file__).parent.parent
    for candidate in [base_dir / ".env", Path(__file__).parent / ".env"]:
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

load_env()

def get_db_connection():
    """Open SQLite or PostgreSQL depending on DATABASE_URL / DIRECT_URL env var."""
    database_url = os.environ.get("DATABASE_URL", "")
    
    if database_url.startswith("postgresql://") or database_url.startswith("postgres://"):
        # Use DIRECT_URL for better connection handling
        direct_url = os.environ.get("DIRECT_URL", database_url)
        # Strip pgbouncer query string if present
        if "?" in direct_url:
            direct_url = direct_url.split("?")[0]
        print("Connecting to PostgreSQL...")
        conn = psycopg2.connect(direct_url)
        return conn
    else:
        # Use SQLite
        db_path = Path(__file__).parent.parent / "backend" / "data" / "bankinfohub.db"
        print(f"Connecting to SQLite: {db_path}")
        db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(db_path))
        return conn

def generate_sitemap():
    """
    Generate sitemap.xml with all pages
    Output: frontend/public/sitemap.xml (can be served as static file)
    """
    print("🗺️  Generating sitemap.xml...")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get all IFSC codes with last updated timestamp
        cursor.execute('''
            SELECT ifsc, last_updated 
            FROM "Branch"
            ORDER BY last_updated DESC NULLS LAST
        ''')
        branches = cursor.fetchall()
        
        print(f"Found {len(branches)} IFSC codes")
        
        # Start XML
        xml_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ]
        
        # Base URL from env (defaults to localhost for testing)
        base_url = os.getenv('FRONTEND_URL', 'https://rupeepedia.in')
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Add static pages
        static_pages = [
            ('/', '1.0', 'weekly', today),
            ('/ifsc-finder', '0.9', 'weekly', today),
            ('/about', '0.8', 'monthly', today),
        ]
        
        print("Adding static pages...")
        for path, priority, changefreq, lastmod in static_pages:
            xml_lines.append('  <url>')
            xml_lines.append(f'    <loc>{base_url}{path}</loc>')
            xml_lines.append(f'    <lastmod>{lastmod}</lastmod>')
            xml_lines.append(f'    <changefreq>{changefreq}</changefreq>')
            xml_lines.append(f'    <priority>{priority}</priority>')
            xml_lines.append('  </url>')
        
        # Add IFSC pages
        print("Adding IFSC pages...")
        for i, (ifsc_code, last_updated) in enumerate(branches):
            if i % 10000 == 0:
                print(f"  Processing IFSC {i}/{len(branches)}...")
            
            # Format last modified date
            if last_updated:
                lastmod = last_updated.strftime('%Y-%m-%d')
            else:
                lastmod = today
            
            xml_lines.append('  <url>')
            xml_lines.append(f'    <loc>{base_url}/ifsc/{ifsc_code}</loc>')
            xml_lines.append(f'    <lastmod>{lastmod}</lastmod>')
            xml_lines.append('    <changefreq>monthly</changefreq>')
            xml_lines.append('    <priority>0.8</priority>')
            xml_lines.append('  </url>')
        
        # Close XML
        xml_lines.append('</urlset>')
        
        # Write sitemap
        sitemap_path = Path(__file__).parent.parent / 'frontend' / 'public' / 'sitemap.xml'
        sitemap_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(sitemap_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(xml_lines))
        
        file_size_mb = sitemap_path.stat().st_size / (1024 * 1024)
        print(f"✅ Sitemap generated: {sitemap_path}")
        print(f"   Size: {file_size_mb:.2f} MB")
        print(f"   Total URLs: {len(static_pages) + len(branches)}")
        
        # Optional: Split into multiple sitemaps if > 50MB (Google limit)
        if file_size_mb > 50:
            print("\n⚠️  WARNING: Sitemap exceeds 50MB. Consider splitting into multiple files.")
            print("   For now, Google will handle large sitemaps.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error generating sitemap: {e}")
        return False
    
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    success = generate_sitemap()
    sys.exit(0 if success else 1)
