import json
import logging
import time
import json
import logging
from datetime import datetime
from itertools import count

import sys
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from backend.mcp_server import api_server, logs


@pytest.fixture(autouse=True)
def reset_logs(monkeypatch):
    logs.log_buffer.clear()
    logs.subscribers.clear()
    monkeypatch.setattr(logs, "log_id", count(1))
    yield


def test_pagination_and_after():
    client = TestClient(api_server.app)
    logger = logging.getLogger("test1")
    logger.info("first")
    logger.info("second")
    page = client.get("/logs", params={"limit": 1, "source": "test1"}).json()
    assert [e["msg"] for e in page["items"]] == ["second"]
    after = page["items"][0]["id"]
    logger.info("third")
    page2 = client.get("/logs", params={"after": after, "source": "test1"}).json()
    assert [e["msg"] for e in page2["items"]] == ["third"]


def test_level_and_search_filters():
    client = TestClient(api_server.app)
    logger = logging.getLogger("test2")
    logger.warning("warn special")
    logger.error("error other")
    page = client.get("/logs", params={"level": "ERROR", "source": "test2"}).json()
    assert [e["msg"] for e in page["items"]] == ["error other"]
    page2 = client.get("/logs", params={"q": "special", "source": "test2"}).json()
    assert [e["msg"] for e in page2["items"]] == ["warn special"]




def test_download_range():
    client = TestClient(api_server.app)
    logging.info("first")
    t_from = datetime.utcnow().isoformat()
    logging.info("second")
    t_to = datetime.utcnow().isoformat()
    logging.info("third")
    resp = client.get(
        "/logs/download",
        params={"from": t_from, "to": t_to},
    )
    lines = [l for l in resp.text.strip().splitlines() if l]
    assert len(lines) == 1
    assert json.loads(lines[0])["msg"] == "second"


def test_redaction():
    client = TestClient(api_server.app)
    logging.info(
        "token test", extra={"metadata": {"token": "secret", "safe": "ok"}}
    )
    page = client.get("/logs").json()
    meta = page["items"][0]["metadata"]
    assert meta["token"] == "***REDACTED***"
    assert meta["safe"] == "ok"
