# Module 11: Savings Account Rates

## Status: Live (manual curation — admin entry only)

Same data model as FD Rates (`rate_entries` table, `product_type='savings'`). See `docs/modules/10-fd-rates.md` for full DB schema and admin CRUD details.

---

## Architecture

### Data Source
- **Manual only** (Phase 1). Admin enters savings rates via `/admin/rates` → "Savings" tab.
- Static fallback data hardcoded in `SavingsRatesPage.tsx` — shown when no live data exists.
- Source of truth: `rate_entries` table, `product_type = 'savings'`.

### Rate Structure for Savings
Unlike FD (fixed tenures), savings rates use balance tiers:
- `tenure_label` → balance tier label e.g. "Up to ₹1 Lakh", "Above ₹5 Lakh"
- `tenure_months` → NULL for savings (no time dimension)
- `min_amount` / `max_amount` → balance slab boundaries
- `senior_rate` → optional additional rate for senior citizens

---

## API Endpoints

### Public
```
GET /api/rates?type=savings  → active savings rates grouped by bank, sorted by best rate desc
                               Cache: 1h Redis (key: rates:savings) + 30min in-memory
                               Returns: { type, banks: [{ bank, tenures, bestRate, lastVerified }], count }
```

### Admin (JWT protected)
```
GET    /api/admin/rates?type=savings  → all savings rate entries (including inactive)
POST   /api/admin/rates               → create savings rate entry (productType: 'savings')
PUT    /api/admin/rates/:id           → update entry; clears Redis cache
DELETE /api/admin/rates/:id           → soft delete (isActive=false)
```

---

## Frontend

### Public Page
- **URL:** `/savings-rates`
- **File:** `frontend/src/pages/SavingsRatesPage.tsx`
- **Features:**
  - Filters: bank type (Public/Private/Small Finance/Digital), bank name search, zero-balance toggle, senior citizen toggle
  - Expandable rows — show all balance tiers per bank
  - Freshness badge per bank (Fresh <7d / Stale 7–30d / Outdated >30d)
  - Static fallback data for 10+ banks if no live API data
  - Cross-links: FD Rates, EMI Calculator, SIP Calculator
  - JSON-LD: BreadcrumbList + WebPage + FAQPage
- **Data fetched from:** `GET /api/rates?type=savings` via `apiClient`

### Admin Page
- **URL:** `/admin/rates` → Savings tab
- **File:** `frontend/src/admin/pages/RatesPage.tsx`
- Same UI as FD rates tab — table with bank, tier label, rate, senior rate, freshness badge, source URL
- Add/Edit modal: bank picker (all active banks), tier label, rate inputs, source URL, notes

---

## Homepage Tile
- Location: "What we offer" 4-tile row, 3rd card
- Design: white card, `border-l-4 border-l-emerald-500`, emerald icon bg
- Links to: `/savings-rates`
- Labels: "Zero Balance", "Up to 9% p.a.", "Digital Banks"

---

## SEO
- **URL:** `/savings-rates`
- **Title:** `Best Savings Account Interest Rates 2026 — Compare All Banks India | RupeePedia`
- **Target keywords:** "best savings account interest rate", "highest savings rate india", "zero balance savings account interest", "small finance bank savings rate"
- Sitemap: added (priority 0.9, changefreq weekly)

---

## Key Data Points (as of 2026)
| Bank | Tier | Rate |
|---|---|---|
| Utkarsh Small Finance Bank | Above ₹50 Lakh | 9.00% |
| ESAF Small Finance Bank | Above ₹1 Lakh | 6.50% |
| IDFC FIRST Bank | Above ₹5 Lakh | 7.25% |
| SBI | All balances | 2.70% |
| HDFC Bank | Below ₹50 Lakh | 3.00% |

*Enter actual data via `/admin/rates` → Savings tab.*

---

## Phase 2 Roadmap
- Scraping for top 5 banks savings rates (weekly, after traffic justifies maintenance)
- Rate change alerts when a bank's rate changes >0.25%
- `/loan-rates` page (indicative rates, strong "actual rate varies" disclaimer)
