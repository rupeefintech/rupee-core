import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { cacheGet, cacheSet, cacheFlush } from '../lib/cache'

const router = Router()

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
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const states = await prisma.state.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  })
  const out = { data: states, count: states.length }
  await cacheSet(KEY, out)
  res.json(out)
})

// ── GET /api/banks ───────────────────────────────────────────────────────────
router.get('/banks', async (_req: Request, res: Response) => {
  const KEY = 'banks'
  const cached = await cacheGet(KEY)
  if (cached) { res.json(cached); return }

  const banks = await prisma.bank.findMany({
    select: {
      id: true, name: true,
      shortName: true, bankType: true, headquarters: true, website: true,
    },
    orderBy: { name: 'asc' },
  })

  // Map camelCase → snake_case for frontend compatibility
  const data = banks.map(b => ({
    id:           b.id,
    name:         b.name,
    short_name:   b.shortName,
    bank_type:    b.bankType,
    headquarters: b.headquarters,
    website:      b.website,
  }))

  const out = { data, count: data.length }
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

  const bank = await prisma.bank.findFirst({
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
  const bank = await prisma.bank.findFirst({
    where: {
      shortName: {
        equals: bankSlug,
        mode: 'insensitive'
      }
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


router.get('/state/:bankSlug/:stateSlug', async (req: Request, res: Response) => {
  const { bankSlug, stateSlug } = req.params;

  // Find bank
  const bank = await prisma.bank.findFirst({
    where: {
      shortName: {
        equals: bankSlug,
        mode: 'insensitive'
      }
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
  const bank = await prisma.bank.findFirst({
    where: {
      shortName: {
        equals: bankSlug,
        mode: 'insensitive'
      }
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
    branchCount: state._count.branches
  }));
 
  res.json({
    bank: {
      id: bank.id,
      name: bank.name,
      shortName: bank.shortName  
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

  const bank = await prisma.bank.findFirst({
    where: {
      shortName: {
        equals: bankSlug,
        mode: 'insensitive'
      }
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

  const branches = await prisma.branch.findMany({
    where: { bankId: bank.id, stateId: state.id, city: citySlug.toLowerCase() },
    orderBy: { branchName: 'asc' },
  });

  res.json({ bank, state, city: citySlug, branches });
});


// ═══════════════════════════════════════════════════════════════════════════
// GET /state/:bankSlug/:stateSlug/districts - Get districts for bank + state
// ═══════════════════════════════════════════════════════════════════════════
router.get('/state/:bankSlug/:stateSlug/districts', async (req: Request, res: Response) => {
  const { bankSlug, stateSlug } = req.params;
 
  // Find bank
  const bank = await prisma.bank.findFirst({
    where: {
      shortName: {
        equals: bankSlug,
        mode: 'insensitive'
      }
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
 
  const bank = await prisma.bank.findFirst({
    where: {
      shortName: {
        equals: bankSlug,
        mode: 'insensitive'
      }
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
    prisma.bank.count(),
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
 * GET /sitemap.xml
 * Dynamic XML sitemap for all IFSC codes
 */
export const handleSitemapXml = async (req: Request, res: Response) => {
  try {
    // Check cache first
    const cacheKey = 'sitemap:xml';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      return res.send(cached);
    }

    // Get all IFSC codes
    const branches = await prisma.branch.findMany({
      select: {
        ifsc: true,
        lastUpdated: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    // Build XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    const baseUrl = process.env.FRONTEND_URL || 'https://rupeepedia.in';
    const staticPages = ['/', '/about', '/ifsc-finder'];

    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>1.0</priority>\n';
      xml += '  </url>\n';
    }

    // Add all IFSC pages
    for (const branch of branches) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/ifsc/${branch.ifsc}</loc>\n`;
      xml += `    <lastmod>${branch.lastUpdated ? branch.lastUpdated.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    // Cache for 24 hours
    await cacheSet(cacheKey, xml, 86400);

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};

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
router.get('/sitemap.xml', handleSitemapXml);
router.get('/robots.txt', handleRobotsTxt);



router.get('/debug/states', async (req: Request, res: Response) => {
  const states = await prisma.state.findMany({
    select: { id: true, name: true }
  });
  res.json({ states });
});

export default router
