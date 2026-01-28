# Requirements: Solar Purchase Decision Calculator

**Defined:** 2026-01-28
**Core Value:** Help homeowners make confident solar purchase decisions by providing accurate, personalized financial analysis that cuts through the complexity

## v1 Requirements

Requirements for initial launch as premium one-time purchase product.

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can log out from any page
- [ ] **AUTH-06**: Migrate existing NextAuth v4 to Auth.js v5 for App Router compatibility

### Payment

- [ ] **PAY-01**: User can purchase one-time access via Stripe Checkout
- [ ] **PAY-02**: Payment status is verified via webhook (not just API response)
- [ ] **PAY-03**: User sees payment confirmation with receipt
- [ ] **PAY-04**: Payment failures show specific, actionable error messages
- [ ] **PAY-05**: Free trial scenarios migrate to paid account without data loss
- [ ] **PAY-06**: GDPR-compliant data processing agreement with Stripe established

### Core Calculations

- [ ] **CALC-01**: User can input location (manual lat/long or city lookup) for solar irradiance data
- [ ] **CALC-02**: System calculates annual solar yield based on PVGIS data
- [ ] **CALC-03**: User can input roof area and orientation (azimuth, tilt)
- [ ] **CALC-04**: System calculates payback period (system cost / annual savings)
- [ ] **CALC-05**: System estimates annual DKK savings with self-consumption assumptions
- [ ] **CALC-06**: All calculations use Decimal type (not floating-point) for financial accuracy
- [ ] **CALC-07**: System cost breakdown shows transparent pricing (panels + inverter + installation + VAT)
- [ ] **CALC-08**: User can input current electricity rate in DKK/kWh
- [ ] **CALC-09**: Calculations account for 2026 Danish electricity tax reduction (0.8 øre/kWh)
- [ ] **CALC-10**: Port Excel calculation formulas with test suite comparing to original

### Panel Database

- [ ] **PANEL-01**: Database contains specifications for 10+ common solar panel models
- [ ] **PANEL-02**: User can compare panels by efficiency, cost, and warranty
- [ ] **PANEL-03**: Each panel shows degradation curve over 25 years
- [ ] **PANEL-04**: Database includes warranty comparison (performance and product warranties)
- [ ] **PANEL-05**: System calculates maintenance costs (inverter replacement, cleaning)
- [ ] **PANEL-06**: User can filter panels by wattage, efficiency, and price range
- [ ] **PANEL-07**: Panel database is admin-manageable (not hardcoded)

### Battery Sizing

- [ ] **BAT-01**: User can input whether they want battery storage
- [ ] **BAT-02**: System recommends battery capacity based on consumption patterns
- [ ] **BAT-03**: System calculates battery ROI with time-of-use rates
- [ ] **BAT-04**: Battery analysis shows payback time vs no-battery scenario
- [ ] **BAT-05**: User can compare different battery capacity options (5kWh, 10kWh, 15kWh)

### EV Integration

- [ ] **EV-01**: User can input if they own or plan to buy electric vehicle
- [ ] **EV-02**: User can select EV model from database (kWh/100km consumption)
- [ ] **EV-03**: System calculates additional electricity cost for EV charging
- [ ] **EV-04**: System shows optimal charging windows based on electricity prices
- [ ] **EV-05**: EV charging cost impact is integrated into payback calculations

### Financial Analysis

- [ ] **FIN-01**: System models Danish home improvement tax deduction (2026 rules)
- [ ] **FIN-02**: System shows 25-year projection with inflation adjustment
- [ ] **FIN-03**: User can compare cash purchase vs financing scenarios
- [ ] **FIN-04**: System calculates total cost of ownership including maintenance
- [ ] **FIN-05**: Financial breakdown shows year-by-year savings and costs
- [ ] **FIN-06**: All assumptions are documented and visible to user (transparency)

### Scenarios

