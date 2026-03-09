import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendInfo {
  value: number;
  direction: "up" | "down" | "neutral";
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: TrendInfo;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("group rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  trend.direction === "up" && "text-emerald-600 dark:text-emerald-400",
                  trend.direction === "down" && "text-red-600 dark:text-red-400",
                  trend.direction === "neutral" && "text-slate-400 dark:text-slate-500"
                )}
              >
                {trend.direction === "up" && <ArrowUp className="h-3 w-3" />}
                {trend.direction === "down" && <ArrowDown className="h-3 w-3" />}
                {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
                {trend.direction === "neutral" ? "No change" : `${Math.abs(trend.value).toFixed(1)}%`}
              </span>
            )}
            {description && (
              <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
            )}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:group-hover:bg-brand-900/50">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
