# Module: Admin Panel

A JWT-protected dashboard for managing credit card products, offers, and features. Built as a separate React sub-app within the same frontend, using its own axios instance (`adminApi`).

## Access

| URL | Purpose |
|---|---|
| `/admin/login` | Login page |
| `/admin/dashboard` | Stats overview (total products, banks, offers) |
| `/admin/credit-cards` | List all credit cards |
| `/admin/credit-cards/new` | Add a new credit card |
| `/admin/credit-cards/:slug` | View card detail + manage offers |
| `/admin/credit-cards/:slug/edit` | Edit existing card |
| `/admin/banks` | Paginated bank management — search, filter, edit bank details |
| `/admin/rates` | FD / Savings / Loan rates management (tabbed) |
| `/admin/contacts` | View, read-mark, and delete contact form submissions |

Admin pages are not indexed (`noindex` should be set on all admin routes).

## Frontend Files

```
frontend/src/admin/
  pages/
    Login.tsx             # JWT login form
    Dashboard.tsx         # Stats cards
    CreditCardsPage.tsx   # Product list with search
    AddEditCardPage.tsx   # Create/edit card form
    CardDetailPage.tsx    # Card view + offer management
    AddProduct.tsx        # Legacy step-form (superseded by AddEditCardPage)
    BanksPage.tsx         # Paginated bank list + inline edit modal
    RatesPage.tsx         # FD/Savings/Loan rates management
    ContactsPage.tsx      # Contact form submissions — read/delete
  components/
    Sidebar.tsx           # Nav sidebar with links
    Header.tsx            # Top bar with logout
    ProtectedRoute.tsx    # Redirects to /admin/login if no token
  layout/
    AdminLayout.tsx       # Wraps all admin pages with Sidebar + Header
  utils/
    adminApi.ts           # Axios instance — attaches JWT, handles 401 redirect
```

## Authentication

- JWT stored in `localStorage` under key `adminToken`
- `adminApi` interceptor attaches `Authorization: Bearer <token>` to every request
- On 401 or 403 response: clears token, redirects to `/admin/login`
- `ProtectedRoute` component wraps all admin routes in `App.tsx`

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

## Backend API Endpoints

All require `Authorization: Bearer <jwt-token>` header. Mounted in `backend/src/routes/adminRoutes.ts`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Login → returns JWT token |
| `GET` | `/api/admin/dashboard` | Product count, bank count, offer stats |
| `GET` | `/api/admin/products?page=1&search=` | List products (paginated) |
| `GET` | `/api/admin/credit-cards/:slug` | Full card detail with offers & features |
| `POST` | `/api/admin/products` | Create new product |
| `PUT` | `/api/admin/products/:id` | Update product + details |
| `DELETE` | `/api/admin/products/:id` | Delete product (cascades offers/features) |
| `POST` | `/api/admin/products/:id/offers` | Add new offer |
| `PUT` | `/api/admin/offers/:id` | Update offer |
| `DELETE` | `/api/admin/offers/:id` | Delete offer |
| `POST` | `/api/admin/offers/:id/revert` | Revert offer to previous version |
| `GET` | `/api/admin/banks` | Bank list for dropdown (card issuer filter by default) |
| `GET` | `/api/admin/banks/manage?page=&search=&type=` | Paginated full bank list with branch counts |
| `PUT` | `/api/admin/banks/:id` | Edit bank details (name, type, logo, slug, isActive, isCurated, etc.) |
| `GET` | `/api/admin/features` | Feature tag list |
| `GET` | `/api/admin/contacts?page=&unread=` | Paginated contact form submissions |
| `PATCH` | `/api/admin/contacts/:id/read` | Mark contact message as read |
| `DELETE` | `/api/admin/contacts/:id` | Delete contact message |
| `GET` | `/api/admin/rates?type=fd` | All rate entries (including inactive) |
| `POST` | `/api/admin/rates` | Create rate entry |
| `PUT` | `/api/admin/rates/:id` | Update rate entry |
| `DELETE` | `/api/admin/rates/:id` | Soft-delete rate entry |

## Database Tables Touched

| Table | Usage |
|---|---|
| `admins` | Login credentials (bcrypt hashed passwords) |
| `Product` | CRUD for all product types |
| `ProductDetails` | Fees, eligibility, reward type |
| `ProductOffer` | Versioned offers |
| `Feature` / `ProductFeatureMapping` | Feature tagging |
| `Bank` | Bank dropdown in forms + full bank management |
| `rate_entries` | FD / Savings / Loan rates (manual curation) |
| `contact_messages` | Contact form submissions from public `/contact` page |

## Pending Features

- **User management** — `/admin/users` page shows "Coming Soon"
- **Role-based access** — single admin role only; needs admin/editor split
- **Blog management UI** — no admin pages for blogs yet (only API endpoints exist)
- **Bulk CSV import** — not implemented
- **Direct image upload** — paste URL only; no file upload
- **Email notification** — no email alert when new contact message arrives
