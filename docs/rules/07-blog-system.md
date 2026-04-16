# Blog System — Money Guides

> Last updated: 15 April 2026

## Overview

Rupeepedia publishes AI-generated financial guides ("Money Guides") daily. The system is fully automated — Claude generates Markdown content, Unsplash provides cover images, and GitHub Actions triggers the pipeline.

---

## How It Works

```
Topic Queue (60 topics) → Claude API generates Markdown → Unsplash fetches cover image → PostgreSQL stores blog → Frontend renders with react-markdown
```

### Daily Flow (Automated)

1. GitHub Actions cron fires at **4 AM UTC (9:30 AM IST)** daily
2. Script checks which topics from the queue haven't been published yet
3. Picks the next topic, sends it to Claude API (Sonnet) with a detailed prompt
4. Claude returns 1,500–2,500 word Markdown article with tables, callouts, FAQs, internal links
5. Haiku generates a short SEO meta description
6. Unsplash API fetches a relevant cover image (keywords + "india rupee")
7. Blog is inserted into the `blogs` table
8. Frontend auto-displays it (no deploy needed — API-driven)

---

## Files

| File | Purpose |
|---|---|
| `backend/scripts/blog-topics.ts` | 60 topics across 5 categories with slugs, keywords, internal links |
| `backend/scripts/generate-blog.ts` | Main generation script (Claude + Unsplash + DB insert) |
| `backend/scripts/seed-blogs.ts` | Seeds pre-written starter blogs |
| `backend/scripts/create-blog-table.ts` | Creates the `blogs` table via raw SQL |
| `.github/workflows/generate-blog.yml` | GitHub Actions daily cron |
| `frontend/src/components/MarkdownRenderer.tsx` | Renders Markdown with styled components |
| `frontend/src/pages/BlogListingPage.tsx` | Blog listing with filters, pagination |
| `frontend/src/pages/BlogDetailPage.tsx` | Full article page with TOC sidebar |

---

## Topic Categories (60 total)

| Category | Count | Examples |
|---|---|---|
| Tax | 15 | Income tax slabs, Section 80C, HRA, TDS, ITR filing |
| Banking | 10 | IFSC codes, NEFT vs RTGS, UPI limits, cheque bounce |
| Credit Cards | 10 | Best cashback cards, credit score, reward points |
| Investment | 15 | SIP vs lumpsum, PPF, NPS, mutual funds, gold |
| Loans | 10 | Home loan, EMI formula, prepayment, CIBIL score |

---

## Blog Content Format

Each blog uses Markdown with custom HTML for rich visuals:

### Stats Row (top of article)
```html
<div class="stats-row">
  <div class="stat-card"><div class="stat-value">4.5 Cr+</div><div class="stat-label">Active SIPs</div></div>
  ...
</div>
```

### Concept Cards (key concepts grid)
```html
<div class="concept-grid">
  <div class="concept-card">
    <div class="concept-title">💰 Rupee Cost Averaging</div>
    <div class="concept-desc">Description here...</div>
  </div>
  ...
</div>
```

### Comparison (side-by-side)
```html
<div class="vs-grid">
  <div class="vs-card"><div class="vs-title">Option A</div>content...</div>
  <div class="vs-card"><div class="vs-title">Option B</div>content...</div>
</div>
```

### Highlight Box, Verdict Box
```html
<div class="highlight-box">Key example or scenario</div>
<div class="verdict-box">### The Verdict\nSummary recommendation</div>
```

### Callouts (auto-detected from blockquote content)
```markdown
> 💡 **Pro Tip:** This renders as a green tip callout
> ⚠️ **Warning:** This renders as an amber warning callout
> 📌 **Note:** This renders as a violet note callout
```

---

## How to Add Blogs

### Method 1: AI-Generated (Recommended)

```bash
# Generate next unpublished topic from queue
cd backend && npx ts-node scripts/generate-blog.ts

# Generate a specific topic
cd backend && npx ts-node scripts/generate-blog.ts --slug home-loan-guide
```

Requires `ANTHROPIC_API_KEY` environment variable.

### Method 2: Manual (Pre-Written Content)

1. Add blog data to `backend/scripts/seed-blogs.ts`
2. Run: `cd backend && npx ts-node scripts/seed-blogs.ts`

### Method 3: Direct Database Insert

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

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/blogs?page=1&limit=12&category=Tax&search=...` | Paginated list |
| GET | `/api/blogs/:slug` | Full blog + related articles |
| GET | `/api/blogs/categories` | Category counts |
| GET | `/api/blogs/featured` | Featured blogs (max 5) |

---

## GitHub Actions Setup

Add these secrets to your GitHub repo:

| Secret | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `DIRECT_URL` | Yes | Neon direct connection (for Prisma) |
| `ANTHROPIC_API_KEY` | Yes | Claude API key for blog generation |
| `UNSPLASH_ACCESS_KEY` | Optional | Unsplash API for cover images |

Workflow file: `.github/workflows/generate-blog.yml`

---

## Current Blog Count

7 published articles (as of 15 April 2026). At 1/day, the 60-topic queue will last ~2 months. Add more topics to `blog-topics.ts` as needed.
