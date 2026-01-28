# Codebase Concerns

**Analysis Date:** 2026-01-28

## Tech Debt

**Monolithic Main Component:**
- Issue: `app/page.tsx` contains 1,100 lines of UI logic without component extraction
- Files: `app/page.tsx`
- Impact: Very difficult to test, maintain, and reason about. Rendering performance may suffer. Single point of failure for entire app UI.
- Fix approach: Extract tabs into separate components (`<LivePricesTab />`, `<ForecastTab />`, `<OptimizeTab />`, etc.). Extract card sections into reusable components. Use React.lazy() for tab content to enable code splitting.

**Untyped Recharts Components:**
- Issue: Custom tooltip functions use `any` type instead of proper Recharts types
- Files: `components/charts/price-chart.tsx` (line 51), `components/charts/production-chart.tsx` (lines 45, 152)
- Impact: No type safety for payload structure. Changes to recharts could break code silently.
- Fix approach: Import and use `TooltipProps<any, any>` from recharts. Create typed utility function for custom tooltips.

**Hardcoded Default Values Scattered:**
- Issue: Default system specs, coordinates, and config spread across multiple files with potential inconsistencies
- Files: `app/api/solar/route.ts` (lines 13-15), `app/api/optimize/route.ts` (lines 9-13), `lib/api/open-meteo.ts` (lines 49-51)
- Impact: Changing system configuration requires updates in multiple locations. Risk of inconsistency between API routes.
- Fix approach: Create centralized `lib/config.ts` with all defaults. Export from there. Update env vars to override.

**Non-Deterministic Arbitrage Calculation:**
- Issue: `findArbitrageOpportunities()` in `lib/api/optimizer.ts` loops through all cheap/expensive pairs creating O(n²) opportunities
- Files: `lib/api/optimizer.ts` (lines 239-279)
- Impact: With 48 prices, could generate ~256 opportunities before slicing to 5. Inefficient nested loop.
- Fix approach: Sort pairs by profit margin first, only keep top candidates. Use greedy algorithm instead of cartesian product.

**Optional Chaining with Non-Null Assertion:**
- Issue: Code uses non-null assertion on Map.get() results (`!.push()`)
- Files: `lib/api/open-meteo.ts` (line 177), `lib/api/optimizer.ts` (line 249)
- Impact: Risk of runtime null pointer exception if logic flow changes. False sense of safety.
- Fix approach: Validate map entry exists before accessing, or use optional chaining without assertion.

## Known Bugs

**API Error Recovery Not Implemented:**
- Symptoms: When external API fails (Open-Meteo, Energi Data Service), page shows error state but no retry mechanism
- Files: `hooks/use-live-data.ts`, `app/api/prices/route.ts`, `app/api/solar/route.ts`
- Trigger: Network timeout or API downtime from external services
- Workaround: User must manually click "Refresh" button. No exponential backoff or automatic retry.

**Day Boundary Solar Production Edge Case:**
- Symptoms: Solar forecast may calculate incorrect "today remaining" production around midnight
- Files: `lib/api/open-meteo.ts` (lines 214-240, `getCurrentSolarConditions` function)
- Trigger: When current hour forecast data is missing or when transitioning between days
- Workaround: Currently finds closest matching hour by hour value only, not considering timezone shifts properly around midnight.

**Price Window End Time Off by One Hour:**
- Symptoms: Charging window end times may display hour N+1 instead of N in some cases
- Files: `lib/api/energi-data-service.ts` (lines 196-203)
- Trigger: When optimal window spans exactly 4 hours, end time uses `prices[requiredHours - 1]` which is index 3 for 4 items
- Workaround: None. This is a display issue - the actual window logic is correct but UI shows wrong hour.

**Timezone Inconsistency Potential:**
- Symptoms: Client timezone vs server timezone for date calculations could cause misalignment
- Files: `hooks/use-live-data.ts`, `lib/api/optimizer.ts` (lines 56-68)
- Trigger: When running on server/client with different timezones
- Workaround: All dates should use ISO strings for transport, but local Date() constructors may differ by timezone.

