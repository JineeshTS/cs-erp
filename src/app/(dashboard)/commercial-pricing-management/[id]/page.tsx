import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  cpmTariffs,
  cpmTariffRates,
  cpmSpecialRates,
  cpmSurcharges,
  cpmDetentionDemurrage,
  cpmYieldTargets,
  cpmRateBenchmarks,
  cpmProfitabilityAnalyses,
  cpmAiPricingModels,
  cpmVsaSlotRates,
  cpmDeadFreightRecords,
  cpmRevenueLeakages,
  cpmPricingApprovals,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeleteButton } from "@/components/ui/delete-button";


const TABS = [
  { key: "overview", label: "Overview" },
  { key: "rates", label: "Tariff Rates" },
  { key: "special-rates", label: "Special Rates" },
  { key: "surcharges", label: "Surcharges" },
  { key: "dd-tariffs", label: "D&D Tariffs" },
  { key: "yield", label: "Yield Targets" },
  { key: "benchmarks", label: "Benchmarks" },
  { key: "profitability", label: "Profitability" },
  { key: "ai-pricing", label: "AI Pricing" },
  { key: "vsa-slots", label: "VSA Slots" },
  { key: "dead-freight", label: "Dead Freight" },
  { key: "leakages", label: "Leakages" },
  { key: "approvals", label: "Approvals" },
] as const;

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function TariffDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "commercial:read")))
    redirect("/commercial-pricing-management");

  const { id } = await params;
  const sp = await searchParams;
  const activeTab = sp.tab ?? "overview";

  const record = await db
    .select()
    .from(cpmTariffs)
    .where(
      and(
        eq(cpmTariffs.id, id),
        eq(cpmTariffs.tenantId, session.tenantId),
        isNull(cpmTariffs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "commercial:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "commercial:delete");

  const tenantFilter = session.tenantId;
  const [
    tariffRates,
    specialRates,
    surcharges,
    ddTariffs,
    yieldTargets,
    benchmarks,
    profitability,
    aiModels,
    vsaSlots,
    deadFreight,
    leakages,
    approvals,
  ] = await Promise.all([
    db.select().from(cpmTariffRates).where(and(eq(cpmTariffRates.tenantId, tenantFilter), isNull(cpmTariffRates.deletedAt), eq(cpmTariffRates.tariffId, id))).orderBy(desc(cpmTariffRates.createdAt)).limit(50),
    db.select().from(cpmSpecialRates).where(and(eq(cpmSpecialRates.tenantId, tenantFilter), isNull(cpmSpecialRates.deletedAt))).orderBy(desc(cpmSpecialRates.createdAt)).limit(50),
    db.select().from(cpmSurcharges).where(and(eq(cpmSurcharges.tenantId, tenantFilter), isNull(cpmSurcharges.deletedAt))).orderBy(desc(cpmSurcharges.createdAt)).limit(50),
    db.select().from(cpmDetentionDemurrage).where(and(eq(cpmDetentionDemurrage.tenantId, tenantFilter), isNull(cpmDetentionDemurrage.deletedAt))).orderBy(desc(cpmDetentionDemurrage.createdAt)).limit(50),
    db.select().from(cpmYieldTargets).where(and(eq(cpmYieldTargets.tenantId, tenantFilter), isNull(cpmYieldTargets.deletedAt))).orderBy(desc(cpmYieldTargets.createdAt)).limit(50),
    db.select().from(cpmRateBenchmarks).where(and(eq(cpmRateBenchmarks.tenantId, tenantFilter), isNull(cpmRateBenchmarks.deletedAt))).orderBy(desc(cpmRateBenchmarks.createdAt)).limit(50),
    db.select().from(cpmProfitabilityAnalyses).where(and(eq(cpmProfitabilityAnalyses.tenantId, tenantFilter), isNull(cpmProfitabilityAnalyses.deletedAt))).orderBy(desc(cpmProfitabilityAnalyses.createdAt)).limit(50),
    db.select().from(cpmAiPricingModels).where(and(eq(cpmAiPricingModels.tenantId, tenantFilter), isNull(cpmAiPricingModels.deletedAt))).orderBy(desc(cpmAiPricingModels.createdAt)).limit(50),
    db.select().from(cpmVsaSlotRates).where(and(eq(cpmVsaSlotRates.tenantId, tenantFilter), isNull(cpmVsaSlotRates.deletedAt))).orderBy(desc(cpmVsaSlotRates.createdAt)).limit(50),
    db.select().from(cpmDeadFreightRecords).where(and(eq(cpmDeadFreightRecords.tenantId, tenantFilter), isNull(cpmDeadFreightRecords.deletedAt))).orderBy(desc(cpmDeadFreightRecords.createdAt)).limit(50),
    db.select().from(cpmRevenueLeakages).where(and(eq(cpmRevenueLeakages.tenantId, tenantFilter), isNull(cpmRevenueLeakages.deletedAt))).orderBy(desc(cpmRevenueLeakages.createdAt)).limit(50),
    db.select().from(cpmPricingApprovals).where(and(eq(cpmPricingApprovals.tenantId, tenantFilter), isNull(cpmPricingApprovals.deletedAt))).orderBy(desc(cpmPricingApprovals.createdAt)).limit(50),
  ]);

  const tabData: Record<string, { headers: string[]; rows: string[][] }> = {
    rates: {
      headers: ["Charge Code", "Name", "Type", "Basis", "Unit Price", "Currency"],
      rows: tariffRates.map((r) => [r.chargeCode, r.chargeName, r.chargeType, r.basis, r.unitPrice.toLocaleString(), r.currency ?? "USD"]),
    },
    "special-rates": {
      headers: ["Code", "Name", "Type", "Base Rate", "Final Rate", "Status"],
      rows: specialRates.map((r) => [r.rateCode, r.rateName, r.rateType, r.baseRate.toLocaleString(), r.finalRate.toLocaleString(), r.status]),
    },
    surcharges: {
      headers: ["Code", "Name", "Type", "Basis", "Amount", "Mandatory"],
      rows: surcharges.map((s) => [s.surchargeCode, s.surchargeName, s.surchargeType, s.calculationBasis, s.amount?.toLocaleString() ?? "-", s.isMandatory ? "Yes" : "No"]),
    },
    "dd-tariffs": {
      headers: ["Code", "Name", "Type", "Free Days", "Daily Rate", "Status"],
      rows: ddTariffs.map((d) => [d.tariffCode, d.tariffName, d.chargeType, d.freeTimeDays.toString(), d.dailyRate.toLocaleString(), d.status]),
    },
    yield: {
      headers: ["Name", "Trade Lane", "Year", "Target Rev/TEU", "Utilization %", "Status"],
      rows: yieldTargets.map((y) => [y.targetName, y.tradeLane, y.fiscalYear.toString(), y.targetRevenuePerTeu?.toLocaleString() ?? "-", y.targetUtilizationPercent?.toString() ?? "-", y.status]),
    },
    benchmarks: {
      headers: ["Name", "Trade Lane", "Market Rate", "Our Rate", "Variance %", "Trend"],
      rows: benchmarks.map((b) => [b.benchmarkName, b.tradeLane, b.marketRate.toLocaleString(), b.ourRate?.toLocaleString() ?? "-", b.variancePercent?.toString() ?? "-", b.trend ?? "-"]),
    },
    profitability: {
      headers: ["Name", "Type", "Revenue", "Cost", "Margin %", "Status"],
      rows: profitability.map((p) => [p.analysisName, p.analysisType, p.totalRevenue?.toLocaleString() ?? "-", p.totalCost?.toLocaleString() ?? "-", p.marginPercent?.toString() ?? "-", p.status]),
    },
    "ai-pricing": {
      headers: ["Name", "Code", "Type", "Accuracy", "Predicted", "Suggested"],
      rows: aiModels.map((a) => [a.modelName, a.modelCode, a.modelType, a.accuracy?.toString() ?? "-", a.predictedRate?.toLocaleString() ?? "-", a.suggestedRate?.toLocaleString() ?? "-"]),
    },
    "vsa-slots": {
      headers: ["Partner", "Agreement", "Trade Lane", "Allocation TEU", "Cost/TEU", "Status"],
      rows: vsaSlots.map((v) => [v.vsaPartner, v.agreementReference, v.tradeLane, v.slotAllocationTeu?.toString() ?? "-", v.slotCostPerTeu.toLocaleString(), v.status]),
    },
    "dead-freight": {
      headers: ["Reference", "Voyage", "Booked TEU", "Actual TEU", "Amount", "Status"],
      rows: deadFreight.map((d) => [d.recordReference, d.voyageReference ?? "-", d.bookedTeu.toString(), d.actualTeu.toString(), d.deadFreightAmount.toLocaleString(), d.status]),
    },
    leakages: {
      headers: ["Reference", "Type", "Expected", "Actual", "Leakage", "Status"],
      rows: leakages.map((l) => [l.leakageReference, l.leakageType.replace(/_/g, " "), l.expectedAmount.toLocaleString(), l.actualAmount.toLocaleString(), l.leakageAmount.toLocaleString(), l.status]),
    },
    approvals: {
      headers: ["Reference", "Type", "Entity", "Level", "Urgency", "Status"],
      rows: approvals.map((a) => [a.approvalReference, a.approvalType.replace(/_/g, " "), a.entityType.replace(/_/g, " "), `${a.currentLevel}/${a.maxLevel}`, a.urgency ?? "normal", a.status]),
    },
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/commercial-pricing-management" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.tariffName}</h1>
          <p className="text-sm text-gray-500">{record.tariffCode} &mdash; {record.tariffType}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/commercial-pricing-management/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/commercial-pricing-management/tariffs/${id}`} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/commercial-pricing-management/${id}?tab=${tab.key}`}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Tariff Code", value: record.tariffCode },
              { label: "Tariff Name", value: record.tariffName },
              { label: "Type", value: record.tariffType },
              { label: "Trade Lane", value: record.tradeLane ?? "-" },
              { label: "Origin Port", value: record.originPort ?? "-" },
              { label: "Destination Port", value: record.destinationPort ?? "-" },
              { label: "Service Type", value: record.serviceType ?? "-" },
              { label: "Currency", value: record.currency ?? "USD" },
              { label: "Effective From", value: fmtDate(record.effectiveFrom) },
              { label: "Effective To", value: fmtDate(record.effectiveTo) },
              { label: "Status", value: record.status },
              { label: "Approved At", value: fmtDate(record.approvedAt) },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">{field.label}</p>
                <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
              </div>
            ))}
          </div>
          {record.notes && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.notes}</p>
            </div>
          )}
        </div>
      ) : currentTab ? (
        currentTab.rows.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No records found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {currentTab.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTab.rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-gray-600">
                        {j === row.length - 1 ? (
                          <Badge variant="secondary">{String(cell).replace(/_/g, " ")}</Badge>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
