import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { generateSEO } from '../utils/seo';
import { Building2, ChevronRight } from 'lucide-react';

function toTitleCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function StatePage() {
  const { bank, state } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['state-cities', bank, state],
    queryFn: () => api.getCities(bank!, state!),
    enabled: !!bank && !!state,
  });

  const seo = generateSEO('state', { bank, state });

  const bankInfo = data?.bank;
  const stateInfo = data?.state;
  const cities = data?.cities ?? [];

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`https://rupeepedia.in/state/${bank}/${state}`} />
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
              {bankInfo?.name ?? bank} in {stateInfo?.name ?? toTitleCase(state ?? '')}
            </h1>
            <p className="text-gray-500 mt-1">
              Select a city to find branches
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/bank/${bank}`} className="hover:text-brand-600">{bankInfo?.name ?? bank}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-medium">{stateInfo?.name ?? toTitleCase(state ?? '')}</span>
        </nav>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No data found</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">{cities.length}</span> cities found
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {cities.map((c) => (
                <Link
                  key={c.city}
                  to={`/city/${bank}/${state}/${c.city.toLowerCase()}`}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all"
                >
                  <p className="font-medium text-gray-900 text-sm hover:text-brand-700">
                    {toTitleCase(c.city)}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
