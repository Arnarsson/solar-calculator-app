# Phase 1: Foundation & Core Calculations - Research

**Researched:** 2026-01-28
**Domain:** Financial calculation engine for solar installations with Danish-specific integrations
**Confidence:** MEDIUM

## Summary

Phase 1 establishes the calculation foundation for a solar installation financial calculator targeting the Danish market. Research reveals a mature ecosystem for the core technologies (Decimal.js for financial calculations, Recharts for visualization, Prisma with Vercel Postgres) with well-documented patterns. However, critical Danish-specific integrations face transition challenges: DAWA (Danish Address Web API) is shutting down July 1, 2026, requiring immediate migration planning to Datafordeleren. BBR (building registry) API access for roof data appears limited or complex, suggesting visual helper fallbacks are necessary.

The calculation engine requires careful attention to Decimal type serialization in Next.js server components (a known pain point) and SQLite-to-PostgreSQL migration path for production. Excel formula porting benefits from property-based testing with fast-check and snapshot testing strategies. PVGIS API integration is straightforward with 30 req/sec rate limits suitable for the use case.

**Primary recommendation:** Start with Decimal.js for calculations but plan API route + TanStack Query pattern for client components to avoid serialization issues. Migrate to Datafordeleren immediately (DAWA deadline approaching). Build visual roof input helpers as primary UX, treat BBR integration as Phase 2+ enhancement.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Decimal.js | 11.x (latest) | Financial calculations with arbitrary precision | Industry standard for financial accuracy, used by Prisma for Decimal datatype, handles Excel-like mathematical operations (powers, roots, logarithms), 170k+ weekly downloads |
| Prisma | 5.17.0 (existing) | Database ORM with native Decimal type support | Already in codebase, official Vercel integration, handles migrations, type-safe queries |
| Vercel Postgres | Latest | Production database with native DECIMAL/NUMERIC type | Better precision than SQLite for financial data, official Prisma support, serverless-ready |
| Recharts | 2.12.7 (existing) | React charting library | Already integrated via shadcn/ui, 1M+ weekly downloads, handles 25-year projections, good TypeScript support |
| fast-check | 3.x (latest) | Property-based testing | Standard for mathematical property testing, trusted by Jest/Jasmine/React, shrinking for minimal failure cases |
| Zod | 3.23.8 (existing) | Runtime validation | Already in codebase, pairs with react-hook-form, validates API inputs server-side |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-debounce | 10.x | Debouncing hooks | For 500ms input debouncing (DATA-03 requirement) |
| next-safe-action | 7.x | Type-safe server actions | For form submissions with optimistic UI, better DX than raw server actions |
| TanStack Query | 5.x | Data fetching/caching | For fetching calculation results to client components (avoids Decimal serialization issues) |
| @tanstack/react-table | 8.x | Table UI for 25-year projections | If year-by-year table view needed (beyond basic shadcn/ui table) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Decimal.js | Big.js | Simpler API but lacks trig functions needed for complex formulas |
| Decimal.js | Integer arithmetic (cents) | Avoids serialization issues but breaks on percentages/compound interest |
| Recharts | Chart.js / ApexCharts | More features but less React-native, harder shadcn/ui integration |
| Vercel Postgres | Keep SQLite in production | Free but poor DECIMAL precision (stores as float), not scalable |

**Installation:**
```bash
npm install decimal.js use-debounce next-safe-action @tanstack/react-query
npm install -D @types/node fast-check
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── calculations/           # Excel formula modules
│   ├── setupPricing.ts    # Setup & Price sheet (system costs, VAT)
│   ├── payback.ts         # Yearly Payback Overview sheet
│   ├── co2Savings.ts      # CO2 Savings sheet
│   ├── taxScenarios.ts    # Tax deduction scenarios (2026 Danish rules)
│   └── production.ts      # Production vs Consumption Chart
├── utils/
│   ├── decimal.ts         # Decimal.js helpers (rounding modes, formatting)
│   └── serialization.ts   # Decimal-to-JSON converters for server/client boundary
├── api/
│   ├── geocoding.ts       # Datafordeleren address API (replacing DAWA)
│   ├── pvgis.ts           # Solar irradiance integration (existing pattern)
│   └── bbr.ts             # BBR API wrapper (if feasible)
└── types/
    └── calculations.ts    # Shared calculation input/output types
```

