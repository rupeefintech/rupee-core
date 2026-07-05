// File: frontend/src/pages/StepUpSIPPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SliderInput from '../components/SliderInput';

// Simulate a step-up SIP: monthly compounding, SIP raised once a year
function simulateStepUp(monthly: number, stepUpPct: number, ratePct: number, years: number) {
  const r = ratePct / 12 / 100;
  let corpus = 0, invested = 0, sip = monthly;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) { corpus = (corpus + sip) * (1 + r); invested += sip; }
    sip = sip * (1 + stepUpPct / 100);
  }
  return { corpus, invested };
}

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
    { q: 'What is a Step-Up SIP?', a: 'A Step-Up SIP (also called Top-Up SIP) automatically increases your SIP instalment by a fixed percentage or amount every year. You start at, say, ₹10,000 a month with a 10% annual step-up — year two runs at ₹11,000, year three at ₹12,100, and so on. As your salary grows, your investing grows with it, which compounds into a dramatically larger corpus than a flat SIP over long periods.' },
    { q: 'How much should I step up my SIP every year?', a: 'Match your realistic salary growth. A 10% annual step-up is the most popular choice because it roughly tracks average increments in India. If your raises are modest, even a 5% step-up meaningfully beats a flat SIP. Avoid overcommitting — a step-up you cancel in year three helps less than a smaller one you sustain for fifteen years.' },
    { q: 'Is a Step-Up SIP better than a regular SIP?', a: 'For the same starting amount, yes — a ₹10,000 SIP for 20 years at 12% grows to about ₹1 crore, while the same SIP with a 10% annual step-up crosses ₹2 crore. The catch is that you also invest much more money over time (about ₹69 lakh vs ₹24 lakh in that example). The honest comparison is against what you would otherwise do with your increments — usually spend them.' },
    { q: 'How is a Step-Up SIP calculated?', a: 'Each monthly instalment compounds at the expected monthly rate for the months it stays invested, and the instalment itself increases once every 12 months by the step-up percentage. There is no simple closed-form formula like a flat SIP — this calculator simulates all the months one by one, which is also how AMC top-up SIPs actually behave.' },
    { q: 'Should I step up by a percentage or a fixed amount?', a: 'AMCs offer both: percentage top-up (e.g. +10% a year) or amount top-up (e.g. +₹1,000 a year). Percentage step-ups compound and overtake fixed-amount step-ups in later years; fixed amounts are easier to budget. For long horizons (15+ years) percentage step-ups build significantly more wealth.' },
    { q: 'Can I pause or stop the step-up later?', a: 'Yes. The step-up mandate can usually be modified or cancelled like any SIP instruction — you can freeze the instalment at its current level, reduce it, or stop the SIP entirely. Some AMCs also let you set an upper cap so the instalment stops growing once it hits a limit you choose.' },
    { q: 'How are Step-Up SIP returns taxed?', a: 'Exactly like any mutual fund SIP — each instalment is a separate purchase with its own holding period. For equity funds, gains on units held over 12 months are LTCG taxed at 12.5% above ₹1.25 lakh per year; units sold within 12 months attract 20% STCG. A step-up changes the amounts, not the tax treatment.' },
    { q: 'Does Step-Up SIP work with ELSS tax-saver funds?', a: 'Yes, and it pairs well with growing 80C headroom as your salary rises. Remember each ELSS instalment is locked for 3 years from its own purchase date, so later (larger) instalments unlock later.' },
    { q: 'Is Step-Up SIP worth it for short periods like 5 years?', a: 'The advantage is modest over short horizons — most of the step-up benefit comes from the larger instalments of later years getting time to compound. Over 5 years a 10% step-up adds roughly 15–20% to the corpus; over 20 years it roughly doubles it. The longer the runway, the more the step-up matters.' },
    { q: 'Should I start a bigger flat SIP instead of stepping up?', a: 'If you can afford the bigger amount today, a larger flat SIP beats a step-up that only reaches that amount years later — money invested earlier compounds longer. The step-up exists for the realistic case where you cannot start big but your income will grow. Best practice: start with the maximum comfortable amount AND add a step-up.' },
    { q: 'Which platforms support Step-Up SIP?', a: 'Nearly all major AMCs (SBI, HDFC, ICICI Prudential, Axis, Mirae, Nippon) and platforms like Groww, Zerodha Coin, Kuvera and Paytm Money support automatic top-up SIPs. If a platform does not, you can replicate it manually by increasing your SIP amount every 12 months.' },
    { q: 'What return rate should I assume in this calculator?', a: 'For equity funds a 10–12% long-term assumption is reasonable and conservative-to-fair; aggressive assumptions above 15% set you up for disappointment. For hybrid funds use 9–10%, for debt funds 6–7%. The point of the calculator is planning, not prediction — test a pessimistic and an optimistic rate and plan for the range.' },
  ];

  return (
    <>
      <Helmet>
        <title>Step-Up SIP Calculator 2026 — Returns with Annual SIP Increase | RupeePedia</title>
        <meta name="description" content="Free Step-Up SIP Calculator — see how raising your SIP 5–15% every year multiplies your corpus vs a flat SIP. Year-wise growth table, step-up comparison, taxation and FAQs." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/step-up-sip" />
        <meta property="og:title" content="Step-Up SIP Calculator 2026 — Returns with Annual SIP Increase | RupeePedia" />
        <meta property="og:description" content="See how raising your SIP every year multiplies your corpus vs a flat SIP — with year-wise growth and comparisons." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/step-up-sip" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Step-Up SIP Calculator 2026 | RupeePedia" />
        <meta name="twitter:description" content="See how raising your SIP every year multiplies your corpus vs a flat SIP." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Step-Up SIP Calculator',
          url: 'https://rupeepedia.in/calculators/step-up-sip',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free calculator that simulates a step-up (top-up) SIP month by month, compares it with a flat SIP, and shows year-wise invested amount and corpus.',
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://rupeepedia.in/calculators' },
            { '@type': 'ListItem', position: 3, name: 'Step-Up SIP Calculator', item: 'https://rupeepedia.in/calculators/step-up-sip' },
          ],
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
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-white to-brand-50">
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Step-Up SIP Calculator</h1>
          <p className="text-brand-200 text-sm max-w-md mx-auto">See how increasing your SIP every year accelerates your wealth creation dramatically.</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-brand-600 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SliderInput label="Initial monthly SIP"        value={monthly} min={500} max={200000} step={500}  display={fmtINR(monthly)} onChange={setMonthly} parseInput={(raw: string) => Number(raw.replace(/[^0-9]/g, ''))} color="purple" />
                <SliderInput label="Annual step-up rate"        value={stepUp}  min={5}   max={50}     step={5}    display={`${stepUp}%`}    onChange={setStepUp}  color="purple" />
                <SliderInput label="Expected return rate (p.a)" value={rate}    min={1}   max={30}     step={0.5}  display={`${rate}%`}      onChange={setRate}    color="purple" />
                <SliderInput label="Time period"                value={years}   min={1}   max={40}     step={1}    display={`${years} Yr`}   onChange={setYears}   color="purple" />
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
                    <div className="flex items-center justify-center bg-brand-400" style={{ width: `${Math.round((invested / corpus) * 100)}%` }}>
                      {Math.round((invested / corpus) * 100)}%
                    </div>
                    <div className="flex items-center justify-center bg-brand-600 flex-1">
                      {Math.round((gains / corpus) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                  <div className="text-xs font-semibold text-brand-700 mb-2">vs Flat SIP (₹{monthly.toLocaleString('en-IN')}/mo)</div>
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
                        <td className="px-4 py-2.5 text-right text-brand-600 font-medium">{fmtINR(row.sip)}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600">{fmtINR(row.invested)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-800">{fmtINR(row.corpus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Article (always in DOM for SEO) ── */}
          <article className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">What is a Step-Up SIP and why does it beat a flat SIP?</h2>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  A <strong>Step-Up SIP</strong> (top-up SIP) raises your monthly investment by a fixed percentage every
                  year — typically 5–15%, mirroring salary increments. A flat ₹10,000 SIP stays ₹10,000 for twenty
                  years even as your income doubles or triples; a step-up SIP makes your investing keep pace with
                  your earning.
                </p>
                <p>
                  The math compounds twice: your instalment grows every year, <em>and</em> each rupee still earns
                  market returns for the remaining years. The later instalments are much bigger, but the effect is
                  strongest on long horizons where even those larger instalments get a decade or more to grow. That's
                  why the advantage looks modest at 5 years and dramatic at 20.
                </p>
                <p>
                  The honest caveat: a step-up SIP invests more of your money, so of course it ends bigger. Its real
                  value is behavioural — it automatically routes future increments into investing before lifestyle
                  inflation absorbs them.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Step-up rate comparison for your inputs</h2>
              <p className="text-xs text-slate-400 mb-3">Starting at {fmtINR(monthly)}/month, {rate}% expected return, {years} years — computed with the same engine as the calculator above.</p>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Annual step-up</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total invested</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Final corpus</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">vs flat SIP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 5, 10, 15].map(s => {
                      const sim = simulateStepUp(monthly, s, rate, years);
                      const flat = simulateStepUp(monthly, 0, rate, years);
                      return (
                        <tr key={s} className={`border-t border-slate-50 ${s === stepUp ? 'bg-brand-50' : ''}`}>
                          <td className="px-4 py-2.5 font-bold text-brand-600">{s === 0 ? 'Flat SIP (0%)' : `${s}%`}</td>
                          <td className="px-4 py-2.5 text-right text-slate-600">{fmtShort(sim.invested)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-800">{fmtShort(sim.corpus)}</td>
                          <td className="px-4 py-2.5 text-right text-green-600 font-semibold">{s === 0 ? '—' : '+' + fmtShort(sim.corpus - flat.corpus)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">How to set up a Step-Up SIP</h2>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal ml-5">
                <li><strong>Pick the fund and base amount</strong> — start with the highest amount you can comfortably sustain today.</li>
                <li><strong>Choose the top-up type</strong> — percentage (compounds, better long term) or fixed amount (easier to budget). Most AMC forms and apps offer both.</li>
                <li><strong>Set a cap if you want one</strong> — e.g. stop increasing once the instalment reaches ₹50,000/month.</li>
                <li><strong>Align the step-up month with your appraisal cycle</strong> — the increase lands right when your salary rises, so you never feel it.</li>
                <li><strong>Review yearly, don't tinker monthly</strong> — the entire benefit comes from staying invested through cycles.</li>
              </ol>
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
                { path: '/calculators/sip', label: 'SIP Calculator', desc: 'Flat SIP growth projection' },
                { path: '/calculators/goal-sip', label: 'Goal SIP Calculator', desc: 'SIP needed to hit a target corpus' },
                { path: '/calculators/lumpsum', label: 'Lumpsum Calculator', desc: 'One-time investment growth' },
                { path: '/calculators/swp', label: 'SWP Calculator', desc: 'Turn the corpus into monthly income later' },
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
