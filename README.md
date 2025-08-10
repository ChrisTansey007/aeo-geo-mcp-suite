
# SEO Astro Analyzer

## Backend
- All backend code is in the `backend/` directory.
- SEO tools are in `backend/seo_tools/` as importable modules.
- The MCP server is in `backend/mcp_server/`.

## Frontend
- All frontend code is in the `frontend/` directory.
- Add your preferred frontend framework (React, Vue, etc.) in `frontend/`.

## Shared
- Place any shared code or documentation in `shared/` (optional).

---

## Getting Started

1. Install backend dependencies:
	```
	cd backend
	pip install -r requirements.txt
	```
2. Start the MCP server:
	```
	python -m mcp_server.seo_astro_analyzer_server
	```
3. (Frontend) Add your UI code in `frontend/` and connect to the backend API.
