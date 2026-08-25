import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, ChevronDown, ChevronUp, ChevronRight, Clock, ExternalLink,
  Search, ShieldCheck, RefreshCw, PiggyBank,
} from 'lucide-react';
import { apiClient } from '../utils/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Tenure {
  id: number; label: string | null; months: number | null;
  rate: number; seniorRate: number | null;
  minAmount: number | null; effectiveFrom: string; sourceUrl: string | null; notes: string | null;
}
interface BankRates {
  bank: { id: number; name: string; slug: string | null; logoUrl: string | null; shortName: string | null; bankType: string | null };
  tenures: Tenure[];
  bestRate: number;
  lastVerified: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const BANK_TYPES = ['All', 'Public Sector', 'Private Sector', 'Small Finance Bank', 'Foreign Bank', 'Cooperative Bank', 'Regional Rural Bank'];

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function FreshBadge({ lastVerified }: { lastVerified: string }) {
  const days = daysSince(lastVerified);
  const cls  = days <= 7 ? 'bg-mint/10 text-mint' : days <= 30 ? 'bg-gold/10 text-gold' : 'bg-coral/10 text-coral';
  const label = days === 0 ? 'Today' : `${days}d ago`;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
      <Clock className="w-2.5 h-2.5" />{label}
    </span>
  );
}

