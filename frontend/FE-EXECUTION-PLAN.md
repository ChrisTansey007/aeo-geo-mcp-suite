# FE-EXECUTION-PLAN.md

## Plan to Follow the Frontend Roadmap

### 1. Scaffold the Project
- [ ] Initialize Vite + React + TypeScript + Tailwind CSS in `frontend/`.
- [ ] Set up strict TypeScript config, ESLint, Prettier.
- [ ] Add initial folder structure: `src/`, `src/pages/`, `src/cards/`, `src/shell/`, `src/store/`, `src/shared/`, etc.

### 2. App Shell & Routing
- [ ] Implement `AppShell` with sidebar, topbar, and main area.
- [ ] Set up React Router with `/dashboard`, `/runs/:id`, `/history`, `/settings` routes.
- [ ] Add dark theme and keyboard navigation.

### 3. State Management
- [ ] Add Zustand stores: `runStore`, `uiStore`.
- [ ] Implement localStorage cache for last run.

### 4. API Bridge
- [ ] Implement API bridge in `src/lib/api.ts` for `/api/route`, `/api/analyze`, `/api/runs*`.
- [ ] Use mock data initially, then wire to backend MCP server.

### 5. Card Registry & Initial Cards
- [ ] Create card registry in `src/cards/index.ts`.
- [ ] Implement `DefaultCard` and initial SEO cards (TitleMeta, Indexability, Headings, ImagesAlt).

### 6. AEO & GEO Features
- [ ] Add AEO Extractability card: detectors, evidence chips, score function.
- [ ] Add GEO panel: AI Presence badges, line chart, engine param support.

### 7. Schema Studio & LLM Router
- [ ] Implement Schema Studio: JSON-LD viewer, validator, diff, copy.
- [ ] Add LLM Router v2: heuristic + few-shot, rationale display.

### 8. History, Exports, Observability
- [ ] Implement History page: list last 50 runs, re-open.
- [ ] Add CSV/JSON export, print stylesheet for PDF.
- [ ] Add action log, error boundaries, friendly error cards.

### 9. Accessibility & Testing
- [ ] Ensure keyboard navigation, AA contrast, motion-safe, screen reader support.
- [ ] Add unit tests for cards and utils, integration test for Dashboard→Run.

---

## Step 1: Scaffold Vite + React + TypeScript + Tailwind

- [ ] Run: `pnpm create vite frontend -- --template react-ts`
- [ ] Run: `cd frontend && pnpm install`
- [ ] Install Tailwind CSS: `pnpm install -D tailwindcss postcss autoprefixer`
- [ ] Run: `npx tailwindcss init -p`
- [ ] Configure Tailwind in `tailwind.config.ts` and add `@tailwind` imports to `src/index.css`.
- [ ] Set up strict `tsconfig.json`, ESLint, Prettier.

---

## Next Steps
- After scaffolding, implement AppShell and routing, then proceed down the checklist above.

---

## Progress Log
- [ ] (To be updated as steps are completed)
