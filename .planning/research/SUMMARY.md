# Project Research Summary

**Project:** Solar Purchase Decision Calculator (Premium Danish Market)
**Domain:** Financial SaaS Calculator with One-Time Purchase Model
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

This is a premium solar purchase decision calculator targeting Danish homeowners making 100K+ DKK investment decisions. Research reveals a clear product-market fit opportunity: existing tools are either excellent data sources without financial analysis (PVGIS) or US-market focused (EnergySage, Google Sunroof). The recommended approach combines Next.js 14 App Router with Auth.js v5 for authentication, Stripe for one-time payments, and shadcn/ui Charts for financial visualizations. The existing Next.js foundation is solid, requiring strategic additions rather than replacement.

The critical risk is breaking trust through calculation errors or opacity in financial modeling. For a tool where users make 100K+ DKK decisions, a single calculation error destroys credibility permanently. Mitigation requires using Decimal types for all currency calculations, parameterizing all constants with data sources, comprehensive test suites comparing TypeScript outputs to Excel formulas, and transparent "how we calculated this" explanations for every major result. Secondary risks include data loss during free-to-paid migration, payment failure recovery neglect, and GDPR compliance violations with financial data.

The roadmap should prioritize trust establishment (formula accuracy, transparency) in early phases while the tool is still free or low-risk, then layer on premium features (authentication, payments, advanced features) only after core calculations are proven accurate. Battery sizing, EV charging integration, and multi-scenario comparison are the key differentiators justifying premium pricing versus free alternatives.

## Key Findings

### Recommended Stack

The project has a strong existing foundation with Next.js 14, TypeScript, Prisma, and shadcn/ui already installed. Key additions needed: Auth.js v5 (migrate from NextAuth v4) for authentication, Stripe Checkout for one-time payments, TanStack Query for client-side data management, and shadcn/ui Charts for financial visualizations. Critical upgrade: Prisma v5.17 → v7.0 for 90% smaller bundles and 3x faster queries.

**Core technologies:**
- **Auth.js v5** (NextAuth upgrade): App Router native authentication with email magic links — industry standard, edge-compatible, well-documented migration path from v4
- **Stripe Checkout**: One-time payment processing — minimal code, handles 3D Secure/SCA automatically, 2.9% + 30 øre fees vs Paddle's 5% + 50 øre
- **TanStack Query v5**: Client-side server state management — eliminates need for global state, automatic caching, perfect for scenario loading and panel specs
- **shadcn/ui Charts**: Financial visualizations built on Recharts — matches existing shadcn design system, 53 pre-built chart types, TypeScript-native
- **Vercel Postgres (Neon)**: Production database — serverless PostgreSQL with instant preview branching, 500ms-1s cold start, seamless Vercel integration
- **Resend + React Email**: Authentication email delivery — 100 free emails/day, type-safe templates, Auth.js native support

**Critical version notes:**
- NextAuth v4 → Auth.js v5 migration required (cookie prefix changes will log out existing users unless migrated)
- Prisma v5 → v7 upgrade strongly recommended (Rust-free client, major performance gains)
- Avoid Payment Intents API for MVP (3-5x more code than Stripe Checkout)

### Expected Features

Research reveals clear table stakes versus competitive differentiators in the solar calculator domain.

**Must have (table stakes):**
- Location-based solar yield calculation (PVGIS data for Danish latitude 55-57°N)
- Roof assessment with orientation impact (azimuth/tilt efficiency)
- Electricity cost input (Danish rates ~2.5-3 DKK/kWh with 2026 tax reduction to 0.8 øre/kWh)
- System cost breakdown (panels, inverter, installation, VAT)
- Payback period calculation (years to break even)
- Annual savings estimate (self-consumption vs grid export)
- Panel specification comparison (monocrystalline vs polycrystalline, wattage, efficiency)

