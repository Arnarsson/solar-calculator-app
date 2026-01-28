# Feature Research

**Domain:** Premium Solar Purchase Decision Calculator for Danish Market
**Researched:** 2026-01-28
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Location-based solar yield calculation | Standard in all modern solar calculators. Users expect accurate output based on their specific location's sunlight | Medium | Denmark-specific: Use EU PVGIS data for accurate irradiance. Must account for Danish latitude (55-57°N) affecting panel angles |
| Roof assessment & orientation | Users need to know how many panels fit on their roof and understand azimuth/tilt impact on efficiency | Medium | Could start with manual input (area, direction, tilt) vs. automated 3D modeling |
| Electricity cost input | Required to calculate savings. Danish users pay ~2.5-3 DKK/kWh with varying tariffs | Low | Critical: Denmark reduced electricity tax to 0.8 øre/kWh in 2026, significantly impacting calculations |
| Total system cost calculation | Users making 100K+ DKK decisions need clear upfront cost breakdown (panels, inverter, installation) | Low | Must be transparent about what's included vs. additional costs |
| Payback period calculation | Table stakes for any financial decision tool. Users expect simple "years to break even" metric | Medium | More complex with Danish net metering changes and reduced electricity tax |
| Annual savings estimate | Core value proposition - how much money saved per year | Medium | Must account for self-consumption vs. grid export rates |
| Panel specification comparison | Users need to compare different panel types (monocrystalline vs. polycrystalline, wattage options) | Medium | Include efficiency ratings, warranty periods, degradation rates |
| System size recommendation | Calculator should suggest optimal kWp size based on consumption and roof space | Medium | Balance between covering consumption and maximizing ROI |

### Differentiators (Why Pay vs. Free Alternatives)

Features that set product apart and justify premium one-time purchase.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Battery storage sizing & ROI | Free calculators ignore batteries. For 100K+ DKK decisions, battery economics are critical | High | Must model: battery capacity options, self-sufficiency %, arbitrage opportunities with time-of-use rates |
| EV charging integration | Danish EV adoption is high. EV owners need to see: extra panels needed, charging cost savings, sizing for future EV purchase | High | Calculate kWh needed per km driven, optimize panel array for EV + house consumption |
| Multi-scenario comparison | Save & compare multiple configurations side-by-side (different panel counts, with/without battery, with/without EV) | Medium | This is a premium feature rarely found in free tools - justifies purchase price |
| Danish tax scenario modeling | Denmark-specific: model home improvement deduction (DKK 18,300 cap), removed electricity tax (2026-2027), VAT implications | High | Critical differentiator for Danish market. Free calculators use US/generic tax assumptions |
| Time-of-use billing optimization | Calculate value of batteries for buying cheap off-peak power and using during expensive peak hours | High | Free calculators typically use flat rate assumptions. Premium users expect TOU optimization |
| Detailed financial breakdown | Month-by-month cash flow, cumulative savings over 25 years, sensitivity analysis (if electricity prices rise 3%/5%/7%) | Medium | Premium users want to see the math, not just a headline number |
| Degradation modeling | Panel efficiency drops ~0.5%/year. Model realistic long-term output, not just Year 1 | Medium | Builds trust - shows we're not overselling |
| Export income calculation | Danish net metering pays different rates for exported power. Model self-consumption ratio and export revenue realistically | Medium | Free tools often ignore or oversimplify grid export economics |
| Data export & PDF reports | Professional report they can show to installers, banks (for financing), or spouse for decision-making | Low | Expected for premium tool - users want to save their work |
| Weather data integration | Use historical weather data (cloud cover, actual sunlight hours) not just theoretical solar radiation | Medium | EcoRay Denmark does this with AI - shows we're using real data not assumptions |

### Premium Justification Features

