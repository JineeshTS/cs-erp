import { redirect } from "next/navigation";
import { Ship, FileText, Container, FileArchive } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  vessels,
  cspPortalBookings,
  cspShipmentTracking,
  ccrImportClearances,
} from "@/db/schema";
import { eq, and, isNull, notInArray, count, desc } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tid = session.tenantId;

  const [
    vesselCount,
    bookingCount,
    transitCount,
    customsCount,
    recentBookings,
    recentClearances,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(vessels)
      .where(
        and(
          eq(vessels.tenantId, tid),
          eq(vessels.status, "active"),
          isNull(vessels.deletedAt)
        )
      )
      .then((r) => r[0]?.count ?? 0),
    db
      .select({ count: count() })
      .from(cspPortalBookings)
      .where(
        and(
          eq(cspPortalBookings.tenantId, tid),
          notInArray(cspPortalBookings.status, ["cancelled", "completed"]),
          isNull(cspPortalBookings.deletedAt)
        )
      )
      .then((r) => r[0]?.count ?? 0),
    db
      .select({ count: count() })
      .from(cspShipmentTracking)
      .where(
        and(
          eq(cspShipmentTracking.tenantId, tid),
          eq(cspShipmentTracking.currentStatus, "in_transit"),
          isNull(cspShipmentTracking.deletedAt)
        )
      )
      .then((r) => r[0]?.count ?? 0),
    db
      .select({ count: count() })
      .from(ccrImportClearances)
      .where(
        and(
          eq(ccrImportClearances.tenantId, tid),
          notInArray(ccrImportClearances.status, ["cleared", "released"]),
          isNull(ccrImportClearances.deletedAt)
        )
      )
      .then((r) => r[0]?.count ?? 0),
    db
      .select({
        id: cspPortalBookings.id,
        ref: cspPortalBookings.bookingRef,
        status: cspPortalBookings.status,
        createdAt: cspPortalBookings.createdAt,
      })
      .from(cspPortalBookings)
      .where(
        and(
          eq(cspPortalBookings.tenantId, tid),
          isNull(cspPortalBookings.deletedAt)
        )
      )
      .orderBy(desc(cspPortalBookings.createdAt))
      .limit(5),
    db
      .select({
        id: ccrImportClearances.id,
        ref: ccrImportClearances.clearanceRef,
        status: ccrImportClearances.status,
        createdAt: ccrImportClearances.createdAt,
      })
      .from(ccrImportClearances)
      .where(
        and(
          eq(ccrImportClearances.tenantId, tid),
          isNull(ccrImportClearances.deletedAt)
        )
      )
      .orderBy(desc(ccrImportClearances.createdAt))
      .limit(5),
  ]);

  const activityItems = [
    ...recentBookings.map((b) => ({
      id: b.id,
      message: `Booking ${b.ref} — ${b.status}`,
      timestamp: formatRelativeTime(b.createdAt),
    })),
    ...recentClearances.map((c) => ({
      id: c.id,
      message: `Customs ${c.ref} — ${c.status}`,
      timestamp: formatRelativeTime(c.createdAt),
    })),
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back. Here is an overview of your operations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Vessels"
          value={vesselCount}
          icon={Ship}
          description="Vessel Management"
        />
        <StatsCard
          title="Open Bookings"
          value={bookingCount}
          icon={FileText}
          description="Bookings & Sales"
        />
        <StatsCard
          title="Containers in Transit"
          value={transitCount}
          icon={Container}
          description="Shipment Tracking"
        />
        <StatsCard
          title="Pending Customs"
          value={customsCount}
          icon={FileArchive}
          description="Customs Compliance"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <ActivityFeed items={activityItems.length > 0 ? activityItems : undefined} />

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
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
                className="group flex items-center gap-3 rounded-lg border border-slate-200/60 p-3.5 text-sm font-medium text-slate-700 transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand-100 group-hover:text-brand-600">
                  <action.icon className="h-4 w-4" />
                </div>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
