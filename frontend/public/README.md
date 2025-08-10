# FE-IMPROVEMENTS.md

**Project:** `aeo-geo-mcp-suite`

**Author:** Lead Front‑End Architect & DX Engineer

**Mode:** Planner → (kickoff Executor at end)

---

## 1) Short Critique & Goals

**What’s strong today**

* Solid Python tool surface for classic SEO checks (titles, robots, headings, images, links, JSON‑LD, social, wordcount).
* Clear intent to add AEO (Answer Extractability) & GEO (Generative Engine Optimization) layers.

**Gaps / risks**

* Front end is a single JS entry with no type safety, no routing, no state model, and no extensibility contract.
* AEO/GEO metrics aren’t modeled yet (AI presence, citations, quotables, answer‑first, recency, sources box, table presence).
* No uniform result schema → hard to render cards consistently.
* No run history, offline cache, exports, or observability.
* Accessibility and keyboard flows untested; no print / PDF.

**Goals**

* Ship a **Vite + React + TypeScript** dashboard with a **card registry** that renders SEO/AEO/GEO results from a strict `ToolResult` shape.
* Layer in **AEO extractability** and **GEO visibility** with charts and experiment harness.
* Provide **LLM Router v2** (heuristic first; LLM‑assisted if key present) with transparent rationale.
* Ensure **DX**: TS strict, ESLint + Prettier, tests, Storybook‑ready components, Lighthouse ≥ 90.

---

## 2) Proposed Upgrades & Acceptance Checks

### 2.1 AEO Extractability Audit

* **Detectors:** `answerFirst ≤ 320 chars`, `≥ 5 quotables`, `tablePresent` (when comparison intent), `recencyStamp (YYYY‑MM)`, `sourcesBox` (title + ≥1 link).
* **Output:** `score (0‑100)`, `grade (A‑F)`, `evidence[]` with CSS selectors or text spans.
* **Accept:** Given a page with answer‑first + 5 pull‑quotes + a table + sources box, the card passes with score ≥ 85 and renders all evidence chips.

### 2.2 GEO Visibility Panel

* **Metrics:** `aiPresence[engine]` (boolean), `citationFrequency[engine]` (0‑N), `aiCtrSurrogate` (click proxy from SERP snippets / referrals if available).
* **UI:** Engine badges (Google, Perplexity, Copilot, etc.), time‑series line chart, last‑seen date.
* **Accept:** Passing `?engines=google,perplexity` yields badges and a 30‑day series; CSV export includes daily rows.

### 2.3 Schema Studio

* Visual JSON‑LD viewer with lint & copy buttons, type coverage heatmap, and diff against prior run.
* **Accept:** Paste JSON‑LD → valid/invalid badge, copied schema includes pretty‑printed code; switching run shows a highlighted diff.

### 2.4 Gotcha/Exception Lint (AEO micro‑pattern)

* Flags missing caveat/exception line in “Answer” sections.
* **Accept:** Content without an “Exceptions / It depends” sentence triggers a warning and suggested patterns.

### 2.5 Entity Map Overlay

* Graph of pages → pillars; flags missing first‑mention link to pillar in each section.
* **Accept:** Clicking a page node lists uncovered entities and suggested internal links with target anchors.

### 2.6 Experiment Harness

* Mini A/B for TL;DR phrasing / table placement; stores variant → metric deltas in `runs`.
* **Accept:** Running variant B attaches `experiments` to run; History filters by variant.

### 2.7 Insight Quality Meter

* Weighted radar for **SEO / AEO / GEO**; workspace sliders alter weighting live.
* **Accept:** Changing AEO weight re‑computes overall grade and chart instantly (p95 < 300 ms after data arrival).

### 2.8 LLM Router v2

* Hybrid: heuristic (content features) + few‑shot (if `OPENAI_API_KEY`). Always show transparent tool plan/rationale.
* **Accept:** Router displays which tools were selected and why; runs fine with no API key.

