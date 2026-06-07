import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronDown, TrendingUp, ExternalLink } from 'lucide-react';
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

function TenureTable({ bank, otherBestRate }: { bank: BankRates; otherBestRate: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
            <th className="text-left px-4 py-2.5 font-semibold">Tenure</th>
            <th className="text-right px-4 py-2.5 font-semibold">Rate</th>
            <th className="text-right px-4 py-2.5 font-semibold">Senior Rate</th>
            <th className="text-left px-4 py-2.5 font-semibold hidden sm:table-cell">Effective</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {bank.tenures.map(t => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{t.label ?? '—'}</td>
              <td className="px-4 py-3 text-right font-bold text-emerald-700">{t.rate}%</td>
              <td className="px-4 py-3 text-right text-blue-700 font-semibold">
                {t.seniorRate != null ? `${t.seniorRate}%` : '—'}
              </td>
              <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                {new Date(t.effectiveFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
              </td>
              <td className="px-4 py-3 text-right">
                {t.sourceUrl && (
                  <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-xs text-brand-500 hover:underline">
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

      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <nav className="flex items-center gap-1.5 text-brand-300 text-xs mb-5">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <Link to="/fd-rates" className="hover:text-white transition-colors">FD Rates</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-white font-medium">HDFC vs ICICI</span>
            </nav>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">HDFC FD vs ICICI FD</h1>
                <p className="text-brand-200 mt-1 text-sm">Fixed deposit rate comparison — all tenures, 2026</p>
              </div>
            </div>
            <p className="text-brand-200 text-base max-w-2xl">
              Live rates from both banks. See where each bank leads across short, medium, and long tenures — including senior citizen rates.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* Quick verdict */}
          {hdfc && icici && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Quick Verdict</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">HDFC Best Rate</div>
                  <div className="text-3xl font-extrabold text-emerald-700">{hdfc.bestRate}%</div>
                  <div className="text-xs text-gray-400 mt-1">p.a.</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">vs</div>
                    <div className="text-xs text-gray-500 max-w-[160px]">
                      {hdfc.bestRate > icici.bestRate
                        ? `HDFC leads by ${(hdfc.bestRate - icici.bestRate).toFixed(2)}% on best rate`
                        : hdfc.bestRate < icici.bestRate
                          ? `ICICI leads by ${(icici.bestRate - hdfc.bestRate).toFixed(2)}% on best rate`
                          : 'Both banks match on best rate'}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">ICICI Best Rate</div>
                  <div className="text-3xl font-extrabold text-blue-700">{icici.bestRate}%</div>
                  <div className="text-xs text-gray-400 mt-1">p.a.</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading / error */}
          {isLoading && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading rates…</p>
            </div>
          )}
          {isError && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Failed to load rates. <Link to="/fd-rates" className="text-brand-600 underline">View all FD rates →</Link></p>
            </div>
          )}

          {/* Side-by-side tables */}
          {hdfc && icici && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* HDFC */}
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 border-t-4 border-t-emerald-500 overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
                  {hdfc.bank.logoUrl
                    ? <img src={hdfc.bank.logoUrl} alt="HDFC Bank" className="w-9 h-9 object-contain rounded-lg border border-gray-100" />
                    : <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-sm">H</div>}
                  <div>
                    <div className="font-bold text-gray-900">{hdfc.bank.name}</div>
                    <div className="text-xs text-gray-400">{hdfc.bank.bankType ?? 'Private Sector Bank'}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xl font-extrabold text-emerald-700">{hdfc.bestRate}%</div>
                    <div className="text-[11px] text-gray-400">Best rate</div>
                  </div>
                </div>
                <TenureTable bank={hdfc} otherBestRate={icici.bestRate} />
              </div>

              {/* ICICI */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-200 border-t-4 border-t-blue-500 overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
                  {icici.bank.logoUrl
                    ? <img src={icici.bank.logoUrl} alt="ICICI Bank" className="w-9 h-9 object-contain rounded-lg border border-gray-100" />
                    : <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">I</div>}
                  <div>
                    <div className="font-bold text-gray-900">{icici.bank.name}</div>
                    <div className="text-xs text-gray-400">{icici.bank.bankType ?? 'Private Sector Bank'}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xl font-extrabold text-blue-700">{icici.bestRate}%</div>
                    <div className="text-[11px] text-gray-400">Best rate</div>
                  </div>
                </div>
                <TenureTable bank={icici} otherBestRate={hdfc.bestRate} />
              </div>
            </div>
          )}

          {/* Key differences table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Key Differences</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold w-1/3">Feature</th>
                    <th className="text-center py-2 px-4 text-emerald-700 font-bold">HDFC Bank</th>
                    <th className="text-center py-2 px-4 text-blue-700 font-bold">ICICI Bank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
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
                    <tr key={feature}>
                      <td className="py-3 pr-4 text-gray-500 font-medium">{feature}</td>
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
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <div className="font-bold text-emerald-800 mb-2">Choose HDFC Bank FD if…</div>
              <ul className="text-sm text-emerald-700 space-y-1.5">
                <li>• You want a higher rate on 3–5 year tenures</li>
                <li>• You are a super-senior citizen (75+) — HDFC gives 0.75% extra</li>
                <li>• You want a lower minimum deposit (₹5,000 vs ₹10,000)</li>
                <li>• You already bank with HDFC for convenience</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="font-bold text-blue-800 mb-2">Choose ICICI Bank FD if…</div>
              <ul className="text-sm text-blue-700 space-y-1.5">
                <li>• You want competitive short-tenure rates (7 days–1 year)</li>
                <li>• You are an NRI — ICICI has strong NRI banking infrastructure</li>
                <li>• You prefer ICICI's digital interface for managing FDs</li>
                <li>• You already hold a salary/savings account with ICICI</li>
              </ul>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>

          {/* Related comparisons */}
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">More FD Comparisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { to: '/compare/fd/sbi-vs-post-office-mis', label: 'SBI FD vs Post Office MIS', desc: 'Fixed deposit vs Monthly Income Scheme' },
                { to: '/compare/fd/sbi-vs-scss',            label: 'SBI FD vs SCSS',             desc: 'FD vs Senior Citizens Savings Scheme' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all group flex flex-col gap-1">
                  <div className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 transition-colors">{item.label}</div>
                  <div className="text-[11px] text-gray-400">{item.desc}</div>
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <Link to="/fd-rates" className="text-sm text-brand-600 hover:underline font-semibold">← Back to all FD rates</Link>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center pb-4">
            Rates manually verified. Always confirm with the bank before investing.{' '}
            <Link to="/calculators/fd" className="text-brand-500 hover:underline">Calculate FD maturity →</Link>
          </p>
        </div>
      </div>
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex justify-between items-center px-5 py-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-50">{a}</div>
      )}
    </div>
  );
}
