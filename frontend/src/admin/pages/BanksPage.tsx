import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../layout/AdminLayout";
import { adminApi } from "../utils/adminApi";
import {
  Search, ChevronLeft, ChevronRight, Edit2, X, Check,
  Building2, BadgeCheck, AlertCircle, Plus, Trash2, AlertTriangle,
} from "lucide-react";

interface Bank {
  id: number;
  name: string;
  shortName: string | null;
  bankCode: string | null;
  bankType: string | null;
  headquarters: string | null;
  website: string | null;
  logoUrl: string | null;
  slug: string | null;
  isActive: boolean;
  isCurated: boolean;
  subType: string | null;
  sourceRbi: boolean;
  sourceRazorpay: boolean;
  branchCount: number;
}

interface BankForm {
  name: string;
  shortName: string;
  bankCode: string;
  bankType: string;
  headquarters: string;
  website: string;
  logoUrl: string;
  slug: string;
  isActive: boolean;
  isCurated: boolean;
  subType: string;
}

const BLANK_FORM: BankForm = {
  name: "", shortName: "", bankCode: "", bankType: "", headquarters: "",
  website: "", logoUrl: "", slug: "", isActive: true, isCurated: false, subType: "",
};

const BANK_TYPES = ["", "public", "private", "foreign", "cooperative", "small_finance", "payments", "regional_rural"];

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

async function fetchBanks(page: number, search: string, type: string) {
  const params = new URLSearchParams({ page: String(page), limit: "20", search, type });
  const res = await adminApi.get(`/admin/banks/manage?${params}`);
  return res.data as { total: number; page: number; limit: number; data: Bank[] };
}

