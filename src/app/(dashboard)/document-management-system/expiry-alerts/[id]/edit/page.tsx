import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsExpiryAlerts } from "@/db/schema";
import { DmsForm } from "@/components/document-management-system/dms-form";
import type { FieldConfig } from "@/components/document-management-system/dms-form";

const EDIT_FIELDS: FieldConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "notified", label: "Notified" },
      { value: "acknowledged", label: "Acknowledged" },
      { value: "renewed", label: "Renewed" },
      { value: "dismissed", label: "Dismissed" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
  {
    name: "renewalDate",
    label: "Renewal Date",
    type: "date",
  },
];

export default async function EditExpiryAlertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:edit")))
    redirect("/document-management-system/expiry-alerts");

  const { id } = await params;

  const alert = await db
    .select()
    .from(dmsExpiryAlerts)
    .where(
      and(
        eq(dmsExpiryAlerts.id, id),
        eq(dmsExpiryAlerts.tenantId, session.tenantId),
        isNull(dmsExpiryAlerts.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!alert) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/document-management-system/expiry-alerts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Expiry Alert
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DmsForm
          entityType="Expiry Alert"
          apiPath={`/api/v1/document-management-system/expiry-alerts/${id}`}
          fields={EDIT_FIELDS}
          initialData={{
            status: alert.status,
            notes: alert.notes ?? "",
            renewalDate: alert.renewalDate
              ? alert.renewalDate.toISOString().split("T")[0]
              : "",
          }}
          isEdit
          returnPath={`/document-management-system/expiry-alerts/${id}`}
        />
      </div>
    </div>
  );
}
