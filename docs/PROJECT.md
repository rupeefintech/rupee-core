# Rupeepedia — Project Documentation

> Last updated: 15 April 2026

## What is Rupeepedia?

An Indian financial tools platform at **rupeepedia.in**. Users can:
- Look up any bank's IFSC code (178k+ branches, 1,350+ banks)
- Browse and compare credit cards
- Use 20+ financial calculators (EMI, SIP, Tax, Salary, etc.)
- Read AI-generated money guides (blogs)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + TanStack Query + React Router 6 |
| Backend | Express.js + TypeScript + Prisma 5 |
| Database | PostgreSQL (hosted on Neon) |
| Cache | Upstash Redis + in-memory Map |
| Deploy | Railway |
| Blog AI | Claude API (Anthropic SDK) |
| CI/CD | GitHub Actions (daily blog cron) |

---

## Project Structure

```
rupee/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app, sitemap, cache warm-up
│   │   ├── routes/
│   │   │   ├── api.ts            # All public API endpoints (IFSC, banks, blogs, etc.)
│   │   │   ├── adminRoutes.ts    # Admin CRUD for products/credit cards
│   │   │   └── authRoutes.ts     # Admin login (JWT)
│   │   ├── controllers/          # Auth controller
│   │   ├── middleware/            # JWT verification
│   │   ├── models/               # Admin model helpers
│   │   └── lib/
│   │       ├── prisma.ts         # Prisma client singleton
│   │       └── cache.ts          # Upstash Redis helpers
│   ├── prisma/
│   │   └── schema.prisma         # Database schema (source of truth)
│   └── scripts/
│       ├── create-blog-table.ts  # Creates blogs table via raw SQL
│       ├── seed-blogs.ts         # Seeds initial blog content
│       ├── generate-blog.ts      # AI blog generator (Claude API + Unsplash)
│       ├── blog-topics.ts        # 60 blog topics queue
│       └── seed-credit-cards.ts  # Seeds credit card products
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # All routes + layout
│   │   ├── pages/                # Route pages (20+ pages)
│   │   ├── components/           # Shared components (Navbar, Footer, ToolsSidebar, etc.)
│   │   ├── utils/
│   │   │   ├── api.ts            # Axios client + typed API methods
│   │   │   ├── seo.ts            # SEO title/description generator
│   │   │   └── calculators.ts    # Calculator categories data
│   │   └── styles/globals.css    # Tailwind + custom utilities
│   └── public/images/
│       ├── banks/                # 634 bank logos (WebP, Title_Case: Hdfc_Bank.webp)
│       └── states/               # 35 state images (lowercase-dashed: andhra-pradesh.webp)
├── scripts/
│   ├── sync_ifsc.py              # Razorpay IFSC data sync pipeline
│   ├── cleanup_data.py           # Data quality fixes
│   └── generate_sitemap.py       # Sitemap generator
└── docs/
    ├── PROJECT.md                # This file — main architecture doc
    ├── BLOG_SYSTEM.md            # Blog generation & management
    ├── ADMIN_GUIDE.md            # Admin panel & product management
    └── rules/                    # Coding guidelines (referenced by CLAUDE.md)
```

---

## Database Schema

PostgreSQL with Prisma ORM. The schema lives at `backend/prisma/schema.prisma`.

### Core Models

```
State (43 rows)
├── id, name, code, logoUrl, slug, isoCode
├── Has many: branches, districts, cities

District
├── id, name, stateId, slug, normalizedName
├── Belongs to: State

City (12,030 rows)
├── id, name, stateId, slug, normalizedName
├── Belongs to: State

BanksMaster (1,352 rows) — maps to DB table "Bank"
├── id, name, shortName, bankCode, bankType, headquarters, website
├── logoUrl, slug, isActive, subType, sourceRbi, sourceRazorpay
├── Has many: branches, products, bankStatePresences

Branch (178,785 rows)
├── id, ifsc (unique, 11 chars), micr, branchName, address
├── city (string, UPPERCASE), pincode, phone
├── neft, rtgs, imps, upi (boolean payment flags)
├── latitude, longitude, swift, bankCode
├── Belongs to: BanksMaster, State, District, City

BankStatePresence
├── bankId + stateId (unique pair), branchesCount
├── Denormalized for fast cascade filtering
```