### 2.9 Offline / Cache (PWA optional)

* Cache last run + assets; optimistic UI + retry.
* **Accept:** Refreshing after a run shows cached results with a “stale” badge; clicking “Refresh” re‑fetches.

### 2.10 Observability & Error UX

* OTEL web (optional), action logs for route/run/export, error boundaries with replay (if enabled).
* **Accept:** A failing tool yields a friendly error card with `details[]` and a shareable run link.

### 2.11 Accessibility

* Keyboard‑first nav, AA contrast themes, motion‑safe variants, SR‑only labels for charts.
* **Accept:** Tab order covers shell → cards; chart tables are SR‑readable.

### 2.12 Extensibility via Card Registry

* JSON contract: tools can ship `summary/metrics/details/evidence` and auto‑render a minimal card.
* **Accept:** Dropping a new tool result into `results[]` renders a card with a default layout (no custom code).

---

## 3) Component Map & Routes

```
<App>
  <AppShell>
    <Sidebar/>  // Nav, Workspaces, Recent Runs
    <Topbar/>   // URL input, Run, Export, Theme, Profile
    <Main>
      /dashboard     -> <DashboardPage>
        - <QualityRadars/> (SEO/AEO/GEO)
        - <IssuesByDirectory/>
        - <RecentRunsTable/>
      /runs/:id      -> <RunDetailPage>
        - <RunHeader/>
        - <CardGrid>
            - SEO: TitleMetaCard, IndexabilityCard, HeadingsCard, ImagesAltCard,
                    LinksCard, SchemaCard, SocialPreviewCard, IconsManifestsCard,
                    LocaleEncodingCard, SitemapsRobotsCard
            - AEO: AnswerExtractabilityCard, GotchaLintCard
            - GEO: AIPresenceCard, CitationFrequencyCard, InsightsCard
        - <RightPanel> (LLM Router, Schema Studio, Evidence Viewer)
      /history       -> <HistoryPage>
      /settings      -> <SettingsPage>
```

**State** (Zustand)

* `runStore`: `currentRun`, `runs[]`, `analyzing`, `routerPlan`, `experiments`, `engines`, actions `route(url, opts)`, `analyze(url, tools, opts)`, `loadRun(id)`.
* `uiStore`: theme, toasts, right‑panel tab, weights for radar.

**Card Registry**

* `cards/index.ts`: `register(kind, tool, Component, scoreFn?)` + `DefaultCard`.

---

## 4) API Contract (Confirmed + tiny additions)

**Endpoints**

* `POST /api/route`  → `{ url, engines?: string[] }` → `{ selected_tools: string[], rationale: string }`
* `POST /api/analyze` → `{ url, tools: string[], engines?: string[], experiments?: {...} }` → `{ run_id, results: ToolResult[] }`
* `GET  /api/runs` → `{ runs: RunMeta[] }`
* `GET  /api/runs/{id}` → `{ run: Run }`

**`ToolResult`**

```ts
export type ToolResult = {
  tool: string;
  status: "ok" | "error";
  summary: { score: number; grade: string; issues: number; warnings: number };
  metrics: Record<string, number | string | boolean>;
  details: { type: "info" | "warn" | "error"; message: string; selector?: string }[];
  evidence?: { selector?: string; text?: string; url?: string }[];
  url: string;
  started_at?: string; finished_at?: string;
};
```

**Additions for GEO**

* `metrics.aiPresence_google?: boolean`
* `metrics.aiPresence_perplexity?: boolean`
* `metrics.citations_google?: number`
* `metrics.citations_perplexity?: number`
* `metrics.aiCtrSurrogate?: number`

**Run types**

```ts
export type RunMeta = { id: string; url: string; started_at: string; finished_at?: string; tools: string[]; grade?: string };
export type Run = RunMeta & { results: ToolResult[]; engines?: string[]; experiments?: Record<string, string | number | boolean> };
```

---

## 5) AEO & GEO: Data Model Notes

**AEO Extractability**

