import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CheckCircle, AlertCircle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// ── FAQ data (schemaText feeds JSON-LD; a is the rendered answer) ─────────────

const FAQS: { q: string; schemaText: string; a: React.ReactNode }[] = [
  {
    q: "How is HRA exemption calculated?",
    schemaText:
      "HRA exemption under Section 10(13A) and Rule 2A is the minimum of three amounts: (1) actual HRA received from your employer, (2) rent paid minus 10% of basic salary plus DA, and (3) 50% of basic salary plus DA for metro cities (Delhi, Mumbai, Chennai, Kolkata) or 40% for all other cities. Whatever HRA you receive above this exempt amount is added to your taxable salary.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Exempt HRA = the <strong>minimum</strong> of three amounts:</p>
        <ol className="list-decimal ml-5 space-y-1 text-xs">
          <li>Actual HRA received from your employer</li>
          <li>Rent paid − 10% of (Basic + DA)</li>
          <li>50% of (Basic + DA) in a metro city, 40% elsewhere</li>
        </ol>
        <p className="text-xs text-gray-500">Anything you receive above the minimum is taxable salary. The calculation is done for the period rent was actually paid — if salary or rent changed during the year, compute month by month.</p>
      </div>
    ),
  },
  {
    q: "Can I claim HRA in the new tax regime?",
    schemaText:
      "No. HRA exemption is available only under the old tax regime. If you opt for the new (default) tax regime, the entire HRA received is taxable as salary. If your HRA exemption is large, it can be one of the strongest reasons to stay in the old regime — compare both regimes before choosing.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p><strong>No.</strong> HRA exemption exists only in the <strong>old regime</strong>. Under the new (default) regime the entire HRA is taxed as salary.</p>
        <p className="text-xs text-gray-500">A big HRA exemption is often the deciding factor between regimes. Run both through our <Link to="/calculators/income-tax" className="text-brand-600 font-semibold hover:underline">Income Tax Calculator</Link> before picking.</p>
      </div>
    ),
  },
  {
    q: "Which cities count as metro for HRA?",
    schemaText:
      "Only four cities qualify as metro for HRA: Delhi, Mumbai, Chennai and Kolkata, where the limit is 50% of basic plus DA. Bengaluru, Hyderabad, Pune, Gurgaon, Noida and every other city are non-metro for HRA purposes — the limit there is 40% — even though they are metros in common usage.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Only <strong>Delhi, Mumbai, Chennai and Kolkata</strong> (50% limit). Everything else — including Bengaluru, Hyderabad, Pune, Gurgaon, Noida — is non-metro (40% limit) for HRA, regardless of how big the city is.</p>
      </div>
    ),
  },
  {
    q: "Can I pay rent to my parents and claim HRA?",
    schemaText:
      "Yes, paying rent to parents is legal and accepted, provided the house is owned by the parent (not by you or jointly with you), you actually transfer the rent (bank transfer recommended), there is a rent agreement, and the parent declares the rent as income in their tax return. Rent paid to a spouse is generally not accepted.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p><strong>Yes</strong>, if done properly:</p>
        <ul className="list-disc ml-5 space-y-1 text-xs">
          <li>House must be owned by the parent — not by you, and preferably not jointly with you</li>
          <li>Actually pay the rent, ideally by bank transfer every month</li>
          <li>Keep a rent agreement and rent receipts</li>
          <li>Parent must show the rent as income in their ITR (they get the 30% standard deduction on it)</li>
        </ul>
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">Rent paid to a <strong>spouse</strong> is usually disallowed — courts have gone both ways, and it invites scrutiny.</p>
      </div>
    ),
  },
  {
    q: "Do I need my landlord's PAN to claim HRA?",
    schemaText:
      "If your annual rent exceeds ₹1 lakh (more than about ₹8,333 per month), you must report the landlord's PAN to your employer to claim HRA through payroll. If the landlord has no PAN, they must give a signed declaration. Additionally, if monthly rent exceeds ₹50,000, you must deduct TDS at 2% under Section 194-IB.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Two thresholds:</p>
        <ul className="list-disc ml-5 space-y-1 text-xs">
          <li><strong>Rent &gt; ₹1 lakh/year:</strong> landlord's PAN must be reported to your employer (or a no-PAN declaration)</li>
          <li><strong>Rent &gt; ₹50,000/month:</strong> you must deduct TDS at 2% under Section 194-IB and deposit it</li>
        </ul>
      </div>
    ),
  },
  {
    q: "What documents do I need to claim HRA?",
    schemaText:
      "Keep rent receipts (with revenue stamp where applicable), the rent agreement, proof of payment such as bank statements or UPI records, and the landlord's PAN if rent exceeds ₹1 lakh a year. Your employer collects these for payroll; keep copies for at least 6 years in case the tax department asks during scrutiny.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <ul className="list-disc ml-5 space-y-1 text-xs">
          <li>Rent agreement in your name</li>
          <li>Monthly rent receipts</li>
          <li>Bank statement / UPI trail showing rent payments (cash payments are red flags)</li>
          <li>Landlord's PAN if annual rent &gt; ₹1 lakh</li>
        </ul>
        <p className="text-xs text-gray-500">Employer collects proofs around January–February. Keep copies ~6 years; HRA claims are a common scrutiny item.</p>
      </div>
    ),
  },
  {
    q: "Can I claim both HRA and home loan tax benefits?",
    schemaText:
      "Yes, you can claim HRA and home loan benefits (Section 24b interest and 80C principal) together if you genuinely live in a rented house while owning another — for example, your owned house is in a different city, or is rented out, or is too far from your workplace. Owning and living in the same city as your rental needs a credible reason.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p><strong>Yes</strong>, when the facts support it:</p>
        <ul className="list-disc ml-5 space-y-1 text-xs">
          <li>Own house in city A, work and rent in city B — clean case</li>
          <li>Own house rented out while you rent elsewhere — allowed; rental income becomes taxable</li>
          <li>Own house and rented house in the same city — allowed only with a genuine reason (distance from work etc.); expect questions</li>
        </ul>
      </div>
    ),
  },
  {
    q: "Is DA included in basic salary for HRA calculation?",
    schemaText:
      "Dearness Allowance is included with basic salary for HRA calculation only if it forms part of salary for retirement benefits (which is typical for government and PSU employees). Most private-sector pay structures have no DA, in which case only basic salary is used. Other allowances and bonuses are never included.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>DA counts <strong>only if it forms part of retirement benefits</strong> (common in government/PSU jobs). Private-sector CTCs usually have no DA — then use basic salary alone. Bonuses, special allowance, LTA etc. are never included.</p>
      </div>
    ),
  },
  {
    q: "I don't get HRA from my employer. Can I still claim rent deduction?",
    schemaText:
      "Yes, under Section 80GG (old regime only) — the least of ₹5,000 per month, 25% of total income, or rent paid minus 10% of total income. Conditions: you, your spouse or minor child must not own a house in your city of work, and you must file Form 10BA. Self-employed people use the same section.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Use <strong>Section 80GG</strong> (old regime only). Deduction = least of:</p>
        <ul className="list-disc ml-5 space-y-1 text-xs">
          <li>₹5,000 per month (₹60,000/year)</li>
          <li>25% of total income</li>
          <li>Rent paid − 10% of total income</li>
        </ul>
        <p className="text-xs text-gray-500">Conditions: no house owned by you/spouse/minor child in your work city, and file Form 10BA. Also the route for self-employed renters.</p>
      </div>
    ),
  },
  {
    q: "What if I paid rent for only part of the year?",
    schemaText:
      "HRA exemption is computed only for the months rent was actually paid. If you moved cities, changed rent, or got a salary revision mid-year, the exemption should be worked out separately for each period with its own rent, salary and metro status, then added up. Employers' payroll software does this automatically from your declarations.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Exemption applies only to months rent was paid. Mid-year changes (new city, rent revision, salary hike) mean the min-of-three test runs separately for each period. Enter monthly figures in this calculator for the period in question, and multiply by the number of months it applied.</p>
      </div>
    ),
  },
  {
    q: "Is HRA exemption available if I live in my own house?",
    schemaText:
      "No. HRA exemption requires actual payment of rent for accommodation you occupy. If you live in your own house or pay no rent, the entire HRA received is taxable. Claiming HRA with fake rent receipts is tax evasion — the department cross-checks landlord PAN, bank trails, and Annual Information Statements.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p><strong>No.</strong> No rent paid → full HRA is taxable. Fake rent receipts are tax evasion; the department cross-checks landlord PANs, AIS data and bank trails, and penalties run up to 200% of tax evaded.</p>
      </div>
    ),
  },
  {
    q: "How does this HRA calculator work?",
    schemaText:
      "Enter your monthly basic salary (plus DA if applicable), HRA received, rent paid, and select whether you live in a metro city. The calculator computes all three limits under Rule 2A — actual HRA, rent minus 10% of basic, and 50%/40% of basic — and shows the minimum as your exempt HRA, plus the taxable portion, both monthly and annually.",
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Enter monthly Basic (+DA), HRA received, rent paid, and metro status. It evaluates all three Rule 2A limits, highlights which one binds, and shows exempt vs taxable HRA per month and per year.</p>
      </div>
    ),
  },
];

