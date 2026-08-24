import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Zap, Trophy, Info, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { apiClient } from "../utils/api";

/* ─── Types ─── */
interface CardItem {
  id: number;
  name: string;
  slug: string;
  network: string | null;
  cardImageUrl: string | null;
  applyUrl: string | null;
  bank: { name: string; slug: string; logo: string | null };
  annualFee: number;
  offer: { title: string; rewardRate: number | null; rewardCap: number | null; category: string | null } | null;
}

interface SpendCategory {
  key: string;
  label: string;
  icon: string;
  keywords: string[];
  default: number;
  max: number;
  step: number;
}

const SPEND_CATEGORIES: SpendCategory[] = [
  { key: "shopping",  label: "Amazon / Flipkart / Online E-commerce", icon: "🛒", keywords: ["shopping", "online", "ecommerce", "e-commerce", "amazon", "flipkart"], default: 15000, max: 100000, step: 500 },
  { key: "dining",    label: "Swiggy / Zomato / Restaurant Dining",   icon: "🍽️", keywords: ["dining", "food", "restaurant", "swiggy", "zomato"],                    default: 6000,  max: 50000,  step: 500 },
  { key: "travel",    label: "Flights, Trains & Hotel Bookings",      icon: "✈️", keywords: ["travel", "flight", "hotel", "forex", "lounge"],                        default: 8000,  max: 100000, step: 500 },
  { key: "utility",   label: "Electricity, WiFi, Mobile Recharges",   icon: "📶", keywords: ["utility", "bill", "recharge", "electricity", "mobile"],                default: 4000,  max: 30000,  step: 250 },
  { key: "fuel",      label: "Petrol, Diesel & EV Fast Charging",     icon: "⛽", keywords: ["fuel", "petrol", "diesel", "ev charging"],                              default: 3500,  max: 20000,  step: 250 },
  { key: "grocery",   label: "Supermarket, D-Mart & Offline Stores",  icon: "🏬", keywords: ["grocery", "offline", "supermarket", "retail", "dmart"],                default: 8000,  max: 50000,  step: 500 },
];

const BASELINE_RATE = 1; // % — conservative assumed earn rate for spend that doesn't match a card's bonus category

function fmtINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function estimateCard(card: CardItem, spends: Record<string, number>) {
  const rate = card.offer?.rewardRate ?? BASELINE_RATE;
  const cap = card.offer?.rewardCap ?? null;
  const offerCat = card.offer?.category?.toLowerCase() ?? "";

  let bonusMonthly = 0;
  let baselineMonthly = 0;
  for (const cat of SPEND_CATEGORIES) {
    const amount = spends[cat.key] ?? 0;
    const matches = offerCat.length > 0 && cat.keywords.some(k => offerCat.includes(k));
    if (matches) bonusMonthly += amount * (rate / 100);
    else baselineMonthly += amount * (Math.min(rate, BASELINE_RATE) / 100);
  }
  if (cap != null) bonusMonthly = Math.min(bonusMonthly, cap);

  const monthlyEarn = bonusMonthly + baselineMonthly;
  const annualEarn = monthlyEarn * 12;
  const netAnnual = annualEarn - card.annualFee;
  const totalAnnualSpend = Object.values(spends).reduce((a, b) => a + b, 0) * 12;
  const returnRate = totalAnnualSpend > 0 ? (annualEarn / totalAnnualSpend) * 100 : 0;

  return { annualEarn, netAnnual, returnRate };
}

