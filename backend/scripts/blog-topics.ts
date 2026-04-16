/**
 * Blog topic queue — ~60 topics across 5 categories.
 * The generation script picks the next unpublished topic.
 */

export interface BlogTopic {
  slug: string;
  title: string;
  category: 'Tax' | 'Banking' | 'Investment' | 'Credit Cards' | 'Loans';
  keywords: string[]; // for Unsplash image search
  internalLinks: string[]; // paths to interlink in the article
}

export const blogTopics: BlogTopic[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // TAX (15)
  // ══════════════════════════════════════════════════════════════════════════
  { slug: 'income-tax-slabs-fy-2025-26', title: 'Income Tax Slabs FY 2025-26: Old vs New Regime Compared', category: 'Tax', keywords: ['income tax', 'india finance'], internalLinks: ['/calculators/income-tax', '/calculators/salary-calculator'] },
  { slug: 'section-80c-guide', title: 'Section 80C: Complete Guide to Save Up to ₹1.5 Lakh Tax', category: 'Tax', keywords: ['tax saving', 'india investment'], internalLinks: ['/calculators/income-tax', '/calculators/ppf', '/calculators/fd'] },
  { slug: 'section-80d-health-insurance', title: 'Section 80D: Tax Benefits on Health Insurance Premium', category: 'Tax', keywords: ['health insurance', 'medical'], internalLinks: ['/calculators/income-tax'] },
  { slug: 'hra-exemption-guide', title: 'HRA Exemption: How to Calculate & Claim Tax Benefit', category: 'Tax', keywords: ['house rent', 'apartment'], internalLinks: ['/calculators/hra-calculator', '/calculators/salary-calculator'] },
  { slug: 'tds-rates-guide', title: 'TDS Rates 2025-26: Complete Chart with Thresholds', category: 'Tax', keywords: ['tax deduction', 'payroll'], internalLinks: ['/calculators/income-tax', '/calculators/salary-calculator'] },
  { slug: 'itr-filing-guide', title: 'How to File ITR Online: Step-by-Step Guide for Salaried', category: 'Tax', keywords: ['tax filing', 'india government'], internalLinks: ['/calculators/income-tax'] },
  { slug: 'advance-tax-guide', title: 'Advance Tax: Who Should Pay, Due Dates & Calculation', category: 'Tax', keywords: ['advance tax', 'business finance'], internalLinks: ['/calculators/income-tax'] },
  { slug: 'capital-gains-tax-guide', title: 'Capital Gains Tax in India: STCG vs LTCG Explained', category: 'Tax', keywords: ['stock market', 'investment'], internalLinks: ['/calculators/income-tax', '/calculators/mutual-fund'] },
  { slug: 'nri-taxation-guide', title: 'NRI Taxation in India: Income, Property & Investments', category: 'Tax', keywords: ['nri india', 'global finance'], internalLinks: ['/calculators/income-tax', '/calculators/fd'] },
  { slug: 'tax-saving-for-salaried', title: '10 Best Tax Saving Options for Salaried Employees in 2026', category: 'Tax', keywords: ['salary india', 'tax planning'], internalLinks: ['/calculators/income-tax', '/calculators/salary-calculator', '/calculators/ppf'] },
  { slug: 'form-26as-vs-ais', title: 'Form 26AS vs AIS: What\'s the Difference & How to Check', category: 'Tax', keywords: ['tax document', 'paperwork'], internalLinks: ['/calculators/income-tax'] },
  { slug: 'section-80g-donations', title: 'Section 80G: Tax Deduction on Charitable Donations', category: 'Tax', keywords: ['charity donation', 'helping'], internalLinks: ['/calculators/income-tax'] },
  { slug: 'old-vs-new-tax-regime', title: 'Old vs New Tax Regime: Which One Saves More Tax?', category: 'Tax', keywords: ['comparison', 'decision making'], internalLinks: ['/calculators/income-tax', '/calculators/hra-calculator'] },
  { slug: 'freelancer-tax-guide', title: 'Freelancer Tax Guide: ITR Filing, GST & Deductions', category: 'Tax', keywords: ['freelancer', 'laptop working'], internalLinks: ['/calculators/income-tax', '/calculators/gst'] },
  { slug: 'senior-citizen-tax-benefits', title: 'Senior Citizen Tax Benefits: Higher Exemptions & Deductions', category: 'Tax', keywords: ['senior citizen', 'retirement'], internalLinks: ['/calculators/income-tax', '/calculators/fd'] },

  // ══════════════════════════════════════════════════════════════════════════
  // BANKING (10)
  // ══════════════════════════════════════════════════════════════════════════
  { slug: 'what-is-ifsc-code', title: 'What is IFSC Code? How to Find & Use It for Transfers', category: 'Banking', keywords: ['bank transfer', 'online banking'], internalLinks: ['/ifsc-finder', '/ifsc'] },
  { slug: 'savings-account-rules', title: 'Savings Account Rules in India: Limits, Interest & Tax', category: 'Banking', keywords: ['savings bank', 'piggy bank'], internalLinks: ['/ifsc-finder', '/calculators/fd'] },
  { slug: 'cash-deposit-limits', title: 'Cash Deposit Limits in India: Rules & Tax Implications', category: 'Banking', keywords: ['cash money', 'bank deposit'], internalLinks: ['/ifsc-finder'] },
  { slug: 'neft-rtgs-imps-upi-difference', title: 'NEFT vs RTGS vs IMPS vs UPI: Which Transfer Method to Use?', category: 'Banking', keywords: ['digital payment', 'mobile banking'], internalLinks: ['/ifsc-finder', '/ifsc'] },
  { slug: 'cheque-bounce-rules', title: 'Cheque Bounce: Penalties, Legal Action & How to Avoid', category: 'Banking', keywords: ['cheque bank', 'banking'], internalLinks: ['/ifsc-finder'] },
  { slug: 'dormant-account-reactivation', title: 'Dormant Bank Account: How to Reactivate & What to Know', category: 'Banking', keywords: ['bank account', 'banking service'], internalLinks: ['/ifsc-finder'] },
  { slug: 'joint-account-rules', title: 'Joint Bank Account Rules: Types, Tax & Nomination', category: 'Banking', keywords: ['couple finance', 'joint account'], internalLinks: ['/ifsc-finder'] },
  { slug: 'bank-locker-rules', title: 'Bank Locker Rules 2025: RBI Guidelines & Charges', category: 'Banking', keywords: ['bank locker', 'safe deposit'], internalLinks: ['/ifsc-finder'] },
  { slug: 'upi-transaction-limits', title: 'UPI Transaction Limits 2025: Bank-Wise Daily & Per Txn Limits', category: 'Banking', keywords: ['upi payment', 'digital india'], internalLinks: ['/ifsc-finder'] },
  { slug: 'demand-draft-guide', title: 'Demand Draft (DD): How to Make, Cancel & Track', category: 'Banking', keywords: ['bank draft', 'financial document'], internalLinks: ['/ifsc-finder'] },

  // ══════════════════════════════════════════════════════════════════════════
  // CREDIT CARDS (10)
  // ══════════════════════════════════════════════════════════════════════════
  { slug: 'best-cashback-credit-cards', title: 'Best Cashback Credit Cards in India 2025', category: 'Credit Cards', keywords: ['credit card', 'cashback shopping'], internalLinks: ['/credit-cards', '/credit-cards?category=Cashback'] },
  { slug: 'best-travel-credit-cards', title: 'Best Travel Credit Cards in India: Lounge Access & Miles', category: 'Credit Cards', keywords: ['travel card', 'airport lounge'], internalLinks: ['/credit-cards', '/credit-cards?category=Travel'] },
  { slug: 'credit-score-guide', title: 'Credit Score Guide: How to Check, Improve & Maintain 750+', category: 'Credit Cards', keywords: ['credit score', 'financial health'], internalLinks: ['/credit-cards'] },
  { slug: 'credit-card-bill-payment-tips', title: 'Credit Card Bill Payment: Due Date, Minimum Due & Interest', category: 'Credit Cards', keywords: ['bill payment', 'credit card'], internalLinks: ['/credit-cards', '/calculators/emi'] },
  { slug: 'reward-points-optimization', title: 'Credit Card Reward Points: How to Earn & Redeem Maximum Value', category: 'Credit Cards', keywords: ['reward points', 'loyalty program'], internalLinks: ['/credit-cards'] },
  { slug: 'balance-transfer-guide', title: 'Credit Card Balance Transfer: How It Works & Best Offers', category: 'Credit Cards', keywords: ['balance transfer', 'credit card'], internalLinks: ['/credit-cards', '/calculators/emi'] },
  { slug: 'credit-card-vs-debit-card', title: 'Credit Card vs Debit Card: Key Differences & When to Use', category: 'Credit Cards', keywords: ['card comparison', 'payment cards'], internalLinks: ['/credit-cards', '/accounts'] },
  { slug: 'first-credit-card-guide', title: 'First Credit Card: How to Choose & Apply (Beginner Guide)', category: 'Credit Cards', keywords: ['first card', 'young professional'], internalLinks: ['/credit-cards'] },
  { slug: 'credit-card-charges-explained', title: 'Credit Card Charges: Annual Fee, Interest, Late Fee & More', category: 'Credit Cards', keywords: ['credit card fees', 'charges'], internalLinks: ['/credit-cards'] },
  { slug: 'emi-on-credit-card', title: 'EMI on Credit Card: How It Works, Interest & Should You Use It?', category: 'Credit Cards', keywords: ['emi payment', 'credit card'], internalLinks: ['/credit-cards', '/calculators/emi'] },

  // ══════════════════════════════════════════════════════════════════════════
  // INVESTMENTS (15)
  // ══════════════════════════════════════════════════════════════════════════
  { slug: 'sip-vs-lumpsum', title: 'SIP vs Lumpsum: Which Investment Strategy is Better?', category: 'Investment', keywords: ['investment growth', 'mutual fund'], internalLinks: ['/calculators/sip', '/calculators/lumpsum', '/calculators/mutual-fund'] },
  { slug: 'fd-vs-rd-comparison', title: 'FD vs RD: Which Fixed Income Option Suits You?', category: 'Investment', keywords: ['fixed deposit', 'savings'], internalLinks: ['/calculators/fd', '/calculators/rd'] },
  { slug: 'ppf-complete-guide', title: 'PPF Account: Interest Rate, Rules, Tax Benefits & Withdrawal', category: 'Investment', keywords: ['ppf savings', 'government scheme'], internalLinks: ['/calculators/ppf', '/calculators/income-tax'] },
  { slug: 'nps-guide', title: 'National Pension System (NPS): Benefits, Tax Saving & Returns', category: 'Investment', keywords: ['pension retirement', 'nps india'], internalLinks: ['/calculators/nps', '/calculators/income-tax'] },
  { slug: 'mutual-fund-types', title: 'Types of Mutual Funds in India: Complete Guide for Beginners', category: 'Investment', keywords: ['mutual fund', 'investment'], internalLinks: ['/calculators/mutual-fund', '/calculators/sip'] },
  { slug: 'elss-tax-saving-fund', title: 'ELSS Funds: Best Tax-Saving Mutual Funds with High Returns', category: 'Investment', keywords: ['elss mutual fund', 'tax saving'], internalLinks: ['/calculators/sip', '/calculators/income-tax'] },
  { slug: 'gold-investment-guide', title: 'Gold Investment in India: Physical, Digital & Sovereign Gold Bonds', category: 'Investment', keywords: ['gold investment', 'gold coins'], internalLinks: ['/calculators/cagr'] },
  { slug: 'real-estate-vs-stocks', title: 'Real Estate vs Stocks: Where Should You Invest in 2025?', category: 'Investment', keywords: ['real estate', 'stock market'], internalLinks: ['/calculators/cagr', '/calculators/emi'] },
  { slug: 'emergency-fund-guide', title: 'Emergency Fund: How Much to Save & Where to Park It', category: 'Investment', keywords: ['emergency fund', 'savings jar'], internalLinks: ['/calculators/fd', '/calculators/sip'] },
  { slug: 'sukanya-samriddhi-yojana', title: 'Sukanya Samriddhi Yojana: Interest Rate, Rules & Calculator', category: 'Investment', keywords: ['girl child', 'savings scheme'], internalLinks: ['/calculators/fd', '/calculators/income-tax'] },
  { slug: 'cagr-explained', title: 'CAGR Explained: What It Is & How to Calculate Investment Returns', category: 'Investment', keywords: ['growth chart', 'investment returns'], internalLinks: ['/calculators/cagr', '/calculators/mutual-fund'] },
  { slug: 'xirr-explained', title: 'XIRR Explained: Calculate True Returns on Irregular Investments', category: 'Investment', keywords: ['investment calculator', 'returns'], internalLinks: ['/calculators/xirr', '/calculators/sip'] },
  { slug: 'index-funds-guide', title: 'Index Funds in India: Low-Cost Way to Beat FDs', category: 'Investment', keywords: ['index fund', 'stock market'], internalLinks: ['/calculators/sip', '/calculators/mutual-fund'] },
  { slug: 'debt-mutual-funds', title: 'Debt Mutual Funds: Types, Returns, Tax & Who Should Invest', category: 'Investment', keywords: ['debt fund', 'bonds'], internalLinks: ['/calculators/mutual-fund', '/calculators/fd'] },
  { slug: 'dividend-vs-growth', title: 'Dividend vs Growth Mutual Fund: Which Option to Choose?', category: 'Investment', keywords: ['dividend', 'mutual fund'], internalLinks: ['/calculators/mutual-fund', '/calculators/sip'] },

  // ══════════════════════════════════════════════════════════════════════════
  // LOANS (10)
  // ══════════════════════════════════════════════════════════════════════════
  { slug: 'home-loan-guide', title: 'Home Loan Guide: Eligibility, Interest Rates & EMI Tips', category: 'Loans', keywords: ['home loan', 'house keys'], internalLinks: ['/calculators/emi', '/calculators/home-loan-emi', '/calculators/home-loan-eligibility'] },
  { slug: 'personal-loan-tips', title: 'Personal Loan: Interest Rates, Eligibility & Smart Tips', category: 'Loans', keywords: ['personal loan', 'finance'], internalLinks: ['/calculators/personal-loan-emi', '/calculators/personal-loan-eligibility'] },
  { slug: 'car-loan-comparison', title: 'Car Loan Comparison: Bank vs Dealer Finance & EMI Guide', category: 'Loans', keywords: ['car loan', 'new car'], internalLinks: ['/calculators/car-loan-emi', '/calculators/emi'] },
  { slug: 'loan-prepayment-benefits', title: 'Loan Prepayment: Benefits, Charges & Should You Prepay?', category: 'Loans', keywords: ['loan payment', 'financial freedom'], internalLinks: ['/calculators/home-prepayment', '/calculators/personal-prepayment'] },
  { slug: 'cibil-score-improvement', title: 'CIBIL Score: How to Check, Improve & Get 750+ Score', category: 'Loans', keywords: ['credit score', 'financial planning'], internalLinks: ['/calculators/emi', '/credit-cards'] },
  { slug: 'loan-against-fd', title: 'Loan Against FD: Interest Rate, Process & Benefits', category: 'Loans', keywords: ['fixed deposit', 'bank loan'], internalLinks: ['/calculators/fd', '/calculators/emi'] },
  { slug: 'education-loan-guide', title: 'Education Loan in India: Eligibility, Interest & Repayment', category: 'Loans', keywords: ['education', 'student loan'], internalLinks: ['/calculators/education-loan-emi', '/calculators/emi'] },
  { slug: 'gold-loan-guide', title: 'Gold Loan: How It Works, Interest Rates & Best Banks', category: 'Loans', keywords: ['gold loan', 'gold jewelry'], internalLinks: ['/calculators/emi', '/ifsc-finder'] },
  { slug: 'balance-transfer-home-loan', title: 'Home Loan Balance Transfer: Save Lakhs on Interest', category: 'Loans', keywords: ['home loan', 'savings'], internalLinks: ['/calculators/home-loan-emi', '/calculators/home-prepayment'] },
  { slug: 'emi-formula-explained', title: 'EMI Formula Explained: How Banks Calculate Your EMI', category: 'Loans', keywords: ['emi calculator', 'mathematics'], internalLinks: ['/calculators/emi', '/calculators/home-loan-emi', '/calculators/personal-loan-emi'] },
];
