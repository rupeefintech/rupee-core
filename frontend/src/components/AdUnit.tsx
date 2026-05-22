import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
}

declare global {
  interface Window { adsbygoogle: any[] }
}

// Set VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX in .env when publisher ID is ready
const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string) ?? '';

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || ADSENSE_CLIENT.includes('XXXX') || pushed.current) return;
    try {
      pushed.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  // Don't render anything until publisher ID is configured
  if (!ADSENSE_CLIENT || ADSENSE_CLIENT.includes('XXXX')) return null;

  return (
    <div className={`overflow-hidden text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Ad slot IDs — replace with real slot IDs from AdSense dashboard
export const AD_SLOTS = {
  IFSC_TOP:    '0000000001',  // After IFSC hero
  IFSC_MID:    '0000000002',  // Between info and branches
  PIN_TOP:     '0000000003',  // After PIN hero
  PIN_MID:     '0000000004',  // Between post offices and banks
} as const;
