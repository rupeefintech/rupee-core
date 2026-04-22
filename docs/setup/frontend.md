# Frontend Setup

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI Framework | React | 18 |
| Build Tool | Vite | 5 |
| Language | TypeScript | 5 |
| Styling | TailwindCSS | 3 |
| Routing | React Router | 6 |
| Data Fetching | Axios + TanStack Query | — |
| Animations | Framer Motion | 11 |
| SEO | React Helmet Async | 2 |
| Markdown | react-markdown + remark-gfm + rehype-raw + rehype-slug | — |
| Notifications | react-hot-toast | — |

## File Structure

```
frontend/
  src/
    pages/            # Route-level pages (one file per page)
    components/       # Shared UI components
    admin/
      pages/          # Admin dashboard pages
      components/     # Admin-only components (Sidebar, Header)
      layout/         # AdminLayout wrapper
      utils/
        adminApi.ts   # Axios instance for admin API calls
    utils/
      api.ts          # Axios instance (apiClient) + all typed API methods
      seo.ts          # SEO title/description generator
    styles/
      globals.css     # Tailwind base + custom classes (card, hero-bg, ifsc-mono)
    App.tsx           # Router + layout shell
    main.tsx          # React entry point
  public/
    images/
      banks/          # 634 bank logos (WebP, Title_Case e.g. Hdfc_Bank.webp)
      states/         # 35 state images (lowercase-dashed e.g. andhra-pradesh.webp)
    robots.txt
    sitemap.xml
  .env                # Local dev (VITE_API_URL=http://localhost:3001)
  .env.production     # Production reference (overridden by hardcoded PROD_BACKEND)
  vite.config.ts
  vercel.json         # SPA rewrites + sitemap proxy routes
  tailwind.config.js
  tsconfig.json
```

## All Routes

### Public Pages
```
/                                → HomePage (hero, explore cards, calculators grid)
/ifsc-finder                     → IFSCFinderPage (cascade search: Bank→State→City→Branch)
/bank/:bankSlug                  → BankPage (bank profile + states list)
/state/:bankSlug/:stateSlug      → StatePage (cities for bank+state)
/city/:bankSlug/:stateSlug/:city → CityPage (branches in city, paginated)
/ifsc/:ifsc                      → IFSCDetailPage (full branch details, JSON-LD)
/credit-cards                    → CreditCards (listing with filters, compare bar)
/credit-cards/compare            → CreditCardCompare (side-by-side, up to 3 cards)
/credit-cards/:slug              → CreditCardDetail (card detail, offers, features)
/bank-accounts                   → BankAccounts (stub)
/loans                           → Loans (stub)
/money-guides                    → BlogListingPage (paginated, category tabs, search)
/money-guides/:slug              → BlogDetailPage (Markdown, TOC sidebar, related posts)
/calculators                     → CalculatorsIndexPage (directory)
/calculators/emi                 → EMICalculatorPage
/calculators/home-loan-emi       → Home Loan EMI
/calculators/sip                 → SIPCalculatorPage
/calculators/lumpsum             → Lumpsum Calculator
/calculators/goal-sip            → Goal SIP
/calculators/swp                 → SWP Calculator
/calculators/step-up-sip         → Step-Up SIP
/calculators/fd                  → FDCalculatorPage
/calculators/rd                  → RD Calculator
/calculators/ppf                 → PPF Calculator
/calculators/nps                 → NPS Calculator
/calculators/cagr                → CAGR Calculator
/calculators/xirr                → XIRR Calculator
/calculators/gst                 → GST Calculator
/calculators/salary              → SalaryCalculatorPage
/calculators/hra                 → HRACalculatorPage
/calculators/income-tax          → IncomeTaxCalculator
/calculators/mutual-fund         → MutualFundCalculatorPage
/calculators/home-loan-eligibility     → EligibilityCalculatorPage
/calculators/personal-loan-eligibility → EligibilityCalculatorPage
/calculators/home-prepayment     → PrepaymentCalculatorPage
/calculators/personal-prepayment → PrepaymentCalculatorPage
/about                           → AboutPage
```

### Admin Pages (JWT-protected)
```
/admin/login                     → Login page
/admin/dashboard                 → Stats overview
/admin/credit-cards              → Manage credit cards
/admin/credit-cards/new          → Add new card
/admin/credit-cards/:slug        → View card detail
/admin/credit-cards/:slug/edit   → Edit card
```

