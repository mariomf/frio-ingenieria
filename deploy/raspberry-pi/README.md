# Base de datos self-hosted en Raspberry Pi 4

Este directorio contiene un stack mínimo compatible con el uso de `@supabase/supabase-js` para PostgreSQL: PostgreSQL 16, PostgREST y Caddy como gateway TLS. No incluye Auth, Storage, Realtime ni Analytics de Supabase.

> Esta opción expone una API de base de datos a Internet. Requiere administrar seguridad, respaldos, actualizaciones, disponibilidad y recuperación ante fallos. No la expongas hasta revisar permisos y RLS.

## Componentes del directorio

- `docker-compose.yml`: PostgreSQL, PostgREST y Caddy.
- `Caddyfile`: proxy TLS hacia PostgREST.
- `.env.template`: variables del stack; crea un `.env` local.
- `scripts/gen-keys.mjs`: genera las claves de API a partir del secreto JWT.
- `scripts/load-schema.sh`: crea roles, aplica esquema/migraciones y asigna permisos.
- `scripts/backup.sh`: genera respaldo de PostgreSQL.

## Requisitos

- Raspberry Pi OS Lite de 64 bits, Docker y Docker Compose.
- Dominio/DDNS con acceso desde Internet, IP pública y reenvío de puertos 80/443 al Pi. CGNAT impide el port-forwarding tradicional.
- Almacenamiento confiable; para HDD externo usa alimentación propia, sistema de archivos ext4 y montaje persistente. Se recomienda UPS.

## Instalación inicial

Desde la raíz del repositorio, en la Raspberry Pi:

```bash
cd deploy/raspberry-pi
cp .env.template .env
```

Genera valores distintos y aleatorios para `POSTGRES_PASSWORD`, `AUTHENTICATOR_PASSWORD` y `JWT_SECRET`; no reutilices ejemplos ni subas `.env`. Por ejemplo:

```bash
openssl rand -hex 24
openssl rand -hex 24
openssl rand -hex 32
```

Edita `.env` y `Caddyfile` para usar el hostname DDNS real. Asegura que `DDNS_HOSTNAME` y el hostname configurado en Caddy coincidan. Si el disco de datos no está en la ruta prevista, actualiza los volúmenes de `docker-compose.yml` y la ruta de backups.

Después:

```bash
docker compose up -d
node scripts/gen-keys.mjs "$(grep '^JWT_SECRET=' .env | cut -d= -f2-)"
```

Copia las claves generadas a las variables correspondientes del `.env`, y configura también el secreto del authenticator y contraseña de PostgreSQL. Luego carga el esquema:

```bash
bash scripts/load-schema.sh
```

El script aplica el esquema base y todos los archivos de migración presentes en el repositorio. Úsalo únicamente como bootstrap de una base nueva: el SQL base contiene políticas/triggers que no son plenamente idempotentes, aunque el script incluya operaciones repetibles. No lo ejecutes sobre una base existente sin revisar qué objetos ya fueron aplicados y contar con un respaldo.

## Configurar la aplicación

En el entorno donde se ejecuta Next.js (por ejemplo, Vercel), configura:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-HOSTNAME
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave anon generada>
SUPABASE_SERVICE_ROLE_KEY=<clave service role generada>
```

La clave service role es secreta y solo debe usarse del lado servidor. El SDK puede conectarse a PostgREST por Caddy, pero las características ausentes del stack de Supabase no estarán disponibles.

## Operación

Comprueba contenedores con `docker compose ps` y consulta sus logs con `docker compose logs`. Para respaldar manualmente:

```bash
bash scripts/backup.sh
```

Configura una tarea de respaldo periódica fuera del contenedor y conserva copias fuera de la Raspberry Pi. Verifica también que una restauración funcione antes de depender de los respaldos. El stack define `restart: unless-stopped`; habilita el servicio Docker al inicio del sistema.

## Seguridad y disponibilidad

- No publiques puertos de PostgreSQL/PostgREST directamente; el Compose publica Caddy en 80/443.
- Revisa RLS y los permisos de `anon` y `service_role`; el endpoint HTTPS es accesible públicamente.
- Usa contraseñas y secretos fuertes, únicos y no versionados; actualízalos cuando exista exposición.
- Configura firewall, actualizaciones, límites de tráfico y monitorización.
- Usa DDNS con IP pública; DDNS no resuelve CGNAT. Con doble NAT configura el reenvío en ambos routers.
- La Raspberry Pi es un punto único de fallo. Los respaldos, UPS y monitoreo no sustituyen redundancia.

Para el esquema, orden de migraciones y limitaciones de la aplicación, consulta [`../../INTEGRATION_NOTES.md`](../../INTEGRATION_NOTES.md) y [`../../README.md`](../../README.md).