// ── examples ──────────────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    title: "Neha — Mumbai, high rent",
    inputs: "Basic ₹80,000/month, HRA ₹40,000, rent ₹35,000, metro",
    calc: ["Actual HRA: ₹40,000", "Rent − 10% of basic: 35,000 − 8,000 = ₹27,000", "50% of basic: ₹40,000"],
    result: "Exempt = ₹27,000/month (₹3.24L/year). Taxable HRA = ₹13,000/month.",
    binding: "Rent minus 10% of basic is the binding limit — raising rent would raise the exemption.",
  },
  {
    title: "Rahul — Bengaluru (non-metro for HRA)",
    inputs: "Basic ₹60,000/month, HRA ₹30,000, rent ₹25,000, non-metro",
    calc: ["Actual HRA: ₹30,000", "Rent − 10% of basic: 25,000 − 6,000 = ₹19,000", "40% of basic: ₹24,000"],
    result: "Exempt = ₹19,000/month (₹2.28L/year). Taxable HRA = ₹11,000/month.",
    binding: "Bengaluru counts as non-metro, but here the rent-linked limit binds anyway.",
  },
  {
    title: "Priya — pays rent to parents in Delhi",
    inputs: "Basic ₹50,000/month, HRA ₹25,000, rent ₹20,000 to mother, metro",
    calc: ["Actual HRA: ₹25,000", "Rent − 10% of basic: 20,000 − 5,000 = ₹15,000", "50% of basic: ₹25,000"],
    result: "Exempt = ₹15,000/month (₹1.8L/year), fully valid — mother owns the flat, rent goes by bank transfer, and she declares it in her ITR.",
    binding: "Rent to parents works when ownership, payment trail and the parent's ITR all line up.",
  },
];

