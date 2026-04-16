/**
 * Seeds the blogs table with initial content.
 * Run after create-blog-table.ts:
 *   cd backend && npx ts-node scripts/create-blog-table.ts
 *   cd backend && npx ts-node scripts/seed-blogs.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedBlogs = [
  {
    slug: 'income-tax-slabs-2025-26',
    title: 'Income Tax Slabs FY 2025-26: Old vs New Regime Compared',
    description: 'Complete guide to income tax slabs for FY 2025-26 with old vs new regime comparison, tax saving tips, and examples for salaried employees.',
    category: 'Tax',
    tags: ['income tax', 'tax slabs', 'old regime', 'new regime', 'FY 2025-26'],
    readTime: '8 min read',
    isFeatured: true,
    content: `Every financial year, the most common question Indian taxpayers ask is: "Which tax regime should I choose?" With the Union Budget 2025 making the new regime even more attractive, this decision matters more than ever.

## What Changed in Budget 2025?

The new tax regime received a significant boost with revised slabs and a higher standard deduction. Here's what's new:

- Standard deduction increased to ₹75,000 (from ₹50,000)
- Tax rebate limit raised to ₹12 lakh (from ₹7 lakh)
- Revised slab rates for income above ₹12 lakh

> 💡 **Pro Tip:** If your total income is up to ₹12 lakh, you pay **zero tax** under the new regime thanks to the enhanced rebate under Section 87A.

## New Tax Regime Slabs (FY 2025-26)

| Income Slab | Tax Rate |
|---|---|
| Up to ₹4,00,000 | Nil |
| ₹4,00,001 – ₹8,00,000 | 5% |
| ₹8,00,001 – ₹12,00,000 | 10% |
| ₹12,00,001 – ₹16,00,000 | 15% |
| ₹16,00,001 – ₹20,00,000 | 20% |
| ₹20,00,001 – ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

## Old Tax Regime Slabs (FY 2025-26)

| Income Slab | Tax Rate |
|---|---|
| Up to ₹2,50,000 | Nil |
| ₹2,50,001 – ₹5,00,000 | 5% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

## Old vs New Regime: Side-by-Side Comparison

| Feature | Old Regime | New Regime |
|---|---|---|
| Standard Deduction | ₹50,000 | ₹75,000 |
| Section 80C (₹1.5L) | ✅ Available | ❌ Not Available |
| HRA Exemption | ✅ Available | ❌ Not Available |
| Section 80D (Health) | ✅ Available | ❌ Not Available |
| Home Loan Interest (₹2L) | ✅ Available | ❌ Not Available |
| Tax Rebate (87A) | Up to ₹5L income | Up to ₹12L income |
| Default Regime | No | Yes |

## Real Example: Salaried Employee Earning ₹15 Lakh

**Rahul** earns ₹15,00,000 per year. He pays ₹1.5 lakh in 80C (PPF), ₹25,000 in 80D (health insurance), and gets ₹2.4 lakh HRA exemption.

**Old Regime:**
- Gross Income: ₹15,00,000
- Less: Standard Deduction: ₹50,000
- Less: 80C: ₹1,50,000
- Less: 80D: ₹25,000
- Less: HRA: ₹2,40,000
- Taxable Income: ₹10,35,000
- Tax: ₹1,19,600 + 4% cess = **₹1,24,384**

**New Regime:**
- Gross Income: ₹15,00,000
- Less: Standard Deduction: ₹75,000
- Taxable Income: ₹14,25,000
- Tax: ₹1,13,750 + 4% cess = **₹1,18,300**

> 💡 **Pro Tip:** Rahul saves ₹6,084 with the new regime despite having ₹4.15 lakh in deductions! Use our [Income Tax Calculator](/calculators/income-tax) to check your own numbers.

## How to Decide: Old or New Regime?

- **Choose Old Regime if** → Your total deductions (80C + 80D + HRA + home loan) exceed ₹3.75 lakh
- **Choose New Regime if** → Your deductions are below ₹3.75 lakh, or you don't want the hassle of maintaining investment proofs
- **If unsure** → Use our [Income Tax Calculator](/calculators/income-tax) to compare both regimes with your actual numbers

## Frequently Asked Questions

### Can I switch between old and new regime every year?

Yes, salaried employees can switch between regimes each financial year. Business/professional income taxpayers can switch only once.

### Is the new regime selected by default?

Yes, from FY 2024-25 onwards, the new regime is the default. You must explicitly opt for the old regime while filing ITR.

### Do I need to invest in 80C if I choose the new regime?

No tax benefit for 80C investments under new regime. However, PPF, ELSS etc. are still good investments for wealth building — just not for tax saving. Check our [SIP Calculator](/calculators/sip) to plan investments.

### What about home loan interest deduction?

Under the old regime, you can claim up to ₹2 lakh deduction on home loan interest (Section 24b). This is not available in the new regime. Use our [Home Loan EMI Calculator](/calculators/home-loan-emi) to plan your repayment.

### How does HRA work under each regime?

HRA exemption is only available under the old regime. If you're paying rent and have a high HRA component, the old regime could save more tax. Calculate your HRA benefit with our [HRA Calculator](/calculators/hra-calculator).

---

*Disclaimer: This article is for informational purposes only. Tax laws change frequently — always verify with the latest ITR rules or consult a CA before filing. Last updated: April 2026.*`,
  },
  {
    slug: 'what-is-ifsc-code',
    title: 'What is IFSC Code? How to Find & Use It for Transfers',
    description: 'Learn what IFSC code is, how to find your bank\'s IFSC code, and why it\'s needed for NEFT, RTGS, IMPS, and UPI transfers in India.',
    category: 'Banking',
    tags: ['IFSC code', 'bank transfer', 'NEFT', 'RTGS', 'IMPS'],
    readTime: '5 min read',
    isFeatured: true,
    content: `Every time you make a bank transfer in India — whether it's NEFT, RTGS, IMPS, or even UPI — there's one code working behind the scenes: the **IFSC code**. With over 1.78 lakh bank branches across India, this 11-character code ensures your money reaches exactly the right branch.

## What is IFSC Code?

**IFSC** stands for **Indian Financial System Code**. It's an 11-character alphanumeric code assigned by the Reserve Bank of India (RBI) to every bank branch that participates in electronic fund transfers.

**Format:** \`ABCD0123456\`
- First 4 characters: Bank code (e.g., HDFC, SBIN, ICIC)
- 5th character: Always \`0\` (reserved for future use)
- Last 6 characters: Branch code (unique to each branch)

> 💡 **Pro Tip:** The first 4 letters tell you which bank it is. For example, SBIN = State Bank of India, HDFC = HDFC Bank, UTIB = Axis Bank.

## Why Do You Need an IFSC Code?

| Transfer Type | IFSC Required? | Max Limit | Speed |
|---|---|---|---|
| NEFT | ✅ Yes | No limit | 30 min – 2 hours |
| RTGS | ✅ Yes | Min ₹2 lakh | Real-time |
| IMPS | ✅ Yes | ₹5 lakh | Instant |
| UPI | ❌ No (auto-detected) | ₹1–5 lakh | Instant |
| Cheque | ❌ No (uses MICR) | No limit | 2-3 days |

## How to Find Your IFSC Code

There are several ways to find your bank's IFSC code:

### 1. Use Rupeepedia's IFSC Finder (Fastest)
Search across 1.78 lakh+ branches instantly on our [IFSC Finder](/ifsc-finder). Just select your bank, state, and city.

### 2. Check Your Cheque Book
The IFSC code is printed on every cheque leaf, usually near the MICR code at the bottom.

### 3. Bank's Website or App
Login to your net banking or mobile app — the IFSC is usually displayed on the account details page.

### 4. RBI Website
The RBI maintains the official IFSC directory, but it's harder to navigate compared to tools like our [IFSC Finder](/ifsc-finder).

## Real Example

**Priya** wants to transfer ₹50,000 from her HDFC Bank account to her friend's SBI account in Hyderabad via NEFT.

She needs:
- Beneficiary name
- Account number
- **IFSC code: SBIN0020244** (SBI, Hyderabad - Ameerpet branch)

She can quickly verify this IFSC code on [Rupeepedia](/ifsc-finder) to confirm the branch details before making the transfer.

> ⚠️ **Warning:** Always double-check the IFSC code before transferring money. A wrong IFSC means your money goes to the wrong branch, and recovery can take days.

## IFSC Code vs MICR Code vs SWIFT Code

| Code | Length | Used For | Example |
|---|---|---|---|
| IFSC | 11 chars | NEFT, RTGS, IMPS | HDFC0001234 |
| MICR | 9 digits | Cheque clearing | 500240001 |
| SWIFT | 8-11 chars | International transfers | HDFCINBB |

## What Happens If IFSC Code is Wrong?

- **NEFT/RTGS:** Transaction will bounce back to your account (may take 24-48 hours)
- **IMPS:** May fail instantly or take a few hours to reverse
- **No money is lost** — but it causes delays and anxiety

## Frequently Asked Questions

### Does every bank branch have a unique IFSC code?

Yes, each branch has a unique IFSC code. Even two branches of the same bank in the same city will have different IFSC codes. Search any branch on our [IFSC Finder](/ifsc-finder).

### Can IFSC codes change?

Yes, when branches merge or relocate, the RBI may update the IFSC code. This is why it's important to verify the code before making transfers.

### Do I need IFSC code for UPI transfers?

No. UPI uses your UPI ID (like name@bank) and resolves the routing automatically. The IFSC is handled behind the scenes.

### Is IFSC code the same for all branches of a bank?

No. Each branch has its own unique IFSC code. For example, HDFC Bank's Andheri branch will have a different IFSC than its Bandra branch.

### Where can I find IFSC codes for all banks in India?

Use Rupeepedia's [IFSC Finder](/ifsc-finder) — it covers all 1,350+ banks and 1.78 lakh+ branches across India with verified data.

---

*Disclaimer: This article is for informational purposes only. IFSC codes are sourced from RBI data and verified periodically. Always confirm with your bank before making large transfers.*`,
  },

  // ── Blog 3: SIP vs Lumpsum (Investment) ─────────────────────────────────
  {
    slug: 'sip-vs-lumpsum',
    title: 'SIP vs Lumpsum: Which Investment Strategy is Better?',
    description: 'Compare SIP and lumpsum mutual fund investments with real examples, returns data, and a clear decision guide for Indian investors.',
    category: 'Investment',
    tags: ['SIP', 'lumpsum', 'mutual fund', 'investment', 'rupee cost averaging'],
    readTime: '7 min read',
    isFeatured: false,
    content: `Should you invest ₹1,00,000 all at once or spread it across 10 months at ₹10,000 each? This is the classic SIP vs Lumpsum debate — and the answer depends on your situation, not a blanket rule.

## What is SIP?

**SIP (Systematic Investment Plan)** lets you invest a fixed amount in a mutual fund at regular intervals — typically monthly. Think of it as a recurring deposit, but into equity or debt mutual funds instead of a bank.

- Minimum: As low as ₹500/month
- Frequency: Monthly, weekly, or quarterly
- Best for: Salaried individuals with regular income

## What is Lumpsum?

**Lumpsum** means investing a large amount in one shot. You buy mutual fund units at the current NAV and wait for them to grow.

- Minimum: Varies by fund (typically ₹1,000–₹5,000)
- Best for: Bonus, inheritance, or maturity proceeds

## SIP vs Lumpsum: Head-to-Head

| Feature | SIP | Lumpsum |
|---|---|---|
| Investment Style | Fixed amount, regular intervals | One-time, full amount |
| Market Timing Needed? | No (auto-averaged) | Yes (entry point matters) |
| Risk | Lower (rupee cost averaging) | Higher (depends on entry NAV) |
| Discipline | Built-in | Requires self-control |
| Best Market Condition | Volatile/falling markets | Rising/bull markets |
| Minimum Amount | ₹500/month | ₹1,000–₹5,000 |

## How Rupee Cost Averaging Works

This is SIP's biggest advantage. When markets fall, your fixed ₹10,000 buys more units. When markets rise, it buys fewer. Over time, your average cost per unit is lower than the average NAV.

**Example:**

| Month | NAV (₹) | SIP ₹10,000 buys | Units |
|---|---|---|---|
| Jan | 100 | ₹10,000 | 100.0 |
| Feb | 80 | ₹10,000 | 125.0 |
| Mar | 90 | ₹10,000 | 111.1 |
| Apr | 110 | ₹10,000 | 90.9 |
| May | 120 | ₹10,000 | 83.3 |
| **Total** | **Avg NAV: 100** | **₹50,000** | **510.3 units** |

Your average cost per unit = ₹50,000 ÷ 510.3 = **₹98.0** — lower than the average NAV of ₹100!

> 💡 **Pro Tip:** SIP doesn't guarantee higher returns than lumpsum. It reduces *timing risk* — which is what most people actually need. Try our [SIP Calculator](/calculators/sip) to see projected returns.

## Real Example: ₹12 Lakh Investment

**Scenario:** Anita has ₹12,00,000 to invest. She's choosing between:
- **Option A:** Lumpsum ₹12,00,000 in Nifty 50 index fund
- **Option B:** SIP of ₹1,00,000/month for 12 months

If the market rises steadily → Lumpsum wins (money was working longer)
If the market is volatile → SIP wins (bought more at lower prices)

Historical data shows that **lumpsum beats SIP about 65% of the time** over 5+ year periods — because markets trend upward long-term. But the 35% where SIP wins are exactly the scenarios that scare investors into panic selling.

## When Should You Choose SIP?

- **If you earn a monthly salary** → SIP aligns with your cash flow
- **If you're a first-time investor** → SIP removes the "when to invest?" anxiety
- **If markets are at all-time highs** → SIP spreads your risk
- **If you lack discipline** → SIP automates investing

## When Should You Choose Lumpsum?

- **If you have idle cash** (bonus, gift, FD maturity) → Don't let it sit in savings at 3%
- **If markets have crashed 20%+** → Lumpsum at low valuations historically works well
- **If investing in debt funds** → NAV fluctuation is minimal, so timing doesn't matter

> 💡 **Pro Tip:** You can also do a **hybrid approach** — invest 50% as lumpsum now and start SIP with the rest. Calculate your returns with our [Lumpsum Calculator](/calculators/lumpsum).

## How to Decide

- **Regular income, no lumpsum?** → [Start SIP](/calculators/sip)
- **Got a lumpsum, markets are low?** → Invest lumpsum
- **Got a lumpsum, markets are high?** → Split 50-50 or do STP (Systematic Transfer Plan)
- **Not sure about market direction?** → SIP is always the safer bet

## Frequently Asked Questions

### Can I do both SIP and lumpsum in the same fund?

Yes! Most mutual funds allow you to run a SIP and also make additional lumpsum investments anytime.

### What if I miss a SIP installment?

Nothing happens — the missed installment is simply skipped. Your SIP continues next month. No penalty.

### Is SIP better for tax saving (ELSS)?

Yes, SIP in ELSS helps spread your tax-saving investment. But note: each SIP installment has its own 3-year lock-in period. Check our [Income Tax Calculator](/calculators/income-tax) for tax planning.

### Can I increase my SIP amount over time?

Yes, this is called **Step-Up SIP** — you increase your SIP by a fixed % each year. It's powerful for wealth building. Try our [Step-Up SIP Calculator](/calculators/step-up-sip).

### What's the ideal SIP duration?

Minimum 3-5 years for equity funds. Ideally, keep SIP running as long as your goal is away — 10, 15, even 20 years. The longer you stay, the more compounding works in your favor.

---

*Disclaimer: Mutual fund investments are subject to market risks. Past performance is not indicative of future returns. This article is for educational purposes only — consult a SEBI-registered advisor before investing.*`,
  },

  // ── Blog 4: EMI Formula Explained (Loans) ──────────────────────────────
  {
    slug: 'emi-formula-explained',
    title: 'EMI Formula Explained: How Banks Calculate Your EMI',
    description: 'Understand how EMI is calculated with the mathematical formula, real examples for home and personal loans, and tips to reduce your EMI.',
    category: 'Loans',
    tags: ['EMI', 'home loan', 'personal loan', 'EMI formula', 'loan calculation'],
    readTime: '6 min read',
    isFeatured: false,
    content: `Every month, lakhs of Indians pay EMIs — but very few know how that exact number is calculated. Understanding the EMI formula helps you negotiate better with banks, plan prepayments, and avoid costly mistakes.

## What is EMI?

**EMI (Equated Monthly Installment)** is a fixed amount you pay to the bank every month until your loan is fully repaid. Each EMI has two components:

- **Principal:** Repayment of the borrowed amount
- **Interest:** Cost of borrowing

In the early years, most of your EMI goes towards interest. As the loan matures, more goes towards principal. This is called the **reducing balance method**.

## The EMI Formula

$$EMI = P × r × (1+r)^n / ((1+r)^n - 1)$$

Where:
- **P** = Principal loan amount
- **r** = Monthly interest rate (annual rate ÷ 12 ÷ 100)
- **n** = Total number of EMIs (tenure in months)

## Real Example: ₹50 Lakh Home Loan

| Parameter | Value |
|---|---|
| Loan Amount (P) | ₹50,00,000 |
| Interest Rate | 8.5% per annum |
| Tenure | 20 years (240 months) |
| Monthly Rate (r) | 0.085 ÷ 12 = 0.007083 |

**Calculation:**
- EMI = 50,00,000 × 0.007083 × (1.007083)^240 / ((1.007083)^240 - 1)
- EMI = **₹43,391 per month**

**Total payment over 20 years:** ₹43,391 × 240 = **₹1,04,13,840**
**Total interest paid:** ₹1,04,13,840 - ₹50,00,000 = **₹54,13,840**

> ⚠️ **Warning:** You end up paying more in interest (₹54.1L) than the actual loan amount (₹50L)! This is why prepayment matters. Use our [Home Loan EMI Calculator](/calculators/home-loan-emi) to see the exact breakdown.

## How EMI Components Change Over Time

Here's how the principal-interest split looks for the ₹50L loan above:

| Year | EMI | Principal Portion | Interest Portion | Balance |
|---|---|---|---|---|
| Year 1 | ₹43,391 | ₹9,913 | ₹33,478 | ₹48,81,046 |
| Year 5 | ₹43,391 | ₹14,102 | ₹29,289 | ₹44,49,225 |
| Year 10 | ₹43,391 | ₹21,476 | ₹21,915 | ₹36,38,960 |
| Year 15 | ₹43,391 | ₹32,702 | ₹10,689 | ₹20,89,540 |
| Year 20 | ₹43,391 | ₹43,087 | ₹304 | ₹0 |

Notice how in Year 1, only ₹9,913 goes to principal while ₹33,478 is interest. By Year 20, almost the entire EMI (₹43,087) is principal.

> 💡 **Pro Tip:** This is why **early prepayments** save the most money — they reduce the principal when interest burden is highest. Even ₹1 lakh extra in Year 2 can save you ₹3-4 lakh in total interest. Check with our [Prepayment Calculator](/calculators/home-prepayment).

## What Affects Your EMI?

| Factor | Increase → EMI Goes | Decrease → EMI Goes |
|---|---|---|
| Loan Amount | ↑ Up | ↓ Down |
| Interest Rate | ↑ Up | ↓ Down |
| Tenure | ↓ Down | ↑ Up |

**Example impact on ₹50L loan (20 years):**

| Interest Rate | EMI | Total Interest |
|---|---|---|
| 8.0% | ₹41,822 | ₹50,37,280 |
| 8.5% | ₹43,391 | ₹54,13,840 |
| 9.0% | ₹44,986 | ₹57,96,640 |
| 9.5% | ₹46,607 | ₹61,85,680 |

Just 0.5% higher rate = **₹3.76 lakh more interest** over 20 years!

## 5 Tips to Reduce Your EMI

1. **Negotiate the interest rate** — Compare offers from 3-4 banks before locking in
2. **Make a larger down payment** — 25-30% instead of the minimum 20%
3. **Choose a longer tenure** — Reduces EMI but increases total interest (use wisely)
4. **Prepay when possible** — Annual bonus, tax refund — every extra payment counts
5. **Transfer balance** — If another bank offers 0.5%+ lower rate, switch

## EMI for Different Loan Types

| Loan Type | Typical Amount | Rate Range | Tenure | Approx. EMI |
|---|---|---|---|---|
| Home Loan | ₹50,00,000 | 8.0–9.5% | 20 years | ₹41,822–₹46,607 |
| Personal Loan | ₹5,00,000 | 10.5–16% | 5 years | ₹10,747–₹12,198 |
| Car Loan | ₹8,00,000 | 8.5–11% | 7 years | ₹12,654–₹13,648 |
| Education Loan | ₹10,00,000 | 8.0–12% | 10 years | ₹12,133–₹14,347 |

Use our [EMI Calculator](/calculators/emi) to get exact numbers for your loan.

## Frequently Asked Questions

### Does EMI remain the same throughout the loan?

For **fixed-rate loans**, yes. For **floating-rate loans** (most home loans in India), the EMI can change when the bank revises interest rates linked to repo rate.

### Can I change my EMI tenure after taking the loan?

Yes, most banks allow you to increase or decrease tenure. Increasing tenure lowers EMI but increases total interest, and vice versa.

### What happens if I miss an EMI?

Late payment charges (1-2% of EMI), negative impact on CIBIL score, and repeated defaults can lead to loan recall. Always maintain a buffer.

### Is lower EMI always better?

No. Lower EMI usually means longer tenure = more total interest. Choose an EMI you can comfortably afford while keeping tenure as short as possible.

### How does prepayment affect EMI?

Prepayment reduces the outstanding principal. You can either keep the same EMI (tenure reduces) or reduce EMI (tenure stays same). Reducing tenure saves more interest. Try our [Personal Loan Prepayment Calculator](/calculators/personal-prepayment).

---

*Disclaimer: EMI calculations shown are approximate. Actual EMI may vary based on bank-specific calculations, processing fees, and other charges. Use our [EMI Calculator](/calculators/emi) for precise numbers.*`,
  },

  // ── Blog 5: Best Cashback Credit Cards (Credit Cards) ──────────────────
  {
    slug: 'best-cashback-credit-cards',
    title: 'Best Cashback Credit Cards in India 2025',
    description: 'Top cashback credit cards in India ranked by earn rates, annual fees, and real savings. Find the best card for groceries, fuel, and online shopping.',
    category: 'Credit Cards',
    tags: ['cashback', 'credit card', 'best cards', 'rewards', 'India 2025'],
    readTime: '6 min read',
    isFeatured: false,
    content: `Indians spend over ₹15 lakh crore annually on credit cards — yet most cardholders leave thousands of rupees in cashback on the table. Choosing the right cashback card can easily save you ₹15,000–₹30,000 per year without changing your spending habits.

## What is a Cashback Credit Card?

A cashback card returns a percentage of your spending as cash — either as statement credit, bank transfer, or account adjustment. Unlike reward points that need complex redemption, cashback is straightforward: spend ₹10,000, get ₹500 back (at 5% cashback).

> 💡 **Pro Tip:** Cashback cards are best for people who want simple, guaranteed savings without dealing with points, miles, or reward catalogues. Browse all options on our [Credit Cards page](/credit-cards).

## Top Cashback Credit Cards Compared

| Card | Annual Fee | Cashback Rate | Monthly Cap | Best For |
|---|---|---|---|---|
| HDFC MoneyBack+ | ₹500 (waived on ₹50K spend) | 2% online, 1% offline | ₹750 | Online shopping |
| Axis Bank ACE | ₹499 (waived on ₹2L spend) | 5% Google Pay, 4% Swiggy/Zomato, 2% others | ₹500/category | UPI + food delivery |
| Amazon Pay ICICI | FREE | 5% Amazon Prime, 2% Amazon, 1% others | None | Amazon shoppers |
| Flipkart Axis | ₹500 (waived on ₹2L spend) | 5% Flipkart, 4% preferred partners, 1.5% others | None | Flipkart shoppers |
| SBI Cashback | ₹999 (waived on ₹2L spend) | 5% online, 1% offline | ₹5,000 | Heavy online spenders |

## How to Choose the Right Cashback Card

### Step 1: Track your spending pattern

Where does most of your money go?
- **Groceries & essentials** → Amazon Pay ICICI (5% with Prime)
- **Food delivery (Swiggy/Zomato)** → Axis ACE (4%)
- **Fuel** → BPCL SBI, IOCL Citi
- **General online shopping** → SBI Cashback (5%)
- **Mixed spending** → HDFC MoneyBack+ (2% online)

### Step 2: Check if the annual fee makes sense

A card with ₹1,000 annual fee must give you > ₹1,000 in cashback to be worth it. If your monthly credit card spend is under ₹15,000, stick with **zero annual fee** cards like Amazon Pay ICICI.

### Step 3: Watch for caps

Many cards cap cashback at ₹500–₹1,000 per month. If you're a heavy spender (₹1L+/month), a card with no cap or high cap is better.

## Real Savings Example

**Neha** spends ₹80,000/month on credit card:
- ₹25,000 on Amazon (groceries, essentials)
- ₹15,000 on Swiggy/Zomato
- ₹20,000 on other online purchases
- ₹20,000 on offline shopping

| Card | Monthly Cashback | Annual Savings |
|---|---|---|
| Amazon Pay ICICI | ₹1,250 + ₹150 + ₹200 + ₹200 = ₹1,800 | ₹21,600 |
| Axis ACE | ₹500 + ₹600 + ₹400 + ₹200 = ₹1,700 | ₹20,400 |
| SBI Cashback | ₹1,250 + ₹750 + ₹1,000 + ₹200 = ₹3,200 (capped ₹5,000) | ₹38,400 |
| HDFC MoneyBack+ | ₹500 + ₹300 + ₹400 + ₹200 = ₹1,400 (capped ₹750) | ₹9,000 |

> 💡 **Pro Tip:** For Neha's spending pattern, **SBI Cashback** saves the most at ₹38,400/year — and the ₹999 fee is waived on ₹2L annual spend. Compare cards on [Rupeepedia](/credit-cards).

## Common Mistakes to Avoid

1. **Spending more to earn cashback** — If you wouldn't buy it without the card, the cashback isn't savings
2. **Ignoring the annual fee** — ₹5,000 fee card needs serious spending to justify
3. **Missing bill payment date** — Late fee + 36-42% interest wipes out all cashback
4. **Not reading the fine print** — Some cards exclude utilities, insurance, and EMI transactions from cashback
5. **Having too many cards** — 2-3 cards covering different categories is the sweet spot

## Cashback vs Reward Points: Quick Comparison

| Feature | Cashback | Reward Points |
|---|---|---|
| Value | Fixed, transparent | Variable, can be devalued |
| Redemption | Automatic or statement credit | Requires catalogue shopping |
| Best for | Everyday spenders | Premium/travel spenders |
| Complexity | Simple | Can be complex |

## Frequently Asked Questions

### Is cashback taxable in India?

No, cashback from credit cards is considered a discount/rebate, not income. It's not taxable.

### Can I get cashback on EMI transactions?

Most cards exclude EMI transactions from cashback. Check your card's terms. You can calculate EMI costs with our [EMI Calculator](/calculators/emi).

### Do cashback cards have high interest rates?

Yes, most cashback cards charge 36-42% annual interest on unpaid balances — same as other credit cards. Always pay the full bill.

### Can I have multiple cashback cards?

Yes! Many people use 2-3 cards to maximize cashback across categories — one for Amazon, one for dining, one for general purchases.

### How long does it take to receive cashback?

Depends on the card — some credit it in the same billing cycle, others take 1-2 cycles. Amazon Pay ICICI credits cashback as Amazon Pay balance within 3 days.

---

*Disclaimer: Card features and cashback rates are subject to change by the issuing bank. Always verify current terms on the bank's website before applying. This article is for informational purposes only.*`,
  },

  // ── Blog 6: NEFT vs RTGS vs IMPS vs UPI (Banking) ─────────────────────
  {
    slug: 'neft-rtgs-imps-upi-difference',
    title: 'NEFT vs RTGS vs IMPS vs UPI: Which Transfer Method to Use?',
    description: 'Complete comparison of NEFT, RTGS, IMPS, and UPI with transfer limits, charges, speed, and when to use each payment method in India.',
    category: 'Banking',
    tags: ['NEFT', 'RTGS', 'IMPS', 'UPI', 'bank transfer', 'digital payment'],
    readTime: '6 min read',
    isFeatured: false,
    content: `India has one of the most advanced digital payment ecosystems in the world — but with four different transfer methods (NEFT, RTGS, IMPS, UPI), choosing the right one can be confusing. Each has its own limits, speeds, and best use cases.

## Quick Comparison

| Feature | NEFT | RTGS | IMPS | UPI |
|---|---|---|---|---|
| Full Form | National Electronic Funds Transfer | Real Time Gross Settlement | Immediate Payment Service | Unified Payments Interface |
| Speed | 30 min – 2 hours | Real-time (seconds) | Instant (seconds) | Instant (seconds) |
| Availability | 24×7 (since Dec 2019) | 24×7 (since Dec 2020) | 24×7 | 24×7 |
| Min Amount | ₹1 | ₹2,00,000 | ₹1 | ₹1 |
| Max Amount | No limit | No limit | ₹5,00,000 | ₹1,00,000 (₹5L for some) |
| Charges | Free (since Jan 2020) | Free (since Jul 2019) | ₹2.50 – ₹25 | Free |
| IFSC Required? | Yes | Yes | Yes | No |
| Best For | Scheduled, large transfers | Urgent, very large transfers | Quick transfers up to ₹5L | Daily payments, small amounts |

> 💡 **Pro Tip:** Both NEFT and RTGS are now **free of charge** as per RBI mandate. If your bank still charges, escalate to the banking ombudsman. Find your bank's details on our [IFSC Finder](/ifsc-finder).

## NEFT: The Reliable Workhorse

**Best for:** Scheduled transfers, salary payments, vendor payments

NEFT processes transactions in half-hourly batches. While not instant, it's reliable and has no upper limit — making it ideal for large business payments.

**How it works:**
1. You initiate transfer via net banking/mobile app
2. Your bank sends the instruction to RBI
3. RBI processes it in the next available batch (every 30 minutes)
4. Beneficiary's bank credits the amount

**Key facts:**
- No upper or lower limit
- Free since January 2020
- Requires beneficiary's account number + [IFSC code](/ifsc-finder)
- Settlement in batches (not real-time)

## RTGS: For the Big Transfers

**Best for:** Property purchases, business deals, anything above ₹2 lakh

RTGS is India's large-value payment system. The minimum is ₹2 lakh, and there's no maximum — making it the go-to for high-value transactions.

**When to use RTGS over NEFT:**
- Amount is ₹2 lakh or more
- You need real-time settlement (not batched)
- Property registration, car purchase, business payments

> ⚠️ **Warning:** While RTGS is real-time, some banks may take 30 minutes to process the request on their end. For truly urgent transfers above ₹5 lakh, call your bank to confirm processing.

## IMPS: The 24×7 Instant Option

**Best for:** Quick transfers to friends/family, urgent payments up to ₹5 lakh

IMPS was India's first real instant payment system (launched 2010). It works 24×7, including holidays, and settles in seconds.

**Advantages over NEFT:**
- Truly instant (not batched)
- Works even when banks are closed
- Available via mobile, SMS, ATM, and net banking

**Limitations:**
- Maximum ₹5,00,000 per transaction
- Small charges (₹2.50 – ₹25 depending on amount)
- Requires IFSC code (unlike UPI)

## UPI: The Game Changer

**Best for:** Everything under ₹1 lakh — daily shopping, bill payments, P2P transfers

UPI has revolutionized Indian payments. No need to know the beneficiary's account number or [IFSC code](/ifsc-finder) — just their UPI ID or scan a QR code.

**Why UPI is so popular:**
- Completely free
- No need for IFSC or account number
- Works via phone number or UPI ID
- Supports QR code payments
- Integrated with Google Pay, PhonePe, Paytm, etc.

**UPI Limits (vary by bank):**

| Bank | Per Transaction | Daily Limit |
|---|---|---|
| SBI | ₹1,00,000 | ₹1,00,000 |
| HDFC Bank | ₹1,00,000 | ₹1,00,000 |
| ICICI Bank | ₹1,00,000 | ₹1,00,000 |
| Axis Bank | ₹1,00,000 | ₹1,00,000 |
| Kotak | ₹1,00,000 | ₹1,00,000 |

> 💡 **Pro Tip:** UPI limit has been increased to ₹5,00,000 for specific categories like tax payments, education fees, and IPO applications.

## Decision Guide: Which One Should You Use?

- **Paying for groceries, auto, food delivery** → **UPI** (free, instant, QR scan)
- **Splitting bill with friends** → **UPI** (just use phone number)
- **Transferring ₹50,000 to family urgently** → **IMPS** (instant, works 24×7)
- **Sending ₹3,00,000 for rent deposit** → **RTGS** (above ₹2L, real-time, free)
- **Monthly salary transfer to employees** → **NEFT** (batch processing, no limit, free)
- **Buying property (₹50L+)** → **RTGS** (no upper limit, real-time settlement)

## Frequently Asked Questions

### Is NEFT available on Sundays and holidays?

Yes, since December 2019, NEFT operates 24×7, 365 days — including Sundays and bank holidays.

### What if I enter a wrong IFSC code in NEFT/RTGS?

The transaction will either fail (if the IFSC doesn't exist) or go to the wrong branch (if it's a valid IFSC for a different branch). Always verify using our [IFSC Finder](/ifsc-finder) before transferring.

### Can I cancel a NEFT/RTGS transfer?

Once processed, it cannot be reversed. You must contact your bank immediately if sent to the wrong account. For NEFT, you may cancel before the next batch processes.

### Why does IMPS have charges but UPI is free?

RBI mandated UPI to be free to drive digital payment adoption. IMPS charges are minimal (₹2.50–₹25) and set by individual banks. Many banks are making IMPS free too.

### Is UPI safe for large transactions?

UPI is secured by your device binding + UPI PIN. It's as safe as net banking. For amounts above ₹1 lakh, use IMPS or RTGS which are designed for larger transfers.

---

*Disclaimer: Transfer limits and charges are subject to change by RBI and individual banks. Always verify current limits with your bank. This article is for informational purposes only.*`,
  },

  // ── Blog 7: Section 80C Guide (Tax) ────────────────────────────────────
  {
    slug: 'section-80c-guide',
    title: 'Section 80C: Complete Guide to Save Up to ₹1.5 Lakh Tax',
    description: 'Everything about Section 80C tax deductions — eligible investments like PPF, ELSS, LIC, NSC, home loan principal, and how to maximize your ₹1.5 lakh limit.',
    category: 'Tax',
    tags: ['Section 80C', 'tax saving', 'PPF', 'ELSS', 'tax deduction', 'old regime'],
    readTime: '8 min read',
    isFeatured: false,
    content: `Section 80C is the most popular tax-saving provision in India. Over 5 crore taxpayers claim deductions under this section every year — yet most don't optimize it fully. You can save up to ₹46,800 in taxes with smart 80C planning.

## What is Section 80C?

Section 80C of the Income Tax Act allows you to claim a deduction of up to **₹1,50,000** from your gross total income by investing in specified instruments. This deduction is available only under the **Old Tax Regime**.

**Maximum tax savings at different slabs:**

| Tax Bracket | Deduction (₹1.5L) | Tax Saved | Effective Saving (with cess) |
|---|---|---|---|
| 5% slab | ₹1,50,000 | ₹7,500 | ₹7,800 |
| 20% slab | ₹1,50,000 | ₹30,000 | ₹31,200 |
| 30% slab | ₹1,50,000 | ₹45,000 | ₹46,800 |

> 💡 **Pro Tip:** If you're in the 30% tax bracket, every ₹1 invested under 80C saves you ₹0.312 in tax (including 4% cess). Use our [Income Tax Calculator](/calculators/income-tax) to see your exact savings.

## All Eligible 80C Investments

### Category 1: Guaranteed Return (Low Risk)

| Investment | Return | Lock-in | Limit | Best For |
|---|---|---|---|---|
| PPF | 7.1% (tax-free) | 15 years | ₹1,50,000/year | Long-term, conservative |
| NSC | 7.7% | 5 years | No limit | Medium-term, safe |
| 5-Year Tax Saver FD | 6.5-7.5% | 5 years | No limit | Short lock-in needed |
| Sukanya Samriddhi | 8.2% (tax-free) | Till daughter is 21 | ₹1,50,000/year | If you have a daughter |
| Senior Citizen Savings | 8.2% | 5 years | ₹30,00,000 | 60+ age group |

### Category 2: Market-Linked (Higher Risk, Higher Returns)

| Investment | Expected Return | Lock-in | Best For |
|---|---|---|---|
| ELSS Mutual Funds | 12-15% (historical) | 3 years | Wealth building + tax saving |
| NPS (Tier 1) | 9-12% | Till 60 | Extra ₹50K deduction (80CCD) |
| ULIP | 8-12% | 5 years | Insurance + investment |

### Category 3: Expenses That Qualify

| Expense | Qualifies Under 80C? |
|---|---|
| Home Loan Principal | ✅ Yes (up to ₹1.5L) |
| Stamp Duty & Registration | ✅ Yes (year of purchase) |
| Children's Tuition Fee | ✅ Yes (max 2 children) |
| Life Insurance Premium | ✅ Yes (up to 10% of sum assured) |
| EPF Contribution | ✅ Yes (employee share) |

> ⚠️ **Warning:** Your EPF contribution (12% of basic) already counts towards 80C. If basic is ₹50,000/month, your EPF contribution alone is ₹72,000/year — leaving only ₹78,000 more to invest in 80C.

## Best 80C Strategy by Age

### Age 25-35 (Aggressive Growth)
1. EPF: ₹72,000 (auto-deducted)
2. ELSS SIP: ₹6,500/month = ₹78,000
3. **Total: ₹1,50,000** — fully equity, maximum growth

### Age 35-45 (Balanced)
1. EPF: ₹72,000 (auto-deducted)
2. PPF: ₹30,000/year
3. ELSS SIP: ₹4,000/month = ₹48,000
4. **Total: ₹1,50,000** — mix of safety + growth

### Age 45-55 (Conservative)
1. EPF: ₹72,000
2. PPF: ₹50,000
3. NSC / Tax Saver FD: ₹28,000
4. **Total: ₹1,50,000** — mostly guaranteed returns

## ELSS vs PPF vs Tax Saver FD

| Feature | ELSS | PPF | Tax Saver FD |
|---|---|---|---|
| Returns | 12-15% (variable) | 7.1% (guaranteed) | 6.5-7.5% (guaranteed) |
| Lock-in | 3 years | 15 years | 5 years |
| Risk | High (equity) | Zero (govt-backed) | Zero (bank guarantee) |
| Tax on Returns | 10% LTCG above ₹1L | Fully exempt | Fully taxable |
| SIP Available? | ✅ Yes | ✅ Yes (monthly deposit) | ❌ No (lumpsum) |
| Best For | Young, long-term | Conservative, 15yr+ goal | Short lock-in, safety |

> 💡 **Pro Tip:** ELSS has the shortest lock-in (3 years) among all 80C options AND potential for highest returns. Start an ELSS SIP — use our [SIP Calculator](/calculators/sip) to project your returns.

## Real Example: Saving ₹46,800 in Tax

**Vikram** earns ₹12,00,000/year (₹1 lakh/month), falls in the 30% bracket (old regime).

| Investment | Amount | Where |
|---|---|---|
| EPF (auto-deducted) | ₹72,000 | Employer |
| ELSS SIP (₹5,000/month) | ₹60,000 | Mirae Asset Tax Saver |
| Children's tuition fee | ₹18,000 | School |
| **Total 80C** | **₹1,50,000** | |

**Tax saved:** ₹1,50,000 × 31.2% = **₹46,800/year**

Over 10 years, that's ₹4,68,000 saved in taxes — plus the ELSS corpus grows to ₹10+ lakh!

## Common Mistakes

1. **Waiting till January-March** — Invest at the start of the year via SIP, not last-minute lumpsum
2. **Buying insurance for tax saving** — Term insurance + ELSS is far better than endowment plans
3. **Ignoring EPF** — Your EPF already covers a chunk of 80C; don't over-invest in low-return options
4. **Not considering NPS** — Section 80CCD(1B) gives an additional ₹50,000 deduction over and above 80C

## Frequently Asked Questions

### Can I claim 80C under the new tax regime?

No. Section 80C deductions are only available under the **old tax regime**. Compare both regimes with our [Income Tax Calculator](/calculators/income-tax).

### Is there a limit on how many 80C investments I can make?

No limit on the number of investments, but total deduction is capped at ₹1,50,000 across all 80C instruments combined.

### Does PPF interest count towards the ₹1.5L limit?

No, only the **contribution** counts. PPF interest is tax-free and doesn't affect your 80C limit.

### Can husband and wife both claim 80C separately?

Yes, each individual can claim up to ₹1,50,000. That's ₹3,00,000 combined for a couple — potentially saving ₹93,600 in taxes together.

### When is the deadline for 80C investments?

March 31st of the financial year. But don't wait — invest early through SIPs to get the benefit of compounding. Calculate potential returns with our [PPF Calculator](/calculators/ppf).

---

*Disclaimer: Tax laws and investment returns mentioned are as per current rules and are subject to change. This article is for educational purposes — consult a CA or tax advisor for personalized advice.*`,
  },
];

async function main() {
  console.log('Seeding blogs...\n');

  for (const blog of seedBlogs) {
    const existing = await prisma.blog.findUnique({ where: { slug: blog.slug } });
    if (existing) {
      console.log(`  ✓ "${blog.slug}" already exists — skipping`);
      continue;
    }

    await prisma.blog.create({
      data: {
        ...blog,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    console.log(`  ✓ Created: "${blog.slug}"`);
  }

  console.log('\nDone! Seed blogs inserted.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
