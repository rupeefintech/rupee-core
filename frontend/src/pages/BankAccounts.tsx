import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PiggyBank, TrendingUp, Smartphone, ChevronRight, Zap, Shield, Users } from 'lucide-react';

const ACCOUNT_TYPES = [
  {
    title: 'Savings Account Rates',
    icon: PiggyBank,
    color: 'bg-brand-100 text-brand-700',
    border: 'border-brand-200',
    href: '/savings-rates',
    badge: 'Live rates',
    badgeCls: 'bg-green-100 text-green-700',
    desc: 'Compare interest rates across all Indian banks — zero balance, regular, and balance-tier rates. Manually verified and updated regularly.',
    tags: ['Zero Balance', 'Up to 9% p.a.', 'Quarterly Interest'],
    cta: 'View Savings Rates',
  },
  {
    title: 'Fixed Deposit Rates',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    href: '/fd-rates',
    badge: 'Live rates',
    badgeCls: 'bg-green-100 text-green-700',
    desc: 'Lock in higher returns with fixed deposits. Compare FD rates across banks — up to 9.5% for small finance banks. Senior citizen rates included.',
    tags: ['Up to 9.5% p.a.', 'Senior Citizen Rates', 'All Tenures'],
    cta: 'View FD Rates',
  },
  {
    title: 'Digital Bank Accounts',
    icon: Smartphone,
    color: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200',
    href: '/savings-rates',
    badge: 'Coming soon',
    badgeCls: 'bg-amber-100 text-amber-700',
    desc: 'Open instantly with video KYC — no branch visit. Fi, Jupiter, Niyo, and Freo offer zero minimum balance and competitive rates.',
    tags: ['Zero AMB', 'Instant KYC', 'UPI + Cards'],
    cta: 'Explore Rates',
  },
];

const WHY_CARDS = [
  { icon: Zap,     title: 'Real rates, not ads',    desc: 'We show actual interest rates verified from bank websites — not sponsored placements.'   },
  { icon: Shield,  title: 'DICGC insured',          desc: 'Every bank on this list is RBI-licensed. All deposits insured up to ₹5 lakh per bank.'  },
  { icon: Users,   title: 'All account types',       desc: 'Zero balance, regular savings, salary, and digital accounts — all in one place.'        },
];

export default function BankAccounts() {
  return (
    <>
      <Helmet>
        <title>Best Bank Accounts in India 2026 — Savings, FD &amp; Digital | RupeePedia</title>
        <meta name="description" content="Compare savings account interest rates, FD rates, and digital bank accounts in India. Zero balance accounts, high interest options, and digital-first banks. Free comparison, no commissions." />
        <meta name="keywords" content="best savings account india 2026, zero balance account, digital bank account india, savings account interest rate, best bank account india" />
        <link rel="canonical" href="https://rupeepedia.in/accounts" />
        <meta property="og:title"       content="Best Bank Accounts in India 2026 | RupeePedia" />
        <meta property="og:description" content="Compare savings, FD, and digital bank accounts. Real rates, no commissions." />
        <meta property="og:url"         content="https://rupeepedia.in/accounts" />
        <meta property="og:type"        content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <nav className="flex items-center gap-1.5 text-brand-300 text-xs mb-5">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">Bank Accounts</span>
            </nav>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">Best Bank Accounts in India 2026</h1>
                <p className="text-brand-200 mt-1 text-sm">Savings accounts, FD rates, and digital banks — compared transparently</p>
              </div>
            </div>
            <p className="text-brand-200 text-base max-w-2xl">
              Real interest rates manually verified from bank websites. Zero balance accounts, high-interest savings, and instant digital accounts — all in one place, no commissions.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

          {/* Account type cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ACCOUNT_TYPES.map(ac => {
              const Icon = ac.icon;
              return (
                <Link key={ac.title} to={ac.href}
                  className={`bg-white rounded-2xl border-2 ${ac.border} p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${ac.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${ac.badgeCls}`}>{ac.badge}</span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-base mb-2">{ac.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-4">{ac.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {ac.tags.map(t => (
                      <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{t}</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-brand-600 flex items-center gap-1.5">
                    {ac.cta} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Why RupeePedia */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Why use RupeePedia for account comparison?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {WHY_CARDS.map(w => {
                const Icon = w.icon;
                return (
                  <div key={w.title} className="flex gap-3">
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm mb-0.5">{w.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{w.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/ifsc-finder"
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🏦</div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">IFSC Code Finder</div>
                <div className="text-xs text-gray-400">Find any branch's IFSC for NEFT / RTGS / IMPS</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
            </Link>
            <Link to="/calculators/fd"
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">📊</div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">FD Calculator</div>
                <div className="text-xs text-gray-400">Calculate maturity amount with compound interest</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