Features that specifically address "why pay when free alternatives exist?"

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Installer quote integration | After calculation, connect with verified Danish solar installers for real quotes | Medium | Potential revenue share model. Adds tangible next-step value |
| Financing scenario modeling | Compare: pay cash vs. green loan vs. home equity. Show total cost of financing | Medium | For 100K+ DKK decisions, financing options matter significantly |
| Maintenance cost inclusion | Free tools ignore ongoing costs. Premium tool shows: inverter replacement (~Year 12), cleaning, monitoring | Low | Builds trust by showing realistic total cost of ownership |
| Warranty comparison | Compare manufacturer warranties across panel brands (25-year performance, 10-15 year product) | Low | Helps users choose quality panels, not just cheapest |
| Grid tariff database | Maintain updated Danish utility rate database (fixed rates, time-of-use, demand charges) | High | Major differentiator - free tools use generic rates. Accuracy builds trust |
| Inflation-adjusted projections | Show savings in "today's DKK" accounting for inflation over 25 years | Medium | Premium users want sophisticated analysis |
| Insurance cost inclusion | Solar panels increase home insurance slightly. Include in TCO for accuracy | Low | Small detail that builds trust |
| Space heating offset modeling | If user has electric heat pump, show additional value of solar for heating season | Medium | Denmark-relevant: heating is major electricity use |

### Anti-Features (Deliberately NOT Build)

Features that seem good but create problems.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Real-time satellite roof imaging with auto-detection | Competitors like Google Sunroof have this. Users expect automated roof analysis | Privacy concerns in Denmark (GDPR). Requires licensing expensive satellite/LIDAR data. Google can absorb cost, we can't | Manual input with clear guidance: "Measure your south-facing roof area" with visual examples. Most users know their roof size |
| Automatic address lookup for electricity rates | Users want to just enter address and have it auto-populate their utility rate | Danish address data requires expensive API subscriptions. Maintenance burden as rates change quarterly | Dropdown of major Danish utilities + manual rate entry with link to "Find your rate on your bill" |
| Live energy monitoring integration | "Connect to my smart meter to see real-time production" | Requires integration with multiple smart meter brands. Complex authentication. Ongoing API maintenance | Use historical consumption from electricity bill. Simpler, works for everyone |
| Social sharing / community features | "Compare my system with neighbors" | Creates comparison anxiety. Users making 100K decisions want privacy, not gamification | Private scenarios only. Can export PDF to share manually if desired |
| Subscription model with ongoing updates | "Pay monthly for updated solar prices and incentives" | Users making one-time purchase decision don't want ongoing costs. Creates abandonment | One-time purchase with 12 months of minor updates included. Then new major version if market changes dramatically |
| Mobile app | "I want this on my phone while talking to installers" | Development cost doesn't justify for one-time purchase decision tool. Mobile web is sufficient | Responsive web design that works perfectly on mobile. Progressive Web App if needed |
| AI chatbot for recommendations | "Ask questions and get personalized advice" | Risk of hallucinations giving bad financial advice. Liability concern for 100K+ decisions | Clear, deterministic calculations with explanatory tooltips. Link to human advisors if needed |
| Cryptocurrency payment option | "Pay with Bitcoin/Ethereum" | Adds complexity for minimal user demand. Exchange rate volatility during checkout | Traditional payment methods: credit card, MobilePay (Danish standard), bank transfer |

## Feature Dependencies

```
Core Calculation Engine
    ├──requires──> Danish Solar Irradiance Data (PVGIS)
    ├──requires──> Panel Specification Database
    └──requires──> Electricity Rate Database

Battery Sizing
    ├──requires──> Core Calculation Engine (to know base consumption)
    ├──requires──> Time-of-Use Rate Data
    └──enhances──> EV Charging Integration (battery can charge EV)

EV Charging Integration
    ├──requires──> Core Calculation Engine
    ├──enhances──> Battery Sizing (shows battery value for EV charging)
    └──requires──> EV Consumption Database (kWh/100km by model)

Multi-Scenario Comparison
    ├──requires──> Core Calculation Engine
    ├──requires──> Save/Load Infrastructure (local storage or account system)
    └──enhances──> All Premium Features (comparing scenarios is the key UX)

Danish Tax Modeling
    ├──requires──> Core Calculation Engine (to know system cost)
    └──requires──> Tax Rule Database (updated annually)

PDF Export
    ├──requires──> All calculation features to be complete
    └──conflict──> Cannot export before calculations finish

Installer Integration
    ├──requires──> Completed calculation with system specifications
    └──optional──> User account (to track leads)
```

