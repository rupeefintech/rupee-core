import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Globe, AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import CalculatorHero from '../components/CalculatorHero';

// ── helpers ───────────────────────────────────────────────────────────────────

function fyStart(fy: number): Date { return new Date(fy, 3, 1); }
function fyEnd(fy: number): Date   { return new Date(fy + 1, 2, 31); }

function getCurrentFY(): number {
  const now = new Date();
  return (now.getMonth() + 1) >= 4 ? now.getFullYear() : now.getFullYear() - 1;
}

function daysInFY(startStr: string, endStr: string, fy: number): number {
  const s = new Date(startStr);
  const e = new Date(endStr);
  const fs = fyStart(fy);
  const fe = fyEnd(fy);
  const overlapStart = s > fs ? s : fs;
  const overlapEnd   = e < fe ? e : fe;
  if (overlapEnd < overlapStart) return 0;
  return Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 86_400_000) + 1;
}

function fyLength(fy: number): number {
  return Math.floor((fyEnd(fy).getTime() - fyStart(fy).getTime()) / 86_400_000) + 1; // 365 or 366
}

function totalDaysInFY(periods: Period[], fy: number): number {
  const raw = periods
    .filter(p => p.startDate && (p.ongoing || (p.endDate && p.startDate <= p.endDate)))
    .reduce((sum, p) => sum + daysInFY(p.startDate, p.ongoing ? TODAY : p.endDate, fy), 0);
  return Math.min(raw, fyLength(fy)); // cap to prevent double-counting when ongoing + synthetic overlap
}

const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const CURRENT_FY = getCurrentFY();
const FY_LABEL = `FY ${CURRENT_FY}-${String((CURRENT_FY + 1) % 100).padStart(2, '0')}`; // e.g. "FY 2026-27"

interface Period { id: number; startDate: string; endDate: string; ongoing: boolean; }

// Build augmented periods: for current & future FYs with < 182 actual days, add synthetic full year.
// This simulates "user stays in India going forward" for projection.
function buildProjectedPeriods(actualPeriods: Period[], maxFY: number): Period[] {
  const currentFY = getCurrentFY();
  const result = [...actualPeriods];
  let synId = -1;
  for (let fy = currentFY; fy <= maxFY; fy++) {
    if (totalDaysInFY(actualPeriods, fy) < 182) {
      result.push({ id: synId--, startDate: `${fy}-04-01`, endDate: `${fy + 1}-03-31`, ongoing: false });
    }
  }
  return result;
}

interface FYStatus {
  fy: number;
  status: 'NRI' | 'RNOR' | 'ROR';
  projected: boolean;
  currentFYDays: number;
  prev4Days: number;
  prev7Days: number;
  nriYears: number;
  bc1: boolean;
  bc2: boolean;
  bc2Threshold: number;
  rnorC1: boolean;
  rnorC2: boolean;
  isResident: boolean;
}

function computeStatusForFY(
  fy: number,
  projectedPeriods: Period[],
  actualPeriods: Period[],
  isEmployeeAbroad: boolean,
): FYStatus {
  const currentFYDays = totalDaysInFY(projectedPeriods, fy);
  const currentFY = getCurrentFY();
  const projected = fy >= currentFY && totalDaysInFY(actualPeriods, fy) < 182;

  let prev4Days = 0;
  for (let i = 1; i <= 4; i++) prev4Days += totalDaysInFY(projectedPeriods, fy - i);

  const bc1 = currentFYDays >= 182;
  const bc2Threshold = isEmployeeAbroad ? 182 : 60;
  const bc2 = currentFYDays >= bc2Threshold && prev4Days >= 365;
  const isResident = bc1 || bc2;

  let prev7Days = 0;
  let nriYears = 0;
  for (let i = 1; i <= 10; i++) {
    const days = totalDaysInFY(projectedPeriods, fy - i);
    if (days < 182) nriYears++;
    if (i <= 7) prev7Days += days;
  }

  const rnorC1 = nriYears >= 9;
  const rnorC2 = prev7Days <= 729;
  const isRNOR = isResident && (rnorC1 || rnorC2);

  const status: 'NRI' | 'RNOR' | 'ROR' = !isResident ? 'NRI' : isRNOR ? 'RNOR' : 'ROR';

  return { fy, status, projected, currentFYDays, prev4Days, prev7Days, nriYears, bc1, bc2, bc2Threshold, rnorC1, rnorC2, isResident };
}

// ── sub-components ────────────────────────────────────────────────────────────

function CondRow({ met, label, desc, value }: { met: boolean; label: string; desc: string; value: string }) {
  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${met ? 'bg-mint/10 border-mint/30' : 'bg-surface-2 border-line'}`}>
      {met
        ? <CheckCircle size={14} className="text-mint flex-shrink-0 mt-0.5" />
        : <AlertCircle size={14} className="text-faint flex-shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-xs ${met ? 'text-mint' : 'text-muted'}`}>{label}</div>
        <div className="text-[11px] text-muted mt-0.5">{desc}</div>
      </div>
      <div className={`text-xs font-bold flex-shrink-0 ml-2 ${met ? 'text-mint' : 'text-faint'}`}>{value}</div>
    </div>
  );
}

const STATUS_COLORS = {
  NRI:  { badge: 'bg-coral/10 border-coral/30',    text: 'text-coral',    dot: 'bg-coral',    light: 'bg-coral/20 text-coral'   },
  RNOR: { badge: 'bg-gold/10 border-gold/30', text: 'text-gold',  dot: 'bg-gold',  light: 'bg-gold/20 text-gold' },
  ROR:  { badge: 'bg-mint/10 border-mint/30', text: 'text-mint',  dot: 'bg-mint',  light: 'bg-mint/20 text-mint' },
};

