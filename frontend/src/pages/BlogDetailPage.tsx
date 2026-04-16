import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, BlogDetail } from '../utils/api';
import MarkdownRenderer, { extractHeadings } from '../components/MarkdownRenderer';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react';

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Tax:            { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Banking:        { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  Investment:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Credit Cards': { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  Loans:          { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200' },
};

function getCatColor(category: string) {
  return categoryColors[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
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
      <div className="max-w-4xl mx-auto px-4 py-12">
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h1>
        <p className="text-gray-500 mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/money-guides" className="btn-primary inline-flex items-center gap-2">
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
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link to="/" className="hover:text-gray-600 transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/money-guides" className="hover:text-gray-600 transition">Money Guides</Link>
            <ChevronRight size={12} />
            <span className={`${catColor.text} font-medium`}>{blog.category}</span>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content */}
          <article className="w-full lg:w-[72%]">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
                <h1 className="text-2xl md:text-3xl font-bold text-brand-900 leading-tight mb-4">
                  {blog.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
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
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-100">
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
                <h3 className="text-xl font-bold text-brand-900 mb-5">Related Articles</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blog.related.map((r) => {
                    const rCat = getCatColor(r.category);
                    return (
                      <Link
                        key={r.slug}
                        to={`/money-guides/${r.slug}`}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition group"
                      >
                        {r.coverImage && (
                          <img
                            src={r.coverImage}
                            alt={r.title}
                            className="w-full h-28 object-cover rounded-lg mb-3"
                          />
                        )}
                        <span className={`text-[10px] font-semibold ${rCat.text}`}>{r.category}</span>
                        <h4 className="font-semibold text-sm text-gray-800 mt-1 line-clamp-2 group-hover:text-blue-600 transition">
                          {r.title}
                        </h4>
                        <span className="text-[11px] text-gray-400 mt-1 block">
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
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-bold text-brand-900 mb-3">In This Article</h3>
                  <ul className="space-y-2">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className="text-xs text-gray-500 hover:text-blue-600 transition leading-snug block py-0.5"
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
                className="flex items-center gap-2 bg-gradient-to-r from-brand-700 to-brand-800 text-white text-xs font-semibold px-4 py-3 rounded-xl hover:from-brand-800 hover:to-brand-900 transition"
              >
                <ArrowLeft size={14} />
                All Money Guides
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
