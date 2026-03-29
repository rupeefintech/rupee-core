import { motion } from 'framer-motion';
import { Copy, MapPin, Phone, Mail, Building, ExternalLink, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BranchDetail } from '../utils/api';
import PaymentMatrix from './PaymentMatrix';

interface BranchCardProps {
  branch: BranchDetail;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied!`, { duration: 2000 });
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
      title={`Copy ${label}`}
    >
      <Copy className="w-4 h-4" />
    </button>
  );
}

export default function BranchCard({ branch }: BranchCardProps) {
  const bankTypeLabels: Record<string, string> = {
    public: 'Public Sector Bank',
    private: 'Private Sector Bank',
    cooperative: 'Cooperative Bank',
    rrb: 'Regional Rural Bank',
    foreign: 'Foreign Bank',
    small_finance: 'Small Finance Bank',
    payments: 'Payments Bank',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl shadow-lg border border-blue-50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-800 to-brand-700 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-medium">
                {bankTypeLabels[branch.bank_type] || branch.bank_type}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold">{branch.bank_name}</h2>
            <p className="text-blue-200 mt-1">{branch.branch_name} Branch</p>
          </div>
          {branch.bank_website && (
            <a
              href={branch.bank_website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-200 hover:text-white transition-colors whitespace-nowrap"
            >
              Official Site <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Core codes section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
        {/* IFSC */}
        <div className="bg-white p-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            IFSC Code
          </label>
          <div className="flex items-center gap-2">
            <span className="ifsc-mono text-2xl font-bold text-brand-800 tracking-widest">
              {branch.ifsc}
            </span>
            <CopyButton value={branch.ifsc} label="IFSC" />
          </div>
        </div>

        {/* MICR */}
        <div className="bg-white p-5 border-l border-gray-100">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            MICR Code
          </label>
          <div className="flex items-center gap-2">
            <span className="ifsc-mono text-2xl font-bold text-brand-800 tracking-widest">
              {branch.micr || '—'}
            </span>
            {branch.micr && <CopyButton value={branch.micr} label="MICR" />}
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="p-6 space-y-5">
        {/* Address */}
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4.5 h-4.5 text-brand-600" style={{ width: '18px', height: '18px' }} />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</label>
            <p className="text-brand-900 font-medium mt-0.5 leading-relaxed">{branch.address}</p>
            <p className="text-gray-500 text-sm">
              {[branch.city, branch.district_name, branch.state_name].filter(Boolean).join(', ')}
              {branch.pincode && ` — ${branch.pincode}`}
            </p>
          </div>
        </div>

        {/* Phone */}
        {branch.phone && (
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label>
              <div className="flex items-center gap-2 mt-0.5">
                <a href={`tel:${branch.phone}`} className="text-brand-700 font-medium hover:underline">
                  {branch.phone}
                </a>
                <CopyButton value={branch.phone} label="Phone" />
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        {branch.email && (
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
              <a href={`mailto:${branch.email}`} className="text-brand-700 font-medium hover:underline mt-0.5 block">
                {branch.email}
              </a>
            </div>
          </div>
        )}

        {/* SWIFT */}
        {branch.swift && (
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SWIFT Code</label>
              <span className="ifsc-mono text-brand-800 font-bold mt-0.5 block">{branch.swift}</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-5">
          <PaymentMatrix neft={branch.neft} rtgs={branch.rtgs} imps={branch.imps} upi={branch.upi} />
        </div>

        {/* Maps link */}
        <a
          href={branch.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-brand-200 text-brand-700 font-semibold hover:bg-brand-50 transition-all hover:border-brand-400 text-sm"
        >
          <MapPin className="w-4 h-4" />
          View on Google Maps
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
      </div>
    </motion.div>
  );
}
