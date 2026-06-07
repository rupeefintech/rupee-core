import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  RefreshCw, ArrowLeftRight, TrendingUp, ExternalLink,
  ChevronDown, ChevronUp, Info, Globe,
} from 'lucide-react';
import { api } from '../utils/api';

// ── Currency metadata ─────────────────────────────────────────────────────────
const CURRENCY_META: Record<string, { name: string; flag: string; symbol: string; popular?: boolean }> = {
  USD: { name: 'US Dollar',          flag: '🇺🇸', symbol: '$',    popular: true },
  EUR: { name: 'Euro',               flag: '🇪🇺', symbol: '€',    popular: true },
  GBP: { name: 'British Pound',      flag: '🇬🇧', symbol: '£',    popular: true },
  AED: { name: 'UAE Dirham',         flag: '🇦🇪', symbol: 'د.إ', popular: true },
  AUD: { name: 'Australian Dollar',  flag: '🇦🇺', symbol: 'A$'               },
  CAD: { name: 'Canadian Dollar',    flag: '🇨🇦', symbol: 'C$'               },
  SGD: { name: 'Singapore Dollar',   flag: '🇸🇬', symbol: 'S$',  popular: true },
  JPY: { name: 'Japanese Yen',       flag: '🇯🇵', symbol: '¥'               },
  CHF: { name: 'Swiss Franc',        flag: '🇨🇭', symbol: 'Fr'               },
  HKD: { name: 'Hong Kong Dollar',   flag: '🇭🇰', symbol: 'HK$'              },
  SAR: { name: 'Saudi Riyal',        flag: '🇸🇦', symbol: '﷼',  popular: true },
  CNY: { name: 'Chinese Yuan',       flag: '🇨🇳', symbol: '¥'               },
  QAR: { name: 'Qatari Riyal',       flag: '🇶🇦', symbol: 'QR'               },
  MYR: { name: 'Malaysian Ringgit',  flag: '🇲🇾', symbol: 'RM'               },
  THB: { name: 'Thai Baht',          flag: '🇹🇭', symbol: '฿'               },
  INR: { name: 'Indian Rupee',       flag: '🇮🇳', symbol: '₹'               },
};

const ORDERED = ['USD','EUR','GBP','AED','AUD','CAD','SGD','JPY','CHF','HKD','SAR','CNY','QAR','MYR','THB'];

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000, 50000];

const FAQS = [
  {
    q: 'What is the mid-market exchange rate?',
    a: 'The mid-market rate (also called the interbank rate) is the midpoint between the buy and sell prices for a currency on the global forex market. It is the fairest benchmark for currency conversion and is the rate used by RupeePedia. Banks and transfer services add their own margin (typically 1–4%) on top of this rate.',
  },
  {
    q: 'Why is my bank\'s rate different from what I see here?',
    a: 'Banks and money transfer operators add a spread (profit margin) on top of the mid-market rate. This markup typically ranges from 1% (online platforms like Wise) to 4–5% (traditional bank counters). The rate shown here is the mid-market benchmark — the actual rate you get will depend on your bank or transfer provider.',
  },
  {
    q: 'How often are these exchange rates updated?',
    a: 'Rates are sourced from open financial data and updated once daily (each day at midnight UTC). Forex markets are open 24 hours, 5 days a week (Monday to Friday). Weekend rates reflect the last Friday closing price. For real-time precision before large transfers, confirm with your bank or a transfer provider.',
  },
  {
    q: 'What is the RBI reference rate for USD/INR?',
    a: 'The Reserve Bank of India (RBI) publishes an official USD/INR reference rate every business day at approximately 1:30 PM IST. This rate is derived from market transactions and is used as a regulatory benchmark — not for retail transactions. RupeePedia shows live market rates which are updated more frequently.',
  },
  {
    q: 'What is the LRS limit for international transfers from India?',
    a: 'Under RBI\'s Liberalised Remittance Scheme (LRS), resident individuals can remit up to USD 2,50,000 per financial year for permitted current and capital account transactions without prior RBI approval. This covers travel, education, medical expenses, investments, and gifts. Amounts above this require special RBI approval.',
  },
  {
    q: 'Is TCS applicable on international money transfers?',
    a: 'Yes. As per Indian tax rules effective October 2023, Tax Collected at Source (TCS) of 20% applies on remittances above ₹7 lakh per financial year under LRS (except for education and medical purposes where the rate is lower). This TCS can be claimed as a credit against your income tax liability when filing returns.',
  },
  {
    q: 'Which is cheaper — bank wire transfer or online platforms?',
    a: 'Online platforms like Wise, Remitly, and Niyo typically offer rates closer to the mid-market rate with lower fees compared to traditional bank wire transfers. Banks usually charge a flat fee (₹500–2,000) plus a forex markup of 2–5%. For large transfers, the difference can be significant — always compare before sending.',
  },
  {
    q: 'What currencies can I convert to Indian Rupee?',
    a: 'RupeePedia supports conversion between INR and 15 major currencies: USD (US Dollar), EUR (Euro), GBP (British Pound), AED (UAE Dirham), AUD (Australian Dollar), CAD (Canadian Dollar), SGD (Singapore Dollar), JPY (Japanese Yen), CHF (Swiss Franc), HKD (Hong Kong Dollar), SAR (Saudi Riyal), CNY (Chinese Yuan), QAR (Qatari Riyal), MYR (Malaysian Ringgit), and THB (Thai Baht).',
  },
  {
    q: 'Do I need a SWIFT code to send money internationally?',
    a: 'Yes. For international wire transfers, you need the recipient bank\'s SWIFT/BIC code along with the account number and IBAN (where applicable). Use our SWIFT Code Lookup tool to find any Indian bank\'s SWIFT code instantly.',
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex justify-between items-center px-5 py-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
        <span>{q}</span>
        {open
          ? <ChevronUp   className="w-4 h-4 text-brand-500 flex-shrink-0 ml-3" />
          : <ChevronDown className="w-4 h-4 text-gray-400    flex-shrink-0 ml-3" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-50">{a}</div>
      )}
    </div>
  );
}

