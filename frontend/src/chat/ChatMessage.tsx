import { useState } from 'react';
import type { ChatMessage } from '../state/useChatStore';
import { useChatStore } from '../state/useChatStore';

interface Props {
  message: ChatMessage;
}

export default function ChatMessage({ message }: Props) {
  const [open, setOpen] = useState(false);
  const copy = useChatStore((s) => s.copyMessage);
  const retry = useChatStore((s) => s.retryMessage);
  const fork = useChatStore((s) => s.forkConversation);

  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <div className="font-bold w-20 text-right pr-2">
          {message.role === 'user' ? 'You' : 'Assistant'}
        </div>
        <div className="flex-1">
          <div className="whitespace-pre-wrap">{message.content}</div>
          {message.attachments && message.attachments.length > 0 && (
            <ul className="mt-2 text-sm text-blue-700">
              {message.attachments.map((a) => (
                <li key={a.id}>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.file.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {message.role === 'assistant' && (
            <div className="mt-1 flex gap-2 text-xs">
              <button onClick={() => copy(message.id)}>Copy</button>
              <button onClick={() => retry(message.id)}>Retry</button>
              <button onClick={() => fork(message.id)}>Fork</button>
              {(message.rationale || message.toolLogs) && (
                <button onClick={() => setOpen((o) => !o)}>
                  {open ? 'Hide logs' : 'Show logs'}
                </button>
              )}
            </div>
          )}
          {open && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              {message.rationale && (
                <pre className="mb-2 whitespace-pre-wrap">
                  {message.rationale}
                </pre>
              )}
              {message.toolLogs && (
                <pre className="whitespace-pre-wrap">{message.toolLogs}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

