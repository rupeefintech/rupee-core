// File: frontend/src/pages/SWPCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Wallet } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';
import SliderInput from '../components/SliderInput';

// How many months a corpus lasts at a given monthly withdrawal (capped at 100 years)
function monthsLasting(corpus: number, monthlyWithdrawal: number, annualRatePct: number): number | 'forever' {
  const r = annualRatePct / 12 / 100;
  if (corpus * r >= monthlyWithdrawal) return 'forever'; // growth covers the withdrawal
  let bal = corpus, m = 0;
  while (bal > 0 && m < 1200) { bal = bal * (1 + r) - monthlyWithdrawal; m++; }
  return m;
}

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
    { q: 'What is an SWP (Systematic Withdrawal Plan)?', a: 'An SWP is a standing instruction to redeem a fixed amount from your mutual fund investment at a regular interval — usually monthly — credited straight to your bank account. The rest of the corpus stays invested and keeps compounding. It is the mirror image of a SIP: a SIP builds the corpus, an SWP converts it into a salary-like income stream, most commonly in retirement.' },
    { q: 'How is SWP different from dividend (IDCW) plans?', a: 'IDCW payouts depend on the fund declaring a distribution — the amount and timing are the fund\'s choice, and the entire payout is taxed at your slab rate. An SWP gives you a fixed, predictable amount you choose, and only the capital-gains portion of each withdrawal is taxed. For steady income needs, SWP from a growth plan beats IDCW on both predictability and tax.' },
    { q: 'How is SWP taxed?', a: 'Each withdrawal is a redemption: part return of your own capital (not taxed) and part capital gain (taxed). For equity funds, units held over 12 months attract LTCG at 12.5% only on gains above ₹1.25 lakh a year; units sold within 12 months attract 20% STCG. Debt fund gains are taxed at your slab rate. Funds redeem oldest units first (FIFO), so early SWP instalments from a seasoned corpus are mostly capital and lightly taxed.' },
    { q: 'Who should use an SWP?', a: 'Retirees converting a lifetime corpus into monthly income, people on a career break, or anyone who wants investment income without selling manually every month. A common retirement pattern: keep 2–3 years of expenses in a liquid/debt fund with an SWP running, and the rest in hybrid or equity funds refilled periodically.' },
    { q: 'What is a safe monthly withdrawal rate?', a: 'If your annual withdrawal stays below the corpus\'s long-term return, the corpus can last indefinitely — for example, withdrawing 6% a year from a corpus earning 8% grows the balance over time. The classic planning rule is 4–6% of the corpus per year (₹33,000–₹50,000 per month from ₹1 crore). Withdrawing 10%+ a year will exhaust most portfolios in 12–15 years.' },
    { q: 'How long will my corpus last?', a: 'Depends on the gap between withdrawal rate and return rate. From ₹50 lakh earning 8% (monthly growth ≈ ₹33,300): withdrawing ₹30,000/month never exhausts the corpus — it keeps growing; ₹40,000/month lasts about 22 years; ₹50,000/month about 14 years. This calculator shows the exact month the corpus runs out for your inputs.' },
    { q: 'Is SWP better than FD monthly interest payout?', a: 'Usually, for taxable investors. FD interest is fully taxed at your slab rate every year, while SWP withdrawals are mostly your own capital in early years, with gains taxed at concessional LTCG rates for equity funds. FDs win on certainty — returns are guaranteed, while fund NAVs fluctuate. Many retirees split: FD/annuity for essential expenses, SWP for the rest.' },
    { q: 'Which funds are best for SWP?', a: 'Funds with moderate volatility: balanced advantage funds, equity savings funds, conservative hybrid funds, or short-duration debt funds. Running an SWP directly on a small-cap fund is risky — withdrawing fixed amounts during a crash sells more units at low prices (sequence-of-returns risk), permanently damaging the corpus.' },
    { q: 'Can I change or stop my SWP anytime?', a: 'Yes. SWP is just an instruction to the AMC — you can modify the amount, frequency or date, pause it, or cancel it at any time without penalty. The underlying investment stays untouched apart from the withdrawals already made.' },
    { q: 'Do exit loads apply to SWP withdrawals?', a: 'Yes, if the units redeemed are still within the fund\'s exit-load window (commonly 1% within 1 year for equity funds). Plan the SWP to start after the exit-load period, or fund the first year\'s withdrawals from a liquid fund with no load.' },
    { q: 'Is there TDS on SWP withdrawals?', a: 'For resident investors, no TDS is deducted on mutual fund redemptions — you self-report gains in your ITR. For NRIs, TDS applies on the capital gain portion of each redemption. Either way, tax is only on gains, not the full withdrawal.' },
    { q: 'Can I run an SWP and SIP at the same time?', a: 'Yes — a common structure is SIP into equity funds during working years, then at retirement, moving the corpus in stages into hybrid/debt funds and starting an SWP from those. Some investors run both simultaneously across different goals; just avoid SWP-ing out of the same fund you are SIP-ing into, which only churns units and triggers taxes.' },
  ];

  return (
    <>
      <Helmet>
        <title>SWP Calculator 2026 — Systematic Withdrawal Plan Calculator | RupeePedia</title>
        <meta name="description" content="Free SWP Calculator — calculate how long your corpus will last with monthly withdrawals. See month-by-month withdrawal schedule and final value." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/swp" />
        <meta property="og:title" content="SWP Calculator 2026 — Systematic Withdrawal Plan Calculator | RupeePedia" />
        <meta property="og:description" content="Free SWP Calculator — calculate how long your corpus will last with monthly withdrawals. See month-by-month withdrawal schedule and final value." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/swp" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="SWP Calculator 2026 — Systematic Withdrawal Plan Calculator | RupeePedia" />
        <meta name="twitter:description" content="Free SWP Calculator — calculate how long your corpus will last with monthly withdrawals. See month-by-month withdrawal schedule and final value." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'SWP Calculator',
          url: 'https://rupeepedia.in/calculators/swp',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free Systematic Withdrawal Plan calculator — see how long a corpus lasts with fixed monthly withdrawals, with a month-by-month schedule of interest, withdrawal and balance.',
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
            { '@type': 'ListItem', position: 3, name: 'SWP Calculator', item: 'https://rupeepedia.in/calculators/swp' },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50">
        <CalculatorHero
          crumb="SWP"
          title="SWP"
          accent="Calculator"
          subtitle="How long your corpus lasts with monthly withdrawals."
          icon={Wallet}
        />

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
                <Link to="/calculators/sip" className="mt-4 bg-brand-600 text-white font-bold text-sm rounded-xl py-3 hover:bg-brand-700 transition-colors text-center">
                  Build a corpus first — SIP Calculator →
                </Link>
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

          {/* ── Article (always in DOM for SEO) ── */}
          <article className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">What is an SWP and how does the math work?</h2>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  A <strong>Systematic Withdrawal Plan (SWP)</strong> is the reverse of a SIP: instead of investing a fixed
                  amount every month, you <em>redeem</em> a fixed amount every month while the rest of the corpus stays
                  invested. Each month the fund credits your bank account and sells just enough units at that day's NAV
                  to cover it. It is the standard tool for turning a retirement corpus into a monthly income.
                </p>
                <p>
                  The whole game is the gap between your <strong>withdrawal rate</strong> and the corpus's
                  <strong> return rate</strong>. If the corpus earns more each month than you take out, the balance grows
                  forever — you're living off returns and never touching principal. If you withdraw more, the corpus
                  shrinks, and the shrinking accelerates because each month there is less capital earning returns. A
                  small change in withdrawal makes a huge difference in longevity, which is exactly what the schedule
                  table above shows month by month.
                </p>
                <p>
                  The tax treatment is what makes SWP popular over FDs and dividend plans: every withdrawal is part
                  <em> your own capital</em> (never taxed) and part gain (taxed at capital-gains rates, not slab rates for
                  equity funds). In the early years of an SWP most of each instalment is capital, so the effective tax
                  on your income stream is remarkably low.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">How long does {fmtShort(investment)} last? (at {rate}% return)</h2>
              <p className="text-xs text-slate-400 mb-3">Computed with the same engine as the calculator — change the sliders above to update.</p>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Monthly withdrawal</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Annual rate</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Corpus lasts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0.004, 0.006, 0.008, 0.01, 0.0125].map(f => {
                      const w = Math.round(investment * f / 500) * 500;
                      if (w <= 0) return null;
                      const lasts = monthsLasting(investment, w, rate);
                      return (
                        <tr key={f} className={`border-t border-slate-50 ${Math.abs(w - withdrawal) < 500 ? 'bg-brand-50' : ''}`}>
                          <td className="px-4 py-2.5 font-bold text-brand-600">{fmtINR(w)}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{(f * 12 * 100).toFixed(1)}% of corpus/yr</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                            {lasts === 'forever' ? <span className="text-green-600">Grows forever ✓</span> : `${Math.floor(lasts / 12)}y ${lasts % 12}m`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">"Grows forever" means monthly returns exceed the withdrawal, so the balance rises over time. Real fund returns fluctuate — build a safety margin.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">SWP vs FD interest vs dividend plans</h2>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Feature</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">SWP</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">FD monthly payout</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Dividend (IDCW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Amount & timing', 'You choose, fixed', 'Fixed by FD rate', 'Fund decides, irregular'],
                      ['Tax on payout', 'Only gains portion, LTCG rates', 'Fully taxed at slab', 'Fully taxed at slab'],
                      ['Capital growth', 'Remaining corpus stays invested', 'Principal fixed, no growth', 'NAV drops by payout'],
                      ['Return certainty', 'Market-linked', 'Guaranteed', 'Market-linked'],
                      ['Flexibility', 'Change/stop anytime', 'Locked till maturity', 'None'],
                    ].map(([f, a, b, c]) => (
                      <tr key={f} className="border-t border-slate-50 align-top">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{f}</td>
                        <td className="px-4 py-2.5 text-slate-600">{a}</td>
                        <td className="px-4 py-2.5 text-slate-600">{b}</td>
                        <td className="px-4 py-2.5 text-slate-600">{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </article>

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
                  {/* Always mounted so content stays in the DOM for search engines */}
                  <div className={`px-4 pb-4 pt-2 text-sm text-slate-500 leading-relaxed border-t border-slate-50 ${openFaq === i ? '' : 'hidden'}`}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Related tools */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Related calculators</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { path: '/calculators/sip', label: 'SIP Calculator', desc: 'Build the corpus your SWP will draw from' },
                { path: '/calculators/lumpsum', label: 'Lumpsum Calculator', desc: 'One-time investment growth projection' },
                { path: '/calculators/fd', label: 'FD Calculator', desc: 'Compare with fixed deposit monthly payouts' },
                { path: '/calculators/nps', label: 'NPS Calculator', desc: 'Pension corpus and annuity estimate' },
              ].map(t => (
                <Link key={t.path} to={t.path} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition">{t.label}</span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500 transition flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
