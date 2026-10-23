# Integración con Supabase

Esta guía describe la estructura de datos y el uso actual de Supabase en la aplicación. No confirma que un proyecto Supabase o sus credenciales estén disponibles.

## Esquema

El esquema inicial está en [`supabase/schema.sql`](supabase/schema.sql) e incluye:

- `brands`, `equipment`, `parts`: catálogo.
- `projects`: casos de proyecto publicados.
- `quotes`, `leads`: solicitudes y CRM básico.

Las migraciones amplían `leads` y agregan tablas y funciones del prospector:

1. `supabase/migrations/002_agent_tables.sql`: scoring, estado de leads, ejecuciones de agentes, interacciones, fuentes y reglas.
2. `supabase/migrations/003_add_person_fields.sql`: campos para leads de persona y asociación con empresa.

En una base nueva, aplica primero `schema.sql` y luego las migraciones en orden. Usa el mecanismo de migraciones del entorno para llevar control de qué se aplicó; no asumas que volver a ejecutar todo el SQL es seguro.

## Acceso desde la aplicación

- `src/lib/supabase.ts` exporta el cliente público con URL y anon key, y una fábrica de cliente servidor con service role.
- Los servicios de catálogo están bajo `src/lib/services/`.
- `leadsService.ts` consulta leads con anon en algunas operaciones de lectura y usa service role para cambios administrativos.
- `base-agent.ts` y herramientas de agentes usan service role en el servidor.

Variables principales:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Consulta [`.env.example`](.env.example) para las claves opcionales de prospección, enriquecimiento y correo. No pongas `SUPABASE_SERVICE_ROLE_KEY` en variables `NEXT_PUBLIC_*` ni en código ejecutado por el navegador.

## RLS y permisos

El esquema define lectura pública para partes del catálogo y proyectos publicados, e inserciones públicas para cotizaciones y leads. Las tablas del agente tienen políticas propias en la migración 002. Antes de desplegar:

- Revisa las políticas efectivas en la base destino, no solo los archivos SQL.
- El dashboard `/dashboard/leads` no implementa autenticación de usuario y sus consultas de lectura usan la anon key. El esquema versionado no otorga `SELECT` público a `leads`, por lo que RLS puede bloquear su contenido.
- Protege las rutas que usan service role; esta clave omite RLS y debe permanecer exclusivamente del lado servidor.
- Valida los formularios y limita inserciones públicas para evitar abuso.

## Catálogo y formularios

Las páginas `/refacciones` y `/proyectos` consultan datos de Supabase. Aunque existen servicios de búsqueda/filtro, los controles visibles de búsqueda y cotización no están conectados a una experiencia completa; el formulario de contacto tampoco tiene envío a un endpoint persistente.

`/test-db` es una página de diagnóstico, no una prueba de permisos o de preparación para producción.

## Base self-hosted

Para el stack PostgreSQL + PostgREST + Caddy de Raspberry Pi, consulta [`deploy/raspberry-pi/README.md`](deploy/raspberry-pi/README.md). La aplicación usa el SDK de Supabase contra una API compatible, pero el stack no ofrece todos los productos de Supabase (por ejemplo, Auth, Storage o Realtime).
