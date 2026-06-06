import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

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

const FAQS = [
  {
    q: 'What is NRE FD?',
    a: 'NRE (Non-Resident External) FD is opened with foreign earnings converted to INR. Interest is fully exempt from Indian tax. Both principal and interest are freely repatriable to your country of residence. Ideal for parking foreign income.',
  },
  {
    q: 'What is NRO FD?',
    a: 'NRO (Non-Resident Ordinary) FD holds income earned in India — rent, dividends, pension. Interest is subject to 30% TDS + 4% cess = 31.2% effective TDS. Repatriation of principal is limited to USD 1 million per financial year (with Form 15CA/15CB from CA).',
  },
  {
    q: 'What is FCNR FD?',
    a: 'FCNR (Foreign Currency Non-Resident) FD is held in foreign currency (USD, GBP, EUR, etc.) — no INR conversion. No exchange rate risk. Interest is fully exempt from Indian tax. Available for 1–5 year tenures. Rates are lower than NRE/NRO since no forex risk is borne by you.',
  },
  {
    q: 'Which FD is best for NRIs?',
    a: 'NRE FD is best for most NRIs: tax-free interest, full repatriation, and INR rates (5–7%) are usually higher than FCNR rates. Choose NRO FD only for income earned in India. Choose FCNR if you want to avoid exchange rate risk on short-term funds.',
  },
  {
    q: 'Is NRE FD interest really tax-free?',
    a: 'Yes — under Section 10(4) of the Income Tax Act, interest on NRE FD is exempt from Indian income tax as long as you maintain NRI status. Once you become RNOR or ROR, NRE FD interest becomes taxable in India.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white hover:bg-gray-50 transition" onClick={() => setOpen(o => !o)}>
        <span className="flex-1 text-sm font-semibold text-gray-800">{q}</span>
        {open ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">{a}</div>}
    </div>
  );
}

export default function NRIFDCalculatorPage() {
  const [principal, setPrincipal] = useState(1000000);
  const [years, setYears] = useState(3);
  const [nreRate, setNreRate] = useState(6.75);
  const [nroRate, setNroRate] = useState(6.75);
  const [fcnrRate, setFcnrRate] = useState(5.25);
  const [fcnrCurrency, setFcnrCurrency] = useState('USD');

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
        <meta name="description" content="Compare NRE, NRO, and FCNR fixed deposit returns for NRIs. Understand tax implications, TDS, and repatriation rules." />
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
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What is the difference between NRE, NRO, and FCNR accounts?', acceptedAnswer: { '@type': 'Answer', text: 'NRE (Non-Resident External): Rupee account funded with foreign remittances; interest is tax-free; fully repatriable. NRO (Non-Resident Ordinary): For income earned in India (rent, dividends); interest taxed at 30% TDS; limited repatriation ($1M/year). FCNR (Foreign Currency Non-Resident): Held in foreign currency (USD, GBP etc.); no exchange rate risk; interest tax-free; fully repatriable.' } },
            { '@type': 'Question', name: 'Is NRE FD interest tax-free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, NRE FD interest is fully exempt from Indian income tax as long as you maintain NRI status. Once you become a Resident (or RNOR), NRE account interest becomes taxable.' } },
            { '@type': 'Question', name: 'What TDS rate applies on NRO FD?', acceptedAnswer: { '@type': 'Answer', text: 'TDS on NRO FD interest is 30% + 4% health and education cess = 31.2% (or lower per DTAA if the NRI claims treaty benefit). TDS is deducted before interest is credited.' } },
            { '@type': 'Question', name: 'Which NRI FD is best — NRE, NRO, or FCNR?', acceptedAnswer: { '@type': 'Answer', text: 'NRE FD is best if you want tax-free returns and full repatriation. FCNR is best if you want to avoid rupee depreciation risk by keeping the deposit in a foreign currency. NRO FD is suitable only for income already in India that cannot be freely repatriated.' } },
          ],
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">NRI FD Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Compare NRE, NRO, and FCNR fixed deposit returns with tax implications.</p>
        </div>

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

        <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 mb-8">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>Interest rates change frequently. Check with your bank for current rates. FCNR maturity value is in foreign currency — actual INR value depends on exchange rate at maturity. Consult a CA for tax planning.</div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">FAQs</h2>
        <p className="text-xs text-gray-400 mb-4">Common questions about NRI fixed deposits</p>
        <div className="space-y-2">
          {FAQS.map((f, i) => <FaqItem key={i} {...f} />)}
        </div>
      </div>
    </>
  );
}
