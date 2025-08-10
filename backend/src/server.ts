import express from 'express';
import { z } from 'zod';
import {
  createRun,
  updateRunStatus,
  upsertCard,
  listCards,
  addEvidence,
  createThread,
  addMessage,
  exportRun,
  importRun,
  db
} from './db/index';
import * as schema from './db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json({ limit: '1mb' }));

const API_KEY = process.env.API_KEY;
app.use((req, res, next) => {
  if (API_KEY && req.header('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

let current = 0;
const MAX_CONCURRENT = 20;
const RATE: Record<string, { count: number; time: number }> = {};
app.use((req, res, next) => {
  if (current > MAX_CONCURRENT) return res.status(503).send('busy');
  current++;
  res.on('finish', () => current--);
  const ip = req.ip;
  const now = Date.now();
  const entry = RATE[ip] || { count: 0, time: now };
  if (now - entry.time > 60_000) { entry.count = 0; entry.time = now; }
  if (entry.count > 100) return res.status(429).send('too many requests');
  entry.count++; RATE[ip] = entry;
  const start = Date.now();
  res.on('finish', () => {
    const dur = Date.now() - start;
    if (dur > 200) console.warn('slow request', req.method, req.path, dur);
  });
  next();
});

app.get('/health', (_, res) => res.json({ ok: true }));

app.get('/api/runs', (_, res) => {
  const runs = db.select().from(schema.runs).all();
  res.json(runs);
});

app.post('/api/runs', (_, res) => {
  const run = createRun();
  res.json(run);
});

app.get('/api/runs/:id', (req, res) => {
  const id = Number(req.params.id);
  const run = db.select().from(schema.runs).where(eq(schema.runs.id, id)).get();
  if (!run) return res.status(404).end();
  res.json(run);
});

app.patch('/api/runs/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = z.object({ status: z.string() }).parse(req.body);
  updateRunStatus(id, body.status);
  res.json({ ok: true });
});

app.get('/api/runs/:id/cards', (req, res) => {
  const runId = Number(req.params.id);
  res.json(listCards(runId));
});

app.post('/api/runs/:id/cards', (req, res) => {
  const runId = Number(req.params.id);
  const body = z.object({ type: z.string(), data: z.any() }).parse(req.body);
  const card = upsertCard(runId, body.type, body.data);
  res.json(card);
});

app.post('/api/cards/:id/evidence', (req, res) => {
  const cardId = Number(req.params.id);
  const body = z.object({ raw: z.string() }).parse(req.body);
  const ev = addEvidence(cardId, body.raw);
  res.json(ev);
});

app.post('/api/chat/threads', (req, res) => {
  const body = z.object({ runId: z.number(), title: z.string() }).parse(req.body);
  const thread = createThread(body.runId, body.title);
  res.json(thread);
});

app.get('/api/chat/:threadId/messages', (req, res) => {
  const threadId = Number(req.params.threadId);
  const msgs = db.select().from(schema.chatMessages).where(eq(schema.chatMessages.threadId, threadId)).all();
  res.json(msgs);
});

app.post('/api/chat/:threadId/messages', (req, res) => {
  const threadId = Number(req.params.threadId);
  const body = z.object({ role: z.string(), content: z.string() }).parse(req.body);
  const msg = addMessage(threadId, body.role, body.content);
  res.json(msg);
});

app.get('/api/export/:id', (req, res) => {
  const id = Number(req.params.id);
  res.setHeader('Content-Type', 'application/gzip');
  exportRun(id, res);
});

app.post('/api/import', (req, res) => {
  const tmp = path.join('/tmp', `import-${Date.now()}.gz`);
  const ws = fs.createWriteStream(tmp);
  req.pipe(ws);
  ws.on('finish', () => {
    const rs = fs.createReadStream(tmp);
    importRun(rs);
    res.json({ ok: true });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server listening on ${PORT}`));
