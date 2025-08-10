
from prometheus_client import Counter, Histogram, CollectorRegistry, generate_latest, CONTENT_TYPE_LATEST

registry = CollectorRegistry()
http_requests = Counter("mcp_http_requests_total", "Total HTTP requests", ["server","method"], registry=registry)
http_errors = Counter("mcp_http_errors_total", "Total HTTP errors", ["server","code"], registry=registry)
rpc_calls = Counter("mcp_rpc_calls_total", "JSON-RPC calls", ["server","method"], registry=registry)
rpc_durations = Histogram("mcp_rpc_duration_seconds", "JSON-RPC durations", ["server","method"], registry=registry)

def render_metrics():
    return CONTENT_TYPE_LATEST, generate_latest(registry)
