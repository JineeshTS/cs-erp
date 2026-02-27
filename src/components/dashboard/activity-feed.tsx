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
      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No recent activity</p>
          <p className="text-xs text-gray-400">
            Activity will appear here as you use the system
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 text-sm">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            <div>
              <p className="text-gray-700">{item.message}</p>
              <p className="text-xs text-gray-400">{item.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
