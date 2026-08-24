import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api, BlogSummary } from '../utils/api';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, Clock, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const categories = ['All', 'Banking', 'PIN & Postal', 'Gold & Silver', 'Tax', 'NRI Tax', 'Investment', 'Credit Cards', 'Loans'];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Tax:             { bg: 'bg-violet/10', text: 'text-violet', border: 'border-violet/30' },
  'NRI Tax':       { bg: 'bg-cyan/10',   text: 'text-cyan',   border: 'border-cyan/30' },
  Banking:         { bg: 'bg-acc-deep',  text: 'text-acc',    border: 'border-acc/30' },
  'PIN & Postal':  { bg: 'bg-acc-deep',  text: 'text-acc',    border: 'border-acc/30' },
  'Gold & Silver': { bg: 'bg-gold/10',   text: 'text-gold',   border: 'border-gold/30' },
  Investment:      { bg: 'bg-mint/10',   text: 'text-mint',   border: 'border-mint/30' },
  'Credit Cards':  { bg: 'bg-gold/10',   text: 'text-gold',   border: 'border-gold/30' },
  Loans:           { bg: 'bg-coral/10',  text: 'text-coral',  border: 'border-coral/30' },
};
const DEFAULT_CAT_COLOR = { bg: 'bg-surface-2', text: 'text-muted', border: 'border-line' };

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
        <title>Guides - Banking, PIN Codes, Gold, Tax & Financial Tips | Rupeepedia</title>
        <meta name="description" content="Expert guides on IFSC & banking, PIN codes & India Post, live gold & silver rates, income tax, NRI banking, credit cards, and investments. Simple, actionable advice for every Indian." />
        <link rel="canonical" href="https://rupeepedia.in/money-guides" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Money Guides', item: 'https://rupeepedia.in/money-guides' },
          ],
        })}</script>
      </Helmet>

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-acc-deep flex items-center justify-center">
                    <BookOpen size={20} className="text-acc" />
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">Guides</h1>
                </div>
                <p className="text-body max-w-xl text-sm sm:text-base">
                  Expert guides on banking, PIN codes &amp; India Post, live gold &amp; silver rates, income tax,
                  NRI banking, and investments. Simple, actionable advice for every Indian.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mt-6 max-w-md">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                    <input
                      type="text"
                      placeholder="Search all guides..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-2 border border-line-2 rounded-xl text-sm text-ink placeholder-faint focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc transition-all"
                    />
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-bg max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-br from-acc to-acc-2 text-white shadow-acc-glow'
                  : 'bg-surface text-body hover:bg-surface-2 border border-line'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="bg-bg max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-line overflow-hidden">
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
            <BookOpen size={40} className="mx-auto text-faint mb-4" />
            <h2 className="text-lg font-semibold text-ink mb-1">No guides found</h2>
            <p className="text-sm text-muted">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : 'Check back soon for new guides.'}
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
              className="p-2 rounded-lg hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} className="text-body" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-faint">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? 'bg-gradient-to-br from-acc to-acc-2 text-white shadow-acc-glow'
                        : 'text-body hover:bg-surface-2'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} className="text-body" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function FeaturedCard({ blog }: { blog: BlogSummary }) {
  const catColor = categoryColors[blog.category] || DEFAULT_CAT_COLOR;

  return (
    <Link
      to={`/money-guides/${blog.slug}`}
      className="block bg-surface rounded-2xl border border-line overflow-hidden hover:border-acc transition-all group"
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
          <h2 className="text-xl sm:text-2xl font-bold text-ink mb-3 group-hover:text-acc transition-colors leading-tight">
            {blog.title}
          </h2>
          <p className="text-sm text-muted mb-4 line-clamp-3">
            {blog.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-faint">
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
  const catColor = categoryColors[blog.category] || DEFAULT_CAT_COLOR;

  return (
    <Link
      to={`/money-guides/${blog.slug}`}
      className="bg-surface rounded-2xl border border-line overflow-hidden hover:border-acc transition-all group flex flex-col"
    >
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-5 flex-1 flex flex-col">
        <span className={`inline-block text-[10px] font-bold ${catColor.text} ${catColor.bg} px-2 py-0.5 rounded-full w-fit mb-2 border ${catColor.border}`}>
          {blog.category}
        </span>
        <h3 className="font-semibold text-ink group-hover:text-acc transition-colors mb-2 line-clamp-2 leading-snug">
          {blog.title}
        </h3>
        <p className="text-xs text-faint line-clamp-2 mb-3 flex-1">
          {blog.description}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-faint">
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
