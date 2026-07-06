import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

// Post GST 2.0 (Sept 2025): 5% and 18% are the main slabs, 40% is the demerit
// rate, 3% stays for gold/silver. 12% and 28% kept for legacy invoices.
const GST_RATES = [3, 5, 12, 18, 28, 40];
const CURRENT_RATES = [3, 5, 18, 40];

export default function GSTCalculatorPage() {
  const [amount,    setAmount]    = useState(10000);
  const [gstRate,   setGstRate]   = useState(18);
  const [mode,      setMode]      = useState<'exclusive' | 'inclusive'>('exclusive');
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);

  let baseAmount = 0, gstAmount = 0, totalAmount = 0;
  if (mode === 'exclusive') {
    baseAmount  = amount;
    gstAmount   = amount * gstRate / 100;
    totalAmount = amount + gstAmount;
  } else {
    totalAmount = amount;
    baseAmount  = amount / (1 + gstRate / 100);
    gstAmount   = amount - baseAmount;
  }
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const faqs = [
    { q: 'What is GST?', a: 'GST (Goods and Services Tax) is India\'s unified indirect tax on the supply of goods and services, in force since July 2017. It replaced VAT, service tax, excise duty and a dozen other levies. After the September 2025 rate rationalisation ("GST 2.0"), the structure is: 0% (exempt essentials), 5% (merit rate for daily-use items), 18% (standard rate for most goods and services), 40% (demerit rate for sin and luxury goods), plus a special 3% rate for gold and silver.' },
    { q: 'What changed in the GST 2.0 reform of September 2025?', a: 'From September 22, 2025, the GST Council collapsed the four-slab structure into two main rates. Almost everything at 12% moved down to 5%, and most 28% items moved down to 18% (ACs, TVs, refrigerators, cement, small cars). A new 40% demerit rate applies to pan masala, aerated and caffeinated drinks, luxury cars, yachts and online money gaming. Individual life and health insurance premiums became exempt. Tobacco products temporarily stayed at 28% plus cess until compensation cess obligations are cleared.' },
    { q: 'What is the difference between CGST, SGST and IGST?', a: 'For sales within one state (intra-state), GST is split equally: half as CGST to the Centre and half as SGST to the state — an 18% sale means 9% CGST + 9% SGST. For sales across states (inter-state) and imports, the full rate is charged as IGST by the Centre, which later settles the state\'s share. The buyer pays the same total either way.' },
    { q: 'What is inclusive vs exclusive GST, and what are the formulas?', a: 'Exclusive means GST is added on top of the base price: GST = base × rate / 100 (common in B2B quotes). Inclusive means the price already contains GST, as with retail MRP: base = price × 100 / (100 + rate), and GST = price − base. For example, an MRP of ₹1,180 at 18% has a base of ₹1,000 and GST of ₹180. Use the Add GST / Remove GST toggle in this calculator to convert both ways.' },
    { q: 'Which items have 0% GST or are exempt?', a: 'Fresh fruits and vegetables, milk, curd, paneer, eggs, cereals, unbranded flour and rice, bread, salt, books and printed newspapers, education services, healthcare services, and — since September 2025 — individual life insurance and health insurance premiums. Petrol, diesel, ATF and alcohol for human consumption remain outside GST entirely (states tax them separately).' },
    { q: 'What items are in the 5% slab?', a: 'The 5% merit rate covers most daily-use and mass-consumption items: packaged and branded food items, edible oils, sugar, tea, coffee, soaps, shampoos, toothpaste, footwear and apparel below threshold values, bicycles, medicines and medical devices, agricultural machinery, and restaurant service (without input tax credit). Much of this list moved from 12% to 5% in the September 2025 reform.' },
    { q: 'What items are in the 18% slab?', a: 'The 18% standard rate applies to most goods and services: electronics and appliances (including ACs, TVs and refrigerators that earlier attracted 28%), cement, small cars and two-wheelers up to 350cc, telecom, banking and insurance services (other than exempt individual life/health policies), software, professional services, and hotel stays above threshold tariffs.' },
    { q: 'What attracts the 40% GST rate?', a: 'The 40% demerit rate is charged on sin and super-luxury goods: pan masala, aerated and caffeinated sugary drinks, luxury cars above engine/length thresholds, motorcycles above 350cc, yachts, private aircraft, and betting, casinos and online money gaming. Tobacco and cigarettes are slated to move to 40% but temporarily continue at 28% plus compensation cess.' },
    { q: 'Why is gold taxed at 3% GST?', a: 'Gold, silver and precious-metal jewellery have a special concessional 3% rate (plus 5% on jewellery making charges) to keep the organised bullion trade competitive and discourage smuggling. This rate was deliberately left untouched in the September 2025 rationalisation. Rough diamonds attract a nominal 0.25%.' },
    { q: 'How do I remove GST from an MRP to find the base price?', a: 'Divide the MRP by (1 + rate/100). Example: a product with MRP ₹2,360 at 18% GST — base price = 2360 / 1.18 = ₹2,000, GST amount = ₹360. Select "Remove GST" mode in this calculator, enter the MRP and pick the rate; it shows the base price, total GST, and the CGST/SGST split automatically.' },
    { q: 'Who must register for GST?', a: 'Businesses must register once aggregate turnover crosses ₹40 lakh for goods or ₹20 lakh for services (₹20 lakh / ₹10 lakh in special-category states). Registration is mandatory regardless of turnover for inter-state suppliers of goods, e-commerce sellers, and those liable under reverse charge. Registration is free on gst.gov.in and gives you a 15-character GSTIN.' },
    { q: 'What is the composition scheme?', a: 'Small businesses with turnover up to ₹1.5 crore (₹75 lakh in special-category states) can opt for the composition scheme: pay a flat 1% of turnover (manufacturers and traders) or 5% (restaurants) instead of normal GST, with quarterly filing. The trade-offs: no input tax credit, no inter-state sales, and you cannot charge GST on invoices. Service providers have a similar scheme at 6% up to ₹50 lakh.' },
    { q: 'What is input tax credit (ITC)?', a: 'ITC lets a registered business subtract the GST it paid on purchases from the GST it collects on sales, so tax applies only to the value added at each stage. Example: a retailer collects ₹1,800 GST on sales and paid ₹1,200 GST on stock — net payment to the government is ₹600. ITC requires valid supplier invoices, and the supplier must have filed returns reporting the sale.' },
  ];

  return (
    <>
      <Helmet>
        <title>GST Calculator 2026 — Add or Remove GST (5%, 18%, 40% Slabs) | RupeePedia</title>
        <meta name="description" content="Free GST Calculator updated for the new GST slabs — add or remove GST, see CGST/SGST/IGST split for 3%, 5%, 18% and 40% rates. With slab-wise item lists, formulas, examples and FAQs." />
        <link rel="canonical" href="https://rupeepedia.in/calculators/gst" />
        <meta property="og:title" content="GST Calculator 2026 — Add or Remove GST (5%, 18%, 40% Slabs) | RupeePedia" />
        <meta property="og:description" content="Add or remove GST and see the CGST/SGST split — updated for the new 5% / 18% / 40% GST structure." />
        <meta property="og:url" content="https://rupeepedia.in/calculators/gst" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="GST Calculator 2026 | RupeePedia" />
        <meta name="twitter:description" content="Add or remove GST and see the CGST/SGST split — updated for the new 5% / 18% / 40% GST structure." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'GST Calculator',
          url: 'https://rupeepedia.in/calculators/gst',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: 'Free GST calculator for the current Indian GST slabs (3%, 5%, 18%, 40%) — add GST to a base price or extract GST from an MRP, with CGST/SGST/IGST breakdown.',
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
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
            { '@type': 'ListItem', position: 3, name: 'GST Calculator', item: 'https://rupeepedia.in/calculators/gst' },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50">
        <CalculatorHero
          crumb="GST"
          title="GST"
          accent="Calculator"
          subtitle="GST amount, CGST and SGST for any product or service."
          icon={Receipt}
        />

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-brand-600 p-6">

            {/* Mode toggle */}
            <div className="flex gap-2 mb-6">
              {(['exclusive', 'inclusive'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${mode === m ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-500 hover:border-brand-300'}`}>
                  {m === 'exclusive' ? 'Add GST' : 'Remove GST'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {mode === 'exclusive' ? 'Enter Amount (excl. GST)' : 'Enter Amount (incl. GST)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-brand-400 text-lg" />
                  </div>
                </div>

                {/* GST Rate */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select GST Rate</label>
                  <div className="grid grid-cols-6 gap-2">
                    {GST_RATES.map(r => {
                      const legacy = !CURRENT_RATES.includes(r);
                      return (
                        <button key={r} onClick={() => setGstRate(r)}
                          className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${gstRate === r ? 'bg-brand-600 border-brand-600 text-white' : legacy ? 'border-slate-100 text-slate-300 hover:border-brand-200 hover:text-brand-400' : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'}`}>
                          {r}%
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Current slabs: 5% &amp; 18% (main), 40% (demerit), 3% (gold). 12% &amp; 28% kept for older invoices.</p>
                </div>
              </div>

              {/* Result */}
              <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-lg p-5 text-white flex flex-col gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">Total Amount</div>
                  <div className="text-3xl font-bold tracking-tight">{fmtINR(totalAmount)}</div>
                </div>
                <hr className="border-white/20" />
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="opacity-80">Base Amount</span><span className="font-bold">{fmtINR(baseAmount)}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">GST ({gstRate}%)</span><span className="font-bold">{fmtINR(gstAmount)}</span></div>
                </div>
                <hr className="border-white/20" />
                <div className="bg-white/10 rounded-lg p-3 space-y-2 text-sm">
                  <div className="text-xs opacity-70 font-semibold uppercase tracking-wide mb-2">GST Breakdown</div>
                  <div className="flex justify-between"><span className="opacity-80">CGST ({gstRate/2}%)</span><span className="font-bold">{fmtINR(cgst)}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">SGST ({gstRate/2}%)</span><span className="font-bold">{fmtINR(sgst)}</span></div>
                  <div className="text-xs opacity-60 mt-1">For inter-state: IGST = {fmtINR(gstAmount)}</div>
                </div>
              </div>
            </div>

            {/* All slabs comparison */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-slate-900 mb-3">GST for All Slabs on {fmtINR(baseAmount)}</h2>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">GST Rate</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">GST Amount</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">CGST</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">SGST</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GST_RATES.map(r => {
                      const g = baseAmount * r / 100;
                      return (
                        <tr key={r} className={`border-t border-slate-50 hover:bg-slate-50 ${r === gstRate ? 'bg-brand-50' : ''}`}>
                          <td className="px-4 py-3 font-bold text-brand-600">{r}%</td>
                          <td className="px-4 py-3 text-right text-slate-600">{fmtINR(g)}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{fmtINR(g/2)}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{fmtINR(g/2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">{fmtINR(baseAmount + g)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Article (always in DOM for SEO) ── */}
          <article className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">What is GST and how is it calculated?</h2>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>GST (Goods and Services Tax)</strong> is India's single indirect tax on the supply of goods and
                  services, in force since July 2017. Every invoice charges GST at the rate applicable to the product or
                  service, and the tax splits into <strong>CGST + SGST</strong> for sales within a state or <strong>IGST</strong> for
                  inter-state sales — the buyer pays the same total either way.
                </p>
                <p>
                  Since the <strong>September 2025 rate rationalisation ("GST 2.0")</strong>, India effectively has a two-rate
                  structure: <strong>5%</strong> for merit and daily-use goods and <strong>18%</strong> as the standard rate, with a
                  <strong> 40% demerit rate</strong> for sin and super-luxury items and a special <strong>3%</strong> rate for gold and
                  silver. The old 12% and 28% slabs were largely folded into 5% and 18% — this calculator keeps them
                  available for older invoices.
                </p>
                <p>The two formulas this calculator applies:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="border border-slate-100 rounded-lg p-3">
                    <div className="text-xs font-bold text-slate-800 mb-1">Add GST (exclusive price)</div>
                    <p className="text-xs">GST = Base × Rate ÷ 100<br />Total = Base + GST</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">₹10,000 at 18% → GST ₹1,800 → total ₹11,800</p>
                  </div>
                  <div className="border border-slate-100 rounded-lg p-3">
                    <div className="text-xs font-bold text-slate-800 mb-1">Remove GST (inclusive price / MRP)</div>
                    <p className="text-xs">Base = Price × 100 ÷ (100 + Rate)<br />GST = Price − Base</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">₹11,800 at 18% → base ₹10,000, GST ₹1,800</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">GST slabs after the 2025 reform — what falls where</h2>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Rate</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Category</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Typical items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['0%', 'Exempt essentials', 'Fresh produce, milk, curd, paneer, eggs, cereals, bread, books, education & healthcare services, individual life & health insurance premiums'],
                      ['3%', 'Precious metals', 'Gold, silver, jewellery (making charges 5%); rough diamonds 0.25%'],
                      ['5%', 'Merit / daily use', 'Packaged foods, edible oil, soaps, shampoo, toothpaste, medicines, bicycles, footwear & apparel below thresholds, restaurants (no ITC)'],
                      ['18%', 'Standard rate', 'Most services, electronics, ACs, TVs, refrigerators, cement, small cars, two-wheelers ≤350cc, telecom, banking, software'],
                      ['40%', 'Demerit / luxury', 'Pan masala, aerated & caffeinated drinks, luxury cars, motorcycles >350cc, yachts, private aircraft, betting & online money gaming'],
                    ].map(([rate, cat, items]) => (
                      <tr key={rate} className="border-t border-slate-50 align-top">
                        <td className="px-4 py-2.5 font-bold text-brand-600 whitespace-nowrap">{rate}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-700 whitespace-nowrap">{cat}</td>
                        <td className="px-4 py-2.5 text-slate-500">{items}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Petrol, diesel, ATF and alcohol remain outside GST. Tobacco products temporarily continue at 28% + compensation cess.
                Item classifications can change with GST Council notifications — verify current rates on cbic-gst.gov.in for filings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">GST calculation examples</h2>
              <div className="space-y-2 text-sm text-slate-600">
                {[
                  ['Restaurant bill (5%)', 'Food total ₹2,000 → GST ₹100 (CGST ₹50 + SGST ₹50) → bill ₹2,100.'],
                  ['Laptop purchase (18%)', 'Listed price ₹59,000 inclusive → base = 59,000 ÷ 1.18 = ₹50,000, GST = ₹9,000 (₹4,500 CGST + ₹4,500 SGST).'],
                  ['Gold chain (3% + 5% making)', '₹1,00,000 gold value → ₹3,000 GST; ₹10,000 making charges → ₹500 GST. Total tax ₹3,500.'],
                  ['Inter-state B2B supply (18%)', '₹1,00,000 goods from Maharashtra to Karnataka → IGST ₹18,000 charged in full; buyer claims it as input tax credit.'],
                ].map(([t, d]) => (
                  <div key={t} className="border border-slate-100 rounded-lg p-3">
                    <div className="text-xs font-bold text-slate-800">{t}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{d}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    <span>{faq.q}</span>
                    <span className={`text-slate-400 text-xs ml-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {/* Always mounted so content stays in the DOM for search engines */}
                  <div className={`px-4 pb-4 pt-2 text-sm text-slate-500 leading-relaxed border-t border-slate-50 ${openFaq === i ? '' : 'hidden'}`}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Related tools */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Related calculators</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { path: '/calculators/income-tax', label: 'Income Tax Calculator', desc: 'Old vs new regime tax on your income' },
                { path: '/calculators/salary-calculator', label: 'Salary Calculator', desc: 'In-hand salary from CTC' },
                { path: '/calculators/emi', label: 'EMI Calculator', desc: 'Loan EMI, interest and amortisation' },
                { path: '/calculators/sip', label: 'SIP Calculator', desc: 'Mutual fund SIP growth projection' },
              ].map(t => (
                <Link key={t.path} to={t.path} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition">{t.label}</span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500 transition flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}