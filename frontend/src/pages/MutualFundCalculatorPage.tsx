// File: frontend/src/pages/MutualFundCalculatorPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import SliderInput from '../components/SliderInput';
import CalculatorHero from '../components/CalculatorHero';

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

// ── FAQ data (rendered on page + JSON-LD from the same list) ─────────────────
const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is absolute return in mutual funds?',
    a: 'Absolute return is the total percentage gain on your investment regardless of time period: (Current Value − Invested) ÷ Invested × 100. A fund that turns ₹1 lakh into ₹1.5 lakh has a 50% absolute return whether it took 2 years or 10 — which is why absolute return alone is misleading for comparing investments held for different durations. Use CAGR to compare fairly.',
  },
  {
    q: 'What is CAGR in mutual funds?',
    a: 'CAGR (Compound Annual Growth Rate) is the annualised return — the steady yearly rate that would have grown your investment from the starting value to the current value. Formula: (Final ÷ Initial)^(1/years) − 1. For a single lumpsum investment, CAGR is the right metric to compare funds, FDs and other investments on the same footing.',
  },
  {
    q: 'What is XIRR and when should I use it instead of CAGR?',
    a: 'XIRR (Extended Internal Rate of Return) handles multiple cash flows on different dates — like monthly SIP instalments, top-ups or partial redemptions. For a single lumpsum with no additions, CAGR and XIRR are the same number. If you invest via SIP, CAGR computed on total invested vs current value understates your true return; use XIRR instead.',
  },
  {
    q: 'How are mutual fund returns taxed in India (FY 2025-26)?',
    a: 'Equity funds (65%+ in Indian equities): gains within 12 months are short-term, taxed at 20%; gains after 12 months are long-term, taxed at 12.5% on the amount above ₹1.25 lakh per year. Debt funds bought on or after 1 April 2023 are taxed at your income-tax slab rate regardless of holding period, with no indexation. Hybrid and gold funds follow rules based on their equity allocation.',
  },
  {
    q: 'Which mutual fund category gives the best returns?',
    a: 'Over 10+ year periods, historical CAGRs have roughly been: small cap 14–22%, mid cap 12–18%, large cap and index funds 10–14%, hybrid 9–12%, debt/liquid 6–8%. Higher return categories come with much deeper drawdowns — small caps have fallen 60%+ in crashes. Past performance does not guarantee future returns; category averages also hide huge fund-to-fund variation.',
  },
  {
    q: 'Is a 12% return assumption realistic?',
    a: 'For diversified Indian equity funds, 11–13% CAGR over 10+ years has been the historical norm (Nifty 50 TRI has delivered ~12–13% over long periods). It is a reasonable planning assumption for long horizons, but not a promise — actual 5-year windows have ranged from negative to 20%+. For horizons under 5 years, using 12% is optimistic; debt-like assumptions (6–8%) are safer.',
  },
  {
    q: 'Lumpsum or SIP — which is better?',
    a: 'Mathematically, lumpsum wins about two-thirds of the time because markets rise more often than they fall — money invested earlier compounds longer. SIP wins when markets fall after you start, and it removes the timing decision and matches how salaried people actually receive money. Practical rule: invest a lumpsum you already have (or spread it over 3–6 months if markets feel stretched), and run SIPs from monthly income.',
  },
  {
    q: 'What is expense ratio and how much does it matter?',
    a: 'The expense ratio is the annual fee deducted from fund assets — NAV is always net of it. A 1% higher expense ratio compounds into a large drag: ₹10 lakh at 12% for 20 years grows to ₹96.5 lakh, but at 11% (same fund, 1% higher cost) only ₹80.6 lakh — ₹16 lakh lost to fees. Direct plans cost 0.5–1% less than regular plans of the same fund; index funds cost 0.1–0.3% vs 1.5–2% for active regular plans.',
  },
  {
    q: 'Does a low NAV mean a fund is cheap?',
    a: 'No. NAV is just the per-unit price of the fund\'s portfolio — a ₹10 NAV fund and a ₹500 NAV fund holding the same stocks will deliver identical percentage returns. A low NAV only means you get more units, not more value. Judge funds on portfolio quality, consistency of returns, and expense ratio — never on NAV level.',
  },
  {
    q: 'What is exit load?',
    a: 'Exit load is a redemption charge, typically 1% if you sell equity fund units within 1 year of purchase (liquid funds: within 7 days, graded). It is deducted from your redemption proceeds. Most funds charge nothing after the load period. Check the scheme document — exit load plus short-term capital gains tax makes early exits from equity funds expensive.',
  },
  {
    q: 'How long should I stay invested in mutual funds?',
    a: 'Equity funds need a minimum 5-year horizon, ideally 7–10+ years — over 10-year windows, diversified Indian equity funds have almost never lost money, while 1-year windows lose money roughly a quarter of the time. Debt and liquid funds suit 1–3 year goals. Match the fund category to the goal date, not to recent returns.',
  },
  {
    q: 'Can NRIs invest in Indian mutual funds?',
    a: 'Yes, NRIs can invest through their NRE or NRO bank accounts after completing KYC with their overseas address. Gains are taxed in India at the same rates as residents, but TDS is deducted at redemption (12.5% on equity LTCG, 20% on equity STCG). US and Canada-based NRIs face FATCA-related restrictions — only some AMCs (e.g. a limited list) accept them. NRE-funded investments are fully repatriable.',
  },
  {
    q: 'How does this mutual fund calculator work?',
    a: 'Enter your lumpsum amount, expected annual return and holding period — the calculator compounds the amount annually to show maturity value, absolute return, CAGR and wealth multiplier. If you already know the current value of an old investment, enter it in the "final value" box and the calculator back-solves the implied CAGR you actually earned. The category table shows what the same lumpsum would become at typical category returns.',
  },
];

