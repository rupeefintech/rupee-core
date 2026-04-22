# Module: IFSC Finder

The primary product of Rupeepedia. Users look up IFSC codes via cascade filtering (Bank → State → City → Branch) or direct search. Each IFSC has a dedicated SEO page. Bank, state, and city pages provide SEO scale across 178k+ branches.

## Frontend Pages

| File | URL Route | Purpose |
|---|---|---|
| `src/pages/HomePage.tsx` | `/` | Landing page with search + cascade filters |
| `src/pages/IFSCFinderPage.tsx` | `/ifsc-finder` | Full cascade filter UI |
| `src/pages/IFSCDetailPage.tsx` | `/ifsc/:ifsc` | Individual IFSC detail page |
| `src/pages/IFSCResultPage.tsx` | `/ifsc-result` | Search results list |
| `src/pages/BankPage.tsx` | `/bank/:slug` | All states/branches for a bank |
| `src/pages/StatePage.tsx` | `/state/:slug` | All branches in a state |
| `src/pages/CityPage.tsx` | `/city/:slug` | All branches in a city |

## Backend API Endpoints

| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/banks` | All active banks (cached) |
| `GET` | `/api/states` | All states (cached) |
| `GET` | `/api/ifsc/:ifsc` | Full branch detail for one IFSC code |
| `GET` | `/api/ifsc/:ifsc/nearby` | Nearby branches (same bank + city) |
| `GET` | `/api/districts?state_id=&bank_id=` | Districts for a state/bank combo |
| `GET` | `/api/branches?bank_id=&state_id=&district_id=` | Branch list for cascade filter |
| `GET` | `/api/banks/:bankSlug/states` | States where a bank has branches |
| `GET` | `/api/bank/:bankSlug/cities/:stateSlug` | Cities for a bank+state |
| `GET` | `/api/city/:bankSlug/:stateSlug/:citySlug` | Branches for bank+state+city (paginated) |
| `GET` | `/api/bank/:slug` | SEO bank page — all branches |
| `GET` | `/api/state/:slug` | SEO state page — all branches |
| `GET` | `/api/city/:slug` | SEO city page — all branches |
| `GET` | `/api/search?q=` | IFSC / branch name search |
| `GET` | `/api/stats` | DB stats (total branches, banks, states) |

## Database Tables Touched

| Table | Usage |
|---|---|
| `Bank` | Bank dropdown, bank page |
| `Branch` | Core IFSC data |
| `State` | State dropdown, state page |
| `District` | District dropdown |
| `City` | City cascade filter |
| `BankStatePresence` | Bank→State navigation |
| `SearchLog` | Logs search queries |

## IFSC Data Sync Pipeline

Branch/IFSC data comes from Razorpay's open IFSC dataset (GitHub releases, updated monthly).
Script: `scripts/sync_ifsc.py`

**9-stage pipeline:**
1. **Fetch** — Download latest Razorpay IFSC release JSON
2. **Normalize** — Trim whitespace, fix encoding, standardize city/state names
3. **Deduplicate** — Fuzzy match (95%+ threshold) to catch near-duplicates
4. **Classify** — Assign `bank_type` from name patterns (see table below)
5. **Detect mergers** — Flag banks with no branches for >90 days
6. **Safety checks** — Alert if >10% data change (likely error, needs review)
7. **Upsert** — Insert new / update existing branches
8. **Rebuild presence** — Regenerate `BankStatePresence` counts
9. **Verify** — Check FK integrity, log to `SyncLog`

**After every sync, these must be rebuilt:**
- `bank_state_presence` — branch counts per bank+state
- `City` table — new cities from new branches
- `Branch.city_id` — link new branches to cities
- Redis cache — flush via `flushdb()`

**Bank classification patterns:**

| Type | Name Pattern |
|---|---|
| Public | SBI, PNB, BOB, Canara, Union, Indian Bank (12 known names) |
| Private | HDFC, ICICI, Axis, Kotak, Yes, IndusInd, etc. |
| Cooperative | Contains "co-operative", "sahakari", "sahakara", "souharda" |
| RRB | Contains "gramin", "grameen", "grameena", "rural bank" |
| Payments | Contains "payments bank" |
| Small Finance | Contains "small finance" |
| Foreign | Contains "international", or known names (HSBC, Citi, DBS, etc.) |

**Never:**
- Overwrite `BanksMaster.name/type/logo` from automated sync
- Delete banks — set `is_active = false` instead
- Run sync without a backup plan

## Caching

`/api/banks` and `/api/states` are three-tier cached (in-memory → Redis → DB). All other IFSC endpoints hit DB directly with indexes on `ifsc`, `bank_id`, `state_id`, `city_id`.

## Known Gaps

- Nearby branches is basic — same bank + city match only, no radius calculation
- `Branch.city` is UPPERCASE in DB — UI should display as title-case
- Some branches missing `latitude`/`longitude` so map view is incomplete
- Data cleanup script: `scripts/cleanup_data.py` handles district deduplication and state mapping corrections
