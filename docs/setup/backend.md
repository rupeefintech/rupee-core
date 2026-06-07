# Backend Setup

## Architecture Overview

Rupeepedia has four pillars:
1. **IFSC Lookup** — 178k+ branches, cascade filtering (Bank → State → City → Branch)
2. **Products** — Credit card comparison with admin management (loans/accounts: stubs)
3. **Calculators** — 20+ financial calculators (client-side only, no backend)
4. **Money Guides** — AI-generated daily blog articles

Data model at a glance:
```
BanksMaster (@@map "Bank")  ──< Branch >──  State
     │                          │   │          │
     │                          │   └── District
     └── BankStatePresence      └── City

Product ──< ProductOffer
  │   └── ProductDetails (1:1)
  └──< ProductFeatureMapping >── Feature

Blog (standalone)
Admin (standalone — JWT auth)
SearchLog, SyncLog, DataOverride (utility)
```

Hybrid data model:
- **Static/curated** — BanksMaster fields (name, type, logo) — human-verified, rarely changes
- **Dynamic/synced** — Branch data — synced from Razorpay, high-volume updates
- **AI-generated** — Blog content — generated daily via Claude API, stored in PostgreSQL

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Runtime | Node.js | 18+ |
| Framework | Express.js | 4 |
| Language | TypeScript | 5 |
| ORM | Prisma | 5 |
| Database | PostgreSQL (Neon serverless) | — |
| Cache L1 | In-memory Map | — |
| Cache L2 | Upstash Redis | — |
| Auth | JWT (jsonwebtoken) | — |
| Password | bcryptjs | — |

## File Structure

```
backend/
  src/
    index.ts          # Express app entry — CORS, rate limit, sitemap routes, cache warm-up
    routes/
      api.ts          # All public API endpoints + in-memory cache layer
      authRoutes.ts   # POST /api/auth/login, /api/auth/me
      adminRoutes.ts  # Admin CRUD under /api/admin/*
    lib/
      prisma.ts       # Prisma client singleton + ensureDbReady()
      cache.ts        # Upstash Redis helpers: cacheGet / cacheSet
  prisma/
    schema.prisma     # Source of truth for DB schema
    migrations/       # Migration history (WARNING: migrate dev broken — see prisma.md)
  scripts/
    generate-blog.ts      # AI blog generator (Claude + Unsplash)
    blog-topics.ts        # 60 blog topics queue
    seed-blogs.ts         # Seeds pre-written blog content
    seed-credit-cards.ts  # Seeds credit card products
    create-blog-table.ts  # Creates blogs table via raw SQL
```

## API Patterns

All public routes in `backend/src/routes/api.ts`. Admin routes in `adminRoutes.ts`. Auth routes in `authRoutes.ts`. Express router mounted at `/api`.

**Response format:**
```json
{ "data": {...}, "count": 123 }
```
Errors: `{ "error": "message" }` with appropriate HTTP status.

## All API Endpoints

### IFSC / Cascade
```
GET /api/banks                                    → all active banks (cached)
GET /api/states                                   → all states (cached)
GET /api/banks/:bankSlug/states                   → states where bank operates (branchCount)
GET /api/bank/:bankSlug/cities/:stateSlug         → cities for bank+state
GET /api/city/:bankSlug/:stateSlug/:citySlug      → branches for bank+state+city (paginated)
GET /api/ifsc/:ifsc                               → full branch detail
GET /api/ifsc/:ifsc/nearby                        → nearby branches (same bank + city)
GET /api/search?q=                                → search IFSC / branch name / city
GET /api/districts?state_id=&bank_id=             → districts for state/bank combo
GET /api/branches?bank_id=&state_id=&district_id= → branch list for cascade filter
GET /api/bank/:slug                               → SEO bank page — all branches
GET /api/state/:slug                              → SEO state page — all branches
GET /api/city/:slug                               → SEO city page — all branches
GET /api/stats                                    → DB stats (total branches, banks, states)
GET /api/pincode/:pincode                         → all branches in a pincode
GET /api/states/:slug/banks                       → banks operating in a state
```

