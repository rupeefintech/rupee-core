import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Flame, ArrowRight } from 'lucide-react';
import { calculatorCategories, CalcItem } from '../utils/calculators';

const catHeaderColors: Record<string, { iconBg: string; iconColor: string }> = {
  blue:   { iconBg: 'bg-acc-deep',  iconColor: 'text-acc' },
  green:  { iconBg: 'bg-mint/10',   iconColor: 'text-mint' },
  purple: { iconBg: 'bg-violet-500/10', iconColor: 'text-violet' },
  amber:  { iconBg: 'bg-gold/10',   iconColor: 'text-gold' },
};

const POPULAR_LABELS = new Set([
  'Home Loan EMI', 'Personal Loan EMI', 'SIP Calculator', 'FD Calculator',
  'Income Tax Calculator', 'Loan Against Property',
]);

const totalCalcCount = calculatorCategories.reduce((n, c) => n + c.items.length, 0);

function CalcCard({ item, categoryTitle }: { item: CalcItem; categoryTitle: string }) {
  const Icon = item.icon;
  const popular = POPULAR_LABELS.has(item.label);
  return (
    <Link
      to={item.path}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 hover:border-line-2 hover:bg-surface-2 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {popular && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-gold/15 text-gold">
              <Flame className="w-2.5 h-2.5" /> Popular
            </span>
          )}
        </div>
      </div>
      <h3 className="font-bold text-ink text-[15px] mb-1.5">{item.label}</h3>
      <p className="text-xs text-muted leading-relaxed flex-1">{item.desc}</p>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
        <span className="text-[11px] text-faint">{categoryTitle}</span>
        <span className="text-xs font-semibold text-acc flex items-center gap-1 group-hover:gap-1.5 transition-all">
          Calculate Now <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

export default function CalculatorsIndexPage() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtering = q.length > 0 || activeCat !== null;

  const filteredFlat = useMemo(() => {
    if (!filtering) return [];
    const out: { item: CalcItem; categoryTitle: string }[] = [];
    for (const cat of calculatorCategories) {
      if (activeCat && cat.title !== activeCat) continue;
      for (const item of cat.items) {
        if (q && !item.label.toLowerCase().includes(q) && !item.desc.toLowerCase().includes(q)) continue;
        out.push({ item, categoryTitle: cat.title });
      }
    }
    return out;
  }, [q, activeCat, filtering]);

  return (
    <>
      <Helmet>
        <title>Free Financial Calculators India — EMI, SIP, FD, Income Tax, GST | RupeePedia</title>
        <meta name="description" content="Free financial calculators for India — EMI, SIP, FD, PPF, income tax (old vs new regime), GST, HRA, salary, NPS, and more. Plan loans, investments, and taxes instantly." />
        <link rel="canonical" href="https://rupeepedia.in/calculators" />
        <meta property="og:title" content="Free Financial Calculators India — EMI, SIP, FD, Income Tax, GST" />
        <meta property="og:description" content="Free financial calculators for India — EMI, SIP, FD, PPF, income tax, GST, HRA, salary, and more. Plan your finances instantly." />
        <meta property="og:url" content="https://rupeepedia.in/calculators" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Free Financial Calculators India — EMI, SIP, FD, Tax" />
        <meta name="twitter:description" content="Free Indian financial calculators — EMI, SIP, FD, income tax, GST, HRA, salary, and more." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "name": "Free Financial Calculators India",
              "url": "https://rupeepedia.in/calculators",
              "description": "Free financial calculators for India — EMI, SIP, FD, PPF, income tax, GST, HRA, salary, NPS, and more.",
              "provider": { "@type": "Organization", "name": "RupeePedia", "url": "https://rupeepedia.in" }
            },
            {
              "@type": "ItemList",
              "name": "Financial Calculators",
              "url": "https://rupeepedia.in/calculators",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "EMI Calculator", "url": "https://rupeepedia.in/calculators/emi" },
                { "@type": "ListItem", "position": 2, "name": "SIP Calculator", "url": "https://rupeepedia.in/calculators/sip" },
                { "@type": "ListItem", "position": 3, "name": "FD Calculator", "url": "https://rupeepedia.in/calculators/fd" },
                { "@type": "ListItem", "position": 4, "name": "Income Tax Calculator", "url": "https://rupeepedia.in/calculators/income-tax" },
                { "@type": "ListItem", "position": 5, "name": "GST Calculator", "url": "https://rupeepedia.in/calculators/gst" },
                { "@type": "ListItem", "position": 6, "name": "Salary Calculator", "url": "https://rupeepedia.in/calculators/salary-calculator" },
                { "@type": "ListItem", "position": 7, "name": "PPF Calculator", "url": "https://rupeepedia.in/calculators/ppf" },
                { "@type": "ListItem", "position": 8, "name": "HRA Calculator", "url": "https://rupeepedia.in/calculators/hra-calculator" }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I calculate EMI for a home loan in India?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Use the EMI Calculator at rupeepedia.in/calculators/emi. Enter the loan amount, interest rate, and tenure. The formula is: EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, and n is number of months." }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between old and new income tax regime in India?",
                  "acceptedAnswer": { "@type": "Answer", "text": "The old regime allows deductions (80C, HRA, home loan interest, etc.) while the new regime has lower tax rates but no deductions. Use the Income Tax Calculator at rupeepedia.in/calculators/income-tax to compare both regimes and see which saves more tax for your income." }
                },
                {
                  "@type": "Question",
                  "name": "How much can I invest in SIP to get ₹1 crore?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Use the SIP Calculator at rupeepedia.in/calculators/sip. For example, investing ₹5,000/month at 12% annual returns for 15 years gives approximately ₹50 lakh. To reach ₹1 crore, you'd need about ₹10,000/month for 15 years at 12% returns." }
                }
              ]
            }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
            { '@type': 'ListItem', position: 2, name: 'Financial Calculators', item: 'https://rupeepedia.in/calculators' },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-bg">
        {/* Hero */}
        <header className="py-8 md:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="force-dark relative overflow-hidden rounded-3xl border border-line bg-surface py-12 md:py-16">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(60% 90% at 20% 10%, var(--acc-glow), transparent 65%)' }} />
              <div className="max-w-4xl mx-auto px-4 text-center relative">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-acc-deep text-acc border border-acc/30 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-acc animate-pulse" />
                  {totalCalcCount}+ Free Indian Financial Calculators
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-[1.1] mb-4">
                  Plan, Calculate &amp; <span className="bg-gradient-to-r from-acc to-cyan bg-clip-text text-transparent">Optimize Every Rupee</span>
                </h1>
                <p className="text-body text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-6">
                  Verified calculators for Home Loan EMI, SIP wealth projection, Old vs New tax regime, PPF, NPS, and NRI planning — instant results, no signup.
                </p>
                <div className="relative max-w-lg mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search calculator by name, loan type, or investment…"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-surface border border-line-2 text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-acc/20 focus:border-acc transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Category filter pills */}
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setActiveCat(null)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                activeCat === null && !q
                  ? 'bg-gradient-to-br from-acc to-acc-2 text-white border-transparent shadow-acc-glow'
                  : 'bg-surface text-muted border-line hover:border-acc/40'
              }`}
            >
              All Calculators
            </button>
            {calculatorCategories.map(cat => {
              const CatIcon = cat.categoryIcon;
              const active = activeCat === cat.title;
              return (
                <button
                  key={cat.title}
                  onClick={() => setActiveCat(active ? null : cat.title)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-br from-acc to-acc-2 text-white border-transparent shadow-acc-glow'
                      : 'bg-surface text-muted border-line hover:border-acc/40'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" /> {cat.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10">
          {filtering ? (
            filteredFlat.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFlat.map(({ item, categoryTitle }) => (
                  <CalcCard key={item.path} item={item} categoryTitle={categoryTitle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-body font-semibold mb-1">No calculators match &quot;{query}&quot;</p>
                <p className="text-sm text-faint">Try a different search term or clear the category filter.</p>
              </div>
            )
          ) : (
            calculatorCategories.map((cat) => {
              const CatIcon = cat.categoryIcon;
              const hdr = catHeaderColors[cat.color];
              return (
                <div key={cat.title}>
                  {/* Category header */}
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hdr.iconBg}`}>
                      <CatIcon className={`w-4.5 h-4.5 ${hdr.iconColor}`} />
                    </div>
                    <h2 className="text-lg font-bold text-ink">{cat.title}</h2>
                  </div>

                  {/* Calculator cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cat.items.map((item) => (
                      <CalcCard key={item.path} item={item} categoryTitle={cat.title} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
