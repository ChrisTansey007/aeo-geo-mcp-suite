// servers/mcp-search/src/server.ts
import { startHttp, startSse, startStdio, JsonRpcReq, JsonRpcRes } from '@mcp/common/transport.js';
import { handle } from './service.js';

type Transport = 'http' | 'sse' | 'stdio';

function parseArgs(argv: string[]) {
  const map = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (!tok.startsWith('--')) continue;
    if (tok.includes('=')) {
      const [k, v = 'true'] = tok.split('=');
      map.set(k, v);
    } else {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) map.set(tok, 'true');
      else { map.set(tok, next); i++; }
    }
  }
  return map;
}

const args = parseArgs(process.argv.slice(2));

if (args.get('--help')) {
  console.log(
`mcp-search server

  --transport=http|sse|stdio[,..]  (default: http)
  --port=<number>                   (default: 3031)
  --sse-port=<number>               (default: port+1)

  # Search knobs (also respected via env)
  --adapter=local-bm25|web-bing|opensearch|vespa  (sets MCP_SEARCH_ADAPTER)
  --indexdir=./data/index                                (sets SEARCH_INDEX_DIR)
  --p95ms=<milliseconds>                                 (sets P95_LATENCY_MS)
`
  );
  process.exit(0);
}

const rawTransport = args.get('--transport') || process.env.MCP_TRANSPORT || 'http';
const transports = new Set<Transport>(rawTransport.split(',').map(s => s.trim() as Transport));

const port = Number(args.get('--port') || process.env.PORT || 3031);
const ssePort = Number(args.get('--sse-port') || port + 1);

// Surface flags as env for downstream modules
const envMappings: Array<[string, string | undefined]> = [
  ['MCP_SEARCH_ADAPTER', args.get('--adapter')],
  ['SEARCH_INDEX_DIR', args.get('--indexdir')],
  ['P95_LATENCY_MS', args.get('--p95ms')],
];

for (const [k, v] of envMappings) if (v != null && !process.env[k]) process.env[k] = String(v);

const h = (r: JsonRpcReq): Promise<JsonRpcRes> => handle(r);

const closers: Array<() => void> = [];
const track = (srv?: { close?: () => void }) => srv?.close && closers.push(() => srv.close!());

if (transports.has('http')) {
  const srv = startHttp('mcp-search', h, port);
  track(srv as any);
  console.log(`[mcp-search] HTTP :${port} adapter=${process.env.MCP_SEARCH_ADAPTER || 'local-bm25'} indexdir=${process.env.SEARCH_INDEX_DIR || '(memory)'}`);
}

if (transports.has('sse')) {
  const srv = startSse(h, ssePort);
  track(srv as any);
  console.log(`[mcp-search] SSE  :${ssePort}`);
}

if (transports.has('stdio')) {
  startStdio(h);
  console.log('[mcp-search] STDIO ready');
}

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[mcp-search] shutting down…');
  try { for (const c of closers) c(); } catch { /* ignore */ }
  finally { process.exit(0); }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