### Dependency Notes

- **Core Calculation Engine must be rock-solid first**: All premium features depend on accurate basic calculations. Poor accuracy in core = no amount of premium features will save the product
- **Battery Sizing enhances EV Charging and vice versa**: These features are synergistic. Implementing both together provides more value than sum of parts
- **Multi-Scenario Comparison is the key premium UX**: This is what justifies the purchase price - ability to see side-by-side comparisons that free tools don't offer
- **Danish Tax Modeling is table stakes for Danish market**: Generic solar calculator + Danish tax layer = minimum viable Danish product
- **PDF Export is final validation**: Users want to print/share results. This makes the tool feel "complete" and professional

## MVP Definition

### Launch With (v1)

Minimum viable product to validate that Danish homeowners will pay for premium solar calculator.

- [ ] **Core solar yield calculation** - Location-based (manual lat/long or city lookup), roof area/orientation input, panel selection, annual kWh output
- [ ] **Danish electricity cost input** - Manual entry of DKK/kWh rate with 2026 tax reduction accounted for (0.8 øre/kWh)
- [ ] **Payback calculation** - Simple: (system cost) / (annual savings) = years
- [ ] **Annual savings estimate** - Based on self-consumption assumption (e.g., 30% of production)
- [ ] **Panel comparison** - 3-5 common panel types with specs (monocrystalline 400-450W range)
- [ ] **System cost breakdown** - Transparent: panels + inverter + installation + VAT
- [ ] **Save one scenario** - Browser local storage, no account needed
- [ ] **Danish UI** - Danish language interface, DKK currency, Danish examples

**Rationale**: Tests core value proposition - can we provide accurate, Denmark-specific calculations that homeowners trust enough to base 100K+ DKK decisions on?

### Add After Validation (v1.x)

Features to add once core is working and users validate they'll pay.

- [ ] **Battery storage sizing (v1.1)** - Trigger: If 40%+ of users ask "what about batteries?" during beta - Priority HIGH
- [ ] **Multi-scenario comparison (v1.2)** - Trigger: If users manually re-run calculator multiple times to compare - Priority HIGH
- [ ] **EV charging integration (v1.2)** - Trigger: If survey shows 50%+ of users have or plan to buy EV - Priority HIGH
- [ ] **Time-of-use rate modeling (v1.3)** - Trigger: After battery feature launch, to show battery ROI - Priority MEDIUM
- [ ] **PDF export (v1.4)** - Trigger: If users request "how do I save this?" in support - Priority HIGH
- [ ] **Detailed financial breakdown (v1.3)** - Trigger: If users ask "show me year-by-year" - Priority MEDIUM
- [ ] **Danish tax scenario modeling (v1.5)** - Trigger: If accountants/advisors recommend our tool, they'll need this - Priority LOW (complex, niche audience)

