import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, Edit2, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  Star, Eye, EyeOff,
} from "lucide-react";
import AdminLayout from "../layout/AdminLayout";
import { adminApi } from "../utils/adminApi";
import toast from "react-hot-toast";

interface Blog {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  readTime: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string;
  updatedAt: string;
}

const CATEGORIES = ['All', 'Tax', 'Banking', 'Investment', 'Credit Cards', 'Loans', 'NRI Tax', 'PIN & Postal', 'Gold & Silver'];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [loading, setLoading] = useState(true);

  const limit = 20;

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search.trim()) params.search = search.trim();
      if (category !== "All") params.category = category;
      if (published !== "all") params.published = published;
      const res = await adminApi.get("/admin/blogs", { params });
      setBlogs(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load blogs");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [page, category, published]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(b: Blog) {
    if (!confirm(`Delete "${b.title}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/admin/blogs/${b.id}`);
      toast.success("Blog deleted");
      setBlogs((prev) => prev.filter((x) => x.id !== b.id));
      setTotal((t) => t - 1);
    } catch {
      toast.error("Failed to delete blog");
    }
  }

  async function togglePublished(b: Blog) {
    try {
      const res = await adminApi.put(`/admin/blogs/${b.id}`, { isPublished: !b.isPublished });
      setBlogs((prev) => prev.map((x) => (x.id === b.id ? { ...x, isPublished: res.data.data.isPublished } : x)));
      toast.success(res.data.data.isPublished ? "Published" : "Unpublished");
    } catch {
      toast.error("Failed to update");
    }
  }

  async function toggleFeatured(b: Blog) {
    try {
      const res = await adminApi.put(`/admin/blogs/${b.id}`, { isFeatured: !b.isFeatured });
      setBlogs((prev) => prev.map((x) => (x.id === b.id ? { ...x, isFeatured: res.data.data.isFeatured } : x)));
      toast.success(res.data.data.isFeatured ? "Marked featured" : "Removed from featured");
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} post{total === 1 ? "" : "s"} · Money Guides section</p>
          </div>
          <Link
            to="/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            New Post
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-lg">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            />
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={published}
            onChange={(e) => { setPublished(e.target.value as any); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500 border-b border-gray-200">
                <th className="px-4 py-3 font-semibold">Post</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3 font-semibold">Published</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No blog posts found</td></tr>
              ) : (
                blogs.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {b.coverImage ? (
                          <img src={b.coverImage} alt="" className="w-14 h-10 object-cover rounded-md border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-14 h-10 rounded-md bg-gray-100 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 truncate max-w-md">{b.title}</div>
                          <div className="text-xs text-gray-400 font-mono truncate max-w-md">/{b.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{b.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(b)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition ${
                          b.isPublished ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={b.isPublished ? "Click to unpublish" : "Click to publish"}
                      >
                        {b.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                        {b.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeatured(b)}
                        className={`p-1.5 rounded-md transition ${b.isFeatured ? "text-amber-500 hover:bg-amber-50" : "text-gray-300 hover:bg-gray-100 hover:text-gray-400"}`}
                        title={b.isFeatured ? "Remove from featured" : "Mark as featured"}
                      >
                        <Star size={16} fill={b.isFeatured ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                      {new Date(b.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/money-guides/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="View on site"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <Link
                          to={`/admin/blog/${b.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(b)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
