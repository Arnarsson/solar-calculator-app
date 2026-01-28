# Technology Stack

**Analysis Date:** 2026-01-28

## Languages

**Primary:**
- TypeScript 5.5.4 - Application code, type safety for frontend and backend
- JavaScript (JSX/TSX) - React components and Next.js

**Secondary:**
- SQL - Prisma schema migrations and queries

## Runtime

**Environment:**
- Node.js 18+ (specified in prerequisites)

**Package Manager:**
- npm - Specified in scripts; lockfile present at `package-lock.json`

## Frameworks

**Core:**
- Next.js 14.2.5 - Full-stack framework with App Router (frontend, API routes, server components)
- React 18.3.1 - UI rendering with hooks and server components

**UI & Styling:**
- Tailwind CSS 3.4.6 - Utility-first CSS framework
- Shadcn/UI - Prebuilt accessible components on top of Radix UI
- Radix UI (multiple packages) - Headless accessible component primitives
  - `@radix-ui/react-avatar` 1.1.0
  - `@radix-ui/react-dialog` 1.1.1
  - `@radix-ui/react-dropdown-menu` 2.1.1
  - `@radix-ui/react-label` 2.1.0
  - `@radix-ui/react-progress` 1.1.0
  - `@radix-ui/react-select` 2.1.1
  - `@radix-ui/react-slot` 1.1.0
  - `@radix-ui/react-tabs` 1.1.0
- class-variance-authority 0.7.0 - Component variant generation
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 2.4.0 - Merge Tailwind classes intelligently
- lucide-react 0.408.0 - Icon library

**Build/Dev:**
- TypeScript 5.5.4 - Type checking
- ESLint 9.39.2 - Code linting
- eslint-config-next 16.1.4 - Next.js ESLint rules
- PostCSS 8.4.39 - CSS processing
- Autoprefixer 10.4.19 - Vendor prefixes for CSS
- Prisma 5.17.0 - ORM and migration tooling (dev dependency)

**Forms & Validation:**
- React Hook Form 7.52.1 - Form state management
- `@hookform/resolvers` 3.9.0 - Validation resolver adapters
- Zod 3.23.8 - TypeScript-first schema validation

**Charts & Visualization:**
- Recharts 2.12.7 - React charting library

**Authentication & Security:**
- NextAuth.js 4.24.7 - Authentication framework
- bcryptjs 2.4.3 - Password hashing

**Data Access:**
- `@prisma/client` 5.17.0 - Database ORM client
- Prisma 5.17.0 - ORM, schema management, migrations (dev)

## Key Dependencies

**Critical:**
- Next.js 14.2.5 - Core framework for SSR, API routes, and server components
- `@prisma/client` 5.17.0 - Database operations and ORM
- React 18.3.1 - UI library foundation
- React Hook Form 7.52.1 - Form state (used throughout UI)
- Zod 3.23.8 - Runtime type validation for API inputs

**Infrastructure:**
- NextAuth.js 4.24.7 - User authentication and session management
- bcryptjs 2.4.3 - Password hashing for local auth
- Radix UI packages - Accessible component foundations
- Tailwind CSS 3.4.6 - Responsive styling

**Utilities:**
- clsx 2.1.1 - Conditional CSS class generation
- tailwind-merge 2.4.0 - Safe Tailwind class merging
- lucide-react 0.408.0 - Icon assets
- Recharts 2.12.7 - Data visualization

## Configuration

**Environment:**
- Managed via `.env` file (example at `.env.example`)
- Critical variables:
  - `DATABASE_URL` - SQLite dev (file-based) or PostgreSQL (production)
  - `NEXTAUTH_SECRET` - Session encryption key
  - `NEXTAUTH_URL` - Auth callback URL (http://localhost:3000 for dev)
- Environment files ignored: `.env`, `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local`

**Build:**
- `tsconfig.json` - TypeScript compiler options with strict mode, path aliases (`@/*`)
- `next.config.mjs` - Next.js configuration:
  - Experimental server component external packages: `@prisma/client`, `bcryptjs`
- `tailwind.config.ts` - Tailwind theme customization with custom color scheme (dark mode support)
- `postcss.config.mjs` - PostCSS plugins (Tailwind, Autoprefixer)
- `eslint.config.mjs` and `.eslintrc.json` - ESLint configuration for code quality

**Database:**
- `prisma/schema.prisma` - ORM schema with SQLite provider
- Default data source: `file:./dev.db` (SQLite)
- Optional: PostgreSQL for production (commented in `.env.example`)

## Platform Requirements

**Development:**
- Node.js 18 or later
- npm or yarn package manager
- Git (for version control)

**Production:**
- Node.js runtime
- Vercel (preferred, indicated by `.vercel` in .gitignore)
- Alternative: Any Node.js hosting (AWS, Heroku, etc.)
- Optional: Vercel PostgreSQL for scalable database

**Scripts:**
- `npm run dev` - Development server (Next.js dev mode)
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint checks
- `npm run db:push` - Prisma database push (schema sync)
- `npm run db:studio` - Prisma Studio GUI
- `npm run db:generate` - Prisma client generation

---

*Stack analysis: 2026-01-28*
