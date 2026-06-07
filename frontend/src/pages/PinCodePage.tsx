import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MapPin, Building2, ChevronRight, Search,
  ArrowLeft, AlertCircle, ChevronDown, ChevronUp,
  Hash, Info, Share2, Bookmark,
} from 'lucide-react';
import { api, PinDetail, PostOfficeEntry, PinBranch } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';

function tc(s: string | null | undefined) {
  return s ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '';
}

const OFFICE_TYPE_FULL: Record<string, string> = {
  'H.O': 'Head Post Office',
  'S.O': 'Sub Post Office',
  'B.O': 'Branch Post Office',
};
function officeLabel(t: string | null | undefined) {
  return t ? (OFFICE_TYPE_FULL[t] ?? t) : 'Post Office';
}

const ZONES: Record<string, { name: string; region: string }> = {
  '1': { name: 'Zone 1', region: 'Northern India' },
  '2': { name: 'Zone 2', region: 'Northern India' },
  '3': { name: 'Zone 3', region: 'Western India' },
  '4': { name: 'Zone 4', region: 'Western India' },
  '5': { name: 'Zone 5', region: 'Southern India' },
  '6': { name: 'Zone 6', region: 'Southern India' },
  '7': { name: 'Zone 7', region: 'Eastern India' },
  '8': { name: 'Zone 8', region: 'Central & Eastern India' },
  '9': { name: 'Zone 9', region: 'Army Postal Service' },
};

const POSTAL_CIRCLES: Record<string, string> = {
  'Andhra Pradesh': 'Andhra Pradesh Circle',
  'Arunachal Pradesh': 'North East Circle',
  'Assam': 'North East Circle',
  'Bihar': 'Bihar Circle',
  'Chhattisgarh': 'Chhattisgarh Circle',
  'Delhi': 'Delhi Circle',
  'Goa': 'Maharashtra Circle',
  'Gujarat': 'Gujarat Circle',
  'Haryana': 'Haryana Circle',
  'Himachal Pradesh': 'Himachal Pradesh Circle',
  'Jammu And Kashmir': 'Jammu & Kashmir Circle',
  'Jammu and Kashmir': 'Jammu & Kashmir Circle',
  'Jharkhand': 'Jharkhand Circle',
  'Karnataka': 'Karnataka Circle',
  'Kerala': 'Kerala Circle',
  'Ladakh': 'Jammu & Kashmir Circle',
  'Lakshadweep': 'Kerala Circle',
  'Madhya Pradesh': 'Madhya Pradesh Circle',
  'Maharashtra': 'Maharashtra Circle',
  'Manipur': 'North East Circle',
  'Meghalaya': 'North East Circle',
  'Mizoram': 'North East Circle',
  'Nagaland': 'North East Circle',
  'Odisha': 'Odisha Circle',
  'Punjab': 'Punjab Circle',
  'Puducherry': 'Tamil Nadu Circle',
  'Rajasthan': 'Rajasthan Circle',
  'Sikkim': 'North East Circle',
  'Tamil Nadu': 'Tamil Nadu Circle',
  'Telangana': 'Telangana Circle',
  'Tripura': 'North East Circle',
  'Uttar Pradesh': 'Uttar Pradesh Circle',
  'Uttarakhand': 'Uttarakhand Circle',
  'West Bengal': 'West Bengal Circle',
  'Andaman And Nicobar Islands': 'Andaman & Nicobar Islands Circle',
  'Chandigarh': 'Punjab Circle',
};

function getPostalCircle(stateName: string | null) {
  if (!stateName) return 'India Post';
  const key = Object.keys(POSTAL_CIRCLES).find(k => k.toLowerCase() === stateName.toLowerCase());
  return key ? POSTAL_CIRCLES[key] : `${tc(stateName)} Circle`;
}

function headlineOffice(offices: PostOfficeEntry[]) {
  return (
    offices.find(o => o.office_type === 'H.O') ??
    offices.find(o => o.office_type === 'S.O') ??
    offices[0]
  );
}

