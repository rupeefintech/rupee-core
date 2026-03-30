// backend/src/routes/bankData.ts
// Add these routes to your Express app
// Import in index.ts: app.use(bankDataRouter)

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';

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

    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ data: JSON.parse(cached) });
    }

    const banks = await prisma.banksMaster.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        short_code: true,
        logo_url: true,
        bank_type: true,
        bankStatePresence: {
          select: {
            state_id: true,
            branches_count: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const transformed = banks.map((b) => ({
      id: b.id,
      name: b.name,
      short_code: b.short_code,
      logo_url: b.logo_url,
      bank_type: b.bank_type,
      states: b.bankStatePresence.map((p) => ({
        id: p.state_id,
        count: p.branches_count || 0,
      })),
    }));

    // Cache for 24 hours
    await cache.set(cacheKey, JSON.stringify(transformed), 86400);

    res.json({ data: transformed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

/**
 * GET /api/v2/banks/:bankId/states
 * Fetch states where a specific bank operates
 * Cached: 24 hours per bank
 */
router.get('/api/v2/banks/:bankId/states', async (req: Request, res: Response) => {
  try {
    const { bankId } = req.params;
    const cacheKey = `bank_${bankId}_states`;

    // Try cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ data: JSON.parse(cached) });
    }

    const presence = await prisma.bankStatePresence.findMany({
      where: { bank_id: parseInt(bankId) },
      include: {
        state: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: {
        state: { name: 'asc' },
      },
    });

    const formatted = presence.map((p) => ({
      id: p.state.id,
      name: p.state.name,
      code: p.state.code,
      branches_count: p.branches_count || 0,
    }));

    // Cache for 24 hours
    await cache.set(cacheKey, JSON.stringify(formatted), 86400);

    res.json({ data: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states for bank' });
  }
});

/**
 * GET /api/v2/banks/:bankId/states/:stateId/districts
 * Fetch districts for a bank in a specific state
 * Cached: 24 hours
 */
router.get(
  '/api/v2/banks/:bankId/states/:stateId/districts',
  async (req: Request, res: Response) => {
    try {
      const { bankId, stateId } = req.params;
      const cacheKey = `bank_${bankId}_state_${stateId}_districts`;

      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ data: JSON.parse(cached) });
      }

      const districts = await prisma.district.findMany({
        where: {
          state_id: parseInt(stateId),
          branches: {
            some: {
              bank_id: parseInt(bankId),
              is_active: true,
            },
          },
        },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });

      const result = districts.map((d) => ({ id: d.id, name: d.name }));

      await cache.set(cacheKey, JSON.stringify(result), 86400);

      res.json({ data: result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch districts' });
    }
  }
);

/**
 * GET /api/v2/banks/:bankId/states/:stateId/cities
 * Fetch cities where a bank operates in a state
 * Cached: 24 hours
 */
router.get(
  '/api/v2/banks/:bankId/states/:stateId/cities',
  async (req: Request, res: Response) => {
    try {
      const { bankId, stateId } = req.params;
      const cacheKey = `bank_${bankId}_state_${stateId}_cities`;

      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ data: JSON.parse(cached) });
      }

      const cities = await prisma.branch.findMany({
        where: {
          bank_id: parseInt(bankId),
          state_id: parseInt(stateId),
          is_active: true,
        },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
      });

      const result = cities
        .filter((c) => c.city)
        .map((c) => ({ name: c.city }));

      await cache.set(cacheKey, JSON.stringify(result), 86400);

      res.json({ data: result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cities' });
    }
  }
);

/**
 * GET /api/v2/banks/:bankId/states/:stateId/cities/:city/branches
 * Fetch branches for a bank in a specific city
 * NOT cached (frequently changing, small result set)
 */
router.get(
  '/api/v2/banks/:bankId/states/:stateId/cities/:city/branches',
  async (req: Request, res: Response) => {
    try {
      const { bankId, stateId, city } = req.params;

      const branches = await prisma.branch.findMany({
        where: {
          bank_id: parseInt(bankId),
          state_id: parseInt(stateId),
          city: {
            equals: decodeURIComponent(city),
            mode: 'insensitive',
          },
          is_active: true,
        },
        include: {
          bank: { select: { name: true } },
          state: { select: { name: true } },
          district: { select: { name: true } },
        },
        orderBy: { branch_name: 'asc' },
      });

      res.json({
        data: branches.map((b) => ({
          id: b.id,
          ifsc: b.ifsc,
          branch_name: b.branch_name,
          address: b.address,
          city: b.city,
          district: b.district?.name,
          state: b.state.name,
          pincode: b.pincode,
          phone: b.phone,
          micr: b.micr,
          neft: b.neft,
          rtgs: b.rtgs,
          imps: b.imps,
          upi: b.upi,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch branches' });
    }
  }
);

// ============================================
// SEARCH & LOOKUP
// ============================================

/**
 * GET /api/v2/search/banks
 * Search banks by name (for autocomplete)
 * Query: ?q=hdfc&limit=10
 */
router.get('/api/v2/search/banks', async (req: Request, res: Response) => {
  try {
    const { q, limit = '10' } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json({ data: [] });
    }

    const banks = await prisma.banksMaster.findMany({
      where: {
        is_active: true,
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        logo_url: true,
        bank_type: true,
      },
      take: Math.min(parseInt(limit as string), 20),
      orderBy: { name: 'asc' },
    });

    res.json({ data: banks });
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
    const { code } = req.params;
    const cacheKey = `ifsc_${code.toUpperCase()}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ data: JSON.parse(cached) });
    }

    const branch = await prisma.branch.findFirst({
      where: { ifsc: code.toUpperCase() },
      include: {
        bank: { select: { id: true, name: true, logo_url: true } },
        state: { select: { name: true } },
        district: { select: { name: true } },
      },
    });

    if (!branch) {
      return res.status(404).json({ error: 'IFSC code not found' });
    }

    const result = {
      ifsc: branch.ifsc,
      bank_id: branch.bank.id,
      bank_name: branch.bank.name,
      bank_logo: branch.bank.logo_url,
      branch_name: branch.branch_name,
      address: branch.address,
      city: branch.city,
      district: branch.district?.name,
      state: branch.state.name,
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

    // Cache for 7 days
    await cache.set(cacheKey, JSON.stringify(result), 604800);

    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IFSC details' });
  }
});

// ============================================
// ADMIN ENDPOINTS (require auth in production)
// ============================================

/**
 * GET /api/v2/admin/sync-status
 * Check last sync details
 */
router.get('/api/v2/admin/sync-status', async (req: Request, res: Response) => {
  try {
    const lastSync = await prisma.dataSyncLog.findFirst({
      orderBy: { created_at: 'desc' },
      take: 1,
    });

    const stats = await prisma.banksMaster.aggregate({
      _count: {
        id: true,
      },
      where: { is_active: true },
    });

    const branchCount = await prisma.branch.aggregate({
      _count: {
        id: true,
      },
      where: { is_active: true },
    });

    res.json({
      data: {
        total_banks: stats._count.id,
        total_branches: branchCount._count.id,
        last_sync: lastSync,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

/**
 * POST /api/v2/admin/rebuild-presence
 * Rebuild bank_state_presence table (admin only)
 */
router.post('/api/v2/admin/rebuild-presence', async (req: Request, res: Response) => {
  try {
    // Clear existing
    await prisma.bankStatePresence.deleteMany({});

    // Rebuild from branches
    const result = await prisma.$executeRaw`
      INSERT INTO "BankStatePresence" ("bank_id", "state_id", "branches_count", "last_verified", "created_at", "updated_at")
      SELECT 
        b."id",
        br."state_id",
        COUNT(br."id"),
        NOW(),
        NOW(),
        NOW()
      FROM "BanksMaster" b
      JOIN "Branch" br ON b."id" = br."bank_id"
      WHERE b."is_active" = true AND br."is_active" = true
      GROUP BY b."id", br."state_id"
    `;

    res.json({ success: true, message: 'Presence table rebuilt' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rebuild presence table' });
  }
});

/**
 * POST /api/v2/admin/mark-bank-merged
 * Mark a bank as merged into another
 * Body: { source_bank_id, target_bank_id }
 */
router.post('/api/v2/admin/mark-bank-merged', async (req: Request, res: Response) => {
  try {
    const { source_bank_id, target_bank_id } = req.body;

    // Update source bank
    await prisma.banksMaster.update({
      where: { id: source_bank_id },
      data: {
        is_active: false,
        merged_into_id: target_bank_id,
      },
    });

    // Reassign branches
    await prisma.branch.updateMany({
      where: { bank_id: source_bank_id },
      data: { bank_id: target_bank_id },
    });

    res.json({ success: true, message: 'Bank marked as merged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark bank as merged' });
  }
});

export default router;
