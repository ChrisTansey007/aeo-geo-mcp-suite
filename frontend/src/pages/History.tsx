import { useEffect } from 'react';
import { useRunStore } from '../store/runStore';

export default function History() {
  const runs = useRunStore((s) => s.runs);
  const loadRuns = useRunStore((s) => s.loadRuns);
  useEffect(() => { loadRuns(); }, [loadRuns]);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">History</h1>
      <ul>
        {runs.map((r) => (
          <li key={r.id}>{r.id} - {r.url}</li>
        ))}
      </ul>
    </div>
  );
}
