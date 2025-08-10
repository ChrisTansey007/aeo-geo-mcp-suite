# Plan

## Repository Findings
- Monorepo with Python backend in `backend/` and React + Vite frontend in `frontend/`.

### Frontend
- Frontend currently contains placeholder `App.tsx`, basic routing pages under `src/pages`, card components under `src/cards`, and Zustand stores under `src/store`.
- Tailwind and Vite configuration present; shadcn/ui and Radix not yet integrated.
- No existing design system primitives or chat/run history features beyond minimal setup.

### Backend
- FastMCP server in `backend/mcp_server/seo_astro_analyzer_server.py` exposes tools like `get_title_meta`, `get_headings`, `get_links`, and more for SEO analysis.
- Tools delegate to modules in `backend/seo_tools/` (e.g., `title_meta.py`, `robots_canonical.py`, `headings.py`, `images_alt.py`, `links.py`, `structured_data.py`, `open_graph_twitter.py`, `wordcount_keywords.py`, `favicon_apple.py`, `lang_charset.py`, `sitemap_robots.py`) that fetch a URL and extract relevant SEO data.
- Each tool saves results as JSON files and logs operations to `backend.log`.
- `backend/requirements.txt` lists core dependencies: `fastmcp`, `beautifulsoup4`, and `requests`.
- No tests or additional APIs beyond these SEO utilities.

## Task List
1. Implement design system primitives in `src/components/*` using Tailwind, shadcn/ui, and Radix primitives (Button, Input, Badge, Chip, Card, Tabs, Drawer, Tooltip, DataTable, JSONViewer, Toast, Skeleton, ErrorBoundary).
2. Build app layout and navigation in `src/app` and `src/pages` with sidebar (Dashboard/History/Settings), top bar URL input with Run button, and responsive empty state.
3. Add run flow & result cards: URL validation, trigger `analyze(url)` via React Query, progress toasts, render result cards, evidence panel, fix drawer, and persist run history.
4. Integrate chat dock with streaming messages, copy/retry/fork actions, attachments, slash commands, tool invocation, and collapsible rationale logs.
5. Finalize History & Settings screens to display run history, manage API keys, model/engine selectors, theme toggle, telemetry opt-in, and persist preferences.
6. Add tests and documentation: ≥5 unit tests (cards, chat, run flow), one Playwright e2e smoke test, and docs (`docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/UI_GUIDE.md`, `docs/DEMO.md`).

