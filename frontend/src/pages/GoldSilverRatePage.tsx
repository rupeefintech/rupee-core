import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { api, CommodityPrices } from '../utils/api';
import { RefreshCw, TrendingUp, ChevronDown, ChevronUp, Info, MapPin, ChevronRight, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

type CalcPurity = '24K' | '22K' | '18K' | '14K';
const CALC_PURITY_FACTOR: Record<CalcPurity, number> = { '24K': 24, '22K': 22, '18K': 18, '14K': 14 };

function JewelryPriceCalculator({ data, city }: { data: CommodityPrices; city: string }) {
  const [purity, setPurity] = useState<CalcPurity>('22K');
  const [weight, setWeight] = useState(10);
  const [makingPct, setMakingPct] = useState(12);
  const [includeHallmark, setIncludeHallmark] = useState(true);

  const cityData = data.cities[city];
  const base24kPer10g = cityData?.gold_24k_per_10g ?? data.gold.price_24k_per_10g;
  const perGram = Math.round(base24kPer10g * CALC_PURITY_FACTOR[purity] / 24 / 10);

  const goldValue = Math.round(perGram * weight);
  const makingCharges = Math.round(goldValue * makingPct / 100);
  const hallmarkFee = includeHallmark ? 45 : 0;
  const gstBase = goldValue + makingCharges + hallmarkFee;
  const gst = Math.round(gstBase * 0.03);
  const total = gstBase + gst;

  return (
    <div className="bg-surface rounded-2xl border border-line overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center gap-2">
        <Calculator className="w-4 h-4 text-acc" />
        <div>
          <h3 className="font-bold text-ink text-sm">Jewelry Price Calculator</h3>
          <p className="text-[11px] text-faint">City: {city}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-faint uppercase tracking-wider mb-2">Gold Purity</p>
          <div className="grid grid-cols-4 gap-1.5">
            {(['24K', '22K', '18K', '14K'] as CalcPurity[]).map(p => (
              <button key={p} onClick={() => setPurity(p)}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  purity === p
                    ? 'bg-gradient-to-br from-mint to-acc text-white border-transparent shadow-acc-glow'
                    : 'bg-bg-2 text-muted border-line hover:border-acc/40'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-faint uppercase tracking-wider">Weight (grams)</p>
            <span className="text-sm font-bold text-ink">{weight} g</span>
          </div>
          <input type="range" min={1} max={100} step={1} value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full accent-acc" />
          <div className="flex justify-between text-[10px] text-faint mt-1">
            <span>1 g</span><span>8 g (1 Sovereign)</span><span>100 g</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-faint uppercase tracking-wider mb-2">Making Charges (% of gold value)</p>
          <input type="number" min={0} max={50} value={makingPct}
            onChange={e => setMakingPct(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg text-sm border border-line-2 bg-bg-2 text-ink focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc transition-all" />
        </div>

        <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
          <input type="checkbox" checked={includeHallmark} onChange={e => setIncludeHallmark(e.target.checked)}
            className="accent-acc w-4 h-4" />
          Include BIS Hallmark Fee (₹45 + 3% GST)
        </label>

        <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-body">
            <span>Gold value ({weight}g @ {fmt(perGram)}/g)</span>
            <span className="ifsc-mono">{fmt(goldValue)}</span>
          </div>
          <div className="flex justify-between text-body">
            <span>Making charges ({makingPct}%)</span>
            <span className="ifsc-mono">{fmt(makingCharges)}</span>
          </div>
          {includeHallmark && (
            <div className="flex justify-between text-body">
              <span>BIS hallmark fee</span>
              <span className="ifsc-mono">{fmt(hallmarkFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-body">
            <span>GST (3% on gold + making)</span>
            <span className="ifsc-mono">{fmt(gst)}</span>
          </div>
          <div className="flex justify-between font-bold text-ink pt-1.5 mt-1.5 border-t border-gold/25">
            <span>Estimated Total</span>
            <span className="ifsc-mono text-gold text-base">{fmt(total)}</span>
          </div>
        </div>

        <p className="text-[11px] text-faint leading-relaxed">
          Estimate only — always ask your jeweller for an itemised bill with the 6-digit HUID code and making charges shown separately.
        </p>
      </div>
    </div>
  );
}

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

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-acc transition-colors"
      >
        <span className="font-semibold text-ink text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-acc shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted shrink-0" />
        }
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted leading-relaxed">
          {a}
        </div>
      )}
    </div>
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

  const faqs = [
    {
      q: 'How is the gold price determined in India?',
      a: "India's gold price is set by the IBJA (Indian Bullion and Jewellers Association) twice daily, based on the international COMEX/LBMA spot price converted to INR. This IBJA benchmark rate is the base price used by importers and banks. Jewellers charge this rate plus GST (3%) and making charges. Prices vary slightly by city due to local taxes and logistics.",
    },
    {
      q: 'What is the difference between 24K, 22K, and 18K gold?',
      a: '24K gold is 99.9% pure — used for investment bars and coins. 22K gold is 91.6% pure (hallmarked BIS 916) — standard for jewellery in India. 18K gold is 75% pure — used for diamond-studded jewellery. 14K is used for low-cost jewellery.',
    },
    {
      q: 'What is a Tola of gold?',
      a: '1 Tola equals 11.6638 grams. It is a traditional Indian unit used in jewellery trading. 1 Sovereign equals 8 grams, commonly used in South India (Kerala and Tamil Nadu).',
    },
    {
      q: 'Why do gold prices differ by city in India?',
      a: 'Each state levies different local taxes on gold. Cities farther from ports (like Mumbai or Chennai) pay more for transportation. Delhi, Hyderabad, and Kolkata typically have ₹50–200/10g higher prices than Mumbai.',
    },
    {
      q: 'How often is the gold rate updated on RupeePedia?',
      a: 'Gold and silver prices on RupeePedia refresh every 30 minutes from international spot markets. Gold trades 24×5 globally (closed on weekends). MCX gold futures in India trade 9 AM to 11:30 PM IST on weekdays.',
    },
  ];

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

      {/* ── Hero ── */}
      <section className="bg-bg pt-8 md:pt-10 pb-2 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-faint mb-4 flex-wrap font-mono">
            <Link to="/" className="hover:text-acc transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-acc font-semibold">Gold Rate Today</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface p-6 md:p-10 mb-8">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(60% 80% at 85% 15%, var(--acc-glow), transparent 65%)' }} />

            <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-gold/10 text-gold border border-gold/30 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  Live City-wise Indian Bullion Rates (24K / 22K / 18K &amp; Silver)
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-[1.1] mb-4">
                  Today&apos;s <span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Gold &amp; Silver Rates</span> in India
                </h1>
                <p className="text-body text-sm md:text-base leading-relaxed">
                  Real-time gold prices across {CITIES.length} Indian metros with transparent jewelry making-charge breakdowns, a 3% GST calculator, and BIS Hallmark purity verification.
                </p>
              </div>
              <button onClick={() => refetch()}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-acc transition-colors self-start shrink-0">
                <RefreshCw className="w-3.5 h-3.5" />
                {updatedAt ? `Updated ${updatedAt}` : 'Refresh'}
              </button>
            </div>

            {/* Stat chips */}
            {data && (
              <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                {[
                  { label: '24K Gold (999 Pure)',    value: fmt(data.gold.price_24k_per_gram) + '/g', sub: 'Investment grade', tone: 'text-gold' },
                  { label: '22K Gold (916 Hallmark)', value: fmt(data.gold.price_22k_per_gram) + '/g', sub: 'Standard jewelry rate', tone: 'text-ink' },
                  { label: '18K Gold (750)',          value: fmt(Math.round(data.gold.price_24k_per_gram * 18 / 24)) + '/g', sub: 'Studded jewelry', tone: 'text-ink' },
                  { label: 'Silver Rate (1 Kg)',      value: fmt(data.silver.price_per_kg), sub: fmt(data.silver.price_per_gram) + '/g', tone: 'text-cyan' },
                ].map(chip => (
                  <div key={chip.label} className="rounded-xl border border-line-2 bg-bg-2 px-4 py-3.5">
                    <p className="text-[11px] text-faint mb-1.5">{chip.label}</p>
                    <p className={`text-xl font-extrabold tracking-tight ${chip.tone}`}>{chip.value}</p>
                    <p className="text-[11px] text-faint mt-1">{chip.sub}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="bg-bg max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 space-y-5 min-w-0">

        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <select value={city} onChange={e => setCity(e.target.value)}
              className="pl-8 pr-8 py-2 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc border border-line bg-surface text-ink transition-all">
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
          </div>
          <div className="relative">
            <select value={unit} onChange={e => setUnit(e.target.value as Unit)}
              className="px-3 pr-8 py-2 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc border border-line bg-surface text-ink transition-all">
              {(Object.entries(UNIT_LABELS) as [Unit, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
          </div>
          <div className="flex gap-1.5">
            {(['24K', '22K', '18K', '14K'] as Purity[]).map(p => (
              <button key={p} onClick={() => setPurity(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  purity === p
                    ? 'bg-gradient-to-br from-mint to-acc text-white border-transparent shadow-acc-glow'
                    : 'bg-surface text-muted border-line hover:border-acc/40'
                }`}>
                {p} <span className="font-normal opacity-70">{p === '24K' ? '99.9%' : p === '22K' ? '91.6%' : p === '18K' ? '75%' : '58.3%'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main price cards */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-surface-2 animate-pulse" />)}
          </div>
        ) : isError ? (
          <div className="rounded-xl p-6 text-center text-sm bg-coral/10 border border-coral/30 text-coral">
            Failed to fetch live prices. <button onClick={() => refetch()} className="underline font-semibold">Try again</button>
          </div>
        ) : data ? (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Gold card */}
              <div className="rounded-2xl p-6 bg-gradient-to-br from-acc-deep to-surface border border-gold/30 shadow-acc-glow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-gold/15">🥇</div>
                  <div>
                    <div className="font-bold text-sm text-ink">Gold — {purity}</div>
                    <div className="text-[11px] text-faint">{city} · {UNIT_LABELS[unit]}</div>
                  </div>
                </div>
                <div className="text-4xl font-black mb-2 tracking-tight text-gold">
                  {fmt(getGoldPrice(data))}
                </div>
                <div className="text-xs text-faint">
                  Per gram: {fmt(data.gold.price_24k_per_gram)} · Per tola: {fmt(data.gold.price_24k_per_tola)}
                </div>
              </div>

              {/* Silver card */}
              <div className="rounded-2xl p-6 bg-surface border border-line">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-cyan/10">🥈</div>
                  <div>
                    <div className="font-bold text-sm text-ink">Silver — 999 Pure</div>
                    <div className="text-[11px] text-faint">{city} · {UNIT_LABELS[unit]}</div>
                  </div>
                </div>
                <div className="text-4xl font-black mb-2 tracking-tight text-cyan">
                  {fmt(getSilverPrice(data))}
                </div>
                <div className="text-xs text-faint">
                  Per gram: {fmt(data.silver.price_per_gram)} · Per 100g: {fmt(data.silver.price_per_100g)}
                </div>
              </div>
            </div>

            {/* Gold table */}
            <div className="rounded-2xl overflow-hidden bg-surface border border-line">
              <div className="px-5 py-3.5 flex items-center gap-2 border-b border-line bg-surface-2">
                <TrendingUp className="w-4 h-4 text-gold" />
                <span className="font-bold text-sm text-ink">Gold Price — {city} Today</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-2 border-b border-line text-xs font-semibold text-muted">
                      <th className="text-left px-5 py-2.5">Purity</th>
                      <th className="text-right px-4 py-2.5">Per Gram</th>
                      <th className="text-right px-4 py-2.5">Per 10g</th>
                      <th className="text-right px-4 py-2.5">Per Tola</th>
                      <th className="text-right px-5 py-2.5">Per Sovereign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {([
                      { label: '24 Karat (99.9%)', k: 24 },
                      { label: '22 Karat (91.6%)', k: 22 },
                      { label: '18 Karat (75%)',   k: 18 },
                      { label: '14 Karat (58.3%)', k: 14 },
                    ] as const).map(({ label, k }) => {
                      const cityBase = data.cities[city]?.gold_24k_per_10g ?? data.gold.price_24k_per_10g;
                      const per10g = Math.round(cityBase * k / 24);
                      return (
                        <tr key={k} className="hover:bg-surface-2 transition-colors">
                          <td className="px-5 py-3 font-semibold text-ink">{label}</td>
                          <td className="px-4 py-3 text-right ifsc-mono text-body">{fmt(Math.round(per10g / 10))}</td>
                          <td className="px-4 py-3 text-right ifsc-mono font-bold text-ink">{fmt(per10g)}</td>
                          <td className="px-4 py-3 text-right ifsc-mono text-body">{fmt(Math.round(per10g * 1.16638))}</td>
                          <td className="px-5 py-3 text-right ifsc-mono text-body">{fmt(Math.round(per10g * 0.8))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Silver table */}
            <div className="rounded-2xl overflow-hidden bg-surface border border-line">
              <div className="px-5 py-3.5 flex items-center gap-2 border-b border-line bg-surface-2">
                <span className="text-base">🥈</span>
                <span className="font-bold text-sm text-ink">Silver Price — {city} Today</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-line">
                {[
                  { label: 'Per Gram', value: fmt(data.silver.price_per_gram) },
                  { label: 'Per 10 Grams', value: fmt(data.silver.price_per_10g) },
                  { label: 'Per 100 Grams', value: fmt(data.silver.price_per_100g) },
                  { label: 'Per Kg', value: fmt(data.silver.price_per_kg) },
                ].map(({ label, value }) => (
                  <div key={label} className="px-5 py-4">
                    <div className="text-[11px] mb-1 text-faint">{label}</div>
                    <div className="font-bold text-ink">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex gap-2.5 bg-acc-deep border border-acc/20 rounded-xl p-4 text-xs text-body">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-acc" />
              <div>{data.disclaimer} Prices sourced from international spot markets + standard India import duties. For MCX or jeweller prices, check directly with your bank or jeweller.</div>
            </div>
          </>
        ) : null}

        {/* Gold prices across cities */}
        <div className="rounded-2xl overflow-hidden bg-surface border border-line">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 border-b border-line">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <h2 className="text-ink font-bold text-base tracking-tight">Gold Prices Across Major Indian Cities</h2>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-gold/10 text-gold border-gold/25 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Live
            </span>
          </div>

          {/* City tab pills */}
          <div className="flex gap-1.5 overflow-x-auto px-5 py-3 border-b border-line scrollbar-thin">
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                  city === c
                    ? 'bg-gradient-to-br from-mint to-acc text-white border-transparent shadow-acc-glow'
                    : 'bg-bg-2 text-muted border-line hover:border-acc/40'
                }`}>
                {c}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line text-xs font-semibold text-muted">
                  <th className="text-left px-5 py-2.5">City</th>
                  <th className="text-right px-4 py-2.5">24K Gold (10g)</th>
                  <th className="text-right px-4 py-2.5">22K Gold (10g)</th>
                  <th className="text-right px-4 py-2.5">18K Gold (10g)</th>
                  <th className="text-right px-5 py-2.5">Silver (1kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {CITIES.map(name => {
                  const cityData = data?.cities[name];
                  const price24k = cityData?.gold_24k_per_10g ?? data?.gold.price_24k_per_10g;
                  const price22k = cityData?.gold_22k_per_10g ?? data?.gold.price_22k_per_10g;
                  const price18k = price24k ? Math.round(price24k * 18 / 24) : undefined;
                  const active = city === name;
                  return (
                    <tr key={name}
                      onClick={() => setCity(name)}
                      className={`cursor-pointer transition-colors ${active ? 'bg-acc-deep' : 'hover:bg-surface-2'}`}>
                      <td className="px-5 py-3 font-semibold text-ink">{name}</td>
                      <td className="px-4 py-3 text-right ifsc-mono font-bold text-gold">{price24k ? fmt(price24k) : '—'}</td>
                      <td className="px-4 py-3 text-right ifsc-mono text-body">{price22k ? fmt(price22k) : '—'}</td>
                      <td className="px-4 py-3 text-right ifsc-mono text-body">{price18k ? fmt(price18k) : '—'}</td>
                      <td className="px-5 py-3 text-right ifsc-mono text-body">{data ? fmt(data.silver.price_per_kg) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 flex items-center justify-between gap-3 text-[11px] text-faint border-t border-line">
            <span>Rates include city-wise differentials · 24K/22K per IBJA benchmark</span>
            <Link to={`/gold-rate-today/${city.toLowerCase()}`} className="text-acc font-semibold hover:underline shrink-0">
              Full {city} breakdown →
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-surface rounded-2xl border border-line p-5">
          <h2 className="font-bold text-ink text-base mb-1">About Gold &amp; Silver Prices in India</h2>
          <p className="text-xs text-faint mb-2">Frequently asked questions</p>
          <div>
            {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>

      </div>

      {/* ── Sidebar ── */}
      <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
        {data && <JewelryPriceCalculator data={data} city={city} />}

        <div className="bg-surface rounded-2xl border border-line overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center gap-2">
            <Info className="w-4 h-4 text-mint" />
            <h3 className="font-bold text-ink text-sm">BIS Hallmark Purity Standards</h3>
          </div>
          <div className="divide-y divide-line">
            {[
              { k: '24 Karat (999)', p: '99.9%', use: 'Bullion bars, mint coins, sovereign gold bonds' },
              { k: '22 Karat (916)', p: '91.6%', use: 'Standard Indian jewellery, necklaces, bangles' },
              { k: '18 Karat (750)', p: '75.0%', use: 'Diamond-studded jewellery, luxury watches' },
              { k: '14 Karat (585)', p: '58.5%', use: 'Daily-wear minimalist jewellery' },
            ].map(row => (
              <div key={row.k} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{row.k}</p>
                  <p className="text-[11px] text-faint mt-0.5">{row.use}</p>
                </div>
                <span className="text-sm font-bold text-mint shrink-0">{row.p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-acc-deep to-surface rounded-2xl p-5 border border-acc/25">
          <h3 className="font-bold text-ink text-sm mb-1.5">More Financial Tools</h3>
          <p className="text-sm text-muted mb-4">FD rates, IFSC lookup, PIN codes &amp; free calculators.</p>
          <div className="flex flex-col gap-1">
            {[
              { label: 'FD Interest Rates', to: '/fd-rates' },
              { label: 'IFSC Code Finder', to: '/ifsc-finder' },
              { label: 'Gold Hallmark Guide', to: '/gold-hallmark-guide' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="text-sm text-body hover:text-acc px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
                {item.label} →
              </Link>
            ))}
          </div>
        </div>
      </aside>

      </div>
      </div>
    </>
  );
}
