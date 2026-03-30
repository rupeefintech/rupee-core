# Rupee - rupeepedia.in

IFSC code lookup platform. Bank → State → City → Branch cascade filtering with 178k+ branches.

## Tech Stack

- **Frontend:** React 18 + Vite + TailwindCSS + TanStack Query + React Router 6
- **Backend:** Express.js + TypeScript + Prisma 5 + Redis cache
- **Database:** PostgreSQL (Neon)
- **Deploy:** Railway

## Project Structure

```
backend/
  src/index.ts          # Express app entry
  src/routes/api.ts     # All API endpoints
  src/lib/prisma.ts     # Prisma client singleton
  src/lib/cache.ts      # Redis cache helpers
  prisma/schema.prisma  # Database schema (source of truth)
frontend/
  src/App.tsx           # Router + layout
  src/pages/            # Route pages
  src/components/       # Shared components
scripts/
  sync_ifsc.py          # Razorpay IFSC data sync
```

## Key Facts

- Prisma model `BanksMaster` maps to DB table `"Bank"` via `@@map("Bank")`
- All API code uses `prisma.banksMaster.*` (not `prisma.bank`)
- Branch.bank relation returns BanksMaster data
- Branch has both `city` (string) and `cityId`/`cityRef` (FK to City table)
- 1,352 banks, 178,785 branches, 43 states, 12,030 cities

## Rules

See `.claude/rules/` for detailed guidelines on architecture, backend, frontend, database, data sync, and SEO.

## Running Locally

```bash
# Root
npm run dev  # Starts both backend (3001) and frontend (5173)

# Backend only
cd backend && npm run dev

# Prisma
cd backend && npx prisma validate   # Check schema
cd backend && npx prisma generate   # Regenerate client after schema change
cd backend && npx prisma migrate dev --name <name>  # New migration
```
