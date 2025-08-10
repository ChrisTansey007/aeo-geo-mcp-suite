# Database Operations

Migrations are managed with `drizzle-kit` using the configuration in
`backend/drizzle.config.ts`.  Common commands are exposed as npm scripts in the
`backend` package:

- `npm run db:generate` – generate migrations from the schema
- `npm run db:migrate` – apply migrations
- `npm run db:studio` – open the drizzle studio UI
- `npm run db:seed` – optional seeding logic
- `npm run db:reset` – drop the database and run migrations

The database file `data/app.db` is backed up nightly to
`data/backups/app-YYYYMMDD.db` by running `npm run tsx src/backup.ts`.
Export and import of individual runs are provided via `/api/export/:id` and
`/api/import` and use a gzipped NDJSON representation.
