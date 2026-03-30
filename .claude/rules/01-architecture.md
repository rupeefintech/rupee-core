# Architecture

## Data Model (Prisma → PostgreSQL)

```
BanksMaster (@@map "Bank")  ──< Branch >──  State
     │                          │   │          │
     │                          │   └── District
     │                          │
     └── BankStatePresence >────┘── City
```

- **BanksMaster**: 1,352 banks. Master registry with type classification (Public/Private/Cooperative/RRB/Payments/Small Finance/Foreign). Self-referencing `mergedIntoId` for merged banks.
- **Branch**: 178k+ IFSC records. Has payment flags (neft/rtgs/imps/upi), geo coordinates, and links to bank/state/district/city.
- **BankStatePresence**: Denormalized bank-state pairs with branch counts. Powers cascade filtering. Must be rebuilt after every sync.
- **City**: 12k entries extracted from Branch.city strings. Unique on (name, stateId).
- **DataOverride**: Manual corrections with audit trail. Keyed by (entityType, entityId, fieldName).

## Hybrid Static-Dynamic Model

- **Static/curated**: BanksMaster fields (name, type, logo, classification) - human-verified, rarely changes
- **Dynamic/synced**: Branch data - synced from Razorpay, high-volume, weekly updates
- Never sync raw data directly into BanksMaster. Only Branch table gets automated updates.

## Caching Strategy

- Redis with TTL-based invalidation
- Banks list: long TTL (changes rarely)
- IFSC lookup: 24h TTL
- Stats: 30s TTL
- Cache keys follow pattern: `{entity}_{id}` or `{entity}_{param1}_{param2}`
