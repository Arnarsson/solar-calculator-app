# Architecture Research

**Domain:** Financial SaaS Calculator (One-Time Purchase Model)
**Researched:** 2026-01-28
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer (React)                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ Dashboard│  │ Scenario │  │  Panel   │  │  Account/Auth    │    │
│  │   View   │  │ Comparison│ │ Browser  │  │     Pages        │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────────────┘    │
│       │             │              │              │                  │
├───────┴─────────────┴──────────────┴──────────────┴──────────────────┤
│                    Next.js Server Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────┐     │
│  │ Server         │  │  API Routes    │  │  Server Actions   │     │
│  │ Components     │  │  (External     │  │  (Mutations)      │     │
│  │ (Data Fetch)   │  │   APIs)        │  │                   │     │
│  └───────┬────────┘  └───────┬────────┘  └─────────┬─────────┘     │
│          │                    │                     │               │
├──────────┴────────────────────┴─────────────────────┴───────────────┤
│                      Middleware Layer (Auth Gate)                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐         ┌────────────────┐                        │
│  │  Session     │         │  Data Access   │                        │
│  │  Verification│ ──────> │  Layer (DAL)   │                        │
│  │  (Optimistic)│         │  (Secure)      │                        │
│  └──────────────┘         └───────┬────────┘                        │
│                                    │                                 │
├────────────────────────────────────┴─────────────────────────────────┤
│                         Data Layer (Prisma)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐     │
│  │  Users   │  │ Scenarios│  │  Panels  │  │   Payments      │     │
│  │  (Auth)  │  │ (Saved)  │  │ (Catalog)│  │  (One-Time)     │     │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│                      External Services                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐    │
│  │ Energi Data      │  │  Open-Meteo      │  │  Stripe        │    │
│  │ Service (Prices) │  │  (Solar Forecast)│  │  (Payment)     │    │
│  └──────────────────┘  └──────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Client Dashboard** | Interactive scenario configuration, real-time calculations, chart visualization | React components with hooks (use-live-data.ts), Recharts, optimistic UI |
| **Scenario Manager** | Save/load/compare multiple "what-if" scenarios | Server Actions for mutations, Server Components for fetching |
| **Panel Browser** | Search/filter/compare solar panel specifications | Client-side filtering for responsiveness, database-backed catalog |
| **Auth Gates** | Protect paid features, verify purchase status | NextAuth session + middleware for optimistic checks + DAL for secure validation |
| **API Routes** | Proxy external APIs (Energi Data Service, Open-Meteo) | Next.js API routes with caching, error handling |
| **Data Access Layer** | Single source of truth for authorization, user data access | Centralized functions using React `cache()`, database queries |
| **Prisma Models** | User accounts, saved scenarios, panel specs, payment records | SQLite (dev) → PostgreSQL (production), relational schema |
| **Payment Gateway** | One-time purchase processing, webhook handling | Stripe Checkout with server-side validation |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth-gated routes group
│   │   ├── dashboard/          # Main calculator interface
│   │   ├── scenarios/          # Scenario management
│   │   ├── panels/             # Panel database browser
│   │   └── account/            # User settings
│   ├── (public)/               # Public routes group
│   │   ├── login/
│   │   ├── signup/
│   │   └── pricing/            # Purchase page
│   ├── api/                    # API Routes
│   │   ├── prices/             # Energi Data Service proxy
│   │   ├── solar/              # Open-Meteo proxy
│   │   ├── webhooks/           # Stripe webhooks
│   │   └── optimize/           # Complex calculations
│   ├── actions/                # Server Actions
│   │   ├── scenarios.ts        # CRUD for scenarios
│   │   ├── panels.ts           # Panel operations
│   │   └── auth.ts             # Login/signup
│   └── middleware.ts           # Auth + payment verification
├── components/
│   ├── calculator/             # Main calculator UI
│   ├── scenarios/              # Scenario comparison views
│   ├── panels/                 # Panel browser components
│   ├── charts/                 # Recharts wrappers
│   └── ui/                     # Shadcn components
├── lib/
│   ├── dal.ts                  # Data Access Layer (auth checks)
│   ├── prisma.ts               # Prisma client singleton
│   ├── stripe.ts               # Stripe client + helpers
│   ├── calculations.ts         # Financial formulas (ported from Excel)
│   └── api/                    # External API clients
│       ├── energi-data-service.ts
│       └── open-meteo.ts
├── hooks/
│   ├── use-live-data.ts        # Real-time price/production
│   ├── use-scenario.ts         # Scenario state management
│   └── use-optimistic.ts       # Optimistic UI helpers
├── types/
│   └── index.ts                # Shared TypeScript types
└── prisma/
    └── schema.prisma           # Database schema
