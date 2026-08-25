// File: backend/src/index.ts
import './env'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import apiRouter from './routes/api'
import authRoutes from './routes/authRoutes'
import adminRoutes from './routes/adminRoutes'
import chatRouter from './routes/chat'

dotenv.config()

const app      = express()
app.set('trust proxy', 1) // Render sits behind a reverse proxy — needed for correct per-IP rate limiting
const PORT     = Number(process.env.PORT) || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
// v2 — bank filter cache key fix

const ALLOWED_ORIGINS = NODE_ENV === 'development'
  ? true
  : (process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['https://rupeepedia.in', 'https://www.rupeepedia.in'])

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", 'https://pagead2.googlesyndication.com', 'https://www.googletagmanager.com'],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  ["'self'", 'https://rupeepedia-backend.onrender.com', 'https://query2.finance.yahoo.com'],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))
app.use(compression() as any)
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(express.json({ limit: '2mb' }))
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/chat", rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }), chatRouter)

// Test route
app.get("/ping", (req, res) => res.send("pong"))

// ════════════════════════════════════════════════════════════════════════════
// SEO Routes - Sitemaps and Robots
// ════════════════════════════════════════════════════════════════════════════

// Sitemap Index (master sitemap pointing to sub-sitemaps)
// Handles up to 150k+ IFSC codes split into 3 files
app.get('/sitemap.xml', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.set('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://rupeepedia.in/sitemap-static.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-calculators.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-banks.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-states.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-blogs.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-ifsc-1.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-ifsc-2.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-ifsc-3.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-ifsc-4.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-pin.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-credit-cards.xml</loc><lastmod>${today}</lastmod></sitemap>
</sitemapindex>`);
});

// Static pages sitemap
app.get('/sitemap-static.xml', (_req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
  const today = new Date().toISOString().split('T')[0];
  const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/ifsc-finder</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pin-codes</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/gold-rate-today</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/money-guides</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/credit-cards</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/bank-holidays</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/what-is-ifsc-code</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pin-code-india</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/gold-hallmark-guide</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/ifsc-vs-micr</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/how-to-find-ifsc-code</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/why-gold-prices-change</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/fd-rates</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/savings-rates</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/accounts</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/loans</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/swift-code-lookup</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/currency-converter</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/best-savings-accounts-for-salary</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare/fd/hdfc-vs-icici</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare/fd/sbi-vs-post-office-mis</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare/fd/sbi-vs-scss</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare/savings/sbi-vs-hdfc</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ${['mumbai','delhi','chennai','kolkata','hyderabad','bangalore','ahmedabad','pune','jaipur','lucknow','surat','patna'].map(city => `<url>
    <loc>${baseUrl}/gold-rate-today/${city}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`).join('\n  ')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(staticSitemap);
})

// Calculator pages sitemap
app.get('/sitemap-calculators.xml', (_req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
  const today = new Date().toISOString().split('T')[0];
  const calcUrls = [
    '/calculators',
    '/calculators/emi',
    '/calculators/home-loan-emi',
    '/calculators/personal-loan-emi',
    '/calculators/car-loan-emi',
    '/calculators/education-loan-emi',
    '/calculators/business-loan-emi',
    '/calculators/lap-emi',
    '/calculators/sip',
    '/calculators/lumpsum',
    '/calculators/goal-sip',
    '/calculators/swp',
    '/calculators/step-up-sip',
    '/calculators/mutual-fund',
    '/calculators/cagr',
    '/calculators/xirr',
    '/calculators/fd',
    '/calculators/rd',
    '/calculators/ppf',
    '/calculators/nps',
    '/calculators/gst',
    '/calculators/home-loan-eligibility',
    '/calculators/personal-loan-eligibility',
    '/calculators/home-prepayment',
    '/calculators/personal-prepayment',
    '/calculators/income-tax',
    '/calculators/salary-calculator',
    '/calculators/hra-calculator',
    '/calculators/rnor-status',
    '/calculators/nri-fd',
    '/calculators/nri-capital-gains',
    '/calculators/nri-rental-income',
  ];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const path of calcUrls) {
    xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }
  xml += '</urlset>';
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(xml);
});

// In-memory cache for generated sitemap XML — these are 10MB+/50k-URL DB streams
// that took 24s+ to build live, which is why Googlebot logged "Couldn't fetch" on
// sitemap-ifsc-4.xml. Cache the built string and serve it instantly; refresh in the
// background once stale instead of blocking the request that triggers the refresh.
const sitemapCache = new Map<string, { xml: string; builtAt: number }>();
const SITEMAP_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — IFSC data syncs monthly at most

// Helper: build IFSC sitemap XML for a given alphabetic IFSC range, with caching.
// Uses WHERE range filter (index range scan, O(result)) instead of OFFSET (O(table)).
async function streamIfscSitemap(res: any, where: Record<string, any>, label: string) {
  const cached = sitemapCache.get(label);
  const isStale = !cached || (Date.now() - cached.builtAt) > SITEMAP_CACHE_TTL_MS;

  if (cached) {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(cached.xml);
    if (isStale) buildIfscSitemap(where, label).catch((e) => console.error(`Background refresh failed for ${label}:`, e));
    return;
  }

  try {
    const xml = await buildIfscSitemap(where, label);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  } catch (error) {
    console.error(`Error generating ${label}:`, error);
    if (!res.headersSent) res.status(500).send('Error generating sitemap');
    else res.end();
  }
}

async function buildIfscSitemap(where: Record<string, any>, label: string): Promise<string> {
  const { prisma } = require('./lib/prisma');
  const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
  const BATCH = 5000; // keeps each query fast + short-lived so it can't hog a DB connection and starve /health

  const parts: string[] = ['<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'];
  let cursor: string | undefined;
  for (;;) {
    const branches = await prisma.branch.findMany({
      select: { ifsc: true, lastUpdated: true },
      where: cursor ? { ...where, ifsc: { ...(where.ifsc || {}), gt: cursor } } : where,
      orderBy: { ifsc: 'asc' },
      take: BATCH,
    });

    for (const branch of branches) {
      const lastmod = branch.lastUpdated ? branch.lastUpdated.toISOString().split('T')[0] : '2025-01-15';
      parts.push(`  <url>\n    <loc>${baseUrl}/ifsc/${branch.ifsc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`);
    }

    if (branches.length < BATCH) break;
    cursor = branches[branches.length - 1].ifsc;
  }
  parts.push('</urlset>');

  const xml = parts.join('');
  sitemapCache.set(label, { xml, builtAt: Date.now() });
  return xml;
}

// IFSC sitemaps split by alphabetic IFSC range — no OFFSET, fast index range scans:
//   Part 1: A–G  (ABHY … GSFS  ~A-G bank codes)
//   Part 2: H–L  (HDFC … LVCB)
//   Part 3: M–R  (MAHB … RATN, includes PUNB/PNB)
//   Part 4: S–Z  (SBIN/SBI + remaining)
app.get('/sitemap-ifsc-1.xml', (_req, res) => streamIfscSitemap(res, { ifsc: { lt: 'H' } }, 'sitemap-ifsc-1'));
app.get('/sitemap-ifsc-2.xml', (_req, res) => streamIfscSitemap(res, { ifsc: { gte: 'H', lt: 'M' } }, 'sitemap-ifsc-2'));
app.get('/sitemap-ifsc-3.xml', (_req, res) => streamIfscSitemap(res, { ifsc: { gte: 'M', lt: 'S' } }, 'sitemap-ifsc-3'));
app.get('/sitemap-ifsc-4.xml', (_req, res) => streamIfscSitemap(res, { ifsc: { gte: 'S' } }, 'sitemap-ifsc-4'));

const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// encodeURIComponent leaves ' ( ) * ! unescaped per spec — bank/state slugs like
// "surat-people's-co-operative-bank" need the apostrophe encoded too for a valid URL.
const encodeSlug = (s: string) => encodeURIComponent(s).replace(/'/g, '%27');

// Banks sitemap — all /bank/:slug pages
app.get('/sitemap-banks.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
    const today = new Date().toISOString().split('T')[0];

    const banks = await prisma.banksMaster.findMany({
      select: { slug: true, updatedAt: true },
      where: { slug: { not: null }, isActive: true },
      orderBy: { slug: 'asc' },
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const bank of banks) {
      if (!bank.slug) continue;
      xml += '  <url>\n';
      xml += `    <loc>${xmlEscape(`${baseUrl}/bank/${encodeSlug(bank.slug)}`)}</loc>\n`;
      xml += `    <lastmod>${bank.updatedAt ? bank.updatedAt.toISOString().split('T')[0] : '2025-01-15'}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }
    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-banks:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// States sitemap — all /state/:bankSlug/:stateSlug hub pages (bank x state presence)
app.get('/sitemap-states.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';

    const presences = await prisma.bankStatePresence.findMany({
      select: { updatedAt: true, bank: { select: { slug: true } }, state: { select: { slug: true } } },
      where: { bank: { slug: { not: null }, isActive: true }, state: { slug: { not: null } } },
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const p of presences) {
      if (!p.bank.slug || !p.state.slug) continue;
      xml += '  <url>\n';
      xml += `    <loc>${xmlEscape(`${baseUrl}/state/${encodeSlug(p.bank.slug)}/${encodeSlug(p.state.slug)}`)}</loc>\n`;
      xml += `    <lastmod>${p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : '2025-01-15'}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }
    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-states:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Blogs sitemap — all /money-guides/:slug pages
app.get('/sitemap-blogs.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';

    const blogs = await prisma.blog.findMany({
      select: { slug: true, updatedAt: true },
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/money-guides</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
    for (const blog of blogs) {
      xml += '  <url>\n';
      xml += `    <loc>${xmlEscape(`${baseUrl}/money-guides/${blog.slug}`)}</loc>\n`;
      xml += `    <lastmod>${blog.updatedAt ? blog.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }
    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-blogs:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// PIN code sitemap — all unique PINs from post_offices table
app.get('/sitemap-pin.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
    const today   = new Date().toISOString().split('T')[0];

    const rows = await (prisma as any).postOffice.findMany({
      select:   { pinCode: true },
      distinct: ['pinCode'],
      orderBy:  { pinCode: 'asc' },
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const row of rows) {
      xml += `  <url>\n    <loc>${baseUrl}/pin/${row.pinCode}</loc>\n    <lastmod>2025-01-15</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-pin:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Credit cards sitemap
app.get('/sitemap-credit-cards.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
    const today   = new Date().toISOString().split('T')[0];

    const cards = await (prisma as any).product.findMany({
      where:   { category: 'credit_card', isActive: true },
      select:  { slug: true },
      orderBy: { slug: 'asc' },
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <url>\n    <loc>${baseUrl}/credit-cards</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/credit-cards/compare</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    for (const card of cards) {
      xml += `  <url>\n    <loc>${baseUrl}/credit-cards/${card.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }
    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-credit-cards:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt
app.get('/robots.txt', (_req, res) => {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${process.env.FRONTEND_URL || 'https://rupeepedia.in'}/sitemap.xml

Disallow: /api/
Disallow: /admin/

Crawl-delay: 1
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(robotsTxt);
})

// ════════════════════════════════════════════════════════════════════════════
// API Routes
// ════════════════════════════════════════════════════════════════════════════

app.use('/api', apiRouter)

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: NODE_ENV,
  })
})

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const server = app.listen(PORT, async () => {
  console.log(`\n🏦  BankInfoHub API  →  http://localhost:${PORT}  [${NODE_ENV}]\n`)

  // Wait for Neon serverless DB to wake up before doing anything
  try {
    const { ensureDbReady } = await import('./lib/prisma')
    await ensureDbReady()
    console.log('  ✓ Database connection ready')
  } catch {
    console.warn('  ⚠ Database not reachable — API will retry on first request')
  }

  // Warm up cache: pre-load banks & states into memory on startup
  try {
    const http = await import('http')
    const fetch = (path: string) => new Promise<void>((resolve) => {
      http.get(`http://localhost:${PORT}${path}`, (res) => {
        res.resume()
        res.on('end', resolve)
      }).on('error', () => resolve())
    })
    await Promise.all([
      fetch('/api/states').then(() => console.log('  ✓ States cache warmed')),
      fetch('/api/banks').then(() => console.log('  ✓ Banks cache warmed')),
      fetch('/sitemap-ifsc-1.xml').then(() => console.log('  ✓ Sitemap ifsc-1 warmed')),
      fetch('/sitemap-ifsc-2.xml').then(() => console.log('  ✓ Sitemap ifsc-2 warmed')),
      fetch('/sitemap-ifsc-3.xml').then(() => console.log('  ✓ Sitemap ifsc-3 warmed')),
      fetch('/sitemap-ifsc-4.xml').then(() => console.log('  ✓ Sitemap ifsc-4 warmed')),
    ])
  } catch {
    console.warn('  ⚠ Cache warm-up failed (non-critical)')
  }

  // Keep Render free tier alive — ping the PUBLIC url every 14 minutes.
  // A loopback ping to localhost never reaches Render's edge, so it does not
  // reset their inactivity timer — must hit the externally-routed URL.
  if (NODE_ENV === 'production') {
    const https = await import('https')
    const externalUrl = process.env.RENDER_EXTERNAL_URL || 'https://rupeepedia-backend.onrender.com'
    setInterval(() => {
      https.get(`${externalUrl}/health`, (res) => res.resume()).on('error', () => {})
    }, 14 * 60 * 1000)
    console.log(`  ✓ Self-ping active (14 min interval, ${externalUrl})`)
  }
})

const shutdown = () => server.close(() => process.exit(0))
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// Log and survive instead of crashing the whole process on one bad request/query
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason))
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err))

export default app