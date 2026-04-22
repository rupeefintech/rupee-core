# Module: Credit Cards

Part of the Products system. Lists credit cards from Indian banks with filtering by category, bank, annual fee, and sort. Each card has a detail page with offers, features, and an apply link. Cards can be compared side-by-side (up to 3). Fully managed via the admin panel.

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
| `src/admin/pages/AddEditCardPage.tsx` | `/admin/credit-cards/new` and `/admin/credit-cards/:id/edit` | Add or edit a card |
| `src/admin/pages/CardDetailPage.tsx` | `/admin/credit-cards/:id` | View card + manage offers |

## Backend API Endpoints

### Public
| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/credit-cards/stats` | totalCards, totalBanks, avgRating, freeCards |
| `GET` | `/api/credit-cards/categories` | Offer categories with card counts |
| `GET` | `/api/credit-cards/banks` | Banks that have cards, with card counts |
| `GET` | `/api/credit-cards/featured` | Featured cards only |
| `GET` | `/api/products?limit=&search=&bank=&annualFeeMax=&sortBy=` | All products (filtered) |
| `GET` | `/api/products/:slug` | Single card detail with offers + features |

### Admin (JWT required)
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Product count, bank count, offer stats |
| `GET` | `/api/admin/products?page=1&search=` | List all credit cards (paginated) |
| `GET` | `/api/admin/credit-cards/:slug` | Full card detail with offers & features |
| `POST` | `/api/admin/products` | Create product |
| `PUT` | `/api/admin/products/:id` | Update product + details |
| `DELETE` | `/api/admin/products/:id` | Delete product (cascades offers/features) |
| `POST` | `/api/admin/products/:id/offers` | Add offer |
| `PUT` | `/api/admin/offers/:id` | Update offer |
| `DELETE` | `/api/admin/offers/:id` | Delete offer |
| `POST` | `/api/admin/offers/:id/revert` | Revert offer to previous version |
| `GET` | `/api/admin/banks` | Bank list for dropdown |
| `GET` | `/api/admin/features` | Feature tag list |

## Database Tables Touched

| Table | Usage |
|---|---|
| `Product` | Core card record (`category = 'credit_card'`) |
| `ProductDetails` | Annual fee, joining fee, reward type, lounge access |
| `ProductOffer` | Versioned offers/benefits shown on card detail |
| `Feature` | Feature tags e.g. "Airport Lounge", "Fuel Waiver" |
| `ProductFeatureMapping` | Links features to products |
| `Bank` | Bank name and logo shown on card |

## Filter Logic

| Filter | Source | Applied |
|---|---|---|
| Category | `ProductOffer.category` | Client-side after fetch (case-insensitive) |
| Bank | `Product.bank_id` → Bank name | Server-side `bank` param |
| Max annual fee | `ProductDetails.annual_fee` | Server-side `annualFeeMax` param |
| Sort | `rating` / `annualFee` / `newest` | Server-side `sortBy` param |
| Search | `Product.name` | Server-side `search` param (contains, insensitive) |

## Data Model Notes

- `Product.category` must be `'credit_card'`
- `ProductOffer.is_active = true` — only latest active offer shown per card
- `ProductOffer.category` drives the frontend category filter (e.g. `travel`, `shopping`, `fuel`)
- `Product.network` — `Visa`, `Mastercard`, `RuPay`, `Amex`, `Diners`
- `Product.card_image_url` — if ends with `.png`, renders as `<img>`. Otherwise shows generated gradient card visual

## Offer Versioning

When you update an offer, the old version is kept with `isActive: false`. This lets you:
- Track offer history over time
- Revert to a previous version via `POST /api/admin/offers/:id/revert`
- See when offers changed (`validFrom`/`validTo` dates)

## Card Images

- Store card images as direct URLs in `cardImageUrl` field
- Frontend checks: if URL ends with `.png` → renders `<img>`, otherwise → gradient placeholder with bank logo
- Images can be hosted anywhere (CDN, S3, direct URL)

## Admin Operations

### Adding a New Card (via Admin Panel)
1. Go to `/admin/credit-cards/new`
2. Fill in: name, bank, network, category
3. Add details: annual fee, joining fee, min income, lounge access
4. Upload card image URL (direct image link)
5. Add offers: cashback rates, reward points, category-specific deals
6. Tag features: Airport Lounge, Fuel Waiver, etc.

### Adding Cards in Bulk (via Seed Script)
```bash
cd backend && npx ts-node scripts/seed-credit-cards.ts
```

### Creating an Admin Account
```bash
cd backend && npx ts-node -e "
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const p = new PrismaClient();
p.admin.create({ data: {
  email: 'admin@rupeepedia.in',
  password: bcrypt.hashSync('your-password', 10),
}}).then(() => console.log('Admin created')).finally(() => p.\$disconnect());
"
```

## Known Gaps

- No pagination on listing page (loads all 100 at once)
- Compare page (`CreditCardCompare.tsx`) is a stub — needs full implementation
- No user ratings/reviews system
- Banks management page `/admin/banks` — shows "Coming Soon"
- Role-based access — currently single admin role, no editor split
- Bulk CSV import not implemented
- Direct image upload not implemented (paste URL only)
