"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface PipelineStage {
  label: string;
  status: string;
  count: number;
  color: string;
}

interface BookingPipelineFunnelProps {
  stages: PipelineStage[];
  cancelledCount: number;
}

export function BookingPipelineFunnel({ stages, cancelledCount }: BookingPipelineFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const total = stages.reduce((sum, s) => sum + s.count, 0) + cancelledCount;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Booking Pipeline</h3>
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">No bookings yet</p>
          <Link
            href="/customer-portal/bookings/new"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Create your first booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Booking Pipeline</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">{total} total</span>
      </div>

      <div className="mt-4 space-y-3">
        {stages.map((stage, i) => {
          const prevCount = i > 0 ? stages[i - 1].count : 0;
          const conversionRate = i > 0 && prevCount > 0
            ? Math.round((stage.count / prevCount) * 100)
            : null;
          const barWidth = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 4) : 4;

          return (
            <Link
              key={stage.status}
              href={`/customer-portal/bookings?status=${stage.status}`}
              className="group block"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">{stage.label}</span>
                <div className="flex items-center gap-2">
                  {conversionRate !== null && (
                    <span className="text-slate-400 dark:text-slate-500">
                      {conversionRate}% from {stages[i - 1].label}
                    </span>
                  )}
                  <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {stage.count.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="h-7 w-full rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-md transition-all group-hover:opacity-80",
                    stage.color === "slate" && "bg-slate-400 dark:bg-slate-500",
                    stage.color === "blue" && "bg-blue-500 dark:bg-blue-400",
                    stage.color === "amber" && "bg-amber-500 dark:bg-amber-400",
                    stage.color === "emerald" && "bg-emerald-500 dark:bg-emerald-400"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {cancelledCount > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <Link
            href="/customer-portal/bookings?status=cancelled"
            className="flex items-center justify-between text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <span>Cancelled</span>
            <span className="tabular-nums">{cancelledCount.toLocaleString()}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
