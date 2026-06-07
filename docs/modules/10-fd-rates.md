# Module 10: FD / Savings / Loan Rate Tracker

## Status: Live (manual curation — admin entry only)

---

## Architecture

### Data Source
- **Manual only** (Phase 1). Admin enters rates via `/admin/rates` UI.
- No scraping infra yet. Scraping is deferred until traffic justifies maintenance cost.
- Source of truth: `rate_entries` PostgreSQL table.

### When to update rates
- FD rates: check major banks monthly; RBI MCLR changes trigger review
- Savings rates: check weekly (Fridays after RBI review)
- Loan rates: check monthly

### Data freshness
- Admin UI shows staleness badge: Fresh (<7d) / Stale (7-30d) / Outdated (>30d)
- Outdated entries show a warning banner in admin
- Public page shows "last verified" date per bank

---

## DB Schema

Table: `rate_entries`

| Column         | Type            | Notes                                   |
|---|---|---|
| id             | SERIAL PK       |                                         |
| bank_id        | INT FK → Bank   |                                         |
| product_type   | VARCHAR(30)     | fd / savings / loan_personal / loan_home / loan_auto |
| tenure_label   | VARCHAR(50)     | "1 Year", "2-3 Years" (display label)  |
| tenure_months  | INT             | Numeric for sorting; NULL for savings  |
| rate           | DECIMAL(5,2)    | e.g. 7.50                              |
| senior_rate    | DECIMAL(5,2)    | Optional senior citizen extra rate     |
| min_amount     | BIGINT          | Minimum deposit/balance tier           |
| effective_from | DATE            | Rate effective date                    |
| source         | VARCHAR(50)     | 'manual' \| 'scraper'                  |
| source_url     | TEXT            | Link to bank's official rates page     |
| last_verified  | TIMESTAMPTZ     | When admin last confirmed this rate    |
| verified_by    | VARCHAR(100)    | Admin email who verified               |
| is_active      | BOOLEAN         | false = soft-deleted                   |

Indexes: `(bank_id, product_type)`, `(is_active, product_type)`, `(effective_from, is_active)`

---

## API Endpoints

### Public
```
GET /api/rates?type=fd           → active rates grouped by bank, sorted by best rate desc
                                    Cache: 1h Redis + 30min in-memory
                                    Returns: { type, banks: [{ bank, tenures, bestRate, lastVerified }], count }
```

### Admin (JWT protected)
```
GET    /api/admin/rates?type=fd  → all rates including inactive
POST   /api/admin/rates          → create rate entry (clears Redis cache on save)
PUT    /api/admin/rates/:id      → update rate entry (clears Redis cache on save)
DELETE /api/admin/rates/:id      → soft delete (sets is_active=false)
```

---

## Frontend

### Public Page
- URL: `/fd-rates`
- File: `frontend/src/pages/FDRatesPage.tsx`
- Filterable by: bank type, bank name search, tenure, senior citizen toggle
- Expandable rows show all tenures for each bank
- Freshness badge on each bank card
- JSON-LD: BreadcrumbList + WebPage + FAQPage (9 FAQ entries)
- Cross-links: FD Calculator, PPF Calculator, Currency Converter

### Admin Page
- URL: `/admin/rates`
- File: `frontend/src/admin/pages/RatesPage.tsx`
- Tabbed by product type (FD / Savings / Loan Personal / Home / Auto)
- Table with: bank, tenure, rate, senior rate, freshness badge, source URL, status
- Add/Edit modal with: bank picker, tenure presets, rate inputs, source URL
- Staleness warning banner when any active rate >30 days old
- Sidebar link added in AdminLayout

---

## SEO
- URL: `/fd-rates`
- Title: `Best FD Interest Rates 2026 — Compare Fixed Deposit Rates India | RupeePedia`
- Keywords: "best fd rates 2026", "fd interest rates india", "highest fd rate india", "sbi fd rate", "hdfc fd interest rate"
- FAQ schema: 9 questions covering: what is FD, highest rates, TDS, DICGC insurance, premature withdrawal, tax saving FD, senior rates, how interest is calculated
- Added to sitemap.xml (priority 0.9, changefreq weekly)
- Added to Navbar "Finance Tools" dropdown and Footer "Tools & Data" section

---

## Monetization
- FD affiliate links (future): bank "Apply Now" or "Open FD" buttons → ₹500–2000/account
- Display ads: financial category CPM ₹80–200
- Cross-sell: FD Calculator usage drives EMI/SIP calculator visits

---

## Phase 2 Roadmap (after traffic)
- Add scraping for top 5 banks (SBI, HDFC, ICICI, Axis, Kotak) — daily at 10:30 AM IST
- Add `/savings-rates` page (same `rate_entries` table, `product_type='savings'`)
- Add `/loan-rates` page (indicative rates + prominent "actual rate depends on credit score" disclaimer)
- Rate change alerts: email subscribers when a bank's rate drops >0.5%
