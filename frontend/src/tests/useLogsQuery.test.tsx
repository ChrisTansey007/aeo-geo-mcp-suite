import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogsQuery } from '../hooks/useLogs';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useLogsQuery', () => {
  it('debounces search and handles paging', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ logs: [] }),
    });
    // @ts-ignore
    global.fetch = fetchMock;

    const { rerender } = renderHook(
      (props) => useLogsQuery(props),
      {
        initialProps: { source: 'backend', q: 'a' },
        wrapper,
      }
    );
    act(() => {
      rerender({ source: 'backend', q: 'ab' });
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toContain('q=ab');

    act(() => {
      rerender({ source: 'backend', q: 'ab', after: '42' });
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[2][0]).toContain('after=42');
  });
});
