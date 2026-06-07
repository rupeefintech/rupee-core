import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronDown, PiggyBank, ShieldCheck, ExternalLink } from 'lucide-react';
import { apiClient } from '../utils/api';

interface Tenure {
  id: number; label: string | null;
  rate: number; seniorRate: number | null;
  minAmount: number | null; maxAmount: number | null;
  effectiveFrom: string; sourceUrl: string | null; notes: string | null;
}
interface BankRates {
  bank: { id: number; name: string; slug: string | null; logoUrl: string | null; bankType: string | null };
  tenures: Tenure[];
  bestRate: number;
  lastVerified: string;
}

const COMPARISON_ROWS = [
  { feature: 'Bank type',               sbi: 'Public Sector (Govt. owned)',  hdfc: 'Private Sector'                },
  { feature: 'Interest rate (regular)', sbi: '2.7% (≤₹1L) / 3% (>₹1L)',    hdfc: '3% (≤₹50L) / 3.5% (>₹50L)'  },
  { feature: 'Branches',                sbi: '22,000+ across India',          hdfc: '8,000+ across India'           },
  { feature: 'ATMs',                    sbi: '65,000+ ATMs',                  hdfc: '20,000+ ATMs'                  },
  { feature: 'Min Average Balance',     sbi: '₹3,000 (metro), ₹2,000 (semi)', hdfc: '₹10,000 (metro/urban)'        },
  { feature: 'Zero Balance Option',     sbi: 'Yes (BSBDA – Basic account)',   hdfc: 'Yes (BSBDA) / Salary accounts' },
  { feature: 'DICGC Cover',             sbi: '₹5 lakh per depositor',         hdfc: '₹5 lakh per depositor'         },
  { feature: 'Net Banking / App',       sbi: 'YONO (good)',                   hdfc: 'MobileBanking (excellent)'     },
  { feature: 'Debit card',             sbi: 'RuPay / Visa (free)',           hdfc: 'Visa / Mastercard (charges may apply)' },
  { feature: 'Senior Citizen benefit',  sbi: 'Same rate (no extra)',          hdfc: 'Same rate (no extra)'          },
  { feature: 'International usage',     sbi: 'Available (forex charges)',     hdfc: 'Available (forex charges)'     },
  { feature: 'Best for',               sbi: 'Rural/semi-urban, Govt. benefits, Jan Dhan', hdfc: 'Urban/salaried, digital-first users' },
];

const FAQS = [
  {
    q: 'Which savings account has a higher interest rate — SBI or HDFC Bank?',
    a: 'HDFC Bank offers a marginally higher savings interest rate. HDFC gives 3% on balances up to ₹50 lakh and 3.5% above ₹50 lakh. SBI gives 2.7% on balances up to ₹1 lakh and 3% above ₹1 lakh. For most regular balances (₹1–50 lakh), HDFC gives 0.3% more. For small balances under ₹1 lakh, HDFC (3%) is significantly higher than SBI (2.7%).',
  },
  {
    q: 'Which bank is safer — SBI or HDFC Bank?',
    a: 'Both are covered by DICGC insurance up to ₹5 lakh per depositor per bank. SBI is government-owned (sovereign backing) — there is virtually zero default risk. HDFC Bank is India\'s largest private sector bank with strong capital adequacy. For amounts within ₹5 lakh, both are equally safe. For very large amounts, SBI\'s government ownership provides an additional comfort layer.',
  },
  {
    q: 'Which bank has a lower minimum balance requirement?',
    a: 'SBI is lower. SBI requires ₹3,000 average monthly balance in metro/urban branches and ₹2,000 in semi-urban. HDFC Bank requires ₹10,000 in metro/urban branches. SBI also offers the Basic Savings Bank Deposit Account (BSBDA) with zero minimum balance. HDFC also has zero-balance options for salary accounts and select schemes.',
  },
  {
    q: 'Is HDFC Bank better than SBI for a salary account?',
    a: 'For urban salaried individuals, HDFC Bank is often preferred — better mobile app, faster customer service, and zero-balance salary accounts with perks like lounge access on some variants. SBI is better if you need a government-linked account (pension, PF, scholarship disbursements) or have operations in semi-urban/rural areas where SBI\'s branch network dominates.',
  },
  {
    q: 'Does SBI or HDFC Bank offer better internet banking?',
    a: 'HDFC Bank\'s mobile banking app is generally rated higher for UX, features, and reliability. SBI\'s YONO app is comprehensive and has improved significantly — but HDFC leads in day-to-day digital experience. For government service integrations (DBT transfers, Aadhaar linking, tax payments), SBI has deeper integrations.',
  },
];

