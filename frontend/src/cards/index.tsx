// src/cards/index.tsx
import type { ToolResult } from '../shared/types';
import React from 'react';

export type CardComponent = React.FC<{ res: ToolResult }>;


import TitleMetaCard from './TitleMetaCard';
import HeadingsCard from './HeadingsCard';
import ImagesAltCard from './ImagesAltCard';
import LinksCard from './LinksCard';
const registry: Record<string, CardComponent> = {
  title_meta: TitleMetaCard,
  headings: HeadingsCard,
  images_alt: ImagesAltCard,
  links: LinksCard,
};

export function register(kind: string, Component: CardComponent) {
  registry[kind] = Component;
}

export function getCard(kind: string): CardComponent {
  return registry[kind] || DefaultCard;
}

export const DefaultCard: CardComponent = ({ res }) => (
  <div className="border border-neutral-800 rounded p-3">
    <h3 className="font-medium">{res.tool}</h3>
    <div className="text-sm">Score: {res.summary.score} ({res.summary.grade})</div>
    <dl className="grid grid-cols-2 gap-2 mt-2 text-sm">
      {Object.entries(res.metrics).map(([k,v]) => (
        <div key={k} className="flex justify-between"><dt className="text-neutral-400">{k}</dt><dd>{String(v)}</dd></div>
      ))}
    </dl>
    <ul className="list-disc pl-5 mt-2 text-sm">
      {res.details.map((d,i)=>(<li key={i}>{d.type.toUpperCase()}: {d.message}</li>))}
    </ul>
  </div>
);
