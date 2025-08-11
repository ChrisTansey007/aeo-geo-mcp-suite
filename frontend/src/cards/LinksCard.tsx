import type { ToolResult } from '../shared/types';
import EvidencePanel from '../panels/EvidencePanel';
import FixDrawer from '../drawers/FixDrawer';

export default function LinksCard({ res }: { res: ToolResult }) {
  const summary = res?.summary || {};
  const metrics = res?.metrics || {};
  const details = Array.isArray(res?.details) ? res.details : [];
  const evidence = res?.evidence;

  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Links</h3>
        <div className="text-sm">
          Score {summary.score !== undefined ? summary.score : 'N/A'} · {summary.grade || 'N/A'}
        </div>
      </header>
      <ul className="mt-2 text-sm">
        {Array.isArray(metrics.links) && metrics.links.length > 0 ? (
          metrics.links.map((link: string, i: number) => (
            <li key={`${link}-${i}`}>{link}</li>
          ))
        ) : (
          <li>No links found.</li>
        )}
      </ul>
      <ul className="list-disc pl-5 mt-2 text-sm">
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