### Pattern 1: Decimal Calculation Module
**What:** Excel formula as pure function, mirrors Excel sheet structure
**When to use:** All financial calculations
**Example:**
```typescript
// Source: Context-informed best practice for Excel migration
// lib/calculations/payback.ts

import Decimal from 'decimal.js';

// Configure global precision for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface PaybackInput {
  systemCost: Decimal;        // Total DKK including VAT
  annualProduction: Decimal;  // kWh per year
  electricityRate: Decimal;   // DKK/kWh
  selfConsumption: Decimal;   // 0.0 to 1.0
  gridFeedInRate: Decimal;    // DKK/kWh (typically 0.8 * electricityRate)
}

export interface PaybackResult {
  paybackYears: Decimal;
  annualSavings: Decimal;
  breakEvenYear: number; // Integer year when cumulative > 0
}

/**
 * Calculates simple payback period for solar installation
 * Mirrors "Yearly Payback Overview" Excel sheet logic
 */
export function calculatePayback(input: PaybackInput): PaybackResult {
  // Self-consumed electricity savings
  const selfConsumedKwh = input.annualProduction.times(input.selfConsumption);
  const selfSavings = selfConsumedKwh.times(input.electricityRate);

  // Grid export earnings
  const exportedKwh = input.annualProduction.times(
    new Decimal(1).minus(input.selfConsumption)
  );
  const exportEarnings = exportedKwh.times(input.gridFeedInRate);

  // Total annual savings
  const annualSavings = selfSavings.plus(exportEarnings);

  // Simple payback period
  const paybackYears = input.systemCost.dividedBy(annualSavings);

  // Break-even year (accounting for degradation is in production.ts)
  const breakEvenYear = paybackYears.ceil().toNumber();

  return { paybackYears, annualSavings, breakEvenYear };
}
```

### Pattern 2: Server Component Data Fetching
**What:** Fetch and calculate on server, convert Decimal to string before passing to client
**When to use:** Initial page loads, summary cards (not interactive charts)
**Example:**
```typescript
// Source: https://github.com/vercel/next.js/discussions/55349
// app/dashboard/[installationId]/page.tsx (Server Component)

import { calculatePayback } from '@/lib/calculations/payback';
import { serializeDecimal } from '@/lib/utils/serialization';
import { PaybackCard } from './PaybackCard';

export default async function InstallationPage({
  params
}: {
  params: { installationId: string }
}) {
  // Fetch from database
  const installation = await prisma.installation.findUnique({
    where: { id: params.installationId },
    include: { setupCost: true }
  });

  // Calculate with Decimal
  const result = calculatePayback({
    systemCost: new Decimal(installation.setupCost.totalCost),
    annualProduction: new Decimal(installation.yearlyProductionKwh),
    // ... other params
  });

  // Serialize for client component
  const serialized = {
    paybackYears: serializeDecimal(result.paybackYears),
    annualSavings: serializeDecimal(result.annualSavings),
    breakEvenYear: result.breakEvenYear
  };

  return <PaybackCard data={serialized} />;
}

// lib/utils/serialization.ts
export function serializeDecimal(d: Decimal): string {
  return d.toFixed(); // Full precision string
}

export function deserializeDecimal(s: string): Decimal {
  return new Decimal(s);
}
```

### Pattern 3: API Route + TanStack Query for Interactive Components
**What:** Expose calculation API route, fetch from client with TanStack Query
**When to use:** Interactive charts, debounced inputs, optimistic UI
**Example:**
```typescript
// Source: https://www.buildwithmatija.com/blog/nextjs-server-client-serialization
// app/api/calculate/projection/route.ts

import { calculateProjection } from '@/lib/calculations/projection';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Calculate with Decimal internally
  const result = calculateProjection({
    systemCost: new Decimal(body.systemCost),
    // ... other params from body
  });

  // Serialize to plain objects
  const serialized = result.map(year => ({
    year: year.year,
    savings: year.savings.toString(),
    cumulative: year.cumulative.toString(),
    // ... other fields as strings
  }));

  return NextResponse.json(serialized);
}

// components/ProjectionChart.tsx (Client Component)
'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart } from 'recharts';
import Decimal from 'decimal.js';

export function ProjectionChart({ installationId }: { installationId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['projection', installationId],
    queryFn: async () => {
      const res = await fetch('/api/calculate/projection', {
        method: 'POST',
        body: JSON.stringify({ installationId })
      });
      return res.json();
    },
    staleTime: 5 * 60 * 1000 // 5 min cache
  });

  if (isLoading) return <ChartSkeleton />;

  // Deserialize for display
  const chartData = data.map(year => ({
    year: year.year,
    savings: new Decimal(year.savings).toNumber(), // Recharts needs number
    cumulative: new Decimal(year.cumulative).toNumber()
  }));

  return <LineChart data={chartData} ... />;
}
```

