import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function CalculatorLayout() {
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

      <Outlet />
    </>
  );
}