```

### Structure Rationale

- **Route Groups `(auth)` and `(public)`:** Next.js 13+ pattern for organizing routes without affecting URLs, enables different layouts per group
- **Server Actions in `/actions`:** Separates mutations from API routes, better DX with TypeScript and form integration
- **Data Access Layer (DAL):** Centralized auth/authorization prevents scattered checks, uses React `cache()` for deduplication
- **API Routes for External Services:** Keeps API keys server-side, enables caching/rate limiting, abstracts upstream changes
- **Collocated Components:** Calculator, scenarios, panels components live near their routes for better discoverability

## Architectural Patterns

### Pattern 1: Two-Tier Authentication (Optimistic + Secure)

**What:** Middleware performs fast cookie-based checks for route protection, while Data Access Layer performs database-backed verification before sensitive operations.

**When to use:** Always in Next.js App Router apps with authentication.

**Trade-offs:**
- **Pro:** Middleware redirects fast (no DB query), DAL ensures security at data source
- **Pro:** Works with Edge Runtime (middleware) and Node Runtime (DAL)
- **Con:** Two places to maintain auth logic (keep synchronized)

**Example:**
```typescript
// middleware.ts - Optimistic checks (Edge Runtime)
export default async function middleware(req: NextRequest) {
  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie) // JWT decode only, no DB

  if (isProtectedRoute(req.nextUrl.pathname) && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return NextResponse.next()
}

// lib/dal.ts - Secure checks (Node Runtime)
import { cache } from 'react'
import { db } from '@/lib/prisma'

export const verifySession = cache(async () => {
  const cookie = cookies().get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect('/login')
  }

  // Verify payment status from database
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { payment: true }
  })

  if (!user?.payment?.hasPaid) {
    redirect('/pricing')
  }

  return { userId: user.id, hasPaid: true }
})
```

### Pattern 2: Scenario as First-Class Entity

**What:** Scenarios are database entities that snapshot all calculator inputs. Users can create unlimited scenarios, compare them side-by-side, and switch between them.

**When to use:** Financial modeling tools where "what-if" analysis is core value.

**Trade-offs:**
- **Pro:** Natural mental model (users think in scenarios)
- **Pro:** Enables comparison features, audit trail
- **Con:** More complex than single-state calculator
- **Con:** Need conflict resolution if editing same scenario on multiple devices

**Example:**
```typescript
// prisma/schema.prisma
model Scenario {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  name      String   @default("Untitled Scenario")

  // Calculator inputs (all user-configurable values)
  panelWattage      Float
  numberOfPanels    Int
  batteryCapacity   Float?
  evCharging        Boolean
  // ... all other inputs

  // Computed outputs (stored for fast comparison)
  yearlyProduction  Float
  paybackYears      Float
  lifetimeSavings   Float

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// app/actions/scenarios.ts
'use server'
export async function createScenario(data: ScenarioInput) {
  const session = await verifySession() // DAL check

  const computed = calculateOutputs(data) // Run formulas

  return db.scenario.create({
    data: {
      ...data,
      ...computed,
      userId: session.userId
    }
  })
}
```

### Pattern 3: Optimistic UI with Validation Rollback

**What:** Update UI immediately when user changes calculator inputs, while background validation runs. If validation fails, show warning without blocking.

**When to use:** Interactive calculators where responsiveness is critical, but some validations are expensive.

**Trade-offs:**
- **Pro:** Feels instant, users can experiment freely
- **Pro:** Can validate complex constraints (e.g., "panels won't fit on roof") asynchronously
- **Con:** Must handle rollback UX carefully (don't surprise users)
- **Con:** Financial calculations must always be validated before saving

**Example:**
```typescript
// hooks/use-optimistic-scenario.ts
import { useOptimistic } from 'react'
import { updateScenarioAction } from '@/app/actions/scenarios'

export function useOptimisticScenario(initialScenario: Scenario) {
  const [optimisticScenario, setOptimisticScenario] = useOptimistic(
    initialScenario,
    (current, update: Partial<Scenario>) => ({ ...current, ...update })
  )

  async function updateScenario(updates: Partial<Scenario>) {
    // Immediately update UI
    setOptimisticScenario(updates)

    try {
      // Background: recompute outputs, validate, save
      const validated = await updateScenarioAction(optimisticScenario.id, updates)

      // If validation failed, show warning but keep optimistic UI
      if (validated.warnings) {
        toast.warning(validated.warnings)
      }
    } catch (error) {
      // On error, revert to server state
      toast.error('Failed to save scenario')
    }
  }

  return [optimisticScenario, updateScenario] as const
}
```

### Pattern 4: One-Time Payment Gate with Entitlement Check

**What:** User purchases once, gains lifetime access. Middleware checks entitlement on every request, DAL verifies from database before sensitive operations, webhook updates payment status.

**When to use:** One-time purchase SaaS products (vs. recurring subscriptions).

**Trade-offs:**
- **Pro:** Simple mental model for users (pay once, use forever)
- **Pro:** Fewer edge cases than subscription cancellations, renewals
- **Con:** Must prevent duplicate purchases (idempotency)
- **Con:** Need migration path if switching to subscription later

**Example:**
```typescript
// prisma/schema.prisma
model User {
  id       String   @id
  email    String   @unique
  payment  Payment?
}

model Payment {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id])

  stripeCustomerId String   @unique
  stripePaymentId  String   @unique

  hasPaid          Boolean  @default(false)
  paidAt           DateTime?
  amount           Float
  currency         String   @default("DKK")

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Update payment status (webhook is source of truth)
    await db.payment.update({
      where: { stripeCustomerId: session.customer },
      data: {
        hasPaid: true,
        paidAt: new Date(),
        stripePaymentId: session.payment_intent
      }
    })
  }

  return NextResponse.json({ received: true })
}

