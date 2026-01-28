# Roadmap: Solar Purchase Decision Calculator

## Overview

This roadmap transforms a functional prototype into a premium solar decision tool for Danish homeowners. The journey prioritizes trust establishment through calculation accuracy (Phases 1-2), adds user accounts and data persistence (Phase 3), enables monetization (Phase 4), delivers premium differentiators (Phase 5), provides professional reporting (Phase 6), and finishes with localized polish (Phase 7). Every phase builds on proven foundations before adding complexity.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Core Calculations** - Accurate financial analysis engine
- [ ] **Phase 2: Panel Database & Enhanced Analytics** - Product comparison and projections
- [ ] **Phase 3: Authentication & Scenario Management** - User accounts and data persistence
- [ ] **Phase 4: Payment & Premium Gating** - Monetization with GDPR compliance
- [ ] **Phase 5: Advanced Differentiators** - Battery sizing and EV integration
- [ ] **Phase 6: Export & Reporting** - Professional PDF generation
- [ ] **Phase 7: Polish & Localization** - Danish UX refinement and wizard

## Phase Details

### Phase 1: Foundation & Core Calculations
**Goal**: Users receive accurate, transparent financial calculations for solar installation decisions
**Depends on**: Nothing (first phase)
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07, CALC-08, CALC-09, CALC-10, FIN-01, FIN-02, FIN-04, FIN-05, FIN-06, DATA-01, DATA-02, DATA-03, DATA-05, UX-06
**Success Criteria** (what must be TRUE):
  1. User can input location and roof details (area, orientation, tilt) and receive solar yield estimate
  2. User sees payback calculation with transparent cost breakdown (panels, inverter, installation, VAT)
  3. System shows 25-year financial projection with inflation adjustment and all assumptions documented
  4. All calculations use Decimal type (financial accuracy), and user can see "how we calculated this" for major results
  5. Calculator provides instant feedback with debounced persistence (no UI lag)
**Plans**: 7 plans in 4 waves

Plans:
- [ ] 01-01-PLAN.md — Database setup with PostgreSQL + Decimal schema
- [ ] 01-02-PLAN.md — Core calculation modules (TDD): setupPricing, payback
- [ ] 01-03-PLAN.md — 25-year projection + tax scenarios (TDD)
- [ ] 01-04-PLAN.md — API routes + serialization + PVGIS integration
- [ ] 01-05-PLAN.md — Input UI (tabbed calculator interface)
- [ ] 01-06-PLAN.md — Output UI (summary cards, charts, breakdowns)
- [ ] 01-07-PLAN.md — Integration + methodology panel + verification

### Phase 2: Panel Database & Enhanced Analytics
**Goal**: Users can compare specific solar panel products and see realistic long-term performance
**Depends on**: Phase 1 (calculations must be accurate first)
**Requirements**: PANEL-01, PANEL-02, PANEL-03, PANEL-04, PANEL-05, PANEL-06, PANEL-07, FIN-03
**Success Criteria** (what must be TRUE):
  1. User can browse and filter 10+ solar panel models by wattage, efficiency, and price
  2. User can compare 2-3 panels side-by-side with warranty and degradation details
  3. System shows 25-year degradation curve (0.5%/year) for selected panels
  4. User can compare cash purchase vs financing scenarios with total cost of ownership
  5. Panel database is admin-manageable (not hardcoded in application)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD during planning

### Phase 3: Authentication & Scenario Management
**Goal**: Users can create accounts, save scenarios, and preserve data from free to paid transition
**Depends on**: Phase 2 (core calculator features complete)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, SCEN-01, SCEN-02, SCEN-03, SCEN-04, SCEN-05, SCEN-06, SCEN-07, SCEN-08, DATA-04, UX-04
**Success Criteria** (what must be TRUE):
  1. User can create account with email verification and log in/out from any page
  2. User can save calculation as named scenario and load previously saved scenarios
  3. User can compare up to 3 scenarios side-by-side with key differences highlighted
  4. User's localStorage data migrates to account on signup (no data loss)
  5. User sees dashboard with all saved scenarios and key metrics
**Plans**: TBD

Plans:
- [ ] 03-01: TBD during planning

### Phase 4: Payment & Premium Gating
**Goal**: Users can purchase one-time access and experience premium features with GDPR compliance
**Depends on**: Phase 3 (scenarios must be savable before gating)
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, UX-08
**Success Criteria** (what must be TRUE):
  1. User can purchase one-time access via Stripe Checkout with payment confirmation
  2. Payment status is verified via webhook (not just client response) before granting access
  3. Free users can create 2-3 scenarios before seeing paywall (value demonstrated first)
  4. Payment failures show specific, actionable error messages (card expired, insufficient funds, etc.)
  5. GDPR compliance implemented (DPA with Stripe, data export functionality, equal cookie consent)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during planning

### Phase 5: Advanced Differentiators
**Goal**: Users can analyze battery storage and EV charging scenarios that justify premium pricing
**Depends on**: Phase 4 (payment must work before premium features)
**Requirements**: BAT-01, BAT-02, BAT-03, BAT-04, BAT-05, EV-01, EV-02, EV-03, EV-04, EV-05
**Success Criteria** (what must be TRUE):
  1. User can input battery preference and receive capacity recommendation based on consumption patterns
  2. System shows battery ROI with payback time vs no-battery scenario
  3. User can compare different battery capacities (5kWh, 10kWh, 15kWh) with time-of-use rates
  4. User can input EV ownership and see optimal charging windows based on electricity prices
  5. EV charging cost impact is integrated into payback calculations and panel sizing recommendations
**Plans**: TBD

Plans:
- [ ] 05-01: TBD during planning

### Phase 6: Export & Reporting
**Goal**: Users can generate professional PDF reports for installers, banks, and decision-making
**Depends on**: Phase 5 (all calculation features complete)
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04, EXP-05
**Success Criteria** (what must be TRUE):
  1. User can export scenario as PDF with professional formatting
  2. PDF includes all calculations with methodology notes and formula transparency
  3. PDF includes chart visualizations (production, costs, payback, 25-year projection)
  4. User can export scenario data in structured format suitable for installer quotes
  5. PDF export works for all scenario types (with/without battery, with/without EV)
**Plans**: TBD

Plans:
- [ ] 06-01: TBD during planning

### Phase 7: Polish & Localization
**Goal**: Danish homeowners experience a polished, professional financial tool in their language
**Depends on**: Phase 6 (all features complete)
**Requirements**: UX-01, UX-02, UX-03, UX-05, UX-07, LOC-01, LOC-02, LOC-03, LOC-04, LOC-05
**Success Criteria** (what must be TRUE):
  1. Guided wizard walks new users through initial setup (location, roof, usage, EV status)
  2. After wizard, users see detailed calculator view with all inputs accessible and tooltips
  3. UI has professional financial tool aesthetic (Stripe-like polish)
  4. All text is in Danish with DKK currency, DD-MM-YYYY dates, and Danish examples
  5. Help documentation explains Danish-specific features (elafgift, tax deductions)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Core Calculations | 0/7 | Planned | - |
| 2. Panel Database & Enhanced Analytics | 0/TBD | Not started | - |
| 3. Authentication & Scenario Management | 0/TBD | Not started | - |
| 4. Payment & Premium Gating | 0/TBD | Not started | - |
| 5. Advanced Differentiators | 0/TBD | Not started | - |
| 6. Export & Reporting | 0/TBD | Not started | - |
| 7. Polish & Localization | 0/TBD | Not started | - |
