import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

function inr(n: number | undefined): string {
  if (n == null) return '···';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function LiveRatesBar() {
  const { data } = useQuery({
    queryKey: ['commodity-prices'],
    queryFn: () => api.getCommodityPrices(),
    staleTime: 25 * 60 * 1000,
    retry: 2,
  });

  const stats = [
    { label: 'Gold 24K', value: data ? `${inr(data.gold.price_24k_per_gram)}/g` : null, to: '/gold-rate-today', cls: 'text-gold' },
    { label: 'Silver', value: data ? `${inr(data.silver.price_per_kg)}/kg` : null, to: '/gold-rate-today', cls: 'text-body' },
    { label: 'USD/INR', value: data ? `₹${data.usd_inr.toFixed(2)}` : null, to: '/currency-converter', cls: 'text-cyan' },
  ];

  return (
    <div className="force-dark bg-bg border-b border-line sticky top-0 z-[1000] h-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-center flex-wrap gap-x-6 gap-y-1 text-[.76rem]">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-faint shrink-0">
          <span className="w-1.5 h-1.5 bg-mint rounded-full animate-pulse" />
          Live Rates
        </span>
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="flex items-baseline gap-1.5 hover:opacity-80 transition-opacity">
            <span className="text-faint font-medium">{s.label}:</span>
            <span className={`font-bold font-mono ${s.cls}`}>{s.value ?? '···'}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
