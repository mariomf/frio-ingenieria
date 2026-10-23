# Guía para trabajar en el repositorio

## Proyecto

Frío Ingeniería es un sitio de refrigeración industrial para México y LATAM. El repositorio contiene páginas comerciales, catálogo consultado desde Supabase y un prototipo de prospección de leads.

## Stack y comandos

- Next.js 14 App Router, React 18, TypeScript 5.3 y Tailwind CSS.
- Supabase/PostgreSQL para catálogo y CRM.
- Integraciones opcionales: Anthropic/OpenAI, Google Maps, DENUE, Apollo.io y Resend.

```bash
npm install
cp .env.example .env.local
npm run dev
npm run lint
npm run build
npm start
```

Los scripts `scripts/test-*.ts` son pruebas manuales de servicios; pueden requerir claves API o consumir servicios externos. No hay una suite automatizada definida en `package.json`.

## Estructura

- `src/app/`: páginas y endpoints App Router.
- `src/components/`: componentes de interfaz.
- `src/lib/services/`: acceso a Supabase e integraciones externas.
- `src/lib/agents/`: ejecución, scoring, enriquecimiento y guardado de leads.
- `src/types/`: tipos TypeScript de base de datos y agentes.
- `supabase/schema.sql`: esquema base.
- `supabase/migrations/`: extensiones del CRM/prospector.
- `deploy/raspberry-pi/`: PostgreSQL + PostgREST + Caddy con Docker Compose.

Los servicios de catálogo se encuentran en `brandService.ts`, `equipmentService.ts`, `partService.ts` y `projectService.ts`. `leadsService.ts` implementa consultas y operaciones del CRM; `googleMapsService.ts`, `scrapingService.ts`, `apolloService.ts` y `emailService.ts` integran fuentes/proveedores.

## Prospector

`src/lib/agents/prospector-agent.ts` coordina la búsqueda, calificación, enriquecimiento, priorización y persistencia de leads. Admite modos de empresa y persona. El scoring puede ser determinístico o usar Anthropic cuando la configuración y la clave están disponibles; Apollo, Google Maps y DENUE dependen de credenciales/planes externos. LinkedIn queda como integración opcional heredada.

Endpoints:

- `POST /api/agents/prospector`: inicia una ejecución síncrona con parámetros como `industries`, `regions`, `maxLeads`, `minScore`, `dryRun`, `searchMode`, `targetTitles` y `maxPeoplePerCompany`.
- `GET /api/agents/prospector?runId=...`: consulta el registro de una ejecución.
- `GET /api/cron/prospect`: ejecuta la prospección predeterminada y puede enviar resumen por correo si Resend está configurado.

La ruta de cron valida `CRON_SECRET`, pero el archivo actual `vercel.json` declara `crons: []`; no hay un horario activo configurado. El endpoint de prospección no debe exponerse sin controles de acceso, abuso y coste.

## Supabase y configuración

Usa `.env.example` como lista de variables. Las variables de Supabase más relevantes son `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. La clave de servicio solo debe usarse en el servidor y nunca exponerse en el cliente.

Aplica primero `supabase/schema.sql` y después, en orden, las migraciones `002_agent_tables.sql` y `003_add_person_fields.sql`. Las políticas RLS y los permisos deben revisarse para cada entorno. En el esquema versionado no hay política `SELECT` pública para `leads`; el dashboard consulta con la clave anon, por lo que su lectura puede ser denegada por RLS. El dashboard tampoco implementa autenticación de usuario.

No agregues credenciales reales a archivos versionados ni a logs. Mantén el idioma español para textos de usuario y sigue el tipado/convenios existentes.

## Estado y limitaciones conocidas

- El sitio y el flujo de prospección están implementados parcialmente, como MVP.
- Formularios de contacto, cotización y suscripción, y búsqueda/filtros visuales, no tienen persistencia/interacción completa.
- No hay CRUD de leads completo, autenticación del dashboard ni suite automatizada de pruebas.
- El estado descrito es inspección del repositorio, no verificación de credenciales, base de datos o despliegues en vivo.

Consulta [`README.md`](README.md) para puesta en marcha y estado del producto, [`INTEGRATION_NOTES.md`](INTEGRATION_NOTES.md) para la integración de datos y [`deploy/raspberry-pi/README.md`](deploy/raspberry-pi/README.md) para la base self-hosted.