// lib/dal.ts
export const requirePaidUser = cache(async () => {
  const session = await verifySession()

  const payment = await db.payment.findUnique({
    where: { userId: session.userId }
  })

  if (!payment?.hasPaid) {
    redirect('/pricing') // Force purchase
  }

  return { userId: session.userId, hasPaid: true }
})
```

## Data Flow

### Request Flow (Calculator Interaction)

```
[User adjusts slider]
    ↓
[Client component updates state (optimistic)]
    ↓
[Trigger calculation in client] ────────────> [Display updated results immediately]
    ↓
[Debounced server action call]
    ↓
[Server: DAL verifies session + payment]
    ↓
[Server: Run financial calculations (Excel formulas)]
    ↓
[Server: Save scenario to database]
    ↓
[Return computed outputs] ───────────────────> [Update client state (reconcile)]
```

### State Management

**Client State (Ephemeral):**
- Current slider values, form inputs
- Chart zoom/pan state
- UI toggles (show/hide sections)

**Server State (Persisted):**
- Saved scenarios (inputs + computed outputs)
- User account, payment status
- Panel specifications database

**External State (Cached):**
- Electricity prices (Energi Data Service) - refresh every 1 hour
- Solar forecasts (Open-Meteo) - refresh every 6 hours

```
┌─────────────────────┐
│  Client Component   │
│  (React State)      │
└──────────┬──────────┘
           │
           ├───────────────> [Optimistic Update] ──> [Display]
           │
           ├───────────────> [Server Action] ──> [DAL Verify] ──> [Database]
           │                                                           │
           └───────────────> [External API] ──> [Cache (SWR)]        │
                                                       │               │
                                                       └───────────────┘
                                                    [Revalidate on stale]
