import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAnalyze } from '../store/useRunStore';

export default function AppShell() {
  const nav = useNavigate();
  const [url, setUrl] = useState('https://example.com');
  const tools = [
    'title_meta',
    'robots_canonical',
    'headings',
    'images_alt',
    'links',
    'structured_data',
    'open_graph_twitter',
    'wordcount_keywords',
    'favicon_apple',
    'lang_charset',
    'sitemap_robots',
  ];
  const analyze = useAnalyze(tools);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      alert(detail.title);
    };
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, []);

  function onRun() {
    analyze.mutate(url, {
      onSuccess: () => nav('/runs/latest'),
    });
  }

  return (
    <div className="grid grid-cols-[240px_1fr] grid-rows-[56px_1fr] min-h-screen">
      <aside className="row-span-2 bg-neutral-900/60 border-r border-neutral-800 p-3">
        <div className="font-semibold mb-3">AEO/GEO/SEO</div>
        <nav className="space-y-2">
          <Link className="block hover:underline" to="/">Dashboard</Link>
          <Link className="block hover:underline" to="/history">History</Link>
          <Link className="block hover:underline" to="/settings">Settings</Link>
          <Link className="block hover:underline" to="/logs">Logs</Link>
        </nav>
      </aside>
      <header className="flex items-center gap-2 px-4 border-b border-neutral-800">
        <input
          aria-label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
          placeholder="https://…"
        />
        <button
          onClick={onRun}
          disabled={analyze.isPending}
          className="rounded bg-indigo-600 px-3 py-2 disabled:opacity-50"
        >
          {analyze.isPending ? 'Running…' : 'Run'}
        </button>
      </header>
      {analyze.error ? (
        <div className="px-4 py-2 text-red-500">
          {(analyze.error as Error).message}
        </div>
      ) : null}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
