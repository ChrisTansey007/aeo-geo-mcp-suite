
import json, argparse, os, sys, time
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Callable, Dict, Any
from .auth import check_api_key
from .rate_limit import TokenBucket
from .metrics import http_requests, http_errors, rpc_calls, rpc_durations, render_metrics

Json = Dict[str, Any]
JsonRpcReq = Dict[str, Any]
JsonRpcRes = Dict[str, Any]

def parse_args(default_port:int):
    p = argparse.ArgumentParser()
    p.add_argument("--transport", default="http", choices=["http","stdio"])
    p.add_argument("--port", type=int, default=default_port)
    p.add_argument("--rate", type=int, default=60, help="Requests/minute")
    p.add_argument("--api-key", default=None, help="Override MCP_API_KEY")
    p.add_argument("--log-level", default="info")
    return p.parse_args()

def start_stdio(handle: Callable[[JsonRpcReq], JsonRpcRes]):
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            res = handle(req)
        except Exception as e:
            res = {"jsonrpc":"2.0","id":None,"error":{"code":"internal","message":str(e)}}
        sys.stdout.write(json.dumps(res)+"\n")
        sys.stdout.flush()

def start_http(server_name:str, port:int, handle: Callable[[JsonRpcReq], JsonRpcRes], rate:int, api_key:str|None):
    bucket = TokenBucket(cap=rate, refill_per_min=rate)

    class H(BaseHTTPRequestHandler):
        def _w(self, code:int, body:bytes, ctype="application/json"):
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if self.path == "/healthz":
                self._w(200, json.dumps({"ok":True,"server":server_name}).encode())
                return
            if self.path == "/metrics":
                ctype, payload = render_metrics()
                self._w(200, payload, ctype)
                return
            self._w(405, b"")

        def do_POST(self):
            http_requests.labels(server=server_name, method="POST").inc()
            if not bucket.take():
                http_errors.labels(server=server_name, code="429").inc()
                self._w(429, json.dumps({"error":"rate_limited"}).encode())
                return
            ln = int(self.headers.get("content-length","0"))
            raw = self.rfile.read(ln or 0)
            try:
                req = json.loads(raw.decode() or "{}")
            except Exception:
                http_errors.labels(server=server_name, code="400").inc()
                self._w(400, json.dumps({"error":"invalid_json"}).encode())
                return

            # auth
            hdr = self.headers.get("Authorization")
            api_param = (req.get("params") or {}).get("apiKey")
            if not check_api_key(hdr, api_param, api_key):
                http_errors.labels(server=server_name, code="401").inc()
                self._w(401, json.dumps({"error":"unauthorized"}).encode())
                return

            method = req.get("method","unknown")
            rpc_calls.labels(server=server_name, method=method).inc()
            start = time.time()
            try:
                res = handle(req)
            except Exception as e:
                http_errors.labels(server=server_name, code="500").inc()
                res = {"jsonrpc":"2.0","id":req.get("id"),"error":{"code":"internal","message":str(e)}}
            finally:
                rpc_durations.labels(server=server_name, method=method).observe(max(0.0, time.time()-start))
            self._w(200, json.dumps(res).encode())

    s = HTTPServer(("0.0.0.0", port), H)
    print(f"[{server_name}] http listening on :{port}", flush=True)
    s.serve_forever()
