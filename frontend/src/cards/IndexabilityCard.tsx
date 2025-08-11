import type { ToolResult } from '../shared/types';
import EvidencePanel from '../panels/EvidencePanel';
import FixDrawer from '../drawers/FixDrawer';

export default function IndexabilityCard({ res }: { res: ToolResult }) {
  const summary = res?.summary || {};
  const metrics = res?.metrics || {};
  const details = Array.isArray(res?.details) ? res.details : [];
  const evidence = res?.evidence;

  return (
    <section className="rounded border border-neutral-800 p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Indexability</h3>
        <div className="text-sm">
          Score {summary.score !== undefined ? summary.score : 'N/A'} · {summary.grade || 'N/A'}
        </div>
      </header>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
        {metrics && Object.entries(metrics).length > 0 ? (
          Object.entries(metrics).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-neutral-400">{k}</dt>
              <dd>{String(v)}</dd>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-neutral-400">No metrics available</div>
        )}
      </dl>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {details.length > 0 ? (
          details.map((d, i) => (
            <li key={`${d.type}-${d.message}-${d.selector || ''}-${i}`}>
              {d.type ? d.type.toUpperCase() : 'INFO'}: {d.message || ''}
            </li>
          ))
        ) : (
          <li className="text-neutral-400">No details available</li>
        )}
      </ul>
      <EvidencePanel evidence={evidence} />
      <FixDrawer details={details}>
        <button className="mt-2 text-sm text-indigo-600">View fixes</button>
      </FixDrawer>
    </section>
  );
}