export default function BanksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [form, setForm] = useState<BankForm | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<BankForm>(BLANK_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<Bank | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-banks-manage", page, search, typeFilter],
    queryFn: () => fetchBanks(page, search, typeFilter),
    keepPreviousData: true,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BankForm> }) =>
      adminApi.put(`/admin/banks/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banks-manage"] });
      setEditingBank(null);
      setForm(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: BankForm) => adminApi.post("/admin/banks", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banks-manage"] });
      setShowCreate(false);
      setCreateForm(BLANK_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/admin/banks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banks-manage"] });
      setDeleteConfirm(null);
      setEditingBank(null);
      setForm(null);
    },
  });

  const openEdit = useCallback((bank: Bank) => {
    setEditingBank(bank);
    setForm({
      name: bank.name, shortName: bank.shortName ?? "", bankCode: bank.bankCode ?? "",
      bankType: bank.bankType ?? "", headquarters: bank.headquarters ?? "",
      website: bank.website ?? "", logoUrl: bank.logoUrl ?? "", slug: bank.slug ?? "",
      isActive: bank.isActive, isCurated: bank.isCurated, subType: bank.subType ?? "",
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const BankFormFields = ({ f, setF }: { f: BankForm; setF: (fn: (prev: BankForm) => BankForm) => void }) => (
    <div className="p-5 space-y-4">
      <Field label="Name *">
        <input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Short Name">
          <input value={f.shortName} onChange={e => setF(p => ({ ...p, shortName: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Bank Code">
          <input value={f.bankCode} onChange={e => setF(p => ({ ...p, bankCode: e.target.value }))} className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select value={f.bankType} onChange={e => setF(p => ({ ...p, bankType: e.target.value }))} className={inputCls}>
            {BANK_TYPES.map(t => <option key={t} value={t}>{t ? t.replace(/_/g, " ") : "— select —"}</option>)}
          </select>
        </Field>
        <Field label="Sub Type">
          <input value={f.subType} onChange={e => setF(p => ({ ...p, subType: e.target.value }))} className={inputCls} />
        </Field>
      </div>
      <Field label="Headquarters">
        <input value={f.headquarters} onChange={e => setF(p => ({ ...p, headquarters: e.target.value }))} className={inputCls} placeholder="City, State" />
      </Field>
      <Field label="Website">
        <input value={f.website} onChange={e => setF(p => ({ ...p, website: e.target.value }))} className={inputCls} placeholder="https://..." />
      </Field>
      <Field label="Logo URL">
        <input value={f.logoUrl} onChange={e => setF(p => ({ ...p, logoUrl: e.target.value }))} className={inputCls} placeholder="/images/banks/..." />
      </Field>
      <Field label="Slug">
        <input value={f.slug} onChange={e => setF(p => ({ ...p, slug: e.target.value }))} className={inputCls} placeholder="auto-generated from name if blank" />
      </Field>
      <div className="flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.isActive} onChange={e => setF(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-brand-600" />
          <span className="text-sm text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.isCurated} onChange={e => setF(p => ({ ...p, isCurated: e.target.checked }))} className="w-4 h-4 accent-brand-600" />
          <span className="text-sm text-gray-700">Curated</span>
        </label>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 size={20} className="text-brand-600" />
              Banks Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {data ? `${data.total.toLocaleString()} banks` : "Loading..."}
            </p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setCreateForm(BLANK_FORM); }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus size={15} /> Add Bank
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search bank name..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700">Search</button>
            {(search || typeFilter) && (
              <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setTypeFilter(""); setPage(1); }}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                Clear
              </button>
            )}
          </form>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
            {BANK_TYPES.map(t => <option key={t} value={t}>{t ? t.replace(/_/g, " ") : "All types"}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 text-sm">Loading banks...</div>
          ) : isError ? (
            <div className="py-20 text-center text-red-500 text-sm flex flex-col items-center gap-2">
              <AlertCircle size={20} /> Failed to load banks
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bank</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">HQ</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Branches</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sources</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.data.map(bank => (
                    <tr key={bank.id} className={`hover:bg-gray-50/50 transition-colors ${!bank.isActive ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {bank.logoUrl ? (
                            <img src={bank.logoUrl} alt="" className="w-7 h-7 object-contain rounded" />
                          ) : (
                            <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center">
                              <Building2 size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 leading-tight">{bank.name}</p>
                            {bank.shortName && <p className="text-xs text-gray-400">{bank.shortName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{bank.bankCode ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize text-xs">{bank.bankType?.replace(/_/g, " ") ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{bank.headquarters ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-700">{bank.branchCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${bank.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                            {bank.isActive ? <Check size={10} /> : <X size={10} />}
                            {bank.isActive ? "Active" : "Inactive"}
                          </span>
                          {bank.isCurated && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                              <BadgeCheck size={10} /> Curated
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {bank.sourceRbi && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">RBI</span>}
                          {bank.sourceRazorpay && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">Rzp</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEdit(bank)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * data.limit) + 1}–{Math.min(page * data.limit, data.total)} of {data.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm rounded-lg border transition-colors ${p === page ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingBank && form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base">Edit Bank</h2>
              <button onClick={() => { setEditingBank(null); setForm(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <BankFormFields f={form} setF={setForm as any} />
            <div className="flex items-center justify-between p-5 border-t border-gray-100">
              <button
                onClick={() => setDeleteConfirm(editingBank)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} /> Deactivate
              </button>
              <div className="flex gap-3">
                <button onClick={() => { setEditingBank(null); setForm(null); }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={() => updateMutation.mutate({ id: editingBank.id, data: form! })}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60 flex items-center gap-2"
                >
                  {updateMutation.isPending ? "Saving..." : <><Check size={14} /> Save Changes</>}
                </button>
              </div>
            </div>
            {updateMutation.isError && <p className="text-red-500 text-xs px-5 pb-4">Failed to save.</p>}
          </div>
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Plus size={16} className="text-brand-600" /> Add New Bank
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <BankFormFields f={createForm} setF={setCreateForm as any} />
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(createForm)}
                disabled={createMutation.isPending || !createForm.name.trim()}
                className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60 flex items-center gap-2"
              >
                {createMutation.isPending ? "Creating..." : <><Plus size={14} /> Create Bank</>}
              </button>
            </div>
            {createMutation.isError && (
              <p className="text-red-500 text-xs px-5 pb-4">
                {(createMutation.error as any)?.response?.data?.error ?? "Failed to create bank."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Deactivate Bank?</h3>
                <p className="text-sm text-gray-500 mt-0.5">This sets the bank as inactive. Branches remain intact.</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-4 py-2.5 mb-5">
              {deleteConfirm.name}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
