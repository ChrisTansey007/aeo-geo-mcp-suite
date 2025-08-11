interface Props {
  onSelect: (command: string) => void | Promise<void>;
}

const tools = ['crawl', 'analyze', 'schema.lint', 'content.fix'];

export default function ToolsMenu({ onSelect }: Props) {
  return (
    <select
      onChange={(e) => {
        const val = e.target.value;
        if (val) {
          void onSelect(`/${val}`);
          e.target.value = '';
        }
      }}
      className="border rounded p-2"
    >
      <option value="">Tools</option>
      {tools.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