* `answerFirstChars` (0‑∞), `quotablesCount` (0‑∞), `tablePresent` (bool), `recencyStamp` (yyyy‑mm or yyyy‑mm‑dd), `sourcesBoxCount` (0‑∞), `gotchaLine` (bool).
* `score`: weighted composite; default weights SEO 0.4 / AEO 0.35 / GEO 0.25; workspace‑level sliders in Settings.

**GEO Visibility**

* For each engine: `present` (bool), `citations` (int), `lastSeen` (date), optional `aiCtrSurrogate` (0‑1).
* Time series stored per run as `evidence` URLs or inline stats; rendered as line chart.

---

## 6) Accessibility & Performance

* Keyboard focus rings, `aria‑` labels on action buttons, SR‑only table mirror for charts.
* AA contrast themes (dark default), `prefers‑reduced‑motion` variants.
* Code‑split: Schema Studio & JSON viewers lazy‑loaded. p95 interaction < 300 ms **after** data arrival.

---

## 7) Telemetry & Error UX

* Optional OTEL Web; minimal action log (`route`, `analyze`, `export`); redaction for URLs if requested.
* Error Boundaries per route; each card shows `status`, `details[]`, and a copyable debug payload.

---

## 8) Extensibility Contract (Default Card)

```ts
// Minimal JSON needed from any tool to auto‑render
{
  "tool": "example_tool",
  "status": "ok",
  "summary": { "score": 78, "grade": "B", "issues": 2, "warnings": 1 },
  "metrics": { "k1": 123, "k2": true },
  "details": [{ "type":"warn", "message":"Something to fix", "selector":"#main" }],
  "evidence": [{ "text":"Quoted line", "selector":".lead" }],
  "url": "https://example.com"
}
```

* If a tool returns only `summary` and `metrics`, `DefaultCard` shows a simple score header + metrics table + details list.

---

## 9) 12‑Step Execution Checklist (MVP → v1)

1. **Scaffold** Vite + React + TypeScript + Tailwind; strict TS config, ESLint/Prettier.

2. **AppShell** with routes (`/dashboard`, `/runs/:id`, `/history`, `/settings`), dark theme, keyboard nav.

3. **State** with Zustand stores: `runStore`, `uiStore`; localStorage cache for last run.

4. **API bridge**: implement FastAPI `/api/route`, `/api/analyze`, `/api/runs*` with mock + MCP passthrough.

5. **Card registry** + `DefaultCard`; wire initial SEO cards (TitleMeta, Indexability, Headings, ImagesAlt).

6. **AEO Extractability** card: detectors + evidence chips + score function.

7. **GEO panel**: AI Presence badges + line chart; `?engines=` param honored end‑to‑end.

8. **Schema Studio**: JSON‑LD viewer/validator; diff vs prior run; copy buttons.

9. **LLM Router v2**: heuristic only (no key) + few‑shot path (if key); show rationale/tool plan.

10. **History & Exports**: list last 50 runs; CSV/JSON export; print stylesheet for PDF.

11. **Observability & Errors**: action log, error boundaries, friendly error cards; OTEL flag.

12. **Accessibility & Tests**: AA pass; 6 unit tests (cards + utils) + 1 integration (Dashboard→Run).

**Status:** ✅ **Ready to execute**

---

## 10) Executor Kickoff (initial code & stubs)

> **Note:** The following snippets represent the initial commit to get the app running end‑to‑end with mocked data. Replace mocks with MCP outputs as you wire Python tools.

### 10.1 Backend — `backend/app.py` (FastAPI stub)

