import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Star, CreditCard, TrendingUp, Building2, Award, GitCompareArrows, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { apiClient  } from "../utils/api";

/* ─── Types ─── */
interface CardItem {
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
  annualFee: number;
  joiningFee: number;
  rewardType: string | null;
  offer: { title: string; rewardRate: number | null; rewardCap: number | null; category: string | null } | null;
  features: string[];
}

interface StatsData {
  totalCards: number;
  totalBanks: number;
  totalCategories: number;
  avgRating: number;
  freeCards: number;
}

interface FilterOption {
  id: number;
  name: string;
  cardCount: number;
}

/* ─── Constants ─── */
const NETWORK_COLORS: Record<string, string> = {
  Visa: "bg-brand-100 text-brand-700 border-brand-200",
  Mastercard: "bg-orange-100 text-orange-700 border-orange-200",
  RuPay: "bg-green-100 text-green-700 border-green-200",
  Amex: "bg-brand-100 text-brand-700 border-brand-200",
  Diners: "bg-purple-100 text-purple-700 border-purple-200",
};

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

function formatINR(amount: number): string {
  if (amount === 0) return "FREE";
  return "\u20B9" + amount.toLocaleString("en-IN");
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ─── Main Page ─── */
const CreditCards: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [bankOptions, setBankOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Compare selection
  const [compareIds, setCompareIds] = useState<number[]>([]);

  // Filters — seed category from URL ?category=
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [bank, setBank] = useState("");
  const [feeMax, setFeeMax] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(!!searchParams.get("category"));

  // Sync category from URL when navigating between submenu links
  useEffect(() => {
    const urlCat = searchParams.get("category") || "";
    if (urlCat !== category) {
      setCategory(urlCat);
      if (urlCat) setShowFilters(true);
    }
  }, [searchParams]);

  // Load stats + filter options once
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [statsRes, categoriesRes, banksRes] = await Promise.all([
          apiClient.get("/credit-cards/stats"),
          apiClient.get("/credit-cards/categories"),
          apiClient.get("/credit-cards/banks"),
        ]);
        setStats(statsRes.data);
        setCategories(categoriesRes.data);
        setBankOptions(banksRes.data);
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };
    loadFilters();
  }, []);

  // Load cards (debounced search)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (search) params.set("search", search);
      if (bank) params.set("bank", bank);
      if (feeMax) params.set("annualFeeMax", feeMax);
      if (sortBy) params.set("sortBy", sortBy);

      apiClient.get(`/products?${params.toString()}`)
        .then((res) => setCards(res.data.products || []))
        .catch(() => setCards([]))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search, bank, feeMax, sortBy]);

  // Compare helpers
  const toggleCompare = (id: number) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  // Client-side category filter (offer.category) — case-insensitive
  const filteredCards = category
    ? cards.filter((c) => c.offer?.category?.toLowerCase() === category.toLowerCase())
    : cards;

  const activeFilters = [
    category && { label: category, clear: () => setCategory("") },
    bank && { label: bank, clear: () => setBank("") },
    feeMax && { label: `Fee \u2264 \u20B9${feeMax}`, clear: () => setFeeMax("") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <>
      <Helmet>
        <title>Best Credit Cards in India 2026 - Compare & Apply | Rupeepedia</title>
        <meta name="description" content="Compare the best credit cards in India. Find cashback, travel, rewards, and premium cards from HDFC, SBI, ICICI, Axis, and more." />
      </Helmet>

      {/* ─── Hero ─── */}
      <div className="bg-brand-700 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0h40v1H0zm0 39h40v1H0z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-display">
            Credit Cards in India
          </h1>
          <p className="text-brand-300 text-sm md:text-base">
            Compare {stats?.totalCards ?? cards.length}+ credit cards from top banks
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
            <input
              type="search"
              placeholder="Search by card name or bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-brand-300 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition"
            />
          </div>

          {/* Stats row */}
          {stats && (
            <div className="flex flex-wrap gap-6 mt-8">
              <StatPill icon={<CreditCard size={14} />} label="Cards" value={String(stats.totalCards)} />
              <StatPill icon={<Building2 size={14} />} label="Banks" value={String(stats.totalBanks)} />
              <StatPill icon={<Star size={14} className="fill-gold-400 text-gold-400" />} label="Avg Rating" value={String(stats.avgRating)} />
              <StatPill icon={<Award size={14} />} label="Free Cards" value={String(stats.freeCards)} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ─── Filter Bar ─── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition ${
              showFilters ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilters.length > 0 && (
              <span className="bg-brand-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {activeFilters.length}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-brand-400 text-gray-700"
          >
            <option value="rating">Sort: Top Rated</option>
            <option value="annualFee">Sort: Lowest Fee</option>
            <option value="newest">Sort: Newest</option>
          </select>

          {activeFilters.map((f) => (
            <button
              key={f.label}
              onClick={f.clear}
              className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full border border-brand-200 hover:bg-brand-100 transition font-medium"
            >
              {f.label}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>

        {/* ─── Filter Panel ─── */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-5 shadow-sm">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:border-brand-400"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name} ({c.cardCount})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Bank</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:border-brand-400"
              >
                <option value="">All Banks</option>
                {bankOptions.map((b) => (
                  <option key={b.id} value={b.name}>{b.name} ({b.cardCount})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Max Annual Fee</label>
              <select
                value={feeMax}
                onChange={(e) => setFeeMax(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:border-brand-400"
              >
                <option value="">Any Fee</option>
                <option value="0">Free (\u20B90)</option>
                <option value="500">Up to \u20B9500</option>
                <option value="1500">Up to \u20B91,500</option>
                <option value="5000">Up to \u20B95,000</option>
                <option value="10000">Up to \u20B910,000</option>
              </select>
            </div>
          </div>
        )}

        {/* ─── Loading Skeleton ─── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <div className="aspect-[1.586/1] rounded-xl skeleton w-full" />
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-3 w-1/2 skeleton" />
                <div className="h-8 w-full skeleton" />
              </div>
            ))}
          </div>
        )}

        {/* ─── Empty State ─── */}
        {!loading && filteredCards.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <h3 className="font-semibold text-gray-700 mb-1">No cards found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* ─── Card Grid ─── */}
        {!loading && filteredCards.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">{filteredCards.length} cards found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCards.map((card) => {
                const isSelected = compareIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    className={`rounded-xl border bg-white hover:shadow-md transition-all group ${
                      isSelected ? "border-brand-400 ring-2 ring-brand-100" : "border-gray-200 hover:border-brand-200"
                    }`}
                  >
                    <Link to={`/credit-cards/${card.slug}`} className="block p-4 pb-0">
                      {/* Card visual */}
                      <div className="mb-4">
                        {card.cardImageUrl && card.cardImageUrl.trim().toLowerCase().endsWith(".png") ? (
                          <div className="aspect-[1.586/1] rounded-xl overflow-hidden bg-gray-100">
                            <img
                              src={card.cardImageUrl.trim()}
                              alt={card.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <CardPlaceholder
                            bank={card.bank.name}
                            name={card.name}
                            network={card.network}
                            logo={card.bank.logo}
                          />
                        )}
                      </div>

                      {/* Name + Network badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-brand-900 leading-snug group-hover:text-brand-600 transition line-clamp-2">
                            {card.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">{card.bank.name}</p>
                        </div>
                        {card.network && (
                          <span className={`text-[10px] shrink-0 font-medium px-2 py-0.5 rounded-full border ${NETWORK_COLORS[card.network] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {card.network}
                          </span>
                        )}
                      </div>

                      {/* Star rating */}
                      {card.rating != null && card.rating > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <StarRating rating={card.rating} size={11} />
                          <span className="text-xs text-gray-500">
                            {card.rating} ({formatNumber(card.totalRatings)})
                          </span>
                        </div>
                      )}

                      {/* Fee + Reward row */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Annual Fee</span>
                          <span className="text-xs font-semibold text-brand-900">{formatINR(card.annualFee)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Rewards</span>
                          <span className="text-xs font-semibold text-brand-900 truncate block capitalize">{card.rewardType || "\u2014"}</span>
                        </div>
                      </div>

                      {/* Top offer / benefit */}
                      {card.offer && (
                        <div className="mt-2 bg-brand-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-brand-700 font-medium leading-snug line-clamp-1">
                            {card.offer.title}
                          </p>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="mt-3 flex items-center gap-1">
                        {card.isPopular && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">Popular</span>
                        )}
                        {card.isFeatured && (
                          <span className="text-[10px] bg-gold-400/20 text-gold-600 rounded-full px-2 py-0.5 font-medium">Featured</span>
                        )}
                      </div>
                    </Link>

                    {/* Action row: Compare + Apply */}
                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 mt-3">
                      <button
                        onClick={(e) => { e.preventDefault(); toggleCompare(card.id); }}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition ${
                          isSelected
                            ? "bg-brand-100 text-brand-700 border border-brand-300"
                            : "text-gray-500 hover:text-brand-600 hover:bg-brand-50 border border-transparent"
                        }`}
                      >
                        {isSelected ? <CheckCircle size={13} /> : <GitCompareArrows size={13} />}
                        {isSelected ? "Selected" : "Compare"}
                      </button>
                      {card.applyUrl ? (
                        <a
                          href={card.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-brand-900 rounded-lg transition shadow-sm"
                        >
                          Apply Now
                        </a>
                      ) : (
                        <Link
                          to={`/credit-cards/${card.slug}`}
                          className="text-xs text-brand-600 font-medium hover:underline"
                        >
                          Check Eligibility &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ─── Guide Section ─── */}
        <div className="mt-16 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-8 border border-brand-100">
          <h2 className="text-2xl font-bold text-brand-900 mb-5 font-display">
            How to Choose the Right Credit Card?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="bg-white rounded-xl p-5 border border-brand-100">
              <h3 className="font-semibold text-brand-800 mb-2">For Online Shoppers</h3>
              <p>Look for cashback cards offering 5%+ back on Amazon, Flipkart, and Swiggy. Cards like HDFC Millennia and ICICI Amazon Pay excel here.</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-brand-100">
              <h3 className="font-semibold text-brand-800 mb-2">For Travellers</h3>
              <p>Choose travel cards with lounge access, air miles, and forex markup waivers. Axis Magnus and HDFC Regalia are top picks.</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-brand-100">
              <h3 className="font-semibold text-brand-800 mb-2">For First-Timers</h3>
              <p>Start with a lifetime-free card with low requirements. Kotak 811 and ICICI Coral are great entry points with no annual fee.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Floating Compare Bar ─── */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-2xl shadow-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <GitCompareArrows size={18} className="text-brand-600 shrink-0" />
              <span className="text-sm font-medium text-brand-900">
                {compareIds.length} card{compareIds.length > 1 ? "s" : ""} selected
              </span>
              <span className="text-xs text-gray-400">(max 3)</span>
              <div className="hidden sm:flex items-center gap-2 ml-2">
                {compareIds.map((id) => {
                  const c = cards.find((x) => x.id === id);
                  return c ? (
                    <span key={id} className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full border border-brand-200">
                      {c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name}
                      <button onClick={() => toggleCompare(id)} className="hover:text-red-500 ml-0.5">
                        <X size={11} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareIds([])}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 transition"
              >
                Clear
              </button>
              <Link
                to={compareIds.length >= 2 ? `/credit-cards/compare?ids=${compareIds.join(",")}` : "#"}
                onClick={(e) => { if (compareIds.length < 2) e.preventDefault(); }}
                className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm ${
                  compareIds.length >= 2
                    ? "bg-brand-700 hover:bg-brand-800 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <GitCompareArrows size={14} />
                Compare{compareIds.length >= 2 ? ` (${compareIds.length})` : ""}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─── Stat Pill (hero) ─── */
function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-3.5 py-2 border border-white/10">
      <span className="text-gold-400">{icon}</span>
      <div>
        <span className="text-white text-sm font-bold">{value}</span>
        <span className="text-brand-300 text-xs ml-1.5">{label}</span>
      </div>
    </div>
  );
}

/* ─── Card Placeholder Visual ─── */
function CardPlaceholder({
  bank,
  name,
  network,
  logo,
}: {
  bank: string;
  name: string;
  network: string | null;
  logo: string | null;
}) {
  const gradient = CARD_GRADIENTS[bank] || "from-brand-800 to-brand-700";

  return (
    <div className={`aspect-[1.586/1] rounded-xl bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between text-white relative overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/[0.04]" />
      <div className="absolute -right-2 top-10 w-16 h-16 rounded-full bg-white/[0.04]" />
      <div className="absolute left-1/2 -bottom-8 w-32 h-32 rounded-full bg-white/[0.02]" />

      {/* Top: bank + network */}
      <div className="flex items-start justify-between relative z-10">
        {logo ? (
          <img src={logo} alt={bank} className="h-6 object-contain brightness-0 invert opacity-80" />
        ) : (
          <span className="text-[11px] font-semibold opacity-80 tracking-wide">{bank}</span>
        )}
        {network && (
          <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">{network}</span>
        )}
      </div>

      {/* Bottom: card name */}
      <div className="relative z-10">
        <p className="text-[9px] opacity-50 uppercase tracking-[0.15em] font-medium">Credit Card</p>
        <p className="text-xs font-semibold mt-0.5 line-clamp-1 opacity-90">{name}</p>
      </div>
    </div>
  );
}

/* ─── Star Rating ─── */
function StarRating({ rating, size = 11 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`f${i}`} size={size} className="text-gold-500 fill-gold-500" />
      ))}
      {hasHalf && (
        <Star size={size} className="text-gold-500 fill-gold-500 opacity-50" />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`e${i}`} size={size} className="text-gray-200 fill-gray-200" />
      ))}
    </div>
  );
}

export default CreditCards;
