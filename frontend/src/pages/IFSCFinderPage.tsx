import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, Loader2, Info, CheckCircle2, Shield, MapPin, Building2, ArrowRight } from 'lucide-react';
import { api, BranchDetail } from '../utils/api';

// ── Searchable Combobox ───────────────────────────────────────────────────────
interface Option { value: string; label: string; icon?: string; }

function Combobox({ label, value, onChange, options, placeholder, disabled, loading, minChars = 0, renderOption }: {
  label: string; value: string; onChange: (v: string) => void;
  options: Option[]; placeholder?: string;
  disabled?: boolean; loading?: boolean; minChars?: number;
  renderOption?: (opt: Option, highlighted: React.ReactNode) => React.ReactNode;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const inputRef          = useRef<HTMLInputElement>(null);
  const containerRef      = useRef<HTMLDivElement>(null);

  const selectedOpt = options.find(o => o.value === value);
  const selectedLabel = selectedOpt?.label ?? '';
  const selectedIcon = selectedOpt?.icon;
  const filtered = query.length < Math.max(minChars, 1)
    ? options
    : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (disabled || loading) return;
    setQuery(''); setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = useCallback((opt: Option) => {
    onChange(opt.value); setQuery(''); setOpen(false);
  }, [onChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); onChange(''); setQuery(''); setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0]);
  };

  function highlight(text: string, q: string) {
    if (!q) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-100 text-yellow-800 rounded px-0.5 not-italic">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-semibold text-brand-800 mb-2">{label}</label>
      <div
        onClick={handleOpen}
        className={`relative flex items-center rounded-xl px-3 py-2.5 bg-white transition-all cursor-pointer min-h-[50px]
          border-2 ${open ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm' : 'border-gray-200 hover:border-brand-300'}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
      >
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={minChars > 0 ? `Type ${minChars}+ chars to filter…` : `Search ${options.length} options…`}
            className="flex-1 outline-none text-sm text-brand-900 bg-transparent font-body"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 text-sm truncate flex items-center gap-2 ${selectedLabel ? 'text-brand-900 font-semibold' : 'text-gray-400'}`}>
            {loading ? 'Loading…' : (<>
              {selectedIcon && <img src={selectedIcon} alt="" className="w-5 h-5 object-contain rounded flex-shrink-0" />}
              {selectedLabel || placeholder || `Select ${label}`}
            </>)}
          </span>
        )}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          {!loading && value && !open && (
            <button onClick={handleClear} className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.97 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: 'top' }}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto"
          >
            {minChars > 0 && query.length < minChars && options.length > 20 && (
              <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 flex items-center gap-1.5 sticky top-0 bg-white rounded-t-2xl">
                <Search className="w-3 h-3" /> Type {minChars}+ characters to filter {options.length} options
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-400 text-center">No matches for "{query}"</div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
                    ${opt.value === value ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-brand-900 hover:bg-gray-50'}`}
                >
                  {opt.value === value
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                    : <span className="w-3.5 h-3.5 flex-shrink-0" />}
                  {renderOption
                    ? renderOption(opt, highlight(opt.label, query))
                    : <span>{highlight(opt.label, query)}</span>}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IFSCFinderPage() {
  const [selectedBank,     setSelectedBank]     = useState('');
  const [selectedState,    setSelectedState]    = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBranch,   setSelectedBranch]   = useState('');
  const [searching,        setSearching]        = useState(false);
  const [searchErr,        setSearchErr]        = useState('');
  const navigate = useNavigate();

  const { data: banks = [] }  = useQuery({ queryKey: ['banks'],  queryFn: api.getBanks  });

  // Find the selected bank's slug for the states-by-bank API
  const selectedBankObj = banks.find(b => String(b.id) === selectedBank);
  const bankSlugForApi = selectedBankObj?.slug ?? '';

  // Fetch only states where this bank has branches
  const { data: bankStatesData, isFetching: loadingStates } = useQuery({
    queryKey: ['bank-states', bankSlugForApi],
    queryFn:  () => api.getStatesByBank(bankSlugForApi),
    enabled:  !!bankSlugForApi,
  });
  const states = bankStatesData?.states?.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    logo_url: s.logo_url,
    branchCount: s.branchCount,
  })) ?? [];

  const { data: districts = [], isFetching: loadingDistricts } = useQuery({
    queryKey: ['districts', selectedState, selectedBank],
    queryFn:  () => api.getDistricts(Number(selectedState), Number(selectedBank)),
    enabled:  !!selectedState && !!selectedBank,
  });

  const { data: branches = [], isFetching: loadingBranches } = useQuery({
    queryKey: ['branches', selectedBank, selectedState, selectedDistrict],
    queryFn:  () => api.getBranches(Number(selectedBank), Number(selectedState), selectedDistrict ? Number(selectedDistrict) : undefined),
    enabled:  !!selectedBank && !!selectedState && !!selectedDistrict,
  });

  // All options sorted A–Z
  const sortedBanks     = [...banks].sort((a, b) => a.name.localeCompare(b.name));
  const sortedStates    = [...states].sort((a, b) => a.name.localeCompare(b.name));
  const sortedDistricts = [...districts].sort((a, b) => a.name.localeCompare(b.name));
  const sortedBranches  = [...branches].sort((a, b) => a.branch_name.localeCompare(b.branch_name));

  const handleBankChange = (v: string) => {
    setSelectedBank(v); setSelectedState(''); setSelectedDistrict('');
    setSelectedBranch(''); setSearchErr('');
  };
  const handleStateChange = (v: string) => {
    setSelectedState(v); setSelectedDistrict('');
    setSelectedBranch(''); setSearchErr('');
  };
  const handleDistrictChange = (v: string) => {
    setSelectedDistrict(v); setSelectedBranch(''); setSearchErr('');
  };

  const handleSearch = async () => {
    if (!selectedBranch) { setSearchErr('Please select a branch to continue.'); return; }
    setSearching(true); setSearchErr('');
    try {
      // Navigate to the leaf page — all detail + nearby shown there
      navigate(`/ifsc/${selectedBranch.toUpperCase()}`);
    } catch {
      setSearchErr('Something went wrong. Please try again.');
      setSearching(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>IFSC Code Finder — Search Bank Branch IFSC & MICR Codes | BankInfoHub</title>
        <meta name="description" content="Find IFSC and MICR codes for any bank branch in India. Search by bank, state, district and branch. Required for NEFT, RTGS and IMPS transfers." />
      </Helmet>

      {/* Hero — uses existing hero-bg class */}
      <section className="hero-bg py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-brand-200">
              <Shield className="w-3.5 h-3.5" /> RBI Verified Data · Updated Fortnightly
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-900 mb-3 leading-tight">
              IFSC Code Finder
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Find IFSC &amp; MICR codes for any bank branch across India
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 pb-16">

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-6 sm:p-8 shadow-md"
        >
          <h2 className="font-display text-lg font-bold text-brand-900 mb-5 flex items-center gap-2">
            <Search className="w-5 h-5 text-brand-600" /> Search by Bank &amp; Branch
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Combobox
              label="1. Bank Name"
              value={selectedBank}
              onChange={handleBankChange}
              options={sortedBanks.map(b => ({ value: String(b.id), label: b.name }))}
              placeholder="Select bank…"
            />
            <Combobox
              label="2. State"
              value={selectedState}
              onChange={handleStateChange}
              options={sortedStates.map(s => ({
                value: String(s.id),
                label: s.name + (s.branchCount ? ` (${s.branchCount} branches)` : ''),
                icon: s.logo_url || undefined,
              }))}
              placeholder={selectedBank ? (loadingStates ? 'Loading states…' : 'Select state…') : 'Select bank first…'}
              disabled={!selectedBank}
              loading={loadingStates}
              renderOption={(opt, highlighted) => (
                <span className="flex items-center gap-2.5">
                  {opt.icon ? (
                    <img src={opt.icon} alt="" className="w-7 h-7 object-contain rounded-md flex-shrink-0" />
                  ) : (
                    <span className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-blue-500" />
                    </span>
                  )}
                  <span>{highlighted}</span>
                </span>
              )}
            />
            <Combobox
              label="3. District"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              options={sortedDistricts.map(d => ({ value: String(d.id), label: d.name }))}
              placeholder={selectedState ? 'Select district…' : 'Select state first…'}
              disabled={!selectedState}
              loading={loadingDistricts}
            />
            <Combobox
              label="4. Branch"
              value={selectedBranch}
              onChange={(v) => { setSelectedBranch(v); setSearchErr(''); }}
              options={sortedBranches.map(b => ({ value: b.ifsc, label: `${b.branch_name}${b.city ? ' — ' + b.city : ''}` }))}
              placeholder={selectedDistrict ? 'Select branch…' : 'Select district first…'}
              disabled={!selectedDistrict}
              loading={loadingBranches}
              minChars={3}
            />
          </div>

          {searchErr && (
            <p className="text-red-500 text-sm mt-3 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> {searchErr}
            </p>
          )}

          <button
            onClick={handleSearch}
            disabled={!selectedBranch || searching}
            className="btn-primary mt-5 flex items-center gap-2 text-base"
          >
            {searching
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</>
              : <><Search className="w-4 h-4" /> Get IFSC Details</>}
          </button>
        </motion.div>

        {/* Popular Banks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-6 sm:p-8 mt-8"
        >
          <h2 className="font-display text-lg font-bold text-brand-900 mb-5 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" /> Popular Banks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: 'State Bank Of India', logo: '/images/banks/State_Bank_Of_India.webp' },
              { name: 'HDFC Bank', logo: '/images/banks/Hdfc_Bank.webp' },
              { name: 'ICICI Bank', logo: '/images/banks/Icici_Bank.webp' },
              { name: 'Axis Bank', logo: '/images/banks/Axis_Bank.webp' },
              { name: 'Kotak Mahindra Bank', logo: '/images/banks/Kotak_Mahindra_Bank.webp' },
              { name: 'Punjab National Bank', logo: '/images/banks/Punjab_National_Bank.webp' },
              { name: 'Bank Of Baroda', logo: '/images/banks/Bank_Of_Baroda.webp' },
              { name: 'Canara Bank', logo: '/images/banks/Canara_Bank.webp' },
              { name: 'Union Bank Of India', logo: '/images/banks/Union_Bank_Of_India.webp' },
              { name: 'IndusInd Bank', logo: '/images/banks/Indusind_Bank.webp' },
              { name: 'Yes Bank', logo: '/images/banks/Yes_Bank.webp' },
              { name: 'Bank Of India', logo: '/images/banks/Bank_Of_India.webp' },
              { name: 'Indian Bank', logo: '/images/banks/Indian_Bank.webp' },
              { name: 'Central Bank Of India', logo: '/images/banks/Central_Bank_Of_India.webp' },
              { name: 'IDBI', logo: '/images/banks/Idbi.webp' },
            ].map((b) => {
              const matchedBank = banks.find(bk => bk.name.toLowerCase() === b.name.toLowerCase());
              return (
                <button
                  key={b.name}
                  onClick={() => {
                    if (matchedBank) {
                      handleBankChange(String(matchedBank.id));
                    }
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left
                    ${matchedBank && String(matchedBank.id) === selectedBank
                      ? 'border-blue-400 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'}`}
                >
                  <img src={b.logo} alt={b.name} className="w-8 h-8 object-contain flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800 truncate">{b.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* What is IFSC Code */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card p-6 sm:p-8 mt-8"
        >
          <h2 className="font-display text-xl font-bold text-brand-900 mb-4">What is an IFSC Code?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            IFSC stands for <strong>Indian Financial System Code</strong>. It is an 11-character alphanumeric code assigned by the Reserve Bank of India (RBI)
            to uniquely identify every bank branch that participates in electronic fund transfers. The IFSC code is essential for
            <strong> NEFT</strong> (National Electronic Funds Transfer), <strong>RTGS</strong> (Real Time Gross Settlement), and <strong>IMPS</strong> (Immediate Payment Service) transactions.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-brand-800 mb-2">IFSC Code Format</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              An IFSC code like <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">HDFC0001234</span> has three parts:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li><strong>First 4 characters</strong> — Bank code (e.g., HDFC = HDFC Bank)</li>
              <li><strong>5th character</strong> — Always <span className="font-mono">0</span> (reserved for future use)</li>
              <li><strong>Last 6 characters</strong> — Branch code (unique to each branch)</li>
            </ul>
          </div>
        </motion.div>

        {/* How to Find IFSC Code */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card p-6 sm:p-8 mt-8"
        >
          <h2 className="font-display text-xl font-bold text-brand-900 mb-4">How to Find Your IFSC Code?</h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Use this IFSC Finder', desc: 'Select your bank, state, district and branch from the dropdowns above to instantly find the IFSC code.' },
              { step: '2', title: 'Check your cheque book', desc: 'The IFSC code is printed on the cheque leaf, usually near the MICR code at the bottom.' },
              { step: '3', title: 'Check your bank passbook', desc: 'The first page of your passbook typically has the branch IFSC code printed along with account details.' },
              { step: '4', title: 'Visit your bank\'s website', desc: 'Most banks have a branch locator on their official website that shows the IFSC code.' },
              { step: '5', title: 'Internet / Mobile banking', desc: 'Log in to your net banking or mobile banking app — the branch IFSC is shown in account details.' },
            ].map(item => (
              <div key={item.step} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Why is IFSC Important */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card p-6 sm:p-8 mt-8"
        >
          <h2 className="font-display text-xl font-bold text-brand-900 mb-4">Why is IFSC Code Important?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'NEFT Transfers', desc: 'Required for National Electronic Fund Transfer, processed in hourly batches.' },
              { title: 'RTGS Transfers', desc: 'Needed for Real Time Gross Settlement — instant transfers for amounts above Rs. 2 lakh.' },
              { title: 'IMPS Transfers', desc: 'Used for Immediate Payment Service — 24/7 instant mobile/internet fund transfers.' },
              { title: 'UPI Payments', desc: 'While UPI uses VPA, bank-to-bank UPI transfers may need the IFSC code for verification.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                <ArrowRight className="w-4 h-4 text-brand-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </>
  );
}
