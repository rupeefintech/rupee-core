import { useState, useMemo } from "react";

import { Helmet } from "react-helmet-async";

import { Link } from "react-router-dom";

import { IndianRupee, Info, ChevronRight } from "lucide-react";



// ── Tax slabs ────────────────────────────────────────────────────────────────

function calcNewRegimeTax(taxable: number): number {

  // FY 2025-26 (AY 2026-27) New Regime slabs

  const slabs = [

    { upto: 400000, rate: 0 },

    { upto: 800000, rate: 0.05 },

    { upto: 1200000, rate: 0.10 },

    { upto: 1600000, rate: 0.15 },

    { upto: 2000000, rate: 0.20 },

    { upto: 2400000, rate: 0.25 },

    { upto: Infinity, rate: 0.30 },

  ];

  let tax = 0, prev = 0;

  for (const s of slabs) {

    if (taxable <= prev) break;

    const chunk = Math.min(taxable, s.upto) - prev;

    tax += chunk * s.rate;

    prev = s.upto;

  }

  // Section 87A rebate: if taxable <= 12L, tax = 0 under new regime (FY2025-26)

  if (taxable <= 1200000) tax = 0;

  return tax;

}



function calcOldRegimeTax(taxable: number): number {

  const slabs = [

    { upto: 250000, rate: 0 },

    { upto: 500000, rate: 0.05 },

    { upto: 1000000, rate: 0.20 },

    { upto: Infinity, rate: 0.30 },

  ];

  let tax = 0, prev = 0;

  for (const s of slabs) {

    if (taxable <= prev) break;

    const chunk = Math.min(taxable, s.upto) - prev;

    tax += chunk * s.rate;

    prev = s.upto;

  }

  // Section 87A rebate: if taxable <= 5L, tax = 0

  if (taxable <= 500000) tax = 0;

  return tax;

}



function addCess(tax: number): number {

  return tax + tax * 0.04; // 4% Health & Education cess

}



// ── Formatters ───────────────────────────────────────────────────────────────

const fmt = (n: number) => "\u20B9" + Math.round(n).toLocaleString("en-IN");

const fmtM = (n: number) => fmt(Math.round(n / 12));



