import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-2 border-t border-line">
      {/* Top accent stripe */}
      <div className="h-[2px] bg-gradient-to-r from-acc via-cyan to-acc" />

      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">

        {/* BRAND */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-[8px] bg-acc flex items-center justify-center text-white font-black text-sm select-none">
              ₹
            </div>
            <span className="font-display font-extrabold text-base text-ink tracking-tight flex items-center gap-1.5">
              <span>Rupee<span className="text-acc">pedia</span></span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-acc-deep text-acc tracking-wide">.IN</span>
            </span>
          </div>
          <p className="text-xs text-faint mb-3">India's Financial Directory &amp; Hub</p>
          <p className="text-sm text-muted leading-relaxed">
            India's most complete banking &amp; postal data platform — IFSC codes, PIN codes, gold rates &amp; financial tools. All free.
          </p>
        </div>

        {/* TOOLS & DATA */}
        <div>
          <h3 className="text-ink font-semibold text-xs uppercase tracking-widest mb-3">Tools &amp; Data</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/fd-rates"           className="text-muted hover:text-ink transition-colors">FD Interest Rates</Link></li>
            <li><Link to="/savings-rates"     className="text-muted hover:text-ink transition-colors">Savings Account Rates</Link></li>
            <li><Link to="/ifsc-finder"        className="text-muted hover:text-ink transition-colors">IFSC Code Finder</Link></li>
            <li><Link to="/swift-code-lookup"  className="text-muted hover:text-ink transition-colors">SWIFT Code Lookup</Link></li>
            <li><Link to="/currency-converter" className="text-muted hover:text-ink transition-colors">Currency Converter</Link></li>
            <li><Link to="/pin-codes"          className="text-muted hover:text-ink transition-colors">PIN Code Directory</Link></li>
            <li><Link to="/gold-rate-today"    className="text-muted hover:text-ink transition-colors">Gold &amp; Silver Rates</Link></li>
            <li><Link to="/credit-cards"       className="text-muted hover:text-ink transition-colors">Credit Cards</Link></li>
            <li><Link to="/bank-holidays"      className="text-muted hover:text-ink transition-colors">Bank Holidays</Link></li>
          </ul>
        </div>

        {/* CALCULATORS */}
        <div>
          <h3 className="text-ink font-semibold text-xs uppercase tracking-widest mb-3">
            Calculators
            <Link to="/calculators" className="ml-2 text-faint hover:text-body font-normal normal-case tracking-normal transition-colors text-[10px]">View all →</Link>
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Link to="/calculators/emi" className="text-muted hover:text-ink transition-colors">EMI Calculator</Link>
            <Link to="/calculators/sip" className="text-muted hover:text-ink transition-colors">SIP Calculator</Link>
            <Link to="/calculators/income-tax" className="text-muted hover:text-ink transition-colors">Income Tax</Link>
            <Link to="/calculators/fd" className="text-muted hover:text-ink transition-colors">FD Calculator</Link>
            <Link to="/calculators/salary-calculator" className="text-muted hover:text-ink transition-colors">Salary Calculator</Link>
            <Link to="/calculators/gst" className="text-muted hover:text-ink transition-colors">GST Calculator</Link>
            <Link to="/calculators/hra-calculator" className="text-muted hover:text-ink transition-colors">HRA Calculator</Link>
            <Link to="/calculators/swp" className="text-muted hover:text-ink transition-colors">SWP Calculator</Link>
            <Link to="/calculators/ppf" className="text-muted hover:text-ink transition-colors">PPF Calculator</Link>
            <Link to="/calculators/cagr" className="text-muted hover:text-ink transition-colors">CAGR Calculator</Link>
          </div>
        </div>

        {/* LEARNING RESOURCES */}
        <div>
          <h3 className="text-ink font-semibold text-xs uppercase tracking-widest mb-3">Learn</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/what-is-ifsc-code" className="text-muted hover:text-ink transition-colors">What is IFSC Code?</Link></li>
            <li><Link to="/ifsc-vs-micr" className="text-muted hover:text-ink transition-colors">IFSC vs MICR</Link></li>
            <li><Link to="/how-to-find-ifsc-code" className="text-muted hover:text-ink transition-colors">How to Find IFSC</Link></li>
            <li><Link to="/pin-code-india" className="text-muted hover:text-ink transition-colors">PIN Code Guide</Link></li>
            <li><Link to="/gold-hallmark-guide" className="text-muted hover:text-ink transition-colors">Gold Hallmark Guide</Link></li>
            <li><Link to="/why-gold-prices-change" className="text-muted hover:text-ink transition-colors">Why Gold Prices Change</Link></li>
            <li><Link to="/money-guides" className="text-muted hover:text-ink transition-colors">All Guides</Link></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="text-ink font-semibold text-xs uppercase tracking-widest mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-muted hover:text-ink transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="text-muted hover:text-ink transition-colors">Contact</Link></li>
            <li><Link to="/privacy" className="text-muted hover:text-ink transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-muted hover:text-ink transition-colors">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

      </div>

      {/* BOTTOM STRIP */}
      <div className="border-t border-line flex items-center justify-between px-4 py-4 max-w-6xl mx-auto text-sm">
        <span className="text-faint">© 2026 Rupeepedia.in — All rights reserved</span>
        <Link to="/admin/login" className="text-faint hover:text-muted transition-colors text-xs">
          Admin
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
