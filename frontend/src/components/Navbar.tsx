import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const calculatorMenu = [
  {
    category: 'Loan EMI Calculators',
    icon: '🏦',
    items: [
      { label: 'Home Loan EMI',          path: '/calculators/home-loan-emi' },
      { label: 'Personal Loan EMI',      path: '/calculators/personal-loan-emi' },
      { label: 'Car Loan EMI',           path: '/calculators/car-loan-emi' },
      { label: 'Education Loan EMI',     path: '/calculators/education-loan-emi' },
      { label: 'Business Loan EMI',      path: '/calculators/business-loan-emi' },
      { label: 'Loan Against Property',  path: '/calculators/lap-emi' },
     ],
  },
  {
    category: 'Investment Calculators',
    icon: '📈',
    items: [
      { label: 'SIP Calculator',         path: '/calculators/sip' },
      { label: 'Lumpsum Calculator',     path: '/calculators/lumpsum' },
      { label: 'SWP Calculator',         path: '/calculators/swp' },
      { label: 'Step-Up SIP',            path: '/calculators/step-up-sip' },
      { label: 'Mutual Fund Returns',    path: '/calculators/mutual-fund' },
      { label: 'CAGR Calculator',        path: '/calculators/cagr' },
      { label: 'XIRR Calculator',        path: '/calculators/xirr' },
      { label: 'FD Calculator',          path: '/calculators/fd' },
      { label: 'RD Calculator',          path: '/calculators/rd' },
      { label: 'PPF Calculator',         path: '/calculators/ppf' },
      { label: 'NPS Calculator',         path: '/calculators/nps' },
    ],
  },
  {
    category: 'Loan Eligibility Calculators',
    icon: '✅',
    items: [
      { label: 'Home Loan Eligibility', path: '/calculators/home-loan-eligibility' },
      { label: 'Personal Loan Eligibility', path: '/calculators/personal-loan-eligibility' },
      { label: 'Home Prepayment Calculator', path: '/calculators/home-prepayment' },
      { label: 'Personal Prepayment', path: '/calculators/personal-prepayment' },
      { label: 'GST Calculator', path: '/calculators/gst' },
    ],
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const calcRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setCalcOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calcRef.current && !calcRef.current.contains(e.target as Node)) {
        setCalcOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-[999] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white font-bold text-sm px-2.5 py-1 rounded-lg">₹</div>
            <span className="font-bold text-lg text-gray-900">Rupee<span className="text-blue-600">Pedia</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/ifsc-finder"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              IFSC Finder
            </Link>

            {/* Calculators Mega Menu */}
            <div className="relative" ref={calcRef}>
              <button
                onClick={() => setCalcOpen(!calcOpen)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  calcOpen
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Calculators
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${calcOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega Dropdown */}
              {calcOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 grid grid-cols-3 gap-6 z-[999]" style={{ width: 'min(720px, 90vw)' }}>
                  {calculatorMenu.map((group) => (
                    <div key={group.category}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">{group.icon}</span>
                        <span className="text-xs text-blue-600 tracking-wide font-bold">
                          {group.category}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {group.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Footer strip */}
                  <div className="col-span-3 border-t border-gray-100 pt-3 mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Free financial calculators for every need</span>
                    <Link
                      to="/calculators"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View all calculators →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
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
          <Link to="/" className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Home</Link>
          <Link to="/ifsc-finder" className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">IFSC Finder</Link>

          {/* Mobile Calculators accordion */}
          <button
            onClick={() => setCalcOpen(!calcOpen)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-left"
          >
            <span>Calculators</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${calcOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {calcOpen && (
            <div className="pl-3 flex flex-col gap-3 py-2">
              {calculatorMenu.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5 px-2">
                    {group.icon} {group.category}
                  </p>
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-2 py-1.5 text-sm text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}

          <Link to="/about" className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">About</Link>
        </div>
      )}
    </nav>
  );
}