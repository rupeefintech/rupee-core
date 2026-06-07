import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ChevronUp, ChevronRight, Clock, ExternalLink, Search,
  ShieldCheck, RefreshCw, PiggyBank, Zap, Users,
  Building2, CreditCard, TrendingUp, ArrowUpDown,
  Info, Smartphone, BriefcaseBusiness, Wallet,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../utils/api';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Tier {
  id: number; label: string | null; months: number | null;
  rate: number; seniorRate: number | null;
  minAmount: number | null; maxAmount: number | null;
  effectiveFrom: string; sourceUrl: string | null; notes: string | null;
}
interface BankRates {
  bank: { id: number; name: string; slug: string | null; logoUrl: string | null; shortName: string | null; bankType: string | null };
  tenures: Tier[];
  bestRate: number;
  lastVerified: string;
}

// ── Static fallback ────────────────────────────────────────────────────────────
const STATIC_SAVINGS: { bank: string; sector: string; tiers: { label: string; rate: number; minBalance: string; zeroBalance?: boolean }[] }[] = [
  { bank: 'Utkarsh Small Finance Bank', sector: 'Small Finance Bank', tiers: [
    { label: 'Up to ₹5 Lakh',  rate: 5.50, minBalance: '₹2,500' },
    { label: 'Above ₹5 Lakh',  rate: 8.00, minBalance: '₹2,500' },
    { label: 'Above ₹50 Lakh', rate: 9.00, minBalance: '₹2,500' },
  ]},
  { bank: 'ESAF Small Finance Bank', sector: 'Small Finance Bank', tiers: [
    { label: 'Up to ₹1 Lakh',  rate: 6.00, minBalance: '₹1,000' },
    { label: 'Above ₹1 Lakh',  rate: 6.50, minBalance: '₹1,000' },
  ]},
  { bank: 'IDFC FIRST Bank', sector: 'Private Sector', tiers: [
    { label: 'Up to ₹1 Lakh',  rate: 3.00, minBalance: '₹10,000' },
    { label: '₹1L – ₹5L',      rate: 4.00, minBalance: '₹10,000' },
    { label: 'Above ₹5 Lakh',  rate: 5.00, minBalance: '₹10,000' },
    { label: 'Zero Balance',    rate: 3.00, minBalance: '₹0', zeroBalance: true },
  ]},
  { bank: 'IndusInd Bank', sector: 'Private Sector', tiers: [
    { label: 'Up to ₹1 Lakh',  rate: 3.50, minBalance: '₹10,000' },
    { label: '₹1L – ₹10L',     rate: 4.50, minBalance: '₹10,000' },
    { label: 'Above ₹10 Lakh', rate: 5.50, minBalance: '₹10,000' },
  ]},
  { bank: 'Kotak Mahindra Bank', sector: 'Private Sector', tiers: [
    { label: 'Up to ₹1 Lakh',  rate: 3.50, minBalance: '₹10,000' },
    { label: 'Above ₹1 Lakh',  rate: 4.00, minBalance: '₹10,000' },
  ]},
  { bank: 'Yes Bank', sector: 'Private Sector', tiers: [
    { label: 'Up to ₹1 Lakh',  rate: 3.25, minBalance: '₹10,000' },
    { label: '₹1L – ₹10L',     rate: 4.00, minBalance: '₹10,000' },
    { label: 'Above ₹10 Lakh', rate: 5.00, minBalance: '₹10,000' },
  ]},
  { bank: 'HDFC Bank', sector: 'Private Sector', tiers: [
    { label: 'Up to ₹50 Lakh', rate: 3.00, minBalance: '₹10,000' },
    { label: 'Above ₹50 Lakh', rate: 3.50, minBalance: '₹10,000' },
    { label: 'Zero Balance',    rate: 3.00, minBalance: '₹0', zeroBalance: true },
  ]},
  { bank: 'ICICI Bank', sector: 'Private Sector', tiers: [
    { label: 'Up to ₹50 Lakh', rate: 3.00, minBalance: '₹10,000' },
    { label: 'Above ₹50 Lakh', rate: 3.50, minBalance: '₹10,000' },
    { label: 'Zero Balance',    rate: 3.00, minBalance: '₹0', zeroBalance: true },
  ]},
  { bank: 'Axis Bank', sector: 'Private Sector', tiers: [
    { label: 'All Balances',    rate: 3.00, minBalance: '₹15,000' },
    { label: 'Zero Balance',    rate: 3.00, minBalance: '₹0', zeroBalance: true },
  ]},
  { bank: 'State Bank of India', sector: 'Public Sector', tiers: [
    { label: 'Up to ₹1 Lakh',  rate: 2.70, minBalance: '₹3,000' },
    { label: 'Above ₹1 Lakh',  rate: 3.00, minBalance: '₹3,000' },
    { label: 'Zero Balance',    rate: 2.70, minBalance: '₹0', zeroBalance: true },
  ]},
  { bank: 'Punjab National Bank', sector: 'Public Sector', tiers: [
    { label: 'All Balances',    rate: 2.70, minBalance: '₹1,000' },
  ]},
  { bank: 'Bank of Baroda', sector: 'Public Sector', tiers: [
    { label: 'All Balances',    rate: 2.75, minBalance: '₹1,000' },
    { label: 'Zero Balance',    rate: 2.75, minBalance: '₹0', zeroBalance: true },
  ]},
];

