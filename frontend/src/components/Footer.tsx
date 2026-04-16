import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">

        {/* BRAND */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center shrink-0 p-1">
              <img src="/logo.png" alt="Rupeepedia" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-white text-lg font-bold">Rupeepedia</h2>
          </div>
          <p className="text-sm">
            Your trusted platform to compare credit cards, loans, and financial products in India.
          </p>
        </div>

        {/* CREDIT CARDS */}
        <div>
          <h3 className="text-white font-semibold mb-3">Credit Cards</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/credit-cards" className="hover:text-white transition-colors">Best Credit Cards</Link></li>
            <li><Link to="/credit-cards?category=Cashback" className="hover:text-white transition-colors">Cashback Cards</Link></li>
            <li><Link to="/credit-cards?category=Rewards" className="hover:text-white transition-colors">Rewards Cards</Link></li>
            <li><Link to="/credit-cards?category=Travel" className="hover:text-white transition-colors">Travel Cards</Link></li>
            <li><Link to="/credit-cards?category=Lifetime Free" className="hover:text-white transition-colors">Lifetime Free Cards</Link></li>
          </ul>
        </div>

        {/* LOANS */}
        <div>
          <h3 className="text-white font-semibold mb-3">Loans</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/loans?type=personal" className="hover:text-white transition-colors">Personal Loans</Link></li>
            <li><Link to="/loans?type=home" className="hover:text-white transition-colors">Home Loans</Link></li>
            <li><Link to="/loans?type=car" className="hover:text-white transition-colors">Car Loans</Link></li>
            <li><Link to="/loans?type=business" className="hover:text-white transition-colors">Business Loans</Link></li>
          </ul>
        </div>

        {/* CALCULATORS */}
        <div>
          <h3 className="text-white font-semibold mb-3">Calculators</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/emi-calculator" className="hover:text-white transition-colors">EMI Calculator</Link></li>
            <li><Link to="/calculators/sip" className="hover:text-white transition-colors">SIP Calculator</Link></li>
            <li><Link to="/calculators/home-loan-eligibility" className="hover:text-white transition-colors">Home Loan Eligibility</Link></li>
            <li><Link to="/hra-calculator" className="hover:text-white transition-colors">HRA Calculator</Link></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="text-white font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>

      </div>

      {/* BOTTOM STRIP */}
      <div className="border-t border-gray-700 flex items-center justify-between px-4 py-4 text-sm">
        <span>© 2026 Rupeepedia.in — All rights reserved</span>
        <Link to="/admin/login" className="text-gray-600 hover:text-gray-400 transition-colors text-xs">
          Admin
        </Link>
      </div>
    </footer>
  );
};

export default Footer;