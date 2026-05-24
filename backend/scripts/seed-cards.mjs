// One-time seed: add 27 missing credit cards
// Run from backend/: node --env-file=.env scripts/seed-cards.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BANK = {
  HDFC:  780,
  SBI:   240,
  ICICI: 13,
  AXIS:  1138,
  IDFC:  350,
  AMEX:  8147,
  SC:    256,
  RBL:   142,
  INDUSIND: 758,
};

// Will be resolved at runtime
let HSBC_ID = null;

const CARDS = [
  // ── HDFC ──────────────────────────────────────────────────────────────────
  {
    bankId: BANK.HDFC, name: 'HDFC Tata Neu Infinity Credit Card',
    slug: 'hdfc-tata-neu-infinity-credit-card', network: 'RuPay',
    cardImageUrl: '/images/creditcards/hdfc-tata-neu-infinity-credit-card.png',
    isFeatured: true, isPopular: true, bestFor: 'Shopping,Tata Brands',
    details: { annualFee: 1499, joiningFee: 1499, minIncome: 360000, loungeAccess: 8, rewardType: 'points', annualFeeWaiver: 'Waived on ₹3,00,000 annual spend' },
    offer: { title: '5% NeuCoins on all Tata brand spends (BigBasket, Tata 1mg, Croma, Tata Play, Air India, etc.)', rewardRate: 5, rewardCap: null, category: 'Shopping' },
  },
  {
    bankId: BANK.HDFC, name: 'HDFC Bank Swiggy Credit Card',
    slug: 'hdfc-swiggy-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/hdfc-swiggy-credit-card.png',
    isPopular: true, bestFor: 'Food,Dining',
    details: { annualFee: 500, joiningFee: 500, minIncome: 300000, loungeAccess: 0, rewardType: 'cashback', annualFeeWaiver: 'Waived on ₹2,00,000 annual spend' },
    offer: { title: '10% cashback on Swiggy (food, Instamart, Dineout, Genie). 1% on all other spends.', rewardRate: 10, rewardCap: 1500, category: 'Food & Dining' },
  },
  {
    bankId: BANK.HDFC, name: 'HDFC Bank IRCTC Credit Card',
    slug: 'hdfc-irctc-credit-card', network: 'RuPay',
    cardImageUrl: '/images/creditcards/hdfc-irctc-credit-card.png',
    bestFor: 'Travel,Railways',
    details: { annualFee: 500, joiningFee: 500, minIncome: 300000, loungeAccess: 4, rewardType: 'points', railwaySurcharge: 'Waived on IRCTC transactions', annualFeeWaiver: 'Waived on ₹1,00,000 annual spend' },
    offer: { title: '5 reward points per ₹100 spent on IRCTC. 1 RP per ₹100 on all other spends. Free railway lounge access.', rewardRate: 5, rewardCap: null, category: 'Travel' },
  },
  {
    bankId: BANK.HDFC, name: 'HDFC Bank UPI RuPay Credit Card',
    slug: 'hdfc-upi-rupay-credit-card', network: 'RuPay',
    cardImageUrl: '/images/creditcards/hdfc-upi-rupay-credit-card.png',
    bestFor: 'UPI,Cashback',
    details: { annualFee: 0, joiningFee: 0, minIncome: 300000, loungeAccess: 0, rewardType: 'cashback' },
    offer: { title: '3% cashback on UPI transactions. Lifetime free card.', rewardRate: 3, rewardCap: 500, category: 'UPI' },
  },
  {
    bankId: BANK.HDFC, name: 'HDFC Bank PIXEL Play Credit Card',
    slug: 'hdfc-pixel-play-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/hdfc-pixel-play-credit-card.png',
    bestFor: 'Customizable,Cashback',
    details: { annualFee: 500, joiningFee: 500, minIncome: 300000, loungeAccess: 0, rewardType: 'cashback', annualFeeWaiver: 'Waived on ₹1,00,000 annual spend' },
    offer: { title: '5% cashback on 3 categories of your choice (from 10 options: Amazon, Swiggy, Myntra, BookMyShow, Uber, etc.)', rewardRate: 5, rewardCap: 1000, category: 'Shopping' },
  },

  // ── SBI ───────────────────────────────────────────────────────────────────
  {
    bankId: BANK.SBI, name: 'SBI Cashback Credit Card',
    slug: 'sbi-cashback-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/sbi-cashback-credit-card.png',
    isFeatured: true, isPopular: true, bestFor: 'Online Shopping,Cashback',
    details: { annualFee: 999, joiningFee: 999, minIncome: 300000, loungeAccess: 0, rewardType: 'cashback', annualFeeWaiver: 'Waived on ₹2,00,000 annual spend' },
    offer: { title: '5% cashback on all online spends. 1% cashback on offline spends. No merchant restrictions.', rewardRate: 5, rewardCap: 5000, category: 'Online Shopping' },
  },
  {
    bankId: BANK.SBI, name: 'SBI Card SimplySAVE',
    slug: 'sbi-simplysave-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/sbi-simplysave-credit-card.png',
    bestFor: 'Grocery,Dining,Movies',
    details: { annualFee: 499, joiningFee: 499, minIncome: 200000, loungeAccess: 0, rewardType: 'points', annualFeeWaiver: 'Waived on ₹1,00,000 annual spend' },
    offer: { title: '10x reward points on dining, movies, departmental stores & grocery spends. 1 RP per ₹100 elsewhere.', rewardRate: 10, rewardCap: null, category: 'Dining & Grocery' },
  },
  {
    bankId: BANK.SBI, name: 'SBI Card PRIME',
    slug: 'sbi-prime-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/sbi-prime-credit-card.png',
    isFeatured: true, isPopular: true, bestFor: 'Travel,Dining,Premium',
    details: { annualFee: 2999, joiningFee: 2999, minIncome: 600000, loungeAccess: 8, rewardType: 'points', loungeAccessNote: '8 domestic + 4 international per year', annualFeeWaiver: 'Waived on ₹3,00,000 annual spend' },
    offer: { title: '10 reward points per ₹100 on dining, groceries & departmental stores. 2 RP per ₹100 elsewhere. Welcome gift of ₹3,000 worth vouchers.', rewardRate: 10, rewardCap: null, category: 'Travel & Dining' },
  },
  {
    bankId: BANK.SBI, name: 'IRCTC SBI Card on RuPay',
    slug: 'sbi-irctc-rupay-credit-card', network: 'RuPay',
    cardImageUrl: '/images/creditcards/sbi-irctc-rupay-credit-card.png',
    bestFor: 'Railways,Travel',
    details: { annualFee: 500, joiningFee: 500, minIncome: 200000, loungeAccess: 4, rewardType: 'points', railwaySurcharge: 'Waived on IRCTC transactions', annualFeeWaiver: 'Waived on ₹1,00,000 annual spend' },
    offer: { title: '10% discount on AC (1A/2A/3A/CC) ticket booking on IRCTC app/website. Free railway lounge access at 4 stations per year.', rewardRate: 10, rewardCap: null, category: 'Travel' },
  },

  // ── ICICI ─────────────────────────────────────────────────────────────────
  {
    bankId: BANK.ICICI, name: 'ICICI Bank Emeralde Credit Card',
    slug: 'icici-emeralde-credit-card', network: 'Mastercard',
    cardImageUrl: '/images/creditcards/icici-emeralde-credit-card.png',
    isFeatured: true, bestFor: 'Premium,Travel,Lounge',
    details: { annualFee: 12000, joiningFee: 12000, minIncome: 1800000, loungeAccess: 999, loungeAccessNote: 'Unlimited domestic & international lounge access', rewardType: 'points', forexMarkup: 1.5 },
    offer: { title: '6 reward points per ₹100 on all spends. Unlimited lounge access. Golf privileges. Concierge service.', rewardRate: 6, rewardCap: null, category: 'Premium' },
  },
  {
    bankId: BANK.ICICI, name: 'MakeMyTrip ICICI Bank Credit Card',
    slug: 'icici-makemytrip-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/icici-makemytrip-credit-card.png',
    bestFor: 'Travel,Hotels,Flights',
    details: { annualFee: 999, joiningFee: 999, minIncome: 300000, loungeAccess: 2, rewardType: 'miles', annualFeeWaiver: 'Waived on ₹2,00,000 annual spend' },
    offer: { title: '2 My Cash per ₹200 on MakeMyTrip bookings. 1 My Cash per ₹200 on other travel. Welcome benefit of ₹1,200 My Cash.', rewardRate: 2, rewardCap: null, category: 'Travel' },
  },

  // ── AXIS ──────────────────────────────────────────────────────────────────
  {
    bankId: BANK.AXIS, name: 'Axis Bank Atlas Credit Card',
    slug: 'axis-bank-atlas-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/axis-bank-atlas-credit-card.png',
    isFeatured: true, isPopular: true, bestFor: 'Travel,Miles,International',
    details: { annualFee: 5000, joiningFee: 5000, minIncome: 900000, loungeAccess: 999, loungeAccessNote: 'Unlimited international + 12 domestic lounges per year', rewardType: 'miles', forexMarkup: 2.0, annualFeeWaiver: 'Waived on ₹7,50,000 annual spend' },
    offer: { title: '5 EDGE Miles per ₹100 on travel spends. 2 EDGE Miles per ₹100 on other spends. Transfer to 10+ airline/hotel partners.', rewardRate: 5, rewardCap: null, category: 'Travel' },
  },
  {
    bankId: BANK.AXIS, name: 'Axis Bank ACE Credit Card',
    slug: 'axis-bank-ace-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/axis-bank-ace-credit-card.png',
    isPopular: true, bestFor: 'Cashback,Bills,Food',
    details: { annualFee: 499, joiningFee: 499, minIncome: 300000, loungeAccess: 0, rewardType: 'cashback', annualFeeWaiver: 'Waived on ₹2,00,000 annual spend' },
    offer: { title: '5% cashback on bill payments via Google Pay. 4% cashback on Swiggy, Zomato & Ola. 2% on all other spends.', rewardRate: 5, rewardCap: 500, category: 'Cashback' },
  },
  {
    bankId: BANK.AXIS, name: 'Axis Bank MyZone Credit Card',
    slug: 'axis-bank-myzone-credit-card', network: 'Mastercard',
    cardImageUrl: '/images/creditcards/axis-bank-myzone-credit-card.png',
    bestFor: 'Movies,Shopping,Entertainment',
    details: { annualFee: 500, joiningFee: 500, minIncome: 240000, loungeAccess: 0, rewardType: 'cashback', annualFeeWaiver: 'Waived on ₹2,50,000 annual spend' },
    offer: { title: '25% cashback on movie tickets (BookMyShow/PVR). 10% cashback on Myntra. 2% on all other online spends.', rewardRate: 25, rewardCap: 500, category: 'Entertainment' },
  },
  {
    bankId: BANK.AXIS, name: 'Axis Bank IndianOil Credit Card',
    slug: 'axis-bank-indianoil-credit-card', network: 'RuPay',
    cardImageUrl: '/images/creditcards/axis-bank-indianoil-credit-card.png',
    bestFor: 'Fuel,Cashback',
    details: { annualFee: 500, joiningFee: 500, minIncome: 240000, loungeAccess: 0, rewardType: 'points', annualFeeWaiver: 'Waived on ₹50,000 annual spend' },
    offer: { title: '20 EDGE Reward Points per ₹100 at IndianOil outlets. 5 points per ₹100 on grocery & utility. 1 point per ₹100 elsewhere.', rewardRate: 20, rewardCap: null, category: 'Fuel' },
  },
  {
    bankId: BANK.AXIS, name: 'Axis Bank Horizon Credit Card',
    slug: 'axis-bank-horizon-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/axis-bank-horizon-credit-card.png',
    bestFor: 'Travel,Hotels,Miles',
    details: { annualFee: 3000, joiningFee: 3000, minIncome: 600000, loungeAccess: 8, loungeAccessNote: '4 domestic + 4 international per year', rewardType: 'miles', forexMarkup: 2.0, annualFeeWaiver: 'Waived on ₹5,00,000 annual spend' },
    offer: { title: '5 EDGE Miles per ₹200 on travel, hotels & international spends. 1 EDGE Mile per ₹200 on all other spends.', rewardRate: 5, rewardCap: null, category: 'Travel' },
  },

  // ── IDFC FIRST ────────────────────────────────────────────────────────────
  {
    bankId: BANK.IDFC, name: 'IDFC FIRST Select Credit Card',
    slug: 'idfc-first-select-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/idfc-first-select-credit-card.png',
    isFeatured: true, bestFor: 'Weekend Dining,Rewards',
    details: { annualFee: 10000, joiningFee: 10000, minIncome: 600000, loungeAccess: 4, rewardType: 'points', annualFeeWaiver: 'Waived on ₹3,00,000 annual spend' },
    offer: { title: '10x reward points on weekend dining. 3x on all other spends. 1% cashback on UPI transactions. Complimentary roadside assistance.', rewardRate: 10, rewardCap: null, category: 'Dining' },
  },
  {
    bankId: BANK.IDFC, name: 'IDFC FIRST Classic Credit Card',
    slug: 'idfc-first-classic-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/idfc-first-classic-credit-card.png',
    isPopular: true, bestFor: 'Lifetime Free,Rewards',
    details: { annualFee: 0, joiningFee: 0, minIncome: 180000, loungeAccess: 0, rewardType: 'points' },
    offer: { title: '10x reward points on weekends (dining, entertainment). 1x on weekdays. 1% cashback on UPI. Lifetime free card.', rewardRate: 10, rewardCap: null, category: 'Weekend Rewards' },
  },
  {
    bankId: BANK.IDFC, name: 'IDFC FIRST Power+ Credit Card',
    slug: 'idfc-first-power-plus-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/idfc-first-power-plus-credit-card.png',
    bestFor: 'Fuel,HPCL',
    details: { annualFee: 199, joiningFee: 199, minIncome: 180000, loungeAccess: 0, rewardType: 'points', annualFeeWaiver: 'Waived on ₹50,000 annual spend' },
    offer: { title: '6.5% value back on HPCL fuel purchases. 5% on grocery & utility via HPCL power app. 1x on all other spends.', rewardRate: 6.5, rewardCap: null, category: 'Fuel' },
  },
  {
    bankId: BANK.IDFC, name: 'IDFC FIRST SWYP Credit Card',
    slug: 'idfc-first-swyp-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/idfc-first-swyp-credit-card.png',
    isPopular: true, bestFor: 'Students,Lifetime Free,Cashback',
    details: { annualFee: 0, joiningFee: 0, minIncome: 0, loungeAccess: 0, rewardType: 'cashback' },
    offer: { title: '1% cashback on all spends. No annual fee. Designed for students & first-time credit card users. Easy approval.', rewardRate: 1, rewardCap: 1000, category: 'Cashback' },
  },

  // ── HSBC ──────────────────────────────────────────────────────────────────
  {
    bankKey: 'HSBC', name: 'HSBC Live+ Credit Card',
    slug: 'hsbc-live-plus-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/hsbc-live-plus-credit-card.png',
    isPopular: true, bestFor: 'Dining,Grocery,Cashback',
    details: { annualFee: 999, joiningFee: 999, minIncome: 400000, loungeAccess: 0, rewardType: 'cashback', annualFeeWaiver: 'Waived on ₹2,00,000 annual spend' },
    offer: { title: '10% cashback on dining, food delivery & grocery (Swiggy, Zomato, BigBasket, Amazon Fresh). 1.5% cashback on all other spends.', rewardRate: 10, rewardCap: 1000, category: 'Dining & Grocery' },
  },
  {
    bankKey: 'HSBC', name: 'HSBC Premier Credit Card',
    slug: 'hsbc-premier-credit-card', network: 'Mastercard',
    cardImageUrl: '/images/creditcards/hsbc-premier-credit-card.png',
    isFeatured: true, bestFor: 'Premium,Travel,International',
    details: { annualFee: 0, joiningFee: 0, minIncome: 0, loungeAccess: 999, loungeAccessNote: 'Unlimited Priority Pass lounge access worldwide', rewardType: 'points', forexMarkup: 0 },
    offer: { title: '2 reward points per ₹100 on all spends. Zero forex markup. Unlimited airport lounges worldwide. Exclusively for HSBC Premier banking customers.', rewardRate: 2, rewardCap: null, category: 'Premium' },
  },
  {
    bankKey: 'HSBC', name: 'HSBC RuPay Cashback Credit Card',
    slug: 'hsbc-rupay-cashback-credit-card', network: 'RuPay',
    cardImageUrl: '/images/creditcards/hsbc-rupay-cashback-credit-card.png',
    bestFor: 'UPI,Lifetime Free,Cashback',
    details: { annualFee: 0, joiningFee: 0, minIncome: 300000, loungeAccess: 0, rewardType: 'cashback' },
    offer: { title: '1.5% cashback on all UPI payments made with this card. Lifetime free. No minimum spend required.', rewardRate: 1.5, rewardCap: 500, category: 'UPI Cashback' },
  },

  // ── AmEx ──────────────────────────────────────────────────────────────────
  {
    bankId: BANK.AMEX, name: 'American Express Membership Rewards Credit Card',
    slug: 'american-express-mrcc-credit-card', network: 'Amex',
    cardImageUrl: '/images/creditcards/american-express-mrcc-credit-card.png',
    isPopular: true, bestFor: 'Rewards,Welcome Bonus,Shopping',
    details: { annualFee: 1500, joiningFee: 1500, minIncome: 600000, loungeAccess: 0, rewardType: 'points', annualFeeWaiver: 'Waived on ₹90,000 annual spend (first year); ₹1,50,000 (second year onwards)' },
    offer: { title: '1 Membership Rewards point per ₹50 spent. 1,000 bonus MR points on 4+ transactions of ₹1,500+ in a month. Redeem at 1:0.25 to 1:1 on partners.', rewardRate: 2, rewardCap: null, category: 'Rewards' },
  },

  // ── Standard Chartered ────────────────────────────────────────────────────
  {
    bankId: BANK.SC, name: 'Standard Chartered Ultimate Credit Card',
    slug: 'standard-chartered-ultimate-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/standard-chartered-ultimate-credit-card.png',
    isFeatured: true, bestFor: 'Travel,Cashback,Low Forex',
    details: { annualFee: 5000, joiningFee: 5000, minIncome: 1200000, loungeAccess: 6, loungeAccessNote: '6 complimentary domestic lounge visits per year', rewardType: 'cashback', forexMarkup: 1.0, annualFeeWaiver: 'Waived on ₹5,00,000 annual spend' },
    offer: { title: '3.3% reward rate (5 points per ₹150 = ~3.3% back). 1% forex markup — among lowest in India. ₹5,000 joining voucher on first transaction.', rewardRate: 3.3, rewardCap: null, category: 'Travel & Cashback' },
  },

  // ── RBL ───────────────────────────────────────────────────────────────────
  {
    bankId: BANK.RBL, name: 'RBL Bank World Safari Credit Card',
    slug: 'rbl-bank-world-safari-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/rbl-bank-world-safari-credit-card.png',
    bestFor: 'Travel,Lounge,International',
    details: { annualFee: 3000, joiningFee: 3000, minIncome: 600000, loungeAccess: 8, loungeAccessNote: 'Complimentary airport lounge access', rewardType: 'miles', forexMarkup: 0, annualFeeWaiver: 'Waived on ₹4,00,000 annual spend' },
    offer: { title: 'Zero forex markup on international transactions. 2 reward points per ₹100. Complimentary travel insurance. 8 lounge visits per year.', rewardRate: 2, rewardCap: null, category: 'Travel' },
  },

  // ── IndusInd ──────────────────────────────────────────────────────────────
  {
    bankId: BANK.INDUSIND, name: 'IndusInd Bank Pinnacle Credit Card',
    slug: 'indusind-bank-pinnacle-credit-card', network: 'Visa',
    cardImageUrl: '/images/creditcards/indusind-bank-pinnacle-credit-card.png',
    isFeatured: true, bestFor: 'Super Premium,Golf,Concierge',
    details: { annualFee: 60000, joiningFee: 60000, minIncome: 3600000, loungeAccess: 999, loungeAccessNote: 'Unlimited domestic & international Priority Pass lounge access', rewardType: 'points', forexMarkup: 0, annualFeeWaiver: 'No waiver — premium tier' },
    offer: { title: '1.5 reward points per ₹100 on all spends. Unlimited lounge access worldwide. Dedicated concierge. Complimentary golf rounds. Zero forex markup.', rewardRate: 1.5, rewardCap: null, category: 'Super Premium' },
  },
];

