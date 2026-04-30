import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Search, Calculator,
  Building2, Zap, ChevronRight,
  BookOpen, Users, Lock,
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
        <title>About RupeePedia — India's IFSC Code & Financial Knowledge Platform</title>
        <meta
          name="description"
          content="RupeePedia is India's most complete IFSC code finder and financial knowledge platform. 177,000+ bank branches, EMI calculators, NEFT/RTGS guides, and more — all free."
        />
        <link rel="canonical" href="https://rupeepedia.in/about" />
      </Helmet>

      {/* ── Hero ── */}
      <section className="hero-bg py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp()}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-brand-500/30 mx-auto mb-6 select-none">₹</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-900 mb-6 leading-tight">
              About RupeePedia
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed mb-4">
              RupeePedia is a fintech platform committed to making banking information in India accurate,
              accessible, and free. We provide the most up-to-date IFSC and SWIFT codes for every bank
              branch across the country — because we understand how critical these codes are in today's
              digital-first financial world. Our goal is to make finding and using them as seamless as
              possible for everyone.
            </p>
            <p className="text-gray-500 text-base max-w-3xl mx-auto leading-relaxed mb-4">
              Our team is dedicated to maintaining a comprehensive, always-current database of bank codes
              so you can find the information you need — quickly and confidently. We take great care to
              ensure our platform is secure and protected, because we know how important trust is when it
              comes to online financial transactions.
            </p>
            <p className="text-gray-500 text-base max-w-3xl mx-auto leading-relaxed mb-4">
              Beyond IFSC and SWIFT codes, RupeePedia offers a growing suite of financial tools — including
              EMI calculators, SIP and investment planners, FD/RD return estimators, and in-depth guides on
              NEFT, RTGS, IMPS, and UPI. Whether you're planning a home loan, calculating investment returns,
              or simply need to find the nearest branch, we've got you covered.
            </p>
            <p className="text-gray-500 text-base max-w-3xl mx-auto leading-relaxed">
              Our goal is simple: to be your go-to source for everything banking and finance in India. We
              take pride in our commitment to accuracy and user satisfaction, and strive to deliver the
              best possible experience every time you visit.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-12 -mt-4">

        {/* ── What We Offer ── */}
        <motion.section {...fadeUp(0.1)}>
          <h2 className="font-display text-2xl font-bold text-brand-900 mb-6 text-center">
            What RupeePedia Offers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Search className="w-5 h-5 text-brand-600" />,
                title: 'IFSC Code Finder',
                desc: '177,000+ bank branches across India. Search by bank, state, district, and branch — or enter an IFSC directly. Every result shows NEFT, RTGS, IMPS, and UPI status.',
                href: '/ifsc',
                cta: 'Search IFSC',
                live: true,
              },
              {
                icon: <Building2 className="w-5 h-5 text-brand-600" />,
                title: 'Branch Detail Pages',
                desc: 'Every branch has its own SEO page with IFSC breakdown, MICR code, full address, payment modes, nearby branches, and step-by-step transfer guides.',
                href: '/ifsc',
                cta: 'Browse Branches',
                live: true,
              },
              {
                icon: <Calculator className="w-5 h-5 text-brand-600" />,
                title: 'EMI Calculator',
                desc: 'Calculate loan EMIs instantly for home, car, and personal loans. Adjust principal, interest rate, and tenure. All calculations run in your browser.',
                href: '/calculators/emi',
                cta: 'Try Calculator',
                live: true,
              },
              {
                icon: <Zap className="w-5 h-5 text-brand-600" />,
                title: 'SIP & Investment Calculators',
                desc: 'Plan SIP investments, calculate FD/RD returns, PPF, NPS, CAGR, XIRR and more. 15+ tools — all client-side, your data never leaves your device.',
                href: '/calculators/sip',
                cta: 'Try Calculator',
                live: true,
              },
              {
                icon: <BookOpen className="w-5 h-5 text-brand-600" />,
                title: 'Banking Guides',
                desc: 'Deep-dive explainers on NEFT, RTGS, IMPS, UPI, MICR, and SWIFT. Transaction charges, operating hours, and step-by-step transfer instructions.',
                href: '/money-guides',
                cta: 'Coming Soon',
                live: false,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className={`card p-5 flex gap-4 ${!item.live ? 'opacity-80' : ''}`}
                {...fadeUp(0.05 * i)}
              >
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-display text-base font-bold text-brand-900">{item.title}</h3>
                    {item.live
                      ? <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Live</span>
                      : <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Coming soon</span>
                    }
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-2">{item.desc}</p>
                  {item.live && (
                    <Link
                      to={item.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
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
          className="bg-brand-800 rounded-2xl py-8 px-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '1,77,000+', label: 'Bank Branches' },
              { value: '200+',      label: 'Banks Covered' },
              { value: '36',        label: 'States & UTs' },
              { value: '100%',      label: 'Free to Use' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-brand-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Privacy & Trust ── */}
        <motion.section {...fadeUp(0.25)}>
          <h2 className="font-display text-2xl font-bold text-brand-900 mb-6">
            Privacy & Trust
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Lock className="w-5 h-5 text-brand-600" />,
                title: 'No personal data collected',
                desc: 'Search queries are logged with a hashed IP only — never your actual IP, name, or identity. We use this only to understand which banks are searched most.',
              },
              {
                icon: <Shield className="w-5 h-5 text-brand-600" />,
                title: 'No ads, no tracking',
                desc: 'RupeePedia products are ad-free. No third-party trackers, no analytics cookies, no retargeting. What you search stays between you and the RBI dataset.',
              },
              {
                icon: <Users className="w-5 h-5 text-brand-600" />,
                title: 'Free forever',
                desc: 'All core features — IFSC search, branch details, payment guides — are and will remain free. Future premium features will be clearly marked.',
              },
            ].map(item => (
              <div key={item.title} className="card p-5">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-brand-900 text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Disclaimer ── */}
        <motion.div
          {...fadeUp(0.3)}
          className="p-5 bg-amber-50 border border-amber-200 rounded-2xl"
        >
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Disclaimer:</strong> RupeePedia is provided for informational purposes only.
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
