import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Search, Hash, Building2, ExternalLink,
  LocateFixed, ArrowRight,
  Zap, Database, Smartphone, Filter, ChevronDown,
} from 'lucide-react';
import { api, OfficeSearchResult } from '../utils/api';

function tc(s: string | null | undefined) {
  if (!s) return '';
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const OFFICE_TYPE_LABEL: Record<string, string> = {
  'H.O': 'Head Post Office',
  'S.O': 'Sub Post Office',
  'B.O': 'Branch Post Office',
};
function officeLabel(t: string | null) {
  return t ? (OFFICE_TYPE_LABEL[t] ?? t) : 'Post Office';
}

// Results list — each row links to the detail page
function ResultsList({ offices, pins }: { offices: OfficeSearchResult[]; pins: string[] }) {
  if (!offices.length) return (
    <div className="text-center py-10 text-faint text-sm">No results found.</div>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2 border-b border-line">
            <th className="px-4 py-3 text-left font-semibold text-muted text-xs">Post Office</th>
            <th className="px-4 py-3 text-left font-semibold text-muted text-xs">PIN</th>
            <th className="px-4 py-3 text-left font-semibold text-muted text-xs hidden sm:table-cell">District</th>
            <th className="px-4 py-3 text-left font-semibold text-muted text-xs hidden sm:table-cell">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-muted text-xs"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {offices.map((o, i) => {
            const pin = o.pin_code ?? pins[i] ?? '';
            return (
              <tr key={i} className="hover:bg-surface-2 transition-colors group">
                <td className="px-4 py-3 font-semibold text-ink">{tc(o.office_name)}</td>
                <td className="px-4 py-3 font-mono font-bold text-acc">{pin}</td>
                <td className="px-4 py-3 text-muted hidden sm:table-cell">{tc(o.district) || '—'}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    o.office_type === 'H.O' ? 'bg-gold/10 text-gold' :
                    o.office_type === 'S.O' ? 'bg-acc-deep text-acc' :
                    'bg-mint/10 text-mint'
                  }`}>{officeLabel(o.office_type)}</span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/pin/${pin}`}
                    className="inline-flex items-center gap-1 text-acc font-semibold text-xs hover:underline whitespace-nowrap"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab 1: Search by PIN Code — navigates directly to detail page ──────────────
function ByPinCode() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (/^\d{6}$/.test(v)) navigate(`/pin/${v}`);
  }

  function quickSearch(p: string) { navigate(`/pin/${p}`); }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-acc pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit PIN code e.g. 500090"
            className="w-full pl-12 sm:pr-28 pr-4 py-4 bg-bg-2 border border-line-2 rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc font-mono transition-all"
            inputMode="numeric"
            maxLength={6}
          />
          {/* Desktop inline button */}
          <button
            type="submit"
            disabled={input.length !== 6}
            className="hidden sm:block absolute right-2 bg-gradient-to-br from-mint to-acc hover:shadow-acc-glow disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shrink-0"
          >
            Search
          </button>
        </div>
        {/* Mobile full-width button */}
        <button
          type="submit"
          disabled={input.length !== 6}
          className="sm:hidden w-full bg-gradient-to-br from-mint to-acc disabled:opacity-40 text-white font-semibold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          Search Now <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-faint uppercase tracking-wider">Trending:</span>
        {[['400001', 'Mumbai'], ['110001', 'Delhi'], ['560001', 'Bangalore']].map(([p, city]) => (
          <button
            key={p}
            onClick={() => quickSearch(p)}
            className="bg-acc-deep text-acc px-3 py-1 rounded-full text-xs font-semibold hover:bg-acc/20 transition-colors"
          >
            {p} ({city})
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Search by Post Office Name — shows list with links ─────────────────
function ByPostOffice() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');

  const { data: results, isFetching } = useQuery<OfficeSearchResult[]>({
    queryKey:  ['pin-office-search', query],
    queryFn:   () => api.searchPinOffice(query),
    enabled:   query.trim().length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim().length >= 3) setQuery(input.trim());
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-acc pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Post office name e.g. Nizampet, Bachupally…"
            className="w-full pl-12 sm:pr-28 pr-4 py-4 bg-bg-2 border border-line-2 rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc transition-all"
            minLength={3}
          />
          <button
            type="submit"
            disabled={input.trim().length < 3}
            className="hidden sm:block absolute right-2 bg-gradient-to-br from-mint to-acc hover:shadow-acc-glow disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shrink-0"
          >
            Search
          </button>
        </div>
        <button
          type="submit"
          disabled={input.trim().length < 3}
          className="sm:hidden w-full bg-gradient-to-br from-mint to-acc disabled:opacity-40 text-white font-semibold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          Search Now <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {isFetching && <div className="text-center py-8 text-faint text-sm">Searching…</div>}
      {results && !isFetching && (
        <div>
          <p className="text-sm text-muted mb-3">
            {results.length} result{results.length !== 1 ? 's' : ''} for "<span className="font-medium text-body">{query}</span>" — click any row to view full details
          </p>
          <ResultsList offices={results} pins={results.map(r => r.pin_code)} />
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Search by Location — navigates to detail page on PIN select ─────────
function ByLocation() {
  const [state,    setState]    = useState('');
  const [district, setDistrict] = useState('');
  const [pin,      setPin]      = useState('');
  const navigate = useNavigate();

  const { data: states = [], isLoading: statesLoading } = useQuery<string[]>({
    queryKey:  ['pin-states'],
    queryFn:   () => api.getPinStates(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: districts = [], isLoading: distLoading } = useQuery<string[]>({
    queryKey:  ['pin-districts', state],
    queryFn:   () => api.getPinDistricts(state),
    enabled:   !!state,
    staleTime: 12 * 60 * 60 * 1000,
  });

  const { data: pins = [], isLoading: pinsLoading } = useQuery<string[]>({
    queryKey:  ['pin-pins', state, district],
    queryFn:   () => api.getPinsByDistrict(state, district),
    enabled:   !!state && !!district,
    staleTime: 12 * 60 * 60 * 1000,
  });

  const selClass = "w-full py-4 px-4 bg-bg-2 border border-line-2 rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc disabled:bg-surface-2 disabled:text-faint appearance-none cursor-pointer transition-all";

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-faint uppercase tracking-wider mb-1.5">State</label>
          <select
            value={state}
            onChange={e => { setState(e.target.value); setDistrict(''); setPin(''); }}
            className={selClass}
            disabled={statesLoading}
          >
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-faint uppercase tracking-wider mb-1.5">District</label>
          <select
            value={district}
            onChange={e => { setDistrict(e.target.value); setPin(''); }}
            className={selClass}
            disabled={!state || distLoading}
          >
            <option value="">{state ? (distLoading ? 'Loading…' : 'Select District') : 'Select State first'}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-faint uppercase tracking-wider mb-1.5">PIN Code</label>
          <select
            value={pin}
            onChange={e => setPin(e.target.value)}
            className={selClass}
            disabled={!district || pinsLoading}
          >
            <option value="">{district ? (pinsLoading ? 'Loading…' : 'Select PIN Code') : 'Select District first'}</option>
            {pins.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {pin && (
        <button
          onClick={() => navigate(`/pin/${pin}`)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-mint to-acc text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-acc-glow"
        >
          View PIN Code Details <ExternalLink className="w-4 h-4" />
        </button>
      )}
      {!pin && district && !pinsLoading && (
        <p className="text-sm text-faint text-center">Select a PIN code above to view its details</p>
      )}
    </div>
  );
}

// ── Landing FAQ accordion ─────────────────────────────────────────────────────
function LandingFAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line rounded-2xl overflow-hidden bg-surface">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition-colors"
      >
        <span className="font-semibold text-ink text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {/* Always mounted so content stays in the DOM for search engines */}
      <div className={`px-6 pb-5 pt-1 text-sm text-muted leading-relaxed border-t border-line ${open ? '' : 'hidden'}`}>
        {a}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type Tab = 'pin' | 'office' | 'location';

const TABS: { id: Tab; label: string; icon: typeof Hash }[] = [
  { id: 'pin',      label: 'Search By PIN Code',    icon: Hash        },
  { id: 'office',   label: 'Search By Post Office', icon: Building2   },
  { id: 'location', label: 'Search By Location',    icon: LocateFixed },
];

export default function PinCodesPage() {
  const [tab, setTab] = useState<Tab>('pin');

  return (
    <>
      <Helmet>
        <title>PIN Code Finder India — Search Postal Code & Post Office | RupeePedia</title>
        <meta name="description" content="Find PIN codes and post offices across India. Search by 6-digit postal code, post office name, or location (state → district). 1,50,000+ verified post offices with delivery status." />
        <link rel="canonical" href="https://rupeepedia.in/pin-codes" />
        <meta property="og:title" content="PIN Code Finder India — Search Postal Code & Post Office" />
        <meta property="og:description" content="Find PIN codes and post offices across India. Search by postal code, post office name, or location. 1,50,000+ verified post offices." />
        <meta property="og:url" content="https://rupeepedia.in/pin-codes" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="PIN Code Finder India — Search Postal Code & Post Office" />
        <meta name="twitter:description" content="Find PIN codes and post offices across India. Search by postal code, post office name, or location." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "India PIN Code Finder",
              "url": "https://rupeepedia.in/pin-codes",
              "description": "Search India Post PIN codes and post offices by postal code, post office name, or location across India.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "All",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
              "provider": { "@type": "Organization", "name": "RupeePedia", "url": "https://rupeepedia.in" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is a PIN code in India?",
                  "acceptedAnswer": { "@type": "Answer", "text": "A PIN code (Postal Index Number) is a 6-digit code used by India Post to identify specific post offices and delivery areas. Each digit represents a zone, sub-zone, sorting district, or delivery post office." }
                },
                {
                  "@type": "Question",
                  "name": "How do I find the PIN code of my area?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Use the PIN Code Finder at rupeepedia.in/pin-codes — search by 6-digit PIN code, post office name, or browse by state and district. All results show delivery status and full post office details." }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between H.O, S.O, and B.O post offices?",
                  "acceptedAnswer": { "@type": "Answer", "text": "H.O (Head Office) is the main administrative hub for a district. S.O (Sub Office) serves towns and urban areas under a Head Office. B.O (Branch Office) is the smallest unit, serving villages and remote areas." }
                },
                {
                  "@type": "Question",
                  "name": "How many post offices are in the RupeePedia PIN code database?",
                  "acceptedAnswer": { "@type": "Answer", "text": "RupeePedia's PIN code directory covers 1,50,000+ post offices across all 28 states and 8 union territories of India, cross-referenced with official India Post records." }
                },
                {
                  "@type": "Question",
                  "name": "Can I search PIN codes by state and district?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes — use the Search By Location tab on the PIN Code Finder page. Select your state, then district, and all PIN codes for that district are listed. Clicking a PIN takes you to its full detail page with post offices and nearby bank branches." }
                }
              ]
            }
          ]
        })}</script>
      </Helmet>

      {/* Hero with integrated search */}
      <header className="py-8 md:py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-8 md:py-16 px-4 sm:px-8">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-30"
                   style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
            </div>
        <div className="max-w-3xl mx-auto relative z-[2]">
          <div className="inline-flex items-center gap-2 bg-acc-deep text-acc text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider border border-acc/30">
            <MapPin className="w-3.5 h-3.5" /> India Post PIN Directory
          </div>
          <h1 className="font-display text-2xl md:text-5xl font-extrabold text-ink mb-3 md:mb-4 leading-tight tracking-tight">
            Find Every PIN Code<br /><span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Across India</span>
          </h1>
          <p className="text-sm md:text-lg text-muted mb-6 md:mb-10 max-w-xl">
            Search post offices, bank branches, and administrative data for any India Post PIN code.
          </p>

          {/* Search Card */}
          <div className="bg-surface rounded-2xl shadow-[0_4px_24px_-4px_var(--acc-glow)] border border-line-2 overflow-hidden">
            {/* Mobile: pill tabs */}
            <div className="sm:hidden flex p-2 bg-bg-2 gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    tab === id
                      ? 'bg-raise text-acc'
                      : 'text-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label.replace('Search By ', '')}
                </button>
              ))}
            </div>
            {/* Desktop: bottom-border tabs */}
            <div className="hidden sm:flex border-b border-line">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${
                    tab === id
                      ? 'text-acc border-acc bg-acc-deep'
                      : 'text-faint border-transparent hover:text-body hover:bg-surface-2'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
            <div className="p-4 sm:p-6">
              {tab === 'pin'      && <ByPinCode />}
              {tab === 'office'   && <ByPostOffice />}
              {tab === 'location' && <ByLocation />}
            </div>
          </div>

          {/* Mobile quick links */}
          <div className="sm:hidden grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => setTab('location')}
              className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2 text-left active:scale-95 transition-all"
            >
              <LocateFixed className="w-5 h-5 text-acc" />
              <span className="text-sm font-semibold text-ink">Browse by State</span>
            </button>
            <a
              href="/ifsc-finder"
              className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2 active:scale-95 transition-all"
            >
              <Building2 className="w-5 h-5 text-acc" />
              <span className="text-sm font-semibold text-ink">IFSC Finder</span>
            </a>
          </div>
        </div>
          </div>
        </div>
      </header>

      {/* Why Use Our Pincode Finder */}
      <section className="py-16 px-4 bg-bg-2 border-b border-line">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-extrabold text-ink mb-3 tracking-tight">
              Why Choose Rupeepedia PIN Finder?
            </h2>
            <p className="text-muted max-w-xl mx-auto text-sm">
              Official data sources combined with powerful search — the most reliable PIN code directory in India.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {([
              {
                icon: <Zap className="w-6 h-6 text-white" />,
                gradient: 'from-acc to-acc-2',
                title: 'Pan-India Database',
                desc: 'Access a full directory of 150,000+ post offices across 28 states and 8 union territories.',
              },
              {
                icon: <Database className="w-6 h-6 text-white" />,
                gradient: 'from-violet-500 to-acc-2',
                title: 'Verified Records',
                desc: 'All postal index numbers are cross-referenced with official Indian postal data records.',
              },
              {
                icon: <Smartphone className="w-6 h-6 text-white" />,
                gradient: 'from-cyan to-acc',
                title: 'Instant Access',
                desc: 'Optimised for high speed — find area codes by locality name or PIN code in milliseconds.',
              },
              {
                icon: <Filter className="w-6 h-6 text-white" />,
                gradient: 'from-acc-2 to-violet-500',
                title: '100% Free Tool',
                desc: 'Unlimited searches for courier tracking, address verification, or logistics — no sign-up needed.',
              },
            ] as { icon: React.ReactNode; gradient: string; title: string; desc: string }[]).map(({ icon, gradient, title, desc }) => (
              <div key={title} className="bg-surface rounded-2xl p-6 border border-line flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-acc-glow`}>
                  {icon}
                </div>
                <h3 className="font-bold text-ink text-base leading-snug">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-bg">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-extrabold text-ink mb-2 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-muted text-sm">Get expert answers about Indian PIN codes and branch office protocols.</p>
          </div>
          <div className="space-y-3">
            {([
              {
                q: 'What is a PIN Code in the Indian context?',
                a: 'A PIN Code (Postal Index Number) is a 6-digit identification code used by India Post. Each digit represents a specific region, sub-region, sorting district, or delivery post office, allowing for accurate mail delivery across the country.',
              },
              {
                q: 'How do I verify the PIN code for a specific area?',
                a: "Use our Search by PIN Code or Search by Post Office tabs above. Simply enter the 6-digit PIN code or type the name of the locality, village, or town — our system matches it with the correct postal index number from our verified database.",
              },
              {
                q: 'Is the PIN code data on Rupeepedia updated?',
                a: 'Yes. We regularly synchronise our directory with official India Post records to ensure all new post office branches and boundary updates are reflected. Data is refreshed on a regular cycle to maintain accuracy.',
              },
              {
                q: 'What is the difference between H.O, S.O, and B.O post offices?',
                a: 'H.O (Head Office) is the main administrative hub for a district. S.O (Sub Office) serves towns and urban areas under a Head Office. B.O (Branch Office) is the smallest unit, serving villages and remote areas with limited services.',
              },
              {
                q: 'Can I search PIN codes by state and district?',
                a: 'Yes — use the "Search By Location" tab in the search card above. Select your state, then district, and the dropdown will list all PIN codes for that district. Selecting a PIN takes you directly to its full detail page.',
              },
            ] as { q: string; a: string }[]).map(({ q, a }) => (
              <LandingFAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 bg-bg">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-acc-deep to-surface rounded-3xl p-8 md:p-14 text-center border border-acc/25">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-ink mb-4 tracking-tight">
            Also looking for IFSC codes?
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Search all bank branches by PIN code, city, or bank name using our IFSC finder.
          </p>
          <a
            href="/ifsc-finder"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-mint to-acc text-white font-bold px-8 py-4 rounded-xl transition-all shadow-acc-glow hover:-translate-y-0.5"
          >
            <Search className="w-5 h-5" /> IFSC Code Finder
          </a>
        </div>
      </section>
    </>
  );
}
