import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import BranchCard from '../components/BranchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';

export default function IFSCResultPage() {
  const { ifsc } = useParams<{ ifsc: string }>();

  const { data: branch, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ifsc', ifsc],
    queryFn: () => api.getByIfsc(ifsc!),
    enabled: !!ifsc,
    retry: 1,
  });

  if (isLoading) {
    return <LoadingSpinner message={`Looking up ${ifsc}...`} />;
  }

  return (
    <>
      {branch && (
        <Helmet>
          <title>{`${branch.ifsc} - ${branch.bank_name} ${branch.branch_name} | RupeePedia`}</title>
          <meta
            name="description"
            content={`IFSC: ${branch.ifsc} | MICR: ${branch.micr} | ${branch.bank_name} ${branch.branch_name} Branch, ${branch.address}, ${branch.city}, ${branch.state_name}. Phone: ${branch.phone}`}
          />
        </Helmet>
      )}

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="relative z-[2]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
              <Link to="/" className="hover:text-acc transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/ifsc" className="hover:text-acc transition-colors">IFSC Finder</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-acc font-semibold">{ifsc}</span>
            </nav>

            <Link
              to="/ifsc"
              className="inline-flex items-center gap-2 text-acc hover:text-ink font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Link>
          </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Error state */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-2xl border border-line p-8 text-center"
          >
            <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-coral" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink mb-2">
              IFSC Not Found
            </h2>
            <p className="text-muted mb-2">
              The IFSC code <span className="ifsc-mono font-bold text-acc">{ifsc}</span> was not found in our database.
            </p>
            <p className="text-faint text-sm mb-6">
              This may be a newly added branch or the code might be incorrect. Please verify with your bank.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 border border-line bg-surface hover:bg-surface-2 text-ink font-semibold px-6 py-3 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                to="/ifsc"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-acc to-acc-2 text-white font-semibold px-6 py-3 rounded-xl shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all"
              >
                New Search
              </Link>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {branch && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted">
                Results for <span className="ifsc-mono font-semibold text-acc">{ifsc}</span>
              </p>
              <Link to="/ifsc" className="text-sm text-acc hover:text-ink font-medium transition-colors">
                New Search
              </Link>
            </div>

            <BranchCard branch={branch} />

            {/* Ad slot placeholder */}
            <div className="mt-6 p-4 bg-surface-2 rounded-xl border border-line text-center text-xs text-faint">
              {/* Insert Google AdSense ad unit here for monetization */}
              Advertisement
            </div>

            {/* Related info */}
            <div className="mt-6 bg-surface rounded-2xl border border-line p-5">
              <h3 className="font-semibold text-ink mb-3 text-sm">Important Note</h3>
              <p className="text-xs text-muted leading-relaxed">
                Always verify IFSC and MICR codes directly with your bank before initiating any financial transaction.
                RupeePedia provides this information for reference only and is sourced from RBI data. Data is updated
                fortnightly but branches may change without notice.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
