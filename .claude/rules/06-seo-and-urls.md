# SEO & URL Rules

## URL Patterns

```
/                                → Homepage
/bank/:bankSlug                  → Bank page (lists states)
/bank/:bankSlug/:stateSlug       → Bank+State (lists cities/districts)
/ifsc/:code                      → IFSC detail page
/state/:stateName                → State page
/city/:cityName                  → City page
/pincode/:pincode                → Pincode lookup
```

## Structured Data

IFSC detail pages should include:
- **BreadcrumbList** JSON-LD: Home > Bank > State > City > Branch
- **LocalBusiness** JSON-LD: bank name, address, geo coordinates

## Sitemap

- Auto-generated from all Branch IFSC codes
- Split into multiple files if >50k URLs
- `sitemap.xml` endpoint in `api.ts`
- Refresh monthly

## Meta Tags

Each IFSC page: `<title>{BranchName} - {BankName} IFSC: {Code}</title>`
Description: `{BankName} branch at {City}, {State}. IFSC: {Code}, MICR: {Micr}. Address: {Address}`

## Domain

Production: rupeepedia.in (unchanged from bankInfoHub migration)
