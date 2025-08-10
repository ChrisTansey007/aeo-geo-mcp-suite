import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useRunStore } from '../store/runStore';


export default function AppShell() {
  const nav = useNavigate();
  const [url, setUrl] = useState('https://example.com');
  const doAnalyze = useRunStore(s => s.doAnalyze);
  const analyzing = useRunStore(s => s.analyzing);
  const error = useRunStore(s => s.error);

  async function onRun() {
    // For now, run all tools; you can customize this list
    const tools = [
      'title_meta', 'robots_canonical', 'headings', 'images_alt', 'links',
      'structured_data', 'open_graph_twitter', 'wordcount_keywords',
      'favicon_apple', 'lang_charset', 'sitemap_robots'
    ];
    await doAnalyze(url, tools);
    nav('/runs/latest');
  }

  return (
    <div className="grid grid-cols-[240px_1fr] grid-rows-[56px_1fr] min-h-screen">
      <aside className="row-span-2 bg-neutral-900/60 border-r border-neutral-800 p-3">
        <div className="font-semibold mb-3">AEO/GEO/SEO</div>
        <nav className="space-y-2">
          <Link className="block hover:underline" to="/">Dashboard</Link>
          <Link className="block hover:underline" to="/history">History</Link>
          <Link className="block hover:underline" to="/settings">Settings</Link>
        </nav>
      </aside>
      <header className="flex items-center gap-2 px-4 border-b border-neutral-800">
        <input aria-label="URL" value={url} onChange={e=>setUrl(e.target.value)}
          className="flex-1 bg-neutral-900 rounded px-3 py-2 outline-none border border-neutral-800" placeholder="https://…" />
        <button onClick={onRun} disabled={analyzing}
          className="px-3 py-2 rounded bg-indigo-600 disabled:opacity-50">{analyzing ? 'Running…' : 'Run'}</button>
      </header>
      {error && <div className="text-red-500 px-4 py-2">{error}</div>}
      <main className="p-4"><Outlet/></main>
    </div>
  );
}
