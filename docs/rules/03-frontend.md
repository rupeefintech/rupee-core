# Frontend Rules

## Stack

React 18 + Vite + TailwindCSS + TanStack Query + React Router 6 + Framer Motion + react-helmet-async

## Key UX Pattern: Cascade Filtering

Core user flow: **Bank → State → City/District → Branch → IFSC details**

- IFSC Finder page (`IFSCFinderPage.tsx`): Bank → State (filtered by bank via `getStatesByBank`) → District → Branch
- SEO cascade pages: `/bank/:slug` → `/state/:bank/:state` → `/city/:bank/:state/:city` → `/ifsc/:code`
- Each step narrows the next dropdown/grid
- States dropdown only shows states where the selected bank has branches

## Routing

### Public Pages
```
/                                → HomePage (hero, explore cards, calculators grid)
/ifsc, /ifsc-finder              → IFSCFinderPage (cascade search)
/bank/:bank                      → BankPage (bank profile + state list)
/state/:bank/:state              → StatePage (cities for bank+state)
/city/:bank/:state/:city         → CityPage (branches in a city)
/ifsc/:ifsc                      → IFSCDetailPage (full branch details)
/state/:state                    → StatePage (standalone)
/city/:city                      → CityPage (standalone)
/credit-cards                    → CreditCards (card listing with filters)
/credit-cards/:slug              → CreditCardDetail (card details, offers, features)
/money-guides                    → BlogListingPage (blog listing with category tabs + search)
/money-guides/:slug              → BlogDetailPage (full article with Markdown, TOC sidebar)
/calculators                     → CalculatorsIndexPage (calculator directory)
/calculators/emi                 → EMICalculatorPage
/calculators/sip                 → SIPCalculatorPage
/calculators/fd                  → FDCalculatorPage
/calculators/rd                  → RDCalculatorPage
/calculators/ppf                 → PPFCalculatorPage
/calculators/salary              → SalaryCalculatorPage
/calculators/hra                 → HRACalculatorPage
/calculators/income-tax          → IncomeTaxCalculatorPage
/calculators/*                   → More calculator pages (20+ total)
/about                           → AboutPage
```

### Admin Pages (JWT-protected)
```
/admin/login                     → Admin login
/admin/dashboard                 → Dashboard with stats
/admin/credit-cards              → Manage credit cards
/admin/credit-cards/new          → Add new card
/admin/credit-cards/:slug        → View card details
/admin/credit-cards/:slug/edit   → Edit card
```

## Calculator Layout

Calculator pages use `CalculatorLayout` wrapper with `ToolsSidebar`:
- Left: calculator content (inputs, results, charts)
- Right sidebar: links to other calculators in the same category
- Categories defined in `src/utils/calculators.ts`
- All calculators are client-side only (no API calls)

## Blog System (Money Guides)

### BlogListingPage
- Gradient hero with search bar
- Category filter tabs (All, Tax, Banking, Investment, Credit Cards, Loans)
- Featured card (first item if featured)
- Paginated blog grid with cover images, category badges, read time

### BlogDetailPage
- Breadcrumbs: Home → Money Guides → Category → Title
- Cover image hero with category badge, reading time, date
- Markdown content rendered via `MarkdownRenderer`
- TOC sidebar (auto-generated from h2 headings via `extractHeadings()`)
- Related articles section (same category)
- JSON-LD structured data (Article schema)
- Category colors: Tax=purple, Banking=blue, Investment=emerald, Credit Cards=amber, Loans=rose

### MarkdownRenderer (`src/components/MarkdownRenderer.tsx`)
- Uses `react-markdown` with `remark-gfm` + `rehype-raw` + `rehype-slug`
- Custom component overrides: h2, h3, h4, p, a (internal→Link, external→target blank), ul, ol, li, blockquote, table, img, code, pre, hr, strong
- Custom HTML div components via className matching:
  - `concept-grid` / `concept-card` / `concept-title` / `concept-desc` — key concepts grid
  - `stats-row` / `stat-card` / `stat-value` / `stat-label` — statistics row
  - `highlight-box` — key example or scenario
  - `verdict-box` — summary recommendation
  - `vs-grid` / `vs-card` / `vs-title` — side-by-side comparison
  - `cta-box` — call-to-action box
- Callout detection from blockquote emoji: 💡=tip(green), ⚠️=warning(amber), 📌=note(violet)
- CSS list styling: `.md-ul` uses blue dot bullets, `.md-ol` uses CSS counters with numbered prefixes

## API Client (`src/utils/api.ts`)

### IFSC Methods
- `api.getBanks()` → all banks with slug, logo_url
- `api.getStates()` → all states with logo_url
- `api.getStatesByBank(slug)` → states filtered by bank (with branchCount)
- `api.getCities(bankSlug, stateSlug)` → cities for bank+state
- `api.getBranchesByCity(bankSlug, stateSlug, citySlug)` → branches
- `api.getByIfsc(code)` → full IFSC details

### Blog Methods
- `api.getBlogs(params)` → paginated list (page, limit, category, search)
- `api.getBlogBySlug(slug)` → full blog with related articles
- `api.getBlogCategories()` → category counts
- `api.getFeaturedBlogs()` → featured blogs (max 5)

### Product Methods
- `api.getProducts(params)` → product listing
- `api.getProductBySlug(slug)` → product details with offers

Axios timeout: 30s (Neon cold starts can be slow).

## Logos & Images

- Bank logos: `<img src={bank.logo_url}>` — path like `/images/banks/Hdfc_Bank.webp`
- State logos: `<img src={state.logo_url}>` — path like `/images/states/andhra-pradesh.webp`
- Blog covers: Unsplash URLs stored in `coverImage` field
- Card images: Direct URLs in `cardImageUrl` field
- Served from `frontend/public/images/` (Vite static)
- Always check `logo_url` before rendering `<img>` — 718 banks have no logo

## Design System

- Colors: `brand-50` to `brand-950` (blue tones), `gold-400/500/600`
- Fonts: Playfair Display (headings), DM Sans (body), JetBrains Mono (IFSC codes)
- Components: `.card`, `.btn-primary`, `.btn-secondary`, `.ifsc-mono`, `.hero-bg`
- IFSC detail page: colorful transfer method cards (NEFT=blue, RTGS=violet, IMPS=rose)
- Bank identity card with gradient background
- Breadcrumb navigation on all cascade pages

## Data Fetching

- Use TanStack Query for all API calls
- API base: `/api` (proxied in dev via Vite config to localhost:3001)
- Stale time: 5min for lists, 1h for IFSC details
- Frontend runs on port 3000 (`strictPort: true`), backend on 3001

## Structured Data (JSON-LD)

### IFSC Detail Pages
- **BreadcrumbList**: Home > IFSC Finder > Bank > State > IFSC
- **BankOrCreditUnion**: bank name, address, geo, phone
- **FAQPage**: common questions about the IFSC code

### Blog Detail Pages
- **Article**: title, description, datePublished, author, image
- **BreadcrumbList**: Home > Money Guides > Category > Title
