import { redirect } from "next/navigation";
import { Ship, Container, FileText, Anchor } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChartCard, LineChartCard } from "@/components/ui/charts";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  vessels,
  cspPortalBookings,
  cspShipmentTracking,
  odmBillsOfLading,
} from "@/db/schema";
import { eq, and, isNull, notInArray, count, sql, gte } from "drizzle-orm";

/* ────────── helpers ────────── */

function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/* ────────── page ────────── */

export default async function OperationsDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tid = session.tenantId;
  const now = new Date();
  const thisMonth = monthStart(now);

  const results = await Promise.allSettled([
    // 0: Active vessels
    db.select({ count: count() }).from(vessels)
      .where(and(eq(vessels.tenantId, tid), eq(vessels.status, "active"), isNull(vessels.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 1: Booking pipeline counts by status
    db.select({ status: cspPortalBookings.status, count: count() })
      .from(cspPortalBookings)
      .where(and(eq(cspPortalBookings.tenantId, tid), isNull(cspPortalBookings.deletedAt)))
      .groupBy(cspPortalBookings.status),

    // 2: Containers in transit
    db.select({ count: count() }).from(cspShipmentTracking)
      .where(and(eq(cspShipmentTracking.tenantId, tid), eq(cspShipmentTracking.currentStatus, "in_transit"), isNull(cspShipmentTracking.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 3: Containers delivered this month
    db.select({ count: count() }).from(cspShipmentTracking)
      .where(and(eq(cspShipmentTracking.tenantId, tid), eq(cspShipmentTracking.currentStatus, "delivered"), isNull(cspShipmentTracking.deletedAt), gte(cspShipmentTracking.updatedAt, thisMonth)))
      .then((r) => r[0]?.count ?? 0),

    // 4: BLs issued this month
    db.select({ count: count() }).from(odmBillsOfLading)
      .where(and(eq(odmBillsOfLading.tenantId, tid), isNull(odmBillsOfLading.deletedAt), gte(odmBillsOfLading.createdAt, thisMonth)))
      .then((r) => r[0]?.count ?? 0),

    // 5: Open bookings
    db.select({ count: count() }).from(cspPortalBookings)
      .where(and(eq(cspPortalBookings.tenantId, tid), notInArray(cspPortalBookings.status, ["cancelled", "completed"]), isNull(cspPortalBookings.deletedAt)))
      .then((r) => r[0]?.count ?? 0),
  ]);

  function val<T>(index: number, fallback: T): T {
    const r = results[index];
    return r.status === "fulfilled" ? (r.value as T) : fallback;
  }

  const vesselCount = val<number>(0, 0);
  const pipelineRaw = val<Array<{ status: string; count: number }>>(1, []);
  const transitCount = val<number>(2, 0);
  const deliveredMtd = val<number>(3, 0);
  const blsIssuedMtd = val<number>(4, 0);
  const openBookings = val<number>(5, 0);

  // Build pipeline bar chart data
  const statusLabels: Record<string, string> = {
    draft: "Draft",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  const pipelineMap = new Map(pipelineRaw.map((r) => [r.status, r.count]));
  const pipelineChartData = ["draft", "confirmed", "in_progress", "completed"].map((s) => ({
    status: statusLabels[s] ?? s,
    count: pipelineMap.get(s) ?? 0,
  }));

  // Container status chart data
  const containerChartData = [
    { status: "In Transit", count: transitCount },
    { status: "Delivered MTD", count: deliveredMtd },
  ];

  const kpis = [
    { title: "Active Vessels", value: formatCompact(vesselCount), icon: Ship, href: "/vessels-hub" },
    { title: "Open Bookings", value: formatCompact(openBookings), icon: FileText, href: "/bookings-hub" },
    { title: "Containers in Transit", value: formatCompact(transitCount), icon: Container, href: "/tracking" },
    { title: "BLs Issued MTD", value: formatCompact(blsIssuedMtd), icon: Anchor, href: "/operations-documentation" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Operations Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Vessel, booking, and container operations overview.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.title} href={kpi.href} className="block">
            <StatsCard title={kpi.title} value={kpi.value} icon={kpi.icon} />
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Booking Pipeline"
          data={pipelineChartData}
          dataKey="count"
          categoryKey="status"
          color="hsl(221, 83%, 53%)"
        />
        <BarChartCard
          title="Container Status"
          data={containerChartData}
          dataKey="count"
          categoryKey="status"
          color="hsl(160, 84%, 39%)"
        />
      </div>
    </div>
  );
}
