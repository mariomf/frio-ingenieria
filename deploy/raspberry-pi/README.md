# Base de datos self-host en Raspberry Pi 4

Stack ligero **compatible con `@supabase/supabase-js`** para mover la base de datos
de Supabase Cloud a una Raspberry Pi, **gratis** y **sin pausas por inactividad**.

**Componentes:** PostgreSQL · PostgREST (API REST que consume el SDK) · Caddy (gateway `/rest/v1`, TLS automático) · DDNS + port-forwarding en router OpenWrt (acceso público sin depender de un túnel de terceros).

No se incluyen realtime/storage/auth/analytics porque la app no los usa → menos RAM.

## Requisitos en el laboratorio (RPi + HDD externo + router OpenWrt)
- Raspberry Pi OS Lite 64-bit.
- **Disco:** HDD mecánico externo en vez de microSD (evita corrupción por desgaste de escrituras del SO).
  - Usa una **carcasa/enclosure con alimentación propia** (no bus-powered): un RPi4 no siempre puede alimentar de forma estable un HDD 3.5"/2.5" solo por USB.
  - Formatea en **ext4** y monta por **UUID** en `/etc/fstab` (evita depender de `/dev/sdX`, que puede cambiar de nombre).
  - Desactiva el spin-down/APM del disco: `sudo hdparm -B 254 -S 0 /dev/sdX` (evita latencia de arranque del disco que dispare el healthcheck de Postgres).
  - Monta con `noatime` para reducir escrituras innecesarias.
  - Ajusta las rutas de `./data/pg`, `./data/caddy` y `BACKUP_DIR` en `docker-compose.yml`/`.env` para que apunten al punto de montaje del HDD (ej. `/mnt/hdd`).
- Docker + Docker Compose (`curl -fsSL https://get.docker.com | sh`).
- **UPS/no-break**: aún más importante que con SSD, ya que un corte de luz durante una escritura mecánica en HDD tiene más riesgo de daño/corrupción.
- **Router OpenWrt** para DDNS + port-forwarding (ver sección siguiente). Si tu OpenWrt está detrás del router de tu ISP (doble NAT), necesitas configurar el reenvío de puertos en **ambos** dispositivos, o poner el router del ISP en modo bridge/DMZ hacia la IP del OpenWrt.
- ⚠️ **Antes de continuar**, verifica que tu ISP no use **CGNAT** (IP pública compartida entre varios clientes): compara la IP que reporta el router del ISP con la que ves en un servicio externo (ej. `curl ifconfig.me` desde dentro de tu red vs el estado WAN del router). Si hay CGNAT, el port-forwarding no funcionará y tocaría usar un túnel saliente (ej. Cloudflare Tunnel) en su lugar.

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

# 4) Configura DDNS + port-forwarding
#    a) En el router OpenWrt: instala ddns-scripts + luci-app-ddns, configura tu
#       proveedor DDNS gratuito (DuckDNS/No-IP/etc.) y anota el hostname resultante.
#    b) Reserva DHCP estática para la IP LAN de la Raspberry Pi en OpenWrt.
#    c) Firewall > Port Forwards en OpenWrt: WAN:443 -> RPi:443, WAN:80 -> RPi:80.
#    d) Si tienes doble NAT, repite el reenvío de 443/80 en el router del ISP
#       hacia la IP LAN del router OpenWrt (o usa modo bridge/DMZ si lo soporta).
#    e) Edita el Caddyfile y reemplaza "TU-SUBDOMINIO.duckdns.org" por tu
#       hostname DDNS real. Guarda ese mismo valor en DDNS_HOSTNAME dentro de .env.

# 5) Levanta el stack
docker compose up -d

# 6) Carga el esquema y permisos
bash scripts/load-schema.sh

# 7) Prueba local
curl -s -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  http://localhost:8000/rest/v1/brands?select=name

# 8) Prueba pública (una vez que el DNS/DDNS y el forwarding estén activos)
curl -s -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  https://TU-SUBDOMINIO.duckdns.org/rest/v1/brands?select=name
```

## Conectar la app (Vercel)
En las variables de entorno de Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-SUBDOMINIO.duckdns.org
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
- **HDD externo** en vez de microSD evita corrupción por escrituras del SO, pero es más lento que un SSD y más sensible a golpes/vibración: colócalo fijo y evita moverlo con el equipo encendido.
- **UPS** + apagado seguro es crítico, más aún con HDD mecánico (riesgo de daño físico/corrupción si se corta la luz a mitad de una escritura).
- **DDNS en OpenWrt** actualiza el registro DNS automáticamente si tu IP pública cambia, pero **no te protege de CGNAT** ni reconecta un túnel — si tu ISP asigna una IP dinámica sin CGNAT esto es suficiente; sin IP pública real, no funcionará.
- Si la Pi se cae, la web de Vercel sigue en línea; solo se degradan las páginas con BD.
- Monitorea con UptimeRobot apuntando a `https://TU-SUBDOMINIO.duckdns.org/rest/v1/brands?select=name` (con header apikey).
- **Seguridad adicional** al exponer puertos directamente a internet (sin la capa de Cloudflare): considera rate limiting en Caddy y revisa que las políticas RLS de las tablas expuestas al rol `anon` sean estrictas, ya que el endpoint es alcanzable por cualquiera en internet.
