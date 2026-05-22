import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

function getSurcharge(income: number): number {
  if (income <= 5000000) return 0;
  if (income <= 10000000) return 10;
  if (income <= 20000000) return 15;
  if (income <= 50000000) return 25;
  return 37;
}

const FAQS = [
  {
    q: 'What is the tax rate on rental income for NRIs?',
    a: 'Rental income from Indian property is taxable in India for NRIs at a flat rate of 30% (no slab benefit). A 30% standard deduction on net annual value is allowed. Additionally, municipal taxes paid are deductible. TDS is deducted by the tenant at 31.2% (30% + 4% cess) on gross rent.',
  },
  {
    q: 'What TDS does a tenant deduct on rent paid to NRI?',
    a: 'Under Section 195, a tenant (any payer, not just individual/HUF) paying rent to an NRI must deduct TDS at 30% + surcharge + cess. Unlike resident landlords (where TDS kicks in above ₹2.4L/year for individuals), there is no minimum threshold for NRI landlords — TDS applies from rupee one.',
  },
  {
    q: 'What deductions can NRI landlords claim?',
    a: '1) Municipal/property taxes paid during the year. 2) Standard deduction: 30% of Net Annual Value (NAV = Gross Rent − Municipal Tax). 3) Home loan interest (if applicable) — NRI can claim deduction under Section 24(b) up to ₹2L for self-occupied property, no limit for let-out property. 4) Principal repayment under Section 80C.',
  },
  {
    q: 'Can NRIs claim home loan deductions on rental property?',
    a: 'Yes. For a let-out property, the entire interest on home loan is deductible (no ₹2L cap). This can significantly reduce taxable rental income. For a self-occupied property, interest deduction is capped at ₹2L (₹1.5L if loan taken before April 1, 1999).',
  },
  {
    q: 'Can NRIs file an income tax return to claim TDS refund?',
    a: 'Yes. If the TDS deducted (31.2%) exceeds the actual tax liability (after deductions), NRIs can file an ITR in India and claim the excess TDS as a refund. The tax refund is credited to the NRO account.',
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

export default function NRIRentalIncomePage() {
  const [monthlyRent, setMonthlyRent] = useState(50000);
  const [municipalTax, setMunicipalTax] = useState(12000);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [isLetOut, setIsLetOut] = useState(true);

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

    // Tax at 30% flat for NRI
    const baseTax = taxableIncome * 0.30;
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
        <title>NRI Rental Income Tax Calculator | RupeePedia</title>
        <meta name="description" content="Calculate tax on rental income from Indian property for NRIs. Understand TDS, deductions, and net income after tax." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/nri-rental-income" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">NRI Rental Income Tax Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Calculate Indian income tax on rent from your Indian property — with TDS, deductions, and refund/payable estimate.</p>
        </div>

        {/* Property type toggle */}
        <div className="card p-5 mb-5">
          <div className="text-xs font-semibold text-gray-600 mb-2">Property Status</div>
          <div className="flex gap-2">
            {[true, false].map(letOut => (
              <button key={String(letOut)} onClick={() => setIsLetOut(letOut)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition border ${
                  isLetOut === letOut ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {letOut ? '🏠 Let-Out Property' : '🏡 Self-Occupied'}
              </button>
            ))}
          </div>
          {!isLetOut && (
            <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-3">
              Self-occupied property: NAV is treated as zero. Rental income section shows notional tax. Home loan interest deduction capped at ₹2L.
            </p>
          )}
        </div>

        {/* Inputs */}
        <div className="card p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Monthly Rent (₹)</label>
              <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Municipal / Property Tax Paid Annually (₹)</label>
              <input type="number" value={municipalTax} onChange={e => setMunicipalTax(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Home Loan Interest Paid Annually (₹)
                {!isLetOut && <span className="ml-1 text-amber-600">(capped at ₹2L for self-occupied)</span>}
              </label>
              <input type="number" value={homeLoanInterest} onChange={e => setHomeLoanInterest(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        </div>

        {/* Computation breakdown */}
        <div className="card p-5 mb-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Tax Computation Breakdown</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Gross Annual Rent', value: fmt(result.grossAnnualRent), note: `${monthlyRent.toLocaleString()} × 12`, positive: true },
              { label: 'Less: Municipal Tax', value: `(${fmt(municipalTax)})`, note: 'paid during the year', positive: false },
              { label: 'Net Annual Value (NAV)', value: fmt(result.nav), note: 'gross rent − municipal tax', positive: true, separator: true },
              { label: 'Less: 30% Standard Deduction', value: `(${fmt(result.standardDeduction)})`, note: '30% of NAV', positive: false },
              ...(result.hlInterestDeduction > 0 ? [{ label: 'Less: Home Loan Interest', value: `(${fmt(result.hlInterestDeduction)})`, note: isLetOut ? 'full interest allowed' : 'capped at ₹2L', positive: false }] : []),
              { label: 'Taxable Income from Property', value: fmt(result.taxableIncome), note: '', positive: true, separator: true },
              { label: 'Tax @ 30% (flat rate for NRI)', value: fmt(result.baseTax), note: '', positive: false },
              ...(result.surcharge > 0 ? [{ label: `Surcharge @ ${result.surchargePct}%`, value: fmt(result.surcharge), note: 'on tax amount', positive: false }] : []),
              { label: 'Health & Education Cess @ 4%', value: fmt(result.cess), note: 'on tax + surcharge', positive: false },
              { label: 'Total Tax Payable', value: fmt(result.totalTax), note: `Effective rate: ${result.effectiveRate.toFixed(1)}% on gross rent`, positive: false, separator: true, bold: true },
            ].map(({ label, value, note, positive, separator, bold }) => (
              <div key={label} className={`flex items-center justify-between py-2 ${separator ? 'border-t border-gray-200 mt-1 pt-3' : ''}`}>
                <div>
                  <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{label}</span>
                  {note && <span className="text-xs text-gray-400 ml-2">{note}</span>}
                </div>
                <span className={`text-sm font-semibold ${bold ? 'text-gray-900' : positive ? 'text-gray-800' : 'text-red-600'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TDS vs Actual Tax */}
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-xs text-amber-600 font-semibold mb-1">TDS Tenant Deducts</div>
            <div className="text-2xl font-bold text-amber-800">{fmt(result.tdsOnGross)}</div>
            <div className="text-xs text-amber-700 mt-1">31.2% on gross rent (30% + 4% cess). No threshold for NRI landlords.</div>
          </div>
          <div className={`rounded-xl border p-4 ${result.refundOrPayable >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`text-xs font-semibold mb-1 ${result.refundOrPayable >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {result.refundOrPayable >= 0 ? 'TDS Refund (file ITR)' : 'Additional Tax Payable'}
            </div>
            <div className={`text-2xl font-bold ${result.refundOrPayable >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {fmt(Math.abs(result.refundOrPayable))}
            </div>
            <div className={`text-xs mt-1 ${result.refundOrPayable >= 0 ? 'text-green-700' : 'text-red-700'}`}>
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
            <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <div className="text-[10px] text-gray-400 mb-1">{label}</div>
              <div className="text-base font-bold text-gray-800">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 mb-8">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>This calculator assumes rental income is the only India income. Surcharge is computed on property income alone. DTAA relief (if applicable) may reduce tax. Consult a CA for accurate filing, especially if you have multiple income sources in India.</div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">FAQs</h2>
        <p className="text-xs text-gray-400 mb-4">Common questions about NRI rental income tax</p>
        <div className="space-y-2">
          {FAQS.map((f, i) => <FaqItem key={i} {...f} />)}
        </div>
      </div>
    </>
  );
}
