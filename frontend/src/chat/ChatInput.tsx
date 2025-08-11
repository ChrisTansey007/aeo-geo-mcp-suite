import { useState, FormEvent } from 'react';
import { useChatStore } from '../state/useChatStore';
import ToolsMenu from './ToolsMenu';

export default function ChatInput() {
  const [value, setValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const send = useChatStore((s) => s.sendMessage);
  const runCommand = useChatStore((s) => s.runCommand);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() && files.length === 0) return;
    if (value.startsWith('/')) {
      await runCommand(value, files);
    } else {
      await send(value, files);
    }
    setValue('');
    setFiles([]);
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 p-2 border-t">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 border rounded p-2"
        placeholder="Type message or /command"
      />
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />
      <ToolsMenu onSelect={(cmd) => runCommand(cmd)} />
      <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded">
        Send
      </button>
    </form>
  );
}