```py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Literal, Optional, Dict, Any
from datetime import datetime
import uuid

app = FastAPI(title="AEO/GEO/SEO API")

class Summary(BaseModel):
    score: int
    grade: str
    issues: int
    warnings: int

class Detail(BaseModel):
    type: Literal["info","warn","error"]
    message: str
    selector: Optional[str] = None

class Evidence(BaseModel):
    selector: Optional[str] = None
    text: Optional[str] = None
    url: Optional[str] = None

class ToolResult(BaseModel):
    tool: str
    status: Literal["ok","error"]
    summary: Summary
    metrics: Dict[str, Any]
    details: List[Detail]
    evidence: Optional[List[Evidence]] = None
    url: str
    started_at: Optional[str] = None
    finished_at: Optional[str] = None

class RouteReq(BaseModel):
    url: str
    engines: Optional[List[str]] = None

class RouteRes(BaseModel):
    selected_tools: List[str]
    rationale: str

class AnalyzeReq(BaseModel):
    url: str
    tools: List[str]
    engines: Optional[List[str]] = None
    experiments: Optional[Dict[str, Any]] = None

class RunMeta(BaseModel):
    id: str
    url: str
    started_at: str
    finished_at: Optional[str] = None
    tools: List[str]
    grade: Optional[str] = None

class Run(BaseModel):
    id: str
    url: str
    started_at: str
    finished_at: Optional[str] = None
    tools: List[str]
    results: List[ToolResult]
    engines: Optional[List[str]] = None
    experiments: Optional[Dict[str, Any]] = None

# in‑memory store for demo
RUNS: Dict[str, Run] = {}

@app.post("/api/route", response_model=RouteRes)
async def route(req: RouteReq):
    tools = ["title_meta", "headings", "structured_data", "images_alt", "links"]
    # simple heuristic add‑ons for AEO/GEO
    tools += ["answer_extractability", "ai_presence"]
    rationale = (
        "Selected core SEO analyzers plus AEO extractability and GEO presence based on page features."
    )
    return RouteRes(selected_tools=tools, rationale=rationale)

@app.post("/api/analyze")
async def analyze(req: AnalyzeReq):
    run_id = str(uuid.uuid4())
    started = datetime.utcnow().isoformat()
    # mock results (replace with MCP calls)
    results: List[ToolResult] = []
    results.append(ToolResult(
        tool="title_meta",
        status="ok",
        summary=Summary(score=92, grade="A", issues=0, warnings=1),
        metrics={"titleLength": 58, "metaDescriptionLength": 154},
        details=[Detail(type="info", message="Title length is optimal")],
        url=req.url,
        started_at=started,
        finished_at=started,
    ))
    results.append(ToolResult(
        tool="answer_extractability",
        status="ok",
        summary=Summary(score=81, grade="B", issues=1, warnings=1),
        metrics={
            "answerFirstChars": 276,
            "quotablesCount": 5,
            "tablePresent": True,
            "recencyStamp": "2025-08",
            "sourcesBoxCount": 2,
            "gotchaLine": True,
        },
        details=[Detail(type="warn", message="Consider adding 1 more quotable line")],
        evidence=[Evidence(text="Answer TL;DR …", selector=".answer-first")],
        url=req.url,
        started_at=started,
        finished_at=started,
    ))
    results.append(ToolResult(
        tool="ai_presence",
        status="ok",
        summary=Summary(score=65, grade="C", issues=2, warnings=0),
        metrics={
            "aiPresence_google": True,
            "citations_google": 2,
            "aiPresence_perplexity": False,
            "citations_perplexity": 0,
            "aiCtrSurrogate": 0.18,
        },
        details=[Detail(type="info", message="Seen in Google AI Overviews twice in 30 days")],
        url=req.url,
        started_at=started,
        finished_at=started,
    ))

    finished = datetime.utcnow().isoformat()
    grade = "A" if sum(r.summary.score for r in results)/len(results) >= 90 else "B"
    run = Run(
        id=run_id,
        url=req.url,
        started_at=started,
        finished_at=finished,
        tools=req.tools,
        results=results,
        engines=req.engines,
        experiments=req.experiments,
    )
    RUNS[run_id] = run
    return {"run_id": run_id, "results": [r.model_dump() for r in results]}

@app.get("/api/runs")
async def runs():
    metas = [RunMeta(id=r.id, url=r.url, started_at=r.started_at, finished_at=r.finished_at, tools=r.tools, grade=None).model_dump() for r in RUNS.values()]
    return {"runs": metas}

@app.get("/api/runs/{run_id}")
async def run_detail(run_id: str):
    run = RUNS.get(run_id)
    if not run:
        return {"error": "run not found"}
    return {"run": run.model_dump()}
```

