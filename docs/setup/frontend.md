# Frontend Setup

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI Framework | React | 18 |
| Build Tool | Vite | 5 |
| Language | TypeScript | 5 |
| Styling | TailwindCSS | 3 |
| Routing | React Router | 6 |
| Data Fetching | Axios + TanStack Query | — |
| Animations | Framer Motion | 11 |
| SEO | React Helmet Async | 2 |
| Markdown | react-markdown + remark-gfm | — |
| Notifications | react-hot-toast | — |

## File Structure

```
frontend/
  src/
    pages/            # Route-level pages (one file per page)
    components/       # Shared UI components
    admin/
      pages/          # Admin dashboard pages
      components/     # Admin-only components (Sidebar, Header)
      layout/         # AdminLayout wrapper
      utils/
        adminApi.ts   # Axios instance for admin API calls
    utils/
      api.ts          # Axios instance (apiClient) + all typed API methods
      seo.ts          # SEO title/description generator
    styles/
      globals.css     # Tailwind base + custom classes (card, hero-bg, ifsc-mono)
    App.tsx           # Router + layout shell
    main.tsx          # React entry point
  public/
    images/
      banks/          # 634 bank logos (WebP, Title_Case e.g. Hdfc_Bank.webp)
      states/         # 35 state images (lowercase-dashed e.g. andhra-pradesh.webp)
    robots.txt
    sitemap.xml
  .env                # Local dev (VITE_API_URL=http://localhost:3001)
  .env.production     # Production reference (overridden by hardcoded PROD_BACKEND)
  vite.config.ts
  vercel.json         # Used by frontend/vercel.json for SPA rewrites + sitemap proxies
  tailwind.config.js
  tsconfig.json
```

## API Client

Two axios instances exist:

**`src/utils/api.ts` → `apiClient`**
Used by all public-facing pages.

**`src/admin/utils/adminApi.ts` → `adminApi`**
Used by all admin pages. Automatically attaches JWT token from `localStorage` and redirects to `/admin/login` on 401/403.

Both resolve the backend URL via the same logic:
```ts
if (import.meta.env.PROD) return 'https://rupeepedia-backend.onrender.com/api'
// dev: falls through to VITE_API_URL=http://localhost:3001 → http://localhost:3001/api
```

## Build Commands

```bash
# Dev server (port 3000, proxies /api → localhost:3001)
npm run dev

# Production build
npm run build        # tsc + vite build → outputs to dist/

# Preview production build locally
npm run preview
```

## Deployment (Vercel)

- **Platform:** Vercel
- **Domain:** rupeepedia.in
- **Root directory in Vercel:** `frontend/`
- **Build command:** `npm run build` (auto-detected by Vercel)
- **Output directory:** `dist`
- **SPA routing:** all paths rewrite to `/index.html` via `frontend/vercel.json`
- **Sitemap routes:** proxied to `https://rupeepedia-backend.onrender.com` via `frontend/vercel.json`
- **Trigger:** auto-deploys on every push to `main`

## Environment Variables

| Variable | Dev | Production |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001` | Not needed — `PROD_BACKEND` is hardcoded |

No env vars need to be set in the Vercel dashboard. The backend URL is hardcoded in `api.ts` and `adminApi.ts` for production builds.