## Security Considerations

**Hardcoded Location Coordinates:**
- Risk: System defaults to Copenhagen (55.6761, 12.5683) but no validation that user input coordinates are safe
- Files: `app/api/solar/route.ts` (line 14-15), `lib/api/open-meteo.ts` (lines 50-51)
- Current mitigation: Accepts lat/lon from query params without bounds checking
- Recommendations: Add validation that lat/lon are within valid geographic bounds (-90 to 90 for lat, -180 to 180 for lon). Reject obviously invalid requests (e.g., request for lat=9999).

**Unvalidated External API Responses:**
- Risk: No schema validation on API responses from Open-Meteo or Energi Data Service before using in calculations
- Files: `lib/api/open-meteo.ts` (lines 76-86), `lib/api/energi-data-service.ts` (lines 53-69)
- Current mitigation: TypeScript interfaces exist but are not enforced at runtime
- Recommendations: Use Zod or similar validation library to parse and validate all external API responses. Fail safely with clear error if structure unexpected.

**PriceArea Parameter Not Validated:**
- Risk: `priceArea` accepts string input as 'DK1' | 'DK2' but no validation occurs before passing to API
- Files: `app/api/prices/route.ts` (line 15), `app/api/optimize/route.ts` (line 17)
- Current mitigation: TypeScript cast as `'DK1' | 'DK2'` but runtime value could be anything
- Recommendations: Explicitly validate priceArea is in allowed set. Use enum or constants.

**Debug Errors Exposed to Client:**
- Risk: Full error messages from external APIs returned to frontend
- Files: `app/api/prices/route.ts` (line 67), `app/api/solar/route.ts` (line 89), `app/api/optimize/route.ts` (line 102)
- Current mitigation: Error messages only contain generic "Failed to..." messages
- Recommendations: Acceptable as-is for now, but consider logging full error server-side separately and returning generic message to client in production.

## Performance Bottlenecks

**Three Parallel API Calls on Every Page Load:**
- Problem: `useLiveData()` fetches prices (5min interval), solar (30min interval), and optimize data (15min interval) independently
- Files: `hooks/use-live-data.ts` (lines 227-252), `app/page.tsx` (lines 54-57)
- Cause: Each hook starts own interval timer. All three make concurrent requests even if not all data needed.
- Improvement path: Implement request deduplication. Share cache between hooks. Only fetch data that tab users are viewing. Use SWR or TanStack Query for automatic deduplication.

**Large SVG Rendering in Main Component:**
- Problem: Hardcoded circular progress SVG in optimize tab redraws on every render (line 424-442 in page.tsx)
- Files: `app/page.tsx` (lines 424-442)
- Cause: SVG circle calculation happens during render, not memoized
- Improvement path: Extract to separate memoized component. Use CSS animation instead of SVG for progress ring.

**Hourly Chart Data Not Memoized by Dependency:**
- Problem: `chartData` in ProductionChart/PriceChart recalculates even when data array reference stays same
- Files: `components/charts/price-chart.tsx` (lines 30-42), `components/charts/production-chart.tsx` (lines 31-43)
- Cause: Recharts data transformation happens on every parent render
- Improvement path: useMemo is already in place but ensure parent components don't cause unnecessary re-renders. Consider moving chart components to React.memo.

**N+1 Date Parsing in Solar Aggregation:**
- Problem: `aggregateToDailySummary()` loops through all hourly data creating Map, then converts back to array
- Files: `lib/api/open-meteo.ts` (lines 165-209)
- Cause: Double loop - once to group by date string, once to convert to objects
- Improvement path: Single pass with reduce() instead of Map intermediate. Pre-allocate expected daily count.

**48-Hour Hourly Data Displayed When 7-Day Daily Enough:**
- Problem: `hourlyData` slice returns first 48 hours (2 days) even though 7-day forecast available
- Files: `app/api/solar/route.ts` (line 64)
- Cause: Always returns hourly, but UI doesn't use all of it
- Improvement path: Calculate required resolution based on forecast period. Return hourly for 2 days, then 4-hourly or daily summaries for remaining days.

