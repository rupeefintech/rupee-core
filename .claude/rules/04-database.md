# Database Rules

## Schema Source of Truth

`backend/prisma/schema.prisma` - always modify schema here, never raw SQL.

## Naming Conventions

- Prisma models: PascalCase (`BanksMaster`, `BankStatePresence`)
- Prisma fields: camelCase (`shortName`, `bankType`)
- DB columns: snake_case via `@map("short_name")`
- DB tables: Prisma default (model name) unless `@@map()` used

## Critical Mappings

| Prisma Model | DB Table | Notes |
|---|---|---|
| BanksMaster | `"Bank"` | `@@map("Bank")` - legacy name |
| BankStatePresence | `"bank_state_presence"` | `@@map()` |
| DataOverride | `"data_overrides"` | `@@map()` |
| SearchLog | `"search_logs"` | `@@map()` |
| SyncLog | `"sync_log"` | `@@map()` |
| State, District, Branch, City | Default PascalCase | No `@@map()` |

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
- City unique on (name, stateId) - no duplicate city names per state
- BankStatePresence unique on (bankId, stateId) - rebuild after sync
- BanksMaster.slug must be unique - use `name-slugified-{id}` pattern to avoid collisions

## State Table Quirks

- 43 rows but some are duplicates/misspellings (e.g., "Madhy Pradesh", "Uttarkhand", "Odhisa")
- Some are districts incorrectly entered as states ("Ludhiana", "Dakshin Kannad")
- Cleanup: re-point all references to correct state, then delete bad rows
- 7 states have `code: NULL` - these are the bad entries
