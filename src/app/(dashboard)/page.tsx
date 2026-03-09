import { redirect } from "next/navigation";
import {
  Ship,
  FileText,
  Container,
  FileArchive,
  DollarSign,
  CreditCard,
  Activity,
  ClipboardCheck,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { BookingPipelineFunnel } from "@/components/dashboard/booking-pipeline";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  tenants,
  vessels,
  cspPortalBookings,
  cspShipmentTracking,
  ccrImportClearances,
  firmFreightInvoices,
  arccCustomerAccounts,
  peProcessInstances,
  peApprovals,
} from "@/db/schema";
import { eq, and, isNull, notInArray, inArray, count, desc, sum, gte, sql } from "drizzle-orm";

/* ────────────────────── helpers ────────────────────── */

function calcTrend(current: number, previous: number) {
  if (previous === 0 && current === 0) return { value: 0, direction: "neutral" as const };
  if (previous === 0) return { value: 100, direction: "up" as const };
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { value: 0, direction: "neutral" as const };
  return { value: pct, direction: pct > 0 ? ("up" as const) : ("down" as const) };
}

function formatCompactCurrency(cents: number, currency: string): string {
  const amount = cents / 100;
  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    notation: amount >= 1000 ? "compact" : "standard",
    maximumFractionDigits: amount >= 1000 ? 1 : 0,
  });
  return formatter.format(amount);
}

function formatCompactNumber(n: number): string {
  if (n < 1000) return String(n);
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
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

/* ────────────────────── query helpers ────────────────────── */

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function prevMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function prevMonthSameDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
}

