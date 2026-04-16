import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Check, X, Star, ExternalLink, CreditCard } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { apiClient } from "../utils/api";

interface CompareCard {
  id: number;
  name: string;
  slug: string;
  bank: { name: string; logo: string | null };
  fees: { annualFee: number | null; joiningFee: number | null };
  offer: { title: string; rewardRate: number | null; rewardCap: number | null } | null;
  features: string[];
}

function formatINR(amount: number | null): string {
  if (!amount || amount === 0) return "FREE";
  return "\u20B9" + amount.toLocaleString("en-IN");
}

export default function CreditCardCompare() {
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState<CompareCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ids = searchParams.get("ids") || "";

  useEffect(() => {
    if (!ids) {
      setError("Select at least 2 cards to compare.");
      setLoading(false);
      return;
    }
    setLoading(true);
    apiClient
      .get(`/compare?ids=${ids}`)
      .then((res) => {
        if (res.data.products && res.data.products.length >= 2) {
          setCards(res.data.products);
        } else {
          setError("Could not load cards for comparison.");
        }
      })
      .catch(() => setError("Failed to load comparison data."))
      .finally(() => setLoading(false));
  }, [ids]);

  // Collect all unique features across cards
  const allFeatures = [...new Set(cards.flatMap((c) => c.features))].sort();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || cards.length < 2) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">{error || "Select at least 2 cards to compare."}</p>
        <Link to="/credit-cards" className="mt-4 inline-block text-brand-600 hover:underline text-sm">
          Back to all cards
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Compare Credit Cards - {cards.map((c) => c.name).join(" vs ")} | Rupeepedia</title>
        <meta name="description" content={`Side-by-side comparison of ${cards.map((c) => c.name).join(", ")}. Compare fees, rewards, and features.`} />
      </Helmet>

      {/* Header */}
      <div className="bg-brand-700 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Link to="/credit-cards" className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm mb-4 transition">
            <ArrowLeft size={14} /> Back to Credit Cards
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-display">
            Compare Credit Cards
          </h1>
          <p className="text-brand-300 text-sm mt-1">
            Side-by-side comparison of {cards.length} cards
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Card headers */}
            <thead>
              <tr>
                <th className="w-40 p-3" />
                {cards.map((card) => (
                  <th key={card.id} className="p-3 text-center min-w-[200px]">
                    <Link to={`/credit-cards/${card.slug}`} className="group">
                      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition">
                        {card.bank.logo ? (
                          <img src={card.bank.logo} alt={card.bank.name} className="h-8 mx-auto mb-2 object-contain" />
                        ) : (
                          <div className="h-8 flex items-center justify-center mb-2">
                            <span className="text-xs font-medium text-gray-500">{card.bank.name}</span>
                          </div>
                        )}
                        <p className="text-sm font-semibold text-brand-900 group-hover:text-brand-600 transition line-clamp-2">
                          {card.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{card.bank.name}</p>
                      </div>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Annual Fee */}
              <CompareRow label="Annual Fee">
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center text-sm font-semibold text-brand-900">
                    {formatINR(c.fees.annualFee)}
                  </td>
                ))}
              </CompareRow>

              {/* Joining Fee */}
              <CompareRow label="Joining Fee">
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center text-sm font-semibold text-brand-900">
                    {formatINR(c.fees.joiningFee)}
                  </td>
                ))}
              </CompareRow>

              {/* Top Offer */}
              <CompareRow label="Top Offer">
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center">
                    {c.offer ? (
                      <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-1 rounded-lg inline-block">
                        {c.offer.title}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </CompareRow>

              {/* Reward Rate */}
              <CompareRow label="Reward Rate">
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center text-sm text-brand-900">
                    {c.offer?.rewardRate ? `${c.offer.rewardRate}%` : "—"}
                  </td>
                ))}
              </CompareRow>

              {/* Features */}
              {allFeatures.length > 0 && (
                <>
                  <tr>
                    <td colSpan={cards.length + 1} className="pt-6 pb-2 px-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Features</span>
                    </td>
                  </tr>
                  {allFeatures.map((feature) => (
                    <CompareRow key={feature} label={feature}>
                      {cards.map((c) => (
                        <td key={c.id} className="p-3 text-center">
                          {c.features.includes(feature) ? (
                            <Check size={16} className="mx-auto text-green-600" />
                          ) : (
                            <X size={16} className="mx-auto text-gray-300" />
                          )}
                        </td>
                      ))}
                    </CompareRow>
                  ))}
                </>
              )}

              {/* Apply CTA */}
              <tr>
                <td className="p-3" />
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center">
                    <Link
                      to={`/credit-cards/${c.slug}`}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold transition"
                    >
                      View Details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="p-3 text-xs font-medium text-gray-500 whitespace-nowrap">{label}</td>
      {children}
    </tr>
  );
}
