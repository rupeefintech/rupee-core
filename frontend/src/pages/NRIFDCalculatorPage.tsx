import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Info, ChevronDown, ChevronUp, ArrowRight, Landmark } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtPct = (n: number) => n.toFixed(2) + '%';

type FDType = 'NRE' | 'NRO' | 'FCNR';

interface FDResult {
  type: FDType;
  label: string;
  grossInterest: number;
  tds: number;
  netInterest: number;
  maturity: number;
  effectiveRate: number;
  taxable: boolean;
  repatriable: string;
  currency: string;
  highlight: string;
  bg: string;
  border: string;
  textColor: string;
}

function calcFD(principal: number, ratePercent: number, years: number, tdsRate: number): {
  grossInterest: number; tds: number; netInterest: number; maturity: number;
} {
  const rate = ratePercent / 100;
  const maturity = principal * Math.pow(1 + rate / 4, 4 * years); // quarterly compounding
  const grossInterest = maturity - principal;
  const tds = grossInterest * tdsRate;
  return { grossInterest, tds, netInterest: grossInterest - tds, maturity: principal + grossInterest - tds };
}

// ── FAQ data (rendered on page + JSON-LD from the same list) ─────────────────
const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is an NRE FD?',
    a: 'An NRE (Non-Resident External) fixed deposit is opened with foreign earnings remitted to India and converted to rupees. Interest is fully exempt from Indian income tax under Section 10(4) as long as you hold NRI status, and both principal and interest are freely repatriable abroad without limit. It is the default choice for parking foreign income in India.',
  },
  {
    q: 'What is an NRO FD?',
    a: 'An NRO (Non-Resident Ordinary) fixed deposit holds income earned in India — rent, dividends, pension, or sale proceeds. Interest is fully taxable in India, with TDS deducted at 30% plus 4% cess (31.2% effective, plus surcharge on large amounts). Repatriation from an NRO account is limited to USD 1 million per financial year, with a CA certificate in Form 15CA/15CB.',
  },
  {
    q: 'What is an FCNR FD?',
    a: 'An FCNR(B) (Foreign Currency Non-Resident) deposit is held in a foreign currency — USD, GBP, EUR, AUD, CAD, SGD, JPY and others — so there is no rupee conversion and no exchange-rate risk. Interest is exempt from Indian tax while you are an NRI (and remains exempt as an RNOR). Tenures run 1 to 5 years. Rates are lower than NRE rates because the bank, not you, carries the currency risk.',
  },
  {
    q: 'Which FD is best for NRIs — NRE, NRO or FCNR?',
    a: 'For fresh foreign income: NRE FD usually wins — tax-free interest at INR rates (typically 6–7.5%), fully repatriable. Choose FCNR if you plan to take the money back abroad and want zero rupee-depreciation risk — a 5% USD FCNR can beat a 7% NRE FD if the rupee depreciates more than ~2% a year. NRO FD is not a choice but a necessity for income that arises in India.',
  },
  {
    q: 'Is NRE FD interest really tax-free?',
    a: 'Yes — under Section 10(4)(ii) of the Income Tax Act, interest on NRE deposits is exempt from Indian income tax as long as you qualify as a "person resident outside India" under FEMA. It may still be taxable in your country of residence (the US taxes it, the UAE does not). Once you return to India and lose NRI status, the exemption ends.',
  },
  {
    q: 'What happens to my NRE and FCNR FDs when I return to India?',
    a: 'On return, you must inform the bank and re-designate accounts: NRE accounts become resident accounts (or RFC accounts), and interest becomes taxable from the date your FEMA residency changes. FCNR deposits can run until original maturity at the contracted rate, and their interest stays tax-exempt while you qualify as RNOR (Resident but Not Ordinarily Resident) — often 2–3 years after return. Check your RNOR eligibility with our RNOR calculator.',
  },
  {
    q: 'Can an NRI open a joint FD with a resident Indian?',
    a: 'NRE and FCNR deposits can be held jointly only with another NRI/OCI, or with a resident close relative on a "former or survivor" basis (the resident can operate it only as power-of-attorney holder). NRO accounts can be held jointly with a resident close relative on either former-or-survivor or even-or-survivor basis.',
  },
  {
    q: 'What are the premature withdrawal rules for NRI FDs?',
    a: 'NRE and FCNR deposits require a minimum 1-year holding to earn any interest — break them before 1 year and banks pay zero interest. After 1 year, premature closure earns the rate for the period actually run, usually minus a 0.5–1% penalty. NRO FDs follow normal resident FD rules (interest for period run minus penalty, no 1-year bar).',
  },
  {
    q: 'Can DTAA reduce the 30% TDS on NRO FD interest?',
    a: 'Yes. Under most Double Taxation Avoidance Agreements, tax on interest is capped at 10–15% (e.g. 12.5–15% for the US, 15% for the UK, 12.5% for UAE residents under conditions). To get the treaty rate applied as TDS, submit a Tax Residency Certificate (TRC) from your country, Form 10F, and a no-PE declaration to the bank each financial year. Otherwise the bank deducts 31.2% and you claim the excess as a refund via ITR.',
  },
  {
    q: 'Can I take a loan against my NRI FD?',
    a: 'Yes. Banks lend against NRE, NRO and FCNR deposits — typically up to 90–95% of the deposit value, in India (INR) or sometimes abroad (foreign currency against FCNR). The loan must not be repatriated abroad if taken in rupees, and cannot be used for re-lending or real-estate trading. This lets you meet cash needs without breaking a tax-free deposit before the 1-year mark.',
  },
  {
    q: 'Do US-based NRIs have to report Indian FDs?',
    a: 'Yes. US persons must report Indian bank accounts (including NRE/NRO/FCNR FDs) on FBAR (FinCEN 114) if aggregate foreign balances exceed USD 10,000 any time in the year, and on Form 8938 (FATCA) above higher thresholds. NRE FD interest, though tax-free in India, is fully taxable on a US return. Similar rules apply in Canada (T1135). Non-reporting penalties are severe — this often decides whether NRE FDs make sense for US/Canada NRIs.',
  },
  {
    q: 'How does this NRI FD calculator work?',
    a: 'Enter the deposit amount, tenure and the interest rate for each deposit type. The calculator compounds quarterly (standard for Indian bank FDs), applies 31.2% TDS on NRO interest and none on NRE/FCNR, and shows gross interest, TDS, net interest, maturity value and effective post-tax annual yield side by side, highlighting the best net return. FCNR results are in the chosen foreign currency, so the INR value at maturity depends on the exchange rate then.',
  },
];

