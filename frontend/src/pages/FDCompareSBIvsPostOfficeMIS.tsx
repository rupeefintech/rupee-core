import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, TrendingUp, ShieldCheck } from 'lucide-react';
import { apiClient } from '../utils/api';

interface Tenure {
  id: number; label: string | null; months: number | null;
  rate: number; seniorRate: number | null; effectiveFrom: string;
}
interface BankRates {
  bank: { id: number; name: string; slug: string | null; logoUrl: string | null; bankType: string | null };
  tenures: Tenure[];
  bestRate: number;
  lastVerified: string;
}

// Post Office MIS static data (quarterly reviewed by Govt; last updated Q1 2026)
const MIS_RATE = 7.4;
const MIS_DATA = {
  name: 'Post Office MIS',
  fullName: 'Post Office Monthly Income Scheme',
  rate: MIS_RATE,
  tenure: '5 years',
  minAmount: 1000,
  maxAmountSingle: 900000,
  maxAmountJoint: 1500000,
  payoutFrequency: 'Monthly',
  taxBenefit: 'None (interest taxable, no 80C)',
  tds: 'No TDS, but interest taxable in hands of investor',
  premature: 'Allowed after 1 year (penalty 2% before 3 yrs, 1% after)',
  guarantor: 'Government of India',
  effectiveFrom: 'April 2024',
};

const COMPARISON_ROWS = [
  { feature: 'Offered by',             sbi: 'SBI (RBI-regulated bank)',       mis: 'India Post (Govt. of India)'     },
  { feature: 'Tenure',                 sbi: '7 days – 10 years',             mis: '5 years only'                    },
  { feature: 'Min Investment',         sbi: '₹1,000',                         mis: '₹1,000'                          },
  { feature: 'Max Investment',         sbi: 'No limit',                       mis: '₹9 lakh (single), ₹15 lakh (joint)' },
  { feature: 'Interest Payout',        sbi: 'Monthly / Quarterly / At maturity', mis: 'Monthly (fixed)'             },
  { feature: 'DICGC Insurance',        sbi: '₹5 lakh per depositor',          mis: 'Not applicable (Govt. backed)'  },
  { feature: 'Premature Withdrawal',   sbi: 'Allowed (penalty ~1%)',          mis: 'After 1 yr (1–2% penalty)'      },
  { feature: 'Tax Saving (80C)',        sbi: '5-yr tax-saving FD only',       mis: 'No 80C benefit'                 },
  { feature: 'TDS on Interest',        sbi: 'Yes (if >₹40k/yr)',              mis: 'No TDS (but taxable)'           },
  { feature: 'Nomination',             sbi: 'Yes',                            mis: 'Yes'                            },
  { feature: 'Online Account',         sbi: 'Yes (YONO / NetBanking)',        mis: 'Limited (India Post portal)'    },
];

