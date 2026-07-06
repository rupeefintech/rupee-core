import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Info, ChevronDown, ChevronUp, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const EQUITY_LTCG_EXEMPTION = 125000; // Section 112A — ₹1.25L/yr exempt

// Surcharge on the tax amount, based on the gain (assumes gain is the only income).
// LTCG (any asset) and equity STCG u/s 111A: surcharge capped at 15%.
function getSurchargePct(gain: number, capped: boolean): number {
  let pct = 0;
  if (gain > 50000000) pct = 25;
  else if (gain > 20000000) pct = 25;
  else if (gain > 10000000) pct = 15;
  else if (gain > 5000000) pct = 10;
  return capped ? Math.min(pct, 15) : pct;
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What counts as a long-term capital gain (LTCG) for NRIs?',
    a: 'Post the July 2024 budget there are only two holding periods: 12 months for listed securities (shares, equity mutual funds) and 24 months for everything else, including property. Hold longer than that and the gain is long-term — taxed at 12.5% (equity gains above ₹1.25 lakh a year; property gains in full, without indexation). Sell earlier and it is short-term: 20% for listed equity under Section 111A, slab rates for property.',
  },
  {
    q: 'Can NRIs claim indexation on property sold after 23 July 2024?',
    a: 'No. The Finance (No. 2) Act 2024 removed indexation and set LTCG on property at a flat 12.5%. The grandfathering option — choosing 20% with indexation for property bought before 23 July 2024 — was given only to resident individuals and HUFs. NRIs pay 12.5% on the full gain without indexation, regardless of purchase date. For property acquired before 1 April 2001, fair market value on that date can still be used as cost.',
  },
  {
    q: 'What TDS does a buyer deduct when purchasing property from an NRI?',
    a: 'Under Section 195, the buyer must deduct TDS at the capital-gains rate — 12.5% plus surcharge and cess for long-term (roughly 13–14.95% all-in), or slab-rate-linked ~30% plus cess for short-term — and, in practice, on the FULL sale price unless the seller obtains a lower/nil deduction certificate. The buyer needs a TAN, deposits the TDS via challan, and files Form 27Q. This is much heavier than the 1% TDS that applies when buying from a resident.',
  },
  {
    q: 'How do I reduce the TDS with a lower deduction certificate (Form 13)?',
    a: 'Apply online to your jurisdictional Assessing Officer in Form 13 (via the TRACES portal) with the purchase deed, sale agreement and a computation of the actual capital gain. The AO issues a certificate directing the buyer to deduct TDS only on the computed gain (or at a lower rate). Without it, TDS on the full sale price often locks up 2–4 times your actual tax until you file an ITR and wait for the refund. Start the process before signing the sale agreement — it typically takes 3–6 weeks.',
  },
  {
    q: 'Does the ₹1.25 lakh LTCG exemption on equity apply to NRIs?',
    a: 'Yes. The first ₹1.25 lakh of long-term gains on listed equity and equity mutual funds in a financial year is exempt under Section 112A for NRIs too; only the excess is taxed at 12.5%. However, unlike residents, NRIs cannot adjust the basic exemption limit (₹2.5–4 lakh) against LTCG or STCG on equity — the special-rate tax applies from the first rupee of taxable gain.',
  },
  {
    q: 'How can NRIs avoid capital gains tax on property sale (Sections 54, 54EC, 54F)?',
    a: 'Three main exemptions: Section 54 — reinvest the LTCG from a residential house into another residential house in India (buy within 1 year before / 2 years after, or construct within 3 years; exemption capped at ₹10 crore). Section 54EC — invest up to ₹50 lakh of the gain in NHAI/REC/PFC/IRFC capital-gains bonds within 6 months (5-year lock-in). Section 54F — sell any non-residential asset and reinvest the entire sale proceeds in one residential house in India. The new house must be in India; buying abroad does not qualify.',
  },
  {
    q: 'What is the surcharge on NRI capital gains?',
    a: 'Surcharge applies on the tax (not the gain) when total income crosses ₹50 lakh: 10% up to ₹1 crore, 15% up to ₹2 crore, 25% beyond. For all long-term capital gains and for short-term gains on listed equity, the surcharge is capped at 15% even at higher incomes. A 4% health and education cess applies on tax plus surcharge in every case.',
  },
  {
    q: 'How is cost of improvement treated?',
    a: 'Documented capital improvements — construction additions, major renovation — made after 1 April 2001 are added to your cost of acquisition, directly reducing the taxable gain. Keep invoices and bank proofs; undocumented cash spending is routinely disallowed. Since indexation no longer applies to NRI property sales, the improvement cost is added at its actual (nominal) value.',
  },
  {
    q: 'Can I repatriate the sale proceeds abroad?',
    a: 'Yes, within limits. Sale proceeds are credited to your NRO account; you can repatriate up to USD 1 million per financial year with a CA certificate in Form 15CA/15CB confirming taxes are paid. If the property was bought with NRE/FCNR funds, the original foreign-currency investment can be repatriated freely for up to two residential properties; the profit portion goes through the USD 1M route.',
  },
  {
    q: 'Does a tax treaty (DTAA) help on Indian capital gains?',
    a: 'Usually not for property — every Indian treaty gives India the right to tax gains on immovable property located in India. For shares and mutual funds, a few treaties (historically Mauritius and Singapore for pre-2017 acquisitions, and the UAE treaty for mutual fund units in some rulings) can shift taxing rights, but this is fact-specific and needs a Tax Residency Certificate plus professional advice. Your country of residence may also tax the gain and give credit for Indian tax.',
  },
  {
    q: 'Do NRIs have to file an Indian ITR after a property or equity sale?',
    a: 'Almost always yes. Filing is mandatory if total Indian income exceeds the basic exemption limit, and practically necessary to claim a refund of excess TDS — which is the normal situation after a property sale where TDS was deducted on the full sale price. Use ITR-2, report the gain in Schedule CG, and the refund is credited to your NRO account. The due date is 31 July (unless extended).',
  },
  {
    q: 'How does this NRI capital gains calculator work?',
    a: 'Choose the asset type, enter purchase price, sale price, years, improvement cost and transfer expenses. The calculator determines long/short-term from the holding period, applies the post-July-2024 NRI rates (property LTCG 12.5% without indexation, equity LTCG 12.5% above ₹1.25 lakh, equity STCG 20%, property STCG at the top 30% slab), adds surcharge (with the 15% LTCG cap) and 4% cess, and estimates the Section 195 TDS the buyer would deduct. Section 54/54EC/54F exemptions are not modelled — they can reduce the actual tax to zero.',
  },
];

