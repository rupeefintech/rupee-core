# Database Setup

## Provider

**Neon** — serverless PostgreSQL. Two connection strings required:
- `DATABASE_URL` — pooled (used by Prisma at runtime via PgBouncer)
- `DIRECT_URL` — direct (used by Prisma for migrations)

## Tables & Row Counts

| Table | Rows | Purpose |
|---|---|---|
| `Bank` | 1,352 | All banks (Prisma model: `BanksMaster`) |
| `Branch` | 178,785 | All IFSC branches |
| `State` | 43 | Indian states + UTs |
| `District` | ~700 | Districts per state |
| `City` | 12,030 | Cities per state |
| `bank_state_presence` | — | Denormalized bank↔state branch counts |
| `Product` | — | Credit cards, loans, accounts |
| `ProductDetails` | — | Fees, eligibility, reward type per product |
| `ProductOffer` | — | Versioned offers/benefits per product |
| `Feature` | — | Feature tags (e.g. "Lounge Access") |
| `ProductFeatureMapping` | — | Many-to-many: Product ↔ Feature |
| `blogs` | — | Blog posts |
| `admins` | — | Admin user accounts |
| `data_overrides` | — | Manual field corrections audit log |
| `search_logs` | — | IFSC search query log |
| `sync_log` | — | Razorpay data sync history |

## Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| Prisma models | PascalCase | `BanksMaster`, `BankStatePresence` |
| Prisma fields | camelCase | `shortName`, `bankType`, `isActive` |
| DB columns | snake_case via `@map()` | `short_name`, `bank_type`, `is_active` |
| DB tables | Prisma default unless `@@map()` used | `Bank`, `bank_state_presence` |

## IFSC Core Tables

### `Bank` (Prisma: `BanksMaster`)
| Column | Type | Used In Code | Notes |
|---|---|---|---|
| `id` | int PK | Yes | |
| `name` | varchar(100) unique | Yes | Official bank name, display + search |
| `short_name` | varchar(100) | Deprecated | Use `slug` instead |
| `bank_code` | varchar(10) | Yes | 4-char IFSC prefix (e.g. HDFC) |
| `bank_type` | varchar(30) | Yes | Public/Private/Cooperative/RRB/etc. |
| `headquarters` | varchar(100) | Yes | |
| `website` | text | Yes | |
| `logo_url` | text | Yes | Full path e.g. `/images/banks/Hdfc_Bank.webp` |
| `slug` | varchar(120) unique | **Yes — all lookups** | URL-friendly e.g. `hdfc-bank` |
| `is_active` | bool | Yes | Filtered in `/api/banks` |
| `merged_into_id` | int FK | Yes | Admin merge tracking |
| `is_curated` | bool | Yes | Manually verified entry |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

### `Branch`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `ifsc` | varchar(11) unique | e.g. `HDFC0001234` |
| `micr` | varchar(9) | |
| `bank_id` | int FK → Bank | |
| `branch_name` | varchar(200) | |
| `address` | text | |
| `city` | varchar(100) | **UPPERCASE** in DB — always query `mode: 'insensitive'` |
| `district_id` | int FK → District | |
| `state_id` | int FK → State | |
| `pincode` | varchar(6) | |
| `phone` | varchar(50) | |
| `neft` / `rtgs` / `imps` / `upi` | bool | Payment method flags |
| `latitude` / `longitude` | float | Not always populated |
| `swift` | varchar(11) | |
| `city_id` | int FK → City | Newer field, not always populated |
| `is_active` | bool | |
| `last_synced` | timestamp | |

### `State`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name` | varchar(100) unique | |
| `code` | varchar(10) | |
| `logo_url` | text | e.g. `/images/states/andhra-pradesh.webp` |
| `slug` | varchar(120) unique | e.g. `telangana` |
| `iso_code` | varchar(10) | |

### `District`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name` | varchar(100) | |
| `state_id` | int FK → State | |
| `slug` | varchar(120) | |
| `normalized_name` | varchar(100) | Cleaned name for matching |

### `City`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name` | varchar(100) | |
| `state_id` | int FK → State | |
| `slug` | varchar(120) | |

