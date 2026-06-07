import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import prisma from "../lib/prisma";
import { cacheDel } from "../lib/cache";

const router = express.Router();

// ─── Dashboard ──────────────────────────────────────────────────────────────
router.get("/dashboard", verifyToken, async (_req, res) => {
  try {
    const [productCount, bankCount, offerCount] = await Promise.all([
      prisma.product.count(),
      prisma.banksMaster.count(),
      prisma.productOffer.count({ where: { isActive: true } }),
    ]);

    res.json({ products: productCount, banks: bankCount, offers: offerCount });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Products (list) ────────────────────────────────────────────────────────
router.get("/products", verifyToken, async (req, res) => {
  try {
    const { category } = req.query;

    const where: any = {};
    if (category) where.category = category as string;

    const products = await prisma.product.findMany({
      where,
      include: {
        details: true,
        offers: { where: { isActive: true }, orderBy: { version: "desc" }, take: 1 },
        features: { include: { feature: true } },
        bank: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Flatten for frontend consumption
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      network: p.network,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isPopular: p.isPopular,
      rating: p.rating,
      totalRatings: p.totalRatings,
      cardImageUrl: p.cardImageUrl,
      applyUrl: p.applyUrl,
      bank: p.bank
        ? { id: p.bank.id, name: p.bank.name, slug: p.bank.slug, logo: p.bank.logoUrl }
        : null,
      annualFee: p.details?.annualFee ?? 0,
      offer: p.offers[0]
        ? { title: p.offers[0].title, description: p.offers[0].description }
        : null,
      features: p.features.map((f) => f.feature.name),
    }));

    res.json({ products: formatted });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Credit Card detail (by slug) ───────────────────────────────────────────
router.get("/credit-cards/:slug", verifyToken, async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ error: "Slug is required" });

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        bank: { select: { id: true, name: true, slug: true, logoUrl: true } },
        details: true,
        offers: { orderBy: [{ version: "desc" }, { createdAt: "desc" }] },
        features: { include: { feature: true } },
      },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    // Fetch new columns not yet in Prisma client via raw SQL
    const [rawProduct] = await prisma.$queryRawUnsafe<any[]>(
      `SELECT about_card, best_for FROM "Product" WHERE id = $1`, product.id
    );
    const [rawDetails] = product.details ? await prisma.$queryRawUnsafe<any[]>(
      `SELECT forex_markup, apr, atm_cash_fee, late_payment_fee, railway_surcharge, rent_payment_fee, reward_redemption_fee, annual_fee_waiver, joining_fee_waiver FROM "ProductDetails" WHERE product_id = $1`, product.id
    ) : [{}];

    const formatted = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      network: product.network,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isPopular: product.isPopular,
      rating: product.rating,
      totalRatings: product.totalRatings,
      cardImageUrl: product.cardImageUrl,
      applyUrl: product.applyUrl,
      aboutCard: rawProduct?.about_card ?? null,
      bestFor: rawProduct?.best_for ?? null,
      bank: {
        id: product.bank.id,
        name: product.bank.name,
        slug: product.bank.slug,
        logo: product.bank.logoUrl,
      },
      details: {
        annualFee: product.details?.annualFee ?? null,
        joiningFee: product.details?.joiningFee ?? null,
        minIncome: product.details?.minIncome ?? null,
        loungeAccess: product.details?.loungeAccess ?? null,
        loungeAccessNote: product.details?.loungeAccessNote ?? null,
        rewardType: product.details?.rewardType ?? null,
        forexMarkup: rawDetails?.forex_markup ?? null,
        apr: rawDetails?.apr ?? null,
        atmCashFee: rawDetails?.atm_cash_fee ?? null,
        latePaymentFee: rawDetails?.late_payment_fee ?? null,
        railwaySurcharge: rawDetails?.railway_surcharge ?? null,
        rentPaymentFee: rawDetails?.rent_payment_fee ?? null,
        rewardRedemptionFee: rawDetails?.reward_redemption_fee ?? null,
        annualFeeWaiver: rawDetails?.annual_fee_waiver ?? null,
        joiningFeeWaiver: rawDetails?.joining_fee_waiver ?? null,
      },
      offers: product.offers.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        rewardRate: o.rewardRate,
        rewardCap: o.rewardCap,
        category: o.category,
        isActive: o.isActive,
        validFrom: o.validFrom,
        validTo: o.validTo,
        version: o.version,
      })),
      features: product.features.map((f) => ({
        id: f.feature.id,
        name: f.feature.name,
      })),
    };

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─── Create Product ─────────────────────────────────────────────────────────
router.post("/products", verifyToken, async (req, res) => {
  try {
    const { name, slug, category, bankId, network, isActive, details, offers, featureIds,
      cardImageUrl, applyUrl, isFeatured, isPopular, rating, totalRatings, aboutCard, bestFor } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category: category || "credit_card",
        bank: { connect: { id: Number(bankId) } },
        network,
        isActive: isActive ?? true,
        cardImageUrl: cardImageUrl || null,
        applyUrl: applyUrl || null,
        isFeatured: isFeatured ?? false,
        isPopular: isPopular ?? false,
        rating: rating ? Number(rating) : 0,
        totalRatings: totalRatings ? Number(totalRatings) : 0,
      },
    });

    // Set new fields via raw SQL — Prisma client not yet regenerated
    if (aboutCard || bestFor) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Product" SET about_card = $1, best_for = $2 WHERE id = $3`,
        aboutCard || null, bestFor || null, product.id
      );
    }

    // Create details if provided
    if (details) {
      await prisma.productDetails.create({
        data: {
          productId: product.id,
          annualFee: details.annualFee ? Number(details.annualFee) : null,
          joiningFee: details.joiningFee ? Number(details.joiningFee) : null,
          minIncome: details.minIncome ? Number(details.minIncome) : null,
          loungeAccess: details.loungeAccess ? Number(details.loungeAccess) : null,
          loungeAccessNote: details.loungeAccessNote || null,
          rewardType: details.rewardType || null,
        },
      });
      // Set fee + waiver fields via raw SQL
      await prisma.$executeRawUnsafe(
        `UPDATE "ProductDetails" SET
          forex_markup = $1, apr = $2, atm_cash_fee = $3,
          late_payment_fee = $4, railway_surcharge = $5,
          rent_payment_fee = $6, reward_redemption_fee = $7,
          annual_fee_waiver = $8, joining_fee_waiver = $9
        WHERE product_id = $10`,
        details.forexMarkup ? Number(details.forexMarkup) : null,
        details.apr || null, details.atmCashFee || null,
        details.latePaymentFee || null, details.railwaySurcharge || null,
        details.rentPaymentFee || null, details.rewardRedemptionFee || null,
        details.annualFeeWaiver || null, details.joiningFeeWaiver || null,
        product.id
      );
    }

    // Create offers if provided
    if (offers && Array.isArray(offers) && offers.length > 0) {
      await prisma.productOffer.createMany({
        data: offers.map((o: any, idx: number) => ({
          productId: product.id,
          title: o.title,
          description: o.description || null,
          rewardRate: o.rewardRate ? Number(o.rewardRate) : null,
          rewardCap: o.rewardCap ? Number(o.rewardCap) : null,
          category: o.category || null,
          version: idx + 1,
          isActive: true,
          validFrom: o.validFrom ? new Date(o.validFrom) : null,
          validTo: o.validTo ? new Date(o.validTo) : null,
        })),
      });
    }

    // Link features if provided
    if (featureIds && Array.isArray(featureIds) && featureIds.length > 0) {
      await prisma.productFeatureMapping.createMany({
        data: featureIds.map((fId: number) => ({
          productId: product.id,
          featureId: Number(fId),
        })),
      });
    }

    res.json({ message: "Product created", product });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Update Product ─────────────────────────────────────────────────────────
