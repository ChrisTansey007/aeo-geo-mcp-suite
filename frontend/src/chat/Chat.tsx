import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChatStore } from '../state/useChatStore';

export default function Chat() {
  const messages = useChatStore((s) => s.messages);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </div>
      <ChatInput />
    </div>
  );
}

