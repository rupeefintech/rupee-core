import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronUp, ChevronRight, Clock, ExternalLink, Search,
  ShieldCheck, RefreshCw, PiggyBank, Zap,
  Building2, TrendingUp, ArrowUpDown,
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
    borderCls: 'border-t-4 border-t-mint',
    rateCls: 'text-mint',
    badgeCls: 'bg-mint/10 text-mint border-mint/30',
  },
  {
    category: 'Best Private Bank',
    bank: 'IDFC FIRST Bank',
    rate: '7% p.a.',
    rateNote: 'on balances above ₹5 Lakh',
    badge: '⭐ Top Private',
    feature: 'Zero balance option + high-yield tiers for all balances',
    borderCls: 'border-t-4 border-t-acc',
    rateCls: 'text-acc',
    badgeCls: 'bg-acc-deep text-acc border-acc/30',
  },
  {
    category: 'Best Zero Balance',
    bank: 'State Bank of India',
    rate: '2.7–3%',
    rateNote: 'BSBDA · no minimum balance',
    badge: '🏦 Most Accessible',
    feature: '22,000+ branches · zero penalty · RBI-mandated BSBDA',
    borderCls: 'border-t-4 border-t-cyan',
    rateCls: 'text-cyan',
    badgeCls: 'bg-cyan/10 text-cyan border-cyan/30',
  },
  {
    category: 'Best Digital Account',
    bank: 'Fi Money (Federal Bank)',
    rate: '3.5% p.a.',
    rateNote: 'open in 10 min · no branch needed',
    badge: '📱 Instant Open',
    feature: 'Video KYC only · zero balance · smart savings tools',
    borderCls: 'border-t-4 border-t-violet',
    rateCls: 'text-violet',
    badgeCls: 'bg-violet-500/10 text-violet border-violet/30',
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
    bgCls: 'bg-mint/5 border-mint/30',
    iconCls: 'text-mint bg-mint/10',
    pickCls: 'text-mint font-semibold',
  },
  {
    Icon: BriefcaseBusiness,
    title: 'Salary Account',
    need: 'No min balance as long as salary is credited monthly',
    pick: 'Private Bank Salary Account',
    examples: 'HDFC Salary · ICICI Corporate · Axis Prime',
    bgCls: 'bg-acc-deep border-acc/30',
    iconCls: 'text-acc bg-acc/15',
    pickCls: 'text-acc font-semibold',
  },
  {
    Icon: TrendingUp,
    title: 'Maximizing Returns',
    need: 'Highest possible rate on surplus parked funds',
    pick: 'Small Finance Bank',
    examples: 'Utkarsh SFB · ESAF SFB · Jana SFB · AU SFB',
    bgCls: 'bg-mint/5 border-mint/30',
    iconCls: 'text-mint bg-mint/10',
    pickCls: 'text-mint font-semibold',
  },
  {
    Icon: Smartphone,
    title: 'Digital-First Banking',
    need: 'Open from phone, no branch visit, modern UX',
    pick: 'Neo / Digital Bank',
    examples: 'Fi Money · Jupiter · Niyo · Freo (all DICGC-insured)',
    bgCls: 'bg-violet-500/5 border-violet/30',
    iconCls: 'text-violet bg-violet-500/10',
    pickCls: 'text-violet font-semibold',
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
  const cls = d <= 7 ? 'bg-mint/10 text-mint' : d <= 30 ? 'bg-gold/10 text-gold' : 'bg-coral/10 text-coral';
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
  if (rate >= 6) return 'text-mint font-extrabold';
  if (rate >= 4) return 'text-gold font-bold';
  return 'text-body font-semibold';
}
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-l-2 transition-all pl-4 ${open ? 'border-acc' : 'border-line'}`}>
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex justify-between items-start py-3 text-left text-sm font-semibold text-ink hover:text-acc transition-colors gap-3">
        <span className="leading-snug">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-acc flex-shrink-0 mt-0.5" />
               : <ChevronDown className="w-4 h-4 text-faint flex-shrink-0 mt-0.5" />}
      </button>
      {open && <p className="pb-3 text-sm text-muted leading-relaxed">{a}</p>}
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

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                  <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to="/accounts" className="hover:text-acc transition-colors">Bank Accounts</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">Savings Account Rates</span>
                </nav>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-acc-deep rounded-2xl flex items-center justify-center flex-shrink-0 text-acc">
                    <PiggyBank className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink tracking-tight">Best Savings Account <span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Interest Rates</span> 2026</h1>
                    <p className="text-body mt-1 text-sm">Compare savings account rates across all Indian banks</p>
                  </div>
                </div>
                <p className="text-body text-base max-w-2xl mb-8">
                  Compare savings account rates across public, private, and small finance banks in India.
                  Interest calculated daily on closing balance, credited quarterly. All accounts DICGC-insured.
                </p>

                {!isLoading && !isError && (
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    {[
                      { n: hasDBData ? `${banks.length}+` : '100+', label: 'Banks Tracked'    },
                      { n: `${bestRate ?? 'Up to 9'}% p.a.`,          label: 'Best Rate'        },
                      { n: 'Quarterly',                                label: 'Interest Credited' },
                      { n: 'Up to ₹5 Lakh',                            label: 'DICGC Insurance'   },
                    ].map(({ n, label }) => (
                      <div key={label}>
                        <p className="text-2xl font-extrabold text-ink leading-none">{n}</p>
                        <p className="text-[11px] text-faint font-semibold uppercase tracking-wide mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-5xl mx-auto px-4 sm:px-6 py-7 space-y-8">

        {/* ── Account type tabs ────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ACCOUNT_TYPES.map(f => {
            const { Icon } = f;
            const active = accountFilter === f.value;
            return (
              <button key={f.value} onClick={() => setAccountFilter(f.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border whitespace-nowrap transition-all flex-shrink-0 ${
                  active
                    ? 'bg-gradient-to-br from-mint to-acc text-white border-transparent shadow-acc-glow'
                    : 'bg-surface text-muted border-line hover:border-acc/40 hover:text-acc'
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
            <h2 className="text-lg font-bold text-ink">Top Picks for 2026</h2>
            <span className="text-xs text-faint">Updated June 2026</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOP_PICKS.map(p => (
              <div key={p.bank} className={`bg-surface rounded-2xl border border-line ${p.borderCls} p-5 flex flex-col gap-3 hover:border-line-2 transition-colors`}>
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${p.badgeCls}`}>{p.badge}</span>
                  <p className="text-[11px] text-faint mt-2 font-semibold uppercase tracking-wide">{p.category}</p>
                  <p className="font-bold text-ink text-sm mt-0.5 leading-snug">{p.bank}</p>
                </div>
                <div>
                  <div className={`text-2xl font-extrabold ${p.rateCls}`}>{p.rate}</div>
                  <div className="text-[11px] text-faint">{p.rateNote}</div>
                </div>
                <p className="text-xs text-muted leading-relaxed flex-1">{p.feature}</p>
                <Link to="/ifsc-finder"
                  className={`text-xs font-semibold flex items-center gap-1 ${p.rateCls} hover:underline`}>
                  Find branches <ChevronDown className="w-3 h-3 -rotate-90" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter bar ───────────────────────────────────────────────────── */}
        <div className="bg-surface rounded-2xl px-4 py-3 border border-line flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search bank…"
              className="w-full pl-8 pr-3 py-2 bg-bg-2 border border-line-2 rounded-lg text-sm text-ink focus:ring-2 focus:ring-acc/20 focus:border-acc outline-none transition-all" />
          </div>
          <select value={bankTypeFilter} onChange={e => setBankTypeFilter(e.target.value)}
            className="bg-bg-2 border border-line-2 rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-acc/20 focus:border-acc outline-none transition-all">
            {BANK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-line rounded-lg hover:border-acc/40 transition-colors whitespace-nowrap">
            <input type="checkbox" checked={showSenior} onChange={e => setShowSenior(e.target.checked)}
              className="w-3.5 h-3.5 accent-acc" />
            <span className="text-sm text-body font-medium">Senior Rates</span>
          </label>
          <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 border border-line rounded-lg text-sm text-muted hover:border-acc/40 transition-colors whitespace-nowrap">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Rate {sortDir === 'desc' ? '↓ High–Low' : '↑ Low–High'}
          </button>
          <button onClick={() => refetch()} className="p-2 hover:bg-surface-2 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl text-xs text-gold">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Rates sourced from bank websites and verified manually. Always confirm before opening — rates change without notice.
            Interest calculated daily on closing balance, credited quarterly.{' '}
            <Link to="/fd-rates" className="font-bold underline">Want higher guaranteed returns? Compare FD rates →</Link>
          </span>
        </div>

        {/* ── Loading / Error ──────────────────────────────────────────────── */}
        {isLoading && (
          <div className="bg-surface rounded-2xl p-10 text-center border border-line">
            <div className="w-7 h-7 border-2 border-acc border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-faint text-sm">Loading rates…</p>
          </div>
        )}
        {isError && (
          <div className="bg-surface rounded-2xl p-8 text-center border border-line">
            <p className="text-muted text-sm">Failed to load.{' '}
              <button onClick={() => refetch()} className="text-acc underline font-semibold">Retry</button>
            </p>
          </div>
        )}

        {/* ── MAIN TABLE — DB data ─────────────────────────────────────────── */}
        {!isLoading && !isError && hasDBData && (
          <>
            {grouped.size === 0 ? (
              <div className="bg-surface rounded-2xl p-8 text-center border border-line">
                <p className="text-muted text-sm">No banks match your filters.{' '}
                  <button onClick={() => { setBankTypeFilter('All'); setSearch(''); setAccountFilter('all'); }}
                    className="text-acc underline font-semibold">Clear all</button>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(grouped.entries()).map(([sector, sectorBanks]) => (
                  <div key={sector}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xs font-bold text-faint uppercase tracking-widest whitespace-nowrap">{sector}</h2>
                      <div className="flex-1 border-t border-line" />
                      <span className="text-xs text-faint">{sectorBanks.length} bank{sectorBanks.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="bg-surface rounded-2xl border border-line overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-line text-[11px] text-muted uppercase tracking-wide bg-surface-2">
                            <th className="text-left px-5 py-3 font-semibold">Bank</th>
                            <th className="text-center px-4 py-3 font-semibold">Interest Rate</th>
                            <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Min Balance</th>
                            <th className="text-center px-4 py-3 font-semibold hidden md:table-cell">Last Verified</th>
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
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
                                  className="hover:bg-acc-deep cursor-pointer transition-colors">
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      {b.bank.logoUrl
                                        ? <img src={b.bank.logoUrl} alt={b.bank.name} className="w-8 h-8 object-contain rounded-lg border border-line flex-shrink-0 bg-surface" />
                                        : <div className="w-8 h-8 bg-acc-deep border border-acc/30 rounded-lg flex items-center justify-center text-acc font-bold text-sm flex-shrink-0">{b.bank.name.charAt(0)}</div>}
                                      <div>
                                        <div className="font-semibold text-ink leading-tight">{b.bank.name}</div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                          {hasZero && <span className="text-[9px] px-1.5 py-0.5 bg-mint/10 text-mint font-bold rounded-full">Zero Balance</span>}
                                          {b.tenures.some(t => t.seniorRate) && <span className="text-[9px] px-1.5 py-0.5 bg-acc-deep text-acc font-bold rounded-full">Senior Rate</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <span className={`text-base ${rateColor(rateMax)}`}>
                                      {rateMin === rateMax ? `${rateMax}%` : `${rateMin}–${rateMax}%`}
                                    </span>
                                    <div className="text-[10px] text-faint">p.a.</div>
                                  </td>
                                  <td className="px-4 py-4 text-center hidden sm:table-cell text-sm text-body font-medium">{minBal}</td>
                                  <td className="px-4 py-4 text-center hidden md:table-cell">
                                    <FreshBadge lastVerified={b.lastVerified} />
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <span className="flex items-center gap-1 text-xs font-semibold text-acc ml-auto justify-end">
                                      {isExp ? 'Hide' : 'View'} {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </span>
                                  </td>
                                </tr>

                                {isExp && (
                                  <tr key={`exp-${b.bank.id}`}>
                                    <td colSpan={5} className="px-0 py-0 border-t border-acc/20">
                                      {/* Account type cards */}
                                      <div className="bg-acc-deep px-5 py-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-acc mb-3">
                                          {b.tenures.length} Savings Account{b.tenures.length !== 1 ? ' Types' : ''}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                          {b.tenures.map(t => {
                                            const isZero  = isZeroBalance(t);
                                            const dispRate = showSenior && t.seniorRate ? t.seniorRate : t.rate;
                                            const acctName = t.label ?? 'Standard Savings Account';
                                            // derive tags
                                            const tags: { label: string; cls: string }[] = [];
                                            if (isZero)       tags.push({ label: 'Zero Balance', cls: 'bg-mint/10 text-mint' });
                                            if (t.seniorRate) tags.push({ label: 'Senior Rate Available', cls: 'bg-acc-deep text-acc' });
                                            if ((acctName).toLowerCase().includes('salary')) tags.push({ label: 'Salary Account', cls: 'bg-violet-500/10 text-violet' });
                                            if ((acctName).toLowerCase().includes('premium') || (acctName).toLowerCase().includes('above ₹50')) tags.push({ label: 'Premium', cls: 'bg-gold/10 text-gold' });
                                            if ((acctName).toLowerCase().includes('digital') || (acctName).toLowerCase().includes('811') || (acctName).toLowerCase().includes('instant')) tags.push({ label: 'Digital', cls: 'bg-cyan/10 text-cyan' });

                                            const borderCls = dispRate >= 6 ? 'border-l-mint' : dispRate >= 4 ? 'border-l-gold' : 'border-l-line-2';
                                            const rateCls2  = dispRate >= 6 ? 'text-mint' : dispRate >= 4 ? 'text-gold' : 'text-acc';

                                            return (
                                              <div key={t.id} className={`bg-surface rounded-xl border border-line border-l-4 ${borderCls} p-4 flex flex-col gap-3`}>
                                                {/* Account name */}
                                                <div>
                                                  <p className="font-semibold text-ink text-sm leading-snug">{acctName}</p>
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
                                                  <span className="text-xs text-faint mb-0.5">p.a.</span>
                                                  {showSenior && t.seniorRate && (
                                                    <span className="text-xs text-acc font-semibold mb-0.5">(senior)</span>
                                                  )}
                                                </div>

                                                {/* Details grid */}
                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                                                  <div>
                                                    <p className="text-faint">Min Balance</p>
                                                    <p className="font-semibold text-body">{fmtMinBalance(t)}</p>
                                                  </div>
                                                  {t.seniorRate && !showSenior && (
                                                    <div>
                                                      <p className="text-faint">Senior Rate</p>
                                                      <p className="font-semibold text-acc">{t.seniorRate}% p.a.</p>
                                                    </div>
                                                  )}
                                                  {t.notes && !isZero && (
                                                    <div className="col-span-2">
                                                      <p className="text-faint text-[10px] leading-snug">{t.notes}</p>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Source */}
                                                {t.sourceUrl && (
                                                  <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-acc hover:underline mt-auto">
                                                    Official source <ExternalLink className="w-2.5 h-2.5" />
                                                  </a>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Interlinks */}
                                      <div className="px-6 py-3 bg-surface border-t border-line flex flex-wrap items-center gap-4">
                                        {b.bank.slug && (
                                          <Link to={`/bank/${b.bank.slug}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-acc hover:underline">
                                            <Building2 className="w-3 h-3" /> Find {b.bank.shortName ?? b.bank.name} branches
                                          </Link>
                                        )}
                                        <Link to="/fd-rates" className="inline-flex items-center gap-1.5 text-xs font-semibold text-acc hover:underline">
                                          <TrendingUp className="w-3 h-3" /> Compare FD rates
                                        </Link>
                                        <Link to="/calculators/fd" className="inline-flex items-center gap-1.5 text-xs font-semibold text-acc hover:underline">
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
            <div className="flex items-start gap-2 px-4 py-3 bg-acc-deep border border-acc/30 rounded-xl text-xs text-acc">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Showing indicative rates for major Indian banks (June 2026). Live verified rates appear once added via admin — these are reference rates only. Always confirm with your bank.</span>
            </div>
            {(['Small Finance Bank', 'Private Sector', 'Public Sector'] as const).map(sector => {
              const sbs = STATIC_SAVINGS.filter(b => b.sector === sector);
              return (
                <div key={sector}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xs font-bold text-faint uppercase tracking-widest whitespace-nowrap">{sector}</h2>
                    <div className="flex-1 border-t border-line" />
                  </div>
                  <div className="bg-surface rounded-2xl border border-line overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface-2 border-b border-line text-[11px] text-muted uppercase tracking-wide">
                          <th className="text-left px-5 py-3 font-semibold">Bank</th>
                          <th className="text-left px-4 py-3 font-semibold">Balance Tier</th>
                          <th className="text-center px-4 py-3 font-semibold">Rate p.a.</th>
                          <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Min Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {sbs.flatMap((b, bi) => b.tiers.map((t, ti) => (
                          <tr key={`${bi}-${ti}`} className="hover:bg-surface-2">
                            <td className="px-5 py-3 font-medium text-ink">{ti === 0 ? b.bank : ''}</td>
                            <td className="px-4 py-3 text-body text-xs">
                              {t.label}
                              {t.zeroBalance && <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-mint/10 text-mint font-bold rounded-full">Zero Balance</span>}
                            </td>
                            <td className={`px-4 py-3 text-center text-sm ${rateColor(t.rate)}`}>{t.rate}%</td>
                            <td className="px-4 py-3 text-center text-xs text-faint hidden sm:table-cell">{t.minBalance}</td>
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
        <div className="flex items-center gap-4 bg-surface rounded-2xl border border-line px-5 py-4 flex-wrap">
          <div className="w-11 h-11 bg-acc-deep rounded-xl flex items-center justify-center flex-shrink-0 text-acc">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <p className="font-bold text-ink text-sm">Looking for higher guaranteed returns?</p>
            <p className="text-xs text-faint mt-0.5">Fixed Deposits offer up to 9.5% p.a. — rate is locked in at booking, no market risk.</p>
          </div>
          <Link to="/fd-rates"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-br from-mint to-acc text-white font-bold rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all whitespace-nowrap text-sm flex-shrink-0">
            Compare FD Rates <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Which account is right for you ──────────────────────────────── */}
        <div>
          <h2 className="text-lg font-bold text-ink mb-1">Which savings account is right for you?</h2>
          <p className="text-sm text-faint mb-4">Pick your situation — we'll tell you which account type fits best.</p>
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
                      <p className="font-bold text-ink text-sm">{s.title}</p>
                      <p className="text-xs text-muted mt-0.5 leading-snug">{s.need}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-line/60 space-y-1">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-faint" />
                      <div>
                        <span className="text-xs text-muted">Best pick: </span>
                        <span className={`text-xs ${s.pickCls}`}>{s.pick}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-faint" />
                      <span className="text-[11px] text-faint leading-snug">{s.examples}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── How to open ──────────────────────────────────────────────────── */}
        <div className="bg-surface rounded-2xl border border-line overflow-hidden">
          <div className="px-6 py-5 border-b border-line">
            <h2 className="font-bold text-ink">How to Open a Savings Account in India</h2>
            <p className="text-xs text-faint mt-0.5">Online: under 10 minutes. Offline: visit any branch.</p>
          </div>
          <div className="divide-y divide-line">
            {OPEN_STEPS.map((step, i) => (
              <div key={i} className="px-6 py-5 flex items-start gap-5">
                <div className="w-9 h-9 bg-gradient-to-br from-mint to-acc text-white text-xs font-extrabold rounded-full flex items-center justify-center flex-shrink-0 shadow-acc-glow">
                  {step.n}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-ink text-sm">{step.title}</p>
                    <span className="text-[10px] bg-surface-2 text-muted px-2 py-0.5 rounded-full font-semibold">{step.tag}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Savings vs FD ────────────────────────────────────────────────── */}
        <div className="bg-surface rounded-2xl border border-line overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-bold text-ink">Savings Account vs Fixed Deposit</h2>
            <Link to="/fd-rates" className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-br from-mint to-acc text-white text-xs font-bold rounded-lg shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all">
            Compare FD Rates <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 text-[11px] text-muted uppercase tracking-wide border-b border-line">
                  <th className="text-left px-5 py-3 font-semibold">Feature</th>
                  <th className="text-left px-5 py-3 font-semibold text-acc">Savings Account</th>
                  <th className="text-left px-5 py-3 font-semibold text-cyan">Fixed Deposit</th>
                  <th className="px-4 py-3 hidden sm:table-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {VS_ROWS.map(r => (
                  <tr key={r.f} className="hover:bg-surface-2">
                    <td className="px-5 py-3 font-medium text-muted text-sm">{r.f}</td>
                    <td className={`px-5 py-3 text-sm ${r.better === 'sa' ? 'font-semibold text-acc' : 'text-body'}`}>{r.s}</td>
                    <td className={`px-5 py-3 text-sm ${r.better === 'fd' ? 'font-semibold text-cyan' : 'text-body'}`}>{r.fd}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-center">
                      {r.better === 'sa' && <span className="text-[10px] font-bold px-2 py-0.5 bg-acc-deep text-acc border border-acc/30 rounded-full">Savings wins</span>}
                      {r.better === 'fd' && <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan/10 text-cyan border border-cyan/30 rounded-full">FD wins</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Tax callouts ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-acc-deep border border-acc/30 rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-acc mb-2">Section 80TTA · Under 60 years</p>
            <p className="font-bold text-ink text-base mb-1.5">Deduct up to <span className="text-acc">₹10,000</span>/year</p>
            <p className="text-sm text-muted leading-relaxed">On savings account interest only (not FDs). Available to individuals and HUFs. Interest above ₹10k taxed at your slab rate.</p>
          </div>
          <div className="bg-cyan/5 border border-cyan/30 rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan mb-2">Section 80TTB · Senior Citizens (60+)</p>
            <p className="font-bold text-ink text-base mb-1.5">Deduct up to <span className="text-cyan">₹50,000</span>/year</p>
            <p className="text-sm text-muted leading-relaxed">Covers savings <em>and</em> FD interest combined. A senior earning ₹70k interest pays tax on only ₹20k.{' '}
              <Link to="/calculators/fd" className="text-cyan font-semibold hover:underline">FD Calculator →</Link>
            </p>
          </div>
        </div>

        {/* ── Compare Savings Accounts ─────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-3">Compare Savings Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { to: '/compare/savings/sbi-vs-hdfc',          label: 'SBI vs HDFC Savings Account',       desc: 'Interest rates, min balance, and features compared' },
              { to: '/best-savings-accounts-for-salary',     label: 'Best Savings Accounts for Salary',  desc: 'Zero balance accounts with best rates and perks'    },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="bg-surface rounded-xl p-4 border border-line hover:border-acc/40 transition-all group flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-acc-deep text-acc rounded-full border border-acc/30">Compare</span>
                  <ChevronRight className="w-4 h-4 text-faint group-hover:text-acc transition-colors" />
                </div>
                <div className="font-semibold text-ink text-sm group-hover:text-acc transition-colors">{item.label}</div>
                <div className="text-[11px] text-faint leading-tight">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Related tools ────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-3">Related Tools</h2>
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
                className="bg-surface rounded-xl p-4 border border-line hover:border-acc/30 transition-all group flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <div className="font-semibold text-body text-xs group-hover:text-acc transition-colors">{item.title}</div>
                  <div className="text-[11px] text-faint mt-0.5 leading-tight">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── FAQs ─────────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-ink mb-1">Frequently Asked Questions</h2>
          <p className="text-sm text-faint mb-5">Everything about savings accounts in India</p>
          <div className="space-y-6">
            {FAQ_GROUPS.map(g => (
              <div key={g.title}>
                <h3 className="text-[11px] font-bold text-acc uppercase tracking-widest mb-3">{g.title}</h3>
                <div className="space-y-0.5">
                  {g.faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-faint text-center pb-4">
          {hasDBData ? 'Rates manually curated and verified from bank websites.' : 'Indicative rates — verify with your bank before opening.'}{' '}
          Last updated: {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-IN') : 'June 2026'}.{' '}
          <Link to="/fd-rates" className="text-acc hover:underline">Compare FD rates</Link>{' '}·{' '}
          <Link to="/accounts" className="text-acc hover:underline">All bank accounts</Link>
        </p>
      </div>
    </>
  );
}
