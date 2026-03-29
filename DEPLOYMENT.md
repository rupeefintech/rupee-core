# 🏦 BankInfoHub — Complete Setup & Deployment Guide

> India's production-ready IFSC Code Finder: React + Express + SQLite

---

## 📁 Project Structure

```
bankinfohub/
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── database.ts         # SQLite connection & schema
│   │   ├── routes/api.ts       # All API endpoints
│   │   └── seed-sample.ts      # Sample data seeder
│   ├── data/                   # bankinfohub.db lives here
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/              # HomePage, IFSCFinderPage, IFSCResultPage
│   │   ├── components/         # Navbar, BranchCard, PaymentMatrix...
│   │   ├── utils/api.ts        # API client + TypeScript types
│   │   └── styles/globals.css
│   ├── index.html              # SEO meta tags
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── scripts/
│   └── sync_ifsc.py            # Data sync engine
├── .github/workflows/
│   └── sync-ifsc.yml           # Fortnightly auto-sync
├── docker-compose.yml
├── start-local.sh              # One-command local start
└── package.json                # Root convenience scripts
```

---

## 🗄️ Database Design

**SQLite** was chosen because:
- Zero configuration, single file, portable
- Handles millions of rows with proper indexing
- WAL mode enables concurrent reads
- Free on any hosting platform
- Easily replaceable with PostgreSQL later

```
states ──┐
         ├── districts ──┐
banks ───┘               ├── branches (main table, ~200K rows)
                         └── pincodes (future use)
```

### Key tables:
| Table | Purpose |
|-------|---------|
| `states` | 28 states + 8 UTs |
| `districts` | ~700 districts |
| `banks` | All Indian banks (~250) |
| `branches` | IFSC + MICR + address + payment modes |
| `pincodes` | Future: 6-digit pincode lookup |
| `search_logs` | Analytics (anonymized) |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.9
- npm ≥ 9

### Step 1: Clone & Install

```bash
git clone https://github.com/yourusername/bankinfohub.git
cd bankinfohub

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Step 2: Seed Sample Database

```bash
cd backend
npx ts-node src/seed-sample.ts
# OR use Python directly (works without npm):
# python3 - see the Python seeder in scripts/
```

### Step 3: Start Development Servers

```bash
# Option A: One command (if concurrently installed)
npm run dev

# Option B: Shell script
./start-local.sh

# Option C: Two terminals
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

### Step 4: Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/health |

### Test API endpoints:
```bash
# List all states
curl http://localhost:3001/api/states

# List all banks  
curl http://localhost:3001/api/banks

# IFSC direct lookup
curl http://localhost:3001/api/ifsc/SBIN0000001

# Stats
curl http://localhost:3001/api/stats
```

---

## 📥 Full Data Sync (RBI Dataset)

```bash
# Install Python dependencies
pip install requests tqdm colorama

# Run full sync (~5 min for 200K records)
python3 scripts/sync_ifsc.py

# Sync only one state
python3 scripts/sync_ifsc.py --state Telangana

# Preview without writing
python3 scripts/sync_ifsc.py --dry-run

# Show DB stats
python3 scripts/sync_ifsc.py --stats
```

