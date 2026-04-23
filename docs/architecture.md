# Architecture

## System Overview

Rupeepedia is an Indian financial tools platform with four pillars:
1. **IFSC Lookup** — 178k+ branches, cascade filtering (Bank → State → City → Branch)
2. **Credit Cards** — Product comparison with admin management
3. **Calculators** — 20+ financial calculators (EMI, SIP, Tax, Salary, etc.)
4. **Money Guides** — AI-generated daily blog articles

## Data Model (Prisma → PostgreSQL)

```
BanksMaster (@@map "Bank")  ──< Branch >──  State
     │                          │   │          │
     │                          │   └── District
     │                          │
     └── BankStatePresence >────┘── City

Product ──< ProductOffer
  │   └── ProductDetails (1:1)
  │
  └──< ProductFeatureMapping >── Feature

Blog (standalone)
Admin (standalone — JWT auth)
SearchLog, SyncLog, DataOverride (utility)
```

### Core Models
- **BanksMaster**: 1,352 banks. Type classification (Public/Private/Cooperative/RRB/Payments/Small Finance/Foreign). Self-referencing `mergedIntoId`.
- **Branch**: 178k+ IFSC records. Payment flags (neft/rtgs/imps/upi), geo coordinates, links to bank/state/district/city.
- **BankStatePresence**: Denormalized bank-state pairs with branch counts. Powers cascade filtering.
- **City**: 12k entries. Unique on (name, stateId).
- **District**: ~700 entries. Unique on (name, stateId).
- **State**: 43 rows (36 valid states/UTs + some legacy).

### Product Models (Credit Cards)
- **Product**: name, slug, category, bankId, network, cardImageUrl, rating, isFeatured/isPopular/isActive.
- **ProductDetails**: 1:1 with Product. annualFee, joiningFee, minIncome, loungeAccess, rewardType.
- **ProductOffer**: 1:many, versioned. rewardType, rewardRate, rewardCap, category, validFrom/To.
- **Feature**: Tag system (many:many via ProductFeatureMapping). e.g., "Airport Lounge", "Fuel Surcharge Waiver".

### Blog Model
- **Blog**: slug, title, description, category, tags[], coverImage, content (Markdown), readTime, isPublished, isFeatured.

### Utility Models
- **Admin**: JWT-authenticated admin users (email, hashed password).
- **SearchLog**: Tracks user searches for analytics.
- **SyncLog**: Records data sync operations.
- **DataOverride**: Manual correction audit trail. Keyed by (entityType, entityId, fieldName).

## Hybrid Static-Dynamic Model

- **Static/curated**: BanksMaster fields (name, type, logo, classification) — human-verified, rarely changes
- **Dynamic/synced**: Branch data — synced from Razorpay, high-volume updates
- **AI-generated**: Blog content — generated daily via Claude API, stored in PostgreSQL
- Never sync raw data directly into BanksMaster. Only Branch table gets automated updates.

## Caching Strategy

Three-tier cache for hot endpoints (`/api/banks`, `/api/states`):

```
Request → In-Memory Map (microseconds)
        → Upstash Redis (milliseconds)
        → Neon PostgreSQL (seconds on cold)
```

- Banks list: long TTL (changes rarely)
- IFSC lookup: 24h TTL
- Stats: 30s TTL
- Cache keys: `{entity}_{id}` or `{entity}_{param1}_{param2}`
- Cache warm-up runs on server boot

## Module Boundaries

| Module | Backend Routes | Frontend Pages | Data Source |
|---|---|---|---|
| IFSC Lookup | `api.ts` (cascade + lookup) | HomePage, IFSCFinderPage, BankPage, StatePage, CityPage, IFSCDetailPage | Razorpay sync |
| Credit Cards | `api.ts` (products) + `adminRoutes.ts` | CreditCards, CreditCardDetail, Admin pages | Manual + seed scripts |
| Calculators | None (client-side only) | 20+ calculator pages via CalculatorLayout | N/A |
| Money Guides | `api.ts` (blogs) | BlogListingPage, BlogDetailPage | Claude API + PostgreSQL |
| Admin | `adminRoutes.ts` + `authRoutes.ts` | Admin dashboard, product CRUD | JWT-protected |