## Fragile Areas

**Optimization Recommendations Deduplication Logic:**
- Files: `lib/api/optimizer.ts` (lines 284-294)
- Why fragile: Uses naive string key matching on type + hour. If recommendation type or time changes slightly, deduplication breaks or removes valid recommendations.
- Safe modification: Change `const key = ...slice(0, 13)` to include more precision (type + start hour precision). Add unit tests for dedup edge cases.
- Test coverage: No tests exist for deduplication. Edge cases untested (e.g., overlapping times, same hour multiple types).

**Price Threshold Calculation Repeated Three Times:**
- Files: `lib/api/energi-data-service.ts` (lines 56-59, 91-94, 130-133)
- Why fragile: Cheap/expensive thresholds calculated identically but independently. If threshold logic needs change, must update three places.
- Safe modification: Extract to utility function `calculateThresholds(prices)`. Call once, pass result.
- Test coverage: No tests verify threshold calculations are consistent across fetch functions.

**Panel Area Estimation Hardcoded:**
- Files: `lib/api/open-meteo.ts` (line 141)
- Why fragile: `1 kW ≈ 5.5 m²` hardcoded magic number. Changes system design implications but scattered as constant.
- Safe modification: Document why 5.5 chosen (typical panel density). Consider making configurable if user can input panel specs.
- Test coverage: No test validates production calculation against known real data.

**Self-Sufficiency Thresholds:**
- Files: `lib/api/optimizer.ts` (lines 316-326)
- Why fragile: Hardcoded thresholds (30%, 50%, 70%) for recommendations have no documented basis. If user has different system, recommendations may be inappropriate.
- Safe modification: Make thresholds configurable based on user goals. Add parameter to `calculateSelfSufficiencyPotential()`.
- Test coverage: No tests verify recommendation logic at boundary thresholds (29.9%, 30.0%, 30.1%).

**Main Component State Mutation:**
- Files: `app/page.tsx` (lines 49-57)
- Why fragile: Multiple useState calls for costs, specs, priceArea all feed into calculations. Changes to any state trigger full component re-render with recalculation of dependent values.
- Safe modification: Use useReducer for complex state. Memoize calculation functions with useMemo. Consider moving calculations to separate hook.
- Test coverage: No tests for state management or edge cases (negative costs, zero panels, etc.).

## Scaling Limits

**All Data Fetched Fresh on Every Request:**
- Current capacity: Works fine for single user, 3 concurrent API calls
- Limit: With 10+ concurrent users, will make 30+ calls to external APIs per polling interval, risking rate limits
- Scaling path: Implement server-side caching with Redis or in-memory cache. Cache prices for 1 hour, solar forecast for 30 minutes. Deduplicate concurrent requests.

