import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { IndianRupee, ChevronRight, Info, Calculator, TrendingDown } from "lucide-react";

// ── TAX LOGIC ─────────────────────────────────────
// Updated for FY 2025-26 New Regime Slabs
function calcNewTax(income: number) {
  const slabs = [
    { upto: 400000, rate: 0 },
    { upto: 800000, rate: 0.05 },
    { upto: 1200000, rate: 0.1 },
    { upto: 1600000, rate: 0.15 },
    { upto: 2000000, rate: 0.2 },
    { upto: 2400000, rate: 0.25 },
    { upto: Infinity, rate: 0.3 },
  ];

  let tax = 0, prev = 0;
  for (const s of slabs) {
    if (income <= prev) break;
    const chunk = Math.min(income, s.upto) - prev;
    tax += chunk * s.rate;
    prev = s.upto;
  }
  // Rebate under 12L for New Regime
  if (income <= 1200000) tax = 0;
  return tax;
}

function calcOldTax(income: number) {
  const slabs = [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 1000000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ];

  let tax = 0, prev = 0;
  for (const s of slabs) {
    if (income <= prev) break;
    const chunk = Math.min(income, s.upto) - prev;
    tax += chunk * s.rate;
    prev = s.upto;
  }
  if (income <= 500000) tax = 0;
  return tax;
}

const addCess = (t: number) => t * 1.04;
const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// ── COMPONENT ─────────────────────────────────────
export default function TaxCalculatorPage() {
  const [income, setIncome] = useState(1200000);
  const [c80c, setC80c] = useState(150000);
  const [hra, setHra] = useState(0);
  const [homeLoan, setHomeLoan] = useState(0);
  const [nps, setNps] = useState(0);
  const [medical, setMedical] = useState(25000);

  const result = useMemo(() => {
    const oldDeductions = c80c + hra + homeLoan + nps + medical + 50000;
    const taxableOld = Math.max(0, income - oldDeductions);
    const oldTax = addCess(calcOldTax(taxableOld));

    const taxableNew = Math.max(0, income - 75000);
    const newTax = addCess(calcNewTax(taxableNew));

    const better = oldTax < newTax ? "Old Regime" : "New Regime";
    const savings = Math.abs(oldTax - newTax);

    return { taxableOld, taxableNew, oldTax, newTax, better, savings };
  }, [income, c80c, hra, homeLoan, nps, medical]);

  return (
    <>
      <Helmet>
        <title>Income Tax Calculator FY 2025-26 | Rupeepedia</title>
      </Helmet>

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* CLEANER HERO */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center gap-2 text-indigo-200 text-xs uppercase tracking-wider mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-indigo-300" />
              <Link to="/calculators" className="hover:text-white transition-colors">Calculators</Link>
              <ChevronRight className="w-3 h-3 text-indigo-300" />
              <span className="text-white font-medium">Income Tax</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold flex items-center gap-3">
                  <Calculator className="text-indigo-200 w-10 h-10" /> Tax <span className="text-indigo-200">Calculator</span>
                </h1>
                <p className="text-indigo-100 mt-3 text-lg max-w-md border-l-2 border-indigo-300/30 pl-4">
                  Assessment Year 2026-27 comparison engine.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-8 pb-20">
          <div className="grid lg:grid-cols-12 gap-8">

            {/* INPUT SECTION */}
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <div className="flex items-center gap-2 mb-6 border-b pb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <IndianRupee className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Earnings & Investment</h3>
                </div>
                
                <Input label="Total Annual Income" value={income} onChange={setIncome} />
                
                <div className="mt-8 pt-6 border-t border-dashed">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700">Deductions (Old Regime)</h3>
                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded uppercase font-bold text-slate-500">Optional</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Section 80C (EPF, LIC, etc)" value={c80c} onChange={setC80c} placeholder="Max 1,50,000" />
                    <Input label="Medical Insurance (80D)" value={medical} onChange={setMedical} />
                    <Input label="HRA Exemption" value={hra} onChange={setHra} />
                    <Input label="Home Loan Interest (24b)" value={homeLoan} onChange={setHomeLoan} />
                    <Input label="NPS (80CCD 1B)" value={nps} onChange={setNps} />
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <Info className="w-4 h-4 text-indigo-500" />
                      <p className="text-xs text-indigo-700">₹75,000 Std. Deduction applied automatically.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* RESULTS SECTION */}
            <div className="lg:col-span-5 space-y-6">
              {/* SAVINGS CARD */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 rounded-3xl shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                <TrendingDown className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                <div className="relative z-10">
                  <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Recommended Regime</h2>
                  <p className="text-3xl font-black mb-4">{result.better}</p>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 inline-block border border-white/30">
                    <span className="text-sm block opacity-90">Total Annual Savings</span>
                    <span className="text-2xl font-bold">{fmt(result.savings)}</span>
                  </div>
                </div>
              </div>

              <Card>
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  Comparison Summary
                </h3>
                
                <div className="space-y-4">
                   <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                      <Row label="Taxable (Old)" value={result.taxableOld} />
                      <Row label="Taxable (New)" value={result.taxableNew} />
                   </div>
                   
                   <div className="px-4 py-2 space-y-3">
                      <Row label="Old Regime Tax" value={result.oldTax} isEmphasis color="text-slate-700" />
                      <Row label="New Regime Tax" value={result.newTax} isEmphasis color="text-indigo-600" />
                   </div>
                </div>

                <button className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
                   Download Detailed Report
                </button>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// ── REFINED UI COMPONENTS ──────────────────────────

function Card({ children }: any) {
  return <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60">{children}</div>;
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div className="group">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-indigo-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
        <input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700"
        />
      </div>
    </div>
  );
}

function Row({ label, value, isEmphasis, color = "text-slate-600" }: any) {
  return (
    <div className={`flex justify-between items-center ${isEmphasis ? "py-1" : "py-0"}`}>
      <span className={`text-xs font-medium uppercase tracking-wide ${isEmphasis ? "text-slate-500" : "text-slate-400"}`}>{label}</span>
      <span className={`font-bold ${isEmphasis ? "text-xl" : "text-sm"} ${color}`}>
        {fmt(value)}
      </span>
    </div>
  );
}