```

### Key Data Flows

1. **Calculator Input → Results:** Client-side calculation (instant feedback) → server-side validation/storage (debounced)
2. **Scenario Switching:** Load from database → hydrate client state → recalculate if inputs changed
3. **Payment Flow:** Stripe Checkout → Webhook updates DB → Middleware allows access
4. **Panel Comparison:** Client-side filtering (fast) → server-side specs database (comprehensive)

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | SQLite database, Vercel serverless, in-memory cache for API responses, single-region deployment. Current architecture sufficient. |
| **1k-10k users** | Migrate to PostgreSQL (Vercel Postgres/Supabase), Redis for API caching, connection pooling (Prisma Accelerate), enable Vercel Edge Network. |
| **10k-100k users** | Database read replicas, CDN for static assets, separate database for panel specs (read-heavy), rate limiting per user, background jobs for heavy calculations. |
| **100k+ users** | Consider multi-tenant architecture if offering white-label, separate calculation workers (if complex Excel formulas cause timeout), dedicated PostgreSQL instance, full-text search for panel database (Algolia/Typesense). |

### Scaling Priorities

1. **First bottleneck: External API rate limits** (Energi Data Service, Open-Meteo)
   - **Fix:** Aggressive caching (1hr for prices, 6hr for forecasts), cache warming, fallback to historical data
   - **Why first:** Free APIs have strict rate limits, easy to hit with 100 users refreshing simultaneously

2. **Second bottleneck: Database connections** (serverless function cold starts)
   - **Fix:** Prisma connection pooling (Prisma Accelerate or PgBouncer), switch to Postgres (better connection handling than SQLite)
   - **Why second:** Vercel serverless can spawn 100+ concurrent functions, exhausting Postgres connection limits

3. **Third bottleneck: Complex calculations** (Excel formula ports)
   - **Fix:** Memoize expensive calculations, pre-compute common scenarios, move to background jobs for batch calculations
   - **Why third:** Financial calculations can be CPU-intensive, may cause API route timeouts (>10s on Vercel)

## Anti-Patterns

### Anti-Pattern 1: Storing Computed Values Without Inputs

**What people do:** Save only final results (payback time, savings) without saving inputs that generated them.

**Why it's wrong:**
- Cannot reproduce calculations if formulas change
- Cannot debug why a scenario produced specific results
- Cannot compare scenarios on specific input dimensions

**Do this instead:** Store complete input snapshot + computed outputs. Include `formulaVersion` field to track calculation changes over time.

```typescript
model Scenario {
  // ✅ GOOD: Store all inputs
  panelWattage      Float
  numberOfPanels    Int
  batteryCapacity   Float?
  electricityRate   Float
  // ... every input

  // ✅ GOOD: Store computed outputs
  paybackYears      Float
  lifetimeSavings   Float

  // ✅ GOOD: Version tracking
  formulaVersion    String  // e.g., "v2.3.1"

  // ❌ BAD: Only storing outputs
  // paybackYears    Float
  // (missing: how was this calculated?)
}
```

### Anti-Pattern 2: Client-Side Price Fetching

**What people do:** Fetch electricity prices directly from client, expose API keys, trust client calculations.

**Why it's wrong:**
- API keys exposed in client code
- CORS issues with external APIs
- No caching across users
- Rate limits applied per client (not shared)

**Do this instead:** Proxy through Next.js API routes, cache responses server-side, never expose keys.

```typescript
// ❌ BAD: Client-side fetch
// app/components/calculator.tsx
const prices = await fetch('https://api.energidataservice.dk/...')

// ✅ GOOD: Server-side proxy
// app/api/prices/route.ts
export async function GET(req: Request) {
  const cached = await redis.get('prices:latest')
  if (cached) return NextResponse.json(cached)

  const prices = await fetch('https://api.energidataservice.dk/...', {
    headers: { 'X-API-Key': process.env.ENERGI_API_KEY }
  })

  await redis.set('prices:latest', prices, { ex: 3600 }) // 1hr cache
  return NextResponse.json(prices)
}
```

### Anti-Pattern 3: Payment Status in JWT Only

**What people do:** Mark user as "paid" in JWT token, never verify against database.

**Why it's wrong:**
- Cannot revoke access (JWT can't be invalidated until expiry)
- User can manipulate JWT payload (if not validated properly)
- No audit trail of payment changes
- Cannot offer refunds or lifetime access revocation

**Do this instead:** JWT contains only user ID. Always verify payment status from database in DAL.

```typescript
// ❌ BAD: Trust JWT claims
const session = await decrypt(cookie)
if (session.hasPaid) { /* allow access */ }

