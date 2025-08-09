// servers/mcp-publisher/src/server.ts
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
`mcp-publisher server

  --transport=http|sse|stdio[,..]   (default: http)
  --port=<number>                    (default: 3051)
  --sse-port=<number>                (default: port+1)

  # Adapter/config hints (exported to env if provided)
  --adapter=fs-git|gh-pages|cms-mock
  --repo=./content-repo
  --branch=main
  --baseUrl=https://example.com
  --scopes="publish:*,publish:read"
  --p95ms=<milliseconds>             (sets P95_LATENCY_MS)
`
  );
  process.exit(0);
}

const rawTransport = args.get('--transport') || process.env.MCP_TRANSPORT || 'http';
const transports = new Set<Transport>(rawTransport.split(',').map(s => s.trim() as Transport));

const port = Number(args.get('--port') || process.env.PORT || 3051);
const ssePort = Number(args.get('--sse-port') || port + 1);

// Surface adapter flags as env for downstream modules
const mapEnv: Array<[string, string | undefined]> = [
  ['PUBLISH_ADAPTER', args.get('--adapter')],
  ['PUBLISH_REPO', args.get('--repo')],
  ['PUBLISH_BRANCH', args.get('--branch')],
  ['PUBLISH_BASE_URL', args.get('--baseUrl')],
  ['PUBLISH_REQUIRED_SCOPES', args.get('--scopes')],
  ['P95_LATENCY_MS', args.get('--p95ms')],
];

for (const [k, v] of mapEnv) if (v && !process.env[k]) process.env[k] = v;

const h = (r: JsonRpcReq): Promise<JsonRpcRes> => handle(r);

const closers: Array<() => void> = [];
const track = (c?: { close?: () => void }) => c?.close && closers.push(() => c.close!());

if (transports.has('http')) {
  const srv = startHttp('mcp-publisher', h, port);
  track(srv as any);
  console.log(`[mcp-publisher] HTTP :${port} adapter=${process.env.PUBLISH_ADAPTER || 'fs-git'} repo=${process.env.PUBLISH_REPO || ''}`);
}

if (transports.has('sse')) {
  const srv = startSse(h, ssePort);
  track(srv as any);
  console.log(`[mcp-publisher] SSE  :${ssePort}`);
}

if (transports.has('stdio')) {
  startStdio(h);
  console.log(`[mcp-publisher] STDIO ready`);
}

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[mcp-publisher] shutting down…');
  try { for (const c of closers) c(); } catch { /* ignore */ }
  finally { process.exit(0); }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
