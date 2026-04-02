import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmProfitabilityAnalyses } from "@/db/schema";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditProfitabilityAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "analysisName", label: "Analysis Name", type: "text", required: true },
    {
      name: "analysisType",
      label: "Analysis Type",
      type: "select",
      options: [
        { label: "Trade Lane", value: "trade_lane" },
        { label: "Customer", value: "customer" },
        { label: "Voyage", value: "voyage" },
        { label: "Service", value: "service" },
        { label: "Overall", value: "overall" },
      ],
    },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "customerId", label: "Customer ID", type: "select", options: customerOpts },
    { name: "voyageId", label: "Voyage ID", type: "text" },
    { name: "periodFrom", label: "Period From", type: "date", required: true },
    { name: "periodTo", label: "Period To", type: "date", required: true },
    { name: "totalRevenue", label: "Total Revenue", type: "number" },
    { name: "totalCost", label: "Total Cost", type: "number" },
    { name: "grossProfit", label: "Gross Profit", type: "number" },
    { name: "marginPercent", label: "Margin %", type: "number" },
    { name: "teuCount", label: "TEU Count", type: "number" },
    { name: "revenuePerTeu", label: "Revenue Per TEU", type: "number" },
    { name: "costPerTeu", label: "Cost Per TEU", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Final", value: "final" },
        { label: "Archived", value: "archived" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [item] = await db
    .select()
    .from(cpmProfitabilityAnalyses)
    .where(
      and(
        eq(cpmProfitabilityAnalyses.id, id),
        eq(cpmProfitabilityAnalyses.tenantId, session.tenantId),
        isNull(cpmProfitabilityAnalyses.deletedAt)
      )
    )
    .limit(1);

  if (!item) notFound();

  const defaultValues: Record<string, string> = {};
  for (const field of fields) {
    const val = item[field.name as keyof typeof item];
    if (val !== null && val !== undefined) {
      if (val instanceof Date) {
        defaultValues[field.name] = field.type === "date"
          ? val.toISOString().split("T")[0]
          : val.toISOString().slice(0, 16);
      } else {
        defaultValues[field.name] = String(val);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/commercial-pricing-management/profitability-analyses/${id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Profitability Analysis</h1>
      </div>

      <CpmForm
        entityType="Profitability Analysis"
        fields={fields}
        apiPath={`/api/v1/commercial-pricing-management/profitability-analyses/${id}`}
        returnPath="/commercial-pricing-management/profitability-analyses"
        initialData={defaultValues}
        isEdit
      />
    </div>
  );
}
