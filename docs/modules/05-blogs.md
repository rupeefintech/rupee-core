# Module: Blogs

Editorial content system. Blog posts are written in Markdown and stored in PostgreSQL. Posts are auto-generated via an AI cron script and can be managed via the admin. See also `docs/rules/07-blog-system.md` for editorial guidelines.

## Frontend Pages

| File | URL Route | Purpose |
|---|---|---|
| `src/pages/BlogListingPage.tsx` | `/blog` | Paginated blog index with category filter |
| `src/pages/BlogDetailPage.tsx` | `/blog/:slug` | Full blog post rendered from Markdown |

## Backend API Endpoints

In `backend/src/routes/api.ts`:

| Method | Path | Returns |
|---|---|---|
| `GET` | `/blogs?page=&limit=&category=&search=` | Paginated blog list |
| `GET` | `/blogs/categories` | All categories with post counts |
| `GET` | `/blogs/featured` | Featured posts (isFeatured = true) |
| `GET` | `/blogs/:slug` | Full post content + related posts |

Admin endpoints in `backend/src/routes/adminRoutes.ts`:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/admin/blogs` | Create a blog post |
| `PUT` | `/admin/blogs/:id` | Update a blog post |
| `DELETE` | `/admin/blogs/:id` | Delete a blog post |

## Database Tables Touched

| Table | Usage |
|---|---|
| `blogs` | All blog post data including full Markdown content |

## Blog Auto-Generation

A cron script generates blog posts via Claude API:
- Script: `scripts/generate-blog.ts` (runs via GitHub Actions)
- Workflow: `.github/workflows/generate-blog.yml`
- Frequency: scheduled (see workflow file)
- Posts are inserted directly into the `blogs` table via the API

See `docs/rules/07-blog-system.md` for content guidelines and topic strategy.

## Data Fields

| Field | Notes |
|---|---|
| `slug` | URL-safe unique key, auto-generated from title |
| `category` | e.g. `credit-cards`, `ifsc`, `loans`, `banking` |
| `tags` | PostgreSQL text array |
| `content` | Full Markdown — rendered with `react-markdown` + `remark-gfm` |
| `read_time` | e.g. `5 min read` — manually set or auto-calculated |
| `is_published` | `false` = draft, not visible on site |
| `is_featured` | Shown in featured section on blog index |

## Known Gaps

- No admin UI for blogs yet (only API endpoints exist)
- No tag-based filtering on the listing page
- No comment or engagement system
- Related posts logic is basic (same category)
