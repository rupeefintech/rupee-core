# Project Rules

All project documentation is in `docs/`. Read the relevant files based on what you're working on.

## Setup (how the system works)
- `docs/architecture.md` — system overview, data model, module boundaries
- `docs/setup/backend.md` — Express API, all endpoints, critical rules (bank slug, city casing, logos)
- `docs/setup/frontend.md` — React app, all routes, API methods, design system
- `docs/setup/database.md` — all PostgreSQL tables, columns, indexes, data quality issues
- `docs/setup/prisma.md` — model→table map, naming conventions, migration warning
- `docs/setup/seo.md` — URL structure, meta tags, JSON-LD, sitemap
- `docs/setup/data-sync.md` — IFSC sync pipeline, blog generation pipeline

## Modules (what each feature touches)
- `docs/modules/01-ifsc-finder.md` — pages, API routes, DB tables, sync pipeline
- `docs/modules/02-credit-cards.md` — pages, admin pages, API routes, offer versioning
- `docs/modules/03-loans.md` — stub status
- `docs/modules/04-bank-accounts.md` — stub status
- `docs/modules/05-blogs.md` — pages, API routes, auto-gen pipeline, content format
- `docs/modules/06-calculators.md` — all calculator pages, client-side only
- `docs/modules/07-admin.md` — admin panel, auth, JWT, all admin endpoints
