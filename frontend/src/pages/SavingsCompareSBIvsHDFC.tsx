import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, PiggyBank, ShieldCheck, ExternalLink } from 'lucide-react';
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

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                  <Link to="/"               className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to="/savings-rates"  className="hover:text-acc transition-colors">Savings Rates</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">SBI vs HDFC Savings Account</span>
                </nav>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-acc-deep rounded-2xl flex items-center justify-center flex-shrink-0 text-acc">
                    <PiggyBank className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink tracking-tight">SBI vs HDFC Savings Account</h1>
                    <p className="text-muted mt-1 text-sm">Interest rates, features, and safety compared — 2026</p>
                  </div>
                </div>
                <p className="text-body text-base max-w-2xl">
                  HDFC edges ahead on interest rate and digital banking. SBI wins on branch reach, lower minimum balance, and government backing.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Live rate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* SBI */}
          <div className="bg-surface rounded-2xl border border-line border-t-2 border-t-mint p-6">
            <div className="flex items-center gap-3 mb-4">
              {sbi?.bank.logoUrl
                ? <img src={sbi.bank.logoUrl} alt="SBI" className="w-10 h-10 object-contain rounded-lg border border-line" />
                : <div className="w-10 h-10 bg-mint/10 rounded-lg flex items-center justify-center text-mint font-bold">S</div>}
              <div>
                <div className="font-bold text-ink">State Bank of India</div>
                <div className="text-xs text-faint">Public Sector Bank</div>
              </div>
            </div>
            {isLoading
              ? <div className="h-20 bg-surface-2 rounded-xl animate-pulse" />
              : sbi && (
                <>
                  <div className="space-y-2 mb-4">
                    {sbi.tenures.filter(t => t.notes !== 'zero').map(t => (
                      <div key={t.id} className="flex justify-between items-center text-sm">
                        <span className="text-muted">{t.label}</span>
                        <span className="font-bold text-mint">{t.rate}% p.a.</span>
                      </div>
                    ))}
                  </div>
                  {sbi.tenures.find(t => t.sourceUrl) && (
                    <a href={sbi.tenures.find(t => t.sourceUrl)!.sourceUrl!} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-acc hover:text-ink transition-colors">
                      Verify on SBI <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </>
              )}
            <div className="mt-4 pt-4 border-t border-line space-y-1.5 text-xs text-muted">
              <div className="flex justify-between"><span>Min Balance (Metro)</span><span className="font-semibold text-body">₹3,000</span></div>
              <div className="flex justify-between"><span>Branches</span><span className="font-semibold text-body">22,000+</span></div>
              <div className="flex justify-between"><span>Zero Balance</span><span className="font-semibold text-mint">Yes (BSBDA)</span></div>
            </div>
          </div>

          {/* HDFC */}
          <div className="bg-surface rounded-2xl border border-line border-t-2 border-t-acc p-6">
            <div className="flex items-center gap-3 mb-4">
              {hdfc?.bank.logoUrl
                ? <img src={hdfc.bank.logoUrl} alt="HDFC Bank" className="w-10 h-10 object-contain rounded-lg border border-line" />
                : <div className="w-10 h-10 bg-acc-deep rounded-lg flex items-center justify-center text-acc font-bold">H</div>}
              <div>
                <div className="font-bold text-ink">HDFC Bank</div>
                <div className="text-xs text-faint">Private Sector Bank</div>
              </div>
            </div>
            {isLoading
              ? <div className="h-20 bg-surface-2 rounded-xl animate-pulse" />
              : hdfc && (
                <>
                  <div className="space-y-2 mb-4">
                    {hdfc.tenures.filter(t => t.notes !== 'zero').map(t => (
                      <div key={t.id} className="flex justify-between items-center text-sm">
                        <span className="text-muted">{t.label}</span>
                        <span className="font-bold text-acc">{t.rate}% p.a.</span>
                      </div>
                    ))}
                  </div>
                  {hdfc.tenures.find(t => t.sourceUrl) && (
                    <a href={hdfc.tenures.find(t => t.sourceUrl)!.sourceUrl!} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-acc hover:text-ink transition-colors">
                      Verify on HDFC <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </>
              )}
            <div className="mt-4 pt-4 border-t border-line space-y-1.5 text-xs text-muted">
              <div className="flex justify-between"><span>Min Balance (Metro)</span><span className="font-semibold text-body">₹10,000</span></div>
              <div className="flex justify-between"><span>Branches</span><span className="font-semibold text-body">8,000+</span></div>
              <div className="flex justify-between"><span>Zero Balance</span><span className="font-semibold text-acc">Salary accounts only</span></div>
            </div>
          </div>
        </div>

        {/* Rate disclaimer */}
        <div className="flex items-start gap-2 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl text-xs text-gold">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Savings interest rates are subject to change by the bank at any time without notice — unlike FDs where the rate is locked at the time of deposit. Always verify current rates on the official bank website before opening an account.</span>
        </div>

        {/* Yearly interest illustration */}
        <div className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-lg font-bold text-ink mb-1">Interest Earned per Year</h2>
          <p className="text-xs text-faint mb-4">At average balance of ₹1 lakh (regular slab for both banks)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'SBI Savings Account', rate: sbi?.tenures.find(t => t.label?.includes('Above') || t.label?.includes('above'))?.rate ?? 3, cls: 'mint' },
              { label: 'HDFC Bank Savings Account', rate: hdfc?.tenures.find(t => !t.label?.includes('50 Lakh') && t.notes !== 'zero')?.rate ?? 3, cls: 'acc' },
            ].map(item => {
              const annual = Math.round(100000 * item.rate / 100);
              const monthly = Math.round(annual / 12);
              return (
                <div key={item.label} className={`rounded-xl p-4 border ${item.cls === 'mint' ? 'bg-mint/10 border-mint/20' : 'bg-acc-deep border-acc/20'}`}>
                  <div className={`text-xs font-semibold mb-2 ${item.cls === 'mint' ? 'text-mint' : 'text-acc'}`}>{item.label}</div>
                  <div className={`text-2xl font-extrabold ${item.cls === 'mint' ? 'text-mint' : 'text-acc'}`}>
                    ₹{annual.toLocaleString('en-IN')}<span className="text-sm font-semibold">/yr</span>
                  </div>
                  <div className="text-[11px] text-muted mt-1">≈ ₹{monthly.toLocaleString('en-IN')}/month @ {item.rate}% p.a.</div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-faint mt-3">* Interest on savings accounts is calculated daily on closing balance and credited quarterly. TDS deducted if total interest exceeds ₹10,000/yr.</p>
        </div>

        {/* Full feature table */}
        <div className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-lg font-bold text-ink mb-4">Head-to-Head Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line text-xs font-semibold text-muted">
                  <th className="text-left py-2.5 px-4 w-1/3">Feature</th>
                  <th className="text-center py-2.5 px-4 text-mint">SBI</th>
                  <th className="text-center py-2.5 px-4 text-acc">HDFC Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {COMPARISON_ROWS.map(row => (
                  <tr key={row.feature} className="hover:bg-surface-2 transition-colors">
                    <td className="py-3 px-4 text-faint font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-sm text-body">{row.sbi}</td>
                    <td className="py-3 px-4 text-center text-sm text-body">{row.hdfc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Who should choose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-mint/10 rounded-2xl p-5 border border-mint/20">
            <div className="font-bold text-mint mb-2">Choose SBI if…</div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• You live in a small town, rural, or semi-urban area</li>
              <li>• You need a zero-balance basic account (BSBDA)</li>
              <li>• You receive Govt. benefits (DBT, pension, scholarships)</li>
              <li>• You want lower min balance requirement (₹3,000 vs ₹10,000)</li>
              <li>• You want 22,000+ branches for in-person banking</li>
            </ul>
          </div>
          <div className="bg-acc-deep rounded-2xl p-5 border border-acc/20">
            <div className="font-bold text-acc mb-2">Choose HDFC Bank if…</div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• You want a slightly higher interest rate (3% vs 2.7% on small balances)</li>
              <li>• You are salaried in urban areas — HDFC salary accounts are zero-balance</li>
              <li>• You want a best-in-class mobile banking app</li>
              <li>• You need faster NEFT/RTGS and customer service</li>
              <li>• You want better debit card perks and rewards</li>
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

        {/* Related */}
        <div>
          <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-3">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { to: '/best-savings-accounts-for-salary', label: 'Best Savings Accounts for Salary', desc: 'Zero balance, perks, and best interest rates for salaried accounts' },
              { to: '/savings-rates', label: 'All Savings Account Rates', desc: 'Compare savings rates from 40+ banks — up to 9% p.a.' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="bg-surface rounded-xl p-4 border border-line hover:border-acc transition-all group flex flex-col gap-1">
                <div className="font-semibold text-ink text-sm group-hover:text-acc transition-colors">{item.label}</div>
                <div className="text-[11px] text-faint">{item.desc}</div>
              </Link>
            ))}
          </div>
          <div className="mt-3">
            <Link to="/savings-rates" className="text-sm text-acc hover:underline font-semibold">← Back to all savings rates</Link>
          </div>
        </div>

        <p className="text-xs text-faint text-center pb-4">
          Rates verified June 2026. Always confirm with the bank before opening an account.{' '}
          <Link to="/savings-rates" className="text-acc hover:underline">Compare all savings rates →</Link>
        </p>
      </div>
    </>
  );
}
