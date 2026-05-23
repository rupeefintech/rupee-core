import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Info, ChevronDown, ChevronUp } from 'lucide-react';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';

type HolidayType = 'national' | 'regional';

interface Holiday {
  date: string;   // YYYY-MM-DD
  name: string;
  type: HolidayType;
  states: string[];  // ['ALL'] or specific state names
  note?: string;
}

const ALL_STATES = 'ALL';

const HOLIDAYS_2025: Holiday[] = [
  { date: '2025-01-14', name: 'Makar Sankranti / Pongal / Lohri', type: 'regional', states: ['Tamil Nadu', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand'] },
  { date: '2025-01-23', name: 'Netaji Subhas Chandra Bose Jayanti', type: 'regional', states: ['West Bengal'] },
  { date: '2025-01-26', name: 'Republic Day', type: 'national', states: [ALL_STATES] },
  { date: '2025-02-19', name: 'Chhatrapati Shivaji Maharaj Jayanti', type: 'regional', states: ['Maharashtra'] },
  { date: '2025-02-26', name: 'Maha Shivratri', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Uttarakhand'] },
  { date: '2025-03-14', name: 'Holi', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand', 'West Bengal'] },
  { date: '2025-03-30', name: 'Ugadi / Gudi Padwa', type: 'regional', states: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra'] },
  { date: '2025-04-06', name: 'Ram Navami', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Karnataka', 'Andhra Pradesh', 'Telangana'] },
  { date: '2025-04-10', name: 'Mahavir Jayanti', type: 'national', states: [ALL_STATES] },
  { date: '2025-04-14', name: 'Dr. B.R. Ambedkar Jayanti / Tamil New Year / Baisakhi', type: 'national', states: [ALL_STATES], note: 'Tamil New Year (Tamil Nadu), Baisakhi (Punjab/Haryana), Vishu (Kerala)' },
  { date: '2025-04-18', name: 'Good Friday', type: 'national', states: [ALL_STATES] },
  { date: '2025-05-01', name: 'Maharashtra Day / Labour Day / Gujarat Day', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Tamil Nadu', 'Kerala', 'Punjab', 'West Bengal', 'Telangana', 'Andhra Pradesh', 'Karnataka'] },
  { date: '2025-05-12', name: 'Buddha Purnima', type: 'national', states: [ALL_STATES] },
  { date: '2025-06-07', name: 'Eid ul-Adha (Bakrid)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'], note: 'Date subject to moon sighting' },
  { date: '2025-07-06', name: 'Muharram', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'], note: 'Date subject to moon sighting' },
  { date: '2025-08-15', name: 'Independence Day', type: 'national', states: [ALL_STATES] },
  { date: '2025-08-16', name: 'Janmashtami', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'West Bengal', 'Himachal Pradesh', 'Uttarakhand'] },
  { date: '2025-08-27', name: 'Ganesh Chaturthi', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Goa'] },
  { date: '2025-09-05', name: 'Milad-un-Nabi (Prophet\'s Birthday)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh'], note: 'Date subject to moon sighting' },
  { date: '2025-10-02', name: 'Gandhi Jayanti / Dussehra', type: 'national', states: [ALL_STATES], note: 'Gandhi Jayanti is a national holiday. Dussehra coincides in 2025.' },
  { date: '2025-10-20', name: 'Diwali (Lakshmi Puja)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'West Bengal'] },
  { date: '2025-10-21', name: 'Govardhan Puja / Diwali (South)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana'] },
  { date: '2025-10-22', name: 'Bhai Duj', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand'] },
  { date: '2025-11-01', name: 'Kannada Rajyotsava / AP Formation Day', type: 'regional', states: ['Karnataka', 'Andhra Pradesh', 'Telangana'] },
  { date: '2025-11-05', name: 'Guru Nanak Jayanti', type: 'national', states: [ALL_STATES] },
  { date: '2025-12-25', name: 'Christmas Day', type: 'national', states: [ALL_STATES] },
];

const HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-14', name: 'Makar Sankranti / Pongal / Lohri', type: 'regional', states: ['Tamil Nadu', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand'] },
  { date: '2026-01-26', name: 'Republic Day', type: 'national', states: [ALL_STATES] },
  { date: '2026-02-16', name: 'Maha Shivratri', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Uttarakhand'] },
  { date: '2026-03-04', name: 'Holi', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand', 'West Bengal'] },
  { date: '2026-03-19', name: 'Ugadi / Gudi Padwa', type: 'regional', states: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra'] },
  { date: '2026-04-03', name: 'Good Friday', type: 'national', states: [ALL_STATES] },
  { date: '2026-04-14', name: 'Dr. B.R. Ambedkar Jayanti / Tamil New Year / Baisakhi', type: 'national', states: [ALL_STATES], note: 'Tamil New Year (Tamil Nadu), Baisakhi (Punjab/Haryana)' },
  { date: '2026-04-23', name: 'Ram Navami', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Karnataka', 'Andhra Pradesh', 'Telangana'] },
  { date: '2026-05-01', name: 'Maharashtra Day / Labour Day / Gujarat Day', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Tamil Nadu', 'Kerala', 'Punjab', 'West Bengal', 'Telangana', 'Andhra Pradesh', 'Karnataka'] },
  { date: '2026-05-27', name: 'Eid ul-Adha (Bakrid)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'], note: 'Approximate — date subject to moon sighting' },
  { date: '2026-06-26', name: 'Muharram', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'], note: 'Approximate — date subject to moon sighting' },
  { date: '2026-08-15', name: 'Independence Day', type: 'national', states: [ALL_STATES] },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national', states: [ALL_STATES] },
  { date: '2026-11-08', name: 'Diwali (Lakshmi Puja)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'West Bengal'], note: 'Approximate — verify with RBI circular' },
  { date: '2026-11-25', name: 'Guru Nanak Jayanti', type: 'national', states: [ALL_STATES], note: 'Approximate — verify with RBI circular' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'national', states: [ALL_STATES] },
];

const HOLIDAY_DATA: Record<number, Holiday[]> = { 2025: HOLIDAYS_2025, 2026: HOLIDAYS_2026 };

const STATE_FILTERS: string[] = (() => {
  const all = [...HOLIDAYS_2025, ...HOLIDAYS_2026].flatMap(h => h.states);
  const states = [...new Set(all.filter(s => s !== ALL_STATES))].sort();
  return ['All India', ...states];
})();

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function parseDateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function formatDisplay(iso: string) {
  const { year, month, day } = parseDateParts(iso);
  const dt = new Date(year, month - 1, day);
  return { dayName: DAYS[dt.getDay()], monthName: MONTHS[month - 1], day, year };
}

function TypeBadge({ type }: { type: HolidayType }) {
  return type === 'national'
    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">National</span>
    : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">Regional</span>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">
        <span>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-3" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-3" />}
      </button>
      {open && <div className="px-4 pb-4 pt-2 text-sm text-slate-500 leading-relaxed border-t border-slate-50">{a}</div>}
    </div>
  );
}

export default function BankHolidayPage() {
  const today      = new Date();
  const todayISO   = today.toISOString().split('T')[0];
  const currentYear = today.getFullYear();

  const [year,  setYear]  = useState<number>(currentYear >= 2026 ? 2026 : 2025);
  const [state, setState] = useState('All India');
  const [openNote, setOpenNote] = useState<string | null>(null);

  const holidays = HOLIDAY_DATA[year] ?? HOLIDAYS_2026;

  const filtered = useMemo(() => {
    if (state === 'All India') return holidays;
    return holidays.filter(h => h.states.includes(ALL_STATES) || h.states.includes(state));
  }, [holidays, state]);

  const byMonth = useMemo(() => {
    const map: Record<number, Holiday[]> = {};
    for (const h of filtered) {
      const m = parseDateParts(h.date).month;
      (map[m] ??= []).push(h);
    }
    return map;
  }, [filtered]);

  const upcoming = useMemo(() =>
    filtered.find(h => h.date >= todayISO) ?? null,
  [filtered, todayISO]);

  const daysUntil = useMemo(() => {
    if (!upcoming) return null;
    const { year: y, month: m, day: d } = parseDateParts(upcoming.date);
    const diff = new Date(y, m - 1, d).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return Math.round(diff / 86400000);
  }, [upcoming, today]);

  const nationalCount  = filtered.filter(h => h.type === 'national').length;
  const regionalCount  = filtered.filter(h => h.type === 'regional').length;

  const canonicalUrl = 'https://rupeepedia.in/bank-holidays';
  const pageTitle    = `Bank Holidays ${year} India — RBI Holiday List | Rupeepedia`;
  const pageDesc     = `Complete list of bank holidays ${year} in India. ${nationalCount} national + ${regionalCount} regional holidays. State-wise RBI bank holiday calendar for all states.`;

  const faqs = [
    { q: 'Are bank holidays the same across all states in India?', a: 'No. Banks in India observe three categories: National holidays (all banks), State/UT holidays (specific states), and bank-specific closures. RBI issues a master circular each year under the Negotiable Instruments Act listing all approved holidays.' },
    { q: 'What happens to NEFT/RTGS/IMPS on bank holidays?', a: 'NEFT and RTGS are settled only on working days. IMPS (Immediate Payment Service) operates 24x7 including bank holidays and Sundays. UPI also works on holidays for most transactions.' },
    { q: 'Do all banks follow the same holiday list?', a: 'All scheduled commercial banks follow the RBI-mandated NI Act holiday list. Some banks may have additional local closures based on state government notifications.' },
    { q: 'Can I use ATMs and internet banking on bank holidays?', a: 'Yes. ATMs, internet banking, mobile banking, and UPI work 24x7 regardless of bank holidays. Only branch operations and clearing services (NEFT/RTGS) are suspended on holidays.' },
    { q: 'When is the next bank holiday in my state?', a: `Use the state filter above to see holidays for your state. The next upcoming holiday ${upcoming ? `is ${upcoming.name} on ${formatDisplay(upcoming.date).day} ${formatDisplay(upcoming.date).monthName} ${year}` : 'will be shown when you select your state'}.` },
  ];

  const schemaEvents = filtered.map(h => {
    const { day, monthName, year: y } = formatDisplay(h.date);
    return {
      '@type': 'Event',
      name: h.name,
      startDate: h.date,
      endDate: h.date,
      description: `${h.type === 'national' ? 'National bank holiday' : 'Regional bank holiday'} — ${h.states.includes(ALL_STATES) ? 'All states' : h.states.slice(0, 5).join(', ')}`,
      location: { '@type': 'Place', name: h.states.includes(ALL_STATES) ? 'India' : h.states.join(', '), address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
      organizer: { '@type': 'Organization', name: 'Reserve Bank of India', url: 'https://rbi.org.in' },
      eventStatus: 'https://schema.org/EventScheduled',
    };
  });

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', name: `Bank Holidays ${year} India`, itemListElement: schemaEvents.map((e, i) => ({ '@type': 'ListItem', position: i + 1, item: e })) })}</script>
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })}</script>
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-10 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" /> RBI Holiday Calendar
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Bank Holidays {year} — India</h1>
        <p className="text-brand-100 text-sm max-w-lg mx-auto">
          Complete state-wise bank holiday list as per RBI NI Act circular. {filtered.length} holidays for {state === 'All India' ? 'all states' : state}.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Year + State filter bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 space-y-4">
          {/* Year tabs */}
          <div className="flex gap-2">
            {[2025, 2026].map(y => (
              <button key={y} onClick={() => setYear(y)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${year === y ? 'bg-brand-700 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {y}
              </button>
            ))}
            {year === 2026 && (
              <span className="ml-auto self-center text-[11px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                2026 dates are indicative — verify with official RBI circular
              </span>
            )}
          </div>
          {/* State filter dropdown */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <MapPin className="w-3.5 h-3.5" /> State
            </label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="flex-1 max-w-xs text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
            >
              {STATE_FILTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {state !== 'All India' && (
              <button
                onClick={() => setState('All India')}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 2nd & 4th Saturday callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <span className="font-bold">2nd and 4th Saturdays</span> — all bank branches are closed every 2nd and 4th Saturday of the month (RBI rule since 2015). 1st, 3rd, and 5th Saturdays are working days.
            <span className="font-bold"> April 1</span> (annual bank closing day) is also a non-working day.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Holidays',    value: filtered.length },
            { label: 'National Holidays', value: nationalCount   },
            { label: 'Regional Holidays', value: regionalCount   },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-brand-700">{value}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main holiday list */}
          <div className="md:col-span-8 space-y-5">
            {Object.entries(byMonth)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([monthNum, monthHolidays]) => {
                const isPast = new Date(year, Number(monthNum) - 1, 28) < today;
                return (
                  <div key={monthNum} className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
                    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                      <h2 className="font-bold text-slate-700 text-sm">{MONTHS[Number(monthNum) - 1]} {year}</h2>
                      <span className="text-xs text-slate-400">{monthHolidays.length} holiday{monthHolidays.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {monthHolidays.map(h => {
                        const { dayName, day } = formatDisplay(h.date);
                        const isToday    = h.date === todayISO;
                        const isUpcoming = h.date === upcoming?.date;
                        return (
                          <div key={h.date}
                            className={`px-5 py-3.5 flex items-start gap-4 ${isUpcoming ? 'bg-brand-50 border-l-2 border-brand-500' : 'hover:bg-slate-50'} transition-colors`}>
                            {/* Date block */}
                            <div className={`text-center w-12 shrink-0 rounded-lg py-1.5 ${isToday ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                              <p className="text-[10px] font-semibold uppercase">{dayName}</p>
                              <p className="text-lg font-extrabold leading-none">{day}</p>
                            </div>
                            {/* Holiday info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-800 text-sm">{h.name}</p>
                                {isUpcoming && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <TypeBadge type={h.type} />
                                <span className="text-[11px] text-slate-400">
                                  {h.states.includes(ALL_STATES) ? 'All States' : h.states.slice(0, 3).join(', ') + (h.states.length > 3 ? ` +${h.states.length - 3} more` : '')}
                                </span>
                                {h.note && (
                                  <button
                                    onClick={() => setOpenNote(openNote === h.date ? null : h.date)}
                                    className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700"
                                  >
                                    <Info className="w-3 h-3" />
                                    Note
                                  </button>
                                )}
                              </div>
                              {openNote === h.date && h.note && (
                                <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">{h.note}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            {filtered.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 text-center text-slate-400 text-sm">
                No holidays found for {state} in {year}.
              </div>
            )}

            {/* FAQ */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-5">
            {/* Upcoming holiday */}
            {upcoming && (
              <div className="bg-brand-700 text-white rounded-xl p-5 shadow-lg shadow-brand-500/20">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-200 mb-3">Next Bank Holiday</p>
                <div className="flex items-start gap-3">
                  <div className="bg-white/15 rounded-xl p-3 text-center min-w-[52px]">
                    <p className="text-[10px] font-semibold uppercase text-brand-200">{formatDisplay(upcoming.date).monthName.slice(0, 3)}</p>
                    <p className="text-2xl font-extrabold leading-none">{formatDisplay(upcoming.date).day}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-snug">{upcoming.name}</p>
                    <p className="text-brand-200 text-xs mt-1">
                      {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days away`}
                    </p>
                    <TypeBadge type={upcoming.type} />
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Holiday Types</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap mt-0.5">National</span>
                  <p className="text-xs text-slate-500">Mandated by Central Government — all banks closed across India.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap mt-0.5">Regional</span>
                  <p className="text-xs text-slate-500">State or UT holiday — bank branches in observing states are closed.</p>
                </div>
              </div>
            </div>

            {/* FD Calculator CTA */}
            <div className="bg-gradient-to-br from-slate-50 to-brand-50 rounded-xl border border-brand-100 p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-1">Plan around holidays</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                FD maturity on a bank holiday? Calculate your returns and choose an optimal tenure.
              </p>
              <Link
                to="/calculators/fd"
                className="flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors w-full"
              >
                <Calendar className="w-3.5 h-3.5" /> FD Calculator →
              </Link>
            </div>

            {/* AdSense */}
            <AdUnit slot={AD_SLOTS.HOLIDAY_MID} />

            {/* IFSC cross-link */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-center">
              <p className="text-xs text-slate-400 mb-3">Need a bank's IFSC code?</p>
              <Link to="/ifsc-finder"
                className="text-xs font-bold text-brand-700 hover:underline">
                IFSC Code Finder →
              </Link>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 leading-relaxed px-1">
              Holiday dates are compiled from RBI circulars and official state government notifications. Dates marked as approximate should be verified with the official RBI circular for {year}.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
