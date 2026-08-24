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
  // Section 87A rebate: zero tax up to ₹12L taxable income
  if (income <= 1200000) {
    tax = 0;
  } else {
    // Marginal relief: tax can't exceed the income above ₹12L
    tax = Math.min(tax, income - 1200000);
  }
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

// ── SLAB DATA (for visible tables + article) ──────
const NEW_SLABS = [
  ["Up to ₹4,00,000", "Nil"],
  ["₹4,00,001 – ₹8,00,000", "5%"],
  ["₹8,00,001 – ₹12,00,000", "10%"],
  ["₹12,00,001 – ₹16,00,000", "15%"],
  ["₹16,00,001 – ₹20,00,000", "20%"],
  ["₹20,00,001 – ₹24,00,000", "25%"],
  ["Above ₹24,00,000", "30%"],
];

const OLD_SLABS = [
  ["Up to ₹2,50,000", "Nil"],
  ["₹2,50,001 – ₹5,00,000", "5%"],
  ["₹5,00,001 – ₹10,00,000", "20%"],
  ["Above ₹10,00,000", "30%"],
];

// ── FAQ DATA (rendered on page + JSON-LD) ─────────
const FAQS: { q: string; a: string }[] = [
  {
    q: "What are the new tax regime slabs for FY 2025-26 (AY 2026-27)?",
    a: "New regime slabs for FY 2025-26: up to ₹4 lakh — nil; ₹4–8 lakh — 5%; ₹8–12 lakh — 10%; ₹12–16 lakh — 15%; ₹16–20 lakh — 20%; ₹20–24 lakh — 25%; above ₹24 lakh — 30%. A 4% health and education cess applies on the tax. With the Section 87A rebate, taxable income up to ₹12 lakh pays zero tax.",
  },
  {
    q: "Is income up to ₹12 lakh really tax-free in the new regime?",
    a: "Yes. The Section 87A rebate (up to ₹60,000) wipes out the slab tax on taxable income up to ₹12 lakh. Salaried taxpayers also get the ₹75,000 standard deduction, so salary up to ₹12.75 lakh can be fully tax-free. If taxable income barely crosses ₹12 lakh, marginal relief caps the tax at the amount by which income exceeds ₹12 lakh — earning ₹12.1 lakh can never leave you worse off than earning ₹12 lakh. The rebate does not apply to special-rate income like equity capital gains.",
  },
  {
    q: "What is the difference between the old and new tax regime?",
    a: "The old regime has higher slab rates but allows most deductions and exemptions: 80C up to ₹1.5 lakh, HRA, home loan interest under 24(b), 80D medical insurance, NPS 80CCD(1B) and more. The new regime has lower rates and a bigger rebate but disallows almost all of those, keeping mainly the ₹75,000 standard deduction and employer NPS contributions under 80CCD(2). The new regime is the default; the old regime must be opted into.",
  },
  {
    q: "Which regime should I choose?",
    a: "Compare both with your actual numbers — the break-even depends on how much you can deduct. Rough guide: if your total old-regime deductions (80C + HRA + home loan interest + 80D + NPS) exceed roughly ₹4–4.5 lakh for incomes above ₹16 lakh, the old regime can win; below that, the new regime almost always gives lower tax because of the ₹12 lakh rebate and lower rates. This calculator shows both liabilities side by side for your inputs.",
  },
  {
    q: "What deductions are allowed in the new tax regime?",
    a: "Very few: the ₹75,000 standard deduction on salary and pension, employer's NPS contribution under Section 80CCD(2) (up to 14% of basic), Agniveer corpus fund contributions, and interest on home loan for a let-out property (set off against rental income). Not allowed: 80C investments, HRA exemption, LTA, 80D health insurance, 80CCD(1B) self NPS, savings interest 80TTA, and home loan interest on self-occupied property.",
  },
  {
    q: "What is the standard deduction for FY 2025-26?",
    a: "₹75,000 in the new regime and ₹50,000 in the old regime, applied automatically to salary and pension income — no proofs needed. This calculator applies ₹75,000 for the new regime automatically; for the old regime it applies ₹50,000 plus whatever deductions you enter.",
  },
  {
    q: "Can I switch between old and new regime every year?",
    a: "Salaried taxpayers (no business income) can choose either regime every year at the time of filing, regardless of what they told their employer for TDS. Taxpayers with business or professional income can switch out of the new regime only once — after returning to it, they cannot opt for the old regime again (Form 10-IEA applies).",
  },
  {
    q: "What is marginal relief in the new regime?",
    a: "Without relief, crossing ₹12 lakh by one rupee would trigger about ₹61,500 of tax. Marginal relief caps the tax at the amount by which taxable income exceeds ₹12 lakh — at ₹12.5 lakh income, slab tax would be ₹67,500, but relief limits it to ₹50,000 (plus cess). The relief phases out around ₹12.75 lakh taxable income, beyond which normal slab tax applies.",
  },
  {
    q: "When does surcharge apply?",
    a: "Surcharge on income tax: 10% for total income above ₹50 lakh, 15% above ₹1 crore, 25% above ₹2 crore, and 37% above ₹5 crore (the 37% band is capped at 25% in the new regime). Marginal relief applies at each threshold. This calculator does not include surcharge — for incomes above ₹50 lakh, treat results as indicative.",
  },
  {
    q: "What is the 4% cess?",
    a: "The Health and Education Cess is 4% charged on the income tax amount (including surcharge, if any) in both regimes. Tax of ₹1,00,000 becomes ₹1,04,000 after cess. This calculator includes the 4% cess in all figures shown.",
  },
  {
    q: "Do I still need to file an ITR if my income is below ₹12 lakh?",
    a: "Yes, if your total income exceeds the basic exemption limit (₹4 lakh new regime / ₹2.5 lakh old regime), you must file an ITR even though the rebate makes your tax zero — the rebate is claimed in the return. Filing is also mandatory in cases like foreign assets, high-value transactions, or TDS refunds you want back.",
  },
  {
    q: "Does this calculator include HRA, capital gains or business income?",
    a: "This calculator compares regimes on gross income with common old-regime deductions (80C, 80D, HRA exemption, home loan interest, NPS). It does not compute capital gains tax (different rates apply), business income, surcharge above ₹50 lakh, or AMT. Use our HRA Calculator to work out the HRA exemption figure to enter here.",
  },
];

