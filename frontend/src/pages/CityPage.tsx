import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { generateSEO } from '../utils/seo';

export default function CityPage() {
  const { bank, state, city } = useParams();

  const { data: branches = [] } = useQuery({
    queryKey: ['city-branches', bank, state, city],
    queryFn: () => api.getBranchesByCity(bank!, state!, city!),
    enabled: !!bank && !!state && !!city,
  });

  const seo = generateSEO('city', { bank, state, city });

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`https://rupeepedia.in/ifsc/${bank}/${state}/${city}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">
          {bank} IFSC Codes in {city}, {state}
        </h1>

        {/* Internal links */}
        <p className="text-sm text-gray-500 mb-4">
          <Link to={`/ifsc/${bank}`} className="text-blue-600">All {bank}</Link> →
          <Link to={`/ifsc/${bank}/${state}`} className="text-blue-600 ml-1">{state}</Link>
        </p>

        <div className="space-y-3">
          {branches.map((b: any) => (
            <Link
              key={b.ifsc}
              to={`/ifsc/${b.ifsc}`}
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <p className="font-semibold">{b.branch_name}</p>
              <p className="text-sm text-gray-500">{b.address}</p>
              <p className="text-blue-600 text-sm font-mono mt-1">{b.ifsc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}