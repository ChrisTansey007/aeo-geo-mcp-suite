// src/shared/types.ts
export type Detail = { type: 'info'|'warn'|'error'; message: string; selector?: string };
export type Evidence = { selector?: string; text?: string; url?: string };
export type Summary = { score: number; grade: string; issues: number; warnings: number };
export type ToolResult = {
  tool: string;
  status: 'ok'|'error';
  summary: Summary;
  metrics: Record<string, number|string|boolean>;
  details: Detail[];
  evidence?: Evidence[];
  url: string;
  started_at?: string;
  finished_at?: string;
};
export type RunMeta = { id: string; url: string; started_at: string; finished_at?: string; tools: string[]; grade?: string };
export type Run = RunMeta & { results: ToolResult[]; engines?: string[]; experiments?: Record<string, string|number|boolean> };