// ── Top Picks ──────────────────────────────────────────────────────────────────
const TOP_PICKS = [
  {
    category: 'Highest Rate',
    bank: 'Utkarsh Small Finance Bank',
    rate: '9% p.a.',
    rateNote: 'on balances above ₹50 Lakh',
    badge: '🏆 Best Rate',
    feature: 'Fully licensed, DICGC insured up to ₹5 lakh',
    borderCls: 'border-t-4 border-t-emerald-500',
    rateCls: 'text-emerald-700',
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    category: 'Best Private Bank',
    bank: 'IDFC FIRST Bank',
    rate: '7% p.a.',
    rateNote: 'on balances above ₹5 Lakh',
    badge: '⭐ Top Private',
    feature: 'Zero balance option + high-yield tiers for all balances',
    borderCls: 'border-t-4 border-t-brand-500',
    rateCls: 'text-brand-700',
    badgeCls: 'bg-brand-50 text-brand-700 border-brand-200',
  },
  {
    category: 'Best Zero Balance',
    bank: 'State Bank of India',
    rate: '2.7–3%',
    rateNote: 'BSBDA · no minimum balance',
    badge: '🏦 Most Accessible',
    feature: '22,000+ branches · zero penalty · RBI-mandated BSBDA',
    borderCls: 'border-t-4 border-t-blue-500',
    rateCls: 'text-blue-700',
    badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    category: 'Best Digital Account',
    bank: 'Fi Money (Federal Bank)',
    rate: '3.5% p.a.',
    rateNote: 'open in 10 min · no branch needed',
    badge: '📱 Instant Open',
    feature: 'Video KYC only · zero balance · smart savings tools',
    borderCls: 'border-t-4 border-t-violet-500',
    rateCls: 'text-violet-700',
    badgeCls: 'bg-violet-50 text-violet-700 border-violet-200',
  },
];

// ── Scenarios ──────────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    Icon: Wallet,
    title: 'Building an Emergency Fund',
    need: 'Instant access with no minimum balance penalty',
    pick: 'Zero Balance (BSBDA)',
    examples: 'SBI BSBDA · HDFC Basic Savings · Kotak 811',
    bgCls: 'bg-green-50 border-green-200',
    iconCls: 'text-green-600 bg-green-100',
    pickCls: 'text-green-700 font-semibold',
  },
  {
    Icon: BriefcaseBusiness,
    title: 'Salary Account',
    need: 'No min balance as long as salary is credited monthly',
    pick: 'Private Bank Salary Account',
    examples: 'HDFC Salary · ICICI Corporate · Axis Prime',
    bgCls: 'bg-brand-50 border-brand-200',
    iconCls: 'text-brand-600 bg-brand-100',
    pickCls: 'text-brand-700 font-semibold',
  },
  {
    Icon: TrendingUp,
    title: 'Maximizing Returns',
    need: 'Highest possible rate on surplus parked funds',
    pick: 'Small Finance Bank',
    examples: 'Utkarsh SFB · ESAF SFB · Jana SFB · AU SFB',
    bgCls: 'bg-emerald-50 border-emerald-200',
    iconCls: 'text-emerald-600 bg-emerald-100',
    pickCls: 'text-emerald-700 font-semibold',
  },
  {
    Icon: Smartphone,
    title: 'Digital-First Banking',
    need: 'Open from phone, no branch visit, modern UX',
    pick: 'Neo / Digital Bank',
    examples: 'Fi Money · Jupiter · Niyo · Freo (all DICGC-insured)',
    bgCls: 'bg-violet-50 border-violet-200',
    iconCls: 'text-violet-600 bg-violet-100',
    pickCls: 'text-violet-700 font-semibold',
  },
];

// ── Opening steps ──────────────────────────────────────────────────────────────
const OPEN_STEPS = [
  {
    n: '1',
    title: 'Compare & choose',
    desc: 'Use the rate table below. Best returns → Small Finance Bank. Emergency buffer → zero balance. Salary → private bank salary account.',
    tag: '5 min research',
  },
  {
    n: '2',
    title: 'Submit KYC',
    desc: 'Online (recommended): Aadhaar OTP + PAN + selfie + 2-min video KYC → account number in minutes. Offline: visit any branch with originals.',
    tag: 'Aadhaar + PAN',
  },
  {
    n: '3',
    title: 'Fund & activate',
    desc: 'Zero balance accounts: start at ₹0. Regular accounts: transfer the minimum balance (₹1k–₹25k depending on bank and city). You\'re live.',
    tag: 'Instant activation',
  },
];

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCOUNT_TYPES = [
  { value: 'all',  label: 'All Accounts', Icon: PiggyBank },
  { value: 'zero', label: 'Zero Balance', Icon: Zap       },
];
const BANK_TYPES = ['All', 'Public Sector', 'Private Sector', 'Small Finance Bank', 'Foreign Bank', 'Payments Bank'];
const SECTOR_ORDER = ['Small Finance Bank', 'Private Sector', 'Public Sector', 'Foreign Bank', 'Payments Bank'];

