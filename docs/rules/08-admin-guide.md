# Admin Panel — Product Management

> Last updated: 15 April 2026

## Overview

The admin panel at `/admin` lets you manage credit card products, offers, and features. It's a separate React app within the same frontend, protected by JWT authentication.

---

## Access

| URL | Purpose |
|---|---|
| `/admin/login` | Login page |
| `/admin/dashboard` | Stats overview (total products, banks, offers) |
| `/admin/credit-cards` | List all credit cards |
| `/admin/credit-cards/new` | Add a new credit card |
| `/admin/credit-cards/:slug/edit` | Edit existing card |

**Login credentials** are stored in the `admins` table (hashed passwords). Create an admin via:

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

---

## Data Model

```
Product (Credit Card)
├── name, slug, category (credit_card, loan, savings_account)
├── bankId → BanksMaster
├── network (Visa, Mastercard, RuPay)
├── cardImageUrl, applyUrl
├── isFeatured, isPopular, isActive
├── rating, totalRatings
│
├── ProductDetails (1:1)
│   ├── annualFee, joiningFee
│   ├── minIncome, eligibility
│   ├── loungeAccess, rewardType
│
├── ProductOffer (1:many, versioned)
│   ├── title, description
│   ├── rewardType, rewardRate, rewardCap
│   ├── category (shopping, travel, fuel)
│   ├── version, isActive, validFrom, validTo
│   ├── source (manual, scraper), sourceUrl
│
└── Feature (many:many via ProductFeatureMapping)
    ├── name, slug
    └── e.g., "Airport Lounge", "Fuel Surcharge Waiver"
```

---

## Admin API Endpoints

All require `Authorization: Bearer <jwt-token>` header.

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Product count, bank count, offer stats |
| GET | `/api/admin/products?page=1&search=...` | List products (paginated) |
| GET | `/api/admin/credit-cards/:slug` | Full card details with offers & features |
| POST | `/api/admin/products` | Create new product |
| PUT | `/api/admin/products/:id` | Update product + details |
| DELETE | `/api/admin/products/:id` | Delete product (cascades offers/features) |
| POST | `/api/admin/products/:id/offers` | Add new offer |
| PUT | `/api/admin/offers/:id` | Update offer |
| DELETE | `/api/admin/offers/:id` | Delete offer |
| POST | `/api/admin/offers/:id/revert` | Revert offer to previous version |
| GET | `/api/admin/banks` | List banks (for dropdown in forms) |
| GET | `/api/admin/features` | List all features (for tagging) |

---

## Adding a New Credit Card

### Via Admin Panel (Recommended)

1. Go to `/admin/credit-cards/new`
2. Fill in: name, bank, network, category
3. Add details: annual fee, joining fee, min income, lounge access
4. Upload card image URL (use a direct image link)
5. Add offers: cashback rates, reward points, category-specific deals
6. Tag features: Airport Lounge, Fuel Waiver, etc.
7. Save

### Via Seed Script (Bulk)

Edit `backend/scripts/seed-credit-cards.ts` and run:
```bash
cd backend && npx ts-node scripts/seed-credit-cards.ts
```

---

## Offer Versioning

Offers use a versioning system — when you update an offer, the old version is kept with `isActive: false`. This lets you:
- Track offer history
- Revert to a previous version via `POST /api/admin/offers/:id/revert`
- See when offers changed (validFrom/validTo dates)

---

## Card Images

- Store card images as direct URLs in `cardImageUrl` field
- Frontend shows the image if URL ends with `.png` (after `.trim()`)
- Otherwise shows a gradient placeholder with bank logo + card name
- Image files can be hosted anywhere (CDN, S3, direct URL)

---

## Pending Features

- **Banks management** — `/admin/banks` page (currently shows "Coming Soon")
- **User management** — `/admin/users` page (currently shows "Coming Soon")
- **Role-based access** — Currently single-role; needs admin/editor split
- **Bulk import** — CSV upload for products
- **Image upload** — Direct image upload instead of pasting URLs
