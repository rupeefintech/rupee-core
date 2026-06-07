import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Search, Building2, MapPin, ExternalLink, ArrowRight,
  Copy, Check, ChevronDown, ChevronUp, Globe, ShieldCheck,
} from 'lucide-react';
import { api } from '../utils/api';

// ── Static data ───────────────────────────────────────────────────────────────
const POPULAR_SWIFT: { bank: string; swift: string; hq: string }[] = [
  { bank: 'State Bank of India',     swift: 'SBININBB', hq: 'Mumbai'   },
  { bank: 'HDFC Bank',               swift: 'HDFCINBB', hq: 'Mumbai'   },
  { bank: 'ICICI Bank',              swift: 'ICICINBB', hq: 'Mumbai'   },
  { bank: 'Axis Bank',               swift: 'AXISINBB', hq: 'Mumbai'   },
  { bank: 'Kotak Mahindra Bank',     swift: 'KKBKINBB', hq: 'Mumbai'   },
  { bank: 'Punjab National Bank',    swift: 'PUNBINBB', hq: 'New Delhi'},
  { bank: 'Bank of Baroda',          swift: 'BARBINBB', hq: 'Vadodara' },
  { bank: 'Canara Bank',             swift: 'CNRBINBB', hq: 'Bangalore'},
  { bank: 'IndusInd Bank',           swift: 'INDBINBB', hq: 'Pune'     },
  { bank: 'Yes Bank',                swift: 'YESBINBB', hq: 'Mumbai'   },
  { bank: 'IDFC FIRST Bank',         swift: 'IDFBINBB', hq: 'Mumbai'   },
  { bank: 'Federal Bank',            swift: 'FDRLINBB', hq: 'Aluva'    },
  { bank: 'Citibank India',          swift: 'CITIINBX', hq: 'Mumbai'   },
  { bank: 'HSBC India',              swift: 'HSBCINBB', hq: 'Mumbai'   },
  { bank: 'Standard Chartered India',swift: 'SCBLINBB', hq: 'Mumbai'   },
];

const FAQS = [
  {
    q: 'What is a SWIFT code?',
    a: 'A SWIFT code (Society for Worldwide Interbank Financial Telecommunication) is a unique 8–11 character identifier assigned to banks for international wire transfers. It is also called a BIC (Bank Identifier Code). SWIFT codes are required any time money is sent across international borders.',
  },
  {
    q: 'Is BIC code the same as SWIFT code?',
    a: 'Yes. BIC (Bank Identifier Code) and SWIFT code are the same thing — two names for the same standard. SWIFT is the organization that maintains the registry; BIC is the technical name for the code itself. You will see both terms used interchangeably on bank forms.',
  },
  {
    q: 'How many characters does a SWIFT code have?',
    a: 'A SWIFT code has either 8 or 11 characters. The 8-character version (e.g., HDFCINBB) represents the bank\'s primary / head-office code. The 11-character version (e.g., HDFCINBBXXX) includes a 3-character branch suffix. If a branch suffix ends in XXX, it means the head-office code is being used.',
  },
  {
    q: 'What does each part of a SWIFT code mean?',
    a: 'A SWIFT code has four parts: (1) Bank Code — 4 letters identifying the bank (e.g., HDFC for HDFC Bank). (2) Country Code — 2 letters for the country (IN = India). (3) Location Code — 2 letters/digits for city or region (BB = Mumbai). (4) Branch Code — optional 3-character suffix identifying a specific branch (XXX = head office).',
  },
  {
    q: 'What is the difference between SWIFT code and IFSC code?',
    a: 'SWIFT codes are used for international (cross-border) wire transfers — sending or receiving money from abroad. IFSC codes are used for domestic transfers within India only (NEFT, RTGS, IMPS, UPI). If you are sending money from India to another country or receiving a foreign wire, you need the SWIFT code. For transfers between Indian bank accounts, use the IFSC code.',
  },
  {
    q: 'Is the SWIFT code the same for all branches of a bank?',
    a: 'Usually, all branches of an Indian bank share the same 8-character SWIFT code (head-office code). Some large banks have branch-level 11-character SWIFT codes for specific branches that handle international transactions directly. When in doubt, use the 8-character head-office code — your bank will route it correctly.',
  },
  {
    q: 'Do I need a SWIFT code for UPI or domestic NEFT/RTGS transfers?',
    a: 'No. SWIFT codes are only required for international transfers. For UPI, NEFT, RTGS, and IMPS transfers within India, you only need the IFSC code and the recipient\'s account number.',
  },
  {
    q: 'Where can I find my bank\'s SWIFT code?',
    a: 'You can find your bank\'s SWIFT code on: (1) your bank\'s official website (usually under "International Banking" or "SWIFT/Wire Transfer"); (2) your bank statement or cheque book; (3) by searching this page. When in doubt, call your branch\'s customer care to confirm.',
  },
  {
    q: 'What happens if I enter the wrong SWIFT code?',
    a: 'If the SWIFT code is incorrect, the international transfer may be delayed, returned, or sent to the wrong bank. Many transfers go through correspondent banks, and an incorrect SWIFT code may result in fees and delays. Always verify the SWIFT code with the recipient or your bank before initiating any transfer.',
  },
  {
    q: 'How often do SWIFT codes change?',
    a: 'SWIFT codes are very stable and rarely change. They may change after a bank merger or acquisition (e.g., when a bank is absorbed into another). For Indian banks, significant code changes happen once every few years at most. It\'s always good practice to confirm the code for large transfers.',
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={`Copy ${text}`}>
      {copied
        ? <Check className="w-4 h-4 text-green-500" />
        : <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
    </button>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex justify-between items-center px-5 py-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-brand-500 flex-shrink-0 ml-3" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
          {a}
        </div>
      )}
    </div>
  );
}

