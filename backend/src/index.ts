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

dotenv.config()

const app      = express()
const PORT     = Number(process.env.PORT) || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: NODE_ENV === 'development'
    ? true
    : (process.env.CORS_ORIGIN || '*'),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))
app.use(compression() as any)
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(express.json({ limit: '10kb' }))
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)

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
  <sitemap><loc>https://rupeepedia.in/sitemap-ifsc-1.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-ifsc-2.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-ifsc-3.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>https://rupeepedia.in/sitemap-ifsc-4.xml</loc><lastmod>${today}</lastmod></sitemap>
</sitemapindex>`);
});

// Static pages sitemap
app.get('/sitemap-static.xml', (_req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
  const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/ifsc-finder</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  
  res.setHeader('Content-Type', 'application/xml');
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
  ];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const path of calcUrls) {
    xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }
  xml += '</urlset>';
  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

// IFSC codes sitemap - part 1 (0 to 50,000)
app.get('/sitemap-ifsc-1.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
    
    const branches = await prisma.branch.findMany({
      select: { ifsc: true, lastUpdated: true },
      orderBy: { ifsc: 'asc' },
      skip: 0,
      take: 45000,
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const branch of branches) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/ifsc/${branch.ifsc}</loc>\n`;
      xml += `    <lastmod>${branch.lastUpdated ? branch.lastUpdated.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-ifsc-1:', error);
    res.status(500).send('Error generating sitemap');
  }
})

// IFSC codes sitemap - part 2 (50,000 to 100,000)
app.get('/sitemap-ifsc-2.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
    
    const branches = await prisma.branch.findMany({
      select: { ifsc: true, lastUpdated: true },
      orderBy: { ifsc: 'asc' },
      skip: 45000,
      take: 45000,
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const branch of branches) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/ifsc/${branch.ifsc}</loc>\n`;
      xml += `    <lastmod>${branch.lastUpdated ? branch.lastUpdated.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-ifsc-2:', error);
    res.status(500).send('Error generating sitemap');
  }
})

// IFSC codes sitemap - part 3 (100,000+)
app.get('/sitemap-ifsc-3.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
    
    const branches = await prisma.branch.findMany({
      select: { ifsc: true, lastUpdated: true },
      orderBy: { ifsc: 'asc' },
      skip: 90000,
      take: 45000,
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const branch of branches) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/ifsc/${branch.ifsc}</loc>\n`;
      xml += `    <lastmod>${branch.lastUpdated ? branch.lastUpdated.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-ifsc-3:', error);
    res.status(500).send('Error generating sitemap');
  }
})

app.get('/sitemap-ifsc-4.xml', async (_req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
    
    const branches = await prisma.branch.findMany({
      select: { ifsc: true, lastUpdated: true },
      orderBy: { ifsc: 'asc' },
      skip: 135000,
      take: 45000,
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const branch of branches) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/ifsc/${branch.ifsc}</loc>\n`;
      xml += `    <lastmod>${branch.lastUpdated ? branch.lastUpdated.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }
    xml += '</urlset>';
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap-ifsc-4:', error);
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

app.listen(PORT, async () => {
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
    ])
  } catch {
    console.warn('  ⚠ Cache warm-up failed (non-critical)')
  }
})

export default app