// ✅ GOOD: Verify from database
const session = await decrypt(cookie) // Only userId, email
const payment = await db.payment.findUnique({
  where: { userId: session.userId }
})
if (payment?.hasPaid) { /* allow access */ }
```

### Anti-Pattern 4: Recalculating Everything on Every Input Change

**What people do:** Run all expensive calculations (annual projections, CO2 tracking, tax scenarios) on every keystroke.

**Why it's wrong:**
- Poor performance, laggy UI
- Wastes server resources (if server-side)
- Battery drain (if client-side)
- Bad UX during fast input changes

**Do this instead:** Debounce expensive calculations, memoize results, separate fast preview from full calculation.

```typescript
// ✅ GOOD: Debounced + memoized calculations
import { useMemo } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced'

function Calculator({ inputs }) {
  // Fast preview: simple calculation, runs immediately
  const basicResults = useMemo(() => ({
    yearlyProduction: inputs.panels * inputs.wattage * 950 * 0.8
  }), [inputs.panels, inputs.wattage])

  // Expensive calculation: debounced to avoid thrashing
  const debouncedInputs = useDebouncedValue(inputs, 500) // 500ms
  const fullResults = useMemo(() =>
    runComplexFinancialModel(debouncedInputs), // Excel formulas
    [debouncedInputs]
  )

  return (
    <>
      {/* Show fast preview immediately */}
      <p>Production: {basicResults.yearlyProduction} kWh</p>

      {/* Show full results after debounce */}
      {fullResults && (
        <DetailedResults data={fullResults} />
      )}
    </>
  )
}
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Energi Data Service** | API route proxy with 1hr cache | Free tier, no auth required, rate limits apply |
| **Open-Meteo** | API route proxy with 6hr cache | Free tier, no auth required, forecast data changes slowly |
| **Stripe Checkout** | Server Action creates session → Client redirects → Webhook confirms | Use test mode keys in dev, verify webhook signatures |
| **NextAuth** | Built-in session management, custom credentials provider | JWT stored in httpOnly cookie, refresh on expiry |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Client ↔ Server** | Server Actions for mutations, Server Components for fetching | Server Actions return serializable data only, no class instances |
| **Middleware ↔ Database** | **None (intentional)** | Middleware runs on Edge Runtime, cannot query database. Use cookie-only checks. |
| **DAL ↔ Database** | Prisma ORM, React `cache()` for deduplication | Use `cache()` wrapper on all data fetches to prevent duplicate queries |
| **API Routes ↔ External APIs** | `fetch()` with error handling, AbortController for timeouts | Set reasonable timeouts (5s), fallback to cached/historical data |

## Build Order Implications

Based on this architecture, recommended build sequence:

### Phase 1: Foundation (Auth + Payment Infrastructure)
**Why first:** Everything depends on knowing if user has paid.

- Database schema (User, Payment models)
- NextAuth setup (credentials provider)
- Middleware (route protection)
- DAL (session + payment verification)
- Stripe integration (checkout + webhook)

**Dependencies:** None (greenfield)

### Phase 2: Scenario Persistence
**Why second:** Core feature, enables remaining features.

- Scenario model (database)
- Server Actions (CRUD operations)
- Basic scenario UI (create, list, delete)

**Dependencies:** Auth (must know which user owns scenario)

### Phase 3: Calculator Enhancement
**Why third:** Build on existing calculator, make it scenario-aware.

- Connect calculator to scenario state
- Save/load scenarios
- Optimistic UI for inputs
- Debounced persistence

**Dependencies:** Scenario persistence (must have somewhere to save)

### Phase 4: Panel Database
**Why fourth:** Independent feature, can build in parallel with calculator.

- Panel model (database + seed data)
- Panel browser UI (search, filter, compare)
- Panel selection integration (use in scenario)

**Dependencies:** Auth (if gated), otherwise independent

### Phase 5: Advanced Features
**Why last:** Polish and differentiators, build after core works.

- Scenario comparison view (side-by-side)
- Excel formula ports (complex calculations)
- PDF export
- Guided setup wizard

**Dependencies:** All above (uses complete feature set)

## Performance Considerations

### Critical Path Optimizations