export default function NRIFDCalculatorPage() {
  const [principal, setPrincipal] = useState(1000000);
  const [years, setYears] = useState(3);
  const [nreRate, setNreRate] = useState(6.75);
  const [nroRate, setNroRate] = useState(6.75);
  const [fcnrRate, setFcnrRate] = useState(5.25);
  const [fcnrCurrency, setFcnrCurrency] = useState('USD');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const results: FDResult[] = useMemo(() => {
    const nre = calcFD(principal, nreRate, years, 0);
    const nro = calcFD(principal, nroRate, years, 0.312); // 30% + 4% cess
    const fcnr = calcFD(principal, fcnrRate, years, 0);

    const effRate = (r: typeof nre) => ((r.netInterest / principal / years) * 100);

    return [
      {
        type: 'NRE', label: 'NRE Fixed Deposit',
        ...nre, effectiveRate: effRate(nre), taxable: false,
        repatriable: 'Fully repatriable', currency: 'INR',
        highlight: 'Tax-free interest',
        bg: 'bg-green-50', border: 'border-green-200', textColor: 'text-green-700',
      },
      {
        type: 'NRO', label: 'NRO Fixed Deposit',
        ...nro, effectiveRate: effRate(nro), taxable: true,
        repatriable: 'Up to USD 1M/year', currency: 'INR',
        highlight: '31.2% TDS on interest',
        bg: 'bg-amber-50', border: 'border-amber-200', textColor: 'text-amber-700',
      },
      {
        type: 'FCNR', label: `FCNR Fixed Deposit (${fcnrCurrency})`,
        ...fcnr, effectiveRate: effRate(fcnr), taxable: false,
        repatriable: 'Fully repatriable', currency: fcnrCurrency,
        highlight: 'No exchange rate risk',
        bg: 'bg-blue-50', border: 'border-blue-200', textColor: 'text-blue-700',
      },
    ];
  }, [principal, years, nreRate, nroRate, fcnrRate, fcnrCurrency]);

  const best = results.reduce((a, b) => a.netInterest > b.netInterest ? a : b);

  return (
    <>
      <Helmet>
        <title>NRI FD Calculator — NRE vs NRO vs FCNR Comparison | RupeePedia</title>
        <meta name="description" content="Compare NRE, NRO and FCNR fixed deposit returns for NRIs — tax-free vs 31.2% TDS, repatriation limits, DTAA rates, what happens when you return to India, with examples and FAQs." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/nri-fd" />
        <meta property="og:title" content="NRI FD Calculator — NRE vs NRO vs FCNR Comparison | RupeePedia" />
        <meta property="og:description" content="Compare NRE, NRO, and FCNR fixed deposit returns for NRIs. Understand tax implications, TDS, and repatriation rules." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/nri-fd" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="NRI FD Calculator — NRE vs NRO vs FCNR Comparison | RupeePedia" />
        <meta name="twitter:description" content="Compare NRE, NRO, and FCNR fixed deposit returns for NRIs. Understand tax implications, TDS, and repatriation rules." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'NRI FD Calculator',
          url: 'https://rupeepedia.in/calculators/nri-fd',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free calculator comparing NRE, NRO and FCNR fixed deposit maturity values for NRIs, with TDS, repatriation and tax treatment side by side.',
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://rupeepedia.in/calculators' },
            { '@type': 'ListItem', position: 3, name: 'NRI FD Calculator', item: 'https://rupeepedia.in/calculators/nri-fd' },
          ],
        })}</script>
      </Helmet>

      <CalculatorHero
        crumb="NRI FD"
        title="NRI FD"
        accent="Calculator"
        subtitle="NRE vs NRO vs FCNR — net returns after tax, side by side."
        icon={Landmark}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Inputs */}
        <div className="card p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Principal Amount (₹)</label>
              <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tenure (Years)</label>
              <input type="number" min={1} max={10} value={years} onChange={e => setYears(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">NRE FD Rate (%)</label>
              <input type="number" step={0.05} value={nreRate} onChange={e => setNreRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">NRO FD Rate (%)</label>
              <input type="number" step={0.05} value={nroRate} onChange={e => setNroRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">FCNR Rate (%)</label>
              <input type="number" step={0.05} value={fcnrRate} onChange={e => setFcnrRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">FCNR Currency</label>
              <select value={fcnrCurrency} onChange={e => setFcnrCurrency(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'JPY'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Best pick banner */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 text-sm font-bold">★</span>
          </div>
          <div>
            <span className="text-sm font-bold text-brand-800">Best net return: {best.label}</span>
            <span className="text-xs text-brand-600 ml-2">({fmt(best.netInterest)} net interest over {years} yr)</span>
          </div>
        </div>

        {/* Results cards */}
        <div className="grid gap-4 mb-6">
          {results.map(r => (
            <div key={r.type} className={`rounded-xl border p-5 ${r.bg} ${r.border}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`text-base font-bold ${r.textColor}`}>{r.label}</div>
                  <div className={`text-xs mt-0.5 font-medium ${r.textColor} opacity-80`}>{r.highlight}</div>
                </div>
                {r.type === best.type && (
                  <span className="text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full">Best Return</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Gross Interest', value: fmt(r.grossInterest) },
                  { label: 'TDS Deducted', value: r.taxable ? fmt(r.tds) : '₹0 (exempt)' },
                  { label: 'Net Interest', value: fmt(r.netInterest) },
                  { label: 'Maturity Value', value: fmt(r.maturity) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/70 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500 mb-1">{label}</div>
                    <div className={`text-sm font-bold ${r.textColor}`}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="bg-white/80 px-2.5 py-1 rounded-full text-gray-600">Currency: {r.currency}</span>
                <span className="bg-white/80 px-2.5 py-1 rounded-full text-gray-600">Repatriation: {r.repatriable}</span>
                <span className="bg-white/80 px-2.5 py-1 rounded-full text-gray-600">Effective rate: {fmtPct(r.effectiveRate)}/yr</span>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="card p-5 mb-6 overflow-x-auto">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Quick Comparison</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-gray-500 font-semibold">Feature</th>
                <th className="text-center pb-2 text-green-600 font-semibold">NRE</th>
                <th className="text-center pb-2 text-amber-600 font-semibold">NRO</th>
                <th className="text-center pb-2 text-blue-600 font-semibold">FCNR</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Currency', 'INR', 'INR', 'Foreign'],
                ['Tax on Interest', '✓ Exempt', '31.2% TDS', '✓ Exempt'],
                ['Repatriation', 'Fully free', 'USD 1M/yr', 'Fully free'],
                ['Forex Risk', 'Yes (on maturity)', 'Yes (on maturity)', 'None'],
                ['Funds Source', 'Foreign earnings', 'India income', 'Foreign earnings'],
                ['Joint with Resident?', 'No', 'Yes (as 2nd holder)', 'No'],
                ['Tenure', '1yr+', '7 days+', '1–5 years'],
              ].map(([feature, nre, nro, fcnr]) => (
                <tr key={feature} className="border-b border-gray-50">
                  <td className="py-2 text-gray-700 font-medium">{feature}</td>
                  <td className="py-2 text-center text-green-700">{nre}</td>
                  <td className="py-2 text-center text-amber-700">{nro}</td>
                  <td className="py-2 text-center text-blue-700">{fcnr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Article ── */}
        <article className="space-y-8 mb-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">NRE, NRO and FCNR — how the three deposits actually differ</h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>
                The three NRI deposit types answer one question each. <strong>Where did the money come from?</strong> Foreign
                earnings go into NRE or FCNR; income that arises in India (rent, dividends, pension, property sale proceeds)
                must go into NRO — FEMA does not give you a choice there. <strong>Which currency carries the risk?</strong> NRE
                and NRO are rupee deposits, so a dollar-based NRI eats any rupee depreciation between deposit and
                repatriation; FCNR stays in foreign currency and removes that risk in exchange for a lower rate.
                <strong> Who taxes the interest?</strong> India exempts NRE and FCNR interest while you are an NRI, but taxes NRO
                interest at slab rates with 31.2% TDS upfront — and your country of residence may tax all three.
              </p>
              <p>
                A worked comparison: ₹10 lakh for 3 years at 6.75% (NRE/NRO) and 5.25% (FCNR USD). NRE matures at about
                ₹12.22 lakh with zero Indian tax. NRO earns the same ₹2.22 lakh gross interest but loses ~₹69,000 to TDS,
                netting ₹11.53 lakh. FCNR earns the equivalent of ₹11.69 lakh at today's exchange rate — but if the rupee
                slips from 84 to 90 per dollar over those 3 years, the FCNR deposit's rupee value beats the NRE deposit.
                That is the real NRE-vs-FCNR trade: INR rates are ~1.5% higher, and the rupee has historically depreciated
                ~2–3% a year against the dollar.
              </p>
              <p>
                The decision that surprises most NRIs is what happens on <strong>returning to India</strong>: NRE deposits lose
                their tax exemption as soon as FEMA residency changes, while FCNR deposits keep both their contracted rate
                and tax exemption until maturity if you qualify as RNOR. NRIs planning a return within 2–3 years often
                shift maturing NRE money into 5-year FCNR deposits for exactly this reason.
              </p>
            </div>
          </section>
        </article>

        <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 mb-8">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>Interest rates change frequently. Check with your bank for current rates. FCNR maturity value is in foreign currency — actual INR value depends on exchange rate at maturity. NRO TDS can be lower under DTAA with a Tax Residency Certificate. Consult a CA for tax planning.</div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">NRI FD FAQs</h2>
        <p className="text-xs text-gray-400 mb-4">Tax, repatriation, DTAA, returning to India, and reporting rules</p>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white hover:bg-gray-50 transition"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="flex-1 text-sm font-semibold text-gray-800">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" />
                  : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
              </button>
              {/* Always mounted so content stays in the DOM for search engines */}
              <div className={`px-4 pb-4 pt-1 border-t border-gray-100 text-sm text-gray-600 leading-relaxed ${openFaq === i ? '' : 'hidden'}`}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>

        {/* ── Related tools ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Related calculators</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { path: '/calculators/rnor-status', label: 'RNOR Status Calculator', desc: 'Returning to India? Check how long your foreign income stays untaxed' },
              { path: '/calculators/nri-capital-gains', label: 'NRI Capital Gains Calculator', desc: 'Tax on selling Indian property or equity as an NRI' },
              { path: '/calculators/nri-rental-income', label: 'NRI Rental Income Calculator', desc: 'Tax and TDS on rent from your Indian property' },
              { path: '/calculators/fd', label: 'FD Calculator', desc: 'Regular resident fixed deposit maturity calculator' },
            ].map(t => (
              <Link key={t.path} to={t.path} className="card p-4 hover:shadow-md transition group">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition">{t.label}</span>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-500 transition flex-shrink-0" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
