# Backend Rules

## API Patterns

All routes in `backend/src/routes/api.ts`. Express router mounted at `/api`.

### Response format
```json
{ "data": {...}, "count": 123 }
```
Errors: `{ "error": "message" }` with appropriate HTTP status.

### Cascade filtering endpoints (core feature)
```
GET /api/banks                                    → all banks
GET /api/banks/:bankSlug/states                   → states where bank operates
GET /api/state/:bankSlug/:stateSlug               → branches for bank+state
GET /api/state/:bankSlug/:stateSlug/districts     → districts for bank+state
GET /api/city/:bankSlug/:stateSlug/:citySlug      → branches for bank+state+city
```

### Lookup endpoints
```
GET /api/ifsc/:ifsc          → full branch details with bank/state/district
GET /api/ifsc/:ifsc/nearby   → nearby branches (same bank + district)
GET /api/search?q=           → search by IFSC prefix, branch name, or city
GET /api/pincode/:pincode    → all branches in pincode
```

## Prisma Usage

- Client singleton in `backend/src/lib/prisma.ts`
- Model `BanksMaster` → accessor `prisma.banksMaster` (NOT `prisma.bank`)
- Branch.bank relation still works: `branch.bank.name` returns BanksMaster data
- Always use `select` to limit returned fields (don't fetch entire rows)
- Use `include` only for detail pages that need full relations

## Caching

- `cacheGet(key)` / `cacheSet(key, data, ttl?)` from `backend/src/lib/cache.ts`
- Check cache first, return early if hit
- Cache key pattern: descriptive, e.g. `ifsc_HDFC0001234`, `branches_5_3_all`

## Frontend compatibility

API responses map camelCase Prisma fields to snake_case for frontend:
```ts
{ branch_name: b.branchName, bank_name: b.bank.name, state_name: b.state.name }
```
