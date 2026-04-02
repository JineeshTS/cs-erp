import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmSalesTargets } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditSalesTargetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:edit")))
    redirect("/sales-crm");

  const currencyOpts = await getCurrencyOptions();

  const SALES_TARGET_FIELDS: FieldConfig[] = [
    { name: "salesRepId", label: "Sales Rep ID", type: "text", required: true, placeholder: "UUID of the sales rep" },
    { name: "targetName", label: "Target Name", type: "text", required: true },
    { name: "targetType", label: "Target Type", type: "select", required: true, options: [
      { value: "revenue", label: "Revenue" },
      { value: "teu", label: "TEU" },
      { value: "new_customer", label: "New Customer" },
      { value: "combined", label: "Combined" },
    ]},
    { name: "fiscalYear", label: "Fiscal Year", type: "number", required: true },
    { name: "fiscalQuarter", label: "Fiscal Quarter", type: "number" },
    { name: "fiscalMonth", label: "Fiscal Month", type: "number" },
    { name: "revenueTarget", label: "Revenue Target", type: "number" },
    { name: "teuTarget", label: "TEU Target", type: "number" },
    { name: "newCustomerTarget", label: "New Customer Target", type: "number" },
    { name: "revenueActual", label: "Revenue Actual", type: "number" },
    { name: "teuActual", label: "TEU Actual", type: "number" },
    { name: "newCustomerActual", label: "New Customer Actual", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "region", label: "Region", type: "text" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "achieved", label: "Achieved" },
      { value: "missed", label: "Missed" },
      { value: "cancelled", label: "Cancelled" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await db
    .select()
    .from(scmSalesTargets)
    .where(
      and(
        eq(scmSalesTargets.id, id),
        eq(scmSalesTargets.tenantId, session.tenantId),
        isNull(scmSalesTargets.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    salesRepId: record.salesRepId,
    targetName: record.targetName,
    targetType: record.targetType,
    fiscalYear: record.fiscalYear,
    fiscalQuarter: record.fiscalQuarter ?? "",
    fiscalMonth: record.fiscalMonth ?? "",
    revenueTarget: record.revenueTarget ?? "",
    teuTarget: record.teuTarget ?? "",
    newCustomerTarget: record.newCustomerTarget ?? "",
    revenueActual: record.revenueActual ?? "",
    teuActual: record.teuActual ?? "",
    newCustomerActual: record.newCustomerActual ?? "",
    currency: record.currency ?? "",
    tradeLane: record.tradeLane ?? "",
    region: record.region ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/sales-targets/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Sales Target
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Sales Target"
          apiPath={`/api/v1/sales-crm/sales-targets/${id}`}
          fields={SALES_TARGET_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/sales-targets/${id}`}
        />
      </div>
    </div>
  );
}
