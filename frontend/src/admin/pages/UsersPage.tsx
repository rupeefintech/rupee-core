import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import AdminLayout from "../layout/AdminLayout";
import { adminApi } from "../utils/adminApi";
import {
  Users, Search, ChevronLeft, ChevronRight, AlertCircle,
  AlertTriangle, X, Check, Mail, Plus, Edit2, Eye,
  ToggleLeft, ToggleRight, Trash2,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  source: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const SOURCES = [
  { value: "contact_form", label: "Contact Form" },
  { value: "manual",       label: "Manual" },
  { value: "newsletter",   label: "Newsletter" },
];
const SRC = Object.fromEntries(SOURCES.map(s => [s.value, s.label]));

interface UserForm { name: string; email: string; source: string; notes: string; }
const BLANK: UserForm = { name: "", email: "", source: "manual", notes: "" };

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300";

async function fetchUsers(page: number, search: string, source: string) {
  const p = new URLSearchParams({ page: String(page), limit: "20", search, source });
  const res = await adminApi.get(`/admin/users?${p}`);
  return res.data as { total: number; page: number; limit: number; data: User[] };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function UsersPage() {
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // modals
  const [viewing, setViewing]         = useState<User | null>(null);
  const [editing, setEditing]         = useState<User | null>(null);
  const [editForm, setEditForm]       = useState<UserForm>(BLANK);
  const [showCreate, setShowCreate]   = useState(false);
  const [createForm, setCreateForm]   = useState<UserForm>(BLANK);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, search, sourceFilter],
    queryFn: () => fetchUsers(page, search, sourceFilter),
    placeholderData: keepPreviousData,
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      adminApi.patch(`/admin/users/${id}`, payload),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      const updated: User = res.data.data;
      if (viewing?.id === vars.id) setViewing(updated);
      if (editing?.id  === vars.id) setEditing(updated);
    },
  });

  const createMutation = useMutation({
    mutationFn: (form: UserForm) => adminApi.post("/admin/users", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setShowCreate(false);
      setCreateForm(BLANK);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteConfirm(null);
      setViewing(null);
      setEditing(null);
    },
  });

  const openView = (u: User) => { setViewing(u); };
  const openEdit = (u: User) => {
    setEditing(u);
    setEditForm({ name: u.name, email: u.email, source: u.source, notes: u.notes ?? "" });
  };
  const saveEdit = () => {
    if (!editing) return;
    patchMutation.mutate(
      { id: editing.id, payload: { name: editForm.name, source: editForm.source, notes: editForm.notes } },
      { onSuccess: () => { setEditing(null); } }
    );
  };
  const toggleActive = (u: User) =>
    patchMutation.mutate({ id: u.id, payload: { isActive: !u.isActive } });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <AdminLayout>
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-brand-600" /> Users
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {data ? `${data.total.toLocaleString()} users` : "Loading..."}
              {" "}— auto-captured from contact form + manually added
            </p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setCreateForm(BLANK); }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus size={15} /> Add User
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700">Search</button>
            {(search || sourceFilter) && (
              <button type="button"
                onClick={() => { setSearch(""); setSearchInput(""); setSourceFilter(""); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                Clear
              </button>
            )}
          </form>
          <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option value="">All sources</option>
            {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 text-sm">Loading users...</div>
          ) : isError ? (
            <div className="py-20 text-center text-red-500 text-sm flex flex-col items-center gap-2">
              <AlertCircle size={20} /> Failed to load users
            </div>
          ) : data?.data.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.data.map(u => (
                    <tr key={u.id} className={`hover:bg-gray-50/60 transition-colors ${!u.isActive ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${u.email}`} className="text-brand-600 hover:text-brand-800 text-sm transition-colors">
                          {u.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                          {SRC[u.source] ?? u.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmt(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openView(u)} title="View details"
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEdit(u)} title="Edit user"
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            <Edit2 size={14} />
                          </button>
                        </div>
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
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
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ VIEW MODAL ══ */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">User Details</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => { openEdit(viewing); setViewing(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setViewing(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <Row label="Name"    value={viewing.name} />
              <Row label="Email"   value={
                <a href={`mailto:${viewing.email}`} className="text-brand-600 hover:text-brand-800 transition-colors">
                  {viewing.email}
                </a>
              } />
              <Row label="Source"  value={SRC[viewing.source] ?? viewing.source} />
              <Row label="Status"  value={
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${viewing.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {viewing.isActive ? "Active" : "Inactive"}
                </span>
              } />
              <Row label="Joined"      value={fmt(viewing.createdAt)} />
              <Row label="Last updated" value={fmt(viewing.updatedAt)} />
              {viewing.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed whitespace-pre-wrap">
                    {viewing.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-5 border-t border-gray-100">
              <button onClick={() => { setDeleteConfirm(viewing); setViewing(null); }}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
              <button onClick={() => toggleActive(viewing)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {viewing.isActive
                  ? <><ToggleRight size={18} className="text-emerald-500" /> Deactivate</>
                  : <><ToggleLeft  size={18} /> Activate</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT MODAL ══ */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Edit2 size={15} className="text-amber-500" /> Edit User
              </h2>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Name *">
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls} />
              </Field>
              <Field label="Email">
                <input value={editForm.email} disabled
                  className={inputCls + " bg-gray-50 text-gray-400 cursor-not-allowed"} />
                <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed</p>
              </Field>
              <Field label="Source">
                <select value={editForm.source} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))}
                  className={inputCls + " bg-white"}>
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Internal Notes">
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Optional notes..." className={inputCls + " resize-none"} />
              </Field>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={patchMutation.isPending || !editForm.name.trim()}
                className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60 flex items-center gap-2">
                {patchMutation.isPending ? "Saving..." : <><Check size={14} /> Save Changes</>}
              </button>
            </div>
            {patchMutation.isError && (
              <p className="text-red-500 text-xs px-5 pb-4">Failed to save changes.</p>
            )}
          </div>
        </div>
      )}

      {/* ══ CREATE MODAL ══ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Plus size={16} className="text-brand-600" /> Add User
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Name *">
                <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name" className={inputCls} />
              </Field>
              <Field label="Email *">
                <input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com" className={inputCls} />
              </Field>
              <Field label="Source">
                <select value={createForm.source} onChange={e => setCreateForm(f => ({ ...f, source: e.target.value }))}
                  className={inputCls + " bg-white"}>
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Notes">
                <textarea value={createForm.notes} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Optional internal notes" className={inputCls + " resize-none"} />
              </Field>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Cancel</button>
              <button onClick={() => createMutation.mutate(createForm)}
                disabled={createMutation.isPending || !createForm.name.trim() || !createForm.email.trim()}
                className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60 flex items-center gap-2">
                {createMutation.isPending ? "Adding..." : <><Plus size={14} /> Add User</>}
              </button>
            </div>
            {createMutation.isError && (
              <p className="text-red-500 text-xs px-5 pb-4">
                {(createMutation.error as any)?.response?.data?.error ?? "Failed to add user."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete User?</h3>
                <p className="text-sm text-gray-500 mt-0.5">Permanently removes the user record.</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-4 py-2.5 mb-5">
              {deleteConfirm.email}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60">
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <p className="text-xs font-semibold text-gray-500 w-28 shrink-0 pt-0.5">{label}</p>
      <div className="text-sm text-gray-800 flex-1">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