**Should have (competitive differentiators):**
- **Battery storage sizing & ROI** — free calculators ignore batteries; for 100K+ DKK decisions, battery economics (50K extra) are critical
- **EV charging integration** — Danish EV adoption is high; users need extra panels sizing, charging cost savings
- **Multi-scenario comparison** — save and compare configurations side-by-side (with/without battery, different panel counts)
- **Danish tax scenario modeling** — home improvement deduction (18.3K DKK cap), reduced electricity tax (2026-2027), VAT implications
- **Time-of-use billing optimization** — battery arbitrage value (cheap off-peak power usage during expensive peak hours)
- **Detailed financial breakdown** — month-by-month cash flow, 25-year projections, sensitivity analysis (3%/5%/7% price rises)
- **Degradation modeling** — realistic 0.5%/year efficiency decline, not just Year 1 projections
- **PDF reports** — professional output for installers, banks, family decision-making

**Defer (v2+):**
- Installer marketplace integration (requires B2B partnerships, legal agreements)
- Financing scenario modeling (requires bank partnerships for accurate Danish loan rates)
- Heat pump integration (smaller market than EV, validate EV pattern first)
- 3D roof modeling (expensive, doesn't improve calculation accuracy)
- Real-time satellite roof imaging (GDPR concerns, expensive LIDAR data licensing)

### Architecture Approach

The architecture follows Next.js App Router best practices with a two-tier authentication pattern (optimistic middleware checks + secure Data Access Layer verification) and scenario-based state management where scenarios are first-class database entities enabling "what-if" analysis.

**Major components:**
1. **Data Access Layer (DAL)** — centralized auth/authorization using React cache() for deduplication, prevents scattered permission checks, single source of truth for user data access
2. **Scenario Manager** — Server Actions for mutations, Server Components for fetching; scenarios store complete input snapshots + computed outputs enabling comparison and audit trail
3. **Payment Gateway** — one-time purchase with Stripe Checkout (not Payment Intents API); webhook is source of truth for payment confirmation, entitlement check via middleware + DAL
4. **API Route Proxies** — server-side proxies for external APIs (Energi Data Service, Open-Meteo) with aggressive caching (1hr for prices, 6hr for forecasts) to avoid rate limits and keep API keys secure
5. **Optimistic UI Layer** — immediate client updates while background validation runs; debounced server persistence (500ms-1s) with rollback on validation failure

**Key patterns:**
- Server Components for initial data load + TanStack Query for client-side mutations (40-70% faster initial loads)
- Store all inputs + computed outputs + formulaVersion in scenarios (enables calculation reproduction if formulas change)
- Never trust client calculations for payments; always verify server-side
- Two-tier auth: middleware fast redirects (cookie-only), DAL database verification (before sensitive operations)

### Critical Pitfalls

Research identified seven critical pitfalls specific to premium financial calculators that can destroy trust and kill the business.

1. **Breaking Trust Through Calculation Errors** — floating-point arithmetic errors, hardcoded constants, missing rounding precision destroy credibility. Use Decimal types for all currency (never number), parameterize constants with sources/dates, comprehensive test suite comparing to Excel, transparent "how we calculated" sections.

2. **Black Box Syndrome** — users don't trust results they can't verify. Add expandable "how we calculated this" for every major result, show all assumptions explicitly (gridSellPriceRatio = 0.3 with source), display formulas in plain language, provide step-by-step calculation export.

3. **Data Loss During Free-to-Paid Migration** — users lose saved calculations when upgrading from localStorage to database accounts. Store anonymous sessions in database from day one (with expiration), migrate localStorage data on account creation, show "Your 5 scenarios will be preserved" message during signup.

4. **Paywall Placement Destroying Value Perception** — paywall before demonstrating value makes premium features feel like artificial restrictions. Let users complete full calculations without account, show paywall AFTER first calculation, gate advanced features (comparison, tax scenarios) not basic functionality, allow 2-3 scenario saves before requiring payment.

5. **Payment Failure Recovery Neglect** — 20-40% of payment failures are recoverable but generic error handling loses sales. Implement Stripe Smart Retries, specific error messages ("Card expired" vs "Insufficient funds"), use webhooks for confirmation, store last_payment_error, send recovery emails, monitor failure patterns monthly.

6. **NextAuth Security Misconfiguration** — authentication vulnerabilities expose financial data. Generate strong AUTH_SECRET (never commit), disable automatic account linking, keep auth logic in Server Components, secure cookie settings (httpOnly, secure, sameSite), verify payment status from database (not JWT claims), plan session invalidation strategy.

7. **GDPR Compliance Violations** — fines up to €20M or 4% of global turnover. Establish Data Processing Agreement with Stripe before launch, implement equal cookie consent (reject as easy as accept), minimize data collection, provide data export functionality, document legal basis for processing, 72-hour breach notification procedures.

## Implications for Roadmap

Based on research, the roadmap should prioritize trust establishment before monetization, with clear phase dependencies emerging from architectural patterns and pitfall prevention requirements.

### Phase 1: Foundation & Formula Migration
**Rationale:** Everything depends on accurate calculations. Trust must be established while tool is free/low-risk. Formula accuracy is table stakes — no amount of premium features will save a product with broken calculations.

**Delivers:**
- Ported Excel formulas to TypeScript with Decimal type precision
- Parameterized constants (gridSellPriceRatio, CO2 factors, elafgift rates) with data sources and update dates
- Comprehensive test suite comparing TypeScript outputs to Excel
- Calculation transparency ("how we calculated this" sections)
- Core solar yield calculation (PVGIS integration)

**Addresses features:**
- Location-based solar yield (table stakes)
- Electricity cost input (table stakes)
- Payback calculation (table stakes)
- System cost breakdown (table stakes)

**Avoids pitfalls:**
- Pitfall 1: Breaking trust through calculation errors
- Pitfall 2: Black box syndrome

**Tech stack:** TypeScript + Decimal.js for precision, date-fns for date calculations, Zod for input validation

**Research flag:** Standard patterns — Excel to TypeScript migration well-documented, skip deep research

### Phase 2: Enhanced Calculator & Panel Database
**Rationale:** Build on proven accurate foundation. Add table stakes features that differentiate from simple calculators. Panel database can be built in parallel with calculation enhancements (independent feature).

**Delivers:**
- Panel specification database (monocrystalline/polycrystalline comparison)
- Panel browser UI (search, filter, compare)
- Degradation modeling (0.5%/year realistic projections)
- Export income calculation (Danish net metering rates)
- Detailed financial breakdown (25-year projections, sensitivity analysis)

**Addresses features:**
- Panel specification comparison (table stakes)
- System size recommendation (table stakes)
- Degradation modeling (differentiator)
- Detailed financial breakdown (differentiator)

**Avoids pitfalls:**
- Continued transparency (all new calculations include explanations)
- Parameterized constants for panel specs and export rates

**Tech stack:** Prisma for panel database, shadcn/ui Charts for financial projections, TanStack Query for panel data caching

**Research flag:** Standard patterns — database modeling and chart rendering well-established, skip deep research

### Phase 3: Authentication & Data Persistence
**Rationale:** After core calculations proven accurate, add user accounts and scenario saving. Critical: design data migration strategy BEFORE implementing auth to avoid data loss pitfall.

**Delivers:**
- Auth.js v5 setup (email magic links, passwordless)
- User accounts and session management
- Scenario CRUD operations (create, save, load, delete)
- Anonymous session → authenticated session migration
- localStorage → database data preservation

**Addresses features:**
- Multi-scenario comparison foundation (must save scenarios first)
- User account system (required for payment)

**Avoids pitfalls:**
- Pitfall 3: Data loss during free-to-paid migration (anonymous sessions stored in DB from start)
- Pitfall 6: NextAuth security misconfiguration (proper AUTH_SECRET, secure cookies, no auto account linking)

**Tech stack:** Auth.js v5 (migrate from NextAuth v4), @auth/prisma-adapter, Resend + React Email for magic links, Prisma schema for User/Session/Scenario models

**Research flag:** NEEDS RESEARCH — NextAuth v4 → Auth.js v5 migration has cookie session preservation complexity, review migration guides during phase planning

### Phase 4: Payment Integration & Premium Features
**Rationale:** Only after users trust calculations and have experienced scenario saving should payment be introduced. Paywall placement is critical: gate comparison tools and advanced features, not basic calculator.

**Delivers:**
- Stripe Checkout integration (one-time purchase)
- Webhook payment confirmation
- Payment failure recovery (Smart Retries)
- Multi-scenario comparison UI (side-by-side)
- PDF export with calculation metadata
- GDPR compliance implementation (DPA with Stripe, data export, cookie consent)

**Addresses features:**
- Multi-scenario comparison (key differentiator)
- PDF reports (differentiator)
- Premium feature gating

**Avoids pitfalls:**
- Pitfall 4: Paywall placement destroying value (users see 2-3 free scenarios before payment required)
- Pitfall 5: Payment failure recovery neglect (Smart Retries, specific error messages, webhook confirmation)
- Pitfall 7: GDPR compliance violations (DPA signed, data export functionality, proper consent)

**Tech stack:** Stripe (stripe, @stripe/stripe-js, @stripe/react-stripe-js), react-hot-toast for payment notifications, PDF generation library

**Research flag:** NEEDS RESEARCH — Stripe webhook handling and payment failure recovery patterns need validation, review Stripe docs during phase planning

### Phase 5: Advanced Differentiators
**Rationale:** After MVP proven and monetization working, add sophisticated features that justify premium pricing versus free alternatives. These are the "worth paying for" features.

**Delivers:**
- Battery storage sizing with ROI analysis
- EV charging integration (extra panels, charging cost savings)
- Time-of-use rate optimization (battery arbitrage value)
- Danish tax scenario modeling (18.3K DKK home improvement deduction, 2026 electricity tax reduction)

**Addresses features:**
- Battery storage sizing (top differentiator)
- EV charging integration (top differentiator)
- Time-of-use optimization (differentiator)
- Danish tax modeling (differentiator)

**Avoids pitfalls:**
- All new calculations include transparency
- Tax rates parameterized with update schedules
- Battery/EV calculations validated against industry benchmarks

**Tech stack:** Complex financial modeling, potentially background jobs if calculations timeout

**Research flag:** NEEDS RESEARCH — Battery economics and EV charging optimization require domain-specific research, Danish tax law validation needed

### Phase Ordering Rationale

1. **Trust before monetization**: Phases 1-2 establish calculation accuracy while tool is free/low-risk. A broken calculator with perfect payments is worthless.

2. **Data migration before authentication**: Phase 3 must design anonymous-to-authenticated migration from the start. Retrofitting data preservation after auth is built = guaranteed data loss.

3. **Value demonstration before paywall**: Users complete full calculations (Phase 1-2) and experience scenario saving (Phase 3) before encountering payment (Phase 4). Research shows paywall placement is critical for one-time purchase products.

4. **Foundation before differentiation**: Table stakes features (Phases 1-2) make tool usable; differentiators (Phase 5) make it worth paying for. Building differentiators first = sophisticated tool nobody trusts.

5. **Architecture dependencies**: Scenario persistence (Phase 3) required for scenario comparison (Phase 4). Payment gates (Phase 4) required for premium features (Phase 5). Authentication (Phase 3) required for payments (Phase 4).

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Authentication)**: NextAuth v4 → Auth.js v5 migration complexity, cookie session preservation, documentation review needed
- **Phase 4 (Payments)**: Stripe webhook reliability patterns, payment failure recovery implementation details, GDPR/Danish legal compliance verification
- **Phase 5 (Advanced Features)**: Battery economics domain research (self-sufficiency %, arbitrage opportunities), EV charging optimization algorithms, Danish tax law validation for 2026-2027 changes

