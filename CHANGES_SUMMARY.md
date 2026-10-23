# Historial: integración inicial con Supabase

> Nota histórica: este documento resume la integración registrada el 21 de enero de 2026. No es un changelog completo ni describe por sí solo el estado actual del proyecto. Para el estado vigente, consulta [`README.md`](README.md).

## Alcance de aquella integración

Se incorporaron servicios para consultar marcas, equipos, refacciones y proyectos, y componentes de tarjetas para marcas, partes y proyectos. Las páginas de refacciones y proyectos se adaptaron para obtener datos desde Supabase y mostrar estados vacíos.

Los archivos principales que siguen formando parte de la implementación son:

- `src/lib/services/brandService.ts`
- `src/lib/services/equipmentService.ts`
- `src/lib/services/partService.ts`
- `src/lib/services/projectService.ts`
- `src/components/parts/BrandCard.tsx`
- `src/components/parts/PartCard.tsx`
- `src/components/projects/ProjectCard.tsx`
- `src/app/refacciones/page.tsx`
- `src/app/proyectos/page.tsx`

## Esquema y configuración

El esquema base actual está en `supabase/schema.sql`; posteriormente se añadieron las migraciones `002_agent_tables.sql` y `003_add_person_fields.sql` para CRM/prospección. Las credenciales se configuran localmente en `.env.local`, creado a partir de `.env.example`, y no deben guardarse en Git.

Las afirmaciones de compilación y lint que aparecían en la versión original de esta nota corresponden a ese momento y no han sido verificadas como estado actual.

## Mejoras que siguen relevantes

- Conectar formularios y solicitudes de cotización con persistencia real.
- Hacer funcionales búsqueda y filtros del catálogo.
- Añadir páginas de detalle de proyectos/refacciones y un flujo de cotización.
- Definir autenticación, permisos y pruebas automatizadas.

La guía de integración vigente está en [`INTEGRATION_NOTES.md`](INTEGRATION_NOTES.md).
