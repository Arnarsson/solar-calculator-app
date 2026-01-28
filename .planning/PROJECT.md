# Solar Purchase Decision Calculator

## What This Is

A comprehensive solar purchase decision calculator for Danish homeowners. Users input their specific situation (roof details, location, energy usage, EV ownership) and receive detailed financial projections including payback calculations with Danish tax scenarios, battery sizing recommendations, panel comparisons, and CO2 impact tracking. Sold as a one-time purchase for lifetime access to the hosted calculator.

## Core Value

Help homeowners make confident solar purchase decisions by providing accurate, personalized financial analysis that cuts through the complexity and confusion of evaluating solar installations.

## Requirements

### Validated

<!-- Existing functionality from current codebase -->

- ✓ Real-time electricity price integration (Energi Data Service DK1/DK2) — existing
- ✓ Solar production forecasting with Open-Meteo API — existing
- ✓ Live dashboard with production and price charts — existing
- ✓ Basic financial calculations (payback time, savings estimates) — existing
- ✓ Smart optimization recommendations for charging windows — existing
- ✓ Next.js 14 app with TypeScript and Tailwind CSS — existing
- ✓ Recharts data visualization — existing
- ✓ Prisma ORM with database schema prepared — existing

### Active

<!-- Features to build for v1 launch -->

- [ ] User authentication and account management (NextAuth already in stack)
- [ ] Guided setup wizard (roof orientation, area, location, current usage)
- [ ] Solar panel specification database with comparison tool
- [ ] Battery sizing calculator (whether to get battery, what capacity)
- [ ] EV charging integration and cost impact analysis
- [ ] Port Excel calculation formulas (advanced tax scenarios, CO2 tracking)
- [ ] Scenario saving and comparison ("with battery vs without")
- [ ] Premium UI/UX with professional financial tool aesthetic
- [ ] Payment integration for one-time purchase model
- [ ] User dashboard to manage saved scenarios
- [ ] Regional data defaults (sun hours, typical costs by area)
- [ ] Export results (PDF reports for users)

### Out of Scope

- Mobile native apps — Web-first, responsive design sufficient for v1
- Multi-language support — Danish/English only for v1 (can expand later)
- Installer marketplace/booking — Pure decision tool, not a marketplace
- Real-time monitoring of installations — Decision-making phase only, not post-installation
- Live chat support — Documentation and email support sufficient
- Social features/community — Individual purchase decisions, not social
- Affiliate commissions from installers — Keep tool neutral and trustworthy

## Context

**Founder Experience:**
- Built Excel calculator when researching own solar installation at Platanvej 7
- Experienced firsthand the overwhelming complexity of evaluating solar purchases
- Created sophisticated formulas for payback calculations, tax scenarios, CO2 tracking
- Identified gap in market: no comprehensive, trustworthy calculator for Danish homeowners

**Current Codebase:**
- Functional prototype with live data integration
- Main component is monolithic (1,100 lines) and needs refactoring
- No test coverage yet
- Database layer prepared but not actively used
- Authentication framework (NextAuth) installed but not configured

**Market:**
- Danish residential solar market
- Homeowners making 100,000+ DKK investment decisions
- Need to understand: panel selection, battery worth, EV charging impact, legal restrictions
- Critical decision factors: payback time, tax implications (elafgift), regional variations

**Technical Foundation:**
- Next.js 14 with App Router and server components
- Real-time data from Energi Data Service (Nord Pool prices)
- Solar forecasting from Open-Meteo (7-day radiation data)
- Vercel deployment pipeline already established

## Constraints

- **Market**: Danish residential solar (DK1/DK2 regions, Danish tax law)
- **Tech Stack**: Next.js 14, TypeScript, Prisma, Tailwind CSS (already established)
- **Data Sources**: Must use Energi Data Service + Open-Meteo (free tiers, no API keys)
- **Deployment**: Vercel hosting (current setup, cost-effective for SaaS)
- **Business Model**: One-time purchase (not subscription) — affects account/payment architecture
- **Data Privacy**: GDPR compliance required (EU/Danish users)
- **Performance**: Must feel fast and responsive (users comparing scenarios)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| One-time purchase vs subscription | Lower barrier for purchase decision tool; aligns with how users think about it | — Pending |
| NextAuth for authentication | Already in stack, well-supported, flexible | — Pending |
| Port Excel formulas vs rebuild | Formulas are proven and sophisticated; faster to port than reinvent | — Pending |
| Guided wizard + detailed view hybrid | Quick start for beginners, depth for power users | — Pending |
| Professional/financial aesthetic | High-stakes financial decision requires trust; modern polish without playfulness | — Pending |

---
*Last updated: 2026-01-28 after initialization*
