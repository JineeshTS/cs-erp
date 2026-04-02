import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPolicyProcedure } from "@/lib/audit-compliance-management/service";
import { AcmForm } from "@/components/audit-compliance-management/acm-form";
import type { FieldConfig } from "@/components/audit-compliance-management/acm-form";

const fields: FieldConfig[] = [
  {
    name: "policyType",
    label: "Policy Type",
    type: "select",
    options: [
      { value: "policy", label: "Policy" },
      { value: "procedure", label: "Procedure" },
      { value: "guideline", label: "Guideline" },
      { value: "standard", label: "Standard" },
      { value: "manual", label: "Manual" },
    ],
  },
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
    placeholder: "Enter policy title",
  },
  {
    name: "version",
    label: "Version",
    type: "text",
    placeholder: "e.g. 1.0",
  },
  {
    name: "category",
    label: "Category",
    type: "text",
    placeholder: "Policy category",
  },
  {
    name: "department",
    label: "Department",
    type: "text",
    placeholder: "Responsible department",
  },
  {
    name: "author",
    label: "Author",
    type: "text",
    placeholder: "Document author",
  },
  {
    name: "approver",
    label: "Approver",
    type: "text",
    placeholder: "Approval authority",
  },
  {
    name: "approvalDate",
    label: "Approval Date",
    type: "datetime-local",
  },
  {
    name: "effectiveDate",
    label: "Effective Date",
    type: "datetime-local",
  },
  {
    name: "reviewDate",
    label: "Review Date",
    type: "datetime-local",
  },
  {
    name: "expiryDate",
    label: "Expiry Date",
    type: "datetime-local",
  },
  {
    name: "documentUrl",
    label: "Document URL",
    type: "text",
    placeholder: "https://...",
  },
  {
    name: "summary",
    label: "Summary",
    type: "textarea",
    placeholder: "Brief summary of the policy",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes",
  },
];

export default async function EditPolicyProcedurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getPolicyProcedure(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    policyType: record.policyType,
    title: record.title,
    version: record.version,
    category: record.category,
    department: record.department,
    author: record.author,
    approver: record.approver,
    approvalDate: record.approvalDate
      ? new Date(record.approvalDate).toISOString()
      : "",
    effectiveDate: record.effectiveDate
      ? new Date(record.effectiveDate).toISOString()
      : "",
    reviewDate: record.reviewDate
      ? new Date(record.reviewDate).toISOString()
      : "",
    expiryDate: record.expiryDate
      ? new Date(record.expiryDate).toISOString()
      : "",
    documentUrl: record.documentUrl,
    summary: record.summary,
    notes: record.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/audit-compliance-management/policy-procedures/${record.id}`}
          className="rounded-md border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Policy / Procedure
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="Policy / Procedure"
          apiPath={`/api/v1/audit-compliance-management/policy-procedures/${record.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath={`/audit-compliance-management/policy-procedures/${record.id}`}
        />
      </div>
    </div>
  );
}
