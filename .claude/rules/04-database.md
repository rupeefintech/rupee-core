# Database Rules

## Schema Source of Truth

`backend/prisma/schema.prisma` - always modify schema here, never raw SQL.

## Naming Conventions

- Prisma models: PascalCase (`BanksMaster`, `BankStatePresence`)
- Prisma fields: camelCase (`shortName`, `bankType`, `isActive`)
- DB columns: snake_case via `@map("short_name")`
- DB tables: Prisma default (model name) unless `@@map()` used

## Critical Mappings

| Prisma Model | DB Table | Prisma Accessor |
|---|---|---|
| BanksMaster | `"Bank"` | `prisma.banksMaster` |
| BankStatePresence | `"bank_state_presence"` | `prisma.bankStatePresence` |
| DataOverride | `"data_overrides"` | `prisma.dataOverride` |
| SearchLog | `"search_logs"` | `prisma.searchLog` |
| SyncLog | `"sync_log"` | `prisma.syncLog` |
| State, District, Branch, City | Default PascalCase | `prisma.state`, etc. |

## BanksMaster Field Usage

| Prisma Field | DB Column | Purpose | Used In Code? |
|---|---|---|---|
| `name` | `name` | Official bank name (unique) | Yes - display, search |
| `shortName` | `short_name` | Short display name, used as URL slug in v1 routes | Yes - bank lookup by slug |
| `bankCode` | `bank_code` | 4-char code (e.g., HDFC, ICIC) | Yes - display |
| `bankType` | `bank_type` | Public/Private/Cooperative/RRB/etc. | Yes - filtering, display |
| `logoUrl` | `logo_url` | Bank logo CDN URL | Yes - UI display |
| `ifscPrefix` | `ifsc_prefix` | First 4 chars of IFSC (same as bankCode) | No - DB reference only |
| `normalizedName` | `normalized_name` | `LOWER(name)` for dedup | No - DB indexing/dedup only |
| `slug` | `slug` | URL-friendly name with id suffix | No - not used yet, shortName serves as slug |
| `isActive` | `is_active` | Whether bank is operational | Yes - filter in all queries |
| `mergedIntoId` | `merged_into_id` | FK to bank it merged into | Yes - admin merge endpoint |
| `isCurated` | `is_curated` | Human-verified flag | No - future use |
| `subType` | `sub_type` | Sub-classification | No - future use |
| `sourceRbi` | `source_rbi` | Data sourced from RBI | No - audit only |
| `sourceRazorpay` | `source_razorpay` | Data sourced from Razorpay | No - audit only |

**Fields not used in code** (`ifscPrefix`, `normalizedName`, `slug`, `isCurated`, `subType`, `sourceRbi`, `sourceRazorpay`) exist for data management and future features. Don't query them in API responses.

## Raw SQL: Use DB Column Names

In `prisma.$executeRaw` and `prisma.$queryRaw`, use **snake_case DB column names** and **DB table names**:
```sql
-- Correct (DB names):
SELECT * FROM "Bank" WHERE is_active = true
INSERT INTO "bank_state_presence" (bank_id, state_id, ...) ...

-- Wrong (Prisma names):
SELECT * FROM "BanksMaster" WHERE isActive = true
```

## After Schema Changes

```bash
cd backend
npx prisma validate          # Check syntax
npx prisma format            # Auto-format
npx prisma migrate dev --name <descriptive_name>  # Generate + apply migration
npx prisma generate          # Regenerate client
```

## Data Integrity Rules

- Branch.bankId must reference a valid BanksMaster row
- Branch.cityId must reference a valid City row (or be NULL)
- City unique on (name, stateId)
- BankStatePresence unique on (bankId, stateId) - rebuild after every sync
- BanksMaster.slug unique - uses `name-slugified-{id}` pattern

## State Table Quirks

- 43 rows but some are duplicates/misspellings (e.g., "Madhy Pradesh", "Uttarkhand", "Odhisa")
- Some are districts incorrectly entered as states ("Ludhiana", "Dakshin Kannad")
- Fix: re-point all references (Branch, District, City, BankStatePresence) to correct state, then delete bad rows
- 7 states have `code: NULL` - these are the bad entries
