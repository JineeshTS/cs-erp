import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("group rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