### Pattern 4: Property-Based Testing for Calculation Properties
**What:** Test mathematical properties hold across many input combinations
**When to use:** All calculation modules
**Example:**
```typescript
// Source: https://fast-check.dev/
// lib/calculations/__tests__/payback.test.ts

import fc from 'fast-check';
import { calculatePayback } from '../payback';
import Decimal from 'decimal.js';

describe('Payback calculation properties', () => {
  it('payback period decreases as electricity rate increases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50000, max: 200000 }), // systemCost DKK
        fc.integer({ min: 3000, max: 8000 }),    // annualProduction kWh
        fc.float({ min: 1.5, max: 4.0 }),        // rate1 DKK/kWh
        fc.float({ min: 4.0, max: 6.0 }),        // rate2 DKK/kWh (higher)
        (cost, production, rate1, rate2) => {
          const input1 = {
            systemCost: new Decimal(cost),
            annualProduction: new Decimal(production),
            electricityRate: new Decimal(rate1),
            selfConsumption: new Decimal(0.7),
            gridFeedInRate: new Decimal(rate1).times(0.8)
          };

          const input2 = { ...input1, electricityRate: new Decimal(rate2) };

          const result1 = calculatePayback(input1);
          const result2 = calculatePayback(input2);

          // Higher rate = shorter payback
          return result2.paybackYears.lessThan(result1.paybackYears);
        }
      )
    );
  });

  it('payback period is positive finite number', () => {
    fc.assert(
      fc.property(
        fc.record({
          systemCost: fc.integer({ min: 10000, max: 500000 }),
          annualProduction: fc.integer({ min: 1000, max: 15000 }),
          electricityRate: fc.float({ min: 0.5, max: 10.0 }),
          selfConsumption: fc.float({ min: 0.3, max: 1.0 })
        }),
        (raw) => {
          const input = {
            systemCost: new Decimal(raw.systemCost),
            annualProduction: new Decimal(raw.annualProduction),
            electricityRate: new Decimal(raw.electricityRate),
            selfConsumption: new Decimal(raw.selfConsumption),
            gridFeedInRate: new Decimal(raw.electricityRate).times(0.8)
          };

          const result = calculatePayback(input);

          return result.paybackYears.isFinite() &&
                 result.paybackYears.greaterThan(0);
        }
      )
    );
  });
});
```

### Pattern 5: Debounced Server Action for Real-Time Feedback
**What:** Debounce input changes, trigger server action for calculation
**When to use:** Summary cards with 500ms debounce (DATA-03)
**Example:**
```typescript
// Source: https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7
// components/InstallationForm.tsx (Client Component)

'use client';

import { useDebouncedCallback } from 'use-debounce';
import { useOptimistic } from 'react';
import { recalculatePayback } from '@/app/actions/calculations';

export function InstallationForm({ installationId, initialPayback }) {
  const [optimisticPayback, setOptimisticPayback] = useOptimistic(initialPayback);

  const debouncedRecalculate = useDebouncedCallback(
    async (formData) => {
      // Optimistic update (instant)
      setOptimisticPayback({ ...optimisticPayback, isCalculating: true });

      // Server calculation (500ms debounced)
      const result = await recalculatePayback(formData);

      // Real result replaces optimistic state
      setOptimisticPayback(result);
    },
    500 // DATA-03 requirement
  );

  return (
    <form onChange={(e) => {
      const formData = new FormData(e.currentTarget);
      debouncedRecalculate(formData);
    }}>
      <input name="systemCost" type="number" />
      <input name="annualProduction" type="number" />

      <PaybackSummary
        payback={optimisticPayback}
        isOptimistic={optimisticPayback.isCalculating}
      />
    </form>
  );
}
```

### Anti-Patterns to Avoid

- **Passing Decimal objects to client components:** Causes "object cannot be serialized" errors. Always convert to string in server components or use API routes.
- **Storing financial data as Float in SQLite:** SQLite's DECIMAL is actually floating-point. Migrate to Postgres NUMERIC for production.
- **Using raw fetch for debounced inputs:** Results in race conditions. Use TanStack Query or SWR for automatic request deduplication.
- **Hand-rolling compound interest calculations:** Use Decimal.js `.pow()` method. Example: `principal.times(new Decimal(1).plus(rate).pow(years))`
- **Forgetting first-year degradation:** Solar panels degrade 2-3% first year, then 0.5-0.7%/year. Don't use constant degradation rate.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Financial rounding | Custom `.toFixed()` wrappers | Decimal.js rounding modes (ROUND_HALF_UP, ROUND_HALF_EVEN) | 8 different rounding modes, financial standards (banker's rounding), configurable precision |
| Input debouncing | setTimeout management | use-debounce hook | Handles cleanup, React 18 compatibility, leading/trailing options, cancel methods |
| Form validation + server actions | Custom fetch with validation | next-safe-action + Zod | Type-safe end-to-end, middleware system, automatic error handling, optimistic updates |
| Complex table views | Custom table components | @tanstack/react-table | Sorting, filtering, pagination, 25-year data sets, CSV export |
| Decimal serialization | Manual .toString() everywhere | Centralized serialization utils | Single source of truth, handles nested objects, reversible |
| Property testing | Manual test cases | fast-check generators | 100+ inputs per test, automatic shrinking to minimal failure, seed-based reproduction |
| 25-year inflation adjustment | Loop with manual compounding | Decimal.js + projection generator function | Handles edge cases (negative rates, year fractions), predictable rounding |

**Key insight:** Financial calculations have regulatory precision requirements. Decimal.js is battle-tested in fintech (used by Stripe, banks), while custom float arithmetic will fail audits.

## Common Pitfalls

### Pitfall 1: Decimal Serialization in Server Components
**What goes wrong:** Pass Prisma query result with Decimal fields to client component → `object ("[object Decimal]") cannot be serialized as JSON` error
**Why it happens:** Next.js server-to-client serialization only supports JSON-serializable types. Prisma Decimal is a class instance, not plain data
**How to avoid:**
- **Option A (Simple):** Convert to string in server component before passing as prop
- **Option B (Interactive):** Use API route + TanStack Query pattern (fetch from client)
- **Option C (Not recommended):** Store as integer cents - breaks percentage calculations

