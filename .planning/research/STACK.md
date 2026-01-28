# Stack Research

**Domain:** Solar purchase decision calculator (one-time purchase SaaS)
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

For adding authentication, payments, and premium features to the existing Next.js 14 solar calculator, the recommended stack leverages the existing foundation (Next.js, TypeScript, Prisma, Tailwind/shadcn) while adding modern, proven libraries for auth, payments, and data visualization. Key decisions: Auth.js v5 for authentication, Stripe for payments, Recharts (via shadcn/ui charts) for financial visualizations, and TanStack Query for client-side data management.

## Existing Stack (Established)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Next.js | 14.2.5 | App Router framework | ✅ Installed |
| TypeScript | 5.5.4 | Type safety | ✅ Installed |
| Prisma | 5.17.0 → **7.0+** | Database ORM | ✅ Installed (upgrade recommended) |
| Tailwind CSS | 3.4.6 | Styling | ✅ Installed |
| shadcn/ui | Latest | Component library | ✅ Installed |
| React Hook Form | 7.52.1 | Form management | ✅ Installed |
| Zod | 3.23.8 | Schema validation | ✅ Installed |

**Note on Prisma:** Project has v5.17.0, but Prisma 7.0 (released Nov 2025) is the current stable version. Migration recommended for 90% smaller bundle sizes and up to 3x faster queries with the Rust-free client.

## New Stack Components Required

### Authentication & Session Management

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Auth.js (NextAuth v5)** | 5.x | User authentication | Industry standard for Next.js auth, App Router native, edge-compatible. Already installed but needs configuration. | HIGH |
| **@auth/prisma-adapter** | Latest | Database adapter | Connects Auth.js to Prisma for session/user storage. Replaces deprecated @next-auth/prisma-adapter. | HIGH |
| **React Email** | Latest | Email templates | Type-safe, component-based email templates for auth flows (magic links, verification). | HIGH |
| **Resend** | Latest | Email delivery API | Modern email API with 100 free emails/day, excellent DX, Auth.js native support. | HIGH |

**Migration Note:** Project has NextAuth v4 (next-auth@4.24.7) installed. Must migrate to Auth.js v5 for App Router compatibility and modern patterns. Breaking changes include:
- Cookie prefix changes from `next-auth.session-token` to `authjs.session-token` (will log out existing users unless migrated)
- Configuration moves from API routes to root `auth.ts` file
- Single `auth()` function replaces `getServerSession()`, `getToken()`, `withAuth()`, etc.
- Adapter packages change from `@next-auth/*` to `@auth/*`

**Rationale:** Auth.js v5 is the future of NextAuth and is now maintained by the Better Auth team. For new features in 2026, v5 is required for App Router patterns, Edge Runtime support, and continued security updates.

### Payment Processing

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Stripe** | Latest | Payment processing | Industry leader, excellent Next.js integration, strong EU/Danish compliance, lowest fees for one-time payments. | HIGH |
| **@stripe/stripe-js** | Latest | Client-side Stripe | Official Stripe SDK for React/Next.js client components. | HIGH |
| **@stripe/react-stripe-js** | Latest | React payment UI | Official React bindings for PaymentElement and checkout UI. | HIGH |
| **stripe** (server) | Latest | Server-side API | Node.js SDK for creating payment intents, webhooks, customer management. | HIGH |

**Implementation Approach:** Use **Stripe Checkout** (not Payment Intents API) for MVP. Stripe Checkout requires minimal code, handles 3D Secure/SCA automatically, and manages the entire payment UI. Payment Intents API offers more control but requires significantly more implementation and maintenance.

**Alternative Considered:** Paddle acts as Merchant of Record (MoR) and handles all tax compliance, which is attractive for Danish/EU sales. However, Paddle charges 5% + 50¢ per transaction vs Stripe's 2.9% + 30¢. For one-time purchases (not subscriptions), Stripe's lower fees and superior developer experience make it the clear choice. If international tax complexity becomes a blocker, Paddle can be reconsidered.

**GDPR/Danish Compliance:** Stripe is GDPR-compliant with EU data centers available. For Danish market, ensure Stripe account is configured for EU processing.

