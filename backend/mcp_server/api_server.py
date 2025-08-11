import asyncio
import json
import logging
import os
import sqlite3
import time
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from .logs import (
    LogLevel,
    LogPage,
    get_page,
    log_buffer,
    redact_metadata,
    subscribe,
    unsubscribe,
    frontend_last_ingest,
)
from .seo_astro_analyzer_server import (
    get_favicon_apple,
    get_headings,
    get_images_alt,
    get_lang_charset,
    get_links,
    get_open_graph_twitter,
    get_robots_canonical,
    get_sitemap_robots,
    get_structured_data,
    get_title_meta,
    get_wordcount_keywords,
    url_to_slug,
)

APP_ORIGIN = os.environ.get("APP_ORIGIN", "*")
RATE_LIMIT = int(os.environ.get("RATE_LIMIT", "100"))
RATE_WINDOW = int(os.environ.get("RATE_WINDOW", "60"))
HEARTBEAT = 15

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- rate limiting -----------------------------------------------------------
_req_counts = {}


@app.middleware("http")
async def rate_limiter(request: Request, call_next):
    ip = request.client.host if request.client else "anon"
    now = time.time()
    window_start, count = _req_counts.get(ip, (now, 0))
    if now - window_start > RATE_WINDOW:
        window_start, count = now, 0
    if count >= RATE_LIMIT:
        return JSONResponse({"error": "Too Many Requests"}, status_code=429)
    _req_counts[ip] = (window_start, count + 1)
    return await call_next(request)


# --- SEO analyzer endpoint ---------------------------------------------------

TOOL_MAP = {
    "title_meta": get_title_meta,
    "robots_canonical": get_robots_canonical,
    "headings": get_headings,
    "images_alt": get_images_alt,
    "links": get_links,
    "structured_data": get_structured_data,
    "open_graph_twitter": get_open_graph_twitter,
    "wordcount_keywords": get_wordcount_keywords,
    "favicon_apple": get_favicon_apple,
    "lang_charset": get_lang_charset,
    "sitemap_robots": get_sitemap_robots,
}


@app.post("/api/analyze")
async def analyze(request: Request):
    try:
        data = await request.json()
        url = data.get("url")
        tools = data.get("tools", [])
        engines = data.get("engines", [])
        logging.info(
            f"/api/analyze called: url={url}, tools={tools}, engines={engines}"
        )
        if not url or not tools:
            return JSONResponse({"error": "Missing url or tools"}, status_code=400)
        results = []
        for tool in tools:
            func = TOOL_MAP.get(tool)
            if not func:
                results.append({"tool": tool, "error": "Tool not found"})
                continue
            try:
                result = func(url)
                results.append({"tool": tool, "result": result})
            except Exception as e:  # pragma: no cover - defensive
                logging.exception(f"Error running tool {tool} on {url}: {e}")
                results.append({"tool": tool, "error": str(e)})
        run_id = url_to_slug(url)
        return {"run_id": run_id, "results": results}
    except Exception as e:  # pragma: no cover - defensive
        logging.exception(f"/api/analyze failed: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


# --- log querying ------------------------------------------------------------

@app.get("/logs", response_model=LogPage)
def read_logs(
    source: Optional[str] = None,
    level: Optional[LogLevel] = None,
    q: Optional[str] = None,
    limit: int = 100,
    after: Optional[int] = None,
):
    return get_page(source=source, level=level, q=q, limit=limit, after=after)


@app.get("/logs/stream")
async def stream_logs(after: Optional[int] = None):
    async def event_generator():
        q = subscribe()
        try:
            if after:
                page = get_page(after=after)
                for entry in page.items:
                    yield f"data: {entry.model_dump_json()}\n\n"
            yield ":heartbeat\n\n"
            while True:
                try:
                    item = await asyncio.wait_for(q.get(), timeout=HEARTBEAT)
                except asyncio.TimeoutError:
                    yield ":heartbeat\n\n"
                    continue
                if isinstance(item, dict) and item.get("warning"):
                    yield "event: warning\ndata: queue full\n\n"
                else:
                    yield f"data: {item.model_dump_json()}\n\n"
        finally:
            unsubscribe(q)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/logs/download")
async def download_logs(
    source: Optional[str] = None,
    level: Optional[LogLevel] = None,
    q: Optional[str] = None,
    from_: datetime = Query(..., alias="from"),
    to: datetime = Query(..., alias="to"),
):
    def iter_lines():
        page = get_page(source=source, level=level, q=q, limit=0)
        for entry in page.items:
            if from_ <= entry.ts <= to:
                yield entry.model_dump_json() + "\n"

    return StreamingResponse(iter_lines(), media_type="application/x-ndjson")


# --- ingestion from frontend -------------------------------------------------

FRONTEND_API_KEY = os.environ.get("FRONTEND_LOG_API_KEY")
_db_path = os.environ.get("FRONTEND_LOG_DB", "frontend_logs.db")
_conn = sqlite3.connect(_db_path, check_same_thread=False)
_conn.execute(
    """
    CREATE TABLE IF NOT EXISTS frontend_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT,
        level TEXT,
        source TEXT,
        msg TEXT,
        metadata TEXT
    )
    """
)
_conn.commit()


@app.post("/logs/ingest/frontend")
async def ingest_frontend(
    request: Request,
    api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    if FRONTEND_API_KEY and api_key != FRONTEND_API_KEY:
        raise HTTPException(status_code=401, detail="invalid api key")
    data = await request.json()
    level = data.get("level", "INFO").upper()
    msg = data.get("msg", "")
    source = data.get("source")
    metadata = redact_metadata(data.get("metadata"))
    ts = datetime.utcnow().isoformat()
    _conn.execute(
        "INSERT INTO frontend_logs (ts, level, source, msg, metadata) VALUES (?,?,?,?,?)",
        (ts, level, source, msg, json.dumps(metadata)),
    )
    _conn.commit()
    from . import logs as _logs

    _logs.frontend_last_ingest = datetime.utcnow()
    logging.log(
        getattr(logging, level, logging.INFO),
        msg,
        extra={"metadata": metadata, "source": source},
    )
    return {"status": "ok"}


# --- health ------------------------------------------------------------------

@app.get("/healthz/logs")
def health_logs():
    lag = None
    if frontend_last_ingest:
        lag = (datetime.utcnow() - frontend_last_ingest).total_seconds()
    return {"ring_buffer": len(log_buffer), "ingest_lag": lag}