**Phases with standard patterns (skip research):**
- **Phase 1 (Formula Migration)**: Excel to TypeScript migration well-documented, Decimal type usage established pattern
- **Phase 2 (Calculator Enhancement)**: Database modeling and chart rendering standard Next.js patterns, PVGIS API well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Auth.js v5, Stripe, TanStack Query, shadcn/ui Charts are industry standards with extensive Next.js 14 documentation. Verified migration guides exist for NextAuth v4 → v5. Prisma v7 upgrade recommended but optional. |
| Features | MEDIUM | Table stakes features (solar yield, payback, panel comparison) are well-established in domain with clear examples (PVGIS, EnergySage). Differentiators (battery sizing, EV integration) are hypothesis-based on market trends but need user validation. Pricing point (DKK 299-499) uncertain. |
| Architecture | HIGH | Next.js App Router patterns (Server Components, Server Actions, two-tier auth, DAL) are official recommendations with extensive real-world examples. Scenario-as-entity pattern proven in financial modeling tools. |
| Pitfalls | HIGH | Calculation errors, payment failure recovery, GDPR compliance, and auth security are documented anti-patterns with verified solutions. Data migration patterns proven in user migration research. Trust-building requirements validated by financial calculator studies. |

**Overall confidence:** HIGH

### Gaps to Address

