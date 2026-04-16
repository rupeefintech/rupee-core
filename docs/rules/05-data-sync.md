# Data Sync Rules

## IFSC Data Source

Branch/IFSC data comes from Razorpay's open IFSC dataset (GitHub releases, updated monthly).
Sync script: `scripts/sync_ifsc.py`

## IFSC Sync Pipeline (9 stages)

1. **Fetch** — Download latest Razorpay IFSC release JSON
2. **Normalize** — Trim whitespace, fix encoding, standardize city/state names
3. **Deduplicate** — Fuzzy match (95%+ threshold) to catch near-duplicates
4. **Classify** — Assign bank_type (Public/Private/Cooperative/RRB/etc.) from name patterns
5. **Detect mergers** — Flag banks with no branches for >90 days
6. **Safety checks** — Alert if >10% data change (likely error, needs review)
7. **Upsert** — Insert new / update existing branches
8. **Rebuild presence** — Regenerate BankStatePresence counts
9. **Verify** — Check FK integrity, log to SyncLog

## After Every IFSC Sync

These must be rebuilt/refreshed:
- `bank_state_presence` — branch counts per bank+state
- `City` table — new cities from new branches
- `Branch.city_id` — link new branches to cities
- Redis cache — flush via `flushdb()`

## Bank Classification Patterns

| Type | Name Pattern |
|---|---|
| Public | SBI, PNB, BOB, Canara, Union, Indian Bank, etc. (12 known) |
| Private | HDFC, ICICI, Axis, Kotak, Yes, IndusInd, etc. |
| Cooperative | Contains "co-operative", "sahakari", "sahakara", "souharda" |
| RRB | Contains "gramin", "grameen", "grameena", "rural bank" |
| Payments | Contains "payments bank" |
| Small Finance | Contains "small finance" |
| Foreign | Contains "international", or known names (HSBC, Citi, DBS, etc.) |

## Blog Generation Pipeline

Daily automated blog generation via GitHub Actions + Claude API.

### Flow
```
Topic Queue (60 topics in blog-topics.ts)
  → Check which topics are unpublished (query DB)
  → Pick next topic
  → Claude Sonnet generates 1,500–2,500 word Markdown
  → Claude Haiku generates SEO meta description
  → Unsplash fetches cover image (keywords + "india rupee")
  → Insert into blogs table
```

### Schedule
- GitHub Actions cron: **4 AM UTC (9:30 AM IST) daily**
- Workflow: `.github/workflows/generate-blog.yml`
- Manual trigger also available via `workflow_dispatch`

### Script: `backend/scripts/generate-blog.ts`
- Picks next unpublished topic from `blog-topics.ts`
- Supports `--slug <slug>` for specific topic
- Requires env vars: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `UNSPLASH_ACCESS_KEY` (optional)

### Topic Categories (60 total)
| Category | Count |
|---|---|
| Tax | 15 |
| Banking | 10 |
| Credit Cards | 10 |
| Investment | 15 |
| Loans | 10 |

### Blog Content Format
Each blog uses Markdown with custom HTML for rich visuals:
- `<div class="stats-row">` — statistics cards at top
- `<div class="concept-grid">` — key concepts grid
- `<div class="vs-grid">` — side-by-side comparisons
- `<div class="highlight-box">` — key examples
- `<div class="verdict-box">` — summary recommendation
- Callouts via blockquotes with emoji prefixes (💡 tip, ⚠️ warning, 📌 note)
- Internal links to calculators and IFSC tools

## Credit Card Data

Seeded via `backend/scripts/seed-credit-cards.ts`. Manual entry via admin panel.

## Data Cleanup

- Script: `scripts/cleanup_data.py` — fixes data quality issues
- Handles: district deduplication, state mapping corrections, city normalization

## Never

- Never overwrite BanksMaster.name/type/logo from automated sync
- Never delete banks — set `is_active = false` instead
- Never sync without a backup plan
- Never run blog generation without `ANTHROPIC_API_KEY` set
