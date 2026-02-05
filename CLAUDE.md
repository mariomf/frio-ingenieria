# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Frío Ingeniería** - Industrial refrigeration solutions company website with AI-powered lead prospection system. Sells Frick, Danfoss, MYCOM equipment parts to food processing, dairy, beverage, and pharmaceutical industries in Mexico/LATAM.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5.3, Tailwind CSS, Supabase (PostgreSQL), LangChain with Anthropic/OpenAI

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npm start        # Run production server

# Test scraping services
npx tsx scripts/test-scraping.ts
```

## Architecture

### Service Layer Pattern
All database operations go through typed services in `src/lib/services/`:
- `brandService.ts`, `equipmentService.ts`, `partService.ts`, `projectService.ts` - CRUD for catalog data
- `leadsService.ts` - Lead CRM operations with scoring
- `googleMapsService.ts` - Google Maps Places API for lead prospection
- `scrapingService.ts` - SIEM/CANACINTRA/DENUE data services

Services use two Supabase clients from `src/lib/supabase.ts`:
- **Public client** - Uses anon key (safe for client-side)
- **Server client** - Uses service role key (admin operations in API routes)

### AI Agent System
Located in `src/lib/agents/`:

**ProspectorAgent** (`prospector-agent.ts`) orchestrates lead generation:
1. `search-leads` tool - Queries prospect sources (Google Maps, SIEM, CANACINTRA)
2. `qualify-lead` tool - Scores leads 0-100 (demographic + intent + engagement factors)
3. `enrich-lead` tool - Fetches additional contact data
4. `save-lead` tool - Persists to Supabase `leads` table

Agent prompts in `src/lib/agents/prompts/prospector.ts` define scoring criteria:
- HOT (80-100): Immediate contact
- WARM (60-79): Active nurturing
- COLD (40-59): Passive nurturing
- DISCARD (<40): Do not process

### API Endpoints
- `POST /api/agents/prospector` - Start prospection run with config (industries, regions, maxLeads)
- `GET /api/agents/prospector?runId=x` - Check run status
- `GET /api/cron/prospect` - Scheduled job (requires CRON_SECRET header)

## Database Schema (Supabase)

Key tables:
- `brands`, `equipment`, `parts`, `projects` - Product catalog
- `leads` - CRM with 27 fields including score, category (HOT/WARM/COLD), equipment_brands
- `agent_runs` - Tracks AI agent executions
- `lead_interactions` - Multi-channel contact history
- `prospect_sources` - Lead source configurations

Types are defined in `src/types/database.ts` (auto-generated from Supabase).

## Configuration

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY (or OPENAI_API_KEY)
CRON_SECRET
```

Optional for lead prospection:
```
GOOGLE_MAPS_API_KEY          # Google Places API
DISABLE_GOOGLE_MAPS=true     # Disable Google Maps temporarily
DENUE_API_TOKEN              # INEGI DENUE API (free token)
DISABLE_SCRAPING=true        # Disable all scraping
```

## Business Constants

`src/lib/constants.ts` defines:
- Target industries: lácteos, cárnicos, bebidas, chocolates, frutas-verduras, petroquímica
- Target brands: MYCOM, YORK-FRICK, Danfoss, Parker
- Company info, navigation items, featured clients

## Code Conventions

- TypeScript strict mode enabled
- Path alias: `@/*` maps to `src/*`
- Spanish language for UI content and user-facing text
- Services return `null` on error with console logging
- Tailwind uses custom color palettes: `primary-*` (blue), `accent-*` (orange), `industrial-*` (gray)

---

## Current Progress / Avances del Proyecto

### MVP Status (Fase 1A)

| Component | Status | Notes |
|-----------|--------|-------|
| ProspectorAgent | ✅ Complete | LangChain with tools |
| Lead Scoring System | ✅ Complete | 0-100 pts, HOT/WARM/COLD |
| Dashboard de Leads | ✅ Complete | UI with stats and cards |
| Supabase Integration | ✅ Complete | All tables created |
| Google Maps API | ✅ Complete | Real API + mock fallback |
| SIEM/CANACINTRA | ✅ Complete | Curated dataset + DENUE API ready |
| Apollo.io Integration | ✅ Complete | Company enrichment (free plan) |
| Notificaciones (Resend) | ✅ Complete | HOT lead alerts + daily summary |
| Twilio WhatsApp | ⏳ Pending | Variables configured |

### Recent Changes (2026-02-05)

1. **Apollo.io Integration** (`src/lib/services/apolloService.ts`)
   - Replaced LinkedIn MCP with Apollo.io API
   - Company enrichment (industry, size, website, LinkedIn)
   - Free plan support with intelligent domain guessing
   - People search ready for paid plan upgrade

2. **Email Notifications** (`src/lib/services/emailService.ts`)
   - Resend integration for HOT lead alerts
   - Beautiful HTML email templates
   - Auto-notification on new HOT leads (score 80+)
   - Daily summary email with lead stats
   - Configurable recipients via env vars

3. **Environment Variables Added**
   - `APOLLO_API_KEY` - Apollo.io API
   - `ENRICHMENT_PROVIDER` - 'apollo' | 'linkedin' | 'both'
   - `RESEND_FROM_EMAIL` - Sender email (optional)
   - `LEAD_NOTIFICATION_EMAILS` - Recipients for alerts

4. **Vercel Cron Configuration** (`vercel.json`)
   - Automatic prospection daily at 6:00 AM
   - Sends daily summary email with results
   - Secured with CRON_SECRET header

### Next Steps (Pending)

1. **Twilio WhatsApp** - WhatsApp notifications for sales team
2. **Airtable Sync** - Bidirectional sync for sales team view
3. **Admin panel** - Manual lead management

### Test Commands

```bash
# Test Apollo.io service
npx tsx scripts/test-apollo.ts

# Test email notifications
npx tsx scripts/test-email.ts

# Test scraping services
npx tsx scripts/test-scraping.ts

# Test prospector API
curl -X POST http://localhost:3001/api/agents/prospector \
  -H "Content-Type: application/json" \
  -d '{"industries":["dairy","meat"],"regions":["mexico"],"maxLeads":10}'
```

### Notion Plan Reference
- Page: "AI Plan to generate selling agents"
- ID: 2f97346c-4230-8032-8054-e08f0b590385
- Parent: "Suministro de refacciones críticas y continuidad operativa"
