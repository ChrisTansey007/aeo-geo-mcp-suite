import { create } from 'zustand';
import * as api from '../lib/api';
import type { Run, ToolResult } from '../shared/types';

interface RunStoreState {
  currentRun?: Run;
  runs: Run[];
  analyzing: boolean;
  router?: { tools: string[]; rationale: string };
  error?: string;
  setError: (e?: string) => void;
  doRoute: (url: string, engines?: string[]) => Promise<void>;
  doAnalyze: (url: string, tools: string[], engines?: string[]) => Promise<void>;
  loadRuns: () => Promise<void>;
}

export const useRunStore = create<RunStoreState>((set) => ({
  analyzing: false,
  runs: [],
  setError: (e?: string) => set({ error: e }),
  doRoute: async (url: string, engines?: string[]) => {
    const r = await api.route(url, engines);
    set({ router: { tools: r.selected_tools, rationale: r.rationale } });
  },
  doAnalyze: async (url: string, tools: string[], engines?: string[]) => {
    set({ analyzing: true, error: undefined });
    try {
      const res = await api.analyze(url, tools, engines);
      const run: Run = {
        id: res.run_id,
        url,
        started_at: new Date().toISOString(),
        tools,
        results: res.results as ToolResult[],
      };
      set({ currentRun: run });
      localStorage.setItem('lastRun', JSON.stringify(run));
    } catch (e: any) {
      set({ error: e?.message ?? 'analyze failed' });
    } finally {
      set({ analyzing: false });
    }
  },
  loadRuns: async () => {
    const r = await api.runs();
    set({ runs: (r as any).runs });
  }
}));