// ── component ─────────────────────────────────────────────────────────────────

export default function HRACalculatorPage() {
  const [basic, setBasic] = useState(50000);
  const [hra, setHra] = useState(20000);
  const [rent, setRent] = useState(15000);
  const [isMetro, setIsMetro] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const c1 = hra;                                     // actual HRA received
  const c2 = Math.max(rent - basic * 0.1, 0);         // rent − 10% of basic
  const c3 = basic * (isMetro ? 0.5 : 0.4);           // 50% / 40% of basic
  const exemption = Math.min(c1, c2, c3);
  const taxableHRA = Math.max(hra - exemption, 0);

  const conditions = [
    { label: "Actual HRA received", value: c1, desc: "What your employer pays as HRA" },
    { label: "Rent paid − 10% of Basic", value: c2, desc: `${fmt(rent)} − ${fmt(basic * 0.1)}` },
    { label: `${isMetro ? "50%" : "40%"} of Basic (${isMetro ? "metro" : "non-metro"})`, value: c3, desc: isMetro ? "Delhi, Mumbai, Chennai, Kolkata" : "All cities other than the 4 metros" },
  ];

  return (
    <>
      <Helmet>
        <title>HRA Calculator — House Rent Allowance Exemption (Section 10(13A)) | RupeePedia</title>
        <meta name="description" content="Free HRA exemption calculator under Section 10(13A) and Rule 2A. See exempt vs taxable HRA with the min-of-three breakdown, metro/non-metro rules, rent-to-parents rules, examples and FAQs." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/hra-calculator" />
        <meta property="og:title" content="HRA Calculator — House Rent Allowance Exemption | RupeePedia" />
        <meta property="og:description" content="Calculate your exempt and taxable HRA under Section 10(13A) with the full min-of-three breakdown, examples and FAQs." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/hra-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="HRA Calculator — House Rent Allowance Exemption | RupeePedia" />
        <meta name="twitter:description" content="Calculate exempt vs taxable HRA under Section 10(13A) with breakdown, examples and FAQs." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'HRA Calculator',
          url: 'https://rupeepedia.in/calculators/hra-calculator',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free calculator for House Rent Allowance exemption under Section 10(13A) of the Income Tax Act, with metro/non-metro limits and taxable HRA breakdown.',
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.schemaText },
          })),
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://rupeepedia.in/calculators' },
            { '@type': 'ListItem', position: 3, name: 'HRA Calculator', item: 'https://rupeepedia.in/calculators/hra-calculator' },
          ],
        })}</script>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">HRA Calculator — House Rent Allowance Exemption</h1>
          <p className="text-sm text-gray-500 mt-1">
            Calculate how much of your HRA is <strong className="text-gray-700">tax-exempt</strong> under Section 10(13A) and how much is taxable — with the full min-of-three breakdown.
          </p>
        </div>

        {/* Calculator */}
        <div className="card p-5 mb-5">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: "Basic Salary + DA (monthly)", value: basic, set: setBasic },
              { label: "HRA Received (monthly)", value: hra, set: setHra },
              { label: "Rent Paid (monthly)", value: rent, set: setRent },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={f.value}
                    onChange={e => f.set(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer mb-5">
            <input type="checkbox" checked={isMetro} onChange={() => setIsMetro(!isMetro)} className="w-4 h-4 accent-brand-600" />
            <span className="text-gray-700">Metro city <span className="text-gray-400 text-xs">(only Delhi, Mumbai, Chennai, Kolkata)</span></span>
          </label>

          {/* Min-of-three breakdown */}
          <div className="space-y-2 mb-4">
            {conditions.map(c => {
              const isMin = c.value === exemption;
              return (
                <div key={c.label} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${isMin ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"}`}>
                  {isMin ? <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> : <AlertCircle size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-xs ${isMin ? "text-green-700" : "text-gray-600"}`}>{c.label}{isMin && " — lowest, this applies"}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{c.desc}</div>
                  </div>
                  <div className={`text-sm font-bold flex-shrink-0 ${isMin ? "text-green-700" : "text-gray-400"}`}>{fmt(c.value)}</div>
                </div>
              );
            })}
          </div>

          {/* Result */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
              <div className="text-xs text-brand-600 font-semibold">Exempt HRA</div>
              <div className="text-xl font-bold text-brand-700">{fmt(exemption)}<span className="text-xs font-medium text-brand-500"> /month</span></div>
              <div className="text-[11px] text-brand-500 mt-0.5">{fmt(exemption * 12)} per year — not taxed (old regime)</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="text-xs text-red-600 font-semibold">Taxable HRA</div>
              <div className="text-xl font-bold text-red-700">{fmt(taxableHRA)}<span className="text-xs font-medium text-red-400"> /month</span></div>
              <div className="text-[11px] text-red-400 mt-0.5">{fmt(taxableHRA * 12)} per year — added to salary income</div>
            </div>
          </div>

          <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">
            <strong>New regime warning:</strong> HRA exemption applies only in the old tax regime. Under the new (default) regime, the entire {fmt(hra)}/month is taxable.
          </p>
        </div>

        {/* ── Article ── */}
        <article className="mt-10 space-y-10">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">What is HRA and how does the exemption work?</h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>
                <strong>House Rent Allowance (HRA)</strong> is a salary component employers pay to help cover rent. Under
                <strong> Section 10(13A)</strong> of the Income Tax Act, read with <strong>Rule 2A</strong>, part of that HRA is
                exempt from tax if you actually pay rent for the home you live in. The exempt portion is the
                <em> minimum</em> of three amounts: the HRA you receive, your rent minus 10% of basic salary (plus DA where
                it counts for retirement benefits), and 50% of basic in the four metro cities or 40% everywhere else.
              </p>
              <p>
                The 10% haircut on rent exists because the law assumes you would spend some of your salary on housing
                anyway; only rent <em>beyond</em> that is compensated tax-free. The 50%/40% cap stops the exemption from
                exceeding a reasonable share of pay. In practice, for most people the binding limit is
                <strong> rent minus 10% of basic</strong> — which means low rent relative to salary shrinks the exemption fast,
                and paying no rent kills it entirely.
              </p>
              <p>
                Two things people miss: the exemption is computed for the <strong>period rent was actually paid</strong> (moved
                cities mid-year? compute each stretch separately), and it exists <strong>only in the old tax regime</strong>.
                Opt into the new regime and every rupee of HRA is taxed — often the single biggest number deciding
                which regime wins.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">HRA exemption — worked examples</h2>
            <div className="space-y-3">
              {EXAMPLES.map(ex => (
                <div key={ex.title} className="card p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{ex.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{ex.inputs}</p>
                  <ul className="text-xs text-gray-600 space-y-0.5 mb-2">
                    {ex.calc.map(c => <li key={c} className="flex gap-2"><span className="text-brand-400">▸</span>{c}</li>)}
                  </ul>
                  <p className="text-xs font-semibold text-green-700 bg-green-50 rounded-md px-2.5 py-1.5">{ex.result}</p>
                  <p className="text-[11px] text-gray-400 mt-1.5">{ex.binding}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">HRA rules at a glance</h2>
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    {[
                      ["Legal basis", "Section 10(13A) + Rule 2A of Income Tax Rules"],
                      ["Regime", "Old regime only — fully taxable under new regime"],
                      ["Metro cities (50%)", "Delhi, Mumbai, Chennai, Kolkata only"],
                      ["Non-metro (40%)", "Every other city, including Bengaluru, Hyderabad, Pune"],
                      ["Salary base", "Basic + DA (only DA that counts for retirement benefits)"],
                      ["Landlord PAN", "Required if rent > ₹1 lakh/year"],
                      ["TDS on rent", "2% under Sec 194-IB if rent > ₹50,000/month"],
                      ["Rent to parents", "Allowed — parent must own the house and declare rent in ITR"],
                      ["No HRA in salary?", "Claim Section 80GG instead (max ₹60,000/year, conditions apply)"],
                      ["Own house, no rent", "No exemption — entire HRA taxable"],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">{k}</td>
                        <td className="px-3 py-2 text-gray-600">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </article>

        {/* ── FAQ ── */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-1">HRA FAQs</h2>
          <p className="text-xs text-gray-400 mb-4">Rules, documents, edge cases and how this calculator applies them</p>
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
                <div className={`px-4 pb-4 pt-1 border-t border-gray-100 bg-white ${openFaq === i ? "" : "hidden"}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Related tools ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Related calculators</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { path: "/calculators/income-tax", label: "Income Tax Calculator", desc: "Old vs new regime — see if your HRA tips the balance" },
              { path: "/calculators/salary-calculator", label: "Salary Calculator", desc: "In-hand salary from CTC with all deductions" },
              { path: "/calculators/home-loan-emi", label: "Home Loan EMI Calculator", desc: "Planning to buy instead of rent? Check the EMI" },
              { path: "/calculators/home-loan-eligibility", label: "Home Loan Eligibility", desc: "How much loan your salary qualifies for" },
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
