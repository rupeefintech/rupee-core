import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronDown, PiggyBank, Check, Star } from 'lucide-react';

interface SalaryAccount {
  rank: number;
  bank: string;
  logoUrl: string | null;
  type: string;
  savingsRate: string;
  minBalance: string;
  highlight: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  badge?: string;
}

const SALARY_ACCOUNTS: SalaryAccount[] = [
  {
    rank: 1,
    bank: 'HDFC Bank',
    logoUrl: '/images/banks/Hdfc_Bank.webp',
    type: 'Private Sector',
    savingsRate: '3% – 3.5% p.a.',
    minBalance: 'Zero (salary account)',
    highlight: 'Best overall salary account — top app, fastest service, strong perks',
    pros: [
      'Zero balance — salary account waives MAB entirely',
      'Best-in-class MobileBanking app',
      'Free NEFT/RTGS/IMPS online',
      'Good debit card perks (cashback on select categories)',
      'Wide ATM network (20,000+)',
    ],
    cons: ['Higher MAB (₹10,000) if account converts to regular', 'Branch wait times in busy metros'],
    bestFor: 'Urban salaried professionals in private sector',
    badge: '🏆 Best Overall',
  },
  {
    rank: 2,
    bank: 'ICICI Bank',
    logoUrl: '/images/banks/Icici_Bank.webp',
    type: 'Private Sector',
    savingsRate: '3% – 3.5% p.a.',
    minBalance: 'Zero (salary account)',
    highlight: 'Near-identical to HDFC — better for ICICI loan customers and NRIs',
    pros: [
      'Zero balance salary account',
      'iMobile app is excellent — rivals HDFC',
      'Strong NRI banking integration',
      'Good for those with ICICI home/car loans (consolidated view)',
      'Instant account opening via digital KYC',
    ],
    cons: ['Customer service can be slow for complex issues', 'Slightly lower ATM count vs HDFC'],
    bestFor: 'ICICI loan holders, NRIs, and digital-first users',
    badge: '⭐ Top Pick',
  },
  {
    rank: 3,
    bank: 'Axis Bank',
    logoUrl: '/images/banks/Axis_Bank.webp',
    type: 'Private Sector',
    savingsRate: '3% p.a.',
    minBalance: 'Zero (salary account)',
    highlight: 'Zero balance + best debit card rewards in this list',
    pros: [
      'Zero balance salary account',
      'Axis ASAP salary account: instant digital opening',
      'Axis rewards on debit card spends',
      'Good credit card bundling options (Axis ACE, Flipkart card)',
      'Decent 24×7 support',
    ],
    cons: ['3% savings rate — lower than HDFC/ICICI at 3.5%', 'App slightly behind HDFC/ICICI in UX'],
    bestFor: 'Those wanting debit card rewards + salary account combo',
  },
  {
    rank: 4,
    bank: 'Kotak Mahindra Bank',
    logoUrl: '/images/banks/Kotak_Mahindra_Bank.webp',
    type: 'Private Sector',
    savingsRate: '3.5% – 4% p.a.',
    minBalance: 'Zero (811 / salary account)',
    highlight: 'Highest savings rate among large private banks — up to 4%',
    pros: [
      '4% savings rate on balances above ₹1 lakh (highest among large banks)',
      'Kotak 811 zero-balance account — open in minutes via app',
      'Clean, fast mobile app',
      'Good for self-employed + salaried both',
    ],
    cons: ['Smaller branch network vs SBI/HDFC', '811 account is digital-only — limited cash services'],
    bestFor: 'Anyone wanting a higher savings rate with a digital-first bank',
    badge: '💰 Highest Rate',
  },
  {
    rank: 5,
    bank: 'IDFC FIRST Bank',
    logoUrl: '/images/banks/Idfc_First_Bank.webp',
    type: 'Private Sector',
    savingsRate: '6% – 7% p.a.',
    minBalance: 'Zero (salary account)',
    highlight: 'Best savings interest rate — 7% p.a., far above all large private banks',
    pros: [
      '7% savings rate (above ₹1 lakh) — best among established banks',
      'Zero MAB for salary accounts',
      'Monthly interest credit (not quarterly)',
      'FIRST Smart Salary account with extra perks',
      'Free international debit card',
    ],
    cons: ['Smaller branch network (1,000+ vs 8,000 for HDFC)', 'Less name recognition for credit references'],
    bestFor: 'Rate-maximisers who are comfortable with a smaller bank',
    badge: '🔥 Best Rate',
  },
  {
    rank: 6,
    bank: 'State Bank of India',
    logoUrl: '/images/banks/State_Bank_Of_India.webp',
    type: 'Public Sector',
    savingsRate: '2.7% – 3% p.a.',
    minBalance: 'Zero (Basic / PMJDY)',
    highlight: 'Best for government sector employees and those needing widest branch reach',
    pros: [
      'Government-owned — highest implicit safety',
      '22,000+ branches — unmatched reach in rural/semi-urban areas',
      'YONO app has improved significantly',
      'Zero-balance BSBDA option for all',
      'Direct credit of government benefits (DBT, pension)',
    ],
    cons: ['Lowest savings rate (2.7–3%)', 'Slower digital experience vs private banks', 'Long queues at branches'],
    bestFor: 'Government employees, rural areas, and government benefit recipients',
  },
];

