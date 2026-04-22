# Module: Credit Cards

Part of the Products system. Lists credit cards from Indian banks with filtering by category, bank, annual fee, and sort. Each card has a detail page with offers, features, and an apply link. Cards can be compared side-by-side (up to 3).

## Frontend Pages

| File | URL Route | Purpose |
|---|---|---|
| `src/pages/CreditCards.tsx` | `/credit-cards` | Listing page with filters, sort, compare bar |
| `src/pages/CreditCardDetail.tsx` | `/credit-cards/:slug` | Individual card detail |
| `src/pages/CreditCardCompare.tsx` | `/credit-cards/compare?ids=1,2,3` | Side-by-side comparison |

### Admin Pages

| File | URL Route | Purpose |
|---|---|---|
| `src/admin/pages/CreditCardsPage.tsx` | `/admin/credit-cards` | Admin list of all credit cards |
| `src/admin/pages/AddEditCardPage.tsx` | `/admin/credit-cards/new` / `/admin/credit-cards/:id/edit` | Add or edit a card |
| `src/admin/pages/CardDetailPage.tsx` | `/admin/credit-cards/:id` | View card + manage offers |
| `src/admin/pages/AddProduct.tsx` | `/admin/products/add` | Legacy step-form (replaced by AddEditCardPage) |

## Backend API Endpoints

Public endpoints in `backend/src/routes/api.ts`:

| Method | Path | Returns |
|---|---|---|
| `GET` | `/credit-cards/stats` | totalCards, totalBanks, avgRating, freeCards |
| `GET` | `/credit-cards/categories` | Offer categories with card counts |
| `GET` | `/credit-cards/banks` | Banks that have cards, with card counts |
| `GET` | `/credit-cards/featured` | Featured cards only |
| `GET` | `/products?limit=&search=&bank=&annualFeeMax=&sortBy=` | All products (filtered) |
| `GET` | `/products/:slug` | Single card detail with offers + features |

Admin endpoints in `backend/src/routes/adminRoutes.ts`:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/products?category=credit_card` | List all credit cards |
| `POST` | `/admin/products` | Create product |
| `PUT` | `/admin/products/:id` | Update product |
| `DELETE` | `/admin/products/:id` | Delete product |
| `POST` | `/admin/products/:id/details` | Set product details (fees, eligibility) |
| `POST` | `/admin/products/:id/offers` | Add offer to product |

## Database Tables Touched

| Table | Usage |
|---|---|
| `Product` | Core card record (`category = 'credit_card'`) |
| `ProductDetails` | Annual fee, joining fee, reward type, lounge access |
| `ProductOffer` | Versioned offers/benefits shown on card detail |
| `Feature` | Feature tags e.g. "Airport Lounge", "Fuel Waiver" |
| `ProductFeatureMapping` | Links features to products |
| `Bank` | Bank name and logo shown on card |

## Data Model Notes

- `Product.category` must be `'credit_card'` for credit cards
- `ProductOffer.is_active = true` — only latest active offer is shown per card
- `ProductOffer.category` drives the frontend category filter (e.g. `travel`, `shopping`, `fuel`)
- `Product.network` — `Visa`, `Mastercard`, `RuPay`, `Amex`, `Diners`
- `Product.card_image_url` — if ends with `.png`, renders as `<img>`. Otherwise shows a generated gradient card visual

## Filter Logic

| Filter | Source | How applied |
|---|---|---|
| Category | `ProductOffer.category` | Client-side after fetch (case-insensitive) |
| Bank | `Product.bank_id` → Bank name | Server-side query param `bank` |
| Max annual fee | `ProductDetails.annual_fee` | Server-side query param `annualFeeMax` |
| Sort | `rating` / `annualFee` / `newest` | Server-side `sortBy` param |
| Search | `Product.name` | Server-side `search` param (contains, insensitive) |

## Known Gaps

- No pagination on listing page (loads all 100 at once)
- Compare page UI is a stub — needs full implementation
- Loans and Bank Accounts share the same `Product` table but their listing pages (`Loans.tsx`, `BankAccounts.tsx`) are placeholder stubs
- No user ratings/reviews system yet
