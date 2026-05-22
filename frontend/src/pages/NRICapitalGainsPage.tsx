import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Info, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// Cost Inflation Index (CII) — FY 2001-02 base = 100
const CII: Record<number, number> = {
  2001: 100, 2002: 105, 2003: 109, 2004: 113, 2005: 117, 2006: 122, 2007: 129,
  2008: 137, 2009: 148, 2010: 167, 2011: 184, 2012: 200, 2013: 220, 2014: 240,
  2015: 254, 2016: 264, 2017: 272, 2018: 280, 2019: 289, 2020: 301, 2021: 317,
  2022: 331, 2023: 348, 2024: 363, 2025: 376,
};

function getSurchargePct(gain: number): number {
  if (gain <= 5000000) return 0;
  if (gain <= 10000000) return 10;
  if (gain <= 20000000) return 15;
  if (gain <= 50000000) return 25;
  return 25; // max 25% for capital gains (not 37%)
}

function calcTax(taxableGain: number, isLTCG: boolean, assetType: 'property' | 'equity'): {
  baseTax: number; surcharge: number; cess: number; totalTax: number; effectiveRate: number;
} {
  let rate: number;
  if (isLTCG) {
    rate = assetType === 'equity' ? 0.125 : 0.20; // equity: 12.5% (post Jul 2024), property: 20% without indexation
  } else {
    rate = 0.30; // STCG for NRI at 30%
  }

  const baseTax = taxableGain * rate;
  const surchargePct = getSurchargePct(taxableGain);
  const surcharge = baseTax * (surchargePct / 100);
  const cess = (baseTax + surcharge) * 0.04;
  const totalTax = baseTax + surcharge + cess;
  const effectiveRate = taxableGain > 0 ? (totalTax / taxableGain) * 100 : 0;
  return { baseTax, surcharge, cess, totalTax, effectiveRate };
}

function getFY(year: number): number { return year; } // purchase/sale year = FY start year (simplified: use year directly for CII)

