import { create } from 'zustand';

export interface Attachment {
  id: string;
  file: File;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  rationale?: string;
  toolLogs?: string;
  status?: 'streaming' | 'done' | 'error';
}

interface ChatState {
  messages: ChatMessage[];
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  copyMessage: (id: string) => void;
  retryMessage: (id: string) => Promise<void>;
  forkConversation: (id: string) => void;
  runCommand: (command: string, attachments?: File[]) => Promise<void>;
}

async function streamResponse(
  response: Response,
  onChunk: (chunk: string) => void
) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  async sendMessage(content, files = []) {
    const userId = crypto.randomUUID();
    const attachments = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: typeof window !== 'undefined' ? URL.createObjectURL(file) : '',
    }));
    set((s) => ({ messages: [...s.messages, { id: userId, role: 'user', content, attachments }] }));

    const assistantId = crypto.randomUUID();
    set((s) => ({ messages: [...s.messages, { id: assistantId, role: 'assistant', content: '', status: 'streaming' }] }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: get().messages.map(({ role, content }) => ({ role, content })) }),
      });

      let full = '';
      await streamResponse(res, (chunk) => {
        full += chunk;
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantId ? { ...m, content: full } : m
          ),
        }));
      });

      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                status: 'done',
                rationale: res.headers.get('x-rationale') || undefined,
                toolLogs: res.headers.get('x-tool-log') || undefined,
              }
            : m
        ),
      }));
    } catch (err) {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                status: 'error',
                content: err instanceof Error ? err.message : String(err),
              }
            : m
        ),
      }));
    }
  },
  copyMessage(id) {
    const msg = get().messages.find((m) => m.id === id);
    if (msg && typeof navigator !== 'undefined') {
      void navigator.clipboard.writeText(msg.content);
    }
  },
  async retryMessage(id) {
    const msg = get().messages.find((m) => m.id === id);
    if (msg && msg.role === 'assistant') {
      const idx = get().messages.findIndex((m) => m.id === id);
      const prev = get().messages[idx - 1];
      if (prev && prev.role === 'user') {
        await get().sendMessage(prev.content, prev.attachments?.map((a) => a.file));
      }
    }
  },
  forkConversation(id) {
    const idx = get().messages.findIndex((m) => m.id === id);
    if (idx >= 0) {
      set((s) => ({ messages: s.messages.slice(0, idx + 1) }));
    }
  },
  async runCommand(command, attachments = []) {
    const [cmd, ...rest] = command.replace(/^\//, '').split(' ');
    const input = rest.join(' ');
    const tools = ['crawl', 'analyze', 'schema.lint', 'content.fix'];
    if (tools.includes(cmd)) {
      const userId = crypto.randomUUID();
      set((s) => ({ messages: [...s.messages, { id: userId, role: 'user', content: `/${cmd} ${input}` }] }));
      const assistantId = crypto.randomUUID();
      set((s) => ({ messages: [...s.messages, { id: assistantId, role: 'assistant', content: '', status: 'streaming' }] }));
      try {
        const res = await fetch(`/api/tools/${cmd}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        });
        let full = '';
        await streamResponse(res, (chunk) => {
          full += chunk;
          set((s) => ({ messages: s.messages.map((m) => (m.id === assistantId ? { ...m, content: full } : m)) }));
        });
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  status: 'done',
                  rationale: res.headers.get('x-rationale') || undefined,
                  toolLogs: res.headers.get('x-tool-log') || undefined,
                }
              : m
          ),
        }));
      } catch (err) {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  status: 'error',
                  content: err instanceof Error ? err.message : String(err),
                }
              : m
          ),
        }));
      }
    } else if (cmd === 'clear') {
      set({ messages: [] });
    } else {
      await get().sendMessage(command, attachments);
    }
  },
}));