function FYRow({ data, expanded, onToggle }: { data: FYStatus; expanded: boolean; onToggle: () => void }) {
  const sc = STATUS_COLORS[data.status];
  const currentFY = getCurrentFY();
  const isCurrent = data.fy === currentFY;

  const reason = data.status === 'NRI'
    ? `Only ${data.currentFYDays} days in India — below both resident thresholds`
    : data.status === 'RNOR'
      ? [
          data.rnorC1 ? `NRI in ${data.nriYears}/10 preceding FYs (≥9 needed)` : null,
          data.rnorC2 ? `Only ${data.prev7Days} days in preceding 7 FYs (limit: 729)` : null,
        ].filter(Boolean).join(' · ')
      : `Resident + ${data.nriYears} NRI years in past 10 (<9) + ${data.prev7Days} days in past 7 FYs (>729)`;

  return (
    <div className={`rounded-xl border ${sc.badge} overflow-hidden`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={onToggle}
      >
        {/* Status dot */}
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`} />

        {/* FY label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-ink">
              FY {data.fy}–{data.fy + 1}
            </span>
            {isCurrent && (
              <span className="text-[10px] font-semibold bg-acc-deep text-acc px-1.5 py-0.5 rounded-full">current</span>
            )}
            {data.projected && (
              <span className="text-[10px] font-semibold bg-surface-2 text-muted px-1.5 py-0.5 rounded-full">projected</span>
            )}
          </div>
          <div className={`text-[11px] mt-0.5 ${sc.text}`}>{reason}</div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.light}`}>{data.status}</span>
          {expanded ? <ChevronUp size={14} className="text-faint" /> : <ChevronDown size={14} className="text-faint" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-dashed border-current/10 px-4 py-4 bg-surface/60">
          <div className="text-[10px] font-bold text-faint uppercase tracking-widest mb-2">Step 1 — Resident Test (FY {data.fy}–{data.fy + 1})</div>
          <div className="space-y-2 mb-4">
            <CondRow
              met={data.bc1}
              label="Basic Condition 1"
              desc={`≥ 182 days in India in this FY`}
              value={`${data.currentFYDays} days`}
            />
            <CondRow
              met={data.bc2}
              label="Basic Condition 2"
              desc={`≥ ${data.bc2Threshold} days this FY  AND  ≥ 365 days in preceding 4 FYs`}
              value={`${data.currentFYDays} + ${data.prev4Days} prev 4`}
            />
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${data.isResident ? 'bg-mint/10 text-mint' : 'bg-coral/10 text-coral'}`}>
              {data.isResident ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
              {data.isResident ? 'RESIDENT — met at least one basic condition' : 'NON-RESIDENT — neither basic condition met → NRI'}
            </div>
          </div>

          {data.isResident && (
            <>
              <div className="text-[10px] font-bold text-faint uppercase tracking-widest mb-2">Step 2 — RNOR Test</div>
              <div className="space-y-2">
                <CondRow
                  met={data.rnorC1}
                  label="RNOR Condition 1"
                  desc="NRI in ≥ 9 of the 10 preceding financial years"
                  value={`${data.nriYears}/10 as NRI`}
                />
                <CondRow
                  met={data.rnorC2}
                  label="RNOR Condition 2"
                  desc="≤ 729 total days in India across 7 preceding FYs"
                  value={`${data.prev7Days}/729 days`}
                />
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${data.rnorC1 || data.rnorC2 ? 'bg-gold/10 text-gold' : 'bg-mint/10 text-mint'}`}>
                  {data.rnorC1 || data.rnorC2 ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                  {data.rnorC1 || data.rnorC2 ? 'RNOR — at least one RNOR condition met' : 'ROR — neither RNOR condition met → fully resident'}
                </div>
              </div>
            </>
          )}

          {/* Tax implication */}
          <div className={`mt-3 text-[11px] leading-relaxed px-3 py-2 rounded-lg ${sc.badge}`}>
            <span className={`font-semibold ${sc.text}`}>Tax impact: </span>
            {data.status === 'NRI' && <span className="text-muted">Not a tax resident. Indian-sourced income only is taxable in India. Foreign income exempt.</span>}
            {data.status === 'RNOR' && <span className="text-muted">Foreign income earned/received outside India is not taxable in India. Only Indian-sourced income + foreign income controlled from India is taxable.</span>}
            {data.status === 'ROR' && <span className="text-muted">Full global tax resident. All worldwide income — Indian and foreign — is taxable in India.</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function RNORCalculatorPage() {
  const [periods, setPeriods] = useState<Period[]>([{ id: 1, startDate: '', endDate: '', ongoing: false }]);
  const [isEmployeeAbroad, setIsEmployeeAbroad] = useState(false);
  const [counter, setCounter] = useState(2);
  const [expandedFY, setExpandedFY] = useState<number | null>(null);

  const addPeriod = () => {
    setPeriods(p => [...p, { id: counter, startDate: '', endDate: '', ongoing: false }]);
    setCounter(c => c + 1);
  };
  const removePeriod = (id: number) => setPeriods(p => p.filter(x => x.id !== id));
  const updatePeriod = (id: number, field: 'startDate' | 'endDate', value: string) =>
    setPeriods(p => p.map(x => x.id === id ? { ...x, [field]: value } : x));
  const toggleOngoing = (id: number) =>
    setPeriods(p => p.map(x => x.id === id ? { ...x, ongoing: !x.ongoing } : x));

  const { fyStatuses, rnorYears, firstResidentFY } = useMemo(() => {
    const currentFY = getCurrentFY();

    // Find earliest FY with actual India presence
    const validPeriods = periods.filter(p => p.startDate && p.endDate && p.startDate <= p.endDate);
    let minFY = currentFY - 1;
    if (validPeriods.length > 0) {
      const dates = validPeriods.map(p => new Date(p.startDate));
      const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
      const eMonth = earliest.getMonth() + 1;
      const eYear = earliest.getFullYear();
      minFY = eMonth >= 4 ? eYear : eYear - 1;
    }

    // Scan range: from minFY to currentFY + 6 (enough to see RNOR window end)
    const scanEnd = currentFY + 6;
    const projectedPeriods = buildProjectedPeriods(periods, scanEnd);

    const statuses: FYStatus[] = [];
    for (let fy = minFY; fy <= scanEnd; fy++) {
      statuses.push(computeStatusForFY(fy, projectedPeriods, periods, isEmployeeAbroad));
    }

    const rnor = statuses.filter(s => s.status === 'RNOR');
    const firstResident = statuses.find(s => s.isResident);

    return { fyStatuses: statuses, rnorYears: rnor, firstResidentFY: firstResident?.fy ?? null };
  }, [periods, isEmployeeAbroad]);

  const hasData = periods.some(p => p.startDate && (p.ongoing || (p.endDate && p.startDate <= p.endDate)));

  return (
    <>
      <Helmet>
        <title>{`RNOR Status Calculator (${FY_LABEL}) — Check NRI, RNOR or Resident Status | RupeePedia`}</title>
        <meta name="description" content={`Free RNOR Status Calculator for ${FY_LABEL}. Check whether you are NRI, RNOR or Resident under Section 6 of the Income Tax Act — with returning NRI rules, 182/60/729-day tests, examples, tax benefits and FAQs.`} />
        <link rel="canonical" href="https://rupeepedia.in/calculators/rnor-status" />
        <meta property="og:title" content={`RNOR Status Calculator (${FY_LABEL}) — Check NRI, RNOR or Resident Status | RupeePedia`} />
        <meta property="og:description" content={`Free RNOR Status Calculator for ${FY_LABEL}. Check whether you are NRI, RNOR or Resident under Indian Income Tax rules, with examples and FAQs.`} />
        <meta property="og:url" content="https://rupeepedia.in/calculators/rnor-status" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`RNOR Status Calculator (${FY_LABEL}) | RupeePedia`} />
        <meta name="twitter:description" content={`Check whether you are NRI, RNOR or Resident under Indian Income Tax rules. Updated for ${FY_LABEL}.`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'RNOR Status Calculator',
          url: 'https://rupeepedia.in/calculators/rnor-status',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Requires JavaScript',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: `Free calculator that determines NRI, RNOR or ROR residential status under Section 6 of the Income Tax Act for ${FY_LABEL} and shows how many years RNOR status lasts.`,
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.schemaText },
          })),
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://rupeepedia.in/calculators' },
            { '@type': 'ListItem', position: 3, name: 'RNOR Status Calculator', item: 'https://rupeepedia.in/calculators/rnor-status' },
          ],
        })}</script>
      </Helmet>

      <CalculatorHero
        crumb="RNOR Status"
        title="RNOR Status"
        accent="Calculator"
        subtitle={`NRI, RNOR or Resident under Section 6 — updated for ${FY_LABEL}.`}
        icon={Globe}
      />

      <div className="bg-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-muted">
            Check whether you are <strong className="text-body">NRI</strong>, <strong className="text-body">RNOR</strong> or <strong className="text-body">Resident (ROR)</strong> under
            Section 6 of the Income Tax Act. Enter your India stay dates to see your residential status for every financial year — and exactly how many years RNOR applies.
          </p>
        </div>

        {/* Settings */}
        <div className="bg-surface border border-line rounded-2xl p-5 mb-5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isEmployeeAbroad}
              onChange={e => setIsEmployeeAbroad(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-acc flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-ink">Indian citizen going abroad for employment / ship crew</span>
              <p className="text-[11px] text-faint mt-0.5">
                Tick this if you left India for a job abroad or as a ship crew member.
                Raises Basic Condition 2 threshold from 60 → 182 days, making it harder to qualify as resident via BC2.
              </p>
            </div>
          </label>
        </div>

        {/* Stay Periods */}
        <div className="bg-surface border border-line rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-ink">India Stay Periods</h2>
              <p className="text-xs text-faint mt-0.5">Add every stretch you were physically present in India (any year)</p>
            </div>
            <button
              onClick={addPeriod}
              className="flex items-center gap-1.5 text-xs font-semibold text-acc hover:text-acc bg-acc-deep hover:bg-acc/20 px-3 py-1.5 rounded-lg transition"
            >
              <Plus size={14} />
              Add Period
            </button>
          </div>

          <div className="space-y-2.5">
            {periods.map((p, idx) => {
              const effectiveEnd = p.ongoing ? TODAY : p.endDate;
              const isValid = p.startDate && effectiveEnd && p.startDate <= effectiveEnd;
              const days = isValid
                ? Math.floor((new Date(effectiveEnd).getTime() - new Date(p.startDate).getTime()) / 86_400_000) + 1
                : null;
              return (
                <div key={p.id} className={`p-3 rounded-lg border ${p.ongoing ? 'bg-mint/10 border-mint/30' : 'bg-surface-2 border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-faint w-5 text-center font-medium flex-shrink-0">{idx + 1}</span>
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-muted mb-1">Arrival in India</label>
                        <input
                          type="date"
                          value={p.startDate}
                          onChange={e => updatePeriod(p.id, 'startDate', e.target.value)}
                          className="w-full border border-line rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-acc bg-surface"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-muted mb-1">Departure from India</label>
                        <input
                          type="date"
                          value={p.endDate}
                          disabled={p.ongoing}
                          onChange={e => updatePeriod(p.id, 'endDate', e.target.value)}
                          className="w-full border border-line rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-acc bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </div>
                      {days !== null && (
                        <div className="sm:self-end pb-0.5 flex-shrink-0">
                          <div className={`text-[11px] font-bold px-2.5 py-1.5 rounded-md text-center whitespace-nowrap ${p.ongoing ? 'bg-mint/20 border border-mint/40 text-mint' : 'bg-acc-deep border border-acc/20 text-acc'}`}>
                            {days} days{p.ongoing ? ' so far' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                    {periods.length > 1 && (
                      <button onClick={() => removePeriod(p.id)} className="text-faint hover:text-coral transition p-1 rounded flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  {/* Still in India toggle */}
                  {p.startDate && (
                    <div className="mt-2 ml-8">
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          checked={p.ongoing}
                          onChange={() => toggleOngoing(p.id)}
                          className="w-3.5 h-3.5 accent-mint"
                        />
                        <span className={`text-[11px] font-medium ${p.ongoing ? 'text-mint' : 'text-faint'}`}>
                          Still in India — days counted through today ({TODAY})
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RNOR Eligibility Summary ── */}
        {hasData && (
          <>
            {rnorYears.length > 0 ? (
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe size={20} className="text-gold" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gold">
                      RNOR for {rnorYears.length} {rnorYears.length === 1 ? 'year' : 'years'}
                    </div>
                    <div className="text-sm text-gold">
                      FY {rnorYears[0].fy}–{rnorYears[0].fy + 1}
                      {rnorYears.length > 1 && ` to FY ${rnorYears[rnorYears.length - 1].fy}–${rnorYears[rnorYears.length - 1].fy + 1}`}
                    </div>
                  </div>
                  <div className="ml-auto flex flex-wrap gap-1.5 justify-end">
                    {rnorYears.map(r => (
                      <span key={r.fy} className="text-xs font-bold bg-gold/30 text-gold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {r.fy}–{r.fy + 1}{r.projected ? '*' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gold mt-2 leading-relaxed">
                  During RNOR years, foreign income earned and received outside India is <strong>not taxable in India</strong>.
                  Only India-sourced income and foreign income controlled/set up from India is taxable.
                  {rnorYears.some(r => r.projected) && ' Years marked * are projections assuming you stay in India.'}
                </p>
              </div>
            ) : (
              <div className="bg-surface-2 border border-line rounded-xl p-4 mb-5 text-sm text-muted">
                No RNOR eligibility found in the scanned range. Check your stay data or you may already be ROR.
              </div>
            )}

            {/* Year-by-year timeline */}
            <div className="mb-5">
              <h2 className="text-sm font-bold text-ink mb-3">Year-by-Year Status</h2>
              <p className="text-xs text-faint mb-3">
                Tap any row for detailed step-by-step analysis. Future years are projected assuming full-year India residence.
              </p>
              <div className="space-y-2">
                {fyStatuses.map(s => (
                  <FYRow
                    key={s.fy}
                    data={s}
                    expanded={expandedFY === s.fy}
                    onToggle={() => setExpandedFY(prev => prev === s.fy ? null : s.fy)}
                  />
                ))}
              </div>
            </div>

            {/* Days summary grid */}
            {firstResidentFY !== null && (
              <div className="bg-surface border border-line rounded-2xl p-5 mb-5">
                <h3 className="text-sm font-bold text-ink mb-3">India Stay Summary (from entered data)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="text-left pb-2 text-muted font-semibold">Financial Year</th>
                        <th className="text-right pb-2 text-muted font-semibold">Actual Days</th>
                        <th className="text-right pb-2 text-muted font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fyStatuses
                        .filter(s => !s.projected || totalDaysInFY(periods, s.fy) > 0)
                        .map(s => {
                          const actualDays = totalDaysInFY(periods, s.fy);
                          const sc = STATUS_COLORS[s.status];
                          return (
                            <tr key={s.fy} className="border-b border-line">
                              <td className="py-2 text-body font-medium">FY {s.fy}–{s.fy + 1}</td>
                              <td className="py-2 text-right text-body">{actualDays}</td>
                              <td className="py-2 text-right">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.light}`}>{s.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex gap-2.5 bg-cyan/10 border border-cyan/30 rounded-xl p-4 text-xs text-cyan">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>Note:</strong> NRI status for preceding years uses a simplified check (≥182 days = Resident).
                Future-year projections assume 365 days/year in India. Section 6 has edge cases for HUFs, companies,
                and returning NRIs with business income controlled from India.
                Consult a Chartered Accountant for official tax filings.
              </div>
            </div>
          </>
        )}

        {!hasData && (
          <div className="text-center py-12 text-faint">
            <Globe size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Add your India stay dates above to see your RNOR eligibility</p>
          </div>
        )}

        {/* ── Editorial content (always in DOM for SEO) ── */}
        <RNORArticle />

        {/* ── FAQ ── */}
        <RNORFaq />

        {/* ── Related tools ── */}
        <RelatedNRITools />
      </div>
      </div>
    </>
  );
}

// ── FAQ component ─────────────────────────────────────────────────────────────

const FAQS: { q: string; schemaText: string; a: React.ReactNode }[] = [
  {
    q: 'What are the three residential statuses under Indian income tax?',
    schemaText: 'Under Section 6 of the Income Tax Act, every individual is either NRI (Non-Resident — only Indian income taxable), RNOR (Resident but Not Ordinarily Resident — Indian income taxable, foreign income generally exempt), or ROR (Resident and Ordinarily Resident — worldwide income taxable in India). Status is determined fresh for each financial year based on days of physical presence in India.',
    a: (
      <div className="space-y-2 text-sm text-muted">
        <p>Under <strong>Section 6 of the Income Tax Act</strong>, every individual is classified into one of three statuses for each financial year:</p>
        <div className="grid gap-2 mt-2">
          <div className="flex gap-2.5 p-3 bg-coral/10 rounded-lg">
            <span className="text-xs font-bold text-coral bg-coral/20 px-2 py-0.5 rounded-full h-fit whitespace-nowrap">NRI</span>
            <div>
              <div className="font-semibold text-coral text-xs">Non-Resident Indian</div>
              <div className="text-xs text-muted mt-0.5">Doesn't meet the basic resident conditions. Only income earned/received in India is taxable here.</div>
            </div>
          </div>
          <div className="flex gap-2.5 p-3 bg-gold/10 rounded-lg">
            <span className="text-xs font-bold text-gold bg-gold/20 px-2 py-0.5 rounded-full h-fit whitespace-nowrap">RNOR</span>
            <div>
              <div className="font-semibold text-gold text-xs">Resident but Not Ordinarily Resident</div>
              <div className="text-xs text-muted mt-0.5">Meets the resident test but qualifies for the RNOR exception. Foreign income earned/received outside India is generally not taxable.</div>
            </div>
          </div>
          <div className="flex gap-2.5 p-3 bg-mint/10 rounded-lg">
            <span className="text-xs font-bold text-mint bg-mint/20 px-2 py-0.5 rounded-full h-fit whitespace-nowrap">ROR</span>
            <div>
              <div className="font-semibold text-mint text-xs">Resident and Ordinarily Resident</div>
              <div className="text-xs text-muted mt-0.5">Full resident. All worldwide income — Indian and foreign — is taxable in India.</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    q: 'How is Resident status determined? (Step 1)',
    schemaText: 'You are a Resident for a financial year if you were in India for 182 days or more during that year (Basic Condition 1), OR for 60 days or more in that year plus 365 days or more across the 4 preceding financial years (Basic Condition 2). For Indian citizens leaving for employment abroad or as ship crew, the 60-day threshold rises to 182 days. If neither condition is met, you are NRI.',
    a: (
      <div className="text-sm text-muted space-y-3">
        <p>You are a <strong>Resident</strong> for a financial year if you satisfy <strong>either</strong> of these two conditions:</p>
        <div className="space-y-2">
          <div className="border border-line rounded-lg p-3">
            <div className="font-semibold text-ink text-xs mb-1">Basic Condition 1 (BC1)</div>
            <p className="text-xs">Present in India for <strong>182 days or more</strong> during the financial year (April 1 – March 31).</p>
          </div>
          <div className="border border-line rounded-lg p-3">
            <div className="font-semibold text-ink text-xs mb-1">Basic Condition 2 (BC2)</div>
            <p className="text-xs">Present in India for <strong>60 days or more</strong> during the current FY <em>AND</em> <strong>365 days or more</strong> across the 4 preceding financial years combined.</p>
            <p className="text-xs text-gold mt-1.5 bg-gold/10 px-2 py-1 rounded">
              <strong>Exception:</strong> If you are an Indian citizen going abroad for employment, or a crew member of an Indian ship, the 60-day threshold in BC2 is raised to <strong>182 days</strong> — making it much harder to qualify as resident via BC2 alone.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted">If <strong>neither</strong> condition is met → you are <strong>NRI</strong> and the RNOR test doesn't apply.</p>
      </div>
    ),
  },
  {
    q: 'How is RNOR status determined? (Step 2)',
    schemaText: 'If you qualify as Resident, you are RNOR if you were a Non-Resident in India in 9 or more of the 10 preceding financial years, OR you were present in India for 729 days or less across the 7 preceding financial years. If neither RNOR condition is met, you are ROR and your worldwide income becomes taxable in India.',
    a: (
      <div className="text-sm text-muted space-y-3">
        <p>If you are a Resident (met BC1 or BC2), you are <strong>RNOR</strong> if you satisfy <strong>either</strong> of these:</p>
        <div className="space-y-2">
          <div className="border border-gold/30 bg-gold/10 rounded-lg p-3">
            <div className="font-semibold text-gold text-xs mb-1">RNOR Condition 1</div>
            <p className="text-xs">You were a <strong>Non-Resident in India in 9 or more of the 10 immediately preceding financial years.</strong></p>
            <p className="text-xs text-muted mt-1">Example: returning NRI who was abroad for 10+ years easily satisfies this in their first 2 years back.</p>
          </div>
          <div className="border border-gold/30 bg-gold/10 rounded-lg p-3">
            <div className="font-semibold text-gold text-xs mb-1">RNOR Condition 2</div>
            <p className="text-xs">You were present in India for <strong>729 days or less</strong> across the <strong>7 immediately preceding financial years</strong> combined.</p>
            <p className="text-xs text-muted mt-1">Example: 729 ÷ 7 ≈ 104 days/year on average. NRIs who visited India briefly each year often satisfy this.</p>
          </div>
        </div>
        <p className="text-xs text-muted">If <strong>neither</strong> RNOR condition is met → you are <strong>ROR</strong> (full global tax resident).</p>
      </div>
    ),
  },
  {
    q: 'How many years does RNOR status typically last?',
    schemaText: 'For a long-term NRI returning to India after 10 or more years abroad, RNOR status typically lasts 2 to 3 financial years. It ends when you no longer satisfy either RNOR condition — once you have been resident in India long enough that you were not NRI in 9 of the past 10 years and your India days in the past 7 years exceed 729, you become ROR.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>For a typical long-term NRI returning to India after 10+ years abroad, RNOR status lasts <strong>2–3 years</strong>. Here's why it ends:</p>
        <ul className="space-y-1.5 text-xs list-none">
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>RNOR C1 fades:</strong> Each year you're resident in India reduces your NRI count in the preceding 10 FYs. Once below 9, C1 fails.</span></li>
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>RNOR C2 fades:</strong> Your India days in the preceding 7 FYs accumulate. Once they cross 729 total, C2 fails.</span></li>
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>When both fail</strong>, you become ROR — typically in your 3rd or 4th year back.</span></li>
        </ul>
        <p className="text-xs bg-cyan/10 text-cyan px-3 py-2 rounded-lg mt-2">
          This calculator projects forward year-by-year using your actual India stay data to show exactly when you transition from RNOR → ROR.
        </p>
      </div>
    ),
  },
  {
    q: 'How does this calculator count "days in India"?',
    schemaText: 'The calculator counts every calendar day you were physically present in India, including both the arrival day and the departure day. Arriving May 1 and departing May 10 counts as 10 days. There is no partial-day rule — any day you set foot in India counts as one full day.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>The calculator counts <strong>each calendar day you were present in India</strong>, including both arrival and departure day. For example, arriving on May 1 and departing on May 10 = <strong>10 days</strong>.</p>
        <p className="text-xs text-muted">This follows the general interpretation under the Income Tax Act. There is no partial-day rule — each day you set foot in India counts as one full day.</p>
        <div className="text-xs bg-gold/10 border border-gold/30 px-3 py-2 rounded-lg">
          <strong>Tip:</strong> For the current ongoing year, use the "Still in India" toggle. The calculator counts days from your arrival through today and projects the full year forward.
        </div>
      </div>
    ),
  },
  {
    q: 'What is a Financial Year and when does it run?',
    schemaText: 'In India the Financial Year runs from April 1 to March 31 of the following calendar year. Residential status is determined separately for each FY. A stay that spans two FYs is split at the March 31 / April 1 boundary and days are attributed to the correct year.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>In India, the Financial Year (FY) runs from <strong>April 1 to March 31</strong> of the following calendar year.</p>
        <div className="text-xs space-y-1 mt-2">
          <div className="flex gap-2"><span className="font-semibold w-24 flex-shrink-0">FY 2023-24:</span><span>April 1, 2023 → March 31, 2024</span></div>
          <div className="flex gap-2"><span className="font-semibold w-24 flex-shrink-0">FY 2024-25:</span><span>April 1, 2024 → March 31, 2025</span></div>
          <div className="flex gap-2"><span className="font-semibold w-24 flex-shrink-0">FY 2025-26:</span><span>April 1, 2025 → March 31, 2026</span></div>
          <div className="flex gap-2"><span className="font-semibold w-24 flex-shrink-0">FY 2026-27:</span><span>April 1, 2026 → March 31, 2027</span></div>
        </div>
        <p className="text-xs text-muted mt-2">Residential status is determined separately for each FY. A stay that spans two FYs (e.g., Jan–May) is automatically split and attributed to the correct years by this calculator.</p>
      </div>
    ),
  },
  {
    q: 'How does this calculator work internally?',
    schemaText: 'The calculator splits each stay period at financial-year boundaries, counts days per FY, applies the Section 6 resident tests (182 days, or 60 days plus 365 in the preceding 4 years), then applies both RNOR conditions (NRI in 9 of 10 preceding years, or 729 days or fewer in the preceding 7 years). Current and future years with no data are projected assuming full-year presence in India, so you can see when RNOR ends and ROR begins.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>Here's what happens when you enter your stay dates:</p>
        <ol className="text-xs space-y-2 list-none">
          <li className="flex gap-2"><span className="font-bold text-acc flex-shrink-0">1.</span><span><strong>Split by FY:</strong> Each stay period is split at FY boundaries (March 31 / April 1) and days are attributed to the correct financial year.</span></li>
          <li className="flex gap-2"><span className="font-bold text-acc flex-shrink-0">2.</span><span><strong>Resident test:</strong> For each FY, BC1 (≥182 days) and BC2 (≥60 days + 365 in prev 4) are checked against your actual data.</span></li>
          <li className="flex gap-2"><span className="font-bold text-acc flex-shrink-0">3.</span><span><strong>RNOR test:</strong> If resident, both RNOR conditions are checked using days from preceding FYs.</span></li>
          <li className="flex gap-2"><span className="font-bold text-acc flex-shrink-0">4.</span><span><strong>Projection:</strong> For current and future FYs with no data, the calculator assumes you stay in India for the full year (365 days). These are marked with * and shown as "projected".</span></li>
          <li className="flex gap-2"><span className="font-bold text-acc flex-shrink-0">5.</span><span><strong>Multi-year scan:</strong> The calculator scans from your earliest entered date through 6 future years to show your complete RNOR window.</span></li>
        </ol>
        <p className="text-xs text-gold bg-gold/10 px-3 py-2 rounded-lg mt-2">
          <strong>Simplification note:</strong> NRI status for preceding years uses a simplified check — if days in a FY are below 182, that FY is treated as NRI. The full nested BC2 recursion across all historical years is not computed. This may slightly overcount NRI years but rarely affects the RNOR outcome.
        </p>
      </div>
    ),
  },
  {
    q: 'Can an RNOR keep NRE and FCNR accounts?',
    schemaText: 'Once you return to India for good, FEMA requires you to redesignate your NRE account as a resident account (or transfer the balance to an RFC account) — NRE interest loses its tax exemption from that point. FCNR deposits are different: you can hold them until maturity, and FCNR interest remains tax-exempt as long as you are RNOR. Interest on an RFC (Resident Foreign Currency) account is also exempt while you hold RNOR status.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p><strong>NRE account:</strong> Under FEMA, once you return to India permanently you must redesignate your NRE account as a resident savings account or move the balance to an <strong>RFC (Resident Foreign Currency) account</strong>. NRE interest stops being tax-exempt from the date of return — RNOR status does not preserve it, because the Section 10(4)(ii) exemption depends on FEMA non-resident status.</p>
        <p><strong>FCNR deposit:</strong> Can be held until maturity even after returning. Interest stays <strong>tax-free as long as you are RNOR</strong> — one of the biggest RNOR benefits.</p>
        <p><strong>RFC account:</strong> Interest is exempt from tax while you qualify as RNOR. Once you become ROR, RFC interest becomes taxable.</p>
      </div>
    ),
  },
  {
    q: 'Is foreign salary or pension taxable for an RNOR?',
    schemaText: 'Foreign salary or pension earned and received outside India is not taxable in India for an RNOR. However, if the salary is for services rendered in India, or is received directly into an Indian bank account, it becomes taxable in India regardless of residential status. Foreign pension received abroad for past services abroad stays outside Indian tax during RNOR years.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>Foreign salary or pension <strong>earned and received outside India</strong> is not taxable in India while you are RNOR.</p>
        <p>Two traps to watch:</p>
        <ul className="text-xs space-y-1.5 list-none">
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>Services rendered in India:</strong> salary for work physically performed in India is Indian-sourced income and taxable — even if paid by a foreign employer into a foreign account.</span></li>
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>Received in India first:</strong> if the salary or pension is credited directly to an Indian bank account, it counts as income received in India and becomes taxable for any status.</span></li>
        </ul>
      </div>
    ),
  },
  {
    q: 'Are foreign ESOPs and RSUs taxable for an RNOR?',
    schemaText: 'For an RNOR, capital gains from selling foreign shares, ESOPs or RSUs held abroad — where sale proceeds are received outside India — are not taxable in India. The perquisite (salary) portion of ESOPs is taxable in India only to the extent it relates to employment services rendered in India. Gains realised after you become ROR are fully taxable in India.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>Two components, treated differently:</p>
        <ul className="text-xs space-y-1.5 list-none">
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>Perquisite (vesting) value:</strong> taxed as salary in proportion to services rendered in India. RSUs vesting for work done entirely abroad are outside Indian tax for an RNOR.</span></li>
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>Capital gains on sale:</strong> gains on foreign shares sold while RNOR, with proceeds received abroad, are <strong>not taxable in India</strong>. This makes the RNOR window the ideal time to sell appreciated foreign stock before ROR status kicks in.</span></li>
        </ul>
      </div>
    ),
  },
  {
    q: 'What is the 120-day rule and "deemed resident" status?',
    schemaText: 'Since FY 2020-21, an Indian citizen or Person of Indian Origin visiting India, with India-sourced income above ₹15 lakh, becomes resident with just 120 days in India (plus 365 days in the preceding 4 years) instead of 182 — but is automatically classified as RNOR. Separately, an Indian citizen with India-sourced income above ₹15 lakh who is not liable to tax in any other country is a "deemed resident" under Section 6(1A), also classified as RNOR. This calculator does not model income, so check these rules separately if they may apply to you.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>Two special rules added by the Finance Act 2020 (from FY 2020-21), both tied to <strong>India-sourced income above ₹15 lakh</strong>:</p>
        <div className="space-y-2">
          <div className="border border-line rounded-lg p-3">
            <div className="font-semibold text-ink text-xs mb-1">120-day rule</div>
            <p className="text-xs">An Indian citizen or PIO <em>visiting India</em> with India-sourced income &gt; ₹15 lakh becomes <strong>resident at just 120 days</strong> (+ 365 days in preceding 4 FYs) instead of 182 — but is automatically treated as <strong>RNOR</strong>, not ROR.</p>
          </div>
          <div className="border border-line rounded-lg p-3">
            <div className="font-semibold text-ink text-xs mb-1">Deemed resident — Section 6(1A)</div>
            <p className="text-xs">An Indian citizen with India-sourced income &gt; ₹15 lakh who is <strong>not liable to tax in any other country</strong> (e.g., living in a zero-tax jurisdiction like UAE without tax residency elsewhere) is deemed a resident of India — but again classified as <strong>RNOR</strong>, so foreign income stays out of Indian tax.</p>
          </div>
        </div>
        <p className="text-xs text-gold bg-gold/10 px-3 py-2 rounded-lg">This calculator works from stay dates only and does not know your income, so it cannot apply these two income-linked rules. If your Indian income exceeds ₹15 lakh, factor them in separately.</p>
      </div>
    ),
  },
  {
    q: 'Do RNORs have to report foreign assets in their ITR (Schedule FA)?',
    schemaText: 'No. Schedule FA (Foreign Assets) disclosure in the income tax return applies only to individuals who are Resident and Ordinarily Resident (ROR). NRIs and RNORs are exempt from disclosing foreign bank accounts, foreign shares and overseas property in Schedule FA. Once you become ROR, full foreign asset disclosure becomes mandatory under the Black Money Act.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p><strong>No.</strong> Schedule FA (Foreign Assets) in the ITR applies only to <strong>ROR</strong> taxpayers. As an RNOR you do not have to disclose foreign bank accounts, foreign stocks, overseas retirement accounts (401(k), etc.) or foreign property.</p>
        <p className="text-xs text-muted">This matters: once you turn ROR, non-disclosure of foreign assets carries severe penalties under the Black Money Act. Use your RNOR years to organise records for the disclosures that will follow.</p>
      </div>
    ),
  },
  {
    q: 'Which ITR form should an RNOR file?',
    schemaText: 'An RNOR typically files ITR-2 (or ITR-3 if there is business or professional income). ITR-1 is not available to RNORs. In the ITR, you select "Resident but Not Ordinarily Resident" as the residential status. Only India-taxable income needs to be reported; exempt foreign income does not have to be offered to tax, and Schedule FA does not apply.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>Usually <strong>ITR-2</strong> — ITR-1 (Sahaj) is only for ordinarily resident individuals. If you have business or professional income, use <strong>ITR-3</strong>.</p>
        <p className="text-xs text-muted">In the form, choose residential status "Resident but Not Ordinarily Resident". Report India-taxable income only; foreign income that is exempt for RNOR does not need to be offered to tax, and Schedule FA is not required.</p>
      </div>
    ),
  },
  {
    q: 'Can an RNOR invest in Indian mutual funds and stocks?',
    schemaText: 'Yes. An RNOR is a resident under FEMA once back in India, so they can invest in Indian mutual funds, stocks and other securities as a regular resident investor — including funds that restrict NRI investors from the US or Canada. Gains from Indian investments are taxable in India for RNORs like any resident, since they are India-sourced income.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p><strong>Yes, freely.</strong> After returning, you are a resident under FEMA, so you invest as a normal resident — complete fresh KYC with your Indian address, convert NRE/NRO holdings to resident folios and demat accounts.</p>
        <p className="text-xs text-muted">A practical bonus: AMCs that refuse US/Canada-based NRIs accept you once you are a resident. Note that gains from Indian mutual funds and stocks are India-sourced, so they are fully taxable even during RNOR years.</p>
      </div>
    ),
  },
  {
    q: 'Is RNOR status automatic, or do I need to apply for it?',
    schemaText: 'RNOR status is automatic — there is no application, registration or approval. Your residential status is self-determined each financial year from your days of presence in India under Section 6, and you simply declare it in your income tax return. Keep passport immigration stamps and travel records as evidence in case of scrutiny.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p><strong>Automatic.</strong> There is no application or approval process. You determine your status yourself each FY from your India-stay days under Section 6, and declare it in your ITR.</p>
        <p className="text-xs text-muted">Keep evidence: passport immigration stamps, boarding passes, and a day-count worksheet (this calculator's year-by-year table is a good starting point). The tax department can ask you to substantiate the day counts in scrutiny.</p>
      </div>
    ),
  },
  {
    q: 'Does DTAA still matter for an RNOR?',
    schemaText: 'Yes, in specific cases. Even as an RNOR, income that IS taxable in India (Indian income, or foreign income from a business controlled from India) may also be taxed in the source country — a Double Taxation Avoidance Agreement decides which country taxes it and provides credit for tax paid abroad. DTAA tie-breaker rules also matter if both India and another country treat you as tax resident in the same year.',
    a: (
      <div className="text-sm text-muted space-y-2">
        <p>Yes, in two situations:</p>
        <ul className="text-xs space-y-1.5 list-none">
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>Doubly-taxed income:</strong> income taxable in India (e.g., Indian rent while the other country also taxes worldwide income) — the DTAA allocates taxing rights and gives foreign tax credit.</span></li>
          <li className="flex gap-2"><span className="text-gold mt-0.5">▸</span><span><strong>Dual residency year:</strong> in the year of return you may be tax resident in both countries. The DTAA tie-breaker (permanent home → centre of vital interests → habitual abode → nationality) decides which country treats you as resident for treaty purposes.</span></li>
        </ul>
      </div>
    ),
  },
];

function RNORFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-ink mb-1">How it works & FAQs</h2>
      <p className="text-xs text-faint mb-4">Everything you need to know about RNOR status and how this calculator determines it</p>
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-line rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-surface hover:bg-surface-2 transition"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="flex-1 text-sm font-semibold text-ink">{faq.q}</span>
              {open === i
                ? <ChevronUp size={15} className="text-faint flex-shrink-0" />
                : <ChevronDown size={15} className="text-faint flex-shrink-0" />}
            </button>
            {/* Always mounted so content stays in the DOM for search engines */}
            <div className={`px-4 pb-4 pt-1 border-t border-line bg-surface ${open === i ? '' : 'hidden'}`}>
              {faq.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Editorial content (always rendered — primary indexable content) ───────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-ink mb-3">{children}</h2>;
}

const TAX_ROWS: [string, string, string, string][] = [
  ['Salary earned in India', 'Taxable', 'Taxable', 'Taxable'],
  ['Rent from Indian property', 'Taxable', 'Taxable', 'Taxable'],
  ['Interest / gains on Indian investments', 'Taxable', 'Taxable', 'Taxable'],
  ['Foreign salary (earned & received abroad)', 'Not taxable', 'Not taxable', 'Taxable'],
  ['Foreign interest, dividends & rent', 'Not taxable', 'Not taxable', 'Taxable'],
  ['Capital gains on foreign shares / property', 'Not taxable', 'Not taxable', 'Taxable'],
  ['FCNR deposit interest', 'Exempt', 'Exempt', 'Taxable'],
  ['Foreign business controlled from India', 'Not taxable', 'Taxable', 'Taxable'],
  ['Foreign asset disclosure (Schedule FA)', 'Not required', 'Not required', 'Mandatory'],
];