- [ ] **SCEN-01**: User can save calculation as named scenario
- [ ] **SCEN-02**: User can load previously saved scenarios
- [ ] **SCEN-03**: User can compare up to 3 scenarios side-by-side
- [ ] **SCEN-04**: Scenario comparison shows key differences highlighted
- [ ] **SCEN-05**: Free users' localStorage data migrates to account on payment
- [ ] **SCEN-06**: User can edit existing scenarios
- [ ] **SCEN-07**: User can delete scenarios
- [ ] **SCEN-08**: Scenario saves all inputs + calculated outputs for auditability

### Export

- [ ] **EXP-01**: User can export scenario as PDF with professional formatting
- [ ] **EXP-02**: PDF includes all calculations with methodology notes
- [ ] **EXP-03**: PDF export shows formula transparency (how calculations work)
- [ ] **EXP-04**: User can export scenario data for installer quotes (structured format)
- [ ] **EXP-05**: PDF includes chart visualizations (production, costs, payback)

### User Experience

- [ ] **UX-01**: Guided wizard walks new users through initial setup
- [ ] **UX-02**: Wizard collects: location, roof details, usage, EV status
- [ ] **UX-03**: After wizard, users see detailed calculator view with all inputs accessible
- [ ] **UX-04**: Dashboard shows all saved scenarios with key metrics
- [ ] **UX-05**: UI has professional financial tool aesthetic (Stripe-like polish)
- [ ] **UX-06**: Calculator provides instant feedback with optimistic UI
- [ ] **UX-07**: All inputs have tooltips explaining what they affect
- [ ] **UX-08**: Paywall appears after value demonstration (accurate calculations seen first)

### Data & Performance

- [ ] **DATA-01**: Database setup on Vercel Postgres with Prisma ORM
- [ ] **DATA-02**: External API calls (PVGIS, electricity prices) are cached appropriately
- [ ] **DATA-03**: Calculation inputs are debounced (500ms) to prevent UI lag
- [ ] **DATA-04**: User data is GDPR-compliant with clear consent mechanisms
- [ ] **DATA-05**: Scenario data includes formula version for auditability

### Danish Localization

- [ ] **LOC-01**: UI is in Danish language (with English fallback)
- [ ] **LOC-02**: All currency displays use DKK
- [ ] **LOC-03**: Date formats follow Danish conventions (DD-MM-YYYY)
- [ ] **LOC-04**: Examples and defaults use Danish context (Copenhagen, typical Danish home)
- [ ] **LOC-05**: Help documentation explains Danish-specific features (elafgift, tax deductions)

## v2 Requirements

Deferred to future release after v1 validation.

### Installer Marketplace

- **INST-01**: User can request quotes from verified Danish installers
- **INST-02**: Installers receive structured scenario data for accurate quotes
- **INST-03**: Platform tracks installer response times and user ratings

### Advanced Features

- **ADV-01**: Heat pump integration (space heating cost offset)
- **ADV-02**: Historical weather data comparison (vs typical year)
- **ADV-03**: 3D roof visualization from satellite imagery
- **ADV-04**: Time-of-use rate optimization with hourly breakdowns
- **ADV-05**: API access for B2B customers (installers, consultants)

### Community Features

