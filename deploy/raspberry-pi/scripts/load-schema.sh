#!/usr/bin/env bash
# Crea los roles de PostgREST, aplica el esquema de la app y asigna permisos.
# Idempotente: se puede correr varias veces.
set -euo pipefail

cd "$(dirname "$0")/.."
# Cargar variables (.env junto al docker-compose)
set -a; source ./.env; set +a

REPO_SUPABASE="${REPO_SUPABASE:-../../supabase}"
DB="${POSTGRES_DB:-postgres}"
PSQL=(docker exec -i frio-db psql -v ON_ERROR_STOP=1 -U postgres -d "$DB")

echo ">> Creando roles de PostgREST (anon, service_role, authenticator)..."
"${PSQL[@]}" <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '${AUTHENTICATOR_PASSWORD}';
  END IF;
END
\$\$;
ALTER ROLE authenticator WITH PASSWORD '${AUTHENTICATOR_PASSWORD}';
GRANT anon TO authenticator;
GRANT service_role TO authenticator;
GRANT USAGE ON SCHEMA public TO anon, service_role;
SQL

echo ">> Aplicando esquema base..."
"${PSQL[@]}" < "${REPO_SUPABASE}/schema.sql"

echo ">> Aplicando migraciones..."
for f in "${REPO_SUPABASE}"/migrations/*.sql; do
  echo "   - $(basename "$f")"
  "${PSQL[@]}" < "$f"
done

echo ">> Asignando permisos a los roles de la API..."
"${PSQL[@]}" <<SQL
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
SQL

echo ">> Recargando el esquema de PostgREST..."
"${PSQL[@]}" -c "NOTIFY pgrst, 'reload schema';" || true

echo "OK: esquema y permisos aplicados."
