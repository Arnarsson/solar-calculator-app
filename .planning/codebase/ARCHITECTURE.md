# Architecture

**Analysis Date:** 2026-01-28

## Pattern Overview

**Overall:** Layered Next.js full-stack with real-time data aggregation and smart optimization

**Key Characteristics:**
- Client-side state management with React hooks (`useState`, custom hooks)
- Server-side API routes aggregating external data sources (Open-Meteo, Energi Data Service)
- Business logic separated into calculation and optimization layers
- Database-backed persistence using Prisma ORM with SQLite
- Real-time data fetching and caching on API routes
- Component-driven UI with Radix UI + Tailwind CSS

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `app/page.tsx`, `components/`
- Contains: React components, chart visualizations, form inputs
- Depends on: Hooks layer (`hooks/use-live-data.ts`), UI components, utilities
- Used by: Browser end-user

**Data Aggregation Layer (API Routes):**
- Purpose: Fetch and normalize external APIs, aggregate real-time data
- Location: `app/api/`
- Contains:
  - `app/api/solar/route.ts` - Solar radiation forecast aggregation
  - `app/api/prices/route.ts` - Electricity price data from Energi Data Service
  - `app/api/optimize/route.ts` - Combined optimization recommendations
- Depends on: `lib/api/*` (integrations), calculations engine
- Used by: Client hooks and direct browser requests

**Integration Layer:**
- Purpose: Handle external API clients and data transformations
- Location: `lib/api/`
- Contains:
  - `lib/api/open-meteo.ts` - Open-Meteo solar radiation API client
  - `lib/api/energi-data-service.ts` - Danish electricity price API client
  - `lib/api/optimizer.ts` - Smart optimization engine combining price + solar data
- Depends on: Standard fetch API, data types
- Used by: API routes layer

**Business Logic Layer:**
- Purpose: Pure calculation functions for solar panel economics
- Location: `lib/calculations.ts`
- Contains: Production estimates, cost calculations, savings projections, monthly/yearly aggregations
- Depends on: Type definitions
- Used by: Presentation layer, API optimization layer

**Hooks Layer:**
- Purpose: Client-side data fetching, polling, and state management
- Location: `hooks/use-live-data.ts`
- Contains: `useLiveData` hook orchestrating API calls for prices, solar, optimization data
- Depends on: API routes, custom types
- Used by: Page component

**Data Persistence Layer:**
- Purpose: Database schema and ORM operations
- Location: `prisma/schema.prisma`, `lib/prisma.ts`
- Contains: User, Installation, SetupCost, MonthlyData models
- Depends on: Database (SQLite)
- Used by: (Currently unused; prepared for future features)

**Utilities Layer:**
- Purpose: Reusable helper functions
- Location: `lib/utils.ts`, `components/ui/`
- Contains: Currency formatting, calculations, UI component primitives
- Depends on: Third-party libraries (clsx, tailwind-merge)
- Used by: All layers

## Data Flow

**Live Dashboard (Main):**

1. User loads `app/page.tsx` (Server Component wrapper → Client Component via "use client")
2. Page component initializes state: costs, specs, priceArea
3. Component calls `useLiveData({ priceArea, systemSize })`
4. Hook triggers parallel API calls:
   - `GET /api/prices?area=DK1`
   - `GET /api/solar?systemSize=11.6`
   - `GET /api/optimize?area=DK1&systemSize=11.6`
5. API routes fetch and aggregate external data:
   - `prices/route.ts` → calls `energi-data-service.fetchSpotPrices()` → Energi Data Service API
   - `solar/route.ts` → calls `open-meteo.fetchSolarForecast()` → Open-Meteo API
   - `optimize/route.ts` → combines price + solar data via `optimizer.generateSmartSchedule()`
6. Data returned to hook, stored in component state
7. Component renders charts (ProductionChart, PriceChart) and displays metrics
8. User can:
   - Refresh data (manual poll)
   - Adjust system parameters (specs, costs)
   - Switch price areas (DK1/DK2)

**Price Data Flow:**

```
Energi Data Service API (Real-time Nord Pool prices)
    ↓
app/api/prices/route.ts (GET)
    ↓
energi-data-service.fetchSpotPrices(area, hours)
    ↓
Calculate stats: min, max, avg, cheap/expensive thresholds
    ↓
Find optimal charging windows
    ↓
Return: { prices[], stats, chargingWindows, tomorrowAvailable }
    ↓
useLiveData hook stores → page.tsx renders
```

**Solar Data Flow:**

```
Open-Meteo API (7-day forecast)
    ↓
app/api/solar/route.ts (GET with lat, lon, systemSize)
    ↓
open-meteo.fetchSolarForecast(lat, lon, days)
    ↓
Estimate production: GHI × systemSize × efficiency
    ↓
Aggregate to daily summaries (peak radiation, quality rating)
    ↓
Calculate current conditions & today's forecast
    ↓
Return: { dailySummaries[], hourlyData[], currentConditions }
    ↓
useLiveData hook stores → page.tsx renders ProductionChart
```

**Optimization Data Flow:**