function TypeBadge({ type }: { type: string | null | undefined }) {
  const map: Record<string, string> = {
    'H.O': 'bg-amber-100 text-amber-700',
    'S.O': 'bg-indigo-100 text-indigo-700',
    'B.O': 'bg-emerald-100 text-emerald-700',
  };
  const cls = (type && map[type]) ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cls}`}>
      {officeLabel(type)}
    </span>
  );
}

function PostOfficesTable({ offices, pin }: { offices: PostOfficeEntry[]; pin: string }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f9f9ff] border-b border-gray-100 text-xs font-semibold text-gray-400">
            <th className="px-4 py-3 text-left w-10">#</th>
            <th className="px-4 py-3 text-left">Branch Name</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Branch Type</th>
            <th className="px-4 py-3 text-left">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {offices.map((o, i) => {
            const open = expanded === i;
            return (
              <>
                <tr key={i} className={`transition-colors ${open ? 'bg-indigo-50/40' : 'hover:bg-indigo-50/20'}`}>
                  <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800">{tc(o.office_name)}</span>
                    <span className="sm:hidden ml-2"><TypeBadge type={o.office_type} /></span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><TypeBadge type={o.office_type} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setExpanded(open ? null : i)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs transition-colors"
                    >
                      Details {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
                {open && (
                  <tr key={`d-${i}`}>
                    <td colSpan={4} className="bg-indigo-50/60 border-t border-indigo-100 px-5 py-4">
                      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-2 text-sm max-w-2xl">
                        {([
                          ['Post Office',      tc(o.office_name)],
                          ['Post Office Type', officeLabel(o.office_type)],
                          ['District',         tc(o.district) || '—'],
                          ['State',            tc(o.state_name)],
                          ['Division',         tc(o.division) || '—'],
                          ['Delivery Status',  o.delivery ? 'Delivery' : 'Non-Delivery'],
                          ['PIN Code',         pin],
                          ['Address',          `Postmaster, ${officeLabel(o.office_type)}, ${[tc(o.district), tc(o.state_name)].filter(Boolean).join(', ')}, India (IN), Pin Code: ${pin}`],
                        ] as [string, string][]).map(([label, val]) => (
                          <div key={label} className="flex gap-2">
                            <span className="text-gray-400 shrink-0 w-32 text-sm">{label}:</span>
                            <span className={`font-medium text-gray-800 text-sm ${
                              label === 'PIN Code'        ? 'font-mono text-indigo-700' :
                              label === 'Delivery Status' ? (o.delivery ? 'text-emerald-700' : 'text-red-600') : ''
                            }`}>{val}</span>
                          </div>
                        ))}
                        {o.latitude && o.longitude && (
                          <div className="col-span-2 mt-1">
                            <a
                              href={`https://www.google.com/maps?q=${o.latitude},${o.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                            >
                              <MapPin className="w-3 h-3" /> View on Google Maps
                            </a>
                          </div>
                        )}
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
  );
}

