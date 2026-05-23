import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#1E0938' }}>
      {/* Top accent stripe */}
      <div className="h-1 bg-gradient-to-r from-brand-600 via-pink-500 to-accent-500" />

      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">

        {/* BRAND */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white font-black text-sm select-none">
              ₹
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">
              Rupee<span className="bg-gradient-to-r from-brand-400 to-pink-400 bg-clip-text text-transparent">pedia</span>
            </span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed">
            India's most complete banking &amp; postal data platform — IFSC codes, PIN codes, gold rates &amp; financial tools. All free.
          </p>
        </div>

        {/* TOOLS & DATA */}
        <div>
          <h3 className="text-white/90 font-semibold text-xs uppercase tracking-widest mb-3">Tools &amp; Data</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/ifsc-finder" className="text-white/45 hover:text-white transition-colors">IFSC Code Finder</Link></li>
            <li><Link to="/pin-codes" className="text-white/45 hover:text-white transition-colors">PIN Code Directory</Link></li>
            <li><Link to="/gold-rate-today" className="text-white/45 hover:text-white transition-colors">Gold &amp; Silver Rates</Link></li>
            <li><Link to="/money-guides" className="text-white/45 hover:text-white transition-colors">Guides</Link></li>
            <li><Link to="/credit-cards" className="text-white/45 hover:text-white transition-colors">Credit Cards</Link></li>
            <li><Link to="/bank-holidays" className="text-white/45 hover:text-white transition-colors">Bank Holidays</Link></li>
          </ul>
        </div>

        {/* CALCULATORS */}
        <div>
          <h3 className="text-white/90 font-semibold text-xs uppercase tracking-widest mb-3">Calculators</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/calculators/emi" className="text-white/45 hover:text-white transition-colors">EMI Calculator</Link></li>
            <li><Link to="/calculators/sip" className="text-white/45 hover:text-white transition-colors">SIP Calculator</Link></li>
            <li><Link to="/calculators/fd" className="text-white/45 hover:text-white transition-colors">FD Calculator</Link></li>
            <li><Link to="/calculators/ppf" className="text-white/45 hover:text-white transition-colors">PPF Calculator</Link></li>
            <li><Link to="/calculators/income-tax" className="text-white/45 hover:text-white transition-colors">Income Tax</Link></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="text-white/90 font-semibold text-xs uppercase tracking-widest mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-white/45 hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="text-white/45 hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/privacy" className="text-white/45 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-white/45 hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

      </div>

      {/* BOTTOM STRIP */}
      <div className="border-t border-white/[0.07] flex items-center justify-between px-4 py-4 max-w-6xl mx-auto text-sm">
        <span className="text-white/30">© 2026 Rupeepedia.in — All rights reserved</span>
        <Link to="/admin/login" className="text-white/20 hover:text-white/40 transition-colors text-xs">
          Admin
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
