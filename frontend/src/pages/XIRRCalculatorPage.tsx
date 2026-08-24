// File: frontend/src/pages/XIRRCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';

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
    { q: 'Why does my SIP show low XIRR even when the fund has high returns?', a: 'Two usual reasons. First, recency: your latest instalments have been invested only months, so a young SIP\'s XIRR is dominated by recent market moves — a 1-year-old SIP in a falling market shows negative XIRR even in a great fund. Second, the fund\'s CAGR measures its NAV point-to-point, while your XIRR measures YOUR cash flows; if the market rose early and stagnated after most of your money went in, your XIRR will lag the fund\'s CAGR.' },
    { q: 'Can XIRR be negative, and what does it mean?', a: 'Yes — it means your investment is currently worth less than what you put in, expressed as an annual rate. Negative XIRR in the first 1–2 years of an equity SIP is common and says little about the fund; short-period XIRR swings wildly with the market. Judge equity SIP XIRR only after 3+ years of instalments.' },
    { q: 'How do I include withdrawals or partial redemptions in XIRR?', a: 'Add them as positive cash flows on their actual dates: every investment negative, every redemption positive, and the current portfolio value as a final positive flow dated today. Excel\'s =XIRR() handles any mix of flows. This calculator models the common case — regular instalments plus one maturity value.' },
    { q: 'Is XIRR the same as IRR?', a: 'Same concept, different time handling. IRR assumes cash flows at perfectly regular intervals; XIRR uses actual dates, weighting each flow by its exact time invested. Real investing is irregular — SIP dates shift with holidays, you add lump sums — so XIRR is the accurate version and the industry standard for portfolio returns.' },
    { q: 'What XIRR do apps like Groww, Coin or Kuvera show?', a: 'The same computation this calculator performs: all your purchases as negative flows on their dates, redemptions as positive flows, current value as the final flow. That is why the app\'s XIRR differs from the factsheet CAGR — the factsheet measures the NAV\'s journey, the app measures your money\'s journey.' },
    { q: 'Is comparing SIP XIRR with FD rates fair?', a: 'As a report card, yes; as a forecast, no. An FD rate is guaranteed in advance; XIRR is realised and backward-looking — a 13% SIP XIRR does not promise the next 3 years repeat it. Also compare post-tax: FD interest is taxed at your slab rate every year, while equity LTCG is 12.5% above ₹1.25 lakh, deferred until you sell.' },
  ];

  return (
    <>
      <Helmet>
        <title>XIRR Calculator 2026 — Calculate SIP Returns with XIRR | RupeePedia</title>
        <meta name="description" content="Free XIRR Calculator — calculate the Extended Internal Rate of Return on your SIP investments. Enter investment frequency, amount, and maturity value." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/xirr" />
        <meta property="og:title" content="XIRR Calculator 2026 — Calculate SIP Returns with XIRR | RupeePedia" />
        <meta property="og:description" content="Free XIRR Calculator — calculate the Extended Internal Rate of Return on your SIP investments. Enter investment frequency, amount, and maturity value." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/xirr" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="XIRR Calculator 2026 — Calculate SIP Returns with XIRR | RupeePedia" />
        <meta name="twitter:description" content="Free XIRR Calculator — calculate the Extended Internal Rate of Return on your SIP investments. Enter investment frequency, amount, and maturity value." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'XIRR Calculator',
          url: 'https://rupeepedia.in/calculators/xirr',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free XIRR calculator using Newton-Raphson iteration — annualised return on SIP-style investments from frequency, amount, dates and maturity value.',
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
            { '@type': 'ListItem', position: 3, name: 'XIRR Calculator', item: 'https://rupeepedia.in/calculators/xirr' },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-bg">
        <CalculatorHero
          crumb="XIRR"
          title="XIRR"
          accent="Calculator"
          subtitle="True annualised return on SIPs and multiple cash flows."
          icon={TrendingUp}
        />

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-surface rounded-lg border border-line border-l-4 border-l-acc p-6">

            {/* Frequency selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-body mb-3">Investment Frequency</label>
              <div className="flex gap-2 flex-wrap">
                {FREQ_OPTIONS.map((f, i) => (
                  <button key={i} onClick={() => setFreq(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${freq === i ? 'bg-acc border-acc text-white' : 'border-line text-muted hover:border-acc'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Start date */}
                <div>
                  <label className="block text-sm font-semibold text-body mb-2">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-bg-2 text-ink focus:outline-none focus:border-acc" />
                </div>

                {/* End / Maturity date */}
                <div>
                  <label className="block text-sm font-semibold text-body mb-2">Maturity Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-bg-2 text-ink focus:outline-none focus:border-acc" />
                </div>

                {/* SIP amount */}
                <div>
                  <label className="block text-sm font-semibold text-body mb-2">Recurring Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint font-bold text-sm">₹</span>
                    <input type="number" value={sipAmount} onChange={e => setSipAmount(e.target.value)}
                      placeholder="e.g. 10000"
                      className={`w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm text-ink font-semibold focus:outline-none ${!P ? 'border-coral/50 bg-coral/10' : 'border-line bg-bg-2 focus:border-acc'}`} />
                  </div>
                </div>

                {/* Maturity value */}
                <div>
                  <label className="block text-sm font-semibold text-body mb-2">Total Maturity Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint font-bold text-sm">₹</span>
                    <input type="number" value={maturity} onChange={e => setMaturity(e.target.value)}
                      placeholder="e.g. 500000"
                      className={`w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm text-ink font-semibold focus:outline-none ${!MV ? 'border-coral/50 bg-coral/10' : 'border-line bg-bg-2 focus:border-acc'}`} />
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-acc-deep to-surface border border-acc/25 rounded-xl p-5 text-ink shadow-acc-glow">
                  <div className="text-xs uppercase tracking-widest text-muted font-semibold mb-1">Your XIRR</div>
                  <div className={`text-4xl font-bold tracking-tight text-ink ${!xirr ? 'opacity-30' : ''}`}>
                    {xirr !== null ? `${xirr.toFixed(2)}%` : '—'}
                  </div>
                  {xirr !== null && invested > 0 && (
                    <>
                      <hr className="border-line my-3" />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted">No. of instalments</span><span className="font-bold text-ink">{numInstallments}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Total invested</span><span className="font-bold text-ink">{fmtINR(invested)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Maturity value</span><span className="font-bold text-ink">{fmtINR(MV)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Total gain</span><span className={`font-bold ${gain >= 0 ? 'text-mint' : 'text-coral'}`}>{gain >= 0 ? '+' : ''}{fmtINR(gain)}</span></div>
                      </div>
                    </>
                  )}
                  {xirr === null && P > 0 && MV > 0 && (
                    <p className="text-xs text-muted mt-3">Could not compute XIRR. Check that end date is after start date and maturity amount is valid.</p>
                  )}
                </div>

                <div className="bg-acc-deep border border-acc/20 rounded-xl p-4 text-xs text-body leading-relaxed">
                  <strong>How it works:</strong> XIRR treats each {FREQ_OPTIONS[freq].label.toLowerCase()} instalment of {P ? fmtINR(P) : '₹—'} as a negative cash flow, and the maturity value as a positive cash flow. It then finds the annual discount rate that makes the NPV of all these flows equal to zero.
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-surface rounded-lg border border-line p-6">
            <h2 className="text-lg font-bold text-ink mb-4">About XIRR</h2>
            <div className="space-y-3 text-sm text-muted leading-relaxed">
              <p>XIRR is the standard way to measure SIP returns. When you invest ₹10,000/month for 10 years, your first instalment was in the market for 10 years while the last was in the market for just 1 month. XIRR correctly weights each instalment by its time invested.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {[
                  { icon: '📅', title: 'Date-aware', desc: 'Accounts for the exact date of each investment — essential for irregular SIPs.' },
                  { icon: '🔄', title: 'Multiple cash flows', desc: 'Works with any number of investments and withdrawals at any dates.' },
                  { icon: '📊', title: 'Industry standard', desc: 'All mutual fund statements in India show XIRR as the return metric for SIPs.' },
                  { icon: '🧮', title: 'Iterative calculation', desc: 'Cannot be solved directly — requires numerical iteration (Newton-Raphson method).' },
                ].map(item => (
                  <div key={item.title} className="bg-surface-2 rounded-lg p-3 border border-line">
                    <div className="text-base mb-1">{item.icon}</div>
                    <div className="font-semibold text-xs text-body mb-0.5">{item.title}</div>
                    <div className="text-xs text-muted">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Article (always in DOM for SEO) ── */}
          <article className="bg-surface rounded-lg border border-line p-6 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Why XIRR is the only honest return for SIPs</h2>
              <div className="text-sm text-muted space-y-3 leading-relaxed">
                <p>
                  Point-to-point returns lie about SIPs. If you invested ₹10,000 monthly for 3 years and your ₹3.6 lakh
                  became ₹4.5 lakh, the naive "25% gain" ignores that only your first instalment worked for 3 full
                  years — the last one worked for a month. <strong>XIRR fixes this by dating every rupee</strong>: it finds the
                  single annual rate at which all your dated investments would have had to grow to reach the final
                  value. That example's XIRR is about 15% a year — the number genuinely comparable with an FD rate
                  or a fund's CAGR.
                </p>
                <p>
                  This is why every mutual fund app and CAS statement reports XIRR for SIP holdings, and why a fund
                  factsheet CAGR and your personal XIRR in the same fund almost never match: the factsheet measures
                  the NAV's journey, XIRR measures <em>your money's</em> journey — which depends on when each instalment
                  went in.
                </p>
                <p>
                  Reading it well: ignore XIRR for SIPs younger than ~2 years (statistical noise), expect equity SIP
                  XIRRs of 10–14% over long periods, and treat sudden jumps or crashes in XIRR after market moves as
                  recency effects on your latest instalments, not a change in the fund's quality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Calculate XIRR in Excel or Google Sheets</h2>
              <div className="text-sm text-muted space-y-3 leading-relaxed">
                <p>Two columns — dates and cash flows. Investments negative, money received positive, current value as the last positive row:</p>
                <div className="overflow-x-auto rounded-lg border border-line max-h-[340px] overflow-y-auto">
                  <table className="w-full text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-surface-2 sticky top-0">
                        <th className="text-left px-4 py-2 font-semibold text-muted">A (Date)</th>
                        <th className="text-right px-4 py-2 font-semibold text-muted">B (Cash flow)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['01-01-2024', '-10,000'],
                        ['01-02-2024', '-10,000'],
                        ['01-03-2024', '-10,000'],
                        ['…', '…'],
                        ['01-07-2026', '+3,95,000'],
                      ].map(([d, c]) => (
                        <tr key={d + c} className="border-t border-line">
                          <td className="px-4 py-1.5 text-muted">{d}</td>
                          <td className={`px-4 py-1.5 text-right ${c.startsWith('+') ? 'text-mint' : 'text-muted'}`}>{c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>Then <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs">=XIRR(B:B, A:A)</code> returns the annualised rate. Google Sheets uses the identical function. If it errors, check that there is at least one negative and one positive flow and dates are real date values, not text.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Which return metric when?</h2>
              <div className="overflow-x-auto rounded-lg border border-line max-h-[340px] overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-2 sticky top-0">
                      <th className="text-left px-4 py-2.5 font-semibold text-muted">Situation</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted">Right metric</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['One-time lumpsum, held', 'CAGR', 'Single flow in, single value out — CAGR is exact'],
                      ['Monthly SIP', 'XIRR', 'Each instalment has its own time in market'],
                      ['SIP + lump sums + withdrawals', 'XIRR', 'Handles any dated cash flow mix'],
                      ['Comparing two funds', 'CAGR / rolling returns', 'Measures the fund, independent of your timing'],
                      ['Your actual portfolio result', 'XIRR', 'Measures your money, including your timing'],
                    ].map(([s, m, w]) => (
                      <tr key={s} className="border-t border-line">
                        <td className="px-4 py-2.5 font-semibold text-body">{s}</td>
                        <td className="px-4 py-2.5 font-bold text-acc">{m}</td>
                        <td className="px-4 py-2.5 text-muted">{w}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </article>

          {/* FAQ */}
          <div className="bg-surface rounded-lg border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-line rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-body hover:bg-surface-2">
                    <span>{faq.q}</span>
                    <span className={`text-faint text-xs ml-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {/* Always mounted so content stays in the DOM for search engines */}
                  <div className={`px-4 pb-4 pt-2 text-sm text-muted leading-relaxed border-t border-line ${openFaq === i ? '' : 'hidden'}`}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Related tools */}
          <div className="bg-surface rounded-lg border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Related calculators</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { path: '/calculators/cagr', label: 'CAGR Calculator', desc: 'Annualised return for lumpsum investments' },
                { path: '/calculators/sip', label: 'SIP Calculator', desc: 'Project future SIP growth at an assumed rate' },
                { path: '/calculators/step-up-sip', label: 'Step-Up SIP Calculator', desc: 'SIP with annual increases' },
                { path: '/calculators/mutual-fund', label: 'Mutual Fund Calculator', desc: 'Lumpsum + SIP combined projection' },
              ].map(t => (
                <Link key={t.path} to={t.path} className="border border-line rounded-lg p-4 hover:border-acc transition group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-body group-hover:text-acc transition">{t.label}</span>
                    <ArrowRight size={14} className="text-faint group-hover:text-acc transition flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-faint mt-1">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
