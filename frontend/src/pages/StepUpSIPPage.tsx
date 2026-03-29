// File: frontend/src/pages/StepUpSIPPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SliderInput from '../components/SliderInput';

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function StepUpSIPPage() {
  const [monthly, setMonthly] = useState(10000);
  const [stepUp,  setStepUp]  = useState(10);
  const [rate,    setRate]    = useState(12);
  const [years,   setYears]   = useState(10);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  let corpus = 0, invested = 0, curSIP = monthly;
  const yearData: { year: number; sip: number; invested: number; corpus: number }[] = [];
  const r = rate / 12 / 100;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      corpus   = (corpus + curSIP) * (1 + r);
      invested += curSIP;
    }
    yearData.push({ year: y, sip: Math.round(curSIP), invested, corpus });
    curSIP = curSIP * (1 + stepUp / 100);
  }

  let flatCorpus = 0;
  const flatR = r;
  for (let m = 0; m < years * 12; m++) { flatCorpus = (flatCorpus + monthly) * (1 + flatR); }

  const gains        = corpus - invested;
  const extraVsFlat  = corpus - flatCorpus;

  const faqs = [
    { q: 'What is Step-Up SIP?', a: 'Step-Up SIP (also called Top-Up SIP) lets you automatically increase your SIP amount by a fixed percentage every year. As your income grows, your investment grows too — building significantly more wealth over time.' },
    { q: 'How much should I step up?', a: 'A 10% annual step-up is a popular choice since it roughly matches average salary increment rates in India. Even a 5% step-up significantly boosts your final corpus compared to a flat SIP.' },
    { q: 'Is Step-Up SIP better than regular SIP?', a: 'Yes, almost always. A ₹10,000 SIP for 20 years at 12% gives ~₹99L. The same with 10% annual step-up gives ~₹2Cr+ — over 2x the corpus for a modest annual increase.' },
    { q: 'Can I do Step-Up SIP in any mutual fund?', a: 'Most major AMCs (Axis, HDFC, SBI, Mirae, etc.) support step-up SIP through their app or RTA platform. You can also do it manually by modifying your SIP amount each year.' },
  ];

  return (
    <>
      <Helmet>
        <title>Step-Up SIP Calculator 2026 — Calculate Returns with Annual Increase | RupeePedia</title>
        <meta name="description" content="Free Step-Up SIP Calculator — see how increasing your SIP by 10% annually can double your corpus vs flat SIP. Calculate year-wise growth." />
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
        <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Step-Up SIP Calculator</h1>
          <p className="text-rose-100 text-sm max-w-md mx-auto">See how increasing your SIP every year accelerates your wealth creation dramatically.</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-rose-500 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SliderInput label="Initial monthly SIP"        value={monthly} min={500} max={200000} step={500}  display={fmtINR(monthly)} onChange={setMonthly} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="rose" />
                <SliderInput label="Annual step-up rate"        value={stepUp}  min={5}   max={50}     step={5}    display={`${stepUp}%`}    onChange={setStepUp}  color="rose" />
                <SliderInput label="Expected return rate (p.a)" value={rate}    min={1}   max={30}     step={0.5}  display={`${rate}%`}      onChange={setRate}    color="rose" />
                <SliderInput label="Time period"                value={years}   min={1}   max={40}     step={1}    display={`${years} Yr`}   onChange={setYears}   color="rose" />
              </div>

              <div className="flex flex-col justify-center gap-4">
                <div className="bg-slate-50 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between py-1.5">
                    <span className="text-sm text-slate-500">Invested amount</span>
                    <span className="text-sm font-semibold">{fmtINR(invested)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-sm text-slate-500">Est. returns</span>
                    <span className="text-sm font-semibold text-green-600">{fmtINR(gains)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t border-slate-200 pt-3">
                    <span className="text-sm text-slate-500">Total corpus</span>
                    <span className="text-base font-bold text-slate-900">{fmtShort(corpus)}</span>
                  </div>
                  <div className="mt-4 h-10 rounded-xl overflow-hidden flex text-white text-sm font-bold">
                    <div className="flex items-center justify-center bg-orange-400" style={{ width: `${Math.round((invested / corpus) * 100)}%` }}>
                      {Math.round((invested / corpus) * 100)}%
                    </div>
                    <div className="flex items-center justify-center bg-rose-500 flex-1">
                      {Math.round((gains / corpus) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                  <div className="text-xs font-semibold text-rose-700 mb-2">vs Flat SIP (₹{monthly.toLocaleString('en-IN')}/mo)</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Flat SIP corpus</span>
                    <span className="font-semibold">{fmtShort(flatCorpus)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-500">Step-Up advantage</span>
                    <span className="font-bold text-green-600">+{fmtShort(extraVsFlat)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Year-wise table */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-slate-900 mb-3">Year-wise SIP Growth</h2>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Year</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">SIP Amount</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total Invested</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Corpus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData.map(row => (
                      <tr key={row.year} className="border-t border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-700">Year {row.year}</td>
                        <td className="px-4 py-2.5 text-right text-rose-600 font-medium">{fmtINR(row.sip)}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600">{fmtINR(row.invested)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-800">{fmtINR(row.corpus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
