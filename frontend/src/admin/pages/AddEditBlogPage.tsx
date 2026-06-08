import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, Code2, X } from "lucide-react";
import AdminLayout from "../layout/AdminLayout";
import { adminApi } from "../utils/adminApi";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import toast from "react-hot-toast";

const CATEGORIES = ['Tax', 'Banking', 'Investment', 'Credit Cards', 'Loans', 'NRI Tax', 'PIN & Postal', 'Gold & Silver'];

const EMPTY_FORM = {
  slug: "",
  title: "",
  description: "",
  category: "Banking",
  tags: "",
  coverImage: "",
  content: "",
  readTime: "",
  isPublished: true,
  isFeatured: false,
};

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AddEditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (!isEdit) return;
    adminApi.get(`/admin/blogs/${id}`).then((res) => {
      const b = res.data.data;
      setForm({
        slug: b.slug,
        title: b.title,
        description: b.description,
        category: b.category,
        tags: (b.tags ?? []).join(", "),
        coverImage: b.coverImage ?? "",
        content: b.content,
        readTime: b.readTime ?? "",
        isPublished: b.isPublished,
        isFeatured: b.isFeatured,
      });
      setSlugTouched(true);
    }).catch(() => toast.error("Failed to load blog"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onTitleChange(value: string) {
    update("title", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      toast.error("Title, description, and content are required");
      return;
    }

    const payload = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage: form.coverImage.trim() || null,
      content: form.content,
      readTime: form.readTime.trim() || null,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.put(`/admin/blogs/${id}`, payload);
        toast.success("Blog updated");
      } else {
        await adminApi.post("/admin/blogs", payload);
        toast.success("Blog created");
      }
      navigate("/admin/blog");
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to save blog");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-gray-400">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-5xl">
        <div className="flex items-center gap-3">
          <Link to="/admin/blog" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Post" : "New Post"}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. How to Choose the Right Fixed Deposit Tenure"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); update("slug", slugify(e.target.value)); }}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="how-to-choose-fd-tenure"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">SEO Description <span className="text-gray-400 font-normal">(under 160 chars)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              rows={2}
              maxLength={300}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Short summary shown in search results and the blog listing card"
            />
            <span className="text-xs text-gray-400 self-end">{form.description.length}/160</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Cover Image URL</label>
            <input
              type="text"
              value={form.coverImage}
              onChange={(e) => update("coverImage", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="https://images.unsplash.com/photo-xxx?w=1200&h=600&fit=crop"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Read Time</label>
            <input
              type="text"
              value={form.readTime}
              onChange={(e) => update("readTime", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. 6 min read"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="fixed deposit, tax saving, banking"
            />
          </div>
        </div>

        {form.coverImage && (
          <div className="relative w-full max-w-sm">
            <img src={form.coverImage} alt="Cover preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
            <button
              type="button"
              onClick={() => update("coverImage", "")}
              className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-gray-500 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Content (Markdown)</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${tab === "write" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <Code2 size={13} /> Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition border-l border-gray-300 ${tab === "preview" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <Eye size={13} /> Preview
              </button>
            </div>
          </div>

          {tab === "write" ? (
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              required
              rows={24}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              placeholder={"## Section Heading\n\nWrite your article in Markdown. Supports custom blocks like:\n\n<div class=\"highlight-box\">Key example or scenario</div>\n\n> 💡 **Pro Tip:** Renders as a green tip callout"}
            />
          ) : (
            <div className="border border-gray-200 rounded-lg p-6 bg-white max-h-[640px] overflow-y-auto">
              {form.content.trim() ? (
                <MarkdownRenderer content={form.content} />
              ) : (
                <p className="text-gray-400 text-sm">Nothing to preview yet — write some Markdown content first.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 py-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => update("isPublished", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => update("isFeatured", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Featured (shown at top of Money Guides)
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Post"}
          </button>
          <Link
            to="/admin/blog"
            className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