const taxable = (v: string) => v === 'Taxable' || v === 'Mandatory';

const EXAMPLES: { title: string; facts: string; result: 'NRI' | 'RNOR' | 'ROR'; why: string }[] = [
  {
    title: 'Ravi — returning from the UAE after 12 years',
    facts: 'Worked in Dubai for 12 years with only short India visits (2–3 weeks a year). Returned to India permanently in December 2025 and stayed on.',
    result: 'RNOR',
    why: 'In the year of return he was in India under 182 days, so he stays NRI that year. From the next FY he is resident, but he was NRI in 9+ of the preceding 10 years and spent well under 729 days in India in the preceding 7 years — so he gets RNOR for roughly 2–3 years before turning ROR.',
  },
  {
    title: 'Priya — US software engineer, frequent India visits',
    facts: 'On an H-1B in the US for 8 years, but visited India around 120 days every year to see family. Moved back in June 2026.',
    result: 'RNOR',
    why: 'Her 7-year day count is about 840 days (over 729), so RNOR Condition 2 fails — but she was NRI in 9 of the past 10 FYs, so Condition 1 still gives her RNOR. Her frequent visits shorten the RNOR window: the accumulated days push her to ROR sooner.',
  },
  {
    title: 'Arjun — short stint abroad, 3 years in Singapore',
    facts: 'Lived in India his whole life, worked in Singapore from FY 2023-24 to FY 2025-26, returned April 2026.',
    result: 'ROR',
    why: 'Only 3 NRI years in the preceding 10 (needs 9), and his India days in the preceding 7 years far exceed 729 because he lived in India for 4 of those 7 years. Both RNOR conditions fail, so he is ROR immediately on return. Short stints abroad rarely earn RNOR.',
  },
  {
    title: 'Meera — NRI on a long India visit',
    facts: 'UK resident for 15 years. Spent 150 days in India in FY 2026-27 helping with a family matter, then returned to the UK.',
    result: 'NRI',
    why: 'Under 182 days, and Basic Condition 2 (60 days plus 365 in preceding 4 years) fails because her past-4-year total is only around 100 days. She stays NRI — no Indian tax on her UK income.',
  },
  {
    title: 'Vikram — Gulf NRI with high Indian income (deemed resident)',
    facts: 'Lives in Bahrain (no personal income tax), earns ₹40 lakh a year in rent and interest from India, visits India 100 days a year.',
    result: 'RNOR',
    why: 'With India-sourced income above ₹15 lakh and no tax liability in any other country, Section 6(1A) deems him an Indian resident even below 182 days — but deemed residents are classified as RNOR, so his Bahrain salary still escapes Indian tax. (Income-linked rules like this are outside this calculator — check them separately.)',
  },
];

