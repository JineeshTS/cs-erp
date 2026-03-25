"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "./table";
import { Badge } from "./badge";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, Inbox } from "lucide-react";

// ── Column definition ────────────────────────────────────────────

export interface DataColumn<T = Record<string, unknown>> {
  /** Column key — used to access row[key] */
  key: string;
  /** Display header label */
  header: string;
  /** Whether this column is sortable (default: true) */
  sortable?: boolean;
  /** Custom render function */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** Column width hint (Tailwind class, e.g., "w-40") */
  width?: string;
  /** Hide on mobile (< md) */
  hideOnMobile?: boolean;
}

// ── Props ────────────────────────────────────────────────────────

interface DataTableProps<T = Record<string, unknown>> {
  /** Column definitions */
  columns: DataColumn<T>[];
  /** Array of data rows */
  data: T[];
  /** Key extractor for row identity (defaults to "id") */
  rowKey?: string | ((row: T) => string);
  /** Link builder — makes entire row clickable */
  rowLink?: (row: T) => string;
  /** Show loading skeleton */
  loading?: boolean;
  /** Number of skeleton rows to show (default: 5) */
  skeletonRows?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action button */
  emptyAction?: { label: string; href: string };
  /** Cursor for "Load More" pagination */
  nextCursor?: string | null;
  /** Callback when "Load More" is clicked */
  onLoadMore?: () => void;
  /** Whether more data is being loaded */
  loadingMore?: boolean;
}

// ── Sort helpers ─────────────────────────────────────────────────

type SortDir = "asc" | "desc" | null;

function sortData<T>(data: T[], key: string, dir: SortDir): T[] {
  if (!dir) return data;
  return [...data].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") {
      return dir === "asc" ? av - bv : bv - av;
    }
    const sa = String(av).toLowerCase();
    const sb = String(bv).toLowerCase();
    return dir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
  });
}

// ── Status badge renderer ────────────────────────────────────────

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  completed: "default",
  approved: "default",
  draft: "secondary",
  pending: "secondary",
  scheduled: "secondary",
  cancelled: "destructive",
  failed: "destructive",
  overdue: "destructive",
  suspended: "outline",
};

function defaultCellRenderer(value: unknown, key: string): React.ReactNode {
  if (value == null || value === "") return <span className="text-slate-300 dark:text-gray-600">—</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  // Auto-detect status-like fields
  if (key === "status" && typeof value === "string") {
    const variant = STATUS_COLORS[value.toLowerCase()] || "outline";
    return <Badge variant={variant}>{String(value)}</Badge>;
  }
  // Date fields
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return String(value);
}

// ── Component ────────────────────────────────────────────────────

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  rowKey = "id",
  rowLink,
  loading = false,
  skeletonRows = 5,
  emptyMessage = "No records found",
  emptyAction,
  nextCursor,
  onLoadMore,
  loadingMore = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const sortedData = useMemo(
    () => (sortKey ? sortData(data, sortKey, sortDir) : data),
    [data, sortKey, sortDir]
  );

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function getRowKey(row: T, index: number): string {
    if (typeof rowKey === "function") return rowKey(row);
    const val = (row as Record<string, unknown>)[rowKey];
    return val != null ? String(val) : String(index);
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.width}>
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-gray-700" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-gray-800" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 dark:border-gray-600">
        <Inbox className="h-10 w-10 text-slate-300 dark:text-gray-600" />
        <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">{emptyMessage}</p>
        {emptyAction && (
          <Link
            href={emptyAction.href}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {emptyAction.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-gray-800/50">
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              const canSort = col.sortable !== false;
              return (
                <TableHead
                  key={col.key}
                  className={cn(
                    col.width,
                    col.hideOnMobile && "hidden md:table-cell",
                    canSort && "cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-gray-800"
                  )}
                  onClick={canSort ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      {col.header}
                    </span>
                    {canSort && (
                      <span className="text-slate-300 dark:text-gray-600">
                        {isSorted && sortDir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-brand-500" />
                        ) : isSorted && sortDir === "desc" ? (
                          <ArrowDown className="h-3.5 w-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              );
            })}
            {rowLink && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => {
            const key = getRowKey(row, index);
            const rowContent = (
              <>
                {columns.map((col) => {
                  const value = (row as Record<string, unknown>)[col.key];
                  return (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "text-sm text-slate-700 dark:text-gray-300",
                        col.hideOnMobile && "hidden md:table-cell"
                      )}
                    >
                      {col.render ? col.render(value, row) : defaultCellRenderer(value, col.key)}
                    </TableCell>
                  );
                })}
                {rowLink && (
                  <TableCell className="text-right">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </TableCell>
                )}
              </>
            );

            if (rowLink) {
              return (
                <TableRow key={key} className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/50">
                  <td colSpan={columns.length + 1} className="p-0">
                    <Link href={rowLink(row)} className="contents">
                      <table className="w-full">
                        <tbody>
                          <tr>{rowContent}</tr>
                        </tbody>
                      </table>
                    </Link>
                  </td>
                </TableRow>
              );
            }

            return <TableRow key={key}>{rowContent}</TableRow>;
          })}
        </TableBody>
      </Table>

      {/* Load More pagination */}
      {nextCursor && onLoadMore && (
        <div className="border-t border-slate-200 p-3 text-center dark:border-gray-700">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 dark:text-brand-400"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
