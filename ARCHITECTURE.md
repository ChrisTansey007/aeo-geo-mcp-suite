# Architecture

The project contains a lightweight SQLite database accessed via [drizzle-orm].  The
`backend` package exposes an Express server that persists run information,
analysis cards and evidence, chat threads/messages and uploaded files.  All
records live in `data/app.db` and are created via migrations in
`backend/drizzle`.

The frontend React application talks to this API via `frontend/src/lib/api.ts`
and uses a small Zustand store for optimistic updates.
