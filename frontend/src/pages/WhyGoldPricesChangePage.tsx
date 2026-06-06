import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export default function WhyGoldPricesChangePage() {
  return (
    <>
      <Helmet>
        <title>Why Gold Prices Change Daily in India — 8 Key Factors | RupeePedia</title>
        <meta name="description" content="Gold prices in India change daily due to USD/INR exchange rate, US Federal Reserve policy, global demand, import duty, and more. Full explanation of all 8 factors that drive gold rate movements." />
        <link rel="canonical" href="https://rupeepedia.in/why-gold-prices-change" />
        <meta property="og:title" content="Why Gold Prices Change Daily in India — 8 Key Factors" />
        <meta property="og:description" content="Gold prices change daily due to USD/INR rate, Fed policy, global demand, import duty, and inflation. Learn all 8 key factors." />
        <meta property="og:url" content="https://rupeepedia.in/why-gold-prices-change" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: 'Why Gold Prices Change Daily in India — 8 Key Factors',
              url: 'https://rupeepedia.in/why-gold-prices-change',
              description: 'Gold prices in India change daily due to multiple factors: USD/INR exchange rate, US Federal Reserve policy, global demand from China and India, import duties, inflation, and more.',
              author: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
              publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in', logo: { '@type': 'ImageObject', url: 'https://rupeepedia.in/logo.png' } },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                  { '@type': 'ListItem', position: 2, name: 'Gold Rate Today', item: 'https://rupeepedia.in/gold-rate-today' },
                  { '@type': 'ListItem', position: 3, name: 'Why Gold Prices Change', item: 'https://rupeepedia.in/why-gold-prices-change' },
                ],
              },
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'Why do gold prices change every day in India?', acceptedAnswer: { '@type': 'Answer', text: 'Gold prices in India change every day because India imports most of its gold, so the price is tied to the international COMEX/LBMA spot price in USD. Daily changes in the USD/INR exchange rate, global gold demand, US Federal Reserve interest rate decisions, geopolitical events, and commodity market movements all cause daily fluctuations.' } },
                { '@type': 'Question', name: 'What happens to gold price when the rupee weakens?', acceptedAnswer: { '@type': 'Answer', text: 'When the Indian rupee weakens against the US dollar (higher USD/INR rate), gold becomes more expensive in India even if the international price stays the same. For example, if international gold is $2,000/oz and USD/INR moves from ₹83 to ₹85, India\'s gold price increases by about ₹200/10g due to the rupee depreciation alone.' } },
                { '@type': 'Question', name: 'Does RBI control gold prices in India?', acceptedAnswer: { '@type': 'Answer', text: 'No. The RBI does not directly control gold prices. Gold prices in India are determined by international markets (COMEX/LBMA), converted to INR by the IBJA (Indian Bullion and Jewellers Association) twice daily. The government indirectly influences prices through import duties (currently 15% customs + 3% GST).' } },
                { '@type': 'Question', name: 'Is it better to buy gold when prices are falling?', acceptedAnswer: { '@type': 'Answer', text: 'For long-term investment purposes, buying gold at lower prices is generally better. However, timing the market precisely is difficult. Financial advisors recommend using gold as 5–15% of your total portfolio as a hedge, rather than trying to trade based on short-term price movements.' } },
              ],
            },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-500 text-white px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-1.5 text-yellow-100 text-xs mb-5">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/gold-rate-today" className="hover:text-white">Gold Rate Today</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">Why Gold Prices Change</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Why Gold Prices Change Daily in India</h1>
            <p className="text-yellow-100 text-lg">8 key factors that drive gold rate movements</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

          {/* Intro */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">How India's Gold Price is Set</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              India imports over 90% of its gold consumption. The domestic gold price is therefore directly linked to the <strong>international spot price</strong> (traded on COMEX in New York and LBMA in London) converted into Indian Rupees. The <strong>IBJA (Indian Bullion and Jewellers Association)</strong> announces the benchmark rate twice daily — this is what jewellers and importers use.
            </p>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm">
              <p className="font-semibold text-yellow-800 mb-1">The formula</p>
              <p className="text-yellow-700 font-mono">India Gold Price = (International $/oz ÷ 31.1) × 10 × USD/INR + Import Duty + GST</p>
            </div>
          </section>

          {/* 8 factors */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-5">8 Factors That Change Gold Prices</h2>
            <div className="space-y-5">
              {[
                {
                  n: '1', title: 'USD/INR Exchange Rate',
                  icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50',
                  impact: 'Very High',
                  body: 'Since gold is priced in USD globally, any change in the Rupee-Dollar rate directly impacts India\'s gold price. When INR weakens (say ₹83 → ₹85 per USD), gold becomes costlier for Indian buyers even if international price holds steady. The exchange rate alone can move Indian gold prices by ₹100–300/10g on a single day.',
                },
                {
                  n: '2', title: 'International Spot Price (COMEX/LBMA)',
                  icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50',
                  impact: 'Very High',
                  body: 'Gold is traded 24 hours a day, 5 days a week on global exchanges. COMEX (New York) and LBMA (London) set the global benchmark. Geopolitical events, economic crises, or major market moves can shift the international price by $20–50/oz in a day, translating to ₹500–1,300/10g in India.',
                },
                {
                  n: '3', title: 'US Federal Reserve Interest Rate',
                  icon: TrendingDown, color: 'text-blue-600', bg: 'bg-blue-50',
                  impact: 'High',
                  body: 'Gold and US interest rates have an inverse relationship. When the Fed raises rates, the US dollar strengthens and gold becomes less attractive (since gold pays no interest). When the Fed cuts rates or signals dovish policy, gold prices typically rise. Fed meetings and statements are the biggest single catalyst for gold price movements globally.',
                },
                {
                  n: '4', title: 'Import Duty & Government Policy',
                  icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50',
                  impact: 'Medium-High',
                  body: 'India imposes a basic customs duty (currently 15%) + AIDC (Agriculture Infrastructure & Development Cess) on gold imports. Changes in import duty immediately affect domestic prices. When India raised import duty from 10% to 15% in July 2022, gold prices jumped ₹3,000–4,000/10g overnight.',
                },
                {
                  n: '5', title: 'Inflation & Inflation Expectations',
                  icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50',
                  impact: 'Medium',
                  body: 'Gold is considered an inflation hedge. When inflation rises or is expected to rise, investors buy gold as a store of value, pushing prices up. India\'s retail inflation (CPI) and US CPI data releases often cause gold price movements.',
                },
                {
                  n: '6', title: 'Geopolitical Events & Crises',
                  icon: TrendingUp, color: 'text-gray-600', bg: 'bg-gray-50',
                  impact: 'Medium-High',
                  body: 'Wars, elections, and geopolitical tensions drive investors towards gold as a "safe haven" asset. Russia-Ukraine war (2022), COVID-19 pandemic (2020), and Middle East tensions have all caused major gold price spikes. These events reduce investor confidence in equities and currencies.',
                },
                {
                  n: '7', title: 'India\'s Domestic Demand (Festivals & Weddings)',
                  icon: TrendingUp, color: 'text-pink-600', bg: 'bg-pink-50',
                  impact: 'Low-Medium',
                  body: 'India is the world\'s second largest gold consumer. Demand spikes during Dhanteras, Akshaya Tritiya, Dussehra, wedding season (Oct–Feb), and harvest festivals. While domestic demand rarely moves international prices, it can cause 1–3% premium over international prices during peak seasons due to import constraints.',
                },
                {
                  n: '8', title: 'Central Bank Buying',
                  icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50',
                  impact: 'Medium',
                  body: 'Central banks worldwide (including RBI) buy gold to diversify foreign exchange reserves. Large purchases by China, Russia, or India signal confidence in gold and push prices up. RBI regularly adds to India\'s gold reserves, which now exceed 800 tonnes. When multiple central banks buy simultaneously, it creates sustained upward price pressure.',
                },
              ].map(({ n, title, icon: Icon, color, bg, impact, body }) => (
                <div key={n} className={`rounded-xl border p-4 ${bg} border-opacity-50`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0 ${color} shadow-sm`}>{n}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="font-bold text-gray-900">{title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-white ${color}`}>Impact: {impact}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Summary table */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Quick Reference: What Moves Gold Up or Down</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">Event / Factor</th>
                    <th className="px-5 py-3 text-left font-semibold text-green-600">Gold Moves UP when…</th>
                    <th className="px-5 py-3 text-left font-semibold text-red-500">Gold Moves DOWN when…</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['USD/INR rate', 'Rupee weakens (more ₹ per $)', 'Rupee strengthens'],
                    ['US Fed rate', 'Fed cuts rates / dovish stance', 'Fed raises rates / hawkish stance'],
                    ['Inflation', 'Inflation rises or CPI surprises high', 'Inflation falls or is controlled'],
                    ['Geopolitics', 'Wars, elections, uncertainty', 'Peace talks, stability returns'],
                    ['Stock market', 'Equity markets crash or fear rises', 'Bull market, investors prefer equities'],
                    ['Import duty', 'Government increases customs duty', 'Government reduces duty'],
                    ['Central banks', 'Central banks buy more gold', 'Central banks sell gold reserves'],
                  ].map(([f, up, down]) => (
                    <tr key={f} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-700">{f}</td>
                      <td className="px-5 py-3 text-green-700 text-xs">{up}</td>
                      <td className="px-5 py-3 text-red-600 text-xs">{down}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is it better to buy gold when prices are falling?', a: 'For long-term investment, lower prices generally offer better value. However, gold prices are driven by macro factors that are hard to predict. Most financial planners recommend systematic gold buying (like SGB tranches or digital gold SIP) rather than trying to time the market.' },
                { q: 'Why is Chennai gold rate higher than Mumbai?', a: 'Different states levy different taxes on gold. South India states (Tamil Nadu, Andhra Pradesh) have higher local taxes, and Chennai is further from major gold import ports. Mumbai is the main gold import hub (Nhava Sheva port), so transportation costs are lower.' },
                { q: 'Does Dhanteras affect gold prices?', a: 'Yes, but mostly at the local level. India\'s Dhanteras demand is 30–50 tonnes, which represents a short-term demand spike. Local jewellers may charge 0.5–2% premium during the festival. International prices rarely move solely due to Indian festival demand.' },
                { q: 'What is the best time of day to buy gold in India?', a: 'IBJA announces rates twice daily — at 11:30 AM and 5:30 PM IST. Jewellers typically update prices after the 5:30 PM announcement. International gold trades 24×5, so prices after US market hours (9 PM – 1 AM IST) can be more volatile.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="font-semibold text-gray-800 mb-1">{q}</p>
                  <p className="text-sm text-gray-600">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Related Articles</h2>
            <div className="space-y-2">
              {[
                { label: 'BIS Hallmark Guide — 916, 750, 585 explained', to: '/gold-hallmark-guide' },
                { label: 'Gold Rate Today in India — Live 24K & 22K price', to: '/gold-rate-today' },
                { label: 'Gold Rate in Hyderabad Today', to: '/gold-rate-today/hyderabad' },
                { label: 'Gold Rate in Mumbai Today', to: '/gold-rate-today/mumbai' },
              ].map(({ label, to }) => (
                <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 border border-gray-100 hover:border-yellow-200 transition-all">
                  <ArrowRight className="w-4 h-4 text-yellow-600 shrink-0" />
                  <span className="text-sm text-gray-700">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </Link>
              ))}
            </div>
          </section>

          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-3">Check today's live gold rate — updated every 30 minutes</p>
            <Link to="/gold-rate-today" className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <TrendingUp className="w-4 h-4" /> View Gold Rate Today →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
