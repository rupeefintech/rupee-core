import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { api } from '../utils/api';
import { RefreshCw, TrendingUp, ChevronDown, Info, MapPin } from 'lucide-react';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

const CITIES = [
  'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad',
  'Bangalore', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow', 'Surat', 'Patna',
];

type Unit = '10g' | 'gram' | 'tola' | 'sovereign';
type Purity = '24K' | '22K' | '18K' | '14K';

const UNIT_LABELS: Record<Unit, string> = {
  '10g': 'Per 10 Grams',
  'gram': 'Per Gram',
  'tola': 'Per Tola (11.66g)',
  'sovereign': 'Per Sovereign (8g)',
};

function PurityBadge({ label, pct, active, onClick }: { label: string; pct: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
        active ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-300'
      }`}>
      {label} <span className="opacity-70 font-normal">{pct}</span>
    </button>
  );
}

export default function GoldSilverRatePage() {
  const [city, setCity] = useState('Mumbai');
  const [unit, setUnit] = useState<Unit>('10g');
  const [purity, setPurity] = useState<Purity>('24K');

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['commodity-prices'],
    queryFn: () => api.getCommodityPrices(),
    staleTime: 25 * 60 * 1000,
    retry: 2,
  });

  function getGoldPrice(d: typeof data): number {
    if (!d) return 0;
    const cityData = d.cities[city];
    const base24k = cityData?.gold_24k_per_10g ?? d.gold.price_24k_per_10g;
    const base22k = cityData?.gold_22k_per_10g ?? d.gold.price_22k_per_10g;

    let per10g: number;
    if (purity === '24K') per10g = base24k;
    else if (purity === '22K') per10g = base22k;
    else if (purity === '18K') per10g = Math.round(base24k * 18 / 24);
    else per10g = Math.round(base24k * 14 / 24);

    if (unit === '10g') return per10g;
    if (unit === 'gram') return Math.round(per10g / 10);
    if (unit === 'tola') return Math.round(per10g * 1.16638);
    return Math.round(per10g * 0.8); // sovereign = 8g
  }

  function getSilverPrice(d: typeof data): number {
    if (!d) return 0;
    if (unit === 'gram') return d.silver.price_per_gram;
    if (unit === '10g') return d.silver.price_per_10g;
    if (unit === 'tola') return Math.round(d.silver.price_per_gram * 11.6638);
    return Math.round(d.silver.price_per_gram * 8); // sovereign
  }

  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Gold Rate Today in India — 24K & 22K Gold Price Per Gram | RupeePedia</title>
        <meta name="description" content={`Today's gold rate in ${city} — 24K gold ₹${data ? Math.round(data.gold.price_24k_per_10g / 10).toLocaleString('en-IN') : '...'}/g, 22K gold price per gram & 10g. Live silver rate. Updated every 30 minutes.`} />
        <meta name="keywords" content="gold rate today, gold price today india, 24k gold price today, 22k gold price today, silver rate today, gold price per gram india" />
        <link rel="canonical" href="https://rupeepedia.in/gold-rate-today" />
        <meta property="og:title" content="Gold Rate Today in India — 24K & 22K Gold Price Per Gram" />
        <meta property="og:description" content="Today's gold rate in India — 24K and 22K gold price per gram and 10 grams. Live silver price per kg. Updated every 30 minutes." />
        <meta property="og:url" content="https://rupeepedia.in/gold-rate-today" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Gold Rate Today in India — 24K & 22K Gold Price" />
        <meta name="twitter:description" content="Today's gold rate in India — 24K and 22K gold price per gram. Live silver price. Updated every 30 minutes." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "name": "Gold Rate Today in India",
              "url": "https://rupeepedia.in/gold-rate-today",
              "description": "Today's gold and silver rates in India. 24K and 22K gold price per gram and 10 grams. Live silver price per kg. Updated every 30 minutes.",
              "provider": { "@type": "Organization", "name": "RupeePedia", "url": "https://rupeepedia.in" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How is the gold price determined in India?",
                  "acceptedAnswer": { "@type": "Answer", "text": "India's gold price is set by the IBJA (Indian Bullion and Jewellers Association) twice daily, based on the international COMEX/LBMA spot price converted to INR. Jewellers charge this rate plus GST (3%) and making charges. Prices vary slightly by city due to local taxes and logistics." }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between 24K, 22K, and 18K gold?",
                  "acceptedAnswer": { "@type": "Answer", "text": "24K gold is 99.9% pure — used for investment bars and coins. 22K gold is 91.6% pure (hallmarked BIS 916) — standard for jewellery in India. 18K gold is 75% pure — used for diamond-studded jewellery. 14K is used for low-cost jewellery." }
                },
                {
                  "@type": "Question",
                  "name": "What is a Tola of gold?",
                  "acceptedAnswer": { "@type": "Answer", "text": "1 Tola equals 11.6638 grams. It is a traditional Indian unit used in jewellery trading. 1 Sovereign equals 8 grams, commonly used in South India (Kerala and Tamil Nadu)." }
                },
                {
                  "@type": "Question",
                  "name": "Why do gold prices differ by city in India?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Each state levies different local taxes on gold. Cities farther from ports (like Mumbai or Chennai) pay more for transportation. Delhi, Hyderabad, and Kolkata typically have ₹50–200/10g higher prices than Mumbai." }
                },
                {
                  "@type": "Question",
                  "name": "How often is the gold rate updated on RupeePedia?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Gold and silver prices on RupeePedia refresh every 30 minutes from international spot markets. Gold trades 24×5 globally (closed on weekends). MCX gold futures in India trade 9 AM to 11:30 PM IST on weekdays." }
                }
              ]
            }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                { '@type': 'ListItem', position: 2, name: 'Gold Rate Today', item: 'https://rupeepedia.in/gold-rate-today' },
              ],
            },
            ...(data ? [{
              '@type': 'Dataset',
              name: 'Gold & Silver Rates India — Live Prices',
              description: `Live gold and silver commodity prices in India. 24K gold: ₹${data.gold.price_24k_per_10g.toLocaleString('en-IN')}/10g, 22K gold: ₹${data.gold.price_22k_per_10g.toLocaleString('en-IN')}/10g. Silver: ₹${data.silver.price_per_kg.toLocaleString('en-IN')}/kg. Updated every 30 minutes.`,
              url: 'https://rupeepedia.in/gold-rate-today',
              creator: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
              dateModified: data.updated_at,
              variableMeasured: [
                { '@type': 'PropertyValue', name: '24K Gold per 10g (INR)', value: data.gold.price_24k_per_10g },
                { '@type': 'PropertyValue', name: '22K Gold per 10g (INR)', value: data.gold.price_22k_per_10g },
                { '@type': 'PropertyValue', name: 'Silver per kg (INR)', value: data.silver.price_per_kg },
                { '@type': 'PropertyValue', name: 'USD/INR', value: data.usd_inr },
              ],
            }] : []),
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen" style={{ background: '#FAF7F0' }}>
        {/* Hero — warm cream, editorial */}
        <div className="px-4 py-10 border-b" style={{ background: '#FAF7F0', borderColor: '#E8DFD0' }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border"
                style={{ background: '#2C1810', color: '#FAF0D0', borderColor: '#2C1810' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C9A84C' }} />
                Live Prices — Updated every 30 min
              </div>
              <button onClick={() => refetch()}
                className="flex items-center gap-1.5 text-xs transition"
                style={{ color: '#8B7355' }}>
                <RefreshCw size={13} />
                {updatedAt ? `Updated ${updatedAt}` : 'Refresh'}
              </button>
            </div>
            <h1 className="text-4xl font-bold mb-1" style={{ color: '#2C1810', letterSpacing: '-0.03em' }}>
              Gold &amp; Silver Rate Today
            </h1>
            <p className="text-sm mt-1" style={{ color: '#8B7355' }}>{today}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

          {/* Controls */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7355' }} />
              <select value={city} onChange={e => setCity(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-lg text-sm appearance-none focus:outline-none border"
                style={{ background: '#FAF7F0', borderColor: '#D4C5A9', color: '#2C1810' }}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8B7355' }} />
            </div>
            <div className="relative">
              <select value={unit} onChange={e => setUnit(e.target.value as Unit)}
                className="px-3 pr-8 py-2 rounded-lg text-sm appearance-none focus:outline-none border"
                style={{ background: '#FAF7F0', borderColor: '#D4C5A9', color: '#2C1810' }}>
                {(Object.entries(UNIT_LABELS) as [Unit, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8B7355' }} />
            </div>
            <div className="flex gap-1.5">
              {(['24K', '22K', '18K', '14K'] as Purity[]).map(p => (
                <button key={p} onClick={() => setPurity(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                  style={purity === p
                    ? { background: '#2C1810', color: '#FAF0D0', borderColor: '#2C1810' }
                    : { background: 'transparent', color: '#8B7355', borderColor: '#D4C5A9' }}>
                  {p} <span className="font-normal opacity-60">{p === '24K' ? '99.9%' : p === '22K' ? '91.6%' : p === '18K' ? '75%' : '58.3%'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main price cards */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: '#E8DFD0' }} />)}
            </div>
          ) : isError ? (
            <div className="rounded-xl p-6 text-center text-sm border" style={{ background: '#FEF2F2', borderColor: '#FCA5A5', color: '#B91C1C' }}>
              Failed to fetch live prices. <button onClick={() => refetch()} className="underline font-semibold">Try again</button>
            </div>
          ) : data ? (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Gold card — espresso */}
                <div className="rounded-2xl p-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #2C1810 0%, #3D2415 100%)' }}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: 'rgba(201,168,76,0.2)' }}>🥇</div>
                    <div>
                      <div className="font-bold text-sm" style={{ color: '#FAF0D0' }}>Gold — {purity}</div>
                      <div className="text-[11px]" style={{ color: 'rgba(250,240,208,0.5)' }}>{city} · {UNIT_LABELS[unit]}</div>
                    </div>
                  </div>
                  <div className="text-4xl font-black mb-2 tracking-tight" style={{ color: '#C9A84C' }}>
                    {fmt(getGoldPrice(data))}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(201,168,76,0.55)' }}>
                    Per gram: {fmt(data.gold.price_24k_per_gram)} · Per tola: {fmt(data.gold.price_24k_per_tola)}
                  </div>
                </div>

                {/* Silver card — deep navy */}
                <div className="rounded-2xl p-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #1B2C3D 0%, #243547 100%)' }}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: 'rgba(188,208,224,0.15)' }}>🥈</div>
                    <div>
                      <div className="font-bold text-sm" style={{ color: '#E8F0F6' }}>Silver — 999 Pure</div>
                      <div className="text-[11px]" style={{ color: 'rgba(232,240,246,0.45)' }}>{city} · {UNIT_LABELS[unit]}</div>
                    </div>
                  </div>
                  <div className="text-4xl font-black mb-2 tracking-tight" style={{ color: '#C8E0F0' }}>
                    {fmt(getSilverPrice(data))}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(200,224,240,0.5)' }}>
                    Per gram: {fmt(data.silver.price_per_gram)} · Per 100g: {fmt(data.silver.price_per_100g)}
                  </div>
                </div>
              </div>

              {/* Gold table */}
              <div className="rounded-2xl overflow-hidden border" style={{ background: '#FFFCF7', borderColor: '#E8DFD0' }}>
                <div className="px-5 py-3.5 flex items-center gap-2 border-b" style={{ background: '#F5EFE4', borderColor: '#E8DFD0' }}>
                  <TrendingUp size={15} style={{ color: '#8B7355' }} />
                  <span className="font-bold text-sm" style={{ color: '#2C1810' }}>Gold Price — {city} Today</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: '#F5EFE4' }}>
                        <th className="text-left px-5 py-2.5 text-xs font-semibold" style={{ color: '#8B7355' }}>Purity</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: '#8B7355' }}>Per Gram</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: '#8B7355' }}>Per 10g</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: '#8B7355' }}>Per Tola</th>
                        <th className="text-right px-5 py-2.5 text-xs font-semibold" style={{ color: '#8B7355' }}>Per Sovereign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        { label: '24 Karat (99.9%)', k: 24 },
                        { label: '22 Karat (91.6%)', k: 22 },
                        { label: '18 Karat (75%)',   k: 18 },
                        { label: '14 Karat (58.3%)', k: 14 },
                      ] as const).map(({ label, k }) => {
                        const cityBase = data.cities[city]?.gold_24k_per_10g ?? data.gold.price_24k_per_10g;
                        const per10g = Math.round(cityBase * k / 24);
                        return (
                          <tr key={k} className="border-t" style={{ borderColor: '#EFE8DA' }}>
                            <td className="px-5 py-3 font-semibold" style={{ color: '#2C1810' }}>{label}</td>
                            <td className="px-4 py-3 text-right" style={{ color: '#5C3D1E' }}>{fmt(Math.round(per10g / 10))}</td>
                            <td className="px-4 py-3 text-right font-bold" style={{ color: '#2C1810' }}>{fmt(per10g)}</td>
                            <td className="px-4 py-3 text-right" style={{ color: '#5C3D1E' }}>{fmt(Math.round(per10g * 1.16638))}</td>
                            <td className="px-5 py-3 text-right" style={{ color: '#5C3D1E' }}>{fmt(Math.round(per10g * 0.8))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Silver table */}
              <div className="rounded-2xl overflow-hidden border" style={{ background: '#FFFCF7', borderColor: '#E8DFD0' }}>
                <div className="px-5 py-3.5 flex items-center gap-2 border-b" style={{ background: '#F5EFE4', borderColor: '#E8DFD0' }}>
                  <span className="text-base">🥈</span>
                  <span className="font-bold text-sm" style={{ color: '#2C1810' }}>Silver Price — {city} Today</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y" style={{ borderColor: '#EFE8DA' }}>
                  {[
                    { label: 'Per Gram', value: fmt(data.silver.price_per_gram) },
                    { label: 'Per 10 Grams', value: fmt(data.silver.price_per_10g) },
                    { label: 'Per 100 Grams', value: fmt(data.silver.price_per_100g) },
                    { label: 'Per Kg', value: fmt(data.silver.price_per_kg) },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-5 py-4">
                      <div className="text-[11px] mb-1" style={{ color: '#8B7355' }}>{label}</div>
                      <div className="font-bold" style={{ color: '#1B2C3D' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                <div>{data.disclaimer} Prices sourced from international spot markets + standard India import duties. For MCX or jeweller prices, check directly with your bank or jeweller.</div>
              </div>
            </>
          ) : null}

          {/* City gold rates — espresso gold aesthetic */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg, #2C1810 0%, #3D2415 50%, #1a0a04 100%)' }}>
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/[0.07]">
              <div>
                <h2 className="text-white font-bold text-base tracking-tight">Gold Rate Today by City</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(250,240,208,0.4)' }}>24K price per 10g · IBJA benchmark</p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                style={{ color: '#e8c97a', background: 'rgba(232,201,122,0.1)', borderColor: 'rgba(232,201,122,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#e8c97a' }} />
                Live
              </span>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {([
                { slug: 'mumbai',    name: 'Mumbai',    base: true },
                { slug: 'delhi',     name: 'Delhi'                },
                { slug: 'chennai',   name: 'Chennai'              },
                { slug: 'kolkata',   name: 'Kolkata'              },
                { slug: 'hyderabad', name: 'Hyderabad'            },
                { slug: 'bangalore', name: 'Bangalore'            },
                { slug: 'ahmedabad', name: 'Ahmedabad'            },
                { slug: 'pune',      name: 'Pune'                 },
                { slug: 'jaipur',    name: 'Jaipur'               },
                { slug: 'lucknow',   name: 'Lucknow'              },
                { slug: 'surat',     name: 'Surat'                },
                { slug: 'patna',     name: 'Patna'                },
              ] as { slug: string; name: string; base?: boolean }[]).map(({ slug, name, base }) => {
                const cityData = data?.cities[name];
                const price24k = cityData?.gold_24k_per_10g ?? data?.gold.price_24k_per_10g;
                const price22k = cityData?.gold_22k_per_10g ?? data?.gold.price_22k_per_10g;
                const diff = data && cityData && !base
                  ? cityData.gold_24k_per_10g - data.gold.price_24k_per_10g
                  : null;

                return (
                  <a
                    key={slug}
                    href={`/gold-rate-today/${slug}`}
                    className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(232,201,122,0.07)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,201,122,0.3)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    }}
                  >
                    {/* Champagne top bar */}
                    <div className="h-[1.5px] w-full transition-all duration-200"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(232,201,122,0.4), transparent)' }} />

                    <div className="p-3">
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="text-xs font-medium leading-none tracking-wide" style={{ color: 'rgba(250,240,208,0.6)' }}>{name}</p>
                        {base ? (
                          <span className="text-[9px] font-bold tracking-wider uppercase leading-none px-1.5 py-0.5 rounded"
                            style={{ color: '#e8c97a', background: 'rgba(232,201,122,0.12)' }}>IBJA</span>
                        ) : diff !== null ? (
                          <span className="text-[9px] leading-none" style={{ color: 'rgba(250,240,208,0.4)' }}>+{fmt(diff)}</span>
                        ) : null}
                      </div>

                      {price24k ? (
                        <>
                          <p className="font-black text-[17px] leading-none tracking-tight"
                            style={{ color: '#e8c97a' }}>
                            {fmt(price24k)}
                          </p>
                          <p className="text-[10px] mt-1" style={{ color: 'rgba(250,240,208,0.25)' }}>24K · per 10g</p>
                          {price22k && (
                            <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'rgba(232,201,122,0.45)' }}>
                              22K {fmt(price22k)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="h-5 w-20 rounded animate-pulse mt-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      )}
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="px-5 pb-4 text-center text-[10px]" style={{ color: 'rgba(232,201,122,0.2)' }}>
              Prices include city-wise differentials · Click any city for full 24K · 22K · 18K breakdown
            </div>
          </div>

          {/* FAQ / Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-bold text-gray-900">About Gold & Silver Prices in India</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <div className="font-semibold text-gray-800 mb-1">How is India gold price determined?</div>
                <p>India gold price is set by the IBJA (Indian Bullion and Jewellers Association) twice daily, based on the COMEX/LBMA international spot price converted to INR. This IBJA benchmark rate is the base price used by importers and banks. Jewellers charge this rate + GST (3%) + making charges. Prices also vary slightly by city due to local taxes and logistics.</p>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-1">24K vs 22K vs 18K gold</div>
                <p><strong>24K (99.9% pure)</strong> — investment grade gold bars and coins. <strong>22K (91.6%)</strong> — standard for gold jewellery in India (hallmarked BIS 916). <strong>18K (75%)</strong> — used for diamond-studded jewellery. <strong>14K</strong> — used for low-cost jewellery.</p>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-1">What is a Tola?</div>
                <p>1 Tola = 11.6638 grams. Traditional Indian unit used in jewellery trading. 1 Sovereign = 8 grams (used in South India, especially Kerala and Tamil Nadu).</p>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-1">Why do gold prices differ by city?</div>
                <p>Each state levies different local taxes on gold. Cities farther from ports (Mumbai, Chennai) pay more for transportation. Delhi, Hyderabad, and Kolkata typically have ₹50–200/10g higher prices than Mumbai.</p>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-1">How often is this updated?</div>
                <p>Prices refresh every 30 minutes from international spot markets. Gold trades 24×5 globally (closed weekends). MCX gold futures in India trade 9 AM – 11:30 PM IST on weekdays.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
