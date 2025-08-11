// src/lib/api.ts
import type { Run, RunMeta, ToolResult } from '../shared/types';

const BASE = import.meta.env.VITE_API_BASE ?? '';
export const LOGS_MOCK = import.meta.env.VITE_LOGS_MOCK === '1';

// Simple frontend logger
function logFrontend(message: string) {
  try {
    const logLine = `[${new Date().toISOString()}] ${message}\n`;
    // Save to localStorage for browser, and try to append to frontend.log if running in Node (dev)
    if (typeof window !== 'undefined') {
      const prev = localStorage.getItem('frontendLog') || '';
      localStorage.setItem('frontendLog', prev + logLine);
    }
    // For dev: try to append to frontend.log (only works in Node, not browser)
    // (This is a placeholder; real file writing would need backend support)
  } catch {
    // ignore logging errors
  }
}

// ----------------- Logs API helpers -----------------
export interface LogsParams {
  source: string;
  level?: string;
  q?: string;
  limit?: number;
  after?: string;
  signal?: AbortSignal;
}

function buildLogsUrl(path: string, params: LogsParams) {
  const search = new URLSearchParams();
  search.set('source', params.source);
  if (params.level) search.set('level', params.level);
  if (params.q) search.set('q', params.q);
  if (params.limit) search.set('limit', String(params.limit));
  if (params.after) search.set('after', params.after);
  return `${BASE}${path}?${search.toString()}`;
}

export async function getLogs(params: LogsParams) {
  const url = buildLogsUrl('/logs', params);
  try {
    const res = await fetch(url, { signal: params.signal });
    if (!res.ok) throw new Error('logs failed');
    return res.json();
  } catch (err) {
    if (LOGS_MOCK) return mockLogs(params);
    throw err;
  }
}

export function getLogsStream(source: string): EventSource {
  try {
    return new EventSource(buildLogsUrl('/logs/stream', { source } as LogsParams));
  } catch (err) {
    if (LOGS_MOCK) return mockLogsStream();
    throw err;
  }
}

export async function downloadLogs(params: LogsParams) {
  const url = buildLogsUrl('/logs/download', params);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('download failed');
    return res.blob();
  } catch (err) {
    if (LOGS_MOCK) {
      const blob = new Blob([JSON.stringify(await mockLogs(params))], {
        type: 'application/json',
      });
      return blob;
    }
    throw err;
  }
}

// Basic mock provider for when API endpoints are missing
async function mockLogs(params: LogsParams) {
  const count = params.limit ?? 20;
  const now = Date.now();
  const logs = Array.from({ length: count }, (_, i) => ({
    id: `${params.source}-${now - i}`,
    ts: now - i * 1000,
    level: 'info',
    message: `mock ${params.source} log ${i}`,
  }));
  return { logs };
}

function mockLogsStream(): EventSource {
  const target = new EventTarget();
  const interval = setInterval(() => {
    const data = {
      id: String(Date.now()),
      ts: Date.now(),
      level: 'info',
      message: 'mock stream log',
    };
    const event = new MessageEvent('message', { data: JSON.stringify(data) });
    target.dispatchEvent(event);
    (target as any).onmessage?.(event);
  }, 1000);
  return {
    close() {
      clearInterval(interval);
    },
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
    onmessage: null,
    onerror: null,
    onopen: null,
    readyState: 0,
    url: '',
    withCredentials: false,
  } as unknown as EventSource;
}

export async function route(url: string, engines?: string[]) {
  logFrontend(`route called: url=${url} engines=${JSON.stringify(engines)}`);
  const res = await fetch(`${BASE}/api/route`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, engines })
  });
  if (!res.ok) {
    logFrontend(`route failed: status=${res.status}`);
    throw new Error('route failed');
  }
  return res.json() as Promise<{ selected_tools: string[]; rationale: string }>;
}

export async function analyze(url: string, tools: string[], engines?: string[]) {
  logFrontend(`analyze called: url=${url} tools=${JSON.stringify(tools)} engines=${JSON.stringify(engines)}`);
  const res = await fetch(`${BASE}/api/analyze`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, tools, engines })
  });
  if (!res.ok) {
    logFrontend(`analyze failed: status=${res.status}`);
    throw new Error('analyze failed');
  }
  return res.json() as Promise<{ run_id: string; results: ToolResult[] }>;
}

export async function runs() {
  logFrontend('runs called');
  const res = await fetch(`${BASE}/api/runs`);
  if (!res.ok) {
    logFrontend(`runs failed: status=${res.status}`);
    throw new Error('runs failed');
  }
  return res.json() as Promise<{ runs: RunMeta[] }>;
}

export async function runDetail(id: string) {
  logFrontend(`runDetail called: id=${id}`);
  const res = await fetch(`${BASE}/api/runs/${id}`);
  if (!res.ok) {
    logFrontend(`runDetail failed: status=${res.status}`);
    throw new Error('run detail failed');
  }
  return res.json() as Promise<{ run: Run }>;
}

export async function createRunApi() {
  const res = await fetch(`${BASE}/api/runs`, { method: 'POST' });
  if (!res.ok) throw new Error('create run failed');
  return res.json();
}

export async function runCards(id: number) {
  const res = await fetch(`${BASE}/api/runs/${id}/cards`);
  if (!res.ok) throw new Error('cards failed');
  return res.json();
}

export async function upsertCardApi(runId: number, type: string, data: unknown) {
  const res = await fetch(`${BASE}/api/runs/${runId}/cards`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data })
  });
  if (!res.ok) throw new Error('card failed');
  return res.json();
}

export async function addEvidenceApi(cardId: number, raw: string) {
  const res = await fetch(`${BASE}/api/cards/${cardId}/evidence`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw })
  });
  if (!res.ok) throw new Error('evidence failed');
  return res.json();
}

export async function createThreadApi(runId: number, title: string) {
  const res = await fetch(`${BASE}/api/chat/threads`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runId, title })
  });
  if (!res.ok) throw new Error('thread failed');
  return res.json();
}

export async function addMessageApi(threadId: number, role: string, content: string) {
  const res = await fetch(`${BASE}/api/chat/${threadId}/messages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, content })
  });
  if (!res.ok) throw new Error('message failed');
  return res.json();
}

export async function exportRunApi(id: number) {
  const res = await fetch(`${BASE}/api/export/${id}`);
  if (!res.ok) throw new Error('export failed');
  return res.blob();
}

export async function importDataApi(file: File) {
  const res = await fetch(`${BASE}/api/import`, { method: 'POST', body: file });
  if (!res.ok) throw new Error('import failed');
  return res.json();
}
