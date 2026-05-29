/**
 * Vercel Edge Function — Bot-aware dynamic renderer
 *
 * Flow:
 *   Real user  → fetch & stream index.html (React SPA takes over)
 *   Googlebot  → fetch backend API, return pre-rendered HTML with full SEO
 *
 * Invoked via vercel.json routes:
 *   /ifsc/:code                      → /api/render?path=/ifsc/:code
 *   /bank/:slug                      → /api/render?path=/bank/:slug
 *   /state/:bankSlug/:stateSlug      → /api/render?path=/state/:bankSlug/:stateSlug
 *   /city/:bankSlug/:stateSlug/:city → /api/render?path=/city/:bankSlug/:stateSlug/:city
 *   /money-guides/:slug              → /api/render?path=/money-guides/:slug
 *   /pin/:pin                        → /api/render?path=/pin/:pin
 */

export const config = { runtime: 'edge' };

const BACKEND = 'https://rupeepedia-backend.onrender.com';
const SITE    = 'https://rupeepedia.in';

const BOT_RE = /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|slackbot|ahrefsbot|semrushbot|msnbot|applebot|rogerbot|chrome-lighthouse|google-inspectiontool/i;

function tc(str: string): string {
  return (str || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function esc(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function head(title: string, desc: string, canonical: string, jsonLds: object[]): string {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta name="robots" content="index, follow">
  ${jsonLds.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n  ')}
</head>`;
}

function notFoundHtml(label: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Not Found | RupeePedia</title><meta name="robots" content="noindex, follow"></head><body><h1>${label} not found</h1><p><a href="${SITE}">Return to RupeePedia</a></p></body></html>`;
}

// ── IFSC page renderer ────────────────────────────────────────────────────────

function renderIFSC(resp: any): string {
  const b         = resp.data || resp;
  const ifsc      = b.ifsc || '';
  const bankName  = b.bank_name || '';
  const branch    = tc(b.branch_name || '');
  const city      = tc(b.city || '');
  const state     = b.state_name || '';
  const district  = b.district_name || '';
  const address   = tc(b.address || '');
  const pincode   = b.pincode || '';
  const micr      = b.micr || '';
  const phone     = b.phone || '';
  const bankSlug  = b.bank_slug || bankName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const canonical = `${SITE}/ifsc/${ifsc}`;

  const services = [b.neft && 'NEFT', b.rtgs && 'RTGS', b.imps && 'IMPS', b.upi && 'UPI'].filter(Boolean).join(', ') || 'N/A';

  const title = `${ifsc} IFSC Code — ${bankName} ${branch} Branch | RupeePedia`;
  const desc  = `IFSC code for ${bankName} ${branch} branch is ${ifsc}. MICR: ${micr || 'N/A'}. Address: ${address}, ${city}, ${state}${pincode ? ' - ' + pincode : ''}. Supports ${services}.`;

  const entityLd = {
    '@context': 'https://schema.org', '@type': 'BankOrCreditUnion',
    name: `${bankName} — ${branch}`, identifier: ifsc,
    branchOf: { '@type': 'Bank', name: bankName, ...(b.bank_website ? { url: b.bank_website } : {}) },
    address: { '@type': 'PostalAddress', streetAddress: address, addressLocality: city, addressRegion: state, postalCode: pincode, addressCountry: 'IN' },
    ...(phone ? { telephone: phone } : {}),
    url: canonical,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE },
      { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: `${SITE}/ifsc-finder` },
      { '@type': 'ListItem', position: 3, name: bankName,      item: `${SITE}/bank/${bankSlug}` },
      { '@type': 'ListItem', position: 4, name: state },
      { '@type': 'ListItem', position: 5, name: ifsc,          item: canonical },
    ],
  };

  const rows = [
    ['IFSC Code',     `<strong>${esc(ifsc)}</strong>`],
    ['MICR Code',     esc(micr)],
    ['Bank',          `<a href="${SITE}/bank/${bankSlug}">${esc(bankName)}</a>`],
    ['Branch',        esc(branch)],
    ['City',          esc(city)],
    ['District',      esc(district)],
    ['State',         esc(state)],
    ['Address',       esc(address)],
    ['PIN Code',      pincode ? `<a href="${SITE}/pin/${esc(pincode)}">${esc(pincode)}</a>` : ''],
    ['Phone',         esc(phone)],
    ['Payment Modes', esc(services)],
    ['Bank Website',  b.bank_website ? `<a href="${esc(b.bank_website)}" rel="nofollow noopener">${esc(b.bank_website)}</a>` : ''],
  ].filter(([, v]) => v);

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [entityLd, breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    <a href="${SITE}/ifsc-finder">IFSC Finder</a> &rsaquo;
    <a href="${SITE}/bank/${bankSlug}">${esc(bankName)}</a> &rsaquo;
    ${esc(state)} &rsaquo; <span>${esc(ifsc)}</span>
  </nav>

  <main>
    <h1>${esc(ifsc)} IFSC Code — ${esc(bankName)} ${esc(branch)}</h1>
    <p>
      IFSC code <strong>${esc(ifsc)}</strong> identifies <strong>${esc(bankName)}</strong>,
      ${esc(branch)} branch located in ${esc(city)}, ${esc(state)}.
      Use this code for NEFT, RTGS, IMPS, and UPI fund transfers.
    </p>

    <table>
      <caption>Branch Details</caption>
      <tbody>
        ${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('\n        ')}
      </tbody>
    </table>

    <section>
      <h2>How to use IFSC code ${esc(ifsc)}</h2>
      <ol>
        <li>Log in to your bank's net banking or mobile app.</li>
        <li>Go to Fund Transfer &rarr; Add Beneficiary.</li>
        <li>Enter the beneficiary account number and IFSC code <strong>${esc(ifsc)}</strong>.</li>
        <li>Wait for beneficiary activation (30 min–12 hrs).</li>
        <li>Initiate transfer and confirm with OTP.</li>
      </ol>
    </section>

    <nav aria-label="Related pages">
      <h2>Explore more</h2>
      <ul>
        <li><a href="${SITE}/bank/${bankSlug}">All ${esc(bankName)} IFSC Codes</a></li>
        <li><a href="${SITE}/ifsc-finder">IFSC Code Finder</a></li>
        ${pincode ? `<li><a href="${SITE}/pin/${esc(pincode)}">PIN Code ${esc(pincode)}</a></li>` : ''}
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

// ── Bank page renderer ────────────────────────────────────────────────────────
// urlSlug: the slug from the URL (not re-derived from bankName) — prevents canonical mismatch

function renderBank(resp: any, urlSlug: string): string {
  const data      = resp.data || resp;
  const bankName  = data.bank || '';
  const total     = data.total_branches || 0;
  const branches  = (data.branches || []).slice(0, 20);
  const canonical = `${SITE}/bank/${urlSlug}`;

  const title = `${bankName} IFSC Codes — All Branches | RupeePedia`;
  const desc  = `Find IFSC codes for all ${total} ${bankName} branches across India. Search by state, city or branch name.`;

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE },
      { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: `${SITE}/ifsc-finder` },
      { '@type': 'ListItem', position: 3, name: bankName,      item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    <a href="${SITE}/ifsc-finder">IFSC Finder</a> &rsaquo;
    <span>${esc(bankName)}</span>
  </nav>

  <main>
    <h1>${esc(bankName)} IFSC Codes</h1>
    <p>${esc(bankName)} has <strong>${total.toLocaleString('en-IN')}</strong> branches across India.</p>

    <table>
      <caption>Sample ${esc(bankName)} Branches</caption>
      <thead><tr><th>IFSC Code</th><th>Branch</th><th>City</th><th>State</th></tr></thead>
      <tbody>
        ${branches.map((br: any) => `<tr>
          <td><a href="${SITE}/ifsc/${esc(br.ifsc)}">${esc(br.ifsc)}</a></td>
          <td>${esc(tc(br.branch_name))}</td>
          <td>${esc(tc(br.city))}</td>
          <td>${esc(br.state_name)}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>

    <nav aria-label="Related pages">
      <ul>
        <li><a href="${SITE}/ifsc-finder">IFSC Code Finder — All Banks</a></li>
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

// ── State page renderer ───────────────────────────────────────────────────────

function renderState(data: any, bankSlug: string, stateSlug: string): string {
  const bankName  = data.bank?.name || '';
  const stateName = data.state?.name || tc(stateSlug);
  const branches  = (data.branches || []).slice(0, 30);
  const canonical = `${SITE}/state/${bankSlug}/${stateSlug}`;

  const title = `${bankName} IFSC Codes in ${stateName} | RupeePedia`;
  const desc  = `Find all ${bankName} IFSC codes and branch details in ${stateName}. Search by city or branch name.`;

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE },
      { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: `${SITE}/ifsc-finder` },
      { '@type': 'ListItem', position: 3, name: bankName,      item: `${SITE}/bank/${bankSlug}` },
      { '@type': 'ListItem', position: 4, name: stateName,     item: canonical },
    ],
  };

  // Group branches by city for link list
  const cities = [...new Set(branches.map((b: any) => b.city).filter(Boolean))] as string[];

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    <a href="${SITE}/ifsc-finder">IFSC Finder</a> &rsaquo;
    <a href="${SITE}/bank/${bankSlug}">${esc(bankName)}</a> &rsaquo;
    <span>${esc(stateName)}</span>
  </nav>

  <main>
    <h1>${esc(bankName)} IFSC Codes in ${esc(stateName)}</h1>
    <p>Browse ${esc(bankName)} branches in ${esc(stateName)}. Select a city to find IFSC codes.</p>

    ${cities.length > 0 ? `
    <nav aria-label="Cities">
      <h2>Cities in ${esc(stateName)}</h2>
      <ul>
        ${cities.map((c: string) => `<li><a href="${SITE}/city/${bankSlug}/${stateSlug}/${encodeURIComponent(c.toLowerCase())}">${esc(tc(c))}</a></li>`).join('\n        ')}
      </ul>
    </nav>` : ''}

    <table>
      <caption>${esc(bankName)} Branches in ${esc(stateName)}</caption>
      <thead><tr><th>IFSC Code</th><th>Branch</th><th>City</th></tr></thead>
      <tbody>
        ${branches.map((br: any) => `<tr>
          <td><a href="${SITE}/ifsc/${esc(br.ifsc)}">${esc(br.ifsc)}</a></td>
          <td>${esc(tc(br.branchName || br.branch_name || ''))}</td>
          <td>${esc(tc(br.city || ''))}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>

    <nav aria-label="Related">
      <ul>
        <li><a href="${SITE}/bank/${bankSlug}">All ${esc(bankName)} IFSC Codes</a></li>
        <li><a href="${SITE}/ifsc-finder">IFSC Code Finder</a></li>
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

// ── City page renderer ────────────────────────────────────────────────────────

function renderCity(data: any, bankSlug: string, stateSlug: string, citySlug: string): string {
  const bankName  = data.bank?.name || '';
  const stateName = data.state?.name || tc(stateSlug);
  const cityName  = tc(data.city || citySlug);
  const branches  = data.branches || [];
  const total     = data.pagination?.totalCount || branches.length;
  const canonical = `${SITE}/city/${bankSlug}/${stateSlug}/${citySlug}`;

  const title = `${bankName} IFSC Codes in ${cityName}, ${stateName} | RupeePedia`;
  const desc  = `${total} ${bankName} branch${total !== 1 ? 'es' : ''} in ${cityName}, ${stateName}. Find IFSC codes for NEFT, RTGS, IMPS transfers.`;

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE },
      { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: `${SITE}/ifsc-finder` },
      { '@type': 'ListItem', position: 3, name: bankName,      item: `${SITE}/bank/${bankSlug}` },
      { '@type': 'ListItem', position: 4, name: stateName,     item: `${SITE}/state/${bankSlug}/${stateSlug}` },
      { '@type': 'ListItem', position: 5, name: cityName,      item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    <a href="${SITE}/ifsc-finder">IFSC Finder</a> &rsaquo;
    <a href="${SITE}/bank/${bankSlug}">${esc(bankName)}</a> &rsaquo;
    <a href="${SITE}/state/${bankSlug}/${stateSlug}">${esc(stateName)}</a> &rsaquo;
    <span>${esc(cityName)}</span>
  </nav>

  <main>
    <h1>${esc(bankName)} IFSC Codes in ${esc(cityName)}, ${esc(stateName)}</h1>
    <p>${total} branch${total !== 1 ? 'es' : ''} found in ${esc(cityName)}.</p>

    <table>
      <caption>${esc(bankName)} Branches in ${esc(cityName)}</caption>
      <thead><tr><th>IFSC Code</th><th>Branch Name</th><th>Address</th></tr></thead>
      <tbody>
        ${branches.map((br: any) => `<tr>
          <td><a href="${SITE}/ifsc/${esc(br.ifsc)}">${esc(br.ifsc)}</a></td>
          <td>${esc(tc(br.branchName || br.branch_name || ''))}</td>
          <td>${esc(tc(br.address || ''))}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>

    <nav aria-label="Related">
      <ul>
        <li><a href="${SITE}/state/${bankSlug}/${stateSlug}">More ${esc(bankName)} branches in ${esc(stateName)}</a></li>
        <li><a href="${SITE}/bank/${bankSlug}">All ${esc(bankName)} IFSC Codes</a></li>
        <li><a href="${SITE}/ifsc-finder">IFSC Code Finder</a></li>
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

// ── Blog page renderer ────────────────────────────────────────────────────────

function renderBlog(post: any): string {
  const title_    = post.title || '';
  const desc_     = post.description || '';
  const blogSlug  = post.slug || '';
  const canonical = `${SITE}/money-guides/${blogSlug}`;

  const articleLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title_,
    description: desc_,
    url: canonical,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt   ? { dateModified:  post.updatedAt   } : {}),
    publisher: { '@type': 'Organization', name: 'RupeePedia', url: SITE },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Money Guides', item: `${SITE}/money-guides` },
      { '@type': 'ListItem', position: 3, name: title_,         item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title_, desc_, canonical, [articleLd, breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    <a href="${SITE}/money-guides">Money Guides</a> &rsaquo;
    <span>${esc(title_)}</span>
  </nav>
  <main>
    <h1>${esc(title_)}</h1>
    <p>${esc(desc_)}</p>
    ${post.category ? `<p>Category: <strong>${esc(post.category)}</strong></p>` : ''}
  </main>
</body>
</html>`;
}

// ── SSR headers ───────────────────────────────────────────────────────────────

const SSR_HEADERS = {
  'Content-Type':  'text/html; charset=utf-8',
  'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
  'X-Renderer':    'bot-ssr',
};

const BLOG_HEADERS = {
  'Content-Type':  'text/html; charset=utf-8',
  'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
  'X-Renderer':    'bot-ssr',
};

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  const url   = new URL(req.url);
  const ua    = req.headers.get('user-agent') || '';
  const isBot = BOT_RE.test(ua);
  const path  = url.searchParams.get('path') || url.pathname;

  // Real users: serve React SPA directly
  if (!isBot) {
    const spaRes = await fetch(new URL('/index.html', url.origin).href);
    return new Response(spaRes.body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Bots: SSR with data from backend
  try {
    // /ifsc/:code
    const ifscMatch = path.match(/^\/ifsc\/([A-Za-z0-9]+)$/);
    if (ifscMatch) {
      const code = ifscMatch[1].toUpperCase();
      const res  = await fetch(`${BACKEND}/api/ifsc/${code}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(8000),
      });
      if (res.status === 404) return new Response(notFoundHtml('IFSC code'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderIFSC(await res.json()), { headers: SSR_HEADERS });
    }

    // /bank/:slug
    const bankMatch = path.match(/^\/bank\/([^/]+)$/);
    if (bankMatch) {
      const urlSlug = bankMatch[1];
      const res = await fetch(`${BACKEND}/api/bank/${urlSlug}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(8000),
      });
      if (res.status === 404) return new Response(notFoundHtml('Bank'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderBank(await res.json(), urlSlug), { headers: SSR_HEADERS });
    }

    // /state/:bankSlug/:stateSlug
    const stateMatch = path.match(/^\/state\/([^/]+)\/([^/]+)$/);
    if (stateMatch) {
      const [, bankSlug, stateSlug] = stateMatch;
      const res = await fetch(`${BACKEND}/api/state/${bankSlug}/${stateSlug}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(8000),
      });
      if (res.status === 404) return new Response(notFoundHtml('State'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderState(await res.json(), bankSlug, stateSlug), { headers: SSR_HEADERS });
    }

    // /city/:bankSlug/:stateSlug/:citySlug
    const cityMatch = path.match(/^\/city\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (cityMatch) {
      const [, bankSlug, stateSlug, citySlug] = cityMatch;
      const res = await fetch(`${BACKEND}/api/city/${bankSlug}/${stateSlug}/${citySlug}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(8000),
      });
      if (res.status === 404) return new Response(notFoundHtml('City'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderCity(await res.json(), bankSlug, stateSlug, citySlug), { headers: SSR_HEADERS });
    }

    // /money-guides/:slug
    const blogMatch = path.match(/^\/money-guides\/([^/]+)$/);
    if (blogMatch) {
      const res = await fetch(`${BACKEND}/api/blogs/${blogMatch[1]}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(8000),
      });
      if (res.status === 404) return new Response(notFoundHtml('Article'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderBlog(await res.json()), { headers: BLOG_HEADERS });
    }
  } catch (_err) {
    // Timeout or network error — tell Google to retry later
    return new Response('Service temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': '60' },
    });
  }

  // Unmatched path — serve SPA
  const spaRes = await fetch(new URL('/index.html', url.origin).href);
  return new Response(spaRes.body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
