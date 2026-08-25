import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RefreshCw, ArrowLeftRight, ExternalLink,
  ChevronDown, ChevronUp, Info, ChevronRight,
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
    <div className="border-b border-line last:border-0">
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex justify-between items-center py-4 text-left text-sm font-semibold text-ink hover:text-acc transition-colors">
        <span>{q}</span>
        {open
          ? <ChevronUp   className="w-4 h-4 text-acc flex-shrink-0 ml-3" />
          : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0 ml-3" />}
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted leading-relaxed">{a}</div>
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
      className="w-full bg-bg-2 border border-line-2 rounded-xl px-3 py-3 text-sm font-bold text-ink focus:ring-2 focus:ring-acc/20 focus:border-acc outline-none cursor-pointer">
      {available.map(c => {
        const m = CURRENCY_META[c];
        const r = rates[c];
        // No flag emoji — doesn't render in <select> on Windows
        return <option key={c} value={c}>{c} — {m?.name ?? c}{r ? ` (₹${r.toFixed(2)})` : ''}</option>;
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

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-160px] right-[-100px] w-[500px] h-[400px] rounded-full opacity-25 blur-[20px]"
                   style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
            </div>
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 font-mono">
                  <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">Currency Converter</span>
                </nav>

                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-mint/10 text-mint border border-mint/30 mb-5">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Real-time FX Converter (RBI Reference Benchmarks)
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-[1.1] mb-3">
                  Live Foreign <span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Currency Exchange Rates</span> to Indian Rupee (INR)
                </h1>
                <p className="text-body text-sm md:text-base leading-relaxed max-w-2xl">
                  Calculate live conversion rates for {availableForTable.slice(0, 7).join(', ')} with an estimated bank spread and forex-card markup savings.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="bg-bg max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {isError && (
          <div className="px-4 py-3 bg-coral/10 rounded-xl text-coral text-sm text-center">
            Failed to load rates.{' '}
            <button onClick={() => refetch()} className="underline font-semibold">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── Converter widget ── */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-surface rounded-2xl border border-line p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-ink text-base">Instant Currency Converter</h2>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-mint/10 text-mint">Live RBI Spot</span>
              </div>

              <label className="text-xs font-bold text-faint uppercase tracking-widest mb-1.5 block">Select Foreign Currency</label>
              <CurrencySelect value={from} onChange={setFrom} rates={rates} id="from-currency" />

              <div className="flex items-center justify-between mt-4 mb-1.5">
                <label className="text-xs font-bold text-faint uppercase tracking-widest">Amount in {from}</label>
                <button onClick={() => { setFrom(to); setTo(from); }}
                  className="flex items-center gap-1 text-xs font-semibold text-acc hover:underline">
                  <ArrowLeftRight className="w-3 h-3" /> Swap Direction
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body font-bold">{CURRENCY_META[from]?.symbol}</span>
                <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full bg-bg-2 border border-line-2 rounded-xl pl-10 pr-4 py-3 text-xl font-bold text-ink focus:ring-2 focus:ring-acc/20 focus:border-acc outline-none" />
              </div>

              {/* Quick amount chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {QUICK_AMOUNTS.slice(0, 5).map(n => (
                  <button key={n} onClick={() => setAmount(String(n))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${amount === String(n)
                      ? 'bg-acc-deep border-acc/40 text-acc'
                      : 'bg-bg-2 border-line-2 text-muted hover:border-acc/30'}`}>
                    {CURRENCY_META[from]?.symbol}{n.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Result */}
              <div className="mt-5 rounded-xl border border-mint/30 bg-mint/5 px-4 py-4">
                {isLoading ? (
                  <span className="text-faint text-sm">Loading…</span>
                ) : (
                  <>
                    <p className="text-xs text-mint font-semibold">{fmt(parseFloat(amount) || 0, 0)} {from} equals</p>
                    <p className="text-3xl font-extrabold text-mint mt-1 break-all">
                      {CURRENCY_META[to]?.symbol ?? ''}{fmt(result)}
                    </p>
                    {!isNaN(unitRate) && (
                      <p className="text-xs text-faint mt-1.5">
                        1 {from} = {CURRENCY_META[to]?.symbol ?? ''}{fmt(unitRate, 2)} {to} (RBI Reference)
                      </p>
                    )}
                  </>
                )}
              </div>

              {updatedAt && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-faint">Updated {updatedAt}</span>
                  <button onClick={() => refetch()} className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors" title="Refresh rates">
                    <RefreshCw className="w-3.5 h-3.5 text-muted" />
                  </button>
                </div>
              )}
            </div>

            {/* Zero forex markup tip */}
            <div className="rounded-2xl border border-mint/25 bg-mint/5 p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Info className="w-4 h-4 text-mint" />
                <h3 className="font-bold text-ink text-sm">Zero Forex Markup Tip</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Standard credit cards charge ~3.5% + GST forex markup. Zero-forex-markup cards (like IDFC FIRST WOW, Scapia, or Niyo Global) can save you real money on every international spend — compare options on our{' '}
                <Link to="/credit-cards?category=Travel" className="text-mint font-semibold hover:underline">Travel Cards page →</Link>
              </p>
            </div>
          </div>

          {/* ── Rates table ── */}
          <div className="lg:col-span-7">
            <div className="bg-surface rounded-2xl border border-line overflow-hidden">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-bold text-ink text-base">Major Global Currencies vs Indian Rupee (INR)</h2>
                  <p className="text-xs text-faint mt-0.5">RBI reference rate with estimated retail buy/sell spread</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-surface-2 text-faint shrink-0">Updated Daily</span>
              </div>

              {isLoading ? (
                <div className="p-10 text-center">
                  <div className="w-7 h-7 border-2 border-acc border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface-2 text-xs text-muted uppercase tracking-wide">
                        <th className="text-left px-5 py-3 font-semibold">Currency</th>
                        <th className="text-right px-4 py-3 font-semibold">Est. Bank Buy</th>
                        <th className="text-right px-4 py-3 font-semibold">Est. Bank Sell</th>
                        <th className="text-right px-5 py-3 font-semibold">RBI Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {availableForTable.map(code => {
                        const meta = CURRENCY_META[code];
                        const rate = rates[code]; // RBI/mid-market reference, INR per 1 foreign unit
                        const bankBuy  = rate * 0.995;
                        const bankSell = rate * 1.005;
                        const hl = code === from;
                        return (
                          <tr key={code}
                            onClick={() => setFrom(code)}
                            className={`cursor-pointer transition-colors hover:bg-surface-2 ${hl ? 'bg-mint/5' : ''}`}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-bg-2 border border-line flex items-center justify-center text-base shrink-0">{meta?.flag}</span>
                                <div>
                                  <div className="font-bold text-ink">{code}</div>
                                  <div className="text-xs text-faint">{meta?.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-body">₹{fmt(bankBuy)}</td>
                            <td className="px-4 py-3 text-right font-mono text-body">₹{fmt(bankSell)}</td>
                            <td className="px-5 py-3 text-right font-mono font-bold text-mint">₹{fmt(rate)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-5 py-3 border-t border-line text-[11px] text-faint">
                Est. Bank Buy/Sell assumes a typical ±0.5% retail spread around the RBI reference rate — actual quotes vary by bank or transfer provider.
              </div>
            </div>
          </div>
        </div>

        {/* ── Info + affiliate ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface rounded-2xl p-6 border border-line">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-acc" />
              <h3 className="font-bold text-ink text-sm">About These Rates</h3>
            </div>
            <ul className="text-xs text-muted space-y-2 leading-relaxed">
              <li className="flex gap-2"><span className="text-acc font-bold flex-shrink-0">•</span><span>Mid-market rates via open-source currency data — updated daily</span></li>
              <li className="flex gap-2"><span className="text-acc font-bold flex-shrink-0">•</span><span>Banks add 1–4% above mid-market — actual rate varies by provider</span></li>
              <li className="flex gap-2"><span className="text-acc font-bold flex-shrink-0">•</span><span>RBI publishes official USD/INR reference at ~1:30 PM IST daily</span></li>
              <li className="flex gap-2"><span className="text-acc font-bold flex-shrink-0">•</span><span>LRS limit: USD 2,50,000 per year for resident Indians</span></li>
              <li className="flex gap-2"><span className="text-acc font-bold flex-shrink-0">•</span><span>TCS of 20% applies on remittances above ₹7 lakh/year (as of Oct 2023)</span></li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-acc-deep to-surface rounded-2xl p-6 border border-acc/30">
            <h3 className="font-bold text-ink mb-1 text-sm">Sending Money Abroad?</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Banks charge 2–5% above mid-market. Online platforms offer rates closer to what you see here.
            </p>
            <div className="flex flex-col gap-2">
              {[
                { name: 'Wise (TransferWise)', url: 'https://wise.com', desc: 'Best mid-market rates' },
                { name: 'Remitly',             url: 'https://www.remitly.com', desc: 'Fast INR delivery' },
              ].map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer sponsored"
                  className="flex items-center justify-between px-4 py-2.5 bg-surface rounded-xl border border-acc/20 hover:border-acc/40 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-ink">{p.name}</div>
                    <div className="text-[11px] text-faint">{p.desc}</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted flex-shrink-0" />
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
              className="bg-surface rounded-2xl p-5 border border-line hover:border-acc/30 transition-all group">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-ink text-sm group-hover:text-acc transition-colors">{item.title}</div>
              <div className="text-xs text-faint mt-0.5">{item.desc}</div>
            </Link>
          ))}
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
          <div>
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-faint text-center pb-4">
          {data?.disclaimer ?? 'Mid-market rates for reference only. Actual rates vary by provider.'}{' '}
          <Link to="/swift-code-lookup" className="text-acc hover:underline">Need a SWIFT code for your transfer? →</Link>
        </p>
      </div>
    </>
  );
}
