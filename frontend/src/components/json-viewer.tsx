import { cn } from "./utils"

export interface JSONViewerProps {
  data: unknown
  className?: string
}

export function JSONViewer({ data, className }: JSONViewerProps) {
  return (
    <pre
      className={cn(
        "overflow-auto rounded-md bg-slate-100 p-4 text-xs text-slate-900 dark:bg-slate-900 dark:text-slate-50",
        className
      )}
      role="group"
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
