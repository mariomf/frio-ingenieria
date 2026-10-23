# Frío Ingeniería

Sitio web para una empresa de refrigeración industrial en México, con catálogo de refacciones y una herramienta interna de prospección de clientes potenciales.

## Estado del proyecto

El repositorio contiene el sitio Next.js, servicios de datos para Supabase y un prospector de leads con scoring determinístico o asistido por LLM. La base self-hosted para Raspberry Pi también cuenta con archivos de despliegue.

La implementación está en etapa de MVP, no de producto terminado. Antes de usarla en producción, considera que:

- Los formularios de contacto, cotización y suscripción todavía no envían datos a un backend.
- La búsqueda del catálogo y el dashboard de leads no tienen una experiencia completa de interacción/administración.
- El dashboard no tiene autenticación visible en la aplicación y sus consultas usan la clave pública de Supabase. Las políticas RLS deben revisarse antes de habilitarlo.
- El endpoint `POST /api/agents/prospector` puede iniciar una prospección; protégelo y limita su uso antes de exponerlo públicamente.
- La ruta de cron existe, pero `vercel.json` tiene `crons: []`: no hay una ejecución programada configurada actualmente.
- Hay scripts manuales de prueba de integraciones, pero no una suite automatizada configurada en `package.json`.

Este estado describe el código y la configuración del repositorio; no confirma que las credenciales, servicios externos o despliegues estén activos.

## Stack

- Next.js 14 (App Router), React 18 y TypeScript
- Tailwind CSS
- Supabase/PostgreSQL para catálogo y CRM
- Integraciones opcionales: Anthropic/OpenAI, Google Maps, DENUE, Apollo.io y Resend
- Para base self-hosted: PostgreSQL, PostgREST y Caddy en Docker Compose

## Requisitos

- Node.js 18.17 o posterior y npm
- Proyecto Supabase (o el stack self-hosted documentado)
- Variables de entorno según las integraciones que se quieran activar

## Inicio local

```bash
npm install
cp .env.example .env.local
# Edita .env.local con tus credenciales; no uses valores de ejemplo en producción.
npm run dev
```

Abre <http://localhost:3000>. Para compilar y ejecutar la versión de producción:

```bash
npm run build
npm start
```

`npm run lint` ejecuta `next lint`. Los scripts `scripts/test-*.ts` son pruebas manuales de integraciones y pueden requerir credenciales o llamadas a servicios externos.

## Variables de entorno

Las variables y comentarios de referencia están en [`.env.example`](.env.example). Las principales son:

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase/PostgREST |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública para operaciones de lectura permitidas por RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Operaciones administrativas del servidor; mantener secreta |
| `ANTHROPIC_API_KEY` | Calificación/priorización LLM con Anthropic |
| `OPENAI_API_KEY` | Proveedor alternativo disponible en servicios de IA |
| `GOOGLE_MAPS_API_KEY`, `DENUE_API_TOKEN` | Fuentes de prospección opcionales |
| `APOLLO_API_KEY` | Enriquecimiento opcional de empresas/contactos |
| `RESEND_API_KEY` | Notificaciones por correo |
| `CRON_SECRET` | Autorización de la ruta de cron |

Para desactivar fuentes existen `DISABLE_GOOGLE_MAPS`, `DISABLE_SCRAPING` y `QUALIFICATION_MODE`. Revisa `.env.example` para la lista y opciones completas. No compartas ni subas `.env.local` o claves de servicio al repositorio.

## Base de datos

El esquema base está en [`supabase/schema.sql`](supabase/schema.sql); las extensiones del prospector están en `supabase/migrations/002_agent_tables.sql` y `003_add_person_fields.sql`. La aplicación espera las tablas de catálogo y CRM definidas ahí.

En un proyecto Supabase, aplica primero el esquema base y después las migraciones en orden. Conserva una copia de seguridad y verifica RLS en el proyecto destino: el SQL del repositorio no sustituye una revisión de permisos para producción.

Para una instalación self-hosted en Raspberry Pi, consulta [`deploy/raspberry-pi/README.md`](deploy/raspberry-pi/README.md). La carga de esquema de ese procedimiento es un bootstrap para una base nueva; no asumas que puede repetirse de forma segura.

## Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Página principal |
| `/servicios`, `/proyectos`, `/refacciones`, `/nosotros` | Páginas comerciales |
| `/contacto`, `/recursos` | Formularios/interfaz informativa; revisar las limitaciones indicadas arriba |
| `/dashboard/leads` | Vista de leads; no implementa autenticación de usuario |
| `/api/agents/prospector` | `POST` inicia una ejecución; `GET?runId=...` consulta estado |
| `/api/cron/prospect` | Ejecución del prospector autorizada con `CRON_SECRET`; no programada en la configuración actual |
| `/test-db` | Página de diagnóstico de conexión a datos |

## Documentación

- [`CLAUDE.md`](CLAUDE.md): contexto y convenciones para contribuir con Claude Code.
- [`INTEGRATION_NOTES.md`](INTEGRATION_NOTES.md): esquema, servicios e integración con Supabase.
- [`CHANGES_SUMMARY.md`](CHANGES_SUMMARY.md): nota histórica de la integración inicial.
- [`deploy/raspberry-pi/README.md`](deploy/raspberry-pi/README.md): despliegue y operación de la base self-hosted.

## Próximos pasos recomendados

1. Conectar formularios y cotizaciones con endpoints validados y persistencia.
2. Definir autenticación y permisos para dashboard/CRM, revisar RLS y proteger el endpoint de prospección.
3. Implementar búsqueda/filtros del catálogo y gestión de leads.
4. Crear pruebas automatizadas para lógica crítica e integraciones.
5. Configurar cron, monitoreo, respaldos y secretos en el entorno de despliegue.
