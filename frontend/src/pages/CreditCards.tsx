import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, CreditCard, Award, GitCompareArrows, CheckCircle, ChevronRight } from "lucide-react";
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
  updatedAt: string | null;
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
  Visa: "bg-acc-deep text-acc border-acc/30",
  Mastercard: "bg-gold/10 text-gold border-gold/30",
  RuPay: "bg-mint/10 text-mint border-mint/30",
  Amex: "bg-acc-deep text-acc border-acc/30",
  Diners: "bg-violet-500/10 text-violet border-violet/30",
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
  return "₹" + amount.toLocaleString("en-IN");
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
  const [bank, setBank] = useState(searchParams.get("bank") || "");
  const [sortBy, setSortBy] = useState("rating");

  // Sync category + bank from URL when navigating via links
  useEffect(() => {
    const urlCat = searchParams.get("category") || "";
    const urlBank = searchParams.get("bank") || "";
    if (urlCat !== category) setCategory(urlCat);
    if (urlBank !== bank) setBank(urlBank);
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
      if (sortBy) params.set("sortBy", sortBy);

      apiClient.get(`/products?${params.toString()}`)
        .then((res) => setCards(res.data.products || []))
        .catch(() => setCards([]))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search, bank, sortBy]);

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
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <>
      <Helmet>
        <title>Best Credit Cards in India 2026 — Compare Cashback, Travel & Rewards | RupeePedia</title>
        <meta name="description" content="Compare the best credit cards in India. Find cashback, travel, rewards, and lifetime-free cards from HDFC, SBI, ICICI, Axis, and more. Filter by category, annual fee, and bank." />
        <link rel="canonical" href="https://rupeepedia.in/credit-cards" />
        <meta property="og:title" content="Best Credit Cards in India 2026 — Compare Cashback, Travel & Rewards" />
        <meta property="og:description" content="Compare the best credit cards in India. Cashback, travel, rewards, and lifetime-free cards from top banks." />
        <meta property="og:url" content="https://rupeepedia.in/credit-cards" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Best Credit Cards in India 2026 — Compare & Apply" />
        <meta name="twitter:description" content="Compare cashback, travel, rewards, and lifetime-free credit cards from top Indian banks." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "name": "Best Credit Cards in India 2026",
              "url": "https://rupeepedia.in/credit-cards",
              "description": "Compare the best credit cards in India — cashback, travel, rewards, and lifetime-free cards from HDFC, SBI, ICICI, Axis, and more.",
              "provider": { "@type": "Organization", "name": "RupeePedia", "url": "https://rupeepedia.in" }
            },
            {
              "@type": "ItemList",
              "name": "Credit Card Categories",
              "url": "https://rupeepedia.in/credit-cards",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Best Cashback Credit Cards", "url": "https://rupeepedia.in/credit-cards?category=Cashback" },
                { "@type": "ListItem", "position": 2, "name": "Best Travel Credit Cards", "url": "https://rupeepedia.in/credit-cards?category=Travel" },
                { "@type": "ListItem", "position": 3, "name": "Best Rewards Credit Cards", "url": "https://rupeepedia.in/credit-cards?category=Rewards" },
                { "@type": "ListItem", "position": 4, "name": "Lifetime Free Credit Cards", "url": "https://rupeepedia.in/credit-cards?category=Lifetime+Free" }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Which is the best cashback credit card in India?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Top cashback credit cards in India include HDFC Millennia, SBI Cashback Card, and Axis Ace. Compare offers, cashback rates, and annual fees at rupeepedia.in/credit-cards to find the best fit for your spending pattern." }
                },
                {
                  "@type": "Question",
                  "name": "Are there lifetime free credit cards in India?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes, several banks offer lifetime free (zero annual fee) credit cards in India. Popular options include HDFC MoneyBack+, SBI SimplyCLICK, and IDFC FIRST Millennia. Browse all lifetime free cards at rupeepedia.in/credit-cards." }
                },
                {
                  "@type": "Question",
                  "name": "What is the best travel credit card in India?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Best travel credit cards in India include HDFC Regalia, Axis Atlas, and SBI Elite. These offer lounge access, air miles, and travel insurance. Compare all travel cards at rupeepedia.in/credit-cards." }
                }
              ]
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rupeepedia.in" },
                { "@type": "ListItem", "position": 2, "name": "Credit Cards", "item": "https://rupeepedia.in/credit-cards" }
              ]
            }
          ]
        })}</script>
      </Helmet>

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="force-dark relative overflow-hidden rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-160px] right-[-100px] w-[500px] h-[400px] rounded-full opacity-25 blur-[20px]"
                   style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
            </div>
            <div className="relative z-[2]">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                  <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-acc font-semibold">Credit Cards</span>
                </nav>

                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-mint/10 text-mint border border-mint/30 mb-5">
                  <CreditCard className="w-3.5 h-3.5" /> {stats?.totalCards ?? cards.length}+ Top Indian Credit Cards (Verified 2026 Edition)
                </div>

                <h1 className="font-display text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-[1.1] mb-4">
                  Find the Best <span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Credit Card &amp; Cashback</span> Deals
                </h1>
                <p className="text-body text-sm md:text-base leading-relaxed max-w-2xl mb-6">
                  Compare Lifetime Free (LTF) cards, unlimited online cashback, domestic &amp; international airport lounge passes, and RuPay UPI credit cards.
                </p>

                <div className="flex flex-wrap gap-3">
                  <a href="#grid" className="inline-flex items-center gap-2 bg-gradient-to-br from-mint to-acc text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-acc-glow hover:-translate-y-px transition-all">
                    <Award className="w-4 h-4" /> Browse Top Picks
                  </a>
                  <Link to="/credit-cards/reward-optimizer" className="inline-flex items-center gap-2 bg-bg-2 border border-line-2 text-ink text-sm font-semibold px-5 py-3 rounded-xl hover:border-gold/50 transition-all">
                    <SlidersHorizontal className="w-4 h-4 text-gold" /> Reward Spending Optimizer
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div id="grid" className="bg-bg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-mt-24">
        {/* ─── Search + Bank + Sort ─── */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
            <input
              type="search"
              placeholder="Search by card name, bank, lounge access, or cashback perk…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-line-2 text-ink placeholder:text-faint text-sm focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc transition-all"
            />
          </div>
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="text-sm border border-line-2 rounded-xl px-3.5 py-3 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc transition-all"
          >
            <option value="">All Banks</option>
            {bankOptions.map((b) => (
              <option key={b.id} value={b.name}>{b.name} ({b.cardCount})</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-line-2 rounded-xl px-3.5 py-3 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc transition-all"
          >
            <option value="rating">Top Rated</option>
            <option value="annualFee">Lowest Fee</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* ─── Category pills ─── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-thin">
          <button
            onClick={() => setCategory("")}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              !category
                ? "bg-gradient-to-br from-acc to-acc-2 text-white border-transparent shadow-acc-glow"
                : "bg-surface text-muted border-line hover:border-acc/40"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(category === c.name ? "" : c.name)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                category === c.name
                  ? "bg-gradient-to-br from-acc to-acc-2 text-white border-transparent shadow-acc-glow"
                  : "bg-surface text-muted border-line hover:border-acc/40"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 -mt-2">
            {activeFilters.map((f) => (
              <button
                key={f.label}
                onClick={f.clear}
                className="flex items-center gap-1 bg-acc-deep text-acc text-xs px-2.5 py-1 rounded-full border border-acc/30 hover:bg-acc/20 transition-all font-semibold"
              >
                {f.label}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* ─── Loading Skeleton ─── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-line bg-surface p-4 space-y-3">
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
            <Search className="w-12 h-12 mx-auto mb-4 text-faint" />
            <h3 className="font-semibold text-ink mb-1">No cards found</h3>
            <p className="text-sm text-muted">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* ─── Card Grid ─── */}
        {!loading && filteredCards.length > 0 && (
          <>
            <p className="text-sm text-muted mb-4">{filteredCards.length} cards found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCards.map((card) => {
                const isSelected = compareIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    className={`rounded-2xl border bg-surface transition-all group ${
                      isSelected
                        ? "border-acc ring-2 ring-acc/20"
                        : card.isFeatured
                        ? "border-gold/60 ring-1 ring-gold/25 shadow-[0_0_24px_-8px_rgba(245,196,81,0.35)] hover:border-gold"
                        : "border-line hover:border-acc"
                    }`}
                  >
                    <Link to={`/credit-cards/${card.slug}`} className="block p-4 pb-0">
                      {/* Card visual */}
                      <div className="mb-4">
                        {card.cardImageUrl && card.cardImageUrl.trim().toLowerCase().endsWith(".png") ? (
                          <div className="aspect-[1.586/1] rounded-xl overflow-hidden bg-surface-2">
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

                      {/* Bank + Best Pick badge */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-faint uppercase tracking-wider font-semibold">{card.bank.name}</p>
                        {card.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gold/15 text-gold shrink-0">
                            🔥 Best Pick
                          </span>
                        )}
                      </div>

                      {/* Name + Network badge */}
                      <div className="flex items-start justify-between gap-2 mt-1">
                        <h3 className="font-semibold text-sm text-ink leading-snug group-hover:text-acc transition-colors line-clamp-2">
                          {card.name}
                        </h3>
                        {card.network && (
                          <span className={`text-[10px] shrink-0 font-medium px-2 py-0.5 rounded-full border ${NETWORK_COLORS[card.network] ?? "bg-surface-2 text-muted border-line"}`}>
                            {card.network}
                          </span>
                        )}
                      </div>

                      {/* Fee + Reward row */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-line">
                        <div>
                          <span className="text-[10px] text-faint block uppercase tracking-wider">Annual Fee</span>
                          <span className="text-xs font-semibold text-ink">{formatINR(card.annualFee)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-faint block uppercase tracking-wider">Joining Fee</span>
                          <span className="text-xs font-semibold text-ink">{formatINR(card.joiningFee)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-faint block uppercase tracking-wider">Reward Rate</span>
                          <span className="text-xs font-semibold text-mint truncate block">
                            {card.offer?.rewardRate ? `${card.offer.rewardRate}%` : (card.rewardType ? <span className="text-ink capitalize">{card.rewardType}</span> : "—")}
                          </span>
                        </div>
                      </div>

                      {/* Top offer / benefit */}
                      {card.offer && (
                        <div className="mt-2 bg-acc-deep rounded-lg px-3 py-2">
                          <p className="text-xs text-acc font-medium leading-snug line-clamp-1">
                            {card.offer.title}
                          </p>
                        </div>
                      )}

                      {/* Badges + Last verified */}
                      <div className="mt-3 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {card.isPopular && (
                            <span className="text-[10px] bg-mint/10 text-mint rounded-full px-2 py-0.5 font-medium">Popular</span>
                          )}
                        </div>
                        {card.updatedAt && (
                          <span className="text-[10px] text-faint shrink-0">
                            Verified {new Date(card.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Action row: Compare + Apply */}
                    <div className="px-4 py-3 flex items-center justify-between border-t border-line mt-3">
                      <button
                        onClick={(e) => { e.preventDefault(); toggleCompare(card.id); }}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
                          isSelected
                            ? "bg-acc-deep text-acc border border-acc/30"
                            : "text-muted hover:text-acc hover:bg-acc-deep border border-transparent"
                        }`}
                      >
                        {isSelected ? <CheckCircle size={13} /> : <GitCompareArrows size={13} />}
                        {isSelected ? "Selected" : "Compare"}
                      </button>
                      {card.applyUrl ? (
                        <a
                          href={card.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold px-3 py-1.5 bg-gradient-to-br from-acc to-acc-2 hover:-translate-y-px hover:shadow-acc-glow-lg text-white rounded-lg shadow-acc-glow transition-all"
                        >
                          Apply Now →
                        </a>
                      ) : (
                        <Link
                          to={`/credit-cards/${card.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold px-3 py-1.5 bg-gradient-to-br from-acc to-acc-2 hover:-translate-y-px hover:shadow-acc-glow-lg text-white rounded-lg shadow-acc-glow transition-all"
                        >
                          View Details →
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
        <div className="mt-16 bg-gradient-to-br from-acc-deep to-surface rounded-2xl p-8 border border-acc/20">
          <h2 className="text-2xl font-bold text-ink mb-5 font-display">
            How to Choose the Right Credit Card?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-muted">
            <div className="bg-surface rounded-xl p-5 border border-line">
              <h3 className="font-semibold text-ink mb-2">For Online Shoppers</h3>
              <p>Look for cashback cards offering 5%+ back on Amazon, Flipkart, and Swiggy. Cards like HDFC Millennia and ICICI Amazon Pay excel here.</p>
            </div>
            <div className="bg-surface rounded-xl p-5 border border-line">
              <h3 className="font-semibold text-ink mb-2">For Travellers</h3>
              <p>Choose travel cards with lounge access, air miles, and forex markup waivers. Axis Magnus and HDFC Regalia are top picks.</p>
            </div>
            <div className="bg-surface rounded-xl p-5 border border-line">
              <h3 className="font-semibold text-ink mb-2">For First-Timers</h3>
              <p>Start with a lifetime-free card with low requirements. Kotak 811 and ICICI Coral are great entry points with no annual fee.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Comparisons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-3">Popular Card Comparisons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { to: '/credit-cards/compare/sbi-cashback-vs-hdfc-millennia',   label: 'SBI Cashback vs HDFC Millennia',   desc: 'Best cashback cards head-to-head'     },
            { to: '/credit-cards/compare/icici-amazon-pay-vs-sbi-cashback', label: 'Amazon Pay ICICI vs SBI Cashback', desc: 'Free card vs 5% all-online card'        },
            { to: '/credit-cards/compare/axis-ace-vs-sbi-cashback',         label: 'Axis ACE vs SBI Cashback',         desc: 'Google Pay bills vs all online spends' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="bg-surface rounded-xl p-4 border border-line hover:border-acc transition-all group flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-acc-deep text-acc rounded-full border border-acc/30">Compare</span>
                <GitCompareArrows size={14} className="text-faint group-hover:text-acc transition-colors" />
              </div>
              <div className="font-semibold text-ink text-sm group-hover:text-acc transition-colors">{item.label}</div>
              <div className="text-[11px] text-faint leading-tight">{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Floating Compare Bar ─── */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-line shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <GitCompareArrows size={18} className="text-acc shrink-0" />
              <span className="text-sm font-medium text-ink">
                {compareIds.length} card{compareIds.length > 1 ? "s" : ""} selected
              </span>
              <span className="text-xs text-faint">(max 3)</span>
              <div className="hidden sm:flex items-center gap-2 ml-2">
                {compareIds.map((id) => {
                  const c = cards.find((x) => x.id === id);
                  return c ? (
                    <span key={id} className="flex items-center gap-1 bg-acc-deep text-acc text-xs px-2 py-1 rounded-full border border-acc/30">
                      {c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name}
                      <button onClick={() => toggleCompare(id)} className="hover:text-coral ml-0.5">
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
                className="text-xs text-muted hover:text-ink px-3 py-2 transition-colors"
              >
                Clear
              </button>
              <Link
                to={compareIds.length >= 2 ? `/credit-cards/compare?ids=${compareIds.join(",")}` : "#"}
                onClick={(e) => { if (compareIds.length < 2) e.preventDefault(); }}
                className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
                  compareIds.length >= 2
                    ? "bg-gradient-to-br from-acc to-acc-2 text-white shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg"
                    : "bg-surface-2 text-faint cursor-not-allowed border border-line"
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
  const gradient = CARD_GRADIENTS[bank] || "from-acc-deep to-acc/40";

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


export default CreditCards;
