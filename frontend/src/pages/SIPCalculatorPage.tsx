// File: frontend/src/pages/SIPCalculatorPage.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SliderInput from '../components/SliderInput';

type SIPTab = 'sip' | 'lumpsum' | 'goal';
interface Props { defaultTab?: SIPTab }

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

const TAB_META: Record<SIPTab, { title: string; desc: string; h1: string }> = {
  sip:     { h1: 'SIP Calculator',      title: 'SIP Calculator 2026 — Calculate Monthly SIP Returns | RupeePedia',           desc: 'Free SIP Calculator — calculate SIP returns, see how your monthly investments grow over time.' },
  lumpsum: { h1: 'Lumpsum Calculator',  title: 'Lumpsum Calculator 2026 — Calculate One-time Investment Returns | RupeePedia', desc: 'Free Lumpsum Calculator — calculate how a one-time investment grows over time at expected returns.' },
  goal:    { h1: 'Goal SIP Calculator', title: 'Goal SIP Calculator 2026 — Find Monthly SIP Needed for Your Goal | RupeePedia', desc: 'Free Goal SIP Calculator — find the monthly SIP amount needed to reach your financial goal.' },
};

export default function SIPCalculatorPage({ defaultTab = 'sip' }: Props) {
  const [tab, setTab] = useState<SIPTab>(defaultTab);

  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  // SIP state
  const [sipMonthly, setSipMonthly] = useState(10000);
  const [sipRate,    setSipRate]    = useState(12);
  const [sipYears,   setSipYears]   = useState(10);

  // Lumpsum state
  const [lsAmount, setLsAmount] = useState(100000);
  const [lsRate,   setLsRate]   = useState(12);
  const [lsYears,  setLsYears]  = useState(10);

  // Goal SIP state
  const [goalAmount, setGoalAmount] = useState(1000000);
  const [goalRate,   setGoalRate]   = useState(12);
  const [goalYears,  setGoalYears]  = useState(10);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // SIP calculations
  const sipN        = sipYears * 12;
  const sipR        = sipRate / 12 / 100;
  const sipCorpus   = sipMonthly > 0 && sipRate > 0 && sipYears > 0
    ? sipMonthly * ((Math.pow(1 + sipR, sipN) - 1) / sipR) * (1 + sipR) : 0;
  const sipInvested = sipMonthly * sipN;
  const sipGains    = sipCorpus - sipInvested;

  // Lumpsum calculations
  const lsCorpus = lsAmount > 0 && lsRate > 0 && lsYears > 0
    ? lsAmount * Math.pow(1 + lsRate / 100, lsYears) : 0;
  const lsGains  = lsCorpus - lsAmount;

  // Goal SIP calculations
  const goalR        = goalRate / 12 / 100;
  const goalN        = goalYears * 12;
  const goalSIP      = goalAmount > 0 && goalRate > 0 && goalYears > 0
    ? goalAmount * goalR / ((Math.pow(1 + goalR, goalN) - 1) * (1 + goalR)) : 0;
  const goalInvested = goalSIP * goalN;

  const meta = TAB_META[tab];

  const tabs = [
    { key: 'sip' as SIPTab,     label: 'SIP' },
    { key: 'lumpsum' as SIPTab, label: 'Lumpsum' },
    { key: 'goal' as SIPTab,    label: 'Goal SIP' },
  ];

  const ResultRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <div className={`flex justify-between py-2 ${bold ? 'border-t border-slate-200 mt-1 pt-3' : ''}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-slate-900 text-base' : 'font-semibold text-slate-700'}`}>{value}</span>
    </div>
  );

  const ProgressBar = ({ invested, total }: { invested: number; total: number }) => {
    if (total <= 0) return null;
    const iPct = Math.round((invested / total) * 100);
    return (
      <>
        <div className="mt-4 h-10 rounded-xl overflow-hidden flex text-white text-sm font-bold">
          <div className="flex items-center justify-center bg-indigo-400" style={{ width: `${iPct}%` }}>{iPct}%</div>
          <div className="flex items-center justify-center bg-indigo-600 flex-1">{100 - iPct}%</div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>Invested</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>Est. Returns</span>
        </div>
      </>
    );
  };

  const faqs = [
    { q: 'What is SIP?', a: 'SIP (Systematic Investment Plan) lets you invest a fixed amount in mutual funds every month. It averages your purchase cost over time (rupee cost averaging) and benefits from compounding.' },
    { q: 'What is Lumpsum investment?', a: 'Lumpsum is a one-time investment of the entire amount at once. It works best when markets are low. SIP is better for regular investors as it reduces timing risk.' },
    { q: 'What is Goal SIP?', a: 'Goal SIP tells you how much to invest monthly to reach a specific financial goal (like ₹1 Cr corpus) in a given time at an expected return rate.' },
    { q: 'Is 12% return on SIP realistic?', a: 'Historically, diversified equity mutual funds in India have delivered 10–14% CAGR over 10+ year periods. 12% is a reasonable long-term estimate, though past performance doesn\'t guarantee future returns.' },
    { q: 'What is Step-Up SIP?', a: 'Step-Up SIP lets you increase your SIP amount by a fixed percentage each year (e.g., 10% annually). Since income typically grows over time, this helps you invest more as you earn more, building wealth faster.' },
  ];

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.desc} />
        <link rel="canonical" href={`https://rupeepedia.in/calculators/${tab === 'sip' ? 'sip' : tab === 'lumpsum' ? 'lumpsum' : 'goal-sip'}`} />
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
          <h1 className="text-2xl font-bold mb-2">{meta.h1}</h1>
          <p className="text-indigo-100 text-sm max-w-md mx-auto">{meta.desc}</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-600 p-6">

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* SIP Tab */}
            {tab === 'sip' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <SliderInput label="Monthly investment"         value={sipMonthly} min={500}   max={200000}  step={500}  display={fmtINR(sipMonthly)} onChange={setSipMonthly} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" isZero={sipMonthly === 0} />
                  <SliderInput label="Expected return rate (p.a)" value={sipRate}    min={1}     max={30}      step={0.5}  display={`${sipRate}%`}       onChange={setSipRate}    color="blue" isZero={sipRate === 0} />
                  <SliderInput label="Time period"                value={sipYears}   min={1}     max={40}      step={1}    display={`${sipYears} Yr`}    onChange={setSipYears}   color="blue" isZero={sipYears === 0} />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="bg-slate-50 rounded-xl p-5 space-y-1">
                    <ResultRow label="Invested amount" value={fmtINR(sipInvested)} />
                    <ResultRow label="Est. returns"    value={fmtINR(sipGains)} />
                    <ResultRow label="Total value"     value={fmtShort(sipCorpus)} bold />
                    <ProgressBar invested={sipInvested} total={sipCorpus} />
                  </div>
                  <button className="mt-4 bg-indigo-600 text-white font-bold text-sm rounded-xl py-3 hover:bg-indigo-700 transition-colors">
                    Start SIP Investment →
                  </button>
                </div>
              </div>
            )}

            {/* Lumpsum Tab */}
            {tab === 'lumpsum' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <SliderInput label="Total investment"           value={lsAmount} min={5000}  max={10000000} step={5000} display={fmtINR(lsAmount)} onChange={setLsAmount} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" isZero={lsAmount === 0} />
                  <SliderInput label="Expected return rate (p.a)" value={lsRate}   min={1}     max={30}       step={0.5}  display={`${lsRate}%`}      onChange={setLsRate}   color="blue" isZero={lsRate === 0} />
                  <SliderInput label="Time period"                value={lsYears}  min={1}     max={40}       step={1}    display={`${lsYears} Yr`}   onChange={setLsYears}  color="blue" isZero={lsYears === 0} />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="bg-slate-50 rounded-xl p-5 space-y-1">
                    <ResultRow label="Invested amount" value={fmtINR(lsAmount)} />
                    <ResultRow label="Est. returns"    value={fmtINR(lsGains)} />
                    <ResultRow label="Total value"     value={fmtShort(lsCorpus)} bold />
                    <ProgressBar invested={lsAmount} total={lsCorpus} />
                  </div>
                  <button className="mt-4 bg-indigo-600 text-white font-bold text-sm rounded-xl py-3 hover:bg-indigo-700 transition-colors">
                    Invest Lumpsum →
                  </button>
                </div>
              </div>
            )}

            {/* Goal SIP Tab */}
            {tab === 'goal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <SliderInput label="Target corpus"              value={goalAmount} min={100000} max={100000000} step={100000} display={fmtShort(goalAmount)} onChange={setGoalAmount} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="blue" isZero={goalAmount === 0} />
                  <SliderInput label="Expected return rate (p.a)" value={goalRate}   min={1}      max={30}        step={0.5}   display={`${goalRate}%`}        onChange={setGoalRate}   color="blue" isZero={goalRate === 0} />
                  <SliderInput label="Time period"                value={goalYears}  min={1}      max={40}        step={1}     display={`${goalYears} Yr`}     onChange={setGoalYears}  color="blue" isZero={goalYears === 0} />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="bg-slate-50 rounded-xl p-5 space-y-1">
                    <ResultRow label="Monthly SIP needed" value={fmtINR(goalSIP)}                    bold />
                    <ResultRow label="Total invested"     value={fmtINR(goalInvested)} />
                    <ResultRow label="Est. returns"       value={fmtINR(Math.max(goalAmount - goalInvested, 0))} />
                    <ResultRow label="Target corpus"      value={fmtShort(goalAmount)} />
                    {goalSIP > 0 && (
                      <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                        <div className="text-xs text-indigo-700 mb-1">You need to invest</div>
                        <div className="text-2xl font-bold text-indigo-700">{fmtINR(goalSIP)}<span className="text-sm font-normal">/month</span></div>
                        <div className="text-xs text-slate-400 mt-1">to reach {fmtShort(goalAmount)} in {goalYears} years</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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

          {/* ── HOW IT WORKS ── */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              {tab === 'sip' ? 'How SIP Works' : tab === 'lumpsum' ? 'How Lumpsum Investment Works' : 'How Goal SIP Works'}
            </h2>
            {tab === 'sip' && (
              <>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  SIP invests a fixed amount every month in a mutual fund. It harnesses <strong className="text-slate-800">rupee cost averaging</strong> — you buy more units when the market is down and fewer when it is up, lowering your average cost over time. Combined with compounding, small monthly amounts grow into significant wealth.
                </p>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-5">
                  <p className="text-sm font-semibold text-indigo-800 mb-2">SIP Formula</p>
                  <code className="block bg-white rounded px-3 py-2 text-indigo-700 font-mono text-sm mb-2">M = P × [(1+r)ⁿ − 1] / r × (1+r)</code>
                  <div className="grid grid-cols-2 gap-1 text-xs text-indigo-700">
                    <span><strong>P</strong> = Monthly SIP amount</span>
                    <span><strong>r</strong> = Monthly rate (annual ÷ 12 ÷ 100)</span>
                    <span><strong>n</strong> = Total months</span>
                    <span><strong>M</strong> = Maturity value (corpus)</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: '⏳', title: 'Start early', desc: '₹5,000/month from age 25 at 12% gives ₹1.76 Cr by 55. Starting at 35 gives only ₹49.5L — 3.5× less with the same total invested.' },
                    { icon: '📉', title: 'Rupee cost averaging', desc: 'Market dips work in your favour. When NAV falls, your SIP buys more units at lower prices, bringing down your average purchase cost automatically.' },
                    { icon: '🔁', title: 'Power of compounding', desc: '₹10,000/month at 12% for 20 years: you invest ₹24L but receive ₹99L — the extra ₹75L comes purely from returns compounding on returns.' },
                  ].map(f => (
                    <div key={f.title} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <div className="font-semibold text-sm text-slate-800 mb-1">{f.title}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === 'lumpsum' && (
              <>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  A lumpsum investment deploys your entire amount at once and grows using <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">M = P × (1 + r)ⁿ</code>. It works best when markets are trading below historical averages — you lock in a low entry cost and benefit from the entire subsequent rally.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Choose Lumpsum when...', items: ['Markets are at a multi-year low', 'You have a large idle corpus', 'Investment horizon is 3+ years', 'Investing in debt or hybrid funds'] },
                    { title: 'Choose SIP when...', items: ['You invest monthly from salary', 'Markets are at all-time highs', 'Investment horizon is 7–10+ years', 'You prefer autopilot, stress-free investing'] },
                  ].map(col => (
                    <div key={col.title} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="font-semibold text-sm text-slate-800 mb-2">{col.title}</div>
                      <ul className="space-y-1.5">
                        {col.items.map(item => (
                          <li key={item} className="text-xs text-slate-600 flex gap-2 items-start"><span className="text-indigo-500 flex-shrink-0 mt-0.5">✓</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === 'goal' && (
              <>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Goal SIP reverses the formula — instead of "what do I get if I invest X?", it answers "what must I invest to reach Y?". It makes abstract financial goals concrete and actionable by giving you a precise monthly number to target.
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-600 text-white">
                        <th className="text-left px-4 py-3 text-xs font-semibold">Financial Goal</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold">Target</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold">Horizon</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold">SIP needed @ 12%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Child's Education", '₹50L', '15 yrs', '₹8,856/mo'],
                        ["Child's Marriage", '₹25L', '20 yrs', '₹2,752/mo'],
                        ['Retirement Corpus', '₹2 Cr', '25 yrs', '₹9,408/mo'],
                        ['Home Down Payment', '₹30L', '10 yrs', '₹13,607/mo'],
                        ['Car Purchase', '₹10L', '5 yrs', '₹12,244/mo'],
                      ].map(([goal, target, horizon, sip], i) => (
                        <tr key={i} className="border-t border-slate-50 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">{goal}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{target}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{horizon}</td>
                          <td className="px-4 py-3 text-right font-bold text-indigo-600">{sip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* ── SIP RETURNS AT DIFFERENT RATES ── */}
          {tab === 'sip' && sipMonthly > 0 && sipYears > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">SIP Returns at Different Rates</h2>
              <p className="text-xs text-slate-400 mb-4">₹{sipMonthly.toLocaleString('en-IN')}/month for {sipYears} year{sipYears !== 1 ? 's' : ''} at various expected return rates.</p>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-indigo-600 text-white">
                      <th className="text-left px-4 py-3 text-xs font-semibold">Expected Return</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold">Total Invested</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold">Est. Gains</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold">Total Corpus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[8, 10, 12, 14, 15, 18].map(r => {
                      const n = sipYears * 12;
                      const rm = r / 12 / 100;
                      const corpus = sipMonthly * ((Math.pow(1 + rm, n) - 1) / rm) * (1 + rm);
                      const inv = sipMonthly * n;
                      return (
                        <tr key={r} className={`border-t border-slate-50 hover:bg-slate-50 ${r === sipRate ? 'bg-indigo-50' : ''}`}>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${r === sipRate ? 'text-indigo-700' : 'text-slate-700'}`}>{r}%</span>
                            {r === sipRate && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">selected</span>}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500">{fmtShort(inv)}</td>
                          <td className="px-4 py-3 text-right text-slate-600">+{fmtShort(corpus - inv)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">{fmtShort(corpus)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TIPS ── */}
          {tab === 'sip' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Tips to Maximize SIP Returns</h2>
              <div className="space-y-3">
                {[
                  ['Start as early as possible', 'Time in the market beats timing the market. Starting at 25 vs 35 can 3× your retirement corpus — even with the same monthly SIP amount throughout.'],
                  ['Step up your SIP by 10% annually', 'A 10% annual step-up on ₹10,000/month for 20 years at 12% gives ₹2+ Cr vs ₹99L flat — more than 2×. Use our Step-Up SIP calculator to see the difference.'],
                  ['Never pause SIP during market corrections', 'Downturns are when you accumulate the cheapest units. SIPs that continue through volatility consistently deliver the best long-term returns.'],
                  ['Choose direct plans over regular plans', 'Regular plans charge an extra 0.5–1.5% in expense ratio (distributor commission). Over 20 years, this difference can cost you 20–40% of your corpus.'],
                  ['Stay invested for at least 10 years', 'Over any 10-year period in Indian equity markets, the probability of loss is near zero. The longer you stay, the more powerful compounding becomes.'],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex gap-3 text-sm items-start">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div><strong className="text-slate-800">{title}</strong><span className="text-slate-500"> — {desc}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-xs text-indigo-700 leading-relaxed">
            <strong>Disclaimer:</strong> Returns shown are estimated based on assumed rate. Actual mutual fund returns vary with market conditions. Past performance does not guarantee future results. Consult a SEBI-registered advisor before investing.
          </div>
        </div>
      </div>
    </>
  );
}
