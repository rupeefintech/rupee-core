import React from "react";
import { Link } from "react-router-dom";
import {
  Calculator, Search, CreditCard, Landmark, TrendingUp, Banknote,
  PiggyBank, Receipt, IndianRupee, Building2, ShieldCheck,
  BookOpen, ChevronRight, ArrowRight, Home,
  Wallet, Users, MapPin,
} from "lucide-react";

const popularTools = [
  { name: "EMI Calculator",    desc: "Home, car & personal loan EMI",   link: "/calculators/emi",              icon: Calculator,   color: "bg-brand-600" },
  { name: "SIP Calculator",    desc: "Plan mutual fund investments",     link: "/calculators/sip",              icon: TrendingUp,   color: "bg-emerald-500" },
  { name: "Income Tax",        desc: "Old vs New regime comparison",     link: "/calculators/income-tax",       icon: IndianRupee,  color: "bg-rose-500" },
  { name: "FD Calculator",     desc: "Fixed deposit maturity returns",   link: "/calculators/fd",               icon: PiggyBank,    color: "bg-cyan-500" },
  { name: "Salary Calculator", desc: "CTC to in-hand breakdown",        link: "/calculators/salary-calculator", icon: Banknote,    color: "bg-indigo-500" },
  { name: "GST Calculator",    desc: "Inclusive & exclusive GST",        link: "/calculators/gst",              icon: Receipt,      color: "bg-orange-500" },
  { name: "HRA Calculator",    desc: "Tax exemption on house rent",     link: "/calculators/hra-calculator",   icon: Home,         color: "bg-teal-500" },
  { name: "SWP Calculator",    desc: "Systematic withdrawal planning",  link: "/calculators/swp",              icon: Wallet,       color: "bg-pink-500" },
  { name: "PPF Calculator",    desc: "Public provident fund returns",   link: "/calculators/ppf",              icon: ShieldCheck,  color: "bg-lime-600" },
];

