# Codebase Structure

**Analysis Date:** 2026-01-28

## Directory Layout

```
solar-calculator-app/
├── app/                            # Next.js 14 App Router
│   ├── page.tsx                    # Main dashboard (client component)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global Tailwind styles
│   └── api/                        # API routes
│       ├── solar/route.ts          # Solar forecast endpoint
│       ├── prices/route.ts         # Electricity prices endpoint
│       └── optimize/route.ts       # Smart optimization endpoint
├── components/                     # React components
│   ├── charts/
│   │   ├── production-chart.tsx    # Solar production chart (Recharts)
│   │   └── price-chart.tsx         # Electricity price chart (Recharts)
│   └── ui/                         # Radix UI primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       └── tabs.tsx
├── hooks/                          # React custom hooks
│   └── use-live-data.ts            # Data fetching & aggregation hook
├── lib/                            # Utility libraries
│   ├── api/
│   │   ├── energi-data-service.ts  # Danish electricity prices API client
│   │   ├── open-meteo.ts           # Solar radiation API client
│   │   └── optimizer.ts            # Smart optimization engine
│   ├── calculations.ts             # Solar economics calculations (ported from Excel)
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # Formatting, helper functions
├── types/
│   └── index.ts                    # TypeScript type definitions
├── prisma/
│   └── schema.prisma               # Prisma ORM database schema
├── .planning/                      # GSD documentation
│   └── codebase/                   # Architecture docs (this file's home)
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── next.config.mjs                 # Next.js config
├── tailwind.config.ts              # Tailwind CSS config
├── postcss.config.mjs              # PostCSS config
├── eslint.config.mjs               # ESLint config
└── .env.example                    # Environment variables template
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js 14 App Router application code
- Contains: Page components (Server & Client), API routes, global styles
- Key files: `page.tsx` (main dashboard), `layout.tsx` (root wrapper), `api/*` (backend endpoints)

**`app/api/`:**
- Purpose: Backend API endpoints (Next.js Route Handlers)
- Contains: GET routes for solar, prices, optimization
- Key files:
  - `solar/route.ts`: Aggregates Open-Meteo solar forecast
  - `prices/route.ts`: Fetches Energi Data Service spot prices
  - `optimize/route.ts`: Combines price + solar for smart recommendations

**`components/`:**
- Purpose: React component library
- Contains: Chart components (Recharts wrappers), UI primitives (Radix UI)
- Key files: `charts/production-chart.tsx`, `charts/price-chart.tsx`, `ui/*` (button, card, input, etc.)

**`components/charts/`:**
- Purpose: Data visualization components
- Contains: Recharts wrapper components for production/price data
- Key files:
  - `production-chart.tsx`: Renders solar irradiance/production over time
  - `price-chart.tsx`: Renders hourly electricity prices with statistics

**`components/ui/`:**
- Purpose: Reusable UI component primitives
- Contains: Radix UI wrappers styled with Tailwind
- Key files: `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `progress.tsx`, `tabs.tsx`
- Note: Shadcn/ui-like pattern (copy-paste component library)

**`hooks/`:**
- Purpose: Custom React hooks for data orchestration
- Contains: Data fetching, state management
- Key files: `use-live-data.ts` (main hook coordinating all API calls)

**`lib/`:**
- Purpose: Business logic and utilities
- Contains: API clients, calculations, formatting helpers
- Key files:
  - `api/energi-data-service.ts`: Energi Data Service API client
  - `api/open-meteo.ts`: Open-Meteo API client
  - `api/optimizer.ts`: Smart optimization logic
  - `calculations.ts`: Solar panel economics (Excel port)
  - `utils.ts`: Format currency, helpers
  - `prisma.ts`: Singleton Prisma client

**`lib/api/`:**
- Purpose: External API integrations
- Contains: Fetch wrapper clients for external services
- Key files:
  - `energi-data-service.ts`: ~208 lines, real Danish electricity prices (Nord Pool)
  - `open-meteo.ts`: ~241 lines, solar radiation forecast
  - `optimizer.ts`: ~333 lines, generates recommendations from combined data

**`types/`:**
- Purpose: Centralized TypeScript interfaces
- Contains: Data models, API response types, database schemas
- Key files: `index.ts` (User, Installation, SetupCost, MonthlyData, ApiResponse, PaginatedResponse)

**`prisma/`:**
- Purpose: ORM schema definition
- Contains: Database models, migrations
- Key files: `schema.prisma` (4 models: User, Installation, SetupCost, MonthlyData)
- Status: Database layer prepared but not actively used yet (client-side state management only)

**`.planning/codebase/`:**
- Purpose: GSD (Generalist Software Developer) documentation
- Contains: Architecture docs (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Key files: This structure document, architecture analysis

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Main dashboard UI (1099 lines, largest file)
- `app/layout.tsx`: Root layout wrapper
- `app/api/solar/route.ts`: Solar API endpoint (94 lines)
- `app/api/prices/route.ts`: Prices API endpoint (72 lines)
- `app/api/optimize/route.ts`: Optimization API endpoint (108 lines)

**Configuration:**
- `tsconfig.json`: TypeScript compiler options
- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS theme
- `package.json`: Dependencies
- `.env.example`: Environment variable template

**Core Logic:**
- `lib/calculations.ts`: Production estimates, cost calculations, yearly projections (231 lines)
- `lib/api/optimizer.ts`: Smart schedule generation, recommendations (333 lines)
- `hooks/use-live-data.ts`: Data fetching orchestration (252 lines)

**Testing:**
- No test files present (not yet implemented)

**Database:**
- `prisma/schema.prisma`: ORM schema (105 lines)
- `lib/prisma.ts`: Prisma client singleton

**Utilities:**
- `lib/utils.ts`: Currency formatting, calculation helpers (95 lines)
- `types/index.ts`: Type definitions (90 lines)

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention, lowercase)
- API routes: `route.ts` (Next.js convention, lowercase)
- Components: PascalCase (e.g., `ProductionChart.tsx`, `Button.tsx`)
- Hooks: camelCase with `use-` prefix (e.g., `use-live-data.ts`)
- Utilities: camelCase (e.g., `calculations.ts`, `energi-data-service.ts`)
- Types: PascalCase suffix `Interface` or no suffix (e.g., `OptimizationRecommendation`)

**Functions:**
- camelCase: `fetchSolarForecast()`, `generateSmartSchedule()`, `calculateProductionEstimate()`
- Hooks: `useLiveData()`
- React components: PascalCase: `ProductionChart()`, `PriceChart()`

**Variables:**
- camelCase: `systemSize`, `batteryCapacity`, `priceArea`
- Constants: UPPER_SNAKE_CASE: `DEFAULT_SYSTEM_SIZE_KW`, `DEFAULT_LAT`, `MONTH_NAMES_SHORT`
- boolean flags: camelCase prefix `is`: `isCheap`, `isExpensive`, `isLoading`

**Types:**
- Interfaces: PascalCase: `User`, `Installation`, `HourlyPrice`, `OptimizationRecommendation`
- Union types: PascalCase: `'DK1' | 'DK2'` (string literals for price areas)
- Response types suffix `Response`: `PriceResponse`, `SolarResponse`

**Directories:**
- Plural for collections: `components/`, `hooks/`, `lib/api/`
- Feature-based: `api/solar/`, `api/prices/`, `charts/`, `ui/`
- Single lowercase: `types/`, `prisma/`

## Where to Add New Code

**New Feature (e.g., Battery Simulation):**
- Primary code: `lib/api/battery-optimizer.ts` (new optimization logic)
- UI component: `components/battery-sim.tsx`
- API route: `app/api/battery-sim/route.ts` (if server-side calculation needed)
- Hook: `hooks/use-battery-sim.ts` (if data fetching needed)
- Tests: `__tests__/battery-optimizer.test.ts` (create when testing framework added)

**New Component/Module:**
- UI Component: `components/[feature-name].tsx` (follows PascalCase)
- Chart Component: `components/charts/[name]-chart.tsx`
- Library Function: `lib/[domain].ts` or `lib/[domain]/[module].ts`
- API Integration: `lib/api/[service-name].ts`
- Hook: `hooks/use-[feature-name].ts`

**Utilities/Helpers:**
- Shared calculations: `lib/calculations.ts` (existing aggregation point)
- Format/display helpers: `lib/utils.ts` (existing)
- Shared types: `types/index.ts` (existing)

**API Endpoints:**
- Solar-related: `app/api/solar/`
- Price-related: `app/api/prices/`
- Optimization: `app/api/optimize/`
- New domain: `app/api/[domain]/route.ts`

## Special Directories

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes
- Committed: No
- Note: Contains ~400+ packages

**`.next/`:**
- Purpose: Next.js build output and server functions
- Generated: Yes
- Committed: No
- Note: Created during `npm run build`

**`.git/`:**
- Purpose: Git repository metadata
- Generated: Yes
- Committed: No

**`.planning/codebase/`:**
- Purpose: GSD documentation (architecture analysis)
- Generated: Manually via `/gsd:map-codebase`
- Committed: Yes (tracked in version control)

## Import Patterns

**Absolute path aliases:**
- `@/*` maps to root directory (configured in `tsconfig.json`)
- Examples:
  - `import { Button } from "@/components/ui/button"`
  - `import { useLiveData } from "@/hooks/use-live-data"`
  - `import { fetchSolarForecast } from "@/lib/api/open-meteo"`

**Standard imports:**
```typescript
// React
import { useState, useEffect } from "react";

// Third-party libraries
import { NextResponse } from 'next/server';
import { fetchSolarForecast } from '@/lib/api/open-meteo';

// Local utilities
import { formatCurrency, formatNumber } from "@/lib/utils";
import { type MonthlyResults } from "@/lib/calculations";

// Components
import { Button } from "@/components/ui/button";
import { ProductionChart } from "@/components/charts/production-chart";
```

**Import organization order:**
1. React/Next.js imports
2. Third-party library imports
3. Local `lib/` utilities and types
4. Local `components/` imports
5. Local `hooks/` imports

## Code Organization by Scale

**Single File (<100 lines):**
- UI primitives: `components/ui/button.tsx`, `components/ui/input.tsx`
- Configuration: `postcss.config.mjs`, `next.config.mjs`

**Medium File (100-250 lines):**
- API routes: `app/api/prices/route.ts`, `app/api/solar/route.ts`
- Chart components: `components/charts/price-chart.tsx`
- Utilities: `lib/utils.ts`

**Large File (250-400 lines):**
- API clients: `lib/api/energi-data-service.ts`, `lib/api/open-meteo.ts`
- Optimization: `lib/api/optimizer.ts` (333 lines)
- Hooks: `hooks/use-live-data.ts` (252 lines)
- Calculations: `lib/calculations.ts` (231 lines)

**Main File (>1000 lines):**
- Dashboard: `app/page.tsx` (1099 lines, contains entire UI with multiple sections)
- Note: Consider breaking into smaller components if exceeds 1500 lines

---

*Structure analysis: 2026-01-28*
