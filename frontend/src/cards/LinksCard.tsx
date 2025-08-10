import type { ToolResult } from '../shared/types';

export default function LinksCard({ res }: { res: ToolResult }) {
  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Links</h3>
        <div className="text-sm">Score {res.summary.score} · {res.summary.grade}</div>
      </header>
      <ul className="mt-2 text-sm">
        {Array.isArray(res.metrics.links) && res.metrics.links.length > 0 ? (
          res.metrics.links.map((link: string, i: number) => (
            <li key={i}>{link}</li>
          ))
        ) : (
          <li>No links found.</li>
        )}
      </ul>
      <ul className="list-disc pl-5 mt-2 text-sm">
        {res.details.map((d,i)=>(<li key={i}>{d.type.toUpperCase()}: {d.message}</li>))}
      </ul>
    </section>
  );
}
