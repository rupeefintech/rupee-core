import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, RefreshCw, AlertCircle, Copy, CheckCheck,
  ChevronRight, ChevronDown, Shield, Zap, Wifi, Globe,
  CreditCard, Building2, MapPin, ExternalLink,
} from 'lucide-react';
import { api, BranchDetail, NearbyBranch } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BranchCard from '../components/BranchCard';
import { generateSEO } from '../utils/seo';
// ── Helpers ───────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  if (!str) return '';  
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function bankSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

interface IFSCDetailData {
  ifsc: string;
  micr: string;
  branch: {
    name: string;
    address: string;
    city: string;
    district: string | null;
    state: string | null;
    pincode: string | null;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  bank: {
    name: string;
    shortName: string | null;
    code: string | null;
    type: string | null;
    website: string | null;
    headquarters: string | null;
  };
  services: {
    neft: boolean;
    rtgs: boolean;
    imps: boolean;
    upi: boolean;
    swift: string | null;
  };
  lastUpdated: string | null;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// ── IFSC Visual Breakdown ─────────────────────────────────────────────────────

function IFSCBreakdown({ ifsc }: { ifsc: string }) {
  const bank   = ifsc.slice(0, 4);
  const zero   = ifsc[4];
  const branch = ifsc.slice(5);
  return (
    <div className="flex items-stretch rounded-xl overflow-hidden border-2 border-brand-200 w-fit text-center">
      <div className="bg-brand-700 text-white px-5 py-3">
        <p className="ifsc-mono text-xl font-bold tracking-widest">{bank}</p>
        <p className="text-xs text-brand-200 mt-1">Bank code</p>
      </div>
      <div className="bg-brand-100 text-brand-500 px-3 py-3 border-x-2 border-brand-200">
        <p className="ifsc-mono text-xl font-bold">{zero}</p>
        <p className="text-xs text-brand-400 mt-1">Reserved</p>
      </div>
      <div className="bg-brand-50 text-brand-800 px-5 py-3">
        <p className="ifsc-mono text-xl font-bold tracking-widest">{branch}</p>
        <p className="text-xs text-brand-500 mt-1">Branch code</p>
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-brand-200 text-brand-600 hover:bg-brand-50 hover:border-brand-400 transition-all active:scale-95 text-xs font-medium"
    >
      {copied
        ? <><CheckCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600">Copied!</span></>
        : <><Copy className="w-3 h-3" />{label && <span>{label}</span>}</>}
    </button>
  );
}

// ── Payment Badge ─────────────────────────────────────────────────────────────

function PayBadge({ label, active, icon, desc }: { label: string; active: boolean; icon: React.ReactNode; desc: string }) {
  return (
    <div title={desc} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
      ${active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-bold tracking-wider">{label}</span>
      <span className="text-[10px] mt-0.5 font-medium">{active ? 'Enabled' : 'N/A'}</span>
    </div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-4 flex items-start justify-between gap-3 group"
      >
        <span className="text-sm font-semibold text-brand-900 leading-snug group-hover:text-brand-700 transition-colors">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
            <p className="text-sm text-gray-500 leading-relaxed pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nearby Branch Card ────────────────────────────────────────────────────────

function NearbyCard({ branch }: { branch: NearbyBranch }) {
  return (
    <Link
      to={`/ifsc/${branch.ifsc}`}
      className="block p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-900 truncate group-hover:text-brand-700 transition-colors">
            {toTitleCase(branch.branch_name)}
          </p>
          {branch.city && <p className="text-xs text-gray-400 mt-0.5 truncate">{toTitleCase(branch.city)}</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 flex-shrink-0 mt-0.5 transition-colors" />
      </div>
      <p className="ifsc-mono text-xs text-brand-600 mt-2 font-medium">{branch.ifsc}</p>
    </Link>
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
      { '@type': 'ListItem', position: 3, name: branch.bank_name, item: `https://rupeepedia.in/ifsc/${bankSlug(branch.bank_name)}` },
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
    data: branch, isLoading, isError, refetch,
  } = useQuery<BranchDetail>({
    queryKey:  ['ifsc', ifscCode],
    queryFn:   () => api.getByIfsc(ifscCode),
    enabled:   !!ifscCode,
    retry:     1,
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
    return (
      <div className="hero-bg min-h-screen py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link to="/ifsc" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </Link>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-900 mb-2">IFSC Code Not Found</h1>
            <p className="text-gray-500 mb-2">
              <span className="ifsc-mono font-bold text-brand-700">{ifscCode}</span> was not found in our database.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              This may be a newly added branch or the code might be incorrect. Please verify with your bank.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <Link to="/ifsc" className="btn-primary">New Search</Link>
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
  //const pageTitle       = `${branch.ifsc} IFSC Code — ${branch.bank_name} ${branchTitle} | RupeePedia`;
  //const pageDescription = `IFSC code for ${branch.bank_name}, ${branchTitle} branch is ${branch.ifsc}. MICR: ${branch.micr || 'N/A'}. ${toTitleCase(branch.address || '')}, ${toTitleCase(branch.city || '')}, ${branch.state_name}${branch.pincode ? ' — ' + branch.pincode : ''}. Supports NEFT, RTGS, IMPS, UPI transfers.`;
  const canonicalUrl    = `https://rupeepedia.in/ifsc/${branch.ifsc}`;
  const pageTitle       = seo.title;
  const pageDescription = seo.description;

  
  const faqs = [
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
      <section className="hero-bg py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/ifsc" className="hover:text-brand-600 transition-colors">IFSC Finder</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/ifsc/${bankSlug(branch.bank_name)}`} className="hover:text-brand-600 transition-colors">{branch.bank_name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-500">{branch.state_name}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-600 font-medium ifsc-mono">{branch.ifsc}</span>
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-brand-400" />
                </div>
              )}
              <div>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 border border-emerald-200 uppercase tracking-wider">
                  <Shield className="w-3 h-3" /> RBI Verified
                </span>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-900 leading-tight">
                  {branch.bank_name}
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">
                  {branchTitle} Branch &bull; {toTitleCase(branch.city || '')}, {branch.state_name} &bull; <span className="ifsc-mono font-semibold text-brand-600">{branch.ifsc}</span>
                </p>
              </div>
            </div>

            {/* Explore links */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Explore:</span>
              <Link to={`/bank/${bankSlug(branch.bank_name)}`} className="text-xs text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full font-medium transition-all border border-brand-100">
                {branch.bank_name} IFSC Codes
              </Link>
              <Link to={`/state/${bankSlug(branch.bank_name)}/${branch.state_name?.toLowerCase()}`} className="text-xs text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full font-medium transition-all border border-brand-100">
                {branch.state_name} branches
              </Link>
              {branch.city && (
                <Link to={`/city/${bankSlug(branch.bank_name)}/${branch.state_name?.toLowerCase()}/${branch.city.toLowerCase()}`} className="text-xs text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full font-medium transition-all border border-brand-100">
                  {toTitleCase(branch.city)} branches
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 sm:p-8"
          >
            <h2 className="font-display text-xl font-bold text-brand-900 mb-3">
              What is IFSC Code {branch.ifsc}?
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              The IFSC code <span className="ifsc-mono font-bold text-brand-700">{branch.ifsc}</span> belongs to <strong className="font-semibold text-gray-800">{branch.bank_name}</strong> {branchTitle} branch in {toTitleCase(branch.city || '')}, {branch.state_name}. It is used for NEFT, RTGS, and IMPS fund transfers.
            </p>
          </motion.div>

        </div>
      </section>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4 pb-20 space-y-6">

        {/* ─ 1. IFSC Hero Card ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

            {/* IFSC + MICR codes */}
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">IFSC Code</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="ifsc-mono text-3xl font-bold text-brand-800 tracking-widest">{branch.ifsc}</span>
                  <CopyBtn value={branch.ifsc} label="Copy IFSC" />
                </div>
              </div>
              {branch.micr && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">MICR Code</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="ifsc-mono text-2xl font-bold text-brand-700">{branch.micr}</span>
                    <CopyBtn value={branch.micr} label="Copy MICR" />
                  </div>
                </div>
              )}
            </div>

            {/* Payment modes */}
            <div className="flex-shrink-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Payment Modes</p>
              <div className="grid grid-cols-4 gap-2">
                <PayBadge label="NEFT" active={!!branch.neft} desc="National Electronic Funds Transfer" icon={<Wifi    className="w-4 h-4" />} />
                <PayBadge label="RTGS" active={!!branch.rtgs} desc="Real Time Gross Settlement"        icon={<Zap     className="w-4 h-4" />} />
                <PayBadge label="IMPS" active={!!branch.imps} desc="Immediate Payment Service"        icon={<CreditCard className="w-4 h-4" />} />
                <PayBadge label="UPI"  active={!!branch.upi}  desc="Unified Payments Interface"       icon={<Globe   className="w-4 h-4" />} />
              </div>
            </div>
          </div>

          {/* IFSC Breakdown visual */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">IFSC Code Breakdown</p>
            <IFSCBreakdown ifsc={branch.ifsc} />
            <p className="text-xs text-gray-400 mt-3 max-w-lg leading-relaxed">
              <span className="ifsc-mono font-semibold text-brand-700">{branch.ifsc.slice(0,4)}</span> identifies{' '}
              <strong className="font-semibold text-gray-600">{branch.bank_name}</strong>.{' '}
              The <span className="ifsc-mono font-semibold text-brand-500">0</span> is reserved by RBI for future use.{' '}
              <span className="ifsc-mono font-semibold text-brand-700">{branch.ifsc.slice(5)}</span> is the unique code for {branchTitle}.
            </p>
          </div>
        </motion.div>

        {/* ─ 2. Branch Details ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-6 sm:p-8"
        >
          {/* Two-column layout: Bank card + Branch info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Bank identity card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-5 border border-brand-100 h-full">
                <div className="flex flex-col items-center text-center">
                  {branch.bank_logo_url ? (
                    <img
                      src={branch.bank_logo_url}
                      alt={branch.bank_name}
                      className="w-24 h-24 object-contain mb-3"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-3">
                      <Building2 className="w-12 h-12 text-brand-300" />
                    </div>
                  )}
                  <h3 className="font-display text-lg font-bold text-brand-900">{branch.bank_name}</h3>
                  {branch.bank_type && (
                    <span className="text-xs text-brand-500 bg-brand-100 px-3 py-1 rounded-full mt-2 font-medium border border-brand-200">
                      {branch.bank_type}
                    </span>
                  )}
                  <div className="w-full mt-4 space-y-2">
                    {branch.bank_website && (
                      <a
                        href={branch.bank_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs text-brand-600 hover:text-brand-800 font-medium bg-white border border-brand-200 rounded-xl px-4 py-2.5 hover:bg-brand-50 transition-all w-full"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Official Website
                      </a>
                    )}
                    {branch.google_maps_url && (
                      <a
                        href={branch.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs text-brand-600 hover:text-brand-800 font-medium bg-white border border-brand-200 rounded-xl px-4 py-2.5 hover:bg-brand-50 transition-all w-full"
                      >
                        <MapPin className="w-3.5 h-3.5" /> View on Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Branch details table */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-xl font-bold text-brand-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-600" /> Branch Details
              </h2>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Branch',       value: branchTitle,      icon: '🏢' },
                  { label: 'Address',      value: toTitleCase(branch.address || ''), icon: '📍' },
                  { label: 'City',         value: toTitleCase(branch.city || ''),     icon: '🌆' },
                  { label: 'District',     value: branch.district_name,              icon: '📌' },
                  { label: 'State',        value: branch.state_name,                 icon: '🗺️' },
                  { label: 'Pincode',      value: branch.pincode,     mono: true,    icon: '📮' },
                  { label: 'Phone',        value: branch.phone,                      icon: '📞' },
                  { label: 'SWIFT Code',   value: branch.swift,       mono: true,    icon: '🔗' },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex items-start gap-3 py-3.5 group">
                    <span className="text-sm mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">{row.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                        {row.label}
                      </span>
                      <span className={`text-sm font-medium text-brand-900 ${row.mono ? 'ifsc-mono' : ''}`}>
                        {row.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─ 3. Transaction Charges ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card p-6 sm:p-8"
        >
          <h2 className="font-display text-xl font-bold text-brand-900 mb-5">
            NEFT · RTGS · IMPS Transaction Charges
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50 border-b border-gray-100">
                  {['Transfer Amount', 'NEFT', 'RTGS', 'IMPS'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { amt: 'Up to ₹10,000',        neft: '₹2.50',  rtgs: 'Min. ₹2 lakh', imps: '₹2.00'  },
                  { amt: '₹10,001 – ₹1 lakh',    neft: '₹5.00',  rtgs: 'Min. ₹2 lakh', imps: '₹5.00'  },
                  { amt: '₹1 lakh – ₹2 lakh',    neft: '₹15.00', rtgs: 'Min. ₹2 lakh', imps: '₹12.00' },
                  { amt: '₹2 lakh – ₹5 lakh',    neft: '₹25.00', rtgs: '₹25.00',       imps: '₹15.00' },
                  { amt: 'Above ₹5 lakh',         neft: '₹25.00', rtgs: '₹49.50',       imps: '₹20.00' },
                ].map(row => (
                  <tr key={row.amt} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-900">{row.amt}</td>
                    <td className="px-4 py-3 text-gray-600">{row.neft}</td>
                    <td className="px-4 py-3 text-gray-600">{row.rtgs}</td>
                    <td className="px-4 py-3 text-gray-600">{row.imps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">Charges are indicative and may vary by bank. GST applicable. All three modes operate 24×7, 365 days a year.</p>
        </motion.div>

        {/* ─ 5. What is IFSC? — Educational block ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="card p-6 sm:p-8"
        >
          <h2 className="font-display text-xl font-bold text-brand-900 mb-4">
            What is an IFSC Code?
          </h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              The <strong className="font-semibold text-gray-800">Indian Financial System Code (IFSC)</strong> is a unique
              11-character alphanumeric code assigned by the Reserve Bank of India (RBI) to every bank branch
              participating in India's electronic payment systems — NEFT, RTGS, and IMPS.
            </p>
            <p>
              The code <span className="ifsc-mono font-bold text-brand-700">{branch.ifsc}</span> identifies the{' '}
              <strong className="font-semibold text-gray-800">{branch.bank_name}, {branchTitle}</strong> branch
              located in {toTitleCase(branch.city || '')}, {branch.state_name}.
            </p>
          </div>
        </motion.div>

        {/* ─ 5b. How to Use This IFSC (Colorful Cards) ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }}
          className="card p-6 sm:p-8"
        >
          <h2 className="font-display text-2xl font-bold text-brand-900 mb-2">
            How to Use {branch.ifsc} for Bank Transfers (NEFT/RTGS/IMPS/UPI)
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Use this IFSC code when transferring money to any account at <strong className="text-gray-700">{branch.bank_name} {branchTitle}</strong> branch. Here's how different transfer methods work:
          </p>

          {/* Transfer method cards - colorful */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* NEFT Card */}
            <div className="rounded-2xl border-2 border-brand-100 bg-gradient-to-br from-brand-50 to-brand-100 p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-3xl opacity-20">💸</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-200">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-brand-900 text-lg">NEFT</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">National Electronic Funds Transfer. Batch settlements.</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Timing:</strong> 24x7 Available</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Limit:</strong> No minimum or maximum limit</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Charges:</strong> &#8377;0-25 based on amount</p>
                </div>
              </div>
            </div>

            {/* RTGS Card */}
            <div className="rounded-2xl border-2 border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-3xl opacity-20">&#9889;</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-violet-900 text-lg">RTGS</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">Real Time Gross Settlement. Instant settlement. Best for high-value transfers.</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Timing:</strong> 24x7 Available</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Limit:</strong> Min &#8377;2 Lakhs</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Charges:</strong> &#8377;25-55 based on amount</p>
                </div>
              </div>
            </div>

            {/* IMPS Card */}
            <div className="rounded-2xl border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-3xl opacity-20">&#128640;</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center shadow-md shadow-rose-200">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-rose-900 text-lg">IMPS</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">Immediate Payment Service. Instant. Mobile and internet banking.</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Timing:</strong> Instant (24x7)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Limit:</strong> Max &#8377;5 Lakhs per transaction</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  <p className="text-sm text-gray-700"><strong className="text-gray-900">Charges:</strong> &#8377;0-15 based on bank</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-step guide */}
          <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-slate-50 p-6">
            <h3 className="font-display text-lg font-bold text-brand-900 mb-5 flex items-center gap-2">
              &#128203; Step-by-Step: How to Transfer Money Using This IFSC Code
            </h3>
            <div className="space-y-4">
              {[
                { step: 1, color: 'bg-brand-500', text: 'Log in to your bank\'s net banking or mobile banking app' },
                { step: 2, color: 'bg-violet-500', text: 'Go to "Add Beneficiary" or "Manage Payee" section' },
                { step: 3, color: 'bg-emerald-500', text: <>Enter beneficiary's account number and <span className="ifsc-mono font-bold text-brand-700">{branch.ifsc}</span> as IFSC code</> },
                { step: 4, color: 'bg-amber-500', text: 'Verify details and complete beneficiary activation (usually instant or 30 minutes)' },
                { step: 5, color: 'bg-rose-500', text: 'Select NEFT/RTGS/IMPS, enter amount, and confirm the transfer' },
              ].map(({ step, color, text }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className="text-white text-sm font-bold">{step}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed pt-1.5">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─ 6. IFSC vs MICR vs SWIFT ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card p-6 sm:p-8"
        >
          <h2 className="font-display text-xl font-bold text-brand-900 mb-5">
            IFSC vs MICR vs SWIFT — Key Differences
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50 border-b border-gray-100">
                  {['Feature', 'IFSC', 'MICR', 'SWIFT'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {[
                  { f: 'Length',    ifsc: '11 characters',        micr: '9 digits',              swift: '8 or 11 characters' },
                  { f: 'Purpose',   ifsc: 'Domestic transfers',   micr: 'Cheque processing',     swift: 'International wires' },
                  { f: 'Used in',   ifsc: 'NEFT, RTGS, IMPS',    micr: 'ECS, cheque clearing',  swift: 'FOREX, wire transfers' },
                  { f: 'Assigned',  ifsc: 'By RBI',               micr: 'By RBI',                swift: 'By SWIFT network' },
                  { f: 'Format',    ifsc: 'BANK0BRANCH',          micr: 'CCCBBBXXX',             swift: 'BANKCCLL(BBB)' },
                ].map(row => (
                  <tr key={row.f} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-900">{row.f}</td>
                    <td className="px-4 py-3 text-brand-700 font-medium">{row.ifsc}</td>
                    <td className="px-4 py-3">{row.micr}</td>
                    <td className="px-4 py-3">{row.swift}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {branch.swift && (
            <p className="text-xs text-gray-500 mt-3">
              The SWIFT code for {branch.bank_name} {branchTitle} is{' '}
              <span className="ifsc-mono font-bold text-brand-700">{branch.swift}</span>.
            </p>
          )}
        </motion.div>

        {/* ─ 7. Nearby Branches ─ */}
        {nearby.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="card p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-900">
                    Other {branch.bank_name} branches in {toTitleCase(branch.city || '')}
                </h2>
            
                <p className="text-sm text-gray-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 inline mr-1" />
                  Same bank &bull; {branch.district_name} district
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Looking for more IFSC codes? Browse all <Link to="/ifsc" className="text-brand-600 hover:underline">IFSC codes in India</Link>.
                </p>
              </div>
              <Link
                to={`/ifsc/${bankSlug(branch.bank_name)}`}
                className="hidden sm:flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors whitespace-nowrap"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nearby.map(nb => <NearbyCard key={nb.ifsc} branch={nb} />)}
            </div>
            <Link
              to={`/ifsc/${bankSlug(branch.bank_name)}`}
              className="sm:hidden mt-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              View all {branch.bank_name} branches <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* ─ 8. FAQ ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card p-6 sm:p-8"
        >
          <h2 className="font-display text-xl font-bold text-brand-900 mb-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-400 mb-5">About {branch.ifsc} — {branch.bank_name} {branchTitle}</p>
          <div>
            {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </motion.div>

        {/* ─ 9. Disclaimer ─ */}
        <div className="card p-5 bg-gray-50">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400 leading-relaxed">
              <p>
                IFSC and MICR data on <strong className="font-medium text-gray-500">RupeePedia</strong> is sourced
                from the Reserve Bank of India (RBI) and updated regularly via the Razorpay open dataset. Always
                verify codes directly with your bank before initiating any financial transaction. This information
                is provided for reference only.
              </p>
              {branch.bank_website && (
                <a href={branch.bank_website} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-brand-500 hover:text-brand-700 transition-colors">
                  Verify at {branch.bank_name} official website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