const FAQS = [
  {
    q: 'What is a salary savings account?',
    a: 'A salary savings account is a special variant of a savings account offered to salaried employees. The key benefit is zero minimum average balance (MAB) requirement — you don\'t need to maintain any minimum balance as long as your salary is credited regularly. If salary credits stop for 2–3 consecutive months, the account may be downgraded to a regular savings account with MAB requirements.',
  },
  {
    q: 'Which bank gives the highest interest on salary savings accounts?',
    a: 'IDFC FIRST Bank offers the highest savings interest rate — up to 7% p.a. on balances above ₹1 lakh (as of 2026). Among large private banks, Kotak Mahindra Bank offers 4%, and HDFC/ICICI offer 3.5%. SBI offers the lowest at 2.7–3%. If maximising interest is your goal, IDFC FIRST Bank salary account is the best choice.',
  },
  {
    q: 'Is the salary account automatically zero balance?',
    a: 'Yes, most banks waive the minimum average balance (MAB) as long as salary is credited every month. If salary credits stop (e.g., you resign), the bank typically gives a 2–3 month grace period, after which the account is converted to a regular savings account and MAB requirements kick in.',
  },
  {
    q: 'Can I open a salary account myself?',
    a: 'No — salary accounts are opened by your employer in tie-up with the bank. Your HR or finance team will tell you which bank(s) they have a corporate tie-up with. You can often choose from 2–3 bank options offered by your employer. If you switch jobs, you can either port your salary credit to the new salary account or use the old account as a regular savings account.',
  },
  {
    q: 'Which is better for salary — HDFC Bank or ICICI Bank?',
    a: 'Both are near-identical in features and interest rate (3–3.5% p.a.). HDFC Bank has a slightly larger ATM network and is often rated slightly higher for app reliability. ICICI Bank is better if you have an ICICI home loan or car loan (single login to manage everything) or if you\'re an NRI. In practice, both are excellent choices — pick based on which your employer offers.',
  },
];

