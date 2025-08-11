# Backend API

This backend exposes endpoints for SEO tools and runtime log access.

## Logging

- `GET /logs` – return a `LogPage` of stored log entries.
- `GET /logs/stream` – Server‑sent events stream of log entries with periodic heartbeats.
- `GET /logs/download` – download log entries as NDJSON within a time range.
- `POST /logs/ingest/frontend` – ingest logs from the frontend (API‑key protected).
- `GET /healthz/logs` – report ring buffer size and ingestion lag.

Query parameters and models are documented in the OpenAPI schema.
