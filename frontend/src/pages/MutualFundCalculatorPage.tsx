// File: frontend/src/pages/MutualFundCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SliderInput from '../components/SliderInput';

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

const MF_CATEGORIES = [
  { label: 'Large Cap',       typical: 12 },
  { label: 'Mid Cap',         typical: 15 },
  { label: 'Small Cap',       typical: 18 },
  { label: 'Flexi Cap',       typical: 13 },
  { label: 'ELSS',            typical: 13 },
  { label: 'Debt / Liquid',   typical: 7  },
  { label: 'Hybrid/Balanced', typical: 11 },
  { label: 'Index Fund',      typical: 12 },
];

export default function MutualFundCalculatorPage() {
  const [invested,   setInvested]   = useState(100000);
  const [returnRate, setReturnRate] = useState(12);
  const [years,      setYears]      = useState(5);
  const [finalValue, setFinalValue] = useState<string>('');
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);

  const maturity     = invested * Math.pow(1 + returnRate / 100, years);
  const gains        = maturity - invested;
  const absoluteRet  = ((maturity - invested) / invested) * 100;
  const cagr         = returnRate; // since we input the rate directly

  // If user enters final value, back-calculate CAGR
  const FV = parseFloat(finalValue) || 0;
  const impliedCAGR = FV > 0 && invested > 0 && years > 0
    ? (Math.pow(FV / invested, 1 / years) - 1) * 100
    : null;

  const displayMaturity = FV > 0 ? FV : maturity;
  const displayGains    = displayMaturity - invested;
  const displayCAGR     = impliedCAGR !== null ? impliedCAGR : cagr;
  const displayAbsRet   = ((displayMaturity - invested) / invested) * 100;

  const faqs = [
    { q: 'What is Absolute Return?', a: 'Absolute return is the total percentage gain on your investment regardless of time period. Formula: (Current Value - Invested) / Invested × 100. It doesn\'t account for how long the investment was held.' },
    { q: 'What is CAGR in mutual funds?', a: 'CAGR (Compound Annual Growth Rate) is the annualised return rate. It tells you what steady annual return would have grown your investment to the current value. For lumpsum mutual fund investments, CAGR is the key metric.' },
    { q: 'What is XIRR and when is it used?', a: 'XIRR (Extended Internal Rate of Return) is used when you have multiple cash flows at different dates — like SIP investments. For a single lumpsum, CAGR = XIRR. Use the XIRR Calculator for SIP-based return calculation.' },
    { q: 'Which mutual fund category gives best returns?', a: 'Historically over 10+ years: Small Cap (14–22%), Mid Cap (12–18%), Large Cap (10–14%), Index Funds (10–13%), Debt Funds (6–8%). Higher returns come with higher risk and volatility.' },
    { q: 'How long should I stay invested?', a: 'For equity mutual funds, minimum 5 years is recommended, ideally 7–10+ years. Short-term equity returns are volatile. Debt funds are suitable for 1–3 year horizons.' },
  ];

  return (
    <>
      <Helmet>
        <title>Mutual Fund Returns Calculator 2026 — CAGR & Absolute Returns | RupeePedia</title>
        <meta name="description" content="Calculate mutual fund returns — absolute return and CAGR. Compare returns across all fund categories. Free and instant." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/mutual-fund" />
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
          <h1 className="text-2xl font-bold mb-2">Mutual Fund Returns Calculator</h1>
          <p className="text-indigo-100 text-sm max-w-md mx-auto">Calculate expected returns on your lumpsum mutual fund investment. Compare across fund categories.</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-600 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SliderInput
                  label="Invested Amount"
                  value={invested} min={1000} max={10000000} step={1000}
                  display={fmtINR(invested)}
                  onChange={setInvested}
                  parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))}
                  color="blue"
                  isZero={invested === 0}
                />
                <SliderInput
                  label="Expected Return Rate (p.a.)"
                  value={returnRate} min={1} max={30} step={0.5}
                  display={`${returnRate}%`}
                  onChange={setReturnRate}
                  color="blue"
                  isZero={returnRate === 0}
                />
                <SliderInput
                  label="Investment Duration"
                  value={years} min={1} max={40} step={1}
                  display={`${years} Yr`}
                  onChange={setYears}
                  color="blue"
                  isZero={years === 0}
                />

                {/* Optional final value back-calc */}
                <div className="mt-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Know your current value? Enter to back-calculate CAGR:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                    <input
                      type="text"
                      placeholder="Enter current/final value"
                      value={finalValue}
                      onChange={e => setFinalValue(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-5 text-white">
                  <div className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">
                    {impliedCAGR !== null ? 'Implied CAGR' : 'Est. Returns'}
                  </div>
                  <div className="text-3xl font-bold mb-4">{fmtShort(displayMaturity)}</div>
                  <hr className="border-white/20 mb-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="opacity-80">Invested</span><span className="font-bold">{fmtINR(invested)}</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Est. Gains</span><span className="font-bold text-green-300">{fmtINR(displayGains)}</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Return Metrics</div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Absolute Return</span><span className="font-bold text-indigo-600">{displayAbsRet.toFixed(2)}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">CAGR (Annualised)</span><span className="font-bold text-indigo-600">{displayCAGR.toFixed(2)}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Wealth Multiplier</span><span className="font-bold text-slate-700">{(displayMaturity / invested).toFixed(2)}x</span></div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700">
                  For SIP-based return calculation, use the <a href="/calculators/xirr" className="font-bold underline">XIRR Calculator →</a>
                </div>
              </div>
            </div>
          </div>

          {/* Category comparison */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">Expected Returns by Fund Category</h2>
            <p className="text-xs text-slate-400 mb-4">Based on historical 10-year CAGR. Past performance ≠ future returns.</p>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Fund Category</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Typical CAGR</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{fmtINR(invested)} grows to (in {years}yr)</th>
                  </tr>
                </thead>
                <tbody>
                  {MF_CATEGORIES.map(cat => {
                    const val = invested * Math.pow(1 + cat.typical / 100, years);
                    return (
                      <tr key={cat.label} className={`border-t border-slate-50 hover:bg-slate-50 ${cat.typical === returnRate ? 'bg-indigo-50' : ''}`}>
                        <td className="px-4 py-3 font-medium text-slate-700">{cat.label}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cat.typical >= 14 ? 'bg-indigo-200 text-indigo-800' : cat.typical >= 10 ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-indigo-600'}`}>{cat.typical}%</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">{fmtShort(val)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-xs text-indigo-700 leading-relaxed">
            <strong>Disclaimer:</strong> Returns shown are estimated. Actual mutual fund returns vary with market conditions and fund performance. Past performance does not guarantee future results. Consult a SEBI-registered investment advisor.
          </div>
        </div>
      </div>
    </>
  );
}
