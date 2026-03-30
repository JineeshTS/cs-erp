import { redirect } from "next/navigation";
import { DollarSign, CreditCard, AlertTriangle, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChartCard } from "@/components/ui/charts";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  tenants,
  firmFreightInvoices,
  arccCustomerAccounts,
} from "@/db/schema";
import { eq, and, isNull, inArray, count, sum, gte, lte, sql } from "drizzle-orm";

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

/* ────────── page ────────── */

export default async function FinanceDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tid = session.tenantId;
  const now = new Date();
  const thisMonth = monthStart(now);

  // Fetch tenant currency
  const tenantRow = await db
    .select({ currency: tenants.currency })
    .from(tenants)
    .where(eq(tenants.id, tid))
    .then((r) => r[0]);
  const currency = tenantRow?.currency ?? "USD";

  const results = await Promise.allSettled([
    // 0: Revenue MTD
    db.select({ total: sum(firmFreightInvoices.totalAmount) }).from(firmFreightInvoices)
      .where(and(eq(firmFreightInvoices.tenantId, tid), inArray(firmFreightInvoices.status, ["issued", "dispatched", "paid"]), gte(firmFreightInvoices.issuedAt, thisMonth), isNull(firmFreightInvoices.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),

    // 1: Outstanding AR
    db.select({ total: sum(arccCustomerAccounts.totalOutstanding) }).from(arccCustomerAccounts)
      .where(and(eq(arccCustomerAccounts.tenantId, tid), eq(arccCustomerAccounts.accountStatus, "active"), isNull(arccCustomerAccounts.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),

    // 2: Overdue invoices count
    db.select({ count: count() }).from(firmFreightInvoices)
      .where(and(eq(firmFreightInvoices.tenantId, tid), inArray(firmFreightInvoices.status, ["issued", "dispatched"]), lte(firmFreightInvoices.dueDate, now), isNull(firmFreightInvoices.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 3: Collected MTD
    db.select({ total: sum(firmFreightInvoices.paidAmount) }).from(firmFreightInvoices)
      .where(and(eq(firmFreightInvoices.tenantId, tid), inArray(firmFreightInvoices.status, ["issued", "dispatched", "paid"]), gte(firmFreightInvoices.issuedAt, thisMonth), isNull(firmFreightInvoices.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),

    // 4: Invoice status breakdown
    db.select({ status: firmFreightInvoices.status, count: count() })
      .from(firmFreightInvoices)
      .where(and(eq(firmFreightInvoices.tenantId, tid), isNull(firmFreightInvoices.deletedAt)))
      .groupBy(firmFreightInvoices.status),
  ]);

  function val<T>(index: number, fallback: T): T {
    const r = results[index];
    return r.status === "fulfilled" ? (r.value as T) : fallback;
  }

  const revenueMtd = val<number>(0, 0);
  const outstandingAr = val<number>(1, 0);
  const overdueCount = val<number>(2, 0);
  const collectedMtd = val<number>(3, 0);
  const statusBreakdown = val<Array<{ status: string; count: number }>>(4, []);

  // Invoice status chart data
  const statusLabels: Record<string, string> = {
    draft: "Draft",
    issued: "Issued",
    dispatched: "Dispatched",
    paid: "Paid",
    cancelled: "Cancelled",
    voided: "Voided",
  };
  const invoiceChartData = statusBreakdown.map((s) => ({
    status: statusLabels[s.status] ?? s.status,
    count: s.count,
  }));

  const kpis = [
    {
      title: "Revenue MTD",
      value: revenueMtd === 0 ? "$0" : formatCurrency(revenueMtd, currency),
      icon: TrendingUp,
      href: "/freight-invoice-revenue-management",
    },
    {
      title: "Collected MTD",
      value: collectedMtd === 0 ? "$0" : formatCurrency(collectedMtd, currency),
      icon: DollarSign,
      href: "/freight-invoice-revenue-management",
    },
    {
      title: "Outstanding AR",
      value: outstandingAr === 0 ? "$0" : formatCurrency(outstandingAr, currency),
      icon: CreditCard,
      href: "/accounts-receivable-credit-control",
    },
    {
      title: "Overdue Invoices",
      value: String(overdueCount),
      icon: AlertTriangle,
      description: overdueCount > 0 ? "Action required" : "None overdue",
      href: "/freight-invoice-revenue-management",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Finance Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Revenue, receivables, and invoice health overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.title} href={kpi.href} className="block">
            <StatsCard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              description={"description" in kpi ? (kpi as { description: string }).description : undefined}
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <BarChartCard
          title="Invoice Status Breakdown"
          data={invoiceChartData}
          dataKey="count"
          categoryKey="status"
          color="hsl(221, 83%, 53%)"
        />
      </div>
    </div>
  );
}
