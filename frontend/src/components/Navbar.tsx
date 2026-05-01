import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { calculatorCategories } from '../utils/calculators';
import {
  CreditCard, Wallet, Plane, Gift, Star,
} from 'lucide-react';

const productsMenu = [
  {
    title: 'Credit Cards',
    icon: CreditCard,
    items: [
      { label: 'Best Credit Cards',   path: '/credit-cards',                        icon: Star },
      { label: 'Cashback Cards',       path: '/credit-cards?category=Cashback',      icon: Wallet },
      { label: 'Rewards Cards',        path: '/credit-cards?category=Rewards',       icon: Gift },
      { label: 'Travel Cards',         path: '/credit-cards?category=Travel',        icon: Plane },
      { label: 'Lifetime Free Cards',  path: '/credit-cards?category=Lifetime Free', icon: CreditCard },
    ],
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);
  const calcRef = useRef<HTMLDivElement>(null);
  const prodRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setCalcOpen(false);
    setProdOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calcRef.current && !calcRef.current.contains(e.target as Node)) setCalcOpen(false);
      if (prodRef.current && !prodRef.current.contains(e.target as Node)) setProdOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const linkCls = (active = false) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'text-brand-600 bg-brand-50'
        : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
    }`;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[999] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white font-black text-base shadow-md shadow-brand-500/30 select-none">
              ₹
            </div>
            <span className="font-extrabold text-lg tracking-tight text-gray-900">
              Rupee<span className="bg-gradient-to-r from-brand-600 to-pink-500 bg-clip-text text-transparent">pedia</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkCls(location.pathname === '/')}>Home</Link>

            {/* Products Mega Menu */}
            <div className="relative" ref={prodRef}>
              <button
                onClick={() => { setProdOpen(!prodOpen); setCalcOpen(false); }}
                className={`flex items-center gap-1.5 ${linkCls(prodOpen || location.pathname.startsWith('/credit-cards'))}`}
              >
                Products
                <svg className={`w-3.5 h-3.5 transition-transform ${prodOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {prodOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-[999]" style={{ width: 'min(280px, 90vw)' }}>
                  {productsMenu.map((group) => (
                    <div key={group.title}>
                      <div className="flex items-center gap-2 mb-3">
                        <group.icon className="w-4 h-4 text-brand-600" />
                        <span className="text-xs tracking-wide font-bold text-brand-600">{group.title}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                          const [iPath, iQuery] = item.path.split('?');
                          const active = iQuery
                            ? location.pathname === iPath && location.search.includes(iQuery)
                            : location.pathname === iPath && !location.search;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-lg transition-colors ${
                                active
                                  ? 'text-brand-600 bg-brand-50 font-semibold'
                                  : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                              }`}
                            >
                              <item.icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-brand-500' : 'text-gray-400'}`} />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculators Mega Menu */}
            <div className="relative" ref={calcRef}>
              <button
                onClick={() => { setCalcOpen(!calcOpen); setProdOpen(false); }}
                className={`flex items-center gap-1.5 ${linkCls(calcOpen || location.pathname.startsWith('/calculators'))}`}
              >
                Calculators
                <svg className={`w-3.5 h-3.5 transition-transform ${calcOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {calcOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 grid grid-cols-4 gap-5 z-[999]" style={{ width: 'min(920px, 92vw)' }}>
                  {calculatorCategories.map((group) => {
                    const CatIcon = group.categoryIcon;
                    const catColor: Record<string, string> = {
                      blue: 'text-brand-600', green: 'text-emerald-600',
                      purple: 'text-violet-600', amber: 'text-amber-600',
                    };
                    const cc = catColor[group.color] || 'text-brand-600';
                    return (
                      <div key={group.title}>
                        <Link to="/calculators" onClick={() => setCalcOpen(false)} className="flex items-center gap-2 mb-3 group/cat hover:opacity-75 transition-opacity w-fit">
                          <CatIcon className={`w-4 h-4 ${cc}`} />
                          <span className={`text-xs tracking-wide font-bold ${cc} group-hover/cat:underline underline-offset-2`}>{group.title}</span>
                        </Link>
                        <div className="flex flex-col gap-0.5">
                          {group.items.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-lg transition-colors ${
                                  active
                                    ? 'text-brand-600 bg-brand-50 font-semibold'
                                    : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                                }`}
                              >
                                <item.icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-brand-500' : 'text-gray-400'}`} />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="col-span-4 border-t border-gray-100 pt-3 mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Free financial calculators for every need</span>
                    <Link to="/calculators" className="text-xs font-semibold text-brand-600 hover:underline">View all →</Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/money-guides" className={linkCls(location.pathname.startsWith('/money-guides'))}>Money Guides</Link>
            <Link to="/about" className={linkCls(location.pathname === '/about')}>About</Link>

            {/* CTA */}
            <Link
              to="/ifsc-finder"
              className="ml-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-semibold rounded-full shadow-md shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-px transition-all"
            >
              Find IFSC →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-brand-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link to="/" className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Home</Link>
          <Link to="/ifsc-finder" className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">IFSC Finder</Link>

          <button
            onClick={() => setProdOpen(!prodOpen)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 text-left"
          >
            <span>Products</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${prodOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {prodOpen && (
            <div className="pl-3 flex flex-col gap-3 py-2">
              {productsMenu.map((group) => (
                <div key={group.title}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1.5 px-2 flex items-center gap-1.5 text-brand-600">
                    <group.icon className="w-3.5 h-3.5" /> {group.title}
                  </p>
                  {group.items.map((item) => (
                    <Link key={item.path} to={item.path} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:text-brand-600 rounded-lg hover:bg-brand-50">
                      <item.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setCalcOpen(!calcOpen)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 text-left"
          >
            <span>Calculators</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${calcOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {calcOpen && (
            <div className="pl-3 flex flex-col gap-3 py-2">
              {calculatorCategories.map((group) => {
                const CatIcon = group.categoryIcon;
                return (
                  <div key={group.title}>
                    <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-1.5 px-2 flex items-center gap-1.5">
                      <CatIcon className="w-3.5 h-3.5" /> {group.title}
                    </p>
                    {group.items.map((item) => (
                      <Link key={item.path} to={item.path} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:text-brand-600 rounded-lg hover:bg-brand-50">
                        <item.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <Link to="/money-guides" className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Money Guides</Link>
          <Link to="/about" className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">About</Link>
          <Link to="/ifsc-finder" className="mt-1 mx-1 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-semibold rounded-xl text-center">
            Find IFSC →
          </Link>
        </div>
      )}
    </nav>
  );
}
