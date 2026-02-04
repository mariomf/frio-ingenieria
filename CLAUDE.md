# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Corporate website for Frío Ingeniería, an industrial refrigeration company in Mexico. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Supabase as the backend.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production (SSG)
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Data Flow
```
Pages (Server Components) → Services → Supabase Client → PostgreSQL
```

### Key Directories
- `src/app/` - Next.js App Router pages (SSG by default)
- `src/lib/services/` - Data access layer (Repository Pattern)
- `src/lib/supabase.ts` - Supabase client configuration
- `src/types/database.ts` - TypeScript types for all database tables
- `src/components/` - React components (layout/, ui/, parts/, projects/)
- `supabase/schema.sql` - Database schema definition

### Service Layer
All data fetching goes through services in `src/lib/services/`:
- `brandService.ts` - Brand operations (getAllBrands, getBrandBySlug, etc.)
- `partService.ts` - Parts with search and filtering (searchParts, getFilteredParts, etc.)
- `projectService.ts` - Project operations with industry/application filters
- `equipmentService.ts` - Equipment operations (not actively used yet)

Services are re-exported from `src/lib/services/index.ts` for clean imports.

### Database Tables (Supabase)
- `brands` - Equipment manufacturers (MYCOM, YORK-FRICK, etc.)
- `parts` - Spare parts with full-text search support
- `projects` - Customer projects with industry/application tags
- `equipment` - Equipment catalog (not actively used)
- `quotes`, `leads` - CRM tables for future use

### Component Patterns
- Pages are **Server Components** (async functions) that fetch data directly
- Interactive components (like PartCard with "add to quote" button) are **Client Components**
- UI components use `class-variance-authority` (CVA) for variant styling

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Path Aliases
TypeScript path alias configured: `@/*` maps to `./src/*`

## Testing Database Connection

Visit `/test-db` route to verify Supabase connectivity and see table counts.
