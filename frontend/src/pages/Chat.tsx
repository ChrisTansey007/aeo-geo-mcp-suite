import { useState } from 'react';
import { createThreadApi, addMessageApi } from '../lib/api';

export default function Chat() {
  const [threadId, setThreadId] = useState<number | undefined>();
  const [msgs, setMsgs] = useState<{ id: string; role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  async function ensureThread() {
    if (!threadId) {
      const t = await createThreadApi(0, 'chat');
      setThreadId(t.id);
    }
  }

  async function send() {
    await ensureThread();
    if (threadId) {
      const m = await addMessageApi(threadId, 'user', input);
      const newMsg = { id: Date.now().toString(), role: m.role, content: m.content };
      setMsgs([...msgs, newMsg]);
      setInput('');
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">Chat</h1>
      <div className="space-y-2">
        {msgs.map((m) => (<div key={m.id}>{m.role}: {m.content}</div>))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} className="border" />
      <button onClick={send} className="ml-2 px-2 py-1 border">Send</button>
    </div>
  );
}
