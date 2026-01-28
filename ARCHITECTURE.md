# Solar Calculator Web App - Architecture

## Overview
All-in-one solar panel calculator for customers evaluating solar installations. Converts Excel-based calculations into a modern web application with user accounts.

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation

### Backend
- **API:** Next.js API Routes (App Router)
- **ORM:** Prisma
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Authentication:** NextAuth.js

### Deployment
- **Platform:** Vercel
- **Database:** Vercel Postgres or PlanetScale

## Data Model

### User
- id, email, name, password (hashed), createdAt

### Installation
- id, userId, name, address
- panelWattage, numberOfPanels, sunHoursPerYear, efficiencyFactor
- createdAt, updatedAt

### SetupCost
- id, installationId
- solarPanelsCost, inverterCost, batteryCost, mountingKitCost
- installationCost, loanInterestRate
- currency (DKK default)

### MonthlyData
- id, installationId, month, year
- production (kWh)
- electricityUsedDirectly, sentToGrid, sentToBattery
- consumption, usedByBattery, usedFromGrid
- evCharged
- electricityPrice (kr/kWh)
- createdAt

## Feature Modules

### 1. Setup & Pricing (`/setup`)
- Input installation costs
- Calculate total investment
- Support multiple currencies

### 2. Production Estimator (`/estimator`)
- Panel specifications input
- Location-based sun hours
- Efficiency calculations
- Yearly production estimate

### 3. Monthly Tracking (`/dashboard`)
- Production vs consumption charts
- Grid interaction tracking
- Battery usage monitoring
- EV charging logs

### 4. Financial Analysis (`/financials`)
- Monthly savings calculation
- Payback time projection
- Grid earnings tracking
- ROI visualization

### 5. Battery & EV (`/battery-ev`)
- Battery charge/discharge tracking
- EV charging optimization
- Grid arbitrage calculations

### 6. CO₂ Savings (`/co2`)
- Emissions avoided calculation
- Environmental impact visualization
- Comparison charts

## Page Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx (overview)
│   ├── setup/page.tsx
│   ├── estimator/page.tsx
│   ├── monthly/page.tsx
│   ├── financials/page.tsx
│   ├── battery-ev/page.tsx
│   └── co2/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── installations/route.ts
│   ├── monthly-data/route.ts
│   └── calculations/route.ts
├── layout.tsx
└── page.tsx (landing)
```

## Calculations (from Excel)

### Production Estimate
```
yearlyProduction = panelWattage × numberOfPanels × sunHoursPerYear × efficiencyFactor / 1000
```

### Monthly Savings
```
savings = electricityUsedDirectly × electricityPrice
gridEarnings = sentToGrid × gridSellPrice
totalSaved = savings + gridEarnings
```

### Payback Time
```
totalCost = solarPanels + inverter + battery + mounting + installation + loanInterest
yearlySavings = sum(monthlySavings)
paybackYears = totalCost / yearlySavings
```

### CO₂ Savings
```
co2SavedKg = totalProductionUsed × emissionFactor (Denmark: ~0.5 kg CO₂/kWh)
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Development Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Foundation setup | 15 min |
| 2 | Core UI components | 30 min |
| 3 | Setup & Estimator | 30 min |
| 4 | Monthly tracking | 30 min |
| 5 | Financial calculations | 20 min |
| 6 | Battery/EV + CO₂ | 20 min |
| 7 | Auth integration | 20 min |
| 8 | Polish & deploy | 15 min |

**Total estimated: ~3 hours**
