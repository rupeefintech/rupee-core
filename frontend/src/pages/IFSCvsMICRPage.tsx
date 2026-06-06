import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronRight, ArrowRight } from 'lucide-react';

export default function IFSCvsMICRPage() {
  return (
    <>
      <Helmet>
        <title>IFSC Code vs MICR Code — Key Differences Explained | RupeePedia</title>
        <meta name="description" content="IFSC code is used for online transfers (NEFT, RTGS, IMPS) while MICR code is used for cheque clearing. Learn the full difference between IFSC and MICR codes with examples." />
        <link rel="canonical" href="https://rupeepedia.in/ifsc-vs-micr" />
        <meta property="og:title" content="IFSC Code vs MICR Code — Key Differences Explained" />
        <meta property="og:description" content="IFSC is for online transfers. MICR is for cheque clearing. Full comparison with format, usage, and examples." />
        <meta property="og:url" content="https://rupeepedia.in/ifsc-vs-micr" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: 'IFSC Code vs MICR Code — Key Differences Explained',
              url: 'https://rupeepedia.in/ifsc-vs-micr',
              description: 'IFSC code is used for electronic fund transfers (NEFT, RTGS, IMPS). MICR code is used for cheque clearing. Full comparison with format, usage, and examples.',
              author: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
              publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in', logo: { '@type': 'ImageObject', url: 'https://rupeepedia.in/logo.png' } },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                  { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: 'https://rupeepedia.in/ifsc-finder' },
                  { '@type': 'ListItem', position: 3, name: 'IFSC vs MICR', item: 'https://rupeepedia.in/ifsc-vs-micr' },
                ],
              },
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'What is the difference between IFSC and MICR code?', acceptedAnswer: { '@type': 'Answer', text: 'IFSC (Indian Financial System Code) is an 11-character alphanumeric code used for electronic fund transfers — NEFT, RTGS, and IMPS. MICR (Magnetic Ink Character Recognition) is a 9-digit numeric code printed on cheques in magnetic ink, used for automated cheque clearing. IFSC is for digital transfers; MICR is for physical cheque processing.' } },
                { '@type': 'Question', name: 'Is IFSC and MICR the same?', acceptedAnswer: { '@type': 'Answer', text: 'No. IFSC and MICR are different codes serving different purposes. IFSC identifies a bank branch for electronic transfers. MICR identifies the bank and branch for cheque clearing. Both are assigned by RBI but used in completely different systems.' } },
                { '@type': 'Question', name: 'Where can I find the MICR code?', acceptedAnswer: { '@type': 'Answer', text: 'The MICR code is printed at the bottom of every cheque leaf in magnetic ink (the band at the bottom). It appears between the cheque number and the account number. It is also printed on the first page of your bank passbook.' } },
                { '@type': 'Question', name: 'Do I need IFSC or MICR for online transfers?', acceptedAnswer: { '@type': 'Answer', text: 'For online bank transfers (NEFT, RTGS, IMPS, UPI), you need the IFSC code. The MICR code is only used in cheque clearing and is not required for digital payments.' } },
              ],
            },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-brand-800 to-brand-700 text-white px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-1.5 text-brand-300 text-xs mb-5">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/ifsc-finder" className="hover:text-white">IFSC Finder</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">IFSC vs MICR</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">IFSC Code vs MICR Code</h1>
            <p className="text-brand-200 text-lg">What's the difference and when to use each</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

          {/* Quick answer */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Answer</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                <p className="font-bold text-brand-800 mb-1">IFSC Code</p>
                <p className="text-sm text-brand-700">Used for <strong>electronic fund transfers</strong> — NEFT, RTGS, IMPS, UPI. 11 characters. Required when sending money online.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="font-bold text-gray-800 mb-1">MICR Code</p>
                <p className="text-sm text-gray-600">Used for <strong>cheque clearing</strong> only. 9 digits. Printed in magnetic ink at the bottom of cheques. Not needed for online payments.</p>
              </div>
            </div>
          </section>

          {/* Comparison table */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">IFSC vs MICR — Full Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500 w-32">Feature</th>
                    <th className="px-5 py-3 text-left font-semibold text-brand-700">IFSC Code</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-700">MICR Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Full form', 'Indian Financial System Code', 'Magnetic Ink Character Recognition'],
                    ['Length', '11 characters', '9 digits'],
                    ['Type', 'Alphanumeric (letters + numbers)', 'Numeric only'],
                    ['Example', 'HDFC0001234', '400240019'],
                    ['Assigned by', 'Reserve Bank of India (RBI)', 'Reserve Bank of India (RBI)'],
                    ['Used for', 'NEFT, RTGS, IMPS, UPI transfers', 'Cheque clearing (CTS system)'],
                    ['Where found', 'Passbook, cheque book, net banking', 'Bottom of cheque leaf (MICR band)'],
                    ['Required for online transfer?', '✅ Yes', '❌ No'],
                    ['Required for cheque?', '❌ No', '✅ Yes'],
                    ['Unique to each branch?', '✅ Yes', '✅ Yes'],
                  ].map(([f, i, m]) => (
                    <tr key={f} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-500 font-medium text-xs">{f}</td>
                      <td className="px-5 py-3 text-gray-800">{i}</td>
                      <td className="px-5 py-3 text-gray-700">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* IFSC detail */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">IFSC Code — In Detail</h2>
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4 font-mono text-center text-2xl text-brand-700 font-bold tracking-widest">
              HDFC<span className="text-brand-400">0</span>001234
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex gap-3"><span className="font-mono font-bold text-brand-700 w-24">HDFC</span><span>Bank code — first 4 letters identify the bank (HDFC Bank in this case)</span></div>
              <div className="flex gap-3"><span className="font-mono font-bold text-brand-400 w-24">0</span><span>5th character — always zero, reserved by RBI for future use</span></div>
              <div className="flex gap-3"><span className="font-mono font-bold text-brand-700 w-24">001234</span><span>Branch code — last 6 characters uniquely identify the branch</span></div>
            </div>
          </section>

          {/* MICR detail */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">MICR Code — In Detail</h2>
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 mb-4 font-mono text-center text-2xl text-gray-700 font-bold tracking-widest">
              400 24 0019
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex gap-3"><span className="font-mono font-bold text-gray-700 w-24">400</span><span>City code — identifies the city (400 = Mumbai)</span></div>
              <div className="flex gap-3"><span className="font-mono font-bold text-gray-700 w-24">24</span><span>Bank code — identifies the bank within the city</span></div>
              <div className="flex gap-3"><span className="font-mono font-bold text-gray-700 w-24">0019</span><span>Branch code — unique branch identifier within the bank-city combination</span></div>
            </div>
            <p className="text-xs text-gray-400 mt-3">MICR codes are printed using magnetic ink and read by high-speed sorting machines in the RBI's Cheque Truncation System (CTS).</p>
          </section>

          {/* When to use */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">When Do You Need Each?</h2>
            <div className="space-y-3">
              {[
                { scenario: 'Sending money via NEFT/RTGS/IMPS', need: 'IFSC', icon: '💳' },
                { scenario: 'Adding a UPI beneficiary by account number', need: 'IFSC', icon: '📱' },
                { scenario: 'Filling a cheque book requisition', need: 'Neither — just account number', icon: '📋' },
                { scenario: 'Issuing a cheque to someone', need: 'Neither — the MICR is already printed', icon: '📝' },
                { scenario: 'Giving account details to your employer for salary', need: 'IFSC + Account number', icon: '🏢' },
                { scenario: 'Cheque clearing by bank', need: 'MICR (automated, no user action needed)', icon: '🏦' },
              ].map(({ scenario, need, icon }) => (
                <div key={scenario} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                  <span className="text-lg shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm text-gray-700">{scenario}</p>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">→ {need}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Can I use MICR instead of IFSC for online transfers?', a: 'No. Banks require IFSC for all electronic fund transfers (NEFT, RTGS, IMPS). MICR is not used in digital payment systems and cannot substitute for IFSC.' },
                { q: 'Are IFSC and MICR always different for the same branch?', a: 'Yes, they are always different. They serve different systems, have different formats (11 chars alphanumeric vs 9 digits numeric), and are structured differently. There is no mathematical relationship between a branch\'s IFSC and its MICR.' },
                { q: 'What happens if I enter the wrong IFSC code?', a: 'If you enter a wrong IFSC, your bank\'s system will either reject the transaction immediately (invalid IFSC format) or the money may be transferred to the wrong branch. Always double-check IFSC before initiating large transfers.' },
                { q: 'Do all banks have both IFSC and MICR codes?', a: 'All banks participating in RBI\'s electronic transfer systems (NEFT/RTGS/IMPS) have IFSC codes. Banks that issue cheques also have MICR codes. Most major banks in India have both.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="font-semibold text-gray-800 mb-1">{q}</p>
                  <p className="text-sm text-gray-600">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Related Guides</h2>
            <div className="space-y-2">
              {[
                { label: 'What is IFSC Code? Full form, format & how to find', to: '/what-is-ifsc-code', icon: ArrowRight },
                { label: 'How to Find IFSC Code — 5 easy methods', to: '/how-to-find-ifsc-code', icon: ArrowRight },
                { label: 'IFSC Code Finder — Search 1,78,000+ bank branches', to: '/ifsc-finder', icon: Search },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 border border-gray-100 hover:border-brand-200 transition-all">
                  <Icon className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="text-sm text-gray-700">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </Link>
              ))}
            </div>
          </section>

          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
            <p className="text-brand-800 font-semibold mb-3">Find IFSC code for any bank branch in India</p>
            <Link to="/ifsc-finder" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <Search className="w-4 h-4" /> Open IFSC Finder
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
