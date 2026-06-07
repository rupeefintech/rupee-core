import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { adminApi } from '../utils/adminApi';
import { Plus, Edit2, Trash2, RefreshCw, Check, X, ExternalLink, AlertCircle, Search, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PRODUCT_TYPES = [
  { value: 'fd',            label: 'Fixed Deposit (FD)'   },
  { value: 'savings',       label: 'Savings Account'      },
  { value: 'loan_personal', label: 'Personal Loan'        },
  { value: 'loan_home',     label: 'Home Loan'            },
  { value: 'loan_auto',     label: 'Auto / Car Loan'      },
];

const TENURE_PRESETS: Record<string, { label: string; months: number | null }[]> = {
  fd: [
    { label: '7-14 Days',  months: null  },
    { label: '15-29 Days', months: null  },
    { label: '1-2 Months', months: 1     },
    { label: '3-5 Months', months: 4     },
    { label: '6 Months',   months: 6     },
    { label: '9 Months',   months: 9     },
    { label: '1 Year',     months: 12    },
    { label: '2 Years',    months: 24    },
    { label: '3 Years',    months: 36    },
    { label: '5 Years',    months: 60    },
  ],
  savings: [
    { label: 'All Balances',          months: null },
    { label: 'Up to ₹25,000',         months: null },
    { label: 'Up to ₹1 Lakh',         months: null },
    { label: '₹1 Lakh – ₹10 Lakh',    months: null },
    { label: 'Above ₹10 Lakh',        months: null },
    { label: 'Above ₹1 Crore',        months: null },
  ],
  loan_personal: [
    { label: '12 Months',   months: 12  },
    { label: '24 Months',   months: 24  },
    { label: '36 Months',   months: 36  },
    { label: '48 Months',   months: 48  },
    { label: '60 Months',   months: 60  },
    { label: '84 Months',   months: 84  },
  ],
  loan_home: [
    { label: '10 Years',  months: 120 },
    { label: '15 Years',  months: 180 },
    { label: '20 Years',  months: 240 },
    { label: '25 Years',  months: 300 },
    { label: '30 Years',  months: 360 },
  ],
  loan_auto: [
    { label: '12 Months', months: 12 },
    { label: '24 Months', months: 24 },
    { label: '36 Months', months: 36 },
    { label: '60 Months', months: 60 },
    { label: '84 Months', months: 84 },
  ],
};

type FreshnessLevel = 'fresh' | 'stale' | 'outdated';

function freshness(lastVerified: string): FreshnessLevel {
  const days = (Date.now() - new Date(lastVerified).getTime()) / 86_400_000;
  if (days <= 7)  return 'fresh';
  if (days <= 30) return 'stale';
  return 'outdated';
}

const FRESH_CLS: Record<FreshnessLevel, string> = {
  fresh:    'bg-green-100 text-green-700',
  stale:    'bg-amber-100 text-amber-700',
  outdated: 'bg-red-100   text-red-700',
};

const FRESH_LABEL: Record<FreshnessLevel, string> = {
  fresh:    'Fresh',
  stale:    'Stale',
  outdated: 'Outdated',
};

const EMPTY_FORM = {
  bankId: '',
  productType: 'fd',
  tenureLabel: '',
  tenureMonths: '',
  rate: '',
  seniorRate: '',
  minAmount: '',
  maxAmount: '',
  effectiveFrom: new Date().toISOString().split('T')[0],
  sourceUrl: '',
  verifiedBy: '',
  notes: '',
};

export default function RatesPage() {
  const [type,          setType]          = useState('fd');
  const [rates,         setRates]         = useState<any[]>([]);
  const [banks,         setBanks]         = useState<any[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [editing,       setEditing]       = useState<any | null>(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [saving,        setSaving]        = useState(false);
  const [bankSearch,    setBankSearch]    = useState('');
  const [tableSearch,   setTableSearch]   = useState('');
  const [collapsedBanks, setCollapsedBanks] = useState<Set<string>>(new Set());

  async function loadRates() {
    setLoading(true);
    try {
      const res = await adminApi.get(`/admin/rates?type=${type}`);
      setRates(res.data.data ?? []);
    } catch { toast.error('Failed to load rates'); }
    setLoading(false);
  }

  async function loadBanks() {
    try {
      const res = await adminApi.get('/admin/banks?for_rates=true');
      setBanks(res.data.banks ?? []);
    } catch { /* non-critical */ }
  }

  useEffect(() => { loadRates(); }, [type]);
  useEffect(() => { loadBanks(); }, []);

  function openAdd() {
    setEditing(null);
    setBankSearch('');
    setForm({ ...EMPTY_FORM, productType: type, effectiveFrom: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  }

  function openEdit(r: any) {
    setEditing(r);
    setBankSearch('');
    setForm({
      bankId:        String(r.bank?.id ?? r.bankId ?? ''),
      productType:   r.productType,
      tenureLabel:   r.tenureLabel ?? '',
      tenureMonths:  r.tenureMonths != null ? String(r.tenureMonths) : '',
      rate:          String(r.rate ?? ''),
      seniorRate:    r.seniorRate != null ? String(r.seniorRate) : '',
      minAmount:     r.minAmount  != null ? String(r.minAmount)  : '',
      maxAmount:     r.maxAmount  != null ? String(r.maxAmount)  : '',
      effectiveFrom: r.effectiveFrom ? r.effectiveFrom.split('T')[0] : new Date().toISOString().split('T')[0],
      sourceUrl:     r.sourceUrl  ?? '',
      verifiedBy:    r.verifiedBy ?? '',
      notes:         r.notes      ?? '',
    });
    setShowForm(true);
  }

  async function saveRate() {
    if (!form.bankId || !form.rate) { toast.error('Bank and rate are required'); return; }
    setSaving(true);
    try {
      const payload = {
        bankId:        Number(form.bankId),
        productType:   form.productType,
        tenureLabel:   form.tenureLabel   || null,
        tenureMonths:  form.tenureMonths  ? Number(form.tenureMonths)  : null,
        rate:          Number(form.rate),
        seniorRate:    form.seniorRate    ? Number(form.seniorRate)    : null,
        minAmount:     form.minAmount     ? Number(form.minAmount)     : null,
        maxAmount:     form.maxAmount     ? Number(form.maxAmount)     : null,
        effectiveFrom: form.effectiveFrom,
        sourceUrl:     form.sourceUrl     || null,
        verifiedBy:    form.verifiedBy    || null,
        notes:         form.notes         || null,
      };
      if (editing) {
        await adminApi.put(`/admin/rates/${editing.id}`, payload);
        toast.success('Rate updated');
      } else {
        await adminApi.post('/admin/rates', payload);
        toast.success('Rate added');
      }
      setShowForm(false);
      loadRates();
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Failed to save');
    }
    setSaving(false);
  }

  async function deactivate(id: number) {
    if (!confirm('Deactivate this rate entry?')) return;
    try {
      await adminApi.delete(`/admin/rates/${id}`);
      toast.success('Deactivated');
      loadRates();
    } catch { toast.error('Failed to deactivate'); }
  }

  function applyPreset(preset: { label: string; months: number | null }) {
    setForm(f => ({ ...f, tenureLabel: preset.label, tenureMonths: preset.months != null ? String(preset.months) : '' }));
  }

  const freshnessWarning = rates.filter(r => r.isActive && freshness(r.lastVerified) === 'outdated').length;

  // Group rates by bank for table display
  const groupedRates = useMemo(() => {
    const q = tableSearch.toLowerCase();
    const filtered = q
      ? rates.filter(r => r.bank?.name?.toLowerCase().includes(q))
      : rates;
    const map = new Map<string, { bankName: string; bankType: string; logoUrl: string | null; entries: any[] }>();
    for (const r of filtered) {
      const key = r.bank?.name ?? 'Unknown';
      if (!map.has(key)) map.set(key, { bankName: key, bankType: r.bank?.bankType ?? '', logoUrl: r.bank?.logoUrl ?? null, entries: [] });
      map.get(key)!.entries.push(r);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rates, tableSearch]);

  function toggleBank(name: string) {
    setCollapsedBanks(prev => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  }
  function collapseAll() { setCollapsedBanks(new Set(groupedRates.map(([name]) => name))); }
  function expandAll()   { setCollapsedBanks(new Set()); }

  const filteredBanks = useMemo(() => {
    if (!bankSearch.trim()) return banks.slice(0, 80);
    const q = bankSearch.toLowerCase();
    return banks.filter((b: any) => b.name.toLowerCase().includes(q)).slice(0, 40);
  }, [banks, bankSearch]);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Financial Rates</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manually curated FD, savings, and loan rates</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadRates} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl shadow transition-colors">
              <Plus className="w-4 h-4" /> Add Rate
            </button>
          </div>
        </div>

        {/* Staleness warning */}
        {freshnessWarning > 0 && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span><strong>{freshnessWarning}</strong> rate{freshnessWarning !== 1 ? 's' : ''} not verified in over 30 days — please update.</span>
          </div>
        )}

        {/* Type tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit overflow-x-auto">
          {PRODUCT_TYPES.map(pt => (
            <button key={pt.value} onClick={() => setType(pt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${type === pt.value
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'}`}>
              {pt.label}
            </button>
          ))}
        </div>

        {/* Search + collapse controls */}
        {rates.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Filter by bank name…"
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <span className="text-xs text-gray-400">{groupedRates.length} bank{groupedRates.length !== 1 ? 's' : ''} · {rates.length} entries</span>
            <div className="flex gap-1">
              <button onClick={expandAll}   className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-brand-300 text-gray-500">Expand all</button>
              <button onClick={collapseAll} className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-brand-300 text-gray-500">Collapse all</button>
            </div>
          </div>
        )}

        {/* Rates — grouped by bank */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm shadow-sm">Loading…</div>
        ) : rates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm shadow-sm">
            No rates yet. <button onClick={openAdd} className="text-brand-600 underline font-semibold">Add the first one →</button>
          </div>
        ) : groupedRates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 text-sm shadow-sm">No banks match "{tableSearch}"</div>
        ) : (
          <div className="space-y-2">
            {groupedRates.map(([bankName, group]) => {
              const isCollapsed = collapsedBanks.has(bankName);
              const bestRate    = Math.max(...group.entries.map(r => Number(r.rate)));
              const hasOutdated = group.entries.some(r => r.isActive && freshness(r.lastVerified) === 'outdated');
              return (
                <div key={bankName} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Bank header row */}
                  <button
                    onClick={() => toggleBank(bankName)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    {group.logoUrl
                      ? <img src={group.logoUrl} alt="" className="w-7 h-7 object-contain rounded flex-shrink-0 bg-gray-50 border border-gray-100" />
                      : <div className="w-7 h-7 bg-brand-50 rounded flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0 border border-brand-100">{bankName.charAt(0)}</div>}
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 text-sm">{bankName}</span>
                      <span className="ml-2 text-xs text-gray-400">{group.bankType}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {hasOutdated && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">Outdated</span>}
                      <span className="text-xs font-bold text-emerald-700">{bestRate}% best</span>
                      <span className="text-xs text-gray-400">{group.entries.length} entry{group.entries.length !== 1 ? 'ies' : 'y'}</span>
                      <button
                        onClick={e => { e.stopPropagation(); openAdd(); setForm(f => ({ ...f, bankId: String(group.entries[0]?.bank?.id ?? ''), productType: type })); }}
                        className="p-1 hover:bg-brand-50 rounded text-brand-500 hover:text-brand-700"
                        title="Add entry for this bank"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      {isCollapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Entries table */}
                  {!isCollapsed && (
                    <div className="border-t border-gray-100 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                            <th className="text-left px-4 py-2">Tenure / Tier</th>
                            <th className="text-right px-3 py-2">Rate %</th>
                            <th className="text-right px-3 py-2">Senior %</th>
                            <th className="text-right px-3 py-2 hidden sm:table-cell">Min Amt</th>
                            <th className="text-left px-3 py-2">Freshness</th>
                            <th className="text-left px-3 py-2 hidden md:table-cell">Source</th>
                            <th className="text-left px-3 py-2">Status</th>
                            <th className="px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {group.entries.map(r => {
                            const fl = freshness(r.lastVerified);
                            return (
                              <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${!r.isActive ? 'opacity-40' : ''}`}>
                                <td className="px-4 py-2.5 text-gray-700 font-medium">{r.tenureLabel ?? '—'}</td>
                                <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{r.rate}%</td>
                                <td className="px-3 py-2.5 text-right text-gray-500">{r.seniorRate != null ? `${r.seniorRate}%` : '—'}</td>
                                <td className="px-3 py-2.5 text-right text-gray-400 hidden sm:table-cell">{r.minAmount != null ? `₹${Number(r.minAmount).toLocaleString('en-IN')}` : '—'}</td>
                                <td className="px-3 py-2.5">
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${FRESH_CLS[fl]}`}>{FRESH_LABEL[fl]}</span>
                                </td>
                                <td className="px-3 py-2.5 hidden md:table-cell">
                                  {r.sourceUrl
                                    ? <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-brand-500 hover:underline">
                                        Link <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="px-3 py-2.5">
                                  {r.isActive
                                    ? <span className="flex items-center gap-0.5 text-green-600"><Check className="w-3 h-3" /> Active</span>
                                    : <span className="flex items-center gap-0.5 text-gray-400"><X className="w-3 h-3" /> Off</span>}
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-1 justify-end">
                                    <button onClick={() => openEdit(r)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-brand-600" title="Edit">
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    {r.isActive && (
                                      <button onClick={() => deactivate(r.id)} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500" title="Deactivate">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add/Edit Form modal ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit Rate' : 'Add Rate Entry'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Bank — searchable picker */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Bank *</label>
                {/* Search filter */}
                <div className="relative mb-1.5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                    placeholder="Type to filter banks…"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <select value={form.bankId} onChange={e => setForm(f => ({ ...f, bankId: e.target.value }))}
                  size={6}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
                  <option value="">— Select bank —</option>
                  {filteredBanks.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}{b.bankType ? ` (${b.bankType})` : ''}</option>
                  ))}
                </select>
                {form.bankId && (
                  <p className="text-xs text-green-600 mt-1 font-semibold">
                    ✓ {banks.find((b: any) => String(b.id) === form.bankId)?.name ?? ''}
                  </p>
                )}
              </div>

              {/* Product type */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Product Type *</label>
                <select value={form.productType} onChange={e => setForm(f => ({ ...f, productType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  {PRODUCT_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                </select>
              </div>

              {/* Tenure (presets + manual) */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  {form.productType === 'savings' ? 'Balance Tier' : 'Tenure'}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(TENURE_PRESETS[form.productType] ?? TENURE_PRESETS['fd']).map(p => (
                    <button key={p.label} type="button" onClick={() => applyPreset(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${form.tenureLabel === p.label
                        ? 'bg-brand-100 border-brand-300 text-brand-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-brand-300'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.tenureLabel} onChange={e => setForm(f => ({ ...f, tenureLabel: e.target.value }))}
                    placeholder="Label (e.g. 1 Year)" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  <input type="number" value={form.tenureMonths} onChange={e => setForm(f => ({ ...f, tenureMonths: e.target.value }))}
                    placeholder="Months (e.g. 12)" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>

              {/* Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Interest Rate % *</label>
                  <input type="number" step="0.01" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
                    placeholder="7.50" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Senior Citizen Rate %</label>
                  <input type="number" step="0.01" value={form.seniorRate} onChange={e => setForm(f => ({ ...f, seniorRate: e.target.value }))}
                    placeholder="8.00" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>

              {/* Zero Balance toggle — savings only */}
              {form.productType === 'savings' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Account Type</label>
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.minAmount === '0'
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.minAmount === '0'}
                      onChange={e => {
                        if (e.target.checked) {
                          setForm(f => ({ ...f, minAmount: '0', notes: 'zero_balance' }));
                        } else {
                          setForm(f => ({ ...f, minAmount: '', notes: '' }));
                        }
                      }}
                      className="w-4 h-4 accent-green-600 rounded"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-800">Zero Balance Account</div>
                      <div className="text-xs text-gray-500">No minimum balance required (BSBDA / Basic Savings). Sets Min Amount = 0.</div>
                    </div>
                    {form.minAmount === '0' && (
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex-shrink-0">Active</span>
                    )}
                  </label>
                </div>
              )}

              {/* Min/Max amount — hidden when zero balance */}
              {form.minAmount !== '0' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      {form.productType === 'savings' ? 'Min Balance (₹)' : 'Min Amount (₹)'}
                    </label>
                    <input type="number" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))}
                      placeholder={form.productType === 'savings' ? 'e.g. 10000' : '1000'}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      {form.productType === 'savings' ? 'Max Balance (₹)' : 'Max Amount (₹)'}
                    </label>
                    <input type="number" value={form.maxAmount} onChange={e => setForm(f => ({ ...f, maxAmount: e.target.value }))}
                      placeholder="Leave blank = unlimited"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                </div>
              )}

              {/* Effective from */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Effective From</label>
                <input type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>

              {/* Source URL */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Source URL (bank's rates page)</label>
                <input type="url" value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))}
                  placeholder="https://bank.com/rates" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>

              {/* Verified by + notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Verified By</label>
                  <input value={form.verifiedBy} onChange={e => setForm(f => ({ ...f, verifiedBy: e.target.value }))}
                    placeholder="admin@rupeepedia.in" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Notes</label>
                  <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional note…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={saveRate} disabled={saving}
                className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl shadow transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Update Rate' : 'Add Rate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
