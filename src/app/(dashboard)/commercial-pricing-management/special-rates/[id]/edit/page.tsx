import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmSpecialRates } from "@/db/schema";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditSpecialRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "rateCode", label: "Rate Code", type: "text", required: true },
    { name: "rateName", label: "Rate Name", type: "text", required: true },
    {
      name: "rateType",
      label: "Rate Type",
      type: "select",
      options: [
        { label: "Contract", value: "contract" },
        { label: "Spot", value: "spot" },
        { label: "Promotional", value: "promotional" },
        { label: "Loyalty", value: "loyalty" },
      ],
    },
    { name: "customerId", label: "Customer ID", type: "select", options: customerOpts },
    { name: "customerSegment", label: "Customer Segment", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "baseRate", label: "Base Rate", type: "number", required: true },
    { name: "discountPercent", label: "Discount %", type: "number" },
    { name: "finalRate", label: "Final Rate", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "minimumCommitmentTeu", label: "Min Commitment (TEU)", type: "number" },
    { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
    { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Active", value: "active" },
        { label: "Expired", value: "expired" },
        { label: "Suspended", value: "suspended" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [item] = await db
    .select()
    .from(cpmSpecialRates)
    .where(
      and(
        eq(cpmSpecialRates.id, id),
        eq(cpmSpecialRates.tenantId, session.tenantId),
        isNull(cpmSpecialRates.deletedAt)
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
    rateCode: item.rateCode ?? "",
    rateName: item.rateName ?? "",
    rateType: item.rateType ?? "",
    customerId: item.customerId ?? "",
    customerSegment: item.customerSegment ?? "",
    originPort: item.originPort ?? "",
    destinationPort: item.destinationPort ?? "",
    tradeLane: item.tradeLane ?? "",
    containerType: item.containerType ?? "",
    containerSize: item.containerSize ?? "",
    baseRate: item.baseRate != null ? Number(item.baseRate) : "",
    discountPercent: item.discountPercent != null ? Number(item.discountPercent) : "",
    finalRate: item.finalRate != null ? Number(item.finalRate) : "",
    currency: item.currency ?? "",
    minimumCommitmentTeu:
      item.minimumCommitmentTeu != null ? Number(item.minimumCommitmentTeu) : "",
    effectiveFrom: formatDt(item.effectiveFrom),
    effectiveTo: formatDt(item.effectiveTo),
    status: item.status ?? "",
    notes: item.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/commercial-pricing-management/special-rates/${id}`}
          className="rounded-md p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Special Rate</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Special Rate"
          fields={fields}
          apiPath={`/api/v1/commercial-pricing-management/special-rates/${id}`}
          returnPath="/commercial-pricing-management/special-rates"
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