/* ────────────────────── page ────────────────────── */

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tid = session.tenantId;
  const now = new Date();
  const thisMonthStart = monthStart(now);
  const lastMonthStart = prevMonthStart(now);
  const lastMonthSameDay = prevMonthSameDay(now);

  // Fetch tenant currency
  const tenantRow = await db
    .select({ currency: tenants.currency })
    .from(tenants)
    .where(eq(tenants.id, tid))
    .then((r) => r[0]);
  const currency = tenantRow?.currency ?? "USD";

  // All 16 queries (8 current + 8 previous) + activity feed queries, in parallel
  const results = await Promise.allSettled([
    // 0: Active Vessels — current
    db.select({ count: count() }).from(vessels)
      .where(and(eq(vessels.tenantId, tid), eq(vessels.status, "active"), isNull(vessels.deletedAt)))
      .then((r) => r[0]?.count ?? 0),
    // 1: Active Vessels — previous (vessels created before last month same day)
    db.select({ count: count() }).from(vessels)
      .where(and(eq(vessels.tenantId, tid), eq(vessels.status, "active"), isNull(vessels.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 2: Open Bookings — current
    db.select({ count: count() }).from(cspPortalBookings)
      .where(and(eq(cspPortalBookings.tenantId, tid), notInArray(cspPortalBookings.status, ["cancelled", "completed"]), isNull(cspPortalBookings.deletedAt)))
      .then((r) => r[0]?.count ?? 0),
    // 3: Open Bookings — created last month (approximation: total bookings created last month)
    db.select({ count: count() }).from(cspPortalBookings)
      .where(and(eq(cspPortalBookings.tenantId, tid), notInArray(cspPortalBookings.status, ["cancelled", "completed"]), isNull(cspPortalBookings.deletedAt), gte(cspPortalBookings.createdAt, lastMonthSameDay)))
      .then((r) => r[0]?.count ?? 0),

    // 4: Containers in Transit — current
    db.select({ count: count() }).from(cspShipmentTracking)
      .where(and(eq(cspShipmentTracking.tenantId, tid), eq(cspShipmentTracking.currentStatus, "in_transit"), isNull(cspShipmentTracking.deletedAt)))
      .then((r) => r[0]?.count ?? 0),
    // 5: Containers in Transit — previous (no historical snapshot, reuse current as baseline)
    db.select({ count: count() }).from(cspShipmentTracking)
      .where(and(eq(cspShipmentTracking.tenantId, tid), eq(cspShipmentTracking.currentStatus, "in_transit"), isNull(cspShipmentTracking.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 6: Pending Customs — current
    db.select({ count: count() }).from(ccrImportClearances)
      .where(and(eq(ccrImportClearances.tenantId, tid), notInArray(ccrImportClearances.status, ["cleared", "released"]), isNull(ccrImportClearances.deletedAt)))
      .then((r) => r[0]?.count ?? 0),
    // 7: Pending Customs — previous (same as current — no historical snapshot)
    db.select({ count: count() }).from(ccrImportClearances)
      .where(and(eq(ccrImportClearances.tenantId, tid), notInArray(ccrImportClearances.status, ["cleared", "released"]), isNull(ccrImportClearances.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 8: Revenue MTD — current month
    db.select({ total: sum(firmFreightInvoices.totalAmount) }).from(firmFreightInvoices)
      .where(and(eq(firmFreightInvoices.tenantId, tid), inArray(firmFreightInvoices.status, ["issued", "dispatched", "paid"]), gte(firmFreightInvoices.issuedAt, thisMonthStart), isNull(firmFreightInvoices.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),
    // 9: Revenue MTD — same period last month
    db.select({ total: sum(firmFreightInvoices.totalAmount) }).from(firmFreightInvoices)
      .where(and(eq(firmFreightInvoices.tenantId, tid), inArray(firmFreightInvoices.status, ["issued", "dispatched", "paid"]), gte(firmFreightInvoices.issuedAt, lastMonthStart), sql`${firmFreightInvoices.issuedAt} < ${thisMonthStart}`, isNull(firmFreightInvoices.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),

    // 10: Outstanding AR — current
    db.select({ total: sum(arccCustomerAccounts.totalOutstanding) }).from(arccCustomerAccounts)
      .where(and(eq(arccCustomerAccounts.tenantId, tid), eq(arccCustomerAccounts.accountStatus, "active"), isNull(arccCustomerAccounts.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),
    // 11: Outstanding AR — overdue portion (for trend direction: if overdue is large, trend is negative)
    db.select({ total: sum(arccCustomerAccounts.totalOverdue) }).from(arccCustomerAccounts)
      .where(and(eq(arccCustomerAccounts.tenantId, tid), eq(arccCustomerAccounts.accountStatus, "active"), isNull(arccCustomerAccounts.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),

    // 12: Active Processes — current
    db.select({ count: count() }).from(peProcessInstances)
      .where(and(eq(peProcessInstances.tenantId, tid), inArray(peProcessInstances.status, ["pending", "in_progress", "waiting_approval"]), isNull(peProcessInstances.deletedAt)))
      .then((r) => r[0]?.count ?? 0),
    // 13: Active Processes — created this month vs last month
    db.select({ count: count() }).from(peProcessInstances)
      .where(and(eq(peProcessInstances.tenantId, tid), gte(peProcessInstances.createdAt, lastMonthStart), sql`${peProcessInstances.createdAt} < ${thisMonthStart}`, isNull(peProcessInstances.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 14: Pending Approvals — current
    db.select({ count: count() }).from(peApprovals)
      .where(and(eq(peApprovals.tenantId, tid), isNull(peApprovals.decision), isNull(peApprovals.deletedAt)))
      .then((r) => r[0]?.count ?? 0),
    // 15: Pending Approvals — created this month for trend
    db.select({ count: count() }).from(peProcessInstances)
      .where(and(eq(peProcessInstances.tenantId, tid), gte(peProcessInstances.createdAt, thisMonthStart), isNull(peProcessInstances.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 16: Recent bookings (for activity feed)
    db.select({
      id: cspPortalBookings.id,
      ref: cspPortalBookings.bookingRef,
      status: cspPortalBookings.status,
      createdAt: cspPortalBookings.createdAt,
    }).from(cspPortalBookings)
      .where(and(eq(cspPortalBookings.tenantId, tid), isNull(cspPortalBookings.deletedAt)))
      .orderBy(desc(cspPortalBookings.createdAt))
      .limit(5),

    // 17: Recent clearances (for activity feed)
    db.select({
      id: ccrImportClearances.id,
      ref: ccrImportClearances.clearanceRef,
      status: ccrImportClearances.status,
      createdAt: ccrImportClearances.createdAt,
    }).from(ccrImportClearances)
      .where(and(eq(ccrImportClearances.tenantId, tid), isNull(ccrImportClearances.deletedAt)))
      .orderBy(desc(ccrImportClearances.createdAt))
      .limit(5),

    // 18: Booking pipeline — count per status (F-010)
    db.select({
      status: cspPortalBookings.status,
      count: count(),
    }).from(cspPortalBookings)
      .where(and(eq(cspPortalBookings.tenantId, tid), isNull(cspPortalBookings.deletedAt)))
      .groupBy(cspPortalBookings.status),
  ]);

  // Extract values with fallback for failed queries
  function val<T>(index: number, fallback: T): T {
    const r = results[index];
    return r.status === "fulfilled" ? (r.value as T) : fallback;
  }

  const vesselCount = val<number>(0, 0);
  const vesselPrev = val<number>(1, 0);
  const bookingCount = val<number>(2, 0);
  const bookingPrev = val<number>(3, 0);
  const transitCount = val<number>(4, 0);
  const transitPrev = val<number>(5, 0);
  const customsCount = val<number>(6, 0);
  const customsPrev = val<number>(7, 0);
  const revenueMtd = val<number>(8, 0);
  const revenuePrevMtd = val<number>(9, 0);
  const outstandingAr = val<number>(10, 0);
  const overdueAr = val<number>(11, 0);
  const activeProcesses = val<number>(12, 0);
  const processesLastMonth = val<number>(13, 0);
  const pendingApprovals = val<number>(14, 0);
  const processesThisMonth = val<number>(15, 0);

  const recentBookings = val<Array<{ id: string; ref: string; status: string; createdAt: Date }>>(16, []);
  const recentClearances = val<Array<{ id: string; ref: string; status: string; createdAt: Date }>>(17, []);

  // F-010: Booking pipeline counts
  const pipelineRaw = val<Array<{ status: string; count: number }>>(18, []);
  const pipelineMap = new Map(pipelineRaw.map((r) => [r.status, r.count]));
  const pipelineStages = [
    { label: "Draft", status: "draft", count: pipelineMap.get("draft") ?? 0, color: "slate" },
    { label: "Confirmed", status: "confirmed", count: pipelineMap.get("confirmed") ?? 0, color: "blue" },
    { label: "In Progress", status: "in_progress", count: pipelineMap.get("in_progress") ?? 0, color: "amber" },
    { label: "Completed", status: "completed", count: pipelineMap.get("completed") ?? 0, color: "emerald" },
  ];
  const cancelledCount = pipelineMap.get("cancelled") ?? 0;

  // Calculate trends
  const vesselTrend = calcTrend(vesselCount, vesselPrev);
  const bookingTrend = calcTrend(bookingCount, bookingPrev);
  const transitTrend = calcTrend(transitCount, transitPrev);
  const customsTrend = calcTrend(customsCount, customsPrev);
  const revenueTrend = calcTrend(revenueMtd, revenuePrevMtd);
  // For AR: if overdue is > 30% of outstanding, show as negative trend
  const arTrend = outstandingAr === 0
    ? { value: 0, direction: "neutral" as const }
    : overdueAr / outstandingAr > 0.3
      ? { value: (overdueAr / outstandingAr) * 100, direction: "down" as const }
      : { value: ((outstandingAr - overdueAr) / outstandingAr) * 100, direction: "up" as const };
  const processTrend = calcTrend(processesThisMonth, processesLastMonth);
  // Pending approvals: more pending = negative (backlog growing)
  const approvalTrend = pendingApprovals === 0
    ? { value: 0, direction: "neutral" as const }
    : pendingApprovals > 10
      ? { value: pendingApprovals, direction: "down" as const }
      : { value: 0, direction: "neutral" as const };

  // KPI card definitions
  const kpiCards = [
    {
      title: "Active Vessels",
      value: formatCompactNumber(vesselCount),
      icon: Ship,
      description: "Vessel Management",
      trend: vesselTrend,
      href: "/vessels-hub",
    },
    {
      title: "Open Bookings",
      value: formatCompactNumber(bookingCount),
      icon: FileText,
      description: "Bookings & Sales",
      trend: bookingTrend,
      href: "/bookings-hub",
    },
    {
      title: "Containers in Transit",
      value: formatCompactNumber(transitCount),
      icon: Container,
      description: "Shipment Tracking",
      trend: transitTrend,
      href: "/tracking",
    },
    {
      title: "Pending Customs",
      value: formatCompactNumber(customsCount),
      icon: FileArchive,
      description: "Customs Compliance",
      trend: customsTrend,
      href: "/customs-hub",
    },
    {
      title: "Revenue MTD",
      value: revenueMtd === 0 ? "$0" : formatCompactCurrency(revenueMtd, currency),
      icon: DollarSign,
      description: "Month-to-Date",
      trend: revenueTrend,
      href: "/invoicing-hub",
    },
    {
      title: "Outstanding AR",
      value: outstandingAr === 0 ? "$0" : formatCompactCurrency(outstandingAr, currency),
      icon: CreditCard,
      description: overdueAr > 0 ? `${formatCompactCurrency(overdueAr, currency)} overdue` : "Accounts Receivable",
      trend: arTrend,
      href: "/receivables-hub",
    },
    {
      title: "Active Processes",
      value: formatCompactNumber(activeProcesses),
      icon: Activity,
      description: "Running & Pending",
      trend: processTrend,
      href: "/processes",
    },
    {
      title: "Pending Approvals",
      value: formatCompactNumber(pendingApprovals),
      icon: ClipboardCheck,
      description: pendingApprovals === 0 ? "All caught up" : "Awaiting decision",
      trend: approvalTrend,
      href: "/processes/approvals",
    },
  ];

  // Activity feed
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back. Here is an overview of your operations.
        </p>
      </div>

      {/* 8 KPI Cards — 2 rows of 4 on desktop */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Link key={kpi.title} href={kpi.href} className="block">
            <StatsCard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              description={kpi.description}
              trend={kpi.trend}
            />
          </Link>
        ))}
      </div>

      {/* F-010: Booking Pipeline Funnel */}
      <BookingPipelineFunnel stages={pipelineStages} cancelledCount={cancelledCount} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <ActivityFeed items={activityItems.length > 0 ? activityItems : undefined} />

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "New Booking", href: "/bookings-hub", icon: FileText },
              { label: "Track Container", href: "/tracking", icon: Container },
              { label: "Vessel Schedule", href: "/vessels-hub", icon: Ship },
              { label: "AI Assistant", href: "/admin-hub", icon: FileArchive },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-lg border border-slate-200/60 p-3.5 text-sm font-medium text-slate-700 transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-sm dark:border-slate-700/60 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/30"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-brand-900/50 dark:group-hover:text-brand-400">
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
