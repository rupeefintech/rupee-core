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

// SCSS static data (Govt. of India quarterly review)
const SCSS_RATE = 8.2;
const SCSS_DATA = {
  rate: SCSS_RATE,
  tenure: '5 years (extendable by 3 years once)',
  minAmount: 1000,
  maxAmount: 3000000,
  payoutFrequency: 'Quarterly (1 Apr, 1 Jul, 1 Oct, 1 Jan)',
  tax80C: 'Yes — up to ₹1.5 lakh deduction under 80C',
  tds: 'TDS if annual interest > ₹50,000 (senior citizen threshold)',
  eligibility: 'Age 60+ (55+ for VRS/defence retirees within 1 month of retirement)',
  premature: 'After 1 yr: 1.5% penalty (before 2 yrs), 1% after 2 yrs',
  guarantor: 'Government of India',
  effectiveFrom: 'April 2023',
};

const COMPARISON_ROWS = [
  { feature: 'Eligibility',            sbi: 'Any resident Indian',             scss: 'Age 60+ (55+ for VRS/defence retirees)' },
  { feature: 'Offered by',             sbi: 'SBI (RBI-regulated bank)',         scss: 'Post Offices & authorised banks (incl. SBI)' },
  { feature: 'Tenure',                 sbi: '7 days – 10 years',               scss: '5 years (extendable by 3 years once)' },
  { feature: 'Interest Rate',          sbi: 'Market-driven, changes frequently', scss: `${SCSS_RATE}% p.a. (quarterly revised by Govt.)` },
  { feature: 'Min Investment',         sbi: '₹1,000',                           scss: '₹1,000' },
  { feature: 'Max Investment',         sbi: 'No limit',                         scss: '₹30 lakh per individual' },
  { feature: 'Interest Payout',        sbi: 'Monthly / Quarterly / At maturity', scss: 'Quarterly (fixed schedule)' },
  { feature: 'Tax Deduction (80C)',    sbi: '5-yr tax-saving FD only',          scss: 'Yes — up to ₹1.5 lakh p.a.' },
  { feature: 'TDS Threshold',          sbi: '₹40,000 p.a. (₹50k for seniors)', scss: '₹50,000 p.a.' },
  { feature: 'DICGC Insurance',        sbi: '₹5 lakh per depositor',            scss: 'Not applicable (Govt. backed)' },
  { feature: 'Premature Closure',      sbi: 'Any time (penalty ~1%)',           scss: 'After 1 yr (1–1.5% penalty)' },
  { feature: 'Extension',             sbi: 'Renew at current rate',            scss: 'Extend by 3 yrs after maturity' },
];

