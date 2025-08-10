import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, sql } from 'drizzle-orm';
import sanitizeHtml from 'sanitize-html';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { createGzip, createGunzip } from 'zlib';

const dbPath = path.resolve(__dirname, '../../../data/app.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

const MAX_EVIDENCE = 256 * 1024;

export function createRun(status = 'pending') {
  const run = db.insert(schema.runs).values({ status }).returning().get();
  enforceRunRetention();
  return run;
}

export function updateRunStatus(id: number, status: string) {
  return db.update(schema.runs).set({ status }).where(eq(schema.runs.id, id)).run();
}

export function upsertCard(runId: number, type: string, data: unknown) {
  return db.insert(schema.cards).values({ runId, type, data: JSON.stringify(data) })
    .onConflictDoUpdate({ target: [schema.cards.runId, schema.cards.type], set: { data: JSON.stringify(data) } })
    .returning().get();
}

export function listCards(runId: number) {
  return db.select().from(schema.cards).where(eq(schema.cards.runId, runId)).all();
}

export function addEvidence(cardId: number, raw: string) {
  const clean = sanitizeHtml(raw);
  if (Buffer.byteLength(clean) > MAX_EVIDENCE) throw new Error('evidence too large');
  return db.insert(schema.evidence).values({ cardId, raw: clean }).returning().get();
}

export function createThread(runId: number, title: string) {
  return db.insert(schema.chatThreads).values({ runId, title }).returning().get();
}

export function addMessage(threadId: number, role: string, content: string) {
  return db.insert(schema.chatMessages).values({ threadId, role, content }).returning().get();
}

export function exportRun(runId: number, stream: fs.WriteStream) {
  const gzip = createGzip();
  pipeline(gzip, stream, (err) => { if (err) console.error('pipeline', err); });
  const write = (obj: any) => gzip.write(JSON.stringify(obj) + '\n');
  const run = db.select().from(schema.runs).where(eq(schema.runs.id, runId)).get();
  write({ type: 'run', data: run });
  db.select().from(schema.cards).where(eq(schema.cards.runId, runId)).all().forEach(c => write({ type: 'card', data: c }));
  db.select({ e: schema.evidence }).from(schema.evidence)
    .leftJoin(schema.cards, eq(schema.evidence.cardId, schema.cards.id))
    .where(eq(schema.cards.runId, runId))
    .all().forEach(row => write({ type: 'evidence', data: row.e }));
  db.select().from(schema.chatThreads).where(eq(schema.chatThreads.runId, runId)).all().forEach(t => write({ type: 'thread', data: t }));
  db.select({ m: schema.chatMessages }).from(schema.chatMessages)
    .leftJoin(schema.chatThreads, eq(schema.chatMessages.threadId, schema.chatThreads.id))
    .where(eq(schema.chatThreads.runId, runId))
    .all().forEach(row => write({ type: 'message', data: row.m }));
  gzip.end();
}

export function importRun(stream: fs.ReadStream) {
  const gunzip = createGunzip();
  pipeline(stream, gunzip, (err) => { if (err) console.error('pipeline', err); });
  gunzip.setEncoding('utf8');
  let buffer = '';
  gunzip.on('data', chunk => {
    buffer += chunk;
    let index;
    while ((index = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
      if (!line.trim()) continue;
      const obj = JSON.parse(line);
      switch (obj.type) {
        case 'run':
          db.insert(schema.runs).values(obj.data).onConflictDoNothing().run();
          break;
        case 'card':
          db.insert(schema.cards).values(obj.data).onConflictDoNothing().run();
          break;
        case 'evidence':
          db.insert(schema.evidence).values(obj.data).onConflictDoNothing().run();
          break;
        case 'thread':
          db.insert(schema.chatThreads).values(obj.data).onConflictDoNothing().run();
          break;
        case 'message':
          db.insert(schema.chatMessages).values(obj.data).onConflictDoNothing().run();
          break;
      }
    }
  });
}

export function enforceRunRetention(limit = 500) {
  const count = db.select({ count: sql`count(*)` }).from(schema.runs).get() as any;
  const total = Number(count.count);
  if (total > limit) {
    const toDelete = total - limit;
    const oldRuns = db.select({ id: schema.runs.id }).from(schema.runs).orderBy(schema.runs.createdAt).limit(toDelete).all();
    oldRuns.forEach(r => db.delete(schema.runs).where(eq(schema.runs.id, r.id)).run());
  }
}
