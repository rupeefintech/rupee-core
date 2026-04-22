# Backend Setup

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
    migrations/       # Migration history (WARNING: migrate dev broken — see note)
```

## Key Rules

- Prisma model `BanksMaster` maps to DB table `"Bank"` via `@@map("Bank")` — always use `prisma.banksMaster.*`
- City values in `Branch` are UPPERCASE in DB — always query with `mode: 'insensitive'`
- Bank lookup by URL uses `slug` field, NOT `shortName`

## Caching Architecture

Three-tier for hot endpoints (`/api/banks`, `/api/states`):

1. **In-memory Map** (microseconds) — `memGet(key)` / `memSet(key, data, ttl)`
2. **Upstash Redis** (milliseconds) — `cacheGet(key)` / `cacheSet(key, data, ttl)`
3. **Neon PostgreSQL** (seconds on cold start)

Cache warm-up runs on server boot (calls `/api/states` and `/api/banks` via localhost).

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

## Migration Note

`prisma migrate dev` is broken due to shadow database issues with Neon. For schema changes:
1. Apply via raw SQL using `prisma.$executeRawUnsafe()`
2. Keep `schema.prisma` in sync manually
3. Do NOT run `prisma migrate dev` in production

## Deployment (Render)

- **Platform:** Render
- **Service:** `rupeepedia-backend` (web service)
- **URL:** `https://rupeepedia-backend.onrender.com`
- **Build command:** `cd backend && npm ci && npx prisma generate && npm run build`
- **Start command:** `cd backend && npm start`
- **Health check:** `GET /health`
- **Trigger:** auto-deploys on push to `main` via `render.yaml`

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