### Database (Hosting)

| Technology | Purpose | Why Recommended | Confidence |
|------------|---------|-----------------|------------|
| **Vercel Postgres (Neon)** | Production database | Native Vercel integration, serverless PostgreSQL, instant branching for preview environments, generous free tier. | HIGH |
| **Alternative: Supabase** | Full BaaS platform | If you need real-time features, built-in storage, or auto-generated REST/GraphQL APIs. Overkill for this project. | MEDIUM |

**Rationale:** Vercel Postgres is built on Neon, providing serverless PostgreSQL with excellent cold-start performance (500ms-1s). Seamless integration with Vercel deployment and preview branches. For a solar calculator with authentication and payments, this is the optimal choice. Prisma works perfectly with both Vercel Postgres and Neon.

**Database Schema Additions Needed:**
- User accounts (handled by @auth/prisma-adapter)
- Payment records (Stripe customer ID, purchase status, purchase date)
- Solar panel specifications (make, model, wattage, efficiency, cost, dimensions)
- Saved calculations/scenarios (user-owned, comparison data)

### Client-Side State Management

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **TanStack Query** | v5 | Server state management | Industry standard for data fetching, caching, and synchronization. Perfect for scenario loading, panel specs, user data. | HIGH |

**Rationale:** TanStack Query (formerly React Query) is the 2026 standard for handling server state in Next.js apps. It eliminates the need for global state for server data, provides automatic caching, background refetching, and optimistic updates. Essential for:
- Loading saved scenarios
- Fetching solar panel specifications
- Managing user session data on client
- Scenario comparison views

**Pattern:** Server Components fetch initial data, TanStack Query manages client-side refetching and mutations. This is the dominant pattern in Next.js 15+ apps, providing 40-70% faster initial loads compared to client-only fetching.

### Data Visualization & Financial UI

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **shadcn/ui Charts** | Latest | Financial charts | Built on Recharts, 53 pre-built chart components, full TypeScript, automatic dark mode, matches existing shadcn/ui design. | HIGH |
| **Recharts** | 2.12.7 | Chart rendering engine | Installed as dependency of shadcn/ui charts. Battle-tested, declarative React components, excellent for financial data. | HIGH |
| **Lucide React** | 0.408.0+ | Icons | Already installed. Use for premium UI polish (calculator icons, financial symbols). | HIGH |

**Rationale:** shadcn/ui Charts is the obvious choice because:
1. Already using shadcn/ui for components
2. Charts are copy-paste components (customizable)
3. Built-in dark mode with CSS variables
4. TypeScript-native with type-safe configs
5. 53 chart types including area, bar, line, pie, radar (all needed for financial projections)

**Alternative Considered:** Tremor is beautiful and higher-level than Recharts, but it's less customizable and tightly coupled to Tremor's design system. Since the project already uses shadcn/ui, introducing Tremor would create design inconsistency. shadcn/ui Charts provides the same convenience with full control.

**Chart Usage:**
- Area charts: ROI over time, energy production projections
- Bar charts: Cost comparisons between scenarios
- Line charts: Break-even analysis, cumulative savings
- Pie charts: Cost breakdown (panels, installation, inverter)

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **date-fns** | Latest | Date manipulation | Calculating payback periods, loan amortization, date formatting in charts. Lighter than moment.js. | HIGH |
| **numeral** | Latest | Number formatting | Currency (DKK), percentages, large numbers in financial UI. Better UX than toFixed(). | MEDIUM |
| **react-hot-toast** | Latest | Toast notifications | Success/error messages for payments, saves, auth flows. Minimal, accessible. | HIGH |

**Alternative for Number Formatting:** Intl.NumberFormat (native) is viable but lacks the convenience of numeral.js for complex formatting patterns.

## Installation Commands

