---
phase: 01-foundation
plan: 03
subsystem: calculations
tags: [decimal.js, financial-modeling, tdd, property-testing, fast-check]

# Dependency graph
requires:
  - phase: 01-02
    provides: payback module with annual savings calculation, Decimal helper types
provides:
  - 25-year financial projection with degradation and inflation modeling
  - Tax scenario calculator for Danish home improvement deductions
  - Both nominal and real (inflation-adjusted) savings tracking
affects: [01-04, 02-calculator-ui, financial-reports, user-scenarios]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD with fast-check property tests for financial calculations"
    - "Nominal vs real value tracking for transparency"
    - "Documented assumptions in calculation results (FIN-06)"

key-files:
  created:
    - lib/calculations/projection.ts
    - lib/calculations/taxScenarios.ts
    - lib/calculations/__tests__/projection.test.ts
    - lib/calculations/__tests__/taxScenarios.test.ts
  modified: []

key-decisions:
  - "Track both nominal and real (inflation-adjusted) savings for transparency"
  - "Model 3% first-year LID + 0.5%/year degradation (industry standard)"
  - "Separate electricity inflation rate from general inflation"
  - "Tax deduction values marked as placeholders pending SKAT 2026 verification"

patterns-established:
  - "Financial projections include assumptions array for transparency (FIN-06)"
  - "Property tests verify mathematical invariants (cumulative always increases)"
  - "Chart formatters convert Decimal to number for Recharts integration"

# Metrics
duration: 4min
completed: 2026-01-28
---

# Phase 01 Plan 03: 25-Year Projection and Tax Scenarios Summary

**25-year financial projection with panel degradation, dual inflation rates, and Danish tax deduction modeling using TDD**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-28T16:22:25Z
- **Completed:** 2026-01-28T16:26:19Z
- **Tasks:** 2 (TDD: 4 atomic commits)
- **Files modified:** 4 files created
- **Tests:** 13 new tests (8 projection + 5 tax scenarios), all passing
- **Total test suite:** 26 tests passing

## Accomplishments

- 25-year projection with realistic panel degradation (3% LID year 1, 0.5%/year after)
- Dual inflation tracking: nominal savings vs real (today's value) for transparency
- Tax scenario calculator with Danish håndværkerfradrag modeling
- Property-based tests verify cumulative savings mathematical properties
- Comprehensive assumptions documentation for every calculation result

## Task Commits

Each task was committed atomically following TDD:

### Task 1: 25-Year Projection Module

1. **RED Phase** - `6630860` (test: add failing test for 25-year projection)
2. **GREEN Phase** - `cfee3b9` (feat: implement 25-year projection with degradation and inflation)

### Task 2: Tax Scenarios Module

3. **RED Phase** - `9b2dc29` (test: add failing test for tax scenarios)
4. **GREEN Phase** - `4042671` (feat: implement tax scenarios for Danish deductions)

**Plan metadata:** (pending - created at end)

## Files Created/Modified

### Created

- **lib/calculations/projection.ts** - 25-year financial projection with degradation curve and inflation adjustment
- **lib/calculations/taxScenarios.ts** - Danish tax deduction scenarios (NO_TAX, LABOR_DEDUCTION)
- **lib/calculations/__tests__/projection.test.ts** - 8 tests including property test for cumulative savings
- **lib/calculations/__tests__/taxScenarios.test.ts** - 5 tests covering deduction logic and transparency

## Decisions Made

1. **Track both nominal and real savings** - Real values discount back to today's purchasing power, providing honest comparison for users making 25-year decisions
2. **Separate electricity inflation from general inflation** - Electricity prices historically inflate faster than general inflation; separate rates enable accurate modeling
3. **3% first-year LID, 0.5%/year after** - Industry-standard panel degradation model
4. **Tax values marked as placeholders** - Danish tax rules change annually; prominent warnings added to verify with SKAT 2026 guidelines before production use
5. **Property-based tests for invariants** - Fast-check verifies cumulative savings always increase after break-even across 50 random input combinations

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test expectation for year 25 production**

- **Found during:** Task 1 GREEN phase (projection.test.ts)
- **Issue:** Test expected 7562.67 kWh but actual calculation yields 7568.47 kWh (8536 * 0.995^24)
- **Fix:** Corrected test expectation to match precise calculation
- **Files modified:** lib/calculations/__tests__/projection.test.ts
- **Verification:** Manual calculation confirmed: 8536 * 0.995^24 = 7568.47
- **Committed in:** cfee3b9 (part of GREEN phase commit)

**2. [Rule 1 - Bug] Fixed assumptions test to use .some() for string matching**

- **Found during:** Task 2 GREEN phase (taxScenarios.test.ts)
- **Issue:** Test used .toContain() for exact string match, but assumption text includes additional context
- **Fix:** Changed to .some() with .includes() for flexible substring matching
- **Files modified:** lib/calculations/__tests__/taxScenarios.test.ts
- **Verification:** Test passes, verifies Danish deduction info present in assumptions array
- **Committed in:** 4042671 (part of GREEN phase commit)

---

**Total deviations:** 2 auto-fixed (2 test bugs)
**Impact on plan:** Both fixes corrected test expectations to match correct implementation behavior. No scope changes.

## Issues Encountered

None - TDD workflow proceeded smoothly with clear test specifications.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Calculator UI components (01-04) can now use projection and tax scenario modules
- Integration testing with real user scenarios
- Chart visualizations using formatProjectionForChart()

**Notes:**
- Tax deduction values are placeholders - verify with SKAT 2026 rules before production
- All assumptions documented in calculation results for user transparency
- Property tests provide confidence in mathematical correctness across input ranges

---
*Phase: 01-foundation*
*Completed: 2026-01-28*
