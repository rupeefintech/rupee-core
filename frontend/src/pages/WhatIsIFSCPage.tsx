import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, ArrowRight, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function WhatIsIFSCPage() {
  return (
    <>
      <Helmet>
        <title>What is IFSC Code? Full Form, Format & How to Find It | RupeePedia</title>
        <meta name="description" content="IFSC code full form is Indian Financial System Code. It is an 11-character alphanumeric code assigned by RBI to identify every bank branch in India. Required for NEFT, RTGS, and IMPS transfers." />
        <link rel="canonical" href="https://rupeepedia.in/what-is-ifsc-code" />
        <meta property="og:title" content="What is IFSC Code? Full Form, Format & How to Find It" />
        <meta property="og:description" content="IFSC code full form is Indian Financial System Code — an 11-character code assigned by RBI to identify every bank branch in India." />
        <meta property="og:url" content="https://rupeepedia.in/what-is-ifsc-code" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: 'What is IFSC Code? Full Form, Format & How to Find It',
              url: 'https://rupeepedia.in/what-is-ifsc-code',
              description: 'IFSC code full form is Indian Financial System Code. It is an 11-character alphanumeric code assigned by RBI to uniquely identify every bank branch in India.',
              author: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
              publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in', logo: { '@type': 'ImageObject', url: 'https://rupeepedia.in/logo.png' } },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                  { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: 'https://rupeepedia.in/ifsc-finder' },
                  { '@type': 'ListItem', position: 3, name: 'What is IFSC Code?', item: 'https://rupeepedia.in/what-is-ifsc-code' },
                ],
              },
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'What is the full form of IFSC?', acceptedAnswer: { '@type': 'Answer', text: 'IFSC stands for Indian Financial System Code. It is an 11-character alphanumeric code assigned by the Reserve Bank of India (RBI) to uniquely identify every bank branch participating in electronic fund transfer systems.' } },
                { '@type': 'Question', name: 'How many digits is an IFSC code?', acceptedAnswer: { '@type': 'Answer', text: 'An IFSC code is 11 characters long. The first 4 characters are letters (bank code), the 5th character is always 0 (zero), and the last 6 characters are alphanumeric (branch code).' } },
                { '@type': 'Question', name: 'Where can I find my IFSC code?', acceptedAnswer: { '@type': 'Answer', text: 'You can find your IFSC code on: (1) your cheque book — printed on the MICR band at the bottom, (2) your bank passbook — on the first page, (3) net banking / mobile banking app — in account details, (4) the RupeePedia IFSC finder at rupeepedia.in/ifsc-finder.' } },
                { '@type': 'Question', name: 'What is the difference between IFSC and MICR?', acceptedAnswer: { '@type': 'Answer', text: 'IFSC (Indian Financial System Code) is used for electronic fund transfers — NEFT, RTGS, IMPS. MICR (Magnetic Ink Character Recognition) is a 9-digit code printed on cheques using magnetic ink and is used for cheque clearing. They serve different purposes.' } },
                { '@type': 'Question', name: 'Is IFSC code same for all branches of a bank?', acceptedAnswer: { '@type': 'Answer', text: 'No. Each branch of a bank has a unique IFSC code. For example, HDFC Bank has thousands of branches and each branch has a different IFSC. The first 4 characters are the same for all branches of a bank (e.g., HDFC for HDFC Bank), but the last 6 characters differ by branch.' } },
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
                  <span className="text-acc font-semibold">What is IFSC Code?</span>
                </nav>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">What is IFSC Code?</h1>
                <p className="text-body text-lg">Full form, format, and how to find it — everything explained</p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Definition */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-3">IFSC Code Full Form</h2>
          <p className="text-body leading-relaxed mb-4">
            <strong className="text-ink">IFSC</strong> stands for <strong className="text-ink">Indian Financial System Code</strong>. It is an <strong className="text-ink">11-character alphanumeric code</strong> assigned by the <strong className="text-ink">Reserve Bank of India (RBI)</strong> to uniquely identify every bank branch in India that participates in the electronic fund transfer system.
          </p>
          <div className="bg-acc-deep border border-acc/30 rounded-xl p-4">
            <p className="text-sm text-acc font-semibold mb-1">Example IFSC Code</p>
            <p className="ifsc-mono text-2xl text-ink font-bold tracking-widest">HDFC0001234</p>
            <div className="flex gap-4 mt-2 text-xs text-muted flex-wrap">
              <span><strong className="text-body">HDFC</strong> — Bank code</span>
              <span><strong className="text-body">0</strong> — Always zero</span>
              <span><strong className="text-body">001234</strong> — Branch code</span>
            </div>
          </div>
        </section>

        {/* Format */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-4">IFSC Code Format</h2>
          <div className="space-y-3">
            {[
              { pos: 'Characters 1–4', desc: 'Bank code (4 uppercase letters). Unique to each bank. E.g., HDFC = HDFC Bank, SBIN = State Bank of India, ICIC = ICICI Bank.' },
              { pos: 'Character 5', desc: 'Always the digit 0 (zero). Reserved for future use by RBI.' },
              { pos: 'Characters 6–11', desc: '6-character branch code (alphanumeric). Unique to each branch of the bank.' },
            ].map(({ pos, desc }) => (
              <div key={pos} className="flex gap-3">
                <span className="w-36 shrink-0 text-sm font-semibold text-acc">{pos}</span>
                <span className="text-sm text-muted">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Uses */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-4">When is IFSC Code Used?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { t: 'NEFT', d: 'National Electronic Funds Transfer — batch processing, settles in hourly batches.' },
              { t: 'RTGS', d: 'Real Time Gross Settlement — instant transfers above ₹2 lakh.' },
              { t: 'IMPS', d: 'Immediate Payment Service — 24×7 instant transfers via mobile/net banking.' },
              { t: 'UPI', d: 'Unified Payments Interface — some inter-bank UPI flows require IFSC for verification.' },
            ].map(({ t, d }) => (
              <div key={t} className="flex gap-3 p-3 bg-bg-2 rounded-xl border border-line">
                <ArrowRight className="w-4 h-4 text-acc mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-ink text-sm">{t}</p>
                  <p className="text-xs text-faint mt-0.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to find */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-4">How to Find Your IFSC Code</h2>
          <div className="space-y-3">
            {[
              { n: '1', t: 'Use RupeePedia IFSC Finder', d: 'Select bank → state → district → branch. Instant result with full branch details.' },
              { n: '2', t: 'Cheque book', d: 'Printed on the cheque leaf above the MICR band at the bottom.' },
              { n: '3', t: 'Bank passbook', d: 'Printed on the first page along with account number and branch address.' },
              { n: '4', t: 'Net banking / Mobile app', d: 'Go to Account Details or Profile — IFSC is listed with branch info.' },
              { n: '5', t: "Bank's official website", d: 'Use the branch locator on your bank\'s website.' },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-acc-deep text-acc flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{n}</span>
                <div>
                  <p className="font-semibold text-ink text-sm">{t}</p>
                  <p className="text-xs text-faint mt-0.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* IFSC vs MICR */}
        <section className="bg-surface rounded-2xl border border-line overflow-hidden">
          <div className="px-6 py-5 border-b border-line">
            <h2 className="text-xl font-bold text-ink">IFSC Code vs MICR Code</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line">
                  <th className="px-4 py-2.5 text-left font-semibold text-muted">Feature</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-acc">IFSC</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted">MICR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  ['Full form', 'Indian Financial System Code', 'Magnetic Ink Character Recognition'],
                  ['Length', '11 characters', '9 digits'],
                  ['Assigned by', 'Reserve Bank of India', 'Reserve Bank of India'],
                  ['Used for', 'NEFT, RTGS, IMPS, UPI', 'Cheque clearing'],
                  ['Where printed', 'Passbook, cheque book', 'Bottom of cheque (MICR band)'],
                  ['Format', 'Alphanumeric (e.g., HDFC0001234)', 'Numeric only (e.g., 400240019)'],
                ].map(([f, i, m]) => (
                  <tr key={f}>
                    <td className="px-4 py-2.5 text-faint">{f}</td>
                    <td className="px-4 py-2.5 text-ink">{i}</td>
                    <td className="px-4 py-2.5 text-ink">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-2">Frequently Asked Questions</h2>
          <div>
            {[
              { q: 'Is IFSC code same for all branches of a bank?', a: 'No. Each branch has a unique IFSC code. All branches share the same 4-letter bank prefix (e.g., HDFC), but the 6-character branch code at the end is unique to each branch.' },
              { q: 'Can IFSC code change?', a: 'Yes. When banks merge (e.g., Vijaya Bank merged into Bank of Baroda), IFSC codes of the merged bank change. RBI updates codes every quarter. Always verify your IFSC before a large transfer.' },
              { q: 'Is IFSC code required for UPI transfers?', a: 'For standard UPI transfers using VPA (Virtual Payment Address like name@upi), IFSC is not needed. But for bank-to-bank transfers where you add a beneficiary using account number, IFSC is required.' },
              { q: 'How many IFSC codes are there in India?', a: 'As of 2026, there are over 1,78,000 active IFSC codes covering 1,350+ banks across India. You can search all of them on RupeePedia.' },
            ].map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-acc-deep to-surface border border-acc/25 rounded-2xl p-6 text-center">
          <p className="text-ink font-semibold mb-3">Find the IFSC code for any bank branch in India</p>
          <Link to="/ifsc-finder" className="inline-flex items-center gap-2 bg-gradient-to-br from-acc to-acc-2 text-white font-semibold px-6 py-3 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all">
            <Search className="w-4 h-4" /> Open IFSC Finder
          </Link>
        </div>
      </div>
    </>
  );
}
