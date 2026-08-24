import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { calculatorCategories } from '../utils/calculators';
import { useTheme } from '../hooks/useTheme';
import {
  Building2, MapPin, Globe, CreditCard, SlidersHorizontal,
  Percent, PiggyBank as PiggyBankIcon, ArrowLeftRight, Calendar, Calculator,
  Coins, BookOpen, Sun, Moon, ChevronDown,
} from 'lucide-react';

type IconColor = 'mint' | 'gold' | 'acc' | 'coral' | 'violet' | 'cyan';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  badge?: string;
  color: IconColor;
}

const ICON_COLOR_CLS: Record<IconColor, string> = {
  mint:   'bg-mint/10 text-mint',
  gold:   'bg-gold/10 text-gold',
  acc:    'bg-acc-deep text-acc',
  coral:  'bg-coral/10 text-coral',
  violet: 'bg-violet-500/10 text-violet',
  cyan:   'bg-cyan/10 text-cyan',
};

const directoryMenu: NavItem[] = [
  { label: 'IFSC Code Finder',   path: '/ifsc-finder',       icon: Building2, badge: '1.78L+', desc: 'RBI verified branch codes, MICR & transfer status', color: 'mint' },
  { label: 'PIN Code Directory', path: '/pin-codes',         icon: MapPin,    badge: '19.3k+', desc: 'India Post offices, delivery status & taluks', color: 'cyan' },
  { label: 'SWIFT Code Lookup',  path: '/swift-code-lookup', icon: Globe,     desc: 'International wire transfer codes for remittances', color: 'acc' },
];

const ratesMenu: NavItem[] = [
  { label: 'FD Interest Rates',     path: '/fd-rates',           icon: Percent,        desc: 'Compare fixed deposit rates across banks', color: 'gold' },
  { label: 'Savings Account Rates', path: '/savings-rates',      icon: PiggyBankIcon,  desc: 'High-yield & zero-balance accounts', color: 'acc' },
  { label: 'Currency Converter',    path: '/currency-converter', icon: ArrowLeftRight, desc: 'Live USD, EUR, AED, GBP rates to INR', color: 'acc' },
  { label: 'Bank Holidays',         path: '/bank-holidays',      icon: Calendar,       desc: 'State-wise RBI bank holiday calendar', color: 'coral' },
];

const calcMenu: NavItem[] = [
  { label: 'Financial Calculators', path: '/calculators', icon: Calculator, badge: '30+', desc: 'Home Loan, SIP, Old vs New Tax, EPF, HRA & Salary', color: 'mint' },
  ...ratesMenu,
];

const cardsMenu: NavItem[] = [
  { label: 'Credit Cards Hub',      path: '/credit-cards',                    icon: CreditCard,       badge: '50+ Cards', desc: 'Compare 50+ cards: Lifetime free, cashback & rewards', color: 'mint' },
  { label: 'Card Reward Optimizer', path: '/credit-cards/reward-optimizer',   icon: SlidersHorizontal, desc: 'Maximize cashback & points per merchant spend', color: 'gold' },
];

const knowledgeMenu: NavItem[] = [
  { label: 'Gold & Silver Rates', path: '/gold-rate-today', icon: Coins,    badge: 'Live', desc: 'Live 24K, 22K (916) & 18K city-wise bullion rates', color: 'gold' },
  { label: 'Financial Guides',    path: '/money-guides',    icon: BookOpen, desc: 'Expert articles on banking, tax & investments', color: 'mint' },
];

function isItemActive(path: string, pathname: string, search: string) {
  const [iPath, iQuery] = path.split('?');
  return iQuery ? pathname === iPath && search.includes(iQuery) : pathname === iPath && !search;
}

