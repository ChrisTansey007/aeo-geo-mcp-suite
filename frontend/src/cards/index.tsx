// src/cards/index.tsx
/* eslint-disable react-refresh/only-export-components */
import type { ToolResult } from '../shared/types';
import React from 'react';

export type CardComponent = React.FC<{ res: ToolResult }>;


import TitleMetaCard from './TitleMetaCard';
import HeadingsCard from './HeadingsCard';
import ImagesAltCard from './ImagesAltCard';
import LinksCard from './LinksCard';
import IndexabilityCard from './IndexabilityCard';
const registry: Record<string, CardComponent> = {
  title_meta: TitleMetaCard,
  headings: HeadingsCard,
  images_alt: ImagesAltCard,
  links: LinksCard,
  indexability: IndexabilityCard,
};

export function register(kind: string, Component: CardComponent) {
  registry[kind] = Component;
}

export function getCard(kind: string): CardComponent {
  return registry[kind] || DefaultCard;
}

export const DefaultCard: CardComponent = ({ res }) => {
  const summary = res?.summary || {};
  const metrics = res?.metrics || {};
  const details = Array.isArray(res?.details) ? res.details : [];

  return (
    <div className="border border-neutral-800 rounded p-3">
      <h3 className="font-medium">{res.tool}</h3>
      <div className="text-sm">
        Score: {summary.score !== undefined ? summary.score : 'N/A'} ({summary.grade || 'N/A'})
      </div>
      <dl className="grid grid-cols-2 gap-2 mt-2 text-sm">
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
    </div>
  );
};