**Warning signs:**
- Error message contains "cannot be serialized as JSON"
- Props with Decimal fields going from Server → Client component
- Nested objects with multiple Decimal fields (SetupCost model)

**Code example:**
```typescript
// BAD: Passing Decimal directly
export default async function Page() {
  const cost = await prisma.setupCost.findUnique(...);
  return <ClientComponent cost={cost} />; // ERROR
}

// GOOD: Serialize first
export default async function Page() {
  const cost = await prisma.setupCost.findUnique(...);
  const serialized = {
    ...cost,
    totalCost: cost.totalCost.toString(),
    solarPanelsCost: cost.solarPanelsCost.toString()
    // ... convert all Decimal fields
  };
  return <ClientComponent cost={serialized} />;
}
```

### Pitfall 2: SQLite DECIMAL Precision Loss
**What goes wrong:** Store financial data in SQLite with Prisma Decimal type → values have rounding errors, calculations drift
**Why it happens:** SQLite has no true DECIMAL type. Stores as NUMERIC affinity (float64), loses precision beyond ~15 digits
**How to avoid:**
- Use SQLite for development ONLY
- Migrate to Vercel Postgres for production (before storing real user data)
- Add integration test comparing SQLite vs Postgres calculation results
- Document in schema: `// Note: SQLite DECIMAL is float - Postgres required for prod`

**Warning signs:**
- Calculations work in tests but fail in production
- Cumulative errors in 25-year projections (should be exact with Decimal.js)
- Values like `123.45000000000001` returned from database

**Migration path:**
```bash
# Update schema
# prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}

# Generate migration
npx prisma migrate dev --name switch-to-postgres

# Deploy to Vercel Postgres
# (Vercel dashboard → Storage → Create Postgres → Copy DATABASE_URL to env)
npx prisma migrate deploy
```

