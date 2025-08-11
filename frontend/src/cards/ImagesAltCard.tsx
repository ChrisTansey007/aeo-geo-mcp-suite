import type { ToolResult } from '../shared/types';
import EvidencePanel from '../panels/EvidencePanel';
import FixDrawer from '../drawers/FixDrawer';

export default function ImagesAltCard({ res }: { res: ToolResult }) {
  return (
    <section className="border border-neutral-800 rounded p-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Images & Alt Text</h3>
        <div className="text-sm">Score {res.summary.score} · {res.summary.grade}</div>
      </header>
      <ul className="mt-2 text-sm">
        {Array.isArray(res.metrics.images) && res.metrics.images.length > 0 ? (
          res.metrics.images.map(
            (img: { src: string; alt: string }, i: number) => (
              <li key={i}>
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
