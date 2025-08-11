import { render, screen } from '@testing-library/react';
import TitleMetaCard from '../cards/TitleMetaCard';
import type { ToolResult } from '../shared/types';

describe('TitleMetaCard', () => {
  it('renders summary, metrics, and details', () => {
    const res: ToolResult = {
      tool: 'title-meta',
      status: 'ok',
      summary: { score: 90, grade: 'A', issues: 0, warnings: 0 },
      metrics: { titleLength: 60 },
      details: [{ type: 'info', message: 'All good' }],
      evidence: [{ text: 'Example' }],
      url: 'https://example.com',
    };
    render(<TitleMetaCard res={res} />);
    expect(screen.getByText('Title & Meta')).toBeInTheDocument();
    expect(screen.getByText(/Score 90/)).toBeInTheDocument();
    expect(screen.getByText('titleLength')).toBeInTheDocument();
    expect(screen.getByText(/All good/)).toBeInTheDocument();
  });
});