```bash
# Authentication (Auth.js v5 upgrade)
npm install next-auth@beta @auth/prisma-adapter

# Email (for auth flows)
npm install react-email resend

# Payments (Stripe)
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# Client state management
npm install @tanstack/react-query @tanstack/react-query-devtools

# Charts (shadcn/ui charts)
npx shadcn@latest add chart

# Supporting libraries
npm install date-fns react-hot-toast

# Optional: Number formatting
npm install numeral
npm install -D @types/numeral

# Database driver (if using Vercel Postgres)
npm install @vercel/postgres

# Prisma upgrade (recommended)
npm install prisma@latest @prisma/client@latest
npx prisma generate
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not | Confidence |
|----------|-------------|-------------|---------|------------|
| **Auth** | Auth.js v5 | Clerk | Clerk is excellent but adds $25/mo cost for production. Auth.js is free and sufficient for user accounts + email auth. | HIGH |
| **Auth** | Auth.js v5 | Better Auth | Better Auth is the new standard, but Auth.js v5 is mature, well-documented, and actively maintained by the Better Auth team. Migration path exists if needed. | MEDIUM |
| **Payments** | Stripe | Paddle | Paddle's 5% fees vs Stripe's 2.9% makes Stripe cheaper for one-time purchases. Paddle's MoR advantage (tax handling) is less valuable for non-subscription products. | HIGH |
| **Payments** | Stripe | PayPal | Poor developer experience, inconsistent UI, higher fees. Stripe is superior in every way. | HIGH |
| **Database** | Vercel Postgres | Supabase | Supabase is a full BaaS (auth, storage, realtime, functions). Overkill when we only need PostgreSQL. Adds vendor lock-in. | HIGH |
| **Charts** | shadcn/ui Charts | Tremor | Tremor is less customizable and uses its own design system. shadcn/ui Charts matches existing UI and is fully customizable. | HIGH |
| **Charts** | Recharts (via shadcn) | Visx (Airbnb) | Visx is lower-level and requires more code. Recharts declarative API is better for financial charts. | MEDIUM |
| **Charts** | Recharts (via shadcn) | Chart.js | Chart.js is canvas-based (not React), harder to customize, poor TypeScript support. Recharts is React-native. | HIGH |
| **State** | TanStack Query | Zustand/Redux | Zustand/Redux are for client state. TanStack Query is specifically for server state (API data). Don't conflate the two. | HIGH |
| **Email** | Resend | SendGrid | SendGrid has complicated pricing and poor DX. Resend is modern, simple, 100 free emails/day is sufficient for MVP. | HIGH |
| **Email** | Resend | AWS SES | AWS SES is cheap but requires AWS account setup, IAM roles, and is harder to configure. Resend is plug-and-play. | MEDIUM |

## What NOT to Use

| Avoid | Why | Use Instead | Confidence |
|-------|-----|-------------|------------|
| **next-auth v4** | Deprecated, no App Router support, no Edge Runtime support. Cookie name conflicts will log out users on migration. | Auth.js v5 (NextAuth v5) | HIGH |
| **@next-auth/prisma-adapter** | Deprecated package name. Replaced by @auth/prisma-adapter in v5. | @auth/prisma-adapter | HIGH |
| **Runtime Configuration (next.config.js)** | Incompatible with standalone output mode, breaks Vercel's static optimization. | Server-side environment variables via App Router or Edge Config | HIGH |
| **Prisma v4 or older** | Missing serverless optimizations, slower queries, larger bundles. | Prisma v7.0+ (Rust-free client) | MEDIUM |
| **OAuth 1.0 providers** | Deprecated in Auth.js v5. | OAuth 2.0 / OIDC providers only | HIGH |
| **Payment Intents API (for MVP)** | Requires 3-5x more code than Stripe Checkout for same result. Premature optimization. | Stripe Checkout (can migrate later if needed) | MEDIUM |
| **Context API for server state** | Anti-pattern. Context is for client state only. Using it for API data causes re-render issues. | TanStack Query | HIGH |
| **Moment.js** | Huge bundle size (70kb), deprecated. | date-fns (11kb modular) | HIGH |

## Stack Patterns by Use Case

### Authentication Flow
**Pattern:** Email-based authentication (passwordless magic links)
- **Why:** Simpler UX, no password management, more secure than passwords, works well for Danish homeowners (non-technical users).
- **Implementation:** Auth.js v5 + Resend + React Email
- **Fallback:** Email/password auth can be added later if users request it.

### Payment Flow (One-Time Purchase)
**Pattern:** Stripe Checkout with redirect
- **Why:** Stripe handles entire payment UI, 3D Secure/SCA compliance, PCI compliance. Minimal code.
- **Implementation:**
  1. Create Stripe Checkout session on server (API route)
  2. Redirect user to Stripe-hosted checkout page
  3. Handle webhook for payment confirmation
  4. Update user's purchase status in database
  5. Redirect user back to app with success message

### Scenario Saving & Comparison
**Pattern:** Server Components for initial load + TanStack Query for mutations
- **Implementation:**
  1. Server Component fetches user's saved scenarios (fast initial render)
  2. TanStack Query manages client-side CRUD (create, update, delete scenarios)
  3. Optimistic updates for instant feedback
  4. Background revalidation ensures data freshness

### Chart Rendering (Financial Projections)
**Pattern:** Client Components with shadcn/ui Charts
- **Why:** Charts require interactivity (tooltips, hover states, responsive)
- **Implementation:**
  1. Calculate projection data on server or client
  2. Pass data to shadcn/ui Chart components
  3. Use CSS variables for theme consistency
  4. Responsive by default (Recharts handles mobile)

### Panel Specifications Database
**Pattern:** Prisma seed script + Admin UI (future)
- **Implementation:**
  1. Create PanelSpec model in Prisma schema
  2. Seed initial data from CSV or API (e.g., ENF Solar Panel Database)
  3. Expose via API routes for search/filter
  4. Cache with TanStack Query on client
  5. Admin UI for future updates (defer to post-MVP)

## Version Compatibility Matrix

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| Next.js | 14.2.5+ | Auth.js v5 requires 14.0+ | Upgrade to 14.2.5+ recommended for stability |
| Prisma | 7.0+ | @prisma/adapter-* required | Must explicitly install driver adapter |
| Auth.js | 5.x | @auth/prisma-adapter | Use beta channel: next-auth@beta |
| Stripe | Latest | Next.js 14 App Router | Use Server Actions for payment intent creation |
| TanStack Query | v5 | Next.js 14 App Router | Use initialData from Server Components |
| shadcn/ui Charts | Latest | Recharts 2.12.7+ | Already compatible with installed Recharts version |
| React Email | Latest | Resend | Resend has native React Email support |

## Configuration Checklist

### Environment Variables Required

```bash
# Database (Vercel Postgres)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Auth.js v5
AUTH_SECRET="<generate with: openssl rand -base64 32>"
AUTH_URL="http://localhost:3000" # Production: https://your-domain.com
AUTH_TRUST_HOST="true" # For Vercel deployment

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@your-domain.com"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..." # Production: sk_live_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..." # Production: pk_live_...
STRIPE_WEBHOOK_SECRET="whsec_..." # From Stripe webhook configuration

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000" # For redirects
```

### Prisma Schema Additions

```prisma
// Auth.js v5 models (via @auth/prisma-adapter)
model Account { ... }
model Session { ... }
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?

  // Additional fields for solar calculator
  stripeCustomerId String?   @unique
  purchaseDate     DateTime?
  purchaseStatus   String?   @default("pending") // pending, completed, refunded

  accounts         Account[]
  sessions         Session[]
  calculations     Calculation[]
}
model VerificationToken { ... }