// ── COMPONENT ─────────────────────────────────────
export default function TaxCalculatorPage() {
  const [income, setIncome] = useState(1200000);
  const [c80c, setC80c] = useState(150000);
  const [hra, setHra] = useState(0);
  const [homeLoan, setHomeLoan] = useState(0);
  const [nps, setNps] = useState(0);
  const [medical, setMedical] = useState(25000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
        <title>Income Tax Calculator FY 2025-26 — Old vs New Regime | RupeePedia</title>
        <meta name="description" content="Free Income Tax Calculator FY 2025-26 — compare Old vs New tax regime instantly. Enter income, deductions (80C, HRA, NPS) and see exact tax payable and savings." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/income-tax" />
        <meta property="og:title" content="Income Tax Calculator FY 2025-26 — Old vs New Regime | RupeePedia" />
        <meta property="og:description" content="Free Income Tax Calculator FY 2025-26 — compare Old vs New tax regime instantly. Enter income, deductions (80C, HRA, NPS) and see exact tax payable and savings." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/income-tax" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Income Tax Calculator FY 2025-26 — Old vs New Regime | RupeePedia" />
        <meta name="twitter:description" content="Free Income Tax Calculator FY 2025-26 — compare Old vs New tax regime instantly. Enter income, deductions (80C, HRA, NPS) and see exact tax payable and savings." />
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
          '@type': 'WebApplication',
          name: 'Income Tax Calculator',
          url: 'https://rupeepedia.in/calculators/income-tax',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free income tax calculator for FY 2025-26 (AY 2026-27) comparing old vs new regime, with the ₹12 lakh rebate, marginal relief, standard deduction and 4% cess applied.',
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://rupeepedia.in/calculators' },
            { '@type': 'ListItem', position: 3, name: 'Income Tax Calculator', item: 'https://rupeepedia.in/calculators/income-tax' },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-bg">
        {/* CLEANER HERO */}
        <header className="py-8 md:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-120px] right-[-80px] w-[380px] h-[380px] rounded-full opacity-25 blur-[30px]"
                     style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
              </div>
              <div className="relative z-[2]">
                <nav className="flex items-center gap-2 text-muted text-xs uppercase tracking-wider mb-6">
                  <Link to="/" className="hover:text-ink transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3 text-muted" />
                  <Link to="/calculators" className="hover:text-ink transition-colors">Calculators</Link>
                  <ChevronRight className="w-3 h-3 text-muted" />
                  <span className="text-ink font-medium">Income Tax</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-ink text-4xl font-extrabold flex items-center gap-3">
                      <Calculator className="text-ink w-10 h-10" /> Tax <span className="text-ink">Calculator</span>
                    </h1>
                    <p className="text-muted mt-3 text-lg max-w-md border-l-2 border-line pl-4">
                      Assessment Year 2026-27 comparison engine.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 -mt-8 pb-20">
          <div className="grid lg:grid-cols-12 gap-8">

            {/* INPUT SECTION */}
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <div className="flex items-center gap-2 mb-6 border-b border-line pb-4">
                  <div className="p-2 bg-acc-deep rounded-lg">
                    <IndianRupee className="w-5 h-5 text-acc" />
                  </div>
                  <h3 className="font-bold text-ink">Earnings & Investment</h3>
                </div>
                
                <Input label="Total Annual Income" value={income} onChange={setIncome} />
                
                <div className="mt-8 pt-6 border-t border-dashed border-line">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-body">Deductions (Old Regime)</h3>
                    <span className="text-[10px] bg-surface-2 px-2 py-1 rounded uppercase font-bold text-muted">Optional</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Section 80C (EPF, LIC, etc)" value={c80c} onChange={setC80c} placeholder="Max 1,50,000" />
                    <Input label="Medical Insurance (80D)" value={medical} onChange={setMedical} />
                    <Input label="HRA Exemption" value={hra} onChange={setHra} />
                    <Input label="Home Loan Interest (24b)" value={homeLoan} onChange={setHomeLoan} />
                    <Input label="NPS (80CCD 1B)" value={nps} onChange={setNps} />
                    <div className="flex items-center gap-2 px-3 py-2 bg-acc-deep rounded-xl border border-acc/20">
                      <Info className="w-4 h-4 text-acc" />
                      <p className="text-xs text-acc">₹75,000 Std. Deduction applied automatically.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* RESULTS SECTION */}
            <div className="lg:col-span-5 space-y-6">
              {/* SAVINGS CARD */}
              <div className="bg-gradient-to-br from-acc-deep to-surface text-ink p-8 rounded-3xl shadow-acc-glow relative overflow-hidden">
                <TrendingDown className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                <div className="relative z-10">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-1">Recommended Regime</h2>
                  <p className="text-3xl font-black mb-4">{result.better}</p>
                  <div className="bg-acc/10 backdrop-blur-md rounded-2xl p-4 inline-block border border-acc/25">
                    <span className="text-sm block text-muted">Total Annual Savings</span>
                    <span className="text-2xl font-bold">{fmt(result.savings)}</span>
                  </div>
                </div>
              </div>

              <Card>
                <h3 className="font-bold text-ink mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-acc rounded-full"></span>
                  Comparison Summary
                </h3>
                
                <div className="space-y-4">
                   <div className="p-4 bg-surface-2 rounded-2xl space-y-3">
                      <Row label="Taxable (Old)" value={result.taxableOld} />
                      <Row label="Taxable (New)" value={result.taxableNew} />
                   </div>
                   
                   <div className="px-4 py-2 space-y-3">
                      <Row label="Old Regime Tax" value={result.oldTax} isEmphasis color="text-body" />
                      <Row label="New Regime Tax" value={result.newTax} isEmphasis color="text-acc" />
                   </div>
                </div>

                <p className="mt-6 text-[11px] text-faint leading-relaxed">
                  Includes ₹75,000 / ₹50,000 standard deduction, Section 87A rebate with marginal relief, and 4% cess.
                  Surcharge (income above ₹50 lakh), capital gains and business income are not modelled.
                </p>
              </Card>
            </div>

          </div>

          {/* ── Slab tables ── */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {[
              { title: "New Regime Slabs — FY 2025-26 (AY 2026-27)", slabs: NEW_SLABS, note: "Default regime. Taxable income up to ₹12 lakh pays zero tax via the Section 87A rebate (₹12.75 lakh for salaried with standard deduction)." },
              { title: "Old Regime Slabs — FY 2025-26", slabs: OLD_SLABS, note: "Opt-in regime. Higher rates, but 80C, HRA, home loan interest, 80D and NPS deductions are allowed. Rebate makes taxable income up to ₹5 lakh tax-free." },
            ].map(t => (
              <Card key={t.title}>
                <h2 className="font-bold text-ink mb-4">{t.title}</h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs text-faint uppercase tracking-wide">
                      <th className="pb-2">Taxable income</th>
                      <th className="pb-2 text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.slabs.map(([range, rate]) => (
                      <tr key={range} className="border-t border-line">
                        <td className="py-2 text-body">{range}</td>
                        <td className="py-2 text-right font-bold text-acc">{rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] text-faint mt-3">{t.note}</p>
              </Card>
            ))}
          </div>

          {/* ── Article ── */}
          <div className="mt-10">
            <Card>
              <article className="space-y-6">
                <section>
                  <h2 className="font-bold text-ink text-lg mb-3">Old vs new regime — how to actually decide</h2>
                  <div className="text-sm text-muted space-y-3 leading-relaxed">
                    <p>
                      Since FY 2023-24 the <strong>new regime is the default</strong>: lower slab rates, a ₹75,000 standard
                      deduction, and a Section 87A rebate that makes taxable income up to <strong>₹12 lakh completely
                      tax-free</strong> in FY 2025-26. The price you pay is losing almost every deduction — no 80C, no HRA
                      exemption, no home loan interest on a self-occupied house, no 80D.
                    </p>
                    <p>
                      The old regime only wins when your deductions are large enough to offset its higher rates — and after
                      the FY 2025-26 slab cuts, that bar is high. Below ₹12.75 lakh salary the new regime wins outright
                      (zero tax). At ₹16 lakh you'd need about ₹6 lakh of genuine deductions for the old regime to break
                      even; at ₹24 lakh, roughly ₹8 lakh. In practice only taxpayers stacking a large HRA exemption with
                      full 80C, NPS and substantial home loan interest still benefit from the old regime. Enter your real
                      numbers above — the comparison is exact for slab income.
                    </p>
                    <p>
                      Salaried taxpayers can re-choose the regime <strong>every year at filing</strong>, so the decision is never
                      locked in. If you have business income, switching back to the old regime is a one-time option — decide
                      carefully.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="font-bold text-ink text-lg mb-3">Three quick examples (FY 2025-26, salaried)</h2>
                  <div className="grid md:grid-cols-3 gap-3">
                    {[
                      { t: "₹10 lakh salary", d: "New regime: taxable ₹9.25L after standard deduction → 87A rebate applies → tax ₹0. Old regime can't beat zero. New regime wins." },
                      { t: "₹16 lakh salary, ₹3.3L deductions", d: "New regime: taxable ₹15.25L → ~₹1.13L tax after cess. Old regime with 80C ₹1.5L + 80D ₹25k + HRA ₹1.05L + std ₹50k: taxable ₹12.7L → ~₹2.01L. New regime wins by ~₹88k." },
                      { t: "₹24 lakh salary, ₹8.5L deductions", d: "Big HRA ₹4L + home loan ₹2L + 80C ₹1.5L + NPS ₹50k + 80D ₹25k + std ₹50k: old taxable ₹15.5L → ~₹2.89L. New regime: taxable ₹23.25L → ~₹2.93L. Old regime wins — barely." },
                    ].map(ex => (
                      <div key={ex.t} className="border border-line rounded-2xl p-4">
                        <div className="text-xs font-bold text-ink mb-1">{ex.t}</div>
                        <p className="text-xs text-muted leading-relaxed">{ex.d}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-faint mt-3">Figures rounded, cess included, surcharge excluded. Your exact numbers may differ — use the calculator above.</p>
                </section>
              </article>
            </Card>
          </div>

          {/* ── FAQ ── */}
          <div className="mt-10">
            <Card>
              <h2 className="font-bold text-ink text-lg mb-4">Income tax FAQs — FY 2025-26</h2>
              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border border-line rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-ink hover:bg-surface-2"
                    >
                      <span>{faq.q}</span>
                      <span className={`text-faint text-xs ml-4 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {/* Always mounted so content stays in the DOM for search engines */}
                    <div className={`px-4 pb-4 pt-2 text-sm text-muted leading-relaxed border-t border-line ${openFaq === i ? "" : "hidden"}`}>
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Related tools ── */}
          <div className="mt-10">
            <Card>
              <h2 className="font-bold text-ink text-lg mb-4">Related calculators</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { path: "/calculators/hra-calculator", label: "HRA Calculator", desc: "Work out the HRA exemption to enter above" },
                  { path: "/calculators/salary-calculator", label: "Salary Calculator", desc: "In-hand salary from CTC with tax and PF" },
                  { path: "/calculators/nps", label: "NPS Calculator", desc: "Retirement corpus from NPS contributions" },
                  { path: "/calculators/ppf", label: "PPF Calculator", desc: "80C favourite — tax-free PPF growth" },
                ].map(t => (
                  <Link key={t.path} to={t.path} className="border border-line rounded-2xl p-4 hover:border-acc transition group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink group-hover:text-acc transition">{t.label}</span>
                      <ChevronRight className="w-4 h-4 text-faint group-hover:text-acc transition flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-faint mt-1">{t.desc}</p>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

// ── REFINED UI COMPONENTS ──────────────────────────

function Card({ children }: any) {
  return <div className="bg-surface rounded-3xl p-8 border border-line">{children}</div>;
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div className="group">
      <label className="text-[11px] font-bold text-faint uppercase tracking-wider mb-1.5 block group-focus-within:text-acc transition-colors">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint font-medium">₹</span>
        <input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full pl-8 pr-4 py-3 bg-surface-2 border border-line rounded-2xl focus:bg-surface focus:border-acc focus:ring-4 focus:ring-acc/10 outline-none transition-all font-semibold text-body"
        />
      </div>
    </div>
  );
}

function Row({ label, value, isEmphasis, color = "text-muted" }: any) {
  return (
    <div className={`flex justify-between items-center ${isEmphasis ? "py-1" : "py-0"}`}>
      <span className={`text-xs font-medium uppercase tracking-wide ${isEmphasis ? "text-muted" : "text-faint"}`}>{label}</span>
      <span className={`font-bold ${isEmphasis ? "text-xl" : "text-sm"} ${color}`}>
        {fmt(value)}
      </span>
    </div>
  );
}