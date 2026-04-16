// File: frontend/src/pages/PrepaymentCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
    { q: 'Should I prepay or invest the extra money?', a: 'If your loan rate is higher than expected investment returns, prepay. Home loans at 8.5% vs equity returns of 12%+ — invest. Personal loans at 15%+ — prepay first. Also factor in tax benefits on home loan interest.' },
    { q: 'Does prepayment reduce EMI or tenure?', a: 'Most banks default to reducing tenure (saving maximum interest). Some allow you to choose. Reducing tenure saves more interest; reducing EMI improves monthly cash flow.' },
    { q: 'Is there a penalty for prepayment?', a: 'For floating rate home loans — RBI mandates zero prepayment penalty. For fixed rate loans (personal, car) — banks may charge 1–5% of prepaid amount. Check your loan agreement.' },
    { q: 'What is the best time to prepay?', a: 'The earlier, the better. In the first few years, most of your EMI goes toward interest. Prepaying early reduces the principal on which future interest is calculated, maximizing your savings.' },
  ];

  return (
    <>
      <Helmet>
        <title>{isHome ? 'Home' : 'Personal'} Loan Prepayment Calculator 2026 | RupeePedia</title>
        <meta name="description" content={`Calculate how much interest you save by prepaying your ${isHome ? 'home' : 'personal'} loan. See months saved and total interest saved.`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">{isHome ? 'Home' : 'Personal'} Loan Prepayment Calculator</h1>
          <p className="text-indigo-100 text-sm max-w-md mx-auto">See exactly how much interest you save and how many months you cut off by making a lump sum prepayment.</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-600 p-6">
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

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg p-5 text-white flex flex-col gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">Interest Saved</div>
                  <div className="text-3xl font-bold tracking-tight text-green-300">{fmtShort(Math.max(intSaved, 0))}</div>
                </div>
                <hr className="border-white/20" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs opacity-70 mb-1">Months Saved</div>
                    <div className="text-2xl font-bold">{Math.max(monthsSaved, 0)}</div>
                    <div className="text-xs opacity-60">{Math.floor(Math.max(monthsSaved, 0) / 12)}y {Math.max(monthsSaved, 0) % 12}m early</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs opacity-70 mb-1">New Closure</div>
                    <div className="text-lg font-bold">{Math.floor(newTotalMonths / 12)}y {newTotalMonths % 12}m</div>
                    <div className="text-xs opacity-60">vs {tenure}y 0m original</div>
                  </div>
                </div>
                <hr className="border-white/20" />
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="opacity-80">Original Interest</span><span className="font-bold">{fmtShort(origInt)}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">New Interest</span><span className="font-bold text-green-300">{fmtShort(Math.max(newInt, 0))}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">Monthly EMI</span><span className="font-bold">{fmtINR(origEMI)}</span></div>
                </div>
              </div>
            </div>
          </div>

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
