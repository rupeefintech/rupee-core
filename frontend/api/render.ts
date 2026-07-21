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

import { HOLIDAYS_2025, HOLIDAYS_2026, ALL_STATES } from '../src/data/bankHolidays';

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

// ── PIN code page renderer ────────────────────────────────────────────────────

function renderPin(resp: any): string {
  const d         = resp.data || resp;
  const pin       = d.pin_code || '';
  const state     = d.state_name || '';
  const district  = d.district || '';
  const offices   = (d.post_offices || []).slice(0, 60);
  const branches  = (d.bank_branches || []).slice(0, 30);
  const stats     = d.stats || {};
  const canonical = `${SITE}/pin/${pin}`;

  const mainOffice = offices.length ? tc(offices[0].office_name || '') : '';
  const locality   = [district, state].filter(Boolean).join(', ');

  const title = `${pin} PIN Code — ${mainOffice ? mainOffice + ', ' : ''}${locality} | Post Offices & Details | RupeePedia`;
  const desc  = `PIN code ${pin} details: ${stats.post_office_count || offices.length} post office${(stats.post_office_count || offices.length) === 1 ? '' : 's'} in ${locality}${mainOffice ? ' including ' + mainOffice : ''}${stats.branch_count ? ', plus ' + stats.branch_count + ' bank branches with IFSC codes' : ''}. Zip code lookup for ${locality}.`;

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: SITE },
      { '@type': 'ListItem', position: 2, name: 'PIN Codes', item: `${SITE}/pin-codes` },
      { '@type': 'ListItem', position: 3, name: `PIN ${pin}`, item: canonical },
    ],
  };

  const placeLd = {
    '@context': 'https://schema.org', '@type': 'Place',
    name: `PIN Code ${pin}${locality ? ' — ' + locality : ''}`,
    url: canonical,
    address: {
      '@type': 'PostalAddress',
      postalCode: pin,
      addressLocality: district || undefined,
      addressRegion: state || undefined,
      addressCountry: 'IN',
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [placeLd, breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    <a href="${SITE}/pin-codes">PIN Codes</a> &rsaquo;
    <span>${esc(pin)}</span>
  </nav>

  <main>
    <h1>${esc(pin)} PIN Code — ${esc(locality)}</h1>
    <p>
      PIN code <strong>${esc(pin)}</strong> serves <strong>${esc(locality)}</strong> with
      ${stats.post_office_count || offices.length} post office${(stats.post_office_count || offices.length) === 1 ? '' : 's'}
      (${stats.delivery_offices || 0} delivery)${stats.branch_count ? ` and ${stats.branch_count} bank branches from ${stats.bank_count} banks` : ''}.
      Use this postal code (zip code) for addressing mail, courier deliveries and online forms for ${esc(district || state)}.
    </p>

    <table>
      <caption>Post Offices under PIN ${esc(pin)}</caption>
      <thead><tr><th>Post Office</th><th>Type</th><th>Delivery</th><th>District</th><th>State</th></tr></thead>
      <tbody>
        ${offices.map((o: any) => `<tr><td>${esc(tc(o.office_name || ''))}</td><td>${esc(o.office_type || '')}</td><td>${o.delivery ? 'Delivery' : 'Non-delivery'}</td><td>${esc(o.district || '')}</td><td>${esc(o.state_name || '')}</td></tr>`).join('\n        ')}
      </tbody>
    </table>

    ${branches.length ? `<section>
      <h2>Bank branches in PIN ${esc(pin)}</h2>
      <table>
        <caption>Banks and IFSC codes in ${esc(pin)}</caption>
        <thead><tr><th>Bank</th><th>Branch</th><th>IFSC Code</th><th>City</th></tr></thead>
        <tbody>
          ${branches.map((b: any) => `<tr><td>${b.bank_slug ? `<a href="${SITE}/bank/${esc(b.bank_slug)}">${esc(b.bank_name || '')}</a>` : esc(b.bank_name || '')}</td><td>${esc(tc(b.branch_name || ''))}</td><td><a href="${SITE}/ifsc/${esc(b.ifsc)}">${esc(b.ifsc)}</a></td><td>${esc(tc(b.city || ''))}</td></tr>`).join('\n          ')}
        </tbody>
      </table>
    </section>` : ''}

    <section>
      <h2>About PIN code ${esc(pin)}</h2>
      <p>
        Postal Index Number (PIN) ${esc(pin)} belongs to postal circle of ${esc(state)}.
        The first digit (${esc(pin[0] || '')}) identifies the region, the first two digits the sub-region,
        the first three digits (${esc(pin.slice(0, 3))}) the sorting district, and the last three digits
        the specific post office. India Post uses this 6-digit code to route mail; internationally it
        serves as the zip code / postal code for ${esc(locality)}.
      </p>
    </section>

    <nav aria-label="Related pages">
      <h2>Explore more</h2>
      <ul>
        <li><a href="${SITE}/pin-codes">PIN Code Finder — search any PIN or post office</a></li>
        <li><a href="${SITE}/pin-code-india">PIN Code System in India — how it works</a></li>
        <li><a href="${SITE}/ifsc-finder">IFSC Code Finder</a></li>
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

// ── Gold rate page renderer ───────────────────────────────────────────────────
// citySlug: lowercase slug from URL, or null for the all-India page

function renderGold(resp: any, citySlug: string | null): string {
  const gold    = resp.gold || {};
  const silver  = resp.silver || {};
  const cities  = resp.cities || {};
  const updated = resp.updated_at ? new Date(resp.updated_at) : new Date();
  const dateStr = updated.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

  const cityName = citySlug ? tc(citySlug) : null;
  const cityData = cityName ? cities[cityName] : null;

  const g24 = cityData ? cityData.gold_24k_per_10g : gold.price_24k_per_10g;
  const g22 = cityData ? cityData.gold_22k_per_10g : gold.price_22k_per_10g;
  const inr = (n: number) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

  const canonical = cityName ? `${SITE}/gold-rate-today/${citySlug}` : `${SITE}/gold-rate-today`;
  const where     = cityName ? `in ${cityName}` : 'in India';
  const title     = `Gold Rate Today ${cityName ? 'in ' + cityName : 'in India'} — 22K & 24K Price (${dateStr}) | RupeePedia`;
  const desc      = `Gold rate today ${where} (${dateStr}): 24K ${inr(g24)}/10g, 22K ${inr(g22)}/10g. Live gold and silver prices per gram, 10 grams and tola, updated from international spot rates.`;

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Gold Rate Today', item: `${SITE}/gold-rate-today` },
      ...(cityName ? [{ '@type': 'ListItem', position: 3, name: `Gold Rate in ${cityName}`, item: canonical }] : []),
    ],
  };

  const goldRows = [
    ['24K Gold (99.9% pure)', inr((g24 || 0) / 10) + '/g', inr(g24) + '/10g', inr((g24 || 0) * 1.16638) + '/tola'],
    ['22K Gold (jewellery)',  inr((g22 || 0) / 10) + '/g', inr(g22) + '/10g', inr((g22 || 0) * 1.16638) + '/tola'],
    ['18K Gold',              inr((gold.price_18k_per_10g || 0) / 10) + '/g', inr(gold.price_18k_per_10g) + '/10g', ''],
    ['14K Gold',              inr((gold.price_14k_per_10g || 0) / 10) + '/g', inr(gold.price_14k_per_10g) + '/10g', ''],
  ];

  const cityEntries = Object.entries(cities) as [string, any][];

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    ${cityName ? `<a href="${SITE}/gold-rate-today">Gold Rate Today</a> &rsaquo; <span>${esc(cityName)}</span>` : '<span>Gold Rate Today</span>'}
  </nav>

  <main>
    <h1>Gold Rate Today ${cityName ? 'in ' + esc(cityName) : 'in India'} — ${esc(dateStr)}</h1>
    <p>
      Today's gold price ${esc(where)}: <strong>24 karat gold ${inr(g24)} per 10 grams</strong> and
      <strong>22 karat gold ${inr(g22)} per 10 grams</strong>. Silver is trading at
      <strong>${inr(silver.price_per_kg)} per kg</strong> (${inr(silver.price_per_10g)}/10g).
      Rates are derived from the international spot price (gold $${gold.spot_usd_per_oz}/oz) converted
      at USD/INR ${resp.usd_inr}, aligned with IBJA/MCX benchmarks. Jewellers add 3% GST and making charges.
    </p>

    <table>
      <caption>Gold price ${esc(where)} by purity — ${esc(dateStr)}</caption>
      <thead><tr><th>Purity</th><th>Per gram</th><th>Per 10 grams</th><th>Per tola</th></tr></thead>
      <tbody>
        ${goldRows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('\n        ')}
      </tbody>
    </table>

    <table>
      <caption>Silver price today</caption>
      <tbody>
        <tr><th scope="row">Per kg</th><td>${inr(silver.price_per_kg)}</td></tr>
        <tr><th scope="row">Per 100 grams</th><td>${inr(silver.price_per_100g)}</td></tr>
        <tr><th scope="row">Per 10 grams</th><td>${inr(silver.price_per_10g)}</td></tr>
      </tbody>
    </table>

    <section>
      <h2>Gold rate in major Indian cities (24K per 10g)</h2>
      <table>
        <thead><tr><th>City</th><th>24K per 10g</th><th>22K per 10g</th></tr></thead>
        <tbody>
          ${cityEntries.map(([c, v]) => `<tr><th scope="row"><a href="${SITE}/gold-rate-today/${c.toLowerCase()}">${esc(c)}</a></th><td>${inr(v.gold_24k_per_10g)}</td><td>${inr(v.gold_22k_per_10g)}</td></tr>`).join('\n          ')}
        </tbody>
      </table>
      <p>City prices differ slightly due to local taxes, transport and jeweller association rates.</p>
    </section>

    <section>
      <h2>22K vs 24K gold — which price applies to you?</h2>
      <p>
        24K (999) is investment-grade gold used for coins and bars. Jewellery is almost always
        22K (916) or 18K (750) because pure gold is too soft — so the 22K rate is what jewellers quote.
        The final bill adds 3% GST on the metal value and making charges of 8–25%. Always check the
        BIS hallmark (purity mark + 6-digit HUID) before buying.
      </p>
    </section>

    <nav aria-label="Related pages">
      <h2>Explore more</h2>
      <ul>
        ${cityName ? `<li><a href="${SITE}/gold-rate-today">Gold rate in all Indian cities</a></li>` : ''}
        <li><a href="${SITE}/gold-hallmark-guide">Gold Hallmark Guide — BIS, HUID, purity marks</a></li>
        <li><a href="${SITE}/why-gold-prices-change">Why Gold Prices Change Daily</a></li>
        <li><a href="${SITE}/calculators">Financial Calculators</a></li>
      </ul>
    </nav>

    <p><small>${esc(resp.disclaimer || '')}</small></p>
  </main>
</body>
</html>`;
}

// ── FD / Savings rates page renderer ──────────────────────────────────────────

function renderRates(resp: any, kind: 'fd' | 'savings'): string {
  const banks = (resp.banks || []).slice(0, 40);
  const isFD  = kind === 'fd';
  const canonical = `${SITE}/${isFD ? 'fd-rates' : 'savings-rates'}`;
  const year  = new Date().getFullYear();

  const best = banks[0];
  const title = isFD
    ? `FD Interest Rates ${year} — Compare Best Fixed Deposit Rates of ${banks.length}+ Indian Banks | RupeePedia`
    : `Savings Account Interest Rates ${year} — Compare ${banks.length}+ Indian Banks | RupeePedia`;
  const desc = isFD
    ? `Compare FD interest rates across ${banks.length}+ Indian banks${best ? ` — best rate ${best.bestRate}% (${best.bank?.name})` : ''}. Regular and senior citizen fixed deposit rates by tenure, updated regularly.`
    : `Compare savings account interest rates across ${banks.length}+ Indian banks${best ? ` — highest ${best.bestRate}% (${best.bank?.name})` : ''}. Zero-balance and tiered rates compared.`;

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: isFD ? 'FD Interest Rates' : 'Savings Account Rates', item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo; <span>${isFD ? 'FD Interest Rates' : 'Savings Account Rates'}</span>
  </nav>
  <main>
    <h1>${isFD ? `FD Interest Rates ${year} — Best Fixed Deposit Rates in India` : `Savings Account Interest Rates ${year} — Bank-wise Comparison`}</h1>
    <p>
      ${isFD
        ? `Compare fixed deposit interest rates from ${banks.length}+ Indian banks side by side. ${best ? `The highest FD rate right now is <strong>${best.bestRate}%</strong> from <strong>${esc(best.bank?.name || '')}</strong>.` : ''} Senior citizens typically earn 0.25–0.75% extra.`
        : `Compare savings account interest rates from ${banks.length}+ Indian banks. ${best ? `The highest savings rate right now is <strong>${best.bestRate}%</strong> from <strong>${esc(best.bank?.name || '')}</strong>.` : ''} Small finance banks generally pay the most; large banks pay 2.5–3%.`}
    </p>

    <table>
      <caption>${isFD ? 'Best FD rate per bank (all tenures)' : 'Savings account rates by bank'}</caption>
      <thead><tr><th>Bank</th><th>${isFD ? 'Best FD Rate' : 'Max Rate'}</th><th>Sample tenures / tiers</th></tr></thead>
      <tbody>
        ${banks.map((b: any) => `<tr>
          <th scope="row">${b.bank?.slug ? `<a href="${SITE}/bank/${esc(b.bank.slug)}">${esc(b.bank?.name || '')}</a>` : esc(b.bank?.name || '')}</th>
          <td><strong>${b.bestRate}%</strong></td>
          <td>${(b.tenures || []).slice(0, 4).map((t: any) => `${esc(t.label || '')}: ${t.rate}%${t.seniorRate ? ' (senior ' + t.seniorRate + '%)' : ''}`).join(' · ')}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>

    <section>
      <h2>${isFD ? 'How to pick an FD' : 'How savings interest works'}</h2>
      <p>
        ${isFD
          ? 'Rates vary by tenure, not just bank — a bank\'s 1-year and 5-year rates can differ by 1.5%. Interest above ₹40,000/year (₹50,000 for seniors) attracts TDS. Deposits up to ₹5 lakh per bank are insured by DICGC. Small finance banks pay more but the same ₹5 lakh insurance limit applies.'
          : 'Savings interest is calculated on daily balance and credited quarterly. Interest up to ₹10,000/year is deductible under 80TTA (₹50,000 for seniors under 80TTB, old regime). Tiered accounts pay higher rates only on balances above thresholds — check the tier that matches your balance, not the headline rate.'}
      </p>
    </section>

    <nav aria-label="Related pages">
      <h2>Explore more</h2>
      <ul>
        <li><a href="${SITE}/${isFD ? 'savings-rates' : 'fd-rates'}">${isFD ? 'Savings Account Rates' : 'FD Interest Rates'}</a></li>
        <li><a href="${SITE}/calculators/fd">FD Calculator — maturity and interest</a></li>
        <li><a href="${SITE}/bank-holidays">Bank Holidays ${year}</a></li>
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

// ── Currency converter page renderer ──────────────────────────────────────────

function renderCurrency(resp: any): string {
  const rates: Record<string, number> = resp.rates || {};
  const canonical = `${SITE}/currency-converter`;
  const usd = rates['USD'];

  const title = `Currency Converter — Live INR Exchange Rates Today (USD, EUR, GBP, AED) | RupeePedia`;
  const desc  = `Live Indian Rupee exchange rates${usd ? `: 1 USD = ₹${usd}` : ''}. Convert INR to USD, EUR, GBP, AED, SGD, CAD, AUD and more at mid-market rates, updated daily.`;

  const NAMES: Record<string, string> = {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', AED: 'UAE Dirham',
    SGD: 'Singapore Dollar', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
    JPY: 'Japanese Yen', CHF: 'Swiss Franc', SAR: 'Saudi Riyal', QAR: 'Qatari Riyal',
    KWD: 'Kuwaiti Dinar', BHD: 'Bahraini Dinar', OMR: 'Omani Rial', MYR: 'Malaysian Ringgit',
    THB: 'Thai Baht', HKD: 'Hong Kong Dollar', NZD: 'New Zealand Dollar', CNY: 'Chinese Yuan',
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Currency Converter', item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb"><a href="${SITE}">RupeePedia</a> &rsaquo; <span>Currency Converter</span></nav>
  <main>
    <h1>Currency Converter — INR Exchange Rates Today</h1>
    <p>
      Live mid-market exchange rates for the Indian Rupee, updated daily.
      ${usd ? `Today 1 US Dollar = <strong>₹${usd}</strong>.` : ''}
      Bank and money-transfer rates include a margin of 0.5–4% over these mid-market rates.
    </p>
    <table>
      <caption>INR exchange rates (1 unit of foreign currency in ₹)</caption>
      <thead><tr><th>Currency</th><th>Code</th><th>Rate in INR</th></tr></thead>
      <tbody>
        ${Object.entries(rates).map(([code, val]) => `<tr><th scope="row">${esc(NAMES[code] || code)}</th><td>${esc(code)}</td><td>₹${val}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
    <section>
      <h2>Sending money to or from India?</h2>
      <p>
        Remittances to India are tax-free for the recipient if from close relatives (gifts above ₹50,000
        from non-relatives are taxable). Outward remittances under LRS above ₹10 lakh/year attract TCS.
        Compare transfer services on the total INR received, not the advertised rate — fees hide in the margin.
      </p>
    </section>
    <nav aria-label="Related pages">
      <h2>Explore more</h2>
      <ul>
        <li><a href="${SITE}/swift-code-lookup">SWIFT Code Lookup for international transfers</a></li>
        <li><a href="${SITE}/calculators/nri-fd">NRI FD Calculator — NRE vs NRO vs FCNR</a></li>
      </ul>
    </nav>
    <p><small>${esc(resp.disclaimer || '')}</small></p>
  </main>
</body>
</html>`;
}

// ── SWIFT code lookup page renderer (static content) ─────────────────────────

const POPULAR_SWIFT: { bank: string; swift: string; hq: string }[] = [
  { bank: 'State Bank of India',      swift: 'SBININBB', hq: 'Mumbai'    },
  { bank: 'HDFC Bank',                swift: 'HDFCINBB', hq: 'Mumbai'    },
  { bank: 'ICICI Bank',               swift: 'ICICINBB', hq: 'Mumbai'    },
  { bank: 'Axis Bank',                swift: 'AXISINBB', hq: 'Mumbai'    },
  { bank: 'Kotak Mahindra Bank',      swift: 'KKBKINBB', hq: 'Mumbai'    },
  { bank: 'Punjab National Bank',     swift: 'PUNBINBB', hq: 'New Delhi' },
  { bank: 'Bank of Baroda',           swift: 'BARBINBB', hq: 'Vadodara'  },
  { bank: 'Canara Bank',              swift: 'CNRBINBB', hq: 'Bangalore' },
  { bank: 'IndusInd Bank',            swift: 'INDBINBB', hq: 'Pune'      },
  { bank: 'Yes Bank',                 swift: 'YESBINBB', hq: 'Mumbai'    },
  { bank: 'IDFC FIRST Bank',          swift: 'IDFBINBB', hq: 'Mumbai'    },
  { bank: 'Federal Bank',             swift: 'FDRLINBB', hq: 'Aluva'     },
  { bank: 'Citibank India',           swift: 'CITIINBX', hq: 'Mumbai'    },
  { bank: 'HSBC India',               swift: 'HSBCINBB', hq: 'Mumbai'    },
  { bank: 'Standard Chartered India', swift: 'SCBLINBB', hq: 'Mumbai'    },
];

function renderSwift(): string {
  const canonical = `${SITE}/swift-code-lookup`;
  const title = 'SWIFT Code Lookup — Find SWIFT/BIC Codes of Indian Banks | RupeePedia';
  const desc  = 'Find SWIFT/BIC codes for Indian banks — SBI, HDFC, ICICI, Axis and more. SWIFT code format explained, plus how to receive international wire transfers to India.';

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'SWIFT Code Lookup', item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb"><a href="${SITE}">RupeePedia</a> &rsaquo; <span>SWIFT Code Lookup</span></nav>
  <main>
    <h1>SWIFT Code Lookup — Indian Bank SWIFT/BIC Codes</h1>
    <p>
      A SWIFT code (also called BIC) is an 8–11 character identifier banks use for international
      wire transfers. To receive money from abroad in your Indian account, you share your bank's
      SWIFT code, your account number, and the branch details with the sender.
    </p>

    <table>
      <caption>SWIFT codes of major Indian banks (head office)</caption>
      <thead><tr><th>Bank</th><th>SWIFT Code</th><th>Head Office</th></tr></thead>
      <tbody>
        ${POPULAR_SWIFT.map(r => `<tr><th scope="row">${esc(r.bank)}</th><td><strong>${esc(r.swift)}</strong></td><td>${esc(r.hq)}</td></tr>`).join('\n        ')}
      </tbody>
    </table>

    <section>
      <h2>SWIFT code format</h2>
      <p>
        Example <strong>HDFCINBB</strong>: first 4 letters = bank code (HDFC), next 2 = country
        (IN, India), next 2 = location (BB, Mumbai), optional last 3 = branch code (XXX or omitted
        means head office). Most international transfers to India only need the 8-character
        head-office code — the money reaches your branch via your account number.
      </p>
    </section>

    <section>
      <h2>SWIFT vs IFSC</h2>
      <p>
        IFSC codes route domestic transfers (NEFT/RTGS/IMPS inside India); SWIFT codes route
        international transfers. For inward remittances you typically need both: SWIFT for the
        international leg, and your branch details for final credit.
      </p>
    </section>

    <nav aria-label="Related pages">
      <h2>Explore more</h2>
      <ul>
        <li><a href="${SITE}/ifsc-finder">IFSC Code Finder for domestic transfers</a></li>
        <li><a href="${SITE}/currency-converter">Currency Converter — live INR rates</a></li>
        <li><a href="${SITE}/calculators/nri-fd">NRI FD Calculator</a></li>
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

// ── Credit card detail page renderer ──────────────────────────────────────────

function renderCard(card: any): string {
  const name      = card.name || '';
  const bankName  = card.bank?.name || '';
  const bankSlug  = card.bank?.slug || '';
  const network   = card.network || '';
  const d         = card.details || {};
  const feeText   = d.annualFee === 0 ? 'Lifetime Free' : d.annualFee != null ? `₹${d.annualFee}/year` : 'N/A';
  const canonical = `${SITE}/credit-cards/${card.slug}`;

  const title = `${name} — Fees, Rewards & Eligibility | RupeePedia`;
  const desc  = `${name} by ${bankName}: annual fee ${feeText}${d.rewardType ? `, ${d.rewardType} rewards` : ''}. Compare eligibility, fees and benefits before applying.`;

  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'FinancialProduct',
    name, url: canonical,
    ...(card.aboutCard ? { description: card.aboutCard } : {}),
    provider: { '@type': 'BankOrCreditUnion', name: bankName },
    feesAndCommissionsSpecification: JSON.stringify({
      joiningFee: d.joiningFee ?? 0,
      annualFee: d.annualFee ?? 0,
      currency: 'INR',
    }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Credit Cards', item: `${SITE}/credit-cards` },
      { '@type': 'ListItem', position: 3, name, item: canonical },
    ],
  };

  const rows = [
    ['Bank', bankSlug ? `<a href="${SITE}/bank/${esc(bankSlug)}">${esc(bankName)}</a>` : esc(bankName)],
    ['Network', esc(network)],
    ['Annual Fee', esc(feeText)],
    ['Joining Fee', d.joiningFee != null ? `₹${d.joiningFee}` : ''],
    ['Reward Type', esc(d.rewardType || '')],
    ['Minimum Income', d.minIncome != null ? `₹${d.minIncome.toLocaleString('en-IN')}/year` : ''],
    ['Forex Markup', d.forexMarkup != null ? `${d.forexMarkup}%` : ''],
    ['APR', esc(d.apr || '')],
  ].filter(([, v]) => v);

  const features: string[] = card.features || [];
  const offers = (card.offers || []).filter((o: any) => o.isActive);

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [productLd, breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    <a href="${SITE}/credit-cards">Credit Cards</a> &rsaquo;
    <span>${esc(name)}</span>
  </nav>

  <main>
    <h1>${esc(name)}</h1>
    <p>${esc(card.aboutCard || `${name} is a credit card from ${bankName}${network ? ' on the ' + network + ' network' : ''}.`)}</p>

    <table>
      <caption>${esc(name)} — fees &amp; details</caption>
      <tbody>
        ${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('\n        ')}
      </tbody>
    </table>

    ${features.length ? `<section>
      <h2>Key features</h2>
      <ul>
        ${features.map((f) => `<li>${esc(f)}</li>`).join('\n        ')}
      </ul>
    </section>` : ''}

    ${offers.length ? `<section>
      <h2>Current offers</h2>
      <ul>
        ${offers.map((o: any) => `<li><strong>${esc(o.title)}</strong>${o.description ? ' — ' + esc(o.description) : ''}</li>`).join('\n        ')}
      </ul>
    </section>` : ''}

    ${card.applyUrl ? `<p><a href="${esc(card.applyUrl)}" rel="sponsored noopener" target="_blank">Apply for ${esc(name)}</a></p>` : ''}

    <nav aria-label="Related pages">
      <h2>Explore more</h2>
      <ul>
        <li><a href="${SITE}/credit-cards">Compare all credit cards</a></li>
        ${bankSlug ? `<li><a href="${SITE}/bank/${esc(bankSlug)}">${esc(bankName)} IFSC codes</a></li>` : ''}
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

function renderCardsList(cards: any[]): string {
  const canonical = `${SITE}/credit-cards`;
  const title = `Best Credit Cards in India — Compare ${cards.length}+ Cards | RupeePedia`;
  const desc  = `Compare ${cards.length}+ credit cards in India by annual fee, rewards, cashback, fuel and lounge benefits. Updated from official bank sources.`;

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Credit Cards', item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb"><a href="${SITE}">RupeePedia</a> &rsaquo; <span>Credit Cards</span></nav>
  <main>
    <h1>Best Credit Cards in India</h1>
    <p>Compare ${cards.length}+ credit cards across cashback, travel, fuel and lifetime-free categories.</p>
    <table>
      <caption>Credit cards compared</caption>
      <thead><tr><th>Card</th><th>Bank</th><th>Annual Fee</th></tr></thead>
      <tbody>
        ${cards.map((c: any) => `<tr>
          <td><a href="${SITE}/credit-cards/${esc(c.slug)}">${esc(c.name)}</a></td>
          <td>${esc(c.bank?.name || '')}</td>
          <td>${c.annualFee === 0 ? 'Free' : c.annualFee != null ? '₹' + c.annualFee : 'N/A'}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>
  </main>
</body>
</html>`;
}

// ── Calculator page renderer (no DB model — static slug map) ─────────────────
// Kept in sync manually with frontend/src/utils/calculators.ts (that file pulls
// in lucide-react/JSX and can't be imported from this edge function).

const CALCULATORS: Record<string, { name: string; desc: string }> = {
  'emi':                       { name: 'EMI Calculator',                  desc: 'Calculate monthly EMI for any loan — enter amount, rate and tenure.' },
  'home-loan-emi':             { name: 'Home Loan EMI Calculator',        desc: 'Plan your home loan repayment with an accurate EMI breakdown.' },
  'personal-loan-emi':         { name: 'Personal Loan EMI Calculator',    desc: 'Check your personal loan EMI instantly.' },
  'car-loan-emi':              { name: 'Car Loan EMI Calculator',         desc: 'Know your car loan monthly payment before you buy.' },
  'education-loan-emi':        { name: 'Education Loan EMI Calculator',   desc: 'Plan education loan repayment across your course tenure.' },
  'business-loan-emi':         { name: 'Business Loan EMI Calculator',    desc: 'Calculate business loan EMI and total interest outgo.' },
  'lap-emi':                   { name: 'Loan Against Property EMI Calculator', desc: 'Calculate LAP EMI and eligibility.' },
  'sip':                       { name: 'SIP Calculator',                  desc: 'Project your SIP investment returns over time.' },
  'lumpsum':                   { name: 'Lumpsum Calculator',              desc: 'Calculate lumpsum investment growth at a given return rate.' },
  'goal-sip':                  { name: 'Goal-based SIP Calculator',       desc: 'Find the monthly SIP needed to reach a financial goal.' },
  'swp':                       { name: 'SWP Calculator',                 desc: 'Plan systematic withdrawals from your investments.' },
  'step-up-sip':               { name: 'Step-Up SIP Calculator',          desc: 'Calculate SIP returns with annual step-up increments.' },
  'mutual-fund':                { name: 'Mutual Fund Returns Calculator', desc: 'Estimate mutual fund returns over your investment horizon.' },
  'cagr':                      { name: 'CAGR Calculator',                 desc: 'Find the compound annual growth rate between two values.' },
  'xirr':                      { name: 'XIRR Calculator',                 desc: 'Calculate returns on investments with irregular cash flows.' },
  'fd':                        { name: 'FD Calculator',                   desc: 'Calculate fixed deposit maturity value and interest earned.' },
  'rd':                        { name: 'RD Calculator',                   desc: 'Know your recurring deposit maturity amount.' },
  'ppf':                       { name: 'PPF Calculator',                  desc: 'Calculate PPF maturity value over the 15-year lock-in.' },
  'nps':                       { name: 'NPS Calculator',                  desc: 'Plan your NPS pension corpus and monthly annuity.' },
  'home-loan-eligibility':     { name: 'Home Loan Eligibility Calculator', desc: 'Check the maximum home loan you qualify for.' },
  'personal-loan-eligibility': { name: 'Personal Loan Eligibility Calculator', desc: 'Know your personal loan eligibility instantly.' },
  'home-prepayment':           { name: 'Home Loan Prepayment Calculator', desc: 'See how much you save by prepaying your home loan.' },
  'personal-prepayment':       { name: 'Personal Loan Prepayment Calculator', desc: 'Calculate savings from prepaying a personal loan.' },
  'gst':                       { name: 'GST Calculator',                  desc: 'Calculate GST on any amount — inclusive or exclusive.' },
  'salary-calculator':         { name: 'Salary Calculator',               desc: 'Convert CTC to in-hand salary with a full tax breakdown.' },
  'hra-calculator':            { name: 'HRA Calculator',                  desc: 'Calculate your HRA tax exemption.' },
  'income-tax':                { name: 'Income Tax Calculator',           desc: 'Compare old vs new tax regime and find which saves more.' },
  'rnor-status':               { name: 'RNOR Status Calculator',          desc: 'Check your NRI / RNOR / ROR residential status for tax purposes.' },
  'nri-fd':                    { name: 'NRI FD Calculator',                desc: 'Compare NRE, NRO and FCNR FD returns after tax.' },
  'nri-capital-gains':         { name: 'NRI Capital Gains Tax Calculator', desc: 'Calculate tax on sale of Indian property or equity as an NRI.' },
  'nri-rental-income':         { name: 'NRI Rental Income Tax Calculator', desc: 'Calculate tax and TDS on rental income from Indian property.' },
};

function renderCalculator(slug: string): string {
  const c = CALCULATORS[slug];
  const canonical = `${SITE}/calculators/${slug}`;
  const name = c?.name || `${tc(slug.replace(/-/g, ' '))} Calculator`;
  const desc = c?.desc || `Free ${name} with instant results. No signup required.`;

  const appLd = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication',
    name, url: canonical, applicationCategory: 'FinanceApplication', operatingSystem: 'Web',
    description: desc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${SITE}/calculators` },
      { '@type': 'ListItem', position: 3, name, item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(`${name} — Free Online Calculator | RupeePedia`, desc, canonical, [appLd, breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb">
    <a href="${SITE}">RupeePedia</a> &rsaquo;
    <a href="${SITE}/calculators">Calculators</a> &rsaquo;
    <span>${esc(name)}</span>
  </nav>
  <main>
    <h1>${esc(name)}</h1>
    <p>${esc(desc)}</p>
    <nav aria-label="Related pages">
      <ul>
        <li><a href="${SITE}/calculators">All financial calculators</a></li>
      </ul>
    </nav>
  </main>
</body>
</html>`;
}

// ── Bank holidays page renderer (static data) ─────────────────────────────────

function renderHolidays(): string {
  const canonical = `${SITE}/bank-holidays`;
  const title = 'Bank Holidays 2025 & 2026 India — Complete RBI Holiday List | RupeePedia';
  const desc  = `Complete list of bank holidays in India for 2025 and 2026 — ${HOLIDAYS_2025.length} holidays in 2025, ${HOLIDAYS_2026.length} in 2026. National and state-wise RBI holiday calendar.`;

  const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const holidayTable = (rows: typeof HOLIDAYS_2025, year: number) => `
    <table>
      <caption>Bank holidays ${year} in India</caption>
      <thead><tr><th>Date</th><th>Holiday</th><th>Type</th><th>States</th></tr></thead>
      <tbody>
        ${rows.map(h => `<tr>
          <td>${esc(fmtDate(h.date))}</td>
          <th scope="row">${esc(h.name)}</th>
          <td>${h.type === 'national' ? 'National' : 'Regional'}</td>
          <td>${h.states.includes(ALL_STATES) ? 'All India' : esc(h.states.slice(0, 6).join(', ')) + (h.states.length > 6 ? '…' : '')}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>`;

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Bank Holidays', item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
${head(title, desc, canonical, [breadcrumbLd])}
<body>
  <nav aria-label="Breadcrumb"><a href="${SITE}">RupeePedia</a> &rsaquo; <span>Bank Holidays</span></nav>
  <main>
    <h1>Bank Holidays in India — 2025 &amp; 2026 RBI Calendar</h1>
    <p>
      Bank holidays in India are declared under the Negotiable Instruments Act via RBI circulars.
      National holidays close all banks; regional holidays apply state-wise. ATMs, UPI, IMPS,
      internet and mobile banking work 24×7 even on holidays — only branches and NEFT/RTGS
      settlement pause.
    </p>
    <h2>Bank holidays 2026</h2>
    ${holidayTable(HOLIDAYS_2026, 2026)}
    <h2>Bank holidays 2025</h2>
    ${holidayTable(HOLIDAYS_2025, 2025)}
    <section>
      <h2>Second and fourth Saturdays</h2>
      <p>
        In addition to the dates above, all banks in India are closed on every Sunday and on the
        second and fourth Saturday of each month. Regional lists vary — check your state's RBI
        circular for local festival holidays.
      </p>
    </section>
    <nav aria-label="Related pages">
      <h2>Explore more</h2>
      <ul>
        <li><a href="${SITE}/ifsc-finder">IFSC Code Finder</a></li>
        <li><a href="${SITE}/fd-rates">FD Interest Rates</a></li>
        <li><a href="${SITE}/calculators">Financial Calculators</a></li>
      </ul>
    </nav>
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

// Prices change intraday — cache briefly so the date/price stay fresh
const GOLD_HEADERS = {
  'Content-Type':  'text/html; charset=utf-8',
  'Cache-Control': 's-maxage=1800, stale-while-revalidate=300',
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
        signal:  AbortSignal.timeout(20000),
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
        signal:  AbortSignal.timeout(20000),
      });
      if (res.status === 404) {
        // Legacy URL scheme was /bank/<slug>-<bankId>. If stripping a trailing
        // numeric suffix yields a valid slug, 301 to the current URL.
        // (Cannot redirect blindly — a few real slugs also end in digits.)
        const legacy = urlSlug.match(/^(.+)-\d+$/);
        if (legacy) {
          const probe = await fetch(`${BACKEND}/api/bank/${legacy[1]}`, {
            headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
            // Short timeout: this only runs after the first fetch got a response,
            // so the backend is already warm. Keeps worst-case under the edge 25s cap.
            signal:  AbortSignal.timeout(8000),
          });
          if (probe.ok) {
            return new Response(null, {
              status: 301,
              headers: { Location: `${SITE}/bank/${legacy[1]}` },
            });
          }
        }
        return new Response(notFoundHtml('Bank'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      if (res.ok) return new Response(renderBank(await res.json(), urlSlug), { headers: SSR_HEADERS });
    }

    // /state/:bankSlug/:stateSlug
    const stateMatch = path.match(/^\/state\/([^/]+)\/([^/]+)$/);
    if (stateMatch) {
      const [, bankSlug, stateSlug] = stateMatch;
      const res = await fetch(`${BACKEND}/api/state/${bankSlug}/${stateSlug}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(20000),
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
        signal:  AbortSignal.timeout(20000),
      });
      if (res.status === 404) return new Response(notFoundHtml('City'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderCity(await res.json(), bankSlug, stateSlug, citySlug), { headers: SSR_HEADERS });
    }

    // /money-guides/:slug
    const blogMatch = path.match(/^\/money-guides\/([^/]+)$/);
    if (blogMatch) {
      const res = await fetch(`${BACKEND}/api/blogs/${blogMatch[1]}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(20000),
      });
      if (res.status === 404) return new Response(notFoundHtml('Article'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderBlog(await res.json()), { headers: BLOG_HEADERS });
    }

    // /gold-rate-today and /gold-rate-today/:city
    const goldMatch = path.match(/^\/gold-rate-today(?:\/([a-z-]+))?$/);
    if (goldMatch) {
      const citySlug = goldMatch[1] || null;
      const res = await fetch(`${BACKEND}/api/commodity-prices`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        // Unknown city slug → 404 (city list is fixed server-side)
        if (citySlug && !(data.cities || {})[tc(citySlug)]) {
          return new Response(notFoundHtml('City gold rate'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        return new Response(renderGold(data, citySlug), { headers: GOLD_HEADERS });
      }
    }

    // /fd-rates and /savings-rates
    const ratesMatch = path.match(/^\/(fd|savings)-rates$/);
    if (ratesMatch) {
      const kind = ratesMatch[1] as 'fd' | 'savings';
      const res = await fetch(`${BACKEND}/api/rates?type=${kind}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(20000),
      });
      if (res.ok) return new Response(renderRates(await res.json(), kind), { headers: GOLD_HEADERS });
    }

    // /currency-converter
    if (path === '/currency-converter') {
      const res = await fetch(`${BACKEND}/api/exchange-rates`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(20000),
      });
      if (res.ok) return new Response(renderCurrency(await res.json()), { headers: GOLD_HEADERS });
    }

    // /swift-code-lookup and /bank-holidays — static content, no backend needed
    if (path === '/swift-code-lookup') {
      return new Response(renderSwift(), { headers: SSR_HEADERS });
    }
    if (path === '/bank-holidays') {
      return new Response(renderHolidays(), { headers: SSR_HEADERS });
    }

    // /credit-cards/:slug (excludes /credit-cards/compare, /credit-cards/new — real app routes, not product slugs)
    const cardMatch = path.match(/^\/credit-cards\/([\w-]+)$/);
    if (cardMatch && !['compare', 'new'].includes(cardMatch[1])) {
      const res = await fetch(`${BACKEND}/api/products/${cardMatch[1]}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(20000),
      });
      if (res.status === 404) return new Response(notFoundHtml('Credit card'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderCard(await res.json()), { headers: SSR_HEADERS });
    }

    // /credit-cards (listing)
    if (path === '/credit-cards') {
      const res = await fetch(`${BACKEND}/api/products?category=credit_card&limit=100`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        return new Response(renderCardsList(data.products || []), { headers: SSR_HEADERS });
      }
    }

    // /calculators/:slug
    const calcMatch = path.match(/^\/calculators\/([\w-]+)$/);
    if (calcMatch) {
      return new Response(renderCalculator(calcMatch[1]), { headers: SSR_HEADERS });
    }

    // /pin/:pincode
    const pinMatch = path.match(/^\/pin\/(\d{6})$/);
    if (pinMatch) {
      const res = await fetch(`${BACKEND}/api/pin/${pinMatch[1]}`, {
        headers: { 'User-Agent': 'RupeePedia-Renderer/1.0' },
        signal:  AbortSignal.timeout(20000),
      });
      if (res.status === 404) return new Response(notFoundHtml('PIN code'), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (res.ok) return new Response(renderPin(await res.json()), { headers: SSR_HEADERS });
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
