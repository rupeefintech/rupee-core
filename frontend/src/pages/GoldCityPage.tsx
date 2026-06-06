import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { ArrowLeft, RefreshCw, TrendingUp, Info } from 'lucide-react';

const CITY_MAP: Record<string, { name: string; diff: number }> = {
  mumbai:    { name: 'Mumbai',    diff: 0 },
  delhi:     { name: 'Delhi',     diff: 120 },
  chennai:   { name: 'Chennai',   diff: 180 },
  kolkata:   { name: 'Kolkata',   diff: 60 },
  hyderabad: { name: 'Hyderabad', diff: 90 },
  bangalore: { name: 'Bangalore', diff: 140 },
  ahmedabad: { name: 'Ahmedabad', diff: 70 },
  pune:      { name: 'Pune',      diff: 50 },
  jaipur:    { name: 'Jaipur',    diff: 100 },
  lucknow:   { name: 'Lucknow',   diff: 110 },
  surat:     { name: 'Surat',     diff: 65 },
  patna:     { name: 'Patna',     diff: 130 },
};

const OTHER_CITIES = Object.keys(CITY_MAP);

function fmt(n: number) {
  return n.toLocaleString('en-IN');
}

export default function GoldCityPage() {
  const { city } = useParams<{ city: string }>();
  const slug = city?.toLowerCase() ?? '';

  if (!CITY_MAP[slug]) return <Navigate to="/gold-rate-today" replace />;

  const { name } = CITY_MAP[slug];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['commodity-prices'],
    queryFn: () => api.getCommodityPrices(),
    staleTime: 25 * 60 * 1000,
    retry: 2,
  });

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  const cityData   = data?.cities[name];
  const g24        = cityData?.gold_24k_per_10g ?? data?.gold.price_24k_per_10g ?? 0;
  const g22        = cityData?.gold_22k_per_10g ?? data?.gold.price_22k_per_10g ?? 0;
  const g18        = g24 ? Math.round(g24 * 18 / 24) : 0;
  const g14        = g24 ? Math.round(g24 * 14 / 24) : 0;
  const silverKg   = data?.silver.price_per_kg ?? 0;
  const usdInr     = data?.usd_inr ?? 0;

  const title = `Gold Rate Today in ${name} — 24K & 22K Gold Price | RupeePedia`;
  const desc  = `Today's gold rate in ${name}: 24K gold ₹${g24 ? fmt(Math.round(g24 / 10)) : '...'}/gram, 22K gold ₹${g22 ? fmt(Math.round(g22 / 10)) : '...'}/gram. Silver rate ₹${silverKg ? fmt(Math.round(silverKg / 1000)) : '...'}/gram. Updated every 30 minutes.`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`https://rupeepedia.in/gold-rate-today/${slug}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={`https://rupeepedia.in/gold-rate-today/${slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: title,
              url: `https://rupeepedia.in/gold-rate-today/${slug}`,
              description: desc,
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                  { '@type': 'ListItem', position: 2, name: 'Gold Rate Today', item: 'https://rupeepedia.in/gold-rate-today' },
                  { '@type': 'ListItem', position: 3, name: `Gold Rate in ${name}`, item: `https://rupeepedia.in/gold-rate-today/${slug}` },
                ],
              },
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `What is the gold rate today in ${name}?`,
                  acceptedAnswer: { '@type': 'Answer', text: g24 ? `Today's 24K gold rate in ${name} is ₹${fmt(g24)} per 10 grams (₹${fmt(Math.round(g24 / 10))} per gram). 22K gold is ₹${fmt(g22)} per 10 grams. Prices updated every 30 minutes.` : `Check the live gold rate in ${name} at rupeepedia.in/gold-rate-today/${slug}. Prices are updated every 30 minutes.` },
                },
                {
                  '@type': 'Question',
                  name: `Why is gold rate different in ${name} compared to other cities?`,
                  acceptedAnswer: { '@type': 'Answer', text: `Gold prices vary by city in India due to local state taxes, transportation costs, and logistics. ${name === 'Chennai' ? 'Chennai typically has higher gold rates due to demand and local taxes.' : name === 'Mumbai' ? 'Mumbai is the base city for IBJA gold rates as it hosts major bullion markets.' : `${name} has a price differential from Mumbai based on local taxes and transport costs.`}` },
                },
                {
                  '@type': 'Question',
                  name: 'What is the difference between 22K and 24K gold in India?',
                  acceptedAnswer: { '@type': 'Answer', text: '24K gold is 99.9% pure, used for investment coins and bars. 22K gold (BIS hallmark 916) is 91.6% pure, the standard for jewellery in India. Most jewellers sell 22K jewellery.' },
                },
              ],
            },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-yellow-500 via-yellow-400 to-amber-500 text-white px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link to="/gold-rate-today" className="inline-flex items-center gap-1.5 text-yellow-100 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> All India Gold Rates
            </Link>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">Gold Rate Today in {name}</h1>
                <p className="text-yellow-100 text-sm">{today}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-yellow-100">
                {updatedAt && <span>Updated {updatedAt}</span>}
                <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* Price Table */}
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">Loading live prices…</div>
          ) : isError ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-3">Unable to load live prices</p>
              <button onClick={() => refetch()} className="text-sm text-yellow-600 hover:underline flex items-center gap-1 mx-auto">
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                <h2 className="font-bold text-gray-900">Gold Price in {name} Today</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold text-gray-600">Purity</th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-600">Per Gram</th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-600">Per 10 Grams</th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-600">Per Tola (11.66g)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: '24K (99.9% pure)', per10g: g24, badge: 'Investment' },
                      { label: '22K (91.6% BIS 916)', per10g: g22, badge: 'Jewellery' },
                      { label: '18K (75% pure)', per10g: g18, badge: '' },
                      { label: '14K (58.5% pure)', per10g: g14, badge: '' },
                    ].map(({ label, per10g, badge }) => (
                      <tr key={label} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5 font-medium text-gray-800">
                          {label}
                          {badge && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">{badge}</span>}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-gray-900">₹{fmt(Math.round(per10g / 10))}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-gray-900 font-semibold">₹{fmt(per10g)}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-gray-900">₹{fmt(Math.round(per10g * 1.16638))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-500">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Prices based on COMEX spot rate via IBJA benchmark. Actual jeweller price will be higher due to GST (3%) + making charges. 1 USD = ₹{fmt(usdInr)}.</span>
              </div>
            </div>
          )}

          {/* Silver */}
          {data && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Silver Rate in {name} Today</h2>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {[
                    { label: 'Per Gram', value: data.silver.price_per_gram },
                    { label: 'Per 10 Grams', value: data.silver.price_per_10g },
                    { label: 'Per 100 Grams', value: data.silver.price_per_100g },
                    { label: 'Per Kg', value: data.silver.price_per_kg },
                  ].map(({ label, value }) => (
                    <tr key={label} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 text-gray-600">{label}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-gray-900">₹{fmt(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Other Cities */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Gold Rate Today in Other Cities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {OTHER_CITIES.filter(c => c !== slug).map(c => (
                <Link
                  key={c}
                  to={`/gold-rate-today/${c}`}
                  className="flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all text-center"
                >
                  <span className="font-medium text-gray-800 text-sm">{CITY_MAP[c].name}</span>
                  {data && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      ₹{fmt((data.cities[CITY_MAP[c].name]?.gold_24k_per_10g ?? data.gold.price_24k_per_10g))}/10g
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">About Gold Rates in {name}</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-800 mb-1">How is the {name} gold rate calculated?</p>
                <p>The gold rate in {name} is derived from the IBJA (Indian Bullion and Jewellers Association) benchmark, which is based on international COMEX/LBMA spot prices converted to INR. A city-specific differential is added to account for local state taxes and logistics. Mumbai is the base city; {name} prices reflect a local adjustment of approximately ₹{CITY_MAP[slug].diff}/10g.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">What is the actual buying price at jewellers in {name}?</p>
                <p>Jewellers charge the IBJA rate plus GST at 3% on gold value, plus making charges (₹150–600/gram depending on design complexity). The total effective cost for 22K jewellery is typically 8–15% above the base rate shown here.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">24K vs 22K gold in {name}</p>
                <p>24K (99.9% pure) is investment-grade gold — used for sovereign gold bonds, digital gold, and bullion coins. 22K (BIS 916 hallmark) is jewellery-grade gold. Most jewellers in {name} sell 22K hallmarked jewellery as per BIS regulations.</p>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center">
            <Link to="/gold-rate-today" className="text-yellow-700 hover:text-yellow-900 text-sm font-medium hover:underline">
              ← View all-India gold rates & more cities
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
