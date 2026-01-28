# Phase 1 Context: Foundation & Core Calculations

**Phase Goal**: Users receive accurate, transparent financial calculations for solar installation decisions

**Created**: 2026-01-28
**Discussion completed**: 2026-01-28

## Implementation Decisions

### Calculation Presentation

**Display Strategy**: Triple-layer approach
- **Summary cards**: Quick overview at top (payback period, annual savings, total cost)
- **Integrated breakdowns**: Detailed cost components visible in main view
- **Progressive disclosure**: Advanced features (tax scenarios, financing) behind expand/tabs

**Transparency & Formula Visibility**: Multi-touchpoint trust building
- **Inline methodology notes**: Show calculation steps directly under results (e.g., "Payback = System Cost ÷ Annual Savings")
- **Expandable details**: Full formulas behind "Show calculation" buttons for verification
- **Dedicated assumptions panel**: Separate section documenting all assumptions (degradation rate 0.5%/year, inflation rate, electricity price trends)

**Real-time Feedback**: Hybrid approach
- **Live preview**: Summary cards update as user types (500ms debounce per DATA-03)
- **Explicit triggers**: Detailed breakdowns and charts update on user action (click "Recalculate" or tab change)
- Balances responsiveness with deliberate decision-making feel

**25-Year Projection**: Chart-first presentation
- Lead with line chart visualization (cumulative savings over time)
- Table view available via toggle for year-by-year verification
- Default view shows chart, power users can expand table

### Input Collection Flow

**Organization**: Tabbed sections with progressive disclosure
- **Tab 1 - Essential**: Location + roof basics (first things needed)
- **Tab 2 - Energy**: Electricity rate, consumption patterns
- **Tab 3 - System**: Panel selection, costs, configuration
- **Tab 4 - Advanced**: Tax scenarios, financing options (Phase 1 foundation, full features Phase 2+)

Note: All Phase 1 features are premium (behind Phase 4 paywall)

**Location Input**: Address search with map
- User types Danish address (autocomplete)
- Map shows location for visual confirmation
- Geocode to lat/long for PVGIS API
- Need geocoding service (evaluate during planning: Google Maps, Mapbox, or free alternative)

**Roof Detail Collection**: Research-first approach
- **Phase 1 Research Task**: Investigate Danish BBR (Bygnings- og Boligregistret) or similar building data sources
- **Goal**: Auto-populate roof azimuth (orientation) and tilt angle from building registry data
- **Fallback**: If BBR doesn't provide data, implement visual helpers:
  - Interactive compass for azimuth with satellite overlay
  - Tilt slider with roof diagram
  - Smart defaults (180° south-facing, 45° tilt)
- **UX Priority**: Non-technical homeowners shouldn't need to know what "azimuth" means

**System Cost Input**: Hybrid defaults + override
- Show database-driven estimated breakdown based on system size:
  - Panel costs
  - Inverter cost
  - Installation labor
  - VAT (25%)
- User can override any component if they have actual quotes
- Supports both early research (no quotes yet) and final decision (comparing installer proposals)

### Excel Formula Migration

**Scope**: Port ALL sheets in Phase 1
- "Setup & Price"
- "Yearly Payback Overview"
- "CO2 Savings"
- "No Tax Scenario" (plus with-tax scenarios)
- "Production vs Consumption Chart"

Complete formula coverage establishes calculation accuracy foundation before any features.

**Test Strategy**: Comprehensive three-layer approach
1. **Snapshot tests**: Capture known inputs/outputs from Excel, verify code produces identical results
2. **Property-based tests**: Define mathematical properties (e.g., "payback decreases as electricity rate increases"), test with many input combinations
3. **Parallel validation**: Build test harness that runs calculations in both Excel (via automation) and our code, comparing outputs during development

Critical for Phase 1 success: Calculations must be bulletproof for 100K+ DKK decisions.

**Decimal Library**: Decimal.js
- Handles all Excel mathematical operations (powers, roots, logarithms, compounding)
- Arbitrary precision - matches Excel exactly
- Battle-tested (170k+ weekly downloads)
- TypeScript support
- Necessary for complex formulas across all sheets

