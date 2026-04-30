import { Link, useLocation } from 'react-router-dom';
import { calculatorCategories } from '../utils/calculators';
import {
  CreditCard, Search, Landmark, PiggyBank, ChevronDown,
  ArrowRight, BookOpen, Compass, Calculator,
} from 'lucide-react';
import { useState } from 'react';

const quickLinks = [
  { label: 'IFSC Finder',  desc: '1.78L+ branches', path: '/ifsc-finder',  icon: Search,   gradient: 'from-brand-600 to-brand-800' },
  { label: 'Credit Cards', desc: 'Compare & apply',  path: '/credit-cards', icon: CreditCard, gradient: 'from-brand-600 to-brand-800' },
  { label: 'Bank Accounts',desc: 'Savings & current',path: '/accounts',     icon: PiggyBank, gradient: 'from-brand-600 to-brand-800' },
  { label: 'All Banks',    desc: '1,350+ banks',     path: '/ifsc-finder',  icon: Landmark,  gradient: 'from-brand-600 to-brand-800' },
];

const catColors: Record<string, { text: string; bg: string; activeBg: string; border: string }> = {
  blue:   { text: 'text-brand-600', bg: 'bg-brand-50', activeBg: 'bg-brand-600', border: 'border-brand-100' },
  green:  { text: 'text-brand-600', bg: 'bg-brand-50', activeBg: 'bg-brand-600', border: 'border-brand-100' },
  purple: { text: 'text-brand-600', bg: 'bg-brand-50', activeBg: 'bg-brand-600', border: 'border-brand-100' },
  amber:  { text: 'text-brand-600', bg: 'bg-brand-50', activeBg: 'bg-brand-600', border: 'border-brand-100' },
};

export default function ToolsSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const activeCategory = calculatorCategories.findIndex(
    (cat) => cat.items.some((item) => item.path === currentPath)
  );
  const [openCat, setOpenCat] = useState<number>(activeCategory >= 0 ? activeCategory : 0);

  return (
    <aside className="w-full space-y-4">

      {/* ── Explore ── */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-4 py-3 flex items-center gap-2">
          <Compass size={14} className="text-white/70" />
          <h3 className="text-xs font-bold text-white tracking-wide">Explore</h3>
        </div>
        <div className="bg-white p-3 grid grid-cols-2 gap-1.5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`group flex flex-col gap-1 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-br ' + link.gradient + ' text-white shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-600'} />
                <span className={`text-[11px] font-semibold leading-tight ${isActive ? 'text-white' : 'text-gray-700'}`}>
                  {link.label}
                </span>
                <span className={`text-[9px] leading-tight ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                  {link.desc}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── All Calculators ── */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator size={14} className="text-white/70" />
            <h3 className="text-xs font-bold text-white tracking-wide">Calculators</h3>
          </div>
          <Link to="/calculators" className="text-[10px] font-medium text-white/50 hover:text-white/80 transition">
            View all
          </Link>
        </div>

        <div className="bg-white">
          {calculatorCategories.map((cat, catIdx) => {
            const CatIcon = cat.categoryIcon;
            const colors = catColors[cat.color] || catColors.blue;
            const isOpen = openCat === catIdx;
            const hasActive = cat.items.some((item) => item.path === currentPath);

            return (
              <div key={cat.title} className="border-t border-gray-100 first:border-t-0">
                <button
                  onClick={() => setOpenCat(isOpen ? -1 : catIdx)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${
                    hasActive ? colors.bg : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    hasActive ? colors.activeBg : colors.bg
                  }`}>
                    <CatIcon size={13} className={hasActive ? 'text-white' : colors.text} />
                  </div>
                  <span className={`flex-1 text-xs font-semibold ${hasActive ? colors.text : 'text-gray-700'}`}>
                    {cat.title}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="pb-2 px-2">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const active = currentPath === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                            active
                              ? `${colors.activeBg} text-white font-semibold shadow-sm`
                              : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                          }`}
                        >
                          <Icon size={13} className={active ? 'text-white/80' : 'text-gray-400'} />
                          <span className="flex-1">{item.label}</span>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Financial Guides ── */}
      <div className="rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 p-4 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/[0.04] rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/[0.03] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-accent-400" />
            <h3 className="text-xs font-bold text-white tracking-wide">Financial Guides</h3>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mb-3">
            PAN rules, tax-saving strategies, and smart money habits.
          </p>
          <Link
            to="/money-guides"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg transition"
          >
            Read Guides <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* ── Quick Search ── */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-4 py-3 flex items-center gap-2">
          <Search size={14} className="text-white/70" />
          <h3 className="text-xs font-bold text-white tracking-wide">Quick Search</h3>
        </div>
        <div className="bg-white p-3 space-y-1.5">
          {[
            { label: 'What is EMI?',                    path: '/calculators/emi' },
            { label: 'Best credit card for cashback',   path: '/credit-cards?category=Cashback' },
            { label: 'How to find IFSC code',           path: '/ifsc-finder' },
          ].map((q) => (
            <Link
              key={q.label}
              to={q.path}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition group"
            >
              <ArrowRight size={11} className="text-gray-300 group-hover:text-brand-500 transition" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}