const FAQS = [
  {
    q: 'What is Long-Term Capital Gain (LTCG) for NRIs?',
    a: 'For NRIs, a capital gain on property held for more than 24 months is Long-Term. For listed equity/mutual funds, the holding period is 12 months. LTCG on property is taxed at 20% (without indexation, post July 23, 2024 budget). LTCG on listed equity above ₹1.25L is taxed at 12.5%.',
  },
  {
    q: 'What TDS does the buyer deduct when buying property from an NRI?',
    a: 'The buyer must deduct TDS under Section 195 before paying an NRI seller: 20% + surcharge + cess for LTCG, or 30% + surcharge + cess for STCG. The buyer needs a TAN and must file Form 27Q. The NRI can apply for a lower TDS certificate (Form 13) from the Income Tax Department if actual tax liability is lower.',
  },
  {
    q: 'Can NRIs claim indexation benefit on property sale?',
    a: 'Post the July 23, 2024 Union Budget: For property sold after July 23, 2024, NRIs can choose between (a) 12.5% without indexation, or (b) 20% with indexation — whichever is beneficial. For property acquired before 2001, fair market value as of April 1, 2001 can be used as cost. This calculator shows 20% with indexation for property.',
  },
  {
    q: 'How is cost of improvement treated?',
    a: 'Cost of improvement (renovation, construction additions) made after 2001 is added to the cost of acquisition. It also gets CII indexation benefit for LTCG calculation. Improvements before 2001 are ignored.',
  },
  {
    q: 'What is surcharge on NRI capital gains?',
    a: 'Surcharge is levied on the tax amount (not on the gain). For NRIs: 10% surcharge if gain is between ₹50L–₹1Cr, 15% for ₹1Cr–₹2Cr, 25% for above ₹2Cr. The surcharge on long-term capital gains is capped at 25% even if total income exceeds ₹5Cr.',
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

export default function NRICapitalGainsPage() {
  const [assetType, setAssetType] = useState<'property' | 'equity'>('property');
  const [purchasePrice, setPurchasePrice] = useState(3000000);
  const [salePrice, setSalePrice] = useState(8000000);
  const [improvementCost, setImprovementCost] = useState(0);
  const [purchaseYear, setPurchaseYear] = useState(2015);
  const [saleYear, setSaleYear] = useState(2025);
  const [transferExpenses, setTransferExpenses] = useState(50000);

  const result = useMemo(() => {
    const holdingMonths = (saleYear - purchaseYear) * 12;
    const ltcgThreshold = assetType === 'equity' ? 12 : 24;
    const isLTCG = holdingMonths >= ltcgThreshold;

    const purchaseCII = CII[purchaseYear] ?? CII[2001];
    const saleCII = CII[saleYear] ?? CII[2025];

    const indexedCost = isLTCG && assetType === 'property'
      ? (purchasePrice * saleCII) / purchaseCII
      : purchasePrice;
    const indexedImprovement = isLTCG && assetType === 'property' && improvementCost > 0
      ? (improvementCost * saleCII) / purchaseCII
      : improvementCost;

    const totalCost = indexedCost + indexedImprovement + transferExpenses;
    const rawGain = salePrice - (purchasePrice + improvementCost + transferExpenses);
    const taxableGain = Math.max(0, salePrice - totalCost);

    const tax = calcTax(taxableGain, isLTCG, assetType);

    // TDS buyer should deduct
    const tdsRate = isLTCG
      ? assetType === 'equity' ? 0.125 : 0.20
      : 0.30;
    const tdsBase = isLTCG
      ? Math.max(0, salePrice - purchasePrice - improvementCost - transferExpenses) // TDS on conservative gain
      : rawGain;
    const tdsAmount = Math.max(0, tdsBase * tdsRate * 1.04); // rough TDS with cess

    return {
      isLTCG,
      holdingMonths,
      rawGain,
      taxableGain,
      indexedCost: Math.round(indexedCost),
      indexedImprovement: Math.round(indexedImprovement),
      ...tax,
      tdsAmount: Math.round(tdsAmount),
      netProceeds: Math.round(salePrice - tax.totalTax),
    };
  }, [assetType, purchasePrice, salePrice, improvementCost, purchaseYear, saleYear, transferExpenses]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => 2001 + i);

  return (
    <>
      <Helmet>
        <title>NRI Capital Gains Tax Calculator — Property & Equity | RupeePedia</title>
        <meta name="description" content="Calculate capital gains tax for NRIs on sale of Indian property or equity. Includes indexation, surcharge, cess, and TDS estimation." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/nri-capital-gains" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">NRI Capital Gains Tax Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Calculate tax on sale of Indian property or equity as an NRI — with indexation, surcharge, and TDS estimate.</p>
        </div>

        {/* Asset type */}
        <div className="card p-5 mb-5">
          <div className="text-xs font-semibold text-gray-600 mb-2">Asset Type</div>
          <div className="flex gap-2">
            {(['property', 'equity'] as const).map(t => (
              <button
                key={t}
                onClick={() => setAssetType(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition border ${
                  assetType === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t === 'property' ? '🏠 Property' : '📈 Equity / Mutual Funds'}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="card p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Purchase Price (₹)</label>
              <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sale Price (₹)</label>
              <input type="number" value={salePrice} onChange={e => setSalePrice(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year of Purchase (FY start)</label>
              <select value={purchaseYear} onChange={e => setPurchaseYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {years.map(y => <option key={y} value={y}>FY {y}–{y+1}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year of Sale (FY start)</label>
              <select value={saleYear} onChange={e => setSaleYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {years.map(y => <option key={y} value={y}>FY {y}–{y+1}</option>)}
              </select>
            </div>
            {assetType === 'property' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Improvement / Renovation Cost (₹)</label>
                <input type="number" value={improvementCost} onChange={e => setImprovementCost(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Transfer Expenses (brokerage, registration, etc.)</label>
              <input type="number" value={transferExpenses} onChange={e => setTransferExpenses(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        </div>

        {/* Result */}
        {saleYear > purchaseYear ? (
          <>
            {/* Status banner */}
            <div className={`rounded-xl border p-4 mb-5 flex items-center gap-3 ${result.isLTCG ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${result.isLTCG ? 'bg-green-100' : 'bg-amber-100'}`}>
                <span className={`text-lg font-bold ${result.isLTCG ? 'text-green-700' : 'text-amber-700'}`}>{result.isLTCG ? 'L' : 'S'}</span>
              </div>
              <div>
                <div className={`font-bold text-sm ${result.isLTCG ? 'text-green-800' : 'text-amber-800'}`}>
                  {result.isLTCG ? 'Long-Term Capital Gain' : 'Short-Term Capital Gain'}
                </div>
                <div className={`text-xs ${result.isLTCG ? 'text-green-700' : 'text-amber-700'}`}>
                  Held for ~{result.holdingMonths} months · Tax rate: {result.isLTCG ? (assetType === 'equity' ? '12.5%' : '20% with indexation') : '30%'} + surcharge + cess
                </div>
              </div>
            </div>

            {/* Numbers grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Raw Capital Gain', value: fmt(result.rawGain), sub: 'before indexation' },
                ...(result.isLTCG && assetType === 'property' ? [
                  { label: 'Indexed Cost', value: fmt(result.indexedCost), sub: `CII ${CII[purchaseYear] ?? '?'} → ${CII[saleYear] ?? '?'}` },
                ] : []),
                { label: 'Taxable Gain', value: fmt(result.taxableGain), sub: 'after indexation & expenses' },
                { label: 'Base Tax', value: fmt(result.baseTax), sub: result.isLTCG ? (assetType === 'equity' ? '12.5%' : '20%') : '30%' },
                { label: 'Surcharge', value: fmt(result.surcharge), sub: getSurchargePct(result.taxableGain) + '%' },
                { label: 'Health & Ed Cess', value: fmt(result.cess), sub: '4% on tax+surcharge' },
                { label: 'Total Tax', value: fmt(result.totalTax), sub: `Effective ${result.effectiveRate.toFixed(1)}%` },
                { label: 'Net Proceeds', value: fmt(result.netProceeds), sub: 'sale price minus total tax' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <div className="text-[10px] text-gray-400 mb-1">{label}</div>
                  <div className="text-base font-bold text-gray-800">{value}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            {/* TDS note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex gap-2.5">
                <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-800 mb-1">TDS Buyer Must Deduct (Section 195)</div>
                  <div className="text-xs text-amber-700">
                    Estimated TDS: <strong>{fmt(result.tdsAmount)}</strong>
                    {' '}({result.isLTCG ? (assetType === 'equity' ? '12.5%' : '20%') : '30%'} + 4% cess on estimated gain).
                    The buyer needs to obtain TAN, deduct TDS, and deposit via challan 281.
                    NRI seller can apply for lower TDS certificate (Form 13) to reduce TDS if actual tax is lower.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            Sale year must be after purchase year.
          </div>
        )}

        <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 mb-8">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>CII values beyond FY 2025-26 are estimates. Post July 23, 2024 budget: property LTCG rate changed to 12.5% without indexation (20% with indexation also available for pre-July 23 purchases). This calculator uses 20% with indexation for property. Consult a CA for accurate tax filing.</div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">FAQs</h2>
        <p className="text-xs text-gray-400 mb-4">Common questions about NRI capital gains tax</p>
        <div className="space-y-2">
          {FAQS.map((f, i) => <FaqItem key={i} {...f} />)}
        </div>
      </div>
    </>
  );
}