router.put("/products/:id", verifyToken, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, slug, isActive, network, category, bankId, details, featureIds,
      cardImageUrl, applyUrl, isFeatured, isPopular, rating, totalRatings, aboutCard, bestFor } = req.body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(network !== undefined && { network }),
        ...(category && { category }),
        ...(bankId && { bank: { connect: { id: Number(bankId) } } }),
        ...(isActive !== undefined && { isActive }),
        ...(cardImageUrl !== undefined && { cardImageUrl: cardImageUrl || null }),
        ...(applyUrl !== undefined && { applyUrl: applyUrl || null }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPopular !== undefined && { isPopular }),
        ...(rating !== undefined && { rating: rating ? Number(rating) : 0 }),
        ...(totalRatings !== undefined && { totalRatings: totalRatings ? Number(totalRatings) : 0 }),
      },
    });

    // Set new fields (aboutCard, bestFor) via raw SQL — Prisma client not yet regenerated
    if (aboutCard !== undefined || bestFor !== undefined) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Product" SET about_card = $1, best_for = $2 WHERE id = $3`,
        aboutCard ?? null, bestFor ?? null, productId
      );
    }

    // Update details if provided
    if (details) {
      await prisma.productDetails.upsert({
        where: { productId },
        create: {
          productId,
          annualFee: details.annualFee != null ? Number(details.annualFee) : null,
          joiningFee: details.joiningFee != null ? Number(details.joiningFee) : null,
          minIncome: details.minIncome != null ? Number(details.minIncome) : null,
          loungeAccess: details.loungeAccess != null ? Number(details.loungeAccess) : null,
          loungeAccessNote: details.loungeAccessNote || null,
          rewardType: details.rewardType || null,
        },
        update: {
          annualFee: details.annualFee != null ? Number(details.annualFee) : null,
          joiningFee: details.joiningFee != null ? Number(details.joiningFee) : null,
          minIncome: details.minIncome != null ? Number(details.minIncome) : null,
          loungeAccess: details.loungeAccess != null ? Number(details.loungeAccess) : null,
          loungeAccessNote: details.loungeAccessNote || null,
          rewardType: details.rewardType || null,
        },
      });
      // Set fee + waiver fields via raw SQL — Prisma client not yet regenerated
      await prisma.$executeRawUnsafe(
        `UPDATE "ProductDetails" SET
          forex_markup = $1, apr = $2, atm_cash_fee = $3,
          late_payment_fee = $4, railway_surcharge = $5,
          rent_payment_fee = $6, reward_redemption_fee = $7,
          annual_fee_waiver = $8, joining_fee_waiver = $9
        WHERE product_id = $10`,
        details.forexMarkup != null ? Number(details.forexMarkup) : null,
        details.apr || null, details.atmCashFee || null,
        details.latePaymentFee || null, details.railwaySurcharge || null,
        details.rentPaymentFee || null, details.rewardRedemptionFee || null,
        details.annualFeeWaiver || null, details.joiningFeeWaiver || null,
        productId
      );
    }

    // Update feature mappings if provided
    if (featureIds && Array.isArray(featureIds)) {
      await prisma.productFeatureMapping.deleteMany({ where: { productId } });
      if (featureIds.length > 0) {
        await prisma.productFeatureMapping.createMany({
          data: featureIds.map((fId: number) => ({
            productId,
            featureId: Number(fId),
          })),
        });
      }
    }

    res.json({ message: "Product updated", product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// ─── Add Offer (new version) ────────────────────────────────────────────────
router.post("/products/:id/offers", verifyToken, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { title, description, rewardRate, rewardCap, category, validFrom, validTo } = req.body;

    // Get latest version number
    const latestOffer = await prisma.productOffer.findFirst({
      where: { productId },
      orderBy: { version: "desc" },
    });

    const newVersion = (latestOffer?.version ?? 0) + 1;

    // Deactivate previous active offers
    await prisma.productOffer.updateMany({
      where: { productId, isActive: true },
      data: { isActive: false },
    });

    const offer = await prisma.productOffer.create({
      data: {
        productId,
        title,
        description: description || null,
        rewardRate: rewardRate ? Number(rewardRate) : null,
        rewardCap: rewardCap ? Number(rewardCap) : null,
        category: category || null,
        version: newVersion,
        isActive: true,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
      },
    });

    res.json({ message: "Offer added", offer });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Update Offer ───────────────────────────────────────────────────────────
router.put("/offers/:id", verifyToken, async (req, res) => {
  try {
    const offerId = Number(req.params.id);
    const { title, description, rewardRate, rewardCap, category, isActive, validFrom, validTo } =
      req.body;

    const offer = await prisma.productOffer.update({
      where: { id: offerId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(rewardRate !== undefined && { rewardRate: rewardRate ? Number(rewardRate) : null }),
        ...(rewardCap !== undefined && { rewardCap: rewardCap ? Number(rewardCap) : null }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(validFrom !== undefined && { validFrom: validFrom ? new Date(validFrom) : null }),
        ...(validTo !== undefined && { validTo: validTo ? new Date(validTo) : null }),
      },
    });

    res.json({ message: "Offer updated", offer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update offer" });
  }
});

// ─── Delete Offer ───────────────────────────────────────────────────────────
router.delete("/offers/:id", verifyToken, async (req, res) => {
  try {
    const offerId = Number(req.params.id);
    await prisma.productOffer.delete({ where: { id: offerId } });
    res.json({ message: "Offer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete offer" });
  }
});

// ─── Delete Product ─────────────────────────────────────────────────────────
router.delete("/products/:id", verifyToken, async (req, res) => {
  try {
    const productId = Number(req.params.id);

    // Delete related records first
    await prisma.productFeatureMapping.deleteMany({ where: { productId } });
    await prisma.productOffer.deleteMany({ where: { productId } });
    await prisma.productDetails.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ─── Banks list (for dropdowns) ─────────────────────────────────────────────
// Known credit card issuing banks/entities
const CARD_ISSUER_NAMES = [
  "HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank",
  "IndusInd Bank", "Yes Bank", "RBL Bank", "IDFC First Bank", "Federal Bank",
  "Bank of Baroda", "Punjab National Bank", "Union Bank of India", "Canara Bank",
  "HSBC Bank", "Standard Chartered Bank", "Citibank", "American Express",
  "AU Small Finance Bank", "South Indian Bank", "Karnataka Bank",
  "Bank of India", "Indian Overseas Bank", "Central Bank of India",
];

router.get("/banks", verifyToken, async (req, res) => {
  try {
    const search    = (req.query.search as string) || "";
    const all       = req.query.all       === "true";
    const forRates  = req.query.for_rates === "true";

    let where: any;
    if (forRates) {
      where = { isActive: true };  // all active banks for rate entry
    } else if (search) {
      where = { name: { contains: search, mode: "insensitive" } };
    } else if (all) {
      where = { logoUrl: { not: null } };
    } else {
      // Default: only known card issuers
      where = { name: { in: CARD_ISSUER_NAMES } };
    }

    const banks = await prisma.banksMaster.findMany({
      where,
      select: { id: true, name: true, slug: true, logoUrl: true, bankType: true },
      orderBy: { name: "asc" },
      take: forRates ? 1500 : 100,
    });
    res.json({ banks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch banks" });
  }
});

// ─── Features list (for tagging) ────────────────────────────────────────────
router.get("/features", verifyToken, async (_req, res) => {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch features" });
  }
});

// ─── Revert offer version ───────────────────────────────────────────────────
router.post("/offers/:id/revert", verifyToken, async (req, res) => {
  try {
    const offerId = Number(req.params.id);

    const offer = await prisma.productOffer.findUnique({ where: { id: offerId } });
    if (!offer) return res.status(404).json({ error: "Offer not found" });

    // Deactivate all offers for this product
    await prisma.productOffer.updateMany({
      where: { productId: offer.productId, isActive: true },
      data: { isActive: false },
    });

    // Activate the selected offer
    await prisma.productOffer.update({
      where: { id: offerId },
      data: { isActive: true },
    });

    res.json({ message: "Offer reverted to version " + offer.version });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to revert offer" });
  }
});

// ─── Financial Rates CRUD ───────────────────────────────────────────────────
const VALID_RATE_TYPES = ['fd', 'savings', 'loan_personal', 'loan_home', 'loan_auto'];

// GET /api/admin/rates?type=fd  — list all rates (including inactive) for admin
router.get('/rates', verifyToken, async (req, res) => {
  try {
    const type = String(req.query.type ?? 'fd');
    const rows = await prisma.rateEntry.findMany({
      where: { productType: type },
      include: { bank: { select: { id: true, name: true, slug: true, logoUrl: true, shortName: true } } },
      orderBy: [{ isActive: 'desc' }, { rate: 'desc' }, { tenureMonths: 'asc' }],
    });
    res.json({ data: rows.map(r => ({
      ...r,
      rate:       Number(r.rate),
      seniorRate: r.seniorRate ? Number(r.seniorRate) : null,
      minAmount:  r.minAmount  ? Number(r.minAmount)  : null,
      maxAmount:  r.maxAmount  ? Number(r.maxAmount)  : null,
    })) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/rates  — create a new rate entry
router.post('/rates', verifyToken, async (req, res) => {
  try {
    const {
      bankId, productType, tenureLabel, tenureMonths,
      rate, seniorRate, minAmount, maxAmount,
      effectiveFrom, sourceUrl, verifiedBy, notes,
    } = req.body;

    if (!bankId || !productType || rate === undefined) {
      res.status(400).json({ error: 'bankId, productType, and rate are required' }); return;
    }
    if (!VALID_RATE_TYPES.includes(productType)) {
      res.status(400).json({ error: `productType must be one of: ${VALID_RATE_TYPES.join(', ')}` }); return;
    }

    const entry = await prisma.rateEntry.create({
      data: {
        bankId:        Number(bankId),
        productType,
        tenureLabel:   tenureLabel   || null,
        tenureMonths:  tenureMonths  ? Number(tenureMonths) : null,
        rate:          Number(rate),
        seniorRate:    seniorRate    ? Number(seniorRate)   : null,
        minAmount:     minAmount     ? BigInt(minAmount)    : null,
        maxAmount:     maxAmount     ? BigInt(maxAmount)    : null,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        sourceUrl:     sourceUrl     || null,
        verifiedBy:    verifiedBy    || null,
        notes:         notes         || null,
        lastVerified:  new Date(),
        source:        'manual',
      },
    });
    await cacheDel(`rates:${productType}`);
    res.status(201).json({ data: { ...entry, rate: Number(entry.rate) } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/rates/:id  — update a rate entry
router.put('/rates/:id', verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      tenureLabel, tenureMonths, rate, seniorRate,
      minAmount, maxAmount, effectiveFrom, sourceUrl,
      verifiedBy, notes, isActive,
    } = req.body;

    const data: any = { updatedAt: new Date(), lastVerified: new Date() };
    if (tenureLabel   !== undefined) data.tenureLabel   = tenureLabel   || null;
    if (tenureMonths  !== undefined) data.tenureMonths  = tenureMonths  ? Number(tenureMonths) : null;
    if (rate          !== undefined) data.rate          = Number(rate);
    if (seniorRate    !== undefined) data.seniorRate    = seniorRate    ? Number(seniorRate)   : null;
    if (minAmount     !== undefined) data.minAmount     = minAmount     ? BigInt(minAmount)    : null;
    if (maxAmount     !== undefined) data.maxAmount     = maxAmount     ? BigInt(maxAmount)    : null;
    if (effectiveFrom !== undefined) data.effectiveFrom = new Date(effectiveFrom);
    if (sourceUrl     !== undefined) data.sourceUrl     = sourceUrl     || null;
    if (verifiedBy    !== undefined) data.verifiedBy    = verifiedBy    || null;
    if (notes         !== undefined) data.notes         = notes         || null;
    if (isActive      !== undefined) data.isActive      = Boolean(isActive);

    const entry = await prisma.rateEntry.update({ where: { id }, data });
    await cacheDel(`rates:${entry.productType}`);
    res.json({ data: { ...entry, rate: Number(entry.rate) } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/rates/:id  — soft delete (deactivate)
router.delete('/rates/:id', verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.rateEntry.update({ where: { id }, data: { isActive: false, updatedAt: new Date() } });
    res.json({ message: 'Rate entry deactivated' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
