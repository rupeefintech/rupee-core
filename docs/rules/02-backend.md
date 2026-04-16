# Backend Rules

## API Patterns

All public routes in `backend/src/routes/api.ts`. Admin routes in `adminRoutes.ts`. Auth routes in `authRoutes.ts`. Express router mounted at `/api`.

### Response format
```json
{ "data": {...}, "count": 123 }
```
Errors: `{ "error": "message" }` with appropriate HTTP status.

### Cascade filtering endpoints (core feature)
```
GET /api/banks                                    → all active banks (with slug, logo_url)
GET /api/banks/:bankSlug                          → bank profile by slug
GET /api/banks/:bankSlug/states                   → states where bank operates (with branchCount)
GET /api/bank/:bankSlug/cities/:stateSlug         → cities for bank+state
GET /api/state/:bankSlug/:stateSlug               → branches for bank+state
GET /api/state/:bankSlug/:stateSlug/districts     → districts for bank+state
GET /api/city/:bankSlug/:stateSlug/:citySlug      → branches for bank+state+city (paginated)
```

### Lookup endpoints
```
GET /api/ifsc/:ifsc          → full branch details with bank/state/district
GET /api/ifsc/:ifsc/nearby   → nearby branches (same bank + district)
GET /api/search?q=           → search by IFSC prefix, branch name, or city
GET /api/pincode/:pincode    → all branches in pincode
GET /api/states              → all states (with logo_url)
GET /api/states/:slug/banks  → banks in a state
```

### Blog endpoints
```
GET /api/blogs?page=1&limit=12&category=Tax&search=...  → paginated list
GET /api/blogs/categories                                → category counts (groupBy)
GET /api/blogs/featured                                  → featured blogs (max 5)
GET /api/blogs/:slug                                     → full blog + related articles
```
**IMPORTANT:** `/categories` and `/featured` routes must be registered BEFORE `/:slug` to avoid slug matching.

### Product endpoints (public)
```
GET /api/products?page=1&search=...  → list products with filters
GET /api/products/:slug              → product details with offers & features
```

### Admin endpoints (JWT protected — `Authorization: Bearer <token>`)
```
POST /api/auth/login                    → admin login → JWT token
GET  /api/admin/dashboard               → product count, bank count, offer stats
GET  /api/admin/products?page=1&search= → list products (paginated)
GET  /api/admin/credit-cards/:slug      → full card details with offers & features
POST /api/admin/products                → create new product
PUT  /api/admin/products/:id            → update product + details
DELETE /api/admin/products/:id          → delete product (cascades)
POST /api/admin/products/:id/offers     → add new offer
PUT  /api/admin/offers/:id              → update offer
DELETE /api/admin/offers/:id            → delete offer
POST /api/admin/offers/:id/revert       → revert offer to previous version
GET  /api/admin/banks                   → list banks (for dropdown)
GET  /api/admin/features                → list features (for tagging)
```

## Bank Slug Lookup

**CRITICAL:** All bank lookup endpoints use `slug` field (e.g., `hdfc-bank`), NOT `shortName`.
```ts
// CORRECT:
prisma.banksMaster.findFirst({ where: { slug: bankSlug } })

// WRONG — shortName has inconsistent formatting:
prisma.banksMaster.findFirst({ where: { shortName: { equals: bankSlug, mode: 'insensitive' } } })
```

## City Matching

**CRITICAL:** City values in Branch table are UPPERCASE (e.g., "HYDERABAD"). Always use case-insensitive matching:
```ts
// CORRECT:
prisma.branch.findMany({ where: { city: { equals: citySlug, mode: 'insensitive' } } })

// WRONG — returns 0 results:
prisma.branch.findMany({ where: { city: citySlug.toLowerCase() } })
```

## Prisma Usage

- Client singleton in `backend/src/lib/prisma.ts`
- Model `BanksMaster` → accessor `prisma.banksMaster` (NOT `prisma.bank`)
- Branch.bank relation still works: `branch.bank.name` returns BanksMaster data
- Always use `select` to limit returned fields (don't fetch entire rows)
- Use `include` only for detail pages that need full relations

## Caching

Three-tier: in-memory Map → Upstash Redis → DB.

- `memGet(key)` / `memSet(key, data, ttl)` — instant, in-process
- `cacheGet(key)` / `cacheSet(key, data, ttl?)` — Redis via `backend/src/lib/cache.ts`
- Hot endpoints (`/api/banks`, `/api/states`) use both layers
- Banks filtered by `isActive: true` to reduce query size
- Cache warm-up fires on server boot

## Frontend Compatibility

API responses map camelCase Prisma fields to snake_case for frontend:
```ts
{ branch_name: b.branchName, bank_name: b.bank.name, state_name: b.state.name, logo_url: b.logoUrl }
```

## Logo URLs

- Bank logos: `/images/banks/Hdfc_Bank.webp` (Title_Case with underscores)
- State logos: `/images/states/andhra-pradesh.webp` (lowercase-dashes)
- Served from `frontend/public/images/` as static assets
- DB stores the full path including `/images/`
- Always return `logoUrl || null` to normalize empty strings

## Backend Scripts

| Script | Purpose |
|---|---|
| `backend/scripts/create-blog-table.ts` | Creates blogs table via raw SQL |
| `backend/scripts/generate-blog.ts` | AI blog generator (Claude + Unsplash) |
| `backend/scripts/blog-topics.ts` | 60 blog topics queue |
| `backend/scripts/seed-blogs.ts` | Seeds pre-written blog content |
| `backend/scripts/seed-credit-cards.ts` | Seeds credit card products |