## Products Tables

### `Product`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name` | varchar(150) | |
| `slug` | varchar(180) unique | URL key |
| `category` | varchar(50) | `credit_card`, `loan`, `savings_account` |
| `bank_id` | int FK → Bank | |
| `network` | varchar(50) | `Visa`, `Mastercard`, `RuPay`, `Amex` |
| `card_image_url` | text | |
| `apply_url` | text | Affiliate / direct apply link |
| `is_featured` / `is_popular` / `is_active` | bool | |
| `rating` | float | |
| `total_ratings` | int | |

### `ProductDetails` (1:1 with Product)
| Column | Type | Notes |
|---|---|---|
| `annual_fee` | float | 0 = free |
| `joining_fee` | float | |
| `min_income` | float | |
| `eligibility` | text | |
| `lounge_access` | int | Number of free visits |
| `reward_type` | varchar | `cashback`, `points`, `miles` |

### `ProductOffer` (1:many, versioned)
| Column | Type | Notes |
|---|---|---|
| `product_id` | int FK → Product | |
| `title` | varchar(200) | Short offer headline |
| `description` | text | |
| `reward_type` | varchar | |
| `reward_rate` | float | e.g. 5.0 for 5% |
| `reward_cap` | float | Monthly cap in ₹ |
| `category` | varchar(100) | `shopping`, `travel`, `fuel` |
| `version` | int | Increments on update |
| `is_active` | bool | Only latest active offer shown |
| `valid_from` / `valid_to` | timestamp | |
| `source` | varchar(50) | `manual` or `scraper` |

## Blog Table

### `blogs`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `slug` | varchar(200) unique | |
| `title` | varchar(300) | |
| `description` | text | SEO meta description |
| `category` | varchar(50) | `Tax`, `Banking`, `Investment`, `Credit Cards`, `Loans` |
| `tags` | text[] | PostgreSQL array |
| `cover_image` | text | Unsplash URL |
| `content` | text | Full Markdown |
| `read_time` | varchar(20) | e.g. `5 min read` |
| `is_published` | bool | `false` = draft |
| `is_featured` | bool | |
| `published_at` | timestamp | |

## Indexes

### Core
- `Bank.is_active` — `Bank_is_active_idx`
- `Bank.name` — unique
- `Bank.slug` — unique
- `Branch.ifsc` — unique
- `Branch.bank_id`, `Branch.state_id`, `Branch.district_id`, `Branch.pincode`, `Branch.micr`, `Branch.city_id` — individual indexes
- `District(name, stateId)` — composite unique
- `City(name, stateId)` — composite unique

### Blog
- `blogs.category` — index
- `blogs(is_published, published_at)` — composite index

### Product
- `Product.slug` — unique
- `Product.bank_id`, `Product.category` — individual indexes
- `ProductFeatureMapping(productId, featureId)` — composite unique
- `ProductOffer.productId`, `ProductOffer.isActive` — individual indexes

## Data Integrity Rules

- `Branch.bankId` must reference a valid `BanksMaster` row
- `Branch.cityId` must reference a valid `City` row (or be NULL)
- `City` unique on `(name, stateId)`
- `BankStatePresence` unique on `(bankId, stateId)` — rebuild after every IFSC sync
- `BanksMaster.slug` unique — uses slugified name pattern
- `Blog.slug` unique
- `Product.slug` unique

## Raw SQL Notes

In `prisma.$executeRaw` and `prisma.$queryRaw`, use **snake_case DB column names** and **DB table names**:
```sql
SELECT * FROM "Bank" WHERE is_active = true
SELECT * FROM "blogs" WHERE is_published = true
```

## Known Data Quality Issues

- District name duplicates: "Karimnagar" vs "Karim Nagar", "Rangareddy" vs "Ranga Reddy" vs "Rangareddi"
- Some districts have `state_id=8` (old Andhra Pradesh pre-split) instead of `state_id=2` (Telangana)
- 718 banks have `logo_url = NULL`
- `Branch.city` is UPPERCASE — always use `mode: 'insensitive'` when querying
- `State` table has 43 rows — 36 valid states/UTs + some legacy entries
