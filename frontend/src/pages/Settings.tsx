import { useEffect, useState } from 'react';
import { Input } from '../components/input';
import { Button } from '../components/button';

interface Prefs {
  apiKey: string;
  model: string;
  engine: string;
  theme: 'system' | 'dark';
  telemetry: boolean;
}

const defaultPrefs: Prefs = {
  apiKey: '',
  model: 'gpt-4',
  engine: 'stable',
  theme: 'system',
  telemetry: false,
};

export default function Settings() {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [errors, setErrors] = useState<{ apiKey?: string }>({});

  useEffect(() => {
    const stored = localStorage.getItem('settings');
    if (stored) {
      try {
        setPrefs({ ...defaultPrefs, ...JSON.parse(stored) });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    const dark =
      prefs.theme === 'dark' ||
      (prefs.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  }, [prefs.theme]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setPrefs((p) => ({
        ...p,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setPrefs((p) => ({
        ...p,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { apiKey?: string } = {};
    if (!prefs.apiKey.trim()) {
      errs.apiKey = 'API key is required';
    }
    setErrors(errs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium">
          API Key
        </label>
        <Input
          id="apiKey"
          name="apiKey"
          type="password"
          value={prefs.apiKey}
          onChange={handleChange}
          aria-describedby="apiKey-desc"
          required
        />
        <p id="apiKey-desc" className="text-xs text-slate-500">
          Key used for API calls.
        </p>
        {errors.apiKey && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.apiKey}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-medium">
          Model
        </label>
        <select
          id="model"
          name="model"
          value={prefs.model}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5">GPT-3.5</option>
        </select>
      </div>
      <div>
        <label htmlFor="engine" className="block text-sm font-medium">
          Engine
        </label>
        <select
          id="engine"
          name="engine"
          value={prefs.engine}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="stable">Stable</option>
          <option value="experimental">Experimental</option>
        </select>
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Theme</legend>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="theme"
              value="system"
              checked={prefs.theme === 'system'}
              onChange={handleChange}
            />
            <span>System</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={prefs.theme === 'dark'}
              onChange={handleChange}
            />
            <span>Dark</span>
          </label>
        </div>
      </fieldset>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="telemetry"
            checked={prefs.telemetry}
            onChange={handleChange}
          />
          <span>Share anonymous telemetry</span>
        </label>
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
