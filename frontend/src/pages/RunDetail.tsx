import { useRunStore } from '../store/runStore';
import { getCard } from '../cards';

export default function RunDetail() {
  const { currentRun } = useRunStore();
  if (!currentRun) return <div>No run yet. Use Run to start.</div>;
  const r = currentRun;
  return (
    <div className="space-y-4">
      <header className="border-b border-neutral-800 pb-2">
        <h1 className="text-xl font-semibold">{r.url}</h1>
        <p className="text-sm text-neutral-400">Tools: {r.tools.join(', ')}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {r.results.map((res, i) => {
          const Card = getCard(res.tool);
          // Use a unique key: tool name + run id + index
          return <Card key={`${res.tool}_${r.id}_${i}`} res={res} />;
        })}
      </div>
    </div>
  );
}
