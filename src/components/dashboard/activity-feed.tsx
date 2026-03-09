import { Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
}

interface ActivityFeedProps {
  items?: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Clock className="h-6 w-6 text-slate-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">No recent activity</p>
          <p className="mt-1 text-xs text-slate-400">
            Activity will appear here as you use the system
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
      <ul className="mt-4 space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700">{item.message}</p>
              <p className="mt-0.5 text-xs text-slate-400">{item.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
