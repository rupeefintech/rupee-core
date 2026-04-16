import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, ExternalLink, CreditCard, Check, ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { apiClient } from "../utils/api";

/* ─── Types ─── */
interface Offer {
  title: string;
  description: string | null;
  rewardRate: number | null;
  rewardCap: number | null;
  category: string | null;
  isActive: boolean;
}

interface CardDetail {
  id: number;
  name: string;
  slug: string;
  category: string;
  network: string | null;
  isFeatured: boolean;
  isPopular: boolean;
  rating: number | null;
  totalRatings: number;
  cardImageUrl: string | null;
  applyUrl: string | null;
  bank: { name: string; slug: string; logo: string | null };
  details: {
    annualFee: number | null;
    joiningFee: number | null;
    minIncome: number | null;
    loungeAccess: number | null;
    rewardType: string | null;
  };
  offers: Offer[];
  features: string[];
}

const CARD_GRADIENTS: Record<string, string> = {
  "HDFC Bank": "from-[#1a3666] to-[#264785]",
  "State Bank of India": "from-[#1c3a7a] to-[#3b5998]",
  "ICICI Bank": "from-[#b44d12] to-[#e87722]",
  "Axis Bank": "from-[#4a1463] to-[#7b2d8e]",
  "American Express": "from-[#2c3e50] to-[#4a6274]",
  "Kotak Mahindra Bank": "from-[#8b1a1a] to-[#c62828]",
  "IndusInd Bank": "from-[#155e5e] to-[#1a8a8a]",
  "RBL Bank": "from-[#8b4513] to-[#cd7a2e]",
  "IDFC First Bank": "from-[#7a1414] to-[#b71c1c]",
  "Yes Bank": "from-[#0d47a1] to-[#1976d2]",
  "Standard Chartered Bank": "from-[#1b5e20] to-[#2e7d32]",
  "Citi Bank": "from-[#1565c0] to-[#42a5f5]",
};

function formatINR(amount: number | null): string {
  if (!amount || amount === 0) return "FREE";
  return "\u20B9" + amount.toLocaleString("en-IN");
}

