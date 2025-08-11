import asyncio
import logging
from collections import deque
from datetime import datetime
from enum import Enum
from itertools import count
from typing import Any, Deque, Dict, Iterable, List, Optional, Set

from pydantic import BaseModel

# --- Models -----------------------------------------------------------------

class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogEntry(BaseModel):
    id: int
    ts: datetime
    level: LogLevel
    msg: str
    source: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class LogPage(BaseModel):
    items: List[LogEntry]
    next: Optional[int] = None


# --- Ring buffer -------------------------------------------------------------

BUFFER_SIZE = 50_000
_stream_queue_size = int(__import__("os").environ.get("LOG_STREAM_QUEUE", "100"))

log_buffer: Deque[LogEntry] = deque(maxlen=BUFFER_SIZE)
log_id = count(1)

subscribers: Set[asyncio.Queue] = set()
frontend_last_ingest: Optional[datetime] = None

SENSITIVE_KEYS = {
    "password",
    "token",
    "secret",
    "api_key",
    "apikey",
    "authorization",
    "cookie",
    "set-cookie",
}


def redact_metadata(metadata: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if metadata is None:
        return None
    redacted: Dict[str, Any] = {}
    for k, v in metadata.items():
        if any(s in k.lower() for s in SENSITIVE_KEYS):
            redacted[k] = "***REDACTED***"
        else:
            redacted[k] = v
    return redacted


class RingBufferHandler(logging.Handler):
    """Logging handler that stores records in a ring buffer and mirrors output."""

    def __init__(self, mirror_handlers: Iterable[logging.Handler]):
        super().__init__()
        self.mirror_handlers = list(mirror_handlers)

    def emit(self, record: logging.LogRecord) -> None:
        try:
            metadata = getattr(record, "metadata", None)
            entry = LogEntry(
                id=next(log_id),
                ts=datetime.fromtimestamp(record.created),
                level=LogLevel(record.levelname.upper()),
                msg=record.getMessage(),
                source=record.name,
                metadata=redact_metadata(metadata),
            )
            log_buffer.append(entry)
            for q in list(subscribers):
                try:
                    q.put_nowait(entry)
                except asyncio.QueueFull:
                    while not q.empty():
                        try:
                            q.get_nowait()
                        except asyncio.QueueEmpty:
                            break
                    try:
                        q.put_nowait({"warning": "queue full"})
                    except asyncio.QueueFull:
                        pass
            for h in self.mirror_handlers:
                h.handle(record)
        except Exception:
            self.handleError(record)


# Install handler
root_logger = logging.getLogger()
if not any(isinstance(h, RingBufferHandler) for h in root_logger.handlers):
    existing = root_logger.handlers[:]
    handler = RingBufferHandler(existing or [logging.StreamHandler()])
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.INFO)


# --- Query helpers -----------------------------------------------------------

def get_page(
    *,
    source: Optional[str] = None,
    level: Optional[LogLevel] = None,
    q: Optional[str] = None,
    limit: int = 100,
    after: Optional[int] = None,
) -> LogPage:
    items = []
    for entry in log_buffer:
        if after is not None and entry.id <= after:
            continue
        if source and entry.source != source:
            continue
        if level and logging.getLevelName(entry.level.value) < logging.getLevelName(level.value):
            continue
        if q and q.lower() not in entry.msg.lower():
            continue
        items.append(entry)
    if limit:
        items = items[-limit:]
    next_id = items[-1].id if items else after
    return LogPage(items=items, next=next_id)


# --- Subscription helpers ----------------------------------------------------


def subscribe() -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue(maxsize=_stream_queue_size)
    subscribers.add(q)
    return q


def unsubscribe(q: asyncio.Queue) -> None:
    subscribers.discard(q)