**Code Structure**: Mirror Excel structure (1:1 mapping)
```
lib/calculations/
├── setupPricing.ts         (Setup & Price sheet)
├── payback.ts              (Yearly Payback Overview sheet)
├── co2Savings.ts           (CO2 Savings sheet)
├── taxScenarios.ts         (No Tax Scenario + with-tax variations)
└── production.ts           (Production vs Consumption Chart)
```

Each module:
- Maps to specific Excel sheet for traceability
- Has dedicated test file with snapshots from that sheet
- Easy to verify: "Does payback.ts match Yearly Payback Overview?"
- Maintainable when Excel sheets are updated

### Data Visualization

**Chart Library**: Recharts via shadcn/ui
- Already integrated in codebase
- Matches existing design system (professional aesthetic)
- Handles all Phase 1 needs: line charts (projections), bar charts (year-by-year), area charts (production vs consumption)
- Good performance for 25-year datasets
- Don't over-engineer - use what works

**Inflation Adjustment Visualization**: Dual-line comparison
- Show two lines on 25-year projection chart:
  - **Nominal savings**: Actual DKK without inflation adjustment (what most users care about)
  - **Real savings**: Inflation-adjusted to today's value (for sophisticated users)
- Toggle between views or show both with distinct styling
- Transparency about inflation impact on long-term value

**Production vs Consumption Chart**: Stacked area chart
- Three layers:
  - **Green area**: Solar production (kWh generated)
  - **Blue area**: Consumption (kWh used)
  - **Highlighted overlap/gap**: Self-consumption vs grid dependency
- Monthly granularity (not just annual):
  - Shows seasonal variation
  - Winter: low production, high consumption (grid dependency)
  - Summer: surplus production (selling to grid)
- Immediate visual understanding of energy independence

**Interactive Features**: Clarity over flashiness
- **Hover tooltips**: Exact values on hover (Year 15: 45,230 DKK saved, 12,500 kWh produced)
- **Timeline scrubbing**: Click/drag to highlight year ranges (compare Year 1-5 vs Year 20-25)
- **Export data**: CSV download for power users who want to analyze further
- No complex zooming/panning/animations - professional financial tool aesthetic

## Research Tasks for Phase 1 Planning

1. **Danish Building Data API Research**
   - Investigate BBR (Bygnings- og Boligregistret) API access
   - Determine if roof orientation (azimuth) and tilt data available
   - Assess cost, GDPR compliance, reliability
   - **Impact**: Could eliminate major UX friction (manual roof detail entry)
   - **Fallback**: Visual helpers + smart defaults if not feasible

2. **Geocoding Service Selection**
   - Evaluate: Google Maps API, Mapbox, OpenStreetMap/Nominatim
   - Consider: Cost, Danish address coverage, rate limits
   - Need: Address → lat/long for PVGIS integration

## Key Architectural Notes

**Calculation Accuracy Priority**: Phase 1 establishes trust through bulletproof calculations before any other features. Research showed users making 100K+ DKK decisions will manually verify numbers.

**Progressive Complexity**: Start with essential inputs, reveal advanced features as relevant. Tabbed UI supports this without overwhelming new users.

**Premium Context**: All Phase 1 features are behind Phase 4 paywall. Build with assumption of paying users who expect professional quality.

**Danish Specificity**: Tax scenarios, electricity rates, building data, examples all tailored to Danish market from day one (not internationalized later).

## Success Criteria Alignment

Phase 1 decisions directly support success criteria:

1. ✅ **Location + roof input → solar yield**: Address search + BBR research + PVGIS integration
2. ✅ **Transparent cost breakdown**: Summary cards + expandable details + assumptions panel
3. ✅ **25-year projection with assumptions**: Chart-first + dual-line inflation + documented assumptions
4. ✅ **Decimal accuracy + transparency**: Decimal.js + "how we calculated" visibility
5. ✅ **Instant feedback without lag**: Hybrid updates + 500ms debounce + optimistic UI

## Dependencies

**External APIs needed**:
- PVGIS (solar irradiance) - already integrated per INTEGRATIONS.md
- Geocoding service (TBD during planning)
- Potentially BBR API (research task)

**Libraries to add**:
- Decimal.js (financial calculations)
- Potentially Excel automation for test harness

**Data required**:
- Danish electricity rate defaults
- Typical system cost breakdowns by size
- Inflation rate assumptions (historical Danish rates)

---

*Context document created: 2026-01-28*
*Ready for Phase 1 planning*