export default function BestSavingsAccountsForSalary() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://rupeepedia.in' },
          { '@type': 'ListItem', position: 2, name: 'Savings Rates', item: 'https://rupeepedia.in/savings-rates' },
          { '@type': 'ListItem', position: 3, name: 'Best Savings Accounts for Salary', item: 'https://rupeepedia.in/best-savings-accounts-for-salary' },
        ],
      },
      {
        '@type': 'WebPage',
        name: 'Best Savings Accounts for Salary in India 2026',
        url:  'https://rupeepedia.in/best-savings-accounts-for-salary',
        description: 'Best salary savings accounts in India 2026 — HDFC, ICICI, Axis, Kotak, IDFC First, SBI compared. Zero balance, interest rates, app quality, and perks.',
        provider: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
      },
      {
        '@type': 'ItemList',
        name: 'Best Salary Savings Accounts 2026',
        itemListElement: SALARY_ACCOUNTS.map((acc, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${acc.bank} Salary Account`,
          description: acc.highlight,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Best Savings Accounts for Salary in India 2026 — Zero Balance, High Interest | RupeePedia</title>
        <meta name="description" content="Best salary savings accounts in India 2026. Compare HDFC, ICICI, Axis, Kotak, IDFC First, and SBI salary accounts — interest rates, zero balance, app quality, and perks ranked." />
        <meta name="keywords" content="best savings account for salary in india, best salary account 2026, hdfc vs icici salary account, zero balance salary account, best bank for salary account india, idfc first salary account, kotak salary account interest rate, which bank is best for salary account" />
        <link rel="canonical" href="https://rupeepedia.in/best-savings-accounts-for-salary" />
        <meta property="og:title"       content="Best Salary Savings Accounts in India 2026 | RupeePedia" />
        <meta property="og:description" content="HDFC, ICICI, Axis, Kotak, IDFC First, SBI salary accounts ranked — interest rates, zero balance, and perks compared." />
        <meta property="og:url"         content="https://rupeepedia.in/best-savings-accounts-for-salary" />
        <meta property="og:type"        content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <nav className="flex items-center gap-1.5 text-brand-300 text-xs mb-5">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <Link to="/savings-rates" className="hover:text-white transition-colors">Savings Rates</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-white font-medium">Best for Salary</span>
            </nav>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">Best Savings Accounts for Salary</h1>
                <p className="text-brand-200 mt-1 text-sm">India 2026 — zero balance, interest rates, and perks ranked</p>
              </div>
            </div>
            <p className="text-brand-200 text-base max-w-2xl">
              All salary accounts are zero-balance — the real differences are in interest rate, app quality, and perks. Here's the full ranking.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { label: 'Banks compared', value: '6' },
                { label: 'Best savings rate', value: '7% (IDFC)' },
                { label: 'Min Balance', value: 'Zero (all)' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2.5">
                  <div className="font-bold text-white text-lg">{s.value}</div>
                  <div className="text-brand-300 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

          {/* Quick comparison table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Quick Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-2.5 font-semibold">Bank</th>
                    <th className="text-center px-4 py-2.5 font-semibold">Savings Rate</th>
                    <th className="text-center px-4 py-2.5 font-semibold">Min Balance</th>
                    <th className="text-left px-4 py-2.5 font-semibold hidden sm:table-cell">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SALARY_ACCOUNTS.map(acc => (
                    <tr key={acc.bank} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {acc.logoUrl
                            ? <img src={acc.logoUrl} alt={acc.bank} className="w-7 h-7 object-contain rounded" />
                            : <div className="w-7 h-7 bg-brand-100 rounded flex items-center justify-center text-brand-700 font-bold text-xs">{acc.bank[0]}</div>}
                          <div>
                            <div className="font-semibold text-gray-900 text-xs">{acc.bank}</div>
                            {acc.badge && <div className="text-[10px] text-brand-600 font-semibold">{acc.badge}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700 text-xs">{acc.savingsRate}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">{acc.minBalance}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{acc.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed cards */}
          <div className="space-y-4">
            {SALARY_ACCOUNTS.map(acc => (
              <div key={acc.bank} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-brand-700 font-extrabold text-sm border border-brand-200">
                    {acc.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      {acc.logoUrl && (
                        <img src={acc.logoUrl} alt={acc.bank} className="w-8 h-8 object-contain rounded border border-gray-100" />
                      )}
                      <div className="font-bold text-gray-900">{acc.bank}</div>
                      {acc.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full border border-brand-200">{acc.badge}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{acc.highlight}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-gray-400 mb-0.5">Savings Rate</div>
                        <div className="font-bold text-emerald-700">{acc.savingsRate}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-gray-400 mb-0.5">Min Balance</div>
                        <div className="font-bold text-gray-800">{acc.minBalance}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-gray-400 mb-0.5">Bank Type</div>
                        <div className="font-bold text-gray-800">{acc.type}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Pros</div>
                        <ul className="space-y-1">
                          {acc.pros.map(p => (
                            <li key={p} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Cons</div>
                        <ul className="space-y-1">
                          {acc.cons.map(c => (
                            <li key={c} className="flex items-start gap-1.5 text-xs text-gray-500">
                              <span className="w-3.5 h-3.5 flex-shrink-0 text-orange-400 mt-0.5">–</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500"><span className="font-semibold">Best for:</span> {acc.bestFor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>

          {/* Related */}
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Related</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { to: '/compare/savings/sbi-vs-hdfc', label: 'SBI vs HDFC Savings Account', desc: 'Full feature-by-feature comparison' },
                { to: '/savings-rates',                label: 'All Savings Account Rates',   desc: 'Compare 40+ banks — up to 9% p.a.' },
                { to: '/fd-rates',                    label: 'Best FD Rates 2026',           desc: 'Higher returns with fixed tenure — up to 9.5%' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all group flex flex-col gap-1">
                  <div className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 transition-colors">{item.label}</div>
                  <div className="text-[11px] text-gray-400">{item.desc}</div>
                </Link>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center pb-4">
            Interest rates and features as of June 2026. Salary account features vary by employer arrangement — verify with your HR and the bank before opening.
          </p>
        </div>
      </div>
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex justify-between items-center px-5 py-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-50">{a}</div>
      )}
    </div>
  );
}
