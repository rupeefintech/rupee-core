import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, RefreshCw, AlertCircle, Copy, CheckCheck,
  ChevronRight, ChevronDown, Shield, Zap, Wifi, Globe,
  CreditCard, Building2, MapPin, ExternalLink, TrendingUp, PiggyBank,
} from 'lucide-react';
import { api, BranchDetail, NearbyBranch } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';
import { generateSEO } from '../utils/seo';
// ── Helpers ───────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function bankSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const CARD_ISSUING_BANKS = new Set([
  'HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'IndusInd Bank', 'Yes Bank', 'RBL Bank',
  'IDFC First Bank', 'Standard Chartered Bank', 'Citibank', 'Citi Bank',
  'American Express', 'Punjab National Bank', 'Bank of Baroda',
  'Union Bank of India', 'Federal Bank', 'HSBC Bank',
]);

// ── IFSC Visual Breakdown ─────────────────────────────────────────────────────

function IFSCBreakdown({ ifsc }: { ifsc: string }) {
  const bank   = ifsc.slice(0, 4);
  const zero   = ifsc[4];
  const branch = ifsc.slice(5);
  return (
    <div className="flex items-stretch rounded-xl overflow-hidden border border-acc/30 w-fit text-center">
      <div className="bg-gradient-to-br from-acc to-acc-2 text-white px-5 py-3">
        <p className="ifsc-mono text-xl font-bold tracking-widest">{bank}</p>
        <p className="text-xs text-white/70 mt-1">Bank code</p>
      </div>
      <div className="bg-surface-2 text-muted px-3 py-3 border-x border-acc/30">
        <p className="ifsc-mono text-xl font-bold">{zero}</p>
        <p className="text-xs text-faint mt-1">Reserved</p>
      </div>
      <div className="bg-acc-deep text-ink px-5 py-3">
        <p className="ifsc-mono text-xl font-bold tracking-widest">{branch}</p>
        <p className="text-xs text-muted mt-1">Branch code</p>
      </div>
    </div>
  );
}

// ── Copy Button (uses react-hot-toast to match existing BranchCard) ───────────