const VS_ROWS = [
  { f: 'Returns',       s: '2.7% – 9%',          fd: '6% – 9.5%',         better: 'fd'  },
  { f: 'Liquidity',     s: 'Instant withdrawal',  fd: 'Lock-in period',    better: 'sa'  },
  { f: 'Min Amount',    s: '₹0 (zero balance)',   fd: '₹1,000+',           better: 'sa'  },
  { f: 'Rate Type',     s: 'Variable',            fd: 'Fixed at booking',  better: 'fd'  },
  { f: 'Tax Deduction', s: '80TTA up to ₹10k',   fd: '80TTB (seniors)',   better: null  },
  { f: 'DICGC Cover',   s: 'Up to ₹5 lakh',      fd: 'Up to ₹5 lakh',    better: null  },
];

const FAQ_GROUPS = [
  { title: 'Basics', faqs: [
    { q: 'Which bank has the highest savings account interest rate in India 2026?', a: 'Small Finance Banks lead — Utkarsh SFB (up to 9%), ESAF SFB (6.5%), Jana SFB (5.5%). Among large private banks, IDFC FIRST pays up to 7% on high balances; IndusInd pays up to 5.5%. SBI and other public sector banks pay 2.7–3%. Rates change frequently — always confirm before opening.' },
    { q: 'How is savings account interest calculated?', a: "Since RBI's 2010 mandate: interest = daily closing balance × rate / 365, summed and credited quarterly (March, June, September, December). So ₹1 lakh at 4% earns roughly ₹274 per quarter. Maintaining a higher daily balance maximises earnings." },
    { q: 'Is savings account interest taxable?', a: 'Yes. Under Section 80TTA, individuals below 60 can deduct up to ₹10,000/year of savings interest. Senior citizens (60+) get Section 80TTB — up to ₹50,000 covering both savings and FD interest. Interest above the deduction is taxed at your slab rate.' },
    { q: 'What is a zero balance savings account?', a: 'A Basic Savings Bank Deposit Account (BSBDA) — no minimum balance required, no penalty for keeping ₹0. RBI mandates every bank offer at least one. Transaction limits apply (typically 4 free withdrawals/month). Interest is same as regular accounts.' },
    { q: 'What documents are needed to open a savings account?', a: 'Standard KYC: Aadhaar + PAN (mandatory), one recent photograph. Address proof if Aadhaar address differs from current. For digital accounts (Fi, Jupiter, Niyo): only Aadhaar + PAN + selfie via video KYC — open in minutes from your phone.' },
  ]},
  { title: 'Zero Balance & Digital Accounts', faqs: [
    { q: 'Can I open a zero balance account at any bank?', a: 'Yes. RBI mandates every scheduled commercial bank to offer a BSBDA (zero balance account). Public sector banks (SBI, PNB, Bank of Baroda) are easiest to open with minimal documentation. Private banks also offer them — HDFC BSBDA, ICICI Basic Savings, Axis Basic Savings are popular options.' },
    { q: 'What is the difference between BSBDA and a regular savings account?', a: 'BSBDA: zero minimum balance, limited to 4 free withdrawals/month, basic debit card (no international). Regular savings: minimum balance ₹500–₹25,000 (location-dependent), unlimited transactions, full debit card features, premium services. If you need minimal banking with no penalties, BSBDA is ideal.' },
    { q: 'What is a digital savings account?', a: 'Open entirely via mobile app with video KYC — no branch visit. Examples: Fi Money (Federal Bank), Jupiter (Federal Bank), Niyo (SBM/DCB), Freo (SBM). Benefits: instant account number, zero minimum balance, higher interest (3.5–7%), better expense tracking. The underlying bank is always RBI-licensed and DICGC-insured.' },
  ]},
  { title: 'Savings vs Fixed Deposit', faqs: [
    { q: 'Should I put money in savings account or FD?', a: "Savings for: emergency fund (instant access), regular salary/income parking, amounts you'll need within 1–3 months. FD for: surplus funds you won't touch for 6+ months, when you want a guaranteed rate (7–9.5%), and when you want to lock in rates before a rate cut. Best strategy: keep 3–6 months of expenses in savings; invest the rest in FDs." },
    { q: 'Which gives higher interest — savings or FD?', a: "FDs almost always win for comparable amounts. Example: ₹5 lakh at SBI — savings earns 3% (₹15,000/year), FD earns 6.8–7.1% (₹34,000–₹35,500/year). Exception: Small Finance Bank savings rates (7–9%) can match or beat major bank FD rates. Compare using our FD rates page." },
  ]},
  { title: 'Charges & Regulations', faqs: [
    { q: "What penalty if I don't maintain minimum balance?", a: 'Typically ₹100–₹750 per month depending on shortfall and city tier. Example: HDFC charges ₹150–₹600/month; SBI charges ₹10–₹15/month (much lower). Zero balance accounts have zero penalty. Consistent non-maintenance can lead to account classification as dormant after 12 months.' },
    { q: 'What is DICGC insurance on savings accounts?', a: 'The Deposit Insurance and Credit Guarantee Corporation (DICGC — RBI subsidiary) insures all bank deposits including savings accounts up to ₹5 lakh per depositor per bank (principal + interest combined). This limit was raised from ₹1 lakh in 2020. Spread deposits across banks for coverage on larger amounts.' },
  ]},
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}
function FreshBadge({ lastVerified }: { lastVerified: string }) {
  const d = daysSince(lastVerified);
  const cls = d <= 7 ? 'bg-green-100 text-green-700' : d <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${cls}`}>
      <Clock className="w-2 h-2" />{d === 0 ? 'Today' : `${d}d ago`}
    </span>
  );
}
function isZeroBalance(t: Tier) {
  return t.minAmount === 0 || (t.notes ?? '').toLowerCase().includes('zero');
}
function fmtMinBalance(t: Tier): string {
  if (t.minAmount === 0) return '₹0 (Zero Balance)';
  if (t.minAmount != null) return `₹${t.minAmount.toLocaleString('en-IN')}+`;
  return 'Standard';
}
function rateColor(rate: number) {
  if (rate >= 6) return 'text-emerald-700 font-extrabold';
  if (rate >= 4) return 'text-amber-600 font-bold';
  return 'text-gray-700 font-semibold';
}
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-l-2 transition-all pl-4 ${open ? 'border-brand-400' : 'border-gray-200'}`}>
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex justify-between items-start py-3 text-left text-sm font-semibold text-gray-800 hover:text-brand-700 transition-colors gap-3">
        <span className="leading-snug">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
               : <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />}
      </button>
      {open && <p className="pb-3 text-sm text-gray-500 leading-relaxed">{a}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SavingsRatesPage() {
  const [bankTypeFilter, setBankTypeFilter] = useState('All');
  const [search,         setSearch]         = useState('');
  const [accountFilter,  setAccountFilter]  = useState('all');
  const [showSenior,     setShowSenior]     = useState(false);
  const [expanded,       setExpanded]       = useState<Set<number>>(new Set());
  const [sortDir,        setSortDir]        = useState<'desc' | 'asc'>('desc');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['savings-rates'],
    queryFn:  () => apiClient.get('/rates?type=savings').then(r => r.data),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const banks: BankRates[] = useMemo(() => {
    const raw: BankRates[] = data?.banks ?? [];
    return [...raw].sort((a, b) => sortDir === 'desc' ? b.bestRate - a.bestRate : a.bestRate - b.bestRate);
  }, [data, sortDir]);

  const filtered = useMemo(() => {
    return banks.filter(b => {
      if (bankTypeFilter !== 'All' && b.bank.bankType !== bankTypeFilter) return false;
      if (search && !b.bank.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (accountFilter === 'zero'   && !b.tenures.some(t => isZeroBalance(t))) return false;
      return true;
    });
  }, [banks, bankTypeFilter, search, accountFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, BankRates[]>();
    for (const b of filtered) {
      const k = b.bank.bankType ?? 'Other';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(b);
    }
    const sorted = new Map<string, BankRates[]>();
    for (const k of SECTOR_ORDER) if (map.has(k)) sorted.set(k, map.get(k)!);
    for (const [k, v] of map) if (!sorted.has(k)) sorted.set(k, v);
    return sorted;
  }, [filtered]);

  function toggleExpand(id: number) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const hasDBData = banks.length > 0;
  const bestRate  = hasDBData ? banks[0]?.bestRate : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://rupeepedia.in'               },
        { '@type': 'ListItem', position: 2, name: 'Bank Accounts', item: 'https://rupeepedia.in/accounts'      },
        { '@type': 'ListItem', position: 3, name: 'Savings Rates', item: 'https://rupeepedia.in/savings-rates' },
      ]},
      { '@type': 'FAQPage', mainEntity: FAQ_GROUPS.flatMap(g => g.faqs).map(f => ({
        '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a },
      }))},
    ],
  };

  return (
    <>
      <Helmet>
        <title>Best Savings Account Interest Rates 2026 — Compare All Indian Banks | RupeePedia</title>
        <meta name="description" content={`Compare savings account interest rates from ${hasDBData ? banks.length : '100'}+ Indian banks in 2026. Best savings rate up to ${bestRate ?? 9}% p.a. Zero balance, digital, salary & senior citizen accounts. Manually verified.`} />
        <meta name="keywords" content="best savings account interest rate india 2026, highest savings rate india, zero balance account interest rate, sbi savings account rate, hdfc savings interest rate, small finance bank savings rate, savings vs fd india, savings account comparison india, bsbda zero balance account, salary account interest rate" />
        <link rel="canonical" href="https://rupeepedia.in/savings-rates" />
        <meta property="og:title"   content="Best Savings Account Rates 2026 — Compare All Banks | RupeePedia" />
        <meta property="og:url"     content="https://rupeepedia.in/savings-rates" />
        <meta property="og:type"    content="website" />
        <meta property="og:image"   content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card"   content="summary_large_image" />
        <meta name="twitter:title"  content="Best Savings Account Rates 2026 — Compare All Banks | RupeePedia" />
        <meta name="twitter:description" content={`Compare savings account interest rates from ${hasDBData ? banks.length : '100'}+ Indian banks. Best rate up to ${bestRate ?? 9}% p.a. Zero balance, salary & senior citizen accounts.`} />
        <meta name="twitter:image"  content="https://rupeepedia.in/logo.png" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <nav className="flex items-center gap-1.5 text-brand-300 text-xs mb-5">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <Link to="/accounts" className="hover:text-white transition-colors">Bank Accounts</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-white font-medium">Savings Account Rates</span>
            </nav>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">Best Savings Account Interest Rates 2026</h1>
                <p className="text-brand-200 mt-1 text-sm">Compare savings account rates across all Indian banks</p>
              </div>
            </div>
            <p className="text-brand-200 text-base max-w-2xl mb-8">
              Compare savings account rates across public, private, and small finance banks in India.
              Interest calculated daily on closing balance, credited quarterly. All accounts DICGC-insured.
            </p>

            {!isLoading && !isError && (
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Banks Tracked',    value: hasDBData ? `${banks.length}+` : '100+' },
                  { label: 'Best Rate',         value: `${bestRate ?? 'Up to 9'}% p.a.`        },
                  { label: 'Interest Credited', value: 'Quarterly'                              },
                  { label: 'DICGC Insurance',   value: 'Up to ₹5 Lakh'                         },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2.5">
                    <div className="font-bold text-white text-lg">{s.value}</div>
                    <div className="text-brand-300 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-7 space-y-8">

          {/* ── Account type tabs ────────────────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {ACCOUNT_TYPES.map(f => {
              const { Icon } = f;
              const active = accountFilter === f.value;
              return (
                <button key={f.value} onClick={() => setAccountFilter(f.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border whitespace-nowrap transition-all flex-shrink-0 ${
                    active
                      ? 'bg-brand-700 text-white border-brand-700 shadow-md shadow-brand-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-700'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* ── Top Picks ────────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Top Picks for 2026</h2>
              <span className="text-xs text-gray-400">Updated June 2026</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TOP_PICKS.map(p => (
                <div key={p.bank} className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${p.borderCls} p-5 flex flex-col gap-3 hover:shadow-md transition-shadow`}>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${p.badgeCls}`}>{p.badge}</span>
                    <p className="text-[11px] text-gray-400 mt-2 font-semibold uppercase tracking-wide">{p.category}</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5 leading-snug">{p.bank}</p>
                  </div>
                  <div>
                    <div className={`text-2xl font-extrabold ${p.rateCls}`}>{p.rate}</div>
                    <div className="text-[11px] text-gray-400">{p.rateNote}</div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">{p.feature}</p>
                  <Link to="/ifsc-finder"
                    className={`text-xs font-semibold flex items-center gap-1 ${p.rateCls} hover:underline`}>
                    Find branches <ChevronDown className="w-3 h-3 -rotate-90" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filter bar ───────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search bank…"
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <select value={bankTypeFilter} onChange={e => setBankTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300">
              {BANK_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-gray-200 rounded-xl hover:border-brand-300 transition-colors whitespace-nowrap">
              <input type="checkbox" checked={showSenior} onChange={e => setShowSenior(e.target.checked)}
                className="w-3.5 h-3.5 accent-brand-600" />
              <span className="text-sm text-gray-700 font-medium">Senior Rates</span>
            </label>
            <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-brand-300 transition-colors whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Rate {sortDir === 'desc' ? '↓ High–Low' : '↑ Low–High'}
            </button>
            <button onClick={() => refetch()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Rates sourced from bank websites and verified manually. Always confirm before opening — rates change without notice.
              Interest calculated daily on closing balance, credited quarterly.{' '}
              <Link to="/fd-rates" className="font-bold underline">Want higher guaranteed returns? Compare FD rates →</Link>
            </span>
          </div>

          {/* ── Loading / Error ──────────────────────────────────────────────── */}
          {isLoading && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading rates…</p>
            </div>
          )}
          {isError && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Failed to load.{' '}
                <button onClick={() => refetch()} className="text-brand-600 underline font-semibold">Retry</button>
              </p>
            </div>
          )}

          {/* ── MAIN TABLE — DB data ─────────────────────────────────────────── */}
          {!isLoading && !isError && hasDBData && (
            <>
              {grouped.size === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm">No banks match your filters.{' '}
                    <button onClick={() => { setBankTypeFilter('All'); setSearch(''); setAccountFilter('all'); }}
                      className="text-brand-600 underline font-semibold">Clear all</button>
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from(grouped.entries()).map(([sector, sectorBanks]) => (
                    <div key={sector}>
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">{sector}</h2>
                        <div className="flex-1 border-t border-gray-200" />
                        <span className="text-xs text-gray-400">{sectorBanks.length} bank{sectorBanks.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase tracking-wide bg-gray-50">
                              <th className="text-left px-5 py-3 font-semibold">Bank</th>
                              <th className="text-center px-4 py-3 font-semibold">Interest Rate</th>
                              <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Min Balance</th>
                              <th className="text-center px-4 py-3 font-semibold hidden md:table-cell">Last Verified</th>
                              <th className="px-4 py-3" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {sectorBanks.map(b => {
                              const isExp   = expanded.has(b.bank.id);
                              const hasZero = b.tenures.some(t => isZeroBalance(t));
                              const rateMin = Math.min(...b.tenures.map(t => showSenior ? (t.seniorRate ?? t.rate) : t.rate));
                              const rateMax = Math.max(...b.tenures.map(t => showSenior ? (t.seniorRate ?? t.rate) : t.rate));
                              const minBal  = hasZero ? '₹0' : (b.tenures[0]?.minAmount != null ? `₹${b.tenures[0].minAmount.toLocaleString('en-IN')}` : 'Standard');

                              return (
                                <>
                                  <tr key={b.bank.id}
                                    onClick={() => toggleExpand(b.bank.id)}
                                    className="hover:bg-brand-50/30 cursor-pointer transition-colors">
                                    <td className="px-5 py-4">
                                      <div className="flex items-center gap-3">
                                        {b.bank.logoUrl
                                          ? <img src={b.bank.logoUrl} alt={b.bank.name} className="w-8 h-8 object-contain rounded-lg border border-gray-100 flex-shrink-0 bg-white" />
                                          : <div className="w-8 h-8 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">{b.bank.name.charAt(0)}</div>}
                                        <div>
                                          <div className="font-semibold text-gray-900 leading-tight">{b.bank.name}</div>
                                          <div className="flex items-center gap-1 mt-0.5">
                                            {hasZero && <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 font-bold rounded-full">Zero Balance</span>}
                                            {b.tenures.some(t => t.seniorRate) && <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full">Senior Rate</span>}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <span className={`text-base ${rateColor(rateMax)}`}>
                                        {rateMin === rateMax ? `${rateMax}%` : `${rateMin}–${rateMax}%`}
                                      </span>
                                      <div className="text-[10px] text-gray-400">p.a.</div>
                                    </td>
                                    <td className="px-4 py-4 text-center hidden sm:table-cell text-sm text-gray-600 font-medium">{minBal}</td>
                                    <td className="px-4 py-4 text-center hidden md:table-cell">
                                      <FreshBadge lastVerified={b.lastVerified} />
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 ml-auto justify-end">
                                        {isExp ? 'Hide' : 'View'} {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                      </span>
                                    </td>
                                  </tr>

                                  {isExp && (
                                    <tr key={`exp-${b.bank.id}`}>
                                      <td colSpan={5} className="px-0 py-0 border-t border-brand-100/60">
                                        {/* Account type cards */}
                                        <div className="bg-[#f7f6ff] px-5 py-4">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-3">
                                            {b.tenures.length} Savings Account{b.tenures.length !== 1 ? ' Types' : ''}
                                          </p>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {b.tenures.map(t => {
                                              const isZero  = isZeroBalance(t);
                                              const dispRate = showSenior && t.seniorRate ? t.seniorRate : t.rate;
                                              const acctName = t.label ?? 'Standard Savings Account';
                                              // derive tags
                                              const tags: { label: string; cls: string }[] = [];
                                              if (isZero)       tags.push({ label: 'Zero Balance', cls: 'bg-green-100 text-green-700' });
                                              if (t.seniorRate) tags.push({ label: 'Senior Rate Available', cls: 'bg-blue-100 text-blue-700' });
                                              if ((acctName).toLowerCase().includes('salary')) tags.push({ label: 'Salary Account', cls: 'bg-purple-100 text-purple-700' });
                                              if ((acctName).toLowerCase().includes('premium') || (acctName).toLowerCase().includes('above ₹50')) tags.push({ label: 'Premium', cls: 'bg-amber-100 text-amber-700' });
                                              if ((acctName).toLowerCase().includes('digital') || (acctName).toLowerCase().includes('811') || (acctName).toLowerCase().includes('instant')) tags.push({ label: 'Digital', cls: 'bg-violet-100 text-violet-700' });

                                              const borderCls = dispRate >= 6 ? 'border-l-emerald-400' : dispRate >= 4 ? 'border-l-amber-400' : 'border-l-gray-300';
                                              const rateCls2  = dispRate >= 6 ? 'text-emerald-700' : dispRate >= 4 ? 'text-amber-600' : 'text-brand-700';

                                              return (
                                                <div key={t.id} className={`bg-white rounded-xl border border-gray-100 shadow-sm border-l-4 ${borderCls} p-4 flex flex-col gap-3`}>
                                                  {/* Account name */}
                                                  <div>
                                                    <p className="font-semibold text-gray-900 text-sm leading-snug">{acctName}</p>
                                                    {tags.length > 0 && (
                                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {tags.map(tag => (
                                                          <span key={tag.label} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tag.cls}`}>{tag.label}</span>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Rate */}
                                                  <div className="flex items-end gap-2">
                                                    <span className={`text-2xl font-extrabold leading-none ${rateCls2}`}>{dispRate}%</span>
                                                    <span className="text-xs text-gray-400 mb-0.5">p.a.</span>
                                                    {showSenior && t.seniorRate && (
                                                      <span className="text-xs text-blue-600 font-semibold mb-0.5">(senior)</span>
                                                    )}
                                                  </div>

                                                  {/* Details grid */}
                                                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                                                    <div>
                                                      <p className="text-gray-400">Min Balance</p>
                                                      <p className="font-semibold text-gray-700">{fmtMinBalance(t)}</p>
                                                    </div>
                                                    {t.seniorRate && !showSenior && (
                                                      <div>
                                                        <p className="text-gray-400">Senior Rate</p>
                                                        <p className="font-semibold text-blue-700">{t.seniorRate}% p.a.</p>
                                                      </div>
                                                    )}
                                                    {t.notes && !isZero && (
                                                      <div className="col-span-2">
                                                        <p className="text-gray-400 text-[10px] leading-snug">{t.notes}</p>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Source */}
                                                  {t.sourceUrl && (
                                                    <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer"
                                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-500 hover:underline mt-auto">
                                                      Official source <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Interlinks */}
                                        <div className="px-6 py-3 bg-white border-t border-gray-100 flex flex-wrap items-center gap-4">
                                          {b.bank.slug && (
                                            <Link to={`/bank/${b.bank.slug}`}
                                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
                                              <Building2 className="w-3 h-3" /> Find {b.bank.shortName ?? b.bank.name} branches
                                            </Link>
                                          )}
                                          <Link to="/fd-rates" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
                                            <TrendingUp className="w-3 h-3" /> Compare FD rates
                                          </Link>
                                          <Link to="/calculators/fd" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
                                            🧮 FD Calculator
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── STATIC TABLE — when DB empty ─────────────────────────────────── */}
          {!isLoading && !isError && !hasDBData && (
            <>
              <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Showing indicative rates for major Indian banks (June 2026). Live verified rates appear once added via admin — these are reference rates only. Always confirm with your bank.</span>
              </div>
              {(['Small Finance Bank', 'Private Sector', 'Public Sector'] as const).map(sector => {
                const sbs = STATIC_SAVINGS.filter(b => b.sector === sector);
                return (
                  <div key={sector}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">{sector}</h2>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-400 uppercase tracking-wide">
                            <th className="text-left px-5 py-3 font-semibold">Bank</th>
                            <th className="text-left px-4 py-3 font-semibold">Balance Tier</th>
                            <th className="text-center px-4 py-3 font-semibold">Rate p.a.</th>
                            <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Min Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {sbs.flatMap((b, bi) => b.tiers.map((t, ti) => (
                            <tr key={`${bi}-${ti}`} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-medium text-gray-800">{ti === 0 ? b.bank : ''}</td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {t.label}
                                {t.zeroBalance && <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 font-bold rounded-full">Zero Balance</span>}
                              </td>
                              <td className={`px-4 py-3 text-center text-sm ${rateColor(t.rate)}`}>{t.rate}%</td>
                              <td className="px-4 py-3 text-center text-xs text-gray-400 hidden sm:table-cell">{t.minBalance}</td>
                            </tr>
                          )))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ── FD Cross-link CTA ────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex-wrap">
            <div className="w-11 h-11 bg-brand-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-[180px]">
              <p className="font-bold text-gray-900 text-sm">Looking for higher guaranteed returns?</p>
              <p className="text-xs text-gray-400 mt-0.5">Fixed Deposits offer up to 9.5% p.a. — rate is locked in at booking, no market risk.</p>
            </div>
            <Link to="/fd-rates"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-900 transition-colors whitespace-nowrap text-sm flex-shrink-0">
              Compare FD Rates <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ── Which account is right for you ──────────────────────────────── */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Which savings account is right for you?</h2>
            <p className="text-sm text-gray-400 mb-4">Pick your situation — we'll tell you which account type fits best.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SCENARIOS.map(s => {
                const { Icon } = s;
                return (
                  <div key={s.title} className={`rounded-2xl border p-5 ${s.bgCls}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconCls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{s.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.need}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-black/5 space-y-1">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                        <div>
                          <span className="text-xs text-gray-500">Best pick: </span>
                          <span className={`text-xs ${s.pickCls}`}>{s.pick}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-300" />
                        <span className="text-[11px] text-gray-400 leading-snug">{s.examples}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── How to open ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">How to Open a Savings Account in India</h2>
              <p className="text-xs text-gray-400 mt-0.5">Online: under 10 minutes. Offline: visit any branch.</p>
            </div>
            <div className="divide-y divide-gray-50">
              {OPEN_STEPS.map((step, i) => (
                <div key={i} className="px-6 py-5 flex items-start gap-5">
                  <div className="w-9 h-9 bg-brand-700 text-white text-xs font-extrabold rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand-200">
                    {step.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">{step.tag}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Savings vs FD ────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Savings Account vs Fixed Deposit</h2>
              <Link to="/fd-rates" className="flex items-center gap-1 px-3 py-1.5 bg-brand-700 text-white text-xs font-bold rounded-lg hover:bg-brand-800 transition-colors">
              Compare FD Rates <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold">Feature</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-700">Savings Account</th>
                    <th className="text-left px-5 py-3 font-semibold text-blue-700">Fixed Deposit</th>
                    <th className="px-4 py-3 hidden sm:table-cell" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {VS_ROWS.map(r => (
                    <tr key={r.f} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-600 text-sm">{r.f}</td>
                      <td className={`px-5 py-3 text-sm ${r.better === 'sa' ? 'font-semibold text-brand-700' : 'text-gray-600'}`}>{r.s}</td>
                      <td className={`px-5 py-3 text-sm ${r.better === 'fd' ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>{r.fd}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-center">
                        {r.better === 'sa' && <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-full">Savings wins</span>}
                        {r.better === 'fd' && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">FD wins</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Tax callouts ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-2">Section 80TTA · Under 60 years</p>
              <p className="font-bold text-gray-900 text-base mb-1.5">Deduct up to <span className="text-brand-700">₹10,000</span>/year</p>
              <p className="text-sm text-gray-600 leading-relaxed">On savings account interest only (not FDs). Available to individuals and HUFs. Interest above ₹10k taxed at your slab rate.</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">Section 80TTB · Senior Citizens (60+)</p>
              <p className="font-bold text-gray-900 text-base mb-1.5">Deduct up to <span className="text-blue-700">₹50,000</span>/year</p>
              <p className="text-sm text-gray-600 leading-relaxed">Covers savings <em>and</em> FD interest combined. A senior earning ₹70k interest pays tax on only ₹20k.{' '}
                <Link to="/calculators/fd" className="text-blue-700 font-semibold hover:underline">FD Calculator →</Link>
              </p>
            </div>
          </div>

          {/* ── Related tools ────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Related Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { to: '/fd-rates',           emoji: '📈', title: 'FD Interest Rates',    desc: 'Up to 9.5% — better than savings'       },
                { to: '/calculators/fd',     emoji: '🧮', title: 'FD Calculator',        desc: 'Maturity amount with compounding'       },
                { to: '/credit-cards',       emoji: '💳', title: 'Credit Cards',         desc: 'Cashback & lifetime free cards'         },
                { to: '/ifsc-finder',        emoji: '🏦', title: 'IFSC Code Finder',     desc: 'Find any branch IFSC instantly'         },
                { to: '/swift-code-lookup',  emoji: '🌐', title: 'SWIFT Code Lookup',    desc: 'International transfer codes'           },
                { to: '/currency-converter', emoji: '💱', title: 'Currency Converter',   desc: 'Live INR ↔ USD, EUR, AED'               },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-xs group-hover:text-brand-700 transition-colors">{item.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── FAQs ─────────────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-400 mb-5">Everything about savings accounts in India</p>
            <div className="space-y-6">
              {FAQ_GROUPS.map(g => (
                <div key={g.title}>
                  <h3 className="text-[11px] font-bold text-brand-700 uppercase tracking-widest mb-3">{g.title}</h3>
                  <div className="space-y-0.5">
                    {g.faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-400 text-center pb-4">
            {hasDBData ? 'Rates manually curated and verified from bank websites.' : 'Indicative rates — verify with your bank before opening.'}{' '}
            Last updated: {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-IN') : 'June 2026'}.{' '}
            <Link to="/fd-rates" className="text-brand-500 hover:underline">Compare FD rates</Link>{' '}·{' '}
            <Link to="/accounts" className="text-brand-500 hover:underline">All bank accounts</Link>
          </p>
        </div>
      </div>
    </>
  );
}
