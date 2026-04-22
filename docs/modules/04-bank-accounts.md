# Module: Bank Accounts

Part of the Products system. Uses `Product.category = 'savings_account'` in the DB. The listing page is a stub — backend infrastructure is shared with Credit Cards.

## Frontend Pages

| File | URL Route | Purpose |
|---|---|---|
| `src/pages/BankAccounts.tsx` | `/bank-accounts` | Listing page (stub — not fully built) |

## Backend API Endpoints

Bank accounts use the same generic product endpoints as Credit Cards:

| Method | Path | Notes |
|---|---|---|
| `GET` | `/products?category=savings_account` | Filter products by account category |
| `GET` | `/products/:slug` | Single account product detail |

No dedicated `/bank-accounts/*` routes exist yet.

## Database Tables Touched

Same as Credit Cards — `Product`, `ProductDetails`, `ProductOffer`, `Feature`, `ProductFeatureMapping`, `Bank`.

`Product.category` must be `'savings_account'`.

## Known Gaps

- `BankAccounts.tsx` is a visual stub — no real data fetching or filtering yet
- No admin UI for managing account products
- Account-specific fields (minimum balance, interest rate on deposits) not in schema yet
