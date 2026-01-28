# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Help homeowners make confident solar purchase decisions by providing accurate, personalized financial analysis that cuts through the complexity
**Current focus:** Phase 1 - Foundation & Core Calculations

## Current Position

Phase: 1 of 7 (Foundation & Core Calculations)
Plan: 4 of 7 in current phase
Status: In progress
Last activity: 2026-01-28 — Completed 01-04-PLAN.md (API Routes + PVGIS Integration)

Progress: [███░░░░░░░] 43%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 5 min
- Total execution time: 0.30 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation | 4/7 | 19 min | 5 min |

**Recent Trend:**
- Last 5 plans: 01-01 (5min), 01-02 (5min), 01-03 (4min), 01-04 (5min)
- Trend: Consistent velocity, solid execution

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: Port Excel formulas vs rebuild — Formulas proven and sophisticated, faster to port
- Phase 1: Professional/financial aesthetic — High-stakes decisions require trust and polish
- 01-01: Use Prisma.Decimal with string inputs for financial precision — Avoids float imprecision in 25-year projections
- 01-01: Track formulaVersion in scenarios — Enables auditability of calculation methodology (DATA-05)
- 01-01: Add directUrl to PostgreSQL datasource — Compatibility with serverless/connection pooling
- 01-02: Use native decimal.js types instead of @types/decimal.js — Better maintained, modern TypeScript
- 01-02: Use fc.double with noNaN for property tests — More reliable than fc.float
- 01-03: Track both nominal and real savings — Real values discount to today's value for honest 25-year comparison
- 01-03: Separate electricity inflation from general inflation — Electricity historically inflates faster
- 01-03: Tax values marked as placeholders — Danish rules change annually, needs SKAT 2026 verification
- 01-04: Use serializeDecimalFixed for consistent 2-decimal precision — Balances precision with readability in API responses
- 01-04: PVGIS API cached for 24 hours — Respects rate limits while providing fresh data
- 01-04: TanStack Query caches calculation results for 5 minutes — Deterministic results enable aggressive caching
- 01-04: Fallback to area-based production estimate — Graceful degradation when PVGIS unavailable

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-28 16:33 UTC
Stopped at: Completed 01-04-PLAN.md (API Routes + PVGIS Integration)
Resume file: None
Next: 01-05-PLAN.md (next plan in Foundation phase)
