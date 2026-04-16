import React from "react";
import { Link } from "react-router-dom";
import {
  Calculator, Search, CreditCard, Landmark, TrendingUp, Banknote,
  PiggyBank, Receipt, IndianRupee, Building2, ShieldCheck,
  BookOpen, ChevronRight, ArrowRight, BadgePercent, Home,
  MapPin, Sparkles, Star, Wallet, Users,
} from "lucide-react";

const popularTools = [
  { name: "EMI Calculator", desc: "Home, car & personal loan EMI", link: "/calculators/emi", icon: Calculator, color: "bg-blue-500" },
  { name: "SIP Calculator", desc: "Plan mutual fund investments", link: "/calculators/sip", icon: TrendingUp, color: "bg-emerald-500" },
  { name: "Income Tax", desc: "Old vs New regime comparison", link: "/calculators/income-tax", icon: IndianRupee, color: "bg-rose-500" },
  { name: "FD Calculator", desc: "Fixed deposit maturity returns", link: "/calculators/fd", icon: PiggyBank, color: "bg-cyan-500" },
  { name: "Salary Calculator", desc: "CTC to in-hand breakdown", link: "/calculators/salary-calculator", icon: Banknote, color: "bg-indigo-500" },
  { name: "GST Calculator", desc: "Inclusive & exclusive GST", link: "/calculators/gst", icon: Receipt, color: "bg-orange-500" },
  { name: "HRA Calculator", desc: "Tax exemption on house rent", link: "/calculators/hra-calculator", icon: Home, color: "bg-teal-500" },
  { name: "SWP Calculator", desc: "Systematic withdrawal planning", link: "/calculators/swp", icon: Wallet, color: "bg-pink-500" },
  { name: "PPF Calculator", desc: "Public provident fund returns", link: "/calculators/ppf", icon: ShieldCheck, color: "bg-lime-600" },
];

export default function HomePage() {
  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 py-16 md:py-20">
        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0h40v1H0zm0 39h40v1H0z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={14} className="text-gold-400" />
            <span className="text-xs font-medium text-white/80">India's most comprehensive financial toolkit</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white font-display leading-tight">
            Smart Money Decisions,<br className="hidden md:block" /> Made Simple
          </h1>
          <p className="text-brand-200 mb-8 text-lg max-w-2xl mx-auto">
            IFSC codes, EMI calculators, credit card comparisons, tax tools — everything you need to manage your finances better.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800 placeholder:text-gray-400 text-sm shadow-xl shadow-black/10 focus:outline-none focus:ring-2 focus:ring-gold-500 border-0"
              placeholder="Search IFSC code, bank name, or calculator..."
            />
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10">
            {[
              { value: "1,78,000+", label: "Bank Branches", icon: MapPin },
              { value: "1,350+", label: "Banks Covered", icon: Building2 },
              { value: "50+", label: "Credit Cards", icon: CreditCard },
              { value: "15+", label: "Financial Tools", icon: Calculator },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <stat.icon size={16} className="text-gold-400" />
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

      {/* EXPLORE SECTION — 3 distinct pillars, no repetition */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-5">

            {/* Card 1: IFSC & Banking — unique to this platform */}
            <Link to="/ifsc-finder" className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 p-6 pb-5 text-white hover:shadow-xl hover:shadow-violet-500/15 transition-all hover:-translate-y-0.5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.06] rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/[0.04] rounded-full translate-y-8 -translate-x-8" />
              <div className="relative z-10">
                <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center mb-4">
                  <Landmark size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 font-display">IFSC & Bank Search</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Find any branch across 1,350+ banks. Verify IFSC codes, get MICR, address & contact details instantly.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">NEFT/RTGS</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">MICR Codes</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">Branch Details</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all">
                  Search Now <ArrowRight size={15} />
                </span>
              </div>
            </Link>

            {/* Card 2: Credit Cards — comparison & discovery */}
            <Link to="/credit-cards" className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-6 pb-5 text-white hover:shadow-xl hover:shadow-amber-500/15 transition-all hover:-translate-y-0.5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.06] rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/[0.04] rounded-full translate-y-8 -translate-x-8" />
              <div className="relative z-10">
                <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center mb-4">
                  <CreditCard size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 font-display">Credit Cards</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Compare rewards, cashback & fees side by side. Find the perfect card for your spending habits.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">Cashback</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">Travel</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">Rewards</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">Fuel</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all">
                  Compare Cards <ArrowRight size={15} />
                </span>
              </div>
            </Link>

            {/* Card 3: Savings Accounts */}
            <Link to="/accounts" className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-6 pb-5 text-white hover:shadow-xl hover:shadow-emerald-500/15 transition-all hover:-translate-y-0.5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.06] rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/[0.04] rounded-full translate-y-8 -translate-x-8" />
              <div className="relative z-10">
                <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center mb-4">
                  <PiggyBank size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 font-display">Savings Accounts</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Zero-balance accounts, high-interest options & digital-first banks compared for you.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">Zero Balance</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">High Interest</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/15 rounded-full">Digital</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all">
                  Explore Accounts <ArrowRight size={15} />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* POPULAR TOOLS */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-brand-900">Financial Calculators</h2>
              <p className="text-sm text-gray-500 mt-1">Plan loans, investments, taxes & more</p>
            </div>
            <Link to="/calculators" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition">
              All calculators <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTools.map((tool) => (
              <Link
                key={tool.link}
                to={tool.link}
                className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-brand-200 hover:shadow-md transition-all"
              >
                <div className={`w-11 h-11 ${tool.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  <tool.icon size={20} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-brand-900 group-hover:text-brand-600 transition">{tool.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>

          <div className="sm:hidden mt-4 text-center">
            <Link to="/calculators" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all calculators <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center text-brand-900 mb-8">Trusted by thousands of users across India</h2>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck, title: "RBI Verified Data", desc: "All IFSC codes sourced from RBI's official database, updated regularly", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
              { icon: TrendingUp, title: "Always Up-to-Date", desc: "Financial data, rates & card offers refreshed to reflect the latest changes", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
              { icon: Users, title: "Free & Transparent", desc: "No hidden fees, no paywalls. Every tool and comparison is 100% free to use", color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100" },
            ].map((item) => (
              <div key={item.title} className={`flex items-start gap-4 p-5 rounded-xl ${item.bg} border ${item.border}`}>
                <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-brand-900 mb-0.5">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Financial Guides</h2>
            <Link to="/money-guides" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition">
              All guides <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/money-guides/pan-rules-2026" className="card p-5 hover:shadow-md group">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-brand-500" />
                <h3 className="font-semibold group-hover:text-brand-600 transition">New PAN Rules 2026</h3>
              </div>
              <p className="text-sm text-gray-500">
                Latest limits, changes & impact explained
              </p>
            </Link>

            <Link to="/money-guides/pan-limit-2026" className="card p-5 hover:shadow-md group">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-brand-500" />
                <h3 className="font-semibold group-hover:text-brand-600 transition">PAN Limit 2026</h3>
              </div>
              <p className="text-sm text-gray-500">
                Updated transaction limits you must know
              </p>
            </Link>

            <Link to="/money-guides/pan-mandatory-transactions-2026" className="card p-5 hover:shadow-md group">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-brand-500" />
                <h3 className="font-semibold group-hover:text-brand-600 transition">PAN Mandatory Transactions</h3>
              </div>
              <p className="text-sm text-gray-500">
                Where PAN is required in 2026
              </p>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}