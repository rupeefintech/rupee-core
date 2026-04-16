import React from "react";
import { useLocation } from "react-router-dom";

type Loan = {
  name: string;
  interest: string;
  bestFor: string;
  features: string[];
  whyRecommended: string;
};

const loansData: Loan[] = [
  {
    name: "HDFC Personal Loan",
    interest: "10.5% onwards",
    bestFor: "Salaried individuals",
    features: ["Quick approval", "No collateral", "Flexible tenure"],
    whyRecommended: "Fast disbursal with trusted bank",
  },
  {
    name: "ICICI Instant Loan",
    interest: "10.75% onwards",
    bestFor: "Existing ICICI users",
    features: ["Pre-approved offers", "Instant credit"],
    whyRecommended: "Best for instant loan approval",
  },
  {
    name: "Axis Bank Personal Loan",
    interest: "11% onwards",
    bestFor: "High loan amounts",
    features: ["High eligibility", "Flexible EMI"],
    whyRecommended: "Good for higher loan requirements",
  },
];

const Loans: React.FC = () => {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const amount = Number(params.get("amount")) || 0;
  const emi = Number(params.get("emi")) || 0;

  const filteredLoans = loansData.filter((loan) => {
    if (!amount) return true;

    if (amount < 300000) return loan.name.includes("Instant");
    if (amount < 1000000) return true;
    return !loan.name.includes("Instant");
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Compare Best Personal Loans in India
      </h1>

     
      {amount > 0 && (
        <div className="bg-blue-50 p-4 rounded mb-6">
          <p className="text-sm">
            Showing best loan options for ₹{amount.toLocaleString()}
          </p>
          <p className="text-sm text-green-700">
            Estimated EMI: ₹{emi}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {filteredLoans.map((loan, i) => (
          <div key={i} className="border p-5 rounded-xl shadow-sm">

            <h2 className="text-xl font-semibold">{loan.name}</h2>

            <p className="text-sm text-gray-500 mb-2">
              Best for: {loan.bestFor}
            </p>

            <p className="mb-2">
              <strong>Interest:</strong> {loan.interest}
            </p>

            <ul className="text-sm mb-3 list-disc pl-5">
              {loan.features.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>

            <p className="text-green-700 text-sm mb-3">
              ✔ {loan.whyRecommended}
            </p>

            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Check Loan Offers →
            </button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Loans;