/* ─── Main Component ─── */
export default function CreditCardDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiClient
      .get(`/products/${slug}`)
      .then((res) => setCard(res.data))
      .catch(() => setError("Credit card not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">{error || "Card not found."}</p>
        <Link to="/credit-cards" className="mt-4 inline-block text-brand-600 hover:underline text-sm">
          Back to all cards
        </Link>
      </div>
    );
  }

  const activeOffers = card.offers.filter((o) => o.isActive);
  const gradient = CARD_GRADIENTS[card.bank.name] || "from-brand-800 to-brand-700";

  return (
    <>
      <Helmet>
        <title>{card.name} - Review, Benefits & Apply | Rupeepedia</title>
        <meta name="description" content={`${card.name} from ${card.bank.name}. Annual fee: ${formatINR(card.details.annualFee)}. ${activeOffers[0]?.title || ""}`} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/credit-cards" className="hover:text-brand-600 transition">Credit Cards</Link>
          <ChevronRight size={12} />
          <span className="text-brand-900 font-medium truncate">{card.name}</span>
        </div>
      </div>

      {/* ─── Hero Card Section ─── */}
      <div className={`bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/[0.03]" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/[0.03]" />

        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Card visual */}
            <div className="w-full md:w-80 shrink-0">
              {card.cardImageUrl && card.cardImageUrl.trim().toLowerCase().endsWith(".png") ? (
                <div className="aspect-[1.586/1] rounded-2xl overflow-hidden bg-white/10 backdrop-blur border border-white/20">
                  <img
                    src={card.cardImageUrl.trim()}
                    alt={card.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-[1.586/1] rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    {card.bank.logo ? (
                      <img src={card.bank.logo} alt={card.bank.name} className="h-7 object-contain brightness-0 invert opacity-80" />
                    ) : (
                      <span className="text-sm font-semibold text-white/80">{card.bank.name}</span>
                    )}
                    {card.network && (
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{card.network}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.15em]">Credit Card</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{card.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-white">
              <div className="flex items-start gap-3 flex-wrap">
                {card.isFeatured && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">Featured</span>
                )}
                {card.isPopular && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/20">Popular</span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mt-3 font-display">{card.name}</h1>
              <p className="text-white/60 text-sm mt-1">{card.bank.name}</p>

              {/* Rating */}
              {card.rating != null && card.rating > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(card.rating!) ? "text-gold-400 fill-gold-400" : "text-white/20 fill-white/20"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{card.rating}</span>
                  <span className="text-xs text-white/50">({card.totalRatings.toLocaleString("en-IN")} ratings)</span>
                </div>
              )}

              {/* Stat pills */}
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2.5 border border-white/10">
                  <span className="text-[10px] text-white/50 block uppercase tracking-wider">Annual Fee</span>
                  <span className="text-sm font-bold">{formatINR(card.details.annualFee)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2.5 border border-white/10">
                  <span className="text-[10px] text-white/50 block uppercase tracking-wider">Joining Fee</span>
                  <span className="text-sm font-bold">{formatINR(card.details.joiningFee)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2.5 border border-white/10">
                  <span className="text-[10px] text-white/50 block uppercase tracking-wider">Network</span>
                  <span className="text-sm font-bold">{card.network || "N/A"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2.5 border border-white/10">
                  <span className="text-[10px] text-white/50 block uppercase tracking-wider">Rewards</span>
                  <span className="text-sm font-bold capitalize">{card.details.rewardType || "N/A"}</span>
                </div>
              </div>

              {/* Apply CTA */}
              <div className="flex flex-wrap gap-3 mt-6">
                {card.applyUrl ? (
                  <a
                    href={card.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-brand-900 rounded-xl font-semibold transition text-sm shadow-lg shadow-gold-500/20"
                  >
                    Apply Now
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(card.name + " " + card.bank.name + " apply online")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-brand-900 rounded-xl font-semibold transition text-sm shadow-lg shadow-gold-500/20"
                  >
                    Apply on Bank Site
                    <ExternalLink size={14} />
                  </a>
                )}
                <Link
                  to={`/credit-cards`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium transition text-sm"
                >
                  Compare Cards
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Offers + Features */}
          <div className="md:col-span-2 space-y-6">
            {/* Offers */}
            {activeOffers.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-brand-900 mb-4 font-display">Offers & Benefits</h2>
                <div className="space-y-3">
                  {activeOffers.map((offer, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-brand-50/50 rounded-lg border border-brand-100/50">
                      <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-brand-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-900">{offer.title}</p>
                        {offer.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{offer.description}</p>
                        )}
                        {offer.category && (
                          <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {offer.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {card.features.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-brand-900 mb-4 font-display">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {card.features.map((f) => (
                    <span key={f} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-100">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Details sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Card Details</h3>
              <div className="space-y-0">
                <DetailRow label="Annual Fee" value={formatINR(card.details.annualFee)} />
                <DetailRow label="Joining Fee" value={formatINR(card.details.joiningFee)} />
                <DetailRow label="Min. Income" value={card.details.minIncome ? `\u20B9${card.details.minIncome.toLocaleString("en-IN")}` : "N/A"} />
                <DetailRow label="Lounge Access" value={card.details.loungeAccess ? `${card.details.loungeAccess} visits/yr` : "No"} />
                <DetailRow label="Reward Type" value={card.details.rewardType || "N/A"} />
                <DetailRow label="Card Network" value={card.network || "N/A"} />
              </div>
            </div>

            {/* Eligibility CTA */}
            <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl border border-brand-100 p-6">
              <h3 className="text-sm font-bold text-brand-900 mb-2 uppercase tracking-wider">Check Eligibility</h3>
              <p className="text-xs text-gray-500 mb-3">
                {card.details.minIncome
                  ? `Minimum income requirement: \u20B9${card.details.minIncome.toLocaleString("en-IN")}/year`
                  : "Check if you qualify for this card"}
              </p>
              <a
                href={card.applyUrl || `https://www.google.com/search?q=${encodeURIComponent(card.name + " " + card.bank.name + " eligibility")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-xl transition shadow-sm"
              >
                Check on {card.bank.name}
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Bank card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-brand-900 mb-3 uppercase tracking-wider">Issuing Bank</h3>
              <div className="flex items-center gap-3">
                {card.bank.logo ? (
                  <img src={card.bank.logo} alt={card.bank.name} className="h-10 w-10 rounded-lg object-contain border border-gray-200 p-1" />
                ) : (
                  <div className="h-10 w-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 font-bold text-sm">
                    {card.bank.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-brand-900">{card.bank.name}</p>
                  <Link to={`/bank/${card.bank.slug}`} className="text-xs text-brand-600 hover:underline">
                    View all branches &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to all cards */}
            <Link
              to="/credit-cards"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-brand-700 bg-brand-50 rounded-xl border border-brand-100 hover:bg-brand-100 transition"
            >
              <ArrowLeft size={14} />
              Browse All Cards
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-brand-900 capitalize">{value}</span>
    </div>
  );
}
