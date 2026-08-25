import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Loader2, Info, Shield, MapPin, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import { Combobox } from '../components/ui/Combobox';
import { Card } from '../components/ui/Card';

const IFSC_RE = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;

const POPULAR_BANKS = [
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
];

export default function IFSCFinderPage() {
  const [selectedBank,     setSelectedBank]     = useState('');
  const [selectedState,    setSelectedState]    = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBranch,   setSelectedBranch]   = useState('');
  const [searching,        setSearching]        = useState(false);
  const [searchErr,        setSearchErr]        = useState('');
  const [quickQuery,       setQuickQuery]       = useState('');
  const [quickErr,         setQuickErr]         = useState('');
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

  const handleQuickSearch = () => {
    const q = quickQuery.trim();
    if (!q) return;
    setQuickErr('');
    if (IFSC_RE.test(q)) {
      navigate(`/ifsc/${q.toUpperCase()}`);
      return;
    }
    const match = banks.find(b => b.name.toLowerCase().includes(q.toLowerCase()));
    if (match) {
      handleBankChange(String(match.id));
      document.getElementById('guided-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setQuickErr(`No bank matched "${q}" — try the exact IFSC code, or pick your bank below.`);
  };

  const currentStep = selectedBranch ? 4 : selectedDistrict ? 4 : selectedState ? 3 : selectedBank ? 2 : 1;

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
        <title>IFSC Code Finder — Find Any Bank Branch IFSC Code in India | RupeePedia</title>
        <meta name="description" content="Find IFSC code of any bank branch in India. Search 1,78,000+ branches across 1,350+ banks by bank name, state, district and branch. Free IFSC & MICR code lookup." />
        <link rel="canonical" href="https://rupeepedia.in/ifsc-finder" />
        <meta property="og:title" content="IFSC Code Finder — Find Any Bank Branch IFSC Code in India" />
        <meta property="og:description" content="Find IFSC code of any bank branch in India. Search 1,78,000+ branches across 1,350+ banks. Free IFSC & MICR code lookup." />
        <meta property="og:url" content="https://rupeepedia.in/ifsc-finder" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="IFSC Code Finder — Find Any Bank Branch IFSC Code in India" />
        <meta name="twitter:description" content="Find IFSC code of any bank branch in India. Search 1,78,000+ branches across 1,350+ banks." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "IFSC Code Finder",
              "url": "https://rupeepedia.in/ifsc-finder",
              "description": "Find IFSC and MICR codes for any bank branch in India. Search 1,78,000+ branches across 1,350+ banks.",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "All",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
              "provider": { "@type": "Organization", "name": "RupeePedia", "url": "https://rupeepedia.in" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is an IFSC code?",
                  "acceptedAnswer": { "@type": "Answer", "text": "IFSC (Indian Financial System Code) is an 11-character alphanumeric code assigned by the RBI to uniquely identify every bank branch in India. It is required for NEFT, RTGS, and IMPS electronic fund transfers." }
                },
                {
                  "@type": "Question",
                  "name": "How to find the IFSC code of a bank branch?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Use the IFSC Code Finder at rupeepedia.in/ifsc-finder — select your bank, state, district and branch from the dropdowns. You can also find it on your cheque book, bank passbook, or net banking app." }
                },
                {
                  "@type": "Question",
                  "name": "What is the format of an IFSC code?",
                  "acceptedAnswer": { "@type": "Answer", "text": "An IFSC code is 11 characters long. The first 4 characters are the bank code (e.g., HDFC for HDFC Bank), the 5th character is always 0, and the last 6 characters are the unique branch code." }
                },
                {
                  "@type": "Question",
                  "name": "Is IFSC code the same as MICR code?",
                  "acceptedAnswer": { "@type": "Answer", "text": "No. IFSC (Indian Financial System Code) is used for electronic fund transfers (NEFT, RTGS, IMPS). MICR (Magnetic Ink Character Recognition) is a 9-digit code printed on cheques and used for cheque clearing." }
                },
                {
                  "@type": "Question",
                  "name": "How many bank branches are available on RupeePedia?",
                  "acceptedAnswer": { "@type": "Answer", "text": "RupeePedia has IFSC codes for 1,78,000+ bank branches across 1,350+ banks in India. Data is sourced from RBI and updated fortnightly." }
                }
              ]
            }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'IFSC Code Finder', item: 'https://rupeepedia.in/ifsc-finder' },
          ],
        })}</script>
      </Helmet>

      {/* Hero */}
      <header className="py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-25 blur-[20px]"
                   style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
              <div className="absolute inset-0 opacity-[0.35]"
                   style={{ backgroundImage: 'radial-gradient(rgb(var(--line-2-rgb)) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, black 0%, transparent 75%)' }} />
            </div>
            <div className="relative z-[2]">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <span className="inline-flex items-center gap-2 bg-acc-deep text-acc text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-acc/30">
                    <Shield className="w-3.5 h-3.5" /> RBI Verified Data · Updated Fortnightly
                  </span>
                  <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink mb-3 leading-tight">
                    IFSC &amp; MICR Code <span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Finder</span>
                  </h1>
                  <p className="text-muted text-lg max-w-xl mx-auto mb-8">
                    Search 1,78,000+ RBI-verified bank branches by IFSC code, bank name, or branch location
                  </p>

                  {/* Quick search */}
                  <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                      <input
                        type="text"
                        value={quickQuery}
                        onChange={e => { setQuickQuery(e.target.value); setQuickErr(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleQuickSearch()}
                        placeholder="Search by IFSC (SBIN0000691), Bank (HDFC), or Branch…"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-bg-2 border border-line-2 text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc transition-all"
                      />
                    </div>
                    <button
                      onClick={handleQuickSearch}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-mint to-acc text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-acc-glow hover:-translate-y-px transition-all shrink-0"
                    >
                      <Search className="w-4 h-4" /> Search
                    </button>
                  </div>
                  {quickErr && (
                    <p className="text-coral text-xs mt-2.5 flex items-center justify-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> {quickErr}
                    </p>
                  )}

                  {/* Popular banks */}
                  <div className="flex items-center flex-wrap justify-center gap-2 mt-6">
                    <span className="text-xs text-faint font-medium mr-1">Popular Banks:</span>
                    {POPULAR_BANKS.map(b => {
                      const matchedBank = banks.find(bk => bk.name.toLowerCase() === b.name.toLowerCase());
                      const isSelected = matchedBank && String(matchedBank.id) === selectedBank;
                      return (
                        <button
                          key={b.name}
                          onClick={() => { if (matchedBank) handleBankChange(String(matchedBank.id)); }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-mint to-acc text-white border-transparent shadow-acc-glow'
                              : 'bg-bg-2 text-body border-line-2 hover:border-acc/40'
                          }`}
                        >
                          <img src={b.logo} alt="" className="w-4 h-4 object-contain rounded-sm" />
                          {b.name}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative bg-bg -mt-6 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.25]"
             style={{ backgroundImage: 'radial-gradient(rgb(var(--line-2-rgb)) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 min-w-0">

        {/* Search Card */}
        <motion.div id="guided-search" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="scroll-mt-24">
          <Card className="p-6 sm:p-8 relative z-[2]">
            <div className="flex items-start justify-between mb-5 gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Step-by-Step Branch Explorer</h2>
                <p className="text-sm text-faint mt-0.5">Drill down by selecting Bank, State, District, and Branch location.</p>
              </div>
              <span className="text-xs text-faint font-medium shrink-0 mt-1">Step {currentStep} of 4</span>
            </div>

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
                      <span className="w-7 h-7 bg-acc-deep rounded-md flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-acc" />
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
              <p className="text-coral text-sm mt-3 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> {searchErr}
              </p>
            )}

            <button
              onClick={handleSearch}
              disabled={!selectedBranch || searching}
              className="mt-5 inline-flex items-center gap-2 text-base font-semibold px-[18px] py-[13px] rounded-[13px] bg-gradient-to-br from-mint to-acc text-white shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {searching
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</>
                : <><Search className="w-4 h-4" /> Get IFSC Details</>}
            </button>
          </Card>
        </motion.div>

      </div>

      {/* Sidebar */}
      <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-acc-deep to-surface border border-acc/30 rounded-2xl p-6 shadow-acc-glow relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-base font-bold text-ink mb-4">Trusted by Millions</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: '1,78,000+', label: 'Bank Branches' },
                { n: '1,350+', label: 'Banks Covered' },
                { n: '43', label: 'States & UTs' },
                { n: 'RBI', label: 'Verified Data' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-xl font-extrabold text-ink leading-none">{n}</p>
                  <p className="text-[11px] text-faint font-semibold uppercase tracking-wide mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-acc opacity-10" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5">
            <h3 className="font-bold text-ink text-sm mb-3">Related Tools &amp; Guides</h3>
            <div className="flex flex-col gap-1">
              {[
                { label: 'SWIFT Code Lookup', to: '/swift-code-lookup' },
                { label: 'PIN Code Directory', to: '/pin-codes' },
                { label: 'FD Interest Rates', to: '/fd-rates' },
                { label: 'Bank Holidays', to: '/bank-holidays' },
                { label: 'What is IFSC Code?', to: '/what-is-ifsc-code' },
                { label: 'How to Find IFSC Code', to: '/how-to-find-ifsc-code' },
                { label: 'IFSC vs MICR', to: '/ifsc-vs-micr' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="flex items-center justify-between text-sm text-body hover:text-acc px-2 py-2 rounded-lg hover:bg-surface-2 transition-colors">
                  {item.label} <ArrowRight className="w-3.5 h-3.5 text-faint" />
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>
      </aside>

      </div>
      </div>
    </>
  );
}