```
[Prices] + [Solar Forecast]
    ↓
app/api/optimize/route.ts (GET)
    ↓
optimizer.generateSmartSchedule(prices[], solarData[], battery, evCharger)
    ↓
Analyze each hour:
  - Cheap price + low solar → recommend: charge battery from grid
  - High solar + moderate price → recommend: use appliances now
  - Peak solar hours → recommend: EV charging
  - Grid arbitrage opportunities (low buy, high sell price differential)
    ↓
Return: { recommendations[], optimalEvWindows, peakSolarHours, arbitrage[], summary }
    ↓
useLiveData hook stores → page.tsx renders recommendations
```

**State Management:**

- Component state (`useState`): user inputs (costs, specs, priceArea)
- Hook state (`useLiveData`): API response data (prices, solar, optimization)
- No centralized store (Redux/Zustand); props drilled through page component
- Data refetching triggered by: mount, user refresh click, parameter changes

## Key Abstractions

**OptimizationRecommendation:**
- Purpose: Represent actionable smart grid recommendations
- Examples: `lib/api/optimizer.ts` (interface defined)
- Pattern: Union type on `type` field ('charge_ev' | 'charge_battery' | 'use_appliances' | 'sell_to_grid' | 'avoid_usage')
- Includes: priority level, time window, reason text, estimated savings in DKK

**HourlyPrice:**
- Purpose: Normalized electricity price data
- Examples: `lib/api/energi-data-service.ts` (HourlyPrice interface)
- Pattern: Encapsulates raw API data (DKK/MWh) → normalized (DKK/kWh per hour)
- Includes: isDCheap, isExpensive boolean flags computed from stats thresholds

**HourlySolarData:**
- Purpose: Normalized solar radiation forecast
- Examples: `lib/api/open-meteo.ts` (HourlySolarData interface)
- Pattern: Transforms Open-Meteo raw GHI/DNI/DHI → estimatedProduction (kWh) for given system size
- Includes: time, irradiance values, cloud cover, temperature, computed production

**SetupCosts & PanelSpecs:**
- Purpose: Encapsulate solar installation configuration
- Examples: `lib/calculations.ts`
- Pattern: Separate types for costs (financial) and specs (technical)
- Used by: All calculation functions, stored in component state, database models

**MonthlyResults & YearlyResults:**
- Purpose: Output objects for production/consumption/savings calculations
- Pattern: Extend input types with calculated fields (totalSaved, roi, paybackYears)
- Used by: Excel-like calculations ported to TypeScript

## Entry Points

**Browser Entry:**
- Location: `app/page.tsx` (default export)
- Triggers: Browser navigation to `/` (Next.js default)
- Responsibilities: Main dashboard UI, state initialization, hook management, chart rendering

**API Entry (Solar):**
- Location: `app/api/solar/route.ts` (GET handler)
- Triggers: Client fetch to `/api/solar?systemSize=11.6&lat=55.6761&lon=12.5683`
- Responsibilities: Coordinate Open-Meteo calls, estimate production, aggregate daily summaries

**API Entry (Prices):**
- Location: `app/api/prices/route.ts` (GET handler)
- Triggers: Client fetch to `/api/prices?area=DK1&mode=latest`
- Responsibilities: Fetch spot prices, compute stats, find charging windows

**API Entry (Optimization):**
- Location: `app/api/optimize/route.ts` (GET handler)
- Triggers: Client fetch to `/api/optimize?area=DK1&systemSize=11.6`
- Responsibilities: Combine prices + solar, generate smart schedule, calculate self-sufficiency

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: All pages (Server Component)
- Responsibilities: Set metadata, provide Inter font, wrap children in `<html><body>`

## Error Handling

**Strategy:** Try-catch at API routes, graceful degradation in client

**Patterns:**
- API routes return `{ success: false, error: "message" }` on fetch failures
- Hook catches errors silently, maintains previous state
- External API failures (Open-Meteo, Energi Data Service) use fallback/retry logic
- Client renders "isLoading" spinner during fetch; refreshes available even during errors

**Examples:**
- `app/api/optimize/route.ts` (line 27): `.catch(() => [])` for tomorrow prices fallback
- `app/api/prices/route.ts` (line 39): HTTP status checks, throw on non-200
- `useLiveData` hook: attempts retry on failure, caches last successful data

## Cross-Cutting Concerns

**Logging:**
- No centralized logger (console.log in development)
- API routes log errors to stderr on failure

**Validation:**
- Runtime query parameter parsing: `parseInt()`, `parseFloat()`, type guards
- No schema validation library (zod not used despite being in package.json)
- Type safety via TypeScript strict mode

**Authentication:**
- Not implemented; database models exist (User) but no auth layer active
- All API routes public/unauthenticated
- Next-auth in package.json but not configured

**Caching:**
- API routes use `next: { revalidate: 3600 }` for 1-hour server-side cache
- Client-side: hook caches data until manual refresh or parameter change
- External API responses cached at source (Open-Meteo, Energi Data Service) via HTTP headers

**Rate Limiting:**
- No rate limiting implemented
- Relies on external API providers' limits (Open-Meteo: free tier ~100k/month; Energi Data Service: public free)

---

*Architecture analysis: 2026-01-28*