function FAQItem({ q, a }: { q: string; a: string; n: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0 sm:border-0 sm:bg-white sm:rounded-xl sm:shadow-sm sm:overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 sm:px-5 text-left hover:text-[#3525cd] sm:hover:bg-indigo-50/30 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="pb-4 sm:px-5 text-sm text-gray-600 leading-relaxed sm:border-t sm:border-gray-100 sm:pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

// ── Mobile bank accordion row ─────────────────────────────────────────────────
function MobileBankRow({ b }: { b: PinBranch }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-3 px-1">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 active:opacity-70"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{tc(b.bank_name)}</p>
            <p className="text-xs text-gray-400 truncate">{tc(b.branch_name)}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-3 ml-12 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-400 uppercase tracking-wider font-semibold mb-0.5">IFSC</p>
            <Link to={`/ifsc/${b.ifsc}`} className="ifsc-mono font-bold text-[#3525cd] hover:underline">{b.ifsc}</Link>
          </div>
          {b.city && (
            <div>
              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-0.5">City</p>
              <p className="text-gray-700">{tc(b.city)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PinCodePage() {
  const { pincode } = useParams<{ pincode: string }>();
  const [bankFilter, setBankFilter] = useState('');
  const [showAllBanks, setShowAllBanks] = useState(false);

  const { data, isLoading, isError } = useQuery<PinDetail>({
    queryKey:  ['pin', pincode],
    queryFn:   () => api.getPinDetail(pincode!),
    enabled:   !!pincode && /^\d{6}$/.test(pincode),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const { data: districtOffices = [] } = useQuery({
    queryKey:  ['pin-district', data?.state_name, data?.district, pincode],
    queryFn:   () => api.getDistrictOffices(data!.state_name!, data!.district!, pincode),
    enabled:   !!data?.state_name && !!data?.district,
    staleTime: 12 * 60 * 60 * 1000,
  });

  if (!/^\d{6}$/.test(pincode ?? '')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
        <p className="text-gray-500">Invalid PIN code — must be 6 digits.</p>
        <Link to="/pin-codes" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">← PIN Directory</Link>
      </div>
    );
  }
  if (isLoading) return <LoadingSpinner message={`Looking up PIN ${pincode}…`} />;
  if (isError || !data) {
    return (
      <div className="bg-[#f9f9ff] min-h-[60vh] flex items-center justify-center px-4">
        <Helmet><meta name="robots" content="noindex, follow" /></Helmet>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-gray-800 mb-2">PIN code {pincode} not found</h1>
          <p className="text-sm text-gray-500 mb-5">No post offices found for this PIN code.</p>
          <Link to="/pin-codes" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">← Browse PIN Directory</Link>
        </div>
      </div>
    );
  }

  const { post_offices, bank_branches, stats, state_name, district } = data;
  const pin       = pincode!;
  const zone      = ZONES[pin[0]] ?? { name: `Zone ${pin[0]}`, region: 'India' };
  const circle    = getPostalCircle(state_name);
  const sortDist  = pin.slice(0, 3);
  const delivCode = pin.slice(3);
  const headline  = post_offices.length ? headlineOffice(post_offices) : null;
  const mainName  = headline ? `${tc(headline.office_name)} ${officeLabel(headline.office_type)}` : `PIN Code ${pin}`;
  const distLabel = tc(district);
  const stateLabel = tc(state_name);
  const locLabel  = [distLabel, stateLabel].filter(Boolean).join(', ');
  const canonicalUrl = `https://rupeepedia.in/pin/${pin}`;

  const pageTitle = `PIN Code ${pin} — ${mainName}${distLabel ? `, ${distLabel}` : ''}`;
  const pageDesc  = `PIN code ${pin} serves ${mainName} in ${locLabel}. ${stats.post_office_count} post offices, ${stats.branch_count} bank branches. ${zone.name} · ${stateLabel}.`;

  const typeCounts: Record<string, number> = {};
  post_offices.forEach(o => { const k = o.office_type ?? 'Unknown'; typeCounts[k] = (typeCounts[k] ?? 0) + 1; });
  const typeDesc = Object.entries(typeCounts)
    .map(([t, n]) => `${n} ${officeLabel(t)}${n > 1 ? '(s)' : ''}`)
    .join(', ');
  const deliveryCount = post_offices.filter(o => o.delivery).length;
  const nonDelivCount = post_offices.length - deliveryCount;
  const uniqueTypes   = [...new Set(post_offices.map(o => o.office_type).filter(Boolean))];

  const faqs = [
    {
      q: 'What is a PIN Code in the Indian context?',
      a: `A PIN Code (Postal Index Number) is a 6-digit identification code used by India Post. The first digit identifies the broad postal zone (PIN ${pin} falls under ${zone.name} — ${zone.region}), the first three digits pinpoint the sorting district (${sortDist}), and the last three digits identify the specific delivery post office (${delivCode}). PIN codes allow accurate mail sorting and delivery across all of India's 28 states and 8 union territories.`,
    },
    {
      q: `Which post offices are associated with PIN code ${pin}?`,
      a: `PIN code ${pin} covers ${post_offices.length} post office${post_offices.length > 1 ? 's' : ''} in ${distLabel || stateLabel}: ${typeDesc}. Each office falls under the ${circle} administered by India Post.`,
    },
    {
      q: `Which district and state does PIN code ${pin} belong to?`,
      a: `It belongs to ${distLabel || stateLabel} district in ${stateLabel}, India. The area falls under the ${circle} and is administered by India Post.`,
    },
    {
      q: `Is PIN code ${pin} suitable for courier and online deliveries?`,
      a: deliveryCount === post_offices.length
        ? `All ${post_offices.length} post office${post_offices.length > 1 ? 's' : ''} under PIN code ${pin} handle direct delivery. Courier and ecommerce shipments can generally be delivered to addresses under this PIN code by India Post and private couriers.`
        : nonDelivCount === post_offices.length
        ? `The post offices under PIN code ${pin} are non-delivery offices used for sorting and administration. For ecommerce and courier deliveries, confirm serviceability with your courier partner.`
        : `This PIN code has a mixed delivery status — ${deliveryCount} delivery office${deliveryCount > 1 ? 's' : ''} and ${nonDelivCount} non-delivery office${nonDelivCount > 1 ? 's' : ''}. Confirm serviceability with your courier partner.`,
    },
    {
      q: `What is the difference between the post office types under this PIN code?`,
      a: uniqueTypes.length === 0
        ? `This PIN code is served by post offices managed by India Post.`
        : (() => {
            const parts: string[] = [];
            if (uniqueTypes.includes('H.O')) parts.push('Head Post Offices (H.O) are the highest-level postal unit in a district — they manage all Sub and Branch Post Offices in their jurisdiction.');
            if (uniqueTypes.includes('S.O')) parts.push('Sub Post Offices (S.O) serve a town or large locality, operating under the Head Office.');
            if (uniqueTypes.includes('B.O')) parts.push('Branch Post Offices (B.O) are the smallest units, serving specific villages or localities.');
            return `This PIN code is served by ${typeDesc}. ${parts.join(' ')}`;
          })(),
    },
  ];

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://rupeepedia.in/' },
        { '@type': 'ListItem', position: 2, name: 'PIN Codes', item: 'https://rupeepedia.in/pin-codes' },
        { '@type': 'ListItem', position: 3, name: `PIN ${pin}`, item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  // Bank branches with client-side filter
  const filteredBanks = bankFilter.trim()
    ? bank_branches.filter((b: PinBranch) =>
        b.bank_name?.toLowerCase().includes(bankFilter.toLowerCase()) ||
        b.branch_name?.toLowerCase().includes(bankFilter.toLowerCase())
      )
    : bank_branches;
  const visibleBanks = showAllBanks ? filteredBanks : filteredBanks.slice(0, 8);

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Rupeepedia</title>
        <meta name="description"        content={pageDesc} />
        <link rel="canonical"           href={canonicalUrl} />
        <meta property="og:title"       content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url"         content={canonicalUrl} />
        <meta name="robots"             content="index, follow" />
        {schemas.map((s, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
        ))}
      </Helmet>

      {/* ── Hero ── */}
      <section className="bg-[#f9f9ff] py-10 md:py-14 border-b border-indigo-100/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
              <Link to="/"          className="hover:text-indigo-600 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/pin-codes" className="hover:text-indigo-600 transition-colors">PIN Codes</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-700 font-mono font-semibold">{pin}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#3525cd] tracking-tight mb-2 font-mono">
                  PIN Code: {pin}
                </h1>
                {headline && (
                  <p className="text-gray-600 text-lg">
                    {tc(headline.office_name)}, {officeLabel(headline.office_type)}
                    {distLabel && `, ${distLabel}`}
                    {stateLabel && `, ${stateLabel}`}.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-indigo-700 text-white sm:px-5 px-3 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 hover:bg-indigo-800 transition-all active:scale-95">
                  <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
                </button>
                <button className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-white text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-6">
              {[
                { n: stats.post_office_count, label: 'Post Offices'  },
                { n: stats.delivery_offices,  label: 'Delivery'      },
                { n: stats.branch_count,      label: 'Bank Branches' },
                { n: stats.bank_count,        label: 'Banks'         },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{n}</p>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <AdUnit slot={AD_SLOTS.PIN_TOP} className="max-w-5xl mx-auto px-4 pt-6" />

      {/* ── Bento grid ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* ── Left column (8/12) ── */}
          <div className="md:col-span-8 space-y-6">

            {/* Post Office Primary Details */}
            {headline && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Post Office Primary Details</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
                  {[
                    ['Branch Name',    tc(headline.office_name), true],
                    ['Office Type',    officeLabel(headline.office_type), false],
                    ['District',       tc(headline.district) || '—', false],
                    ['State',          tc(headline.state_name), false],
                    ['Division',       tc(headline.division) || '—', false],
                    ['Delivery Status', headline.delivery ? 'Delivery' : 'Non-Delivery', false],
                  ].map(([label, val, bold]) => (
                    <div key={label as string} className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                      {label === 'Office Type' ? (
                        <TypeBadge type={headline.office_type} />
                      ) : label === 'Delivery Status' ? (
                        <span className={`flex items-center gap-2 text-sm font-medium ${headline.delivery ? 'text-emerald-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${headline.delivery ? 'bg-emerald-500' : 'bg-red-400'}`} />
                          {val as string}
                        </span>
                      ) : (
                        <p className={`text-sm text-gray-800 ${bold ? 'font-bold text-base' : ''}`}>{val as string}</p>
                      )}
                    </div>
                  ))}
                  <div className="sm:col-span-2 space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Postmaster, {officeLabel(headline.office_type)}, {[tc(headline.district), tc(headline.state_name)].filter(Boolean).join(', ')}, India (IN), Pin Code: {pin}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* All Post Offices (if multiple) */}
            {post_offices.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">All Post Offices in {pin}</h2>
                    <p className="text-xs text-gray-400">{post_offices.length} offices</p>
                  </div>
                </div>
                <div className="p-4">
                  <PostOfficesTable offices={post_offices} pin={pin} />
                </div>
              </div>
            )}

            {/* HO / SO / BO explainer */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-base">Understanding Post Office Types</h2>
                <p className="text-sm text-gray-400 mt-0.5">India Post operates a three-tier structure across the country</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {/* H.O */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1.5 rounded-full">H.O</span>
                    <span className="text-base font-bold text-gray-800">Head Post Office</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Main administrative hub for a district or large city zone. Manages all Sub and Branch Post Offices beneath it. Handles Speed Post, savings accounts, money orders, and full logistics services.
                  </p>
                  <p className="text-xs text-amber-600 font-semibold mt-2">Full services · District-level control</p>
                </div>
                {/* S.O */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-3 py-1.5 rounded-full">S.O</span>
                    <span className="text-base font-bold text-gray-800">Sub Post Office</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Operates in towns and urban neighbourhoods under a Head Office. Primary interface for the public in populated areas. Provides nearly all services — savings accounts, Speed Post, and government facilities.
                  </p>
                  <p className="text-xs text-indigo-600 font-semibold mt-2">Most urban PIN codes · Near-full services</p>
                </div>
                {/* B.O */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="bg-brand-100 text-brand-700 text-sm font-bold px-3 py-1.5 rounded-full">B.O</span>
                    <span className="text-base font-bold text-gray-800">Branch Post Office</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Most common in rural India — serves villages and remote areas under a designated Account Office. Offers letter delivery, basic savings schemes, money orders, and government benefit disbursements.
                  </p>
                  <p className="text-xs text-brand-600 font-semibold mt-2">Village-level · Limited hours &amp; services</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" />
                <h2 className="font-bold text-gray-900 text-base">About PIN Code {pin}</h2>
              </div>
              <div className="px-6 py-5 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  PIN code <strong className="text-gray-800 font-mono">{pin}</strong> is the Postal Index Number assigned to{' '}
                  <strong className="text-gray-800">{mainName}</strong>
                  {district ? ` in ${distLabel.toUpperCase()} district` : ''}{state_name ? `, ${stateLabel}` : ''}.
                  Administered under the <strong className="text-gray-800">{circle}</strong> Postal Circle — {zone.name} covering {zone.region}.
                </p>
                <p>
                  The first digit (<strong className="text-gray-800 font-mono">{pin[0]}</strong>) identifies the postal zone;
                  the first three digits (<strong className="text-gray-800 font-mono">{sortDist}</strong>) pinpoint the sorting district;
                  the last three (<strong className="text-gray-800 font-mono">{delivCode}</strong>) identify the delivery post office.
                </p>
              </div>
            </div>

            {/* Bank Branches */}
            {bank_branches.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-base">Banks in {pin}</h2>
                      <p className="text-xs text-gray-400">{stats.branch_count} branches · {stats.bank_count} banks</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={bankFilter}
                      onChange={e => setBankFilter(e.target.value)}
                      placeholder="Filter banks…"
                      className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-xs w-full sm:w-52 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                </div>
                {/* Mobile: accordion cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {visibleBanks.map((b: PinBranch) => (
                    <MobileBankRow key={b.ifsc} b={b} />
                  ))}
                </div>
                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f9f9ff] border-b border-gray-100 text-xs font-semibold text-gray-400">
                        <th className="px-5 py-3 text-left">Bank Name</th>
                        <th className="px-5 py-3 text-left">Branch</th>
                        <th className="px-5 py-3 text-right">IFSC Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {visibleBanks.map((b: PinBranch) => (
                        <tr key={b.ifsc} className="hover:bg-indigo-50/20 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-indigo-700">{tc(b.bank_name)}</td>
                          <td className="px-5 py-3.5 text-gray-600">{tc(b.branch_name)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              to={`/ifsc/${b.ifsc}`}
                              className="ifsc-mono text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                            >
                              {b.ifsc}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredBanks.length > 8 && (
                  <div className="px-5 py-3.5 bg-[#f9f9ff] border-t border-gray-100 text-center">
                    <button
                      onClick={() => setShowAllBanks(v => !v)}
                      className="text-indigo-700 font-bold text-sm hover:underline transition-all"
                    >
                      {showAllBanks ? 'Show less' : `View ${filteredBanks.length - 8} more banks`}
                    </button>
                  </div>
                )}
              </div>
            )}

            <AdUnit slot={AD_SLOTS.PIN_MID} />

            {/* FAQ */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-indigo-500" />
                Frequently Asked Questions — PIN {pin}
              </h2>
              <div className="space-y-3">
                {faqs.map((f, i) => (
                  <FAQItem key={i} n={i + 1} q={f.q} a={f.a} />
                ))}
              </div>
            </section>

            {/* Back nav */}
            <div className="flex items-center gap-4 text-sm pb-4 border-t border-gray-100 pt-4">
              <Link to="/pin-codes" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> PIN Directory
              </Link>
              <Link to="/ifsc-finder" className="text-gray-400 hover:text-gray-600 transition-colors">IFSC Finder →</Link>
            </div>
          </div>

          {/* ── Right sidebar (4/12) ── */}
          <aside className="md:col-span-4 space-y-5">

            {/* Location Profile */}
            <div className="bg-indigo-700 text-white rounded-2xl p-6 shadow-xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Location Profile</h3>
                <p className="text-white/60 text-sm mb-5">{zone.name} · {zone.region}</p>
                <div className="space-y-4">
                  {[
                    { label: 'Postal Circle', val: circle },
                    { label: 'State / UT',    val: stateLabel || '—' },
                    ...(distLabel ? [{ label: 'District', val: distLabel }] : []),
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="bg-white/15 rounded-lg p-1.5 mt-0.5 shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</p>
                        <p className="font-semibold text-sm">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 opacity-10">
                <MapPin className="w-32 h-32" />
              </div>
            </div>

            {/* Quick Reference */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4 text-indigo-500" /> Quick Reference
                </h3>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['PIN Code',      <span className="font-mono font-bold text-indigo-700">{pin}</span>],
                    ['Zone',          `${zone.name}`],
                    ['Region',        zone.region],
                    ['Sort District', sortDist],
                    ['Delivery Code', delivCode],
                  ].map(([label, val]) => (
                    <tr key={String(label)} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-5 py-2.5 text-gray-400 text-xs font-semibold uppercase tracking-wider w-36">{label}</td>
                      <td className="px-5 py-2.5 text-gray-800 font-semibold text-sm">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Nearby PIN Codes */}
            {districtOffices.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Nearby PIN Codes
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {(districtOffices as any[]).slice(0, 8).map((o: any) => (
                    <Link
                      key={o.pin_code}
                      to={`/pin/${o.pin_code}`}
                      className="bg-[#f9f9ff] p-3 rounded-xl border border-indigo-50 hover:border-indigo-300 hover:bg-indigo-50 transition-all group text-center"
                    >
                      <p className="font-mono font-bold text-indigo-700 text-sm group-hover:text-indigo-900">{o.pin_code}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-tight">{tc(o.office_name)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* IFSC cross-link */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-indigo-900 text-sm">Find IFSC codes near {pin}</h3>
              </div>
              <p className="text-sm text-indigo-700/60 mb-4">Search all bank branches by PIN code, city, or bank name.</p>
              <Link
                to="/ifsc-finder"
                className="flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-full"
              >
                <Search className="w-4 h-4" /> IFSC Finder
              </Link>
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}