1. **Initial Page Load**
   - Server Component for calculator skeleton (pre-rendered HTML)
   - Client Component for interactive controls (hydrate progressively)
   - Defer heavy calculations until user interaction
   - **Target:** < 2s First Contentful Paint

2. **Calculator Responsiveness**
   - Optimistic UI updates (<50ms perceived latency)
   - Debounced server saves (500ms-1s)
   - Memoized calculations (prevent redundant work)
   - **Target:** < 100ms feedback on slider change

3. **Scenario Switching**
   - Optimistic navigation (update URL immediately)
   - Parallel fetch scenario + external data
   - Skeleton UI during loading
   - **Target:** < 500ms perceived switch time

4. **External API Resilience**
   - Aggressive caching (1-6hr)
   - Stale-while-revalidate pattern
   - Fallback to cached data on API failure
   - **Target:** 99.9% uptime (even if APIs down)

### Caching Strategy

| Data Type | Cache Location | TTL | Revalidation |
|-----------|----------------|-----|--------------|
| Electricity prices | Redis/Memory | 1 hour | Background fetch on access |
| Solar forecasts | Redis/Memory | 6 hours | Background fetch on access |
| Panel specifications | Database | N/A | Updated manually (static data) |
| User scenarios | Database | N/A | Updated on user action |
| Calculated results | In-memory (memoized) | Request lifetime | Recalculate if inputs change |

## Sources

### Architecture Patterns (HIGH Confidence)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Official Next.js authentication patterns for App Router
- [WorkOS: Top 5 Authentication Solutions for Next.js 2026](https://workos.com/blog/top-authentication-solutions-nextjs-2026) - Current auth solution comparison
- [The Complete Guide to Scalable Next.js Architecture](https://dev.to/melvinprince/the-complete-guide-to-scalable-nextjs-architecture-39o0) - Next.js project structure best practices

### Financial SaaS Patterns (MEDIUM Confidence)
- [Fathom: 6 Best Financial Modelling Software for 2026](https://www.fathomhq.com/blog/the-6-best-financial-modelling-software-tools) - Scenario planning architecture in commercial tools
- [CFO Club: 18 Best Scenario Planning Software 2026](https://thecfoclub.com/tools/best-scenario-planning-software/) - Multi-scenario comparison patterns
- [Drivetrain: Top 11 AI Financial Modeling Tools 2026](https://www.drivetrain.ai/solutions/ai-financial-modeling-tools-for-businesses) - Modern financial calculator architecture

### Payment Integration (HIGH Confidence)
- [Stripe + Next.js Complete Guide 2025](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) - One-time payment implementation with Server Actions
- [Orb: Payment System Design for SaaS](https://www.withorb.com/blog/payment-system-design) - Payment gateway architecture patterns
- [Orb: Billing System Architecture for SaaS 101](https://www.withorb.com/blog/billing-architecture) - Webhook handling and idempotency

### Data Modeling (HIGH Confidence)
- [Prisma with Next.js Official Guide](https://www.prisma.io/docs/guides/nextjs) - Prisma integration patterns
- [Prisma Production Guide for Next.js 2025](https://www.digitalapplied.com/blog/prisma-orm-production-guide-nextjs) - Connection pooling, Edge Runtime considerations

### Optimistic UI (MEDIUM Confidence)
- [React useOptimistic Hook](https://react.dev/reference/react/useOptimistic) - Official React optimistic UI API
- [Optimistic UI with Server Actions in Next.js](https://medium.com/@mishal.s.suyog/optimistic-ui-with-server-actions-in-next-js-a-smoother-user-experience-6b779e4293a9) - Implementation patterns for financial apps
- [SWR Optimistic UI](https://www.chrisdpadilla.com/optimisticui) - Vercel's recommended optimistic UI library

### Access Control (MEDIUM Confidence)
- [Cerbos: 3 Most Common Authorization Designs for SaaS](https://www.cerbos.dev/blog/3-most-common-authorization-designs-for-saas-products) - RBAC, ABAC patterns
- [Zluri: 10 SaaS Access Control Best Practices 2026](https://www.zluri.com/blog/access-control-best-practices) - Enterprise access control patterns

---
*Architecture research for: Solar Purchase Decision Calculator*
*Researched: 2026-01-28*
