import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, Loader2, Info, CheckCircle2, Shield } from 'lucide-react';
import { api, BranchDetail } from '../utils/api';

// ── Searchable Combobox ───────────────────────────────────────────────────────
interface Option { value: string; label: string; }

function Combobox({ label, value, onChange, options, placeholder, disabled, loading, minChars = 0 }: {
  label: string; value: string; onChange: (v: string) => void;
  options: Option[]; placeholder?: string;
  disabled?: boolean; loading?: boolean; minChars?: number;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const inputRef          = useRef<HTMLInputElement>(null);
  const containerRef      = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label ?? '';
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
          <span className={`flex-1 text-sm truncate ${selectedLabel ? 'text-brand-900 font-semibold' : 'text-gray-400'}`}>
            {loading ? 'Loading…' : (selectedLabel || placeholder || `Select ${label}`)}
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
                  <span>{highlight(opt.label, query)}</span>
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
  const { data: states = [] } = useQuery({ queryKey: ['states'], queryFn: api.getStates });

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
              options={sortedStates.map(s => ({ value: String(s.id), label: s.name }))}
              placeholder={selectedBank ? 'Select state…' : 'Select bank first…'}
              disabled={!selectedBank}
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

        {/* Informational sections */}

      </div>
    </>
  );
}
