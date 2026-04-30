// File: frontend/src/pages/SWPCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SliderInput from '../components/SliderInput';

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function SWPCalculatorPage() {
  const [investment, setInvestment] = useState(500000);
  const [withdrawal, setWithdrawal] = useState(5000);
  const [rate,       setRate]       = useState(8);
  const [years,      setYears]      = useState(5);
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);

  const months      = years * 12;
  const monthlyRate = rate / 12 / 100;
  let balance       = investment;
  let totalWithdrawn = 0;
  const schedule: { month: number; opening: number; withdrawal: number; interest: number; closing: number }[] = [];

  for (let m = 1; m <= months; m++) {
    if (balance <= 0) break;
    const opening  = balance;
    const interest = balance * monthlyRate;
    balance        = balance + interest - withdrawal;
    const closing  = Math.max(balance, 0);
    totalWithdrawn += Math.min(withdrawal, opening + interest);
    schedule.push({ month: m, opening, withdrawal: Math.min(withdrawal, opening + interest), interest, closing });
    if (balance <= 0) { balance = 0; break; }
  }

  const finalValue = balance;

  const faqs = [
    { q: 'What is SWP?', a: 'SWP (Systematic Withdrawal Plan) lets you withdraw a fixed amount from your mutual fund investment every month. The remaining corpus continues to grow, potentially providing income for years.' },
    { q: 'How is SWP different from dividends?', a: 'Dividends are declared by the fund based on profits — they are irregular. SWP gives you a fixed, predictable monthly income regardless of fund performance.' },
    { q: 'Is SWP tax efficient?', a: 'Yes. Only the gains portion of each withdrawal is taxed. For equity funds held over 1 year, LTCG at 12.5% applies on gains above ₹1.25L/year. This is more tax-efficient than FD interest taxed at slab rate.' },
    { q: 'Who should use SWP?', a: 'Retirees, senior citizens, or anyone needing a regular income stream from their investments. SWP from balanced/hybrid funds can act as a pension-like income.' },
  ];

  return (
    <>
      <Helmet>
        <title>SWP Calculator 2026 — Systematic Withdrawal Plan Calculator | RupeePedia</title>
        <meta name="description" content="Free SWP Calculator — calculate how long your corpus will last with monthly withdrawals. See month-by-month withdrawal schedule and final value." />
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
          <h1 className="text-2xl font-bold mb-2">SWP Calculator</h1>
          <p className="text-brand-100 text-sm max-w-md mx-auto">Calculate how long your investment corpus will last with regular monthly withdrawals.</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-brand-600 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SliderInput label="Total investment"           value={investment} min={10000} max={10000000} step={10000} display={fmtINR(investment)} onChange={setInvestment} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" />
                <SliderInput label="Withdrawal per month"       value={withdrawal} min={500}   max={100000}   step={500}   display={fmtINR(withdrawal)} onChange={setWithdrawal} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" />
                <SliderInput label="Expected return rate (p.a)" value={rate}       min={1}     max={20}       step={0.5}   display={`${rate}%`}         onChange={setRate}       color="blue" />
                <SliderInput label="Time period"                value={years}      min={1}     max={30}       step={1}     display={`${years} Yr`}      onChange={setYears}      color="blue" />
              </div>

              <div className="flex flex-col justify-center">
                <div className="bg-slate-50 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between py-1.5">
                    <span className="text-sm text-slate-500">Total investment</span>
                    <span className="text-sm font-semibold text-slate-700">{fmtINR(investment)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-sm text-slate-500">Total withdrawal</span>
                    <span className="text-sm font-semibold text-slate-700">{fmtINR(totalWithdrawn)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t border-slate-200 mt-1 pt-3">
                    <span className="text-sm text-slate-500">Final value</span>
                    <span className="text-base font-bold text-slate-900">{fmtShort(finalValue)}</span>
                  </div>
                  {finalValue <= 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-600 mt-2">
                      ⚠ Corpus exhausted before {years} years. Reduce withdrawal or increase investment.
                    </div>
                  )}
                  {finalValue > 0 && (
                    <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 text-xs text-brand-700 mt-2">
                      ✓ Corpus sustains {years} years of withdrawals with {fmtShort(finalValue)} remaining.
                    </div>
                  )}
                </div>
                <button className="mt-4 bg-brand-600 text-white font-bold text-sm rounded-xl py-3 hover:bg-brand-700 transition-colors">
                  Start Investing →
                </button>
              </div>
            </div>

            {/* Schedule table */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-slate-900 mb-3">Withdrawal Schedule</h2>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Month</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Opening</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Interest</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Withdrawal</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.slice(0, 60).map(row => (
                      <tr key={row.month} className="border-t border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-700">Month {row.month}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600">{fmtINR(row.opening)}</td>
                        <td className="px-4 py-2.5 text-right text-green-600">{fmtINR(row.interest)}</td>
                        <td className="px-4 py-2.5 text-right text-red-500">{fmtINR(row.withdrawal)}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-700">{fmtINR(row.closing)}</td>
                      </tr>
                    ))}
                    {schedule.length > 60 && (
                      <tr><td colSpan={5} className="px-4 py-3 text-center text-xs text-slate-400">Showing 60 of {schedule.length} months</td></tr>
                    )}
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
