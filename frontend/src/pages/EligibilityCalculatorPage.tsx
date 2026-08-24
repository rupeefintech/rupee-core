import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';
import SliderInput from '../components/SliderInput';

type EligType = 'home' | 'personal';
interface Props { type?: EligType }

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

const HOME_LENDERS = [
  { name: 'HDFC Bank',          rate: 'From 8.50% p.a.', note: 'Up to 90% of property value',    tag: 'Most Popular', url: 'https://www.hdfc.com/home-loans?utm_source=rupeepedia&utm_medium=calc&utm_campaign=home_elig' },
  { name: 'SBI Home Loans',     rate: 'From 8.50% p.a.', note: 'Government bank, lowest rates',  tag: '',             url: 'https://homeloans.sbi/?utm_source=rupeepedia&utm_medium=calc&utm_campaign=home_elig' },
  { name: 'LIC Housing Finance',rate: 'From 8.65% p.a.', note: 'Tenure up to 30 years',          tag: '',             url: 'https://www.lichousing.com/?utm_source=rupeepedia&utm_medium=calc&utm_campaign=home_elig' },
];

const PERSONAL_LENDERS = [
  { name: 'MoneyView', rate: 'From 1.33% p.m.', note: 'Instant approval, 100% online',   tag: 'Recommended', url: 'https://moneyview.in/loan?utm_source=rupeepedia&utm_medium=calc&utm_campaign=personal_elig' },
  { name: 'KreditBee', rate: 'From 1.02% p.m.', note: 'Disbursal in under 10 minutes',   tag: '',             url: 'https://kreditbee.in/?utm_source=rupeepedia&utm_medium=calc&utm_campaign=personal_elig' },
  { name: 'PaySense',  rate: 'From 1.40% p.m.', note: 'No prepayment charges',           tag: '',             url: 'https://www.paysense.in/?utm_source=rupeepedia&utm_medium=calc&utm_campaign=personal_elig' },
];

const IMPROVE_TIPS = [
  { icon: '📉', title: 'Clear existing loans',   desc: 'Prepay or close small loans to lower your FOIR.' },
  { icon: '👥', title: 'Add a co-applicant',     desc: 'Joint application with spouse or parent raises combined eligibility.' },
  { icon: '⏳', title: 'Increase loan tenure',   desc: 'Longer tenure reduces EMI burden and improves eligibility.' },
  { icon: '📈', title: 'Improve CIBIL score',    desc: 'A score of 750+ unlocks higher limits and better interest rates.' },
];

