import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmDetentionDemurrage } from "@/db/schema";
import { CpmForm, type FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

export default async function EditDetentionDemurragePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [record] = await db
    .select()
    .from(cpmDetentionDemurrage)
    .where(
      and(
        eq(cpmDetentionDemurrage.id, id),
        eq(cpmDetentionDemurrage.tenantId, session.tenantId),
        isNull(cpmDetentionDemurrage.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  const fields: FieldConfig[] = [
    { name: "tariffCode", label: "Tariff Code", type: "text", required: true },
    { name: "tariffName", label: "Tariff Name", type: "text", required: true },
    {
      name: "chargeType",
      label: "Charge Type",
      type: "select",
      options: [
        { label: "Detention", value: "detention" },
        { label: "Demurrage", value: "demurrage" },
        { label: "Combined", value: "combined" },
      ],
    },
    { name: "portCode", label: "Port Code", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "freeTimeDays", label: "Free Time (Days)", type: "number", required: true },
    { name: "dailyRate", label: "Daily Rate", type: "number", required: true },
    { name: "escalationRate", label: "Escalation Rate", type: "number" },
    { name: "escalationAfterDays", label: "Escalation After (Days)", type: "number" },
    { name: "maximumDays", label: "Maximum Days", type: "number" },
    { name: "currency", label: "Currency", type: "text" },
    { name: "customerSegment", label: "Customer Segment", type: "text" },
    { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
    { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Expired", value: "expired" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    tariffCode: record.tariffCode,
    tariffName: record.tariffName,
    chargeType: record.chargeType ?? undefined,
    portCode: record.portCode ?? undefined,
    containerType: record.containerType ?? undefined,
    containerSize: record.containerSize ?? undefined,
    freeTimeDays: record.freeTimeDays ?? undefined,
    dailyRate: record.dailyRate != null ? Number(record.dailyRate) : undefined,
    escalationRate: record.escalationRate != null ? Number(record.escalationRate) : undefined,
    escalationAfterDays: record.escalationAfterDays ?? undefined,
    maximumDays: record.maximumDays ?? undefined,
    currency: record.currency ?? undefined,
    customerSegment: record.customerSegment ?? undefined,
    effectiveFrom: record.effectiveFrom
      ? new Date(record.effectiveFrom).toISOString().slice(0, 16)
      : undefined,
    effectiveTo: record.effectiveTo
      ? new Date(record.effectiveTo).toISOString().slice(0, 16)
      : undefined,
    status: record.status ?? undefined,
    notes: record.notes ?? undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/commercial-pricing-management/detention-demurrage/${record.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Detention &amp; Demurrage</h1>
      </div>

      <CpmForm
        entityType="Detention & Demurrage"
        fields={fields}
        apiPath={`/api/v1/commercial-pricing-management/detention-demurrage/${record.id}`}
        returnPath="/commercial-pricing-management/detention-demurrage"
        initialData={initialData}
        isEdit
      />
    </div>
  );
}
