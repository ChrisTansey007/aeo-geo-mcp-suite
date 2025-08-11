import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMutation } from '@tanstack/react-query';
import { analyze } from '../lib/api';
import type { Run, ToolResult } from '../shared/types';

function validateUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

interface RunStoreState {
  currentRun?: Run;
  runs: Run[];
  addRun: (run: Run) => void;
  loadRuns: () => void;
  clear: () => void;
}

export const useRunStore = create<RunStoreState>()(
  persist(
    (set, get) => ({
      currentRun: undefined,
      runs: [],
      addRun: (run) => set({ currentRun: run, runs: [run, ...get().runs] }),
      loadRuns: () => {
        // state is rehydrated automatically by persist
        return;
      },
      clear: () => set({ runs: [], currentRun: undefined }),
    }),
    {
      name: 'run-store',
    }
  )
);

export function useAnalyze(tools: string[] = []) {
  const addRun = useRunStore((s) => s.addRun);
  return useMutation({
    mutationFn: async (url: string) => {
      if (!validateUrl(url)) {
        throw new Error('Invalid URL');
      }
      return analyze(url, tools);
    },
    onMutate: () => {
      // optimistic progress toast
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toast', { detail: { title: 'Analyzing…' } })
        );
      }
    },
    onSuccess: (data, url) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: { title: 'Analysis complete' },
          })
        );
      }
      const run: Run = {
        id: data.run_id,
        url,
        started_at: new Date().toISOString(),
        tools,
        results: data.results as ToolResult[],
      };
      addRun(run);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: { title: message },
          })
        );
      }
    },
  });
}

