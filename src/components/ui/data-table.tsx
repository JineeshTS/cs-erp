"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Inbox,
  Columns3,
  Check,
} from "lucide-react";

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
  /** Whether this column can be hidden via column toggle (default: true) */
  hideable?: boolean;
}

// ── Bulk action definition ───────────────────────────────────────

export interface BulkAction<T = Record<string, unknown>> {
  /** Unique action key */
  key: string;
  /** Display label */
  label: string;
  /** Action variant for styling */
  variant?: "default" | "destructive";
  /** Callback with selected rows */
  onAction: (selectedRows: T[]) => void | Promise<void>;
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
  /** Bulk actions — enables checkbox selection when provided */
  bulkActions?: BulkAction<T>[];
  /** Whether to show the column toggle button (default: false) */
  columnToggle?: boolean;
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

// ── Column toggle dropdown ───────────────────────────────────────

function ColumnToggleDropdown({
  columns,
  hiddenColumns,
  onToggle,
}: {
  columns: DataColumn[];
  hiddenColumns: Set<string>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const hideableColumns = columns.filter((c) => c.hideable !== false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <Columns3 className="h-3.5 w-3.5" />
        Columns
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {hideableColumns.map((col) => {
            const isVisible = !hiddenColumns.has(col.key);
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => onToggle(col.key)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border",
                    isVisible
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-300 dark:border-gray-600"
                  )}
                >
                  {isVisible && <Check className="h-3 w-3" />}
                </span>
                {col.header}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
  bulkActions,
  columnToggle = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const hasBulkActions = bulkActions && bulkActions.length > 0;

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c.key)),
    [columns, hiddenColumns]
  );

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

  const handleColumnToggle = useCallback((key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const allRowKeys = useMemo(
    () => sortedData.map((row, i) => getRowKey(row, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedData, rowKey]
  );

  const allSelected = allRowKeys.length > 0 && allRowKeys.every((k) => selectedKeys.has(k));
  const someSelected = allRowKeys.some((k) => selectedKeys.has(k));

  function handleSelectAll() {
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(allRowKeys));
    }
  }

  function handleSelectRow(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const selectedRows = useMemo(
    () => sortedData.filter((row, i) => selectedKeys.has(getRowKey(row, i))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedData, selectedKeys, rowKey]
  );

  // Column toggle toolbar (shown above table when enabled)
  const toolbar = columnToggle ? (
    <div className="flex items-center justify-end px-3 py-2">
      <ColumnToggleDropdown
        columns={columns as DataColumn[]}
        hiddenColumns={hiddenColumns}
        onToggle={handleColumnToggle}
      />
    </div>
  ) : null;

  // Bulk action bar (shown when rows are selected)
  const bulkBar = hasBulkActions && selectedKeys.size > 0 ? (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-brand-50 px-4 py-2 dark:border-gray-700 dark:bg-brand-950/20">
      <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
        {selectedKeys.size} selected
      </span>
      <div className="flex items-center gap-2">
        {bulkActions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => action.onAction(selectedRows)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium",
              action.variant === "destructive"
                ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                : "bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setSelectedKeys(new Set())}
        className="ml-auto text-xs text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Clear selection
      </button>
    </div>
  ) : null;

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-gray-700">
        {toolbar}
        <Table>
          <TableHeader>
            <TableRow>
              {hasBulkActions && <TableHead className="w-10" />}
              {visibleColumns.map((col) => (
                <TableHead key={col.key} className={col.width}>
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-gray-700" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {hasBulkActions && <TableCell><div className="h-4 w-4 animate-pulse rounded bg-slate-100 dark:bg-gray-800" /></TableCell>}
                {visibleColumns.map((col) => (
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
      <div className="rounded-lg border border-slate-200 dark:border-gray-700">
        {toolbar}
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
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-gray-700">
      {toolbar}
      {bulkBar}
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-gray-800/50">
            {hasBulkActions && (
              <TableHead className="w-10 px-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                />
              </TableHead>
            )}
            {visibleColumns.map((col) => {
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
            const isSelected = selectedKeys.has(key);
            const cells = (
              <>
                {visibleColumns.map((col) => {
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

            const checkboxCell = hasBulkActions ? (
              <TableCell className="w-10 px-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectRow(key)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                />
              </TableCell>
            ) : null;

            if (rowLink) {
              const colSpan = visibleColumns.length + (hasBulkActions ? 1 : 0) + 1;
              return (
                <TableRow
                  key={key}
                  className={cn(
                    "group cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/50",
                    isSelected && "bg-brand-50/50 dark:bg-brand-950/10"
                  )}
                >
                  <td colSpan={colSpan} className="p-0">
                    <Link href={rowLink(row)} className="contents">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            {checkboxCell}
                            {cells}
                          </tr>
                        </tbody>
                      </table>
                    </Link>
                  </td>
                </TableRow>
              );
            }

            return (
              <TableRow
                key={key}
                className={cn(isSelected && "bg-brand-50/50 dark:bg-brand-950/10")}
              >
                {checkboxCell}
                {cells}
              </TableRow>
            );
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