### 10.2 Frontend — scaffolding & key files

**`frontend/package.json`**

```json
{
  "name": "aeo-geo-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1",
    "zustand": "^4.5.5",
    "recharts": "^2.12.7",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^8.4.0",
    "@typescript-eslint/parser": "^8.4.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "postcss": "^8.4.41",
    "prettier": "^3.3.3",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.3",
    "vitest": "^2.0.5"
  }
}
```

**`frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  }
}
```

**`frontend/tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config
```

**`frontend/postcss.config.cjs`**

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

**`frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AEO/GEO/SEO Suite</title>
  </head>
  <body class="bg-neutral-950 text-neutral-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`frontend/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import AppShell from './shell/AppShell'
import Dashboard from './pages/Dashboard'
import RunDetail from './pages/RunDetail'
import History from './pages/History'
import Settings from './pages/Settings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'runs/:id', element: <RunDetail /> },
      { path: 'history', element: <History /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
```

**`frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
```

**`frontend/src/shared/types.ts`**

```ts
export type Detail = { type: 'info'|'warn'|'error'; message: string; selector?: string }
export type Evidence = { selector?: string; text?: string; url?: string }
export type Summary = { score: number; grade: string; issues: number; warnings: number }
export type ToolResult = {
  tool: string
  status: 'ok'|'error'
  summary: Summary
  metrics: Record<string, number|string|boolean>
  details: Detail[]
  evidence?: Evidence[]
  url: string
  started_at?: string
  finished_at?: string
}
export type RunMeta = { id: string; url: string; started_at: string; finished_at?: string; tools: string[]; grade?: string }
export type Run = RunMeta & { results: ToolResult[]; engines?: string[]; experiments?: Record<string, string|number|boolean> }
```

**`frontend/src/lib/api.ts`**

```ts
import { Run, RunMeta, ToolResult } from '../shared/types'

const BASE = import.meta.env.VITE_API_BASE ?? ''

export async function route(url: string, engines?: string[]) {
  const res = await fetch(`${BASE}/api/route`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, engines })
  })
  if (!res.ok) throw new Error('route failed')
  return res.json() as Promise<{ selected_tools: string[]; rationale: string }>
}

export async function analyze(url: string, tools: string[], engines?: string[]) {
  const res = await fetch(`${BASE}/api/analyze`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, tools, engines })
  })
  if (!res.ok) throw new Error('analyze failed')
  return res.json() as Promise<{ run_id: string; results: ToolResult[] }>
}

export async function runs() {
  const res = await fetch(`${BASE}/api/runs`)
  if (!res.ok) throw new Error('runs failed')
  return res.json() as Promise<{ runs: RunMeta[] }>
}

export async function runDetail(id: string) {
  const res = await fetch(`${BASE}/api/runs/${id}`)
  if (!res.ok) throw new Error('run detail failed')
  return res.json() as Promise<{ run: Run }>
}
```

**`frontend/src/store/runStore.ts`**

```ts
import { create } from 'zustand'
import { Run, ToolResult } from '../shared/types'
import * as api from '../lib/api'

interface RouterPlan { tools: string[]; rationale: string }

type State = {
  currentRun?: Run
  analyzing: boolean
  router?: RouterPlan
  error?: string
  setError: (e?: string) => void
  doRoute: (url: string, engines?: string[]) => Promise<void>
  doAnalyze: (url: string, tools: string[], engines?: string[]) => Promise<void>
}

