---
phase: 01-foundation-and-core-calculations
plan: 01
subsystem: database
tags: [postgresql, prisma, decimal-js, database-schema, scenario-management]

# Dependency graph
requires:
  - phase: none
    provides: Initial Next.js project setup
provides:
  - PostgreSQL database schema with Decimal precision for financial calculations
  - CalculationScenario, CalculationInput, and YearlyProjection models
  - Scenario CRUD operations in lib/db/scenarios.ts
  - Phase 1 dependencies (decimal.js, use-debounce, react-query, fast-check)
affects: [02-calculations, 03-api, 04-ui, scenario-management, financial-projections]

# Tech tracking
tech-stack:
  added: [decimal.js, use-debounce, @tanstack/react-query, fast-check]
  patterns: [prisma-decimal-conversion, scenario-storage-pattern]

key-files:
  created:
    - lib/db/scenarios.ts
    - .env
  modified:
    - prisma/schema.prisma
    - .env.example
    - package.json
    - package-lock.json

key-decisions:
  - "Use Prisma.Decimal type with string inputs for financial precision"
  - "Add directUrl to datasource for connection pooling compatibility"
  - "Track formulaVersion in CalculationScenario for auditability (DATA-05)"
  - "Store 25-year projections in YearlyProjection model with unique constraint on scenarioId+year"

patterns-established:
  - "Database operations accept string inputs, convert to Prisma.Decimal internally"
  - "Scenario CRUD operations separated in lib/db/ namespace"
  - "Financial fields use @db.Decimal(12,2), rates use Decimal(5,4), coordinates use Decimal(10,7)"

# Metrics
duration: 5min
completed: 2026-01-28
---

# Phase 1 Plan 01: Database Foundation Summary

**PostgreSQL schema with Decimal precision for financial calculations, scenario storage models, and CRUD operations ready for calculation engine**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-28T15:57:43Z
- **Completed:** 2026-01-28T16:03:33Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Migrated Prisma schema from SQLite to PostgreSQL with exact decimal precision
- Created CalculationScenario, CalculationInput, and YearlyProjection models with formulaVersion tracking
- Implemented scenario CRUD operations with proper Decimal handling (saveScenario, loadScenario, listUserScenarios, deleteScenario, updateScenarioName)
- Installed all Phase 1 dependencies and generated Prisma client

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate Prisma schema to PostgreSQL with Decimal types** - `82367bd` (feat)
2. **Task 2: Create scenario database operations with Decimal handling** - `ce6464b` (feat)
3. **Task 3: Install dependencies and generate Prisma client** - `2937dcb` (chore)

## Files Created/Modified
- `prisma/schema.prisma` - PostgreSQL datasource with CalculationScenario, CalculationInput, YearlyProjection models; Decimal types for all financial fields
- `.env.example` - PostgreSQL connection string template with DATABASE_URL and DIRECT_DATABASE_URL
- `.env` - Created with placeholder values for local development (gitignored)
- `lib/db/scenarios.ts` - Scenario CRUD operations with ScenarioInput interface and Prisma.Decimal conversion
- `package.json` - Added decimal.js, use-debounce, @tanstack/react-query, fast-check
- `package-lock.json` - Dependency lockfile updated

## Decisions Made

**Decimal precision strategy:** All financial fields use Prisma Decimal type with explicit precision (@db.Decimal(12,2) for money, (5,4) for rates, (10,7) for coordinates). Database operations accept string inputs to avoid float imprecision, convert to Prisma.Decimal internally.

**Schema versioning:** Added formulaVersion field (default "1.0.0") to CalculationScenario for auditability requirement DATA-05. This enables tracking which calculation methodology was used for each saved scenario.

**Connection pooling:** Added directUrl to PostgreSQL datasource for compatibility with serverless/edge deployments that require connection pooling (Vercel Postgres, Supabase, etc.).

**Scenario storage pattern:** Separated scenario management into dedicated lib/db/ namespace with clear CRUD operations. Input data stored in CalculationInput (1-to-1 relation), projections in YearlyProjection (1-to-many with unique constraint on year).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created .env file for Prisma validation**
- **Found during:** Task 1 (Prisma schema validation)
- **Issue:** `npx prisma validate` failed with "Environment variable not found: DIRECT_DATABASE_URL" - schema requires both DATABASE_URL and DIRECT_DATABASE_URL but .env file didn't exist
- **Fix:** Created .env file with placeholder PostgreSQL connection strings (file is gitignored, safe for local dev)
- **Files modified:** .env (created)
- **Verification:** `npx prisma validate` passes successfully
- **Committed in:** Not committed (file is gitignored as intended)

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** Essential for development workflow - Prisma commands require valid environment variables even in development. No scope creep.

## Issues Encountered

None - plan executed smoothly with one necessary environment file creation.

## User Setup Required

**Database connection required for actual use.**

Before using the database operations:
1. Provision PostgreSQL database (local, Vercel Postgres, Supabase, etc.)
2. Update `.env` with actual connection strings:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/solar_calculator?sslmode=require"
   DIRECT_DATABASE_URL="postgresql://user:password@host:5432/solar_calculator?sslmode=require"
   ```
3. Run migrations: `npx prisma db push` (for development) or `npx prisma migrate dev` (for versioned migrations)
4. Verify: `npx prisma studio` should open database browser

Note: Current .env has placeholder values - schema is valid but database connection will fail until real credentials are provided.

## Next Phase Readiness

**Ready for calculation module development.**

Database foundation complete with:
- Schema supports all required inputs for solar calculations (location, roof, costs, energy, financial)
- Decimal precision ensures accuracy for 25-year projections
- Scenario storage ready for saving/loading user calculations
- CRUD operations tested via TypeScript compilation and build

**Next steps (Plan 01-02):**
- Implement core calculation modules (setupPricing, payback) using Decimal.js
- Calculations will use this schema for data persistence
- 25-year projections will populate YearlyProjection model

**No blockers or concerns.**

---
*Phase: 01-foundation-and-core-calculations*
*Completed: 2026-01-28*
