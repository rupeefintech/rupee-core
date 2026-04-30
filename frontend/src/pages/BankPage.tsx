import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { generateSEO } from '../utils/seo';
import { Building2, MapPin, ChevronRight } from 'lucide-react';

export default function BankPage() {
  const { bank } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['bank-states', bank],
    queryFn: () => api.getStatesByBank(bank!),
    enabled: !!bank,
  });

  const seo = generateSEO('bank', { bank });

  const bankInfo = data?.bank;
  const states = data?.states ?? [];

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`https://rupeepedia.in/bank/${bank}`} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Bank Header */}
        <div className="flex items-center gap-4 mb-8">
          {bankInfo?.logo_url && (
            <img
              src={bankInfo.logo_url}
              alt={bankInfo.name}
              className="w-16 h-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {bankInfo?.name ?? bank} IFSC Codes
            </h1>
            <p className="text-gray-500 mt-1">
              Select a state to find branches
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-medium">{bankInfo?.name ?? bank}</span>
        </nav>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Bank not found</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Available in <span className="font-semibold">{states.length}</span> states
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {states.map((s) => (
                <Link
                  key={s.id}
                  to={`/state/${bank}/${s.name.toLowerCase()}`}
                  className="group flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all"
                >
                  {s.logo_url ? (
                    <img
                      src={s.logo_url}
                      alt={s.name}
                      className="w-10 h-10 object-contain rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-brand-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate group-hover:text-brand-700">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {s.branchCount} branches
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