export const useRunStore = create<State>((set) => ({
  analyzing: false,
  setError: (e) => set({ error: e }),
  doRoute: async (url, engines) => {
    const r = await api.route(url, engines)
    set({ router: { tools: r.selected_tools, rationale: r.rationale } })
  },
  doAnalyze: async (url, tools, engines) => {
    set({ analyzing: true, error: undefined })
    try {
      const res = await api.analyze(url, tools, engines)
      const run: Run = {
        id: res.run_id,
        url,
        started_at: new Date().toISOString(),
        tools,
        results: res.results as ToolResult[]
      }
      set({ currentRun: run })
      localStorage.setItem('lastRun', JSON.stringify(run))
    } catch (e: any) {
      set({ error: e?.message ?? 'analyze failed' })
    } finally {
      set({ analyzing: false })
    }
  }
}))
```

**`frontend/src/shell/AppShell.tsx`**

```tsx
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useRunStore } from '../store/runStore'
import { useState } from 'react'

export default function AppShell(){
  const nav = useNavigate()
  const { router, doRoute, doAnalyze, analyzing } = useRunStore()
  const [url, setUrl] = useState('https://example.com')

  async function onRun(){
    await doRoute(url)
    await doAnalyze(url, (router?.tools ?? []))
    nav('/runs/temp')
  }

  return (
    <div className="grid grid-cols-[240px_1fr] grid-rows-[56px_1fr] min-h-screen">
      <aside className="row-span-2 bg-neutral-900/60 border-r border-neutral-800 p-3">
        <div className="font-semibold mb-3">AEO/GEO/SEO</div>
        <nav className="space-y-2">
          <Link className="block hover:underline" to="/">Dashboard</Link>
          <Link className="block hover:underline" to="/history">History</Link>
          <Link className="block hover:underline" to="/settings">Settings</Link>
        </nav>
      </aside>
      <header className="flex items-center gap-2 px-4 border-b border-neutral-800">
        <input aria-label="URL" value={url} onChange={e=>setUrl(e.target.value)}
          className="flex-1 bg-neutral-900 rounded px-3 py-2 outline-none border border-neutral-800" placeholder="https://…" />
        <button onClick={onRun} disabled={analyzing}
          className="px-3 py-2 rounded bg-indigo-600 disabled:opacity-50">{analyzing? 'Running…':'Run'}</button>
      </header>
      <main className="p-4"><Outlet/></main>
    </div>
  )
}
```

**`frontend/src/pages/Dashboard.tsx`**

```tsx
export default function Dashboard(){
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>Run an analysis to see SEO/AEO/GEO radars and issues by directory.</p>
    </div>
  )
}
```

**`frontend/src/pages/RunDetail.tsx`**

```tsx
import { useRunStore } from '../store/runStore'
import TitleMetaCard from '../cards/TitleMetaCard'
import AnswerExtractabilityCard from '../cards/AnswerExtractabilityCard'
import AIPresenceCard from '../cards/AIPresenceCard'

