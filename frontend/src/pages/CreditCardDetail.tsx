import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, CreditCard, Check, ChevronRight } from "lucide-react";
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
  validFrom?: string | null;
  validTo?: string | null;
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
    loungeAccessNote: string | null;
    rewardType: string | null;
    forexMarkup: number | null;
    apr: string | null;
    atmCashFee: string | null;
    latePaymentFee: string | null;
    railwaySurcharge: string | null;
    rentPaymentFee: string | null;
    rewardRedemptionFee: string | null;
    annualFeeWaiver: string | null;
    joiningFeeWaiver: string | null;
  };
  aboutCard: string | null;
  bestFor: string | null;
  offers: Offer[];
  features: string[];
  updatedAt: string | null;
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
function formatFee(amount: number | null): string {
  if (!amount || amount === 0) return "FREE";
  return "\u20B9" + amount.toLocaleString("en-IN") + " + GST";
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

              {/* Best For chips */}
              {card.bestFor && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[10px] text-white/40 self-center">Best for:</span>
                  {card.bestFor.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20">{tag}</span>
                  ))}
                </div>
              )}


              {/* Stat pills */}
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2.5 border border-white/10">
                  <span className="text-[10px] text-white/50 block uppercase tracking-wider">Annual Fee</span>
                  <span className="text-sm font-bold">{formatFee(card.details.annualFee)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2.5 border border-white/10">
                  <span className="text-[10px] text-white/50 block uppercase tracking-wider">Joining Fee</span>
                  <span className="text-sm font-bold">{formatFee(card.details.joiningFee)}</span>
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
            {/* Offers & Benefits */}
            {activeOffers.length > 0 && (
              <BenefitsSection offers={activeOffers} />
            )}

            {/* About Card */}
            {card.aboutCard && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-brand-900 mb-3 font-display">About This Card</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{card.aboutCard}</p>
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
                <DetailRow label="Annual Fee" value={formatFee(card.details.annualFee)} />
                {card.details.annualFeeWaiver && (
                  <div className="pb-2.5 border-b border-gray-100 -mt-1.5">
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                      <span>✓</span>{card.details.annualFeeWaiver}
                    </p>
                  </div>
                )}
                <DetailRow label="Joining Fee" value={formatFee(card.details.joiningFee)} />
                {card.details.joiningFeeWaiver && (
                  <div className="pb-2.5 border-b border-gray-100 -mt-1.5">
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                      <span>✓</span>{card.details.joiningFeeWaiver}
                    </p>
                  </div>
                )}
                <DetailRow label="Min. Income" value={card.details.minIncome ? `\u20B9${card.details.minIncome.toLocaleString("en-IN")}` : "N/A"} />
                <DetailRow
                  label="Lounge Access"
                  value={
                    card.details.loungeAccessNote
                      ? card.details.loungeAccessNote
                      : card.details.loungeAccess
                      ? `${card.details.loungeAccess} visits/yr`
                      : "No"
                  }
                />
                <DetailRow label="Reward Type" value={card.details.rewardType || "N/A"} />
                <DetailRow label="Card Network" value={card.network || "N/A"} />
                {card.updatedAt && (
                  <DetailRow
                    label="Last Verified"
                    value={new Date(card.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  />
                )}
              </div>
            </div>

            {/* Fee Structure */}
            {(card.details.forexMarkup || card.details.apr || card.details.atmCashFee || card.details.latePaymentFee) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Fee Structure</h3>
                <div className="space-y-0">
                  {card.details.forexMarkup != null && <DetailRow label="Forex Markup" value={`${card.details.forexMarkup}%`} />}
                  {card.details.apr && <DetailRow label="APR / Finance Charge" value={card.details.apr} />}
                  {card.details.atmCashFee && <DetailRow label="ATM Cash Fee" value={card.details.atmCashFee} />}
                  {card.details.railwaySurcharge && <DetailRow label="Railway Surcharge" value={card.details.railwaySurcharge} />}
                  {card.details.rentPaymentFee && <DetailRow label="Rent Payment Fee" value={card.details.rentPaymentFee} />}
                  {card.details.rewardRedemptionFee && <DetailRow label="Reward Redemption" value={card.details.rewardRedemptionFee} />}
                  {card.details.latePaymentFee && (
                    <LatePaymentFeeBlock value={card.details.latePaymentFee} />
                  )}
                </div>
              </div>
            )}

            {/* Eligibility CTA */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl border border-brand-100 p-6">
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

function LatePaymentFeeBlock({ value }: { value: string }) {
  let slabs: { label: string; fee: number }[] | null = null;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed[0]?.label !== undefined) slabs = parsed;
  } catch { /* plain text fallback */ }

  if (!slabs) {
    return (
      <div className="py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-xs text-gray-500 block mb-0.5">Late Payment Fee</span>
        <span className="text-xs font-semibold text-brand-900">{value}</span>
      </div>
    );
  }
  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 block mb-2">Late Payment Fee</span>
      <div className="rounded-lg overflow-hidden border border-gray-100">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-2.5 py-1.5 font-semibold text-gray-500">Amount Due</th>
              <th className="text-right px-2.5 py-1.5 font-semibold text-gray-500">Fee</th>
            </tr>
          </thead>
          <tbody>
            {slabs.map((s, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-2.5 py-1.5 text-gray-700">{s.label}</td>
                <td className="px-2.5 py-1.5 text-right font-semibold text-gray-900">
                  {s.fee === 0 ? 'NIL' : '₹' + s.fee.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

// ── Category config ─────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
  shopping:      { emoji: '🛒', color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-200' },
  cashback:      { emoji: '💰', color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200'  },
  travel:        { emoji: '✈️', color: 'text-sky-700',    bg: 'bg-sky-50',     border: 'border-sky-200'    },
  dining:        { emoji: '🍽️', color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200' },
  lounge:        { emoji: '🛋️', color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  fuel:          { emoji: '⛽', color: 'text-yellow-700', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  entertainment: { emoji: '🎬', color: 'text-pink-700',   bg: 'bg-pink-50',    border: 'border-pink-200'   },
  welcome:       { emoji: '🎁', color: 'text-rose-700',   bg: 'bg-rose-50',    border: 'border-rose-200'   },
  rewards:       { emoji: '⭐', color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200'  },
  insurance:     { emoji: '🛡️', color: 'text-teal-700',   bg: 'bg-teal-50',    border: 'border-teal-200'   },
  golf:          { emoji: '⛳', color: 'text-lime-700',   bg: 'bg-lime-50',    border: 'border-lime-200'   },
  milestone:     { emoji: '🏆', color: 'text-yellow-800', bg: 'bg-yellow-50',  border: 'border-yellow-300' },
};

const DEFAULT_CAT = { emoji: '✨', color: 'text-brand-700', bg: 'bg-brand-50', border: 'border-brand-200' };

function getCatConfig(category: string | null) {
  if (!category) return DEFAULT_CAT;
  const key = category.toLowerCase().trim();
  return CATEGORY_CONFIG[key] ?? DEFAULT_CAT;
}

// ── BenefitsSection ──────────────────────────────────────────────────────────
function BenefitsSection({ offers }: { offers: Offer[] }) {
  const [expanded, setExpanded] = React.useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-brand-900 mb-5 font-display">Benefits & Offers</h2>

      {/* Category highlight cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {offers.map((offer, i) => {
          const cfg = getCatConfig(offer.category);
          const isOpen = expanded === i;
          return (
            <button
              key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              className={`text-left rounded-xl border p-3.5 transition-all ${cfg.bg} ${cfg.border} ${isOpen ? 'ring-2 ring-offset-1 ring-current/30' : 'hover:shadow-sm'}`}
            >
              <div className="text-2xl mb-2 leading-none">{cfg.emoji}</div>
              <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${cfg.color}`}>
                {offer.category || 'Benefit'}
              </div>
              <div className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                {offer.title.length > 60 ? offer.title.slice(0, 58) + '…' : offer.title}
              </div>
              <div className={`mt-2 text-[10px] font-medium ${cfg.color} flex items-center gap-0.5`}>
                {isOpen ? '▲ Less' : '▼ Details'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {expanded !== null && offers[expanded] && (() => {
        const o = offers[expanded];
        const cfg = getCatConfig(o.category);
        return (
          <div className={`rounded-xl border-2 overflow-hidden ${cfg.border}`}>
            {/* Panel header */}
            <div className={`flex items-center gap-3 px-5 py-4 ${cfg.bg}`}>
              <span className="text-3xl leading-none">{cfg.emoji}</span>
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-widest mb-0.5 ${cfg.color}`}>{o.category || 'Benefit'}</div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">{o.title}</h3>
              </div>
            </div>
            {/* Panel body */}
            <div className="bg-white px-5 py-4">
              {o.description && (
                o.description.includes('\n')
                  ? <OfferDescription text={o.description} />
                  : <p className="text-sm text-gray-700">{o.description}</p>
              )}
              {(o.rewardRate || o.rewardCap) && (
                <div className={`flex gap-6 mt-4 pt-3 border-t ${cfg.border}`}>
                  {o.rewardRate && (
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase tracking-wide">Reward Rate</span>
                      <span className={`text-lg font-black ${cfg.color}`}>{o.rewardRate}%</span>
                    </div>
                  )}
                  {o.rewardCap && (
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase tracking-wide">Monthly Cap</span>
                      <span className={`text-lg font-black ${cfg.color}`}>₹{o.rewardCap?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    if (part.startsWith('_') && part.endsWith('_'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function looksLikeHeader(trimmed: string): boolean {
  if (!trimmed || trimmed.length > 70) return false;
  if (trimmed.endsWith('.') || trimmed.endsWith(',')) return false;
  // Strip leading emoji chars
  const noEmoji = trimmed.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\s]+/u, '').trim();
  if (!noEmoji) return false;
  // ALLCAPS check (original)
  const upper = (noEmoji.match(/[A-Z]/g) || []).length;
  const lower = (noEmoji.match(/[a-z]/g) || []).length;
  if (upper >= 4 && lower <= 1) return true;
  // Title Case short phrase: ≤ 6 words, ≥ 70% words start uppercase
  const words = noEmoji.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 1 || words.length > 7) return false;
  const titleWords = words.filter(w => /^[A-Z0-9]/.test(w)).length;
  return titleWords / words.length >= 0.65;
}

function OfferDescription({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="mt-2 space-y-0.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        const isHeader = looksLikeHeader(trimmed);

        const bulletMatch = trimmed.match(/^[-•*]\s+(.+)/);
        const numberMatch = trimmed.match(/^(\d+)\.\s+(.+)/);

        if (isHeader) {
          return (
            <div key={i} className="mt-5 mb-2 first:mt-0 pb-1.5 border-b-2 border-brand-100">
              <p className="text-[15px] font-extrabold text-gray-900 leading-snug">
                {trimmed.replace(/\*|_/g, '')}
              </p>
            </div>
          );
        }
        if (numberMatch) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed mb-1">
              <span className="text-brand-600 shrink-0 font-bold min-w-[20px] mt-px">{numberMatch[1]}.</span>
              <span>{renderInline(numberMatch[2])}</span>
            </div>
          );
        }
        if (bulletMatch) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed mb-1">
              <span className="text-brand-500 shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 block" />
              <span>{renderInline(bulletMatch[1])}</span>
            </div>
          );
        }
        return (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed mb-1">
            <span className="text-brand-300 shrink-0 mt-0.5 font-bold text-xs">›</span>
            <span>{renderInline(trimmed)}</span>
          </div>
        );
      })}
    </div>
  );
}
