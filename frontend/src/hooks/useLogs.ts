import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLogs, getLogsStream, downloadLogs } from '../lib/api';

export interface LogsQueryOptions {
  source: string;
  level?: string;
  q?: string;
  limit?: number;
  after?: string;
}

// simple debounce hook
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useLogsQuery(opts: LogsQueryOptions) {
  const debouncedQ = useDebounce(opts.q);
  return useQuery({
    queryKey: ['logs', opts.source, debouncedQ, opts.level, opts.limit, opts.after],
    queryFn: ({ signal }) =>
      getLogs({ ...opts, q: debouncedQ, signal }),
    placeholderData: (prev) => prev,
  });
}

export interface LogsStreamState<T = any> {
  logs: T[];
  paused: boolean;
  pause: () => void;
  resume: () => void;
  clear: () => void;
}

// Stream logs using EventSource with auto-retry
export function useLogsStream<T = any>(source: string, enabled: boolean): LogsStreamState<T> {
  const [logs, setLogs] = useState<T[]>([]);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let es: EventSource | undefined;
    let timeout: number;
    let retry = 0;

    const connect = () => {
      es = getLogsStream(source);
      es.onmessage = (e) => {
        if (pausedRef.current) return;
        try {
          setLogs((l) => [...l, JSON.parse(e.data)]);
        } catch {
          /* ignore */
        }
      };
      es.onerror = () => {
        es?.close();
        const delay = Math.min(1000 * 2 ** retry, 30000);
        retry++;
        timeout = window.setTimeout(connect, delay);
        // toast notifications could be triggered here
        console.warn('log stream disconnected');
      };
      es.onopen = () => {
        if (retry > 0) {
          console.info('log stream reconnected');
        }
        retry = 0;
      };
    };

    connect();
    return () => {
      es?.close();
      window.clearTimeout(timeout);
    };
  }, [source, enabled]);

  const pause = () => {
    pausedRef.current = true;
    setPaused(true);
  };
  const resume = () => {
    pausedRef.current = false;
    setPaused(false);
  };
  const clear = () => setLogs([]);

  return { logs, paused, pause, resume, clear };
}

export { downloadLogs };