**Prioritization logic**: Battery, EV, and scenario comparison are differentiators vs. free tools. Add these quickly if users validate they'd pay. Tax modeling is nice-to-have for sophisticated users but not MVP.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Installer marketplace** - Why defer: Revenue share model requires B2B partnerships, legal agreements. V1 should prove B2C value first
- [ ] **Financing scenario modeling** - Why defer: Requires partnership with Danish banks for accurate loan rates. Complex, niche feature
- [ ] **Heat pump integration** - Why defer: Smaller market than EV charging. Test with EV first to validate "integration" features
- [ ] **3D roof modeling** - Why defer: Nice-to-have visual but doesn't improve calculation accuracy. Expensive to build
- [ ] **Historical weather data integration** - Why defer: PVGIS already uses historical data. Marginal improvement over what we get free
- [ ] **Community benchmarking** - Why defer: Requires critical mass of users. V1 focus is individual calculations
- [ ] **API for B2B** - Why defer: Until we have enough B2C users that installers want to integrate our calculator

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Core solar yield calculation | HIGH | MEDIUM | P1 |
| Danish electricity cost input | HIGH | LOW | P1 |
| Payback calculation | HIGH | LOW | P1 |
| Panel comparison | HIGH | MEDIUM | P1 |
| Battery storage sizing | HIGH | HIGH | P2 |
| EV charging integration | HIGH | HIGH | P2 |
| Multi-scenario comparison | HIGH | MEDIUM | P2 |
| Danish tax modeling | MEDIUM | HIGH | P2 |
| Time-of-use optimization | MEDIUM | HIGH | P2 |
| PDF export | MEDIUM | LOW | P2 |
| Detailed financial breakdown | MEDIUM | MEDIUM | P2 |
| Installer marketplace | MEDIUM | HIGH | P3 |
| Financing scenarios | LOW | HIGH | P3 |
| 3D roof modeling | LOW | HIGH | P3 |
| Heat pump integration | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch - core value proposition
- P2: Should have soon - differentiators vs free tools
- P3: Nice to have - future revenue expansion

## Competitor Feature Analysis

| Feature | PVGIS (Free) | EnergySage (US) | Google Sunroof (Free) | Our Approach |
|---------|--------------|-----------------|----------------------|--------------|
| Solar yield calculation | Excellent EU data | US-focused | Good but US-only | Use PVGIS API - excellent for Denmark |
| Roof assessment | Manual input only | Manual input | Automated 3D from satellite | Manual input (v1), practical guidance |
| Battery sizing | None | Basic | None | Detailed ROI analysis with TOU rates |
| EV charging | None | None | None | Integrated into system sizing |
| Cost calculation | None (yield only) | Generic US costs | Generic US costs | Denmark-specific costs, installer rates |
| Tax scenarios | None | US federal/state | US tax credit | Danish tax deduction, 2026 electricity tax |
| Multi-scenario compare | None | None | None | Side-by-side comparison - key differentiator |
| Danish specificity | Data only | None | None | Full Danish market focus |
| Export format | CSV data | Basic report | Email summary | Professional PDF with calculations |

**Our competitive advantage**: Existing tools are either (1) excellent data but no financial analysis (PVGIS), (2) US-market focused (EnergySage), or (3) free but generic (Google Sunroof). We combine PVGIS's excellent EU data with Denmark-specific financial modeling and premium features (battery, EV, scenarios) that free tools lack.

## Premium vs. Free Positioning

### What Free Tools Provide
- Basic solar yield calculation (PVGIS: excellent data, NREL PVWatts: US-focused)
- Simple cost/savings estimate (usually US market)
- Generic payback calculation
- No battery analysis
- No EV integration
- No scenario comparison
- No Danish tax modeling
- No time-of-use optimization

### Why Users Would Pay DKK 299-499 for Our Tool
1. **Danish market specificity**: Free tools use US tax assumptions and electricity rates. We model Danish reality (2026 electricity tax reduction, home improvement deduction, VAT)
2. **Battery economics clarity**: For 100K+ DKK decisions, users need to know if spending extra 50K on battery is worth it. Free tools ignore batteries entirely
3. **EV charging integration**: Danish EV ownership is growing. Free tools can't answer "should I size my array for my future EV?"
4. **Multi-scenario comparison**: Users want to see side-by-side: 12 panels vs. 16 panels, with battery vs. without, with EV vs. without. Free tools make you manually re-run everything
5. **Professional output**: PDF report they can show to spouse, bank, installer. Free tools give screen-only results
6. **Time-of-use optimization**: Show the value of batteries for arbitrage (charge cheap at night, use during expensive peak). Free tools use flat rates
7. **Trust through transparency**: Detailed methodology, degradation modeling, maintenance costs. Free tools hide assumptions

