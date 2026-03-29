import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Building2, MapPin, Zap, Shield, RefreshCw, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const POPULAR_BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'Canara', 'Kotak', 'BOB'];

export default function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    staleTime: 0,
    refetchOnMount: true,
  });

  return (
    <>
      <Helmet>
        <title>RupeePedia - IFSC Code Finder | Find Indian Bank Branch Details</title>
        <meta name="description" content="Instantly find IFSC codes, MICR codes, and branch details for all Indian banks. Search SBI, HDFC, ICICI, Axis Bank and more. Free, fast, and accurate." />
      </Helmet>

      {/* Hero */}
      <section className="hero-bg py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-200">
              <Shield className="w-3.5 h-3.5" />
              RBI Verified Data · Updated Fortnightly
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-brand-900 mb-6 leading-tight">
              India's Fastest<br />
              <span className="text-brand-600">IFSC Code Finder</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Find IFSC codes, MICR codes, branch addresses, and payment mode availability
              for every bank branch across India — instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/ifsc" className="btn-primary flex items-center justify-center gap-2 text-base">
                <Search className="w-5 h-5" />
                Find IFSC Code
              </Link>
              <Link to="/ifsc" className="btn-secondary flex items-center justify-center gap-2 text-base">
                Search by Bank
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      {stats && (
        <section className="bg-brand-800 py-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Bank Branches', value: stats.total_branches.toLocaleString('en-IN') },
                { label: 'Banks Covered', value: stats.total_banks.toString() },
                { label: 'States & UTs', value: stats.total_states.toString() },
                { label: 'UPI Enabled', value: stats.upi_enabled.toLocaleString('en-IN') },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                  <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-brand-900 mb-3">
            Everything You Need
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A comprehensive banking data platform built for reliability and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Search className="w-6 h-6 text-brand-600" />,
              title: 'Multi-Mode Search',
              desc: 'Find by bank + state + district + branch, or directly enter an IFSC code. Both modes are lightning fast.',
            },
            {
              icon: <Zap className="w-6 h-6 text-brand-600" />,
              title: 'Payment Status Matrix',
              desc: 'Instantly see if a branch supports NEFT, RTGS, IMPS, and UPI — critical for wire transfers.',
            },
            {
              icon: <MapPin className="w-6 h-6 text-brand-600" />,
              title: 'Branch Directions',
              desc: 'Dynamic Google Maps integration for every branch — get directions in one click.',
            },
            {
              icon: <Building2 className="w-6 h-6 text-brand-600" />,
              title: 'Complete Branch Details',
              desc: 'Full address, MICR code, phone numbers, SWIFT codes, and more in one rich card.',
            },
            {
              icon: <Shield className="w-6 h-6 text-brand-600" />,
              title: 'RBI-Sourced Data',
              desc: 'All data is sourced from official RBI publications. Automated sync runs fortnightly.',
            },
            {
              icon: <RefreshCw className="w-6 h-6 text-brand-600" />,
              title: 'Always Current',
              desc: 'Our data is refreshed automatically every two weeks so you always get the most current branch information.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              className="card p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-brand-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular banks quick search */}
      <section className="bg-brand-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-2xl font-bold text-brand-900 mb-2">
            Popular Bank Searches
          </h2>
          <p className="text-gray-500 text-sm mb-8">Quick access to the most searched banks</p>
          <div className="flex flex-wrap justify-center gap-3">
            {POPULAR_BANKS.map((bank) => (
              <Link
                key={bank}
                to="/ifsc"
                className="bg-white border-2 border-brand-100 hover:border-brand-300 text-brand-800 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-sm"
              >
                {bank} IFSC
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
          What is an IFSC Code?
        </h2>
        <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed space-y-4 text-sm">
          <p>
            The <strong>Indian Financial System Code (IFSC)</strong> is an 11-character alphanumeric code
            assigned by the Reserve Bank of India (RBI) to every bank branch participating in
            electronic payment systems like NEFT, RTGS, and IMPS.
          </p>
          <p>
            The first 4 characters identify the bank, the 5th character is always '0' (reserved),
            and the last 6 characters identify the specific branch. For example, in <code>SBIN0001234</code>,
            SBIN is State Bank of India and 001234 is the branch code.
          </p>
          <p>
            IFSC codes are mandatory for <strong>NEFT</strong> (National Electronic Funds Transfer),
            <strong>RTGS</strong> (Real Time Gross Settlement), and <strong>IMPS</strong> (Immediate Payment Service)
            transactions. Always verify the IFSC code with your bank passbook or cheque before initiating a transfer.
          </p>
        </div>
      </section>
    </>
  );
}
