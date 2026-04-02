"use client";

import { Clock, FileText, ShieldCheck, Activity, ClipboardCheck, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityCategory = "booking" | "customs" | "process" | "approval" | "event";

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  category: ActivityCategory;
}

interface ActivityFeedProps {
  items?: ActivityItem[];
}

const categoryConfig: Record<ActivityCategory, { dot: string; icon: typeof FileText }> = {
  booking: { dot: "bg-blue-500", icon: FileText },
  customs: { dot: "bg-amber-500", icon: ShieldCheck },
  process: { dot: "bg-violet-500", icon: Workflow },
  approval: { dot: "bg-emerald-500", icon: ClipboardCheck },
  event: { dot: "bg-slate-400", icon: Activity },
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Clock className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">No recent activity</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Activity will appear here as you use the system
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">{items.length} events</span>
      </div>
      <ul className="mt-4 space-y-0.5">
        {items.map((item) => {
          const cfg = categoryConfig[item.category];
          const Icon = cfg.icon;
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="mt-1 flex items-center gap-2">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", cfg.dot)} />
                <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">{item.message}</p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{item.timestamp}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
