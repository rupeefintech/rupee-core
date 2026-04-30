// File: frontend/src/pages/XIRRCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

// Newton-Raphson XIRR calculation
function calculateXIRR(cashflows: number[], dates: Date[]): number | null {
  if (cashflows.length !== dates.length || cashflows.length < 2) return null;
  const hasPos = cashflows.some(c => c > 0);
  const hasNeg = cashflows.some(c => c < 0);
  if (!hasPos || !hasNeg) return null;

  const baseDate = dates[0];
  const t = dates.map(d => (d.getTime() - baseDate.getTime()) / (365.25 * 24 * 3600 * 1000));

  let rate = 0.1;
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0, dnpv = 0;
    for (let i = 0; i < cashflows.length; i++) {
      npv  += cashflows[i] / Math.pow(1 + rate, t[i]);
      dnpv -= t[i] * cashflows[i] / Math.pow(1 + rate, t[i] + 1);
    }
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-7) return newRate * 100;
    rate = newRate;
    if (rate < -1) return null;
  }
  return null;
}

const FREQ_OPTIONS = [
  { label: 'Monthly',     months: 1  },
  { label: 'Quarterly',   months: 3  },
  { label: 'Half Yearly', months: 6  },
  { label: 'Yearly',      months: 12 },
];

export default function XIRRCalculatorPage() {
  const [freq,       setFreq]       = useState(0); // index into FREQ_OPTIONS
  const [startDate,  setStartDate]  = useState('2021-01-01');
  const [endDate,    setEndDate]    = useState('2024-01-01');
  const [sipAmount,  setSipAmount]  = useState<string>('10000');
  const [maturity,   setMaturity]   = useState<string>('500000');
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);

  const P  = parseFloat(sipAmount) || 0;
  const MV = parseFloat(maturity)  || 0;

  // Build cashflows from start to end at given frequency
  const buildCashflows = () => {
    if (!P || !MV || !startDate || !endDate) return { xirr: null, cashflows: [], dates: [], invested: 0 };
    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (end <= start) return { xirr: null, cashflows: [], dates: [], invested: 0 };

    const freqMonths = FREQ_OPTIONS[freq].months;
    const cashflows: number[] = [];
    const dates: Date[] = [];
    let cur = new Date(start);

    while (cur < end) {
      cashflows.push(-P);
      dates.push(new Date(cur));
      cur = new Date(cur);
      cur.setMonth(cur.getMonth() + freqMonths);
    }

    // Final maturity value (positive)
    cashflows.push(MV);
    dates.push(new Date(end));

    const invested = P * (cashflows.length - 1);
    const xirr = calculateXIRR(cashflows, dates);
    return { xirr, cashflows, dates, invested };
  };

  const { xirr, cashflows, invested } = buildCashflows();
  const gain = MV - invested;
  const numInstallments = cashflows.length - 1;

  const faqs = [
    { q: 'What is XIRR?', a: 'XIRR (Extended Internal Rate of Return) is a method to calculate returns when investments happen at irregular intervals. Unlike CAGR (which assumes one investment), XIRR handles multiple cash flows at different dates — exactly how SIP works.' },
    { q: 'Why is XIRR better than simple return for SIP?', a: 'Simple return treats all SIP instalments the same. But your first SIP was invested longest and your last SIP for a very short time. XIRR correctly weights each instalment by its time in the market, giving a more accurate annual return.' },
    { q: 'What is the difference between XIRR and CAGR?', a: 'CAGR works for a single lump sum investment. XIRR works for multiple cash flows at different dates. For a single lumpsum investment, CAGR and XIRR give the same result.' },
    { q: 'What is a good XIRR for a mutual fund SIP?', a: 'For large-cap equity mutual fund SIPs over 10+ years, an XIRR of 10–14% is considered good. Mid and small-cap funds may show 14–18% XIRR over long periods. Debt fund SIPs typically show 6–8% XIRR.' },
    { q: 'How is XIRR calculated?', a: 'XIRR uses Newton-Raphson numerical iteration to find the discount rate that makes the Net Present Value (NPV) of all cash flows equal to zero. It cannot be solved with a simple formula — Excel\'s =XIRR() function or this calculator does the iteration for you.' },
    { q: 'Can I calculate XIRR in Excel?', a: 'Yes. Create two columns: one for dates, one for cash flows (negative for investments, positive for maturity). Use =XIRR(cashflows_range, dates_range) to get the annualised return.' },
  ];

  return (
    <>
      <Helmet>
        <title>XIRR Calculator 2026 — Calculate SIP Returns with XIRR | RupeePedia</title>
        <meta name="description" content="Free XIRR Calculator — calculate the Extended Internal Rate of Return on your SIP investments. Enter investment frequency, amount, and maturity value." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/xirr" />
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
          <h1 className="text-2xl font-bold mb-2">XIRR Calculator</h1>
          <p className="text-brand-100 text-sm max-w-md mx-auto">Calculate the Extended Internal Rate of Return on your SIP investments with multiple cash flows.</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-brand-600 p-6">

            {/* Frequency selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Investment Frequency</label>
              <div className="flex gap-2 flex-wrap">
                {FREQ_OPTIONS.map((f, i) => (
                  <button key={i} onClick={() => setFreq(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${freq === i ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Start date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-brand-400" />
                </div>

                {/* End / Maturity date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Maturity Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-brand-400" />
                </div>

                {/* SIP amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Recurring Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input type="number" value={sipAmount} onChange={e => setSipAmount(e.target.value)}
                      placeholder="e.g. 10000"
                      className={`w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm text-slate-800 font-semibold focus:outline-none ${!P ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-brand-400'}`} />
                  </div>
                </div>

                {/* Maturity value */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Total Maturity Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input type="number" value={maturity} onChange={e => setMaturity(e.target.value)}
                      placeholder="e.g. 500000"
                      className={`w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm text-slate-800 font-semibold focus:outline-none ${!MV ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-brand-400'}`} />
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-xl p-5 text-white">
                  <div className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">Your XIRR</div>
                  <div className={`text-4xl font-bold tracking-tight ${!xirr ? 'opacity-30' : ''}`}>
                    {xirr !== null ? `${xirr.toFixed(2)}%` : '—'}
                  </div>
                  {xirr !== null && invested > 0 && (
                    <>
                      <hr className="border-white/20 my-3" />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="opacity-80">No. of instalments</span><span className="font-bold">{numInstallments}</span></div>
                        <div className="flex justify-between"><span className="opacity-80">Total invested</span><span className="font-bold">{fmtINR(invested)}</span></div>
                        <div className="flex justify-between"><span className="opacity-80">Maturity value</span><span className="font-bold">{fmtINR(MV)}</span></div>
                        <div className="flex justify-between"><span className="opacity-80">Total gain</span><span className={`font-bold ${gain >= 0 ? 'text-green-300' : 'text-red-300'}`}>{gain >= 0 ? '+' : ''}{fmtINR(gain)}</span></div>
                      </div>
                    </>
                  )}
                  {xirr === null && P > 0 && MV > 0 && (
                    <p className="text-xs opacity-70 mt-3">Could not compute XIRR. Check that end date is after start date and maturity amount is valid.</p>
                  )}
                </div>

                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-xs text-brand-700 leading-relaxed">
                  <strong>How it works:</strong> XIRR treats each {FREQ_OPTIONS[freq].label.toLowerCase()} instalment of {P ? fmtINR(P) : '₹—'} as a negative cash flow, and the maturity value as a positive cash flow. It then finds the annual discount rate that makes the NPV of all these flows equal to zero.
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">About XIRR</h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>XIRR is the standard way to measure SIP returns. When you invest ₹10,000/month for 10 years, your first instalment was in the market for 10 years while the last was in the market for just 1 month. XIRR correctly weights each instalment by its time invested.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {[
                  { icon: '📅', title: 'Date-aware', desc: 'Accounts for the exact date of each investment — essential for irregular SIPs.' },
                  { icon: '🔄', title: 'Multiple cash flows', desc: 'Works with any number of investments and withdrawals at any dates.' },
                  { icon: '📊', title: 'Industry standard', desc: 'All mutual fund statements in India show XIRR as the return metric for SIPs.' },
                  { icon: '🧮', title: 'Iterative calculation', desc: 'Cannot be solved directly — requires numerical iteration (Newton-Raphson method).' },
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
