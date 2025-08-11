import type { ToolResult } from '../shared/types';
import EvidencePanel from '../panels/EvidencePanel';
import FixDrawer from '../drawers/FixDrawer';

export default function HeadingsCard({ res }: { res: ToolResult }) {
  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Headings</h3>
        <div className="text-sm">Score {res.summary.score} · {res.summary.grade}</div>
      </header>
      <ul className="mt-2 text-sm">
        {Object.entries(res.metrics).map(([level, count]) => (
          <li key={level}>
            <span className="font-semibold">{level}:</span> {count}
          </li>
        ))}
      </ul>
      <ul className="list-disc pl-5 mt-2 text-sm">
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
