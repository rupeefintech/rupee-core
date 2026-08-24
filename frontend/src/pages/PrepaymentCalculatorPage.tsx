// File: frontend/src/pages/PrepaymentCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, PiggyBank } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';
import SliderInput from '../components/SliderInput';

type PrepayType = 'home' | 'personal';
interface Props { type?: PrepayType }

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function calcEMI(P: number, r: number, n: number) {
  if (r === 0) return P / n;
  const rm = r / 12 / 100;
  return P * rm * Math.pow(1 + rm, n) / (Math.pow(1 + rm, n) - 1);
}

export default function PrepaymentCalculatorPage({ type = 'home' }: Props) {
  const isHome = type === 'home';
  const [loanAmt,     setLoanAmt]     = useState(isHome ? 5000000 : 500000);
  const [rate,        setRate]        = useState(isHome ? 8.5 : 12.0);
  const [tenure,      setTenure]      = useState(isHome ? 20 : 5);
  const [prepayAmt,   setPrepayAmt]   = useState(isHome ? 500000 : 50000);
  const [prepayMonth, setPrepayMonth] = useState(12);
  const [openFaq,     setOpenFaq]     = useState<number | null>(null);

  const origEMI   = calcEMI(loanAmt, rate, tenure * 12);
  const origTotal = origEMI * tenure * 12;
  const origInt   = origTotal - loanAmt;

  let bal = loanAmt;
  for (let i = 0; i < prepayMonth; i++) {
    const ia = bal * rate / 12 / 100;
    const pa = Math.min(origEMI - ia, bal);
    bal = Math.max(bal - pa, 0);
  }
  const balAfterPrepay = Math.max(bal - prepayAmt, 0);

  let newMonths = 0;
  let tempBal   = balAfterPrepay;
  while (tempBal > 1 && newMonths < tenure * 12) {
    const ia = tempBal * rate / 12 / 100;
    const pa = Math.min(origEMI - ia, tempBal);
    tempBal  = Math.max(tempBal - pa, 0);
    newMonths++;
  }
  const newTotalMonths = prepayMonth + newMonths;
  const newTotal       = origEMI * newTotalMonths;
  const newInt         = newTotal - loanAmt;
  const intSaved       = origInt - newInt;
  const monthsSaved    = tenure * 12 - newTotalMonths;

  const faqs = [
    { q: 'Should I prepay my loan or invest the extra money?', a: 'Compare the loan\'s interest rate with realistic post-tax investment returns. Personal loans at 12–18% almost always beat any safe investment — prepay those first. Home loans at 8–9% are borderline: long-term equity may return more, but prepayment is a guaranteed, risk-free saving. Factor in the home-loan tax deduction (interest under Section 24b in the old regime), which lowers the effective loan cost, and never prepay out of your emergency fund.' },
    { q: 'Does prepayment reduce my EMI or my tenure?', a: 'Your choice, but banks default to reducing tenure — which is also what saves the most interest. Keeping the same EMI after prepayment means every future EMI has a bigger principal component, closing the loan years early. Reducing the EMI instead keeps the tenure and improves monthly cash flow, but saves much less interest. Choose EMI reduction only if your budget is genuinely strained.' },
    { q: 'Is there a penalty for prepaying?', a: 'For floating-rate loans to individuals — including most home loans — the RBI prohibits any prepayment or foreclosure charge. Fixed-rate loans can carry charges of 2–5% of the prepaid amount, and personal loans commonly charge 2–5% foreclosure fees, sometimes with a 6–12 month lock-in before prepayment is allowed at all. Check your sanction letter before planning.' },
    { q: 'When is the best time to prepay?', a: 'As early in the tenure as possible. EMIs are interest-heavy at the start — in the first years of a 20-year home loan, 60–70% of each EMI is interest. A prepayment in year 2 kills interest that would have been charged for the next 18 years; the same prepayment in year 15 saves relatively little. The calculator\'s "Prepay After" slider shows exactly how the savings shrink as you delay.' },
    { q: 'How much does one prepayment actually save?', a: 'More than most people expect. On a ₹50 lakh home loan at 8.5% for 20 years (EMI ≈ ₹43,400), a single ₹5 lakh prepayment at the end of year one saves roughly ₹16 lakh of interest and closes the loan about 4 years early — a guaranteed return far above any FD. Run your own numbers in the calculator above.' },
    { q: 'Are many small prepayments as good as one big one?', a: 'Yes — what matters is money hitting the principal early. Paying one extra EMI a year, or rounding your EMI up (₹43,400 → ₹50,000), quietly cuts years off the loan. Small regular prepayments are also behaviourally easier than saving up a large lump sum while paying interest in the meantime.' },
    { q: 'Does prepaying a home loan affect my tax deductions?', a: 'In the old regime you deduct home-loan interest up to ₹2 lakh a year (Section 24b) and principal within 80C. Prepaying reduces future interest, which reduces that deduction — but the deduction only refunds your slab rate (~31% at most) of interest you actually paid. Saving 100% of the interest beats recovering 31% of it. In the new regime there is no deduction for a self-occupied house, so prepayment is a pure win.' },
    { q: 'Does prepayment help my credit score?', a: 'A prepayment that reduces outstanding balance lowers your credit utilisation and is neutral-to-positive. Full foreclosure closes the account — the score effect is minor either way. Never keep a loan running just for the credit history; the interest cost dwarfs any score benefit.' },
    { q: 'Is there a minimum prepayment amount?', a: 'Most lenders require part-prepayments to be at least 1–3 times the EMI, and some cap the number of free part-payments per year (common on personal loans). Home loan part-payments through internet banking are usually instant; some banks still want a branch visit for foreclosure. Ask for an updated amortisation schedule after every prepayment.' },
    { q: 'Should I break an FD or redeem investments to prepay?', a: 'Compare after-tax returns. An FD earning 7% taxed at 30% yields ~4.9% — clearly worse than saving 8.5% loan interest, so using a maturing FD to prepay usually wins. Long-term equity at 12%+ expected returns generally beats prepaying a home loan, but not a personal loan. Keep 6 months of expenses liquid regardless.' },
    { q: 'How does this prepayment calculator work?', a: 'It builds the loan\'s amortisation schedule month by month: EMI from the standard formula, interest on the outstanding balance each month, then applies your lump-sum prepayment in the month you choose while keeping the EMI unchanged. The result is the new closure date, and interest saved is the difference between total payments in the original and new schedules.' },
  ];

  return (
    <>
      <Helmet>
        <title>{isHome ? 'Home' : 'Personal'} Loan Prepayment Calculator 2026 | RupeePedia</title>
        <meta name="description" content={`Calculate how much interest you save by prepaying your ${isHome ? 'home' : 'personal'} loan. See months saved and total interest saved.`} />
        <link rel="canonical" href={`https://rupeepedia.in/calculators/${isHome ? 'home-prepayment' : 'personal-prepayment'}`} />
        <meta property="og:title" content={`${isHome ? 'Home' : 'Personal'} Loan Prepayment Calculator 2026 | RupeePedia`} />
        <meta property="og:description" content={`Calculate how much interest you save by prepaying your ${isHome ? 'home' : 'personal'} loan. See months saved and total interest saved.`} />
        <meta property="og:url" content={`https://rupeepedia.in/calculators/${isHome ? 'home-prepayment' : 'personal-prepayment'}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${isHome ? 'Home' : 'Personal'} Loan Prepayment Calculator 2026 | RupeePedia`} />
        <meta name="twitter:description" content={`Calculate how much interest you save by prepaying your ${isHome ? 'home' : 'personal'} loan. See months saved and total interest saved.`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: `${isHome ? 'Home' : 'Personal'} Loan Prepayment Calculator`,
          url: `https://rupeepedia.in/calculators/${isHome ? 'home-prepayment' : 'personal-prepayment'}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: `Free calculator showing interest saved and months cut when you make a lump-sum prepayment on a ${isHome ? 'home' : 'personal'} loan, using a month-by-month amortisation schedule.`,
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://rupeepedia.in/calculators' },
            { '@type': 'ListItem', position: 3, name: `${isHome ? 'Home' : 'Personal'} Loan Prepayment Calculator`, item: `https://rupeepedia.in/calculators/${isHome ? 'home-prepayment' : 'personal-prepayment'}` },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-bg">
        <CalculatorHero
          crumb="Prepayment"
          title={`${isHome ? 'Home' : 'Personal'} Loan Prepayment`}
          accent="Calculator"
          subtitle="Interest saved and months cut off by a lump sum prepayment."
          icon={PiggyBank}
          widthClass="max-w-4xl"
        />

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-surface rounded-[13px] border border-line border-l-4 border-l-acc p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SliderInput
                  label="Loan Amount"
                  value={loanAmt} min={isHome ? 500000 : 50000} max={isHome ? 10000000 : 4000000} step={isHome ? 50000 : 10000}
                  display={fmtINR(loanAmt)}
                  onChange={setLoanAmt}
                  parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))}
                  color="blue"
                  isZero={loanAmt === 0}
                />
                <SliderInput
                  label="Interest Rate (p.a.)"
                  value={rate} min={5} max={24} step={0.1}
                  display={`${rate.toFixed(1)}%`}
                  onChange={setRate}
                  color="blue"
                />
                <SliderInput
                  label="Loan Tenure"
                  value={tenure} min={1} max={isHome ? 30 : 7} step={1}
                  display={`${tenure} Yr`}
                  onChange={setTenure}
                  color="blue"
                />
                <SliderInput
                  label="Prepayment Amount"
                  value={prepayAmt} min={isHome ? 50000 : 5000} max={isHome ? 2000000 : 200000} step={isHome ? 50000 : 5000}
                  display={fmtINR(prepayAmt)}
                  onChange={setPrepayAmt}
                  parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))}
                  color="blue"
                  isZero={prepayAmt === 0}
                />
                <SliderInput
                  label="Prepay After"
                  value={prepayMonth} min={1} max={Math.max(tenure * 12 - 1, 1)} step={1}
                  display={`Month ${prepayMonth}`}
                  onChange={setPrepayMonth}
                  color="blue"
                />
              </div>

              <div className="bg-gradient-to-br from-acc-deep to-surface border border-acc/25 rounded-[13px] p-5 text-ink flex flex-col gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted font-semibold mb-1">Interest Saved</div>
                  <div className="text-3xl font-bold tracking-tight text-mint">{fmtShort(Math.max(intSaved, 0))}</div>
                </div>
                <hr className="border-line" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-2 rounded-lg p-3">
                    <div className="text-xs text-muted mb-1">Months Saved</div>
                    <div className="text-2xl font-bold text-ink">{Math.max(monthsSaved, 0)}</div>
                    <div className="text-xs text-faint">{Math.floor(Math.max(monthsSaved, 0) / 12)}y {Math.max(monthsSaved, 0) % 12}m early</div>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <div className="text-xs text-muted mb-1">New Closure</div>
                    <div className="text-lg font-bold text-ink">{Math.floor(newTotalMonths / 12)}y {newTotalMonths % 12}m</div>
                    <div className="text-xs text-faint">vs {tenure}y 0m original</div>
                  </div>
                </div>
                <hr className="border-line" />
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Original Interest</span><span className="font-bold text-ink">{fmtShort(origInt)}</span></div>
                  <div className="flex justify-between"><span className="text-muted">New Interest</span><span className="font-bold text-mint">{fmtShort(Math.max(newInt, 0))}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Monthly EMI</span><span className="font-bold text-ink">{fmtINR(origEMI)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Article (always in DOM for SEO) ── */}
          <article className="bg-surface rounded-[13px] border border-line p-6 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Why prepaying early saves so much interest</h2>
              <div className="text-sm text-muted space-y-3 leading-relaxed">
                <p>
                  Loan EMIs are <strong>interest-heavy at the start</strong>. Interest each month is charged on the entire
                  outstanding balance, so early in a {isHome ? '20-year home loan' : '5-year personal loan'} most of your EMI
                  services interest and only a sliver reduces principal. A lump-sum prepayment cuts the balance directly —
                  and every future month's interest is computed on that smaller balance, for the rest of the tenure.
                </p>
                <p>
                  That's why timing dominates: the same prepayment made in month 12 saves several times more interest
                  than in the final years, when the balance is already small and most interest has been paid. It is also
                  why keeping your <strong>EMI unchanged and shortening the tenure</strong> (the default in this calculator)
                  saves far more than lowering the EMI: the unchanged EMI attacks principal harder every month after the
                  prepayment.
                </p>
                <p>
                  With your current inputs — {fmtShort(loanAmt)} at {rate.toFixed(1)}% for {tenure} years, prepaying {fmtShort(prepayAmt)} in
                  month {prepayMonth} — you save <strong>{fmtShort(Math.max(intSaved, 0))}</strong> of interest and close the loan{' '}
                  <strong>{Math.floor(Math.max(monthsSaved, 0) / 12)} years {Math.max(monthsSaved, 0) % 12} months early</strong>. Interest saved is a
                  guaranteed, tax-free, risk-free return of {rate.toFixed(1)}% — compare that honestly with what the same money would earn invested.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Reduce tenure vs reduce EMI</h2>
              <div className="overflow-x-auto rounded-lg border border-line max-h-[340px] overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-2 sticky top-0">
                      <th className="text-left px-4 py-2.5 font-semibold text-muted">After prepayment…</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted">Reduce tenure (recommended)</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted">Reduce EMI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Monthly outgo', 'Unchanged', 'Lower'],
                      ['Interest saved', 'Maximum', 'Much less'],
                      ['Loan closes', 'Years earlier', 'On original date'],
                      ['Best for', 'Anyone who can afford the current EMI', 'Genuinely strained monthly budgets'],
                    ].map(([f, a, b]) => (
                      <tr key={f} className="border-t border-line">
                        <td className="px-4 py-2.5 font-semibold text-body">{f}</td>
                        <td className="px-4 py-2.5 text-mint">{a}</td>
                        <td className="px-4 py-2.5 text-muted">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Checklist before you prepay</h2>
              <ul className="text-sm text-muted space-y-2">
                {[
                  ['Emergency fund intact?', 'Keep 6 months of expenses liquid. Prepayment is irreversible — the bank won\'t give the money back if you lose your job next month.'],
                  ['Costlier debt first', 'Credit card balances (36–42%) and personal loans (12–18%) always come before a home loan (8–9%).'],
                  [isHome ? 'Check the rate type' : 'Check foreclosure charges', isHome ? 'Floating-rate home loans have zero prepayment charges by RBI rule; fixed-rate loans may charge 2–5%.' : 'Personal loans commonly charge 2–5% foreclosure fees and may lock prepayment for the first 6–12 months.'],
                  ['Get the updated schedule', 'After prepaying, collect a fresh amortisation schedule and confirm the outstanding balance and new closure date in writing.'],
                  ['Tell the bank: reduce tenure', 'If you don\'t specify, some lenders reduce the EMI instead, which quietly costs you most of the benefit.'],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="text-acc font-bold flex-shrink-0">✓</span>
                    <span><strong className="text-body">{t}</strong> {d}</span>
                  </li>
                ))}
              </ul>
            </section>
          </article>

          {/* FAQ */}
          <div className="bg-surface rounded-[13px] border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-line rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-body hover:bg-surface-2">
                    <span>{faq.q}</span>
                    <span className={`text-faint text-xs ml-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {/* Always mounted so content stays in the DOM for search engines */}
                  <div className={`px-4 pb-4 pt-2 text-sm text-muted leading-relaxed border-t border-line ${openFaq === i ? '' : 'hidden'}`}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Related tools */}
          <div className="bg-surface rounded-[13px] border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Related calculators</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {(isHome ? [
                { path: '/calculators/home-loan-emi', label: 'Home Loan EMI Calculator', desc: 'EMI, interest and amortisation schedule' },
                { path: '/calculators/home-loan-eligibility', label: 'Home Loan Eligibility', desc: 'How much loan your income supports' },
                { path: '/calculators/personal-prepayment', label: 'Personal Loan Prepayment', desc: 'Same analysis for personal loans' },
                { path: '/calculators/income-tax', label: 'Income Tax Calculator', desc: 'Check the Section 24b deduction impact' },
              ] : [
                { path: '/calculators/personal-loan-emi', label: 'Personal Loan EMI Calculator', desc: 'EMI, interest and amortisation schedule' },
                { path: '/calculators/personal-loan-eligibility', label: 'Personal Loan Eligibility', desc: 'How much loan your income supports' },
                { path: '/calculators/home-prepayment', label: 'Home Loan Prepayment', desc: 'Same analysis for home loans' },
                { path: '/calculators/emi', label: 'EMI Calculator', desc: 'Generic loan EMI calculator' },
              ]).map(t => (
                <Link key={t.path} to={t.path} className="border border-line rounded-lg p-4 hover:border-acc transition group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-body group-hover:text-acc transition">{t.label}</span>
                    <ArrowRight size={14} className="text-faint group-hover:text-acc transition flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-faint mt-1">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
