import { redirect } from "next/navigation";
import { Ship, FileText, Container, FileArchive } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back. Here is an overview of your operations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Vessels"
          value={0}
          icon={Ship}
          description="Coming soon"
        />
        <StatsCard
          title="Open Bookings"
          value={0}
          icon={FileText}
          description="Coming soon"
        />
        <StatsCard
          title="Containers in Transit"
          value={0}
          icon={Container}
          description="Coming soon"
        />
        <StatsCard
          title="Pending Customs"
          value={0}
          icon={FileArchive}
          description="Coming soon"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <ActivityFeed />

        {/* Quick Actions */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "New Booking", href: "/bookings-hub", icon: FileText },
              { label: "Track Container", href: "/containers-hub", icon: Container },
              { label: "Vessel Schedule", href: "/vessels-hub", icon: Ship },
              { label: "AI Assistant", href: "/admin-hub", icon: FileArchive },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <action.icon className="h-4 w-4 text-gray-400" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
