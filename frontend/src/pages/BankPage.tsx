import { useParams, Link, Navigate } from 'react-router-dom';
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

  // Legacy URL scheme was /bank/<slug>-<bankId> — retry without the numeric suffix
  if (error && bank && /-\d+$/.test(bank)) {
    return <Navigate to={`/bank/${bank.replace(/-\d+$/, '')}`} replace />;
  }

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`https://rupeepedia.in/bank/${bank}`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'IFSC Finder', item: 'https://rupeepedia.in/ifsc-finder' },
            { '@type': 'ListItem', position: 3, name: bankInfo?.name ?? bank, item: `https://rupeepedia.in/bank/${bank}` },
          ],
        })}</script>
        {bankInfo && states.length > 0 && (
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `How many branches does ${bankInfo.name} have in India?`,
                acceptedAnswer: { '@type': 'Answer', text: `${bankInfo.name} has ${states.reduce((sum, s) => sum + s.branchCount, 0).toLocaleString('en-IN')} branches across ${states.length} states in India.` },
              },
              {
                '@type': 'Question',
                name: `In which states does ${bankInfo.name} have branches?`,
                acceptedAnswer: { '@type': 'Answer', text: `${bankInfo.name} has branches in: ${states.map(s => s.name).join(', ')}.` },
              },
              {
                '@type': 'Question',
                name: `How do I find the IFSC code for a ${bankInfo.name} branch?`,
                acceptedAnswer: { '@type': 'Answer', text: `Select your state on this page, then your city, then the branch. The 11-character IFSC code is shown with MICR code and NEFT/RTGS/IMPS/UPI support status.` },
              },
              {
                '@type': 'Question',
                name: `Are all ${bankInfo.name} IFSC codes the same?`,
                acceptedAnswer: { '@type': 'Answer', text: `No. Each ${bankInfo.name} branch has a unique IFSC code. The first 4 characters identify the bank, the 5th is always 0 (reserved by RBI), and the last 6 characters are unique to the branch.` },
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
                    <h1 className="font-display text-2xl font-bold text-ink">
                      {bankInfo?.name ?? bank} IFSC Codes
                    </h1>
                    <p className="text-muted mt-1">
                      Select a state to find branches
                    </p>
                  </div>
                </div>

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm text-faint font-mono">
                  <Link to="/" className="hover:text-acc">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-muted font-medium">{bankInfo?.name ?? bank}</span>
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
              <p className="text-muted">Bank not found</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <p className="text-sm text-muted mb-4">
                Available in <span className="font-semibold text-body">{states.length}</span> states
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {states.map((s) => (
                  <Link
                    key={s.id}
                    to={`/state/${bank}/${s.name.toLowerCase()}`}
                    className="group flex items-center gap-3 p-4 bg-surface border border-line rounded-xl hover:border-acc hover:bg-surface-2 transition-all"
                  >
                    {s.logo_url ? (
                      <img
                        src={s.logo_url}
                        alt={s.name}
                        className="w-10 h-10 object-contain rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-acc-deep rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-acc" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-ink text-sm truncate group-hover:text-acc">
                        {s.name}
                      </p>
                      <p className="text-xs text-faint">
                        {s.branchCount} branches
                      </p>
                    </div>
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
