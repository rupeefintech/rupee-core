import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Info, ChevronDown, ChevronUp, ArrowRight, Home } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// New regime slabs FY 2025-26. NRIs are taxed at slab rates on rental income
// but do NOT get the Section 87A rebate (resident-only).
const SLABS = [
  { upto: 400000, rate: 0 },
  { upto: 800000, rate: 0.05 },
  { upto: 1200000, rate: 0.1 },
  { upto: 1600000, rate: 0.15 },
  { upto: 2000000, rate: 0.2 },
  { upto: 2400000, rate: 0.25 },
  { upto: Infinity, rate: 0.3 },
];

function slabTax(income: number): number {
  let tax = 0, prev = 0;
  for (const s of SLABS) {
    if (income <= prev) break;
    tax += (Math.min(income, s.upto) - prev) * s.rate;
    prev = s.upto;
  }
  return tax;
}

function getSurcharge(income: number): number {
  if (income <= 5000000) return 0;
  if (income <= 10000000) return 10;
  if (income <= 20000000) return 15;
  if (income <= 50000000) return 25;
  return 25; // new regime caps surcharge at 25%
}

// ── FAQ data (rendered on page + JSON-LD from the same list) ─────────────────
const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the tax rate on rental income for NRIs?',
    a: 'Rental income from Indian property is taxed at normal slab rates — not at a flat 30%. The 30% (plus cess = 31.2%) figure people quote is the TDS the tenant deducts upfront under Section 195. Your actual tax is computed on Net Annual Value minus the 30% standard deduction and home loan interest, at slab rates (new regime FY 2025-26: nil up to ₹4 lakh, then 5–30%). Since TDS usually far exceeds the slab tax, most NRI landlords are due a refund after filing their ITR.',
  },
  {
    q: 'What TDS does a tenant deduct on rent paid to an NRI?',
    a: 'Under Section 195, any tenant paying rent to an NRI must deduct TDS at 30% plus 4% cess (31.2%, plus surcharge on very large rents) — and unlike rent paid to residents, there is no minimum threshold: TDS applies from the first rupee. The tenant needs a TAN, must deposit the TDS monthly, and file Form 27Q quarterly. The NRI can apply for a lower-TDS certificate (Form 13) to bring the deduction closer to actual tax.',
  },
  {
    q: 'What deductions can NRI landlords claim on rental income?',
    a: 'Three main ones: (1) municipal/property taxes actually paid during the year, deducted from gross rent to arrive at Net Annual Value; (2) a flat 30% standard deduction on NAV under Section 24(a) — no bills needed, it covers repairs and maintenance notionally; (3) home loan interest under Section 24(b) — fully deductible for a let-out property in both regimes. Principal repayment qualifies under 80C only in the old regime.',
  },
  {
    q: 'Do NRIs get the basic exemption limit and slab benefit?',
    a: 'Yes. NRIs get the same slab structure as residents — including the ₹4 lakh basic exemption in the new regime (₹2.5 lakh old regime). What NRIs do NOT get: the Section 87A rebate (which makes income up to ₹12 lakh tax-free for residents) — an NRI with ₹10 lakh taxable rental income pays slab tax on it while a resident would pay zero. NRIs also cannot use slab benefit against special-rate income like equity capital gains.',
  },
  {
    q: 'Can NRIs choose between the old and new tax regime for rental income?',
    a: 'Yes. The new regime is the default for NRIs too; the old regime must be opted for while filing (Form 10-IEA if there is business income). Old regime makes sense mainly if you claim 80C on home loan principal, or your deductions are large. Note the ₹2 lakh cap on set-off of house property loss against other income applies in the old regime; in the new regime, a let-out property loss cannot be set off against other income at all.',
  },
  {
    q: 'Can NRIs claim home loan interest on a rented-out property?',
    a: 'Yes — for a let-out property, the entire interest paid is deductible from rental income under Section 24(b), with no ₹2 lakh cap, in both regimes. If interest plus other deductions exceed the rent (a net loss), set-off and carry-forward rules apply: in the old regime up to ₹2 lakh of loss can offset other income, the rest carries forward 8 years against house property income only.',
  },
  {
    q: 'What if the TDS deducted is more than my actual tax?',
    a: 'File an Indian ITR and claim the refund — this is the normal case. Example: ₹50,000/month rent means ₹1.87 lakh TDS per year, but after municipal tax, the 30% standard deduction and slab rates, actual tax is often well under ₹50,000 — sometimes zero if taxable income stays below ₹4 lakh. The refund, with interest under Section 244A, is credited to your NRO account. Without filing, the excess TDS is simply lost.',
  },
  {
    q: 'Does the tenant really need a TAN to rent from an NRI?',
    a: 'Yes. A tenant paying rent to an NRI landlord must obtain a TAN (Tax Deduction Account Number), deduct 31.2% TDS every month, deposit it by the 7th of the next month, file quarterly Form 27Q returns, and issue Form 16A to the landlord. Many tenants discover this late — as the landlord, tell your tenant upfront, because the tax department can recover un-deducted TDS with interest and penalties from the tenant.',
  },
  {
    q: 'Is rental income taxable if the rent is paid into my overseas account?',
    a: 'Yes. Rental income from property situated in India is Indian-source income and is taxable in India regardless of where it is received — an overseas bank account does not change that. FEMA also requires Indian rental income to be routed through an NRO account before repatriation (up to USD 1 million a year with Form 15CA/15CB). Your country of residence may tax it too, with credit for Indian tax under the DTAA.',
  },
  {
    q: 'How is a self-occupied or vacant property taxed for NRIs?',
    a: 'Up to two properties can be treated as self-occupied with nil annual value — no notional rent is taxed. Home loan interest on self-occupied property is capped at ₹2 lakh (old regime; not deductible in the new regime). A property lying vacant despite genuine efforts to let it out is taxed on actual rent received (post-2020 rules), but a third+ "self-occupied" property is deemed let out and taxed on notional market rent.',
  },
  {
    q: 'Does DTAA reduce Indian tax on rental income?',
    a: 'No — every Indian tax treaty follows the international norm that immovable property income is taxed where the property is located, so India keeps full taxing rights on Indian rent. The DTAA helps on the other side: your country of residence either exempts the income or (more commonly, e.g. the US and UK) taxes it and gives credit for the Indian tax paid. Keep your Indian ITR and Form 16A as proof for the foreign credit claim.',
  },
  {
    q: 'How does this NRI rental income calculator work?',
    a: 'Enter monthly rent, annual municipal tax and home loan interest. The calculator computes Net Annual Value (rent minus municipal tax), applies the 30% standard deduction and interest deduction, then taxes the result at new-regime slab rates without the 87A rebate (NRIs are not eligible), adds surcharge and 4% cess, and compares the result with the 31.2% TDS your tenant deducts — showing the refund you should claim by filing an ITR. It assumes rental income is your only Indian income.',
  },
];

