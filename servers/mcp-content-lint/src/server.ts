// servers/mcp-content-lint/src/server.ts
import { startHttp, startSse, startStdio, JsonRpcReq, JsonRpcRes } from '@mcp/common/transport.js';
import { handle } from './service.js';

type Transport = 'http' | 'sse' | 'stdio';

function parseArgs(argv: string[]) {
  const map = new Map<string, string | boolean>();
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (!tok.startsWith('--')) continue;
    if (tok.includes('=')) {
      const [k, v = 'true'] = tok.split('=');
      map.set(k, v);
    } else {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        map.set(tok, 'true');
      } else {
        map.set(tok, next);
        i++;
      }
    }
  }
  return map;
}

const args = parseArgs(process.argv.slice(2));

if (args.get('--help')) {
  console.log(
    `mcp-content-lint server\n` +
    `  --transport=http|sse|stdio[,..]   (default: http)\n` +
    `  --port=<number>                    (default: 3052)\n` +
    `  --sse-port=<number>                (default: port+1)\n`
  );
  process.exit(0);
}

const rawTransport =
  (args.get('--transport') as string) ||
  process.env.MCP_TRANSPORT ||
  'http';

const transports = new Set<Transport>(
  rawTransport.split(',').map(s => s.trim() as Transport)
);

const port = Number(args.get('--port') || process.env.PORT || 3052);
const ssePort = Number(args.get('--sse-port') || port + 1);

const h = (r: JsonRpcReq): Promise<JsonRpcRes> => handle(r);

const closers: Array<() => void> = [];
function trackCloser(close?: () => void) {
  if (typeof close === 'function') closers.push(close);
}

if (transports.has('http')) {
  const srv = startHttp('mcp-content-lint', h, port);
  trackCloser(() => (srv as any)?.close?.());
  console.log(`[mcp-content-lint] HTTP listening on :${port}`);
}

if (transports.has('sse')) {
  const srv = startSse(h, ssePort);
  trackCloser(() => (srv as any)?.close?.());
  console.log(`[mcp-content-lint] SSE listening on :${ssePort}`);
}

if (transports.has('stdio')) {
  startStdio(h);
  console.log(`[mcp-content-lint] STDIO listening (stdin/stdout)`);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[mcp-content-lint] shutting down…');
  try {
    for (const c of closers) c();
  } catch {
    /* noop */
  } finally {
    process.exit(0);
  }
}
