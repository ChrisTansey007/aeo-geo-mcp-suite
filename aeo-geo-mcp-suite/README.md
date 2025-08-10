# AEO/GEO MCP Suite (Python)

A suite of **stand‑alone** Model Context Protocol (MCP) servers you can run together or separately:

- **mcp-crawl** – Fetch HTML/PDF, sanitize, and canonicalize into blocks (tables preserved).
- **mcp-search** – Local BM25 site/web search; RRF scaffolding and adapter interfaces.
- **mcp-schema** – JSON‑LD generator (Jinja templates) and validator (`jsonschema`).
- **mcp-content-lint** – Lint rules from YAML; FKGL readability; citation checks.
- **mcp-publisher** – Filesystem + Git upsert with dry‑run unified diff and rollback.
- **mcp-analytics** – SQLite migrations; presence log; KPI time‑series.

All servers speak **JSON‑RPC 2.0** over **HTTP** (`POST /`) and **STDIO** (line‑delimited). Optional API‑key, rate‑limit, `/healthz` and Prometheus `/metrics` endpoints.

## Quickstart

```bash
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt

# Run servers (examples)
python servers/mcp-crawl/server.py --transport http --port 3001
python servers/mcp-search/server.py --transport http --port 3031
python servers/mcp-schema/server.py --transport http --port 3041
python servers/mcp-content-lint/server.py --transport http --port 3052
python servers/mcp-publisher/server.py --transport http --port 3051 --repo ./content-repo --base-url https://example.com
python servers/mcp-analytics/server.py --transport http --port 3061
```

**Auth:** Set `MCP_API_KEY` to require `Authorization: Bearer <key>` for HTTP or `params.apiKey` for STDIO.

**STDIO mode:** `--transport stdio` (useful for editor plugins).

## JSON-RPC test (HTTP)

```bash
curl -s localhost:3031 -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"search.query","params":{"q":"example","top_k":3}}' | jq
```

## Ports (suggested)
- crawl: **3001**
- search: **3031**
- schema: **3041**
- publisher: **3051**
- content-lint: **3052**
- analytics: **3061**

## Common CLI args (shared)
- `--transport http|stdio` (default: http)
- `--port <int>` (HTTP only; default varies per server)
- `--rate <int>` (requests per minute; default 60)
- `--api-key <string>` (overrides `MCP_API_KEY` env)
- `--log-level debug|info|warn|error`

See each server's README for extra args and examples.
