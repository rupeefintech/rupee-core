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
        <title>Financial Calculators - EMI, SIP, FD, Loan Eligibility | RupeePedia</title>
        <meta name="description" content="Free financial calculators for EMI, SIP, FD, loan eligibility and more. Plan your finances smarter with RupeePedia's calculator suite." />
        <link rel="canonical" href="https://rupeepedia.in/calculators" />
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
