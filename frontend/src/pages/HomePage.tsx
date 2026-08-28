import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { SearchTabs, type SearchTab } from "../components/ui/SearchTabs";
import {
  Landmark, ArrowRight, MapPin, Building,
} from "lucide-react";

const SEARCH_TABS: SearchTab[] = [
  { key: 'ifsc', label: 'IFSC Code', icon: <Building className="w-full h-full" />, placeholder: 'Enter IFSC code, e.g. HDFC0000001', examples: ['HDFC0000001', 'SBIN0000691', 'ICIC0000011'] },
  { key: 'pin', label: 'PIN Code', icon: <MapPin className="w-full h-full" />, placeholder: 'Enter PIN code, e.g. 110001', examples: ['110001', '400001', '560001'] },
  { key: 'bank', label: 'Search by bank', icon: <Landmark className="w-full h-full" />, placeholder: 'Search bank, e.g. HDFC Bank', examples: ['HDFC Bank', 'Axis Bank', 'Kotak Mahindra'] },
];

const TOOLS = [
  {
    to: '/ifsc-finder', feat: true, emoji: '🏦', iconCls: 'bg-acc-deep text-acc',
    ctaCls: 'text-acc', hoverBorderCls: 'hover:border-acc/50',
    title: 'IFSC Code Finder',
    desc: "Search 1.78L branches by code, or drill bank → state → district → branch. NEFT/RTGS/IMPS/UPI status included.",
    cta: 'Find a branch →',
  },
  {
    to: '/pin-codes', feat: true, emoji: '📍', iconCls: 'bg-cyan/10 text-cyan',
    ctaCls: 'text-cyan', hoverBorderCls: 'hover:border-cyan/50',
    title: 'PIN Code Search',
    desc: "Every Indian postal code — find PIN by area, or area, post office & district by PIN.",
    cta: 'Search PIN codes →',
  },
  {
    to: '/calculators', feat: false, emoji: '🧮', iconCls: 'bg-violet-500/10 text-violet',
    ctaCls: 'text-violet', hoverBorderCls: 'hover:border-violet/50',
    title: 'EMI & SIP Calculators',
    desc: 'Home/car/personal EMI, SIP, tax, FD, salary — 30+ tools with instant charts.',
    cta: 'Open calculators →',
  },
  {
    to: '/credit-cards', feat: false, emoji: '💳', iconCls: 'bg-coral/10 text-coral',
    ctaCls: 'text-coral', hoverBorderCls: 'hover:border-coral/50',
    title: 'Compare Credit Cards',
    desc: '50+ cards side by side — cashback, travel, rewards, lifetime-free. Apply in a tap.',
    cta: 'Compare cards →',
  },
  {
    to: '/savings-rates', feat: false, emoji: '🏦', iconCls: 'bg-mint/10 text-mint',
    ctaCls: 'text-mint', hoverBorderCls: 'hover:border-mint/50',
    title: 'Savings & FD Rates',
    desc: 'Compare interest across banks & NBFCs — up to 9.5% p.a., senior rates, all tenures.',
    cta: 'Compare rates →',
  },
  {
    to: '/gold-rate-today', feat: false, emoji: '🪙', iconCls: 'bg-gold/10 text-gold',
    ctaCls: 'text-gold', hoverBorderCls: 'hover:border-gold/50',
    title: 'Live Gold Rate',
    desc: "Today's 22K & 24K gold price across Indian cities, plus hallmark & purity guides.",
    cta: 'Check gold rate →',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ifsc');
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const v = query.trim();
    if (!v) { navigate(activeTab === 'pin' ? '/pin-codes' : '/ifsc-finder'); return; }
    if (activeTab === 'ifsc') navigate(`/ifsc/${v.toUpperCase()}`);
    else if (activeTab === 'pin') navigate(`/pin/${v}`);
    else navigate('/ifsc-finder');
  };

  return (
    <div className="bg-bg">
      <Helmet>
        <title>RupeePedia — IFSC &amp; PIN Codes, Rates, Cards, EMI India</title>
        <meta name="description" content="Find IFSC &amp; PIN codes for 178,000+ bank branches, compare FD/savings rates, credit cards &amp; live gold rates, plus 30+ free calculators." />
        <link rel="canonical" href="https://rupeepedia.in/" />
        <meta property="og:title"       content="RupeePedia — IFSC &amp; PIN Codes, Rates, Cards, EMI India" />
        <meta property="og:description" content="Find IFSC &amp; PIN codes for 178,000+ bank branches, compare FD/savings rates, credit cards &amp; live gold rates, plus 30+ free calculators." />
        <meta property="og:url"         content="https://rupeepedia.in/" />
        <meta property="og:type"        content="website" />
        <meta name="twitter:card"       content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'RupeePedia',
          url: 'https://rupeepedia.in',
          logo: 'https://rupeepedia.in/images/logo.png',
          sameAs: [],
          contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: 'https://rupeepedia.in/contact' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'RupeePedia',
          url: 'https://rupeepedia.in',
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <header className="py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="force-dark relative overflow-hidden rounded-3xl border border-line bg-surface py-10 md:py-12">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[640px] rounded-full opacity-30 blur-[20px]"
                   style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
              <div className="absolute top-[120px] right-[-120px] w-[420px] h-[420px] rounded-full opacity-[.16] blur-[30px]"
                   style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(95,208,255,.4), transparent 70%)' }} />
            </div>

            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-[2]">
              <div className="inline-flex items-center gap-2 bg-bg-2 border border-line-2 rounded-full pl-3 pr-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-acc rounded-full animate-pulse" />
                <span className="text-[.8rem] font-semibold text-ink">Free. No sign-up. No paywall.</span>
              </div>

              <h1 className="font-display text-4xl md:text-6xl font-bold text-ink leading-[1.08] tracking-tight">
                India's <span className="bg-gradient-to-r from-mint to-acc bg-clip-text text-transparent">Banking &amp; Personal Finance</span> Toolkit
              </h1>

              <p className="text-body mb-2 mt-5 text-lg max-w-2xl mx-auto">
                Find IFSC &amp; PIN codes, calculate SIP/EMI/tax, compare credit cards &amp; FD rates — one place, 178,000+ branches, 30+ calculators, no ads getting in the way.
              </p>

              <SearchTabs
                tabs={SEARCH_TABS}
                activeKey={activeTab}
                onTabChange={(k) => { setActiveTab(k); setQuery(''); }}
                value={query}
                onValueChange={setQuery}
                onSubmit={handleSearch}
              />

              <div className="flex items-center justify-center flex-wrap gap-2 mt-6 text-xs">
                <span className="text-faint font-medium mr-1">Quick Jump:</span>
                {[
                  { label: 'Bank IFSC',        to: '/ifsc-finder' },
                  { label: 'Pincodes',         to: '/pin-codes' },
                  { label: 'Home Loan EMI',    to: '/calculators/home-loan-emi' },
                  { label: 'SIP Planner',      to: '/calculators/sip' },
                  { label: 'Bank Holidays',    to: '/bank-holidays' },
                  { label: 'Lifetime Free Cards', to: '/credit-cards?category=Lifetime Free' },
                ].map(item => (
                  <Link key={item.to} to={item.to}
                    className="px-3 py-1.5 rounded-lg bg-bg-2 border border-line-2 text-body font-medium hover:border-acc/40 hover:text-ink transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── TOOLS ── */}
      <section className="py-14 bg-bg-2 border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="font-mono text-xs font-bold text-acc uppercase tracking-widest mb-2 text-center">Everything money, one place</p>
          <h2 className="font-display text-3xl font-bold text-ink mb-2 tracking-tight text-center">Built for the way India banks</h2>
          <p className="text-muted max-w-xl mx-auto text-center">Start with a lookup, stay for the tools. Each one is fast, free, and works right in your browser.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {TOOLS.map((tool) => (
              <Link key={tool.to} to={tool.to}>
                <Card hover feat={tool.feat} className={`h-full flex flex-col ${tool.hoverBorderCls}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-[1.25rem] ${tool.iconCls}`}>
                    {tool.emoji}
                  </div>
                  <h3 className="text-[1.1rem] font-semibold text-ink mb-1.5">{tool.title}</h3>
                  <p className="text-[.9rem] text-muted leading-relaxed flex-1 mb-3.5">{tool.desc}</p>
                  <span className={`text-[.85rem] font-semibold font-mono flex items-center gap-1.5 ${tool.ctaCls}`}>
                    {tool.cta}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / SEO CONTENT ── */}
      <section className="py-14 border-t border-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-ink mb-4 tracking-tight">India's banking &amp; money toolkit, in one place</h2>
          <div className="space-y-4 text-[.95rem] text-muted leading-relaxed">
            <p>
              RupeePedia started as an IFSC code finder and grew into a full personal-finance toolkit.
              Look up the IFSC code or PIN code for any of 178,000+ bank branches across India, drill
              down from bank to state to city, and get NEFT/RTGS/IMPS/UPI support details for every branch —
              all pulled from RBI-published data.
            </p>
            <p>
              Beyond codes, compare FD and savings account rates across banks and small finance banks,
              check today's gold and silver rates by city, and browse 50+ credit cards side by side on
              annual fee, rewards and cashback before you apply. Every comparison table updates from
              live rate data, not stale screenshots.
            </p>
            <p>
              For planning, RupeePedia's calculator suite covers SIP, EMI, CAGR, XIRR, SWP, income tax
              and NRI/RNOR residency status — 30+ calculators in total, each with instant results and no
              signup. Whether you're transferring money, opening a fixed deposit, or planning a SIP,
              it's built to answer the question in one search.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
