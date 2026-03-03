import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewPolicyProcedurePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/audit-compliance-management/policy-procedures"
          className="rounded-md border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Policy / Procedure
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="Policy / Procedure"
          apiPath="/api/v1/audit-compliance-management/policy-procedures"
          fields={fields}
          returnPath="/audit-compliance-management/policy-procedures"
        />
      </div>
    </div>
  );
}
