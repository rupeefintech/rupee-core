import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X, CreditCard, ChevronRight } from "lucide-react";
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
  return "₹" + amount.toLocaleString("en-IN");
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
      <div className="bg-bg min-h-screen max-w-6xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-acc border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || cards.length < 2) {
    return (
      <div className="bg-bg min-h-screen max-w-6xl mx-auto px-4 py-20 text-center">
        <CreditCard size={48} className="mx-auto text-faint mb-4" />
        <p className="text-muted text-lg">{error || "Select at least 2 cards to compare."}</p>
        <Link to="/credit-cards" className="mt-4 inline-block text-acc hover:text-ink text-sm">
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
        <link rel="canonical" href="https://rupeepedia.in/credit-cards/compare" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Credit Cards', item: 'https://rupeepedia.in/credit-cards' },
            { '@type': 'ListItem', position: 3, name: 'Compare', item: 'https://rupeepedia.in/credit-cards/compare' },
          ],
        })}</script>
      </Helmet>

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="absolute inset-0 pointer-events-none overflow-hidden" />
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                  <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to="/credit-cards" className="hover:text-acc transition-colors">Credit Cards</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">Compare</span>
                </nav>

                <Link to="/credit-cards" className="inline-flex items-center gap-1.5 text-muted hover:text-acc text-sm mb-4 transition-colors">
                  <ArrowLeft size={14} /> Back to Credit Cards
                </Link>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
                  Compare Credit Cards
                </h1>
                <p className="text-muted text-sm mt-1">
                  Side-by-side comparison of {cards.length} cards
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Comparison Table */}
      <div className="bg-bg max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-2xl border border-line overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Card headers */}
            <thead>
              <tr className="bg-surface-2">
                <th className="w-40 p-3" />
                {cards.map((card) => (
                  <th key={card.id} className="p-3 text-center min-w-[200px]">
                    <Link to={`/credit-cards/${card.slug}`} className="group">
                      <div className="bg-surface rounded-xl border border-line p-4 hover:border-acc transition-all">
                        {card.bank.logo ? (
                          <img src={card.bank.logo} alt={card.bank.name} className="h-8 mx-auto mb-2 object-contain" />
                        ) : (
                          <div className="h-8 flex items-center justify-center mb-2">
                            <span className="text-xs font-medium text-muted">{card.bank.name}</span>
                          </div>
                        )}
                        <p className="text-sm font-semibold text-ink group-hover:text-acc transition-colors line-clamp-2">
                          {card.name}
                        </p>
                        <p className="text-xs text-faint mt-0.5">{card.bank.name}</p>
                      </div>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {/* Annual Fee */}
              <CompareRow label="Annual Fee">
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center text-sm font-semibold text-ink">
                    {formatINR(c.fees.annualFee)}
                  </td>
                ))}
              </CompareRow>

              {/* Joining Fee */}
              <CompareRow label="Joining Fee">
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center text-sm font-semibold text-ink">
                    {formatINR(c.fees.joiningFee)}
                  </td>
                ))}
              </CompareRow>

              {/* Top Offer */}
              <CompareRow label="Top Offer">
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center">
                    {c.offer ? (
                      <span className="text-xs font-medium text-acc bg-acc-deep px-2 py-1 rounded-lg inline-block">
                        {c.offer.title}
                      </span>
                    ) : (
                      <span className="text-xs text-faint">—</span>
                    )}
                  </td>
                ))}
              </CompareRow>

              {/* Reward Rate */}
              <CompareRow label="Reward Rate">
                {cards.map((c) => (
                  <td key={c.id} className="p-3 text-center text-sm text-ink">
                    {c.offer?.rewardRate ? `${c.offer.rewardRate}%` : "—"}
                  </td>
                ))}
              </CompareRow>

              {/* Features */}
              {allFeatures.length > 0 && (
                <>
                  <tr>
                    <td colSpan={cards.length + 1} className="pt-6 pb-2 px-3">
                      <span className="text-xs font-bold text-faint uppercase tracking-wider">Features</span>
                    </td>
                  </tr>
                  {allFeatures.map((feature) => (
                    <CompareRow key={feature} label={feature}>
                      {cards.map((c) => (
                        <td key={c.id} className="p-3 text-center">
                          {c.features.includes(feature) ? (
                            <Check size={16} className="mx-auto text-mint" />
                          ) : (
                            <X size={16} className="mx-auto text-faint" />
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
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-br from-mint to-acc hover:-translate-y-px hover:shadow-acc-glow-lg text-white rounded-xl text-sm font-semibold shadow-acc-glow transition-all"
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
    <tr className="hover:bg-surface-2 transition-colors">
      <td className="p-3 text-xs font-medium text-faint whitespace-nowrap">{label}</td>
      {children}
    </tr>
  );
}
