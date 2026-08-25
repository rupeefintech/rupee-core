import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Info, ChevronDown, ChevronUp } from 'lucide-react';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';
import { ALL_STATES, HOLIDAY_DATA, HOLIDAYS_2025, HOLIDAYS_2026 } from '../data/bankHolidays';
import type { Holiday, HolidayType } from '../data/bankHolidays';


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
    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mint/10 text-mint whitespace-nowrap">National</span>
    : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan/10 text-cyan whitespace-nowrap">Regional</span>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0 sm:border-0 sm:bg-surface sm:rounded-xl sm:border sm:border-line sm:overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 sm:px-5 text-left hover:text-acc sm:hover:bg-surface-2 transition-colors">
        <span className="font-semibold text-ink text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-acc shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted shrink-0" />}
      </button>
      {open && (
        <div className="pb-4 sm:px-5 text-sm text-muted leading-relaxed sm:border-t sm:border-line sm:pt-3">
          {a}
        </div>
      )}
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
  const pageTitle    = `Bank Holidays ${year} India — Complete RBI Holiday List | RupeePedia`;
  const nextHolidayText = upcoming
    ? `Next: ${upcoming.name} on ${new Date(upcoming.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${year}. `
    : '';
  const pageDesc     = `${nextHolidayText}Complete list of bank holidays ${year} in India — ${nationalCount} national + ${regionalCount} regional holidays. State-wise RBI holiday calendar.`;

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
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: pageTitle,
              url: canonicalUrl,
              description: pageDesc,
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                  { '@type': 'ListItem', position: 2, name: `Bank Holidays ${year}`, item: canonicalUrl },
                ],
              },
            },
            {
              '@type': 'ItemList',
              name: `Bank Holidays ${year} India`,
              itemListElement: schemaEvents.map((e, i) => ({ '@type': 'ListItem', position: i + 1, item: e })),
            },
            {
              '@type': 'FAQPage',
              mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            },
            ...(upcoming ? [{
              '@type': 'SpecialAnnouncement',
              name: `Next Bank Holiday: ${upcoming.name}`,
              text: `The next bank holiday in India is ${upcoming.name} on ${upcoming.date}. ${upcoming.states.includes(ALL_STATES) ? 'Applicable to all states.' : `Applicable in: ${upcoming.states.slice(0, 5).join(', ')}.`}`,
              datePosted: new Date().toISOString().split('T')[0],
              expires: upcoming.date,
              announcementLocation: { '@type': 'Place', name: 'India', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
            }] : []),
          ],
        })}</script>
      </Helmet>

      {/* Hero */}
      <header className="py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10 text-center">
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div className="inline-flex items-center gap-2 bg-acc-deep text-acc text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> RBI Holiday Calendar
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2"><span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Bank Holidays</span> {year} — India</h1>
                <p className="text-body text-sm max-w-lg mx-auto">
                  Complete state-wise bank holiday list as per RBI NI Act circular. {filtered.length} holidays for {state === 'All India' ? 'all states' : state}.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-5xl mx-auto px-4 py-8">
        {/* Year + State filter bar */}
        <div className="bg-surface rounded-2xl border border-line p-4 mb-6 space-y-4">
          {/* Year tabs */}
          <div className="flex gap-2">
            {[2025, 2026].map(y => (
              <button key={y} onClick={() => setYear(y)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${year === y ? 'bg-gradient-to-br from-mint to-acc text-white shadow-acc-glow' : 'bg-surface-2 text-muted hover:bg-surface hover:text-body'}`}>
                {y}
              </button>
            ))}
            {year === 2026 && (
              <span className="ml-auto self-center text-[11px] text-gold font-semibold bg-gold/10 border border-gold/30 px-2 py-1 rounded-lg">
                2026 dates are indicative — verify with official RBI circular
              </span>
            )}
          </div>
          {/* State filter dropdown */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-bold text-faint uppercase tracking-wider shrink-0">
              <MapPin className="w-3.5 h-3.5" /> State
            </label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="flex-1 max-w-xs text-sm font-semibold text-ink bg-bg-2 border border-line-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc cursor-pointer"
            >
              {STATE_FILTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {state !== 'All India' && (
              <button
                onClick={() => setState('All India')}
                className="text-xs text-faint hover:text-muted underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 2nd & 4th Saturday callout */}
        <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p className="text-sm text-body">
            <span className="font-bold text-gold">2nd and 4th Saturdays</span> — all bank branches are closed every 2nd and 4th Saturday of the month (RBI rule since 2015). 1st, 3rd, and 5th Saturdays are working days.
            <span className="font-bold text-gold"> April 1</span> (annual bank closing day) is also a non-working day.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Holidays',    value: filtered.length },
            { label: 'National Holidays', value: nationalCount   },
            { label: 'Regional Holidays', value: regionalCount   },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface rounded-2xl border border-line p-4 text-center">
              <p className="text-2xl font-extrabold text-ink">{value}</p>
              <p className="text-xs text-faint font-semibold uppercase tracking-wider mt-0.5">{label}</p>
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
                  <div key={monthNum} className={`bg-surface rounded-2xl border border-line overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
                    <div className="bg-surface-2 border-b border-line px-5 py-3 flex items-center justify-between">
                      <h2 className="font-bold text-body text-sm">{MONTHS[Number(monthNum) - 1]} {year}</h2>
                      <span className="text-xs text-faint">{monthHolidays.length} holiday{monthHolidays.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="divide-y divide-line">
                      {monthHolidays.map(h => {
                        const { dayName, day } = formatDisplay(h.date);
                        const isToday    = h.date === todayISO;
                        const isUpcoming = h.date === upcoming?.date;
                        return (
                          <div key={h.date}
                            className={`px-5 py-3.5 flex items-start gap-4 ${isUpcoming ? 'bg-acc-deep border-l-2 border-acc' : 'hover:bg-surface-2'} transition-colors`}>
                            {/* Date block */}
                            <div className={`text-center w-12 shrink-0 rounded-lg py-1.5 ${isToday ? 'bg-acc text-white' : 'bg-surface-2 text-body'}`}>
                              <p className="text-[10px] font-semibold uppercase">{dayName}</p>
                              <p className="text-lg font-extrabold leading-none">{day}</p>
                            </div>
                            {/* Holiday info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-semibold text-ink text-sm">{h.name}</p>
                                {isUpcoming && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-acc-deep text-acc">
                                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <TypeBadge type={h.type} />
                                <span className="text-[11px] text-faint">
                                  {h.states.includes(ALL_STATES) ? 'All States' : h.states.slice(0, 3).join(', ') + (h.states.length > 3 ? ` +${h.states.length - 3} more` : '')}
                                </span>
                                {h.note && (
                                  <button
                                    onClick={() => setOpenNote(openNote === h.date ? null : h.date)}
                                    className="inline-flex items-center gap-1 text-[11px] text-gold hover:text-gold/80"
                                  >
                                    <Info className="w-3 h-3" />
                                    Note
                                  </button>
                                )}
                              </div>
                              {openNote === h.date && h.note && (
                                <p className="mt-2 text-[11px] text-body bg-gold/10 border border-gold/30 rounded-lg px-3 py-2 leading-relaxed">{h.note}</p>
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
              <div className="bg-surface rounded-2xl border border-line p-10 text-center text-faint text-sm">
                No holidays found for {state} in {year}.
              </div>
            )}

            {/* FAQ */}
            <section>
              <h2 className="text-lg font-bold text-ink mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-5">
            {/* Upcoming holiday */}
            {upcoming && (
              <div className="bg-gradient-to-br from-acc-deep to-surface border border-acc/30 text-ink rounded-2xl p-6 shadow-acc-glow relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-faint mb-3">Next Bank Holiday</p>
                  <div className="flex items-start gap-3">
                    <div className="bg-acc/15 rounded-xl p-3 text-center min-w-[52px]">
                      <p className="text-[10px] font-semibold uppercase text-acc">{formatDisplay(upcoming.date).monthName.slice(0, 3)}</p>
                      <p className="text-2xl font-extrabold leading-none text-ink">{formatDisplay(upcoming.date).day}</p>
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-snug text-ink">{upcoming.name}</p>
                      <p className="text-muted text-xs mt-1">
                        {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days away`}
                      </p>
                      <TypeBadge type={upcoming.type} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-surface rounded-2xl border border-line p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-faint mb-3">Holiday Types</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mint/10 text-mint whitespace-nowrap mt-0.5">National</span>
                  <p className="text-xs text-muted">Mandated by Central Government — all banks closed across India.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan/10 text-cyan whitespace-nowrap mt-0.5">Regional</span>
                  <p className="text-xs text-muted">State or UT holiday — bank branches in observing states are closed.</p>
                </div>
              </div>
            </div>

            {/* FD Calculator CTA */}
            <div className="bg-gradient-to-br from-acc-deep to-surface rounded-2xl p-5 border border-acc/25">
              <h3 className="font-bold text-ink text-sm mb-1">Plan around holidays</h3>
              <p className="text-xs text-muted mb-4 leading-relaxed">
                FD maturity on a bank holiday? Calculate your returns and choose an optimal tenure.
              </p>
              <Link
                to="/calculators/fd"
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-mint to-acc text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all w-full"
              >
                <Calendar className="w-3.5 h-3.5" /> FD Calculator →
              </Link>
            </div>

            {/* AdSense */}
            <AdUnit slot={AD_SLOTS.HOLIDAY_MID} />

            {/* IFSC cross-link */}
            <div className="bg-surface rounded-2xl border border-line p-4 text-center">
              <p className="text-xs text-faint mb-3">Need a bank's IFSC code?</p>
              <Link to="/ifsc-finder"
                className="text-xs font-bold text-acc hover:underline">
                IFSC Code Finder →
              </Link>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-faint leading-relaxed px-1">
              Holiday dates are compiled from RBI circulars and official state government notifications. Dates marked as approximate should be verified with the official RBI circular for {year}.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
