# Testing Patterns

**Analysis Date:** 2026-01-28

## Test Framework

**Runner:**
- No test framework currently configured
- No testing dependencies in `package.json` (no Jest, Vitest, Mocha, etc.)
- No test configuration files found (`jest.config.js`, `vitest.config.ts`, etc.)
- No test files found in repository

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
npm run lint              # Only linting is configured, no test command
npm run dev              # Run application in development mode
npm run build            # Build for production
npm run start            # Start production server
```

## Test File Organization

**Location:**
- No tests exist; would need to be co-located with source files or in dedicated `__tests__` directories
- Suggested pattern based on codebase structure:
  - Component tests: `components/[component].test.tsx`
  - Hook tests: `hooks/[hook].test.ts`
  - Utility tests: `lib/[utility].test.ts`
  - API route tests: `app/api/[route]/route.test.ts`

**Naming:**
- Convention would follow `[filename].test.ts` or `[filename].spec.ts` pattern
- No established pattern currently enforced

**Structure:**
- No test files to reference

## Test Structure

**Suite Organization:**
- Not yet implemented

**Patterns:**
- No established patterns for setup, teardown, or assertions

## Mocking

**Framework:**
- Not configured; no mocking library dependencies (Jest, Vitest, ts-jest, etc.)

**Patterns:**
- Not established

**What to Mock:**
- External API calls: `fetchSpotPrices()`, `fetchSolarForecast()`, `fetchTomorrowPrices()`
- Network requests via `fetch()` used in hooks and API routes
- Date/time utilities for testing time-dependent logic in `generateSmartSchedule()` and similar functions

**What NOT to Mock:**
- Pure calculation functions: `calculateMonthlyResults()`, `calculateProductionEstimate()`, `calculateTotalCost()`
- Type definitions and interfaces
- Utility helper functions: `cn()`, `formatCurrency()`, `formatNumber()`
- Prisma client singleton in `lib/prisma.ts` (integration testing with test database recommended)

## Fixtures and Factories

**Test Data:**
- Not established

**Location:**
- Suggested: `lib/fixtures.ts` or `lib/test-fixtures/` directory
- Could use existing constants: `DEFAULT_SETUP_COSTS`, `DEFAULT_PANEL_SPECS`, `SAMPLE_MONTHLY_DATA` from `lib/calculations.ts`

## Coverage

**Requirements:**
- Not enforced; no coverage configuration found

## Test Types

**Unit Tests:**
- Recommended for calculation functions in `lib/calculations.ts` (15+ functions to test)
- Recommended for helper functions in `lib/utils.ts` (10+ functions)
- Recommended for API data transformation functions: `getPriceStats()`, `findOptimalChargingWindows()`, `estimateProduction()`, `aggregateToDailySummary()`
- Example scope: Test `calculateMonthlyResults()` with various input scenarios and validate output calculations

**Integration Tests:**
- Recommended for API routes: `/api/prices`, `/api/solar`, `/api/optimize`
  - Mock external API responses (Energi Data Service, Open-Meteo)
  - Validate endpoint returns correct response shape and status code
  - Test error handling when external APIs fail
- Recommended for hooks: `usePrices()`, `useSolarForecast()`, `useOptimization()`
  - Mock fetch responses
  - Test state updates and refetch behavior
  - Test error state handling

**E2E Tests:**
- Recommended but not currently configured
- Could use Playwright, Cypress, or Puppeteer
- Would test full user workflows: entering system specs, viewing calculations, live data refresh

## Common Patterns

**Async Testing:**
- Not established; would use standard async/await pattern
- Hooks use `useEffect()` to fetch data, requiring async test setup

**Error Testing:**
- Recommended: test catch blocks in API routes with simulated API failures
- Recommended: test error state propagation in React hooks
- Example: Mock `fetch()` to reject and verify error state is set correctly

## Testing Gaps & Recommendations

**Critical Areas Without Tests:**
1. **Core Calculation Logic** (`lib/calculations.ts`)
   - `calculateMonthlyResults()` - Complex financial calculations with multiple outputs
   - `calculateYearlyResults()` - Aggregation logic from monthly data
   - `calculateProductionEstimate()` - Foundation for all solar estimates

2. **External API Integration** (`lib/api/*.ts`)
   - `fetchSpotPrices()` - Energi Data Service integration
   - `fetchSolarForecast()` - Open-Meteo integration
   - Data transformation and error handling

3. **Smart Optimization Engine** (`lib/api/optimizer.ts`)
   - `generateSmartSchedule()` - Complex multi-factor recommendation logic
   - Recommendation deduplication
   - Priority sorting

4. **React Hooks** (`hooks/use-live-data.ts`)
   - Data fetching and state management
   - Error handling and retry logic
   - Dependency tracking for refetch triggers

5. **API Routes** (`app/api/*/route.ts`)
   - Request parameter parsing
   - Response formatting
   - Error responses

**Recommended Testing Strategy:**

Phase 1 (High Priority):
- Add Jest or Vitest configuration
- Write unit tests for `lib/calculations.ts` (fastest ROI)
- Write unit tests for `lib/utils.ts`

Phase 2 (Medium Priority):
- Write integration tests for API routes with mocked external services
- Write hook tests with React Testing Library

Phase 3 (Lower Priority):
- Add E2E tests
- Add visual regression testing if UI coverage needed

**Suggested Test Package Stack:**
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "@types/jest": "^29.x",
    "jest": "^29.x",
    "jest-environment-jsdom": "^29.x",
    "ts-jest": "^29.x"
  }
}
```

---

*Testing analysis: 2026-01-28*