## Key UX Pattern: Cascade Filtering

Core IFSC user flow: **Bank → State → City → Branch → IFSC detail**

- Each dropdown narrows the next
- States only shows states where the selected bank has branches (via `getStatesByBank`)
- Breadcrumb navigation on all cascade pages

## Calculator Layout

All calculator pages use `CalculatorLayout` wrapper with `ToolsSidebar`:
- Left: calculator inputs, results, charts
- Right sidebar: links to related calculators
- All calculators are **client-side only** — no API calls

## API Client

Two axios instances:

**`src/utils/api.ts` → `apiClient`** — public pages
**`src/admin/utils/adminApi.ts` → `adminApi`** — admin pages (auto-attaches JWT, redirects on 401)

Both resolve backend URL at build time:
```ts
if (import.meta.env.PROD) return 'https://rupeepedia-backend.onrender.com/api'
// dev: uses VITE_API_URL=http://localhost:3001 → http://localhost:3001/api
```

Axios timeout: 30s (Neon cold starts can be slow).

TanStack Query stale times: 5min for lists, 1h for IFSC detail pages.

### Typed API Methods (`src/utils/api.ts`)

**IFSC / Cascade**
- `api.getBanks()` → all banks with `slug`, `logo_url`
- `api.getStates()` → all states with `logo_url`
- `api.getStatesByBank(bankSlug)` → states where bank operates (with `branchCount`)
- `api.getCities(bankSlug, stateSlug)` → cities for bank+state
- `api.getBranchesByCity(bankSlug, stateSlug, citySlug, page, limit)` → paginated branches
- `api.getByIfsc(ifsc)` → full branch detail
- `api.getNearbyBranches(ifsc)` → nearby branches (same bank+city)
- `api.getDistricts(stateId, bankId?)` → districts for state/bank
- `api.getBranches(bankId, stateId, districtId?)` → branch list
- `api.getBankPage(slug)` → SEO bank page data
- `api.getStatePage(slug)` → SEO state page data
- `api.getCityPage(slug)` → SEO city page data
- `api.getStats()` → DB stats (total branches, banks, states)
- `api.search(q)` → IFSC / branch name search

**Blog**
- `api.getBlogs(params)` → paginated list (page, limit, category, search)
- `api.getBlogBySlug(slug)` → full blog with related articles
- `api.getBlogCategories()` → category counts
- `api.getFeaturedBlogs()` → featured blogs (max 5)

**Products (Credit Cards)**
- `apiClient.get('/products?...')` → product listing with filters
- `apiClient.get('/products/:slug')` → product detail with offers + features
- `apiClient.get('/credit-cards/stats')` → stats
- `apiClient.get('/credit-cards/categories')` → categories
- `apiClient.get('/credit-cards/banks')` → banks with cards

## Design System

- **Colors:** `brand-50` to `brand-950` (blue), `gold-400/500/600`
- **Fonts:** Playfair Display (headings via `.font-display`), DM Sans (body), JetBrains Mono (IFSC codes via `.ifsc-mono`)
- **Reusable classes:** `.card`, `.btn-primary`, `.btn-secondary`, `.hero-bg`, `.ifsc-mono`
- **IFSC transfer badges:** NEFT=blue, RTGS=violet, IMPS=rose, UPI=green

## Images & Logos

- Bank logos: `<img src={bank.logo_url}>` — path like `/images/banks/Hdfc_Bank.webp`
- State logos: `<img src={state.logo_url}>` — path like `/images/states/andhra-pradesh.webp`
- Blog covers: Unsplash URLs stored in `coverImage` field
- Always check `logo_url` before rendering `<img>` — 718 banks have no logo

## Build Commands

```bash
# Dev server (port 3000, proxies /api → localhost:3001)
npm run dev

# Production build
npm run build        # tsc + vite build → outputs to dist/

# Preview production build locally
npm run preview
```

## Deployment (Vercel)

- **Platform:** Vercel
- **Domain:** rupeepedia.in
- **Root directory in Vercel project:** `frontend/`
- **Build command:** `npm run build` (auto-detected)
- **Output directory:** `dist`
- **SPA routing:** all paths rewrite to `/index.html` via `frontend/vercel.json`
- **Sitemap routes:** proxied to backend via `frontend/vercel.json`
- **Trigger:** auto-deploys on push to `main`
- **Env vars:** none needed in dashboard — backend URL is hardcoded in `api.ts`
