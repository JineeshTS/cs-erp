import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmVsaSlotRates } from "@/db/schema";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const fields: FieldConfig[] = [
  { name: "vsaPartner", label: "VSA Partner", type: "text", required: true },
  { name: "agreementReference", label: "Agreement Reference", type: "text", required: true },
  { name: "tradeLane", label: "Trade Lane", type: "text", required: true },
  { name: "serviceName", label: "Service Name", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "slotAllocationTeu", label: "Slot Allocation TEU", type: "number" },
  { name: "slotCostPerTeu", label: "Slot Cost Per TEU", type: "number", required: true },
  { name: "utilizationPercent", label: "Utilization %", type: "number" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "currency", label: "Currency", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Expired", value: "expired" },
      { label: "Suspended", value: "suspended" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVsaSlotRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [item] = await db
    .select()
    .from(cpmVsaSlotRates)
    .where(
      and(
        eq(cpmVsaSlotRates.id, id),
        eq(cpmVsaSlotRates.tenantId, session.tenantId),
        isNull(cpmVsaSlotRates.deletedAt)
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
          href={`/commercial-pricing-management/vsa-slot-rates/${id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit VSA Slot Rate</h1>
      </div>

      <CpmForm
        entityType="VSA Slot Rate"
        fields={fields}
        apiPath={`/api/v1/commercial-pricing-management/vsa-slot-rates/${id}`}
        returnPath="/commercial-pricing-management/vsa-slot-rates"
        initialData={defaultValues}
        isEdit
      />
    </div>
  );
}