function RNORArticle() {
  return (
    <article className="mt-12 space-y-10">
      {/* What is RNOR */}
      <section>
        <SectionTitle>What is RNOR status?</SectionTitle>
        <div className="text-sm text-muted space-y-3 leading-relaxed">
          <p>
            <strong>RNOR (Resident but Not Ordinarily Resident)</strong> is a transitional residential status under
            Section 6 of the Income Tax Act, 1961. It sits between NRI and full resident (ROR), and it exists for one
            main reason: to give <strong>returning NRIs</strong> a soft landing. During your RNOR years, income you earn
            and receive <em>outside India</em> — foreign salary, overseas rent, interest on foreign deposits, capital
            gains on foreign shares — stays <strong>outside the Indian tax net</strong>, even though you now live in India.
          </p>
          <p>
            Residential status is decided fresh for every financial year (April 1 – March 31) purely from your
            <strong> days of physical presence in India</strong> — not from citizenship, visa type or where your family lives.
            The test runs in two steps: first the <em>resident test</em> (182 days, or 60 days plus 365 days across the
            preceding 4 years), then the <em>RNOR test</em> (NRI in 9 of the preceding 10 years, or 729 days or fewer in
            India across the preceding 7 years). Meet the resident test and also one RNOR condition, and you are RNOR.
          </p>
          <p>
            For a typical NRI returning after 10+ years abroad, RNOR lasts <strong>2–3 financial years</strong>. That
            window is valuable planning time: FCNR deposits keep earning tax-free interest, foreign stock can be sold
            without Indian capital gains tax, and overseas retirement accounts can be restructured before worldwide
            taxation begins. Once both RNOR conditions fail, you become <strong>ROR</strong> — your global income becomes
            taxable in India and foreign asset disclosure (Schedule FA) becomes mandatory.
          </p>
          <p>
            The calculator above applies these rules year by year from your actual travel dates, shows which condition
            passed or failed for each financial year, and projects forward so you can see exactly when your RNOR window closes.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section>
        <SectionTitle>NRI vs RNOR vs ROR — what is taxable in India</SectionTitle>
        <div className="bg-surface border border-line rounded-2xl p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-surface-2">
                  <th className="text-left px-3 py-2.5 border-b border-line font-semibold text-body">Income type</th>
                  <th className="text-center px-3 py-2.5 border-b border-line font-semibold text-coral">NRI</th>
                  <th className="text-center px-3 py-2.5 border-b border-line font-semibold text-gold">RNOR</th>
                  <th className="text-center px-3 py-2.5 border-b border-line font-semibold text-mint">ROR</th>
                </tr>
              </thead>
              <tbody>
                {TAX_ROWS.map(([type, nri, rnor, ror]) => (
                  <tr key={type} className="border-b border-line last:border-0">
                    <td className="px-3 py-2 text-body">{type}</td>
                    <td className={`px-3 py-2 text-center font-medium ${taxable(nri) ? 'text-coral' : 'text-faint'}`}>{taxable(nri) ? '✓ ' : '✗ '}{nri}</td>
                    <td className={`px-3 py-2 text-center font-medium ${taxable(rnor) ? 'text-coral' : 'text-faint'}`}>{taxable(rnor) ? '✓ ' : '✗ '}{rnor}</td>
                    <td className={`px-3 py-2 text-center font-medium ${taxable(ror) ? 'text-coral' : 'text-faint'}`}>{taxable(ror) ? '✓ ' : '✗ '}{ror}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11px] text-faint mt-2">
          "Foreign" means earned and first received outside India. Money remitted to India after being received abroad is a transfer of your own funds, not fresh income — remittance itself is not taxed.
        </p>
      </section>

      {/* Decision flow */}
      <section>
        <SectionTitle>How residential status is decided — the flow</SectionTitle>
        <div className="bg-surface border border-line rounded-2xl p-5 text-sm">
          <ol className="space-y-0">
            {[
              { step: '1', title: 'In India ≥ 182 days this FY?', yes: 'Resident → go to step 3', no: 'go to step 2', color: 'bg-acc', note: null as string | null },
              { step: '2', title: 'In India ≥ 60 days this FY AND ≥ 365 days in preceding 4 FYs?', yes: 'Resident → go to step 3', no: 'NRI — test ends', color: 'bg-acc', note: 'The 60-day limb becomes 182 days if you left India for employment abroad or as ship crew, and 120 days for visiting Indian citizens/PIOs with India-sourced income above ₹15 lakh.' },
              { step: '3', title: 'NRI in ≥ 9 of the 10 preceding FYs?', yes: 'RNOR', no: 'go to step 4', color: 'bg-gold', note: null },
              { step: '4', title: '≤ 729 days in India across the 7 preceding FYs?', yes: 'RNOR', no: 'ROR — worldwide income taxable', color: 'bg-gold', note: null },
            ].map(s => (
              <li key={s.step} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className={`w-6 h-6 rounded-full ${s.color} text-white text-xs font-bold flex items-center justify-center`}>{s.step}</span>
                  <span className="w-px flex-1 bg-line mt-1" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="font-semibold text-ink text-xs">{s.title}</div>
                  <div className="text-[11px] text-muted mt-1">
                    <span className="text-mint font-semibold">Yes</span> → {s.yes} &nbsp;·&nbsp; <span className="text-coral font-semibold">No</span> → {s.no}
                  </div>
                  {s.note && <div className="text-[11px] text-gold bg-gold/10 rounded-md px-2 py-1 mt-1.5">{s.note}</div>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Examples */}
      <section>
        <SectionTitle>RNOR examples — real-world scenarios</SectionTitle>
        <div className="space-y-3">
          {EXAMPLES.map(ex => {
            const sc = STATUS_COLORS[ex.result];
            return (
              <div key={ex.title} className={`rounded-xl border p-4 ${sc.badge}`}>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="text-sm font-bold text-ink">{ex.title}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${sc.light}`}>{ex.result}</span>
                </div>
                <p className="text-xs text-muted mb-1.5">{ex.facts}</p>
                <p className="text-[11px] text-muted leading-relaxed"><strong className={sc.text}>Why:</strong> {ex.why}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tax benefits */}
      <section>
        <SectionTitle>RNOR tax benefits — what to do during the window</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { h: 'FCNR interest stays tax-free', p: 'FCNR deposits can run to maturity after your return, and the interest remains exempt for the entire time you are RNOR. Do not break them early without checking the tax cost.' },
            { h: 'Sell foreign stock tax-free in India', p: 'Capital gains on foreign shares, ESOPs and RSUs sold while RNOR (proceeds received abroad) are outside Indian tax. Selling appreciated foreign stock before you turn ROR can save substantial tax.' },
            { h: 'Foreign interest, dividends & rent exempt', p: 'Income from overseas bank deposits, bonds, dividend stocks and rental property stays out of Indian tax during RNOR years — only Indian income goes into your ITR.' },
            { h: 'RFC account for repatriated funds', p: 'Move NRE and foreign balances into an RFC (Resident Foreign Currency) account on return. RFC interest is exempt while you are RNOR, and the funds remain fully repatriable if you go abroad again.' },
            { h: 'No Schedule FA disclosure yet', p: 'RNORs do not report foreign assets in the ITR. Use these years to document foreign accounts, brokerage holdings and retirement plans so ROR-year disclosures are painless.' },
            { h: 'Restructure overseas retirement accounts', p: '401(k), IRA and similar withdrawals or rollovers are best planned during RNOR years — once you are ROR, accruals and withdrawals can face Indian tax with messy foreign tax credit claims.' },
          ].map(b => (
            <div key={b.h} className="bg-surface border border-line rounded-2xl p-4">
              <h3 className="text-xs font-bold text-ink mb-1">{b.h}</h3>
              <p className="text-[11px] text-muted leading-relaxed">{b.p}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-faint mt-3">
          Rules summarised for individuals under the Income Tax Act, 1961 (as amended by Finance Act 2020). Individual facts vary — confirm with a Chartered Accountant before acting.
        </p>
      </section>
    </article>
  );
}

// ── Related tools ─────────────────────────────────────────────────────────────

function RelatedNRITools() {
  const tools = [
    { path: '/calculators/nri-fd', label: 'NRI FD Calculator', desc: 'Compare NRE, NRO & FCNR deposit returns after tax' },
    { path: '/calculators/nri-capital-gains', label: 'NRI Capital Gains Tax', desc: 'Tax on selling Indian property or equity as an NRI' },
    { path: '/calculators/nri-rental-income', label: 'NRI Rental Income Tax', desc: 'Tax & TDS on rent from Indian property' },
    { path: '/calculators/income-tax', label: 'Income Tax Calculator', desc: 'Old vs new regime tax on your Indian income' },
  ];
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-ink mb-3">Related NRI calculators</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {tools.map(t => (
          <Link key={t.path} to={t.path} className="bg-surface border border-line rounded-2xl p-4 hover:border-acc transition group">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink group-hover:text-acc transition">{t.label}</span>
              <ArrowRight size={14} className="text-faint group-hover:text-acc transition flex-shrink-0" />
            </div>
            <p className="text-[11px] text-faint mt-1">{t.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
