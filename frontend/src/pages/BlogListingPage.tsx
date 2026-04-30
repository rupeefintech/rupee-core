import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, BlogSummary } from '../utils/api';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, Clock, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const categories = ['All', 'Tax', 'Banking', 'Investment', 'Credit Cards', 'Loans'];

const categoryColors: Record<string, { bg: string; text: string }> = {
  Tax:            { bg: 'bg-purple-50', text: 'text-purple-700' },
  Banking:        { bg: 'bg-brand-50',   text: 'text-brand-700' },
  Investment:     { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Credit Cards': { bg: 'bg-amber-50',  text: 'text-amber-700' },
  Loans:          { bg: 'bg-rose-50',   text: 'text-rose-700' },
};

export default function BlogListingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', activeCategory, searchQuery, page],
    queryFn: () =>
      api.getBlogs({
        page,
        limit: 12,
        category: activeCategory === 'All' ? undefined : activeCategory,
        search: searchQuery || undefined,
      }),
  });

  const blogs = data?.blogs || [];
  const totalPages = data?.totalPages || 1;

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  return (
    <>
      <Helmet>
        <title>Money Guides - Banking, Tax & Financial Tips | Rupeepedia</title>
        <meta name="description" content="Expert financial guides on income tax, banking, credit cards, investments, and loans. Simple, actionable advice for every Indian." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 sm:py-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen size={20} className="text-gold-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">Money Guides</h1>
            </div>
            <p className="text-white/60 max-w-xl text-sm sm:text-base">
              Expert financial guides on income tax, banking, credit cards, investments, and loans.
              Simple, actionable advice for every Indian.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-6 max-w-md">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-700 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="skeleton h-40 rounded-none" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-3 w-16" />
                    <div className="skeleton h-5 w-full" />
                    <div className="skeleton h-3 w-3/4" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-600 mb-1">No guides found</h2>
              <p className="text-sm text-gray-400">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search.`
                  : 'Check back soon for new financial guides.'}
              </p>
            </div>
          ) : (
            <>
              {/* Featured blog (first item, if featured) */}
              {page === 1 && blogs[0]?.isFeatured && (
                <FeaturedCard blog={blogs[0]} />
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {blogs
                  .slice(page === 1 && blogs[0]?.isFeatured ? 1 : 0)
                  .map((blog) => (
                    <BlogCard key={blog.slug} blog={blog} />
                  ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-gray-300">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        page === p
                          ? 'bg-brand-700 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FeaturedCard({ blog }: { blog: BlogSummary }) {
  const catColor = categoryColors[blog.category] || { bg: 'bg-gray-50', text: 'text-gray-700' };

  return (
    <Link
      to={`/money-guides/${blog.slug}`}
      className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group"
    >
      <div className="flex flex-col md:flex-row">
        {blog.coverImage && (
          <div className="md:w-1/2">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-52 md:h-full object-cover"
            />
          </div>
        )}
        <div className={`p-6 md:p-8 flex flex-col justify-center ${blog.coverImage ? 'md:w-1/2' : 'w-full'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${catColor.text} mb-2`}>
            Featured
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-900 mb-3 group-hover:text-brand-700 transition leading-tight">
            {blog.title}
          </h2>
          <p className="text-sm text-gray-500 mb-4 line-clamp-3">
            {blog.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
            {blog.readTime && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {blog.readTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ blog }: { blog: BlogSummary }) {
  const catColor = categoryColors[blog.category] || { bg: 'bg-gray-50', text: 'text-gray-700' };

  return (
    <Link
      to={`/money-guides/${blog.slug}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col"
    >
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-5 flex-1 flex flex-col">
        <span className={`inline-block text-[10px] font-bold ${catColor.text} ${catColor.bg} px-2 py-0.5 rounded-full w-fit mb-2`}>
          {blog.category}
        </span>
        <h3 className="font-semibold text-gray-800 group-hover:text-brand-600 transition mb-2 line-clamp-2 leading-snug">
          {blog.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">
          {blog.description}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
          {blog.readTime && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {blog.readTime}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