const FAQS = [
  {
    q: 'What is a Fixed Deposit (FD)?',
    a: 'A Fixed Deposit (FD) is a financial instrument offered by banks where you deposit a lump sum for a fixed period at a predetermined interest rate. The rate is locked at the time of deposit and doesn\'t change even if market rates fluctuate. At maturity, you receive your principal plus the interest earned.',
  },
  {
    q: 'Which bank offers the highest FD interest rate in 2026?',
    a: 'Small Finance Banks (SFBs) like ESAF, Utkarsh, Suryoday, and Jana SFB typically offer the highest FD rates in India — often 8–9.5% per annum. Among large private banks, IDFC FIRST and Yes Bank often offer competitive rates. The highest rates change frequently; always verify with the bank before investing.',
  },
  {
    q: 'Are FD rates fixed or can banks change them?',
    a: 'Once you book an FD, the interest rate is locked for the entire tenure — it won\'t change even if the bank revises its rates later. However, if you prematurely break the FD or reinvest, the new rate at that time will apply. RupeePedia marks each rate\'s "last verified" date to help you know how current the data is.',
  },
  {
    q: 'Do senior citizens get a higher FD rate?',
    a: 'Yes. Most Indian banks offer an additional 0.25% to 0.75% interest rate for senior citizens (age 60 and above) on their Fixed Deposits. Some banks offer up to 1% additional interest for super-seniors (75+). The senior citizen rate is shown in the table above where available.',
  },
  {
    q: 'Is TDS deducted on FD interest?',
    a: 'Yes. TDS (Tax Deducted at Source) of 10% is deducted if your total FD interest income from a bank exceeds ₹40,000 per year (₹50,000 for senior citizens). If your total income is below the taxable limit, you can submit Form 15G (or 15H for seniors) to avoid TDS deduction.',
  },
  {
    q: 'What is the DICGC insurance limit for FD?',
    a: 'The Deposit Insurance and Credit Guarantee Corporation (DICGC) insures bank deposits (including FDs) up to ₹5 lakh per depositor per bank. This covers both principal and interest. If your FD value exceeds ₹5 lakh with one bank, consider spreading across multiple banks for full DICGC coverage.',
  },
  {
    q: 'Can I withdraw my FD before maturity?',
    a: 'Yes, most FDs allow premature withdrawal, but banks charge a penalty — typically 0.5% to 1% less than the applicable rate for the period the FD was held. Some Tax Saving FDs (with 5-year lock-in under 80C) do not allow premature withdrawal. Always check the bank\'s premature withdrawal policy before investing.',
  },
  {
    q: 'What is a Tax Saving FD?',
    a: 'A Tax Saving FD is a special 5-year fixed deposit that qualifies for income tax deduction under Section 80C of the Income Tax Act (up to ₹1.5 lakh per year). It has a mandatory 5-year lock-in period — premature withdrawal is not allowed. The interest earned is fully taxable at your income tax slab rate.',
  },
  {
    q: 'How is FD interest calculated?',
    a: 'For most FDs, interest is compounded quarterly. Formula: A = P × (1 + r/n)^(nt), where P = principal, r = annual interest rate, n = compounding frequency (4 for quarterly), t = tenure in years. For example, ₹1 lakh at 7.5% for 2 years (quarterly compounding) yields approximately ₹16,136 interest, giving a total of ₹1,16,136.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0 sm:border-0 sm:bg-surface sm:rounded-xl sm:border sm:border-line sm:overflow-hidden">
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex items-center justify-between py-4 sm:px-5 text-left hover:text-acc sm:hover:bg-surface-2 transition-colors">
        <span className="font-semibold text-ink text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-acc shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted shrink-0" />}
      </button>
      {open && (
        <div className="pb-4 sm:px-5 text-sm text-muted leading-relaxed sm:border-t sm:border-line sm:pt-3">{a}</div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FDRatesPage() {
  const [bankTypeFilter, setBankTypeFilter] = useState('All');
  const [search,         setSearch]         = useState('');
  const [tenureFilter,   setTenureFilter]   = useState<string>('All');
  const [showSenior,     setShowSenior]     = useState(false);
  const [expanded,       setExpanded]       = useState<Set<number>>(new Set());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['fd-rates'],
    queryFn:  () => apiClient.get('/rates?type=fd').then(r => r.data),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const banks: BankRates[] = data?.banks ?? [];

  // Collect all unique tenure labels
  const tenureLabels = useMemo(() => {
    const labels = new Set<string>();
    banks.forEach(b => b.tenures.forEach(t => t.label && labels.add(t.label)));
    return ['All', ...Array.from(labels)];
  }, [banks]);

  const filtered = useMemo(() => {
    return banks.filter(b => {
      if (bankTypeFilter !== 'All' && b.bank.bankType !== bankTypeFilter) return false;
      if (search && !b.bank.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (tenureFilter !== 'All' && !b.tenures.some(t => t.label === tenureFilter)) return false;
      return true;
    });
  }, [banks, bankTypeFilter, search, tenureFilter]);

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://rupeepedia.in'          },
          { '@type': 'ListItem', position: 2, name: 'FD Rates',    item: 'https://rupeepedia.in/fd-rates' },
        ],
      },
      {
        '@type': 'WebPage',
        name:        'Best FD Interest Rates 2026 India',
        url:         'https://rupeepedia.in/fd-rates',
        description: 'Compare fixed deposit interest rates across all Indian banks. Find the best FD rate for your tenure.',
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

  const bestRate = filtered.length ? filtered[0].bestRate : null;

  return (
    <>
      <Helmet>
        <title>Best FD Interest Rates 2026 — Compare Fixed Deposit Rates India | RupeePedia</title>
        <meta name="description" content={`Compare fixed deposit interest rates across Indian banks in 2026. Best FD rate: ${bestRate ? bestRate + '% p.a.' : 'up to 9.5% p.a.'} Find highest FD rates for 1 year, 2 years, 3 years and 5 years. Senior citizen rates included.`} />
        <meta name="keywords" content="best fd rates 2026, fd interest rates india, highest fd rate india, sbi fd rate, hdfc fd interest rate, fixed deposit rates comparison, senior citizen fd rates, 1 year fd rate india, small finance bank fd rates, fixed deposit calculator india, fd vs savings account, bank fd interest rate today" />
        <link rel="canonical" href="https://rupeepedia.in/fd-rates" />
        <meta property="og:title"       content="Best FD Interest Rates 2026 — Compare All Banks | RupeePedia" />
        <meta property="og:description" content={`Find the best fixed deposit rates across all Indian banks. Best rate: ${bestRate ? bestRate + '%' : 'up to 9.5%'} p.a. Senior citizen rates included.`} />
        <meta property="og:url"         content="https://rupeepedia.in/fd-rates" />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={`Best FD Interest Rates 2026 — Compare All Banks | RupeePedia`} />
        <meta name="twitter:description" content={`Compare fixed deposit rates across all Indian banks. Best rate: ${bestRate ? bestRate + '%' : 'up to 9.5%'} p.a. Senior citizen rates included.`} />
        <meta name="twitter:image"       content="https://rupeepedia.in/logo.png" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                  <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">FD Interest Rates</span>
                </nav>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-acc-deep rounded-2xl flex items-center justify-center flex-shrink-0 text-acc">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink tracking-tight">Best FD <span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Interest Rates</span> 2026</h1>
                    <p className="text-body mt-1 text-sm">Compare fixed deposit rates across all Indian banks</p>
                  </div>
                </div>
                <p className="text-body text-base max-w-2xl mb-8">
                  Manually verified rates updated regularly. Find the highest FD rates for your tenure — including senior citizen rates.
                </p>

                {/* Stats strip */}
                {!isLoading && !isError && (
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    {[
                      { n: String(banks.length),        label: 'Banks Tracked'  },
                      { n: bestRate ? `${bestRate}%` : '—', label: 'Best Rate'   },
                      { n: 'Manual',                     label: 'Data Freshness' },
                    ].map(({ n, label }) => (
                      <div key={label}>
                        <p className="text-2xl font-extrabold text-ink leading-none">{n}</p>
                        <p className="text-[11px] text-faint font-semibold uppercase tracking-wide mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="bg-surface rounded-2xl p-4 border border-line">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search bank…"
                className="w-full pl-8 pr-3 py-2 bg-bg-2 border border-line-2 rounded-lg text-sm text-ink focus:ring-2 focus:ring-acc/20 focus:border-acc outline-none transition-all" />
            </div>

            {/* Bank type */}
            <select value={bankTypeFilter} onChange={e => setBankTypeFilter(e.target.value)}
              className="bg-bg-2 border border-line-2 rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-acc/20 focus:border-acc outline-none transition-all">
              {BANK_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>

            {/* Tenure */}
            <select value={tenureFilter} onChange={e => setTenureFilter(e.target.value)}
              className="bg-bg-2 border border-line-2 rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-acc/20 focus:border-acc outline-none transition-all">
              {tenureLabels.map(t => <option key={t}>{t}</option>)}
            </select>

            {/* Senior citizen toggle */}
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-line rounded-lg hover:border-acc/40 transition-colors">
              <input type="checkbox" checked={showSenior} onChange={e => setShowSenior(e.target.checked)}
                className="w-3.5 h-3.5 accent-acc rounded" />
              <span className="text-sm text-body font-medium whitespace-nowrap">Senior Citizen Rates</span>
            </label>

            <button onClick={() => refetch()} className="p-2 hover:bg-surface-2 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4 text-muted" />
            </button>
          </div>
        </div>

        {/* Important disclaimer */}
        <div className="flex items-start gap-2 px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl text-xs text-gold">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Rates are manually verified. Always confirm with the bank before investing — rates can change without notice.
            Each entry shows a "last verified" date. <Link to="/calculators/fd" className="font-semibold underline">Use our FD Calculator →</Link>
          </span>
        </div>

        {/* ── Top Banks ────────────────────────────────────────────────── */}
        {!isLoading && !isError && banks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink">Best FD Rates Right Now</h2>
              <span className="text-xs text-faint">
                Updated {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-IN') : 'June 2026'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...banks].sort((a, b) => b.bestRate - a.bestRate).slice(0, 4).map((b, idx) => {
                const palette = [
                  { border: 'border-t-mint',   rate: 'text-mint',   badge: 'bg-mint/10 text-mint border-mint/30'     },
                  { border: 'border-t-acc',    rate: 'text-acc',    badge: 'bg-acc-deep text-acc border-acc/30'      },
                  { border: 'border-t-cyan',   rate: 'text-cyan',   badge: 'bg-cyan/10 text-cyan border-cyan/30'     },
                  { border: 'border-t-violet', rate: 'text-violet', badge: 'bg-violet-500/10 text-violet border-violet/30' },
                ];
                const medal = ['🏆 Best Rate', '⭐ 2nd Best', '💎 Top Rated', '🔥 High Yield'];
                const c = palette[idx];
                return (
                  <div key={b.bank.id} className={`bg-surface rounded-2xl border border-line border-t-4 ${c.border} p-5 flex flex-col gap-3 hover:border-acc/30 transition-colors`}>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${c.badge}`}>{medal[idx]}</span>
                      <p className="text-[11px] text-faint mt-2 font-semibold uppercase tracking-wide">{b.bank.bankType ?? 'Bank'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {b.bank.logoUrl && (
                          <img src={b.bank.logoUrl} alt={b.bank.name} className="w-5 h-5 object-contain rounded flex-shrink-0" />
                        )}
                        <p className="font-bold text-ink text-sm leading-snug">{b.bank.name}</p>
                      </div>
                    </div>
                    <div>
                      <div className={`text-2xl font-extrabold ${c.rate}`}>{b.bestRate}% p.a.</div>
                      <div className="text-[11px] text-faint">{b.tenures.length} tenure{b.tenures.length !== 1 ? 's' : ''} available</div>
                    </div>
                    <button
                      onClick={() => toggleExpand(b.bank.id)}
                      className={`text-xs font-semibold flex items-center gap-1 ${c.rate} hover:underline mt-auto`}>
                      View all tenures <ChevronDown className="w-3 h-3 -rotate-90" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main table ───────────────────────────────────────────────── */}
        {isLoading && (
          <div className="bg-surface rounded-2xl p-12 text-center border border-line">
            <div className="w-8 h-8 border-2 border-acc border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-faint text-sm">Loading rates…</p>
          </div>
        )}

        {isError && (
          <div className="bg-surface rounded-2xl p-10 text-center border border-line">
            <p className="text-muted text-sm">Failed to load rates.{' '}
              <button onClick={() => refetch()} className="text-acc underline font-semibold">Retry</button>
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="bg-surface rounded-2xl p-10 text-center border border-line">
            <p className="text-muted text-sm">No rates found. {banks.length === 0 ? 'Rates are being added — check back soon.' : 'Try clearing filters.'}</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((b, idx) => {
              const isExpanded = expanded.has(b.bank.id);
              const visibleTenures = tenureFilter === 'All' ? b.tenures : b.tenures.filter(t => t.label === tenureFilter);
              const displayRate = showSenior ? (visibleTenures[0]?.seniorRate ?? visibleTenures[0]?.rate) : visibleTenures[0]?.rate;
              return (
                <div key={b.bank.id} className={`bg-surface rounded-2xl border transition-all ${isExpanded ? 'border-acc/40' : 'border-line hover:border-line-2'}`}>
                  {/* Bank header row */}
                  <button
                    onClick={() => toggleExpand(b.bank.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  >
                    {/* Rank */}
                    <span className="w-7 h-7 rounded-full bg-acc-deep text-acc font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>

                    {/* Logo + name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {b.bank.logoUrl
                        ? <img src={b.bank.logoUrl} alt={b.bank.name} className="w-9 h-9 object-contain rounded-lg border border-line flex-shrink-0" />
                        : <div className="w-9 h-9 bg-acc-deep rounded-lg flex items-center justify-center text-acc font-bold flex-shrink-0">{b.bank.name.charAt(0)}</div>}
                      <div className="min-w-0">
                        <div className="font-semibold text-ink truncate">{b.bank.name}</div>
                        <div className="text-xs text-faint flex items-center gap-2 flex-wrap">
                          <span>{b.bank.bankType ?? 'Bank'}</span>
                          <FreshBadge lastVerified={b.lastVerified} />
                        </div>
                      </div>
                    </div>

                    {/* Best rate */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-extrabold text-mint">
                        {displayRate != null ? `${displayRate}%` : `${b.bestRate}%`}
                      </div>
                      <div className="text-xs text-faint">
                        {showSenior ? 'Senior rate' : 'Best rate'} p.a.
                      </div>
                    </div>

                    {/* Tenure count */}
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-faint">{b.tenures.length} tenure{b.tenures.length !== 1 ? 's' : ''}</span>
                      {isExpanded
                        ? <ChevronUp   className="w-4 h-4 text-muted" />
                        : <ChevronDown className="w-4 h-4 text-muted" />}
                    </div>
                  </button>

                  {/* Expanded tenure grid */}
                  {isExpanded && (
                    <div className="border-t border-line">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-surface-2 text-xs text-muted uppercase tracking-wide">
                              <th className="text-left px-5 py-2.5 font-semibold">Tenure</th>
                              <th className="text-right px-5 py-2.5 font-semibold">Rate</th>
                              {b.tenures.some(t => t.seniorRate) && (
                                <th className="text-right px-5 py-2.5 font-semibold">Senior Rate</th>
                              )}
                              <th className="text-right px-5 py-2.5 font-semibold hidden sm:table-cell">Min Amount</th>
                              <th className="text-left px-5 py-2.5 font-semibold">Effective</th>
                              <th className="px-5 py-2.5" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line">
                            {visibleTenures.map(t => (
                              <tr key={t.id} className="hover:bg-surface-2 transition-colors">
                                <td className="px-5 py-3 font-medium text-ink">{t.label ?? '—'}</td>
                                <td className="px-5 py-3 text-right font-bold text-mint font-mono">{t.rate}%</td>
                                {b.tenures.some(bt => bt.seniorRate) && (
                                  <td className="px-5 py-3 text-right text-acc font-semibold font-mono">
                                    {t.seniorRate != null ? `${t.seniorRate}%` : '—'}
                                  </td>
                                )}
                                <td className="px-5 py-3 text-right text-muted hidden sm:table-cell text-xs">
                                  {t.minAmount != null ? `₹${(t.minAmount / 1000).toFixed(0)}k+` : 'Any'}
                                </td>
                                <td className="px-5 py-3 text-xs text-faint">
                                  w.e.f. {new Date(t.effectiveFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                </td>
                                <td className="px-5 py-3 text-right">
                                  {t.sourceUrl && (
                                    <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-0.5 text-xs text-acc hover:underline">
                                      Verify <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {b.bank.slug && (
                        <div className="px-5 py-3 border-t border-line flex justify-end">
                          <Link to={`/bank/${b.bank.slug}`}
                            className="text-xs font-semibold text-acc hover:underline">
                            View all {b.bank.name} branches →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Cross-link CTAs ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-4 bg-surface rounded-2xl border border-line px-5 py-4">
            <div className="w-11 h-11 bg-acc-deep rounded-xl flex items-center justify-center flex-shrink-0 text-acc">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-ink text-sm">Need instant access?</p>
              <p className="text-xs text-faint mt-0.5">Savings accounts up to 9% p.a. — no lock-in, withdraw anytime.</p>
            </div>
            <Link to="/savings-rates"
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-br from-mint to-acc text-white font-bold rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all whitespace-nowrap text-xs flex-shrink-0">
              Compare <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex items-center gap-4 bg-surface rounded-2xl border border-line px-5 py-4">
            <div className="w-11 h-11 bg-acc-deep rounded-xl flex items-center justify-center flex-shrink-0 text-acc">
              <span className="text-xl">🧮</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-ink text-sm">Calculate FD maturity</p>
              <p className="text-xs text-faint mt-0.5">Enter principal, rate & tenure — see exact returns with compounding.</p>
            </div>
            <Link to="/calculators/fd"
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-br from-mint to-acc text-white font-bold rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all whitespace-nowrap text-xs flex-shrink-0">
              Open <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Compare FDs ─────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-3">Compare FDs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { to: '/compare/fd/hdfc-vs-icici',              label: 'HDFC FD vs ICICI FD',              desc: 'Side-by-side rate comparison across all tenures', tag: 'Data-driven' },
              { to: '/compare/fd/sbi-vs-post-office-mis',     label: 'SBI FD vs Post Office MIS',        desc: 'Fixed deposit vs Monthly Income Scheme',          tag: 'Govt scheme' },
              { to: '/compare/fd/sbi-vs-scss',                label: 'SBI FD vs SCSS',                   desc: 'FD vs Senior Citizens Savings Scheme',            tag: 'Senior' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="bg-surface rounded-xl p-4 border border-line hover:border-acc/40 transition-all group flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-acc-deep text-acc rounded-full border border-acc/30">{item.tag}</span>
                  <ChevronRight className="w-4 h-4 text-faint group-hover:text-acc transition-colors" />
                </div>
                <div className="font-semibold text-ink text-sm group-hover:text-acc transition-colors">{item.label}</div>
                <div className="text-[11px] text-faint leading-tight">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Related tools ──────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-3">Related Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { to: '/calculators/fd',     icon: '🧮', title: 'FD Calculator',         desc: 'Maturity amount with quarterly compounding'            },
              { to: '/savings-rates',      icon: '🏦', title: 'Savings Rates',          desc: 'Best savings account rates — up to 9% p.a.'           },
              { to: '/currency-converter', icon: '💱', title: 'Currency Converter',    desc: 'Convert FD returns to USD, EUR, GBP, AED'             },
              { to: '/calculators/rd',     icon: '🔄', title: 'RD Calculator',          desc: 'Recurring deposit maturity estimator'                  },
              { to: '/ifsc-finder',        icon: '🏦', title: 'IFSC Code Finder',       desc: 'Find any branch IFSC, MICR, address'                  },
              { to: '/swift-code-lookup',  icon: '🌐', title: 'SWIFT Code Lookup',     desc: 'International bank transfer codes'                     },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="bg-surface rounded-xl p-4 border border-line hover:border-acc/30 transition-all group flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <div className="font-semibold text-body text-xs group-hover:text-acc transition-colors">{item.title}</div>
                  <div className="text-[11px] text-faint mt-0.5 leading-tight">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>

        <p className="text-xs text-faint text-center pb-4">
          Rates manually curated and verified. Always confirm with the bank before investing.{' '}
          Data last updated: {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-IN') : '—'}.{' '}
          <Link to="/savings-rates" className="text-acc hover:underline">Need liquid savings? Compare savings rates →</Link>
        </p>
      </div>
    </>
  );
}
