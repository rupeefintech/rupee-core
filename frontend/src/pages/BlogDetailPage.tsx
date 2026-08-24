import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api, BlogDetail } from '../utils/api';
import MarkdownRenderer, { extractHeadings } from '../components/MarkdownRenderer';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react';

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Tax:            { bg: 'bg-violet/10', text: 'text-violet', border: 'border-violet/30' },
  Banking:        { bg: 'bg-acc-deep',  text: 'text-acc',    border: 'border-acc/30' },
  Investment:     { bg: 'bg-mint/10',   text: 'text-mint',   border: 'border-mint/30' },
  'Credit Cards': { bg: 'bg-gold/10',   text: 'text-gold',   border: 'border-gold/30' },
  Loans:          { bg: 'bg-coral/10',  text: 'text-coral',  border: 'border-coral/30' },
};

function getCatColor(category: string) {
  return categoryColors[category] || { bg: 'bg-surface-2', text: 'text-muted', border: 'border-line' };
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog, isLoading, error } = useQuery<BlogDetail>({
    queryKey: ['blog', slug],
    queryFn: () => api.getBlogBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="bg-bg max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-64 w-full mt-6" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-bg max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink mb-2">Article Not Found</h1>
        <p className="text-muted mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/money-guides"
          className="inline-flex items-center gap-2 bg-gradient-to-br from-acc to-acc-2 text-white font-semibold px-6 py-3 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all"
        >
          <ArrowLeft size={16} /> Back to Guides
        </Link>
      </div>
    );
  }

  const headings = extractHeadings(blog.content);
  const catColor = getCatColor(blog.category);
  const publishDate = new Date(blog.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Helmet>
        <title>{blog.title} | Rupeepedia</title>
        <meta name="description" content={blog.description} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.description} />
        {blog.coverImage && <meta property="og:image" content={blog.coverImage} />}
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://rupeepedia.in/money-guides/${slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: blog.title,
            description: blog.description,
            image: blog.coverImage,
            datePublished: blog.publishedAt,
            dateModified: blog.updatedAt,
            publisher: {
              '@type': 'Organization',
              name: 'Rupeepedia',
              url: 'https://rupeepedia.in',
            },
          })}
        </script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Money Guides', item: 'https://rupeepedia.in/money-guides' },
            { '@type': 'ListItem', position: 3, name: blog.title, item: `https://rupeepedia.in/money-guides/${slug}` },
          ],
        })}</script>
      </Helmet>

      {/* ── Hero / breadcrumb ── */}
      <header className="py-6">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-5 px-6 md:px-10">
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <nav className="flex items-center gap-1.5 text-xs text-faint font-mono">
                  <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight size={12} />
                  <Link to="/money-guides" className="hover:text-acc transition-colors">Money Guides</Link>
                  <ChevronRight size={12} />
                  <span className={`${catColor.text} font-semibold`}>{blog.category}</span>
                </nav>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-6xl mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content */}
        <article className="w-full lg:w-[72%]">
          <div className="bg-surface rounded-2xl border border-line overflow-hidden">
            {/* Cover Image */}
            {blog.coverImage && (
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-52 sm:h-72 object-cover"
              />
            )}

            <div className="p-6 md:p-8">
              {/* Category Badge */}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text} border ${catColor.border} mb-4`}>
                {blog.category}
              </span>

              {/* Title */}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink leading-tight mb-4">
                {blog.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-faint mb-8">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {publishDate}
                </span>
                {blog.readTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {blog.readTime}
                  </span>
                )}
              </div>

              {/* Markdown Content */}
              <MarkdownRenderer content={blog.content} />

              {/* Tags */}
              {blog.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-line">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-bg-2 text-muted text-xs rounded-full border border-line">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Articles */}
          {blog.related && blog.related.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold text-ink mb-5">Related Articles</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blog.related.map((r) => {
                  const rCat = getCatColor(r.category);
                  return (
                    <Link
                      key={r.slug}
                      to={`/money-guides/${r.slug}`}
                      className="bg-surface rounded-xl border border-line p-4 hover:border-acc transition-all group"
                    >
                      {r.coverImage && (
                        <img
                          src={r.coverImage}
                          alt={r.title}
                          className="w-full h-28 object-cover rounded-lg mb-3"
                        />
                      )}
                      <span className={`text-[10px] font-semibold ${rCat.text}`}>{r.category}</span>
                      <h4 className="font-semibold text-sm text-ink mt-1 line-clamp-2 group-hover:text-acc transition-colors">
                        {r.title}
                      </h4>
                      <span className="text-[11px] text-faint mt-1 block">
                        {r.readTime || '3 min read'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar — Table of Contents */}
        <aside className="hidden lg:block lg:w-[28%]">
          <div className="sticky top-24 space-y-4">
            {headings.length > 0 && (
              <div className="bg-surface rounded-2xl border border-line p-5">
                <h3 className="text-sm font-bold text-ink mb-3">In This Article</h3>
                <ul className="space-y-2">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="text-xs text-muted hover:text-acc transition-colors leading-snug block py-0.5"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Back to guides CTA */}
            <Link
              to="/money-guides"
              className="flex items-center gap-2 bg-gradient-to-br from-acc to-acc-2 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all"
            >
              <ArrowLeft size={14} />
              All Money Guides
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
