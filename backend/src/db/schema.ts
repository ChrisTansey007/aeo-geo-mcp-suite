import { sqliteTable, integer, text, blob, index, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const runs = sqliteTable('runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const cards = sqliteTable('cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: integer('run_id').references(() => runs.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  data: text('data', { mode: 'json' }).notNull()
}, (table) => ({
  runIdx: index('cards_run_idx').on(table.runId),
  uniq: unique('cards_run_type_unique').on(table.runId, table.type)
}));

export const evidence = sqliteTable('evidence', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: integer('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  raw: text('raw').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  cardIdx: index('evidence_card_idx').on(table.cardId)
}));

export const chatThreads = sqliteTable('chat_threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: integer('run_id').references(() => runs.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: integer('thread_id').references(() => chatThreads.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  threadIdx: index('chat_messages_thread_idx').on(table.threadId)
}));

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: integer('run_id').references(() => runs.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  data: blob('data').notNull()
}, (table) => ({
  runIdx: index('files_run_idx').on(table.runId)
}));
