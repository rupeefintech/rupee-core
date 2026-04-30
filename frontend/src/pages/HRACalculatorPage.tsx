import { useState } from "react";
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
  );
}