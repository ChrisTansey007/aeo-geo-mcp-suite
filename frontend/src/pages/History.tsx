import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRunStore } from '../store/runStore';
import type { Run } from '../shared/types';

const PAGE_SIZE = 10;

export default function History() {
  const runs = useRunStore((s) => s.runs);
  const loadRuns = useRunStore((s) => s.loadRuns);

  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    setPage(0);
  }, [filter, runs.length]);

  const filtered = useMemo(
    () =>
      runs.filter((r) =>
        r.url.toLowerCase().includes(filter.toLowerCase())
      ),
    [runs, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRuns = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">History</h1>
      <div>
        <label htmlFor="history-filter" className="block text-sm font-medium">
          Filter
        </label>
        <input
          id="history-filter"
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm dark:border-slate-800 dark:bg-slate-950"
          placeholder="Search by URL"
        />
      </div>
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {pageRuns.map((r: Run) => (
          <li key={r.id} className="py-2">
            <Link
              to={`/runs/${r.id}`}
              onClick={() => useRunStore.setState({ currentRun: r })}
              className="text-blue-600 hover:underline"
            >
              {r.url}
            </Link>
            <span className="ml-2 text-xs text-slate-500">
              {new Date(r.started_at).toLocaleString()}
            </span>
          </li>
        ))}
        {pageRuns.length === 0 && (
          <li className="py-2 text-sm text-slate-500">No runs found.</li>
        )}
      </ul>
      <nav className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-800"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {Math.min(page + 1, totalPages)} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
          className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-800"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
