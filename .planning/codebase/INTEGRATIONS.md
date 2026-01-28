# External Integrations

**Analysis Date:** 2026-01-28

## APIs & External Services

**Electricity Price Data:**
- Energi Data Service (Energinet Denmark TSO) - Real-time spot prices
  - SDK/Client: Native fetch, no SDK
  - Auth: None required (free public API)
  - Base URL: `https://api.energidataservice.dk/dataset/Elspotprices`
  - Implementation: `lib/api/energi-data-service.ts`
  - Endpoints:
    - `/api/prices` - Query spot prices with filters and thresholds
    - Supports DK1 and DK2 price areas
  - Data: Hourly spot prices in DKK/MWh and EUR/MWh, converted to kr/kWh for display
  - Cache: 1-hour revalidation (Next.js revalidate)
  - Features:
    - `fetchSpotPrices()` - Recent 48-hour prices
    - `fetchTodayPrices()` - Today's prices (from start of day)
    - `fetchTomorrowPrices()` - Tomorrow's prices (available after ~13:00 CET)
    - `getPriceStats()` - Min, max, avg, cheap/expensive thresholds
    - `findOptimalChargingWindows()` - Identify cheapest charging periods

**Solar Radiation & Weather:**
- Open-Meteo (Free Tier) - Solar irradiance and weather forecasts
  - SDK/Client: Native fetch, no SDK
  - Auth: None required (free public API)
  - Base URL: `https://api.open-meteo.com/v1/forecast`
  - Implementation: `lib/api/open-meteo.ts`
  - Endpoints:
    - `/api/solar` - Query solar forecast with production estimates
  - Data: Hourly solar radiation (GHI, DNI, DHI), temperature, cloud cover, up to 16 days
  - Cache: 1-hour revalidation
  - Features:
    - `fetchSolarForecast()` - Hourly solar irradiance by location (lat/lon)
    - `fetchTiltedIrradiance()` - Panel-specific irradiance (adjustable tilt/azimuth)
    - `estimateProduction()` - Convert irradiance to kWh output based on system size
    - `aggregateToDailySummary()` - Hourly to daily summaries with quality assessment
    - `getCurrentSolarConditions()` - Real-time and daily totals
  - Location: Default Copenhagen, Denmark (55.6761, 12.5683)

## Data Storage

**Databases:**
- SQLite (Development)
  - Type: Embedded relational database
  - Connection: File-based at `prisma/dev.db`
  - Client: Prisma ORM (`@prisma/client` 5.17.0)
  - Purpose: Local development and testing

- PostgreSQL (Production - Optional)
  - Type: Relational database
  - Connection: Via `DATABASE_URL` env var (commented in `.env.example`)
  - Client: Prisma ORM
  - Provider: Vercel Postgres (recommended)
  - Purpose: Production deployment with scalability

**File Storage:**
- Local filesystem only
- No cloud storage integrations (S3, GCS, etc.)

**Caching:**
- Next.js built-in HTTP caching:
  - `revalidate: 3600` (1-hour cache) for external API calls
  - Energi Data Service: 1-hour revalidation
  - Open-Meteo: 1-hour revalidation

## Authentication & Identity

**Auth Provider:**
- NextAuth.js 4.24.7 - Custom implementation
  - Implementation approach: Planned (credentials not yet fully configured)
  - Session storage: Database via Prisma
  - Password hashing: bcryptjs 2.4.3
  - Secret management: `NEXTAUTH_SECRET` env var
  - Callback URL: `NEXTAUTH_URL` env var
  - Current status: Framework installed, not actively used in routes (public app phase)
- Database schema includes User model:
  - `id` (CUID) - Primary key
  - `email` - Unique identifier
  - `name` - Optional
  - `password` - Hashed (bcryptjs)
  - `createdAt`, `updatedAt` - Timestamps
  - Relations: One-to-many with Installation records

## Monitoring & Observability

**Error Tracking:**
- None detected
- Errors logged to console via `console.error()`
- Future: Consider Sentry or similar

**Logs:**
- Console logging approach:
  - API errors: `console.error()` in `app/api/` routes
  - Examples: Price fetch errors, solar forecast errors, optimization errors
- No centralized logging service
- Environment: Production errors not separately logged

## CI/CD & Deployment

**Hosting:**
- Vercel (primary)
  - Indicated by `.vercel/` in `.gitignore`
  - Optimized for Next.js deployments
  - Environment variables configured via Vercel dashboard

**CI Pipeline:**
- Not detected
- No GitHub Actions, GitLab CI, or similar configured
- Future: Add tests and automated checks

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - Database connection string
  - Dev: `"file:./dev.db"` (SQLite)
  - Prod: PostgreSQL URI
- `NEXTAUTH_SECRET` - Session secret (must be changed from example)
- `NEXTAUTH_URL` - Auth callback URL (e.g., `http://localhost:3000`)

**Optional env vars:**
- None explicitly documented
- Future: API rate limit keys, error tracking credentials

**Secrets location:**
- Local: `.env.example` checked in (template)
- Local: `.env`, `.env.local`, `.env.*.local` ignored from git
- Production: Vercel environment dashboard
- Note: `.env.example` contains placeholder value for `NEXTAUTH_SECRET` - must be regenerated for production

## Webhooks & Callbacks

**Incoming:**
- None detected
- Future: Could receive notifications from solar hardware, grid operators

**Outgoing:**
- None detected
- Future: Could send alerts to users, integrate with home automation

## API Integration Patterns

**Price Data Integration (`lib/api/energi-data-service.ts`):**
```typescript
// Base pattern: Direct fetch with query parameters
const filter = encodeURIComponent(JSON.stringify({ PriceArea: priceArea }));
const url = `${BASE_URL}?limit=${hours}&filter=${filter}&sort=HourUTC%20desc`;
const response = await fetch(url, { next: { revalidate: 3600 } });
```

**Solar Data Integration (`lib/api/open-meteo.ts`):**
```typescript
// Pattern: Query string parameters for location and forecast options
const url = `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${lat}&longitude=${lon}` +
  `&hourly=shortwave_radiation,direct_radiation,diffuse_radiation,direct_normal_irradiance,temperature_2m,cloudcover` +
  `&timezone=Europe/Copenhagen` +
  `&forecast_days=${Math.min(days, 16)}`;
```

**API Route Pattern (`app/api/*/route.ts`):**
```typescript
// Standard Next.js API routes with query parameters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priceArea = searchParams.get('area') || 'DK1';
  // ... fetch external data
  return NextResponse.json({ success: true, data: [...] });
}
```

## Data Models & Integration

**Installation Model** (`prisma/schema.prisma`):
- Stores user's solar installation specs (panels, wattage, efficiency)
- Links to SetupCost (one-to-one) and MonthlyData (one-to-many)
- Used to calculate production estimates from Open-Meteo data

**MonthlyData Model** (`prisma/schema.prisma`):
- Stores monthly production/consumption/financial tracking
- Integrates electricity prices from Energi Data Service
- Tracks self-sufficiency and grid earnings

**Integration Flow:**
1. User enters installation specs in UI
2. `/api/solar` fetches Open-Meteo forecast with system size
3. `/api/prices` fetches Energi Data Service spot prices
4. `/api/optimize` combines price + solar data for recommendations
5. Monthly data persisted to Prisma/SQLite
6. UI displays charts via Recharts

---

*Integration audit: 2026-01-28*
