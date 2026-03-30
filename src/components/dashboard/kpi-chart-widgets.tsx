"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChartCard } from "@/components/ui/charts";

/* ────────── Types ────────── */

interface TrendInfo {
  value: number;
  direction: "up" | "down" | "neutral";
}

interface KpiWidgetProps {
  title: string;
  value: string | number;
  trend?: TrendInfo;
  trendLabel?: string;
  chartData?: Record<string, unknown>[];
  chartType?: "area";
}

/* ────────── Sparkline (inline mini chart) ────────── */

function MiniSparkline({
  data,
  dataKey = "value",
  color = "hsl(221, 83%, 53%)",
}: {
  data: Record<string, unknown>[];
  dataKey?: string;
  color?: string;
}) {
  if (data.length === 0) return null;

  // Simple SVG sparkline — keeps it lightweight
  const values = data.map((d) => Number(d[dataKey] ?? 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 120;
  const height = 32;

  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="mt-2">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────── KPI Widget ────────── */

export function KpiWidget({
  title,
  value,
  trend,
  trendLabel,
  chartData,
}: KpiWidgetProps) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </p>
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
            {trendLabel ?? (trend.direction === "neutral"
              ? "No change"
              : `${Math.abs(trend.value).toFixed(1)}%`)}
          </span>
        )}
      </div>
      {chartData && chartData.length > 0 && (
        <MiniSparkline data={chartData} />
      )}
    </div>
  );
}

/* ────────── KPI Widget with full chart ────────── */

export function KpiChartWidget({
  title,
  value,
  trend,
  trendLabel,
  chartData,
  chartDataKey = "value",
  chartCategoryKey = "name",
}: KpiWidgetProps & {
  chartDataKey?: string;
  chartCategoryKey?: string;
}) {
  return (
    <div className="space-y-3">
      <KpiWidget
        title={title}
        value={value}
        trend={trend}
        trendLabel={trendLabel}
      />
      {chartData && chartData.length > 0 && (
        <AreaChartCard
          title=""
          data={chartData}
          dataKey={chartDataKey}
          categoryKey={chartCategoryKey}
          height={180}
        />
      )}
    </div>
  );
}

/* ────────── Drill-Down Link ────────── */

interface DrillDownLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function DrillDownLink({ href, children, className }: DrillDownLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-xl",
        className
      )}
    >
      {children}
    </Link>
  );
}