- **COM-01**: Anonymous benchmarking (compare to similar systems)
- **COM-02**: Regional average data (typical systems in user's area)

## Out of Scope

Explicitly excluded to maintain focus and avoid complexity.

| Feature | Reason |
|---------|--------|
| Real-time monitoring integration | This is a purchase decision tool, not post-installation monitoring. Users need this once, not ongoing. |
| Mobile native apps (iOS/Android) | Responsive web design sufficient for one-time purchase decision. Development cost doesn't justify for non-recurring revenue. |
| Automatic satellite roof imaging | Privacy concerns (GDPR), expensive data licensing. Manual input with guidance is sufficient and more accurate. |
| Social sharing / community comparison | Users making 100K+ DKK decisions want privacy, not gamification. Anti-pattern for financial tools. |
| AI chatbot for recommendations | Risk of hallucinations giving bad financial advice. Liability concern. Deterministic calculations more trustworthy. |
| Subscription pricing model | Users making one-time purchase decision don't want ongoing costs. Creates abandonment. One-time purchase aligns with use case. |
| Cryptocurrency payment | Minimal demand, adds complexity, exchange rate volatility during checkout creates poor UX. |
| Live smart meter integration | Complex authentication, multiple brands, ongoing API maintenance. Historical consumption from bills is simpler and sufficient. |
| Automatic address lookup for rates | Expensive API subscriptions for Danish address data. Dropdown + manual entry is acceptable. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| AUTH-05 | Phase 3 | Pending |
| AUTH-06 | Phase 3 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| PAY-04 | Phase 4 | Pending |
| PAY-05 | Phase 4 | Pending |
| PAY-06 | Phase 4 | Pending |
| CALC-01 | Phase 1 | Pending |
| CALC-02 | Phase 1 | Pending |
| CALC-03 | Phase 1 | Pending |
| CALC-04 | Phase 1 | Pending |
| CALC-05 | Phase 1 | Pending |
| CALC-06 | Phase 1 | Pending |
| CALC-07 | Phase 1 | Pending |
| CALC-08 | Phase 1 | Pending |
| CALC-09 | Phase 1 | Pending |
| CALC-10 | Phase 1 | Pending |
| PANEL-01 | Phase 2 | Pending |
| PANEL-02 | Phase 2 | Pending |
| PANEL-03 | Phase 2 | Pending |
| PANEL-04 | Phase 2 | Pending |
| PANEL-05 | Phase 2 | Pending |
| PANEL-06 | Phase 2 | Pending |
| PANEL-07 | Phase 2 | Pending |
| BAT-01 | Phase 5 | Pending |
| BAT-02 | Phase 5 | Pending |
| BAT-03 | Phase 5 | Pending |
| BAT-04 | Phase 5 | Pending |
| BAT-05 | Phase 5 | Pending |
| EV-01 | Phase 5 | Pending |
| EV-02 | Phase 5 | Pending |
| EV-03 | Phase 5 | Pending |
| EV-04 | Phase 5 | Pending |
| EV-05 | Phase 5 | Pending |
| FIN-01 | Phase 1 | Pending |
| FIN-02 | Phase 1 | Pending |
| FIN-03 | Phase 2 | Pending |
| FIN-04 | Phase 1 | Pending |
| FIN-05 | Phase 1 | Pending |
| FIN-06 | Phase 1 | Pending |
| SCEN-01 | Phase 3 | Pending |
| SCEN-02 | Phase 3 | Pending |
| SCEN-03 | Phase 3 | Pending |
| SCEN-04 | Phase 3 | Pending |
| SCEN-05 | Phase 3 | Pending |
| SCEN-06 | Phase 3 | Pending |
| SCEN-07 | Phase 3 | Pending |
| SCEN-08 | Phase 3 | Pending |
| EXP-01 | Phase 6 | Pending |
| EXP-02 | Phase 6 | Pending |
| EXP-03 | Phase 6 | Pending |
| EXP-04 | Phase 6 | Pending |
| EXP-05 | Phase 6 | Pending |
| UX-01 | Phase 7 | Pending |
| UX-02 | Phase 7 | Pending |
| UX-03 | Phase 7 | Pending |
| UX-04 | Phase 3 | Pending |
| UX-05 | Phase 7 | Pending |
| UX-06 | Phase 1 | Pending |
| UX-07 | Phase 7 | Pending |
| UX-08 | Phase 4 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 3 | Pending |
| DATA-05 | Phase 1 | Pending |
| LOC-01 | Phase 7 | Pending |
| LOC-02 | Phase 7 | Pending |
| LOC-03 | Phase 7 | Pending |
| LOC-04 | Phase 7 | Pending |
| LOC-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 76 total
- Mapped to phases: 76/76 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after roadmap creation*
