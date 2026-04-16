# SEO & URL Rules

## URL Patterns

### IFSC Lookup
```
/                                → Homepage
/ifsc-finder                     → Cascade search tool
/bank/:bankSlug                  → Bank profile (lists states)
/state/:bankSlug/:stateSlug      → Cities for bank+state
/city/:bankSlug/:stateSlug/:city → Branches in city
/ifsc/:code                      → IFSC detail page
/state/:stateName                → State standalone page
/city/:cityName                  → City standalone page
```

### Credit Cards
```
/credit-cards                    → Card listing with filters
/credit-cards/:slug              → Card detail page
```

### Money Guides (Blog)
```
/money-guides                    → Blog listing with category tabs
/money-guides/:slug              → Full article page
```

### Calculators
```
/calculators                     → Calculator directory
/calculators/emi                 → EMI Calculator
/calculators/sip                 → SIP Calculator
/calculators/fd                  → FD Calculator
/calculators/rd                  → RD Calculator
/calculators/ppf                 → PPF Calculator
/calculators/salary              → Salary Calculator
/calculators/hra                 → HRA Calculator
/calculators/income-tax          → Income Tax Calculator
/calculators/*                   → 20+ more calculators
```

### Admin (not indexed)
```
/admin/login                     → Admin login
/admin/dashboard                 → Dashboard
/admin/credit-cards              → Product management
/admin/credit-cards/new          → Add card
/admin/credit-cards/:slug/edit   → Edit card
```

## Structured Data (JSON-LD)

### IFSC Detail Pages
- **BreadcrumbList**: Home > IFSC Finder > Bank > State > IFSC
- **BankOrCreditUnion**: bank name, address, geo coordinates, phone
- **FAQPage**: common questions about the IFSC code

### Blog Detail Pages
- **Article**: title, description, datePublished, author ("Rupeepedia"), image (coverImage URL)
- **BreadcrumbList**: Home > Money Guides > Category > Title

### Homepage
- **WebSite**: name, URL, search action

## Sitemap

- Auto-generated from all Branch IFSC codes
- Split into multiple files if >50k URLs
- `sitemap.xml` endpoint in backend `index.ts`
- Generator script: `scripts/generate_sitemap.py`
- Should include: IFSC pages, bank pages, state pages, city pages, blog pages, calculator pages, credit card pages
- Refresh monthly (after IFSC sync)

## Meta Tags

### IFSC Pages
- Title: `{BranchName} - {BankName} IFSC: {Code} | Rupeepedia`
- Description: `{BankName} branch at {City}, {State}. IFSC: {Code}, MICR: {Micr}. Address: {Address}`

### Blog Pages
- Title: `{BlogTitle} | Money Guides | Rupeepedia`
- Description: Blog's `description` field (SEO meta, under 160 chars)
- OG image: Blog's `coverImage` URL

### Calculator Pages
- Title: `{CalculatorName} Calculator | Rupeepedia`
- Description: Generated via `src/utils/seo.ts`

### Credit Card Pages
- Title: `{CardName} - Features, Offers & Benefits | Rupeepedia`
- Description: Card summary with key features

## SEO Utility

`frontend/src/utils/seo.ts` — generates titles and descriptions for all page types. Used by Helmet in each page component.

## Domain

Production: **rupeepedia.in**

## Robots & Indexing

- Admin pages should have `<meta name="robots" content="noindex">` (not public content)
- Blog listing and detail pages are fully indexable
- Calculator pages are fully indexable
- Sitemap URL in robots.txt