### Confidence Assessment
**MEDIUM confidence** because:
- **HIGH confidence** on table stakes features (well-established in solar calculator domain)
- **HIGH confidence** on Danish tax specificity being differentiator (unique to market)
- **MEDIUM confidence** on battery/EV features being worth premium (hypothesis based on market trends, needs user validation)
- **LOW confidence** on specific price point (DKK 299? 499? 699?) - needs market testing
- **MEDIUM confidence** on scenario comparison being killer feature (strong in financial planning tools per research, but untested in solar domain)

## Sources

### Solar Calculator Features & Market Research
- [EnergySage Solar Calculator 2026](https://www.energysage.com/solar/calculator/)
- [NREL PVWatts Calculator](https://pvwatts.nrel.gov/)
- [Wolf River Electric: Best Solar Calculators of 2025](https://wolfriverelectric.com/the-best-solar-calculators-of-2025-features-accuracy-compared/)
- [Google Project Sunroof](https://sunroof.withgoogle.com/)
- [Solar.com Solar Panel Cost Calculator](https://www.solar.com/learn/solar-calculator/)
- [SolarReviews Home Solar Calculator](https://www.solarreviews.com/solar-calculator)

### Premium Financial Tools vs Free
- [Bankrate: Best Financial Planning Software 2025](https://www.bankrate.com/investing/financial-advisors/best-financial-planning-software/)
- [SmartAsset: Financial Planning Software 2026](https://smartasset.com/financial-advisor/financial-planning-software)
- [Financial IT: How Financial Calculators Are Helpful](https://financialit.net/blog/financial/how-are-financial-calculators-helpful)
- [BestReviews: Best Financial Calculators](https://bestreviews.com/electronics/calculators/best-financial-calculators)

### EV Charging Integration
- [EnergyPal Solar EV Charging Calculator](https://energypal.com/best-electric-vehicles/calculator)
- [Paradise Solar Energy: EV Solar Power Calculator](https://www.paradisesolarenergy.com/ev-solar-power-calculator/)
- [Clean Energy Reviews: Solar and EV Charger Calculator](https://www.cleanenergyreviews.info/blog/solar-and-ev-charger-calculator)
- [Enphase: Charging EV with Solar](https://enphase.com/blog/ev-chargers/charging-your-ev-solar-panels-just-makes-sense)

### Denmark-Specific Research
- [PVGIS EU Solar Calculator](https://pvgis.com/en)
- [EcoRay Denmark Solar Production Calculator](https://ecoray.dk/en/articles/how-much-electricity-does-a-solar-panel-system-produce-in-denmark)
- [The Local DK: Denmark's Electricity Tax 2026](https://www.thelocal.dk/20251217/how-much-will-denmarks-new-minimum-electricity-tax-save-you-in-2026)
- [GridIO: End of Refund in Danish Market](https://www.gridio.io/blog/the-end-of-the-refund-in-danish-market)
- [MoneySavvy DK: Denmark Electricity Tax Cut 2026](https://moneysavvy.dk/news/2025/10/denmark-electricity-tax-cut-2026-2027/)

### Calculator Design & Trust
- [Nielsen Norman Group: 12 Design Recommendations for Calculator Tools](https://www.nngroup.com/articles/recommendations-calculator/)
- [Calconic: Solar Calculator Guide for Sellers](https://www.calconic.com/blog/solar-calculators)

---
*Feature research for: Premium Solar Purchase Decision Calculator (Danish Market)*
*Researched: 2026-01-28*
