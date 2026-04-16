/**
 * Seed script: Import 25 credit cards from credit_cards.json
 * Run: cd backend && npx ts-node scripts/seed-credit-cards.ts
 *   or: node -r ts-node/register scripts/seed-credit-cards.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Bank name in JSON → DB bank id mapping
const BANK_MAP: Record<string, number> = {
  "HDFC Bank": 780,
  "SBI Card": 240,       // State Bank of India
  "ICICI Bank": 13,
  "Axis Bank": 1138,
  "Kotak Mahindra Bank": 143,
  "IndusInd Bank": 758,
  "RBL Bank": 142,
  "IDFC First Bank": 350,
  "Yes Bank": 438,
  "Standard Chartered": 256,
  "Citi Bank": 353,
  // American Express will be created if not found
};

interface CardJSON {
  id: number;
  name: string;
  bank: string;
  category: string;
  annual_fee: number;
  joining_fee: number;
  reward_rate: string;
  rating: number;
  total_ratings: number;
  welcome_bonus: string | null;
  min_income: number;
  min_credit_score: number;
  is_featured: boolean;
  is_popular: boolean;
  top_benefit: string;
  network: string;
  description: string;
  key_benefits: string[];
  fee_waiver: string | null;
  lounge_access: boolean;
  lounge_count: number | null;
  fuel_surcharge_waiver: boolean;
  movie_benefits: boolean;
  golf_benefits: boolean;
  apply_url: string | null;
  card_image_url: string | null;
  created_at: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Map JSON network to our DB format
function mapNetwork(network: string): string {
  const map: Record<string, string> = {
    Visa: "Visa",
    Mastercard: "Mastercard",
    "Diners Club": "Diners",
    Amex: "Amex",
    RuPay: "RuPay",
  };
  return map[network] || network;
}

// Derive reward type from category/description
function deriveRewardType(card: CardJSON): string {
  const cat = card.category.toLowerCase();
  if (cat === "cashback") return "cashback";
  if (cat === "travel") return "miles";
  return "points";
}

async function main() {
  // Read JSON file
  const jsonPath = path.resolve("C:\\Users\\pavan\\Downloads\\credit_cards.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const cards: CardJSON[] = JSON.parse(raw);

  console.log(`Found ${cards.length} cards to import.\n`);

  // Ensure American Express bank exists
  let amexBank = await prisma.banksMaster.findFirst({
    where: { name: { contains: "American Express", mode: "insensitive" } },
  });
  if (!amexBank) {
    // Create American Express as a bank entry
    amexBank = await prisma.banksMaster.create({
      data: {
        name: "American Express",
        slug: "american-express",
        shortName: "AMEX",
      },
    });
    console.log(`Created American Express bank with id=${amexBank.id}`);
  } else {
    console.log(`Found American Express bank with id=${amexBank.id}`);
  }
  BANK_MAP["American Express"] = amexBank.id;

  // Get existing product slugs to avoid duplicates
  const existingSlugs = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug)
  );

  // Get or create features from key_benefits
  const allBenefits = new Set<string>();
  cards.forEach((c) => c.key_benefits.forEach((b) => allBenefits.add(b)));

  // We'll store key_benefits as offers with category tags instead of individual features
  // Features: lounge_access, fuel_surcharge_waiver, movie_benefits, golf_benefits
  const featureNames = [
    "Lounge Access",
    "Fuel Surcharge Waiver",
    "Movie Benefits",
    "Golf Benefits",
    "Welcome Bonus",
    "Fee Waiver",
    "No Annual Fee",
    "Contactless Payments",
  ];

  // Ensure features exist
  for (const fname of featureNames) {
    await prisma.feature.upsert({
      where: { name: fname },
      create: { name: fname },
      update: {},
    });
  }
  const features = await prisma.feature.findMany();
  const featureMap = new Map(features.map((f) => [f.name, f.id]));

  let imported = 0;
  let skipped = 0;

  for (const card of cards) {
    const slug = slugify(card.name);

    if (existingSlugs.has(slug)) {
      console.log(`SKIP (exists): ${card.name} → ${slug}`);
      skipped++;
      continue;
    }

    const bankId = BANK_MAP[card.bank];
    if (!bankId) {
      console.log(`SKIP (no bank): ${card.name} — bank "${card.bank}" not found`);
      skipped++;
      continue;
    }

    // Determine which features apply
    const cardFeatureIds: number[] = [];
    if (card.lounge_access && featureMap.has("Lounge Access"))
      cardFeatureIds.push(featureMap.get("Lounge Access")!);
    if (card.fuel_surcharge_waiver && featureMap.has("Fuel Surcharge Waiver"))
      cardFeatureIds.push(featureMap.get("Fuel Surcharge Waiver")!);
    if (card.movie_benefits && featureMap.has("Movie Benefits"))
      cardFeatureIds.push(featureMap.get("Movie Benefits")!);
    if (card.golf_benefits && featureMap.has("Golf Benefits"))
      cardFeatureIds.push(featureMap.get("Golf Benefits")!);
    if (card.welcome_bonus && featureMap.has("Welcome Bonus"))
      cardFeatureIds.push(featureMap.get("Welcome Bonus")!);
    if (card.fee_waiver && featureMap.has("Fee Waiver"))
      cardFeatureIds.push(featureMap.get("Fee Waiver")!);
    if (card.annual_fee === 0 && featureMap.has("No Annual Fee"))
      cardFeatureIds.push(featureMap.get("No Annual Fee")!);

    // Create product with details, offers, and features in a transaction
    const product = await prisma.product.create({
      data: {
        name: card.name,
        slug,
        category: "credit_card",
        bankId,
        network: mapNetwork(card.network),
        cardImageUrl: card.card_image_url || null,
        applyUrl: card.apply_url || null,
        isFeatured: card.is_featured,
        isPopular: card.is_popular,
        isActive: true,
        rating: card.rating,
        totalRatings: card.total_ratings,
        details: {
          create: {
            annualFee: card.annual_fee,
            joiningFee: card.joining_fee,
            minIncome: card.min_income,
            loungeAccess: card.lounge_count || (card.lounge_access ? 0 : null),
            rewardType: deriveRewardType(card),
          },
        },
        // Create one main offer per card from the top_benefit + reward_rate
        offers: {
          create: [
            {
              title: card.top_benefit,
              description: card.description,
              rewardRate: null, // reward_rate is text like "4 reward points per ₹150"
              rewardCap: null,
              category: card.category, // Travel, Cashback, Premium, etc.
              version: 1,
              isActive: true,
              validFrom: new Date(),
            },
            // Create key_benefits as additional offers
            ...card.key_benefits.slice(0, 3).map((benefit, idx) => ({
              title: benefit,
              description: null as string | null,
              rewardRate: null as number | null,
              rewardCap: null as number | null,
              category: card.category,
              version: 1,
              isActive: true,
              validFrom: new Date(),
            })),
          ],
        },
        features: {
          create: cardFeatureIds.map((fid) => ({
            featureId: fid,
          })),
        },
      },
    });

    console.log(`✓ ${card.name} → id=${product.id}, slug=${slug}, bank=${card.bank}(${bankId})`);
    imported++;
  }

  console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
