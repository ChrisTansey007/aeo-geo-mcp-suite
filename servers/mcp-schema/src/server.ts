// servers/mcp-schema/src/server.ts
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
`mcp-schema server

  --transport=http|sse|stdio[,..]  (default: http)
  --port=<number>                   (default: 3041)
  --sse-port=<number>               (default: port+1)

  # Schema/template knobs (forwarded to env if provided)
  --templates=./templates           (sets SCHEMA_TEMPLATES_DIR)
  --strict=true|false               (sets SCHEMA_STRICT)
  --p95ms=<milliseconds>            (sets P95_LATENCY_MS)
`
  );
  process.exit(0);
}

const rawTransport = args.get('--transport') || process.env.MCP_TRANSPORT || 'http';
const transports = new Set<Transport>(rawTransport.split(',').map(s => s.trim() as Transport));

const port = Number(args.get('--port') || process.env.PORT || 3041);
const ssePort = Number(args.get('--sse-port') || port + 1);

// Surface flags as env for downstream modules
const envMappings: Array<[string, string | undefined]> = [
  ['SCHEMA_TEMPLATES_DIR', args.get('--templates')],
  ['SCHEMA_STRICT', args.get('--strict')],
  ['P95_LATENCY_MS', args.get('--p95ms')],
];

for (const [k, v] of envMappings) if (v != null && !process.env[k]) process.env[k] = String(v);

const h = (r: JsonRpcReq): Promise<JsonRpcRes> => handle(r);

const closers: Array<() => void> = [];
const track = (srv?: { close?: () => void }) => srv?.close && closers.push(() => srv.close!());

if (transports.has('http')) {
  const srv = startHttp('mcp-schema', h, port);
  track(srv as any);
  console.log(`[mcp-schema] HTTP :${port} templates=${process.env.SCHEMA_TEMPLATES_DIR || '(default)'} strict=${process.env.SCHEMA_STRICT ?? 'false'}`);
}

if (transports.has('sse')) {
  const srv = startSse(h, ssePort);
  track(srv as any);
  console.log(`[mcp-schema] SSE  :${ssePort}`);
}

if (transports.has('stdio')) {
  startStdio(h);
  console.log('[mcp-schema] STDIO ready');
}

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[mcp-schema] shutting down…');
  try { for (const c of closers) c(); } catch { /* ignore */ }
  finally { process.exit(0); }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
