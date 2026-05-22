# Module 08 — PIN Code Directory

## Status: Live

## Overview

India Post PIN code lookup. 150,000+ post offices across 28 states and 8 union territories. Three search modes: by PIN code, by post office name, by location cascade.

## Pages

| Route | Component | Purpose |
|---|---|---|
| `/pin-codes` | `PinCodesPage.tsx` | Search landing — 3-tab search, features bento, FAQ, Why Use section |
| `/pin/:pincode` | `PinCodePage.tsx` | Detail page — post offices, banks, sidebar, FAQ |

## PinCodesPage Layout (Desktop + Mobile)

**Hero:** light `#f9f9ff` bg, large h1, indigo chip label  
**Search card:**
- Desktop: bottom-border tab indicator (PIN Code / Post Office / Location)
- Mobile: pill-style tab switcher inside `bg-[#e9edff]` container
- `ByPinCode`: navigates directly to `/pin/:pin` on submit
- `ByPostOffice`: shows `ResultsList` — each row links to `/pin/:pin`
- `ByLocation`: State → District → PIN cascading dropdowns → "View Details" button navigates

**Below search card (mobile only):** 2-col quick links (Browse by State, IFSC Finder)

**Features bento:** "Why Rupeepedia?" — 2-col Verified Data card + IFSC Finder card + Browse by Location  
**Why Use section:** 4 indigo-gradient icon cards (Pan-India DB, Verified Records, Instant Access, 100% Free)  
**FAQ section:** 5 questions (What is PIN Code?, how to verify, data freshness, HO/SO/BO difference, search by location)  
**CTA:** IFSC Finder cross-link

## PinCodePage Layout

**Hero:** light bg, breadcrumb (Home → PIN Codes → PIN), h1 with PIN number, share/bookmark buttons, 4-stat row  
**Bento grid (8+4):**

Left column (8):
1. Post Office Primary Details card — headline office, 2-col grid (Branch Name, Type, District, State, Address, Delivery Status)
2. All Post Offices table — if PIN has >1 office
3. HO/SO/BO explainer card — 3-col grid with descriptions
4. About PIN Code — prose with zone, circle, digit breakdown
5. Banks section — filter input + accordion cards (mobile) / table (desktop), show-more toggle
6. AdUnit (mid)
7. FAQ accordion — 5 questions, border-bottom on mobile / card on desktop
8. Back nav

Right sidebar (4):
1. Location Profile — purple `indigo-700` card (postal circle, state, district)
2. Quick Reference — zone, region, sort district, delivery code
3. Nearby PINs — 2-col grid from `districtOffices` query (up to 8)
4. IFSC cross-link CTA

## API Endpoints

All under `/api/pin/`:
- `GET /api/pin/:pin` — main detail endpoint
- `GET /api/pin/states` — distinct states
- `GET /api/pin/states/:state/districts` — districts per state
- `GET /api/pin/districts/:state/:district/pins` — PINs in district
- `GET /api/pin/search/office?q=` — office name search
- `GET /api/pin/district-offices?state=&district=&excludePin=` — nearby PINs

## Database

Table: `post_offices` (Prisma: `PostOffice`)  
See `docs/setup/database.md` for full schema.

Key: multiple offices share one `pin_code` — always group by PIN.  
Headline office priority: H.O > S.O > B.O (first match).

## Design System

Uses Stitch indigo palette — NOT the site-wide `brand-*` violet:
- Primary: `#3525cd` (deep indigo)
- Primary container: `#4f46e5` = Tailwind `indigo-600`
- Accent soft: `#EEF2FF` = Tailwind `indigo-50`
- Surface: `#f9f9ff`
- Classes: `indigo-*` Tailwind + `[#3525cd]` arbitrary values

## Mobile Specifics

- Tabs: pill switcher (`sm:hidden`)
- Search button: full-width `Search Now →` below input (`sm:hidden`)
- Quick links: 2-col "Browse by State" + "IFSC Finder" bento (mobile only)
- Banks: accordion cards on mobile (`sm:hidden`), table on desktop (`hidden sm:block`)
- FAQ: border-bottom style on mobile, card style on desktop
- Stats row: `flex-wrap` for small screens
- Share button: icon-only on mobile

## HO / SO / BO Explainer

Present on every PinCodePage, in left column after post offices:
- H.O (amber) — district hub, full services
- S.O (indigo) — urban areas, near-full services  
- B.O (emerald) — rural/villages, limited services

## SEO

- Canonical: `https://rupeepedia.in/pin/:pin`
- JSON-LD: BreadcrumbList + FAQPage schemas
- Dynamic title: `PIN Code {pin} — {officeName}, {district}`
- Dynamic description: uses `stats.post_office_count`, `stats.branch_count`, zone, state
