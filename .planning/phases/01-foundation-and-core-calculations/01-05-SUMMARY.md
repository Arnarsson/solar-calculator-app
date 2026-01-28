---
phase: 01-foundation
plan: 05
subsystem: ui
tags: [react, zod, use-debounce, tanstack-query, shadcn-ui, form-state]

# Dependency graph
requires:
  - phase: 01-01
    provides: Zod validation patterns and database schema structure
  - phase: 01-03
    provides: Calculation input types and assumptions structure
provides:
  - Tabbed calculator input interface with 4 progressive sections
  - Zod validation schemas for all calculator inputs with Danish-specific constraints
  - Debounced form hook with TanStack Query integration
  - Location/roof/energy/system/advanced input components
affects: [01-06, 02-calculator-results, user-scenarios, api-routes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Debounced form updates (500ms) to prevent UI lag per DATA-03"
    - "Auto-detection of DK1/DK2 price area from longitude"
    - "Progressive disclosure via tabs (Essential → Advanced)"
    - "Danish currency formatting with toLocaleString('da-DK')"

key-files:
  created:
    - lib/validation/calculator.ts
    - hooks/use-calculator-form.ts
    - components/calculator/LocationInput.tsx
    - components/calculator/RoofInput.tsx
    - components/calculator/CalculatorTabs.tsx
    - components/calculator/tabs/EssentialTab.tsx
    - components/calculator/tabs/EnergyTab.tsx
    - components/calculator/tabs/SystemTab.tsx
    - components/calculator/tabs/AdvancedTab.tsx
  modified: []

key-decisions:
  - "Use Zod schemas for input validation with Danish coordinate bounds"
  - "500ms debounce on all input changes per DATA-03 performance requirement"
  - "Auto-detect price area (DK1/DK2) based on longitude < 10.5 boundary"
  - "Visual sliders for roof azimuth/tilt with Danish compass labels"
  - "Transparent cost breakdown showing VAT calculation"

patterns-established:
  - "Tab organization: Essential → Energy → System → Advanced"
  - "Visual helpers for technical inputs (azimuth compass, tilt slider)"
  - "Cost estimates shown alongside actual inputs for guidance"
  - "Assumptions transparency in Advanced tab per FIN-06"

# Metrics
duration: 4min
completed: 2026-01-28
---

# Phase 01 Plan 05: Input UI with Tabbed Interface Summary

**Tabbed calculator input interface with debounced form state, Zod validation, Danish coordinate bounds, and visual helpers for roof orientation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-28T16:28:27Z
- **Completed:** 2026-01-28T16:32:47Z
- **Tasks:** 3
- **Files created:** 9
- **Commits:** 3 task commits + 1 metadata commit

## Accomplishments

- Complete input collection UI with 4 organized tabs (Essential/Energy/System/Advanced)
- Debounced form hook with 500ms delay prevents UI lag on rapid input changes
- Location input validates Danish coordinates (54.5-57.8 lat, 8.0-15.2 lon)
- Roof input has visual sliders with compass direction labels (Nord/Syd/etc.)
- System cost tab shows transparent VAT breakdown and per-m² estimates
- Advanced tab exposes inflation assumptions with transparency note per FIN-06
- Auto-detection of DK1/DK2 price area from longitude

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zod validation schemas and form hook with debouncing** - `da9a766` (feat)
   - Created calculator input validation schemas with Danish-specific constraints
   - Implemented debounced form hook (500ms per DATA-03) with TanStack Query
   - Auto-detect DK1/DK2 price area from longitude
   - Complete type safety for all calculator inputs

2. **Task 2: Create tabbed calculator interface with Essential and Energy tabs** - `227f979` (feat)
   - Location input with Danish coordinate validation and auto-detect price area
   - Roof input with visual sliders for azimuth and tilt
   - Energy tab with electricity rate, self-consumption, and annual usage
   - Tabbed interface with Danish labels and currency formatting
   - Visual helpers for compass directions and tilt angles

3. **Task 3: Create System and Advanced tabs** - `d141123` (feat)
   - System tab shows cost breakdown with VAT calculation and per-m² estimates
   - Advanced tab exposes inflation rates and maintenance assumptions
   - All tabs use Danish labels and currency formatting
   - Transparent display of fixed assumptions (degradation, projection period)

**Plan metadata:** (to be committed)

## Files Created/Modified

### Created
- `lib/validation/calculator.ts` - Zod schemas for all calculator inputs with Danish constraints
- `hooks/use-calculator-form.ts` - Debounced form hook with TanStack Query integration
- `components/calculator/LocationInput.tsx` - Lat/long input with price area auto-detection
- `components/calculator/RoofInput.tsx` - Roof area, azimuth, and tilt inputs with visual sliders
- `components/calculator/tabs/EssentialTab.tsx` - Location and roof inputs (first tab)
- `components/calculator/tabs/EnergyTab.tsx` - Electricity rate and consumption inputs
- `components/calculator/tabs/SystemTab.tsx` - Cost breakdown with VAT and estimates
- `components/calculator/tabs/AdvancedTab.tsx` - Inflation and maintenance assumptions
- `components/calculator/CalculatorTabs.tsx` - Main tabbed interface component

## Decisions Made

**1. Debounce timing: 500ms**
- Rationale: Matches DATA-03 performance requirement for responsive UI without lag
- Implementation: useDebouncedCallback from use-debounce library
- Effect: API calls only triggered after user stops typing for 500ms

**2. DK1/DK2 auto-detection from longitude**
- Rationale: Simplify user input by automatically determining electricity price area
- Implementation: DK1 if longitude < 10.5, otherwise DK2 (West vs East Denmark)
- Effect: Users don't need to know their price area

**3. Visual sliders for roof orientation**
- Rationale: Technical terms like "azimuth" and "tilt" are non-intuitive for homeowners
- Implementation: Range sliders with Danish compass labels (Nord, Syd, etc.)
- Effect: More accessible UX for non-technical users

**4. Cost estimates alongside actual inputs**
- Rationale: Users often don't have quotes yet during research phase
- Implementation: Per-m² estimates (1000 DKK panels, 400 inverter, 800 installation, 200 mounting)
- Effect: Supports both early research and final decision phases

**5. Progressive disclosure via tabs**
- Rationale: Avoid overwhelming users with 15+ input fields at once
- Implementation: Essential → Energy → System → Advanced progression
- Effect: Clear flow from required basics to optional advanced settings

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all components compiled successfully and build passed on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Wiring inputs to calculation API routes (01-04 already provides these)
- Displaying results from calculator form state
- Scenario saving and comparison features

**Notes:**
- All inputs validated with Zod schemas, ready for API integration
- Form state management complete with debouncing
- Component structure supports progressive enhancement (add battery tab, EV charging tab later)

**No blockers or concerns.**

---
*Phase: 01-foundation*
*Completed: 2026-01-28*
