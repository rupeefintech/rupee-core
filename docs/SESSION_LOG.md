# Session Log

> Running notes updated at the end of each work session. Use this to onboard a new session quickly.

---

## 22 May 2026

### What was done

1. **Google AdSense added:**
   - Script tag inserted in `frontend/index.html` (`ca-pub-9161911570606195`)
   - Confirmed: SPA = one script covers all pages, no per-page addition needed
   - `AdUnit.tsx` component created for inline ad slots

2. **Favicon fixed:**
   - Old favicon: `logo.png` (gold coins chart logo — completely different from site)
   - New: `frontend/public/favicon.svg` — purple gradient rounded square with `₹`, matches navbar icon exactly
   - `index.html` updated: SVG first (modern browsers), PNG fallback

3. **PIN Code module — full implementation:**
   - `PinCodesPage.tsx` (new) — Stitch indigo design
     - Light `#f9f9ff` hero, compact on mobile
     - Desktop: bottom-border tabs; Mobile: pill tabs inside `bg-[#e9edff]`
     - `ByPinCode`: navigates directly to `/pin/:pin` (no inline results)
     - `ByPostOffice`: shows `ResultsList` with "View Details →" links
     - `ByLocation`: cascade dropdowns → "View PIN Code Details" button
     - Mobile: full-width "Search Now →" button, 2-col quick links bento
     - Features bento ("Why Rupeepedia?"), Why Use 4-card section, FAQ, CTA
   - `PinCodePage.tsx` (new) — detail page
     - 8+4 bento grid (left content + right sidebar)
     - Post Office Primary Details card, HO/SO/BO explainer, About, Banks, FAQ
     - Sidebar: Location Profile (purple), Quick Reference, Nearby PINs, IFSC CTA
     - Mobile: accordion banks, border-bottom FAQ, icon-only share button, flex-wrap stats
     - `MobileBankRow` accordion component
     - Full SEO: BreadcrumbList + FAQPage JSON-LD, dynamic title/description

4. **Guides (formerly Money Guides):**
   - URL `/money-guides` kept (SEO preserved)
   - Display label changed to "Guides" across: Navbar (desktop + mobile), HomePage, BlogListingPage
   - Categories updated: added `PIN & Postal` (indigo) + `Gold & Silver` (yellow)
   - Hero description updated to include postal/gold content

5. **About page updated:**
   - Meta title + description updated for PIN codes + gold rates
   - Intro paragraphs rewritten (3 pillars: IFSC, PIN, gold)
   - Features grid: 5→6 cards (added PIN Code Directory, Live Gold & Silver Rates)
   - "Banking Guides" → "Guides & Resources" marked Live
   - Stats bar: added "1,50,000+ Post Offices" replacing "200+ Banks"
   - Privacy: removed false "No ads" claim (AdSense now live)

6. **Blog: Post Office Savings Schemes 2026:**
   - ID 31, slug: `top-5-post-office-savings-schemes-india-2026`
   - Category: `PIN & Postal`
   - 7 min read, 5 schemes (PPF, SCSS, SSY, NSC, POTD)
   - Internal SEO links mapped to real routes:
     - PPF → `/calculators/ppf`, `/calculators/fd`, `/calculators/income-tax`
     - SCSS → `/calculators/fd`, `/calculators/swp`, `/calculators/nps`
     - SSY → `/calculators/ppf`, `/calculators/sip`, `/pin-codes`
     - NSC/POTD → `/calculators/fd`, `/calculators`
     - Post office finder CTA → `/pin-codes`
   - Cover image path: `/images/blogs/post-office-schemes-2026.jpg` (file needs manual drop)
   - Insert/update script: `backend/scripts/insert_blog.mjs`

7. **Docs updated:**
   - `docs/setup/database.md` — added `post_offices` table, indexes, blog categories updated
   - `docs/setup/frontend.md` — added PIN + gold routes, PIN API methods
   - `docs/modules/08-pin-codes.md` — new full module doc

### Current state (as of 2026-05-22)
- PIN code module fully live (both pages, all 3 search modes, mobile optimized)
- Blog #31 live in DB — missing cover image file (user to drop manually)
- AdSense deployed, pending Google verification
- "Guides" rename live everywhere
- Commits: `6f7dddc` (main session), `7b2c9de` (blog SEO links)