function parseSwiftParts(code: string) {
  const c = code.toUpperCase();
  return {
    bankCode:     c.slice(0, 4),
    countryCode:  c.slice(4, 6),
    locationCode: c.slice(6, 8),
    branchCode:   c.length > 8 ? c.slice(8) : 'XXX',
  };
}

function SwiftResultCard({ result }: { result: any }) {
  const parts = parseSwiftParts(result.swift);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-50 to-blue-50 px-6 py-5 flex items-start gap-4 border-b border-gray-100">
        {result.bank_logo ? (
          <img src={result.bank_logo} alt={result.bank_name} className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-white p-1 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-extrabold text-xl flex-shrink-0">
            {result.bank_name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-extrabold text-2xl text-brand-800 tracking-widest">{result.swift}</span>
            <CopyBtn text={result.swift} />
          </div>
          <p className="text-gray-600 text-sm font-medium mt-0.5">{result.bank_name}</p>
        </div>
        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex-shrink-0 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Valid
        </span>
      </div>

      {/* SWIFT breakdown */}
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Code Breakdown</p>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Bank Code',    value: parts.bankCode,     color: 'bg-brand-100 text-brand-800 border-brand-200', desc: 'Identifies the bank' },
            { label: 'Country',      value: parts.countryCode,  color: 'bg-green-100 text-green-800 border-green-200', desc: 'IN = India'           },
            { label: 'Location',     value: parts.locationCode, color: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'City / region'        },
            { label: 'Branch',       value: parts.branchCode,   color: 'bg-gray-100  text-gray-700  border-gray-200',  desc: 'XXX = head office'   },
          ].map(p => (
            <div key={p.label} className="text-center">
              <div className={`font-mono font-bold text-lg px-4 py-2 rounded-xl border ${p.color}`}>{p.value}</div>
              <div className="text-xs font-semibold text-gray-500 mt-1">{p.label}</div>
              <div className="text-[11px] text-gray-400">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch details */}
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">Branch Details</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <Building2 className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
              <span className="font-medium">{result.branch_name}</span>
            </div>
            {result.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 text-xs leading-relaxed">{result.address}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 pl-5">
              {[result.city, result.district_name, result.state_name, result.pincode].filter(Boolean).join(', ')}
            </p>
            {result.phone && <p className="text-xs text-gray-500 pl-5">📞 {result.phone}</p>}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">Transfer Methods</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'NEFT',  active: result.neft },
              { label: 'RTGS',  active: result.rtgs },
              { label: 'IMPS',  active: result.imps },
              { label: 'UPI',   active: result.upi  },
              { label: 'SWIFT', active: 1            },
            ].map(cap => (
              <span key={cap.label}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${cap.active
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                {cap.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <Link to={`/ifsc/${result.ifsc}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
          Full branch details (IFSC: {result.ifsc}) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {result.bank_website && (
          <a href={result.bank_website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors">
            Official website <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Static SWIFT card — for banks whose codes are known but not in DB ──────────
function StaticSwiftCard({ row }: { row: { bank: string; swift: string; hq: string } }) {
  const parts = parseSwiftParts(row.swift);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-50 to-blue-50 px-6 py-5 flex items-start gap-4 border-b border-gray-100">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-extrabold text-xl flex-shrink-0">
          {row.bank.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-extrabold text-2xl text-brand-800 tracking-widest">{row.swift}</span>
            <CopyBtn text={row.swift} />
          </div>
          <p className="text-gray-600 text-sm font-medium mt-0.5">{row.bank}</p>
        </div>
        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex-shrink-0">Head Office Code</span>
      </div>
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Code Breakdown</p>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Bank Code',  value: parts.bankCode,     color: 'bg-brand-100 text-brand-800 border-brand-200'  },
            { label: 'Country',    value: parts.countryCode,  color: 'bg-green-100 text-green-800 border-green-200'  },
            { label: 'Location',   value: parts.locationCode, color: 'bg-amber-100 text-amber-800 border-amber-200'  },
            { label: 'Branch',     value: parts.branchCode,   color: 'bg-gray-100  text-gray-700  border-gray-200'   },
          ].map(p => (
            <div key={p.label} className="text-center">
              <div className={`font-mono font-bold text-lg px-4 py-2 rounded-xl border ${p.color}`}>{p.value}</div>
              <div className="text-xs font-semibold text-gray-500 mt-1">{p.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 py-5 flex items-start gap-3 bg-amber-50 border-t border-amber-100">
        <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-700 leading-relaxed">
          <strong>Head office code</strong> — valid for most international transfers to any {row.bank} branch.
          Headquarters: {row.hq}. Always confirm with your bank before sending.
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
// Chips use SWIFT codes directly — most reliable since few banks have DB branch data
const QUICK_SEARCH = [
  { label: 'SBI',    swift: 'SBININBB' },
  { label: 'HDFC',   swift: 'HDFCINBB' },
  { label: 'ICICI',  swift: 'ICICINBB' },
  { label: 'Axis',   swift: 'AXISINBB' },
  { label: 'Kotak',  swift: 'KKBKINBB' },
  { label: 'PNB',    swift: 'PUNBINBB' },
  { label: 'BoB',    swift: 'BARBINBB' },
  { label: 'Yes',    swift: 'YESBINBB' },
];

export default function SwiftCodePage() {
  const [input,           setInput]           = useState('');
  const [query,           setQuery]           = useState('');
  const [exactCode,       setExactCode]       = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSwift,   setSelectedSwift]   = useState<string | null>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const suggestRef= useRef<HTMLDivElement>(null);

  const looksLikeSwift = /^[A-Za-z0-9]{8,11}$/.test(input.trim()) && !/\s/.test(input.trim());

  const { data: exactResult, isFetching: exactLoading, isError: exactError } = useQuery({
    queryKey: ['swift-exact', exactCode],
    queryFn:  () => api.getSwiftCode(exactCode),
    enabled:  exactCode.length >= 8,
    retry:    false,
  });

  const { data: searchData, isFetching: searchLoading } = useQuery({
    queryKey:  ['swift-search', query],
    queryFn:   () => api.searchSwift(query),
    enabled:   query.length >= 2 && !exactCode,
    staleTime: 60_000,
  });

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        suggestRef.current && !suggestRef.current.contains(e.target as Node) &&
        inputRef.current   && !inputRef.current.contains(e.target as Node)
      ) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function doSearch() {
    const val = input.trim().toUpperCase();
    if (!val) return;
    if (looksLikeSwift) {
      setExactCode(val); setQuery(''); setShowSuggestions(false);
    } else {
      setExactCode(''); setQuery(val); setShowSuggestions(true);
    }
  }

  function onInputChange(v: string) {
    setInput(v);
    setExactCode('');
    if (v.trim().length >= 2 && !/^[A-Za-z0-9]{8,11}$/.test(v.trim())) {
      setQuery(v.trim()); setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(swift: string) {
    setInput(swift); setExactCode(swift.toUpperCase());
    setQuery(''); setShowSuggestions(false); setSelectedSwift(swift);
  }

  function quickSearch(q: string) {
    setInput(q); setExactCode(''); setQuery(q);
    setShowSuggestions(true); inputRef.current?.focus();
  }

  function lookupStatic(swift: string) {
    setInput(swift); setExactCode(swift);
    setQuery(''); setShowSuggestions(false); setSelectedSwift(swift);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // searchData is the array directly (unwrapResponse strips the { data: [...] } wrapper)
  const suggestions: any[] = Array.isArray(searchData) ? searchData : (searchData?.data ?? []);

  // JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',              item: 'https://rupeepedia.in'                    },
          { '@type': 'ListItem', position: 2, name: 'IFSC Code Finder',  item: 'https://rupeepedia.in/ifsc-finder'        },
          { '@type': 'ListItem', position: 3, name: 'SWIFT Code Lookup', item: 'https://rupeepedia.in/swift-code-lookup'  },
        ],
      },
      {
        '@type': 'WebPage',
        name:        'SWIFT / BIC Code Lookup India',
        url:         'https://rupeepedia.in/swift-code-lookup',
        description: 'Find SWIFT/BIC codes for any Indian bank. Used for international wire transfers.',
        provider:    { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>SWIFT / BIC Code Lookup India — Find Any Bank SWIFT Code | RupeePedia</title>
        <meta name="description" content="Look up SWIFT/BIC codes for any Indian bank instantly. Find codes for SBI (SBININBB), HDFC (HDFCINBB), ICICI (ICICINBB), Axis and 1,000+ banks. Verify before international wire transfers." />
        <meta name="keywords" content="swift code lookup india, bic code search india, hdfc swift code, sbi swift code, icici swift code, axis bank swift code, swift code for international transfer india, bank bic code india" />
        <link rel="canonical" href="https://rupeepedia.in/swift-code-lookup" />
        <meta property="og:title"       content="SWIFT / BIC Code Lookup India — Find Any Bank SWIFT Code" />
        <meta property="og:description" content="Find SWIFT/BIC codes for any Indian bank instantly. 1,000+ banks covered. Verify before international wire transfers." />
        <meta property="og:url"         content="https://rupeepedia.in/swift-code-lookup" />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card"       content="summary" />
        <meta name="twitter:title"      content="SWIFT / BIC Code Lookup India | RupeePedia" />
        <meta name="twitter:description" content="Find SWIFT/BIC codes for SBI, HDFC, ICICI, Axis and 1,000+ Indian banks. Free instant lookup." />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-12">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-brand-300 text-xs mb-5">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <Link to="/ifsc-finder" className="hover:text-white transition-colors">IFSC Finder</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-white font-medium">SWIFT Code Lookup</span>
            </nav>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">SWIFT / BIC Code Lookup</h1>
                <p className="text-brand-200 mt-1 text-sm">India's most complete SWIFT code directory — 1,000+ banks</p>
              </div>
            </div>
            <p className="text-brand-200 text-base mb-8 max-w-2xl">
              Enter a SWIFT/BIC code or bank name to instantly find branch details for international wire transfers.
            </p>

            {/* Search box */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doSearch()}
                    placeholder="Enter SWIFT code (HDFCINBB) or bank name…"
                    className="w-full pl-11 pr-4 py-4 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-lg"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button onClick={doSearch}
                  className="px-6 py-4 bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-white font-bold rounded-xl shadow-lg transition-colors text-sm whitespace-nowrap">
                  Search
                </button>
              </div>

              {/* Autocomplete suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  {suggestions.slice(0, 8).map((s: any) => (
                    <button key={s.ifsc} onClick={() => selectSuggestion(s.swift)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-50 text-left transition-colors border-b border-gray-50 last:border-0">
                      {s.bank_logo
                        ? <img src={s.bank_logo} alt="" className="w-7 h-7 object-contain rounded flex-shrink-0" />
                        : <div className="w-7 h-7 bg-brand-100 rounded flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">{s.bank_name.charAt(0)}</div>}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-brand-800">{s.swift}</span>
                          <span className="text-xs text-gray-400 truncate">{s.bank_name}</span>
                        </div>
                        <div className="text-xs text-gray-400 truncate">{s.branch_name}{s.city ? `, ${s.city}` : ''}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick chips — use exact SWIFT code lookup */}
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_SEARCH.map(p => (
                <button key={p.label} onClick={() => lookupStatic(p.swift)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full transition-colors border border-white/20">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          {/* Exact SWIFT result */}
          {exactCode && (
            <div>
              {exactLoading && (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Looking up <span className="font-mono font-bold text-brand-700">{exactCode}</span>…</p>
                </div>
              )}
              {exactError && !exactLoading && (() => {
                const staticMatch = POPULAR_SWIFT.find(p => p.swift.toUpperCase() === exactCode);
                return staticMatch ? (
                  <StaticSwiftCard row={staticMatch} />
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-red-100">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="font-semibold text-gray-800 mb-1">SWIFT code not found</p>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      <span className="font-mono font-bold text-brand-700">{exactCode}</span> isn't in our directory.
                      Verify the code with your bank before initiating a transfer.
                    </p>
                  </div>
                );
              })()}
              {exactResult && !exactLoading && <SwiftResultCard result={exactResult} />}
            </div>
          )}

          {/* Search results list */}
          {!exactCode && query && (
            <div>
              {searchLoading && (
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
              {!searchLoading && suggestions.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-5 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm mb-1">
                      No branch-level SWIFT data found for "{query}"
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Our database has full branch SWIFT data for HDFC Bank and SBI only. For other banks, use the head-office code below — valid for most international transfers.
                    </p>
                  </div>
                  {/* Match against static table */}
                  {(() => {
                    const q = query.toLowerCase();
                    const matches = POPULAR_SWIFT.filter(p =>
                      p.bank.toLowerCase().includes(q) || p.swift.toLowerCase().includes(q)
                    );
                    if (matches.length === 0) return (
                      <div className="px-5 py-4 text-xs text-gray-400">
                        Try using the exact SWIFT code (e.g. <span className="font-mono font-bold text-brand-700">ICICINBB</span>) or search "HDFC" / "SBI" for branch-level results.
                      </div>
                    );
                    return (
                      <div className="divide-y divide-gray-50">
                        {matches.map(row => (
                          <button key={row.swift} onClick={() => lookupStatic(row.swift)}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 text-left transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-brand-800">{row.swift}</span>
                                <span className="text-xs text-gray-500">{row.bank}</span>
                                <span className="text-[11px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold">Head office code</span>
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">Headquarters: {row.hq} — valid for international wires to any branch</div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <CopyBtn text={row.swift} />
                              <ArrowRight className="w-4 h-4 text-gray-300" />
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
              {!searchLoading && suggestions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800 text-sm">{suggestions.length} SWIFT code{suggestions.length !== 1 ? 's' : ''} found for "{query}"</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {suggestions.map((s: any) => (
                      <button key={s.ifsc} onClick={() => selectSuggestion(s.swift)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 text-left transition-colors">
                        {s.bank_logo
                          ? <img src={s.bank_logo} alt="" className="w-9 h-9 object-contain rounded-lg border border-gray-100 flex-shrink-0" />
                          : <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 font-bold flex-shrink-0">{s.bank_name.charAt(0)}</div>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-brand-800">{s.swift}</span>
                            <span className="text-xs text-gray-400 truncate">{s.bank_name}</span>
                          </div>
                          <div className="text-xs text-gray-400">{s.branch_name}{s.city ? `, ${s.city}` : ''}, {s.state_name}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SWIFT vs IFSC explainer ─────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-600" /> What Is a SWIFT/BIC Code?
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                A SWIFT code (also called BIC — Bank Identifier Code) is an 8–11 character international standard used
                to identify banks in cross-border wire transfers. Every international payment — whether sending money
                abroad or receiving a foreign wire — requires a SWIFT code.
              </p>
              <div className="bg-brand-50 rounded-xl px-4 py-3 font-mono text-sm">
                <span className="text-brand-700 font-bold">HDFC</span>
                <span className="text-green-700 font-bold">IN</span>
                <span className="text-amber-700 font-bold">BB</span>
                <span className="text-xs text-gray-400 font-sans ml-3">Bank · Country · Location</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">SWIFT vs IFSC — Key Differences</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-4 text-gray-400 font-semibold uppercase tracking-wide">Feature</th>
                      <th className="text-left py-2 pr-4 text-brand-700 font-bold">SWIFT / BIC</th>
                      <th className="text-left py-2 text-brand-700 font-bold">IFSC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      ['Used for',   'International transfers',  'Domestic India only'     ],
                      ['Length',     '8 or 11 characters',       '11 characters'           ],
                      ['Standard',   'Global (ISO 9362)',         'India-specific (RBI)'   ],
                      ['Transfers',  'Wire transfers, SWIFT',     'NEFT, RTGS, IMPS, UPI'  ],
                      ['Example',    'HDFCINBB',                  'HDFC0000001'            ],
                    ].map(([feature, swift, ifsc]) => (
                      <tr key={feature}>
                        <td className="py-2 pr-4 text-gray-400 font-medium">{feature}</td>
                        <td className="py-2 pr-4 text-gray-700">{swift}</td>
                        <td className="py-2 text-gray-700">{ifsc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link to="/ifsc-finder"
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
                Find IFSC Code <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* ── Popular SWIFT codes table ───────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Popular Indian Bank SWIFT Codes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Head-office codes — valid for most international transfers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Bank Name</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">SWIFT Code</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden sm:table-cell">Headquarters</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {POPULAR_SWIFT.map(row => (
                    <tr key={row.swift} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{row.bank}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-800">{row.swift}</span>
                          <CopyBtn text={row.swift} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{row.hq}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => lookupStatic(row.swift)}
                          className="text-xs font-semibold text-brand-600 hover:underline whitespace-nowrap">
                          Lookup →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Related tools ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/ifsc-finder',        icon: '🏦', title: 'IFSC Code Finder',    desc: 'Find IFSC for any branch — NEFT, RTGS, IMPS'       },
              { to: '/currency-converter', icon: '💱', title: 'Currency Converter',   desc: 'Live INR ↔ USD, EUR, GBP, AED rates'               },
              { to: '/calculators/emi',    icon: '📊', title: 'EMI Calculator',       desc: 'Calculate home/personal/car loan EMI'               },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-gray-800 text-sm group-hover:text-brand-700 transition-colors">{item.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </Link>
            ))}
          </div>

          {/* ── FAQ ─────────────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center pb-4">
            SWIFT codes sourced from Razorpay IFSC open dataset. Always verify with your bank before initiating transfers.
            Data updated quarterly.{' '}
            <Link to="/what-is-ifsc-code" className="text-brand-500 hover:underline">Learn about IFSC codes →</Link>
          </p>
        </div>
      </div>
    </>
  );
}
