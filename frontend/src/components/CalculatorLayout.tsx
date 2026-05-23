import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import ToolsSidebar from './ToolsSidebar';

export default function CalculatorLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'RupeePedia Financial Calculators',
          url: 'https://rupeepedia.in/calculators',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
        })}</script>
      </Helmet>

      {/* Desktop: floating sidebar pinned to the right */}
      <div className="hidden lg:block fixed top-20 right-0 w-[280px] xl:w-[300px] h-[calc(100vh-5rem)] overflow-y-auto z-30 px-3 py-4 scrollbar-thin">
        <ToolsSidebar />
      </div>

      {/* Main content — shifted left on desktop to make room for sidebar */}
      <div className="lg:mr-[280px] xl:mr-[300px]">
        <Outlet />
      </div>

      {/* Mobile: collapsible tools section at the bottom */}
      <div className="lg:hidden px-4 pb-8">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm"
        >
          <span>Browse Other Financial Tools</span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {mobileOpen && (
          <div className="mt-3">
            <ToolsSidebar />
          </div>
        )}
      </div>
    </>
  );
}
