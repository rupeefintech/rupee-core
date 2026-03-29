// File: frontend/src/pages/FDCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SliderInput from '../components/SliderInput';

type FDType = 'fd' | 'rd' | 'ppf' | 'nps';
interface Props { type?: FDType }

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

const CONFIG: Record<FDType, {
  title: string; desc: string; isMonthly: boolean;
  minAmt: number; maxAmt: number; defaultAmt: number;
  minRate: number; maxRate: number; defaultRate: number;
  minYears: number; maxYears: number; defaultYears: number;
  color: 'amber' | 'blue' | 'purple'; accent: string;
}> = {
  fd:  { title: 'FD Calculator',  desc: 'Calculate your Fixed Deposit maturity amount and interest earned.',          isMonthly: false, minAmt: 1000, maxAmt: 10000000, defaultAmt: 100000, minRate: 3, maxRate: 9.5, defaultRate: 7.0, minYears: 1,  maxYears: 10, defaultYears: 3,  color: 'amber',  accent: 'from-amber-500 to-amber-700'   },
  rd:  { title: 'RD Calculator',  desc: 'Calculate your Recurring Deposit maturity amount with monthly deposits.',    isMonthly: true,  minAmt: 100,  maxAmt: 100000,   defaultAmt: 5000,   minRate: 3, maxRate: 8.5, defaultRate: 6.5, minYears: 1,  maxYears: 10, defaultYears: 3,  color: 'amber',  accent: 'from-orange-500 to-orange-700'  },
  ppf: { title: 'PPF Calculator', desc: 'Calculate Public Provident Fund maturity with current 7.1% interest rate.', isMonthly: true,  minAmt: 500,  maxAmt: 12500,    defaultAmt: 5000,   minRate: 7, maxRate: 8,   defaultRate: 7.1, minYears: 15, maxYears: 15, defaultYears: 15, color: 'blue',   accent: 'from-blue-500 to-blue-700'     },
  nps: { title: 'NPS Calculator', desc: 'Estimate your NPS pension corpus and monthly pension at retirement.',        isMonthly: true,  minAmt: 500,  maxAmt: 100000,   defaultAmt: 5000,   minRate: 8, maxRate: 14,  defaultRate: 10,  minYears: 10, maxYears: 40, defaultYears: 20, color: 'purple', accent: 'from-purple-600 to-purple-800'  },
};

const borderMap: Record<string, string> = {
  amber: 'border-amber-600', blue: 'border-blue-600', purple: 'border-purple-600',
};