### Products
```
GET /api/products?limit=&search=&bank=&annualFeeMax=&sortBy=  → product list (filtered)
GET /api/products/:slug                                        → product detail + offers + features
GET /api/credit-cards/stats                                    → totalCards, totalBanks, avgRating, freeCards
GET /api/credit-cards/categories                               → offer categories with card counts
GET /api/credit-cards/banks                                    → banks with cards + card counts
GET /api/credit-cards/featured                                 → featured cards only
```

### Blogs
```
GET /api/blogs?page=1&limit=12&category=&search=  → paginated list
GET /api/blogs/categories                          → category counts
GET /api/blogs/featured                            → featured blogs (max 5)
GET /api/blogs/:slug                               → full blog + related articles
```
**IMPORTANT:** `/categories` and `/featured` must be registered BEFORE `/:slug` to avoid slug matching them.

### SWIFT Code Lookup
```
GET /api/swift/search?q=HDFC&limit=20  → search by bank name or SWIFT prefix (case-insensitive)
GET /api/swift/:code                   → exact SWIFT/BIC lookup (8–11 chars); 24h Redis cache
```
**Note:** `/swift/search` registered BEFORE `/:code` — prevent "search" matching as code param.

### Exchange Rates
```
GET /api/exchange-rates  → live INR rates for USD/EUR/GBP/AED/AUD/CAD/SGD/JPY/CHF/HKD/SAR/CNY/QAR/MYR/THB
                           via Yahoo Finance; 15 min Redis + 10 min in-memory cache
                           returns: { base: 'INR', rates: { USD: 84.23, ... }, updated_at, disclaimer }
```

### Public — Contact Form
```
POST /api/contact  → submit contact form (name, email, subject, message)
                     validates all fields; stores in contact_messages + upserts into users
                     returns: { success: true, message: "..." }
```

### Public — Financial Rates
```
GET /api/rates?type=fd|savings|loan_personal|loan_home|loan_auto
                   → active rate entries grouped by bank, sorted by best rate desc
                     1h Redis cache (key: rates:{type}); 30min in-memory
                     returns: { type, banks: [{ bank, tenures, bestRate, lastVerified }], count }
```

### Admin (JWT protected — `Authorization: Bearer <token>`)
```
POST   /api/auth/login                           → admin login → JWT token

# Dashboard
GET    /api/admin/dashboard                      → product, bank, offer counts

# Credit Cards / Products
GET    /api/admin/products?page=1&search=        → list products (paginated)
GET    /api/admin/credit-cards/:slug             → full card details with offers & features
POST   /api/admin/products                       → create new product
PUT    /api/admin/products/:id                   → update product + details
DELETE /api/admin/products/:id                   → delete (cascades offers/features)
POST   /api/admin/products/:id/offers            → add new offer
PUT    /api/admin/offers/:id                     → update offer
DELETE /api/admin/offers/:id                     → delete offer
POST   /api/admin/offers/:id/revert              → revert offer to previous version
GET    /api/admin/features                       → feature tag list

# Banks
GET    /api/admin/banks?search=&all=&for_rates=  → bank list for dropdowns (filtered)
GET    /api/admin/banks/manage?page=&search=&type= → paginated full bank list + branch counts
POST   /api/admin/banks                          → create bank (auto-slug if blank)
PUT    /api/admin/banks/:id                      → edit bank; updatedAt auto-updated
DELETE /api/admin/banks/:id                      → soft delete (isActive=false; branches intact)

# Financial Rates (FD / Savings / Loan)
GET    /api/admin/rates?type=fd                  → all rate entries including inactive
POST   /api/admin/rates                          → create rate entry; clears Redis cache
PUT    /api/admin/rates/:id                      → update rate entry; clears Redis cache
DELETE /api/admin/rates/:id                      → soft delete (isActive=false)

# Contact Messages
GET    /api/admin/contacts?page=&unread=         → paginated inbox (unread filter optional)
PATCH  /api/admin/contacts/:id/read              → mark as read
DELETE /api/admin/contacts/:id                   → permanently delete

# Users
POST   /api/admin/users                          → create user manually
GET    /api/admin/users?page=&search=&source=    → paginated user list
PATCH  /api/admin/users/:id                      → update name / source / notes / isActive
DELETE /api/admin/users/:id                      → permanently delete user record
```

## Critical Rules

### Bank lookup — always use `slug`, never `shortName`
```ts
// CORRECT:
prisma.banksMaster.findFirst({ where: { slug: bankSlug } })

// WRONG — shortName has inconsistent formatting:
prisma.banksMaster.findFirst({ where: { shortName: { equals: bankSlug, mode: 'insensitive' } } })
```

