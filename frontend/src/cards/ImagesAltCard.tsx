import type { ToolResult } from '../shared/types';
import EvidencePanel from '../panels/EvidencePanel';
import FixDrawer from '../drawers/FixDrawer';

export default function ImagesAltCard({ res }: { res: ToolResult }) {
  const summary = res?.summary || {};
  const metrics = res?.metrics || {};
  const details = Array.isArray(res?.details) ? res.details : [];
  const evidence = res?.evidence;

  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Images & Alt Text</h3>
        <div className="text-sm">
          Score {summary.score !== undefined ? summary.score : 'N/A'} · {summary.grade || 'N/A'}
        </div>
      </header>
      <ul className="mt-2 text-sm">
        {Array.isArray(metrics.images) && metrics.images.length > 0 ? (
          metrics.images.map(
            (img: { src: string; alt: string }, i: number) => (
              <li key={`${img.src}-${img.alt}-${i}`}>
                <span className="font-semibold">src:</span> {img.src}{' '}
                <span className="font-semibold">alt:</span> {img.alt}
              </li>
            )
          )
        ) : (
          <li>No images found.</li>
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