export default function SavingsCompareSBIvsHDFC() {
  const { data, isLoading } = useQuery({
    queryKey: ['savings-rates'],
    queryFn:  () => apiClient.get('/rates?type=savings').then(r => r.data),
    staleTime: 30 * 60 * 1000,
  });

  const banks: BankRates[] = data?.banks ?? [];
  const sbi  = useMemo(() => banks.find(b => b.bank.name.toLowerCase().includes('state bank of india')), [banks]);
  const hdfc = useMemo(() => banks.find(b => b.bank.name.toLowerCase() === 'hdfc bank'), [banks]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://rupeepedia.in' },
          { '@type': 'ListItem', position: 2, name: 'Savings Rates', item: 'https://rupeepedia.in/savings-rates' },
          { '@type': 'ListItem', position: 3, name: 'SBI vs HDFC Savings Account', item: 'https://rupeepedia.in/compare/savings/sbi-vs-hdfc' },
        ],
      },
      {
        '@type': 'WebPage',
        name: 'SBI Savings Account vs HDFC Savings Account 2026 — Which is Better?',
        url:  'https://rupeepedia.in/compare/savings/sbi-vs-hdfc',
        description: 'Compare SBI and HDFC Bank savings account interest rates, minimum balance, features, and safety in 2026. Which bank is better for your savings?',
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
        <title>SBI Savings Account vs HDFC Savings Account 2026 — Which is Better? | RupeePedia</title>
        <meta name="description" content="Compare SBI vs HDFC Bank savings account: interest rates, minimum balance, branch network, digital banking, and safety. Find which is better for you in 2026." />
        <meta name="keywords" content="sbi savings account vs hdfc savings account, sbi vs hdfc bank savings, which bank is better sbi or hdfc, hdfc savings account interest rate 2026, sbi savings account interest rate 2026, sbi vs hdfc minimum balance, sbi savings account features" />
        <link rel="canonical" href="https://rupeepedia.in/compare/savings/sbi-vs-hdfc" />
        <meta property="og:title"       content="SBI vs HDFC Savings Account — 2026 Comparison | RupeePedia" />
        <meta property="og:description" content="Interest rates, minimum balance, branches, and safety compared. Which savings account is better — SBI or HDFC?" />
        <meta property="og:url"         content="https://rupeepedia.in/compare/savings/sbi-vs-hdfc" />
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
              <Link to="/savings-rates" className="hover:text-white transition-colors">Savings Rates</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-white font-medium">SBI vs HDFC Savings Account</span>
            </nav>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">SBI vs HDFC Savings Account</h1>
                <p className="text-brand-200 mt-1 text-sm">Interest rates, features, and safety compared — 2026</p>
              </div>
            </div>
            <p className="text-brand-200 text-base max-w-2xl">
              HDFC edges ahead on interest rate and digital banking. SBI wins on branch reach, lower minimum balance, and government backing.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* Live rate cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* SBI */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 border-t-4 border-t-emerald-500 p-6">
              <div className="flex items-center gap-3 mb-4">
                {sbi?.bank.logoUrl
                  ? <img src={sbi.bank.logoUrl} alt="SBI" className="w-10 h-10 object-contain rounded-lg border border-gray-100" />
                  : <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold">S</div>}
                <div>
                  <div className="font-bold text-gray-900">State Bank of India</div>
                  <div className="text-xs text-gray-400">Public Sector Bank</div>
                </div>
              </div>
              {isLoading
                ? <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                : sbi && (
                  <>
                    <div className="space-y-2 mb-4">
                      {sbi.tenures.filter(t => t.notes !== 'zero').map(t => (
                        <div key={t.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">{t.label}</span>
                          <span className="font-bold text-emerald-700">{t.rate}% p.a.</span>
                        </div>
                      ))}
                    </div>
                    {sbi.tenures.find(t => t.sourceUrl) && (
                      <a href={sbi.tenures.find(t => t.sourceUrl)!.sourceUrl!} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline">
                        Verify on SBI <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </>
                )}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between"><span>Min Balance (Metro)</span><span className="font-semibold">₹3,000</span></div>
                <div className="flex justify-between"><span>Branches</span><span className="font-semibold">22,000+</span></div>
                <div className="flex justify-between"><span>Zero Balance</span><span className="font-semibold text-emerald-600">Yes (BSBDA)</span></div>
              </div>
            </div>

            {/* HDFC */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 border-t-4 border-t-blue-500 p-6">
              <div className="flex items-center gap-3 mb-4">
                {hdfc?.bank.logoUrl
                  ? <img src={hdfc.bank.logoUrl} alt="HDFC Bank" className="w-10 h-10 object-contain rounded-lg border border-gray-100" />
                  : <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold">H</div>}
                <div>
                  <div className="font-bold text-gray-900">HDFC Bank</div>
                  <div className="text-xs text-gray-400">Private Sector Bank</div>
                </div>
              </div>
              {isLoading
                ? <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                : hdfc && (
                  <>
                    <div className="space-y-2 mb-4">
                      {hdfc.tenures.filter(t => t.notes !== 'zero').map(t => (
                        <div key={t.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">{t.label}</span>
                          <span className="font-bold text-blue-700">{t.rate}% p.a.</span>
                        </div>
                      ))}
                    </div>
                    {hdfc.tenures.find(t => t.sourceUrl) && (
                      <a href={hdfc.tenures.find(t => t.sourceUrl)!.sourceUrl!} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline">
                        Verify on HDFC <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </>
                )}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between"><span>Min Balance (Metro)</span><span className="font-semibold">₹10,000</span></div>
                <div className="flex justify-between"><span>Branches</span><span className="font-semibold">8,000+</span></div>
                <div className="flex justify-between"><span>Zero Balance</span><span className="font-semibold text-blue-600">Salary accounts only</span></div>
              </div>
            </div>
          </div>

          {/* Rate disclaimer */}
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Savings interest rates are subject to change by the bank at any time without notice — unlike FDs where the rate is locked at the time of deposit. Always verify current rates on the official bank website before opening an account.</span>
          </div>

          {/* Yearly interest illustration */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Interest Earned per Year</h2>
            <p className="text-xs text-gray-400 mb-4">At average balance of ₹1 lakh (regular slab for both banks)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'SBI Savings Account', rate: sbi?.tenures.find(t => t.label?.includes('Above') || t.label?.includes('above'))?.rate ?? 3, color: 'emerald' },
                { label: 'HDFC Bank Savings Account', rate: hdfc?.tenures.find(t => !t.label?.includes('50 Lakh') && t.notes !== 'zero')?.rate ?? 3, color: 'blue' },
              ].map(item => {
                const annual = Math.round(100000 * item.rate / 100);
                const monthly = Math.round(annual / 12);
                return (
                  <div key={item.label} className={`bg-${item.color}-50 rounded-xl p-4 border border-${item.color}-100`}>
                    <div className={`text-xs font-semibold text-${item.color}-700 mb-2`}>{item.label}</div>
                    <div className={`text-2xl font-extrabold text-${item.color}-700`}>
                      ₹{annual.toLocaleString('en-IN')}<span className="text-sm font-semibold">/yr</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">≈ ₹{monthly.toLocaleString('en-IN')}/month @ {item.rate}% p.a.</div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">* Interest on savings accounts is calculated daily on closing balance and credited quarterly. TDS deducted if total interest exceeds ₹10,000/yr.</p>
          </div>

          {/* Full feature table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Head-to-Head Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold w-1/3">Feature</th>
                    <th className="text-center py-2 px-4 text-emerald-700 font-bold">SBI</th>
                    <th className="text-center py-2 px-4 text-blue-700 font-bold">HDFC Bank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {COMPARISON_ROWS.map(row => (
                    <tr key={row.feature} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 text-gray-500 font-medium">{row.feature}</td>
                      <td className="py-3 px-4 text-center text-sm">{row.sbi}</td>
                      <td className="py-3 px-4 text-center text-sm">{row.hdfc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Who should choose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <div className="font-bold text-emerald-800 mb-2">Choose SBI if…</div>
              <ul className="text-sm text-emerald-700 space-y-1.5">
                <li>• You live in a small town, rural, or semi-urban area</li>
                <li>• You need a zero-balance basic account (BSBDA)</li>
                <li>• You receive Govt. benefits (DBT, pension, scholarships)</li>
                <li>• You want lower min balance requirement (₹3,000 vs ₹10,000)</li>
                <li>• You want 22,000+ branches for in-person banking</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="font-bold text-blue-800 mb-2">Choose HDFC Bank if…</div>
              <ul className="text-sm text-blue-700 space-y-1.5">
                <li>• You want a slightly higher interest rate (3% vs 2.7% on small balances)</li>
                <li>• You are salaried in urban areas — HDFC salary accounts are zero-balance</li>
                <li>• You want a best-in-class mobile banking app</li>
                <li>• You need faster NEFT/RTGS and customer service</li>
                <li>• You want better debit card perks and rewards</li>
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

          {/* Related */}
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Related</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { to: '/best-savings-accounts-for-salary', label: 'Best Savings Accounts for Salary', desc: 'Zero balance, perks, and best interest rates for salaried accounts' },
                { to: '/savings-rates', label: 'All Savings Account Rates', desc: 'Compare savings rates from 40+ banks — up to 9% p.a.' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all group flex flex-col gap-1">
                  <div className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 transition-colors">{item.label}</div>
                  <div className="text-[11px] text-gray-400">{item.desc}</div>
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <Link to="/savings-rates" className="text-sm text-brand-600 hover:underline font-semibold">← Back to all savings rates</Link>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center pb-4">
            Rates verified June 2026. Always confirm with the bank before opening an account.{' '}
            <Link to="/savings-rates" className="text-brand-500 hover:underline">Compare all savings rates →</Link>
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
