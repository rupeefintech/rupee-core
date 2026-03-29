import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { generateSEO } from '../utils/seo';

export default function BankPage() {
  const { bank } = useParams();

  const { data: states = [] } = useQuery({
    queryKey: ['bank-states', bank],
    queryFn: () => api.getStatesByBank(bank!),
    enabled: !!bank,
  });

  const seo = generateSEO('bank', { bank });

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`https://rupeepedia.in/ifsc/${bank}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">
          {bank} IFSC Codes – All States
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {states.map((s: any) => (
            <Link
              key={s.state_name}
              to={`/ifsc/${bank}/${s.state_name.toLowerCase()}`}
              className="p-3 border rounded hover:bg-gray-50"
            >
              {s.state_name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}