export default function FDCalculatorPage({ type = 'fd' }: Props) {
  const cfg = CONFIG[type];
  const [amount,  setAmount]  = useState(cfg.defaultAmt);
  const [rate,    setRate]    = useState(cfg.defaultRate);
  const [years,   setYears]   = useState(cfg.defaultYears);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  let maturity = 0, invested = 0;
  if (type === 'rd') {
    const r = rate / 100;
    invested = amount * years * 12;
    maturity = amount * ((Math.pow(1 + r / 4, 4 * years) - 1) / (1 - Math.pow(1 + r / 4, -1 / 3)));
  } else if (type === 'ppf') {
    const r = rate / 100;
    invested = amount * 12 * years;
    let bal = 0;
    for (let y = 0; y < years; y++) { bal = (bal + amount * 12) * (1 + r); }
    maturity = bal;
  } else if (type === 'nps') {
    const r = rate / 12 / 100;
    const n = years * 12;
    invested = amount * n;
    maturity = amount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  } else {
    invested = amount;
    maturity = amount * Math.pow(1 + rate / 400, 4 * years);
  }

  const interest = maturity - invested;
  const gainsPct = Math.round((interest / invested) * 100);

  const faqs: Record<FDType, { q: string; a: string }[]> = {
    fd: [
      { q: 'How is FD interest calculated?', a: 'FD interest is usually compounded quarterly in India. Formula: M = P × (1 + r/4)^(4×t) where P is principal, r is annual rate, t is years.' },
      { q: 'Is FD interest taxable?', a: 'Yes. FD interest is added to your income and taxed as per your slab. Banks deduct TDS at 10% if interest exceeds ₹40,000/year (₹50,000 for seniors).' },
      { q: 'What is the safest FD option?', a: 'Bank FDs are covered under DICGC insurance up to ₹5 lakh per depositor per bank. Post Office FDs are backed by Government of India — the safest option.' },
    ],
    rd: [
      { q: 'What is an RD?', a: 'Recurring Deposit (RD) is a savings instrument where you deposit a fixed amount every month for a fixed tenure. It earns compound interest, typically quarterly.' },
      { q: 'Can I withdraw RD prematurely?', a: 'Yes, but with a penalty of 0.5–1% on the interest rate. Most banks allow premature withdrawal after 3 months of opening.' },
      { q: 'RD vs SIP — which is better?', a: 'RD offers guaranteed returns (6–7%) with no risk. SIP in equity mutual funds offers potentially higher returns (10–14%) but with market risk. Choose based on your risk appetite.' },
    ],
    ppf: [
      { q: 'What is the current PPF interest rate?', a: 'PPF interest rate is 7.1% p.a. (as of 2024–25), set by the Government of India quarterly. Interest is compounded annually and credited on March 31.' },
      { q: 'Can I withdraw PPF before 15 years?', a: 'Partial withdrawal is allowed from Year 7 onwards (up to 50% of balance at end of 4th year). Full withdrawal only at maturity (15 years). Loan against PPF is available from Year 3.' },
      { q: 'Is PPF interest tax-free?', a: 'Yes. PPF enjoys EEE (Exempt-Exempt-Exempt) status — contributions get 80C deduction, interest is tax-free, and maturity amount is tax-free.' },
    ],
    nps: [
      { q: 'What is NPS?', a: 'National Pension System (NPS) is a government-regulated pension scheme. You invest monthly, build a corpus, and at retirement use 60% as lump sum (tax-free) and 40% to buy annuity for pension.' },
      { q: 'What returns can I expect from NPS?', a: 'NPS equity funds have historically given 10–12% CAGR. Debt funds give 7–9%. The blended return depends on your asset allocation (Active vs Auto Choice).' },
      { q: 'What are NPS tax benefits?', a: 'NPS offers ₹1.5L deduction under 80C + additional ₹50,000 under 80CCD(1B) = total ₹2L deduction. Employer contribution up to 10% of salary is also deductible.' },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{cfg.title} 2026 — {type === 'ppf' ? 'PPF Maturity' : type === 'nps' ? 'NPS Pension' : 'Maturity & Interest'} Calculator | RupeePedia</title>
        <meta name="description" content={cfg.desc} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs[type].map((f: { q: string; a: string }) => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
        <div className={`bg-gradient-to-br ${cfg.accent} text-white py-10 px-4 text-center`}>
          <h1 className="text-2xl font-bold mb-2">{cfg.title}</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">{cfg.desc}</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className={`bg-white rounded-lg shadow-lg border-l-4 ${borderMap[cfg.color]} p-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* LEFT: Sliders using SliderInput */}
              <div>
                <SliderInput
                  label={cfg.isMonthly ? 'Monthly Deposit' : 'Principal Amount'}
                  value={amount} min={cfg.minAmt} max={cfg.maxAmt} step={cfg.minAmt}
                  display={fmtINR(amount)}
                  onChange={setAmount}
                  parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))}
                  color={cfg.color}
                  isZero={amount === 0}
                />
                <SliderInput
                  label="Interest Rate (p.a.)"
                  value={rate} min={cfg.minRate} max={cfg.maxRate} step={0.1}
                  display={`${rate.toFixed(1)}%`}
                  onChange={setRate}
                  color={cfg.color}
                  disabled={type === 'ppf'}
                  hint={type === 'ppf' ? 'Fixed by Government at 7.1% p.a.' : undefined}
                />
                <SliderInput
                  label="Time Period"
                  value={years} min={cfg.minYears} max={cfg.maxYears} step={1}
                  display={`${years} Yr`}
                  onChange={setYears}
                  color={cfg.color}
                  disabled={type === 'ppf'}
                  hint={type === 'ppf' ? 'PPF has a fixed lock-in of 15 years.' : undefined}
                />
              </div>

              {/* RIGHT: Result panel */}
              <div className={`bg-gradient-to-br ${cfg.accent} rounded-lg p-5 text-white flex flex-col gap-4`}>
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">Maturity Amount</div>
                  <div className="text-3xl font-bold tracking-tight">{fmtShort(maturity)}</div>
                </div>
                <hr className="border-white/20" />
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between"><span className="opacity-80">{cfg.isMonthly ? 'Total Deposited' : 'Principal'}</span><span className="font-bold">{fmtINR(invested)}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">Total Interest</span><span className="font-bold">{fmtINR(interest)}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">Interest earned</span><span className="font-bold">{gainsPct}% of invested</span></div>
                </div>
                <hr className="border-white/20" />
                <div>
                  <div className="text-xs opacity-70 mb-2">Principal vs Interest</div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden flex">
                    <div className="h-full bg-white/60 rounded-l-full" style={{ width: `${Math.round((invested / maturity) * 100)}%` }} />
                    <div className="h-full bg-white" style={{ width: `${Math.round((interest / maturity) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1 opacity-70">
                    <span>Principal {Math.round((invested / maturity) * 100)}%</span>
                    <span>Interest {Math.round((interest / maturity) * 100)}%</span>
                  </div>
                </div>
                {type === 'nps' && (
                  <>
                    <hr className="border-white/20" />
                    <div className="text-xs opacity-70">At retirement (40% annuity @ 6%)</div>
                    <div className="flex justify-between text-sm"><span className="opacity-80">Lump sum (60%)</span><span className="font-bold">{fmtShort(maturity * 0.6)}</span></div>
                    <div className="flex justify-between text-sm"><span className="opacity-80">Monthly pension (est.)</span><span className="font-bold">{fmtINR((maturity * 0.4 * 0.06) / 12)}</span></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs[type].map((faq, i) => (
                <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                    <span>{faq.q}</span>
                    <span className={`text-slate-400 text-xs ml-4 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openFaq === i && <div className="px-4 pb-4 pt-2 text-sm text-slate-500 leading-relaxed border-t border-slate-50">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── HOW IT WORKS ── */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              {type === 'fd' ? 'How Fixed Deposit Works' : type === 'rd' ? 'How Recurring Deposit Works' : type === 'ppf' ? 'About Public Provident Fund (PPF)' : 'About National Pension System (NPS)'}
            </h2>
            {type === 'fd' && (
              <>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  A Fixed Deposit locks your money with a bank for a chosen tenure at a fixed interest rate. Indian banks compound FD interest <strong className="text-slate-800">quarterly</strong>, meaning your interest earns interest every 3 months. The longer the tenure and higher the rate, the greater the compounding benefit.
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-amber-800 mb-2">FD Maturity Formula (Quarterly Compounding)</p>
                  <code className="block bg-white rounded px-3 py-2 text-amber-700 font-mono text-sm mb-2">M = P × (1 + r/4)^(4×t)</code>
                  <div className="grid grid-cols-2 gap-1 text-xs text-amber-700">
                    <span><strong>P</strong> = Principal amount</span>
                    <span><strong>r</strong> = Annual interest rate</span>
                    <span><strong>t</strong> = Tenure in years</span>
                    <span><strong>M</strong> = Maturity amount</span>
                  </div>
                </div>
              </>
            )}
            {type === 'rd' && (
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                A Recurring Deposit accepts a fixed monthly instalment and earns compound interest, typically compounded quarterly. Unlike FD where you invest once, RD builds the habit of regular saving. At maturity you receive all your instalments plus accumulated interest in a lump sum.
              </p>
            )}
            {type === 'ppf' && (
              <>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  PPF is a government-backed long-term savings scheme with <strong className="text-slate-800">EEE (Exempt-Exempt-Exempt) tax status</strong> — contributions get 80C deduction, interest accrues tax-free, and the maturity amount is fully tax-free. The current rate is 7.1% p.a., compounded annually.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: '🏦', title: 'Who can open', desc: 'Any Indian resident. One account per person. Minors can have PPF in parent\'s name.' },
                    { icon: '💰', title: 'Contribution', desc: '₹500 min to ₹1.5L max per year. Can invest in lump sum or 12 instalments.' },
                    { icon: '🔒', title: 'Lock-in', desc: '15 years minimum. Partial withdrawal allowed from Year 7. Extendable in 5-year blocks.' },
                  ].map(f => (
                    <div key={f.title} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="text-xl mb-1">{f.icon}</div>
                      <div className="font-semibold text-xs text-blue-800 mb-1">{f.title}</div>
                      <div className="text-xs text-blue-700">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {type === 'nps' && (
              <>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  NPS is a government pension scheme where you invest during working years and receive a corpus at retirement (age 60). You must use 40% to buy an annuity (monthly pension) and can withdraw 60% as tax-free lump sum. NPS offers up to ₹2L in tax deductions — ₹1.5L under 80C + extra ₹50,000 under 80CCD(1B).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Asset Classes', items: ['E (Equity) — up to 75%', 'C (Corporate Bonds)', 'G (Government Securities)', 'A (Alternate Assets)'] },
                    { title: 'Tax Benefits', items: ['80C deduction up to ₹1.5L', '80CCD(1B) extra ₹50,000', 'Employer contribution deductible up to 10% of salary', '60% lump sum at maturity is tax-free'] },
                  ].map(col => (
                    <div key={col.title} className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="font-semibold text-sm text-purple-800 mb-2">{col.title}</div>
                      <ul className="space-y-1">
                        {col.items.map(item => <li key={item} className="text-xs text-purple-700 flex gap-2"><span className="flex-shrink-0">•</span>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── FD / RD / PPF / NPS COMPARISON ── */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">FD vs RD vs PPF vs NPS — Quick Comparison</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-amber-500 text-white">
                    <th className="text-left px-4 py-3 text-xs font-semibold">Feature</th>
                    <th className={`text-center px-4 py-3 text-xs font-semibold ${type === 'fd' ? 'bg-amber-600' : ''}`}>FD</th>
                    <th className={`text-center px-4 py-3 text-xs font-semibold ${type === 'rd' ? 'bg-amber-600' : ''}`}>RD</th>
                    <th className={`text-center px-4 py-3 text-xs font-semibold ${type === 'ppf' ? 'bg-amber-600' : ''}`}>PPF</th>
                    <th className={`text-center px-4 py-3 text-xs font-semibold ${type === 'nps' ? 'bg-amber-600' : ''}`}>NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Typical Returns', '6.5–7.5%', '6–7%', '7.1% (fixed)', '10–12% (equity)'],
                    ['Risk', 'Very Low', 'Very Low', 'Zero', 'Market Risk'],
                    ['Liquidity', 'Medium', 'Medium', 'Low (15yr lock)', 'Very Low (till 60)'],
                    ['Tax on Returns', 'Taxable (slab)', 'Taxable (slab)', 'Tax-free', '60% tax-free'],
                    ['80C Deduction', 'Only 5yr tax FD', 'No', 'Yes (₹1.5L)', 'Yes + extra ₹50K'],
                    ['Min Investment', '₹1,000', '₹100/month', '₹500/year', '₹500/month'],
                  ].map(([feature, fd, rd, ppf, nps], i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{feature}</td>
                      <td className={`px-4 py-3 text-center text-slate-600 ${type === 'fd' ? 'font-bold text-amber-700 bg-amber-50' : ''}`}>{fd}</td>
                      <td className={`px-4 py-3 text-center text-slate-600 ${type === 'rd' ? 'font-bold text-amber-700 bg-amber-50' : ''}`}>{rd}</td>
                      <td className={`px-4 py-3 text-center text-slate-600 ${type === 'ppf' ? 'font-bold text-blue-700 bg-blue-50' : ''}`}>{ppf}</td>
                      <td className={`px-4 py-3 text-center text-slate-600 ${type === 'nps' ? 'font-bold text-purple-700 bg-purple-50' : ''}`}>{nps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-xs text-amber-700 leading-relaxed">
            <strong>Disclaimer:</strong> Calculations are indicative. Actual returns may vary based on compounding frequency, premature withdrawal penalties, and changes in interest rates. Consult your bank or financial advisor.
          </div>
        </div>
      </div>
    </>
  );
}
