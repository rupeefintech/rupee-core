import React from "react";
import { Link } from "react-router-dom";

const BankAccounts: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-4">
        Best Bank Accounts in India
      </h1>

      <p className="text-gray-600 mb-6">
        Compare zero balance savings accounts, salary accounts, and digital bank accounts.
      </p>

      {/* 🔥 Coming Soon Section */}
      <div className="bg-blue-50 p-6 rounded mb-8 text-center">
        <h2 className="text-xl font-semibold mb-2">
          🚀 Bank Account Comparison Coming Soon
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          We are working on bringing the best savings accounts with zero balance,
          high interest rates, and instant opening.
        </p>

        <Link
          to="/credit-cards"
          className="bg-blue-600 text-white px-4 py-2 rounded inline-block"
        >
          Explore Credit Cards →
        </Link>
      </div>

      {/* 🔥 Early Monetization (IMPORTANT) */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="card p-5">
          <h3 className="font-semibold mb-2">
            Zero Balance Savings Account
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Open an account without maintaining minimum balance.
          </p>
          <button className="btn-primary w-full">
            Coming Soon
          </button>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-2">
            Salary Accounts
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Exclusive benefits for salaried professionals.
          </p>
          <button className="btn-primary w-full">
            Coming Soon
          </button>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-2">
            Digital Bank Accounts
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Open instantly with mobile KYC.
          </p>
          <button className="btn-primary w-full">
            Coming Soon
          </button>
        </div>

      </div>
    </div>
  );
};

export default BankAccounts;