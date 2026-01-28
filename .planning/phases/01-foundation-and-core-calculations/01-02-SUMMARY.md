---
phase: 01-foundation
plan: 02
subsystem: calculations
tags: [decimal.js, jest, tdd, financial-precision, typescript]

# Dependency graph
requires:
  - phase: 01-01
    provides: PostgreSQL database with Decimal precision schema
provides:
  - Core calculation modules with Decimal.js precision
  - Setup pricing calculation with Danish VAT
  - Payback period calculation
  - CO2 savings calculation with equivalents
  - Jest test infrastructure
  - Property-based testing with fast-check
affects: [03-pvgis-integration, 04-database-ui-bridge, 06-ev-integration]

# Tech tracking
tech-stack:
  added: [jest, ts-jest, fast-check, decimal.js (native types)]
  patterns: [TDD with RED-GREEN-REFACTOR, property-based testing, Decimal.js for financial precision]

key-files:
  created:
    - lib/calculations/types.ts
    - lib/calculations/setupPricing.ts
    - lib/calculations/payback.ts
    - lib/calculations/co2Savings.ts
    - lib/calculations/__tests__/setupPricing.test.ts
    - lib/calculations/__tests__/payback.test.ts
    - lib/calculations/__tests__/co2Savings.test.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Removed @types/decimal.js to use native decimal.js types"
  - "Used fc.double with noNaN instead of fc.float for property tests"
  - "Fixed test constraints for fast-check compatibility"

patterns-established:
  - "TDD pattern: test commit → feat commit → refactor commit (if needed)"
  - "Decimal.js precision: 20 digits with ROUND_HALF_UP for financial calculations"
  - "Property-based tests verify mathematical invariants (100+ scenarios each)"
  - "Danish constants centralized in types.ts"

# Metrics
duration: 5min
completed: 2026-01-28
---

# Phase 01 Plan 02: Core Calculation Modules Summary

**Three calculation modules with Decimal.js precision: setup pricing (VAT), payback (7.8yr reference), and CO2 savings (4.4t/yr reference)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-28T16:13:25Z
- **Completed:** 2026-01-28T16:18:39Z
- **Tasks:** 4
- **Files modified:** 10
- **Test coverage:** 13 tests (3 suites), 200+ property-based test cases

## Accomplishments

- Setup pricing calculation matches Excel reference values (161,300 DKK total with 25% VAT)
- Payback calculation verified against Excel (7.80 years, 20,680 DKK/year savings)
- CO2 savings with Danish grid factor (4.4 tonnes/year for 8,800 kWh production)
- Property-based tests verify mathematical correctness across 200+ scenarios
- All calculations use Decimal.js for exact financial precision

## Task Commits

Each task was committed atomically following TDD:

1. **Task 1: Jest setup and shared types** - `b34b5f3` (chore)
2. **Task 2: Setup pricing module** - `4394429` (feat)
3. **Task 3: Payback module** - `f6c3eb3` (test) + `dc821eb` (feat)
4. **Task 4: CO2 savings module** - `5373cb6` (test) + `85a635d` (feat)

**Plan metadata:** (to be committed)

_Note: Tasks 3 and 4 followed strict TDD with separate test and implementation commits_

## Files Created/Modified

**Created:**
- `lib/calculations/types.ts` - Shared Decimal types, Danish constants (VAT 25%, CO2 0.5 kg/kWh)
- `lib/calculations/setupPricing.ts` - System cost with VAT breakdown
- `lib/calculations/payback.ts` - Simple payback period with break-even year
- `lib/calculations/co2Savings.ts` - Annual/lifetime CO2 savings with equivalents (car km, trees)
- `lib/calculations/__tests__/setupPricing.test.ts` - 3 tests including Excel snapshot
- `lib/calculations/__tests__/payback.test.ts` - 4 tests including 200+ property-based cases
- `lib/calculations/__tests__/co2Savings.test.ts` - 6 tests covering all scenarios

**Modified:**
- `package.json`, `package-lock.json` - Removed @types/decimal.js (use native types)

## Decisions Made

**1. Use native decimal.js types instead of @types/decimal.js**
- **Rationale:** @types/decimal.js uses outdated namespace-style typing; native types are better maintained and use modern TypeScript
- **Impact:** Fixed compilation errors, cleaner type definitions
- **Files affected:** lib/calculations/types.ts, package.json

**2. Use fc.double with noNaN instead of fc.float**
- **Rationale:** fc.float requires Math.fround and can generate NaN; fc.double is cleaner and supports noNaN flag
- **Impact:** Property-based tests run reliably without NaN edge cases
- **Files affected:** lib/calculations/__tests__/payback.test.ts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed fast-check float constraints**
- **Found during:** Task 3 (Payback module property-based tests)
- **Issue:** fc.float requires Math.fround for 32-bit float conversion; fc.float can generate NaN values
- **Fix:** Replaced fc.float with fc.double and added noNaN: true flag
- **Files modified:** lib/calculations/__tests__/payback.test.ts
- **Verification:** All 200+ property-based test cases pass
- **Committed in:** f6c3eb3 (test commit for Task 3)

---

**Total deviations:** 1 auto-fixed (1 bug in test configuration)
**Impact on plan:** Bug fix necessary for test reliability. No scope changes.

## Issues Encountered

**TypeScript type compatibility with decimal.js:**
- Issue: @types/decimal.js used old namespace pattern causing type errors
- Solution: Removed @types/decimal.js and used native decimal.js types
- Result: Clean compilation, better type inference

**Fast-check float constraints:**
- Issue: fc.float generated NaN values and required Math.fround
- Solution: Switched to fc.double with noNaN flag
- Result: More reliable property-based tests

## User Setup Required

None - no external service configuration required.

## Verification Results

All success criteria met:

- ✅ setupPricing.ts exports calculateSetupCost matching Excel "Setup & Price" sheet
- ✅ payback.ts exports calculatePayback matching Excel "Yearly Payback Overview" sheet
- ✅ co2Savings.ts exports calculateCO2Savings using Danish grid emission factor (0.5 kg/kWh)
- ✅ All modules use Decimal.js (no floating-point arithmetic for money)
- ✅ Property-based tests verify mathematical invariants (200+ scenarios)
- ✅ Jest test suite configured and passing (13/13 tests)

**Excel reference validation:**
- Setup pricing: 161,300 DKK total (129,040 subtotal + 32,260 VAT)
- Payback: 7.80 years (20,680 DKK annual savings)
- CO2 savings: 4,400 kg/year = 4.4 tonnes/year (for 8,800 kWh production)

## Next Phase Readiness

**Ready for Phase 2 (PVGIS Integration):**
- Calculation modules complete and tested
- All functions export proper TypeScript types
- Decimal.js precision established for data flow
- Danish constants defined (VAT, CO2 factor, feed-in ratio)

**Ready for Phase 4 (Database-UI Bridge):**
- Calculation modules can be integrated with database scenarios
- All inputs/outputs use Decimal type compatible with Prisma.Decimal

**No blockers.** All Phase 1 calculation foundations complete.

---
*Phase: 01-foundation*
*Completed: 2026-01-28*