export default function HomePage() {
  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 py-16 md:py-20">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0h40v1H0zm0 39h40v1H0z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-white/80">India's most comprehensive financial toolkit</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-tight tracking-tight">
            Smart Money Decisions,<br className="hidden md:block" /> Made Simple
          </h1>

          <p className="text-brand-200 mb-8 text-lg max-w-2xl mx-auto">
            IFSC codes, EMI calculators, credit card comparisons, tax tools — everything you need to manage your finances better.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link
              to="/ifsc-finder"
              className="inline-flex items-center gap-2 bg-white text-brand-800 font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-black/10 hover:bg-brand-50 transition-all hover:-translate-y-0.5"
            >
              <Search size={16} />
              Find IFSC Code
            </Link>
            <Link
              to="/calculators"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              <Calculator size={16} />
              Explore Calculators
            </Link>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { label: 'EMI Calculator', to: '/calculators/emi' },
              { label: 'Income Tax',     to: '/calculators/income-tax' },
              { label: 'SIP Calculator', to: '/calculators/sip' },
              { label: 'Credit Cards',   to: '/credit-cards' },
              { label: 'FD Calculator',  to: '/calculators/fd' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/15 hover:bg-white/20 hover:text-white transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              { value: '1,78,000+', label: 'Bank Branches',    icon: MapPin },
              { value: '1,350+',    label: 'Banks Covered',    icon: Building2 },
              { value: '50+',       label: 'Credit Cards',     icon: CreditCard },
              { value: '15+',       label: 'Financial Tools',  icon: Calculator },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <stat.icon size={16} className="text-accent-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">{stat.value}</p>
                  <p className="text-brand-300 text-[11px]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES — 3 equal bento cards ── */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">What we offer</p>
          <h2 className="text-3xl font-black text-gray-900 mb-9 tracking-tight">Everything banking, in one place</h2>

          <div className="grid md:grid-cols-3 gap-4">

            {/* IFSC — dark card */}
            <Link
              to="/ifsc-finder"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-brand-900 to-brand-700 flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/20"
            >
              <div className="h-[3px] bg-gradient-to-r from-brand-400 to-brand-500" />
              <div className="p-6 flex flex-col flex-1">
                <div className="w-11 h-11 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Landmark size={20} className="text-white/90" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">IFSC & Bank Search</h3>
                <p className="text-white/60 text-sm leading-relaxed flex-1 mb-4">
                  Find any IFSC code across 1,350+ banks. Verify NEFT, RTGS, IMPS & UPI status instantly.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['178k Branches', 'MICR Codes', 'RBI Verified'].map(t => (
                    <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/12 text-white/80 border border-white/15">{t}</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-white/80 flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Search Branches <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Credit Cards */}
            <Link
              to="/credit-cards"
              className="group rounded-2xl overflow-hidden bg-white border-[1.5px] border-gray-100 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand-100"
            >
              <div className="h-[3px] bg-gradient-to-r from-amber-400 to-brand-500" />
              <div className="p-6 flex flex-col flex-1">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <CreditCard size={20} className="text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Credit Cards</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">
                  Compare cashback, rewards & annual fees side by side. Find your perfect card from 50+ options.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Cashback', 'Travel', 'Rewards', 'Lifetime Free'].map(t => (
                    <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">{t}</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-brand-600 flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Compare Cards <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Savings Accounts */}
            <Link
              to="/accounts"
              className="group rounded-2xl overflow-hidden bg-white border-[1.5px] border-gray-100 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl hover:border-emerald-100"
            >
              <div className="h-[3px] bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="p-6 flex flex-col flex-1">
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <PiggyBank size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Savings Accounts</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">
                  Zero-balance, high-interest and digital-first accounts compared transparently — no commissions.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Zero Balance', 'High Interest', 'Digital Banks'].map(t => (
                    <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">{t}</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Explore Accounts <ArrowRight size={14} />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── CALCULATORS ── */}
      <section className="py-14 bg-[#F8F7FF] border-t border-brand-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1.5">Financial Tools</p>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Calculators for every money decision</h2>
              <p className="text-sm text-gray-400 mt-1">All calculations run locally — your data never leaves your device</p>
            </div>
            <Link to="/calculators" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition">
              All calculators <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {popularTools.map((tool) => (
              <Link
                key={tool.link}
                to={tool.link}
                className="group flex items-center gap-4 p-4 rounded-xl bg-white border-[1.5px] border-gray-100 hover:border-brand-200 hover:shadow-md hover:-translate-y-px transition-all"
              >
                <div className={`w-11 h-11 ${tool.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  <tool.icon size={20} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-brand-600 transition">{tool.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-200 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>

          <div className="sm:hidden mt-4 text-center">
            <Link to="/calculators" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all calculators <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-14 bg-white border-t border-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-md mx-auto mb-10">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Why Rupeepedia</p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Trusted by thousands of Indians every month</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: ShieldCheck, title: 'RBI Verified Data',
                desc: 'All IFSC codes sourced from RBI\'s official database, updated fortnightly to reflect branch changes.',
                bg: 'bg-brand-50', border: 'border-brand-100', ic: 'text-brand-600',
              },
              {
                icon: TrendingUp, title: 'Always Current',
                desc: 'Financial data, rates & card offers refreshed regularly. No stale information, ever.',
                bg: 'bg-amber-50', border: 'border-amber-100', ic: 'text-amber-600',
              },
              {
                icon: Users, title: '100% Free, No Ads',
                desc: 'Every tool, comparison and guide is completely free. No trackers, no ads, no paywalls — ever.',
                bg: 'bg-emerald-50', border: 'border-emerald-100', ic: 'text-emerald-600',
              },
            ].map((item) => (
              <div key={item.title} className={`p-6 rounded-2xl ${item.bg} border ${item.border} text-center`}>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4">
                  <item.icon size={22} className={item.ic} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUIDES ── */}
      <section className="py-12 bg-[#F8F7FF] border-t border-brand-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Money Guides</p>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Stay financially informed</h2>
            </div>
            <Link to="/money-guides" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition">
              All guides <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { to: '/money-guides/pan-rules-2026', eyebrow: 'Tax & PAN · 2026', title: 'New PAN Rules 2026', desc: 'Latest limits, mandate changes & what it means for your transactions.' },
              { to: '/money-guides/pan-limit-2026', eyebrow: 'Compliance · 2026', title: 'PAN Limit 2026', desc: 'Updated transaction thresholds — when PAN is required and when it\'s optional.' },
              { to: '/money-guides/pan-mandatory-transactions-2026', eyebrow: 'Banking Guide · 2026', title: 'PAN Mandatory Transactions', desc: 'A complete list of 2026 transactions that legally require PAN submission.' },
            ].map(g => (
              <Link
                key={g.to}
                to={g.to}
                className="group bg-white border-[1.5px] border-gray-100 rounded-2xl p-5 hover:border-brand-100 hover:shadow-md transition-all"
              >
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">{g.eyebrow}</p>
                <div className="flex items-start gap-2 mb-1.5">
                  <BookOpen size={15} className="text-brand-400 mt-0.5 shrink-0" />
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition leading-snug">{g.title}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{g.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
