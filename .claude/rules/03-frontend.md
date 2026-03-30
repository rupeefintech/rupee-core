# Frontend Rules

## Stack

React 18 + Vite + TailwindCSS + TanStack Query + React Router 6 + Framer Motion

## Key UX Pattern: Cascade Filtering

Core user flow: **Bank → State → City/District → Branch → IFSC details**

- Only show states where the selected bank actually has branches (not all 43)
- Powered by BankStatePresence table on backend
- Each step narrows the next dropdown

## Routing

```
/                         → Homepage (search + popular banks)
/bank/:bankSlug           → Bank page (list states)
/bank/:bankSlug/:state    → Bank+State (list branches)
/ifsc/:code               → IFSC detail page
```

## Data Fetching

- Use TanStack Query for all API calls
- API base: `/api` (proxied in dev via Vite config)
- Stale time: 5min for lists, 24h for IFSC details

## Design Reference

Target UX inspired by ifsc.co:
- Popular banks grid with logos on homepage
- Breadcrumb navigation (Bank > State > City > Branch)
- Detail page: bank info card + branch details + services (NEFT/RTGS/IMPS/UPI) + Google Maps link
- JSON-LD structured data on detail pages (BreadcrumbList + LocalBusiness schema)
