import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
    { q: 'How do banks calculate loan eligibility?', a: 'Banks primarily use FOIR (Fixed Obligation to Income Ratio). Total EMIs (including proposed loan) should not exceed 40–50% of gross monthly income. Your credit score, employer profile, and age also matter.' },
    { q: 'What is FOIR?', a: 'FOIR (Fixed Obligation to Income Ratio) is the percentage of your income going toward loan EMIs. Most banks allow FOIR of 40–55%. If your FOIR exceeds this, your loan may be rejected or the amount reduced.' },
    { q: 'Does my credit score affect eligibility?', a: 'Yes significantly. A CIBIL score of 750+ gets you the best rates and higher eligibility. Below 650, most banks will reject the application. A score of 650–750 may get approval with higher rates.' },
    { q: 'Can I improve my loan eligibility?', a: 'Yes: (1) Add a co-applicant with income, (2) Clear existing loans to reduce FOIR, (3) Increase tenure to reduce EMI burden, (4) Improve CIBIL score by clearing dues, (5) Show additional income sources.' },
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50">
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">{isHome ? 'Home' : 'Personal'} Loan Eligibility Calculator</h1>
          <p className="text-brand-100 text-sm max-w-md mx-auto">Find out the maximum loan amount you are eligible for based on your monthly income.</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Calculator card */}
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-brand-600 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SliderInput label="Net Monthly Income"        value={income}      min={10000} max={500000}           step={5000} display={fmtINR(income)}           onChange={setIncome}      parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" isZero={income === 0} />
                <SliderInput label="Existing EMI Obligations"  value={obligations} min={0}     max={200000}           step={1000} display={fmtINR(obligations)}       onChange={setObligations} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" />
                <SliderInput label="Interest Rate (p.a.)"      value={rate}        min={isHome ? 7 : 10} max={24}    step={0.1}  display={`${rate.toFixed(1)}%`}     onChange={setRate}        color="blue" />
                <SliderInput label="Loan Tenure"               value={tenure}      min={1}     max={isHome ? 30 : 7}  step={1}    display={`${tenure} Yr`}            onChange={setTenure}      color="blue" />
              </div>

              <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-lg p-5 text-white flex flex-col gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">Maximum Loan Eligibility</div>
                  <div className="text-3xl font-bold tracking-tight">{eligible ? fmtShort(maxLoan) : 'Not Eligible'}</div>
                </div>
                <hr className="border-white/20" />
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="opacity-80">Max Affordable EMI</span><span className="font-bold">{fmtINR(Math.max(maxEMI, 0))}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">At Interest Rate</span><span className="font-bold">{rate.toFixed(1)}% p.a.</span></div>
                  <div className="flex justify-between"><span className="opacity-80">For Tenure</span><span className="font-bold">{tenure} years</span></div>
                </div>
                <hr className="border-white/20" />
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="opacity-70">FOIR (Current obligations)</span>
                    <span className="font-bold">{foir}%</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${foir > 50 ? 'bg-red-400' : 'bg-white/60'}`} style={{ width: `${Math.min(foir, 100)}%` }} />
                  </div>
                  <div className="text-xs opacity-60 mt-1">{foir > 50 ? '⚠ High FOIR — may affect approval' : '✓ Healthy FOIR'}</div>
                </div>
                <div className={`text-xs rounded-lg p-2 ${maxEMI <= 0 ? 'bg-red-400/30' : 'bg-white/10'}`}>
                  {maxEMI <= 0
                    ? '⚠ Existing obligations exceed 50% of income. Clear some loans first.'
                    : `✓ You can afford ₹${Math.round(maxEMI).toLocaleString('en-IN')} more in EMI`}
                </div>
              </div>
            </div>
          </div>

          {/* Affiliate CTA — eligible */}
          {eligible && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-slate-900">
                  Apply for your {isHome ? 'Home' : 'Personal'} Loan
                </h2>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sponsored</span>
              </div>
              <p className="text-sm text-slate-500 mb-5">
                You are eligible for up to <span className="font-bold text-brand-700">{fmtShort(maxLoan)}</span>. Compare top lenders and apply online in minutes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {lenders.map(l => (
                  <a
                    key={l.name}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="relative flex flex-col gap-3 border border-slate-200 rounded-xl p-4 hover:border-brand-400 hover:shadow-md transition-all group"
                  >
                    {l.tag && (
                      <span className="absolute -top-2.5 left-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {l.tag}
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{l.name}</p>
                      <p className="text-brand-700 font-semibold text-sm mt-0.5">{l.rate}</p>
                      <p className="text-xs text-slate-400 mt-1">{l.note}</p>
                    </div>
                    <span className="mt-auto inline-flex items-center justify-center gap-1 bg-brand-700 group-hover:bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                      Check Eligibility →
                    </span>
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                * Interest rates are indicative. Final rates depend on your credit score, income, and lender policy. Rupeepedia may earn a referral fee when you apply.
              </p>
            </div>
          )}

          {/* Improve eligibility tips — not eligible */}
          {!eligible && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-1">How to Improve Your Eligibility</h2>
              <p className="text-sm text-slate-500 mb-5">Your current obligations are too high. Try these steps to qualify.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {IMPROVE_TIPS.map(t => (
                  <div key={t.title} className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-2xl leading-none mt-0.5">{t.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{t.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500 mb-3">Once you improve your profile, check eligibility with these lenders:</p>
                <div className="flex flex-wrap gap-3">
                  {lenders.map(l => (
                    <a
                      key={l.name}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="text-xs font-semibold text-brand-700 border border-brand-200 rounded-lg px-3 py-2 hover:bg-brand-50 transition-colors"
                    >
                      {l.name} →
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    <span>{faq.q}</span>
                    <span className={`text-slate-400 text-xs ml-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openFaq === i && <div className="px-4 pb-4 pt-2 text-sm text-slate-500 leading-relaxed border-t border-slate-50">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
