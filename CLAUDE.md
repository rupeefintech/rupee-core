# Rupee - rupeepedia.in

IFSC code lookup platform. Bank → State → City → Branch cascade filtering with 178k+ branches.

## Tech Stack

- **Frontend:** React 18 + Vite + TailwindCSS + TanStack Query + React Router 6 + Framer Motion + Helmet
- **Backend:** Express.js + TypeScript + Prisma 5 + Redis (Upstash) + in-memory cache
- **Database:** PostgreSQL (Neon)
- **Deploy:** Railway

## Project Structure

```
backend/
  src/index.ts          # Express app entry (sitemaps, cache warm-up)
  src/routes/api.ts     # All API endpoints + in-memory cache layer
  src/lib/prisma.ts     # Prisma client singleton
  src/lib/cache.ts      # Upstash Redis cache helpers
  prisma/schema.prisma  # Database schema (source of truth)
frontend/
  src/App.tsx           # Router + layout
  src/pages/            # Route pages
  src/components/       # Shared components
  src/utils/api.ts      # API client (axios) with typed methods
  src/utils/seo.ts      # SEO title/description generator
  src/styles/globals.css # Tailwind + custom classes (card, hero-bg, ifsc-mono)
  public/images/        # Static assets (bank logos, state images)
    banks/              # 634 bank logos (WebP, Title_Case filenames like Hdfc_Bank.webp)
    states/             # 35 state images (lowercase-dashed like andhra-pradesh.webp)
scripts/
  sync_ifsc.py          # Razorpay IFSC data sync
```

## Key Facts

- Prisma model `BanksMaster` maps to DB table `"Bank"` via `@@map("Bank")`
- All API code uses `prisma.banksMaster.*` (not `prisma.bank`)
- Branch.bank relation returns BanksMaster data
- Branch has both `city` (string, UPPERCASE in DB) and `cityId`/`cityRef` (FK to City table)
- 1,352 banks (634 with logos), 178,785 branches, 43 states, 12,030 cities
- Bank lookup by URL uses `slug` field (e.g., `hdfc-bank`), NOT `shortName`
- City values in Branch table are UPPERCASE (e.g., "HYDERABAD") — always use `mode: 'insensitive'` for matching
- Bank logo files use `Title_Case` with underscores (e.g., `Hdfc_Bank.webp`), DB `logo_url` stores full path
- State logo files use `lowercase-dashes` (e.g., `andhra-pradesh.webp`)

## Caching Architecture

Three-tier cache for hot endpoints (`/api/banks`, `/api/states`):
1. **In-memory Map** (microseconds) — `memGet(key)` / `memSet(key, data, ttl)`
2. **Upstash Redis** (milliseconds) — `cacheGet(key)` / `cacheSet(key, data, ttl)`
3. **Neon PostgreSQL** (seconds on cold start)

Cache warm-up runs on server boot (calls `/api/states` and `/api/banks` via localhost).

After any data changes, flush Redis: `node -e "require('@upstash/redis').Redis({url,token}).flushdb()"`

## Known Data Quality Issues

- District names have duplicates/misspellings: Karimnagar vs "Karim Nagar", Rangareddy vs "Ranga Reddy" vs "Rangareddi", Visakhapatnam variants, Peddapalli/Peddapalle/Peddapally, Mahabubabad vs Mahbubnagar
- Some districts reference stateId=8 (Andhra Pradesh pre-split) instead of stateId=2 (Telangana)
- 718 banks have no logo file — need logo images sourced for them

## Rules

See `docs/setup/` for backend, frontend, database, prisma, SEO, and data-sync guidelines.
See `docs/modules/` for per-feature docs (IFSC finder, credit cards, blogs, calculators, admin).
See `docs/architecture.md` for system overview and data model.

## Running Locally

```bash
# Root (starts both backend:3001 and frontend:3000)
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Prisma
cd backend && npx prisma validate   # Check schema
cd backend && npx prisma generate   # Regenerate client after schema change
cd backend && npx prisma migrate dev --name <name>  # New migration (broken — shadow DB issue, use raw SQL for now)
```

## Migration Note

`prisma migrate dev` fails due to shadow database issues with the `20260329_consolidate_bank_tables` migration. For schema changes, apply indexes and column additions via raw SQL (`prisma.$executeRawUnsafe()`) and keep the schema.prisma in sync manually.
