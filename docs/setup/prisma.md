# Prisma Setup

## Config

```
backend/prisma/schema.prisma   # source of truth
backend/prisma/migrations/     # migration history
```

Datasource uses two URLs (required for Neon serverless):
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")    // pooled — used at runtime
  directUrl = env("DIRECT_URL")      // direct — used for migrations
}
```

## Model → Table Map

| Prisma Model | DB Table | Notes |
|---|---|---|
| `BanksMaster` | `Bank` | `@@map("Bank")` — always use `prisma.banksMaster.*` |
| `Branch` | `Branch` | |
| `State` | `State` | |
| `District` | `District` | |
| `City` | `City` | |
| `BankStatePresence` | `bank_state_presence` | |
| `DataOverride` | `data_overrides` | |
| `SearchLog` | `search_logs` | |
| `SyncLog` | `sync_log` | |
| `Product` | `Product` | |
| `ProductDetails` | `ProductDetails` | |
| `ProductOffer` | `ProductOffer` | |
| `Feature` | `Feature` | |
| `ProductFeatureMapping` | `ProductFeatureMapping` | |
| `Admin` | `admins` | |
| `Blog` | `blogs` | |

## Common Commands

```bash
cd backend

# After any schema.prisma change — regenerate client
npx prisma generate

# Validate schema syntax
npx prisma validate

# Browse data in browser GUI
npx prisma studio

# Check current DB state vs schema
npx prisma db pull       # pull DB → schema (overrides local)
npx prisma db push       # push schema → DB (no migration file, dev only)
```

## Migration Note — READ BEFORE CHANGING SCHEMA

`prisma migrate dev` is broken for this project due to shadow database issues with Neon's `20260329_consolidate_bank_tables` migration. **Do not run it.**

For schema changes:
1. Write the SQL change manually
2. Apply via `prisma.$executeRawUnsafe()` in a one-off script or Prisma Studio
3. Update `schema.prisma` to match
4. Run `npx prisma generate` to regenerate the client

## Key Gotchas

**`BanksMaster` vs `Bank`**
The Prisma model is named `BanksMaster` but maps to the `Bank` table. In all API code use:
```ts
prisma.banksMaster.findMany(...)   // correct
prisma.bank.findMany(...)          // does NOT exist
```

**Relation fields**
`Branch` has two city fields:
- `city` — raw string, UPPERCASE, from Razorpay sync
- `cityId` / `cityRef` — FK to the `City` table (newer, not always populated)

Always use `mode: 'insensitive'` when filtering on `city`:
```ts
where: { city: { equals: input, mode: 'insensitive' } }
```

**`Product.category` values**
| Value | Meaning |
|---|---|
| `credit_card` | Credit cards |
| `loan` | Loans |
| `savings_account` | Bank accounts |

## Prisma Client Singleton

```ts
// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

`ensureDbReady()` is also exported — called on server boot to wake the Neon serverless DB before the first request.
