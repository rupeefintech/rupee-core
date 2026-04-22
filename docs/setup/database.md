# Database Setup

## Provider

**Neon** — serverless PostgreSQL. Two connection strings are required:
- `DATABASE_URL` — pooled (used by Prisma at runtime via PgBouncer)
- `DIRECT_URL` — direct (used by Prisma for migrations)

## Tables & Row Counts (approximate)

| Table | Rows | Purpose |
|---|---|---|
| `Bank` | 1,352 | All banks (model name: `BanksMaster`) |
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

## IFSC Core Tables

### `Bank` (Prisma: `BanksMaster`)
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name` | varchar(100) unique | Full bank name |
| `short_name` | varchar(100) | Abbreviation |
| `bank_code` | varchar(10) | |
| `bank_type` | varchar(30) | e.g. "Public Sector", "Private Sector" |
| `headquarters` | varchar(100) | |
| `website` | text | |
| `logo_url` | text | Full path to WebP logo |
| `slug` | varchar(120) unique | URL key e.g. `hdfc-bank` |
| `is_active` | bool | |
| `is_curated` | bool | Manually verified entry |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### `Branch`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `ifsc` | varchar(11) unique | e.g. `HDFC0001234` |
| `micr` | varchar(9) | |
| `bank_id` | int FK → Bank | |
| `branch_name` | varchar(200) | |
| `address` | text | |
| `city` | varchar(100) | **UPPERCASE** in DB |
| `district_id` | int FK → District | |
| `state_id` | int FK → State | |
| `pincode` | varchar(6) | |
| `phone` | varchar(50) | |
| `neft` | bool | |
| `rtgs` | bool | |
| `imps` | bool | |
| `upi` | bool | |
| `latitude` | float | |
| `longitude` | float | |
| `swift` | varchar(11) | |
| `city_id` | int FK → City | |
| `is_active` | bool | |
| `last_synced` | timestamp | |

### `State`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name` | varchar(100) unique | |
| `code` | varchar(10) | |
| `logo_url` | text | |
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
| `is_featured` | bool | |
| `is_popular` | bool | |
| `is_active` | bool | |
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

### `ProductOffer` (1:many with Product, versioned)
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

### `Feature` + `ProductFeatureMapping`
Tag system. Features are strings like "Airport Lounge", "Fuel Surcharge Waiver". Many products can share the same feature tag.

## Blog Table

### `blogs`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `slug` | varchar(200) unique | URL key |
| `title` | varchar(300) | |
| `description` | text | Meta description |
| `category` | varchar(50) | e.g. `credit-cards`, `ifsc` |
| `tags` | text[] | PostgreSQL array |
| `cover_image` | text | |
| `content` | text | Full markdown |
| `read_time` | varchar(20) | e.g. `5 min read` |
| `is_published` | bool | |
| `is_featured` | bool | |
| `published_at` | timestamp | |

## Known Data Quality Issues

- District names have duplicates/variants: "Karimnagar" vs "Karim Nagar", "Rangareddy" vs "Ranga Reddy" vs "Rangareddi"
- Some districts reference `state_id=8` (old Andhra Pradesh) instead of `state_id=2` (Telangana) post-bifurcation
- 718 banks have no logo file
- `Branch.city` is stored in UPPERCASE — always query with `mode: 'insensitive'`
