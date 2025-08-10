import * as React from "react"
import { cn } from "./utils"
import { Badge } from "./badge"

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  removable?: boolean
  onRemove?: () => void
}

export function Chip({
  children,
  className,
  removable,
  onRemove,
  ...props
}: ChipProps) {
  return (
    <Badge
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </Badge>
  )
}