export default function NRICapitalGainsPage() {
  const [assetType, setAssetType] = useState<'property' | 'equity'>('property');
  const [purchasePrice, setPurchasePrice] = useState(3000000);
  const [salePrice, setSalePrice] = useState(8000000);
  const [improvementCost, setImprovementCost] = useState(0);
  const [purchaseYear, setPurchaseYear] = useState(2015);
  const [saleYear, setSaleYear] = useState(2025);
  const [transferExpenses, setTransferExpenses] = useState(50000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const result = useMemo(() => {
    const holdingMonths = (saleYear - purchaseYear) * 12;
    const ltcgThreshold = assetType === 'equity' ? 12 : 24;
    const isLTCG = holdingMonths >= ltcgThreshold;

    const totalCost = purchasePrice + improvementCost + transferExpenses;
    const rawGain = salePrice - totalCost;

    // Post-July-2024 rules for NRIs: no indexation on property.
    // Equity LTCG: first ₹1.25L exempt (Section 112A).
    const exemptionUsed = isLTCG && assetType === 'equity' ? Math.min(Math.max(rawGain, 0), EQUITY_LTCG_EXEMPTION) : 0;
    const taxableGain = Math.max(0, rawGain - exemptionUsed);

    let rate: number;
    let rateLabel: string;
    if (isLTCG) {
      rate = 0.125;
      rateLabel = assetType === 'equity' ? '12.5% above ₹1.25L (Sec 112A)' : '12.5% without indexation (Sec 112)';
    } else if (assetType === 'equity') {
      rate = 0.20;
      rateLabel = '20% (Sec 111A)';
    } else {
      rate = 0.30;
      rateLabel = '~30% (slab rates; top slab assumed)';
    }

    // Surcharge capped at 15% for LTCG and listed-equity STCG
    const surchargeCapped = isLTCG || assetType === 'equity';
    const baseTax = taxableGain * rate;
    const surchargePct = getSurchargePct(taxableGain, surchargeCapped);
    const surcharge = baseTax * (surchargePct / 100);
    const cess = (baseTax + surcharge) * 0.04;
    const totalTax = baseTax + surcharge + cess;
    const effectiveRate = taxableGain > 0 ? (totalTax / taxableGain) * 100 : 0;

    // TDS: for property, buyers practically deduct on the FULL sale price u/s 195
    // unless a lower-deduction certificate (Form 13) is obtained.
    const tdsBase = assetType === 'property' ? salePrice : taxableGain;
    const tdsAmount = Math.max(0, tdsBase * rate * 1.04);

    return {
      isLTCG,
      holdingMonths,
      rawGain,
      exemptionUsed,
      taxableGain,
      rateLabel,
      baseTax,
      surcharge,
      surchargePct,
      cess,
      totalTax,
      effectiveRate,
      tdsAmount: Math.round(tdsAmount),
      netProceeds: Math.round(salePrice - totalTax),
    };
  }, [assetType, purchasePrice, salePrice, improvementCost, purchaseYear, saleYear, transferExpenses]);

  const years = Array.from({ length: 35 }, (_, i) => 2001 + i);

  return (
    <>
      <Helmet>
        <title>NRI Capital Gains Tax Calculator — Property & Equity (2026 Rules) | RupeePedia</title>
        <meta name="description" content="Calculate capital gains tax for NRIs on Indian property or equity under post-July-2024 rules — 12.5% LTCG without indexation, 20% equity STCG, surcharge, cess and Section 195 TDS, with exemptions explained." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/nri-capital-gains" />
        <meta property="og:title" content="NRI Capital Gains Tax Calculator — Property & Equity | RupeePedia" />
        <meta property="og:description" content="Calculate capital gains tax for NRIs on sale of Indian property or equity, with TDS estimate and Section 54/54EC exemption guidance." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/nri-capital-gains" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="NRI Capital Gains Tax Calculator — Property & Equity | RupeePedia" />
        <meta name="twitter:description" content="Capital gains tax for NRIs on Indian property or equity — current rates, TDS, exemptions." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'NRI Capital Gains Tax Calculator',
          url: 'https://rupeepedia.in/calculators/nri-capital-gains',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free calculator for NRI capital gains tax on Indian property and equity under the post-July-2024 regime, including surcharge, cess and Section 195 TDS estimate.',
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
            { '@type': 'ListItem', position: 3, name: 'NRI Capital Gains', item: 'https://rupeepedia.in/calculators/nri-capital-gains' },
          ],
        })}</script>
      </Helmet>

      <CalculatorHero
        crumb="NRI Capital Gains"
        title="NRI Capital Gains"
        accent="Tax"
        subtitle="Property & equity — post-July-2024 rates, surcharge and TDS."
        icon={TrendingUp}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
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
                  Held for ~{result.holdingMonths} months · Tax rate: {result.rateLabel} + surcharge + cess
                </div>
              </div>
            </div>

            {/* Numbers grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Capital Gain', value: fmt(result.rawGain), sub: 'sale price − cost − expenses' },
                ...(result.exemptionUsed > 0 ? [
                  { label: '112A Exemption', value: '− ' + fmt(result.exemptionUsed), sub: 'first ₹1.25L LTCG exempt' },
                ] : []),
                { label: 'Taxable Gain', value: fmt(result.taxableGain), sub: 'after exemption' },
                { label: 'Base Tax', value: fmt(result.baseTax), sub: result.rateLabel },
                { label: 'Surcharge', value: fmt(result.surcharge), sub: result.surchargePct + '%' + (result.isLTCG ? ' (capped 15%)' : '') },
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
                    {assetType === 'property'
                      ? ' — deducted on the FULL sale price (not just the gain) unless you obtain a lower-deduction certificate (Form 13) from the tax department. The buyer needs a TAN, deposits via challan 281 and files Form 27Q. Excess TDS is refunded after you file your ITR.'
                      : ' — for listed equity/mutual funds, the broker or AMC deducts TDS on the taxable gain at the applicable rate plus cess when an NRI redeems.'}
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

        {/* ── Article ── */}
        <article className="space-y-8 mb-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">NRI capital gains after the July 2024 budget</h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>
                The Finance (No. 2) Act 2024 rewrote capital gains from 23 July 2024, and NRIs got the strict version of
                the new rules. Long-term gains on <strong>every</strong> asset are now taxed at <strong>12.5%</strong> — but where
                resident individuals selling older property may choose the old 20%-with-indexation route if it works out
                better, <strong>NRIs get no such choice</strong>: 12.5% on the full nominal gain, purchase-year inflation
                ignored. For property bought long ago, the loss of indexation can outweigh the lower rate; for
                recently bought or fast-appreciating property, 12.5% is usually cheaper.
              </p>
              <p>
                A worked example: flat bought in FY 2015-16 for ₹30 lakh, sold in FY 2025-26 for ₹80 lakh with ₹50,000
                transfer costs. Gain = ₹49.5 lakh, held ~10 years → long-term. Tax = 12.5% of ₹49.5L = ₹6.19L, no
                surcharge (gain below ₹50L), plus 4% cess ≈ <strong>₹6.44 lakh total</strong>. But the buyer's Section 195
                TDS on the full ₹80 lakh at ~13% would be roughly ₹10.4 lakh — ₹4 lakh more than the actual tax, locked
                up until an ITR refund. That gap is why a lower-deduction certificate (Form 13) obtained <em>before</em> the
                sale is the single most valuable step in an NRI property sale.
              </p>
              <p>
                The tax can also legally drop to zero: reinvest the gain in another Indian residential property
                (Section 54), put up to ₹50 lakh into capital-gains bonds within six months (Section 54EC), or, when
                selling a non-residential asset, reinvest the sale proceeds in a house (Section 54F). None of these
                stop the buyer's TDS — they only affect the final tax in the return, which again argues for Form 13.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">NRI capital gains rates at a glance (from 23 July 2024)</h2>
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Asset</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Long-term after</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-500">LTCG rate</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-500">STCG rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Listed shares / equity MF', '12 months', '12.5% above ₹1.25L/yr', '20% (Sec 111A)'],
                      ['Property in India', '24 months', '12.5%, no indexation', 'Slab rates (up to 30%)'],
                      ['Debt mutual funds (post-Apr-2023 buys)', '—', 'Always slab rate', 'Slab rate'],
                      ['Unlisted shares', '24 months', '12.5%', 'Slab rates'],
                      ['Gold, other assets', '24 months', '12.5%', 'Slab rates'],
                    ].map(([asset, lt, ltcg, stcg]) => (
                      <tr key={asset} className="border-t border-gray-50">
                        <td className="px-3 py-2.5 font-medium text-gray-700">{asset}</td>
                        <td className="px-3 py-2.5 text-gray-600">{lt}</td>
                        <td className="px-3 py-2.5 text-gray-600">{ltcg}</td>
                        <td className="px-3 py-2.5 text-gray-600">{stcg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Add surcharge (10–25%, capped at 15% for LTCG and listed-equity STCG) and 4% cess on the tax in all cases.</p>
          </section>
        </article>

        <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 mb-8">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>This calculator applies the post-23-July-2024 regime and assumes the gain is your only Indian income (surcharge is computed on the gain alone). Property STCG is approximated at the 30% top slab. Section 54/54EC/54F exemptions and DTAA relief are not modelled. Consult a CA for filing.</div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">NRI capital gains FAQs</h2>
        <p className="text-xs text-gray-400 mb-4">Rates, TDS, exemptions, repatriation and filing</p>
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
              { path: '/calculators/nri-rental-income', label: 'NRI Rental Income Calculator', desc: 'Tax and TDS on rent from your Indian property' },
              { path: '/calculators/nri-fd', label: 'NRI FD Calculator', desc: 'NRE vs NRO vs FCNR — park the sale proceeds right' },
              { path: '/calculators/rnor-status', label: 'RNOR Status Calculator', desc: 'Returning to India? Check your transitional tax status' },
              { path: '/calculators/income-tax', label: 'Income Tax Calculator', desc: 'Slab tax on your other Indian income' },
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
