import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { calculatorCategories } from '../utils/calculators';

const colorMap: Record<string, { card: string; iconBg: string; iconColor: string }> = {
  blue:   { card: 'bg-brand-50 text-brand-700 border-brand-100 hover:border-brand-300',   iconBg: 'bg-brand-100',   iconColor: 'text-brand-600' },
  green:  { card: 'bg-brand-50 text-brand-700 border-brand-100 hover:border-brand-300',   iconBg: 'bg-brand-100',   iconColor: 'text-brand-600' },
  purple: { card: 'bg-brand-50 text-brand-700 border-brand-100 hover:border-brand-300',   iconBg: 'bg-brand-100',   iconColor: 'text-brand-600' },
  amber:  { card: 'bg-brand-50 text-brand-700 border-brand-100 hover:border-brand-300',   iconBg: 'bg-brand-100',   iconColor: 'text-brand-600' },
};

export default function CalculatorsIndexPage() {
  return (
    <>
      <Helmet>
        <title>Financial Calculators - EMI, SIP, FD, Loan Eligibility | RupeePedia</title>
        <meta name="description" content="Free financial calculators for EMI, SIP, FD, loan eligibility and more. Plan your finances smarter with RupeePedia's calculator suite." />
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
            const colors = colorMap[cat.color];
            return (
              <div key={cat.title}>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.iconBg}`}>
                    <CatIcon className={`w-4.5 h-4.5 ${colors.iconColor}`} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{cat.title}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group rounded-xl border p-4 hover:shadow-md transition-all hover:-translate-y-0.5 ${colors.card}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.iconBg} group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-4.5 h-4.5 ${colors.iconColor}`} />
                          </div>
                          <div>
                            <div className="font-semibold text-sm mb-1">{item.label}</div>
                            <div className="text-xs opacity-75">{item.desc}</div>
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