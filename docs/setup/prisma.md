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

| Prisma Model | DB Table | Prisma Accessor |
|---|---|---|
| `BanksMaster` | `"Bank"` | `prisma.banksMaster` |
| `Branch` | `Branch` | `prisma.branch` |
| `State` | `State` | `prisma.state` |
| `District` | `District` | `prisma.district` |
| `City` | `City` | `prisma.city` |
| `BankStatePresence` | `bank_state_presence` | `prisma.bankStatePresence` |
| `DataOverride` | `data_overrides` | `prisma.dataOverride` |
| `SearchLog` | `search_logs` | `prisma.searchLog` |
| `SyncLog` | `sync_log` | `prisma.syncLog` |
| `Product` | `Product` | `prisma.product` |
| `ProductDetails` | `ProductDetails` | `prisma.productDetails` |
| `ProductOffer` | `ProductOffer` | `prisma.productOffer` |
| `Feature` | `Feature` | `prisma.feature` |
| `ProductFeatureMapping` | `ProductFeatureMapping` | `prisma.productFeatureMapping` |
| `Admin` | `admins` | `prisma.admin` |
| `User` | `users` | `prisma.user` |
| `ContactMessage` | `contact_messages` | `prisma.contactMessage` |
| `RateEntry` | `rate_entries` | `prisma.rateEntry` |
| `PostOffice` | `post_offices` | `prisma.postOffice` |
| `Blog` | `blogs` | `prisma.blog` |

## Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| Prisma models | PascalCase | `BanksMaster`, `BankStatePresence` |
| Prisma fields | camelCase | `shortName`, `bankType`, `isActive` |
| DB columns | snake_case via `@map("short_name")` | `short_name`, `is_active` |
| DB tables | Prisma default unless `@@map()` specified | `"Bank"`, `bank_state_presence` |

## Common Commands

```bash
cd backend

# After any schema.prisma change — always run this
npx prisma generate

# Validate schema syntax
npx prisma validate

# Auto-format schema file
npx prisma format

# Browse data in browser GUI
npx prisma studio

# Pull DB state into schema (overwrites local — use with care)
npx prisma db pull

# Push schema to DB without migration file (dev only)
npx prisma db push
```

## Migration Warning — READ BEFORE CHANGING SCHEMA

`prisma migrate dev` is **broken** for this project due to shadow database issues with Neon and the `20260329_consolidate_bank_tables` migration. Do not run it.

**For schema changes:**
1. Add the model to `schema.prisma`
2. Run `npx prisma generate` to regenerate the client
3. Add the CREATE TABLE SQL to `backend/scripts/create-tables.ts`
4. Run the script to create the table in Neon:
   ```bash
   npx ts-node --project tsconfig.scripts.json scripts/create-tables.ts
   ```

**`create-tables.ts`** is idempotent (`IF NOT EXISTS`) — safe to re-run at any time. Contains SQL for:
- `contact_messages`
- `users`

Add new tables to this file; do not create separate migration files.

**Running scripts in general** — use `tsconfig.scripts.json` (not the main tsconfig which restricts `rootDir` to `src/`):
```bash
npx ts-node --project tsconfig.scripts.json scripts/<name>.ts
```

## Critical Gotchas

### `BanksMaster` accessor
The Prisma model is named `BanksMaster` but maps to the `Bank` table:
```ts
prisma.banksMaster.findMany(...)   // CORRECT
prisma.bank.findMany(...)          // DOES NOT EXIST — will throw
```

### Two city fields on Branch
- `Branch.city` — raw UPPERCASE string from Razorpay sync
- `Branch.cityId` / `Branch.cityRef` — FK to `City` table (newer, not always populated)

Always use `mode: 'insensitive'` on the `city` string field:
```ts
where: { city: { equals: input, mode: 'insensitive' } }
```

### `Product.category` values
| Value | Meaning |
|---|---|
| `credit_card` | Credit cards |
| `loan` | Loans |
| `savings_account` | Bank accounts |

### Raw SQL column names
In `$executeRaw` / `$queryRaw`, use DB snake_case names, not Prisma camelCase:
```sql
-- CORRECT:
SELECT * FROM "Bank" WHERE is_active = true AND short_name = 'HDFC'

-- WRONG:
SELECT * FROM "BanksMaster" WHERE isActive = true AND shortName = 'HDFC'
```

## Prisma Client Singleton

`backend/src/lib/prisma.ts` — prevents multiple client instances in dev (hot reload):
```ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

`ensureDbReady()` is also exported — called on server boot to wake the Neon serverless DB before the first request hits.