const FAQS = [
  {
    q: 'What is Post Office MIS and how does it differ from a bank FD?',
    a: 'Post Office Monthly Income Scheme (POMIS) is a government-backed savings scheme that pays a fixed monthly interest for 5 years. A bank FD is a deposit with a scheduled bank for any tenure (7 days to 10 years), with interest paid monthly, quarterly, or at maturity. POMIS is backed by the Government of India — it cannot default, whereas bank FDs are insured by DICGC only up to ₹5 lakh.',
  },
  {
    q: 'Is SBI FD rate higher than Post Office MIS rate?',
    a: `SBI FD rates for 5-year tenures typically hover near 6.5–7% p.a. Post Office MIS currently offers ${MIS_RATE}% p.a. (effective April 2024). For senior citizens, SBI offers an additional 0.50% on FDs. Compare the current SBI rates in the table above with the MIS rate to determine which is higher at the time of your investment.`,
  },
  {
    q: 'Which is safer — SBI FD or Post Office MIS?',
    a: 'Post Office MIS is backed by the Government of India (sovereign guarantee), making it the safest instrument in India — with no theoretical upper limit on safety. SBI FD is insured by DICGC up to ₹5 lakh per depositor. For amounts above ₹5 lakh, Post Office MIS is safer. SBI is a government-owned bank and also considered very safe in practice.',
  },
  {
    q: 'Can I get monthly income from both SBI FD and Post Office MIS?',
    a: 'Yes. SBI FDs can be set to pay interest monthly (though TDS is deducted). Post Office MIS is specifically designed for monthly income — the interest is automatically credited to your Post Office savings account each month. MIS is better suited if your primary goal is regular monthly income.',
  },
  {
    q: 'Does Post Office MIS qualify for 80C tax deduction?',
    a: 'No. Post Office MIS does not qualify for Section 80C deduction. Only the 5-year Tax-Saving FD (available at SBI and other banks) qualifies for 80C deduction up to ₹1.5 lakh per year. If tax saving is your goal, choose SBI Tax Saving FD over Post Office MIS.',
  },
  {
    q: 'What is the maximum investment limit in Post Office MIS?',
    a: 'Post Office MIS has an investment cap: ₹9 lakh for individual/single accounts and ₹15 lakh for joint accounts. SBI FD has no such limit — you can invest any amount. If you need to invest more than ₹9 lakh, SBI FD is the only option between the two.',
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

export default function FDCompareSBIvsPostOfficeMIS() {
  const { data, isLoading } = useQuery({
    queryKey: ['fd-rates'],
    queryFn:  () => apiClient.get('/rates?type=fd').then(r => r.data),
    staleTime: 30 * 60 * 1000,
  });

  const banks: BankRates[] = data?.banks ?? [];
  const sbi = useMemo(() => banks.find(b => b.bank.name.toLowerCase().includes('state bank of india')), [banks]);

  const sbi5yr = useMemo(() => {
    if (!sbi) return null;
    return sbi.tenures.find(t => t.label?.toLowerCase().includes('5 year') || t.months === 60)
      ?? sbi.tenures.find(t => (t.months ?? 0) >= 60);
  }, [sbi]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://rupeepedia.in' },
          { '@type': 'ListItem', position: 2, name: 'FD Rates', item: 'https://rupeepedia.in/fd-rates' },
          { '@type': 'ListItem', position: 3, name: 'SBI FD vs Post Office MIS', item: 'https://rupeepedia.in/compare/fd/sbi-vs-post-office-mis' },
        ],
      },
      {
        '@type': 'WebPage',
        name: 'SBI FD vs Post Office MIS 2026 — Which is Better for Monthly Income?',
        url:  'https://rupeepedia.in/compare/fd/sbi-vs-post-office-mis',
        description: 'Compare SBI Fixed Deposit vs Post Office Monthly Income Scheme (POMIS). Interest rates, tax treatment, safety, and who should choose which in 2026.',
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
        <title>SBI FD vs Post Office MIS 2026 — Which is Better for Monthly Income? | RupeePedia</title>
        <meta name="description" content={`Compare SBI Fixed Deposit vs Post Office Monthly Income Scheme (POMIS) in 2026. Post Office MIS offers ${MIS_RATE}% p.a. (5 years). See interest rates, safety, tax treatment, and monthly income comparison.`} />
        <meta name="keywords" content="sbi fd vs post office mis, sbi fd vs pomis, post office mis vs bank fd, post office monthly income scheme vs fixed deposit, pomis interest rate 2026, sbi fd rate 2026, which is better fd or mis" />
        <link rel="canonical" href="https://rupeepedia.in/compare/fd/sbi-vs-post-office-mis" />
        <meta property="og:title"       content="SBI FD vs Post Office MIS 2026 — Monthly Income Comparison | RupeePedia" />
        <meta property="og:description" content={`Post Office MIS: ${MIS_RATE}% p.a. vs SBI FD. Compare safety, tax treatment, and monthly income potential.`} />
        <meta property="og:url"         content="https://rupeepedia.in/compare/fd/sbi-vs-post-office-mis" />
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
                  <span className="text-acc font-semibold">SBI FD vs Post Office MIS</span>
                </nav>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-acc-deep rounded-2xl flex items-center justify-center flex-shrink-0 text-acc">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink tracking-tight">SBI FD vs Post Office MIS</h1>
                    <p className="text-muted mt-1 text-sm">Fixed Deposit vs Monthly Income Scheme — 2026 comparison</p>
                  </div>
                </div>
                <p className="text-body text-base max-w-2xl">
                  Both offer stable returns — but they differ significantly in flexibility, tax treatment, and safety. Here's the complete picture.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Rate comparison cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* SBI FD card */}
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
              ? <div className="h-16 bg-surface-2 rounded-xl animate-pulse" />
              : sbi
                ? (
                  <>
                    <div className="text-3xl font-extrabold text-mint mb-1">{sbi.bestRate}% p.a.</div>
                    <div className="text-xs text-faint mb-3">Best rate across all tenures</div>
                    {sbi5yr && (
                      <div className="text-sm text-body">
                        <span className="font-semibold">5-year rate:</span> {sbi5yr.rate}% p.a.
                        {sbi5yr.seniorRate && <span className="text-acc ml-2">({sbi5yr.seniorRate}% for seniors)</span>}
                      </div>
                    )}
                  </>
                )
                : <div className="text-sm text-faint">SBI rates not loaded yet. <Link to="/fd-rates" className="text-acc underline">View all rates</Link></div>}
            <div className="mt-4 space-y-1.5 text-xs text-muted">
              <div className="flex justify-between"><span>Min deposit</span><span className="font-semibold text-body">₹1,000</span></div>
              <div className="flex justify-between"><span>Max deposit</span><span className="font-semibold text-body">No limit</span></div>
              <div className="flex justify-between"><span>Tenures</span><span className="font-semibold text-body">7 days – 10 years</span></div>
              <div className="flex justify-between"><span>DICGC cover</span><span className="font-semibold text-mint">₹5 lakh</span></div>
            </div>
          </div>

          {/* Post Office MIS card */}
          <div className="bg-surface rounded-2xl border border-line border-t-2 border-t-gold p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🏤</span>
              </div>
              <div>
                <div className="font-bold text-ink">Post Office MIS</div>
                <div className="text-xs text-faint">Government of India</div>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gold mb-1">{MIS_RATE}% p.a.</div>
            <div className="text-xs text-faint mb-3">Fixed rate (w.e.f. {MIS_DATA.effectiveFrom})</div>
            <div className="text-sm text-body mb-4">
              <span className="font-semibold">Payout:</span> Monthly (automatic to PO savings account)
            </div>
            <div className="mt-1 space-y-1.5 text-xs text-muted">
              <div className="flex justify-between"><span>Min deposit</span><span className="font-semibold text-body">₹1,000</span></div>
              <div className="flex justify-between"><span>Max deposit</span><span className="font-semibold text-gold">₹9L (single) / ₹15L (joint)</span></div>
              <div className="flex justify-between"><span>Tenure</span><span className="font-semibold text-body">5 years only</span></div>
              <div className="flex justify-between"><span>Guarantee</span><span className="font-semibold text-gold">Govt. of India</span></div>
            </div>
          </div>
        </div>

        {/* Monthly income calculator (static) */}
        <div className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-lg font-bold text-ink mb-1">Monthly Income Comparison</h2>
          <p className="text-xs text-faint mb-4">For ₹5 lakh invested (at current rates)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: 'SBI FD (5-yr, monthly payout)',
                rate: sbi5yr?.rate ?? 6.5,
                cls: 'mint',
                note: 'TDS deducted if annual interest > ₹40,000',
              },
              {
                label: 'Post Office MIS',
                rate: MIS_RATE,
                cls: 'gold',
                note: 'No TDS. Interest credited directly to PO savings account.',
              },
            ].map(item => {
              const monthlyIncome = Math.round((500000 * item.rate) / (100 * 12));
              return (
                <div key={item.label} className={`rounded-xl p-4 border ${item.cls === 'mint' ? 'bg-mint/10 border-mint/20' : 'bg-gold/10 border-gold/20'}`}>
                  <div className={`text-xs font-semibold mb-2 ${item.cls === 'mint' ? 'text-mint' : 'text-gold'}`}>{item.label}</div>
                  <div className={`text-2xl font-extrabold ${item.cls === 'mint' ? 'text-mint' : 'text-gold'}`}>
                    ₹{monthlyIncome.toLocaleString('en-IN')}<span className="text-sm font-semibold">/mo</span>
                  </div>
                  <div className="text-[11px] text-muted mt-1">{item.note}</div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-faint mt-3">* Illustrative only. SBI 5-yr rate from live data. Actual payout may vary with compounding frequency and premature closure terms.</p>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl text-xs text-gold">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Post Office MIS rates are reviewed quarterly by the Government. Always verify the current rate at your nearest post office or <a href="https://www.indiapost.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-semibold">indiapost.gov.in</a> before investing.</span>
        </div>

        {/* Head-to-head table */}
        <div className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-lg font-bold text-ink mb-4">Head-to-Head Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line text-xs font-semibold text-muted">
                  <th className="text-left py-2.5 px-4 w-1/3">Feature</th>
                  <th className="text-center py-2.5 px-4 text-mint">SBI FD</th>
                  <th className="text-center py-2.5 px-4 text-gold">Post Office MIS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-body">
                {COMPARISON_ROWS.map(row => (
                  <tr key={row.feature} className="hover:bg-surface-2 transition-colors">
                    <td className="py-3 px-4 text-faint font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-sm">{row.sbi}</td>
                    <td className="py-3 px-4 text-center text-sm">{row.mis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Who should choose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-mint/10 rounded-2xl p-5 border border-mint/20">
            <div className="font-bold text-mint mb-2">Choose SBI FD if…</div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• Need flexible tenure (not locked into 5 years)</li>
              <li>• Want to invest more than ₹9 lakh</li>
              <li>• Want 80C tax benefit (Tax-Saving FD)</li>
              <li>• Prefer online booking via YONO / net banking</li>
              <li>• Are a senior citizen (0.50% extra rate)</li>
            </ul>
          </div>
          <div className="bg-gold/10 rounded-2xl p-5 border border-gold/20">
            <div className="font-bold text-gold mb-2">Choose Post Office MIS if…</div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• Primary goal is stable monthly income</li>
              <li>• Want sovereign-guaranteed returns (no default risk)</li>
              <li>• Prefer no TDS hassle on monthly payouts</li>
              <li>• Comfortable with 5-year lock-in</li>
              <li>• Investing within the ₹9L / ₹15L cap</li>
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
              { to: '/compare/fd/sbi-vs-scss',        label: 'SBI FD vs SCSS',        desc: 'FD vs Senior Citizens Savings Scheme' },
              { to: '/compare/fd/hdfc-vs-icici',      label: 'HDFC FD vs ICICI FD',   desc: 'Side-by-side rate comparison across all tenures' },
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
          SBI rates manually verified. Post Office MIS rate as of {MIS_DATA.effectiveFrom} — verify before investing.{' '}
          <Link to="/calculators/fd" className="text-acc hover:underline">Calculate FD maturity →</Link>
        </p>
      </div>
    </>
  );
}
