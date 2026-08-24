import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-gold transition-colors"
      >
        <span className="font-semibold text-ink text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gold shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted shrink-0" />
        }
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function GoldHallmarkGuidePage() {
  return (
    <>
      <Helmet>
        <title>BIS Gold Hallmark Guide India — 916, 750, 585 Purity Explained | RupeePedia</title>
        <meta name="description" content="BIS hallmark on gold jewellery indicates purity. 916 = 22K (91.6% pure), 750 = 18K (75% pure), 585 = 14K. Learn what hallmarks mean before buying gold jewellery in India." />
        <link rel="canonical" href="https://rupeepedia.in/gold-hallmark-guide" />
        <meta property="og:title" content="BIS Gold Hallmark Guide India — 916, 750, 585 Purity Explained" />
        <meta property="og:description" content="Learn what BIS hallmarks on gold jewellery mean — 916 (22K), 750 (18K), 585 (14K). Essential guide before buying gold in India." />
        <meta property="og:url" content="https://rupeepedia.in/gold-hallmark-guide" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: 'BIS Gold Hallmark Guide India — 916, 750, 585 Purity Explained',
              url: 'https://rupeepedia.in/gold-hallmark-guide',
              description: 'BIS hallmark on gold jewellery indicates purity. Learn what 916, 750, 585, and other hallmarks mean before buying gold jewellery in India.',
              author: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
              publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in', logo: { '@type': 'ImageObject', url: 'https://rupeepedia.in/logo.png' } },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                  { '@type': 'ListItem', position: 2, name: 'Gold Rate Today', item: 'https://rupeepedia.in/gold-rate-today' },
                  { '@type': 'ListItem', position: 3, name: 'Gold Hallmark Guide', item: 'https://rupeepedia.in/gold-hallmark-guide' },
                ],
              },
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'What does 916 hallmark mean on gold?', acceptedAnswer: { '@type': 'Answer', text: '916 hallmark means the gold is 91.6% pure, which is 22 karat (22K) gold. It is the most common standard for gold jewellery in India. The number 916 represents the gold content per 1,000 parts.' } },
                { '@type': 'Question', name: 'What is BIS hallmark on gold jewellery?', acceptedAnswer: { '@type': 'Answer', text: 'BIS hallmark is a certification mark issued by the Bureau of Indian Standards (BIS) on gold jewellery to certify its purity. Mandatory for gold jewellery sold in India since April 2023, it includes the BIS logo, purity (like 916), HUID (Hallmark Unique ID), and jeweller code.' } },
                { '@type': 'Question', name: 'What is the difference between 22K and 24K gold?', acceptedAnswer: { '@type': 'Answer', text: '24K gold is 99.9% pure — used for investment bars, coins, and digital gold. 22K gold (BIS 916) is 91.6% pure — the standard for jewellery in India. 22K is harder and more durable for jewellery making because it contains 8.4% other metals (copper, silver).' } },
                { '@type': 'Question', name: 'Is BIS hallmark mandatory for gold in India?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Since 23 June 2021, BIS hallmarking is mandatory for gold jewellery sold in India. Since April 2023, HUID (Hallmark Unique ID) is also mandatory on every piece. Always check for BIS hallmark before buying gold jewellery.' } },
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
                  <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to="/gold-rate-today" className="hover:text-gold transition-colors">Gold Rate Today</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-gold font-semibold">Gold Hallmark Guide</span>
                </nav>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">BIS Gold Hallmark Guide India</h1>
                <p className="text-body text-lg">What 916, 750, 585 and other hallmarks mean before you buy</p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* What is hallmark */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-3">What is a BIS Hallmark?</h2>
          <p className="text-body leading-relaxed mb-4">
            A <strong className="text-ink">BIS hallmark</strong> is a purity certification mark issued by the <strong className="text-ink">Bureau of Indian Standards (BIS)</strong> on gold jewellery. It guarantees that the gold has been independently tested and certified to meet the declared purity standard. BIS hallmarking became <strong className="text-ink">mandatory in India from June 2021</strong>.
          </p>
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-sm">
            <p className="font-semibold text-gold mb-2">A BIS hallmark contains 4 components:</p>
            <ol className="space-y-1 text-body">
              <li><strong className="text-ink">1.</strong> BIS logo (triangle with the letters BIS)</li>
              <li><strong className="text-ink">2.</strong> Purity/fineness mark (e.g., 916, 750)</li>
              <li><strong className="text-ink">3.</strong> HUID — Hallmark Unique Identification Number (6-character alphanumeric)</li>
              <li><strong className="text-ink">4.</strong> Jeweller's identification mark</li>
            </ol>
          </div>
        </section>

        {/* Purity table */}
        <section className="bg-surface rounded-2xl border border-line overflow-hidden">
          <div className="px-6 py-4 border-b border-line">
            <h2 className="text-xl font-bold text-ink">Gold Hallmark Purity Chart</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line">
                  <th className="px-5 py-3 text-left font-semibold text-muted">Hallmark</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted">Karat</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted">Purity</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted">Common Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  { h: '999', k: '24K', p: '99.9%', u: 'Investment — coins, digital gold, sovereign gold bonds', highlight: false },
                  { h: '958', k: '23K', p: '95.8%', u: 'Rare — high-end jewellery, not common in India', highlight: false },
                  { h: '916', k: '22K', p: '91.6%', u: 'Most common for jewellery in India (BIS 916)', highlight: true },
                  { h: '875', k: '21K', p: '87.5%', u: 'Middle East jewellery, less common in India', highlight: false },
                  { h: '750', k: '18K', p: '75.0%', u: 'Diamond-set and studded jewellery', highlight: false },
                  { h: '708', k: '17K', p: '70.8%', u: 'Rare, not standard in India', highlight: false },
                  { h: '585', k: '14K', p: '58.5%', u: 'Low-cost fashion jewellery', highlight: false },
                  { h: '375', k: '9K',  p: '37.5%', u: 'Not sold in India (below BIS minimum of 14K)', highlight: false },
                ].map(({ h, k, p, u, highlight }) => (
                  <tr key={h} className={highlight ? 'bg-gold/10' : 'hover:bg-surface-2 transition-colors'}>
                    <td className="px-5 py-3 ifsc-mono font-bold text-gold text-lg">{h}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{k}</td>
                    <td className="px-5 py-3 text-body">{p}</td>
                    <td className="px-5 py-3 text-faint text-xs">
                      {u}
                      {highlight && <span className="ml-2 bg-gold/20 text-gold text-xs px-1.5 py-0.5 rounded font-semibold">Standard</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 916 deep dive */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-4">Why is 916 the Most Popular Hallmark in India?</h2>
          <div className="space-y-3 text-sm text-muted">
            <p>The <strong className="text-ink">916 hallmark (22 karat)</strong> is the gold standard for jewellery in India because it strikes the ideal balance between purity and durability:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { t: 'High purity', d: '91.6% pure gold — significantly higher than 18K (75%) while still suitable for intricate designs.' },
                { t: 'Better durability', d: '8.4% alloy (copper/silver) makes it harder than 24K, ideal for complex jewellery designs.' },
                { t: 'Value retention', d: 'High gold content means good resale value, unlike lower karat jewellery.' },
                { t: 'Cultural preference', d: 'Indian tradition favours high-purity gold for weddings, religious jewellery, and gifting.' },
              ].map(({ t, d }) => (
                <div key={t} className="flex gap-2.5 p-3 bg-bg-2 rounded-xl border border-line">
                  <ArrowRight className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-ink">{t}</p>
                    <p className="text-xs text-faint mt-0.5">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HUID */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-3">What is HUID — Hallmark Unique ID?</h2>
          <p className="text-body text-sm leading-relaxed mb-4">
            The <strong className="text-ink">HUID (Hallmark Unique Identification Number)</strong> is a 6-character alphanumeric code stamped on every BIS-hallmarked gold jewellery item since April 2023. It allows consumers and authorities to verify the authenticity of the hallmark by checking the HUID against the BIS database.
          </p>
          <div className="bg-bg-2 border border-line rounded-xl p-4 text-sm">
            <p className="font-semibold text-ink mb-2">How to verify HUID:</p>
            <ol className="space-y-1 text-muted list-decimal ml-4">
              <li>Download the BIS Care app (Google Play / App Store)</li>
              <li>Tap "Verify HUID"</li>
              <li>Enter or scan the 6-character HUID from the jewellery</li>
              <li>View the registered purity, jeweller name, and hallmarking centre</li>
            </ol>
          </div>
        </section>

        {/* Buying tips */}
        <section className="bg-surface rounded-2xl border border-line p-6">
          <h2 className="text-xl font-bold text-ink mb-4">Tips for Buying Hallmarked Gold in India</h2>
          <div className="space-y-3">
            {[
              { n: '1', t: 'Always check for BIS logo', d: 'The triangle BIS logo must be present on the hallmark stamp. Without it, the hallmark is not genuine.' },
              { n: '2', t: 'Verify HUID', d: 'Use the BIS Care app to verify the HUID against the BIS database before purchasing expensive jewellery.' },
              { n: '3', t: 'Compare with market rate', d: 'Use RupeePedia\'s live gold rate to verify if the jeweller\'s base price is fair. Add 3% GST and making charges on top.' },
              { n: '4', t: 'Get a bill', d: 'Always get an itemised bill showing gold weight, purity, making charges, and GST separately.' },
              { n: '5', t: 'Understand making charges', d: 'Making charges (₹150–600/gram) are not covered by gold buyback. Minimise making charges for investment-purpose jewellery.' },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-gold/10 text-gold flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{n}</span>
                <div>
                  <p className="font-semibold text-ink text-sm">{t}</p>
                  <p className="text-xs text-faint mt-0.5">{d}</p>
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
              { q: 'Can I sell hallmarked gold back to any jeweller?', a: 'Yes. Hallmarked gold (BIS 916 or higher) is accepted by most jewellers for exchange or buyback. The buyback price is typically the IBJA rate minus 1–3%. Non-hallmarked gold gets a lower buyback rate after purity testing.' },
              { q: 'What is the difference between 22K and 916 gold?', a: '22K and 916 mean the same thing. "22K" refers to 22 parts pure gold out of 24 parts total. "916" is the fineness value — 916 parts pure gold per 1,000 parts total (91.6%). Both indicate the same purity.' },
              { q: 'Is 18K gold jewellery good for investment?', a: '18K (750 hallmark) is 75% pure gold. While it\'s good for diamond-set or designer jewellery, it\'s not ideal as a gold investment compared to 22K or 24K, since a higher proportion is alloy metal.' },
              { q: 'Why does jewellery gold rate differ from published IBJA rate?', a: 'The IBJA rate is the base bullion rate. Jewellers add: GST (3%), making charges (₹150–600/gram depending on design), and wastage charges. The final price you pay can be 10–20% above the base IBJA rate.' },
            ].map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6 text-center">
          <p className="text-ink font-semibold mb-3">Check today's live 22K &amp; 24K gold rate before you buy</p>
          <Link to="/gold-rate-today" className="inline-flex items-center gap-2 bg-gradient-to-br from-acc to-acc-2 text-white font-semibold px-6 py-3 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all">
            View Gold Rate Today →
          </Link>
        </div>
      </div>
    </>
  );
}
