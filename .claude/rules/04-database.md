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
| `bankCode` | `bank_code` | 4-char IFSC prefix (e.g., HDFC, SBIN). Derived from actual branch IFSC codes. | Yes - display, lookup |
| `bankType` | `bank_type` | Public/Private/Cooperative/RRB/etc. | Yes - filtering, display |
| `logoUrl` | `logo_url` | Bank logo CDN URL | Yes - UI display |
| `slug` | `slug` | URL-friendly name with id suffix | Yes - SEO URLs |
| `isActive` | `is_active` | Whether bank is operational | Yes - filter in all queries |
| `mergedIntoId` | `merged_into_id` | FK to bank it merged into | Yes - admin merge endpoint |
| `isCurated` | `is_curated` | Human-verified flag | No - future use |
| `subType` | `sub_type` | Sub-classification | No - future use |
| `sourceRbi` | `source_rbi` | Data sourced from RBI | No - audit only |
| `sourceRazorpay` | `source_razorpay` | Data sourced from Razorpay | No - audit only |

**Fields not used in code** (`isCurated`, `subType`, `sourceRbi`, `sourceRazorpay`) exist for data management and future features. Don't query them in API responses.

**Dropped fields** (removed as redundant):
- `ifscPrefix` — was identical to `bankCode`
- `normalizedName` — use Prisma `mode: 'insensitive'` instead of a stored column

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
- BanksMaster.bankCode must equal the most common `LEFT(branch.ifsc, 4)` across the bank's branches. Cooperative banks route through sponsor banks (HDFC, ICIC, UTIB) but their IFSC prefix is their own unique code — always derive from actual IFSC data, not metadata.

## State Table

- 36 valid states/UTs, all with non-NULL `code`
- Previously had 7 bad entries (misspellings like "Madhy Pradesh", districts like "Ludhiana") — cleaned up 2026-03-29
- All branches, districts, cities, and presence rows were re-pointed to correct states before deletion