export default function CardRewardOptimizerPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [spends, setSpends] = useState<Record<string, number>>(
    Object.fromEntries(SPEND_CATEGORIES.map(c => [c.key, c.default]))
  );

  useEffect(() => {
    setLoading(true);
    apiClient.get("/products?category=credit_card&limit=100")
      .then(res => setCards(res.data.products || []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const totalMonthly = Object.values(spends).reduce((a, b) => a + b, 0);

  const ranked = useMemo(() => {
    return cards
      .map(card => ({ card, ...estimateCard(card, spends) }))
      .sort((a, b) => b.netAnnual - a.netAnnual);
  }, [cards, spends]);

  const best = ranked[0];
  const alternatives = ranked.slice(1, 5);

  return (
    <>
      <Helmet>
        <title>Credit Card Reward Optimizer — Find Your Best Cashback Card | RupeePedia</title>
        <meta name="description" content="Enter your monthly spending across shopping, dining, travel, fuel and bills to find which Indian credit card earns you the most cashback and rewards annually." />
        <link rel="canonical" href="https://rupeepedia.in/credit-cards/reward-optimizer" />
        <meta property="og:title" content="Credit Card Reward Optimizer — Find Your Best Cashback Card" />
        <meta property="og:description" content="Compare estimated annual cashback across credit cards based on your actual monthly spending." />
        <meta property="og:url" content="https://rupeepedia.in/credit-cards/reward-optimizer" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Credit Card Reward Optimizer",
          url: "https://rupeepedia.in/credit-cards/reward-optimizer",
          description: "Estimate annual credit card cashback and rewards based on your monthly spending mix across shopping, dining, travel, fuel, utilities and groceries.",
          applicationCategory: "FinanceApplication",
          operatingSystem: "All",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          provider: { "@type": "Organization", name: "RupeePedia", url: "https://rupeepedia.in" },
        })}</script>
      </Helmet>

      {/* ── Hero ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="force-dark relative overflow-hidden rounded-3xl border border-line bg-surface py-10 md:py-12 px-6 md:px-10">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-160px] right-[-100px] w-[500px] h-[400px] rounded-full opacity-25 blur-[20px]"
                   style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
            </div>
            <div className="relative z-[2]">
              <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to="/credit-cards" className="hover:text-acc transition-colors">Credit Cards</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-acc font-semibold">Reward Optimizer</span>
              </nav>

              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-mint/10 text-mint border border-mint/30 mb-5">
                <Zap className="w-3 h-3" /> AI-Powered Reward &amp; Cashback Optimization
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-[1.1] mb-4">
                Maximize Your Annual <span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Credit Card Cashback</span>
              </h1>
              <p className="text-body text-sm md:text-base leading-relaxed max-w-2xl">
                Enter your monthly spending profile below. We match each card's published reward rate against your spending mix to estimate which one earns you the most this year.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-bg max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading cards…
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">
            Couldn't load credit card data right now. <Link to="/credit-cards" className="text-acc hover:underline">Browse all cards →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── Spending sliders ── */}
            <div className="lg:col-span-7">
              <div className="bg-surface rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-ink text-base">Monthly Spending Habits</h2>
                    <p className="text-xs text-faint mt-0.5">Adjust sliders to match your monthly expenditure</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-faint uppercase tracking-wide">Total Monthly</p>
                    <p className="text-xl font-extrabold text-mint">{fmtINR(totalMonthly)}<span className="text-faint text-sm font-medium"> /mo</span></p>
                  </div>
                </div>

                <div className="space-y-6">
                  {SPEND_CATEGORIES.map(cat => (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="flex items-center gap-2 text-ink font-medium">
                          <span>{cat.icon}</span> {cat.label}
                        </span>
                        <span className="font-mono font-bold text-ink">{fmtINR(spends[cat.key])}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={cat.max}
                        step={cat.step}
                        value={spends[cat.key]}
                        onChange={e => setSpends(s => ({ ...s, [cat.key]: Number(e.target.value) }))}
                        className="w-full accent-mint"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 bg-acc-deep border border-acc/20 rounded-xl p-4 text-xs text-body mt-5">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-acc" />
                <div>
                  Estimate only. We apply each card's published reward rate to spend matching its bonus category (capped where the offer specifies a limit), and a conservative {BASELINE_RATE}% baseline to the rest. Milestone bonuses, welcome offers and exclusions aren't modeled — confirm current terms with the issuer before applying.
                </div>
              </div>
            </div>

            {/* ── Recommendation ── */}
            <div className="lg:col-span-5 space-y-5">
              {best && <BestCard result={best} />}

              {alternatives.length > 0 && (
                <div className="bg-surface rounded-2xl border border-line overflow-hidden">
                  <div className="px-5 py-4 border-b border-line">
                    <h3 className="text-xs font-bold text-faint uppercase tracking-widest">Top Ranked Alternatives</h3>
                  </div>
                  <div className="divide-y divide-line">
                    {alternatives.map((r, i) => (
                      <Link
                        key={r.card.id}
                        to={`/credit-cards/${r.card.slug}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors"
                      >
                        <span className="text-xs font-bold text-faint w-6 shrink-0">#{i + 2}</span>
                        {r.card.bank.logo ? (
                          <img src={r.card.bank.logo} alt="" className="w-8 h-8 rounded-lg object-contain bg-bg-2 border border-line shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-acc-deep flex items-center justify-center text-acc text-xs font-bold shrink-0">
                            {r.card.bank.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink truncate">{r.card.name}</p>
                          <p className="text-[11px] text-faint truncate">{r.card.bank.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-mint">+{fmtINR(r.netAnnual)}</p>
                          <p className="text-[10px] text-faint">est. net / yr</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function BestCard({ result }: { result: { card: CardItem; annualEarn: number; netAnnual: number; returnRate: number } }) {
  const { card, netAnnual, returnRate } = result;
  return (
    <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-surface p-5 shadow-acc-glow">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/15 text-gold">
          <Trophy className="w-3 h-3" /> #1 Best Card For Your Spends
        </span>
        <span className="text-xs font-bold text-mint">{returnRate.toFixed(2)}% Return Rate</span>
      </div>

      <div className="flex items-start gap-3 mb-4">
        {card.bank.logo ? (
          <img src={card.bank.logo} alt="" className="w-11 h-11 rounded-xl object-contain bg-bg-2 border border-line shrink-0" />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-acc-deep flex items-center justify-center text-acc font-bold shrink-0">
            {card.bank.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[10px] text-faint uppercase tracking-wide">{card.bank.name}</p>
          <p className="font-bold text-ink text-base leading-snug">{card.name}</p>
          {card.offer && (
            <p className="text-xs text-mint font-medium mt-0.5">{card.offer.title}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-bg-2 border border-line px-4 py-3 flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-faint uppercase tracking-wide">Est. Net Annual Value</p>
          <p className="text-xl font-extrabold text-mint">+{fmtINR(netAnnual)} <span className="text-faint text-sm font-medium">/yr</span></p>
        </div>
        <p className="text-xs text-faint">Fee: {card.annualFee === 0 ? "FREE" : "₹" + card.annualFee.toLocaleString("en-IN")}</p>
      </div>

      {card.applyUrl ? (
        <a
          href={card.applyUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-br from-mint to-acc text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all hover:-translate-y-px shadow-acc-glow"
        >
          Apply for {card.name} <ArrowRight className="w-4 h-4" />
        </a>
      ) : (
        <Link
          to={`/credit-cards/${card.slug}`}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-br from-mint to-acc text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all hover:-translate-y-px shadow-acc-glow"
        >
          View {card.name} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
