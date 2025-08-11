import { useState, useRef, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/tabs';
import { DataTable, type Column } from '../components/data-table';
import { JSONViewer } from '../components/json-viewer';
import { Badge } from '../components/badge';
import { useLogsQuery, useLogsStream, LogsStreamState, downloadLogs } from '../hooks/useLogs';

interface LogEntry {
  id: string;
  ts: number;
  level: string;
  message: string;
  [key: string]: any;
}

const SOURCES = ['backend', 'frontend'] as const;
type Source = typeof SOURCES[number];

interface TabState {
  level: string;
  q: string;
  time: string;
  live: boolean;
  scroll: number;
}

export function TabPane({
  source,
  state,
  update,
  active,
}: {
  source: Source;
  state: TabState;
  update: (v: Partial<TabState>) => void;
  active: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const query = useLogsQuery({ source, level: state.level, q: state.q, limit: 500 });
  const stream: LogsStreamState<LogEntry> = useLogsStream(source, state.live);
  const logs = useMemo(
    () => [...((query.data as any)?.logs ?? []), ...stream.logs],
    [query.data, stream.logs]
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (active && containerRef.current) {
      containerRef.current.scrollTop = state.scroll;
    }
  }, [active, state.scroll]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    update({ scroll: e.currentTarget.scrollTop });
  };

  const rowHeight = 40;
  const containerHeight = 384; // h-96
  const start = Math.floor(state.scroll / rowHeight);
  const end = Math.min(logs.length, start + Math.ceil(containerHeight / rowHeight) + 5);
  const visible = logs.slice(start, end);
  const offsetY = start * rowHeight;
  const totalHeight = logs.length * rowHeight;

  const toggleRow = (id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const columns: Column<LogEntry>[] = [
    {
      key: 'ts',
      header: 'Time',
      render: (row) => new Date(row.ts).toLocaleTimeString(),
    },
    {
      key: 'level',
      header: 'Level',
      render: (row) => (
        <Badge variant={row.level === 'error' ? 'destructive' : 'secondary'}>{row.level}</Badge>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (row) => (
        <div>
          <div
            className="cursor-pointer" 
            onClick={() => toggleRow(row.id)}
          >
            {row.message}
          </div>
          {expanded[row.id] && <JSONViewer data={row} className="mt-1" />}
        </div>
      ),
    },
  ];

  const onDownload = () => {
    downloadLogs({ source, level: state.level, q: state.q });
  };

  return (
    <TabsContent value={source} className="h-full">
      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-white dark:bg-slate-950 p-2 border-b">
          <select
            className="border p-1"
            value={state.level}
            onChange={(e) => update({ level: e.target.value })}
          >
            <option value="">All</option>
            <option value="info">info</option>
            <option value="warn">warn</option>
            <option value="error">error</option>
          </select>
          <input
            className="border p-1 flex-1 min-w-32"
            placeholder="search"
            value={state.q}
            onChange={(e) => update({ q: e.target.value })}
          />
          <select
            className="border p-1"
            value={state.time}
            onChange={(e) => update({ time: e.target.value })}
          >
            <option value="1h">1h</option>
            <option value="24h">24h</option>
          </select>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={state.live}
              onChange={(e) => update({ live: e.target.checked })}
            />
            Live Tail
          </label>
          <button
            className="border px-2 py-1"
            onClick={() => (stream.paused ? stream.resume() : stream.pause())}
          >
            {stream.paused ? 'Resume' : 'Pause'}
          </button>
          <button className="border px-2 py-1" onClick={() => stream.clear()}>
            Clear View
          </button>
          <button className="border px-2 py-1" onClick={onDownload}>
            Download
          </button>
        </div>
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="relative h-96 overflow-auto"
        >
          <div style={{ height: totalHeight }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              <DataTable
                columns={columns}
                data={visible}
                className="overflow-visible"
                getRowKey={(row) => row.id}
              />
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

export default function LogsPanel() {
  const [active, setActive] = useState<Source>('backend');
  const [state, setState] = useState<Record<Source, TabState>>({
    backend: { level: '', q: '', time: '1h', live: false, scroll: 0 },
    frontend: { level: '', q: '', time: '1h', live: false, scroll: 0 },
  });

  const update = (source: Source, v: Partial<TabState>) =>
    setState((s) => ({ ...s, [source]: { ...s[source], ...v } }));

  return (
    <Tabs value={active} onValueChange={(v) => setActive(v as Source)} className="h-full">
      <TabsList>
        {SOURCES.map((s) => (
          <TabsTrigger key={s} value={s} className="capitalize">
            {s}
          </TabsTrigger>
        ))}
      </TabsList>
      {SOURCES.map((s) => (
        <TabPane
          key={s}
          source={s}
          state={state[s]}
          update={(v) => update(s, v)}
          active={active === s}
        />
      ))}
    </Tabs>
  );
}