// ── Doubling table (rule of 72 illustration) ─────────────────────────────────
const DOUBLING = [
  { rate: 6,  years: '12.0 yr', label: 'Debt / FD-like' },
  { rate: 8,  years: '9.0 yr',  label: 'Conservative hybrid' },
  { rate: 10, years: '7.2 yr',  label: 'Balanced equity' },
  { rate: 12, years: '6.0 yr',  label: 'Index / large cap' },
  { rate: 15, years: '4.8 yr',  label: 'Mid cap (historical)' },
  { rate: 18, years: '4.0 yr',  label: 'Small cap (historical)' },
];

export default function MutualFundCalculatorPage() {
  const [invested,   setInvested]   = useState(100000);
  const [returnRate, setReturnRate] = useState(12);
  const [years,      setYears]      = useState(5);
  const [finalValue, setFinalValue] = useState<string>('');
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);

  const maturity     = invested * Math.pow(1 + returnRate / 100, years);
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

  return (
    <>
      <Helmet>
        <title>Mutual Fund Returns Calculator 2026 — CAGR & Absolute Returns | RupeePedia</title>
        <meta name="description" content="Calculate lumpsum mutual fund returns — maturity value, absolute return and CAGR. Compare fund categories, understand MF taxation (12.5% LTCG), expense ratio impact, with examples and FAQs." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/mutual-fund" />
        <meta property="og:title" content="Mutual Fund Returns Calculator 2026 — CAGR & Absolute Returns | RupeePedia" />
        <meta property="og:description" content="Calculate mutual fund returns — absolute return and CAGR. Compare returns across all fund categories. Free and instant." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/mutual-fund" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Mutual Fund Returns Calculator 2026 — CAGR & Absolute Returns | RupeePedia" />
        <meta name="twitter:description" content="Calculate mutual fund returns — absolute return and CAGR. Compare returns across all fund categories. Free and instant." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Mutual Fund Returns Calculator',
          url: 'https://rupeepedia.in/calculators/mutual-fund',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free lumpsum mutual fund returns calculator — maturity value, absolute return, CAGR back-calculation and category-wise comparison.',
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.map(f => ({
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
            { '@type': 'ListItem', position: 3, name: 'Mutual Fund Returns Calculator', item: 'https://rupeepedia.in/calculators/mutual-fund' },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50">
        <CalculatorHero
          crumb="Mutual Fund"
          title="Mutual Fund"
          accent="Returns"
          subtitle="Lumpsum maturity, CAGR and category comparison."
          icon={TrendingUp}
        />

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-brand-600 p-6">
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
                      className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-xl p-5 text-white">
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
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Absolute Return</span><span className="font-bold text-brand-600">{displayAbsRet.toFixed(2)}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">CAGR (Annualised)</span><span className="font-bold text-brand-600">{displayCAGR.toFixed(2)}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Wealth Multiplier</span><span className="font-bold text-slate-700">{(displayMaturity / invested).toFixed(2)}x</span></div>
                </div>

                <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-xs text-brand-700">
                  For SIP-based return calculation, use the <Link to="/calculators/xirr" className="font-bold underline">XIRR Calculator →</Link>
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
                      <tr key={cat.label} className={`border-t border-slate-50 hover:bg-slate-50 ${cat.typical === returnRate ? 'bg-brand-50' : ''}`}>
                        <td className="px-4 py-3 font-medium text-slate-700">{cat.label}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cat.typical >= 14 ? 'bg-brand-200 text-brand-800' : cat.typical >= 10 ? 'bg-brand-100 text-brand-700' : 'bg-brand-50 text-brand-600'}`}>{cat.typical}%</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">{fmtShort(val)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Article ── */}
          <article className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-base font-bold text-slate-900 mb-3">How lumpsum mutual fund returns work</h2>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  A lumpsum investment compounds as <strong>Final Value = Amount × (1 + r)<sup>n</sup></strong>, where r is the
                  annual return and n the number of years. The two numbers that describe the outcome are
                  <strong> absolute return</strong> (total % gain, ignores time) and <strong>CAGR</strong> (annualised rate, lets you
                  compare a 3-year investment against a 10-year one fairly). This calculator shows both, plus the
                  wealth multiplier — how many times your money grew.
                </p>
                <p>
                  Compounding is back-loaded: at 12%, ₹1 lakh becomes ₹1.76 lakh in 5 years but ₹9.65 lakh in 20 years —
                  the last 5 years alone add more than the first 10. This is why equity investing rewards long holding
                  periods, and why starting 5 years earlier usually beats picking a slightly better fund.
                </p>
                <p>
                  A quick mental shortcut is the <strong>rule of 72</strong>: money doubles in roughly 72 ÷ return-rate years.
                </p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-100 mt-4">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Return (p.a.)</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-slate-500">Money doubles in</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Typical of</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DOUBLING.map(d => (
                      <tr key={d.rate} className="border-t border-slate-50">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{d.rate}%</td>
                        <td className="px-4 py-2.5 text-center text-slate-700">{d.years}</td>
                        <td className="px-4 py-2.5 text-slate-500">{d.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-base font-bold text-slate-900 mb-3">Mutual fund taxation — FY 2025-26</h2>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Fund type</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Short-term</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Long-term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Equity funds (≥65% Indian equity)', '< 12 months: 20%', '≥ 12 months: 12.5% on gains above ₹1.25L/yr'],
                      ['Debt funds (bought on/after 1 Apr 2023)', 'Slab rate (any holding period)', 'Slab rate — no indexation, no LTCG rate'],
                      ['Hybrid — equity-oriented (≥65% equity)', 'Same as equity funds', 'Same as equity funds'],
                      ['Gold / international / debt-oriented hybrid', 'Slab rate < 24 months', '12.5% after 24 months'],
                    ].map(([type, st, lt]) => (
                      <tr key={type} className="border-t border-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-700">{type}</td>
                        <td className="px-4 py-2.5 text-slate-600">{st}</td>
                        <td className="px-4 py-2.5 text-slate-600">{lt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Rates per the post-July-2024 capital gains regime. Equity STCG under Section 111A, LTCG under 112A. Dividends
                (IDCW plans) are taxed at your slab rate with 10% TDS above ₹10,000/year — growth plans defer all tax to redemption.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-base font-bold text-slate-900 mb-3">Worked examples</h2>
              <div className="space-y-3">
                {[
                  {
                    title: '₹5 lakh in an index fund for 15 years',
                    body: 'At 12% CAGR: 5,00,000 × 1.12¹⁵ = ₹27.37 lakh. Absolute return 447%, wealth multiplier 5.5x. On redemption, LTCG = ₹22.37L; first ₹1.25L exempt, tax = 12.5% of ₹21.12L ≈ ₹2.64 lakh — an effective tax of under 10% of the gain.',
                  },
                  {
                    title: 'Old investment: ₹2 lakh grew to ₹3.5 lakh in 4 years — what did I earn?',
                    body: 'Implied CAGR = (3.5 ÷ 2)^(1/4) − 1 = 15.0% p.a., absolute return 75%. Enter ₹2,00,000 invested, 4 years, and ₹3,50,000 in the final-value box — the calculator back-solves this for you.',
                  },
                  {
                    title: 'Same fund, different cost: direct vs regular plan',
                    body: '₹10 lakh for 20 years at 12% (direct) grows to ₹96.5 lakh; at 11% (regular plan with ~1% extra commission) it reaches ₹80.6 lakh. The 1% fee difference costs ₹15.9 lakh — switching to direct plans is the highest-certainty "return" available.',
                  },
                ].map(ex => (
                  <div key={ex.title} className="border border-slate-100 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-1">{ex.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{ex.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
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

          {/* Related calculators */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">Related calculators</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { path: '/calculators/sip', label: 'SIP Calculator', desc: 'Monthly investing — corpus from regular instalments' },
                { path: '/calculators/xirr', label: 'XIRR Calculator', desc: 'True annualised return on SIPs and irregular cash flows' },
                { path: '/calculators/cagr', label: 'CAGR Calculator', desc: 'Annualised growth rate between any two values' },
                { path: '/calculators/swp', label: 'SWP Calculator', desc: 'Monthly withdrawals from an accumulated corpus' },
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

          <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 text-xs text-brand-700 leading-relaxed">
            <strong>Disclaimer:</strong> Returns shown are estimated. Actual mutual fund returns vary with market conditions and fund performance. Past performance does not guarantee future results. Consult a SEBI-registered investment advisor.
          </div>
        </div>
      </div>
    </>
  );
}
