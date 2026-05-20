import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Globe, AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${met ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
      {met
        ? <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
        : <AlertCircle size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-xs ${met ? 'text-green-700' : 'text-gray-500'}`}>{label}</div>
        <div className="text-[11px] text-gray-500 mt-0.5">{desc}</div>
      </div>
      <div className={`text-xs font-bold flex-shrink-0 ml-2 ${met ? 'text-green-700' : 'text-gray-400'}`}>{value}</div>
    </div>
  );
}

const STATUS_COLORS = {
  NRI:  { badge: 'bg-red-50 border-red-200',    text: 'text-red-700',    dot: 'bg-red-500',    light: 'bg-red-100 text-red-700'   },
  RNOR: { badge: 'bg-amber-50 border-amber-200', text: 'text-amber-700',  dot: 'bg-amber-500',  light: 'bg-amber-100 text-amber-700' },
  ROR:  { badge: 'bg-green-50 border-green-200', text: 'text-green-700',  dot: 'bg-green-500',  light: 'bg-green-100 text-green-700' },
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
            <span className="text-sm font-bold text-gray-900">
              FY {data.fy}–{data.fy + 1}
            </span>
            {isCurrent && (
              <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">current</span>
            )}
            {data.projected && (
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">projected</span>
            )}
          </div>
          <div className={`text-[11px] mt-0.5 ${sc.text}`}>{reason}</div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.light}`}>{data.status}</span>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-dashed border-current/10 px-4 py-4 bg-white/60">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Step 1 — Resident Test (FY {data.fy}–{data.fy + 1})</div>
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
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${data.isResident ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {data.isResident ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
              {data.isResident ? 'RESIDENT — met at least one basic condition' : 'NON-RESIDENT — neither basic condition met → NRI'}
            </div>
          </div>

          {data.isResident && (
            <>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Step 2 — RNOR Test</div>
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
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${data.rnorC1 || data.rnorC2 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                  {data.rnorC1 || data.rnorC2 ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                  {data.rnorC1 || data.rnorC2 ? 'RNOR — at least one RNOR condition met' : 'ROR — neither RNOR condition met → fully resident'}
                </div>
              </div>
            </>
          )}

          {/* Tax implication */}
          <div className={`mt-3 text-[11px] leading-relaxed px-3 py-2 rounded-lg ${sc.badge}`}>
            <span className={`font-semibold ${sc.text}`}>Tax impact: </span>
            {data.status === 'NRI' && <span className="text-gray-600">Not a tax resident. Indian-sourced income only is taxable in India. Foreign income exempt.</span>}
            {data.status === 'RNOR' && <span className="text-gray-600">Foreign income earned/received outside India is not taxable in India. Only Indian-sourced income + foreign income controlled from India is taxable.</span>}
            {data.status === 'ROR' && <span className="text-gray-600">Full global tax resident. All worldwide income — Indian and foreign — is taxable in India.</span>}
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
        <title>RNOR Status Calculator — Multi-Year Eligibility | RupeePedia</title>
        <meta name="description" content="Check your NRI / RNOR / ROR residential status under Section 6 of the Income Tax Act. Enter India stay dates to see RNOR eligibility across multiple financial years." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">RNOR Status Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter all your India stay dates. See your NRI / RNOR / ROR status for each financial year — with explanation of how many years RNOR applies.
          </p>
        </div>

        {/* Settings */}
        <div className="card p-5 mb-5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isEmployeeAbroad}
              onChange={e => setIsEmployeeAbroad(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-brand-600 flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-gray-800">Indian citizen going abroad for employment / ship crew</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tick this if you left India for a job abroad or as a ship crew member.
                Raises Basic Condition 2 threshold from 60 → 182 days, making it harder to qualify as resident via BC2.
              </p>
            </div>
          </label>
        </div>

        {/* Stay Periods */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-800">India Stay Periods</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add every stretch you were physically present in India (any year)</p>
            </div>
            <button
              onClick={addPeriod}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
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
                <div key={p.id} className={`p-3 rounded-lg border ${p.ongoing ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-center font-medium flex-shrink-0">{idx + 1}</span>
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Arrival in India</label>
                        <input
                          type="date"
                          value={p.startDate}
                          onChange={e => updatePeriod(p.id, 'startDate', e.target.value)}
                          className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Departure from India</label>
                        <input
                          type="date"
                          value={p.endDate}
                          disabled={p.ongoing}
                          onChange={e => updatePeriod(p.id, 'endDate', e.target.value)}
                          className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </div>
                      {days !== null && (
                        <div className="sm:self-end pb-0.5 flex-shrink-0">
                          <div className={`text-[11px] font-bold px-2.5 py-1.5 rounded-md text-center whitespace-nowrap ${p.ongoing ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-brand-50 border border-brand-100 text-brand-600'}`}>
                            {days} days{p.ongoing ? ' so far' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                    {periods.length > 1 && (
                      <button onClick={() => removePeriod(p.id)} className="text-gray-300 hover:text-red-400 transition p-1 rounded flex-shrink-0">
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
                          className="w-3.5 h-3.5 accent-green-600"
                        />
                        <span className={`text-[11px] font-medium ${p.ongoing ? 'text-green-700' : 'text-gray-400'}`}>
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
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-800">
                      RNOR for {rnorYears.length} {rnorYears.length === 1 ? 'year' : 'years'}
                    </div>
                    <div className="text-sm text-amber-700">
                      FY {rnorYears[0].fy}–{rnorYears[0].fy + 1}
                      {rnorYears.length > 1 && ` to FY ${rnorYears[rnorYears.length - 1].fy}–${rnorYears[rnorYears.length - 1].fy + 1}`}
                    </div>
                  </div>
                  <div className="ml-auto flex flex-wrap gap-1.5 justify-end">
                    {rnorYears.map(r => (
                      <span key={r.fy} className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {r.fy}–{r.fy + 1}{r.projected ? '*' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                  During RNOR years, foreign income earned and received outside India is <strong>not taxable in India</strong>.
                  Only India-sourced income and foreign income controlled/set up from India is taxable.
                  {rnorYears.some(r => r.projected) && ' Years marked * are projections assuming you stay in India.'}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-sm text-gray-600">
                No RNOR eligibility found in the scanned range. Check your stay data or you may already be ROR.
              </div>
            )}

            {/* Year-by-year timeline */}
            <div className="mb-5">
              <h2 className="text-sm font-bold text-gray-800 mb-3">Year-by-Year Status</h2>
              <p className="text-xs text-gray-400 mb-3">
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
              <div className="card p-5 mb-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">India Stay Summary (from entered data)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left pb-2 text-gray-500 font-semibold">Financial Year</th>
                        <th className="text-right pb-2 text-gray-500 font-semibold">Actual Days</th>
                        <th className="text-right pb-2 text-gray-500 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fyStatuses
                        .filter(s => !s.projected || totalDaysInFY(periods, s.fy) > 0)
                        .map(s => {
                          const actualDays = totalDaysInFY(periods, s.fy);
                          const sc = STATUS_COLORS[s.status];
                          return (
                            <tr key={s.fy} className="border-b border-gray-50">
                              <td className="py-2 text-gray-700 font-medium">FY {s.fy}–{s.fy + 1}</td>
                              <td className="py-2 text-right text-gray-700">{actualDays}</td>
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
            <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
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
          <div className="text-center py-12 text-gray-400">
            <Globe size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Add your India stay dates above to see your RNOR eligibility</p>
          </div>
        )}

        {/* ── FAQ ── */}
        <RNORFaq />
      </div>
    </>
  );
}

// ── FAQ component ─────────────────────────────────────────────────────────────

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What are the three residential statuses under Indian income tax?',
    a: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Under <strong>Section 6 of the Income Tax Act</strong>, every individual is classified into one of three statuses for each financial year:</p>
        <div className="grid gap-2 mt-2">
          <div className="flex gap-2.5 p-3 bg-red-50 rounded-lg">
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full h-fit whitespace-nowrap">NRI</span>
            <div>
              <div className="font-semibold text-red-800 text-xs">Non-Resident Indian</div>
              <div className="text-xs text-gray-600 mt-0.5">Doesn't meet the basic resident conditions. Only income earned/received in India is taxable here.</div>
            </div>
          </div>
          <div className="flex gap-2.5 p-3 bg-amber-50 rounded-lg">
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full h-fit whitespace-nowrap">RNOR</span>
            <div>
              <div className="font-semibold text-amber-800 text-xs">Resident but Not Ordinarily Resident</div>
              <div className="text-xs text-gray-600 mt-0.5">Meets the resident test but qualifies for the RNOR exception. Foreign income earned/received outside India is generally not taxable.</div>
            </div>
          </div>
          <div className="flex gap-2.5 p-3 bg-green-50 rounded-lg">
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full h-fit whitespace-nowrap">ROR</span>
            <div>
              <div className="font-semibold text-green-800 text-xs">Resident and Ordinarily Resident</div>
              <div className="text-xs text-gray-600 mt-0.5">Full resident. All worldwide income — Indian and foreign — is taxable in India.</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    q: 'How is Resident status determined? (Step 1)',
    a: (
      <div className="text-sm text-gray-600 space-y-3">
        <p>You are a <strong>Resident</strong> for a financial year if you satisfy <strong>either</strong> of these two conditions:</p>
        <div className="space-y-2">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="font-semibold text-gray-800 text-xs mb-1">Basic Condition 1 (BC1)</div>
            <p className="text-xs">Present in India for <strong>182 days or more</strong> during the financial year (April 1 – March 31).</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="font-semibold text-gray-800 text-xs mb-1">Basic Condition 2 (BC2)</div>
            <p className="text-xs">Present in India for <strong>60 days or more</strong> during the current FY <em>AND</em> <strong>365 days or more</strong> across the 4 preceding financial years combined.</p>
            <p className="text-xs text-amber-700 mt-1.5 bg-amber-50 px-2 py-1 rounded">
              <strong>Exception:</strong> If you are an Indian citizen going abroad for employment, or a crew member of an Indian ship, the 60-day threshold in BC2 is raised to <strong>182 days</strong> — making it much harder to qualify as resident via BC2 alone.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">If <strong>neither</strong> condition is met → you are <strong>NRI</strong> and the RNOR test doesn't apply.</p>
      </div>
    ),
  },
  {
    q: 'How is RNOR status determined? (Step 2)',
    a: (
      <div className="text-sm text-gray-600 space-y-3">
        <p>If you are a Resident (met BC1 or BC2), you are <strong>RNOR</strong> if you satisfy <strong>either</strong> of these:</p>
        <div className="space-y-2">
          <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-3">
            <div className="font-semibold text-amber-800 text-xs mb-1">RNOR Condition 1</div>
            <p className="text-xs">You were a <strong>Non-Resident in India in 9 or more of the 10 immediately preceding financial years.</strong></p>
            <p className="text-xs text-gray-500 mt-1">Example: returning NRI who was abroad for 10+ years easily satisfies this in their first 2 years back.</p>
          </div>
          <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-3">
            <div className="font-semibold text-amber-800 text-xs mb-1">RNOR Condition 2</div>
            <p className="text-xs">You were present in India for <strong>729 days or less</strong> across the <strong>7 immediately preceding financial years</strong> combined.</p>
            <p className="text-xs text-gray-500 mt-1">Example: 729 ÷ 7 ≈ 104 days/year on average. NRIs who visited India briefly each year often satisfy this.</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">If <strong>neither</strong> RNOR condition is met → you are <strong>ROR</strong> (full global tax resident).</p>
      </div>
    ),
  },
  {
    q: 'How many years does RNOR status typically last?',
    a: (
      <div className="text-sm text-gray-600 space-y-2">
        <p>For a typical long-term NRI returning to India after 10+ years abroad, RNOR status lasts <strong>2–3 years</strong>. Here's why it ends:</p>
        <ul className="space-y-1.5 text-xs list-none">
          <li className="flex gap-2"><span className="text-amber-500 mt-0.5">▸</span><span><strong>RNOR C1 fades:</strong> Each year you're resident in India reduces your NRI count in the preceding 10 FYs. Once below 9, C1 fails.</span></li>
          <li className="flex gap-2"><span className="text-amber-500 mt-0.5">▸</span><span><strong>RNOR C2 fades:</strong> Your India days in the preceding 7 FYs accumulate. Once they cross 729 total, C2 fails.</span></li>
          <li className="flex gap-2"><span className="text-amber-500 mt-0.5">▸</span><span><strong>When both fail</strong>, you become ROR — typically in your 3rd or 4th year back.</span></li>
        </ul>
        <p className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg mt-2">
          This calculator projects forward year-by-year using your actual India stay data to show exactly when you transition from RNOR → ROR.
        </p>
      </div>
    ),
  },
  {
    q: 'What taxes apply to each residential status?',
    a: (
      <div className="text-sm text-gray-600">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-700">Income Type</th>
              <th className="text-center px-3 py-2 border border-gray-200 font-semibold text-red-600">NRI</th>
              <th className="text-center px-3 py-2 border border-gray-200 font-semibold text-amber-600">RNOR</th>
              <th className="text-center px-3 py-2 border border-gray-200 font-semibold text-green-600">ROR</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Income earned in India', '✓ Taxable', '✓ Taxable', '✓ Taxable'],
              ['Income received in India', '✓ Taxable', '✓ Taxable', '✓ Taxable'],
              ['Foreign income (earned & received outside India)', '✗ Exempt', '✗ Exempt', '✓ Taxable'],
              ['Foreign income from business controlled from India', '✗ Exempt', '✓ Taxable', '✓ Taxable'],
              ['Foreign income from profession set up in India', '✗ Exempt', '✓ Taxable', '✓ Taxable'],
            ].map(([type, nri, rnor, ror]) => (
              <tr key={type} className="border-b border-gray-100">
                <td className="px-3 py-2 border border-gray-200 text-gray-700">{type}</td>
                <td className="px-3 py-2 border border-gray-200 text-center text-red-600">{nri}</td>
                <td className="px-3 py-2 border border-gray-200 text-center text-amber-600">{rnor}</td>
                <td className="px-3 py-2 border border-gray-200 text-center text-green-600">{ror}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    q: 'How does this calculator count "days in India"?',
    a: (
      <div className="text-sm text-gray-600 space-y-2">
        <p>The calculator counts <strong>each calendar day you were present in India</strong>, including both arrival and departure day. For example, arriving on May 1 and departing on May 10 = <strong>10 days</strong>.</p>
        <p className="text-xs text-gray-500">This follows the general interpretation under the Income Tax Act. There is no partial-day rule — each day you set foot in India counts as one full day.</p>
        <div className="text-xs bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
          <strong>Tip:</strong> For the current ongoing year, use the "Still in India" toggle. The calculator counts days from your arrival through today and projects the full year forward.
        </div>
      </div>
    ),
  },
  {
    q: 'What is a Financial Year and when does it run?',
    a: (
      <div className="text-sm text-gray-600 space-y-2">
        <p>In India, the Financial Year (FY) runs from <strong>April 1 to March 31</strong> of the following calendar year.</p>
        <div className="text-xs space-y-1 mt-2">
          <div className="flex gap-2"><span className="font-semibold w-24 flex-shrink-0">FY 2023-24:</span><span>April 1, 2023 → March 31, 2024</span></div>
          <div className="flex gap-2"><span className="font-semibold w-24 flex-shrink-0">FY 2024-25:</span><span>April 1, 2024 → March 31, 2025</span></div>
          <div className="flex gap-2"><span className="font-semibold w-24 flex-shrink-0">FY 2025-26:</span><span>April 1, 2025 → March 31, 2026</span></div>
          <div className="flex gap-2"><span className="font-semibold w-24 flex-shrink-0">FY 2026-27:</span><span>April 1, 2026 → March 31, 2027</span></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Residential status is determined separately for each FY. A stay that spans two FYs (e.g., Jan–May) is automatically split and attributed to the correct years by this calculator.</p>
      </div>
    ),
  },
  {
    q: 'How does this calculator work internally?',
    a: (
      <div className="text-sm text-gray-600 space-y-2">
        <p>Here's what happens when you enter your stay dates:</p>
        <ol className="text-xs space-y-2 list-none">
          <li className="flex gap-2"><span className="font-bold text-brand-600 flex-shrink-0">1.</span><span><strong>Split by FY:</strong> Each stay period is split at FY boundaries (March 31 / April 1) and days are attributed to the correct financial year.</span></li>
          <li className="flex gap-2"><span className="font-bold text-brand-600 flex-shrink-0">2.</span><span><strong>Resident test:</strong> For each FY, BC1 (≥182 days) and BC2 (≥60 days + 365 in prev 4) are checked against your actual data.</span></li>
          <li className="flex gap-2"><span className="font-bold text-brand-600 flex-shrink-0">3.</span><span><strong>RNOR test:</strong> If resident, both RNOR conditions are checked using days from preceding FYs.</span></li>
          <li className="flex gap-2"><span className="font-bold text-brand-600 flex-shrink-0">4.</span><span><strong>Projection:</strong> For current and future FYs with no data, the calculator assumes you stay in India for the full year (365 days). These are marked with * and shown as "projected".</span></li>
          <li className="flex gap-2"><span className="font-bold text-brand-600 flex-shrink-0">5.</span><span><strong>Multi-year scan:</strong> The calculator scans from your earliest entered date through 6 future years to show your complete RNOR window.</span></li>
        </ol>
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">
          <strong>Simplification note:</strong> NRI status for preceding years uses a simplified check — if days in a FY are below 182, that FY is treated as NRI. The full nested BC2 recursion across all historical years is not computed. This may slightly overcount NRI years but rarely affects the RNOR outcome.
        </p>
      </div>
    ),
  },
];

function RNORFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-1">How it works & FAQs</h2>
      <p className="text-xs text-gray-400 mb-4">Everything you need to know about RNOR status and how this calculator determines it</p>
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white hover:bg-gray-50 transition"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="flex-1 text-sm font-semibold text-gray-800">{faq.q}</span>
              {open === i
                ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" />
                : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
            </button>
            {open === i && (
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
