import type { Evidence } from '../shared/types';

export default function EvidencePanel({ evidence }: { evidence?: Evidence[] }) {
  if (!evidence || evidence.length === 0) return null;
  return (
    <section className="mt-2 border-t border-neutral-800 pt-2">
      <h4 className="mb-1 text-sm font-medium">Evidence</h4>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {evidence.map((e, i) => (
          <li key={i}>{e.text || e.url || e.selector}</li>
        ))}
      </ul>
    </section>
  );
}
