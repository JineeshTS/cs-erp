import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewRetentionPolicyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:create")))
    redirect("/document-management-system/retention-policies");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/retention-policies"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Retention Policy
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DmsForm
          entityType="Retention Policy"
          apiPath="/api/v1/document-management-system/retention-policies"
          fields={POLICY_FIELDS}
          returnPath="/document-management-system/retention-policies"
        />
      </div>
    </div>
  );
}
