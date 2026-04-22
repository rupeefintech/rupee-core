# Module: Loans

Part of the Products system. Uses `Product.category = 'loan'` in the DB. The listing page is a stub — backend infrastructure is shared with Credit Cards.

## Frontend Pages

| File | URL Route | Purpose |
|---|---|---|
| `src/pages/Loans.tsx` | `/loans` | Listing page (stub — not fully built) |

## Backend API Endpoints

Loans use the same generic product endpoints as Credit Cards:

| Method | Path | Notes |
|---|---|---|
| `GET` | `/products?category=loan` | Filter products by loan category |
| `GET` | `/products/:slug` | Single loan product detail |

No dedicated `/loans/*` routes exist yet.

## Database Tables Touched

Same as Credit Cards — `Product`, `ProductDetails`, `ProductOffer`, `Feature`, `ProductFeatureMapping`, `Bank`.

`Product.category` must be `'loan'`.

## Known Gaps

- `Loans.tsx` is a visual stub — no real data fetching or filtering yet
- No admin UI for managing loan products
- Loan-specific fields (loan amount range, tenure, interest rate) not in schema yet — `ProductDetails` would need new columns
