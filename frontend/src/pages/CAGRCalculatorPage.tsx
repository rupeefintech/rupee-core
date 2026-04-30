// File: frontend/src/pages/CAGRCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function CAGRCalculatorPage() {
  const [initial,  setInitial]  = useState<string>('100000');
  const [final,    setFinal]    = useState<string>('200000');
  const [duration, setDuration] = useState<string>('5');
  const [openFaq,  setOpenFaq]  = useState<number | null>(null);

  const P = parseFloat(initial) || 0;
  const F = parseFloat(final)   || 0;
  const N = parseFloat(duration)|| 0;

  const cagr        = P > 0 && F > 0 && N > 0 ? (Math.pow(F / P, 1 / N) - 1) * 100 : 0;
  const absoluteRet = P > 0 && F > 0 ? ((F - P) / P) * 100 : 0;
  const totalGain   = F - P;
  const multiplier  = P > 0 ? F / P : 0;

  const isValid = P > 0 && F > 0 && N > 0;

  // Comparison table — what ₹P grows to at different CAGRs
  const compRates = [6, 8, 10, 12, 15, 18, 20];

  const faqs = [
    { q: 'What is CAGR?', a: 'CAGR (Compound Annual Growth Rate) is the rate at which an investment grows from its initial value to final value over a time period, assuming profits are reinvested each year. It smooths out volatility and gives a single clean annual growth rate.' },
    { q: 'What is the CAGR formula?', a: 'CAGR = [(Final Value / Initial Value)^(1/N) - 1] × 100, where N is the number of years. For example, ₹1 lakh growing to ₹2 lakh in 5 years gives CAGR = [(2,00,000/1,00,000)^(1/5) - 1] × 100 = 14.87%.' },
    { q: 'What is the difference between CAGR and absolute return?', a: 'Absolute return is the total percentage gain regardless of time: (Final - Initial) / Initial × 100. CAGR accounts for time and is annualised. A 100% absolute return in 1 year = 100% CAGR. The same in 10 years = only 7.18% CAGR.' },
    { q: 'What is a good CAGR?', a: 'It depends on the asset class. For equity mutual funds, 12–15% CAGR over 10 years is considered good. For FDs, 6–7% is typical. Nifty 50 has delivered approximately 12% CAGR over the last 20 years.' },
    { q: 'What is the difference between CAGR and IRR?', a: 'CAGR assumes a single investment at start and single withdrawal at end. IRR (and XIRR) handles multiple cash flows at different dates — like SIP investments. For lumpsum investments, CAGR = IRR.' },
    { q: 'Can CAGR be negative?', a: 'Yes. If your investment\'s final value is less than the initial value, CAGR will be negative. For example, ₹1 lakh falling to ₹80,000 in 3 years gives CAGR = -7.1%, meaning the investment lost 7.1% per year on average.' },
  ];

  return (
    <>
      <Helmet>
        <title>CAGR Calculator 2026 — Compound Annual Growth Rate Calculator | RupeePedia</title>
        <meta name="description" content="Free CAGR Calculator — calculate the Compound Annual Growth Rate of any investment. Enter initial value, final value, and duration to get instant CAGR." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/cagr" />
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50">
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">CAGR Calculator</h1>
          <p className="text-brand-100 text-sm max-w-md mx-auto">Calculate the Compound Annual Growth Rate of any investment instantly.</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Main card */}
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-brand-600 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Investment</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number" value={initial}
                      onChange={e => setInitial(e.target.value)}
                      placeholder="e.g. 100000"
                      className={`w-full pl-7 pr-4 py-3 border rounded-lg text-slate-800 font-semibold focus:outline-none text-sm ${!P ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 focus:border-brand-400'}`}
                    />
                  </div>
                  {!P && <p className="text-xs text-red-500 mt-1">Please enter initial investment</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Final Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number" value={final}
                      onChange={e => setFinal(e.target.value)}
                      placeholder="e.g. 200000"
                      className={`w-full pl-7 pr-4 py-3 border rounded-lg text-slate-800 font-semibold focus:outline-none text-sm ${!F ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 focus:border-brand-400'}`}
                    />
                  </div>
                  {!F && <p className="text-xs text-red-500 mt-1">Please enter final value</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration of Investment</label>
                  <div className="relative">
                    <input
                      type="number" value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="e.g. 5"
                      className={`w-full pr-10 pl-4 py-3 border rounded-lg text-slate-800 font-semibold focus:outline-none text-sm ${!N ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 focus:border-brand-400'}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Yr</span>
                  </div>
                  {!N && <p className="text-xs text-red-500 mt-1">Please enter duration in years</p>}
                </div>

                <button
                  onClick={() => { setInitial(''); setFinal(''); setDuration(''); }}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors underline"
                >
                  Reset
                </button>
              </div>

              {/* Result */}
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-xl p-5 text-white">
                  <div className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">CAGR</div>
                  <div className={`text-4xl font-bold tracking-tight ${!isValid ? 'opacity-30' : ''}`}>
                    {isValid ? `${cagr.toFixed(2)}%` : '—'}
                  </div>
                  {isValid && (
                    <>
                      <hr className="border-white/20 my-3" />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="opacity-80">Initial Investment</span><span className="font-bold">{fmtINR(P)}</span></div>
                        <div className="flex justify-between"><span className="opacity-80">Final Value</span><span className="font-bold">{fmtINR(F)}</span></div>
                        <div className="flex justify-between"><span className="opacity-80">Total Gain</span><span className={`font-bold ${totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>{totalGain >= 0 ? '+' : ''}{fmtINR(totalGain)}</span></div>
                      </div>
                    </>
                  )}
                </div>

                {isValid && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">All Return Metrics</div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Absolute Return</span><span className={`font-bold ${absoluteRet >= 0 ? 'text-green-600' : 'text-red-600'}`}>{absoluteRet.toFixed(2)}%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">CAGR (Annualised)</span><span className={`font-bold ${cagr >= 0 ? 'text-brand-600' : 'text-red-600'}`}>{cagr.toFixed(2)}%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Wealth Multiplier</span><span className="font-bold text-slate-700">{multiplier.toFixed(2)}x</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Duration</span><span className="font-bold text-slate-700">{N} years</span></div>
                  </div>
                )}
              </div>
            </div>

            {/* Comparison table */}
            {P > 0 && N > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-bold text-slate-900 mb-3">
                  What does {fmtINR(P)} grow to in {N} years at different rates?
                </h2>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">CAGR</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Final Value</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total Gain</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Multiplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compRates.map(r => {
                        const val = P * Math.pow(1 + r / 100, N);
                        const gain = val - P;
                        return (
                          <tr key={r} className={`border-t border-slate-50 hover:bg-slate-50 ${Math.abs(cagr - r) < 0.5 && isValid ? 'bg-brand-50' : ''}`}>
                            <td className="px-4 py-3 font-bold text-brand-600">{r}%</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-800">{fmtShort(val)}</td>
                            <td className="px-4 py-3 text-right text-green-600">+{fmtShort(gain)}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{(val / P).toFixed(2)}x</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Notes section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">About CAGR</h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>CAGR (Compound Annual Growth Rate) is the most widely used metric to compare investment performance. Unlike simple percentage return, CAGR accounts for the time value of money and gives a standardised annual rate.</p>
              <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
                <p className="font-semibold text-brand-800 mb-2">Formula</p>
                <code className="block bg-white rounded px-3 py-2 text-brand-700 font-mono text-sm">CAGR = [(Final Value ÷ Initial Value)^(1÷N) − 1] × 100</code>
                <p className="text-xs text-brand-600 mt-2">Where N = number of years</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[
                  { icon: '📈', title: 'Smooths volatility', desc: 'CAGR gives a single clean number even if returns were +40%, -20%, +30% in different years.' },
                  { icon: '⚖️', title: 'Enables comparison', desc: 'Compare two investments with different durations fairly by converting to annual returns.' },
                  { icon: '🎯', title: 'Goal planning', desc: 'Use CAGR to back-calculate what returns you need to reach a financial goal.' },
                  { icon: '⚠️', title: 'Limitation', desc: 'CAGR assumes steady growth. It won\'t show you the volatility experienced along the way.' },
                ].map(item => (
                  <div key={item.title} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="text-base mb-1">{item.icon}</div>
                    <div className="font-semibold text-xs text-slate-700 mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                ))}
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