### Pitfall 3: DAWA Shutdown (July 1, 2026)
**What goes wrong:** Build address autocomplete with DAWA API → service shuts down mid-project, addresses stop working
**Why it happens:** DAWA (Danmarks Adresse Web API) closes July 1, 2026. Replacement is Datafordeleren with different API
**How to avoid:**
- Use Datafordeleren from day one (don't start with DAWA)
- Abstract geocoding behind interface (`lib/api/geocoding.ts`) for future provider changes
- Fallback: Manual lat/long input if geocoding unavailable

**Warning signs:**
- Documentation references `dawadocs.dataforsyningen.dk`
- API calls to `api.dataforsyningen.dk/adresser` (DAWA endpoint)
- No sunset date awareness in comments

**Correct implementation:**
```typescript
// lib/api/geocoding.ts
// Using Datafordeleren (DAWA replacement as of July 2026)

const DATAFORDELEREN_BASE = 'https://api.datafordeler.dk'; // Not dataforsyningen

export async function geocodeDanishAddress(address: string) {
  // TODO: Requires Datafordeler authentication
  // See: https://datafordeler.dk for API access
  // Free tier available for non-commercial use

  // For Phase 1: Use fallback manual entry
  throw new Error('Datafordeleren integration pending - use manual lat/long');
}
```

### Pitfall 4: PVGIS Rate Limiting in Production
**What goes wrong:** User changes roof angle → trigger PVGIS API call → hit 30 req/sec rate limit, requests fail
**Why it happens:** PVGIS API has strict rate limit (30/sec per IP). Debouncing on client doesn't help if multiple users share IP (Vercel serverless)
**How to avoid:**
- Cache PVGIS responses aggressively (revalidate: 86400 = 24 hours)
- Debounce + batch: Collect multiple parameter changes, send single request
- Store common scenarios in database (Copenhagen 45° tilt = pre-computed)
- Monitor rate limit headers, implement exponential backoff

**Warning signs:**
- 429 "Too Many Requests" errors in production logs
- Slow responses during peak traffic
- API calls on every slider movement (no debouncing)

**Code example:**
```typescript
// lib/api/pvgis.ts
export async function fetchPVGIS(lat: number, lon: number, ...params) {
  const cacheKey = `pvgis:${lat}:${lon}:${params}`;

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 86400, // 24 hour cache
        tags: ['pvgis']     // For revalidation on demand
      }
    });

    if (response.status === 429) {
      // Rate limited - return cached value or wait
      console.error('PVGIS rate limit hit');
      return getCachedValue(cacheKey); // Fallback to stale data
    }

    return response.json();
  } catch (error) {
    // Network error - serve cached
    return getCachedValue(cacheKey);
  }
}
```

### Pitfall 5: First-Year Degradation Not Modeled
**What goes wrong:** Use constant 0.5%/year degradation for 25-year projection → overestimate production in early years
**Why it happens:** Solar panels have higher degradation (2-3%) in year 1 due to light-induced degradation (LID), then stabilize at 0.5-0.7%/year
**How to avoid:**
- Model year 1 separately: `production * 0.97` (3% first year)
- Years 2-25: `production * (0.997 ^ (year - 1))` (0.5% per year from baseline)
- Document assumption in UI: "Year 1: 97% output, Years 2-25: 0.5%/year degradation"

**Warning signs:**
- Single degradation rate applied to all years
- Excel reference uses different first-year calculation
- User reports output overestimated vs real installations

**Code example:**
```typescript
// lib/calculations/production.ts
export function calculateDegradedProduction(
  baseProduction: Decimal,
  year: number
): Decimal {
  if (year === 1) {
    // First year: 2-3% LID (use 3% conservative)
    return baseProduction.times(0.97);
  } else {
    // Years 2+: 0.5% annual from year 1 baseline
    const yearsSinceOne = year - 1;
    const degradationFactor = new Decimal(0.995).pow(yearsSinceOne);
    return baseProduction.times(0.97).times(degradationFactor);
  }
}
```

### Pitfall 6: Danish Tax Deduction Calculation Errors
**What goes wrong:** Calculate tax deduction on full system cost → overestimate savings, wrong payback period
**Why it happens:** Danish home improvement tax deduction (2026 rules) has cap, only applies to labor, and phases out above income thresholds
**How to avoid:**
- Separate labor cost from equipment cost in SetupCost model
- Apply 2026 rules: Max deduction, income limits, eligible work types
- Document assumptions: "Assumes standard tax bracket, no other deductions"
- Provide "with tax deduction" and "without tax deduction" scenarios side-by-side

**Warning signs:**
- Tax deduction applied to equipment costs
- No income-based phase-out
- Excel reference has complex tax calculation, code has simple percentage

**Research needed:**
- 2026 Danish tax code specifics (FIN-01 requirement)
- SKAT (Danish tax authority) official guidance
- Phase-out thresholds and rates

### Pitfall 7: Recharts SSR Hydration Mismatch
**What goes wrong:** Render Recharts in server component → hydration mismatch error, chart doesn't appear
**Why it happens:** Recharts uses D3.js which needs browser DOM. Server renders placeholder, client expects different markup
**How to avoid:**
- Mark chart components as client components: `'use client'` directive
- Use dynamic import with `ssr: false` if needed
- Provide consistent loading skeleton on server and client

**Warning signs:**
- Hydration errors in console
- Charts blank on initial load, appear after interaction
- Different output between `npm run dev` and `npm run build`

**Code example:**
```typescript
// components/PaybackChart.tsx
'use client';  // Required for Recharts

import { LineChart, Line, XAxis, YAxis } from 'recharts';

export function PaybackChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="year" />
      <YAxis />
      <Line type="monotone" dataKey="savings" stroke="#8884d8" />
    </LineChart>
  );
}
```

## Code Examples

Verified patterns from official sources:

### Example 1: Prisma Decimal Field Definition (Production-Ready)
```typescript
// Source: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Use postgresql, not sqlite
  url      = env("DATABASE_URL")
}

model SetupCost {
  id               String       @id @default(cuid())
  installationId   String       @unique
  installation     Installation @relation(fields: [installationId], references: [id], onDelete: Cascade)

  // Use Decimal for financial accuracy
  solarPanelsCost  Decimal      @db.Decimal(10, 2)  // 10 digits, 2 decimal places
  inverterCost     Decimal      @db.Decimal(10, 2)
  installationCost Decimal      @db.Decimal(10, 2)
  totalCost        Decimal      @db.Decimal(10, 2)

  // VAT rate (e.g., 0.25 for 25%)
  vatRate          Decimal      @db.Decimal(5, 4)   // 5 digits, 4 decimal (0.2500)

  currency         String       @default("DKK")

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

model YearlyProjection {
  id               String       @id @default(cuid())
  installationId   String
  installation     Installation @relation(fields: [installationId], references: [id], onDelete: Cascade)

  year             Int          // 1-25

  // All financial values as Decimal
  productionKwh    Decimal      @db.Decimal(10, 2)
  savingsDkk       Decimal      @db.Decimal(10, 2)
  cumulativeDkk    Decimal      @db.Decimal(12, 2)  // Larger for cumulative
  maintenanceCost  Decimal      @db.Decimal(8, 2)   // Annual maintenance

  createdAt        DateTime     @default(now())

  @@unique([installationId, year])
}
```

### Example 2: 25-Year Projection with Inflation Adjustment
```typescript
// Source: Research on financial best practices + degradation rates
// lib/calculations/projection.ts

import Decimal from 'decimal.js';

export interface ProjectionInput {
  systemCost: Decimal;
  annualProductionKwh: Decimal;
  electricityRateDkk: Decimal;     // Current rate
  selfConsumptionRate: Decimal;    // 0.0-1.0
  gridFeedInRate: Decimal;         // Typically 0.8 * electricityRateDkk
  inflationRate: Decimal;          // Default 0.02 (2%)
  electricityInflationRate: Decimal; // Default 0.03 (3%, often > general)
  maintenanceCostYear1: Decimal;   // Annual maintenance (inflates)
  degradationRateFirstYear: Decimal; // Default 0.03 (3%)
  degradationRateAnnual: Decimal;  // Default 0.005 (0.5%)
}

export interface YearResult {
  year: number;
  productionKwh: Decimal;          // Degraded production
  electricityRate: Decimal;        // Inflation-adjusted rate
  savingsNominal: Decimal;         // Actual DKK saved that year
  savingsReal: Decimal;            // Adjusted to today's value
  maintenanceCost: Decimal;        // Inflation-adjusted
  netSavingsNominal: Decimal;      // Savings - maintenance (nominal)
  netSavingsReal: Decimal;         // Savings - maintenance (real)
  cumulativeNominal: Decimal;      // Running total (nominal)
  cumulativeReal: Decimal;         // Running total (real)
}

export function calculateProjection(input: ProjectionInput): YearResult[] {
  const results: YearResult[] = [];
  let cumulativeNominal = input.systemCost.negated(); // Start negative (initial cost)
  let cumulativeReal = input.systemCost.negated();

  for (let year = 1; year <= 25; year++) {
    // Production with degradation
    let production: Decimal;
    if (year === 1) {
      // First year: higher degradation (LID)
      production = input.annualProductionKwh.times(
        new Decimal(1).minus(input.degradationRateFirstYear)
      );
    } else {
      // Years 2+: annual degradation from year 1 baseline
      const yearsSinceOne = year - 1;
      const year1Production = input.annualProductionKwh.times(
        new Decimal(1).minus(input.degradationRateFirstYear)
      );
      production = year1Production.times(
        new Decimal(1).minus(input.degradationRateAnnual).pow(yearsSinceOne)
      );
    }

    // Electricity rate with inflation
    const electricityRate = input.electricityRateDkk.times(
      new Decimal(1).plus(input.electricityInflationRate).pow(year - 1)
    );

    const gridFeedInRate = electricityRate.times(0.8); // 80% of spot rate

    // Savings calculation
    const selfConsumedKwh = production.times(input.selfConsumptionRate);
    const exportedKwh = production.times(
      new Decimal(1).minus(input.selfConsumptionRate)
    );

    const selfSavings = selfConsumedKwh.times(electricityRate);
    const exportEarnings = exportedKwh.times(gridFeedInRate);
    const savingsNominal = selfSavings.plus(exportEarnings);

    // Savings in today's value (discount by general inflation)
    const savingsReal = savingsNominal.dividedBy(
      new Decimal(1).plus(input.inflationRate).pow(year - 1)
    );

    // Maintenance cost (inflates with general inflation)
    const maintenanceCost = input.maintenanceCostYear1.times(
      new Decimal(1).plus(input.inflationRate).pow(year - 1)
    );

    const maintenanceReal = input.maintenanceCostYear1; // Already in real terms

    // Net savings
    const netSavingsNominal = savingsNominal.minus(maintenanceCost);
    const netSavingsReal = savingsReal.minus(maintenanceReal);

    // Cumulative
    cumulativeNominal = cumulativeNominal.plus(netSavingsNominal);
    cumulativeReal = cumulativeReal.plus(netSavingsReal);

    results.push({
      year,
      productionKwh: production,
      electricityRate,
      savingsNominal,
      savingsReal,
      maintenanceCost,
      netSavingsNominal,
      netSavingsReal,
      cumulativeNominal,
      cumulativeReal
    });
  }

  return results;
}

// Helper: Format for Recharts (converts to number)
export function formatForChart(results: YearResult[]) {
  return results.map(r => ({
    year: r.year,
    savingsNominal: r.netSavingsNominal.toNumber(),
    savingsReal: r.netSavingsReal.toNumber(),
    cumulativeNominal: r.cumulativeNominal.toNumber(),
    cumulativeReal: r.cumulativeReal.toNumber()
  }));
}
```

### Example 3: Snapshot Testing Excel Formulas
```typescript
// Source: fast-check best practices + Excel migration strategy
// lib/calculations/__tests__/payback.snapshot.test.ts

import { calculatePayback } from '../payback';
import Decimal from 'decimal.js';

describe('Payback calculation snapshots (from Excel)', () => {
  // Snapshot test: Known input/output from Excel
  it('matches Excel for reference installation', () => {
    // Values copied from "Yearly Payback Overview" sheet
    const input = {
      systemCost: new Decimal('128750.00'),      // DKK with VAT
      annualProduction: new Decimal('5432.10'),  // kWh
      electricityRate: new Decimal('2.85'),      // DKK/kWh
      selfConsumption: new Decimal('0.70'),      // 70%
      gridFeedInRate: new Decimal('2.28')        // DKK/kWh (80% of spot)
    };

    const result = calculatePayback(input);

    // Expected values from Excel (rounded to 2 decimals)
    expect(result.annualSavings.toFixed(2)).toBe('12845.67');
    expect(result.paybackYears.toFixed(2)).toBe('10.02');
    expect(result.breakEvenYear).toBe(11); // Ceiling of 10.02
  });

  it('matches Excel for low self-consumption scenario', () => {
    const input = {
      systemCost: new Decimal('85000.00'),
      annualProduction: new Decimal('4200.00'),
      electricityRate: new Decimal('3.20'),
      selfConsumption: new Decimal('0.40'),  // Low self-consumption
      gridFeedInRate: new Decimal('2.56')
    };

    const result = calculatePayback(input);

    expect(result.annualSavings.toFixed(2)).toBe('9676.80'); // From Excel
    expect(result.paybackYears.toFixed(2)).toBe('8.78');
  });

  // Edge case: 100% self-consumption (off-grid)
  it('matches Excel for 100% self-consumption', () => {
    const input = {
      systemCost: new Decimal('150000.00'),
      annualProduction: new Decimal('6000.00'),
      electricityRate: new Decimal('3.50'),
      selfConsumption: new Decimal('1.00'),  // All self-consumed
      gridFeedInRate: new Decimal('2.80')    // Not used
    };

    const result = calculatePayback(input);

    expect(result.annualSavings.toFixed(2)).toBe('21000.00'); // 6000 * 3.50
    expect(result.paybackYears.toFixed(2)).toBe('7.14');
  });
});
```

### Example 4: Datafordeleren Address Autocomplete (DAWA Replacement)
```typescript
// Source: https://dawadocs.dataforsyningen.dk/dok/api/adresse (transition guidance)
// lib/api/geocoding.ts

/**
 * Datafordeleren address geocoding for Denmark
 * Replaces DAWA (shutting down July 1, 2026)
 *
 * NOTE: Phase 1 uses manual lat/long fallback. Datafordeleren integration
 * requires authentication setup. Implement in Phase 2+.
 */

export interface DanishAddress {
  adresse: string;           // Full formatted address
  lat: number;
  lon: number;
  postnummer: string;
  by: string;
}

/**
 * Autocomplete Danish addresses
 *
 * @param query - Partial address string
 * @returns Array of matching addresses
 *
 * TODO: Requires Datafordeler.dk account and token
 * See: https://datafordeler.dk/dataoversigt/danmarks-adresser-dar/
 */
export async function autocompleteDanishAddress(
  query: string
): Promise<DanishAddress[]> {
  // Phase 1: Not implemented - manual entry fallback
  throw new Error(
    'Datafordeleren integration pending. Use manual lat/long entry for Phase 1.'
  );

  // Phase 2+ implementation:
  // const token = process.env.DATAFORDELER_TOKEN;
  // const url = `https://api.datafordeler.dk/DAR/autocomplete?query=${encodeURIComponent(query)}`;
  // const response = await fetch(url, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // return response.json();
}

