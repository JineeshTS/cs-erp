"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface EntityTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  baseHref: string;
  emptyMessage?: string;
}

export function EntityTable({
  columns,
  data,
  baseHref,
  emptyMessage = "No records found",
}: EntityTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-white px-8 py-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-start font-medium text-gray-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id as string}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              {columns.map((col, i) => (
                <td key={col.key} className="px-4 py-3">
                  {i === 0 ? (
                    <Link
                      href={`${baseHref}/${row.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "")}
                    </Link>
                  ) : col.render ? (
                    col.render(row[col.key], row)
                  ) : col.key === "status" ? (
                    <Badge
                      variant={
                        row[col.key] === "active" ? "success" : "secondary"
                      }
                    >
                      {String(row[col.key] ?? "")}
                    </Badge>
                  ) : (
                    <span className="text-gray-600">
                      {String(row[col.key] ?? "-")}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
