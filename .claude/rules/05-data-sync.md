# Data Sync Rules

## Source

Branch/IFSC data comes from Razorpay's open IFSC dataset (GitHub releases).
Sync script: `scripts/sync_ifsc.py`

## Pipeline (9 stages)

1. **Fetch** - Download latest Razorpay IFSC release
2. **Normalize** - Trim whitespace, fix encoding, standardize names
3. **Deduplicate** - Fuzzy match to catch near-duplicates (95%+ detection)
4. **Classify** - Assign bank_type (Public/Private/Cooperative/RRB/etc.) from name patterns
5. **Detect mergers** - Flag banks with no branches for >90 days
6. **Safety checks** - Alert if >10% data change (likely error, needs review)
7. **Upsert** - Insert new / update existing branches
8. **Rebuild presence** - Regenerate BankStatePresence counts
9. **Verify** - Check FK integrity, log to SyncLog

## After Every Sync

These must be rebuilt/refreshed:
- `bank_state_presence` - branch counts per bank+state
- `City` table - new cities from new branches
- `Branch.city_id` - link new branches to cities
- `Branch.is_active` / `last_synced` / `source` fields

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

## Never

- Never overwrite BanksMaster.name/type/logo from automated sync
- Never delete banks - set `is_active = false` instead
- Never sync without a backup plan
