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
    <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}
