# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (`Button.tsx`, `Card.tsx`, `price-chart.tsx`)
- Utility/helper files: kebab-case with `.ts` extension (`use-live-data.ts`, `energi-data-service.ts`)
- Route handlers: `route.ts` in `app/api/[section]/route.ts` pattern
- Config files: kebab-case or descriptive names (`tailwind.config.ts`, `next.config.mjs`)

**Functions:**
- camelCase for all function names
- Exported helper functions in utility files are camelCase: `calculateProductionEstimate()`, `fetchSpotPrices()`, `getPriceStats()`
- React hooks follow `use` prefix pattern: `usePrices()`, `useSolarForecast()`, `useOptimization()`, `useLiveData()`
- API function names are descriptive: `generateSmartSchedule()`, `findOptimalChargingWindows()`, `aggregateToDailySummary()`

**Variables:**
- camelCase for all variable names: `systemSize`, `batteryCapacity`, `priceArea`, `totalCost`
- Constants in all capitals with underscores: `DEFAULT_SYSTEM_SIZE_KW`, `DEFAULT_BATTERY_CAPACITY_KWH`, `DEFAULT_LAT`, `DEFAULT_LON`, `BASE_URL`
- Boolean prefixes: `isCheap`, `isExpensive`, `isLoading`, `hasError`, `tomorrowAvailable`
- Private/internal variables: no special prefix convention used

**Types:**
- PascalCase for all type/interface names: `SetupCosts`, `PanelSpecs`, `MonthlyInput`, `MonthlyResults`, `YearlyResults`
- Interface names describe the shape of data: `HourlyPrice`, `PriceData`, `SolarHourly`, `DailySummary`, `OptimizationRecommendation`
- Union types use literals: `'DK1' | 'DK2'`, `'high' | 'medium' | 'low'`, `'excellent' | 'good' | 'fair' | 'poor'`
- API Response types: `PriceResponse`, `SolarResponse`, `OptimizeResponse` - suffixed with "Response"

## Code Style

**Formatting:**
- Prettier configured through ESLint (implicit from `eslint-config-next`)
- No explicit `.prettierrc` file; using Next.js defaults
- Imports use absolute paths with `@/` alias: `@/lib/utils`, `@/components/ui/button`, `@/hooks/use-live-data`
- Line length appears to be ~100-120 characters based on existing code

**Linting:**
- ESLint configured with `eslint-config-next/core-web-vitals` in `.eslintrc.json`
- Flat config format in `eslint.config.mjs` for ESLint 9 compatibility
- TypeScript strict mode enabled in `tsconfig.json` (`"strict": true`)
- Unused variables and imports are flagged by Next.js linting rules

## Import Organization

**Order:**
1. React/Next.js built-in imports: `import { useState } from 'react'`, `import { NextResponse } from 'next/server'`
2. Third-party packages: Radix UI, lucide-react, zod, etc.
3. Internal absolute-path imports from `@/` alias
4. Local relative imports (rarely used)

**Examples:**
- Server component imports: React hooks, Next.js utilities, then lib utilities
  ```typescript
  import { NextResponse } from 'next/server';
  import { fetchSpotPrices } from '@/lib/api/energi-data-service';
  ```
- Client component imports: React, icons, UI components, then utilities
  ```typescript
  import { useState } from 'react';
  import { Sun, Zap } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { useLiveData } from '@/hooks/use-live-data';
  ```

**Path Aliases:**
- `@/*` resolves to project root, allowing imports like `@/lib/utils`, `@/components/ui/button`
- Defined in `tsconfig.json` paths section

## Error Handling

**Patterns:**
- Try-catch blocks in async functions for API routes (see `/app/api/*/route.ts` files)
- Error objects checked with `instanceof Error` pattern:
  ```typescript
  catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
  }
  ```
- API error responses return `success: false` with error message and HTTP status code
  ```typescript
  return NextResponse.json({
    success: false,
    error: 'Failed to fetch solar forecast',
    message: error instanceof Error ? error.message : 'Unknown error',
  }, { status: 500 });
  ```
- Client-side data fetching errors set error state and logged to console
- Network errors caught and propagated as Error objects to state

## Logging

**Framework:** console methods (console.error, console.log)

**Patterns:**
- `console.error()` used for exception logging in catch blocks
- Errors logged with context: `console.error('Failed to fetch solar forecast:', error)`
- No structured logging framework (Winston, Pino) in use
- Client-side errors not explicitly logged in current implementation

## Comments

**When to Comment:**
- Function documentation: JSDoc-style comments for complex functions
- Example: `/** * Fetch spot prices from Energi Data Service */`
- Inline comments explain non-obvious logic or calculation rationale
- Constants documented with their purpose: `// Cache for 1 hour`, `// Convert MWh to kWh`
- API endpoints documented with route purpose: `// API Route: /api/solar`

**JSDoc/TSDoc:**
- Used for function documentation, parameter types, and return types
- Format: `/** * [Description] */` above function declarations
- Example from `energi-data-service.ts`:
  ```typescript
  /**
   * Fetch spot prices from Energi Data Service
   * Prices are in DKK/MWh, we convert to DKK/kWh
   */
  export async function fetchSpotPrices(...)
  ```
- Not systematically applied to every function; mainly for complex public APIs

## Function Design

**Size:** Functions range from 5-50 lines; averaging 15-25 lines
- Calculation functions (`calculateMonthlyResults`, `calculateProductionEstimate`) are 30-50 lines
- Hook functions (`usePrices`, `useSolarForecast`) are 25-35 lines
- API handler functions are 40-50 lines (including response formatting)
- Utility functions are typically 5-15 lines

**Parameters:**
- Destructuring used for complex types: `{ priceArea, systemSize, batteryCapacity } = config`
- Optional parameters have default values: `gridSellPriceRatio: number = 0.3`
- Configuration objects passed as single parameter: `config?: { priceArea?: 'DK1' | 'DK2'; systemSize?: number }`

**Return Values:**
- Calculations return objects with named properties for clarity
  ```typescript
  return {
    systemSizeKw,
    yearlyProductionKwh,
    monthlyAverageKwh: yearlyProductionKwh / 12,
  };
  ```
- Async functions return typed Promises: `Promise<HourlyPrice[]>`, `Promise<SmartSchedule>`
- Hooks return objects with named properties for easy destructuring: `{ data, loading, error, refetch }`

## Module Design

**Exports:**
- Public API functions and types exported from each module
- File `lib/calculations.ts` exports interfaces and functions: `calculateMonthlyResults()`, `calculateYearlyResults()`, `DEFAULT_SETUP_COSTS`
- File `lib/api/energi-data-service.ts` exports interfaces and functions: `fetchSpotPrices()`, `getPriceStats()`, `findOptimalChargingWindows()`
- Hooks exported from `hooks/` directory for use in client components

**Barrel Files:**
- Not extensively used; each utility/component is imported directly
- Components may be re-exported from `components/ui/` but no explicit index files observed
- Type definitions centralized in `types/index.ts` and exported for use across application

---

*Convention analysis: 2026-01-28*
