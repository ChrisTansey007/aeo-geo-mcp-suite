import { useRunStore } from '../store/useRunStore';
import type { Run } from '../shared/types';

describe('run flow', () => {
  beforeEach(() => {
    useRunStore.setState({ runs: [], currentRun: undefined });
  });

  it('adds run and sets currentRun', () => {
    const run: Run = {
      id: '1',
      url: 'https://example.com',
      started_at: new Date().toISOString(),
      tools: [],
      results: [],
    };
    useRunStore.getState().addRun(run);
    expect(useRunStore.getState().currentRun).toEqual(run);
    expect(useRunStore.getState().runs[0]).toEqual(run);
  });
});
