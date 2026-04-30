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
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
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
            <h1 className="text-2xl font-bold text-gray-900">
              {bankInfo?.name ?? bank} in {toTitleCase(city ?? '')}, {toTitleCase(state ?? '')}
            </h1>
            <p className="text-gray-500 mt-1">
              {pagination?.totalCount ?? branches.length} branches found
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/bank/${bank}`} className="hover:text-brand-600">{bankInfo?.name ?? bank}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/state/${bank}/${state}`} className="hover:text-brand-600">{toTitleCase(state ?? '')}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-medium">{toTitleCase(city ?? '')}</span>
        </nav>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No branches found</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="space-y-3">
              {branches.map((b: any) => (
                <Link
                  key={b.ifsc}
                  to={`/ifsc/${b.ifsc}`}
                  className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{b.branchName}</p>
                      <p className="text-sm text-gray-500 mt-1">{b.address}</p>
                    </div>
                    <span className="text-brand-600 text-sm font-mono bg-brand-50 px-2 py-1 rounded flex-shrink-0">
                      {b.ifsc}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  {/* Left: First + Previous */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={!pagination.hasPrev}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:border-brand-300 hover:text-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      title="First page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={!pagination.hasPrev}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:border-brand-300 hover:text-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                  </div>

                  {/* Center: Page info + Go to page */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.totalPages}</span>
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
                        className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:border-brand-400"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 text-sm font-medium rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
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
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:border-brand-300 hover:text-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setPage(pagination.totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={!pagination.hasNext}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:border-brand-300 hover:text-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
    </>
  );
}