function CopyBtn({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label ?? value} copied!`, { duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      title={`Copy ${label ?? value}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-line-2 text-acc hover:bg-acc-deep hover:border-acc transition-all active:scale-95 text-xs font-medium"
    >
      {copied
        ? <><CheckCheck className="w-3 h-3 text-mint" /><span className="text-mint">Copied!</span></>
        : <><Copy className="w-3 h-3" />{label && <span>{label}</span>}</>}
    </button>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-4 flex items-start justify-between gap-3 group"
      >
        <span className="text-sm font-semibold text-ink leading-snug group-hover:text-acc transition-colors">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted leading-relaxed pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── JSON-LD Builder ───────────────────────────────────────────────────────────

function buildJsonLd(branch: BranchDetail) {
  const branchName = toTitleCase(branch.branch_name);

  const entity = {
    '@context': 'https://schema.org',
    '@type': 'BankOrCreditUnion',
    name: `${branch.bank_name} — ${branchName}`,
    identifier: branch.ifsc,
    branchOf: {
      '@type': 'Bank',
      name: branch.bank_name,
      ...(branch.bank_website ? { url: branch.bank_website } : {}),
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: toTitleCase(branch.address || ''),
      addressLocality: toTitleCase(branch.city || ''),
      addressRegion: branch.state_name,
      postalCode: branch.pincode ?? '',
      addressCountry: 'IN',
    },
    ...(branch.phone ? { telephone: branch.phone } : {}),
    ...(branch.latitude && branch.longitude
      ? { geo: { '@type': 'GeoCoordinates', latitude: branch.latitude, longitude: branch.longitude } }
      : {}),
    url: `https://rupeepedia.in/ifsc/${branch.ifsc}`,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
      { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: 'https://rupeepedia.in/ifsc' },
      { '@type': 'ListItem', position: 3, name: branch.bank_name, item: `https://rupeepedia.in/bank/${bankSlug(branch.bank_name)}` },
      { '@type': 'ListItem', position: 4, name: branch.state_name },
      { '@type': 'ListItem', position: 5, name: branch.ifsc, item: `https://rupeepedia.in/ifsc/${branch.ifsc}` },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the IFSC code of ${branch.bank_name} ${branchName}?`,
        acceptedAnswer: { '@type': 'Answer', text: `The IFSC code of ${branch.bank_name} ${branchName} branch is ${branch.ifsc}.` },
      },
      {
        '@type': 'Question',
        name: `What is the MICR code of ${branch.bank_name} ${branchName}?`,
        acceptedAnswer: { '@type': 'Answer', text: `The MICR code of ${branch.bank_name} ${branchName} is ${branch.micr || 'not currently available'}.` },
      },
      {
        '@type': 'Question',
        name: `Does ${branch.ifsc} support RTGS?`,
        acceptedAnswer: { '@type': 'Answer', text: branch.rtgs ? `Yes, ${branch.ifsc} supports RTGS transfers.` : `RTGS is not enabled at this branch. Please contact your bank.` },
      },
      {
        '@type': 'Question',
        name: `What is the address of ${branch.bank_name} ${branchName}?`,
        acceptedAnswer: { '@type': 'Answer', text: `${branch.bank_name} ${branchName} is located at: ${toTitleCase(branch.address || '')}, ${toTitleCase(branch.city || '')}, ${branch.state_name}${branch.pincode ? ', PIN ' + branch.pincode : ''}.` },
      },
      {
        '@type': 'Question',
        name: `How do I use IFSC ${branch.ifsc} for a NEFT transfer?`,
        acceptedAnswer: { '@type': 'Answer', text: `To transfer via NEFT to ${branch.bank_name} ${branchName}: log in to your net banking, go to Fund Transfer > Add Beneficiary, enter the account number and IFSC code ${branch.ifsc}. After activation (30 min–12 hrs), enter the amount and confirm with OTP. NEFT is available 24×7.` },
      },
    ],
  };

  return [entity, breadcrumb, faq];
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function IFSCDetailPage() {
  const { ifsc } = useParams<{ ifsc: string }>();
  const navigate  = useNavigate();

  // Normalise to uppercase — done in useEffect to avoid Rules of Hooks violation
  const ifscCode = ifsc?.toUpperCase() ?? '';
  useEffect(() => {
    if (ifsc && ifsc !== ifscCode) {
      navigate(`/ifsc/${ifscCode}`, { replace: true });
    }
  }, [ifsc, ifscCode, navigate]);

  const {
    data: branch, isLoading, isError, error, refetch,
  } = useQuery<BranchDetail>({
    queryKey:  ['ifsc', ifscCode],
    queryFn:   () => api.getByIfsc(ifscCode),
    enabled:   !!ifscCode,
    retry:     (failureCount, err: any) => failureCount < 2 && !err?.isNotFound,
    staleTime: 60 * 60 * 1000,
  });

  // enabled: !!ifscCode only — not gated on !!branch
  // React Query fires this as soon as ifscCode is available;
  // both queries run in parallel which is faster anyway.
  const { data: nearby = [] } = useQuery<NearbyBranch[]>({
    queryKey:  ['ifsc-nearby', ifscCode],
    queryFn:   () => api.getNearbyBranches(ifscCode),
    enabled:   !!ifscCode,
    staleTime: 60 * 60 * 1000,
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingSpinner message={`Looking up ${ifscCode}…`} />;

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError || !branch) {
    const isNotFound = (error as any)?.isNotFound === true;
    return (
      <div className="bg-bg min-h-screen py-10">
        {isNotFound && (
          <Helmet>
            <meta name="robots" content="noindex, follow" />
          </Helmet>
        )}
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link to="/ifsc" className="inline-flex items-center gap-2 text-acc hover:text-cyan font-medium text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </Link>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-line rounded-[13px] p-8 text-center">
            <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-coral" />
            </div>
            {isNotFound ? (
              <>
                <h1 className="font-display text-2xl font-bold text-ink mb-2">IFSC Code Not Found</h1>
                <p className="text-muted mb-2">
                  <span className="ifsc-mono font-bold text-acc">{ifscCode}</span> was not found in our database.
                </p>
                <p className="text-faint text-sm mb-6">
                  This may be a newly added branch or the code might be incorrect. Please verify with your bank.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold text-ink mb-2">Unable to Load</h1>
                <p className="text-muted mb-2">
                  Could not fetch details for <span className="ifsc-mono font-bold text-acc">{ifscCode}</span>.
                </p>
                <p className="text-faint text-sm mb-6">
                  This is a temporary issue. Please try again in a moment.
                </p>
              </>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => refetch()} className="inline-flex items-center gap-2 bg-surface text-ink border border-line-2 hover:bg-surface-2 hover:border-acc font-semibold px-6 py-3 rounded-xl transition-all">
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <Link to="/ifsc" className="inline-flex items-center gap-2 bg-gradient-to-br from-acc to-acc-2 text-white font-semibold px-6 py-3 rounded-xl shadow-acc-glow transition-all">New Search</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const branchTitle     = toTitleCase(branch.branch_name);
  const seo = generateSEO('ifsc', {
    ifsc: branch.ifsc,
    bank: branch.bank_name,
    branch: branchTitle,
    city: toTitleCase(branch.city || ''),
    state: branch.state_name,
  });

  const schemas         = buildJsonLd(branch);
  const canonicalUrl    = `https://rupeepedia.in/ifsc/${branch.ifsc}`;
  const pageTitle       = seo.title;
  const pageDescription = seo.description;


  const faqs = [
    {
      q: 'What is an IFSC Code?',
      a: `The Indian Financial System Code (IFSC) is a unique 11-character alphanumeric code assigned by the Reserve Bank of India (RBI) to every bank branch participating in India's electronic payment systems — NEFT, RTGS, and IMPS. The code ${branch.ifsc} identifies ${branch.bank_name}, ${branchTitle} branch located in ${toTitleCase(branch.city || '')}, ${branch.state_name}.`,
    },
    {
      q: `What is the IFSC code of ${branch.bank_name} ${branchTitle}?`,
      a: `The IFSC code of ${branch.bank_name} ${branchTitle} branch is ${branch.ifsc}. This 11-character code is mandatory for NEFT, RTGS, and IMPS transfers to this branch.`,
    },
    {
      q: `What is the MICR code of ${branch.bank_name} ${branchTitle}?`,
      a: `The MICR code of ${branch.bank_name} ${branchTitle} is ${branch.micr || 'not currently available in our database'}. The MICR code is a 9-digit number used for cheque processing and clearing.`,
    },
    {
      q: `Does IFSC ${branch.ifsc} support RTGS?`,
      a: branch.rtgs
        ? `Yes, ${branch.ifsc} (${branch.bank_name} ${branchTitle}) supports RTGS (Real Time Gross Settlement). RTGS is used for high-value transactions of ₹2 lakh and above and settles instantly.`
        : `RTGS is not currently enabled at ${branchTitle} branch. Please contact ${branch.bank_name} to confirm current status.`,
    },
    {
      q: `What is the full address of ${branch.bank_name} ${branchTitle}?`,
      a: `${branch.bank_name} ${branchTitle} is at: ${toTitleCase(branch.address || '')}, ${toTitleCase(branch.city || '')}, ${branch.district_name}, ${branch.state_name}${branch.pincode ? ' — PIN ' + branch.pincode : ''}${branch.phone ? '. Phone: ' + branch.phone : ''}.`,
    },
    {
      q: `How do I transfer money using IFSC ${branch.ifsc}?`,
      a: `To transfer via NEFT or IMPS to ${branch.bank_name} ${branchTitle}: (1) Log in to your bank's net banking or mobile app. (2) Go to Fund Transfer → Add Beneficiary. (3) Enter the beneficiary's account number and IFSC ${branch.ifsc}. (4) Wait for activation (30 min–12 hrs). (5) Initiate the transfer and confirm with OTP. Both NEFT and IMPS are available 24×7, 365 days.`,
    },
    {
      q: `What does IFSC code ${branch.ifsc} mean?`,
      a: `${branch.ifsc} breaks down as: "${branch.ifsc.slice(0, 4)}" identifies ${branch.bank_name}, "0" is the 5th character reserved by RBI for future use, and "${branch.ifsc.slice(5)}" is the unique branch code for ${branchTitle}. Every bank branch in India has a unique 11-character IFSC code assigned by the RBI.`,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description"         content={seo.description} />
        <link rel="canonical"            href={canonicalUrl} />
        <meta property="og:title"        content={`${branch.ifsc} — ${branch.bank_name} ${branchTitle} IFSC Code`} />
        <meta property="og:description"  content={pageDescription} />
        <meta property="og:url"          content={canonicalUrl} />
        <meta property="og:type"         content="website" />
        <meta name="twitter:card"        content="summary" />
        <meta name="twitter:title"       content={`${branch.ifsc} — ${branch.bank_name} ${branchTitle} IFSC Code`} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="robots"              content="index, follow" />
        {schemas.map((s, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
        ))}
      </Helmet>

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20 blur-[20px]"
                   style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
            </div>
            <div className="relative z-[2]">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-faint mb-6 font-mono">
            <Link to="/" className="hover:text-acc transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/ifsc" className="hover:text-acc transition-colors">IFSC Finder</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/bank/${bankSlug(branch.bank_name)}`} className="hover:text-acc transition-colors">{branch.bank_name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-muted">{branch.state_name}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-acc font-medium">{branch.ifsc}</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Bank identity bar */}
            <div className="flex items-center gap-4 mb-5">
              {branch.bank_logo_url ? (
                <img
                  src={branch.bank_logo_url}
                  alt={branch.bank_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-acc-deep rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-acc" />
                </div>
              )}
              <div>
                <span className="inline-flex items-center gap-1.5 bg-mint/10 text-mint text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 border border-mint/35 uppercase tracking-wider">
                  <Shield className="w-3 h-3" /> RBI Verified
                </span>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
                  {branch.bank_name}
                </h1>
                <p className="text-muted text-sm sm:text-base mt-1">
                  {branchTitle} Branch &bull; {toTitleCase(branch.city || '')}, {branch.state_name} &bull; <span className="ifsc-mono font-semibold text-acc">{branch.ifsc}</span>
                </p>
              </div>
            </div>

            {/* Explore links */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-[10px] text-faint font-medium uppercase tracking-wider mr-1">Explore:</span>
              <Link to={`/bank/${bankSlug(branch.bank_name)}`} className="inline-flex items-center gap-1.5 text-xs text-acc hover:text-ink bg-acc-deep hover:bg-acc/20 px-3 py-1.5 rounded-lg font-semibold border border-acc/30 transition-all">
                {branch.bank_name} IFSC Codes <span>›</span>
              </Link>
              <Link to={`/state/${bankSlug(branch.bank_name)}/${branch.state_name?.toLowerCase()}`} className="inline-flex items-center gap-1.5 text-xs text-acc hover:text-ink bg-acc-deep hover:bg-acc/20 px-3 py-1.5 rounded-lg font-semibold border border-acc/30 transition-all">
                {branch.state_name} Branches <span>›</span>
              </Link>
              {branch.city && (
                <Link to={`/city/${bankSlug(branch.bank_name)}/${branch.state_name?.toLowerCase()}/${branch.city.toLowerCase()}`} className="inline-flex items-center gap-1.5 text-xs text-acc hover:text-ink bg-acc-deep hover:bg-acc/20 px-3 py-1.5 rounded-lg font-semibold border border-acc/30 transition-all">
                  {toTitleCase(branch.city)} Branches <span>›</span>
                </Link>
              )}
              {branch.pincode && (
                <Link to={`/pin/${branch.pincode}`} className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-ink bg-gold/10 hover:bg-gold/20 px-3 py-1.5 rounded-lg font-semibold border border-gold/35 transition-all">
                  PIN {branch.pincode} <span>›</span>
                </Link>
              )}
              <Link to="/bank-holidays" className="inline-flex items-center gap-1.5 text-xs text-mint hover:text-ink bg-mint/10 hover:bg-mint/20 px-3 py-1.5 rounded-lg font-semibold border border-mint/30 transition-all">
                🗓 Bank Holidays <span>›</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-line rounded-[13px] p-6 sm:p-8 mt-6"
          >
            <h2 className="font-display text-xl font-bold text-ink mb-3">
              What is IFSC Code {branch.ifsc}?
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              The IFSC code <span className="ifsc-mono font-bold text-acc">{branch.ifsc}</span> belongs to <strong className="font-semibold text-body">{branch.bank_name}</strong> {branchTitle} branch in {toTitleCase(branch.city || '')}, {branch.state_name}. It is used for NEFT, RTGS, and IMPS fund transfers.
            </p>
          </motion.div>

            </div>
          </div>
        </div>
      </header>

      <AdUnit slot={AD_SLOTS.IFSC_TOP} className="max-w-5xl mx-auto px-4 pt-4" />

      {/* ── Content ── */}
      <div className="bg-bg max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-4 pt-5">

        {/* ─ Row 1: IFSC + MICR + Payment modes — single divided card ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface border border-line rounded-[13px] overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
            {/* IFSC */}
            <div className="p-5">
              <p className="text-[10px] font-bold text-faint uppercase tracking-widest mb-2">IFSC Code</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="ifsc-mono text-2xl font-bold text-ink tracking-widest">{branch.ifsc}</span>
                <CopyBtn value={branch.ifsc} label="Copy" />
              </div>
            </div>
            {/* MICR */}
            <div className="p-5">
              <p className="text-[10px] font-bold text-faint uppercase tracking-widest mb-2">MICR Code</p>
              {branch.micr ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="ifsc-mono text-xl font-bold text-acc">{branch.micr}</span>
                  <CopyBtn value={branch.micr} label="Copy" />
                </div>
              ) : (
                <span className="text-sm text-faint">Not available</span>
              )}
            </div>
            {/* Payment modes */}
            <div className="p-5">
              <p className="text-[10px] font-bold text-faint uppercase tracking-widest mb-2.5">Payment Modes</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'NEFT', active: !!branch.neft },
                  { label: 'RTGS', active: !!branch.rtgs },
                  { label: 'IMPS', active: !!branch.imps },
                  { label: 'UPI',  active: !!branch.upi  },
                ].map(({ label, active }) => (
                  <span key={label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    active
                      ? 'bg-mint/10 text-mint border-mint/30'
                      : 'bg-surface-2 text-faint border-line'
                  }`}>
                    {active ? '✓' : '✗'} {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* IFSC Breakdown bar */}
          <div className="border-t border-line px-5 py-4 bg-surface-2">
            <p className="text-[10px] font-bold text-faint uppercase tracking-widest mb-2.5">Code Breakdown</p>
            <div className="flex items-center gap-4 flex-wrap">
              <IFSCBreakdown ifsc={branch.ifsc} />
              <p className="text-xs text-faint leading-relaxed">
                <span className="ifsc-mono font-semibold text-acc">{branch.ifsc.slice(0,4)}</span> = {branch.bank_name} ·{' '}
                <span className="ifsc-mono font-semibold text-muted">0</span> = reserved by RBI ·{' '}
                <span className="ifsc-mono font-semibold text-acc">{branch.ifsc.slice(5)}</span> = {branchTitle} branch
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─ Row 2: Branch details grid + Bank card ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Branch details — compact cell grid */}
          <div className="bg-surface border border-line rounded-[13px] lg:col-span-2 overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center gap-2">
              <Building2 className="w-4 h-4 text-acc" />
              <h2 className="font-bold text-sm text-ink">Branch Details</h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-line">
              {[
                { icon: '🏢', label: 'Branch',    value: branchTitle,                       mono: false },
                { icon: '🌆', label: 'City',      value: toTitleCase(branch.city || ''),    mono: false },
                { icon: '📍', label: 'Address',   value: toTitleCase(branch.address || ''), mono: false, span: true },
                { icon: '📌', label: 'District',  value: branch.district_name,              mono: false },
                { icon: '🗺️', label: 'State',     value: branch.state_name,                 mono: false },
                { icon: '📮', label: 'Pincode',   value: branch.pincode,                    mono: true  },
                { icon: '📞', label: 'Phone',     value: branch.phone,                      mono: false },
                { icon: '🔗', label: 'SWIFT',     value: branch.swift,                      mono: true  },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className={`px-4 py-3 ${(row as any).span ? 'col-span-2' : ''}`}>
                  <span className="block text-[9px] font-bold text-faint uppercase tracking-widest mb-1">
                    {row.icon} {row.label}
                  </span>
                  <span className={`text-sm font-semibold text-ink ${row.mono ? 'ifsc-mono' : ''}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bank identity card */}
          <div className="bg-surface border border-line rounded-[13px] p-5 flex flex-col items-center text-center">
            {branch.bank_logo_url ? (
              <img src={branch.bank_logo_url} alt={branch.bank_name} className="w-16 h-16 object-contain mb-3" />
            ) : (
              <div className="w-16 h-16 bg-acc-deep rounded-2xl flex items-center justify-center mb-3 border border-acc/30">
                <Building2 className="w-8 h-8 text-acc" />
              </div>
            )}
            <h3 className="font-bold text-sm text-ink leading-tight">{branch.bank_name}</h3>
            {branch.bank_type && (
              <span className="text-xs text-acc bg-acc-deep px-2.5 py-0.5 rounded-full mt-1.5 border border-acc/30 font-medium">{branch.bank_type}</span>
            )}
            <div className="w-full mt-3 space-y-1.5">
              {branch.bank_website && (
                <a href={branch.bank_website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-acc font-medium bg-acc-deep border border-acc/20 rounded-lg px-3 py-2 hover:bg-acc/20 transition-all w-full">
                  <ExternalLink className="w-3 h-3" /> Official Website
                </a>
              )}
              {branch.google_maps_url && (
                <a href={branch.google_maps_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-acc font-medium bg-acc-deep border border-acc/20 rounded-lg px-3 py-2 hover:bg-acc/20 transition-all w-full">
                  <MapPin className="w-3 h-3" /> View on Maps
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─ Row 3: Charges + IFSC vs MICR vs SWIFT ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Transaction Charges */}
          <div className="bg-surface border border-line rounded-[13px] overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="font-bold text-sm text-ink">Transaction Charges</h2>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-2 border-b border-line">
                  {['Amount', 'NEFT', 'RTGS', 'IMPS'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  { amt: 'Up to ₹10k',    neft: '₹2.50',  rtgs: 'Min ₹2L',  imps: '₹2.00'  },
                  { amt: '₹10k – ₹1L',   neft: '₹5.00',  rtgs: 'Min ₹2L',  imps: '₹5.00'  },
                  { amt: '₹1L – ₹2L',    neft: '₹15.00', rtgs: 'Min ₹2L',  imps: '₹12.00' },
                  { amt: '₹2L – ₹5L',    neft: '₹25.00', rtgs: '₹25.00',   imps: '₹15.00' },
                  { amt: 'Above ₹5L',     neft: '₹25.00', rtgs: '₹49.50',   imps: '₹20.00' },
                ].map(row => (
                  <tr key={row.amt} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-ink">{row.amt}</td>
                    <td className="px-3 py-2.5 text-body">{row.neft}</td>
                    <td className="px-3 py-2.5 text-muted">{row.rtgs}</td>
                    <td className="px-3 py-2.5 text-body">{row.imps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-faint px-4 py-3 border-t border-line">Indicative. GST applicable. All modes 24×7.</p>
          </div>

          {/* IFSC vs MICR vs SWIFT */}
          <div className="bg-surface border border-line rounded-[13px] overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="font-bold text-sm text-ink">IFSC vs MICR vs SWIFT</h2>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-2 border-b border-line">
                  {['Feature', 'IFSC', 'MICR', 'SWIFT'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-body">
                {[
                  { f: 'Length',   ifsc: '11 chars',      micr: '9 digits',     swift: '8–11 chars'   },
                  { f: 'Purpose',  ifsc: 'Domestic',      micr: 'Cheques',      swift: 'International' },
                  { f: 'Used in',  ifsc: 'NEFT/RTGS',     micr: 'ECS/Clearing', swift: 'FOREX/Wires'  },
                  { f: 'Assigned', ifsc: 'By RBI',        micr: 'By RBI',       swift: 'By SWIFT'     },
                  { f: 'Format',   ifsc: 'BANK0BRANCH',   micr: 'CCCBBBXXX',   swift: 'BANKCCLL'     },
                ].map(row => (
                  <tr key={row.f} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-ink">{row.f}</td>
                    <td className="px-3 py-2.5 text-acc font-medium">{row.ifsc}</td>
                    <td className="px-3 py-2.5">{row.micr}</td>
                    <td className="px-3 py-2.5">{row.swift}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {branch.swift && (
              <p className="text-[10px] text-faint px-4 py-3 border-t border-line">
                SWIFT for this branch: <span className="ifsc-mono font-bold text-acc">{branch.swift}</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* ─ Row 4: How to Use — compact cards + horizontal steps ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="bg-surface border border-line rounded-[13px] p-5"
        >
          <h2 className="font-bold text-sm text-ink mb-4">
            How to Use <span className="ifsc-mono text-acc">{branch.ifsc}</span> for Transfers (NEFT / RTGS / IMPS / UPI)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {/* NEFT */}
            <div className="rounded-xl border border-acc/30 bg-acc-deep p-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-2xl opacity-15">💸</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-acc rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Wifi className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-ink text-sm">NEFT</h3>
              </div>
              <div className="space-y-1.5 text-xs text-body">
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Timing:</strong> 24×7</span></div>
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Limit:</strong> No min/max</span></div>
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Fee:</strong> ₹0–25</span></div>
              </div>
            </div>
            {/* RTGS */}
            <div className="rounded-xl border border-violet/30 bg-violet-500/10 p-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-2xl opacity-15">⚡</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-ink text-sm">RTGS</h3>
              </div>
              <div className="space-y-1.5 text-xs text-body">
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Timing:</strong> Instant</span></div>
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Limit:</strong> Min ₹2L</span></div>
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Fee:</strong> ₹25–55</span></div>
              </div>
            </div>
            {/* IMPS */}
            <div className="rounded-xl border border-coral/30 bg-coral/10 p-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-2xl opacity-15">🚀</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-coral rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-ink text-sm">IMPS</h3>
              </div>
              <div className="space-y-1.5 text-xs text-body">
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Timing:</strong> Instant</span></div>
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Limit:</strong> Max ₹5L</span></div>
                <div className="flex items-center gap-1.5"><span className="text-mint">✓</span><span><strong>Fee:</strong> ₹0–15</span></div>
              </div>
            </div>
          </div>

          {/* Steps — horizontal */}
          <div className="bg-surface-2 rounded-xl p-4 border border-line">
            <p className="text-xs font-bold text-body mb-3">&#128203; Step-by-step transfer guide</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              {[
                { n: 1, c: 'bg-acc',        t: 'Log in to banking app' },
                { n: 2, c: 'bg-violet-500', t: 'Add Beneficiary' },
                { n: 3, c: 'bg-mint',       t: <>Enter <span className="ifsc-mono font-bold text-acc">{branch.ifsc}</span></> },
                { n: 4, c: 'bg-gold',       t: 'Activate & verify' },
                { n: 5, c: 'bg-coral',      t: 'Transfer + confirm OTP' },
              ].map(({ n, c, t }, i, arr) => (
                <span key={n} className="inline-flex items-center gap-1.5">
                  <span className={`w-5 h-5 ${c} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{n}</span>
                  <span className="text-xs text-body">{t}</span>
                  {i < arr.length - 1 && <span className="text-faint mx-0.5">›</span>}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <AdUnit slot={AD_SLOTS.IFSC_MID} />

        {/* ─ Credit Card cross-sell (only for card-issuing banks) ─ */}
        {CARD_ISSUING_BANKS.has(branch.bank_name) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}
            className="bg-gradient-to-br from-acc-deep to-surface border border-acc/30 rounded-[13px] p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-acc to-acc-2 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-ink truncate">
                    Looking for {branch.bank_name} Credit Cards?
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Compare cashback, rewards &amp; joining offers — apply online in minutes.
                  </p>
                </div>
              </div>
              <Link
                to={`/credit-cards?bank=${encodeURIComponent(branch.bank_name)}`}
                className="flex-shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-br from-acc to-acc-2 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-acc-glow transition-colors"
              >
                View Cards <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* ─ Financial tools cross-sell ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div className="bg-surface border border-line rounded-[13px] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-ink">FD Interest Rates 2026</p>
                  <p className="text-xs text-muted mt-0.5">Compare fixed deposits — up to 9.5% p.a. across all banks.</p>
                </div>
              </div>
              <Link to="/fd-rates"
                className="flex-shrink-0 inline-flex items-center gap-1.5 bg-mint text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                Compare <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="bg-surface border border-line rounded-[13px] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-acc to-acc-2 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-ink">Savings Account Rates</p>
                  <p className="text-xs text-muted mt-0.5">Up to 9% p.a. — no lock-in, withdraw anytime.</p>
                </div>
              </div>
              <Link to="/savings-rates"
                className="flex-shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-br from-acc to-acc-2 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-acc-glow transition-colors">
                Compare <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ─ Row 5: Nearby Branches + FAQ ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className={nearby.length > 0 ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}
        >
          {/* Nearby Branches */}
          {nearby.length > 0 && (
            <div className="bg-surface border border-line rounded-[13px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-sm text-ink">Other {branch.bank_name} Branches</h2>
                  <p className="text-xs text-faint mt-0.5">{toTitleCase(branch.city || '')} · {branch.district_name}</p>
                </div>
                <Link to={`/bank/${bankSlug(branch.bank_name)}`} className="text-xs text-acc hover:text-ink font-medium transition-colors whitespace-nowrap">
                  View all <ChevronRight className="w-3 h-3 inline" />
                </Link>
              </div>
              <div className="space-y-2">
                {nearby.map(nb => (
                  <Link key={nb.ifsc} to={`/ifsc/${nb.ifsc}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-line hover:border-acc hover:bg-acc-deep transition-all">
                    <div>
                      <p className="text-xs font-semibold text-ink">{toTitleCase(nb.branch_name)}</p>
                      <p className="ifsc-mono text-[11px] text-acc font-bold mt-0.5">{nb.ifsc}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-faint" />
                  </Link>
                ))}
              </div>
              <p className="text-xs text-faint mt-3">
                Browse all <Link to="/ifsc" className="text-acc hover:underline">IFSC codes in India</Link>
              </p>
            </div>
          )}

          {/* FAQ */}
          <div className="bg-surface border border-line rounded-[13px] p-5">
            <h2 className="font-bold text-sm text-ink mb-1">Frequently Asked Questions</h2>
            <p className="text-xs text-faint mb-4">About {branch.ifsc} — {branch.bank_name} {branchTitle}</p>
            <div>
              {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </motion.div>

        {/* ─ Disclaimer ─ */}
        <div className="bg-surface-2 border border-line rounded-[13px] px-5 py-3.5">
          <div className="flex items-start gap-2.5">
            <Shield className="w-3.5 h-3.5 text-faint flex-shrink-0 mt-0.5" />
            <div className="text-xs text-faint leading-relaxed">
              IFSC and MICR data on <strong className="font-medium text-muted">RupeePedia</strong> is sourced from the RBI and updated via the Razorpay open dataset. Always verify with your bank before any transaction.
              {branch.bank_website && (
                <a href={branch.bank_website} target="_blank" rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-1 text-acc hover:text-ink transition-colors">
                  Verify at {branch.bank_name} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
