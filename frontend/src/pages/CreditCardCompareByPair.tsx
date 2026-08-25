import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronRight, CreditCard, Check, X, ExternalLink } from 'lucide-react';
import { apiClient } from '../utils/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CardProduct {
  id: number;
  name: string;
  slug: string;
  category: string;
  network: string | null;
  cardImageUrl: string | null;
  applyUrl: string | null;
  rating: number | null;
  bank: { name: string; slug: string | null; logo: string | null };
  details: {
    annualFee: number | null;
    joiningFee: number | null;
    minIncome: number | null;
    loungeAccess: number | null;
    rewardType: string | null;
    forexMarkup: number | null;
    annualFeeWaiver: string | null;
  };
  offers: {
    title: string;
    rewardRate: number | null;
    rewardCap: number | null;
    category: string | null;
    isActive: boolean;
  }[];
  features: string[];
}

// ── Pair config ───────────────────────────────────────────────────────────────
interface PairConfig {
  card1Slug: string;
  card2Slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string;
  verdict: string;
  card1Wins: string[];
  card2Wins: string[];
  faqs: { q: string; a: string }[];
}

const COMPARE_PAIRS: Record<string, PairConfig> = {
  'sbi-cashback-vs-hdfc-millennia': {
    card1Slug: 'sbi-cashback-credit-card',
    card2Slug: 'hdfc-millennia-credit-card',
    title: 'SBI Cashback Card vs HDFC Millennia Credit Card 2026 — Which is Better?',
    h1: 'SBI Cashback Card vs HDFC Millennia',
    description: 'Compare SBI Cashback Credit Card vs HDFC Millennia Credit Card. Annual fees, cashback rates, reward categories, and who should apply in 2026.',
    keywords: 'sbi cashback vs hdfc millennia, sbi cashback card vs hdfc millennia credit card, hdfc millennia vs sbi cashback, which is better sbi cashback or hdfc millennia, sbi cashback credit card review, hdfc millennia review 2026',
    verdict: 'Both are top cashback cards. SBI Cashback gives 5% on online spends (all merchants) making it simpler. HDFC Millennia gives 5% only on specific partner portals but adds dining and lounge benefits. Pick SBI Cashback if most spending is online; HDFC Millennia if you want lounge access + dining rewards.',
    card1Wins: [
      '5% cashback on ALL online spends (not just partner merchants)',
      'Lower joining fee',
      'Simpler redemption — auto-credited to statement',
      'Better for Amazon, Zomato, Swiggy, and any website',
    ],
    card2Wins: [
      '5% cashback on Flipkart, Amazon, Myntra, Swiggy, Zomato specifically',
      '2.5% cashback at other online merchants',
      'Complimentary airport lounge access (2 per quarter)',
      'Better overall lifestyle card for dining + shopping',
    ],
    faqs: [
      {
        q: 'Which gives better cashback — SBI Cashback Card or HDFC Millennia?',
        a: 'For pure online spends across all merchants, SBI Cashback Card wins — it gives 5% cashback on all online transactions regardless of merchant. HDFC Millennia gives 5% only on select partner platforms (Flipkart, Amazon, Myntra, Swiggy, Zomato, BookMyShow, Cult.fit) but gives a higher overall value if you use those specific apps heavily.',
      },
      {
        q: 'Does HDFC Millennia have lounge access?',
        a: 'Yes. HDFC Millennia offers 2 complimentary domestic airport lounge visits per quarter (8 per year) via the Visa Lounge Access program. SBI Cashback Card does not offer any lounge access — it is a pure cashback card.',
      },
      {
        q: 'Which card is better for UPI payments?',
        a: 'Neither card gives strong rewards on UPI transactions currently. RuPay credit cards (like HDFC Bank UPI credit card) are better for UPI cashback. For general spending outside UPI, SBI Cashback gives flat 5% on online payments.',
      },
      {
        q: 'What is the annual fee for SBI Cashback vs HDFC Millennia?',
        a: 'SBI Cashback Credit Card has a ₹999 annual fee (waived on ₹2 lakh annual spend). HDFC Millennia has a ₹1,000 annual fee (waived on ₹1 lakh annual spend in the preceding year). Both have similar fee waivers but HDFC Millennia\'s waiver threshold is lower.',
      },
    ],
  },

  'icici-amazon-pay-vs-sbi-cashback': {
    card1Slug: 'icici-amazon-pay-credit-card',
    card2Slug: 'sbi-cashback-credit-card',
    title: 'Amazon Pay ICICI Credit Card vs SBI Cashback Card 2026 — Which is Better?',
    h1: 'Amazon Pay ICICI Card vs SBI Cashback Card',
    description: 'Compare Amazon Pay ICICI Credit Card vs SBI Cashback Credit Card. Cashback rates, Amazon benefits, annual fees, and which card suits you best in 2026.',
    keywords: 'amazon pay icici vs sbi cashback, icici amazon pay vs sbi cashback card, amazon pay credit card vs sbi cashback, which is better amazon pay icici or sbi cashback, icici amazon pay credit card review 2026',
    verdict: 'Amazon Pay ICICI Card is lifetime-free and gives 5% on Amazon for Prime members — unbeatable for heavy Amazon shoppers with no annual fee. SBI Cashback gives 5% on all online merchants, not just Amazon, making it more versatile. If Amazon is your primary shopping platform, Amazon Pay ICICI wins. For broader online shopping, SBI Cashback wins.',
    card1Wins: [
      'Lifetime FREE — zero annual or joining fee',
      '5% cashback on Amazon (Prime members), 3% for non-Prime',
      '2% on paying utility bills via Amazon Pay',
      'No credit limit impact — treat as a co-branded card',
    ],
    card2Wins: [
      '5% cashback on ALL online merchants (not just Amazon)',
      'Works well for Flipkart, Myntra, Swiggy, Zomato, Nykaa',
      'Cashback auto-credited to statement balance',
      'Better for diversified online spending',
    ],
    faqs: [
      {
        q: 'Is Amazon Pay ICICI Card better than SBI Cashback Card?',
        a: 'Depends on your spending. Amazon Pay ICICI Card is better if you primarily shop on Amazon and are an Amazon Prime member (5% cashback + no annual fee). SBI Cashback Card is better if you shop across multiple online platforms — it gives 5% cashback on all online spends, not just Amazon.',
      },
      {
        q: 'Is Amazon Pay ICICI Credit Card lifetime free?',
        a: 'Yes. Amazon Pay ICICI Credit Card has zero joining fee and zero annual fee — it is completely lifetime free. SBI Cashback Credit Card charges ₹999 annual fee (waived on ₹2 lakh spend).',
      },
      {
        q: 'What cashback does Amazon Pay ICICI Card give on non-Amazon purchases?',
        a: 'Amazon Pay ICICI Card gives 1% cashback on non-Amazon online transactions and 1% on offline transactions. SBI Cashback Card gives 5% on all online transactions regardless of merchant, making it significantly better for non-Amazon online shopping.',
      },
      {
        q: 'Which card is better for monthly grocery and utility spends?',
        a: 'Amazon Pay ICICI gives 2% on utilities via Amazon Pay and 1% elsewhere. SBI Cashback gives 5% on online transactions but 0% on offline grocery stores. If you pay utilities via Amazon Pay, the ICICI card wins for that category. For online grocery (BigBasket, Blinkit), SBI Cashback at 5% is better.',
      },
    ],
  },

  'axis-ace-vs-sbi-cashback': {
    card1Slug: 'axis-bank-ace-credit-card',
    card2Slug: 'sbi-cashback-credit-card',
    title: 'Axis ACE Credit Card vs SBI Cashback Card 2026 — Which is Better?',
    h1: 'Axis ACE Card vs SBI Cashback Card',
    description: 'Compare Axis ACE Credit Card vs SBI Cashback Credit Card in 2026. Cashback rates on Google Pay, utilities, annual fees, and which card wins for everyday spend.',
    keywords: 'axis ace vs sbi cashback, axis ace credit card vs sbi cashback, which is better axis ace or sbi cashback, axis ace card review 2026, sbi cashback vs axis ace',
    verdict: 'Axis ACE is the better everyday cashback card — 5% on Google Pay (bills, food, grocery), 4% on Swiggy/Zomato/Ola, flat 2% on everything else, lifetime free. SBI Cashback wins for pure online shopping (5% across all merchants). If you pay bills via Google Pay or use Swiggy/Zomato/Ola heavily, Axis ACE leads.',
    card1Wins: [
      '5% cashback on Google Pay — electricity, gas, mobile, insurance bills',
      '4% cashback on Swiggy, Zomato, Ola',
      'Flat 2% cashback on ALL other spends (best base rate)',
      'Lifetime FREE — no annual or joining fee',
    ],
    card2Wins: [
      '5% cashback on ALL online merchants (broader than ACE)',
      'Better for large-ticket online purchases on any platform',
      'Cashback auto-credited as statement credit',
    ],
    faqs: [
      {
        q: 'Which is better — Axis ACE or SBI Cashback Card?',
        a: 'Axis ACE is better if you pay utility bills via Google Pay (5% cashback) or use Swiggy, Zomato, or Ola frequently (4% cashback). It also gives a flat 2% on everything else and is lifetime free. SBI Cashback Card is better for pure online shopping — it gives 5% on all online transactions across any merchant. If your spend is split between bills, food delivery, and general online shopping, Axis ACE has the broader value.',
      },
      {
        q: 'Is Axis ACE Credit Card lifetime free?',
        a: 'Yes. Axis ACE Credit Card is lifetime free with zero annual fee and zero joining fee. SBI Cashback Card charges ₹999 annual fee (waived on spending ₹2 lakh in a year).',
      },
      {
        q: 'Does Axis ACE give cashback on UPI payments via Google Pay?',
        a: 'Yes — 5% cashback applies on Google Pay bill payments (utility bills, mobile recharges, insurance). However, direct UPI transfers (peer-to-peer money transfers) do not earn cashback. The 5% is specific to merchant bill payments made through Google Pay.',
      },
      {
        q: 'What is the monthly cashback cap on Axis ACE?',
        a: 'Axis ACE Credit Card has a cashback cap — typically ₹500/month on the 5% Google Pay category and ₹1,000/month overall. SBI Cashback Card also has a cap — typically 5% cashback is capped at ₹5,000/month. Check the latest terms on the respective bank websites before applying.',
      },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatINR(v: number | null): string {
  if (v === null || v === 0) return 'FREE';
  return '₹' + v.toLocaleString('en-IN');
}

function useCard(slug: string) {
  return useQuery<CardProduct>({
    queryKey: ['product', slug],
    queryFn:  () => apiClient.get(`/products/${slug}`).then(r => r.data),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────
function CardColumn({ card, accent }: { card: CardProduct; accent: string }) {
  const activeOffer = card.offers.find(o => o.isActive) ?? card.offers[0];
  return (
    <div className={`bg-surface rounded-2xl border-t-4 ${accent} border border-line overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="p-5 border-b border-line">
        <div className="flex items-center gap-3 mb-3">
          {card.bank.logo
            ? <img src={card.bank.logo} alt={card.bank.name} className="w-9 h-9 object-contain rounded-lg border border-line" />
            : <div className="w-9 h-9 bg-acc-deep rounded-lg flex items-center justify-center text-acc font-bold">{card.bank.name[0]}</div>}
          <div>
            <div className="font-bold text-ink text-sm leading-tight">{card.name}</div>
            <div className="text-xs text-faint">{card.bank.name}</div>
          </div>
        </div>
        {card.cardImageUrl && (
          <img src={card.cardImageUrl} alt={card.name} className="w-full h-32 object-contain rounded-xl mb-3" />
        )}
        {card.applyUrl && (
          <a href={card.applyUrl} target="_blank" rel="noopener noreferrer sponsored"
            className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-gradient-to-br from-mint to-acc hover:-translate-y-px hover:shadow-acc-glow-lg text-white rounded-xl text-xs font-bold shadow-acc-glow transition-all">
            Apply Now <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Fees */}
      <div className="p-5 space-y-2 text-sm border-b border-line">
        <div className="flex justify-between items-center">
          <span className="text-faint text-xs">Annual Fee</span>
          <span className="font-bold text-ink">{formatINR(card.details.annualFee)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-faint text-xs">Joining Fee</span>
          <span className="font-bold text-ink">{formatINR(card.details.joiningFee)}</span>
        </div>
        {card.details.annualFeeWaiver && (
          <div className="text-[11px] text-faint italic">{card.details.annualFeeWaiver}</div>
        )}
        {card.details.minIncome && (
          <div className="flex justify-between items-center">
            <span className="text-faint text-xs">Min Income</span>
            <span className="font-semibold text-body">{formatINR(card.details.minIncome)}/yr</span>
          </div>
        )}
        {card.details.forexMarkup != null && (
          <div className="flex justify-between items-center">
            <span className="text-faint text-xs">Forex Markup</span>
            <span className="font-semibold text-body">{card.details.forexMarkup}%</span>
          </div>
        )}
        {card.details.loungeAccess != null && (
          <div className="flex justify-between items-center">
            <span className="text-faint text-xs">Lounge Access</span>
            <span className="font-semibold text-body">{card.details.loungeAccess}/yr</span>
          </div>
        )}
      </div>

      {/* Top offer */}
      {activeOffer && (
        <div className="p-5 border-b border-line">
          <div className="text-[10px] font-bold uppercase tracking-wide text-faint mb-1.5">Top Offer</div>
          <div className="text-sm font-semibold text-acc">{activeOffer.title}</div>
          {activeOffer.rewardRate && (
            <div className="text-xs text-muted mt-0.5">{activeOffer.rewardRate}% cashback/rewards</div>
          )}
        </div>
      )}

      {/* Features */}
      {card.features.length > 0 && (
        <div className="p-5 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wide text-faint mb-2">Features</div>
          <ul className="space-y-1">
            {card.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-xs text-body">
                <Check className="w-3.5 h-3.5 text-mint flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-5 border-t border-line">
        <Link to={`/credit-cards/${card.slug}`}
          className="text-xs font-semibold text-acc hover:text-ink transition-colors">
          Full {card.name} review →
        </Link>
      </div>
    </div>
  );
}

function FeatureGrid({ card1, card2 }: { card1: CardProduct; card2: CardProduct }) {
  const all = [...new Set([...card1.features, ...card2.features])].sort();
  if (all.length === 0) return null;
  return (
    <div className="bg-surface rounded-2xl border border-line overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="font-bold text-ink">Feature Checklist</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 text-xs text-faint uppercase tracking-wide">
              <th className="text-left px-5 py-2.5 font-semibold">Feature</th>
              <th className="text-center px-5 py-2.5 font-semibold">{card1.bank.name}</th>
              <th className="text-center px-5 py-2.5 font-semibold">{card2.bank.name}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {all.map(f => (
              <tr key={f} className="hover:bg-surface-2 transition-colors">
                <td className="px-5 py-3 text-body">{f}</td>
                <td className="px-5 py-3 text-center">
                  {card1.features.includes(f)
                    ? <Check className="w-4 h-4 text-mint mx-auto" />
                    : <X className="w-4 h-4 text-faint mx-auto" />}
                </td>
                <td className="px-5 py-3 text-center">
                  {card2.features.includes(f)
                    ? <Check className="w-4 h-4 text-mint mx-auto" />
                    : <X className="w-4 h-4 text-faint mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CreditCardCompareByPair() {
  const { pair = '' } = useParams<{ pair: string }>();
  const config = COMPARE_PAIRS[pair];

  const { data: card1, isLoading: l1, isError: e1 } = useCard(config?.card1Slug ?? '');
  const { data: card2, isLoading: l2, isError: e2 } = useCard(config?.card2Slug ?? '');

  if (!config) {
    return (
      <div className="bg-bg min-h-screen max-w-4xl mx-auto px-4 py-24 text-center">
        <CreditCard className="w-12 h-12 text-faint mx-auto mb-4" />
        <h1 className="text-xl font-bold text-ink mb-2">Comparison not found</h1>
        <p className="text-muted text-sm mb-4">We don't have this comparison yet.</p>
        <Link to="/credit-cards" className="text-acc hover:text-ink text-sm font-semibold">Browse all credit cards →</Link>
      </div>
    );
  }

  const isLoading = l1 || l2;
  const hasError  = (e1 || !card1) && (e2 || !card2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://rupeepedia.in' },
          { '@type': 'ListItem', position: 2, name: 'Credit Cards', item: 'https://rupeepedia.in/credit-cards' },
          { '@type': 'ListItem', position: 3, name: config.h1,      item: `https://rupeepedia.in/credit-cards/compare/${pair}` },
        ],
      },
      {
        '@type': 'WebPage',
        name: config.title,
        url:  `https://rupeepedia.in/credit-cards/compare/${pair}`,
        description: config.description,
        provider: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: config.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  const otherPairs = Object.keys(COMPARE_PAIRS)
    .filter(k => k !== pair)
    .map(k => ({ to: `/credit-cards/compare/${k}`, label: COMPARE_PAIRS[k].h1 }));

  return (
    <>
      <Helmet>
        <title>{config.title} | RupeePedia</title>
        <meta name="description" content={config.description} />
        <meta name="keywords"    content={config.keywords} />
        <link rel="canonical" href={`https://rupeepedia.in/credit-cards/compare/${pair}`} />
        <meta property="og:title"       content={config.title} />
        <meta property="og:description" content={config.description} />
        <meta property="og:url"         content={`https://rupeepedia.in/credit-cards/compare/${pair}`} />
        <meta property="og:type"        content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-bg">

        {/* Hero */}
        <header className="py-8 md:py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
              <div className="absolute inset-0 pointer-events-none overflow-hidden" />
              <div className="relative z-[2]">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                  <nav className="flex items-center gap-1.5 text-xs text-faint mb-6 flex-wrap font-mono">
                    <Link to="/" className="hover:text-acc transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/credit-cards" className="hover:text-acc transition-colors">Credit Cards</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-acc font-semibold">{config.h1}</span>
                  </nav>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-acc-deep rounded-2xl flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-acc" />
                    </div>
                    <div>
                      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink">{config.h1}</h1>
                      <p className="text-muted mt-1 text-sm">Credit card comparison — 2026</p>
                    </div>
                  </div>
                  <p className="text-body text-base max-w-2xl">{config.verdict}</p>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* Loading */}
          {isLoading && (
            <div className="bg-surface rounded-2xl p-12 text-center border border-line">
              <div className="w-8 h-8 border-2 border-acc border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-faint text-sm">Loading card details…</p>
            </div>
          )}

          {/* Error / cards not in DB yet */}
          {!isLoading && hasError && (
            <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6 text-center">
              <p className="text-gold text-sm font-semibold mb-2">Card data not available yet</p>
              <p className="text-gold/80 text-xs mb-4">We're adding these cards to our database. Check back soon or browse all cards below.</p>
              <Link to="/credit-cards" className="text-acc hover:text-ink text-sm font-semibold">Browse all credit cards →</Link>
            </div>
          )}

          {/* Side-by-side card columns */}
          {!isLoading && card1 && card2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardColumn card={card1} accent="border-t-mint" />
              <CardColumn card={card2} accent="border-t-acc" />
            </div>
          )}

          {/* Partial load — show what we have */}
          {!isLoading && (card1 || card2) && !(card1 && card2) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {card1 && <CardColumn card={card1} accent="border-t-mint" />}
              {card2 && <CardColumn card={card2} accent="border-t-acc" />}
              {(!card1 || !card2) && (
                <div className="bg-surface rounded-2xl border border-dashed border-line-2 p-10 flex flex-col items-center justify-center text-center gap-3">
                  <CreditCard className="w-10 h-10 text-faint" />
                  <p className="text-sm text-faint">Card details coming soon</p>
                </div>
              )}
            </div>
          )}

          {/* Feature grid */}
          {!isLoading && card1 && card2 && <FeatureGrid card1={card1} card2={card2} />}

          {/* Who should choose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-mint/10 rounded-2xl p-5 border border-mint/25">
              <div className="font-bold text-mint mb-1 text-sm">
                Choose {card1?.name ?? config.card1Slug.replace(/-credit-card$/, '').replace(/-/g, ' ')} if…
              </div>
              <ul className="text-sm text-body space-y-1.5 mt-2">
                {config.card1Wins.map(w => <li key={w}>• {w}</li>)}
              </ul>
            </div>
            <div className="bg-acc-deep rounded-2xl p-5 border border-acc/25">
              <div className="font-bold text-acc mb-1 text-sm">
                Choose {card2?.name ?? config.card2Slug.replace(/-credit-card$/, '').replace(/-/g, ' ')} if…
              </div>
              <ul className="text-sm text-body space-y-1.5 mt-2">
                {config.card2Wins.map(w => <li key={w}>• {w}</li>)}
              </ul>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {config.faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>

          {/* Other comparisons */}
          {otherPairs.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-3">More Card Comparisons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherPairs.map(item => (
                  <Link key={item.to} to={item.to}
                    className="bg-surface rounded-xl p-4 border border-line hover:border-acc transition-all group">
                    <div className="font-semibold text-ink text-sm group-hover:text-acc transition-colors">{item.label}</div>
                  </Link>
                ))}
              </div>
              <div className="mt-3">
                <Link to="/credit-cards" className="text-sm text-acc hover:text-ink font-semibold transition-colors">← Browse all credit cards</Link>
              </div>
            </div>
          )}

          <p className="text-xs text-faint text-center pb-4">
            Card details sourced from official bank websites. Always verify fees and offers before applying.
          </p>
        </div>
      </div>
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0 sm:border-0 sm:bg-surface sm:rounded-xl sm:border sm:border-line sm:overflow-hidden">
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex justify-between items-center py-4 sm:px-5 text-left text-sm font-semibold text-ink hover:text-acc sm:hover:bg-surface-2 transition-colors">
        <span>{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-acc flex-shrink-0 ml-3" />
          : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0 ml-3" />
        }
      </button>
      {open && (
        <div className="pb-4 sm:px-5 text-sm text-muted leading-relaxed sm:border-t sm:border-line sm:pt-3">{a}</div>
      )}
    </div>
  );
}
