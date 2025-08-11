import * as React from "react"
import { cn } from "./utils"

export interface Column<T> {
  key: keyof T
  header: React.ReactNode
  render?: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  className?: string
  getRowKey?: (row: T, index: number) => string
}

export function DataTable<T>({ columns, data, className, getRowKey }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm" role="table">
        <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} scope="col" className="p-2 text-left font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            // Generate a key for the row
            // Use the provided getRowKey function if available, otherwise create a composite key
            const rowKey = getRowKey 
              ? getRowKey(row, i) 
              : `${JSON.stringify(row)}-${i}`;
              
            return (
              <tr
                key={rowKey}
                className="border-b last:border-none hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="p-2" role="cell">
                    {col.render ? col.render(row) : String(row[col.key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}
