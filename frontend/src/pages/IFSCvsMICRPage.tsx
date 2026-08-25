import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, ChevronRight, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-acc transition-colors"
      >
        <span className="font-semibold text-ink text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-acc shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted shrink-0" />
        }
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted leading-relaxed">{a}</div>
      )}
    </div>
  );
}

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

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                  <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to="/ifsc-finder" className="hover:text-acc transition-colors">IFSC Finder</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">IFSC vs MICR</span>
                </nav>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">IFSC Code vs MICR Code</h1>
                <p className="text-body text-lg">What's the difference and when to use each</p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Quick answer */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-4">Quick Answer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-acc-deep border border-acc/30 rounded-xl p-4">
              <p className="font-bold text-ink mb-1">IFSC Code</p>
              <p className="text-sm text-body">Used for <strong className="text-ink">electronic fund transfers</strong> — NEFT, RTGS, IMPS, UPI. 11 characters. Required when sending money online.</p>
            </div>
            <div className="bg-bg-2 border border-line rounded-xl p-4">
              <p className="font-bold text-ink mb-1">MICR Code</p>
              <p className="text-sm text-muted">Used for <strong className="text-ink">cheque clearing</strong> only. 9 digits. Printed in magnetic ink at the bottom of cheques. Not needed for online payments.</p>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="bg-surface rounded-2xl border border-line overflow-hidden">
          <div className="px-6 py-4 border-b border-line">
            <h2 className="text-xl font-bold text-ink">IFSC vs MICR — Full Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line">
                  <th className="px-5 py-3 text-left font-semibold text-faint w-32">Feature</th>
                  <th className="px-5 py-3 text-left font-semibold text-acc">IFSC Code</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted">MICR Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
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
                  <tr key={f} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3 text-faint font-medium text-xs">{f}</td>
                    <td className="px-5 py-3 text-ink">{i}</td>
                    <td className="px-5 py-3 text-body">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* IFSC detail */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-3">IFSC Code — In Detail</h2>
          <div className="bg-acc-deep border border-acc/30 rounded-xl p-4 mb-4 ifsc-mono text-center text-2xl text-ink font-bold tracking-widest">
            HDFC<span className="text-acc">0</span>001234
          </div>
          <div className="space-y-2 text-sm text-muted">
            <div className="flex gap-3"><span className="ifsc-mono font-bold text-acc w-24">HDFC</span><span>Bank code — first 4 letters identify the bank (HDFC Bank in this case)</span></div>
            <div className="flex gap-3"><span className="ifsc-mono font-bold text-faint w-24">0</span><span>5th character — always zero, reserved by RBI for future use</span></div>
            <div className="flex gap-3"><span className="ifsc-mono font-bold text-acc w-24">001234</span><span>Branch code — last 6 characters uniquely identify the branch</span></div>
          </div>
        </section>

        {/* MICR detail */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-3">MICR Code — In Detail</h2>
          <div className="bg-bg-2 border border-line rounded-xl p-4 mb-4 ifsc-mono text-center text-2xl text-ink font-bold tracking-widest">
            400 24 0019
          </div>
          <div className="space-y-2 text-sm text-muted">
            <div className="flex gap-3"><span className="ifsc-mono font-bold text-ink w-24">400</span><span>City code — identifies the city (400 = Mumbai)</span></div>
            <div className="flex gap-3"><span className="ifsc-mono font-bold text-ink w-24">24</span><span>Bank code — identifies the bank within the city</span></div>
            <div className="flex gap-3"><span className="ifsc-mono font-bold text-ink w-24">0019</span><span>Branch code — unique branch identifier within the bank-city combination</span></div>
          </div>
          <p className="text-xs text-faint mt-3">MICR codes are printed using magnetic ink and read by high-speed sorting machines in the RBI's Cheque Truncation System (CTS).</p>
        </section>

        {/* When to use */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-4">When Do You Need Each?</h2>
          <div className="space-y-3">
            {[
              { scenario: 'Sending money via NEFT/RTGS/IMPS', need: 'IFSC', icon: '💳' },
              { scenario: 'Adding a UPI beneficiary by account number', need: 'IFSC', icon: '📱' },
              { scenario: 'Filling a cheque book requisition', need: 'Neither — just account number', icon: '📋' },
              { scenario: 'Issuing a cheque to someone', need: 'Neither — the MICR is already printed', icon: '📝' },
              { scenario: 'Giving account details to your employer for salary', need: 'IFSC + Account number', icon: '🏢' },
              { scenario: 'Cheque clearing by bank', need: 'MICR (automated, no user action needed)', icon: '🏦' },
            ].map(({ scenario, need, icon }) => (
              <div key={scenario} className="flex gap-3 items-start p-3 bg-bg-2 rounded-xl border border-line">
                <span className="text-lg shrink-0">{icon}</span>
                <div>
                  <p className="text-sm text-body">{scenario}</p>
                  <p className="text-xs font-semibold text-acc mt-0.5">→ {need}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-2">Frequently Asked Questions</h2>
          <div>
            {[
              { q: 'Can I use MICR instead of IFSC for online transfers?', a: 'No. Banks require IFSC for all electronic fund transfers (NEFT, RTGS, IMPS). MICR is not used in digital payment systems and cannot substitute for IFSC.' },
              { q: 'Are IFSC and MICR always different for the same branch?', a: 'Yes, they are always different. They serve different systems, have different formats (11 chars alphanumeric vs 9 digits numeric), and are structured differently. There is no mathematical relationship between a branch\'s IFSC and its MICR.' },
              { q: 'What happens if I enter the wrong IFSC code?', a: 'If you enter a wrong IFSC, your bank\'s system will either reject the transaction immediately (invalid IFSC format) or the money may be transferred to the wrong branch. Always double-check IFSC before initiating large transfers.' },
              { q: 'Do all banks have both IFSC and MICR codes?', a: 'All banks participating in RBI\'s electronic transfer systems (NEFT/RTGS/IMPS) have IFSC codes. Banks that issue cheques also have MICR codes. Most major banks in India have both.' },
            ].map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-3">Related Guides</h2>
          <div className="space-y-2">
            {[
              { label: 'What is IFSC Code? Full form, format & how to find', to: '/what-is-ifsc-code', icon: ArrowRight },
              { label: 'How to Find IFSC Code — 5 easy methods', to: '/how-to-find-ifsc-code', icon: ArrowRight },
              { label: 'IFSC Code Finder — Search 1,78,000+ bank branches', to: '/ifsc-finder', icon: Search },
            ].map(({ label, to, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl border border-line hover:border-acc hover:bg-acc-deep transition-all">
                <Icon className="w-4 h-4 text-acc shrink-0" />
                <span className="text-sm text-body">{label}</span>
                <ChevronRight className="w-4 h-4 text-faint ml-auto" />
              </Link>
            ))}
          </div>
        </section>

        <div className="bg-gradient-to-br from-acc-deep to-surface border border-acc/25 rounded-2xl p-6 text-center">
          <p className="text-ink font-semibold mb-3">Find IFSC code for any bank branch in India</p>
          <Link to="/ifsc-finder" className="inline-flex items-center gap-2 bg-gradient-to-br from-mint to-acc text-white font-semibold px-6 py-3 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all">
            <Search className="w-4 h-4" /> Open IFSC Finder
          </Link>
        </div>
      </div>
    </>
  );
}