export default function EligibilityCalculatorPage({ type = 'home' }: Props) {
  const isHome = type === 'home';
  const [income,      setIncome]      = useState(75000);
  const [obligations, setObligations] = useState(10000);
  const [rate,        setRate]        = useState(isHome ? 8.5 : 12.0);
  const [tenure,      setTenure]      = useState(isHome ? 20 : 5);
  const [openFaq,     setOpenFaq]     = useState<number | null>(null);

  const maxEMI  = income * 0.50 - obligations;
  const r       = rate / 12 / 100;
  const n       = tenure * 12;
  const maxLoan = maxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  const foir    = Math.round((obligations / income) * 100);
  const eligible = maxLoan > 0;
  const lenders  = isHome ? HOME_LENDERS : PERSONAL_LENDERS;

  const faqs = [
    { q: 'How do banks calculate loan eligibility?', a: 'Banks primarily use FOIR (Fixed Obligation to Income Ratio): all your EMIs — existing plus the proposed loan — should not exceed 40–55% of gross monthly income. From your affordable EMI, the maximum loan is back-calculated using the interest rate and tenure (the same annuity formula this calculator uses). On top of the FOIR math, lenders layer credit score, employment stability, age, and — for home loans — the property\'s value (LTV limits).' },
    { q: 'What is FOIR?', a: 'FOIR (Fixed Obligation to Income Ratio) is the percentage of monthly income already committed to fixed obligations like EMIs and rent. If you earn ₹1 lakh and pay ₹20,000 in EMIs, your FOIR is 20%. Most banks cap total FOIR (including the new EMI) at 40–50% for average incomes, stretching to 55–65% for high earners. Cross the cap and the loan is rejected or the amount reduced.' },
    { q: `How much ${isHome ? 'home' : 'personal'} loan can I get on my salary?`, a: isHome ? 'Rough rule: about 60 times your net monthly salary for a 20-year home loan at current rates, if you have no other EMIs. On ₹75,000/month that is roughly ₹45–50 lakh. Longer tenure, a co-applicant, or fewer obligations push it up; the bank also caps the loan at 75–90% of the property value (LTV), whichever is lower.' : 'Personal loans typically max out at 20–24 times net monthly salary, subject to FOIR. On ₹75,000/month with no other EMIs, that is roughly ₹15–18 lakh over 5 years. Shorter tenures and existing EMIs reduce it sharply; premium salary-account holders often get pre-approved offers at the upper end.' },
    { q: 'Does my credit score affect eligibility?', a: 'Heavily. A CIBIL score of 750+ gets the best rates and the full FOIR-based amount. 700–750 usually passes with slightly higher rates. 650–700 means reduced amounts and rate premiums. Below 650, most mainstream lenders decline. Score matters more for personal loans (unsecured) than home loans (property-backed).' },
    { q: 'What income do banks count?', a: 'Net monthly salary is the base. Most lenders add: 100% of a co-applicant\'s salary, rental income (usually 70–80% of it), and a portion of regular bonus or incentives (often 50%). Not counted: one-time income, most cash income, and income without documentation. Self-employed applicants are assessed on 2–3 years of ITR-declared profit instead.' },
    { q: 'Can I improve my loan eligibility?', a: 'Five levers, in order of impact: (1) add an earning co-applicant — combined income can nearly double eligibility; (2) close or prepay existing loans to cut FOIR; (3) stretch the tenure — lower EMI per lakh borrowed means a bigger loan for the same FOIR; (4) lift your CIBIL score above 750 before applying; (5) document all income sources including rent and bonuses.' },
    { q: 'How does age affect eligibility?', a: `Lenders want the loan closed before retirement (typically age 60–65 for salaried, 65–70 for self-employed). A 45-year-old applying for a ${isHome ? '20-year home loan may be capped at 15 years' : '5-year personal loan is usually fine, but a 58-year-old is not'} — and a shorter maximum tenure means a higher EMI per lakh, which shrinks the eligible amount under the same FOIR.` },
    { q: 'What documents are needed?', a: 'Salaried: PAN, Aadhaar, last 3 months\' salary slips, 6 months\' bank statements, Form 16 or ITR. Self-employed: PAN, Aadhaar, 2–3 years of ITRs with computation, bank statements, and business proof (GST registration, licences). Home loans additionally need the complete property document chain, sale agreement and approved plan.' },
    { q: 'Are self-employed applicants eligible?', a: 'Yes, assessed differently: banks average the last 2–3 years of net profit from ITRs instead of salary slips, and typically apply stricter FOIR and higher rates. Stable or rising declared income, clean GST filings, and banking turnover matching the ITR strengthen the case. Under-declaring income to save tax is the single biggest reason self-employed eligibility disappoints.' },
    { q: 'Why do banks reject applications despite sufficient income?', a: 'Common reasons: credit report issues (missed payments, settled accounts, too many recent enquiries), unstable employment (frequent job changes, probation), unserviceable pin codes, high existing credit card utilisation, income not matching bank credits, or — for home loans — legal/technical problems with the property itself. The FOIR math is necessary but not sufficient.' },
    { q: 'Does checking my eligibility hurt my credit score?', a: 'Using calculators like this one — never; nothing is reported. A lender\'s "soft" pre-approval check also does not affect the score. Only formal applications trigger "hard" enquiries, and several hard enquiries within a few months makes you look credit-hungry and can shave points. Shortlist first with calculators, then apply to one or two lenders.' },
    { q: 'How accurate is this calculator?', a: 'It applies the standard 50% FOIR rule and the exact annuity formula banks use to convert affordable EMI into a loan amount, so it lands close to real sanctions for clean profiles. Actual offers vary with the lender\'s FOIR policy (40–65%), your credit score, employer category and property specifics — treat the result as a reliable planning number, not a sanction letter.' },
  ];

  return (
    <>
      <Helmet>
        <title>{isHome ? 'Home' : 'Personal'} Loan Eligibility Calculator 2026 | RupeePedia</title>
        <meta name="description" content={`Check your ${isHome ? 'home' : 'personal'} loan eligibility instantly. Know the maximum loan amount you can get based on your income and existing obligations.`} />
        <link rel="canonical" href={`https://rupeepedia.in/calculators/${isHome ? 'home-loan-eligibility' : 'personal-loan-eligibility'}`} />
        <meta property="og:title" content={`${isHome ? 'Home' : 'Personal'} Loan Eligibility Calculator 2026 | RupeePedia`} />
        <meta property="og:description" content={`Check your ${isHome ? 'home' : 'personal'} loan eligibility instantly. Know the maximum loan amount you can get based on your income and existing obligations.`} />
        <meta property="og:url" content={`https://rupeepedia.in/calculators/${isHome ? 'home-loan-eligibility' : 'personal-loan-eligibility'}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${isHome ? 'Home' : 'Personal'} Loan Eligibility Calculator 2026 | RupeePedia`} />
        <meta name="twitter:description" content={`Check your ${isHome ? 'home' : 'personal'} loan eligibility instantly. Know the maximum loan amount you can get based on your income and existing obligations.`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: `${isHome ? 'Home' : 'Personal'} Loan Eligibility Calculator`,
          url: `https://rupeepedia.in/calculators/${isHome ? 'home-loan-eligibility' : 'personal-loan-eligibility'}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: `Free ${isHome ? 'home' : 'personal'} loan eligibility calculator using the FOIR method banks apply — maximum loan amount from your income, existing EMIs, rate and tenure.`,
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
            { '@type': 'ListItem', position: 3, name: `${isHome ? 'Home' : 'Personal'} Loan Eligibility Calculator`, item: `https://rupeepedia.in/calculators/${isHome ? 'home-loan-eligibility' : 'personal-loan-eligibility'}` },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-bg">
        <CalculatorHero
          crumb="Eligibility"
          title={`${isHome ? 'Home' : 'Personal'} Loan Eligibility`}
          accent="Calculator"
          subtitle="Maximum loan amount your monthly income qualifies for."
          icon={BadgeCheck}
          widthClass="max-w-4xl"
        />

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Calculator card */}
          <div className="bg-surface rounded-[13px] border border-line border-l-4 border-l-acc p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SliderInput label="Net Monthly Income"        value={income}      min={10000} max={500000}           step={5000} display={fmtINR(income)}           onChange={setIncome}      parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" isZero={income === 0} />
                <SliderInput label="Existing EMI Obligations"  value={obligations} min={0}     max={200000}           step={1000} display={fmtINR(obligations)}       onChange={setObligations} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" />
                <SliderInput label="Interest Rate (p.a.)"      value={rate}        min={isHome ? 7 : 10} max={24}    step={0.1}  display={`${rate.toFixed(1)}%`}     onChange={setRate}        color="blue" />
                <SliderInput label="Loan Tenure"               value={tenure}      min={1}     max={isHome ? 30 : 7}  step={1}    display={`${tenure} Yr`}            onChange={setTenure}      color="blue" />
              </div>

              <div className="bg-gradient-to-br from-acc-deep to-surface border border-acc/25 rounded-[13px] p-5 text-ink flex flex-col gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted font-semibold mb-1">Maximum Loan Eligibility</div>
                  <div className="text-3xl font-bold tracking-tight text-ink">{eligible ? fmtShort(maxLoan) : 'Not Eligible'}</div>
                </div>
                <hr className="border-line" />
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Max Affordable EMI</span><span className="font-bold text-ink">{fmtINR(Math.max(maxEMI, 0))}</span></div>
                  <div className="flex justify-between"><span className="text-muted">At Interest Rate</span><span className="font-bold text-ink">{rate.toFixed(1)}% p.a.</span></div>
                  <div className="flex justify-between"><span className="text-muted">For Tenure</span><span className="font-bold text-ink">{tenure} years</span></div>
                </div>
                <hr className="border-line" />
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted">FOIR (Current obligations)</span>
                    <span className="font-bold text-ink">{foir}%</span>
                  </div>
                  <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${foir > 50 ? 'bg-coral' : 'bg-acc/60'}`} style={{ width: `${Math.min(foir, 100)}%` }} />
                  </div>
                  <div className="text-xs text-muted mt-1">{foir > 50 ? '⚠ High FOIR — may affect approval' : '✓ Healthy FOIR'}</div>
                </div>
                <div className={`text-xs rounded-lg p-2 ${maxEMI <= 0 ? 'bg-coral/20 text-coral' : 'bg-surface-2 text-body'}`}>
                  {maxEMI <= 0
                    ? '⚠ Existing obligations exceed 50% of income. Clear some loans first.'
                    : `✓ You can afford ₹${Math.round(maxEMI).toLocaleString('en-IN')} more in EMI`}
                </div>
              </div>
            </div>
          </div>

          {/* Affiliate CTA — eligible */}
          {eligible && (
            <div className="bg-surface rounded-[13px] border border-line p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-ink">
                  Apply for your {isHome ? 'Home' : 'Personal'} Loan
                </h2>
                <span className="text-[10px] text-faint font-semibold uppercase tracking-wider">Sponsored</span>
              </div>
              <p className="text-sm text-muted mb-5">
                You are eligible for up to <span className="font-bold text-acc">{fmtShort(maxLoan)}</span>. Compare top lenders and apply online in minutes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {lenders.map(l => (
                  <a
                    key={l.name}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="relative flex flex-col gap-3 border border-line rounded-xl p-4 hover:border-acc transition-all group"
                  >
                    {l.tag && (
                      <span className="absolute -top-2.5 left-3 bg-acc text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {l.tag}
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-body text-sm">{l.name}</p>
                      <p className="text-acc font-semibold text-sm mt-0.5">{l.rate}</p>
                      <p className="text-xs text-faint mt-1">{l.note}</p>
                    </div>
                    <span className="mt-auto inline-flex items-center justify-center gap-1 bg-acc group-hover:bg-acc-2 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                      Check Eligibility →
                    </span>
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-faint mt-4">
                * Interest rates are indicative. Final rates depend on your credit score, income, and lender policy. Rupeepedia may earn a referral fee when you apply.
              </p>
            </div>
          )}

          {/* Improve eligibility tips — not eligible */}
          {!eligible && (
            <div className="bg-surface rounded-[13px] border border-line p-6">
              <h2 className="text-lg font-bold text-ink mb-1">How to Improve Your Eligibility</h2>
              <p className="text-sm text-muted mb-5">Your current obligations are too high. Try these steps to qualify.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {IMPROVE_TIPS.map(t => (
                  <div key={t.title} className="flex gap-3 p-4 rounded-xl bg-surface-2 border border-line">
                    <span className="text-2xl leading-none mt-0.5">{t.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-body">{t.title}</p>
                      <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-sm text-muted mb-3">Once you improve your profile, check eligibility with these lenders:</p>
                <div className="flex flex-wrap gap-3">
                  {lenders.map(l => (
                    <a
                      key={l.name}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="text-xs font-semibold text-acc border border-acc/30 rounded-lg px-3 py-2 hover:bg-acc-deep transition-colors"
                    >
                      {l.name} →
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Article (always in DOM for SEO) ── */}
          <article className="bg-surface rounded-[13px] border border-line p-6 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-ink mb-3">How banks decide your {isHome ? 'home' : 'personal'} loan eligibility</h2>
              <div className="text-sm text-muted space-y-3 leading-relaxed">
                <p>
                  Every lender starts from the same question: <strong>what EMI can this applicant safely pay?</strong> The
                  standard yardstick is <strong>FOIR</strong> — Fixed Obligation to Income Ratio. Add up all your committed
                  monthly payments (existing EMIs plus the proposed one) and they should stay within roughly
                  40–55% of gross monthly income. Whatever EMI room is left after your current obligations becomes
                  your maximum affordable EMI, and the loan amount is simply that EMI run backwards through the
                  interest rate and tenure.
                </p>
                <p>
                  That is why the four sliders above are the four levers that matter: income and obligations set the
                  EMI room, while <strong>rate and tenure decide how much loan each rupee of EMI buys</strong>. At 8.5% for
                  20 years, ₹1,000 of EMI supports about ₹1.15 lakh of home loan; at 12% for 5 years, the same ₹1,000
                  supports only about ₹45,000 of personal loan. Stretching tenure is the quickest legitimate way to
                  raise eligibility — at the cost of more total interest.
                </p>
                <p>
                  The FOIR result is then filtered through credit score, employment profile and age{isHome ? ', and capped by the property: RBI LTV rules limit home loans to 75–90% of the property value depending on ticket size' : ''}. Two
                  applicants with identical salaries can get very different sanctions because of these filters.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Eligibility at a glance — {isHome ? 'home' : 'personal'} loan on different salaries</h2>
              <p className="text-xs text-faint mb-3">Assuming no existing EMIs, {rate.toFixed(1)}% p.a., {tenure}-year tenure, 50% FOIR — computed with the same formula as the calculator.</p>
              <div className="overflow-x-auto rounded-lg border border-line max-h-[340px] overflow-y-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-2 sticky top-0">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Net monthly income</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted">Max EMI (50%)</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted">Eligible loan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[30000, 50000, 75000, 100000, 150000, 200000].map(inc => {
                      const emi = inc * 0.5;
                      const loan = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
                      return (
                        <tr key={inc} className={`border-t border-line ${inc === income ? 'bg-acc-deep' : ''}`}>
                          <td className="px-4 py-2.5 font-bold text-acc">{fmtINR(inc)}</td>
                          <td className="px-4 py-2.5 text-right text-muted">{fmtINR(emi)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-ink">{fmtShort(loan)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                { path: '/calculators/home-loan-emi', label: 'Home Loan EMI Calculator', desc: 'EMI and amortisation for the amount you qualify for' },
                { path: '/calculators/home-prepayment', label: 'Home Loan Prepayment', desc: 'Interest saved by prepaying early' },
                { path: '/calculators/personal-loan-eligibility', label: 'Personal Loan Eligibility', desc: 'Same check for personal loans' },
                { path: '/calculators/salary-calculator', label: 'Salary Calculator', desc: 'Know your exact net monthly income' },
              ] : [
                { path: '/calculators/personal-loan-emi', label: 'Personal Loan EMI Calculator', desc: 'EMI and amortisation for the amount you qualify for' },
                { path: '/calculators/personal-prepayment', label: 'Personal Loan Prepayment', desc: 'Interest saved by closing early' },
                { path: '/calculators/home-loan-eligibility', label: 'Home Loan Eligibility', desc: 'Same check for home loans' },
                { path: '/calculators/salary-calculator', label: 'Salary Calculator', desc: 'Know your exact net monthly income' },
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
