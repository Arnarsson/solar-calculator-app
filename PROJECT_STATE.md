# PROJECT STATE - Solar Calculator Web App

## Current Sprint
- **CTO Agent:** Architecture complete, launching foundation
- **Frontend Squad:** Queued - waiting for Next.js setup
- **Backend Squad:** Queued - waiting for Prisma schema
- **Data Engineer:** Schema designed, ready to implement

## Completed
- [x] Analyzed Excel source files
- [x] Identified all calculation formulas
- [x] Designed database schema
- [x] Created architecture document
- [x] Defined tech stack

## In Progress
- [ ] Setting up Next.js foundation
- [ ] Installing dependencies (Shadcn, Prisma, etc.)

## Blockers
None currently

## Decisions Made
1. **Framework:** Next.js 14 with App Router (best DX, fast shipping)
2. **Database:** SQLite for dev, PostgreSQL for prod (easy migration)
3. **Auth:** NextAuth.js (simple, secure, well-documented)
4. **UI:** Shadcn/UI (beautiful defaults, fully customizable)
5. **Charts:** Recharts (React-native, good for dashboards)
6. **Currency:** DKK as default (matches source data)

## Next Up (Priority Order)
1. Create Next.js project with TypeScript
2. Install and configure Shadcn/UI
3. Set up Prisma with schema
4. Build landing page
5. Build setup/pricing form
6. Build production estimator

## Source Data Summary
From Excel files:
- **Setup costs:** Solar panels (47,400), Inverter (20,625), Battery (20,925), Mounting (11,680), Installation (49,335), Loan interest (8,000) = Total 157,965 DKK
- **System specs:** 400W panels × 29 = 11.6 kW system
- **Production estimate:** 8,816 kWh/year (950 sun hours, 0.8 efficiency)
- **Monthly tracking:** 12 months of production/consumption data available