### Pending / next steps
- Drop infographic to `frontend/public/images/blogs/post-office-schemes-2026.jpg` → commit
- Google AdSense verification (check "I've placed the code" → Verify in AdSense console)
- Blog admin API — currently blogs inserted via script only, no admin UI
- More `PIN & Postal` category blogs
- 718 banks still missing logo images

---

## 15 April 2026

### What was done
1. **Blog system built end-to-end:**
   - Backend: Blog model in Prisma, `blogs` table via raw SQL, 4 API endpoints (list/detail/categories/featured)
   - Frontend: `BlogListingPage` (category tabs, search, pagination), `BlogDetailPage` (Markdown rendering, TOC sidebar, related articles, JSON-LD)
   - `MarkdownRenderer` component with PolicyBazaar-style custom HTML (concept-grid, stats-row, vs-grid, highlight-box, verdict-box, callouts)
   - 7 pre-written blogs seeded via `seed-blogs.ts`
   - AI blog generator (`generate-blog.ts`) using Claude Sonnet + Unsplash, 60-topic queue
   - GitHub Actions daily cron (`.github/workflows/generate-blog.yml`)

2. **Navbar updated:** Added "Money Guides" link between Calculators and About

3. **Blog cover images:** Fixed to use India-relevant Unsplash queries (appends "india rupee")

4. **Docs cleanup:** Consolidated 21 stale docs into 3 clean files:
   - `docs/PROJECT.md` — full architecture, schema, routes, API, data counts
   - `docs/BLOG_SYSTEM.md` — blog generation, topics, format, API
   - `docs/ADMIN_GUIDE.md` — admin panel, product CRUD, offer versioning

5. **Rules updated:** All 6 files in `docs/rules/` rewritten to cover blog system, products, admin, calculators, all routes, all endpoints

### Current state
- Blog system is fully functional (backend + frontend + AI generation + cron)
- 7 published blogs, 53 topics remaining in queue
- Admin module works for credit card CRUD
- All docs up to date

### Known issues / next steps
- 718 banks still missing logo images
- Blog cover images could be better (Unsplash stock vs custom banners)
- District data quality issues persist (duplicates, cross-state mappings)
- Admin panel pending: banks management page, user management, role-based access, bulk import
- Sitemap needs to include blog and calculator URLs

---

## 30 April 2026

### What was done
1. **Frontend redesign (violet brand):**
   - Brand color changed to violet/purple (`tailwind.config.js`, `globals.css`)
   - `Navbar.tsx` rewritten with Products + Calculators mega menus, mobile hamburger
   - `Footer.tsx` rewritten with 4-column layout (brand, credit cards, calculators, company)
   - `HomePage.tsx` rewritten: dark purple hero, bento feature cards, calculator grid, trust section, guides section
   - All calculator/IFSC/bank/state/city pages updated to new brand colors
   - `ToolsSidebar.tsx` rewritten with accordion categories and violet theme

2. **New pages:**
   - `PrivacyPage.tsx` (`/privacy`) — DPDP Act 2023 compliant, no-personal-data, comprehensive
   - `TermsPage.tsx` (`/terms`) — RBI disclaimer, calculator-not-advice, Indian jurisdiction
   - Both routed in `App.tsx`; footer links to both

3. **New shadcn-style UI components:**
   - `components/ui/button.tsx` — `cva`-based Button with variants
   - `lib/utils.ts` — `cn()` helper with `clsx` + `tailwind-merge`
   - `components/ui/canvas.tsx` — mouse-trail animation (unused, TypeScript-nocheck'd)

4. **Design preview:** `public/preview.html` — standalone static mockup with 4 palette options for comparison

5. **Build fix:** `canvas.tsx` had TypeScript errors (`new n()`, `new Line()`, `pos.x`); fixed with `// @ts-nocheck` at top

### Current state
- Build passes (`npm run build` succeeds)
- All uncommitted changes staged/unstaged — needs a commit
- Privacy + Terms pages live and linked from footer
- New violet-purple design fully implemented

### Known issues / next steps
- 718 banks still missing logo images
- District data quality issues persist
- Admin panel pending: banks management page, user management, RBAC
- Sitemap still needs blog + calculator URLs
- `preview.html` in `/public` — should be removed before deploy (not a real page)
