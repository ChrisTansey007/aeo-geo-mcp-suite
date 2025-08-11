const instances: MockEventSource[] = [];

class MockEventSource {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  onopen: (() => void) | null = null;
  constructor() {
    instances.push(this);
  }
  emit(data: any) {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }
  close() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return false; }
  readyState = 1;
  url = '';
  withCredentials = false;
}

vi.mock('../lib/api', () => ({
  getLogsStream: () => new MockEventSource(),
}));

import { renderHook, act } from '@testing-library/react';
import { useLogsStream } from '../hooks/useLogs';

describe('useLogsStream', () => {
  it('pauses and resumes stream', () => {
    const { result } = renderHook(() => useLogsStream('backend', true));
    act(() => instances[0].emit({ id: '1', ts: 0, level: 'info', message: 'a' }));
    expect(result.current.logs.length).toBe(1);
    act(() => result.current.pause());
    act(() => instances[0].emit({ id: '2', ts: 1, level: 'info', message: 'b' }));
    expect(result.current.logs.length).toBe(1);
    act(() => result.current.resume());
    act(() => instances[0].emit({ id: '3', ts: 2, level: 'info', message: 'c' }));
    expect(result.current.logs.length).toBe(2);
  });
});
