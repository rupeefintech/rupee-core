import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
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
          <title>{`${branch.ifsc} - ${branch.bank_name} ${branch.branch_name} | BankInfoHub`}</title>
          <meta
            name="description"
            content={`IFSC: ${branch.ifsc} | MICR: ${branch.micr} | ${branch.bank_name} ${branch.branch_name} Branch, ${branch.address}, ${branch.city}, ${branch.state_name}. Phone: ${branch.phone}`}
          />
        </Helmet>
      )}

      <div className="hero-bg min-h-screen py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back button */}
          <Link
            to="/ifsc"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>

          {/* Error state */}
          {isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="font-display text-2xl font-bold text-brand-900 mb-2">
                IFSC Not Found
              </h2>
              <p className="text-gray-500 mb-2">
                The IFSC code <span className="ifsc-mono font-bold text-brand-700">{ifsc}</span> was not found in our database.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                This may be a newly added branch or the code might be incorrect. Please verify with your bank.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => refetch()}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <Link to="/ifsc" className="btn-primary">
                  New Search
                </Link>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {branch && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Results for <span className="ifsc-mono font-semibold text-brand-700">{ifsc}</span>
                </p>
                <Link to="/ifsc" className="text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors">
                  New Search
                </Link>
              </div>

              <BranchCard branch={branch} />

              {/* Ad slot placeholder */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-400">
                {/* Insert Google AdSense ad unit here for monetization */}
                Advertisement
              </div>

              {/* Related info */}
              <div className="mt-6 card p-5">
                <h3 className="font-semibold text-brand-900 mb-3 text-sm">Important Note</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Always verify IFSC and MICR codes directly with your bank before initiating any financial transaction.
                  BankInfoHub provides this information for reference only and is sourced from RBI data. Data is updated
                  fortnightly but branches may change without notice.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
