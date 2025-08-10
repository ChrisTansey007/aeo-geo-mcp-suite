import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { sqlite, createRun, updateRunStatus, upsertCard, listCards, addEvidence, createThread, addMessage, exportRun, importRun } from '../src/db/index';
import { tmpdir } from 'os';

beforeAll(() => {
  const sql = fs.readFileSync(path.join(__dirname, '../drizzle/0000_init.sql'), 'utf8');
  sqlite.exec(sql);
});

describe('db flows', () => {
  it('creates run and cards and evidence', () => {
    const run = createRun();
    updateRunStatus(run.id, 'done');
    const card = upsertCard(run.id, 'test', { a: 1 });
    const cards = listCards(run.id);
    expect(cards.length).toBe(1);
    expect(cards[0].type).toBe('test');
    const ev = addEvidence(card.id, '<b>raw</b>');
    expect(ev.raw).toBe('<b>raw</b>');
  });

  it('handles chat and export/import', async () => {
    const run = createRun();
    const thread = createThread(run.id, 't');
    const msg = addMessage(thread.id, 'user', 'hi');
    expect(msg.content).toBe('hi');
    const tmp = path.join(tmpdir(), 'export.ndjson.gz');
    const ws = fs.createWriteStream(tmp);
    exportRun(run.id, ws);
    await new Promise(res => ws.on('finish', res));
    const rs = fs.createReadStream(tmp);
    importRun(rs);
  });
});
