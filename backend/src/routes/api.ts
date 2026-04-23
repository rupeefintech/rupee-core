import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { cacheGet, cacheSet, cacheFlush } from '../lib/cache'

const router = Router()

// ── In-memory cache for hot endpoints ────────────────────────────────────────
const memCache = new Map<string, { data: any; expires: number }>()

function memGet(key: string): any | null {
  const entry = memCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) { memCache.delete(key); return null }
  return entry.data
}

function memSet(key: string, data: any, ttlSec = 3600): void {
  memCache.set(key, { data, expires: Date.now() + ttlSec * 1000 })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ipHash(req: Request): string {
  return Buffer.from(req.ip || '').toString('base64').substring(0, 16)
}

async function logSearch(type: string, query: string, count: number, req: Request) {
  try {
    await prisma.searchLog.create({
      data: { searchType: type, query, resultsCount: count, ipHash: ipHash(req) },
    })
  } catch { /* non-critical */ }
}

// ── GET /api/states ──────────────────────────────────────────────────────────
router.get('/states', async (_req: Request, res: Response) => {
  const KEY = 'states'

  // 1. In-memory cache (instant)
  const mem = memGet(KEY)
  if (mem) { res.json(mem); return }

  // 2. Redis cache
  const cached = await cacheGet(KEY)
  if (cached) { memSet(KEY, cached); res.json(cached); return }

  // 3. DB query
  const states = await prisma.state.findMany({
    select: { id: true, name: true, code: true, logoUrl: true },
    orderBy: { name: 'asc' },
  })
  const out = { data: states, count: states.length }
  memSet(KEY, out)
  await cacheSet(KEY, out)
  res.json(out)
})

// ── GET /api/banks ───────────────────────────────────────────────────────────
router.get('/banks', async (_req: Request, res: Response) => {
  const KEY = 'banks'

  // 1. In-memory cache (instant)
  const mem = memGet(KEY)
  if (mem) { res.json(mem); return }

  // 2. Redis cache
  const cached = await cacheGet(KEY)
  if (cached) { memSet(KEY, cached); res.json(cached); return }

  // 3. DB query — only active banks
  const banks = await prisma.banksMaster.findMany({
    where: { isActive: true },
    select: {
      id: true, name: true, slug: true,
      shortName: true, bankType: true, headquarters: true, website: true, logoUrl: true,
    },
    orderBy: { name: 'asc' },
  })

  // Map camelCase → snake_case for frontend compatibility
  const data = banks.map(b => ({
    id:           b.id,
    name:         b.name,
    slug:         b.slug,
    short_name:   b.shortName,
    bank_type:    b.bankType,
    headquarters: b.headquarters,
    website:      b.website,
    logo_url:     b.logoUrl || null,
  }))

  const out = { data, count: data.length }
  memSet(KEY, out)
  await cacheSet(KEY, out)
  res.json(out)
})

// ── GET /api/districts?state_id=1&bank_id=2 ──────────────────────────────────
router.get('/districts', async (req: Request, res: Response) => {
  const sid = Number(req.query.state_id)
  const bid = Number(req.query.bank_id) || null
  if (!sid) { res.status(400).json({ error: 'state_id required' }); return }

  const KEY = `districts_${sid}_${bid ?? 'all'}`
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  let districts

  if (bid) {
    // Only districts where THIS bank has branches in THIS state
    const branches = await prisma.branch.findMany({
      where: { bankId: bid, stateId: sid, districtId: { not: null } },
      select: { district: { select: { id: true, name: true } } },
      distinct: ['districtId'],
    })
    districts = branches
      .filter(b => b.district)
      .map(b => ({ id: b.district!.id, name: b.district!.name, state_name: '' }))
      .sort((a, b) => a.name.localeCompare(b.name))

    // Fill state_name
    const state = await prisma.state.findUnique({ where: { id: sid }, select: { name: true } })
    districts = districts.map(d => ({ ...d, state_name: state?.name ?? '' }))
  } else {
    const rows = await prisma.district.findMany({
      where: { stateId: sid },
      select: { id: true, name: true, state: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })
    districts = rows.map(d => ({ id: d.id, name: d.name, state_name: d.state.name }))
  }

  const out = { data: districts, count: districts.length }
  await cacheSet(KEY, out)
  res.json(out)
})

// ── GET /api/branches?bank_id=&state_id=&district_id= ────────────────────────
router.get('/branches', async (req: Request, res: Response) => {
  const bankId     = Number(req.query.bank_id)
  const stateId    = Number(req.query.state_id)
  const districtId = req.query.district_id ? Number(req.query.district_id) : undefined

  if (!bankId || !stateId) {
    res.status(400).json({ error: 'bank_id and state_id are required' })
    return
  }

  const KEY = `branches_${bankId}_${stateId}_${districtId ?? 'all'}`
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const branches = await prisma.branch.findMany({
    where: {
      bankId,
      stateId,
      ...(districtId ? { districtId } : {}),
    },
    select: {
      id: true, ifsc: true, branchName: true, city: true,
      district: { select: { name: true } },
    },
    orderBy: { branchName: 'asc' },
    take: 200,
  })

  const data = branches.map(b => ({
    id:            b.id,
    ifsc:          b.ifsc,
    branch_name:   b.branchName,
    city:          b.city,
    district_name: b.district?.name ?? '',
  }))

  const out = { data, count: data.length }
  await cacheSet(KEY, out)
  res.json(out)
})

// ── GET /api/bank/:bankName ───────────────────────────────────────────────
/*--router.get('/bank/:bankName', async (req: Request, res: Response) => {
  const bankName = decodeURIComponent(req.params.bankName).replace(/-/g, ' ')

  const KEY = `bank_${bankName}`
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const bank = await prisma.banksMaster.findFirst({
    where: { name: { equals: bankName, mode: 'insensitive' } },
  })

  if (!bank) {
    return res.status(404).json({ error: 'Bank not found' })
  }

  const branches = await prisma.branch.findMany({
    where: { bankId: bank.id },
    select: {
      ifsc: true,
      branchName: true,
      city: true,
      state: { select: { name: true } },
    },
    take: 500,
  })

  const data = {
    bank: bank.name,
    total_branches: branches.length,
    branches: branches.map(b => ({
      ifsc: b.ifsc,
      branch_name: b.branchName,
      city: b.city,
      state_name: b.state.name,
    })),
  }

  await cacheSet(KEY, { data }, 86400)
  res.json({ data })
})

*/

// ── GET /api/state/:stateName ─────────────────────────────────────────────
router.get('/state/:stateName', async (req: Request, res: Response) => {
  const stateName = decodeURIComponent(req.params.stateName).replace(/-/g, ' ')

  const KEY = `state_${stateName}`
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const state = await prisma.state.findFirst({
    where: { name: { equals: stateName, mode: 'insensitive' } },
  })

  if (!state) {
    return res.status(404).json({ error: 'State not found' })
  }

  const branches = await prisma.branch.findMany({
    where: { stateId: state.id },
    select: {
      ifsc: true,
      branchName: true,
      bank: { select: { name: true } },
      city: true,
    },
    take: 500,
  })

  const data = {
    state: state.name,
    total_branches: branches.length,
    branches: branches.map(b => ({
      ifsc: b.ifsc,
      branch_name: b.branchName,
      bank_name: b.bank.name,
      city: b.city,
    })),
  }

  await cacheSet(KEY, { data }, 86400)
  res.json({ data })
})

// ── GET /api/city/:cityName ───────────────────────────────────────────────
router.get('/city/:cityName', async (req: Request, res: Response) => {
  const cityName = decodeURIComponent(req.params.cityName).replace(/-/g, ' ')

  const KEY = `city_${cityName}`
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const branches = await prisma.branch.findMany({
    where: {
      city: { equals: cityName, mode: 'insensitive' },
    },
    select: {
      ifsc: true,
      branchName: true,
      bank: { select: { name: true } },
      state: { select: { name: true } },
    },
    take: 500,
  })

  const data = {
    city: cityName,
    total_branches: branches.length,
    branches: branches.map(b => ({
      ifsc: b.ifsc,
      branch_name: b.branchName,
      bank_name: b.bank.name,
      state_name: b.state.name,
    })),
  }

  await cacheSet(KEY, { data }, 86400)
  res.json({ data })
})

router.get('/bank/:bankSlug', async (req: Request, res: Response) => {

  const { bankSlug } = req.params;
  const bank = await prisma.banksMaster.findFirst({
    where: {
      slug: bankSlug
    }
  });

  if (!bank) {
    return res.status(404).json({ error: 'Bank not found' });
  }

  const branches = await prisma.branch.findMany({
    where: { bankId: bank.id },
    select: {
      ifsc: true,
      branchName: true,
      city: true,
      state: { select: { name: true } },
    },
    take: 500,
  });

  const data = {
    bank: bank.name,
    logo_url: bank.logoUrl,
    total_branches: branches.length,
    branches: branches.map(b => ({
      ifsc: b.ifsc,
      branch_name: b.branchName,
      city: b.city,
      state_name: b.state.name,
    })),
  };


  res.json({ data });
});

// ── GET /api/bank/:bankSlug/cities/:stateSlug ─ Cities for bank+state ────────
router.get('/bank/:bankSlug/cities/:stateSlug', async (req: Request, res: Response) => {
  const { bankSlug, stateSlug } = req.params;

  const bank = await prisma.banksMaster.findFirst({
    where: { slug: bankSlug }
  });
  if (!bank) return res.status(404).json({ error: 'Bank not found' });

  const state = await prisma.state.findFirst({
    where: { name: { equals: stateSlug, mode: 'insensitive' } }
  });
  if (!state) return res.status(404).json({ error: 'State not found' });

  const branches = await prisma.branch.findMany({
    where: { bankId: bank.id, stateId: state.id, city: { not: null } },
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
  });

  // Normalize city names: collapse variants like "Ranga Reddy"/"Rangareddi"/"Rangareddy"
  // by removing spaces, hyphens and lowercasing to detect duplicates, keeping the most common spelling
  const rawCities = branches.filter(b => b.city).map(b => b.city!);
  const normalize = (s: string) => s.toLowerCase().replace(/[\s\-'\.]/g, '');
  const grouped = new Map<string, string[]>();
  for (const c of rawCities) {
    const key = normalize(c);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }
  // Pick the first alphabetical variant as canonical (title-cased naturally from DB)
  const cities = Array.from(grouped.values())
    .map(variants => ({ city: variants.sort()[0] }))
    .sort((a, b) => a.city.localeCompare(b.city));

  res.json({
    bank: { id: bank.id, name: bank.name, shortName: bank.shortName, logo_url: bank.logoUrl },
    state: { id: state.id, name: state.name, logo_url: state.logoUrl },
    cities,
    totalCities: cities.length,
  });
});

router.get('/state/:bankSlug/:stateSlug', async (req: Request, res: Response) => {
  const { bankSlug, stateSlug } = req.params;

  // Find bank
  const bank = await prisma.banksMaster.findFirst({
    where: {
      slug: bankSlug
    }
  });

  if (!bank) return res.status(404).json({ error: 'Bank not found' });

  // Find state
  const state = await prisma.state.findFirst({
    where: {
      name: {
        equals: stateSlug,
        mode: 'insensitive'
      }
    }
  });
  if (!state) return res.status(404).json({ error: 'State not found' });

  // Branches for this bank + state
  const branches = await prisma.branch.findMany({
    where: { bankId: bank.id, stateId: state.id },
    orderBy: [
      { city: 'asc' },
      { branchName: 'asc' }
    ]
  });

  res.json({ bank, state, branches });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/banks/:bankSlug/states - Get states for a bank
// ═══════════════════════════════════════════════════════════════════════════
router.get('/banks/:bankSlug/states', async (req: Request, res: Response) => {
  const { bankSlug } = req.params;
 
  // Find bank
  const bank = await prisma.banksMaster.findFirst({
    where: {
      slug: bankSlug
    }
  });
  if (!bank) return res.status(404).json({ error: 'Bank not found' });
 
  // Get states where this bank has branches
  const states = await prisma.state.findMany({
    where: {
      branches: {
        some: {
          bankId: bank.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      code: true,
      logoUrl: true,
      _count: {
        select: {
          branches: {
            where: { bankId: bank.id }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const formattedStates = states.map(state => ({
    id: state.id,
    name: state.name,
    code: state.code,
    logo_url: state.logoUrl,
    branchCount: state._count.branches
  }));

  res.json({
    bank: {
      id: bank.id,
      name: bank.name,
      shortName: bank.shortName,
      logo_url: bank.logoUrl,
    },
    states: formattedStates,
    totalStates: formattedStates.length
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /state/:bankSlug/:stateSlug/:cityslug - Get branches for bank + state + City
// ═══════════════════════════════════════════════════════════════════════════
router.get('/city/:bankSlug/:stateSlug/:citySlug', async (req: Request, res: Response) => {
  const { bankSlug, stateSlug, citySlug } = req.params;
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip  = (page - 1) * limit;

  const bank = await prisma.banksMaster.findFirst({
    where: { slug: bankSlug }
  });
  if (!bank) return res.status(404).json({ error: 'Bank not found' });

  const state = await prisma.state.findFirst({
    where: { name: { equals: stateSlug, mode: 'insensitive' } }
  });
  if (!state) return res.status(404).json({ error: 'State not found' });

  // Find all city name variants that normalize to the same key (e.g. "ranga reddy" matches "rangareddi", "rangareddy")
  const normalizeName = (s: string) => s.toLowerCase().replace(/[\s\-'\.]/g, '');
  const targetKey = normalizeName(citySlug);

  const allCityNames = await prisma.branch.findMany({
    where: { bankId: bank.id, stateId: state.id, city: { not: null } },
    select: { city: true },
    distinct: ['city'],
  });
  const matchingCities = allCityNames
    .filter(b => b.city && normalizeName(b.city) === targetKey)
    .map(b => b.city!);

  // If no normalized match, fall back to exact match
  const cityFilter = matchingCities.length > 0
    ? { in: matchingCities }
    : { equals: citySlug, mode: 'insensitive' as const };

  const where = { bankId: bank.id, stateId: state.id, city: cityFilter as any };

  const [branches, totalCount] = await Promise.all([
    prisma.branch.findMany({ where, orderBy: { branchName: 'asc' }, skip, take: limit }),
    prisma.branch.count({ where }),
  ]);

  res.json({
    bank: { id: bank.id, name: bank.name, shortName: bank.shortName, logo_url: bank.logoUrl },
    state: { id: state.id, name: state.name, logo_url: state.logoUrl },
    city: citySlug,
    branches,
    pagination: {
      page, limit, totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// GET /state/:bankSlug/:stateSlug/districts - Get districts for bank + state
// ═══════════════════════════════════════════════════════════════════════════
router.get('/state/:bankSlug/:stateSlug/districts', async (req: Request, res: Response) => {
  const { bankSlug, stateSlug } = req.params;
 
  // Find bank
  const bank = await prisma.banksMaster.findFirst({
    where: {
      slug: bankSlug
    }
  });
  if (!bank) return res.status(404).json({ error: 'Bank not found' });
 
  // Find state
  const state = await prisma.state.findFirst({
    where: {
      name: {
        equals: stateSlug,
        mode: 'insensitive'
      }
    }
  });
  if (!state) return res.status(404).json({ error: 'State not found' });
 
  // Get districts where this bank has branches in this state
  const districts = await prisma.district.findMany({
    where: {
      stateId: state.id,
      branches: {
        some: {
          bankId: bank.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          branches: {
            where: { bankId: bank.id }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
 
  const formattedDistricts = districts.map(district => ({
    id: district.id,
    name: district.name,
    branchCount: district._count.branches
  }));
 
  res.json({
    bank,
    state,
    districts: formattedDistricts,
    totalDistricts: formattedDistricts.length
  });
});
 
// ═══════════════════════════════════════════════════════════════════════════
// GET /city/:bankSlug/:stateSlug/:districtSlug - Get branches for bank+state+district
// ═══════════════════════════════════════════════════════════════════════════
router.get('/city/:bankSlug/:stateSlug/:districtSlug', async (req: Request, res: Response) => {
  const { bankSlug, stateSlug, districtSlug } = req.params;
 
  const bank = await prisma.banksMaster.findFirst({
    where: {
      slug: bankSlug
    }
  });
  if (!bank) return res.status(404).json({ error: 'Bank not found' });
 
  const state = await prisma.state.findFirst({
    where: {
      name: {
        equals: stateSlug,
        mode: 'insensitive'
      }
    }
  });
  if (!state) return res.status(404).json({ error: 'State not found' });
 
  const district = await prisma.district.findFirst({
    where: {
      name: {
        equals: districtSlug,
        mode: 'insensitive'
      },
      stateId: state.id
    }
  });
  if (!district) return res.status(404).json({ error: 'District not found' });
 
  const branches = await prisma.branch.findMany({
    where: {
      bankId: bank.id,
      stateId: state.id,
      districtId: district.id
    },
    orderBy: [
      { city: 'asc' },
      { branchName: 'asc' }
    ]
  });
 
  res.json({
    bank,
    state,
    district,
    branches,
    totalBranches: branches.length
  });
});
 

// ── GET /api/ifsc/:ifsc/nearby ───────────────────────────────────────────────
// MUST be registered BEFORE /ifsc/:ifsc — Express matches top-to-bottom
router.get('/ifsc/:ifsc/nearby', async (req: Request, res: Response) => {
  const ifsc = req.params.ifsc.toUpperCase().trim()

  const KEY = `nearby_${ifsc}`
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  // Get current branch's bankId + districtId
  const current = await prisma.branch.findUnique({
    where:  { ifsc },
    select: { bankId: true, districtId: true },
  })

  if (!current?.districtId) {
    res.json({ data: [] })
    return
  }

  const nearby = await prisma.branch.findMany({
    where: {
      bankId:     current.bankId,
      districtId: current.districtId,
      ifsc:       { not: ifsc },
    },
    select: { ifsc: true, branchName: true, address: true, city: true },
    orderBy: { branchName: 'asc' },
    take: 6,
  })

  const data = nearby.map(b => ({
    ifsc:        b.ifsc,
    branch_name: b.branchName,
    address:     b.address,
    city:        b.city,
  }))

  const out = { data }
  await cacheSet(KEY, out)
  res.json(out)
})

// ── GET /api/ifsc/:ifsc ──────────────────────────────────────────────────────
router.get('/ifsc/:ifsc', async (req: Request, res: Response) => {
  const ifsc = req.params.ifsc.toUpperCase().trim()
  if (ifsc.length !== 11) {
    res.status(400).json({ error: 'IFSC must be exactly 11 characters' })
    return
  }

  const KEY = `ifsc_${ifsc}`
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const branch = await prisma.branch.findUnique({
    where: { ifsc },
    include: {
      bank:     true,
      state:    true,
      district: true,
    },
  })

  if (!branch) {
    await logSearch('ifsc', ifsc, 0, req)
    res.status(404).json({ error: 'IFSC not found', ifsc })
    return
  }

  const lat = branch.latitude
  const lng = branch.longitude
  const q   = (lat && lng)
    ? `${lat},${lng}`
    : encodeURIComponent(`${branch.bank.name} ${branch.branchName} ${branch.city ?? ''}`)

  const data = {
    ifsc:          branch.ifsc,
    micr:          branch.micr,
    branch_name:   branch.branchName,
    address:       branch.address,
    city:          branch.city,
    centre:        branch.centre,
    pincode:       branch.pincode,
    phone:         branch.phone,
    neft:          branch.neft ? 1 : 0,
    rtgs:          branch.rtgs ? 1 : 0,
    imps:          branch.imps ? 1 : 0,
    upi:           branch.upi  ? 1 : 0,
    latitude:      branch.latitude,
    longitude:     branch.longitude,
    swift:         branch.swift,
    iso3166:       branch.iso3166,
    bank_name:     branch.bank.name,
    short_name:    branch.bank.shortName,
    bank_type:     branch.bank.bankType,
    bank_website:  branch.bank.website,
    bank_logo_url: branch.bank.logoUrl,
    state_name:    branch.state.name,
    state_code:    branch.state.code,
    district_name: branch.district?.name ?? '',
    google_maps_url: `https://www.google.com/maps/search/?api=1&query=${q}`,
  }

  await logSearch('ifsc', ifsc, 1, req)
  await cacheSet(KEY, { data })
  res.json({ data })
})

// ── GET /api/search?q= ───────────────────────────────────────────────────────
router.get('/search', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim()
  if (q.length < 2) { res.status(400).json({ error: 'Query must be at least 2 characters' }); return }

  const qUpper = q.toUpperCase()

  const [ifscMatches, branchMatches] = await Promise.all([
    prisma.branch.findMany({
      where:  { ifsc: { startsWith: qUpper } },
      select: {
        ifsc: true, branchName: true, city: true,
        bank:  { select: { name: true } },
        state: { select: { name: true } },
      },
      take: 10,
    }),
    prisma.branch.findMany({
      where: {
        OR: [
          { branchName: { contains: q, mode: 'insensitive' } },
          { city:       { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        ifsc: true, branchName: true, city: true,
        bank:  { select: { name: true } },
        state: { select: { name: true } },
      },
      take: 10,
    }),
  ])

  const format = (b: typeof ifscMatches[0]) => ({
    ifsc:        b.ifsc,
    branch_name: b.branchName,
    bank_name:   b.bank.name,
    city:        b.city,
    state_name:  b.state.name,
  })

  res.json({
    data: {
      ifsc_matches:   ifscMatches.map(format),
      branch_matches: branchMatches.map(format),
    },
    query: q,
  })
})

// ── GET /api/pincode/:pincode ─────────────────────────────────────────────────
router.get('/pincode/:pincode', async (req: Request, res: Response) => {
  const { pincode } = req.params
  if (!/^\d{6}$/.test(pincode)) {
    res.status(400).json({ error: 'Pincode must be 6 digits' })
    return
  }

  const KEY = `pincode_${pincode}`
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const branches = await prisma.branch.findMany({
    where:   { pincode },
    select: {
      ifsc: true, branchName: true, address: true, phone: true,
      neft: true, rtgs: true, imps: true, upi: true,
      bank:  { select: { name: true } },
      state: { select: { name: true } },
    },
    orderBy: { bank: { name: 'asc' } },
  })

  const data = branches.map(b => ({
    ifsc:        b.ifsc,
    branch_name: b.branchName,
    address:     b.address,
    phone:       b.phone,
    bank_name:   b.bank.name,
    state_name:  b.state.name,
    neft:        b.neft ? 1 : 0,
    rtgs:        b.rtgs ? 1 : 0,
    imps:        b.imps ? 1 : 0,
    upi:         b.upi  ? 1 : 0,
  }))

  const out = { data: { branches: data }, count: data.length }
  await cacheSet(KEY, out)
  res.json(out)
})

// ── GET /api/stats ────────────────────────────────────────────────────────────
router.get('/stats', async (_req: Request, res: Response) => {
  const KEY = 'stats'
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const [total_branches, total_banks, total_states, upi_enabled] = await Promise.all([
    prisma.branch.count(),
    prisma.banksMaster.count(),
    prisma.state.count(),
    prisma.branch.count({ where: { upi: true } }),
  ])

  const data = {
    total_branches,
    total_banks,
    total_states,
    upi_enabled,
    last_updated: new Date().toISOString(),
  }

  await cacheSet(KEY, { data }, 30)
  res.json({ data })
})

// ── POST /api/cache/clear ─────────────────────────────────────────────────────
router.post('/cache/clear', async (_req: Request, res: Response) => {
  await cacheFlush()
  res.json({ message: 'Cache cleared', timestamp: new Date().toISOString() })
})




/**
 * GET /api/ifsc/:code
 * Fetch single IFSC with full details for SEO + sharing
 * Used by: React component for /ifsc/:code page + Open Graph meta tags
 */
router.get('/api/ifsc/:code', async (req, res) => {
  const ifscCode = req.params.code.toUpperCase().trim();

  // Validate IFSC format (11 chars, alphanumeric)
  if (!/^[A-Z0-9]{11}$/.test(ifscCode)) {
    return res.status(400).json({ error: 'Invalid IFSC format' });
  }

  try {
    // Try cache first
    const cacheKey = `ifsc:${ifscCode}`;
    const cached = await cacheGet(cacheKey)
    if (cached) { res.json(cached); return }

    // Fetch from DB with all related data
    const branch = await prisma.branch.findUnique({
      where: { ifsc: ifscCode },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
            shortName: true,
            bankCode: true,
            bankType: true,
            website: true,
            headquarters: true,
            logoUrl: true,
          },
        },
        state: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        district: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!branch) {
      return res.status(404).json({ error: 'IFSC code not found' });
    }

    // Format response for SEO + frontend
    const response = {
      ifsc: branch.ifsc,
      micr: branch.micr,
      branch: {
        name: branch.branchName,
        address: branch.address,
        city: branch.city,
        district: branch.district?.name || null,
        state: branch.state?.name || null,
        pincode: branch.pincode,
        phone: branch.phone,
        latitude: branch.latitude,
        longitude: branch.longitude,
      },
      bank: {
        name: branch.bank.name,
        shortName: branch.bank.shortName,
        code: branch.bank.bankCode,
        type: branch.bank.bankType,
        website: branch.bank.website,
        headquarters: branch.bank.headquarters,
        logo_url: branch.bank.logoUrl,
      },
      services: {
        neft: branch.neft,
        rtgs: branch.rtgs,
        imps: branch.imps,
        upi: branch.upi,
        swift: branch.swift,
      },
      lastUpdated: branch.lastUpdated?.toISOString() || null,
      // SEO metadata
      seo: {
        title: `${branch.branchName} - ${branch.bank.name} IFSC: ${branch.ifsc}`,
        description: `${branch.bank.name} branch at ${branch.city}, ${branch.state?.name}. IFSC: ${branch.ifsc}, MICR: ${branch.micr || 'N/A'}. Address: ${branch.address}`,
        keywords: [
          branch.ifsc,
          branch.bank.name,
          branch.branchName,
          branch.city,
          branch.state?.name,
          branch.pincode,
          'IFSC code',
          'bank branch',
        ].filter(Boolean),
      },
    };

    // Cache for 24 hours (IFSC data rarely changes)
    await cacheSet(cacheKey, JSON.stringify(response), 86400);

    res.json(response);
  } catch (error) {
    console.error('Error fetching IFSC:', error);
    res.status(500).json({ error: 'Failed to fetch IFSC details' });
  }
});

/**
 * GET /robots.txt
 * Allow search engines to crawl, point to sitemap
 */
export const handleRobotsTxt = (_req: Request, res: Response) => {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${process.env.FRONTEND_URL || 'https://rupeepedia.in'}/sitemap.xml

# Disallow crawling of sensitive endpoints
Disallow: /api/
Disallow: /admin/

# Crawl delay
Crawl-delay: 1
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(robotsTxt);
};

// Register routes
router.get('/robots.txt', handleRobotsTxt);



router.get('/debug/states', async (req: Request, res: Response) => {
  const states = await prisma.state.findMany({
    select: { id: true, name: true }
  });
  res.json({ states });
});



/**Products related API Calls --  */

// ── GET /api/credit-cards/stats ─────────────────────────────────────────────
router.get('/credit-cards/stats', async (_req: Request, res: Response) => {
  const KEY = 'cc_stats'
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const [totalCards, freeCards] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, details: { annualFee: { equals: 0 } } } }),
  ])

  const avgResult = await prisma.product.aggregate({
    where: { isActive: true, rating: { not: null } },
    _avg: { rating: true },
  })

  const banks = await prisma.product.findMany({
    where: { isActive: true },
    select: { bankId: true },
    distinct: ['bankId'],
  })

  const categories = await prisma.productOffer.findMany({
    where: { isActive: true, category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  })

  const data = {
    totalCards,
    totalBanks: banks.length,
    totalCategories: categories.length,
    avgRating: Math.round((avgResult._avg.rating || 0) * 10) / 10,
    freeCards,
  }
  await cacheSet(KEY, data, 600)
  res.json(data)
})

// ── GET /api/credit-cards/categories ────────────────────────────────────────
router.get('/credit-cards/categories', async (_req: Request, res: Response) => {
  const KEY = 'cc_categories'
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const cats = await prisma.productOffer.groupBy({
    by: ['category'],
    where: { isActive: true, category: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  const data = cats
    .filter((c) => c.category)
    .map((c, i) => ({
      id: i + 1,
      name: c.category!,
      cardCount: c._count.id,
    }))

  await cacheSet(KEY, data, 600)
  res.json(data)
})

// ── GET /api/credit-cards/banks ─────────────────────────────────────────────
router.get('/credit-cards/banks', async (_req: Request, res: Response) => {
  const KEY = 'cc_banks'
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const results = await prisma.product.groupBy({
    by: ['bankId'],
    where: { isActive: true },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  const bankIds = results.map((r) => r.bankId)
  const banks = await prisma.banksMaster.findMany({
    where: { id: { in: bankIds } },
    select: { id: true, name: true },
  })
  const bankMap = new Map(banks.map((b) => [b.id, b.name]))

  const data = results.map((r) => ({
    id: r.bankId,
    name: bankMap.get(r.bankId) || 'Unknown',
    cardCount: r._count.id,
  }))

  await cacheSet(KEY, data, 600)
  res.json(data)
})

// ── GET /api/credit-cards/featured ──────────────────────────────────────────
router.get('/credit-cards/featured', async (_req: Request, res: Response) => {
  const KEY = 'cc_featured'
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      bank: { select: { name: true, slug: true, logoUrl: true } },
      details: true,
      offers: { where: { isActive: true }, take: 1, orderBy: { version: 'desc' } },
    },
    orderBy: { rating: 'desc' },
    take: 8,
  })

  const cards = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    network: p.network,
    rating: p.rating,
    totalRatings: p.totalRatings,
    bank: { name: p.bank.name, slug: p.bank.slug, logo: p.bank.logoUrl || null },
    annualFee: p.details?.annualFee ?? 0,
    topBenefit: p.offers[0]?.title || null,
  }))

  await cacheSet(KEY, cards, 600)
  res.json(cards)
})

//Fetch Products
router.get('/products', async (req: Request, res: Response) => {
  try {
    // STEP 1: Read query params
    const { category, page = '1', limit = '10' } = req.query

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    // STEP 2: Cache key
    const CACHE_KEY = `products_${category}_${page}_${limit}`

    const cached = await cacheGet(CACHE_KEY)
    if (cached) {
      return res.json(cached)
    }

    // STEP 3: Read additional query params
    const { search, bank, annualFeeMax, sortBy } = req.query

    const where: any = {
      isActive: true,
      ...(category && { category: String(category) })
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { bank: { name: { contains: String(search), mode: 'insensitive' } } }
      ]
    }
    if (bank) {
      where.bank = { name: String(bank) }
    }
    if (annualFeeMax) {
      where.details = { annualFee: { lte: Number(annualFeeMax) } }
    }

    // Sort order
    let orderBy: any = { rating: 'desc' }
    if (sortBy === 'annualFee') orderBy = { details: { annualFee: 'asc' } }
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' }

    // Fetch from DB
    const products = await prisma.product.findMany({
      where,
      include: {
        bank: {
          select: {
            name: true,
            slug: true,
            logoUrl: true
          }
        },
        details: true,
        offers: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        features: {
          include: { feature: true }
        }
      },
      skip,
      take: limitNum,
      orderBy
    })

    // Total count for pagination
    const total = await prisma.product.count({ where })

    // STEP 4: Format response
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      network: p.network,
      isFeatured: p.isFeatured,
      isPopular: p.isPopular,
      rating: p.rating,
      totalRatings: p.totalRatings,
      cardImageUrl: p.cardImageUrl,
      applyUrl: p.applyUrl,

      bank: {
        name: p.bank.name,
        slug: p.bank.slug,
        logo: p.bank.logoUrl || null
      },

      annualFee: p.details?.annualFee ?? 0,
      joiningFee: p.details?.joiningFee ?? 0,
      rewardType: p.details?.rewardType ?? null,

      offer: p.offers[0]
        ? {
            title: p.offers[0].title,
            rewardRate: p.offers[0].rewardRate,
            rewardCap: p.offers[0].rewardCap,
            category: p.offers[0].category
          }
        : null,

      features: p.features.map((f) => f.feature.name)
    }))

    const result = {
      page: pageNum,
      limit: limitNum,
      count: formatted.length,
      total,
      products: formatted
    }

    // STEP 5: Cache result
    await cacheSet(CACHE_KEY, result, 300)

    // STEP 6: Send response
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})


/**For a given product (credit card), return:
Basic info
Bank info
Full details
ALL offers (active + past versions) */
router.get('/products/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' })
    }

    // STEP 1: Cache key
    const CACHE_KEY = `product_detail_${slug}`

    const cached = await cacheGet(CACHE_KEY)
    if (cached) {
      return res.json(cached)
    }

    // STEP 2: Fetch product
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        bank: {
          select: {
            name: true,
            slug: true,
            logoUrl: true
          }
        },
        details: true,

        // 🔥 IMPORTANT: fetch ALL offers (not just active)
        offers: {
          orderBy: {
            createdAt: 'desc'
          }
        },

        features: {
          include: {
            feature: true
          }
        }
      }
    })

    // STEP 3: Not found
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // STEP 4: Format response
    const formatted = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      network: product.network,
      isFeatured: product.isFeatured,
      isPopular: product.isPopular,
      rating: product.rating,
      totalRatings: product.totalRatings,
      cardImageUrl: product.cardImageUrl,
      applyUrl: product.applyUrl,

      bank: {
        name: product.bank.name,
        slug: product.bank.slug,
        logo: product.bank.logoUrl || null
      },

      details: {
        annualFee: product.details?.annualFee ?? null,
        joiningFee: product.details?.joiningFee ?? null,
        minIncome: product.details?.minIncome ?? null,
        loungeAccess: product.details?.loungeAccess ?? null,
        rewardType: product.details?.rewardType ?? null
      },

      // Offer history
      offers: product.offers.map((o) => ({
        title: o.title,
        description: o.description,
        rewardRate: o.rewardRate,
        rewardCap: o.rewardCap,
        category: o.category,
        isActive: o.isActive,
        validFrom: o.validFrom,
        validTo: o.validTo,
        version: o.version
      })),

      // Features (tags)
      features: product.features.map((f) => f.feature.name)
    }

    // STEP 5: Cache
    await cacheSet(CACHE_KEY, formatted, 300)

    // STEP 6: Response
    res.json(formatted)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})


/**Allow users to compare 2–3 credit cards side-by-side
Return:
Basic info
Fees
Active offer
Key features */

router.get('/compare', async (req: Request, res: Response) => {
  try {
    const { ids } = req.query

    if (!ids) {
      return res.status(400).json({ error: 'Product IDs required' })
    }

    // Convert "1,2,3" → [1,2,3]
    const idArray = String(ids)
      .split(',')
      .map((id) => Number(id.trim()))
      .filter(Boolean)

    if (idArray.length < 2) {
      return res.status(400).json({ error: 'At least 2 products required for comparison' })
    }

    // STEP 1: Cache
    const CACHE_KEY = `compare_${idArray.join('_')}`

    const cached = await cacheGet(CACHE_KEY)
    if (cached) {
      return res.json(cached)
    }

    // STEP 2: Fetch products
    const products = await prisma.product.findMany({
      where: {
        id: { in: idArray },
        isActive: true
      },
      include: {
        bank: {
          select: {
            name: true,
            slug: true,
            logoUrl: true
          }
        },
        details: true,
        offers: {
          where: {
            isActive: true
          },
          take: 1
        },
        features: {
          include: {
            feature: true
          }
        }
      }
    })

    // STEP 3: Format response
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,

      bank: {
        name: p.bank.name,
        logo: p.bank.logoUrl
      },

      fees: {
        annualFee: p.details?.annualFee ?? null,
        joiningFee: p.details?.joiningFee ?? null
      },

      offer: p.offers[0]
        ? {
            title: p.offers[0].title,
            rewardRate: p.offers[0].rewardRate,
            rewardCap: p.offers[0].rewardCap
          }
        : null,

      features: p.features.map((f) => f.feature.name)
    }))

    const result = {
      count: formatted.length,
      products: formatted
    }

    // STEP 4: Cache
    await cacheSet(CACHE_KEY, result, 300)

    // STEP 5: Response
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

/**Allow you (or future UI) to:

Create product
Add/update product details
Add new offer (with versioning logic 🔥)
Update product */

router.post('/admin/products', async (req: Request, res: Response) => {
  try {
    const { name, slug, category, bankId, network } = req.body

    if (!name || !slug || !category || !bankId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category,
        bankId,
        network
      }
    })

    res.json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

//ADD / UPDATE PRODUCT DETAILS
router.post('/admin/products/:id/details', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id)

    const {
      annualFee,
      joiningFee,
      minIncome,
      loungeAccess,
      rewardType
    } = req.body

    const details = await prisma.productDetails.upsert({
      where: { productId },
      update: {
        annualFee,
        joiningFee,
        minIncome,
        loungeAccess,
        rewardType
      },
      create: {
        productId,
        annualFee,
        joiningFee,
        minIncome,
        loungeAccess,
        rewardType
      }
    })

    res.json(details)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save product details' })
  }
})

//ADD OFFER (VERSIONING LOGIC)
router.post('/admin/products/:id/offers', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id)

    const {
      title,
      description,
      rewardType,
      rewardRate,
      rewardCap,
      category
    } = req.body

    // STEP 1: get current active offer
    const existing = await prisma.productOffer.findFirst({
      where: {
        productId,
        isActive: true
      },
      orderBy: {
        version: 'desc'
      }
    })

    let nextVersion = 1

    if (existing) {
      nextVersion = existing.version + 1

      // deactivate old
      await prisma.productOffer.updateMany({
        where: {
          productId,
          isActive: true
        },
        data: {
          isActive: false,
          validTo: new Date()
        }
      })
    }

    // STEP 2: create new offer
    const newOffer = await prisma.productOffer.create({
      data: {
        productId,
        title,
        description,
        rewardType,
        rewardRate,
        rewardCap,
        category,

        version: nextVersion,
        isActive: true,
        validFrom: new Date(),

        source: 'manual'
      }
    })

    res.json(newOffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add offer' })
  }
})

//UPDATE PRODUCT BASIC INFO
router.put('/admin/products/:id', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id)

    const { name, slug, isActive, network } = req.body

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        isActive,
        network
      }
    })

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

//--------------------
//Add a temporary test route:Product
router.get('/test-product', async (req, res) => {
  try {
    const product = await prisma.product.create({
    data: {
        name: "HDFC Millennia Credit Card",
        slug: "hdfc-millennia-credit-card",
        category: "credit_card",
        bankId: 780 // replace with actual HDFC id
      }
    })

    res.json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

//Add a temporary test route:Add Product Details
router.get('/test-productdetails', async (req, res) => {
  try {
    const productdetails = await prisma.productDetails.create({
      data: {
        productId: 3,
        annualFee: 1000,
        joiningFee: 1000,
        minIncome: 300000,
        loungeAccess: 4,
        rewardType: "cashback"
      }
    })

    res.json(productdetails)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create product details' })
  }
})


//Add a temporary test route:Add Product Offers
router.get('/test-productoffer', async (req, res) => {
  try {
    const productoffer = await prisma.productOffer.create({
    data: {
      productId: 3,
      title: "5% Cashback on Amazon & Flipkart",
      description: "Earn 5% cashback on major online platforms",

      rewardType: "cashback",
      rewardRate: 5,
      rewardCap: 500,
      category: "shopping",

      version: 1,
      isActive: true,
      validFrom: new Date(),

      source: "manual"
    }
  })

    res.json(productoffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create product offer details' })
  }
})


//Add a temporary test route:Deactivate current offer
router.get('/test-deactiveCurrnetOffer', async (req, res) => {
  try {
    const deactiveCurrnetOffer =await prisma.productOffer.updateMany({
      where: { productId: 3, isActive: true },
      data: {
        isActive: false,
        validTo: new Date()
      }
    })

    res.json(deactiveCurrnetOffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to Deactivate Offer' })
  }
})

//Add a temporary test route:Add new version
router.get('/test-addNewVersionOffer', async (req, res) => {
  try {
    const addNewVersionOffer =await prisma.productOffer.create({
    data: {
      productId: 3,
      title: "10% Cashback (Festive Offer)",
      rewardType: "cashback",
      rewardRate: 10,
      rewardCap: 1000,

      version: 2,
      isActive: true,
      validFrom: new Date(),

      source: "manual"
    }
  })

    res.json(addNewVersionOffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add new version of the product' })
  }
})


// ══════════════════════════════════════════════════════════════════════════════
// ── Blog Endpoints ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/blogs — paginated list with optional category/search filter
router.get('/blogs', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12))
    const category = (req.query.category as string)?.trim() || undefined
    const search = (req.query.search as string)?.trim() || undefined
    const skip = (page - 1) * limit

    const where: any = { isPublished: true }
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        select: {
          id: true, slug: true, title: true, description: true,
          category: true, tags: true, coverImage: true, readTime: true,
          isFeatured: true, publishedAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ])

    res.json({ blogs, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('GET /api/blogs error:', err)
    res.status(500).json({ error: 'Failed to fetch blogs' })
  }
})

// GET /api/blogs/categories — distinct categories with counts
router.get('/blogs/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.blog.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: { id: true },
      orderBy: { category: 'asc' },
    })

    res.json(categories.map((c) => ({ category: c.category, count: c._count.id })))
  } catch (err) {
    console.error('GET /api/blogs/categories error:', err)
    res.status(500).json({ error: 'Failed to fetch blog categories' })
  }
})

// GET /api/blogs/featured — featured blogs for homepage
router.get('/blogs/featured', async (_req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true, isFeatured: true },
      select: {
        id: true, slug: true, title: true, description: true,
        category: true, coverImage: true, readTime: true, publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    })

    res.json(blogs)
  } catch (err) {
    console.error('GET /api/blogs/featured error:', err)
    res.status(500).json({ error: 'Failed to fetch featured blogs' })
  }
})

// GET /api/blogs/:slug — single blog with full content
router.get('/blogs/:slug', async (req: Request, res: Response) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
    })

    if (!blog || !blog.isPublished) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }

    // Fetch related blogs (same category, exclude current)
    const related = await prisma.blog.findMany({
      where: {
        isPublished: true,
        category: blog.category,
        id: { not: blog.id },
      },
      select: {
        slug: true, title: true, description: true,
        category: true, coverImage: true, readTime: true, publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    })

    res.json({ ...blog, related })
  } catch (err) {
    console.error('GET /api/blogs/:slug error:', err)
    res.status(500).json({ error: 'Failed to fetch blog' })
  }
})

export default router