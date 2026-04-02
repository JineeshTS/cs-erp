import { redirect } from "next/navigation";
import { Users, Target, FileText, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChartCard } from "@/components/ui/charts";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  tenants,
  scmCustomers,
  scmOpportunities,
  scmPipelineStages,
  scmRateQuotations,
} from "@/db/schema";
import { eq, and, isNull, count, sum, sql } from "drizzle-orm";

/* ────────── helpers ────────── */

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

export default async function CommercialDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tid = session.tenantId;

  const tenantRow = await db
    .select({ currency: tenants.currency })
    .from(tenants)
    .where(eq(tenants.id, tid))
    .then((r) => r[0]);
  const currency = tenantRow?.currency ?? "USD";

  const results = await Promise.allSettled([
    // 0: Pipeline value (open opportunities)
    db.select({ total: sum(scmOpportunities.expectedRevenue) }).from(scmOpportunities)
      .where(and(eq(scmOpportunities.tenantId, tid), eq(scmOpportunities.status, "open"), isNull(scmOpportunities.deletedAt)))
      .then((r) => Number(r[0]?.total ?? 0)),

    // 1: Total quotations
    db.select({ count: count() }).from(scmRateQuotations)
      .where(and(eq(scmRateQuotations.tenantId, tid), isNull(scmRateQuotations.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 2: Won quotations (accepted)
    db.select({ count: count() }).from(scmRateQuotations)
      .where(and(eq(scmRateQuotations.tenantId, tid), eq(scmRateQuotations.status, "accepted"), isNull(scmRateQuotations.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 3: Active customer count
    db.select({ count: count() }).from(scmCustomers)
      .where(and(eq(scmCustomers.tenantId, tid), eq(scmCustomers.status, "active"), isNull(scmCustomers.deletedAt)))
      .then((r) => r[0]?.count ?? 0),

    // 4: Opportunity status breakdown
    db.select({ stageName: sql<string>`COALESCE(${scmPipelineStages.stageName}, ${scmOpportunities.status})`, count: count() })
      .from(scmOpportunities)
      .leftJoin(scmPipelineStages, eq(scmOpportunities.stageId, scmPipelineStages.id))
      .where(and(eq(scmOpportunities.tenantId, tid), isNull(scmOpportunities.deletedAt)))
      .groupBy(sql`COALESCE(${scmPipelineStages.stageName}, ${scmOpportunities.status})`),
  ]);

  function val<T>(index: number, fallback: T): T {
    const r = results[index];
    return r.status === "fulfilled" ? (r.value as T) : fallback;
  }

  const pipelineValue = val<number>(0, 0);
  const totalQuotations = val<number>(1, 0);
  const wonQuotations = val<number>(2, 0);
  const customerCount = val<number>(3, 0);
  const stageBreakdown = val<Array<{ stageName: string; count: number }>>(4, []);

  const conversionRate = totalQuotations > 0 ? ((wonQuotations / totalQuotations) * 100).toFixed(1) : "0";

  // Opportunity stage chart
  const stageChartData = stageBreakdown.map((s) => ({
    stage: s.stageName,
    count: s.count,
  }));

  const kpis = [
    {
      title: "Pipeline Value",
      value: pipelineValue === 0 ? "$0" : formatCurrency(pipelineValue, currency),
      icon: TrendingUp,
      href: "/sales-crm",
    },
    {
      title: "Quotation Conversion",
      value: `${conversionRate}%`,
      icon: Target,
      description: `${wonQuotations} of ${totalQuotations} quotations`,
      href: "/sales-crm",
    },
    {
      title: "Active Customers",
      value: formatCompact(customerCount),
      icon: Users,
      href: "/sales-crm",
    },
    {
      title: "Total Quotations",
      value: formatCompact(totalQuotations),
      icon: FileText,
      href: "/sales-crm",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Commercial Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sales pipeline, quotations, and customer metrics.
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
          title="Opportunity Pipeline by Stage"
          data={stageChartData}
          dataKey="count"
          categoryKey="stage"
          color="hsl(270, 76%, 58%)"
        />
      </div>
    </div>
  );
}
