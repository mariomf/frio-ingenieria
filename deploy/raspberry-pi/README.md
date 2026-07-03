# Base de datos self-host en Raspberry Pi 4

Stack ligero **compatible con `@supabase/supabase-js`** para mover la base de datos
de Supabase Cloud a una Raspberry Pi, **gratis** y **sin pausas por inactividad**.

**Componentes:** PostgreSQL · PostgREST (API REST que consume el SDK) · Caddy (gateway `/rest/v1`) · Cloudflare Tunnel (acceso público con TLS, sin IP fija ni abrir puertos).

No se incluyen realtime/storage/auth/analytics porque la app no los usa → menos RAM.

## Requisitos en la Pi
- Raspberry Pi OS Lite 64-bit, arrancando desde **SSD USB** (no microSD).
- Docker + Docker Compose (`curl -fsSL https://get.docker.com | sh`).
- (Recomendado) UPS/no-break para cortes de luz.

## Puesta en marcha

```bash
# 1) En la Pi, clona el repo y entra a la carpeta
cd deploy/raspberry-pi
cp .env.template .env

# 2) Genera secretos
openssl rand -hex 24   # -> POSTGRES_PASSWORD
openssl rand -hex 24   # -> AUTHENTICATOR_PASSWORD
openssl rand -hex 32   # -> JWT_SECRET
# Edita .env con esos valores

# 3) Genera las API keys a partir del JWT_SECRET
node scripts/gen-keys.mjs "$(grep '^JWT_SECRET=' .env | cut -d= -f2-)"
# Copia ANON_KEY y SERVICE_ROLE_KEY al .env

# 4) Crea el túnel en Cloudflare Zero Trust (Tunnels), copia el token a
#    CLOUDFLARE_TUNNEL_TOKEN y apunta el hostname público a  http://caddy:8000

# 5) Levanta el stack
docker compose up -d

# 6) Carga el esquema y permisos
bash scripts/load-schema.sh

# 7) Prueba local
curl -s -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  http://localhost:8000/rest/v1/brands?select=name
```

## Conectar la app (Vercel)
En las variables de entorno de Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://db.tudominio.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

Redeploy y verifica `/refacciones`, `/dashboard/leads` y `/test-db`.
**No hay cambios de código**: el SDK sigue funcionando contra PostgREST.

## Backups
```bash
# Prueba manual
bash scripts/backup.sh
# Programar diario (crontab -e)
0 3 * * * /ruta/al/repo/deploy/raspberry-pi/scripts/backup.sh
```
Restaurar: `gunzip -c backups/frio_XXXX.sql.gz | docker exec -i frio-db psql -U postgres -d postgres`

## Auto-arranque al bootear
Docker ya reinicia los contenedores (`restart: unless-stopped`). Asegura que el
servicio de Docker esté habilitado: `sudo systemctl enable docker`.

## Notas de resiliencia
- **SSD** en vez de microSD evita corrupción por escrituras.
- **UPS** + apagado seguro evita corrupción por cortes de luz.
- **Cloudflare Tunnel** reconecta solo y da hostname fijo aunque cambie tu IP.
- Si la Pi se cae, la web de Vercel sigue en línea; solo se degradan las páginas con BD.
- Monitorea con UptimeRobot apuntando a `https://db.tudominio.com/rest/v1/brands?select=name` (con header apikey).
