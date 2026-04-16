# Database Rules

## Schema Source of Truth

`backend/prisma/schema.prisma` — always modify schema here, never raw SQL for structure changes.

**NOTE:** `prisma migrate dev` is currently broken (shadow DB issue with `20260329_consolidate_bank_tables`). Apply indexes and column additions via raw SQL (`prisma.$executeRawUnsafe()`) and keep schema.prisma in sync manually.

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
| Blog | `"blogs"` | `prisma.blog` |
| Product | default | `prisma.product` |
| ProductDetails | default | `prisma.productDetails` |
| ProductOffer | default | `prisma.productOffer` |
| Feature | default | `prisma.feature` |
| ProductFeatureMapping | default | `prisma.productFeatureMapping` |
| Admin | default | `prisma.admin` |
| State, District, Branch, City | Default PascalCase | `prisma.state`, etc. |

## BanksMaster Field Usage

| Prisma Field | DB Column | Purpose | Used In Code? |
|---|---|---|---|
| `name` | `name` | Official bank name (unique) | Yes — display, search |
| `shortName` | `short_name` | Short display name (legacy) | Deprecated — use `slug` |
| `slug` | `slug` | URL-friendly name (e.g., `hdfc-bank`) | **Yes — all bank lookups** |
| `bankCode` | `bank_code` | 4-char IFSC prefix (e.g., HDFC) | Yes — display, lookup |
| `bankType` | `bank_type` | Public/Private/Cooperative/RRB/etc. | Yes — filtering, display |
| `logoUrl` | `logo_url` | Bank logo path | Yes — UI display |
| `isActive` | `is_active` | Whether bank is operational | Yes — filter in `/api/banks` |
| `mergedIntoId` | `merged_into_id` | FK to bank it merged into | Yes — admin merge |

## Blog Model

```
Blog (@@map "blogs")
├── id (autoincrement PK)
├── slug (unique, varchar 200)
├── title (varchar 300)
├── description (text — SEO meta)
├── category (varchar 50 — Tax, Banking, Investment, Credit Cards, Loans)
├── tags (string array)
├── coverImage (text, nullable — Unsplash URL)
├── content (text — Markdown with custom HTML)
├── readTime (varchar 20, nullable)
├── isPublished (boolean, default true)
├── isFeatured (boolean, default false)
├── publishedAt, createdAt, updatedAt
├── INDEX on category
├── INDEX on (isPublished, publishedAt)
```

## Product Models

```
Product
├── id, name, slug (unique), category (credit_card/loan/savings_account)
├── bankId → BanksMaster (FK)
├── network (Visa/Mastercard/RuPay), cardImageUrl, applyUrl
├── isFeatured, isPopular, isActive, rating, totalRatings

ProductDetails (1:1 with Product)
├── annualFee, joiningFee, minIncome, eligibility
├── loungeAccess, rewardType

ProductOffer (1:many, versioned)
├── title, description, rewardType, rewardRate, rewardCap
├── category (shopping/travel/fuel), version, isActive
├── validFrom, validTo, source (manual/scraper), sourceUrl

Feature (many:many via ProductFeatureMapping)
├── name, slug
├── e.g., "Airport Lounge", "Fuel Surcharge Waiver"
```

## Admin Model

```
Admin
├── id, email (unique), password (bcrypt hash)
├── createdAt, updatedAt
```

## Important Data Patterns

### Bank slug lookup (NOT shortName)
```ts
// CORRECT — slug is consistent, URL-friendly:
prisma.banksMaster.findFirst({ where: { slug: bankSlug } })
```

### City matching (case-insensitive required)
City values in Branch table are stored UPPERCASE (e.g., "HYDERABAD"):
```ts
// CORRECT:
prisma.branch.findMany({ where: { city: { equals: cityName, mode: 'insensitive' } } })
```

## Logo File Naming

- **Bank logos:** `frontend/public/images/banks/` — `Title_Case` with underscores: `Hdfc_Bank.webp`
- **State logos:** `frontend/public/images/states/` — `lowercase-dashes`: `andhra-pradesh.webp`
- DB `logo_url` stores full path from root: `/images/banks/Hdfc_Bank.webp`
- 634 of 1,352 banks have logos; 718 have `logo_url = NULL`

## Indexes

### Core
- `Bank.is_active` — `Bank_is_active_idx`
- `Bank.name` — unique
- `Bank.slug` — unique
- `Branch.ifsc` — unique
- `District(name, stateId)` — composite unique
- `City(name, stateId)` — composite unique

### Blog
- `blogs.category` — index
- `blogs(is_published, published_at)` — composite index

### Product
- `Product.slug` — unique
- `ProductFeatureMapping(productId, featureId)` — composite unique

## Raw SQL: Use DB Column Names

In `prisma.$executeRaw` and `prisma.$queryRaw`, use **snake_case DB column names** and **DB table names**:
```sql
SELECT * FROM "Bank" WHERE is_active = true
SELECT * FROM "blogs" WHERE is_published = true
```

## After Schema Changes

```bash
cd backend
npx prisma validate          # Check syntax
npx prisma format            # Auto-format
npx prisma generate          # Regenerate client
# For migrations: use raw SQL via prisma.$executeRawUnsafe() (migrate dev is broken)
```

## Known Data Quality Issues

- **District name duplicates:** Multiple spellings (Karimnagar/"Karim Nagar", Rangareddy variants, Visakhapatnam variants)
- **Cross-state districts:** Some districts have stateId=8 (AP) that should be stateId=2 (Telangana)
- **State table:** 43 entries (some pre-cleanup), 36 valid states/UTs

## Data Integrity Rules

- Branch.bankId must reference a valid BanksMaster row
- Branch.cityId must reference a valid City row (or be NULL)
- City unique on (name, stateId)
- BankStatePresence unique on (bankId, stateId) — rebuild after every sync
- BanksMaster.slug unique — uses `name-slugified` pattern
- Blog.slug unique
- Product.slug unique
- Product.bankId references BanksMaster
