import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, ChevronRight, ChevronDown, ChevronUp, Smartphone, Globe, BookOpen, CreditCard, Building2 } from 'lucide-react';

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

export default function HowToFindIFSCPage() {
  return (
    <>
      <Helmet>
        <title>How to Find IFSC Code of Your Bank Branch — 5 Easy Ways | RupeePedia</title>
        <meta name="description" content="Find your bank's IFSC code in 5 ways: passbook, cheque book, net banking app, bank website, or use RupeePedia's IFSC finder. Step-by-step guide with images." />
        <link rel="canonical" href="https://rupeepedia.in/how-to-find-ifsc-code" />
        <meta property="og:title" content="How to Find IFSC Code — 5 Easy Ways (Passbook, App, Online)" />
        <meta property="og:description" content="5 ways to find your bank branch IFSC code: passbook, cheque book, net banking, bank website, or online IFSC finder." />
        <meta property="og:url" content="https://rupeepedia.in/how-to-find-ifsc-code" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'HowTo',
              name: 'How to Find IFSC Code of Your Bank Branch',
              description: '5 ways to find the IFSC code of any bank branch in India',
              url: 'https://rupeepedia.in/how-to-find-ifsc-code',
              step: [
                { '@type': 'HowToStep', position: 1, name: 'Use RupeePedia IFSC Finder', text: 'Go to rupeepedia.in/ifsc-finder. Select your bank from the dropdown, then select your state, district, and branch. The IFSC code is shown instantly.' },
                { '@type': 'HowToStep', position: 2, name: 'Check your bank passbook', text: 'Open the first page of your bank passbook. The IFSC code is printed along with your account number, branch name, and branch address.' },
                { '@type': 'HowToStep', position: 3, name: 'Check your cheque book', text: 'Look at the MICR band at the bottom of any cheque leaf. The IFSC code is also printed on the top of the cheque, usually near the bank logo.' },
                { '@type': 'HowToStep', position: 4, name: 'Use net banking or mobile banking app', text: 'Log in to your bank\'s net banking or mobile banking app. Go to Account Details or Profile section. The branch IFSC code is listed there.' },
                { '@type': 'HowToStep', position: 5, name: "Visit your bank's official website", text: "Go to your bank's official website and use the Branch Locator tool. Enter your city or PIN code to find the IFSC code for your branch." },
              ],
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                  { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: 'https://rupeepedia.in/ifsc-finder' },
                  { '@type': 'ListItem', position: 3, name: 'How to Find IFSC Code', item: 'https://rupeepedia.in/how-to-find-ifsc-code' },
                ],
              },
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'Where is IFSC code in passbook?', acceptedAnswer: { '@type': 'Answer', text: 'The IFSC code is printed on the first page of your bank passbook, usually alongside your account number, account holder name, branch name, and branch address. It is typically labelled "IFSC" or "IFSC Code".' } },
                { '@type': 'Question', name: 'Where is IFSC code written on cheque?', acceptedAnswer: { '@type': 'Answer', text: 'The IFSC code is printed at the top of your cheque leaf, near the bank logo and branch name/address. It is different from the MICR code which appears at the bottom of the cheque in magnetic ink.' } },
                { '@type': 'Question', name: 'How to find IFSC code on SBI net banking?', acceptedAnswer: { '@type': 'Answer', text: 'Log in to SBI Net Banking (onlinesbi.sbi). Go to My Accounts → Account Summary. Click on your account. The account details page shows the branch IFSC code along with branch name and address.' } },
                { '@type': 'Question', name: 'Can I find IFSC code by account number?', acceptedAnswer: { '@type': 'Answer', text: 'No, IFSC codes cannot be looked up directly from an account number. However, you can find the IFSC by knowing your bank name and branch. Use RupeePedia\'s IFSC finder — select your bank, state, and branch to get the IFSC code.' } },
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
                  <span className="text-acc font-semibold">How to Find IFSC Code</span>
                </nav>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">How to Find IFSC Code</h1>
                <p className="text-body text-lg">5 easy ways to find your bank branch IFSC code</p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Method 1 — RupeePedia */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-mint to-acc text-white flex items-center justify-center font-bold text-sm shrink-0">1</span>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-acc" />
              <h2 className="text-lg font-bold text-ink">Use RupeePedia IFSC Finder (Fastest)</h2>
            </div>
            <span className="ml-auto text-xs bg-mint/10 text-mint px-2 py-0.5 rounded-full font-semibold border border-mint/30">Recommended</span>
          </div>
          <div className="space-y-2 mb-4">
            {[
              'Go to rupeepedia.in/ifsc-finder',
              'Select your bank from the dropdown (e.g., HDFC Bank, SBI)',
              'Select your state',
              'Select your district',
              'Select your branch name',
              'Your IFSC code + full branch details appear instantly',
            ].map((step, i) => (
              <div key={i} className="flex gap-3 text-sm text-muted">
                <span className="w-5 h-5 rounded-full bg-acc-deep text-acc flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <Link to="/ifsc-finder" className="inline-flex items-center gap-2 bg-gradient-to-br from-mint to-acc text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all">
            <Search className="w-4 h-4" /> Open IFSC Finder Now
          </Link>
        </section>

        {/* Method 2 — Passbook */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-surface-2 text-muted flex items-center justify-center font-bold text-sm shrink-0">2</span>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted" />
              <h2 className="text-lg font-bold text-ink">Check Your Bank Passbook</h2>
            </div>
          </div>
          <p className="text-sm text-muted mb-3">Open the <strong className="text-ink">first page</strong> of your bank passbook. The IFSC code is printed alongside your:</p>
          <ul className="text-sm text-muted space-y-1 mb-3 ml-4">
            <li>• Account number</li>
            <li>• Account holder name</li>
            <li>• Branch name and address</li>
            <li>• <strong className="text-ink">IFSC Code</strong> (labelled as "IFSC" or "IFSC Code")</li>
          </ul>
          <div className="bg-bg-2 border border-line rounded-xl p-3 text-xs text-faint">
            Tip: If your passbook doesn't show IFSC, request a passbook reprint at your branch — newer passbooks always include it.
          </div>
        </section>

        {/* Method 3 — Cheque book */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-surface-2 text-muted flex items-center justify-center font-bold text-sm shrink-0">3</span>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted" />
              <h2 className="text-lg font-bold text-ink">Check Your Cheque Book</h2>
            </div>
          </div>
          <p className="text-sm text-muted mb-3">Look at any cheque leaf in your cheque book. The IFSC code appears in <strong className="text-ink">two places</strong>:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-bg-2 border border-line rounded-xl p-3">
              <p className="font-semibold text-ink text-sm mb-1">Top of the cheque</p>
              <p className="text-xs text-faint">Printed near the bank logo and branch address — usually labelled "IFSC:"</p>
            </div>
            <div className="bg-bg-2 border border-line rounded-xl p-3">
              <p className="font-semibold text-ink text-sm mb-1">Note on MICR band</p>
              <p className="text-xs text-faint">The 9-digit MICR code at the bottom is <em>not</em> the IFSC — don't confuse the two.</p>
            </div>
          </div>
        </section>

        {/* Method 4 — Net banking / Mobile app */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-surface-2 text-muted flex items-center justify-center font-bold text-sm shrink-0">4</span>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-muted" />
              <h2 className="text-lg font-bold text-ink">Net Banking / Mobile Banking App</h2>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { bank: 'SBI YONO / Net Banking', path: 'My Accounts → Account Summary → Click account → Account Details' },
              { bank: 'HDFC Bank', path: 'Accounts → Summary → Click account number → View Account Details' },
              { bank: 'ICICI Bank', path: 'Accounts → Account Summary → Account Details' },
              { bank: 'Axis Bank', path: 'Accounts & Deposits → My Accounts → Select account → Account Details' },
              { bank: 'Kotak Bank', path: 'My Account → Account Summary → Branch & IFSC' },
            ].map(({ bank, path }) => (
              <div key={bank} className="flex gap-3 text-sm">
                <span className="font-semibold text-body w-36 shrink-0">{bank}</span>
                <span className="text-faint text-xs">{path}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Method 5 — Bank website */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-surface-2 text-muted flex items-center justify-center font-bold text-sm shrink-0">5</span>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-muted" />
              <h2 className="text-lg font-bold text-ink">Bank's Official Website</h2>
            </div>
          </div>
          <p className="text-sm text-muted mb-3">Most banks have a Branch Locator tool on their website:</p>
          <div className="space-y-2 text-sm">
            {[
              { bank: 'SBI', url: 'sbi.co.in → Branch Locator' },
              { bank: 'HDFC Bank', url: 'hdfcbank.com → Branch / ATM Locator' },
              { bank: 'ICICI Bank', url: 'icicibank.com → Branch & ATM' },
              { bank: 'Axis Bank', url: 'axisbank.com → Branch / ATM Locator' },
              { bank: 'Bank of Baroda', url: 'bankofbaroda.in → Locate Us' },
            ].map(({ bank, url }) => (
              <div key={bank} className="flex items-center gap-3 p-2.5 bg-bg-2 rounded-lg border border-line">
                <Building2 className="w-4 h-4 text-faint shrink-0" />
                <span className="font-medium text-body w-28">{bank}</span>
                <span className="text-faint text-xs">{url}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-2">Frequently Asked Questions</h2>
          <div>
            {[
              { q: 'Can I find IFSC code by account number?', a: 'No — IFSC codes are linked to branches, not account numbers. You need to know your bank name and branch to find the IFSC. Use RupeePedia\'s IFSC finder by selecting your bank → state → branch.' },
              { q: 'Is IFSC code the same for all accounts in the same branch?', a: 'Yes. All account holders at the same branch share the same IFSC code. The IFSC identifies the branch, not the individual account.' },
              { q: 'What if I cannot find my IFSC code?', a: 'Visit your branch in person — the teller or manager will provide your branch\'s IFSC code. Alternatively, call your bank\'s customer care helpline with your account number and they will provide the IFSC.' },
              { q: 'Do I need to re-check my IFSC code periodically?', a: 'Yes, especially if your bank has recently merged with another bank (e.g., former Vijaya Bank → Bank of Baroda). IFSC codes can change when banks merge. Always verify before large transfers.' },
            ].map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        <div className="bg-gradient-to-br from-acc-deep to-surface border border-acc/25 rounded-2xl p-6 text-center">
          <p className="text-ink font-semibold mb-1">Search IFSC codes for 1,78,000+ bank branches instantly</p>
          <p className="text-muted text-sm mb-4">Select bank → state → district → branch — no registration needed</p>
          <Link to="/ifsc-finder" className="inline-flex items-center gap-2 bg-gradient-to-br from-mint to-acc text-white font-semibold px-6 py-3 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all">
            <Search className="w-4 h-4" /> Find My IFSC Code
          </Link>
        </div>
      </div>
    </>
  );
}