export default function NRIRentalIncomePage() {
  const [monthlyRent, setMonthlyRent] = useState(50000);
  const [municipalTax, setMunicipalTax] = useState(12000);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [isLetOut, setIsLetOut] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const result = useMemo(() => {
    const grossAnnualRent = monthlyRent * 12;

    // Net Annual Value = Gross Rent − Municipal Tax
    const nav = Math.max(0, grossAnnualRent - municipalTax);

    // 30% standard deduction on NAV
    const standardDeduction = nav * 0.30;

    // Home loan interest deduction
    const hlInterestDeduction = isLetOut ? homeLoanInterest : Math.min(homeLoanInterest, 200000);

    // Taxable income from property
    const taxableIncome = Math.max(0, nav - standardDeduction - hlInterestDeduction);

    // Slab-rate tax (new regime), no 87A rebate for NRIs
    const baseTax = slabTax(taxableIncome);
    const surchargePct = getSurcharge(taxableIncome);
    const surcharge = baseTax * (surchargePct / 100);
    const cess = (baseTax + surcharge) * 0.04;
    const totalTax = baseTax + surcharge + cess;

    // TDS tenant deducts (30% + 4% cess on gross rent, no threshold)
    const tdsOnGross = grossAnnualRent * 0.312;

    // Refund/payable
    const refundOrPayable = tdsOnGross - totalTax;

    const effectiveRate = grossAnnualRent > 0 ? (totalTax / grossAnnualRent) * 100 : 0;

    return {
      grossAnnualRent,
      nav,
      standardDeduction,
      hlInterestDeduction,
      taxableIncome,
      baseTax,
      surcharge,
      surchargePct,
      cess,
      totalTax,
      tdsOnGross,
      refundOrPayable,
      effectiveRate,
      netIncomeAfterTax: grossAnnualRent - totalTax,
    };
  }, [monthlyRent, municipalTax, homeLoanInterest, isLetOut]);

  return (
    <>
      <Helmet>
        <title>NRI Rental Income Tax Calculator — Slab Tax, TDS & Refund | RupeePedia</title>
        <meta name="description" content="Calculate Indian tax on rental income for NRIs — Net Annual Value, 30% standard deduction, home loan interest, slab-rate tax (no 87A rebate), 31.2% tenant TDS and your likely refund, with examples and FAQs." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/nri-rental-income" />
        <meta property="og:title" content="NRI Rental Income Tax Calculator | RupeePedia" />
        <meta property="og:description" content="Tax on rent from Indian property for NRIs — deductions, TDS, and refund estimate." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/nri-rental-income" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="NRI Rental Income Tax Calculator | RupeePedia" />
        <meta name="twitter:description" content="Tax on rent from Indian property for NRIs — deductions, TDS, and refund estimate." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'NRI Rental Income Tax Calculator',
          url: 'https://rupeepedia.in/calculators/nri-rental-income',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free calculator for Indian income tax on NRI rental income — standard deduction, home loan interest, slab-rate tax, tenant TDS and refund estimate.',
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
            { '@type': 'ListItem', position: 3, name: 'NRI Rental Income', item: 'https://rupeepedia.in/calculators/nri-rental-income' },
          ],
        })}</script>
      </Helmet>

      <CalculatorHero
        crumb="NRI Rental Income"
        title="NRI Rental"
        accent="Income Tax"
        subtitle="Slab tax on Indian rent, tenant TDS and your refund."
        icon={Home}
      />

      <div className="bg-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Property type toggle */}
        <div className="bg-surface border border-line rounded-2xl p-5 mb-5">
          <div className="text-xs font-semibold text-muted mb-2">Property Status</div>
          <div className="flex gap-2">
            {[true, false].map(letOut => (
              <button key={String(letOut)} onClick={() => setIsLetOut(letOut)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition border ${
                  isLetOut === letOut ? 'bg-acc text-white border-acc' : 'bg-surface text-muted border-line hover:bg-surface-2'
                }`}
              >
                {letOut ? '🏠 Let-Out Property' : '🏡 Self-Occupied'}
              </button>
            ))}
          </div>
          {!isLetOut && (
            <p className="text-xs text-gold bg-gold/10 px-3 py-2 rounded-lg mt-3">
              Self-occupied property: NAV is treated as zero. Rental income section shows notional tax. Home loan interest deduction capped at ₹2L.
            </p>
          )}
        </div>

        {/* Inputs */}
        <div className="bg-surface border border-line rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Monthly Rent (₹)</label>
              <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(Number(e.target.value))}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-2 text-ink focus:outline-none focus:ring-2 focus:ring-acc" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Municipal / Property Tax Paid Annually (₹)</label>
              <input type="number" value={municipalTax} onChange={e => setMunicipalTax(Number(e.target.value))}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-2 text-ink focus:outline-none focus:ring-2 focus:ring-acc" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Home Loan Interest Paid Annually (₹)
                {!isLetOut && <span className="ml-1 text-gold">(capped at ₹2L for self-occupied)</span>}
              </label>
              <input type="number" value={homeLoanInterest} onChange={e => setHomeLoanInterest(Number(e.target.value))}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-2 text-ink focus:outline-none focus:ring-2 focus:ring-acc" />
            </div>
          </div>
        </div>

        {/* Computation breakdown */}
        <div className="bg-surface border border-line rounded-2xl p-5 mb-5">
          <h2 className="text-sm font-bold text-ink mb-4">Tax Computation Breakdown</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Gross Annual Rent', value: fmt(result.grossAnnualRent), note: `${monthlyRent.toLocaleString()} × 12`, positive: true },
              { label: 'Less: Municipal Tax', value: `(${fmt(municipalTax)})`, note: 'paid during the year', positive: false },
              { label: 'Net Annual Value (NAV)', value: fmt(result.nav), note: 'gross rent − municipal tax', positive: true, separator: true },
              { label: 'Less: 30% Standard Deduction', value: `(${fmt(result.standardDeduction)})`, note: '30% of NAV, Sec 24(a)', positive: false },
              ...(result.hlInterestDeduction > 0 ? [{ label: 'Less: Home Loan Interest', value: `(${fmt(result.hlInterestDeduction)})`, note: isLetOut ? 'full interest allowed, Sec 24(b)' : 'capped at ₹2L', positive: false }] : []),
              { label: 'Taxable Income from Property', value: fmt(result.taxableIncome), note: '', positive: true, separator: true },
              { label: 'Tax at slab rates (new regime)', value: fmt(result.baseTax), note: 'no 87A rebate for NRIs', positive: false },
              ...(result.surcharge > 0 ? [{ label: `Surcharge @ ${result.surchargePct}%`, value: fmt(result.surcharge), note: 'on tax amount', positive: false }] : []),
              { label: 'Health & Education Cess @ 4%', value: fmt(result.cess), note: 'on tax + surcharge', positive: false },
              { label: 'Total Tax Payable', value: fmt(result.totalTax), note: `Effective rate: ${result.effectiveRate.toFixed(1)}% on gross rent`, positive: false, separator: true, bold: true },
            ].map(({ label, value, note, positive, separator, bold }) => (
              <div key={label} className={`flex items-center justify-between py-2 ${separator ? 'border-t border-line mt-1 pt-3' : ''}`}>
                <div>
                  <span className={`text-sm ${bold ? 'font-bold text-ink' : 'text-body'}`}>{label}</span>
                  {note && <span className="text-xs text-faint ml-2">{note}</span>}
                </div>
                <span className={`text-sm font-semibold ${bold ? 'text-ink' : positive ? 'text-body' : 'text-coral'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TDS vs Actual Tax */}
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
            <div className="text-xs text-gold font-semibold mb-1">TDS Tenant Deducts</div>
            <div className="text-2xl font-bold text-gold">{fmt(result.tdsOnGross)}</div>
            <div className="text-xs text-gold mt-1">31.2% on gross rent (30% + 4% cess). No threshold for NRI landlords.</div>
          </div>
          <div className={`rounded-xl border p-4 ${result.refundOrPayable >= 0 ? 'bg-mint/10 border-mint/30' : 'bg-coral/10 border-coral/30'}`}>
            <div className={`text-xs font-semibold mb-1 ${result.refundOrPayable >= 0 ? 'text-mint' : 'text-coral'}`}>
              {result.refundOrPayable >= 0 ? 'TDS Refund (file ITR)' : 'Additional Tax Payable'}
            </div>
            <div className={`text-2xl font-bold ${result.refundOrPayable >= 0 ? 'text-mint' : 'text-coral'}`}>
              {fmt(Math.abs(result.refundOrPayable))}
            </div>
            <div className={`text-xs mt-1 ${result.refundOrPayable >= 0 ? 'text-mint' : 'text-coral'}`}>
              {result.refundOrPayable >= 0
                ? 'TDS exceeds actual tax. File ITR to claim refund to your NRO account.'
                : 'Actual tax exceeds TDS. Pay self-assessment tax.'}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Annual Gross Rent', value: fmt(result.grossAnnualRent) },
            { label: 'Total Tax', value: fmt(result.totalTax) },
            { label: 'Net Income After Tax', value: fmt(result.netIncomeAfterTax) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-2 border border-line rounded-xl p-3">
              <div className="text-[10px] text-faint mb-1">{label}</div>
              <div className="text-base font-bold text-ink">{value}</div>
            </div>
          ))}
        </div>

        {/* ── Article ── */}
        <article className="space-y-8 mb-8">
          <section>
            <h2 className="text-lg font-bold text-ink mb-3">How Indian rental income is actually taxed for NRIs</h2>
            <div className="text-sm text-muted space-y-3 leading-relaxed">
              <p>
                The most common misconception is that NRIs pay a flat 30% tax on Indian rent. The 30% (31.2% with cess)
                is only the <strong>TDS the tenant must withhold</strong> under Section 195 — a prepayment, not the final tax.
                The actual tax follows the same house-property computation residents use: gross rent, minus municipal
                taxes, minus a flat <strong>30% standard deduction</strong>, minus home loan interest, taxed at
                <strong> slab rates</strong>. Two NRI-specific catches: no Section 87A rebate (so the resident "zero tax up to
                ₹12 lakh" headline does not apply), and no threshold below which the tenant can skip TDS.
              </p>
              <p>
                The arithmetic usually lands in the NRI's favour at filing time. Take ₹50,000/month rent with ₹12,000
                municipal tax: gross rent ₹6 lakh, NAV ₹5.88 lakh, minus 30% standard deduction leaves ₹4.12 lakh of
                taxable income. New-regime slab tax on that is about ₹590 + cess — roughly <strong>₹615</strong>. The tenant
                meanwhile withheld ₹1.87 lakh. Filing an ITR recovers the ~₹1.86 lakh difference (with interest). Add a
                home loan and the taxable income often goes negative — for a let-out property the entire interest is
                deductible with no cap.
              </p>
              <p>
                Practicalities matter as much as the computation: the tenant needs a TAN and quarterly Form 27Q filings;
                rent must flow to your NRO account under FEMA; and repatriation beyond the rent (up to USD 1 million a
                year) needs Form 15CA/15CB. A lower-TDS certificate (Form 13) can fix the cash-flow problem at the
                source instead of waiting for refunds every year.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mb-3">NRI rental income rules at a glance</h2>
            <div className="bg-surface border border-line rounded-2xl p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    {[
                      ['Tax rate', 'Slab rates (new regime default) — NOT flat 30%'],
                      ['87A rebate', 'Not available to NRIs — tax starts above ₹4L taxable'],
                      ['Tenant TDS', '31.2% of gross rent u/s 195, from rupee one, tenant needs TAN'],
                      ['Standard deduction', 'Flat 30% of Net Annual Value, Sec 24(a), no bills needed'],
                      ['Home loan interest', 'Fully deductible for let-out property, Sec 24(b)'],
                      ['Loss set-off', 'Old regime: up to ₹2L vs other income; new regime: carry-forward only'],
                      ['Account', 'Rent must be credited to NRO account (FEMA)'],
                      ['Repatriation', 'Up to USD 1M/year with Form 15CA/15CB'],
                      ['DTAA', 'India always taxes Indian property rent; claim credit abroad'],
                      ['Lower TDS', 'Form 13 certificate from AO reduces TDS to near-actual tax'],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-line last:border-0">
                        <td className="px-3 py-2 font-semibold text-body whitespace-nowrap">{k}</td>
                        <td className="px-3 py-2 text-muted">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </article>

        <div className="flex gap-2.5 bg-cyan/10 border border-cyan/30 rounded-xl p-4 text-xs text-cyan mb-8">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>This calculator assumes rental income is your only Indian income and uses new-regime slabs for FY 2025-26 without the 87A rebate. If you have other Indian income, slabs apply to the total. DTAA relief and old-regime election may change the outcome. Consult a CA for accurate filing.</div>
        </div>

        <h2 className="text-lg font-bold text-ink mb-1">NRI rental income FAQs</h2>
        <p className="text-xs text-faint mb-4">Slab tax vs TDS, deductions, tenant obligations and repatriation</p>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-line rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-surface hover:bg-surface-2 transition"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="flex-1 text-sm font-semibold text-ink">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp size={15} className="text-faint flex-shrink-0" />
                  : <ChevronDown size={15} className="text-faint flex-shrink-0" />}
              </button>
              {/* Always mounted so content stays in the DOM for search engines */}
              <div className={`px-4 pb-4 pt-1 border-t border-line text-sm text-muted leading-relaxed ${openFaq === i ? '' : 'hidden'}`}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>

        {/* ── Related tools ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink mb-3">Related calculators</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { path: '/calculators/nri-capital-gains', label: 'NRI Capital Gains Calculator', desc: 'Selling the property? Tax on the sale as an NRI' },
              { path: '/calculators/nri-fd', label: 'NRI FD Calculator', desc: 'NRE vs NRO vs FCNR for parking the rent' },
              { path: '/calculators/rnor-status', label: 'RNOR Status Calculator', desc: 'Returning to India? Check your transitional tax status' },
              { path: '/calculators/hra-calculator', label: 'HRA Calculator', desc: 'Your tenant may be claiming HRA on this rent' },
            ].map(t => (
              <Link key={t.path} to={t.path} className="bg-surface border border-line rounded-2xl p-4 hover:border-acc transition group">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink group-hover:text-acc transition">{t.label}</span>
                  <ArrowRight size={14} className="text-faint group-hover:text-acc transition flex-shrink-0" />
                </div>
                <p className="text-[11px] text-faint mt-1">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
      </div>
    </>
  );
}