export default function RunDetail(){
  const { currentRun } = useRunStore()
  if (!currentRun) return <div>No run yet. Use Run to start.</div>
  const r = currentRun
  return (
    <div className="space-y-4">
      <header className="border-b border-neutral-800 pb-2">
        <h1 className="text-xl font-semibold">{r.url}</h1>
        <p className="text-sm text-neutral-400">Tools: {r.tools.join(', ')}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {r.results.map((res) => {
          if (res.tool === 'title_meta') return <TitleMetaCard key={res.tool} res={res} />
          if (res.tool === 'answer_extractability') return <AnswerExtractabilityCard key={res.tool} res={res} />
          if (res.tool === 'ai_presence') return <AIPresenceCard key={res.tool} res={res} />
          return (
            <div key={res.tool} className="border border-neutral-800 rounded p-3">
              <h3 className="font-medium">{res.tool}</h3>
              <div className="text-sm">Score: {res.summary.score} ({res.summary.grade})</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**`frontend/src/pages/History.tsx`**

```tsx
export default function History(){
  return <div>History coming next (list last 50 runs, re‑open).</div>
}
```

**`frontend/src/pages/Settings.tsx`**

```tsx
export default function Settings(){
  return <div>Settings (weights, engines, theme) coming next.</div>
}
```

**`frontend/src/cards/TitleMetaCard.tsx`**

```tsx
import { ToolResult } from '../shared/types'

export default function TitleMetaCard({ res }: { res: ToolResult }){
  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Title & Meta</h3>
        <div className="text-sm">Score {res.summary.score} · {res.summary.grade}</div>
      </header>
      <dl className="grid grid-cols-2 gap-2 mt-2 text-sm">
        {Object.entries(res.metrics).map(([k,v]) => (
          <div key={k} className="flex justify-between"><dt className="text-neutral-400">{k}</dt><dd>{String(v)}</dd></div>
        ))}
      </dl>
      <ul className="list-disc pl-5 mt-2 text-sm">
        {res.details.map((d,i)=>(<li key={i}>{d.type.toUpperCase()}: {d.message}</li>))}
      </ul>
    </section>
  )
}
```

**`frontend/src/cards/AnswerExtractabilityCard.tsx`**

```tsx
import { ToolResult } from '../shared/types'

function badge(ok: boolean, label: string){
  return <span className={"px-2 py-0.5 rounded text-xs " + (ok? 'bg-green-700':'bg-red-700')}>{label}</span>
}

export default function AnswerExtractabilityCard({ res }: { res: ToolResult }){
  const m = res.metrics
  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">AEO: Answer Extractability</h3>
        <div className="text-sm">Score {res.summary.score} · {res.summary.grade}</div>
      </header>
      <div className="flex flex-wrap gap-2 mt-2">
        {badge((m['answerFirstChars'] as number) <= 320, 'Answer‑first ≤ 320')}
        {badge((m['quotablesCount'] as number) >= 5, '≥ 5 quotables')}
        {badge(!!m['tablePresent'], 'Table present')}
        {badge(!!m['recencyStamp'], 'Recency stamp')}
        {badge((m['sourcesBoxCount'] as number) >= 1, 'Sources box')}
        {badge(!!m['gotchaLine'], 'Gotcha line')}
      </div>
      {res.evidence && res.evidence.length > 0 && (
        <div className="mt-3 text-sm">
          <div className="font-medium mb-1">Evidence</div>
          <ul className="list-disc pl-5">
            {res.evidence.map((e,i)=> (<li key={i}>{e.text ?? e.selector ?? e.url}</li>))}
          </ul>
        </div>
      )}
    </section>
  )
}
```

**`frontend/src/cards/AIPresenceCard.tsx`**

```tsx
import { ToolResult } from '../shared/types'

export default function AIPresenceCard({ res }: { res: ToolResult }){
  const m = res.metrics
  const engines = [
    { key: 'google',   label: 'Google' },
    { key: 'perplexity', label: 'Perplexity' },
    { key: 'copilot', label: 'Copilot' }
  ]
  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">GEO: AI Presence</h3>
        <div className="text-sm">Score {res.summary.score} · {res.summary.grade}</div>
      </header>
      <div className="flex gap-2 mt-2">
        {engines.map(e => {
          const present = Boolean(m[`aiPresence_${e.key}`])
          const cites = Number(m[`citations_${e.key}`] ?? 0)
          return (
            <div key={e.key} className={`px-3 py-2 rounded border ${present? 'border-green-600':'border-neutral-700'}`}>
              <div className="text-sm font-medium">{e.label}</div>
              <div className="text-xs text-neutral-400">{present? 'Present':'Not seen'}</div>
              <div className="text-xs">Citations: {cites}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

---

## 11) Quickstart

```bash
# Backend (from repo root)
uv venv && uv pip install fastapi uvicorn pydantic[dotenv]
uvicorn backend.app:app --reload

# Frontend
cd frontend
pnpm i
pnpm dev
```

**Next commit (after this doc):** History list + Exports + Error boundaries + Schema Studio lazy‑chunk.