### Product Models (Credit Cards)

```
Product → ProductDetails (1:1) → ProductOffer (1:many) → Feature (many:many)
```

- **Product**: name, slug, category, bankId, network, cardImageUrl, applyUrl, rating
- **ProductDetails**: annualFee, joiningFee, minIncome, loungeAccess, rewardType
- **ProductOffer**: title, description, rewardRate, rewardCap, category, versioned (isActive + validFrom/To)
- **Feature**: tag system (e.g., "Airport Lounge", "Fuel Surcharge Waiver")

### Blog Model

```
Blog (blogs table)
├── id, slug, title, description, category, tags[]
├── coverImage, content (Markdown), readTime
├── isPublished, isFeatured, publishedAt
```

### Utility Models

- **SearchLog**: tracks user searches for analytics
- **SyncLog**: records data sync operations
- **DataOverride**: manual correction audit trail
- **Admin**: admin user credentials (JWT auth)

### Important Notes

- Prisma model `BanksMaster` maps to DB table `"Bank"` via `@@map("Bank")`
- All code uses `prisma.banksMaster.*` (not `prisma.bank`)
- `prisma migrate dev` is broken (shadow DB issue) — use raw SQL for schema changes, keep schema.prisma in sync manually
- City values in Branch table are UPPERCASE — always use `mode: 'insensitive'` for matching

---

## IFSC Code System

### What is IFSC?

11-character code assigned by RBI to every bank branch: `SBIN0020244`
- First 4 chars = bank code (SBIN = SBI, HDFC = HDFC Bank)
- 5th char = always `0`
- Last 6 chars = branch code (unique per branch)

### Data Source

We use the **Razorpay IFSC dataset** (open source, updated monthly):
- GitHub: `razorpay/ifsc` — releases tagged by quarter
- Contains all 178k+ branches with IFSC, MICR, branch name, address, city, state, payment flags

### Sync Pipeline (`scripts/sync_ifsc.py`)

Runs periodically to keep data fresh:

```
1. FETCH      → Download latest Razorpay release JSON
2. NORMALIZE  → Clean field names, fix encoding, standardize city/state
3. DEDUPLICATE → Fuzzy match (95%+) to catch "Karimnagar" vs "Karim Nagar"
4. CLASSIFY   → Tag bank type (PSU, Private, Foreign, Cooperative, etc.)
5. DETECT MERGERS → Flag banks with zero recent branches
6. SAFETY CHECK → Alert if >10% data changes (prevents bad sync)
7. UPSERT     → Insert new branches, update changed ones
8. REBUILD    → Recalculate BankStatePresence counts
9. VERIFY     → Check FK integrity, log results to SyncLog
```

### Cascade Filtering (How Users Find IFSC)

The main UX flow: **Bank → State → City → Branch → IFSC**

Each step narrows down using pre-computed data:
1. User picks a bank (from 1,350+ banks with logos)
2. API returns states where that bank has branches (via BankStatePresence)
3. User picks a state → API returns cities in that state for that bank
4. User picks a city → API returns all branches
5. User clicks a branch → sees full IFSC details (address, payment support, map)

---

## Caching Architecture

Three tiers for hot endpoints (`/api/banks`, `/api/states`):

```
Request → In-Memory Map (microseconds)
        → Upstash Redis (milliseconds)  
        → Neon PostgreSQL (seconds on cold)
```

- `memGet(key)` / `memSet(key, data, ttl)` — process-level cache
- `cacheGet(key)` / `cacheSet(key, data, ttl)` — Redis
- Cache warm-up runs on server boot (pre-fetches states & banks)
- After data changes: `node -e "require('@upstash/redis').Redis({url,token}).flushdb()"`

---

## Frontend Routes

### Public Pages

| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Hero, explore cards, calculators grid |
| `/ifsc-finder` | IFSCFinderPage | Cascade filter: Bank → State → City → Branch |
| `/ifsc/:ifsc` | IFSCDetailPage | Full branch details for an IFSC code |
| `/bank/:bank` | BankPage | Bank profile + state list |
| `/state/:bank/:state` | StatePage | Cities for a bank in a state |
| `/city/:bank/:state/:city` | CityPage | Branches in a city |
| `/credit-cards` | CreditCards | Card listing with filters |
| `/credit-cards/:slug` | CreditCardDetail | Card details, offers, features |
| `/money-guides` | BlogListingPage | Blog listing with category tabs + search |
| `/money-guides/:slug` | BlogDetailPage | Full article with Markdown, TOC sidebar |
| `/calculators` | CalculatorsIndexPage | Calculator directory |
| `/calculators/*` | Various | 20+ calculator pages (EMI, SIP, FD, Tax, etc.) |
| `/about` | AboutPage | About Rupeepedia |

### Admin Pages

| Route | Page |
|---|---|
| `/admin/login` | Admin login (JWT) |
| `/admin/dashboard` | Dashboard with stats |
| `/admin/credit-cards` | Manage credit cards |
| `/admin/credit-cards/new` | Add new card |
| `/admin/credit-cards/:slug` | View card details |
| `/admin/credit-cards/:slug/edit` | Edit card |

---

## API Endpoints

### IFSC & Bank Data

| Method | Path | Description |
|---|---|---|
| GET | `/api/states` | All states (cached) |
| GET | `/api/banks` | All active banks (cached) |
| GET | `/api/banks/:slug` | Bank profile by slug |
| GET | `/api/banks/:slug/states` | States where bank operates |
| GET | `/api/states/:slug/banks` | Banks in a state |
| GET | `/api/search?q=...` | Global IFSC/branch search |
| GET | `/api/ifsc/:code` | Branch details by IFSC |
| GET | `/api/city/:bank/:state/:city` | Branches in a city (paginated) |

### Products (Credit Cards)

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products with filters |
| GET | `/api/products/:slug` | Product details with offers |

### Blog

| Method | Path | Description |
|---|---|---|
| GET | `/api/blogs` | Paginated list (category, search filters) |
| GET | `/api/blogs/:slug` | Full blog + related articles |
| GET | `/api/blogs/categories` | Category counts |
| GET | `/api/blogs/featured` | Featured blogs for homepage |

### Admin (JWT protected)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login → JWT token |
| GET | `/api/admin/dashboard` | Stats overview |
| GET/POST | `/api/admin/products` | List / create products |
| PUT/DELETE | `/api/admin/products/:id` | Update / delete product |
| POST | `/api/admin/products/:id/offers` | Add offer to product |
| PUT/DELETE | `/api/admin/offers/:id` | Update / delete offer |

---

## Running Locally

```bash
# Both backend (3001) + frontend (3000)
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Prisma
cd backend && npx prisma generate     # After schema change
cd backend && npx prisma validate     # Check schema syntax
```

---

## Known Issues & Quirks

1. **prisma migrate dev broken** — Shadow DB issue with `20260329_consolidate_bank_tables` migration. Use raw SQL for changes.
2. **District data quality** — Duplicates/misspellings: "Karimnagar" vs "Karim Nagar", Visakhapatnam variants, etc.
3. **State mapping errors** — Some Telangana districts reference stateId=8 (old Andhra Pradesh) instead of stateId=2.
4. **718 banks missing logos** — Only 634 of 1,352 banks have logo images.
5. **Branch city is UPPERCASE** — Always use case-insensitive matching.

---

## Data Numbers (April 2026)

| Entity | Count |
|---|---|
| Banks | 1,352 (634 with logos) |
| Branches (IFSC codes) | 178,785 |
| States/UTs | 43 |
| Cities | 12,030 |
| Districts | ~700 |
| Credit Card Products | ~50 |
| Blog Articles | 7 (growing daily via AI) |
| Calculator Tools | 20+ |