**Recharts Rendering 48+ Data Points:**
- Current capacity: Smooth rendering on desktop for 48 hourly + 7 daily points
- Limit: On mobile/older devices, rendering may stutter. With higher resolution data (15-min intervals = 672 points), will lag.
- Scaling path: Implement dynamic resolution based on viewport size and device capability. Use canvas-based chart library (Recharts can't handle >500 points well). Implement virtualization for table data.

**In-Memory Calculations Without Caching:**
- Current capacity: Single page with ~12KB of sample data
- Limit: If real historical data added or multi-month analysis needed, calculations slow down
- Scaling path: Move calculation-heavy logic to dedicated worker threads or backend. Cache calculation results in database.

**No Database Persistence:**
- Current capacity: Live data only, no history
- Limit: Can't analyze trends, optimize over time, or audit past decisions
- Scaling path: Add Prisma schema to store hourly prices, solar forecast, recommendations, user configurations. This is partially set up but not used.

## Dependencies at Risk

**NextAuth ^4.24.7 (May Be Outdated):**
- Risk: Version 4.x is older line. v5 exists but has breaking changes. Dependency injection and provider system changed significantly.
- Impact: If security vulnerability found in v4, must either patch or migrate to v5 (significant work)
- Migration plan: Evaluate v5 migration path early. Pin to v4.x for now, but plan upgrade for next major version bump. Document migration steps.

**Recharts ^2.12.7 (Active Development):**
- Risk: Recharts is under active development. Custom tooltip typing fragile due to `any` types used in library
- Impact: Updates could change component API or behavior. Custom hooks may break.
- Migration plan: Keep recharts updated. Add type guards for custom components. Consider alternative (Visx, Chart.js) if issues arise.

**Prisma ^5.17.0 (Schema Not Fully Utilized):**
- Risk: Prisma client initialized but no database schema defined. Client added as dependency but largely unused.
- Impact: Dead code adds build size. If schema changes, must regenerate client.
- Migration plan: Either remove Prisma entirely or fully implement database layer with schema. Don't leave partially set up.

## Missing Critical Features

**No Input Validation on Cost/Panel Inputs:**
- Problem: User can enter negative costs, zero panels, or invalid numbers - all calculations proceed silently with invalid results
- Blocks: Can't trust financial projections. ROI calculations could show nonsense values (-years to payback).
- Priority: Medium - affects data integrity

**No Data Persistence:**
- Problem: User configurations (costs, panel specs, price area) lost on page refresh
- Blocks: Can't provide historical analysis or multi-scenario comparison. Each page load starts fresh.
- Priority: Medium - affects usability

**No Export/Report Generation:**
- Problem: Users can't share calculations, export to PDF, or email reports
- Blocks: Can't be used as basis for decision-making in professional/institutional contexts
- Priority: Low - feature request, not blocker

**No Real Authentication:**
- Problem: NextAuth configured but never called. System treats all users as same person.
- Blocks: Can't support multi-user scenarios, save user preferences, or audit user actions
- Priority: Low - app appears to be single-user tool

**No Alert/Notification System:**
- Problem: When prices drop or solar production peaks, user must manually check app
- Blocks: Can't achieve goal of "smart optimization" - recommendations are reactive only
- Priority: Medium - core value proposition partially unfulfilled

## Test Coverage Gaps

**Calculation Logic Untested:**
- What's not tested: `calculateMonthlyResults()`, `calculateYearlyResults()`, monthly/yearly aggregations
- Files: `lib/calculations.ts`
- Risk: Changes to formulas could introduce silent financial errors. Sample data shows specific results but no automated verification.
- Priority: High - financial calculations require strict correctness

**API Error Scenarios Not Tested:**
- What's not tested: Behavior when Open-Meteo returns 500, Energi Data Service times out, or responses have missing fields
- Files: `app/api/solar/route.ts`, `app/api/prices/route.ts`, `app/api/optimize/route.ts`
- Risk: Unknown crash modes. Error handling may expose sensitive info or cause cascading failures.
- Priority: High - production resilience

**Recommendation Deduplication Not Tested:**
- What's not tested: Edge cases where recommendations overlap, same type/time, boundary conditions (29.9% vs 30% thresholds)
- Files: `lib/api/optimizer.ts` (deduplication and threshold logic)
- Risk: Recommendations may disappear incorrectly or duplicates not filtered. Users see inconsistent output.
- Priority: Medium - affects user trust

**Component Rendering Not Tested:**
- What's not tested: UI rendering with missing data, loading states, error states. Tab transitions.
- Files: `app/page.tsx`, chart components
- Risk: UI may crash or display corrupted data. Users see confusing state.
- Priority: Medium - end-user experience

**Hook Behavior Not Tested:**
- What's not tested: `useLiveData()` interval management, cleanup on unmount, dependency changes
- Files: `hooks/use-live-data.ts`
- Risk: Memory leaks from uncleaned intervals. Stale data persisting between mounts. Infinite refetch loops.
- Priority: Medium - stability

---

*Concerns audit: 2026-01-28*
