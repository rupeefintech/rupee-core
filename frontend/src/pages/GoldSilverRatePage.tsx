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
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-600 text-white py-10 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Live Prices — Updated every 30 min
            </div>
            <h1 className="text-3xl font-bold mb-1">Gold & Silver Rate Today</h1>
            <p className="text-yellow-100 text-sm">{today}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

          {/* Controls row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* City */}
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
              >
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Unit */}
            <div className="relative">
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as Unit)}
                className="px-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
              >
                {(Object.entries(UNIT_LABELS) as [Unit, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Purity pills */}
            <div className="flex gap-1.5">
              {(['24K', '22K', '18K', '14K'] as Purity[]).map(p => (
                <PurityBadge key={p}
                  label={p}
                  pct={p === '24K' ? '99.9%' : p === '22K' ? '91.6%' : p === '18K' ? '75%' : '58.3%'}
                  active={purity === p}
                  onClick={() => setPurity(p)}
                />
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-600 transition"
            >
              <RefreshCw size={13} />
              {updatedAt ? `Updated ${updatedAt}` : 'Refresh'}
            </button>
          </div>

          {/* Main price cards */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 text-sm">
              Failed to fetch live prices. <button onClick={() => refetch()} className="underline font-semibold">Try again</button>
            </div>
          ) : data ? (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Gold card */}
                <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 p-5 text-white shadow-lg shadow-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center text-lg">🥇</div>
                    <div>
                      <div className="font-bold text-sm">Gold — {purity}</div>
                      <div className="text-[11px] text-yellow-100">{city} · {UNIT_LABELS[unit]}</div>
                    </div>
                  </div>
                  <div className="text-3xl font-black mb-1">{fmt(getGoldPrice(data))}</div>
                  <div className="text-xs text-yellow-100">
                    Per gram: {fmt(data.gold.price_24k_per_gram)} · Per tola: {fmt(data.gold.price_24k_per_tola)}
                  </div>
                </div>

                {/* Silver card */}
                <div className="rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 p-5 text-white shadow-lg shadow-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center text-lg">🥈</div>
                    <div>
                      <div className="font-bold text-sm">Silver — 999 Pure</div>
                      <div className="text-[11px] text-gray-200">{city} · {UNIT_LABELS[unit]}</div>
                    </div>
                  </div>
                  <div className="text-3xl font-black mb-1">{fmt(getSilverPrice(data))}</div>
                  <div className="text-xs text-gray-300">
                    Per gram: {fmt(data.silver.price_per_gram)} · Per 100g: {fmt(data.silver.price_per_100g)}
                  </div>
                </div>
              </div>

              {/* Gold quick reference table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <TrendingUp size={15} className="text-yellow-500" />
                  <span className="font-bold text-sm text-gray-800">Gold Price — {city} Today</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-50">
                        <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Purity</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Per Gram</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Per 10g</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Per Tola</th>
                        <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Per Sovereign (8g)</th>
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
                          <tr key={k} className="border-t border-gray-50 hover:bg-gray-50">
                            <td className="px-5 py-3 font-semibold text-gray-800">{label}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{fmt(Math.round(per10g / 10))}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(per10g)}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{fmt(Math.round(per10g * 1.16638))}</td>
                            <td className="px-5 py-3 text-right text-gray-700">{fmt(Math.round(per10g * 0.8))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Silver reference table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-base">🥈</span>
                  <span className="font-bold text-sm text-gray-800">Silver Price — {city} Today</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
                  {[
                    { label: 'Per Gram', value: fmt(data.silver.price_per_gram) },
                    { label: 'Per 10 Grams', value: fmt(data.silver.price_per_10g) },
                    { label: 'Per 100 Grams', value: fmt(data.silver.price_per_100g) },
                    { label: 'Per Kg', value: fmt(data.silver.price_per_kg) },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-5 py-4">
                      <div className="text-[11px] text-gray-400 mb-1">{label}</div>
                      <div className="font-bold text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* City comparison */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <MapPin size={15} className="text-brand-500" />
                  <span className="font-bold text-sm text-gray-800">24K Gold Rate by City ({UNIT_LABELS['10g']})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-y divide-x divide-gray-100">
                  {CITIES.map(c => {
                    const cityData = data.cities[c];
                    const price = cityData?.gold_24k_per_10g ?? data.gold.price_24k_per_10g;
                    return (
                      <button
                        key={c}
                        onClick={() => setCity(c)}
                        className={`px-4 py-3.5 text-left transition ${city === c ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`text-xs font-semibold mb-0.5 ${city === c ? 'text-yellow-700' : 'text-gray-500'}`}>{c}</div>
                        <div className={`text-sm font-bold ${city === c ? 'text-yellow-800' : 'text-gray-800'}`}>{fmt(price)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                <div>{data.disclaimer} Prices sourced from international spot markets + standard India import duties. For MCX or jeweller prices, check directly with your bank or jeweller.</div>
              </div>
            </>
          ) : null}

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
