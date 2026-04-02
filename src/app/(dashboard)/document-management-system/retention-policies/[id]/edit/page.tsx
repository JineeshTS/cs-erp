import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsRetentionPolicies } from "@/db/schema";
import { DmsForm } from "@/components/document-management-system/dms-form";
import type { FieldConfig } from "@/components/document-management-system/dms-form";

const POLICY_FIELDS: FieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
  },
  {
    name: "documentType",
    label: "Document Type",
    type: "select",
    required: true,
    options: [
      { value: "bill_of_lading", label: "Bill of Lading" },
      { value: "invoice", label: "Invoice" },
      { value: "certificate", label: "Certificate" },
      { value: "contract", label: "Contract" },
      { value: "customs", label: "Customs" },
      { value: "manifest", label: "Manifest" },
      { value: "insurance", label: "Insurance" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "retentionDays",
    label: "Retention Days",
    type: "number",
    required: true,
  },
  {
    name: "archiveAfterDays",
    label: "Archive After Days",
    type: "number",
  },
  {
    name: "autoArchive",
    label: "Auto Archive",
    type: "checkbox",
  },
  {
    name: "autoDelete",
    label: "Auto Delete",
    type: "checkbox",
  },
  {
    name: "isActive",
    label: "Is Active",
    type: "checkbox",
  },
];

export default async function EditRetentionPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:edit")))
    redirect("/document-management-system/retention-policies");

  const { id } = await params;

  const policy = await db
    .select()
    .from(dmsRetentionPolicies)
    .where(
      and(
        eq(dmsRetentionPolicies.id, id),
        eq(dmsRetentionPolicies.tenantId, session.tenantId),
        isNull(dmsRetentionPolicies.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!policy) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/document-management-system/retention-policies/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Retention Policy
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DmsForm
          entityType="Retention Policy"
          apiPath={`/api/v1/document-management-system/retention-policies/${id}`}
          fields={POLICY_FIELDS}
          initialData={{
            name: policy.name,
            description: policy.description ?? "",
            documentType: policy.documentType,
            retentionDays: policy.retentionDays,
            archiveAfterDays: policy.archiveAfterDays ?? "",
            autoArchive: policy.autoArchive,
            autoDelete: policy.autoDelete,
            isActive: policy.isActive,
          }}
          isEdit
          returnPath={`/document-management-system/retention-policies/${id}`}
        />
      </div>
    </div>
  );
}