function CurrencySelect({ value, onChange, rates, id }: {
  value: string; onChange: (v: string) => void; rates: Record<string, number>; id?: string;
}) {
  const available = ['INR', ...ORDERED.filter(c => rates[c])];
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer">
      {available.map(c => {
        const m = CURRENCY_META[c];
        // No flag emoji — doesn't render in <select> on Windows
        return <option key={c} value={c}>{c} — {m?.name ?? c}</option>;
      })}
    </select>
  );
}

function fmt(n: number, decimals = 2) {
  if (isNaN(n) || !isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('1');
  const [from,   setFrom]   = useState('USD');
  const [to,     setTo]     = useState('INR');

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn:  () => api.getExchangeRates(),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const rates = data?.rates ?? {};

  function toInr(currency: string, amt: number) {
    if (currency === 'INR') return amt;
    const r = rates[currency];
    return r ? amt * r : NaN;
  }
  function fromInr(currency: string, amtInr: number) {
    if (currency === 'INR') return amtInr;
    const r = rates[currency];
    return r ? amtInr / r : NaN;
  }

  const result = useMemo(() => {
    const n = parseFloat(amount);
    if (isNaN(n) || n < 0) return NaN;
    return fromInr(to, toInr(from, n));
  }, [amount, from, to, rates]);

  const unitRate = useMemo(() => fromInr(to, toInr(from, 1)), [from, to, rates]);

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  const availableForTable = ORDERED.filter(c => rates[c]);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',               item: 'https://rupeepedia.in'                    },
          { '@type': 'ListItem', position: 2, name: 'Currency Converter',  item: 'https://rupeepedia.in/currency-converter' },
        ],
      },
      {
        '@type': 'WebPage',
        name:        'Currency Converter — INR Exchange Rates',
        url:         'https://rupeepedia.in/currency-converter',
        description: 'Convert Indian Rupee to major world currencies with live mid-market exchange rates.',
        provider:    { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Currency Converter — INR to USD, EUR, GBP, AED Live Rates | RupeePedia</title>
        <meta name="description" content="Convert Indian Rupee (INR) to USD, EUR, GBP, AED, SGD, SAR and 15+ currencies. Free currency converter with daily mid-market rates. No hidden markup." />
        <meta name="keywords" content="currency converter india, inr to usd today, dollar to rupee, usd to inr, euro to inr, pound to rupee, aed to inr, sgd to inr, sar to inr, rupee exchange rate today, forex calculator india" />
        <link rel="canonical" href="https://rupeepedia.in/currency-converter" />
        <meta property="og:title"       content="Currency Converter — INR to USD, EUR, GBP, AED Live Rates" />
        <meta property="og:description" content="Convert INR to 15+ major currencies with live mid-market rates. Updated every 15 minutes." />
        <meta property="og:url"         content="https://rupeepedia.in/currency-converter" />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card"       content="summary" />
        <meta name="twitter:title"      content="Currency Converter India — Live INR Exchange Rates" />
        <meta name="twitter:description" content="Free INR currency converter. Live rates for USD, EUR, GBP, AED, SGD, SAR and 10+ more currencies." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-12">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-brand-200 text-xs mb-5">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-white font-medium">Currency Converter</span>
            </nav>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">Currency Converter</h1>
                <p className="text-brand-200 mt-1 text-sm">Daily mid-market rates — free, no hidden markup</p>
              </div>
            </div>
            <p className="text-brand-100 text-base mb-8 max-w-2xl">
              Convert Indian Rupee to USD, EUR, GBP, AED, SGD and 10+ more currencies at the real mid-market rate.
              Free, no API key, daily updated rates — no hidden markup.
            </p>

            {/* ── Converter widget ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {isError && (
                <div className="mb-4 px-4 py-3 bg-red-50 rounded-xl text-red-600 text-sm text-center">
                  Failed to load rates.{' '}
                  <button onClick={() => refetch()} className="underline font-semibold">Retry</button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {/* From — amount + currency stacked */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Amount</label>
                    <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">From Currency</label>
                    <CurrencySelect value={from} onChange={setFrom} rates={rates} id="from-currency" />
                  </div>
                </div>

                {/* Swap button centred */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-100" />
                  <button onClick={() => { setFrom(to); setTo(from); }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-sm font-semibold rounded-xl transition-colors border border-brand-100"
                    title="Swap currencies">
                    <ArrowLeftRight className="w-4 h-4" /> Swap
                  </button>
                  <div className="flex-1 border-t border-gray-100" />
                </div>

                {/* To — result + currency stacked */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Converted To</label>
                    <div className="w-full border-2 border-brand-200 bg-brand-50 rounded-xl px-4 py-3 min-h-[52px] flex items-center">
                      {isLoading
                        ? <span className="text-gray-400 text-sm font-normal">Loading…</span>
                        : <span className="text-2xl font-extrabold text-brand-700 break-all">
                            {CURRENCY_META[to]?.symbol ?? ''} {fmt(result)}
                          </span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">To Currency</label>
                    <CurrencySelect value={to} onChange={setTo} rates={rates} id="to-currency" />
                  </div>
                </div>
              </div>

              {/* Rate line */}
              {!isLoading && !isNaN(unitRate) && (
                <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    <span className="font-bold text-gray-800">1 {from}</span>
                    {' = '}
                    <span className="font-bold text-brand-600">
                      {CURRENCY_META[to]?.symbol ?? ''} {fmt(unitRate, 4)}
                    </span>
                    {' '}<span className="text-gray-400">{to}</span>
                    <span className="text-xs text-gray-400 ml-2">(mid-market rate)</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {updatedAt && <span className="text-xs text-gray-400">Updated {updatedAt}</span>}
                    <button onClick={() => refetch()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh rates">
                      <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* Quick amount chips */}
              {!isNaN(unitRate) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-400 self-center">Quick:</span>
                  {QUICK_AMOUNTS.slice(0, 5).map(n => (
                    <button key={n} onClick={() => setAmount(String(n))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${amount === String(n)
                        ? 'bg-brand-100 border-brand-300 text-brand-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-brand-300'}`}>
                      {n} {from}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          {/* ── Quick reference table ──────────────────────────────────────── */}
          {!isLoading && rates['USD'] && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 text-sm">
                  Quick Reference — 1 {from} = ? {to === from ? 'INR' : to}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Common amounts for quick reference</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-semibold">Amount ({from})</th>
                      <th className="text-right px-5 py-3 font-semibold">= {to === from ? 'INR' : to}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {QUICK_AMOUNTS.map(n => {
                      const val = fromInr(to === from ? 'INR' : to, toInr(from, n));
                      return (
                        <tr key={n} className="hover:bg-gray-50">
                          <td className="px-5 py-2.5 font-medium text-gray-700">
                            {CURRENCY_META[from]?.symbol}{n.toLocaleString('en-IN')} {from}
                          </td>
                          <td className="px-5 py-2.5 text-right font-bold text-brand-600">
                            {CURRENCY_META[to === from ? 'INR' : to]?.symbol}{fmt(val)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── All rates table ────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h2 className="font-bold text-gray-800">INR Exchange Rates Today</h2>
              </div>
              {updatedAt && <span className="text-xs text-gray-400">Updated {updatedAt}</span>}
            </div>

            {isLoading ? (
              <div className="p-10 text-center">
                <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-semibold">Currency</th>
                      <th className="text-right px-5 py-3 font-semibold">1 Unit → ₹ INR</th>
                      <th className="text-right px-5 py-3 font-semibold">₹1 INR →</th>
                      <th className="text-right px-5 py-3 font-semibold hidden md:table-cell">₹1,000 INR →</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {availableForTable.map(code => {
                      const meta    = CURRENCY_META[code];
                      const rate    = rates[code];    // INR per 1 foreign unit
                      const inverse = 1 / rate;
                      const hl      = code === from || code === to;
                      return (
                        <tr key={code}
                          onClick={() => { setFrom(code); setTo('INR'); setAmount('1'); }}
                          className={`cursor-pointer transition-colors hover:bg-brand-50 ${hl ? 'bg-brand-50' : ''}`}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{meta?.flag}</span>
                              <div>
                                <div className="font-bold text-gray-800">{code}</div>
                                <div className="text-xs text-gray-400">{meta?.name}</div>
                              </div>
                              {meta?.popular && (
                                <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-brand-100 text-brand-600 font-bold rounded-full">Popular</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-gray-900">₹ {fmt(rate)}</td>
                          <td className="px-5 py-3 text-right text-gray-600">{meta?.symbol}{fmt(inverse, 5)}</td>
                          <td className="px-5 py-3 text-right text-gray-500 hidden md:table-cell">{meta?.symbol}{fmt(1000 * inverse, 2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Info + affiliate ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-gray-800 text-sm">About These Rates</h3>
              </div>
              <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
                <li className="flex gap-2"><span className="text-brand-500 font-bold flex-shrink-0">•</span><span>Mid-market rates via open-source currency data — updated daily</span></li>
                <li className="flex gap-2"><span className="text-brand-500 font-bold flex-shrink-0">•</span><span>Banks add 1–4% above mid-market — actual rate varies by provider</span></li>
                <li className="flex gap-2"><span className="text-brand-500 font-bold flex-shrink-0">•</span><span>RBI publishes official USD/INR reference at ~1:30 PM IST daily</span></li>
                <li className="flex gap-2"><span className="text-brand-500 font-bold flex-shrink-0">•</span><span>LRS limit: USD 2,50,000 per year for resident Indians</span></li>
                <li className="flex gap-2"><span className="text-brand-500 font-bold flex-shrink-0">•</span><span>TCS of 20% applies on remittances above ₹7 lakh/year (as of Oct 2023)</span></li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl p-6 border border-brand-100">
              <h3 className="font-bold text-gray-800 mb-1 text-sm">Sending Money Abroad?</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Banks charge 2–5% above mid-market. Online platforms offer rates closer to what you see here.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'Wise (TransferWise)', url: 'https://wise.com', desc: 'Best mid-market rates' },
                  { name: 'Remitly',             url: 'https://www.remitly.com', desc: 'Fast INR delivery' },
                ].map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer sponsored"
                    className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-brand-100 hover:border-brand-300 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-gray-800">{p.name}</div>
                      <div className="text-[11px] text-gray-400">{p.desc}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Related tools ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/swift-code-lookup', icon: '🌐', title: 'SWIFT Code Lookup', desc: 'Find SWIFT/BIC for international transfers' },
              { to: '/gold-rate-today',   icon: '🥇', title: 'Gold Rate Today',   desc: 'Live 24K/22K gold price in India'         },
              { to: '/calculators/emi',   icon: '📊', title: 'EMI Calculator',    desc: 'Calculate loan EMI instantly'             },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-gray-800 text-sm group-hover:text-brand-600 transition-colors">{item.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </Link>
            ))}
          </div>

          {/* ── FAQ ─────────────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center pb-4">
            {data?.disclaimer ?? 'Mid-market rates for reference only. Actual rates vary by provider.'}{' '}
            <Link to="/swift-code-lookup" className="text-brand-600 hover:underline">Need a SWIFT code for your transfer? →</Link>
          </p>
        </div>
      </div>
    </>
  );
}
