import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import AdminLayout from "../layout/AdminLayout";
import { adminApi } from "../utils/adminApi";
import {
  Mail, ChevronLeft, ChevronRight, Eye, Trash2,
  Filter, AlertCircle, CheckCircle2,
} from "lucide-react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  ipHash: string | null;
  createdAt: string;
}

async function fetchContacts(page: number, unreadOnly: boolean) {
  const params = new URLSearchParams({ page: String(page), limit: "20", unread: String(unreadOnly) });
  const res = await adminApi.get(`/admin/contacts?${params}`);
  return res.data as { total: number; page: number; limit: number; data: ContactMessage[] };
}

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-contacts", page, unreadOnly],
    queryFn: () => fetchContacts(page, unreadOnly),
    placeholderData: keepPreviousData,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => adminApi.patch(`/admin/contacts/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  const deleteMsg = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/admin/contacts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contacts"] });
      if (selected?.id) setSelected(null);
    },
  });

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) markRead.mutate(msg.id);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;
  const unreadCount = data?.data.filter(m => !m.isRead).length ?? 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Mail size={20} className="text-brand-600" />
              Contact Messages
              {unreadCount > 0 && (
                <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {data ? `${data.total} messages total` : "Loading..."}
            </p>
          </div>
          <button
            onClick={() => { setUnreadOnly(u => !u); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors ${unreadOnly ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter size={14} />
            {unreadOnly ? "Showing unread" : "All messages"}
          </button>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Message list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
              ) : isError ? (
                <div className="py-16 text-center text-red-500 text-sm flex flex-col items-center gap-2">
                  <AlertCircle size={18} />
                  Failed to load messages
                </div>
              ) : data?.data.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle2 size={18} />
                  No messages{unreadOnly ? " unread" : ""}
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {data?.data.map(msg => (
                    <li
                      key={msg.id}
                      onClick={() => openMessage(msg)}
                      className={`px-4 py-3.5 cursor-pointer transition-colors hover:bg-gray-50 ${selected?.id === msg.id ? "bg-brand-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {!msg.isRead && (
                              <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                            )}
                            <p className={`text-sm truncate ${!msg.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                              {msg.name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{msg.subject}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{msg.email}</p>
                        </div>
                        <p className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                          {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pagination */}
            {data && totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{selected.subject}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-600">{selected.name}</p>
                      <a href={`mailto:${selected.email}`} className="text-sm text-brand-600 hover:text-brand-800 transition-colors">
                        {selected.email}
                      </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(selected.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      className="px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      Reply
                    </a>
                    <button
                      onClick={() => deleteMsg.mutate(selected.id)}
                      disabled={deleteMsg.isPending}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                  {selected.message}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Eye size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{selected.isRead ? "Read" : "Unread"}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
                <Mail size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