export default function SalaryCalculatorPage() {

  // Inputs

  const [ctc, setCtc] = useState(1200000);

  const [regime, setRegime] = useState<"new" | "old">("new");



  // Salary components (% of CTC)

  const [basicPct, setBasicPct] = useState(40);

  const [hraPct, setHraPct] = useState(50);

  const [epfPct, setEpfPct] = useState(12);



  // Deductions (old regime)

  const [sec80c, setSec80c] = useState(150000);

  const [sec80d, setSec80d] = useState(25000);

  const [rentPaid, setRentPaid] = useState(15000);

  const [isMetro, setIsMetro] = useState(true);



  // Professional tax

  const profTax = 2400;



  const breakdown = useMemo(() => {

    const basic = ctc * (basicPct / 100);

    const hra = basic * (hraPct / 100);

    const epfEmployee = basic * (epfPct / 100);

    const epfEmployer = basic * (epfPct / 100);

    const gratuity = (basic / 26) * 15;

    const specialAllowance = Math.max(ctc - basic - hra - epfEmployer - gratuity, 0);



    const grossSalary = basic + hra + specialAllowance;

    const totalDeductions = epfEmployee + profTax;

    const netSalaryBeforeTax = grossSalary - totalDeductions;



    const stdDeduction = regime === "new" ? 75000 : 50000;



    let hraExemption = 0;

    if (regime === "old" && rentPaid > 0) {

      const annualRent = rentPaid * 12;

      const c1 = hra;

      const c2 = annualRent - basic * 0.1;

      const c3 = basic * (isMetro ? 0.5 : 0.4);

      hraExemption = Math.max(Math.min(c1, c2, c3), 0);

    }



    let taxableIncome = grossSalary - stdDeduction;

    if (regime === "old") {

      taxableIncome -= hraExemption;

      taxableIncome -= Math.min(epfEmployee + sec80c, 150000);

      taxableIncome -= Math.min(sec80d, 25000);

    }

    taxableIncome = Math.max(taxableIncome, 0);



    const rawTax = regime === "new"

      ? calcNewRegimeTax(taxableIncome)

      : calcOldRegimeTax(taxableIncome);

    const totalTax = addCess(rawTax);



    const netAnnualSalary = netSalaryBeforeTax - totalTax;



    return {

      basic, hra, specialAllowance, epfEmployee, epfEmployer, gratuity,

      grossSalary, totalDeductions, netSalaryBeforeTax,

      stdDeduction, hraExemption, taxableIncome,

      rawTax, cess: rawTax * 0.04, totalTax,

      netAnnualSalary, profTax,

    };

  }, [ctc, basicPct, hraPct, epfPct, regime, sec80c, sec80d, rentPaid, isMetro]);



  return (

    <>

      <Helmet>

        <title>Salary Calculator 2026 - CTC to In-Hand Salary | RupeePedia</title>

        <meta name="description" content="Calculate your in-hand salary from CTC. See complete salary breakdown with Basic, HRA, EPF, tax deductions under Old & New regime for FY 2025-26." />

      </Helmet>



      <div className="min-h-screen bg-gray-50">

        {/* Hero */}

        <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-10 px-4">

          <div className="max-w-5xl mx-auto">

            <nav className="flex items-center gap-1.5 text-brand-100 text-sm mb-4">

              <Link to="/" className="hover:text-white">Home</Link>

              <ChevronRight className="w-3 h-3" />

              <Link to="/calculators" className="hover:text-white">Calculators</Link>

              <ChevronRight className="w-3 h-3" />

              <span className="text-white font-medium">Salary Calculator</span>

            </nav>

            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">

              <IndianRupee className="w-8 h-8" />

              Salary Calculator

            </h1>

            <p className="text-brand-100 max-w-lg">

              Calculate your in-hand salary from CTC with full breakdown &mdash; Basic, HRA, EPF, tax under Old &amp; New regime.

            </p>

          </div>

        </div>



        <div className="max-w-5xl mx-auto px-4 -mt-4 pb-12">

          <div className="grid lg:grid-cols-5 gap-6">



            {/* ── LEFT: Inputs ─────────────────────────────────────────── */}

            <div className="lg:col-span-2 space-y-5">



              {/* Regime Toggle */}

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

                <label className="block text-sm font-semibold text-gray-700 mb-3">Tax Regime</label>

                <div className="flex rounded-xl bg-gray-100 p-1">

                  {(["new", "old"] as const).map((r) => (

                    <button

                      key={r}

                      onClick={() => setRegime(r)}

                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${

                        regime === r

                          ? "bg-brand-600 text-white shadow-sm"

                          : "text-gray-500 hover:text-gray-700"

                      }`}

                    >

                      {r === "new" ? "New Regime" : "Old Regime"}

                    </button>

                  ))}

                </div>

                <p className="text-xs text-gray-400 mt-2 flex items-start gap-1">

                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />

                  {regime === "new"

                    ? "FY 2025-26: Standard deduction of Rs.75,000. No 80C/80D/HRA."

                    : "Allows 80C, 80D, HRA exemption & more deductions."}

                </p>

              </div>



              {/* CTC & Structure */}

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">

                <h3 className="text-sm font-semibold text-gray-700">Salary Structure</h3>



                <div>

                  <label className="text-xs text-gray-500 mb-1 block">Annual CTC</label>

                  <input

                    type="number"

                    value={ctc}

                    onChange={(e) => setCtc(Math.max(0, Number(e.target.value)))}

                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"

                  />

                  <input

                    type="range"

                    min={0} max={10000000} step={50000}

                    value={ctc}

                    onChange={(e) => setCtc(Number(e.target.value))}

                    className="w-full mt-2 accent-brand-600"

                  />

                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">

                    <span>0</span><span>25L</span><span>50L</span><span>75L</span><span>1Cr</span>

                  </div>

                </div>



                <div className="grid grid-cols-3 gap-3">

                  <div>

                    <label className="text-xs text-gray-500 mb-1 block">Basic (% CTC)</label>

                    <input

                      type="number"

                      value={basicPct} min={0} max={100}

                      onChange={(e) => setBasicPct(Number(e.target.value))}

                      className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-brand-400"

                    />

                  </div>

                  <div>

                    <label className="text-xs text-gray-500 mb-1 block">HRA (% Basic)</label>

                    <input

                      type="number"

                      value={hraPct} min={0} max={100}

                      onChange={(e) => setHraPct(Number(e.target.value))}

                      className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-brand-400"

                    />

                  </div>

                  <div>

                    <label className="text-xs text-gray-500 mb-1 block">EPF (% Basic)</label>

                    <input

                      type="number"

                      value={epfPct} min={0} max={12}

                      onChange={(e) => setEpfPct(Number(e.target.value))}

                      className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-brand-400"

                    />

                  </div>

                </div>

              </div>



              {/* Old Regime Deductions */}

              {regime === "old" && (

                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">

                  <h3 className="text-sm font-semibold text-gray-700">Deductions (Old Regime)</h3>



                  <div>

                    <label className="text-xs text-gray-500 mb-1 block">Section 80C &mdash; max 1.5L</label>

                    <input

                      type="number"

                      value={sec80c} min={0} max={150000}

                      onChange={(e) => setSec80c(Math.min(150000, Number(e.target.value)))}

                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"

                    />

                  </div>

                  <div>

                    <label className="text-xs text-gray-500 mb-1 block">Section 80D &mdash; Health Insurance</label>

                    <input

                      type="number"

                      value={sec80d} min={0} max={100000}

                      onChange={(e) => setSec80d(Number(e.target.value))}

                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"

                    />

                  </div>

                  <div>

                    <label className="text-xs text-gray-500 mb-1 block">Monthly Rent Paid &mdash; for HRA</label>

                    <input

                      type="number"

                      value={rentPaid} min={0}

                      onChange={(e) => setRentPaid(Number(e.target.value))}

                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"

                    />

                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-600">

                    <input

                      type="checkbox"

                      checked={isMetro}

                      onChange={() => setIsMetro(!isMetro)}

                      className="accent-brand-600 w-4 h-4"

                    />

                    Metro City (Delhi, Mumbai, Chennai, Kolkata)

                  </label>

                </div>

              )}

            </div>



            {/* ── RIGHT: Results ────────────────────────────────────────── */}

            <div className="lg:col-span-3 space-y-5">



              {/* In-Hand Highlight */}

              <div className="bg-gradient-to-r from-brand-700 to-brand-800 rounded-2xl p-6 text-white shadow-lg">

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-brand-100 text-xs font-medium mb-1">Monthly In-Hand</p>

                    <p className="text-3xl font-bold">{fmtM(breakdown.netAnnualSalary)}</p>

                  </div>

                  <div>

                    <p className="text-brand-100 text-xs font-medium mb-1">Annual In-Hand</p>

                    <p className="text-3xl font-bold">{fmt(breakdown.netAnnualSalary)}</p>

                  </div>

                </div>

              </div>



              {/* Salary Breakdown Table */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">

                  <h3 className="text-sm font-bold text-gray-800">Salary Breakdown</h3>

                  <div className="flex gap-8 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">

                    <span className="w-24 text-right">Yearly</span>

                    <span className="w-24 text-right">Monthly</span>

                  </div>

                </div>

                <div className="divide-y divide-gray-100">

                  <Row label="CTC (Cost to Company)" yearly={ctc} isBold />

                  <Row label="Basic Salary" yearly={breakdown.basic} sub />

                  <Row label="HRA (House Rent Allowance)" yearly={breakdown.hra} sub />

                  <Row label="Special Allowance" yearly={breakdown.specialAllowance} sub />

                  <Row label="Employer EPF" yearly={breakdown.epfEmployer} sub isDeduct />

                  <Row label="Gratuity" yearly={breakdown.gratuity} sub isDeduct />

                  <Row label="Gross Salary" yearly={breakdown.grossSalary} isBold isHighlight />

                  <Row label="Employee EPF" yearly={breakdown.epfEmployee} sub isDeduct />

                  <Row label="Professional Tax" yearly={breakdown.profTax} sub isDeduct />

                  <Row label="Net Salary (Before Tax)" yearly={breakdown.netSalaryBeforeTax} isBold />

                </div>

              </div>



              {/* Tax Calculation */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">

                  <h3 className="text-sm font-bold text-gray-800">Tax Calculation ({regime === "new" ? "New Regime" : "Old Regime"})</h3>

                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">FY 2025-26</span>

                </div>

                <div className="divide-y divide-gray-100">

                  <Row label="Gross Salary" yearly={breakdown.grossSalary} />

                  <Row label="Standard Deduction" yearly={breakdown.stdDeduction} sub isDeduct />

                  {regime === "old" && breakdown.hraExemption > 0 && (

                    <Row label="HRA Exemption" yearly={breakdown.hraExemption} sub isDeduct />

                  )}

                  {regime === "old" && (

                    <>

                      <Row label="Section 80C (EPF + others)" yearly={Math.min(breakdown.epfEmployee + sec80c, 150000)} sub isDeduct />

                      <Row label="Section 80D (Health)" yearly={Math.min(sec80d, 25000)} sub isDeduct />

                    </>

                  )}

                  <Row label="Taxable Income" yearly={breakdown.taxableIncome} isBold isHighlight />

                  <Row label="Income Tax" yearly={breakdown.rawTax} />

                  <Row label="Health & Education Cess (4%)" yearly={breakdown.cess} sub />

                  <Row label="Total Tax" yearly={breakdown.totalTax} isBold isRed />

                </div>

              </div>



              {/* Take-Home Summary */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">

                  <h3 className="text-sm font-bold text-gray-800">Take-Home Summary</h3>

                </div>

                <div className="divide-y divide-gray-100">

                  <Row label="Gross Salary" yearly={breakdown.grossSalary} />

                  <Row label="Total Deductions (EPF + PT)" yearly={breakdown.totalDeductions} isDeduct />

                  <Row label="Total Tax" yearly={breakdown.totalTax} isDeduct />

                  <Row label="Annual In-Hand Salary" yearly={breakdown.netAnnualSalary} isBold isGreen />

                  <Row label="Monthly In-Hand Salary" yearly={breakdown.netAnnualSalary} showMonthlyOnly isBold isGreen />

                </div>

              </div>



              {/* Tax Slabs Info */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">

                  <h3 className="text-sm font-bold text-gray-800">

                    {regime === "new" ? "New Regime" : "Old Regime"} Tax Slabs &mdash; FY 2025-26

                  </h3>

                </div>

                <div className="p-5">

                  <table className="w-full text-sm">

                    <thead>

                      <tr className="text-left text-gray-500 text-xs">

                        <th className="pb-2 font-medium">Income Slab</th>

                        <th className="pb-2 font-medium text-right">Tax Rate</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100">

                      {regime === "new" ? (

                        <>

                          <SlabRow slab="Up to ₹4,00,000" rate="Nil" />

                          <SlabRow slab="₹4,00,001 – ₹8,00,000" rate="5%" />

                          <SlabRow slab="₹8,00,001 – ₹12,00,000" rate="10%" />

                          <SlabRow slab="₹12,00,001 – ₹16,00,000" rate="15%" />

                          <SlabRow slab="₹16,00,001 – ₹20,00,000" rate="20%" />

                          <SlabRow slab="₹20,00,001 – ₹24,00,000" rate="25%" />

                          <SlabRow slab="Above ₹24,00,000" rate="30%" />

                        </>

                      ) : (

                        <>

                          <SlabRow slab="Up to ₹2,50,000" rate="Nil" />

                          <SlabRow slab="₹2,50,001 – ₹5,00,000" rate="5%" />

                          <SlabRow slab="₹5,00,001 – ₹10,00,000" rate="20%" />

                          <SlabRow slab="Above ₹10,00,000" rate="30%" />

                        </>

                      )}

                    </tbody>

                  </table>

                  <p className="text-xs text-gray-400 mt-3">

                    + 4% Health &amp; Education Cess on total tax.

                    {regime === "new" ? " Section 87A rebate: No tax if taxable income \u2264 \u20B912L." : " Section 87A rebate: No tax if taxable income \u2264 \u20B95L."}

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </>

  );

}



// ── Reusable row component ────────────────────────────────────────────────────

function Row({ label, yearly, isBold, isHighlight, isGreen, isRed, isDeduct, sub, showMonthlyOnly }: {

  label: string;

  yearly: number;

  isBold?: boolean;

  isHighlight?: boolean;

  isGreen?: boolean;

  isRed?: boolean;

  isDeduct?: boolean;

  sub?: boolean;

  showMonthlyOnly?: boolean;

}) {

  const textColor = isGreen ? "text-green-600" : isRed ? "text-red-600" : isDeduct ? "text-red-500" : "text-gray-800";

  const bg = isHighlight ? "bg-brand-50" : "";

  const font = isBold ? "font-semibold" : "font-normal";

  const prefix = isDeduct ? "- " : "";



  return (

    <div className={`flex items-center justify-between px-5 py-2.5 ${bg}`}>

      <span className={`text-sm flex-1 min-w-0 ${sub ? "pl-3 text-gray-500" : "text-gray-700"} ${isBold ? "font-semibold" : ""}`}>

        {label}

      </span>

      <div className="flex items-center gap-8 text-right flex-shrink-0">

        {!showMonthlyOnly && (

          <span className={`text-sm ${font} ${textColor} w-24`}>

            {prefix}{fmt(yearly)}

          </span>

        )}

        <span className={`text-sm ${font} ${textColor} w-24`}>

          {prefix}{fmtM(yearly)}

          {showMonthlyOnly && <span className="text-xs text-gray-400 ml-1">/mo</span>}

        </span>

      </div>

    </div>

  );

}



function SlabRow({ slab, rate }: { slab: string; rate: string }) {

  return (

    <tr>

      <td className="py-2 text-gray-700">{slab}</td>

      <td className="py-2 text-right font-semibold text-gray-800">{rate}</td>

    </tr>

  );

}