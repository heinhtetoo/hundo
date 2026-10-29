#!/bin/sh
# Installed to /etc/hundo/init-db.sh and mounted into the Postgres container.
# Runs ONCE, only when the data directory is empty — so it fires on a fresh
# volume and never again.
#
# Creates the application role. It owns the database, which is what lets the
# container entrypoint run migrations, but it is NOT a superuser: no
# `COPY ... FROM PROGRAM` (shell on the container), no `pg_read_file()`, no
# role creation, no access to other databases in the cluster.
#
# PG16 owns schema `public` via `pg_database_owner`, so transferring database
# ownership is enough — no explicit GRANT is needed.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE ROLE hundo_app LOGIN PASSWORD '$HUNDO_APP_PASSWORD';
ALTER DATABASE $POSTGRES_DB OWNER TO hundo_app;
SQL
