# Module: Blogs (Money Guides)

Editorial content system. Blog posts are written in Markdown and stored in PostgreSQL. Posts are auto-generated daily via Claude API + GitHub Actions and rendered with a custom Markdown renderer. The frontend section is at `/money-guides`.

## Frontend Pages

| File | URL Route | Purpose |
|---|---|---|
| `src/pages/BlogListingPage.tsx` | `/money-guides` | Paginated blog index with category filter tabs + search |
| `src/pages/BlogDetailPage.tsx` | `/money-guides/:slug` | Full blog post rendered from Markdown, TOC sidebar |

### BlogListingPage features
- Gradient hero with search bar
- Category filter tabs: All, Tax, Banking, Investment, Credit Cards, Loans
- Featured card (first item if `isFeatured = true`)
- Paginated blog grid with cover images, category badges, read time

### BlogDetailPage features
- Breadcrumbs: Home → Money Guides → Category → Title
- Cover image hero with category badge, reading time, date
- Markdown content via `MarkdownRenderer` component
- TOC sidebar (auto-generated from h2 headings via `extractHeadings()`)
- Related articles (same category)
- JSON-LD Article structured data

## Backend API Endpoints

| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/blogs?page=&limit=&category=&search=` | Paginated blog list |
| `GET` | `/api/blogs/categories` | All categories with post counts |
| `GET` | `/api/blogs/featured` | Featured posts (`isFeatured = true`) |
| `GET` | `/api/blogs/:slug` | Full post content + related posts |

**IMPORTANT:** `/categories` and `/featured` routes must be registered BEFORE `/:slug` in `api.ts` or slug will match them.

## Database Tables Touched

| Table | Usage |
|---|---|
| `blogs` | All blog post data including full Markdown content |

## Auto-Generation Pipeline

### How It Works
```
Topic Queue (60 topics in blog-topics.ts)
  → Check which topics are unpublished (query DB)
  → Pick next topic
  → Claude Sonnet generates 1,500–2,500 word Markdown article
  → Claude Haiku generates SEO meta description
  → Unsplash fetches cover image (keywords + "india rupee")
  → Insert into blogs table
  → Frontend auto-displays it (no deploy needed)
```

### Schedule
- GitHub Actions cron: **4 AM UTC (9:30 AM IST) daily**
- Workflow: `.github/workflows/generate-blog.yml`
- Manual trigger available via `workflow_dispatch`

### Scripts
| File | Purpose |
|---|---|
| `backend/scripts/generate-blog.ts` | Main generation script |
| `backend/scripts/blog-topics.ts` | 60 topics with slugs, keywords, internal links |
| `backend/scripts/seed-blogs.ts` | Seeds pre-written starter blogs |
| `backend/scripts/create-blog-table.ts` | Creates the `blogs` table via raw SQL |

### Topic Categories (60 total)
| Category | Count | Examples |
|---|---|---|
| Tax | 15 | Income tax slabs, Section 80C, HRA, TDS, ITR filing |
| Banking | 10 | IFSC codes, NEFT vs RTGS, UPI limits, cheque bounce |
| Credit Cards | 10 | Best cashback cards, credit score, reward points |
| Investment | 15 | SIP vs lumpsum, PPF, NPS, mutual funds, gold |
| Loans | 10 | Home loan, EMI formula, prepayment, CIBIL score |

### GitHub Secrets Required
| Secret | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `DIRECT_URL` | Yes | Neon direct connection (for Prisma) |
| `ANTHROPIC_API_KEY` | Yes | Claude API key for blog generation |
| `UNSPLASH_ACCESS_KEY` | Optional | Unsplash API for cover images |

## How to Add Blogs Manually

### Method 1: AI-Generated
```bash
# Generate next unpublished topic from queue
cd backend && npx ts-node scripts/generate-blog.ts

# Generate a specific topic
cd backend && npx ts-node scripts/generate-blog.ts --slug home-loan-guide
```
Requires `ANTHROPIC_API_KEY`.

### Method 2: Seed Script (Pre-Written)
Add blog data to `backend/scripts/seed-blogs.ts` then:
```bash
cd backend && npx ts-node scripts/seed-blogs.ts
```

### Method 3: Direct DB Insert
```bash
cd backend && npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.blog.create({ data: {
  slug: 'my-blog-slug',
  title: 'Blog Title Here',
  description: 'SEO description under 160 chars',
  category: 'Tax',           // Tax, Banking, Investment, Credit Cards, Loans
  tags: ['tag1', 'tag2'],
  coverImage: 'https://images.unsplash.com/photo-xxx?w=1200&h=600&fit=crop',
  content: '## Section 1\n\nMarkdown content here...',
  readTime: '5 min read',
  isPublished: true,
  isFeatured: false,
}}).then(b => console.log('Created:', b.slug)).finally(() => p.\$disconnect());
"
```

## Blog Content Format

Each blog uses Markdown with custom HTML for rich visuals:

### Stats Row
```html
<div class="stats-row">
  <div class="stat-card">
    <div class="stat-value">4.5 Cr+</div>
    <div class="stat-label">Active SIPs</div>
  </div>
</div>
```

### Concept Cards
```html
<div class="concept-grid">
  <div class="concept-card">
    <div class="concept-title">💰 Rupee Cost Averaging</div>
    <div class="concept-desc">Description here...</div>
  </div>
</div>
```

### Side-by-Side Comparison
```html
<div class="vs-grid">
  <div class="vs-card"><div class="vs-title">Option A</div>content...</div>
  <div class="vs-card"><div class="vs-title">Option B</div>content...</div>
</div>
```

### Highlight / Verdict Boxes
```html
<div class="highlight-box">Key example or scenario</div>
<div class="verdict-box">### The Verdict\nSummary recommendation</div>
```

### Callouts (auto-detected from blockquote emoji)
```markdown
> 💡 **Pro Tip:** Renders as green tip callout
> ⚠️ **Warning:** Renders as amber warning callout
> 📌 **Note:** Renders as violet note callout
```

## MarkdownRenderer Component

`frontend/src/components/MarkdownRenderer.tsx` — renders Markdown with styled components.

Uses: `react-markdown` + `remark-gfm` + `rehype-raw` + `rehype-slug`

Custom overrides: `h2`, `h3`, `h4`, `p`, `a` (internal→`<Link>`, external→`target=_blank`), `ul`, `ol`, `li`, `blockquote`, `table`, `img`, `code`, `pre`, `hr`, `strong`

Custom HTML div components matched by `className`:
- `concept-grid` / `concept-card` / `concept-title` / `concept-desc` — key concepts grid
- `stats-row` / `stat-card` / `stat-value` / `stat-label` — statistics row
- `highlight-box` — key example or scenario
- `verdict-box` — summary recommendation
- `vs-grid` / `vs-card` / `vs-title` — comparison
- `cta-box` — call-to-action

Category colors: Tax=purple, Banking=blue, Investment=emerald, Credit Cards=amber, Loans=rose

## Known Gaps

- No admin UI for blogs (only API endpoints exist)
- No tag-based filtering on listing page
- No comment or engagement system
- Related posts logic is basic (same category only)
- Topic queue has 60 topics — add more to `blog-topics.ts` as needed
