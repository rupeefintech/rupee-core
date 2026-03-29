import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { generateSEO } from '../utils/seo';

export default function StatePage() {
  const { bank, state } = useParams();

  const { data: cities = [] } = useQuery({
    queryKey: ['state-cities', bank, state],
    queryFn: () => api.getCities(bank!, state!),
    enabled: !!bank && !!state,
  });

  const seo = generateSEO('state', { bank, state });

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`https://rupeepedia.in/ifsc/${bank}/${state}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">
          {bank} IFSC Codes in {state}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cities.map((c: any) => (
            <Link
              key={c.city}
              to={`/ifsc/${bank}/${state}/${c.city.toLowerCase()}`}
              className="p-3 border rounded hover:bg-gray-50"
            >
              {c.city}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}