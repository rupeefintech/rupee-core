import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { generateSEO } from '../utils/seo';
import { Building2, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';

function toTitleCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function CityPage() {
  const { bank, state, city } = useParams();
  const [page, setPage] = useState(1);
  const [goToPage, setGoToPage] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['city-branches', bank, state, city, page],
    queryFn: () => api.getBranchesByCity(bank!, state!, city!, page),
    enabled: !!bank && !!state && !!city,
  });

  const seo = generateSEO('city', { bank, state, city });

  const bankInfo = data?.bank;
  const branches = data?.branches ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`https://rupeepedia.in/city/${bank}/${state}/${city}`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: 'https://rupeepedia.in/ifsc-finder' },
            { '@type': 'ListItem', position: 3, name: bankInfo?.name ?? bank,              item: `https://rupeepedia.in/bank/${bank}` },
            { '@type': 'ListItem', position: 4, name: toTitleCase(state ?? ''),            item: `https://rupeepedia.in/state/${bank}/${state}` },
            { '@type': 'ListItem', position: 5, name: toTitleCase(city ?? ''),             item: `https://rupeepedia.in/city/${bank}/${state}/${city}` },
          ],
        })}</script>
        {bankInfo && branches.length > 0 && (
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `How many ${bankInfo.name} branches are there in ${toTitleCase(city ?? '')}?`,
                acceptedAnswer: { '@type': 'Answer', text: `There are ${pagination?.totalCount ?? branches.length} ${bankInfo.name} branches in ${toTitleCase(city ?? '')}, ${toTitleCase(state ?? '')}.` },
              },
              {
                '@type': 'Question',
                name: `How do I find the IFSC code for a ${bankInfo.name} branch in ${toTitleCase(city ?? '')}?`,
                acceptedAnswer: { '@type': 'Answer', text: `Click on any branch in the list below to see its full IFSC code, MICR code, address, and supported payment modes (NEFT, RTGS, IMPS, UPI).` },
              },
              {
                '@type': 'Question',
                name: `What is the IFSC code for ${bankInfo.name} ${toTitleCase(city ?? '')}?`,
                acceptedAnswer: { '@type': 'Answer', text: `${bankInfo.name} has ${pagination?.totalCount ?? branches.length} branches in ${toTitleCase(city ?? '')}. Each branch has a unique IFSC code — click a branch below to view its specific code.` },
              },
            ],
          })}</script>
        )}
      </Helmet>

      <div className="bg-bg min-h-screen">
        <header className="py-8 md:py-10">
          <div className="max-w-5xl mx-auto px-4">
            <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 px-6 md:px-10">
              <div className="relative z-[2]">
                {/* Header with bank logo */}
                <div className="flex items-center gap-4 mb-6">
                  {bankInfo?.logo_url && (
                    <img
                      src={bankInfo.logo_url}
                      alt={bankInfo.name}
                      className="w-14 h-14 object-contain"
                    />
                  )}
                  <div>
                    <h1 className="font-display text-2xl font-bold text-ink">
                      {bankInfo?.name ?? bank} in {toTitleCase(city ?? '')}, {toTitleCase(state ?? '')}
                    </h1>
                    <p className="text-muted mt-1">
                      {pagination?.totalCount ?? branches.length} branches found
                    </p>
                  </div>
                </div>

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm text-faint font-mono">
                  <Link to="/" className="hover:text-acc">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to={`/bank/${bank}`} className="hover:text-acc">{bankInfo?.name ?? bank}</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to={`/state/${bank}/${state}`} className="hover:text-acc">{toTitleCase(state ?? '')}</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-muted font-medium">{toTitleCase(city ?? '')}</span>
                </nav>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 pb-10">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acc" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-faint mx-auto mb-3" />
              <p className="text-muted">No branches found</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="space-y-3">
                {branches.map((b: any) => (
                  <Link
                    key={b.ifsc}
                    to={`/ifsc/${b.ifsc}`}
                    className="block p-4 bg-surface border border-line rounded-xl hover:border-acc hover:bg-surface-2 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-ink">{b.branchName}</p>
                        <p className="text-sm text-muted mt-1">{b.address}</p>
                      </div>
                      <span className="text-acc text-sm font-mono bg-acc-deep px-2 py-1 rounded flex-shrink-0">
                        {b.ifsc}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-line">
                  <div className="flex items-center justify-between">
                    {/* Left: First + Previous */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={!pagination.hasPrev}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-line hover:border-acc hover:text-acc transition-all disabled:opacity-40 disabled:cursor-not-allowed text-body"
                        title="First page"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={!pagination.hasPrev}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-line hover:border-acc hover:text-acc transition-all disabled:opacity-40 disabled:cursor-not-allowed text-body"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                    </div>

                    {/* Center: Page info + Go to page */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted">
                        Page <span className="font-semibold text-body">{pagination.page}</span> of <span className="font-semibold text-body">{pagination.totalPages}</span>
                      </span>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const p = parseInt(goToPage);
                          if (p >= 1 && p <= pagination.totalPages) {
                            setPage(p);
                            setGoToPage('');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="hidden sm:flex items-center gap-1.5"
                      >
                        <input
                          type="number"
                          min={1}
                          max={pagination.totalPages}
                          value={goToPage}
                          onChange={(e) => setGoToPage(e.target.value)}
                          placeholder="Go to"
                          className="w-16 px-2 py-1.5 text-sm bg-bg-2 border border-line-2 rounded-lg text-center text-ink focus:outline-none focus:border-acc"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1.5 text-sm font-medium rounded-lg bg-acc-deep text-acc hover:bg-acc/20 transition-colors"
                        >
                          Go
                        </button>
                      </form>
                    </div>

                    {/* Right: Next + Last */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={!pagination.hasNext}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-line hover:border-acc hover:text-acc transition-all disabled:opacity-40 disabled:cursor-not-allowed text-body"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setPage(pagination.totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={!pagination.hasNext}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-line hover:border-acc hover:text-acc transition-all disabled:opacity-40 disabled:cursor-not-allowed text-body"
                        title="Last page"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
