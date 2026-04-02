import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmSurcharges } from "@/db/schema";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditSurchargePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "surchargeCode", label: "Surcharge Code", type: "text", required: true },
    { name: "surchargeName", label: "Surcharge Name", type: "text", required: true },
    {
      name: "surchargeType",
      label: "Surcharge Type",
      type: "select",
      options: [
        { label: "BAF", value: "baf" },
        { label: "CAF", value: "caf" },
        { label: "PSS", value: "pss" },
        { label: "EFS", value: "efs" },
        { label: "War Risk", value: "war_risk" },
        { label: "Piracy", value: "piracy" },
        { label: "Congestion", value: "congestion" },
        { label: "Low Sulphur", value: "low_sulphur" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "calculationBasis",
      label: "Calculation Basis",
      type: "select",
      options: [
        { label: "Fixed", value: "fixed" },
        { label: "Percentage", value: "percentage" },
        { label: "Per TEU", value: "per_teu" },
        { label: "Per Container", value: "per_container" },
        { label: "Per B/L", value: "per_bl" },
      ],
    },
    { name: "amount", label: "Amount", type: "number" },
    { name: "percentage", label: "Percentage", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "applicableTo",
      label: "Applicable To",
      type: "select",
      options: [
        { label: "All", value: "all" },
        { label: "Import", value: "import" },
        { label: "Export", value: "export" },
        { label: "Transhipment", value: "transhipment" },
      ],
    },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
    { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
    { name: "isMandatory", label: "Mandatory", type: "checkbox" },
    { name: "isActive", label: "Active", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [item] = await db
    .select()
    .from(cpmSurcharges)
    .where(
      and(
        eq(cpmSurcharges.id, id),
        eq(cpmSurcharges.tenantId, session.tenantId),
        isNull(cpmSurcharges.deletedAt)
      )
    )
    .limit(1);

  if (!item) notFound();

  const formatDt = (d: Date | string | null | undefined) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toISOString().slice(0, 16);
  };

  const initialData: Record<string, unknown> = {
    surchargeCode: item.surchargeCode ?? "",
    surchargeName: item.surchargeName ?? "",
    surchargeType: item.surchargeType ?? "",
    calculationBasis: item.calculationBasis ?? "",
    amount: item.amount != null ? Number(item.amount) : "",
    percentage: item.percentage != null ? Number(item.percentage) : "",
    currency: item.currency ?? "",
    applicableTo: item.applicableTo ?? "",
    tradeLane: item.tradeLane ?? "",
    originPort: item.originPort ?? "",
    destinationPort: item.destinationPort ?? "",
    containerType: item.containerType ?? "",
    containerSize: item.containerSize ?? "",
    effectiveFrom: formatDt(item.effectiveFrom),
    effectiveTo: formatDt(item.effectiveTo),
    isMandatory: item.isMandatory ?? false,
    isActive: item.isActive ?? true,
    notes: item.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/commercial-pricing-management/surcharges/${id}`}
          className="rounded-md p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Surcharge</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Surcharge"
          fields={fields}
          apiPath={`/api/v1/commercial-pricing-management/surcharges/${id}`}
          returnPath="/commercial-pricing-management/surcharges"
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
