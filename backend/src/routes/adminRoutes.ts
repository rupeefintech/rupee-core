import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import prisma from "../lib/prisma";

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
        rewardType: product.details?.rewardType ?? null,
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
      cardImageUrl, applyUrl, isFeatured, isPopular, rating, totalRatings } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category: category || "credit_card",
        bankId: Number(bankId),
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

    // Create details if provided
    if (details) {
      await prisma.productDetails.create({
        data: {
          productId: product.id,
          annualFee: details.annualFee ? Number(details.annualFee) : null,
          joiningFee: details.joiningFee ? Number(details.joiningFee) : null,
          minIncome: details.minIncome ? Number(details.minIncome) : null,
          loungeAccess: details.loungeAccess ? Number(details.loungeAccess) : null,
          rewardType: details.rewardType || null,
        },
      });
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
      cardImageUrl, applyUrl, isFeatured, isPopular, rating, totalRatings } = req.body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(network !== undefined && { network }),
        ...(category && { category }),
        ...(bankId && { bankId: Number(bankId) }),
        ...(isActive !== undefined && { isActive }),
        ...(cardImageUrl !== undefined && { cardImageUrl: cardImageUrl || null }),
        ...(applyUrl !== undefined && { applyUrl: applyUrl || null }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPopular !== undefined && { isPopular }),
        ...(rating !== undefined && { rating: rating ? Number(rating) : 0 }),
        ...(totalRatings !== undefined && { totalRatings: totalRatings ? Number(totalRatings) : 0 }),
      },
    });

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
          rewardType: details.rewardType || null,
        },
        update: {
          annualFee: details.annualFee != null ? Number(details.annualFee) : null,
          joiningFee: details.joiningFee != null ? Number(details.joiningFee) : null,
          minIncome: details.minIncome != null ? Number(details.minIncome) : null,
          loungeAccess: details.loungeAccess != null ? Number(details.loungeAccess) : null,
          rewardType: details.rewardType || null,
        },
      });
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
    const search = (req.query.search as string) || "";
    const all = req.query.all === "true";

    let where: any;
    if (search) {
      where = { name: { contains: search, mode: "insensitive" } };
    } else if (all) {
      where = { logoUrl: { not: null } };
    } else {
      // Default: only known card issuers
      where = { name: { in: CARD_ISSUER_NAMES } };
    }

    const banks = await prisma.banksMaster.findMany({
      where,
      select: { id: true, name: true, slug: true, logoUrl: true },
      orderBy: { name: "asc" },
      take: 100,
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

export default router;