### City matching — always case-insensitive
City values in Branch table are stored UPPERCASE (e.g., "HYDERABAD"):
```ts
// CORRECT:
prisma.branch.findMany({ where: { city: { equals: cityName, mode: 'insensitive' } } })

// WRONG — returns 0 results:
prisma.branch.findMany({ where: { city: cityName.toLowerCase() } })
```

### Prisma model accessor
```ts
prisma.banksMaster.findMany(...)   // CORRECT — model maps to "Bank" table
prisma.bank.findMany(...)          // DOES NOT EXIST
```

### Logo URLs
- Bank logos: `/images/banks/Hdfc_Bank.webp` (Title_Case with underscores)
- State logos: `/images/states/andhra-pradesh.webp` (lowercase-dashes)
- Served from `frontend/public/images/` as Vite static assets
- DB stores the full path including `/images/`
- Always return `logoUrl || null` — never return empty string

### API response field mapping
Prisma returns camelCase; API responses map to snake_case for frontend:
```ts
{ branch_name: b.branchName, bank_name: b.bank.name, logo_url: b.bank.logoUrl }
```

## Caching Architecture

Three-tier cache for hot endpoints (`/api/banks`, `/api/states`):
```
Request → In-Memory Map (microseconds)
        → Upstash Redis (milliseconds)
        → Neon PostgreSQL (seconds on cold start)
```

- `memGet(key)` / `memSet(key, data, ttl)` — in-process
- `cacheGet(key)` / `cacheSet(key, data, ttl?)` — Redis via `backend/src/lib/cache.ts`
- Cache warm-up fires on server boot (calls `/api/states` and `/api/banks` via localhost)

TTLs: banks list = long (rarely changes), IFSC lookup = 24h, stats = 30s

To flush Redis after data changes:
```bash
node -e "require('@upstash/redis').Redis({url,token}).flushdb()"
```

## Build Commands

```bash
# Dev server (port 3001, ts-node-dev watch)
npm run dev

# Production build
npm run build        # tsc → outputs to dist/

# Start production server
npm start            # node dist/index.js

# Prisma
npx prisma validate       # Check schema
npx prisma generate       # Regenerate client after schema change
npx prisma studio         # GUI to browse data
```

## Deployment (Render)

- **Platform:** Render
- **Service:** `rupeepedia-backend` (web service)
- **URL:** `https://rupeepedia-backend.onrender.com`
- **Build command:** `cd backend && npm ci && npx prisma generate && npm run build`
- **Start command:** `cd backend && npm start`
- **Health check:** `GET /health`
- **Config:** `render.yaml` at repo root
- **Trigger:** auto-deploys on push to `main`

## Environment Variables (set in Render dashboard)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection (for Prisma migrations) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `JWT_SECRET` | Admin JWT signing secret |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://rupeepedia.in` |
| `CORS_ORIGIN` | `https://rupeepedia.in` |



## Backend Scripts

Run all scripts with:
```bash
npx ts-node --project tsconfig.scripts.json scripts/<name>.ts
```

| Script | Purpose |
|---|---|
| `create-tables.ts` | **Idempotent** — creates `contact_messages` + `users` tables. Run after cloning or schema additions. |
| `fix-bank-types.ts` | Normalises `bank_type` field for all 1,352 banks from subType/name. Run once. |
| `generate-blog.ts` | AI blog generator (Claude + Unsplash) |
| `blog-topics.ts` | 60 blog topics queue |
| `seed-blogs.ts` | Seeds pre-written blog content |
| `seed-credit-cards.ts` | Seeds credit card products |
| `seed-rates.ts` / `seed-rates-all.ts` | Seeds FD/savings rate entries for top banks |
| `create-blog-table.ts` | Legacy — creates blogs table (use create-tables.ts for new tables) |

`tsconfig.scripts.json` — separate tsconfig for scripts outside `src/`. Extends main tsconfig but removes `rootDir` restriction.


## Frontend Compatibility

API responses map camelCase Prisma fields to snake_case for frontend:
```ts
{ branch_name: b.branchName, bank_name: b.bank.name, state_name: b.state.name, logo_url: b.logoUrl }
```