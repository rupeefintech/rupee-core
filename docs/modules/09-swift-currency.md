# Module 09: SWIFT Code Lookup & Currency Converter

## Status: Live

---

## 1. SWIFT Code Lookup

### URL
`/swift-code-lookup`

### What it does
- Exact lookup: user enters a SWIFT/BIC code (8–11 chars) → returns bank + branch details
- Search: user types bank name → shows matching SWIFT codes with autocomplete dropdown
- Popular quick-search chips (SBI, HDFC, ICICI, Axis, Kotak, etc.)
- Shows SWIFT code breakdown (Bank Code / Country / Location / Branch)
- Links to IFSC detail page for same branch

### Data Source
- **Primary:** `Branch.swift` field already populated in existing DB (from Razorpay IFSC dataset)
- **No extra data pipeline needed** — SWIFT codes are in the branches table
- Update cadence: syncs automatically with IFSC data sync (quarterly via `scripts/sync_ifsc.py`)
- Validation: format check (8–11 alphanumeric chars)

### Backend Endpoints
```
GET /api/swift/search?q=HDFC&limit=20
  — searches bank name / shortName / swift prefix (case-insensitive)
  — returns: array of { swift, ifsc, bank_name, bank_slug, bank_logo, branch_name, city, state_name }

GET /api/swift/:code
  — exact lookup by SWIFT code (8–11 chars, case-insensitive)
  — returns: full branch + bank details
  — cache: 24h Redis
  — 404 if not found
```

> **Note:** `/swift/search` route is registered BEFORE `/:code` in Express to prevent "search" being parsed as a code param.

### Frontend Files
- `frontend/src/pages/SwiftCodePage.tsx`

### SEO
- URL: `/swift-code-lookup`
- Title: `SWIFT / BIC Code Lookup — Find Bank SWIFT Codes India | RupeePedia`
- Targets: "swift code lookup india", "HDFC swift code", "SBI swift code", "bank wire transfer code india"
- JSON-LD: WebPage schema

---

## 2. Currency Converter

### URL
`/currency-converter`

### What it does
- Real-time INR converter: convert between INR and 15 major currencies
- Swap button to reverse conversion direction
- Rate table: all currencies vs 1 INR + inverse, with flags
- Clicking a row in the table pre-fills the converter
- Affiliate links to Wise + Remitly for international transfers
- Cross-link to SWIFT Code Lookup

### Data Source
- **Yahoo Finance forex API** (same as gold/silver on `/gold-rate-today`)
- Tickers: `USDINR=X`, `EURINR=X`, `GBPINR=X`, `AEDINR=X`, `AUDINR=X`, `CADINR=X`, `SGDINR=X`, `JPYINR=X`, `CHFINR=X`, `HKDINR=X`, `SARINR=X`, `CNYINR=X`, `QARINR=X`, `MYRINY=X`, `THBINR=X`
- All fetched in parallel; failed tickers are skipped (graceful degradation)
- Cache: 15 min Redis + 10 min in-memory

### Currencies Supported
USD, EUR, GBP, AED, AUD, CAD, SGD, JPY, CHF, HKD, SAR, CNY, QAR, MYR, THB

### Backend Endpoint
```
GET /api/exchange-rates
  — returns: { base: 'INR', rates: { USD: 84.23, EUR: 91.50, ... }, updated_at, disclaimer }
  — rates are INR per 1 unit of foreign currency
  — cache: 15 min Redis + 10 min in-memory
```

### Frontend Files
- `frontend/src/pages/CurrencyConverterPage.tsx`

### SEO
- URL: `/currency-converter`
- Title: `Currency Converter — INR to USD, EUR, GBP, AED & More | RupeePedia`
- Targets: "currency converter india", "inr to usd", "dollar to rupee", "usd to inr today"
- JSON-LD: WebPage schema

---

## Monetization

| Feature | Mechanism | Est. CPM/Revenue |
|---|---|---|
| SWIFT Lookup | Forex platform display ads (Wise, Remitly, Niyo) | ₹80–200 CPM |
| Currency Converter | Affiliate links (Wise, Remitly) + display ads | ₹100–300 CPM |
| Both | AdSense financial category | ₹80–150 CPM |

---

## Known Limitations

- SWIFT codes in DB are from Razorpay dataset — may lag new codes by 3–6 months
- Some small banks / foreign bank branches may have no SWIFT code in DB
- Currency rates are mid-market (Yahoo Finance) — actual bank/transfer rates differ by 1–4%
- MYR ticker uses `MYRINY=X` (non-standard) — may occasionally fail; graceful skip

## Future Enhancements (Phase 2)

- Historical rate chart (7d / 30d / 1y) for Currency Converter
- Rate alert: "Notify me when 1 USD < ₹83"
- SWIFT code search by city / branch name
- Add admin UI to manually correct/add SWIFT codes
