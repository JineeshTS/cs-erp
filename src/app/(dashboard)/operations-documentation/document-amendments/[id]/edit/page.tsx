import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmDocumentAmendments } from "@/db/schema";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";

const FIELDS: FieldConfig[] = [
  {
    name: "amendmentNumber",
    label: "Amendment Number",
    type: "text",
    required: true,
  },
  {
    name: "amendmentType",
    label: "Amendment Type",
    type: "text",
    required: true,
  },
  {
    name: "fieldChanged",
    label: "Field Changed",
    type: "text",
    required: true,
  },
  { name: "oldValue", label: "Old Value", type: "textarea" },
  { name: "newValue", label: "New Value", type: "textarea" },
  { name: "reason", label: "Reason", type: "textarea" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  { name: "fee", label: "Fee", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDocumentAmendmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:edit")))
    redirect("/operations-documentation");

  const { id } = await params;
  const record = await db
    .select()
    .from(odmDocumentAmendments)
    .where(
      and(
        eq(odmDocumentAmendments.id, id),
        eq(odmDocumentAmendments.tenantId, session.tenantId),
        isNull(odmDocumentAmendments.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    amendmentNumber: record.amendmentNumber,
    amendmentType: record.amendmentType,
    fieldChanged: record.fieldChanged,
    oldValue: record.oldValue ?? "",
    newValue: record.newValue ?? "",
    reason: record.reason ?? "",
    status: record.status,
    fee: record.fee ?? "",
    currency: record.currency ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/operations-documentation/document-amendments/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Document Amendment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Document Amendment"
          apiPath={`/api/v1/operations-documentation/document-amendments/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/operations-documentation/document-amendments/${id}`}
        />
      </div>
    </div>
  );
}
