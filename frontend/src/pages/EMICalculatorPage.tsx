// File: frontend/src/pages/EMICalculatorPage.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from "react-router-dom";



type LoanType = 'home' | 'personal' | 'car' | 'education' | 'business';

interface Props {
  defaultLoan?: LoanType;
}

const LOAN_DEFAULTS: Record<LoanType, {
  min: number; max: number; step: number;
  rate: number; tenure: number; maxT: number;
  minL: string; maxL: string; title: string;
  defaultAmt: number;
}> = {
  home:      { min: 500000,  max: 10000000, step: 50000,  rate: 8.5,  tenure: 20, maxT: 30, minL: '₹5L',  maxL: '₹1Cr', title: 'Home Loan EMI Calculator',      defaultAmt: 5000000  },
  personal:  { min: 50000,   max: 4000000,  step: 10000,  rate: 12.0, tenure: 5,  maxT: 7,  minL: '₹50K', maxL: '₹40L', title: 'Personal Loan EMI Calculator',   defaultAmt: 500000   },
  car:       { min: 100000,  max: 3000000,  step: 25000,  rate: 9.0,  tenure: 7,  maxT: 8,  minL: '₹1L',  maxL: '₹30L', title: 'Car Loan EMI Calculator',         defaultAmt: 800000   },
  education: { min: 100000,  max: 2500000,  step: 25000,  rate: 10.5, tenure: 10, maxT: 15, minL: '₹1L',  maxL: '₹25L', title: 'Education Loan EMI Calculator',   defaultAmt: 1000000  },
  business:  { min: 100000,  max: 5000000,  step: 50000,  rate: 13.0, tenure: 5,  maxT: 10, minL: '₹1L',  maxL: '₹50L', title: 'Business Loan EMI Calculator',   defaultAmt: 1000000  },
};