Areas where research was inconclusive or needs validation during implementation:

- **Danish tax law specifics**: Home improvement deduction (18.3K DKK cap) and electricity tax reduction (2026-2027) need legal verification. Research found news articles but not official tax authority documentation. Validate with Danish accountant or Skat.dk during Phase 5 planning.

- **Battery sizing algorithms**: Free calculators don't provide battery ROI analysis, so no established patterns to follow. Will need domain expert review or partnership with battery manufacturer for accurate degradation curves, charge/discharge efficiency, and cycle life modeling during Phase 5.

- **EV charging optimization**: Research found consumer-facing calculators but not technical implementation details for panel sizing with EV load profiles. May need EV manufacturer data or standardized consumption databases during Phase 5.

- **Pricing validation**: Research compared Stripe vs Paddle but didn't validate specific price point (DKK 299 vs 499 vs 699). A/B testing or user surveys needed after MVP launch.

- **Danish market adoption patterns**: Research validated that existing tools are US-focused, but didn't quantify Danish homeowner willingness to pay for premium calculator. Beta testing with target users essential.

## Sources

### Stack Research (HIGH confidence)
- Auth.js v5 Migration Guide (official docs)
- Stripe + Next.js App Router Integration Guides (2025+)
- TanStack Query v5 Server Rendering docs (official)
- shadcn/ui Charts documentation (official)
- Prisma 7.0 Changelog (official)
- Vercel Postgres vs Supabase comparisons (multiple sources)