function DropdownItemRow({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        active ? 'bg-acc-deep border border-acc/25' : 'hover:bg-surface border border-transparent'
      }`}
    >
      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${ICON_COLOR_CLS[item.color]}`}>
        <item.icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-[13px] font-bold truncate ${active ? 'text-acc' : 'text-ink'}`}>{item.label}</span>
          {item.badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gold/10 text-gold border border-gold/25 shrink-0">
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-faint leading-snug mt-0.5 line-clamp-1">{item.desc}</p>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [calcOpen,      setCalcOpen]      = useState(false);
  const [cardsOpen,     setCardsOpen]     = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [mExpanded,     setMExpanded]     = useState<string | null>(null);

  const directoryRef = useRef<HTMLDivElement>(null);
  const calcRef       = useRef<HTMLDivElement>(null);
  const cardsRef      = useRef<HTMLDivElement>(null);
  const knowledgeRef  = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const closeAll = () => { setDirectoryOpen(false); setCalcOpen(false); setCardsOpen(false); setKnowledgeOpen(false); };

  useEffect(() => {
    setMenuOpen(false);
    closeAll();
  }, [location]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (directoryRef.current && !directoryRef.current.contains(e.target as Node)) setDirectoryOpen(false);
      if (calcRef.current      && !calcRef.current.contains(e.target as Node))      setCalcOpen(false);
      if (cardsRef.current     && !cardsRef.current.contains(e.target as Node))     setCardsOpen(false);
      if (knowledgeRef.current && !knowledgeRef.current.contains(e.target as Node)) setKnowledgeOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const linkCls = (active = false) =>
    `px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
      active ? 'text-acc bg-acc-deep' : 'text-body hover:text-ink hover:bg-surface'
    }`;

  const isDirectoryActive = directoryMenu.some(i => location.pathname === i.path.split('?')[0]);
  const isCalcActive      = location.pathname.startsWith('/calculators') || ratesMenu.some(i => location.pathname === i.path);
  const isCardsActive     = location.pathname.startsWith('/credit-cards');
  const isKnowledgeActive = knowledgeMenu.some(i => location.pathname.startsWith(i.path));

  const DropdownHeader = ({ label }: { label: string }) => (
    <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-line">
      <span className="text-[10px] font-bold uppercase tracking-wider text-faint">{label}</span>
      <span className="text-[10px] font-semibold text-acc">rupeepedia directory</span>
    </div>
  );

  return (
    <nav className="bg-bg backdrop-blur-md border-b border-line sticky top-0 z-[999]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-acc flex items-center justify-center text-white font-black text-xl select-none">
              ₹
            </div>
            <span className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-2xl tracking-tight text-ink flex items-center gap-2">
                <span>Rupee<span className="text-acc">pedia</span></span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-acc-deep text-acc tracking-wide">.IN</span>
              </span>
              <span className="hidden 2xl:block text-[10px] text-faint font-medium tracking-wide mt-0.5">
                India&apos;s Financial Directory &amp; Hub
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-0.5 flex-nowrap whitespace-nowrap min-w-0">
            <Link to="/" className={linkCls(location.pathname === '/')}>Home</Link>

            {/* Banking & Postal Codes */}
            <div className="relative" ref={directoryRef} onMouseEnter={() => setDirectoryOpen(true)} onMouseLeave={() => setDirectoryOpen(false)}>
              <button
                onClick={() => setDirectoryOpen(o => !o)}
                className={`flex items-center gap-1.5 ${linkCls(directoryOpen || isDirectoryActive)}`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Banking &amp; Postal
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${directoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {directoryOpen && (
                <div className="absolute top-full left-0 pt-2 z-[999]" style={{ width: '320px' }}>
                  <div className="bg-surface-2 rounded-2xl shadow-2xl border border-line-2 p-3">
                    <DropdownHeader label="Banking & Postal Codes" />
                    <div className="flex flex-col gap-0.5">
                      {directoryMenu.map(item => (
                        <DropdownItemRow key={item.path} item={item} active={isItemActive(item.path, location.pathname, location.search)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculators & Rates */}
            <div className="relative" ref={calcRef} onMouseEnter={() => setCalcOpen(true)} onMouseLeave={() => setCalcOpen(false)}>
              <button
                onClick={() => setCalcOpen(o => !o)}
                className={`flex items-center gap-1.5 ${linkCls(calcOpen || isCalcActive)}`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Calculators &amp; Rates
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${calcOpen ? 'rotate-180' : ''}`} />
              </button>

              {calcOpen && (
                <div className="absolute top-full left-0 pt-2 z-[999]" style={{ width: '340px' }}>
                  <div className="bg-surface-2 rounded-2xl shadow-2xl border border-line-2 p-3">
                    <DropdownHeader label="Calculators & Rates" />
                    <div className="flex flex-col gap-0.5">
                      {calcMenu.map(item => (
                        <DropdownItemRow
                          key={item.path}
                          item={item}
                          active={isItemActive(item.path, location.pathname, location.search)}
                          onClick={() => setCalcOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cards & Credit */}
            <div className="relative" ref={cardsRef} onMouseEnter={() => setCardsOpen(true)} onMouseLeave={() => setCardsOpen(false)}>
              <button
                onClick={() => setCardsOpen(o => !o)}
                className={`flex items-center gap-1.5 ${linkCls(cardsOpen || isCardsActive)}`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Cards &amp; Credit
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${cardsOpen ? 'rotate-180' : ''}`} />
              </button>
              {cardsOpen && (
                <div className="absolute top-full left-0 pt-2 z-[999]" style={{ width: '340px' }}>
                  <div className="bg-surface-2 rounded-2xl shadow-2xl border border-line-2 p-3">
                    <DropdownHeader label="Cards & Credit" />
                    <div className="flex flex-col gap-0.5">
                      {cardsMenu.map(item => (
                        <DropdownItemRow key={item.path} item={item} active={isItemActive(item.path, location.pathname, location.search)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bullion & Knowledge */}
            <div className="relative" ref={knowledgeRef} onMouseEnter={() => setKnowledgeOpen(true)} onMouseLeave={() => setKnowledgeOpen(false)}>
              <button
                onClick={() => setKnowledgeOpen(o => !o)}
                className={`flex items-center gap-1.5 ${linkCls(knowledgeOpen || isKnowledgeActive)}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Bullion &amp; Knowledge
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${knowledgeOpen ? 'rotate-180' : ''}`} />
              </button>
              {knowledgeOpen && (
                <div className="absolute top-full right-0 pt-2 z-[999]" style={{ width: '300px' }}>
                  <div className="bg-surface-2 rounded-2xl shadow-2xl border border-line-2 p-3">
                    <DropdownHeader label="Bullion & Knowledge" />
                    <div className="flex flex-col gap-0.5">
                      {knowledgeMenu.map(item => (
                        <DropdownItemRow key={item.path} item={item} active={location.pathname.startsWith(item.path)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle light or dark theme"
              title="Toggle theme"
              className="ml-1 p-2 rounded-lg text-body hover:text-ink hover:bg-surface transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="xl:hidden p-2 rounded-lg text-body hover:bg-surface"
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
        <div className="xl:hidden border-t border-line bg-bg px-4 py-3 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Link to="/" className="px-3 py-2 rounded-lg text-sm text-body hover:bg-surface hover:text-ink">Home</Link>
          <Link to="/ifsc-finder" className="px-3 py-2 rounded-lg text-sm text-body hover:bg-surface hover:text-ink">IFSC Finder</Link>

          {([
            { id: 'directory',  label: 'Banking & Postal Codes', icon: Building2, active: isDirectoryActive, items: directoryMenu },
            { id: 'cards',      label: 'Cards & Credit',         icon: CreditCard, active: isCardsActive,     items: cardsMenu },
            { id: 'knowledge',  label: 'Bullion & Knowledge',    icon: BookOpen,  active: isKnowledgeActive, items: knowledgeMenu },
          ] as const).map(cat => {
            const expanded = mExpanded === cat.id;
            return (
              <div key={cat.id} className="border border-line rounded-2xl overflow-hidden my-1">
                <button
                  onClick={() => setMExpanded(expanded ? null : cat.id)}
                  className={`w-full flex items-center justify-between p-3 text-left font-bold text-xs ${
                    cat.active ? 'bg-acc-deep text-acc' : 'bg-surface-2 text-ink'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <cat.icon className={`w-4 h-4 ${cat.active ? 'text-acc' : 'text-muted'}`} />
                    {cat.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="p-2 space-y-0.5 bg-bg border-t border-line">
                    {cat.items.map(item => (
                      <DropdownItemRow key={item.path} item={item} active={isItemActive(item.path, location.pathname, location.search)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border border-line rounded-2xl overflow-hidden my-1">
            <button
              onClick={() => setMExpanded(mExpanded === 'calc' ? null : 'calc')}
              className={`w-full flex items-center justify-between p-3 text-left font-bold text-xs ${
                isCalcActive ? 'bg-acc-deep text-acc' : 'bg-surface-2 text-ink'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calculator className={`w-4 h-4 ${isCalcActive ? 'text-acc' : 'text-muted'}`} />
                Calculators &amp; Rates
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mExpanded === 'calc' ? 'rotate-180' : ''}`} />
            </button>
            {mExpanded === 'calc' && (
              <div className="p-3 space-y-3 bg-bg border-t border-line">
                {calculatorCategories.map((group) => {
                  const CatIcon = group.categoryIcon;
                  return (
                    <div key={group.title}>
                      <p className="text-xs font-bold text-acc uppercase tracking-wide mb-1.5 px-2 flex items-center gap-1.5">
                        <CatIcon className="w-3.5 h-3.5" /> {group.title}
                      </p>
                      {group.items.map((item) => (
                        <Link key={item.path} to={item.path} className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-body hover:text-ink rounded-lg hover:bg-surface">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                            <item.icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  );
                })}
                <div>
                  <p className="text-xs font-bold text-cyan uppercase tracking-wide mb-1.5 px-2 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" /> Rates &amp; Tools
                  </p>
                  {ratesMenu.map(item => (
                    <Link key={item.path} to={item.path} className="flex items-center gap-2 px-2 py-1.5 text-sm text-body hover:text-ink rounded-lg hover:bg-surface">
                      <item.icon className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Link to="/calculators" className="px-2 py-1.5 text-sm font-semibold text-acc hover:underline block">View all calculators →</Link>
              </div>
            )}
          </div>

          <Link to="/loans" className="px-3 py-2 rounded-lg text-sm text-body hover:bg-surface hover:text-ink">Loans</Link>
          <Link to="/accounts" className="px-3 py-2 rounded-lg text-sm text-body hover:bg-surface hover:text-ink">Bank Accounts</Link>
          <Link to="/contact" className="px-3 py-2 rounded-lg text-sm text-body hover:bg-surface hover:text-ink">Contact</Link>
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-body hover:bg-surface hover:text-ink text-left w-full"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      )}
    </nav>
  );
}
