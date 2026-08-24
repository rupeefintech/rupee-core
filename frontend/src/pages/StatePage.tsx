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
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: 'https://rupeepedia.in/ifsc-finder' },
            { '@type': 'ListItem', position: 3, name: bankInfo?.name ?? bank,              item: `https://rupeepedia.in/bank/${bank}` },
            { '@type': 'ListItem', position: 4, name: stateInfo?.name ?? toTitleCase(state ?? ''), item: `https://rupeepedia.in/state/${bank}/${state}` },
          ],
        })}</script>
        {bankInfo && stateInfo && cities.length > 0 && (
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `How many cities does ${bankInfo.name} have branches in ${stateInfo.name}?`,
                acceptedAnswer: { '@type': 'Answer', text: `${bankInfo.name} has branches in ${cities.length} cities in ${stateInfo.name}.` },
              },
              {
                '@type': 'Question',
                name: `How do I find ${bankInfo.name} IFSC codes in ${stateInfo.name}?`,
                acceptedAnswer: { '@type': 'Answer', text: `Select a city from this page to see all ${bankInfo.name} branches in that city. Each branch listing shows the full IFSC code, MICR code, and address.` },
              },
              {
                '@type': 'Question',
                name: `Which cities in ${stateInfo.name} have ${bankInfo.name} branches?`,
                acceptedAnswer: { '@type': 'Answer', text: `${bankInfo.name} has branches in these cities in ${stateInfo.name}: ${cities.slice(0, 20).map(c => toTitleCase(c.city)).join(', ')}${cities.length > 20 ? `, and ${cities.length - 20} more` : ''}.` },
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
                      {bankInfo?.name ?? bank} in {stateInfo?.name ?? toTitleCase(state ?? '')}
                    </h1>
                    <p className="text-muted mt-1">
                      Select a city to find branches
                    </p>
                  </div>
                </div>

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm text-faint font-mono">
                  <Link to="/" className="hover:text-acc">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to={`/bank/${bank}`} className="hover:text-acc">{bankInfo?.name ?? bank}</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-muted font-medium">{stateInfo?.name ?? toTitleCase(state ?? '')}</span>
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
              <p className="text-muted">No data found</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <p className="text-sm text-muted mb-4">
                <span className="font-semibold text-body">{cities.length}</span> cities found
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {cities.map((c) => (
                  <Link
                    key={c.city}
                    to={`/city/${bank}/${state}/${c.city.toLowerCase()}`}
                    className="p-4 bg-surface border border-line rounded-xl hover:border-acc hover:bg-surface-2 transition-all"
                  >
                    <p className="font-medium text-ink text-sm hover:text-acc">
                      {toTitleCase(c.city)}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