const FAQS = [
  {
    q: 'What is SCSS and who can invest in it?',
    a: 'The Senior Citizens Savings Scheme (SCSS) is a government-backed savings scheme for Indian residents aged 60 years and above. Individuals who have taken voluntary retirement (VRS) or are defence retirees may open SCSS at age 55+ within one month of receiving retirement benefits. It offers a higher, government-guaranteed interest rate with quarterly payouts.',
  },
  {
    q: `Is SCSS rate higher than SBI FD rate for senior citizens?`,
    a: `SCSS currently offers ${SCSS_RATE}% p.a. SBI FD rates for 5-year tenures are typically 6.5–7% for regular citizens and around 7–7.5% for senior citizens (0.50% extra). At current levels, SCSS (${SCSS_RATE}%) is higher than even the senior citizen rate on SBI 5-year FDs. However, this can change — Govt. reviews SCSS rate quarterly.`,
  },
  {
    q: 'Can I claim 80C deduction on SCSS?',
    a: 'Yes. Deposits in SCSS qualify for Section 80C income tax deduction up to ₹1.5 lakh per financial year. This makes SCSS tax-efficient for the investment amount. However, the interest earned is fully taxable at your income tax slab rate. SBI Tax-Saving FD also qualifies for 80C but has a 5-year lock-in and cannot be broken prematurely.',
  },
  {
    q: 'What is the maximum I can invest in SCSS?',
    a: 'The maximum investment limit in SCSS is ₹30 lakh per individual (increased from ₹15 lakh in Budget 2023). This is per person — a couple can invest up to ₹60 lakh combined across separate SCSS accounts. SBI FD has no upper limit.',
  },
  {
    q: 'Which is better for a retired person — SBI FD or SCSS?',
    a: 'For most retired individuals, SCSS is the better choice: it offers a higher guaranteed rate, a quarterly payout schedule, and 80C tax benefit. SBI Senior Citizen FD is better if you need a shorter tenure (less than 5 years), or if you want to invest more than ₹30 lakh, or if you prefer monthly (rather than quarterly) income.',
  },
  {
    q: 'Can I open SCSS at SBI?',
    a: 'Yes. SCSS can be opened at all SBI branches, other authorised public sector banks, and all post offices in India. Opening at a bank branch may be more convenient if you already have a savings account there, as quarterly interest can be auto-credited.',
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

export default function FDCompareSBIvsSCSS() {
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
          { '@type': 'ListItem', position: 3, name: 'SBI FD vs SCSS', item: 'https://rupeepedia.in/compare/fd/sbi-vs-scss' },
        ],
      },
      {
        '@type': 'WebPage',
        name: 'SBI FD vs SCSS 2026 — Which is Better for Senior Citizens?',
        url:  'https://rupeepedia.in/compare/fd/sbi-vs-scss',
        description: 'Compare SBI Senior Citizen FD vs Senior Citizens Savings Scheme (SCSS). Interest rates, 80C benefits, quarterly payouts, and eligibility compared for 2026.',
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
        <title>SBI FD vs SCSS 2026 — Which is Better for Senior Citizens? | RupeePedia</title>
        <meta name="description" content={`Compare SBI Senior Citizen FD vs SCSS (Senior Citizens Savings Scheme). SCSS offers ${SCSS_RATE}% p.a. with 80C benefit. See which is better for retirement income in 2026.`} />
        <meta name="keywords" content="sbi fd vs scss, scss vs fd, senior citizens savings scheme vs fixed deposit, scss interest rate 2026, sbi senior citizen fd rate, scss or fd which is better, scss 80c benefit, scss vs bank fd retirement" />
        <link rel="canonical" href="https://rupeepedia.in/compare/fd/sbi-vs-scss" />
        <meta property="og:title"       content="SBI FD vs SCSS 2026 — Best Option for Senior Citizens | RupeePedia" />
        <meta property="og:description" content={`SCSS offers ${SCSS_RATE}% p.a. + 80C deduction. SBI FD offers flexible tenures. Compare for retirement planning.`} />
        <meta property="og:url"         content="https://rupeepedia.in/compare/fd/sbi-vs-scss" />
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
                  <span className="text-acc font-semibold">SBI FD vs SCSS</span>
                </nav>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-acc-deep rounded-2xl flex items-center justify-center flex-shrink-0 text-acc">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink tracking-tight">SBI FD vs SCSS</h1>
                    <p className="text-muted mt-1 text-sm">Senior Citizens Savings Scheme vs Fixed Deposit — 2026 comparison</p>
                  </div>
                </div>
                <p className="text-body text-base max-w-2xl">
                  For retirees choosing between a bank FD and SCSS — rates, 80C benefit, quarterly payouts, and flexibility compared.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Quick verdict banner */}
        <div className="bg-violet-500/10 border border-violet/25 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-violet-500/15 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">💡</div>
          <div>
            <div className="font-bold text-violet text-sm mb-1">Quick Verdict</div>
            <p className="text-sm text-body">
              For most senior citizens, <strong className="text-ink">SCSS is the better choice</strong> — higher guaranteed rate ({SCSS_RATE}% p.a.), 80C deduction up to ₹1.5 lakh, and government backing.
              Choose SBI Senior Citizen FD if you need a tenure shorter than 5 years, or need to invest beyond the ₹30 lakh SCSS cap.
            </p>
          </div>
        </div>

        {/* Rate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* SBI FD */}
          <div className="bg-surface rounded-2xl border border-line border-t-2 border-t-mint p-6">
            <div className="flex items-center gap-3 mb-4">
              {sbi?.bank.logoUrl
                ? <img src={sbi.bank.logoUrl} alt="SBI" className="w-10 h-10 object-contain rounded-lg border border-line" />
                : <div className="w-10 h-10 bg-mint/10 rounded-lg flex items-center justify-center text-mint font-bold">S</div>}
              <div>
                <div className="font-bold text-ink">SBI Senior Citizen FD</div>
                <div className="text-xs text-faint">State Bank of India</div>
              </div>
            </div>
            {isLoading
              ? <div className="h-16 bg-surface-2 rounded-xl animate-pulse" />
              : sbi5yr
                ? (
                  <>
                    <div className="text-3xl font-extrabold text-mint mb-1">
                      {sbi5yr.seniorRate ?? sbi5yr.rate}% p.a.
                    </div>
                    <div className="text-xs text-faint mb-1">5-year senior citizen rate</div>
                    <div className="text-xs text-muted">General rate: {sbi5yr.rate}% + 0.50% senior extra</div>
                  </>
                )
                : <div className="text-sm text-faint">Loading SBI rates… <Link to="/fd-rates" className="text-acc underline">View all rates</Link></div>}
            <div className="mt-4 space-y-1.5 text-xs text-muted">
              <div className="flex justify-between"><span>80C benefit</span><span className="font-semibold text-gold">5-yr tax-saving FD only</span></div>
              <div className="flex justify-between"><span>TDS threshold</span><span className="font-semibold text-body">₹50,000/yr (seniors)</span></div>
              <div className="flex justify-between"><span>Max investment</span><span className="font-semibold text-body">No limit</span></div>
              <div className="flex justify-between"><span>Payout options</span><span className="font-semibold text-body">Monthly / Quarterly / Maturity</span></div>
            </div>
          </div>

          {/* SCSS */}
          <div className="bg-surface rounded-2xl border border-line border-t-2 border-t-violet p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🏤</span>
              </div>
              <div>
                <div className="font-bold text-ink">SCSS</div>
                <div className="text-xs text-faint">Senior Citizens Savings Scheme — Govt. of India</div>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-violet mb-1">{SCSS_RATE}% p.a.</div>
            <div className="text-xs text-faint mb-1">w.e.f. {SCSS_DATA.effectiveFrom} (quarterly reviewed)</div>
            <div className="text-xs text-muted mb-4">Payout: Quarterly (1 Apr / 1 Jul / 1 Oct / 1 Jan)</div>
            <div className="space-y-1.5 text-xs text-muted">
              <div className="flex justify-between"><span>80C benefit</span><span className="font-semibold text-mint">Yes — up to ₹1.5 lakh</span></div>
              <div className="flex justify-between"><span>TDS threshold</span><span className="font-semibold text-body">₹50,000/yr</span></div>
              <div className="flex justify-between"><span>Max investment</span><span className="font-semibold text-violet">₹30 lakh per person</span></div>
              <div className="flex justify-between"><span>Eligibility</span><span className="font-semibold text-violet">Age 60+ only</span></div>
            </div>
          </div>
        </div>

        {/* Quarterly income illustration */}
        <div className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-lg font-bold text-ink mb-1">Quarterly Income on ₹10 Lakh</h2>
          <p className="text-xs text-faint mb-4">SCSS pays quarterly. SBI FD shown at 5-year senior citizen rate.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: 'SBI Senior Citizen FD (5 yr, quarterly payout)',
                rate: sbi5yr?.seniorRate ?? sbi5yr?.rate ?? 7.0,
                cls: 'mint',
              },
              {
                label: 'SCSS — Senior Citizens Savings Scheme',
                rate: SCSS_RATE,
                cls: 'violet',
              },
            ].map(item => {
              const quarterly = Math.round((1000000 * item.rate) / (100 * 4));
              return (
                <div key={item.label} className={`rounded-xl p-4 border ${item.cls === 'mint' ? 'bg-mint/10 border-mint/20' : 'bg-violet-500/10 border-violet/25'}`}>
                  <div className={`text-xs font-semibold mb-2 ${item.cls === 'mint' ? 'text-mint' : 'text-violet'}`}>{item.label}</div>
                  <div className={`text-2xl font-extrabold ${item.cls === 'mint' ? 'text-mint' : 'text-violet'}`}>
                    ₹{quarterly.toLocaleString('en-IN')}<span className="text-sm font-semibold">/quarter</span>
                  </div>
                  <div className="text-[11px] text-muted mt-1">≈ ₹{Math.round(quarterly / 3).toLocaleString('en-IN')}/month equivalent</div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-faint mt-3">* Illustrative only. TDS may apply if total interest exceeds ₹50,000/yr. Submit Form 15H to avoid TDS if eligible.</p>
        </div>

        {/* Safety disclaimer */}
        <div className="flex items-start gap-2 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl text-xs text-gold">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>SCSS rates are reviewed quarterly by the Government of India. Always verify the current rate before investing. Submit Form 15H at your bank/post office to prevent TDS if your total income is below the taxable limit.</span>
        </div>

        {/* Head-to-head table */}
        <div className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-lg font-bold text-ink mb-4">Full Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line text-xs font-semibold text-muted">
                  <th className="text-left py-2.5 px-4 w-1/3">Feature</th>
                  <th className="text-center py-2.5 px-4 text-mint">SBI FD</th>
                  <th className="text-center py-2.5 px-4 text-violet">SCSS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-body">
                {COMPARISON_ROWS.map(row => (
                  <tr key={row.feature} className="hover:bg-surface-2 transition-colors">
                    <td className="py-3 px-4 text-faint font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-sm">{row.sbi}</td>
                    <td className="py-3 px-4 text-center text-sm">{row.scss}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Who should choose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-mint/10 rounded-2xl p-5 border border-mint/20">
            <div className="font-bold text-mint mb-2">Choose SBI Senior Citizen FD if…</div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• Need tenure shorter than 5 years</li>
              <li>• Want to invest more than ₹30 lakh</li>
              <li>• Below age 60 (not eligible for SCSS)</li>
              <li>• Prefer monthly income (not just quarterly)</li>
              <li>• Want to ladder FDs across multiple tenures</li>
            </ul>
          </div>
          <div className="bg-violet-500/10 rounded-2xl p-5 border border-violet/25">
            <div className="font-bold text-violet mb-2">Choose SCSS if…</div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• Age 60+ (or 55+ VRS/defence retiree)</li>
              <li>• Want the highest safe rate ({SCSS_RATE}% p.a. with sovereign guarantee)</li>
              <li>• Want 80C deduction on up to ₹1.5 lakh</li>
              <li>• Comfortable with quarterly (not monthly) payout</li>
              <li>• Investing ₹30 lakh or less</li>
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
              { to: '/compare/fd/hdfc-vs-icici',          label: 'HDFC FD vs ICICI FD',        desc: 'Side-by-side rate comparison across all tenures' },
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
          SBI rates manually verified. SCSS rate as of {SCSS_DATA.effectiveFrom} — verify before investing.{' '}
          <Link to="/calculators/fd" className="text-acc hover:underline">Calculate FD maturity →</Link>
        </p>
      </div>
    </>
  );
}
