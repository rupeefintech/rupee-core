import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

const GST_RATES = [3, 5, 12, 18, 28];

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
    { q: 'What is GST?', a: 'GST (Goods and Services Tax) is a unified indirect tax levied on supply of goods and services in India. It replaced multiple taxes like VAT, service tax, excise duty etc. GST has 5 slabs: 0%, 3%, 5%, 12%, 18%, and 28%.' },
    { q: 'What is the difference between CGST, SGST and IGST?', a: 'For intra-state transactions, GST is split equally into CGST (Central GST) and SGST (State GST). For inter-state transactions, IGST (Integrated GST) is levied at the full rate by the Centre.' },
    { q: 'What is inclusive vs exclusive GST?', a: 'Exclusive: GST is added on top of the base price (most common for B2B). Inclusive: The price already includes GST (common for retail/B2C). Use this calculator to convert between both.' },
    { q: 'Which items have 0% GST?', a: 'Essential items like fresh fruits, vegetables, milk, eggs, cereals, bread, salt, and educational services are exempt from GST or taxed at 0%.' },
    { q: 'What items attract 28% GST?', a: 'Luxury and sin goods: cars, motorcycles, air conditioners, tobacco, aerated drinks, casinos, and online gaming attract 28% GST, often with an additional cess.' },
  ];

  return (
    <>
      <Helmet>
        <title>GST Calculator 2026 — Calculate GST Online | RupeePedia</title>
        <meta name="description" content="Free GST Calculator — instantly calculate GST amount, CGST, SGST for any amount. Supports all GST slabs: 3%, 5%, 12%, 18%, 28%." />
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">GST Calculator</h1>
          <p className="text-indigo-100 text-sm max-w-md mx-auto">Calculate GST amount, CGST, SGST instantly for any product or service.</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-600 p-6">

            {/* Mode toggle */}
            <div className="flex gap-2 mb-6">
              {(['exclusive', 'inclusive'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${mode === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
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
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-indigo-400 text-lg" />
                  </div>
                </div>

                {/* GST Rate */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select GST Rate</label>
                  <div className="grid grid-cols-5 gap-2">
                    {GST_RATES.map(r => (
                      <button key={r} onClick={() => setGstRate(r)}
                        className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${gstRate === r ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}>
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg p-5 text-white flex flex-col gap-3">
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
                        <tr key={r} className={`border-t border-slate-50 hover:bg-slate-50 ${r === gstRate ? 'bg-indigo-50' : ''}`}>
                          <td className="px-4 py-3 font-bold text-indigo-600">{r}%</td>
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
                  {openFaq === i && <div className="px-4 pb-4 pt-2 text-sm text-slate-500 leading-relaxed border-t border-slate-50">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}