async function main() {
  // Resolve HSBC bank ID
  const hsbc = await prisma.banksMaster.findFirst({
    where: { name: { contains: 'Hongkong', mode: 'insensitive' } },
    select: { id: true, name: true },
  });
  if (!hsbc) {
    // Try alternate name
    const hsbc2 = await prisma.banksMaster.findFirst({
      where: { shortName: { contains: 'HSBC', mode: 'insensitive' } },
      select: { id: true, name: true },
    });
    HSBC_ID = hsbc2?.id ?? null;
    if (HSBC_ID) console.log(`HSBC resolved as: ${hsbc2.name} (id: ${HSBC_ID})`);
  } else {
    HSBC_ID = hsbc.id;
    console.log(`HSBC resolved as: ${hsbc.name} (id: ${HSBC_ID})`);
  }

  if (!HSBC_ID) {
    console.warn('HSBC bank not found in DB — will skip HSBC cards. Check bank name manually.');
  }

  let created = 0, skipped = 0;

  for (const card of CARDS) {
    // Check if slug already exists
    const existing = await prisma.product.findUnique({ where: { slug: card.slug } });
    if (existing) {
      console.log(`  SKIP (exists): ${card.slug}`);
      skipped++;
      continue;
    }

    const bankId = card.bankId ?? (card.bankKey === 'HSBC' ? HSBC_ID : null);
    if (!bankId) {
      console.warn(`  SKIP (no bankId): ${card.slug}`);
      skipped++;
      continue;
    }

    try {
      const product = await prisma.product.create({
        data: {
          name: card.name,
          slug: card.slug,
          category: 'credit_card',
          bankId,
          network: card.network,
          cardImageUrl: card.cardImageUrl,
          applyUrl: null, // user will add affiliate URLs via admin
          isFeatured: card.isFeatured ?? false,
          isPopular: card.isPopular ?? false,
          isActive: true,
          rating: 0,
          totalRatings: 0,
        },
      });

      // Set bestFor via raw SQL
      if (card.bestFor) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Product" SET best_for = $1 WHERE id = $2`,
          card.bestFor, product.id
        );
      }

      // Create details
      if (card.details) {
        const d = card.details;
        await prisma.productDetails.create({
          data: {
            productId: product.id,
            annualFee: d.annualFee ?? null,
            joiningFee: d.joiningFee ?? null,
            minIncome: d.minIncome ?? null,
            loungeAccess: d.loungeAccess ?? null,
            loungeAccessNote: d.loungeAccessNote ?? null,
            rewardType: d.rewardType ?? null,
            forexMarkup: d.forexMarkup ?? null,
          },
        });
        // Set waiver fields via raw SQL
        if (d.annualFeeWaiver || d.railwaySurcharge) {
          await prisma.$executeRawUnsafe(
            `UPDATE "ProductDetails" SET annual_fee_waiver = $1, railway_surcharge = $2 WHERE product_id = $3`,
            d.annualFeeWaiver ?? null, d.railwaySurcharge ?? null, product.id
          );
        }
      }

      // Create primary offer
      if (card.offer) {
        const o = card.offer;
        await prisma.productOffer.create({
          data: {
            productId: product.id,
            title: o.title,
            description: o.title,
            rewardRate: o.rewardRate ?? null,
            rewardCap: o.rewardCap ?? null,
            category: o.category ?? null,
            isActive: true,
            version: 1,
          },
        });
      }

      console.log(`  CREATED: ${card.slug} (id: ${product.id})`);
      created++;
    } catch (err) {
      console.error(`  ERROR: ${card.slug} — ${err.message}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
