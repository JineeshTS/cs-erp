import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoSlaBreaches } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const FIELDS: FieldConfig[] = [
  {
    name: "entityType",
    label: "Entity Type",
    type: "select",
    options: [
      { value: "inquiry", label: "Inquiry" },
      { value: "complaint", label: "Complaint" },
      { value: "service_request", label: "Service Request" },
    ],
  },
  {
    name: "entityId",
    label: "Entity ID",
    type: "text",
    required: true,
  },
  {
    name: "breachType",
    label: "Breach Type",
    type: "select",
    options: [
      { value: "response_time", label: "Response Time" },
      { value: "resolution_time", label: "Resolution Time" },
    ],
  },
  {
    name: "expectedAt",
    label: "Expected At",
    type: "datetime-local",
    required: true,
  },
  {
    name: "breachedAt",
    label: "Breached At",
    type: "datetime-local",
    required: true,
  },
  {
    name: "overageMinutes",
    label: "Overage (minutes)",
    type: "number",
  },
  {
    name: "acknowledged",
    label: "Acknowledged",
    type: "checkbox",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function EditSLABreachPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "customer_service:edit"
    ))
  )
    redirect("/customer-service-operations");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoSlaBreaches)
    .where(
      and(
        eq(csoSlaBreaches.id, id),
        eq(csoSlaBreaches.tenantId, session.tenantId),
        isNull(csoSlaBreaches.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    entityType: record.entityType,
    entityId: record.entityId,
    breachType: record.breachType,
    expectedAt: record.expectedAt.toISOString(),
    breachedAt: record.breachedAt.toISOString(),
    overageMinutes: record.overageMinutes ?? "",
    acknowledged: record.acknowledged,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/customer-service-operations/sla-breaches/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit SLA Breach</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="SLA Breach"
          apiPath={`/api/v1/customer-service-operations/sla-breaches/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/sla-breaches/${id}`}
        />
      </div>
    </div>
  );
}
