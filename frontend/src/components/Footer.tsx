import { Link } from 'react-router-dom';
import { Shield, ExternalLink } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-blue-600 text-white font-bold text-sm px-2.5 py-1.5 rounded-lg">₹</div>
              <span className="font-display text-xl font-bold">Rupee<span className="text-blue-400">Pedia</span></span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              India's most reliable IFSC code finder. Powered by RBI-sourced data, updated fortnightly.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-blue-300">
              <Shield className="w-3.5 h-3.5" />
              <span>Data sourced from RBI & NPCI</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Search</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              {['SBI IFSC', 'HDFC IFSC', 'ICICI IFSC', 'Axis Bank IFSC', 'PNB IFSC', 'Canara Bank IFSC'].map(item => (
                <li key={item}>
                  <Link to="/ifsc" className="hover:text-white transition-colors flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-400 rounded-full" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>
                <a href="https://rbi.org.in" target="_blank" rel="noopener noreferrer"
                   className="hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> RBI Official Site
                </a>
              </li>
              <li>
                <a href="https://npci.org.in" target="_blank" rel="noopener noreferrer"
                   className="hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> NPCI
                </a>
              </li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-blue-300">
          <p>© {year} RupeePedia. For informational purposes only.</p>
          <p>Data accuracy not guaranteed. Verify with your bank before transactions.</p>
        </div>
      </div>
    </footer>
  );
}
