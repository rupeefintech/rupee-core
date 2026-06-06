import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { calculatorCategories } from '../utils/calculators';

const catHeaderColors: Record<string, { iconBg: string; iconColor: string }> = {
  blue:   { iconBg: 'bg-brand-100',   iconColor: 'text-brand-600' },
  green:  { iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  purple: { iconBg: 'bg-purple-100',  iconColor: 'text-purple-600' },
  amber:  { iconBg: 'bg-amber-100',   iconColor: 'text-amber-600' },
};

export default function CalculatorsIndexPage() {
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

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-12 px-4 text-center">
          <h1 className="text-3xl font-bold mb-3">Financial Calculators</h1>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">
            Free, accurate calculators to help you make smarter financial decisions — EMI, SIP, FD, eligibility and more.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-10">
          {calculatorCategories.map((cat) => {
            const CatIcon = cat.categoryIcon;
            const hdr = catHeaderColors[cat.color];
            return (
              <div key={cat.title}>
                {/* Category header */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hdr.iconBg}`}>
                    <CatIcon className={`w-4.5 h-4.5 ${hdr.iconColor}`} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{cat.title}</h2>
                </div>

                {/* Calculator cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="group rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md hover:border-gray-300 transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-gray-900 mb-0.5">{item.label}</div>
                            <div className="text-xs text-gray-500 leading-snug">{item.desc}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
