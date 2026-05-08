import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// ── Helpers ──────────────────────────────────────────────────────────────────

const IFSC_RE = /\b([A-Z]{4}0[A-Z0-9]{6})\b/i

function fmt(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function calcSIP(monthly: number, months: number, annualRate: number) {
  const r = annualRate / 100 / 12
  const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
  const invested = monthly * months
  return { invested, returns: fv - invested, total: fv }
}

// ── Branch search helper ──────────────────────────────────────────────────────
// Tries strict AND of all terms; if no results, drops one term from the end and
// retries (up to 2 relaxations). Handles locality ≠ city mismatches like
// "Hyderabad" typed when the branch city is stored as "NIZAMPET".

type BranchResult = {
  ifsc: string; bank: { name: string; slug: string | null }; branchName: string
  city: string | null; state: { name: string }
}

async function branchSearch(terms: string[], take = 5): Promise<BranchResult[]> {
  const minTerms = Math.max(2, terms.length - 2)
  for (let n = terms.length; n >= minTerms; n--) {
    const subset = terms.slice(0, n)
    const rows = await prisma.branch.findMany({
      where: {
        AND: subset.map(t => ({
          OR: [
            { branchName: { contains: t, mode: 'insensitive' } },
            { city:       { contains: t, mode: 'insensitive' } },
            { bank:       { name:      { contains: t, mode: 'insensitive' } } },
            { bank:       { shortName: { contains: t, mode: 'insensitive' } } },
            { address:    { contains: t, mode: 'insensitive' } },
          ],
        })),
      },
      include: { bank: { select: { name: true, slug: true } }, state: { select: { name: true } } },
      take,
    })
    if (rows.length > 0) return rows
  }
  return []
}

// ── Intent detection ─────────────────────────────────────────────────────────

const CC_KEYWORDS = [
  'credit card', 'credit-card', 'best card', 'cashback card',
  'travel card', 'reward card', 'which card', 'good card',
  'card offer', 'card recommend', 'top card',
]

const SIP_KEYWORDS = ['sip ', ' sip', 'mutual fund', 'invest ', 'returns ', 'lumpsum', 'per month']

const IFSC_KEYWORDS = ['ifsc', 'bank code', 'branch code', 'neft code', 'swift', 'find ifsc', 'get ifsc']

const GREETING_RE = /^(hi|hello|hey|hola|namaste|good\s*(morning|afternoon|evening)|what can you do|help)[\s!.,?]*$/i

// ── Route ────────────────────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string }

  if (!message?.trim()) {
    res.json({ reply: 'Please ask me something!' })
    return
  }

  const msg   = message.trim()
  const lower = msg.toLowerCase()

  // ── 1. Direct IFSC code lookup ────────────────────────────────────────────
  const ifscMatch = msg.match(IFSC_RE)
  if (ifscMatch) {
    const code = ifscMatch[1].toUpperCase()
    try {
      const branch = await prisma.branch.findUnique({
        where: { ifsc: code },
        include: {
          bank:  { select: { name: true, slug: true, logoUrl: true } },
          state: { select: { name: true } },
        },
      })
      if (!branch) {
        res.json({ reply: `No branch found for IFSC **${code}**. Please double-check the code.` })
        return
      }
      res.json({
        reply: `Here are the details for **${code}**:`,
        type: 'ifsc',
        data: {
          ifsc:      branch.ifsc,
          micr:      branch.micr ?? '—',
          bank:      branch.bank.name,
          bankSlug:  branch.bank.slug,
          branch:    branch.branchName,
          address:   branch.address ?? '—',
          city:      branch.city ?? '—',
          state:     branch.state.name,
          pincode:   branch.pincode ?? '—',
          phone:     branch.phone ?? '—',
          neft:      branch.neft,
          rtgs:      branch.rtgs,
          imps:      branch.imps,
          upi:       branch.upi,
          url:       `/ifsc/${branch.ifsc}`,
        },
      })
    } catch {
      res.json({ reply: `Sorry, I couldn't look up that IFSC code right now. Try again in a moment.` })
    }
    return
  }

  // ── 2. Credit card recommendations ───────────────────────────────────────
  if (CC_KEYWORDS.some(w => lower.includes(w))) {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true, isFeatured: true, category: 'credit_card' },
        include: {
          bank:   { select: { name: true, slug: true } },
          offers: { where: { isActive: true }, take: 1, orderBy: { version: 'desc' } },
          details: { select: { annualFee: true, rewardType: true } },
        },
        orderBy: { rating: 'desc' },
        take: 4,
      })

      if (products.length === 0) {
        res.json({ reply: 'No credit card listings available right now. Check back soon!' })
        return
      }

      res.json({
        reply: 'Here are the top credit cards available right now:',
        type: 'credit_cards',
        data: products.map(p => ({
          name:       p.name,
          slug:       p.slug,
          bank:       p.bank.name,
          bankSlug:   p.bank.slug,
          rating:     p.rating,
          annualFee:  p.details?.annualFee ?? 0,
          rewardType: p.details?.rewardType ?? null,
          topBenefit: p.offers[0]?.title ?? null,
          url:        `/credit-cards/${p.slug}`,
        })),
      })
    } catch {
      res.json({ reply: 'Sorry, I couldn\'t fetch credit card details right now.' })
    }
    return
  }

  // ── 3. SIP / investment calculation ──────────────────────────────────────
  if (SIP_KEYWORDS.some(w => lower.includes(w))) {
    const amtMatch  = msg.match(/[\₹₹]?\s*(\d[\d,]*)\s*(?:rs?\.?|₹|rupees?)?/i)
    const yrMatch   = msg.match(/(\d+)\s*(?:years?|yrs?)/i)
    const moMatch   = msg.match(/(\d+)\s*(?:months?|mos?)/i)
    const rateMatch = msg.match(/(\d+(?:\.\d+)?)\s*%/i)

    if (amtMatch && (yrMatch || moMatch) && rateMatch) {
      const monthly = parseFloat(amtMatch[1].replace(/,/g, ''))
      const months  = yrMatch ? parseInt(yrMatch[1]) * 12 : parseInt(moMatch![1])
      const rate    = parseFloat(rateMatch[1])
      const years   = (months / 12).toFixed(1).replace(/\.0$/, '')

      const { invested, returns, total } = calcSIP(monthly, months, rate)

      res.json({
        reply: [
          `📊 **SIP Calculation Result**`,
          ``,
          `- Monthly Investment: **${fmt(monthly)}**`,
          `- Duration: **${years} year${parseFloat(years) !== 1 ? 's' : ''} (${months} months)**`,
          `- Expected Return Rate: **${rate}% p.a.**`,
          ``,
          `| | Amount |`,
          `|---|---|`,
          `| Total Invested | ${fmt(invested)} |`,
          `| Estimated Returns | ${fmt(returns)} |`,
          `| **Maturity Value** | **${fmt(total)}** |`,
          ``,
          `*Returns are estimated. Actual returns may vary based on market conditions.*`,
        ].join('\n'),
        type: 'sip',
      })
    } else {
      res.json({
        reply: [
          'I can help with SIP calculations! Please provide all three values:',
          '',
          '- **Monthly investment amount**',
          '- **Duration** (in years)',
          '- **Expected return rate** (%)',
          '',
          'Example: *"SIP ₹5000 for 5 years at 12%"*',
        ].join('\n'),
        type: 'ask',
      })
    }
    return
  }

  // ── 4. IFSC / branch search (bank + city keyword query) ───────────────────
  if (IFSC_KEYWORDS.some(w => lower.includes(w))) {
    // Try to extract useful terms — strip common words
    const stopWords = new Set(['ifsc', 'code', 'of', 'for', 'branch', 'bank', 'the', 'in', 'at', 'find', 'get', 'what', 'is'])
    const terms = msg
      .split(/[\s,]+/)
      .map(t => t.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(t => t.length > 1 && !stopWords.has(t.toLowerCase()))

    if (terms.length === 0) {
      res.json({
        reply: 'To find an IFSC code, tell me the **bank name** and **city**.\n\nExample: *"IFSC of HDFC Bank Hyderabad"*',
        type: 'ask',
      })
      return
    }

    try {
      const results = await branchSearch(terms)

      if (results.length === 0) {
        res.json({
          reply: `No branches found matching "${terms.join(' ')}". Try being more specific — include both the bank name and city.\n\nExample: *"IFSC of SBI Connaught Place Delhi"*`,
          type: 'not_found',
        })
        return
      }

      res.json({
        reply: `Found ${results.length} branch${results.length > 1 ? 'es' : ''} matching your query:`,
        type: 'branch_list',
        data: results.map(b => ({
          ifsc:   b.ifsc,
          bank:   b.bank.name,
          branch: b.branchName,
          city:   b.city ?? '—',
          state:  b.state.name,
          url:    `/ifsc/${b.ifsc}`,
        })),
      })
    } catch {
      res.json({ reply: 'Sorry, branch search failed. Try searching with a direct IFSC code instead.' })
    }
    return
  }

  // ── 5. Natural-language branch search (no IFSC keyword needed) ─────────────
  // Handles: "HDFC Nizampet Hyderabad", "HDFC BANK, Nizampet branch, Hyderabad"
  {
    const nlStopWords = new Set(['ifsc','code','of','for','branch','bank','the','in','at','find','get','what','is','please','tell','me','and','a','an'])
    const nlTerms = msg
      .split(/[\s,]+/)
      .map(t => t.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(t => t.length > 1 && !nlStopWords.has(t.toLowerCase()))

    if (nlTerms.length >= 2) {
      try {
        const results = await branchSearch(nlTerms)

        if (results.length > 0) {
          res.json({
            reply: `Found ${results.length} branch${results.length > 1 ? 'es' : ''} matching your query:`,
            type: 'branch_list',
            data: results.map(b => ({
              ifsc:   b.ifsc,
              bank:   b.bank.name,
              branch: b.branchName,
              city:   b.city ?? '—',
              state:  b.state.name,
              url:    `/ifsc/${b.ifsc}`,
            })),
          })
          return
        }
      } catch {
        // fall through to greeting / fallback
      }
    }
  }

  // ── 6. Greeting ───────────────────────────────────────────────────────────
  if (GREETING_RE.test(lower)) {
    res.json({
      reply: [
        'Hi there! 👋 I\'m **Rupeepedia AI**, your financial assistant.',
        '',
        'Here\'s what I can help you with:',
        '',
        '🔍 **IFSC Lookup** — type any IFSC code like `HDFC0001234`',
        '🏦 **Find Branch** — ask *"IFSC of HDFC Bank Hyderabad"*',
        '💳 **Credit Cards** — ask *"best credit cards"*',
        '📈 **SIP Calculator** — try *"SIP ₹5000 for 5 years at 12%"*',
      ].join('\n'),
      type: 'greeting',
    })
    return
  }

  // ── 7. Fallback ───────────────────────────────────────────────────────────
  res.json({
    reply: [
      'I can help with:',
      '',
      '🔍 **IFSC codes** — type a code like `SBIN0001234`',
      '🏦 **Branch search** — *"HDFC Bank Nizampet Hyderabad"*',
      '💳 **Credit cards** — *"show me best credit cards"*',
      '📈 **SIP calculator** — *"SIP ₹3000 for 3 years at 10%"*',
    ].join('\n'),
    type: 'fallback',
  })
})

export default router
