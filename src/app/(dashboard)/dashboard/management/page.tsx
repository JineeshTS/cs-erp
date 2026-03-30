import { redirect } from "next/navigation";
import {
  Ship,
  FileText,
  Container,
  DollarSign,
  CreditCard,
  Users,
  Activity,
  ClipboardCheck,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LineChartCard } from "@/components/ui/charts";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  tenants,
  vessels,
  cspPortalBookings,
  cspShipmentTracking,
  firmFreightInvoices,
  arccCustomerAccounts,
  scmCustomers,
  peProcessInstances,
  peApprovals,
} from "@/db/schema";
import { eq, and, isNull, notInArray, inArray, count, sum, gte, sql } from "drizzle-orm";

/* ────────── helpers ────────── */

function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function formatCurrency(cents: number, currency: string): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    notation: amount >= 1000 ? "compact" : "standard",
    maximumFractionDigits: amount >= 1000 ? 1 : 0,
  }).format(amount);
}

function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/* ────────── page ────────── */

export default async function ManagementDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tid = session.tenantId;
  const now = new Date();
  const thisMonth = monthStart(now);

  const tenantRow = await db
    .select({ currency: tenants.currency })
    .from(tenants)
    .where(eq(tenants.id, tid))
    .then((r) => r[0]);
  const currency = tenantRow?.currency ?? "USD";

  const results = await Promise.allSettled([
    // 0: Active vessels
    db.select({ count: count() }).from(vessels)
      .where(and(eq(vessels.tenantId, tid), eq(vessels.status, "active"), isNull(vessels.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 1: Open bookings
    db.select({ count: count() }).from(cspPortalBookings)
      .where(and(eq(cspPortalBookings.tenantId, tid), notInArray(cspPortalBookings.status, ["cancelled", "completed"]), isNull(cspPortalBookings.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 2: Containers in transit
    db.select({ count: count() }).from(cspShipmentTracking)
      .where(and(eq(cspShipmentTracking.tenantId, tid), eq(cspShipmentTracking.currentStatus, "in_transit"), isNull(cspShipmentTracking.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 3: Revenue MTD
    db.select({ total: sum(firmFreightInvoices.totalAmount) }).from(firmFreightInvoices)
      .where(and(eq(firmFreightInvoices.tenantId, tid), inArray(firmFreightInvoices.status, ["issued", "dispatched", "paid"]), gte(firmFreightInvoices.issuedAt, thisMonth), isNull(firmFreightInvoices.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),

    // 4: Outstanding AR
    db.select({ total: sum(arccCustomerAccounts.totalOutstanding) }).from(arccCustomerAccounts)
      .where(and(eq(arccCustomerAccounts.tenantId, tid), eq(arccCustomerAccounts.accountStatus, "active"), isNull(arccCustomerAccounts.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),

    // 5: Active customers
    db.select({ count: count() }).from(scmCustomers)
      .where(and(eq(scmCustomers.tenantId, tid), eq(scmCustomers.status, "active"), isNull(scmCustomers.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 6: Active processes
    db.select({ count: count() }).from(peProcessInstances)
      .where(and(eq(peProcessInstances.tenantId, tid), inArray(peProcessInstances.status, ["pending", "in_progress", "waiting_approval"]), isNull(peProcessInstances.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 7: Pending approvals
    db.select({ count: count() }).from(peApprovals)
      .where(and(eq(peApprovals.tenantId, tid), isNull(peApprovals.decision), isNull(peApprovals.deletedAt)))
      .then((r) => r[0]?.count ?? 0),
  ]);

  function val<T>(index: number, fallback: T): T {
    const r = results[index];
    return r.status === "fulfilled" ? (r.value as T) : fallback;
  }

  const vesselCount = val<number>(0, 0);
  const openBookings = val<number>(1, 0);
  const transitCount = val<number>(2, 0);
  const revenueMtd = val<number>(3, 0);
  const outstandingAr = val<number>(4, 0);
  const customerCount = val<number>(5, 0);
  const activeProcesses = val<number>(6, 0);
  const pendingApprovals = val<number>(7, 0);

  const kpis = [
    { title: "Active Vessels", value: formatCompact(vesselCount), icon: Ship, href: "/vessels-hub" },
    { title: "Open Bookings", value: formatCompact(openBookings), icon: FileText, href: "/bookings-hub" },
    { title: "In Transit", value: formatCompact(transitCount), icon: Container, href: "/tracking" },
    {
      title: "Revenue MTD",
      value: revenueMtd === 0 ? "$0" : formatCurrency(revenueMtd, currency),
      icon: DollarSign,
      href: "/freight-invoice-revenue-management",
    },
    {
      title: "Outstanding AR",
      value: outstandingAr === 0 ? "$0" : formatCurrency(outstandingAr, currency),
      icon: CreditCard,
      href: "/accounts-receivable-credit-control",
    },
    { title: "Active Customers", value: formatCompact(customerCount), icon: Users, href: "/sales-crm" },
    { title: "Active Processes", value: formatCompact(activeProcesses), icon: Activity, href: "/processes" },
    { title: "Pending Approvals", value: formatCompact(pendingApprovals), icon: ClipboardCheck, href: "/processes/monitor" },
  ];

  // Summary line chart data — compare operations vs finance
  const summaryChartData = [
    { metric: "Vessels", operations: vesselCount, finance: 0 },
    { metric: "Bookings", operations: openBookings, finance: 0 },
    { metric: "Transit", operations: transitCount, finance: 0 },
    { metric: "Customers", operations: 0, finance: customerCount },
    { metric: "Processes", operations: activeProcesses, finance: 0 },
    { metric: "Approvals", operations: pendingApprovals, finance: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Management Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Executive summary across operations, finance, and commercial.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.title} href={kpi.href} className="block">
            <StatsCard title={kpi.title} value={kpi.value} icon={kpi.icon} />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <LineChartCard
          title="Operational Metrics Summary"
          data={summaryChartData}
          dataKeys={["operations", "finance"]}
          categoryKey="metric"
          colors={["hsl(221, 83%, 53%)", "hsl(160, 84%, 39%)"]}
        />
      </div>

      {/* Quick navigation to sub-dashboards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Operations Dashboard", href: "/dashboard/operations", desc: "Vessels, bookings, containers" },
          { label: "Finance Dashboard", href: "/dashboard/finance", desc: "Revenue, AR, invoices" },
          { label: "Commercial Dashboard", href: "/dashboard/commercial", desc: "Pipeline, quotations, customers" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900 dark:hover:border-brand-700"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{link.label}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
