import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, TrendingUp, ExternalLink } from 'lucide-react';
import { apiClient } from '../utils/api';

interface Tenure {
  id: number; label: string | null; months: number | null;
  rate: number; seniorRate: number | null;
  minAmount: number | null; effectiveFrom: string; sourceUrl: string | null;
}
interface BankRates {
  bank: { id: number; name: string; slug: string | null; logoUrl: string | null; bankType: string | null };
  tenures: Tenure[];
  bestRate: number;
  lastVerified: string;
}

const FAQS = [
  {
    q: 'Which bank offers higher FD rates — HDFC Bank or ICICI Bank?',
    a: 'Rates are similar across most tenures as both are large private-sector banks regulated by the same RBI norms. For short tenures (7 days–1 year), ICICI Bank has occasionally offered marginally higher rates. For longer tenures (3–5 years), HDFC Bank tends to edge slightly ahead. Check the live table above for the current difference.',
  },
  {
    q: 'Is HDFC FD or ICICI FD safer?',
    a: 'Both are among India\'s largest private-sector banks with strong capital adequacy ratios. Both are covered under DICGC insurance up to ₹5 lakh per depositor. Neither is meaningfully safer than the other for amounts within the ₹5 lakh limit.',
  },
  {
    q: 'Which bank has a higher senior citizen FD rate?',
    a: 'Both HDFC Bank and ICICI Bank offer a 0.50% additional rate for senior citizens (60+) on most tenures. For super-senior citizens (75+), HDFC Bank offers an additional 0.75% and ICICI Bank offers 0.50% — check the senior rates column above.',
  },
  {
    q: 'Can I break an HDFC or ICICI FD before maturity?',
    a: 'Yes. Both banks allow premature withdrawal. A penalty of 1% below the applicable rate is typically charged. Tax-Saving FDs (5-year lock-in) cannot be broken prematurely at either bank.',
  },
  {
    q: 'Which bank is better for NRE/NRO fixed deposits?',
    a: 'Both HDFC Bank and ICICI Bank offer NRE and NRO FDs with similar rates. ICICI Bank has a slightly larger NRI banking presence and digital account-opening options. HDFC Bank offers marginally better rates on certain NRE tenures. Compare both before booking.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-4 flex items-start justify-between gap-3 group"
      >
        <span className="text-sm font-semibold text-ink leading-snug group-hover:text-acc transition-colors">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted leading-relaxed pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TenureTable({ bank }: { bank: BankRates; otherBestRate: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2 border-b border-line text-xs font-semibold text-muted">
            <th className="text-left px-4 py-2.5">Tenure</th>
            <th className="text-right px-4 py-2.5">Rate</th>
            <th className="text-right px-4 py-2.5">Senior Rate</th>
            <th className="text-left px-4 py-2.5 hidden sm:table-cell">Effective</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {bank.tenures.map(t => (
            <tr key={t.id} className="hover:bg-surface-2 transition-colors">
              <td className="px-4 py-3 font-medium text-ink">{t.label ?? '—'}</td>
              <td className="px-4 py-3 text-right font-bold text-mint">{t.rate}%</td>
              <td className="px-4 py-3 text-right text-acc font-semibold">
                {t.seniorRate != null ? `${t.seniorRate}%` : '—'}
              </td>
              <td className="px-4 py-3 text-xs text-faint hidden sm:table-cell">
                {new Date(t.effectiveFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
              </td>
              <td className="px-4 py-3 text-right">
                {t.sourceUrl && (
                  <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-xs text-acc hover:text-ink transition-colors">
                    Verify <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FDCompareHDFCvsICICI() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fd-rates'],
    queryFn:  () => apiClient.get('/rates?type=fd').then(r => r.data),
    staleTime: 30 * 60 * 1000,
  });

  const banks: BankRates[] = data?.banks ?? [];

  const hdfc = useMemo(() => banks.find(b => b.bank.name.toLowerCase().includes('hdfc bank')), [banks]);
  const icici = useMemo(() => banks.find(b => b.bank.name.toLowerCase().includes('icici bank')), [banks]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://rupeepedia.in' },
          { '@type': 'ListItem', position: 2, name: 'FD Rates', item: 'https://rupeepedia.in/fd-rates' },
          { '@type': 'ListItem', position: 3, name: 'HDFC FD vs ICICI FD', item: 'https://rupeepedia.in/compare/fd/hdfc-vs-icici' },
        ],
      },
      {
        '@type': 'WebPage',
        name: 'HDFC FD vs ICICI FD Interest Rates 2026 — Which is Better?',
        url:  'https://rupeepedia.in/compare/fd/hdfc-vs-icici',
        description: 'Compare HDFC Bank and ICICI Bank fixed deposit interest rates across all tenures in 2026. See which bank offers higher FD rates for 1 year, 2 years, and 5 years.',
        provider: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
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
        <title>HDFC FD vs ICICI FD Interest Rates 2026 — Which Bank is Better? | RupeePedia</title>
        <meta name="description" content="Compare HDFC Bank and ICICI Bank fixed deposit interest rates side by side. See which bank offers higher FD rates across all tenures — 7 days to 10 years. Senior citizen rates included." />
        <meta name="keywords" content="hdfc fd vs icici fd, hdfc bank fd rate, icici bank fd rate, hdfc vs icici fixed deposit, hdfc fd interest rate 2026, icici fd interest rate 2026, which bank better fd hdfc icici" />
        <link rel="canonical" href="https://rupeepedia.in/compare/fd/hdfc-vs-icici" />
        <meta property="og:title"       content="HDFC FD vs ICICI FD — Rate Comparison 2026 | RupeePedia" />
        <meta property="og:description" content="Side-by-side HDFC Bank vs ICICI Bank FD rate comparison across all tenures in 2026." />
        <meta property="og:url"         content="https://rupeepedia.in/compare/fd/hdfc-vs-icici" />
        <meta property="og:type"        content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                  <Link to="/"          className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to="/fd-rates"  className="hover:text-acc transition-colors">FD Rates</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">HDFC vs ICICI</span>
                </nav>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-acc-deep rounded-2xl flex items-center justify-center flex-shrink-0 text-acc">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink tracking-tight">HDFC FD vs ICICI FD</h1>
                    <p className="text-muted mt-1 text-sm">Fixed deposit rate comparison — all tenures, 2026</p>
                  </div>
                </div>
                <p className="text-body text-base max-w-2xl">
                  Live rates from both banks. See where each bank leads across short, medium, and long tenures — including senior citizen rates.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Quick verdict */}
        {hdfc && icici && (
          <div className="bg-surface rounded-2xl border border-line p-6">
            <h2 className="text-base font-bold text-ink mb-4">Quick Verdict</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-mint/10 rounded-xl p-4 text-center border border-mint/20">
                <div className="text-xs text-mint font-semibold uppercase tracking-wide mb-1">HDFC Best Rate</div>
                <div className="text-3xl font-extrabold text-mint">{hdfc.bestRate}%</div>
                <div className="text-xs text-faint mt-1">p.a.</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-faint mb-1">vs</div>
                  <div className="text-xs text-muted max-w-[160px]">
                    {hdfc.bestRate > icici.bestRate
                      ? `HDFC leads by ${(hdfc.bestRate - icici.bestRate).toFixed(2)}% on best rate`
                      : hdfc.bestRate < icici.bestRate
                        ? `ICICI leads by ${(icici.bestRate - hdfc.bestRate).toFixed(2)}% on best rate`
                        : 'Both banks match on best rate'}
                  </div>
                </div>
              </div>
              <div className="bg-acc-deep rounded-xl p-4 text-center border border-acc/20">
                <div className="text-xs text-acc font-semibold uppercase tracking-wide mb-1">ICICI Best Rate</div>
                <div className="text-3xl font-extrabold text-acc">{icici.bestRate}%</div>
                <div className="text-xs text-faint mt-1">p.a.</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading / error */}
        {isLoading && (
          <div className="bg-surface rounded-2xl p-12 text-center border border-line">
            <div className="w-8 h-8 border-2 border-acc border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-faint text-sm">Loading rates…</p>
          </div>
        )}
        {isError && (
          <div className="bg-surface rounded-2xl p-10 text-center border border-line">
            <p className="text-muted text-sm">Failed to load rates. <Link to="/fd-rates" className="text-acc hover:underline">View all FD rates →</Link></p>
          </div>
        )}

        {/* Side-by-side tables */}
        {hdfc && icici && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HDFC */}
            <div className="bg-surface rounded-2xl border border-line border-t-2 border-t-mint overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-line">
                {hdfc.bank.logoUrl
                  ? <img src={hdfc.bank.logoUrl} alt="HDFC Bank" className="w-9 h-9 object-contain rounded-lg border border-line" />
                  : <div className="w-9 h-9 bg-mint/10 rounded-lg flex items-center justify-center text-mint font-bold text-sm">H</div>}
                <div>
                  <div className="font-bold text-ink">{hdfc.bank.name}</div>
                  <div className="text-xs text-faint">{hdfc.bank.bankType ?? 'Private Sector Bank'}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xl font-extrabold text-mint">{hdfc.bestRate}%</div>
                  <div className="text-[11px] text-faint">Best rate</div>
                </div>
              </div>
              <TenureTable bank={hdfc} otherBestRate={icici.bestRate} />
            </div>

            {/* ICICI */}
            <div className="bg-surface rounded-2xl border border-line border-t-2 border-t-acc overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-line">
                {icici.bank.logoUrl
                  ? <img src={icici.bank.logoUrl} alt="ICICI Bank" className="w-9 h-9 object-contain rounded-lg border border-line" />
                  : <div className="w-9 h-9 bg-acc-deep rounded-lg flex items-center justify-center text-acc font-bold text-sm">I</div>}
                <div>
                  <div className="font-bold text-ink">{icici.bank.name}</div>
                  <div className="text-xs text-faint">{icici.bank.bankType ?? 'Private Sector Bank'}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xl font-extrabold text-acc">{icici.bestRate}%</div>
                  <div className="text-[11px] text-faint">Best rate</div>
                </div>
              </div>
              <TenureTable bank={icici} otherBestRate={hdfc.bestRate} />
            </div>
          </div>
        )}

        {/* Key differences table */}
        <div className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-lg font-bold text-ink mb-4">Key Differences</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line text-xs font-semibold text-muted">
                  <th className="text-left py-2.5 px-4 w-1/3">Feature</th>
                  <th className="text-center py-2.5 px-4 text-mint">HDFC Bank</th>
                  <th className="text-center py-2.5 px-4 text-acc">ICICI Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-body">
                {[
                  ['Bank Type',           'Private Sector',      'Private Sector'],
                  ['DICGC Cover',         '₹5 lakh',             '₹5 lakh'],
                  ['Senior Citizen Extra','0.25–0.75% extra',    '0.25–0.50% extra'],
                  ['Min FD Amount',       '₹5,000',              '₹10,000'],
                  ['Premature Withdrawal','Allowed (1% penalty)', 'Allowed (1% penalty)'],
                  ['Tax Saving FD',       '5-year lock-in (80C)','5-year lock-in (80C)'],
                  ['Online Booking',      'NetBanking / App',    'NetBanking / App'],
                  ['NRE/NRO FDs',         'Available',           'Available'],
                ].map(([feature, hdfcVal, iciciVal]) => (
                  <tr key={feature} className="hover:bg-surface-2 transition-colors">
                    <td className="py-3 px-4 text-faint font-medium">{feature}</td>
                    <td className="py-3 px-4 text-center">{hdfcVal}</td>
                    <td className="py-3 px-4 text-center">{iciciVal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Who should choose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-mint/10 rounded-2xl p-5 border border-mint/20">
            <div className="font-bold text-mint mb-2">Choose HDFC Bank FD if…</div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• You want a higher rate on 3–5 year tenures</li>
              <li>• You are a super-senior citizen (75+) — HDFC gives 0.75% extra</li>
              <li>• You want a lower minimum deposit (₹5,000 vs ₹10,000)</li>
              <li>• You already bank with HDFC for convenience</li>
            </ul>
          </div>
          <div className="bg-acc-deep rounded-2xl p-5 border border-acc/20">
            <div className="font-bold text-acc mb-2">Choose ICICI Bank FD if…</div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• You want competitive short-tenure rates (7 days–1 year)</li>
              <li>• You are an NRI — ICICI has strong NRI banking infrastructure</li>
              <li>• You prefer ICICI's digital interface for managing FDs</li>
              <li>• You already hold a salary/savings account with ICICI</li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-surface rounded-2xl border border-line p-5">
          <h2 className="text-lg font-bold text-ink mb-1">Frequently Asked Questions</h2>
          <div>
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>

        {/* Related comparisons */}
        <div>
          <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-3">More FD Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { to: '/compare/fd/sbi-vs-post-office-mis', label: 'SBI FD vs Post Office MIS', desc: 'Fixed deposit vs Monthly Income Scheme' },
              { to: '/compare/fd/sbi-vs-scss',            label: 'SBI FD vs SCSS',             desc: 'FD vs Senior Citizens Savings Scheme' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="bg-surface rounded-xl p-4 border border-line hover:border-acc transition-all group flex flex-col gap-1">
                <div className="font-semibold text-ink text-sm group-hover:text-acc transition-colors">{item.label}</div>
                <div className="text-[11px] text-faint">{item.desc}</div>
              </Link>
            ))}
          </div>
          <div className="mt-3">
            <Link to="/fd-rates" className="text-sm text-acc hover:underline font-semibold">← Back to all FD rates</Link>
          </div>
        </div>

        <p className="text-xs text-faint text-center pb-4">
          Rates manually verified. Always confirm with the bank before investing.{' '}
          <Link to="/calculators/fd" className="text-acc hover:underline">Calculate FD maturity →</Link>
        </p>
      </div>
    </>
  );
}