### Feature Research (MEDIUM confidence)
- PVGIS EU Solar Calculator (primary data source)
- EnergySage, NREL PVWatts, Google Sunroof (competitor analysis)
- EcoRay Denmark solar production calculator (Danish market specifics)
- Denmark electricity tax 2026 (The Local DK, MoneySavvy DK news articles)
- Financial planning software comparisons (Bankrate, SmartAsset)
- EV charging calculator examples (EnergyPal, Paradise Solar, Clean Energy Reviews)

### Architecture Research (HIGH confidence)
- Next.js Authentication Guide (official)
- WorkOS: Top 5 Authentication Solutions for Next.js 2026
- Stripe Payment System Design (Orb, Stripe official docs)
- Prisma with Next.js Guide (official)
- React useOptimistic Hook (official React docs)
- Financial modeling software architecture (Fathom, CFO Club)

### Pitfalls Research (HIGH confidence)
- Financial calculator trust studies (ResearchGate, PMC)
- Black box transparency research (MDPI Sensors journal)
- JavaScript rounding errors in financial applications
- Stripe payment failure recovery docs (official)
- NextAuth.js security documentation (official)
- GDPR compliance guides 2026 (SecurePrivacy, GDPR Local)
- User migration patterns (FusionAuth)
- Paywall placement optimization (RevenueCat)

---
*Research completed: 2026-01-28*
*Ready for roadmap: yes*
