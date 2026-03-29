import { CheckCircle2, XCircle } from 'lucide-react';

interface PaymentBadgeProps {
  label: string;
  enabled: boolean;
  description?: string;
}

function PaymentBadge({ label, enabled, description }: PaymentBadgeProps) {
  return (
    <div
      title={description}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
        enabled
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-gray-50 border-gray-200 text-gray-400'
      }`}
    >
      {enabled ? (
        <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-500" />
      ) : (
        <XCircle className="w-5 h-5 mb-1 text-gray-300" />
      )}
      <span className="text-xs font-bold tracking-wider">{label}</span>
      <span className="text-[10px] mt-0.5 font-medium">{enabled ? 'Enabled' : 'N/A'}</span>
    </div>
  );
}

interface PaymentMatrixProps {
  neft: number;
  rtgs: number;
  imps: number;
  upi: number;
}

export default function PaymentMatrix({ neft, rtgs, imps, upi }: PaymentMatrixProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Payment Modes
      </h3>
      <div className="grid grid-cols-4 gap-2">
        <PaymentBadge label="NEFT" enabled={!!neft} description="National Electronic Funds Transfer" />
        <PaymentBadge label="RTGS" enabled={!!rtgs} description="Real Time Gross Settlement" />
        <PaymentBadge label="IMPS" enabled={!!imps} description="Immediate Payment Service" />
        <PaymentBadge label="UPI" enabled={!!upi} description="Unified Payments Interface" />
      </div>
    </div>
  );
}