function fmtINR(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function fmtShort(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + Math.round(n);
}

function calcEMI(P: number, r: number, n: number): number {
  if (r === 0) return P / n;
  const rm = r / 12 / 100;
  return (P * rm * Math.pow(1 + rm, n)) / (Math.pow(1 + rm, n) - 1);
}

// Pure SVG donut — no chart library needed
function DonutChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  const pPct  = principal / total;
  const r     = 40;
  const cx    = 50;
  const cy    = 50;
  const circ  = 2 * Math.PI * r;
  const pDash = pPct * circ;
  const iDash = circ - pDash;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {/* Interest arc (background) */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#93c5fd" strokeWidth="14"
        strokeDasharray={`${iDash} ${pDash}`}
        strokeDashoffset={-pDash}
        strokeLinecap="butt"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
      />
      {/* Principal arc */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2563eb" strokeWidth="14"
        strokeDasharray={`${pDash} ${iDash}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
      />
      <circle cx={cx} cy={cy} r={28} fill="white" />
    </svg>
  );
}

export default function EMICalculatorPage({ defaultLoan = 'home' }: Props) {
  const [loanType,   setLoanType]   = useState<LoanType>(defaultLoan);
  const [amount,     setAmount]     = useState(LOAN_DEFAULTS[defaultLoan].defaultAmt);
  const [rate,       setRate]       = useState(LOAN_DEFAULTS[defaultLoan].rate);
  const [tenure,     setTenure]     = useState(LOAN_DEFAULTS[defaultLoan].tenure);
  const [amortView,  setAmortView]  = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);

  const d       = LOAN_DEFAULTS[loanType];
  const n       = tenure * 12;
  const emi     = calcEMI(amount, rate, n);
  const total   = emi * n;
  const interest = total - amount;
  const iPct    = Math.round((interest / total) * 100);

// Add this useEffect — syncs tab when defaultLoan prop changes
  useEffect(() => {
    setLoanType(defaultLoan);
    const nd = LOAN_DEFAULTS[defaultLoan];
    setAmount(nd.defaultAmt);
    setRate(nd.rate);
    setTenure(nd.tenure);
  }, [defaultLoan]);

  // Amortization rows
  const amortRows = () => {
    const rows: { period: string; emi: number; principal: number; interest: number; balance: number }[] = [];
    let bal = amount;
    if (amortView === 'monthly') {
      const limit = Math.min(n, 60);
      for (let i = 1; i <= limit; i++) {
        const ia = bal * rate / 12 / 100;
        const pa = Math.min(emi - ia, bal);
        bal = Math.max(bal - pa, 0);
        rows.push({ period: `Month ${i}`, emi, principal: pa, interest: ia, balance: bal });
      }
    } else {
      for (let y = 1; y <= Math.ceil(n / 12); y++) {
        let yp = 0, yi = 0, ye = 0;
        const months = Math.min(12, n - (y - 1) * 12);
        for (let m = 0; m < months; m++) {
          const ia = bal * rate / 12 / 100;
          const pa = Math.min(emi - ia, bal);
          yi += ia; yp += pa; ye += emi;
          bal = Math.max(bal - pa, 0);
        }
        rows.push({ period: `Year ${y}`, emi: ye, principal: yp, interest: yi, balance: Math.max(bal, 0) });
      }
    }
    return rows;
  };

  // Bar chart data
  const barData = () => {
    let bal = amount;
    return Array.from({ length: Math.ceil(n / 12) }, (_, idx) => {
      let yp = 0, yi = 0;
      const months = Math.min(12, n - idx * 12);
      for (let m = 0; m < months; m++) {
        const ia = bal * rate / 12 / 100;
        const pa = Math.min(emi - ia, bal);
        yi += ia; yp += pa;
        bal = Math.max(bal - pa, 0);
      }
      return { year: idx + 1, pPct: Math.round((yp / (yp + yi)) * 100), yp, yi };
    });
  };

  const getLoanProfile = () => {
    if (amount <= 300000) return "low";
    if (amount <= 1000000) return "medium";
    return "high";
  };

const profile = getLoanProfile();

  const loanLabels: Record<LoanType, string> = {
    home: 'Home Loan', personal: 'Personal Loan', car: 'Car Loan', education: 'Education Loan', business: 'Business Loan',   };

  const faqs = [
    { q: 'What is the EMI formula used here?',
      a: 'This calculator uses the standard reducing balance method: EMI = P × r × (1+r)ⁿ / [(1+r)ⁿ - 1], where P is principal, r is monthly interest rate (annual ÷ 12 ÷ 100), and n is tenure in months. Most Indian banks use this method.' },
    { q: 'What is the difference between flat rate and reducing balance?',
      a: 'Flat rate charges interest on the original principal throughout the tenure. Reducing balance charges interest only on the outstanding principal each month — resulting in lower total interest paid. Most home and car loans use the reducing balance method.' },
    { q: 'Will my EMI change if the RBI changes interest rates?',
      a: 'Only for floating rate loans (most home loans linked to MCLR or Repo Rate). Fixed rate loans (most personal loans) keep the same EMI throughout regardless of RBI policy changes.' },
    { q: 'Can I prepay my loan to reduce EMI?',
      a: 'Yes. Prepayment reduces the outstanding principal, lowering either your EMI or tenure. For floating rate home loans, RBI mandates no prepayment penalty. Fixed rate loans may charge 1–2% prepayment fee — check your loan agreement.' },
    { q: 'What percentage of my income should my EMI be?',
      a: 'Keep total EMIs below 40–50% of your net monthly income. Banks typically approve loans where the proposed EMI does not exceed 50–60% of take-home salary. Staying below 40% gives you room for savings and emergencies.' },
    { q: 'What happens if I miss an EMI payment?',
      a: 'Penal charges of 1–2% on the overdue amount, CIBIL score drop of 50–100 points, and potential legal action for repeated defaults. If you anticipate difficulty, contact your bank early — most lenders offer a moratorium or restructuring option.' },
    { q: 'Is the EMI shown here exactly what my bank will charge?',
      a: 'It is a close estimate. Actual EMI may vary slightly due to the loan disbursement date (partial month interest), GST on processing fees, insurance bundled with the loan, and the lender\'s own rounding method. Always confirm final EMI with your lender.' },
    { q: 'How is an amortization schedule useful?',
      a: 'It shows month-by-month how your EMI splits between principal and interest. In early months most goes toward interest. Over time the principal component increases. This helps you decide the optimal time to prepay and saves you lakhs in total interest.' },
  ];

  return (
    <>
      <Helmet>
        <title>{d.title} 2026 — Calculate Monthly EMI | RupeePedia</title>
        <meta name="description" content={`Free ${d.title} — instantly calculate monthly EMI, total interest payable, and view full amortization schedule.`} />
        <link rel="canonical" href={`https://rupeepedia.in/calculators/emi`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

        {/* Hero — same gradient style as IFSCDetailPage */}
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">{d.title}</h1>
          <p className="text-brand-100 text-sm max-w-md mx-auto">
            Calculate your monthly EMI instantly. Plan smarter with full amortization schedule & payment breakdown.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* ── MAIN CALCULATOR CARD ── */}
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-brand-600 p-6">

            {/* Loan type tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {(Object.keys(loanLabels) as LoanType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setLoanType(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    loanType === t
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {loanLabels[t]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* LEFT: Sliders */}
              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">Loan Amount</span>
                    <input
                      type="text"
                      value={fmtINR(amount)}
                      onChange={e => {
                        const raw = Number(e.target.value.replace(/[^0-9]/g, ''));
                        if (!isNaN(raw)) setAmount(Math.min(Math.max(raw, d.min), d.max));
                      }}
                      className="bg-brand-50 text-brand-700 text-sm font-bold px-3 py-1 rounded-lg w-32 text-center border border-transparent focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                  <input type="range" min={d.min} max={d.max} step={d.step} value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{d.minL}</span><span>{d.maxL}</span>
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">Rate of Interest (p.a.)</span>
                    <input
                      type="text"
                      value={`${rate.toFixed(1)}%`}
                      onChange={e => {
                        const raw = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
                        if (!isNaN(raw)) setRate(Math.min(Math.max(raw, 5), 24));
                      }}
                      className="bg-brand-50 text-brand-700 text-sm font-bold px-3 py-1 rounded-lg w-20 text-center border border-transparent focus:border-brand-400 focus:outline-none cursor-text"
                    />
                  </div>
                  <input type="range" min={5} max={24} step={0.1} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>5%</span><span>24%</span>
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">Loan Tenure</span>
                    <input
                      type="text"
                      value={`${tenure} Yr`}
                      onChange={e => {
                        const raw = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                        if (!isNaN(raw)) setTenure(Math.min(Math.max(raw, 1), d.maxT));
                      }}
                      className="bg-brand-50 text-brand-700 text-sm font-bold px-3 py-1 rounded-lg w-20 text-center border border-transparent focus:border-brand-400 focus:outline-none cursor-text"
                    />
                  </div>
                  <input type="range" min={1} max={d.maxT} step={1} value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1 Yr</span><span>{d.maxT} Yr</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Result panel */}
              <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-lg p-5 text-white flex flex-col gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">Monthly EMI</div>
                  <div className="text-3xl font-bold tracking-tight">{fmtINR(emi)}</div>
                </div>

                <hr className="border-white/20" />

                <div className="flex items-center gap-4">
                  <DonutChart principal={amount} interest={interest} />
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-brand-300 flex-shrink-0"></span>
                      <div>
                        <div className="text-xs opacity-70">Principal Amount</div>
                        <div className="font-bold">{fmtINR(amount)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-brand-300 flex-shrink-0"></span>
                      <div>
                        <div className="text-xs opacity-70">Total Interest</div>
                        <div className="font-bold">{fmtINR(interest)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-brand-200 flex-shrink-0"></span>
                      <div>
                        <div className="text-xs opacity-70">Total Payable</div>
                        <div className="font-bold">{fmtINR(total)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-white/20" />
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Interest constitutes</span>
                  <span className="font-bold">{iPct}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Principal constitutes</span>
                  <span className="font-bold">{100 - iPct}%</span>
                </div>
                <p className="text-brand-200 text-sm">
                  🎯 Based on your profile, you are eligible for {profile === "low" ? "instant small loans" : profile === "medium" ? "low-interest personal loans" : "premium bank offers"}
                </p>
                <Link
                  to={`/loans?amount=${amount}&emi=${Math.round(emi)}&type=${loanType}`}
                  className="bg-white text-brand-700 font-bold text-sm rounded-lg py-3 text-center block"
                >
                  Check Best Loan Offers →
                </Link>
              </div>
            </div>

            {/* ── YEAR-WISE BAR CHART ── */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Year-wise Payment Breakdown</h2>
              <div className="flex gap-3 flex-wrap mb-4">
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>Principal <strong className="ml-1">{fmtShort(amount)}</strong>
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-brand-300"></span>Interest <strong className="ml-1">{fmtShort(interest)}</strong>
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-brand-800"></span>Total <strong className="ml-1">{fmtShort(total)}</strong>
                </span>
              </div>
              <div className="space-y-1.5">
                {barData().map(({ year, pPct, yp, yi }) => (
                  <div key={year} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-right text-slate-400 flex-shrink-0">Y{year}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-brand-600 rounded-l-full transition-all" style={{ width: `${pPct}%` }} />
                      <div className="h-full bg-brand-300 transition-all"              style={{ width: `${100 - pPct}%` }} />
                    </div>
                    <span className="text-slate-400 min-w-[110px] text-right">{fmtShort(yp)} / {fmtShort(yi)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── AMORTIZATION TABLE ── */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Amortization Schedule</h2>
              <div className="flex gap-2 mb-4">
                {(['monthly', 'yearly'] as const).map((v) => (
                  <button key={v} onClick={() => setAmortView(v)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      amortView === v
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600'
                    }`}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Period</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">EMI</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Principal</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Interest</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortRows().map((row, i) => (
                      <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">{row.period}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmtINR(row.emi)}</td>
                        <td className="px-4 py-3 text-right text-brand-600 font-medium">{fmtINR(row.principal)}</td>
                        <td className="px-4 py-3 text-right text-brand-500 font-medium">{fmtINR(row.interest)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmtINR(row.balance)}</td>
                      </tr>
                    ))}
                    {amortView === 'monthly' && n > 60 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-xs text-slate-400">
                          Showing 60 of {n} months — switch to Yearly view for full schedule
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── WHAT IS EMI ── */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">What is EMI?</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              EMI (Equated Monthly Instalment) is the fixed amount you pay your lender every month until the loan is fully repaid.
              Each EMI has two parts — <strong className="text-slate-800">principal repayment</strong> and <strong className="text-slate-800">interest payment</strong>.
              Early EMIs are mostly interest; over time the principal component increases. This is the <em>reducing balance method</em> used by most Indian banks.
            </p>
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
              <p className="text-sm font-semibold text-brand-800 mb-3">EMI Formula</p>
              <code className="block bg-white border border-brand-100 rounded-lg px-4 py-2 text-brand-700 font-mono text-sm mb-3">
                EMI = P × r × (1+r)ⁿ / [(1+r)ⁿ - 1]
              </code>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['P',   'Principal loan amount'],
                  ['r',   'Monthly rate (annual ÷ 12 ÷ 100)'],
                  ['n',   'Loan tenure in months'],
                  ['EMI', 'Equated Monthly Instalment'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 items-start text-xs">
                    <span className="bg-brand-200 text-brand-800 px-2 py-0.5 rounded font-bold flex-shrink-0">{k}</span>
                    <span className="text-brand-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FACTORS ── */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Factors Affecting Your EMI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '💰', title: 'Loan Amount',    desc: 'Higher the principal, higher the EMI. Borrow only what you need — even ₹1L extra adds to your burden for years.' },
                { icon: '📈', title: 'Interest Rate',  desc: 'A 0.5% rate difference significantly impacts total interest over long tenures. Always compare rates across lenders.' },
                { icon: '📅', title: 'Loan Tenure',    desc: 'Longer tenure = lower EMI but more total interest. Shorter tenure = higher EMI but saves lakhs overall.' },
              ].map((f) => (
                <div key={f.title} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="font-semibold text-sm text-slate-800 mb-1">{f.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── LOAN COMPARISON TABLE ── */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Loan Type Comparison</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand-600 text-white">
                    <th className="text-left px-4 py-3 text-xs font-semibold">Loan Type</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold">Typical Rate</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold">Max Tenure</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold">Max Amount</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold">Rate Type</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: 'Home Loan',       rate: '8.4%–10.5%', badge: 'green',  tenure: '30 years', amount: '₹10 Cr+', rateType: 'Floating' },
                    { type: 'Personal Loan',   rate: '10.5%–24%',  badge: 'red',    tenure: '7 years',  amount: '₹40L',    rateType: 'Fixed'    },
                    { type: 'Car Loan',        rate: '8.7%–13%',   badge: 'yellow', tenure: '8 years',  amount: '₹3 Cr',   rateType: 'Fixed'    },
                    { type: 'Education Loan',  rate: '9%–15%',     badge: 'yellow', tenure: '15 years', amount: '₹1.5 Cr', rateType: 'Floating' },
                    { type: 'Business Loan',   rate: '11%–21%',    badge: 'red',    tenure: '10 years', amount: '₹50L',    rateType: 'Fixed'    },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">{row.type}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          row.badge === 'green'  ? 'bg-brand-100 text-brand-700' :
                          row.badge === 'red'    ? 'bg-brand-200 text-brand-800' :
                                                   'bg-brand-50 text-brand-600'
                        }`}>{row.rate}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{row.tenure}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{row.amount}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{row.rateType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TIPS ── */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Tips to Reduce Your EMI Burden</h2>
            <div className="space-y-3">
              {[
                ['Make a larger down payment',          'Reducing principal directly reduces EMI. A 20–30% down payment on a home loan saves you lakhs over the tenure.'],
                ['Maintain a good CIBIL score (750+)',  'Banks offer best rates to high-score borrowers. A 750+ score can get you 0.5–1% lower rates.'],
                ['Opt for part-prepayment',             'Whenever you receive a bonus, prepay a lump sum. This reduces outstanding principal and future interest.'],
                ['Choose shorter tenure if affordable', 'If income allows a higher EMI, opt for shorter tenure. You\'ll save substantially on total interest paid.'],
                ['Consider a balance transfer',         'If your current rate is high, transfer to a lender offering better rates. Even 0.5% reduction helps over long tenure.'],
              ].map(([title, desc], i) => (
                <div key={i} className="flex gap-3 text-sm items-start">
                  <span className="bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <strong className="text-slate-800">{title}</strong>
                    <span className="text-slate-500"> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-slate-400 text-xs ml-4 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 pt-2 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── DISCLAIMER ── */}
          <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 text-xs text-brand-700 leading-relaxed">
            <strong>Disclaimer:</strong> This EMI calculator is for informational purposes only. RupeePedia does not guarantee accuracy for all lender-specific scenarios. Actual EMI, rates, and approval are subject to the lender's terms and your creditworthiness. Please consult your bank or financial advisor before making borrowing decisions.
          </div>

        </div>
      </div>
    </>
  );
}