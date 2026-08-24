import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Search, Calculator,
  Building2, ChevronRight,
  BookOpen, Users, Lock, MapPin, TrendingUp,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About RupeePedia — India's IFSC, PIN Code & Financial Knowledge Platform</title>
        <meta
          name="description"
          content="RupeePedia is India's most complete IFSC code finder, PIN code directory, live gold & silver rates platform, and financial knowledge hub. 177,000+ bank branches, 150,000+ post offices — all free."
        />
        <link rel="canonical" href="https://rupeepedia.in/about" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'About', item: 'https://rupeepedia.in/about' },
          ],
        })}</script>
      </Helmet>

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10 text-center">
            <div className="relative z-[2]">
              <motion.div {...fadeUp()}>
                <nav className="flex items-center justify-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                  <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">About</span>
                </nav>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-acc to-acc-2 flex items-center justify-center text-white font-black text-3xl shadow-acc-glow mx-auto mb-6 select-none">₹</div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink mb-6 leading-tight">
                  About RupeePedia
                </h1>
                <p className="text-body text-lg max-w-3xl mx-auto leading-relaxed mb-4">
                  RupeePedia is a fintech platform committed to making banking and postal information in India
                  accurate, accessible, and free. We provide the most up-to-date IFSC codes for every bank
                  branch, a complete PIN code directory for every post office, and live gold &amp; silver rates
                  updated daily — because we understand how critical this information is in everyday financial life.
                </p>
                <p className="text-muted text-base max-w-3xl mx-auto leading-relaxed mb-4">
                  Our team maintains a comprehensive, always-current database so you can find the information
                  you need — quickly and confidently. We take great care to ensure our platform is secure and
                  trustworthy, because we know how important accuracy is when it comes to financial transactions
                  and postal deliveries.
                </p>
                <p className="text-muted text-base max-w-3xl mx-auto leading-relaxed">
                  Beyond IFSC and PIN codes, RupeePedia offers a growing suite of financial tools — EMI
                  calculators, SIP planners, FD/RD estimators, NRI tax calculators, gold &amp; silver live rates,
                  and in-depth guides on NEFT, RTGS, IMPS, UPI, and India Post. Whether you're planning a home
                  loan, tracking gold prices, or finding the nearest post office — we've got you covered.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-4xl mx-auto px-4 sm:px-6 pb-20 pt-10 space-y-12">

        {/* ── What We Offer ── */}
        <motion.section {...fadeUp(0.1)}>
          <h2 className="font-display text-2xl font-bold text-ink mb-6 text-center">
            What RupeePedia Offers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Search className="w-5 h-5 text-acc" />,
                title: 'IFSC Code Finder',
                desc: '178,000+ bank branches across India. Search by bank, state, district, and branch — or enter an IFSC directly. Every result shows NEFT, RTGS, IMPS, and UPI status.',
                href: '/ifsc-finder',
                cta: 'Search IFSC',
                live: true,
              },
              {
                icon: <MapPin className="w-5 h-5 text-acc" />,
                title: 'PIN Code Directory',
                desc: '150,000+ post offices across all 28 states and 8 union territories. Search by PIN code, post office name, or browse by state → district. Includes H.O, S.O, and B.O details.',
                href: '/pin-codes',
                cta: 'Search PIN Codes',
                live: true,
              },
              {
                icon: <TrendingUp className="w-5 h-5 text-acc" />,
                title: 'Live Gold & Silver Rates',
                desc: 'Today\'s 24K and 22K gold rates and silver prices updated daily across major Indian cities. Historical trend charts, purity comparison, and jewellery cost estimator.',
                href: '/gold-rate-today',
                cta: 'Check Rates',
                live: true,
              },
              {
                icon: <Calculator className="w-5 h-5 text-acc" />,
                title: '15+ Financial Calculators',
                desc: 'EMI, SIP, FD/RD, PPF, NPS, HRA, GST, income tax, NRI capital gains, step-up SIP, prepayment, and more. All calculations run in your browser — no data sent to servers.',
                href: '/calculators',
                cta: 'Try Calculators',
                live: true,
              },
              {
                icon: <Building2 className="w-5 h-5 text-acc" />,
                title: 'Branch Detail Pages',
                desc: 'Every branch has its own page with IFSC breakdown, MICR code, full address, payment modes, nearby branches, and step-by-step transfer guides.',
                href: '/ifsc-finder',
                cta: 'Browse Branches',
                live: true,
              },
              {
                icon: <BookOpen className="w-5 h-5 text-acc" />,
                title: 'Guides & Resources',
                desc: 'In-depth guides on NEFT, RTGS, IMPS, UPI, MICR, SWIFT, India Post, PIN codes, gold investment, and NRI banking. All written and reviewed by our finance team.',
                href: '/money-guides',
                cta: 'Read Guides',
                live: true,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className={`bg-surface rounded-2xl border border-line p-5 flex gap-4 ${!item.live ? 'opacity-80' : ''}`}
                {...fadeUp(0.05 * i)}
              >
                <div className="w-11 h-11 bg-acc-deep rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-display text-base font-bold text-ink">{item.title}</h3>
                    {item.live
                      ? <span className="text-[10px] font-semibold bg-mint/10 text-mint border border-mint/30 px-2 py-0.5 rounded-full">Live</span>
                      : <span className="text-[10px] font-semibold bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded-full">Coming soon</span>
                    }
                  </div>
                  <p className="text-muted text-xs leading-relaxed mb-2">{item.desc}</p>
                  {item.live && (
                    <Link
                      to={item.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-acc hover:text-ink transition-colors"
                    >
                      {item.cta} <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Stats bar ── */}
        <motion.div
          {...fadeUp(0.15)}
          className="bg-gradient-to-br from-acc-deep to-surface border border-acc/30 rounded-2xl py-8 px-6 shadow-acc-glow"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '1,78,000+', label: 'Bank Branches' },
              { value: '1,50,000+', label: 'Post Offices'  },
              { value: '36',        label: 'States & UTs'  },
              { value: '100%',      label: 'Free to Use'   },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-ink">{stat.value}</p>
                <p className="text-muted text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Privacy & Trust ── */}
        <motion.section {...fadeUp(0.25)}>
          <h2 className="font-display text-2xl font-bold text-ink mb-6">
            Privacy &amp; Trust
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Lock className="w-5 h-5 text-acc" />,
                title: 'No personal data collected',
                desc: 'Search queries are logged with a hashed IP only — never your actual IP, name, or identity. We use this only to understand which banks are searched most.',
              },
              {
                icon: <Shield className="w-5 h-5 text-acc" />,
                title: 'No personal tracking',
                desc: 'No analytics cookies tied to your identity, no retargeting. The site is supported by contextual ads (Google AdSense) — these do not profile you based on your searches here.',
              },
              {
                icon: <Users className="w-5 h-5 text-acc" />,
                title: 'Free forever',
                desc: 'All core features — IFSC search, branch details, payment guides — are and will remain free. Future premium features will be clearly marked.',
              },
            ].map(item => (
              <div key={item.title} className="bg-surface rounded-2xl border border-line p-5">
                <div className="w-10 h-10 bg-acc-deep rounded-xl flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-ink text-sm mb-1">{item.title}</h3>
                <p className="text-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Disclaimer ── */}
        <motion.div
          {...fadeUp(0.3)}
          className="p-5 bg-gold/10 border border-gold/30 rounded-2xl"
        >
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <p className="text-body text-sm leading-relaxed">
              <strong className="text-ink">Disclaimer:</strong> RupeePedia is provided for informational purposes only.
              Always verify IFSC codes, MICR codes, and branch details directly with your bank before
              initiating any financial transaction. RupeePedia is not responsible for any errors,
              losses, or damages arising from the use of information on this platform.
              Data is updated fortnightly but branches may change without notice — when in doubt,
              call your bank directly.
            </p>
          </div>
        </motion.div>

      </div>
    </>
  );
}
