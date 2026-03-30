// backend/src/routes/bankData.ts
// V2 cascade filtering routes - uses actual Prisma schema field names
// Import in index.ts: app.use(bankDataRouter)

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/cache';

const router = Router();

// ============================================
// BANK LISTING & FILTERING
// ============================================

/**
 * GET /api/v2/banks/with-presence
 * Fetch all active banks with their state presence
 * Cached: 24 hours
 */
router.get('/api/v2/banks/with-presence', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'banks_with_presence';
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json(cached); return }

    const banks = await prisma.banksMaster.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        bankType: true,
        bankStatePresences: {
          select: {
            stateId: true,
            branchesCount: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = banks.map((b) => ({
      id: b.id,
      name: b.name,
      short_name: b.shortName,
      logo_url: b.logoUrl,
      bank_type: b.bankType,
      states: b.bankStatePresences.map((p) => ({
        id: p.stateId,
        count: p.branchesCount,
      })),
    }));

    const out = { data, count: data.length };
    await cacheSet(cacheKey, out, 86400);
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

/**
 * GET /api/v2/banks/:bankId/states
 * Fetch states where a specific bank operates (cascade step 1)
 * Cached: 24 hours per bank
 */
router.get('/api/v2/banks/:bankId/states', async (req: Request, res: Response) => {
  try {
    const bankId = parseInt(req.params.bankId);
    const cacheKey = `bank_${bankId}_states`;
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json(cached); return }

    const presence = await prisma.bankStatePresence.findMany({
      where: { bankId },
      include: {
        state: { select: { id: true, name: true, code: true } },
      },
      orderBy: { state: { name: 'asc' } },
    });

    const data = presence.map((p) => ({
      id: p.state.id,
      name: p.state.name,
      code: p.state.code,
      branches_count: p.branchesCount,
    }));

    const out = { data, count: data.length };
    await cacheSet(cacheKey, out, 86400);
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states for bank' });
  }
});

/**
 * GET /api/v2/banks/:bankId/states/:stateId/districts
 * Fetch districts for a bank in a specific state (cascade step 2a)
 * Cached: 24 hours
 */
router.get(
  '/api/v2/banks/:bankId/states/:stateId/districts',
  async (req: Request, res: Response) => {
    try {
      const bankId = parseInt(req.params.bankId);
      const stateId = parseInt(req.params.stateId);
      const cacheKey = `bank_${bankId}_state_${stateId}_districts`;
      const cached = await cacheGet(cacheKey);
      if (cached) { res.json(cached); return }

      const districts = await prisma.district.findMany({
        where: {
          stateId,
          branches: {
            some: { bankId, isActive: true },
          },
        },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });

      const data = districts.map((d) => ({ id: d.id, name: d.name }));
      const out = { data, count: data.length };
      await cacheSet(cacheKey, out, 86400);
      res.json(out);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch districts' });
    }
  }
);

/**
 * GET /api/v2/banks/:bankId/states/:stateId/cities
 * Fetch cities where a bank operates in a state (cascade step 2b)
 * Cached: 24 hours
 */
router.get(
  '/api/v2/banks/:bankId/states/:stateId/cities',
  async (req: Request, res: Response) => {
    try {
      const bankId = parseInt(req.params.bankId);
      const stateId = parseInt(req.params.stateId);
      const cacheKey = `bank_${bankId}_state_${stateId}_cities`;
      const cached = await cacheGet(cacheKey);
      if (cached) { res.json(cached); return }

      const cities = await prisma.branch.findMany({
        where: { bankId, stateId, isActive: true },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
      });

      const data = cities.filter((c) => c.city).map((c) => ({ name: c.city }));
      const out = { data, count: data.length };
      await cacheSet(cacheKey, out, 86400);
      res.json(out);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cities' });
    }
  }
);

/**
 * GET /api/v2/banks/:bankId/states/:stateId/cities/:city/branches
 * Fetch branches for a bank in a specific city (cascade step 3)
 */
router.get(
  '/api/v2/banks/:bankId/states/:stateId/cities/:city/branches',
  async (req: Request, res: Response) => {
    try {
      const bankId = parseInt(req.params.bankId);
      const stateId = parseInt(req.params.stateId);
      const city = decodeURIComponent(req.params.city);

      const branches = await prisma.branch.findMany({
        where: {
          bankId,
          stateId,
          city: { equals: city, mode: 'insensitive' },
          isActive: true,
        },
        include: {
          bank: { select: { name: true } },
          state: { select: { name: true } },
          district: { select: { name: true } },
        },
        orderBy: { branchName: 'asc' },
      });

      const data = branches.map((b) => ({
        id: b.id,
        ifsc: b.ifsc,
        branch_name: b.branchName,
        address: b.address,
        city: b.city,
        district: b.district?.name ?? '',
        state: b.state.name,
        pincode: b.pincode,
        phone: b.phone,
        micr: b.micr,
        neft: b.neft,
        rtgs: b.rtgs,
        imps: b.imps,
        upi: b.upi,
      }));

      res.json({ data, count: data.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch branches' });
    }
  }
);

// ============================================
// SEARCH & LOOKUP
// ============================================

/**
 * GET /api/v2/search/banks?q=hdfc&limit=10
 * Search banks by name (autocomplete)
 */
router.get('/api/v2/search/banks', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(parseInt(String(req.query.limit || '10')), 20);

    if (!q) { res.json({ data: [] }); return }

    const banks = await prisma.banksMaster.findMany({
      where: {
        isActive: true,
        name: { contains: q, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        bankType: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    const data = banks.map((b) => ({
      id: b.id,
      name: b.name,
      short_name: b.shortName,
      logo_url: b.logoUrl,
      bank_type: b.bankType,
    }));

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/v2/ifsc/:code
 * Lookup branch by IFSC code
 * Cached: 7 days
 */
router.get('/api/v2/ifsc/:code', async (req: Request, res: Response) => {
  try {
    const ifsc = req.params.code.toUpperCase().trim();
    const cacheKey = `ifsc_v2_${ifsc}`;
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json(cached); return }

    const branch = await prisma.branch.findUnique({
      where: { ifsc },
      include: {
        bank: { select: { id: true, name: true, shortName: true, logoUrl: true, bankType: true } },
        state: { select: { name: true, code: true } },
        district: { select: { name: true } },
      },
    });

    if (!branch) {
      res.status(404).json({ error: 'IFSC code not found' });
      return
    }

    const data = {
      ifsc: branch.ifsc,
      bank_id: branch.bank.id,
      bank_name: branch.bank.name,
      short_name: branch.bank.shortName,
      bank_logo: branch.bank.logoUrl,
      bank_type: branch.bank.bankType,
      branch_name: branch.branchName,
      address: branch.address,
      city: branch.city,
      district: branch.district?.name ?? '',
      state: branch.state.name,
      state_code: branch.state.code,
      pincode: branch.pincode,
      phone: branch.phone,
      micr: branch.micr,
      neft: branch.neft,
      rtgs: branch.rtgs,
      imps: branch.imps,
      upi: branch.upi,
      latitude: branch.latitude,
      longitude: branch.longitude,
    };

    const out = { data };
    await cacheSet(cacheKey, out, 604800);
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IFSC details' });
  }
});

// ============================================
// ADMIN ENDPOINTS (require auth in production)
// ============================================

/**
 * GET /api/v2/admin/sync-status
 * Check last sync + totals
 */
router.get('/api/v2/admin/sync-status', async (req: Request, res: Response) => {
  try {
    const [lastSync, bankCount, branchCount] = await Promise.all([
      prisma.syncLog.findFirst({ orderBy: { createdAt: 'desc' } }),
      prisma.banksMaster.count({ where: { isActive: true } }),
      prisma.branch.count({ where: { isActive: true } }),
    ]);

    res.json({
      data: {
        total_banks: bankCount,
        total_branches: branchCount,
        last_sync: lastSync,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

/**
 * POST /api/v2/admin/rebuild-presence
 * Rebuild bank_state_presence table
 */
router.post('/api/v2/admin/rebuild-presence', async (req: Request, res: Response) => {
  try {
    await prisma.bankStatePresence.deleteMany({});

    await prisma.$executeRaw`
      INSERT INTO "bank_state_presence" ("bank_id", "state_id", "branches_count", "last_verified", "created_at", "updated_at")
      SELECT
        bk."id",
        br."state_id",
        COUNT(br."id"),
        NOW(),
        NOW(),
        NOW()
      FROM "Bank" bk
      JOIN "Branch" br ON bk."id" = br."bank_id"
      WHERE bk."is_active" = true AND br."is_active" = true
      GROUP BY bk."id", br."state_id"
    `;

    res.json({ success: true, message: 'Presence table rebuilt' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rebuild presence table' });
  }
});

/**
 * POST /api/v2/admin/mark-bank-merged
 * Body: { sourceBankId, targetBankId }
 */
router.post('/api/v2/admin/mark-bank-merged', async (req: Request, res: Response) => {
  try {
    const { sourceBankId, targetBankId } = req.body;

    await prisma.banksMaster.update({
      where: { id: sourceBankId },
      data: { isActive: false, mergedIntoId: targetBankId },
    });

    await prisma.branch.updateMany({
      where: { bankId: sourceBankId },
      data: { bankId: targetBankId },
    });

    res.json({ success: true, message: 'Bank marked as merged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark bank as merged' });
  }
});

export default router;
