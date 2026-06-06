import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function HRACalculatorPage() {
  const [basic, setBasic] = useState(50000);
  const [hra, setHra] = useState(20000);
  const [rent, setRent] = useState(15000);
  const [isMetro, setIsMetro] = useState(true);

  const condition1 = hra;
  const condition2 = Math.max(rent - basic * 0.1, 0);
  const condition3 = basic * (isMetro ? 0.5 : 0.4);

  const exemption = Math.min(condition1, condition2, condition3);

  return (
    <>
    <Helmet>
      <title>HRA Calculator 2026 — Calculate HRA Tax Exemption | RupeePedia</title>
      <meta name="description" content="Free HRA Calculator — calculate your House Rent Allowance tax exemption. Supports metro and non-metro cities for FY 2025-26." />
      <link rel="canonical" href="https://rupeepedia.in/calculators/hra-calculator" />
      <meta property="og:title" content="HRA Calculator 2026 — Calculate HRA Tax Exemption | RupeePedia" />
      <meta property="og:description" content="Free HRA Calculator — calculate your House Rent Allowance tax exemption. Supports metro and non-metro cities for FY 2025-26." />
      <meta property="og:url" content="https://rupeepedia.in/calculators/hra-calculator" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://rupeepedia.in/logo.png" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="HRA Calculator 2026 — Calculate HRA Tax Exemption | RupeePedia" />
      <meta name="twitter:description" content="Free HRA Calculator — calculate your House Rent Allowance tax exemption. Supports metro and non-metro cities for FY 2025-26." />
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How is HRA exemption calculated?', acceptedAnswer: { '@type': 'Answer', text: 'HRA exemption is the minimum of: (1) Actual HRA received, (2) Rent paid minus 10% of Basic salary, (3) 50% of Basic salary for metro cities (Delhi, Mumbai, Chennai, Kolkata) or 40% for non-metro cities.' } },
          { '@type': 'Question', name: 'What is the HRA exemption formula?', acceptedAnswer: { '@type': 'Answer', text: 'Exempt HRA = min(Actual HRA, Rent paid – 10% of Basic, 50%/40% of Basic). The remaining HRA above exempt amount is taxable. This calculator computes all three limits and shows the minimum.' } },
          { '@type': 'Question', name: 'Can I claim HRA if I live in a rented house owned by my parents?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, you can pay rent to parents and claim HRA exemption, provided the house is in their name (not yours), you have a valid rent agreement, and your parents declare it as rental income in their tax return.' } },
          { '@type': 'Question', name: 'Which cities are considered metro for HRA?', acceptedAnswer: { '@type': 'Answer', text: 'Only 4 cities qualify as metro for HRA purposes: Delhi, Mumbai, Chennai, and Kolkata. All other cities (including Bengaluru, Hyderabad, Pune) are treated as non-metro, making HRA exemption 40% of Basic instead of 50%.' } },
        ],
      })}</script>
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
          { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://rupeepedia.in/calculators' },
          { '@type': 'ListItem', position: 3, name: 'HRA Calculator', item: 'https://rupeepedia.in/calculators/hra-calculator' },
        ],
      })}</script>
    </Helmet>
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        HRA Calculator (India)
      </h1>

      <div className="card p-6 space-y-4 mb-6">

        <input
          type="number"
          value={basic}
          onChange={(e) => setBasic(Number(e.target.value))}
          placeholder="Basic Salary (Monthly)"
          className="input-field"
        />

        <input
          type="number"
          value={hra}
          onChange={(e) => setHra(Number(e.target.value))}
          placeholder="HRA Received (Monthly)"
          className="input-field"
        />

        <input
          type="number"
          value={rent}
          onChange={(e) => setRent(Number(e.target.value))}
          placeholder="Rent Paid (Monthly)"
          className="input-field"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isMetro}
            onChange={() => setIsMetro(!isMetro)}
          />
          Metro City (Delhi, Mumbai, Chennai, Kolkata)
        </label>

        <div className="bg-brand-50 p-4 rounded">
          <p className="text-sm">HRA Exemption</p>
          <p className="font-bold text-lg text-brand-700">
            ₹{Math.round(exemption).toLocaleString()} / month
          </p>
        </div>

      </div>

      {/* 💰 Monetization */}
      <div className="bg-brand-50 p-5 rounded">
        <p className="mb-3">
          Planning to buy a house? Save more with the right home loan.
        </p>

        <Link to="/loans" className="btn-primary">
          Explore Home Loans →
        </Link>
      </div>

    </div>
    </>
  );
}