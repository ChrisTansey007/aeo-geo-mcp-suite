const logs = Array.from({ length: 1000 }, (_, i) => ({
  id: String(i),
  ts: i,
  level: 'info',
  message: `msg ${i}`,
}));

vi.mock('../hooks/useLogs', () => ({
  useLogsQuery: () => ({ data: { logs } }),
  useLogsStream: () => ({ logs: [], paused: false, pause: vi.fn(), resume: vi.fn(), clear: vi.fn() }),
  downloadLogs: vi.fn(),
}));

import { render } from '@testing-library/react';
import { TabPane } from '../panels/LogsPanel';
import { Tabs } from '../components/tabs';

describe('LogsPanel virtualization', () => {
  it('renders only visible rows', () => {
    const { container } = render(
      <Tabs value="backend">
        <TabPane
          source="backend"
          state={{ level: '', q: '', time: '1h', live: false, scroll: 0 }}
          update={() => {}}
          active
        />
      </Tabs>
    );

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeLessThan(logs.length);
  });
});
