import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DmsForm } from "@/components/document-management-system/dms-form";
import type { FieldConfig } from "@/components/document-management-system/dms-form";

const ALERT_FIELDS: FieldConfig[] = [
  {
    name: "documentId",
    label: "Document ID",
    type: "text",
    required: true,
    placeholder: "Document UUID",
  },
  {
    name: "alertType",
    label: "Alert Type",
    type: "select",
    options: [
      { value: "expiry", label: "Expiry" },
      { value: "renewal", label: "Renewal" },
      { value: "review", label: "Review" },
    ],
  },
  {
    name: "alertDaysBefore",
    label: "Alert Days Before",
    type: "number",
  },
  {
    name: "alertDate",
    label: "Alert Date",
    type: "date",
    required: true,
  },
  {
    name: "assignedTo",
    label: "Assigned To",
    type: "text",
    placeholder: "User UUID",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewExpiryAlertPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:create")))
    redirect("/document-management-system/expiry-alerts");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/expiry-alerts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Expiry Alert</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DmsForm
          entityType="Expiry Alert"
          apiPath="/api/v1/document-management-system/expiry-alerts"
          fields={ALERT_FIELDS}
          returnPath="/document-management-system/expiry-alerts"
        />
      </div>
    </div>
  );
}
