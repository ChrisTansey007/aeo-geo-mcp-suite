import type { ToolResult } from '../shared/types';

export default function TitleMetaCard({ res }: { res: ToolResult }) {
  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Title & Meta</h3>
        <div className="text-sm">Score {res.summary.score} · {res.summary.grade}</div>
      </header>
      <dl className="grid grid-cols-2 gap-2 mt-2 text-sm">
        {Object.entries(res.metrics).map(([k,v]) => (
          <div key={k} className="flex justify-between"><dt className="text-neutral-400">{k}</dt><dd>{String(v)}</dd></div>
        ))}
      </dl>
      <ul className="list-disc pl-5 mt-2 text-sm">
        {res.details.map((d,i)=>(<li key={i}>{d.type.toUpperCase()}: {d.message}</li>))}
      </ul>
    </section>
  );
}