The sync script downloads the [Razorpay IFSC dataset](https://github.com/razorpay/ifsc) 
(MIT licensed, comprehensive, includes all RBI data).

---

## 🚀 Deployment Options (All Free Tier)

### Option 1: Railway.app ⭐ Recommended

**Best for:** Full-stack with SQLite, one-click deploy

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway new

# 4. Deploy backend
cd backend
railway up

# 5. Set environment variables
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app

# 6. Deploy frontend to Vercel
cd ../frontend
npx vercel --prod
```

**Railway free tier:** 500 hours/month, 512MB RAM, SQLite persists.

---

### Option 2: Render.com

**Backend (Web Service):**
1. Connect GitHub repo
2. Build command: `cd backend && npm install && npm run build`
3. Start command: `cd backend && npm start`
4. Add disk: `/app/data` for SQLite persistence

**Frontend (Static Site):**
1. Build command: `cd frontend && npm install && npm run build`
2. Publish directory: `frontend/dist`
3. Add redirect rule: `/* → /index.html` (200)

---

### Option 3: Vercel (Frontend) + Fly.io (Backend)

```bash
# Deploy frontend to Vercel
cd frontend
vercel --prod

# Deploy backend to Fly.io
cd ../backend
fly launch
fly volumes create bankdata --size 1  # 1GB for SQLite
fly deploy
```

---

### Option 4: VPS (DigitalOcean $4/month or Oracle Free Tier)

```bash
# On your VPS
git clone https://github.com/yourusername/bankinfohub
cd bankinfohub

# Install Docker
curl -fsSL https://get.docker.com | sh

# Start with Docker Compose
docker-compose up -d

# Setup Nginx reverse proxy + Let's Encrypt SSL
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d bankinfohub.in
```

**Oracle Always Free Tier:** 2 ARM VMs (4 CPU, 24GB RAM combined) — more than enough!

---

## 🔄 Automated Data Sync (GitHub Actions)

The `.github/workflows/sync-ifsc.yml` workflow:
- Runs automatically on 1st and 15th of every month
- Can be triggered manually from GitHub UI
- Commits updated DB back to repository
- Uploads sync logs as artifacts

**To enable:**
1. Push code to GitHub
2. Add `GITHUB_TOKEN` secret (auto-provided by GitHub)
3. The workflow will run automatically

**Manual trigger:**
- Go to GitHub → Actions → "Fortnightly IFSC Data Sync" → "Run workflow"

---

## 💰 Monetization Setup

### Google AdSense
1. Apply at https://adsense.google.com
2. Get approved (need 50+ articles or meaningful traffic)
3. Add to `frontend/index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>
```
4. Place ad units in `IFSCResultPage.tsx` where marked:
```tsx
{/* Ad slot in result page */}
<ins className="adsbygoogle" data-ad-client="ca-pub-YOUR_ID" data-ad-slot="YOUR_SLOT" />
```

### Revenue potential:
- Indian finance traffic: ₹150-500 RPM
- 10,000 searches/day = ₹500-2000/month+
- SEO optimization included (meta tags, schema markup, semantic HTML)

---

## 🔍 SEO Checklist

✅ Meta title and description on all pages  
✅ Open Graph tags for social sharing  
✅ Structured data (WebApplication schema)  
✅ Canonical URLs  
✅ Dynamic page titles per IFSC result  
✅ Mobile responsive (Tailwind CSS)  
✅ Core Web Vitals optimized (code splitting, lazy loading)  
✅ Semantic HTML (h1/h2 hierarchy)  
✅ Internal linking between pages  
✅ IFSC-specific SEO content on home page  

**Next steps for SEO:**
- Create city-specific landing pages (`/ifsc/hyderabad-sbi`)
- Add blog section with banking guides
- Submit sitemap to Google Search Console
- Get backlinks from personal finance blogs

---

## 🔮 Roadmap

| Feature | Status |
|---------|--------|
| IFSC Finder (guided + direct) | ✅ Done |
| Payment mode matrix | ✅ Done |
| Google Maps integration | ✅ Done |
| Fortnightly auto-sync | ✅ Done |
| **Pincode Finder** | 🔜 Schema ready |
| **Bank Branch Locator (map)** | 🔜 Planned |
| **SWIFT Code Lookup** | 🔜 Planned |
| **MICR Code Search** | 🔜 Planned |
| **Bank Comparison Tool** | 🔜 Planned |
| **Loan EMI Calculator** | 🔜 Planned |

---

## 🛡️ API Reference

| Endpoint | Description |
|----------|-------------|
| `GET /api/states` | All states |
| `GET /api/banks` | All banks |
| `GET /api/districts?state_id=1` | Districts by state |
| `GET /api/branches?bank_id=1&state_id=1&district_id=1` | Branches |
| `GET /api/ifsc/:ifsc` | Full branch detail by IFSC |
| `GET /api/search?q=SBIN` | Free text search |
| `GET /api/pincode/:pincode` | Branches by pincode |
| `GET /api/stats` | Database statistics |
| `GET /health` | Server health check |

**Rate limits:**
- General: 200 req/15 min per IP
- IFSC lookup: 30 req/min per IP

---

## ⚙️ Environment Variables

### Backend `.env`
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend `.env` (optional)
```
VITE_API_URL=/api
```

---

*Built with ❤️ for the Indian banking community*