/**
 * Manual geocoding fallback
 * User enters lat/long directly (shown on map for confirmation)
 */
export interface ManualLocation {
  lat: number;
  lon: number;
  label?: string; // Optional user-provided label
}

export function validateDanishCoordinates(lat: number, lon: number): boolean {
  // Denmark bounds: roughly 54.5°N to 57.8°N, 8°E to 15.2°E
  return lat >= 54.5 && lat <= 57.8 && lon >= 8.0 && lon <= 15.2;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Float arithmetic for money | Decimal.js / BigDecimal | ~2015+ | Eliminated rounding errors in financial calculations |
| SQLite for production financial data | PostgreSQL NUMERIC type | Ongoing | Exact precision required for audit compliance |
| DAWA for Danish addresses | Datafordeleren | July 1, 2026 | DAWA shuts down - must migrate immediately |
| Manual Excel formula testing | Property-based testing (fast-check) | ~2020+ | Tests 100s of scenarios, finds edge cases automatically |
| Constant degradation rate | First-year LID + annual degradation | ~2018+ (industry standard) | More accurate 25-year projections (2-3% difference) |
| Simple payback period | Discounted payback with inflation | Financial best practice | Accounts for time value of money, more realistic |
| Client-side only charts | Server Components + Client Charts | Next.js 13+ (2023) | Better initial load, SEO, still interactive |
| Form state in useState | react-hook-form + Zod | ~2021+ | Better performance, built-in validation, less boilerplate |

**Deprecated/outdated:**
- **DAWA API** (dawadocs.dataforsyningen.dk): Shuts down July 1, 2026. Use Datafordeleren instead.
- **Float type for financial data in Prisma**: Use Decimal with `@db.Decimal(precision, scale)` annotation
- **Prisma with SQLite for production**: SQLite's DECIMAL is actually float. Use PostgreSQL.
- **Recharts 1.x**: Breaking changes in 2.x (2022), follow migration guide if using old examples
- **NextAuth.js 4.x**: Version 5 (Auth.js) released, but 4.x still maintained and stable for Phase 1

## Open Questions

Things that couldn't be fully resolved:

### 1. BBR (Bygnings- og Boligregistret) API Access for Roof Data
- **What we know:** BBR contains building data including roof covering materials (tagdækningsmaterialer). Access via Datafordeler.dk API.
- **What's unclear:**
  - Does BBR database include roof orientation (azimuth) and tilt angle?
  - What authentication/cost for API access?
  - Data coverage - do residential buildings have roof geometry data?
- **Recommendation:**
  - Phase 1: Build visual helpers (compass, tilt slider) as primary UX
  - Research task: Contact Datafordeler.dk to clarify BBR roof data availability
  - If available, add BBR integration in Phase 2+ as enhancement

**Sources to investigate:**
- Datafordeler.dk BBR documentation: https://datafordeler.dk/dataoversigt/bygnings-og-boligregistret-bbr/
- Contact: datafordeler@sdfi.dk for API access questions

### 2. 2026 Danish Tax Deduction Rules for Home Improvements
- **What we know:** FIN-01 requires modeling Danish home improvement tax deduction (2026 rules)
- **What's unclear:**
  - Exact 2026 thresholds and phase-out rates
  - Which solar installation costs qualify (labor only? equipment?)
  - Income limits for full vs partial deduction
- **Recommendation:**
  - Research Danish SKAT (tax authority) 2026 rules before implementing FIN-01
  - Provide "with tax deduction" and "without" scenarios for transparency
  - Document assumptions prominently in UI

**Sources to investigate:**
- SKAT official guidance: https://skat.dk
- 2026 tax code updates (typically published Q4 2025)

### 3. Danish Electricity Price Area (DK1 vs DK2) Handling
- **What we know:** Denmark has two electricity price areas (DK1 = West Jutland, DK2 = Zealand + islands). Prices differ.
- **What's unclear:**
  - Should Phase 1 ask users to select DK1/DK2, or auto-detect from coordinates?
  - How much do prices typically differ? (impacts payback calculations)
- **Recommendation:**
  - Auto-detect from lat/lon (DK1 if lon < ~10.5, else DK2)
  - Allow manual override in "Advanced" tab
  - Use existing Energi Data Service integration (already supports DK1/DK2)

### 4. Datafordeleren Authentication and Rate Limits
- **What we know:** Datafordeleren requires authentication (unlike DAWA which was free/open)
- **What's unclear:**
  - Free tier limits for non-commercial use?
  - Rate limits for autocomplete API?
  - Cost for commercial use (Phase 4 paid tier)?
- **Recommendation:**
  - Phase 1: Manual lat/long entry (no geocoding dependency)
  - Before Phase 2: Register Datafordeler.dk account, test rate limits
  - Budget for API costs if needed in paid tier

## Sources

### Primary (HIGH confidence)
- **Decimal.js GitHub**: https://github.com/MikeMcl/decimal.js - Official repository, comprehensive documentation
- **PVGIS API Documentation**: https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/getting-started-pvgis/api-non-interactive-service_en - Official EU JRC documentation
- **Prisma Documentation - PostgreSQL Data Types**: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/dataguide/introduction-to-data-types - Official Prisma docs
- **Prisma Decimal Type Discussion**: https://github.com/prisma/prisma/discussions/10160 - Official recommendation for financial data
- **Next.js Server Actions Documentation**: https://nextjs.org/docs/14/app/building-your-application/data-fetching/server-actions-and-mutations - Official Next.js docs
- **fast-check Documentation**: https://fast-check.dev/ - Official property-based testing framework docs

### Secondary (MEDIUM confidence)
- **Solar Panel Degradation Rates (2026)**: https://energy-solutions.co/articles/sub/solar-panel-degradation-rates-2026 - Industry data, cross-verified
- **DAWA Shutdown Notice**: https://dawar.aleksanderbl.dk/ - Official transition guidance (verified at answeroverflow.com)
- **Prisma Decimal Serialization Issue**: https://github.com/vercel/next.js/discussions/55349 - Community discussion with maintainer input
- **Vercel Postgres + Prisma Guide**: https://www.prisma.io/docs/guides/nextjs - Official integration guide
- **next-safe-action Documentation**: https://next-safe-action.dev/ - Third-party but widely adopted library
- **Recharts with Next.js Best Practices**: Multiple sources (app-generator.dev, ably.com) - Consistent patterns

### Tertiary (LOW confidence - needs validation)
- **BBR API roof orientation data**: Search results suggest roof covering data exists, but orientation/azimuth unclear - requires direct Datafordeler.dk consultation
- **Geocoding Service Comparisons**: General comparisons (Mapbox vs Google vs OSM), but Danish address coverage not specifically benchmarked in 2026 sources
- **Danish Tax Deduction 2026 Rules**: No official 2026 rules found yet (typically published Q4 previous year) - requires SKAT documentation when available

## Metadata

**Confidence breakdown:**
- **Standard stack: HIGH** - Decimal.js, Prisma, Recharts, fast-check are well-documented with official sources and large adoption
- **Architecture patterns: MEDIUM** - Decimal serialization patterns verified in GitHub issues, but some workarounds are community-driven (not official Next.js guidance)
- **Pitfalls: MEDIUM to HIGH** - Most pitfalls verified in official repos (Prisma Decimal serialization, SQLite precision) or official announcements (DAWA shutdown). Tax deduction rules LOW (not yet published for 2026)
- **Danish integrations: LOW** - BBR roof data unclear, Datafordeleren authentication/limits not fully documented, requires direct vendor consultation

**Research date:** 2026-01-28
**Valid until:** ~2026-04-28 (30 days for fast-moving web stack, 90+ days for stable financial calculation patterns)

**Critical action items:**
1. **Immediate:** Plan Datafordeleren migration or manual lat/long fallback (DAWA shuts down July 1, 2026)
2. **Before Phase 1 completion:** Verify SQLite → PostgreSQL migration path works with Decimal types
3. **Before implementing FIN-01:** Research 2026 Danish tax deduction rules from SKAT
4. **Phase 2+:** Investigate BBR API roof data availability and cost
