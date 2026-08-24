// File: frontend/src/pages/EMICalculatorPage.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';



type LoanType = 'home' | 'personal' | 'car' | 'education' | 'business' | 'lap';

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
  lap:       { min: 500000,  max: 50000000, step: 100000, rate: 9.5,  tenure: 15, maxT: 20, minL: '₹5L',  maxL: '₹5Cr', title: 'Loan Against Property EMI Calculator', defaultAmt: 3000000 },
};

function fmtINR(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
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
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--cyan)" strokeWidth="14"
        strokeDasharray={`${iDash} ${pDash}`}
        strokeDashoffset={-pDash}
        strokeLinecap="butt"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
      />
      {/* Principal arc */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--acc)" strokeWidth="14"
        strokeDasharray={`${pDash} ${iDash}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
      />
      <circle cx={cx} cy={cy} r={28} fill="var(--acc-deep)" />
    </svg>
  );
}

export default function EMICalculatorPage({ defaultLoan = 'home' }: Props) {
  const { pathname } = useLocation();
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

  const getLoanProfile = () => {
    if (amount <= 300000) return "low";
    if (amount <= 1000000) return "medium";
    return "high";
  };

const profile = getLoanProfile();

  const loanLabels: Record<LoanType, string> = {
    home: 'Home Loan', personal: 'Personal Loan', car: 'Car Loan', education: 'Education Loan', business: 'Business Loan', lap: 'Loan Against Property',   };

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
        <link rel="canonical" href={`https://rupeepedia.in${pathname}`} />
        <meta property="og:title" content={`${d.title} 2026 — Calculate Monthly EMI | RupeePedia`} />
        <meta property="og:description" content={`Free ${d.title} — instantly calculate monthly EMI, total interest payable, and view full amortization schedule.`} />
        <meta property="og:url" content={`https://rupeepedia.in${pathname}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${d.title} 2026 — Calculate Monthly EMI | RupeePedia`} />
        <meta name="twitter:description" content={`Free ${d.title} — instantly calculate monthly EMI, total interest payable, and view full amortization schedule.`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
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
            { '@type': 'ListItem', position: 3, name: d.title, item: `https://rupeepedia.in${pathname}` },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-bg">

        <CalculatorHero
          crumb="EMI"
          title={d.title.replace(' EMI Calculator', '')}
          accent="EMI Calculator"
          subtitle="Monthly EMI with full amortization schedule and payment breakdown."
          widthClass="max-w-4xl"
        />

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* ── MAIN CALCULATOR CARD ── */}
          <div className="bg-surface rounded-[13px] border border-line border-l-4 border-l-acc p-6">

            {/* Loan type tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {(Object.keys(loanLabels) as LoanType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setLoanType(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    loanType === t
                      ? 'bg-acc border-acc text-white'
                      : 'border-line text-muted hover:border-acc hover:text-acc'
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
                    <span className="text-sm font-semibold text-body">Loan Amount</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setAmount(a => Math.max(d.min, a - d.step))}
                        className="w-7 h-7 rounded-md bg-acc-deep hover:bg-acc/20 text-acc font-bold text-base flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30"
                        disabled={amount <= d.min}>−</button>
                      <input
                        type="text"
                        value={fmtINR(amount)}
                        onChange={e => {
                          const raw = Number(e.target.value.replace(/[^0-9]/g, ''));
                          if (!isNaN(raw)) setAmount(Math.min(Math.max(raw, d.min), d.max));
                        }}
                        className="bg-bg-2 text-acc text-sm font-bold px-2 py-1 rounded-lg w-28 text-center border border-transparent focus:border-acc focus:outline-none"
                      />
                      <button type="button" onClick={() => setAmount(a => Math.min(d.max, a + d.step))}
                        className="w-7 h-7 rounded-md bg-acc-deep hover:bg-acc/20 text-acc font-bold text-base flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30"
                        disabled={amount >= d.max}>+</button>
                    </div>
                  </div>
                  <input type="range" min={d.min} max={d.max} step={d.step} value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-acc cursor-pointer" />
                  <div className="flex justify-between text-xs text-faint mt-1">
                    <span>{d.minL}</span><span>{d.maxL}</span>
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-body">Rate of Interest (p.a.)</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setRate(r => Math.max(5, parseFloat((r - 0.1).toFixed(1))))}
                        className="w-7 h-7 rounded-md bg-acc-deep hover:bg-acc/20 text-acc font-bold text-base flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30"
                        disabled={rate <= 5}>−</button>
                      <input
                        type="text"
                        value={`${rate.toFixed(1)}%`}
                        onChange={e => {
                          const raw = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
                          if (!isNaN(raw)) setRate(Math.min(Math.max(raw, 5), 24));
                        }}
                        className="bg-bg-2 text-acc text-sm font-bold px-2 py-1 rounded-lg w-20 text-center border border-transparent focus:border-acc focus:outline-none cursor-text"
                      />
                      <button type="button" onClick={() => setRate(r => Math.min(24, parseFloat((r + 0.1).toFixed(1))))}
                        className="w-7 h-7 rounded-md bg-acc-deep hover:bg-acc/20 text-acc font-bold text-base flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30"
                        disabled={rate >= 24}>+</button>
                    </div>
                  </div>
                  <input type="range" min={5} max={24} step={0.1} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-acc cursor-pointer" />
                  <div className="flex justify-between text-xs text-faint mt-1">
                    <span>5%</span><span>24%</span>
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-body">Loan Tenure</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setTenure(t => Math.max(1, t - 1))}
                        className="w-7 h-7 rounded-md bg-acc-deep hover:bg-acc/20 text-acc font-bold text-base flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30"
                        disabled={tenure <= 1}>−</button>
                      <input
                        type="text"
                        value={`${tenure} Yr`}
                        onChange={e => {
                          const raw = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                          if (!isNaN(raw)) setTenure(Math.min(Math.max(raw, 1), d.maxT));
                        }}
                        className="bg-bg-2 text-acc text-sm font-bold px-2 py-1 rounded-lg w-20 text-center border border-transparent focus:border-acc focus:outline-none cursor-text"
                      />
                      <button type="button" onClick={() => setTenure(t => Math.min(d.maxT, t + 1))}
                        className="w-7 h-7 rounded-md bg-acc-deep hover:bg-acc/20 text-acc font-bold text-base flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30"
                        disabled={tenure >= d.maxT}>+</button>
                    </div>
                  </div>
                  <input type="range" min={1} max={d.maxT} step={1} value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full accent-acc cursor-pointer" />
                  <div className="flex justify-between text-xs text-faint mt-1">
                    <span>1 Yr</span><span>{d.maxT} Yr</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Result panel */}
              <div className="bg-gradient-to-br from-acc-deep to-surface border border-acc/25 rounded-[13px] p-5 text-ink flex flex-col gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted font-semibold mb-1">Monthly EMI</div>
                  <div className="text-3xl font-bold tracking-tight text-ink">{fmtINR(emi)}</div>
                </div>

                <hr className="border-line" />

                <div className="flex items-center gap-4">
                  <DonutChart principal={amount} interest={interest} />
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-acc flex-shrink-0"></span>
                      <div>
                        <div className="text-xs text-muted">Principal Amount</div>
                        <div className="font-bold text-ink">{fmtINR(amount)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-cyan flex-shrink-0"></span>
                      <div>
                        <div className="text-xs text-muted">Total Interest</div>
                        <div className="font-bold text-ink">{fmtINR(interest)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-line-2 flex-shrink-0"></span>
                      <div>
                        <div className="text-xs text-muted">Total Payable</div>
                        <div className="font-bold text-ink">{fmtINR(total)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-line" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Interest constitutes</span>
                  <span className="font-bold text-ink">{iPct}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Principal constitutes</span>
                  <span className="font-bold text-ink">{100 - iPct}%</span>
                </div>
                <p className="text-body text-sm">
                  🎯 Based on your profile, you are eligible for {profile === "low" ? "instant small loans" : profile === "medium" ? "low-interest personal loans" : "premium bank offers"}
                </p>
                <Link
                  to={`/loans?amount=${amount}&emi=${Math.round(emi)}&type=${loanType}`}
                  className="bg-gradient-to-br from-acc to-acc-2 text-white font-bold text-sm rounded-lg py-3 text-center block shadow-acc-glow"
                >
                  Check Best Loan Offers →
                </Link>
              </div>
            </div>

            {/* ── AMORTIZATION TABLE ── */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-ink mb-3">Amortization Schedule</h2>
              <div className="flex gap-2 mb-4">
                {(['monthly', 'yearly'] as const).map((v) => (
                  <button key={v} onClick={() => setAmortView(v)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      amortView === v
                        ? 'bg-acc text-white border-acc'
                        : 'border-line text-muted hover:border-acc hover:text-acc'
                    }`}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto rounded-lg border border-line max-h-[340px] overflow-y-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-2 sticky top-0">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Period</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted">EMI</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted">Principal</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted">Interest</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortRows().map((row, i) => (
                      <tr key={i} className="border-t border-line hover:bg-surface-2 transition-colors">
                        <td className="px-4 py-3 font-medium text-body">{row.period}</td>
                        <td className="px-4 py-3 text-right text-body">{fmtINR(row.emi)}</td>
                        <td className="px-4 py-3 text-right text-acc font-medium">{fmtINR(row.principal)}</td>
                        <td className="px-4 py-3 text-right text-cyan font-medium">{fmtINR(row.interest)}</td>
                        <td className="px-4 py-3 text-right text-body">{fmtINR(row.balance)}</td>
                      </tr>
                    ))}
                    {amortView === 'monthly' && n > 60 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-xs text-faint">
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
          <div className="bg-surface rounded-[13px] border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-3">What is EMI?</h2>
            <p className="text-sm text-muted leading-relaxed mb-4">
              EMI (Equated Monthly Instalment) is the fixed amount you pay your lender every month until the loan is fully repaid.
              Each EMI has two parts — <strong className="text-body">principal repayment</strong> and <strong className="text-body">interest payment</strong>.
              Early EMIs are mostly interest; over time the principal component increases. This is the <em>reducing balance method</em> used by most Indian banks.
            </p>
            <div className="bg-acc-deep border border-acc/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-ink mb-3">EMI Formula</p>
              <code className="block bg-surface border border-acc/20 rounded-lg px-4 py-2 text-acc font-mono text-sm mb-3">
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
                    <span className="bg-acc/20 text-ink px-2 py-0.5 rounded font-bold flex-shrink-0">{k}</span>
                    <span className="text-body">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FACTORS ── */}
          <div className="bg-surface rounded-[13px] border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Factors Affecting Your EMI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '💰', title: 'Loan Amount',    desc: 'Higher the principal, higher the EMI. Borrow only what you need — even ₹1L extra adds to your burden for years.' },
                { icon: '📈', title: 'Interest Rate',  desc: 'A 0.5% rate difference significantly impacts total interest over long tenures. Always compare rates across lenders.' },
                { icon: '📅', title: 'Loan Tenure',    desc: 'Longer tenure = lower EMI but more total interest. Shorter tenure = higher EMI but saves lakhs overall.' },
              ].map((f) => (
                <div key={f.title} className="bg-surface-2 rounded-lg p-4 border border-line">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="font-semibold text-sm text-ink mb-1">{f.title}</div>
                  <div className="text-xs text-muted leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── LOAN COMPARISON TABLE ── */}
          <div className="bg-surface rounded-[13px] border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Loan Type Comparison</h2>
            <div className="overflow-x-auto rounded-lg border border-line max-h-[340px] overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-acc text-white sticky top-0">
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
                    <tr key={i} className="border-t border-line hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3 font-medium text-body">{row.type}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          row.badge === 'green'  ? 'bg-mint/10 text-mint' :
                          row.badge === 'red'    ? 'bg-coral/10 text-coral' :
                                                   'bg-gold/10 text-gold'
                        }`}>{row.rate}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-body">{row.tenure}</td>
                      <td className="px-4 py-3 text-center text-body">{row.amount}</td>
                      <td className="px-4 py-3 text-center text-body">{row.rateType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TIPS ── */}
          <div className="bg-surface rounded-[13px] border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Tips to Reduce Your EMI Burden</h2>
            <div className="space-y-3">
              {[
                ['Make a larger down payment',          'Reducing principal directly reduces EMI. A 20–30% down payment on a home loan saves you lakhs over the tenure.'],
                ['Maintain a good CIBIL score (750+)',  'Banks offer best rates to high-score borrowers. A 750+ score can get you 0.5–1% lower rates.'],
                ['Opt for part-prepayment',             'Whenever you receive a bonus, prepay a lump sum. This reduces outstanding principal and future interest.'],
                ['Choose shorter tenure if affordable', 'If income allows a higher EMI, opt for shorter tenure. You\'ll save substantially on total interest paid.'],
                ['Consider a balance transfer',         'If your current rate is high, transfer to a lender offering better rates. Even 0.5% reduction helps over long tenure.'],
              ].map(([title, desc], i) => (
                <div key={i} className="flex gap-3 text-sm items-start">
                  <span className="bg-acc text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <strong className="text-body">{title}</strong>
                    <span className="text-muted"> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="bg-surface rounded-[13px] border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-line rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-body hover:bg-surface-2 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-faint text-xs ml-4 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 pt-2 text-sm text-muted leading-relaxed border-t border-line">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── DISCLAIMER ── */}
          <div className="bg-acc-deep border border-acc/20 rounded-lg p-4 text-xs text-body leading-relaxed">
            <strong className="text-ink">Disclaimer:</strong> This EMI calculator is for informational purposes only. RupeePedia does not guarantee accuracy for all lender-specific scenarios. Actual EMI, rates, and approval are subject to the lender's terms and your creditworthiness. Please consult your bank or financial advisor before making borrowing decisions.
          </div>

          {/* ── RELATED CALCULATORS ── */}
          <div className="bg-surface rounded-lg border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Related calculators</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { path: '/calculators/sip', label: 'SIP Calculator', desc: 'Project SIP returns' },
                { path: '/calculators/home-loan-eligibility', label: 'Loan Eligibility', desc: 'Max loan amount you qualify for' },
                { path: '/calculators/income-tax', label: 'Income Tax Calculator', desc: 'Old vs new regime tax on your income' },
                { path: '/calculators/home-prepayment', label: 'Prepayment Calculator', desc: 'See savings from part-prepayment' },
              ].map(t => (
                <Link key={t.path} to={t.path} className="border border-line rounded-lg p-4 hover:border-acc transition group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-body group-hover:text-acc transition">{t.label}</span>
                    <ArrowRight size={14} className="text-faint group-hover:text-acc transition flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-faint mt-1">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
