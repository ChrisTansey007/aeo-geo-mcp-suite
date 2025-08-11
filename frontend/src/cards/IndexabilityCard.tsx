import type { ToolResult } from '../shared/types';
import EvidencePanel from '../panels/EvidencePanel';
import FixDrawer from '../drawers/FixDrawer';

export default function IndexabilityCard({ res }: { res: ToolResult }) {
  return (
    <section className="rounded border border-neutral-800 p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Indexability</h3>
        <div className="text-sm">Score {res.summary.score} · {res.summary.grade}</div>
      </header>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
        {Object.entries(res.metrics).map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-neutral-400">{k}</dt>
            <dd>{String(v)}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {res.details.map((d, i) => (
          <li key={i}>
            {d.type.toUpperCase()}: {d.message}
          </li>
        ))}
      </ul>
      <EvidencePanel evidence={res.evidence} />
      <FixDrawer details={res.details}>
        <button className="mt-2 text-sm text-indigo-600">View fixes</button>
      </FixDrawer>
    </section>
  );
}