// Solar calculator models
model PanelSpec {
  id          String   @id @default(cuid())
  make        String
  model       String
  wattage     Int
  efficiency  Float
  costPerWatt Float
  dimensions  Json     // { length, width, height }
  weight      Float
  warranty    Int      // years
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([make, model])
}

model Calculation {
  id               String   @id @default(cuid())
  name             String   // User-defined name for scenario
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Input parameters
  roofArea         Float
  panelSpecId      String
  energyCost       Float    // DKK per kWh
  systemCost       Float
  installationCost Float

  // Calculated results (stored for comparison)
  annualProduction Float
  annualSavings    Float
  paybackYears     Float
  roi25Year        Float

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([userId])
}
```

## Migration Steps (NextAuth v4 → Auth.js v5)

1. **Install Auth.js v5:** `npm install next-auth@beta @auth/prisma-adapter`
2. **Update Prisma schema:** Change adapter models if needed (minor changes)
3. **Create auth.ts:** Move authOptions from API route to root auth.ts file
4. **Update imports:** Change `next-auth/next` to `next-auth` and use new exports
5. **Session preservation:** Implement cookie migration middleware to avoid logging out existing users
6. **Update environment variables:** Change NEXTAUTH_* to AUTH_*
7. **Test authentication flow:** Verify sign in, sign out, session handling

**Critical:** The cookie prefix change (`next-auth.session-token` → `authjs.session-token`) will log out all existing users unless you implement session migration middleware. For a new feature rollout, this may be acceptable.

## Performance Considerations

| Area | Optimization | Impact |
|------|-------------|--------|
| **Bundle Size** | Prisma v7.0 Rust-free client | 90% smaller client bundle |
| **Query Speed** | Prisma v7.0 optimized queries | Up to 3x faster queries |
| **Initial Load** | Server Components + TanStack Query | 40-70% faster initial page load |
| **Cold Starts** | Vercel Postgres (Neon) serverless | 500ms-1s cold start (acceptable) |
| **Payment Flow** | Stripe Checkout redirect | Offloads payment UI to Stripe (zero client bundle impact) |
| **Chart Rendering** | Recharts with memoization | Smooth 60fps on most devices |
| **Email Delivery** | Resend edge infrastructure | <200ms email delivery globally |

## Integration Complexity Assessment

| Integration | Complexity | Time Estimate | Risk Level |
|-------------|-----------|---------------|------------|
| Auth.js v5 setup | Medium | 4-6 hours | Low (well-documented) |
| NextAuth v4 → v5 migration | Medium-High | 6-8 hours | Medium (cookie migration tricky) |
| Stripe Checkout | Low | 2-3 hours | Low (minimal code) |
| Stripe Webhooks | Medium | 3-4 hours | Medium (requires testing) |
| TanStack Query setup | Low | 2-3 hours | Low (standard pattern) |
| shadcn/ui Charts | Low | 1-2 hours per chart | Low (copy-paste components) |
| Resend + React Email | Low | 2-3 hours | Low (straightforward API) |
| Prisma schema updates | Medium | 3-4 hours | Low (additive changes) |
| Database hosting (Vercel) | Low | 1 hour | Low (one-click setup) |

**Total Estimated Integration Time:** 24-35 hours for full stack implementation

**Highest Risk Areas:**
1. NextAuth v4 → v5 migration (cookie/session preservation)
2. Stripe webhook handling (must be reliable for payment confirmation)
3. Prisma v5 → v7 migration (if pursued) - breaking changes in configuration

## Sources

### Authentication & Auth.js v5
- [Migrating to v5 - Auth.js](https://authjs.dev/getting-started/migrating-to-v5)
- [NextAuth.js v5 Guide: Migrating from v4 with Real Examples - DEV](https://dev.to/acetoolz/nextauthjs-v5-guide-migrating-from-v4-with-real-examples-50ad)
- [Top 5 authentication solutions for secure Next.js apps in 2026 - WorkOS](https://workos.com/blog/top-authentication-solutions-nextjs-2026)
- [Auth.js | Resend](https://authjs.dev/getting-started/providers/resend)

### Payments (Stripe)
- [Integrating Stripe Payment Elements with Next.js 14 App Router - Stackademic](https://blog.stackademic.com/integrating-stripe-payment-elements-with-next-js-14-app-router-webhooks-typescript-4d6eb7710c40)
- [Paddle vs Stripe: Which payment platform makes most sense in 2026? - Whop](https://whop.com/blog/paddle-vs-stripe/)
- [Compare the Checkout Sessions and Payment Intents APIs - Stripe Docs](https://docs.stripe.com/payments/checkout-sessions-and-payment-intents-comparison)
- [The Complete Stripe Payments Guide - WenHaoFree](https://blog.wenhaofree.com/en/posts/technology/stripe-payment-guide/)

### Database (Prisma & Hosting)
- [Prisma Changelog](https://www.prisma.io/changelog) - Prisma 7.0 features
- [Supabase vs Neon: The Battle of PostgreSQL Titans - Medium](https://bertomill.medium.com/supabase-vs-neon-the-battle-of-postgresql-titans-418044159d1f)
- [Vercel (Neon) vs Supabase, Free-Tier Database Comparison - Hrekov](https://hrekov.com/blog/vercel-vs-supabase-database-comparison)
- [Neon vs. Supabase: Which One Should I Choose - Bytebase](https://www.bytebase.com/blog/neon-vs-supabase/)

### State Management (TanStack Query)
- [Server Rendering & Hydration - TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [React Server Components + TanStack Query: The 2026 Power Duo - DEV](https://dev.to/krish_kakadiya_5f0eaf6342/react-server-components-tanstack-query-the-2026-data-fetching-power-duo-you-cant-ignore-21fj)
- [From Setup to Execution: TanStack Query and Next.js 14+ Integration - FAUN](https://faun.pub/from-setup-to-execution-the-most-accurate-tanstack-query-and-next-js-14-integration-guide-8e5aff6ee8ba)

### Charts & Visualization
- [Chart - shadcn/ui](https://ui.shadcn.com/docs/components/chart)
- [My Take on React Chart Libraries - Kyle Gill](https://www.kylegill.com/essays/react-chart-libraries)
- [Tremor vs Recharts vs Chart.js - NPM Trends](https://npmtrends.com/@tremor/react-vs-chart.js-vs-d3-vs-echarts-vs-plotly.js-vs-recharts)
- [6 Best JavaScript Charting Libraries for Dashboards in 2026 - Embeddable](https://embeddable.com/blog/javascript-charting-libraries)

### Email (Resend + React Email)
- [Send emails with Next.js - Resend](https://resend.com/docs/send-with-nextjs)
- [How to Create and Send Email Templates Using React Email and Resend - FreeCodeCamp](https://www.freecodecamp.org/news/create-and-send-email-templates-using-react-email-and-resend-in-nextjs/)
- [How to send a warm welcome email with Resend, Next-Auth and React-Email - DEV](https://dev.to/mfts/how-to-send-a-warm-welcome-email-with-resend-next-auth-and-react-email-576f)

### Forms & Validation
- [React Hook Form - shadcn/ui](https://ui.shadcn.com/docs/forms/react-hook-form)
- [How to Validate Forms with Zod and React-Hook-Form - FreeCodeCamp](https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/)
- [Learn Zod validation with React Hook Form - Contentful](https://www.contentful.com/blog/react-hook-form-validation-zod/)

### Environment Variables & Configuration
- [Guides: Environment Variables - Next.js](https://nextjs.org/docs/pages/guides/environment-variables)
- [Managing Next.js Environment Variables - Wisp CMS](https://www.wisp.blog/blog/managing-nextjs-environment-variables-from-development-to-production-vercel)

---

**Confidence Assessment:**
- **Authentication (Auth.js v5):** HIGH - Extensive documentation, official Next.js recommendation, verified migration guides
- **Payments (Stripe):** HIGH - Industry standard, extensive Next.js 14 App Router tutorials, verified pricing/comparison
- **Database (Vercel Postgres/Neon):** HIGH - Official Vercel offering, verified performance benchmarks, Prisma compatibility confirmed
- **Charts (shadcn/ui Charts):** HIGH - Official shadcn component, built on battle-tested Recharts, verified TypeScript support
- **State Management (TanStack Query):** HIGH - Industry standard for 2026, official Next.js patterns documented
- **Email (Resend):** HIGH - Verified Auth.js integration, generous free tier, excellent DX reported

**Open Questions:**
- Prisma v5 → v7 migration timing (breaking changes in config, but major performance gains)
- Email verification requirement for Danish market (may need legal review)
- Stripe vs Paddle tax handling complexity for multi-country expansion (not immediate concern)

---

*Stack research for: Solar Purchase Decision Calculator*
*Researched: 2026-01-28*
*Next Steps: Review with stakeholders, validate Danish compliance requirements, proceed to roadmap creation*
