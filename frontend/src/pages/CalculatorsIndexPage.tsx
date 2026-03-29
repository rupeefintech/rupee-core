import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const categories = [
  {
    title: 'Loan EMI Calculators',
    icon: '🏦',
    color: 'blue',
    items: [
      { label: 'EMI Calculator', path: '/calculators/emi', desc: 'Calculate EMI for any loan' },
      { label: 'Home Loan EMI', path: '/calculators/home-loan-emi', desc: 'Plan your home loan repayment' },
      { label: 'Personal Loan EMI', path: '/calculators/personal-loan-emi', desc: 'Check personal loan EMI instantly' },
      { label: 'Car Loan EMI', path: '/calculators/car-loan-emi', desc: 'Know your car loan monthly payment' },
      { label: 'Education Loan EMI', path: '/calculators/education-loan-emi', desc: 'Plan education loan repayment' },
      { label: 'Business Loan EMI', path: '/calculators/business-loan-emi', desc: 'Calculate business loan EMI' },
    ],
  },
  {
    title: 'Investment Calculators',
    icon: '📈',
    color: 'green',
    items: [
      { label: 'SIP Calculator', path: '/calculators/sip', desc: 'Project your SIP returns' },
      { label: 'FD Calculator', path: '/calculators/fd', desc: 'Calculate fixed deposit maturity' },
      { label: 'RD Calculator', path: '/calculators/rd', desc: 'Know your RD maturity amount' },
      { label: 'Mutual Fund Calculator', path: '/calculators/mutual-fund', desc: 'Estimate mutual fund returns' },
      { label: 'NPS Calculator', path: '/calculators/nps', desc: 'Plan your NPS pension corpus' },
      { label: 'PPF Calculator', path: '/calculators/ppf', desc: 'Calculate PPF maturity value' },
    ],
  },
  {
    title: 'Loan Eligibility Calculators',
    icon: '✅',
    color: 'purple',
    items: [
      { label: 'Home Loan Eligibility', path: '/calculators/home-loan-eligibility', desc: 'Check max home loan you qualify for' },
      { label: 'Personal Loan Eligibility', path: '/calculators/personal-loan-eligibility', desc: 'Know your personal loan eligibility' },
      { label: 'Home Prepayment Calculator', path: '/calculators/home-prepayment', desc: 'See savings from prepayment' },
      { label: 'Personal Prepayment', path: '/calculators/personal-prepayment', desc: 'Calculate prepayment savings' },
      { label: 'Loan Against Property', path: '/calculators/lap-emi', desc: 'Calculate LAP EMI & eligibility' },
      { label: 'GST Calculator', path: '/calculators/gst', desc: 'Calculate GST on any amount' },
    ],
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  green: 'bg-green-50 text-green-700 border-green-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
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
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4 text-center">
          <h1 className="text-3xl font-bold mb-3">Financial Calculators</h1>
          <p className="text-blue-100 text-sm max-w-lg mx-auto">
            Free, accurate calculators to help you make smarter financial decisions — EMI, SIP, FD, eligibility and more.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-10">
          {categories.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="text-lg font-bold text-gray-900">{cat.title}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cat.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rounded-xl border p-4 hover:shadow-md transition-all hover:-translate-y-0.5 ${colorMap[cat.color]}`}
                  >
                    <div className="font-semibold text-sm mb-1">{item.label}</div>
                    <div className="text-xs opacity-75">{item.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}