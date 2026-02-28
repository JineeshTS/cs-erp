import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cpmTariffs } from "@/db/schema";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const TARIFF_FIELDS: FieldConfig[] = [
  { name: "tariffCode", label: "Tariff Code", type: "text", required: true },
  { name: "tariffName", label: "Tariff Name", type: "text", required: true },
  { name: "tariffType", label: "Tariff Type", type: "select", options: [
    { value: "standard", label: "Standard" },
    { value: "contract", label: "Contract" },
    { value: "promotional", label: "Promotional" },
    { value: "spot", label: "Spot" },
  ]},
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "serviceType", label: "Service Type", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "suspended", label: "Suspended" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditTariffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "commercial:edit")))
    redirect("/commercial-pricing-management");

  const { id } = await params;
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

  const initialData: Record<string, unknown> = {
    tariffCode: record.tariffCode,
    tariffName: record.tariffName,
    tariffType: record.tariffType,
    tradeLane: record.tradeLane ?? "",
    originPort: record.originPort ?? "",
    destinationPort: record.destinationPort ?? "",
    serviceType: record.serviceType ?? "",
    currency: record.currency ?? "",
    effectiveFrom: record.effectiveFrom.toISOString(),
    effectiveTo: record.effectiveTo?.toISOString() ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/commercial-pricing-management/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Tariff</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Tariff"
          apiPath={`/api/v1/commercial-pricing-management/tariffs/${id}`}
          fields={TARIFF_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/commercial-pricing-management/${id}`}
        />
      </div>
    </div>
  );
}
