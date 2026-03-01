import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const SERVICE_ACCOUNT_FIELDS: FieldConfig[] = [
  {
    name: "accountName",
    label: "Account Name",
    type: "text",
    required: true,
    placeholder: "billing-api-svc",
  },
  {
    name: "accountCode",
    label: "Account Code",
    type: "text",
    required: true,
    placeholder: "BILL-API",
  },
  {
    name: "serviceType",
    label: "Service Type",
    type: "select",
    required: true,
    options: [
      { value: "application", label: "Application" },
      { value: "system", label: "System" },
      { value: "integration", label: "Integration" },
      { value: "ci_cd", label: "CI/CD" },
      { value: "monitoring", label: "Monitoring" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewServiceAccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:create")))
    redirect("/infrastructure-security");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/service-accounts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Service Account
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm
          entityType="Service Account"
          apiPath="/api/v1/infrastructure-security/iam/service-accounts"
          fields={SERVICE_ACCOUNT_FIELDS}
          initialData={{ status: "active" }}
          returnPath="/infrastructure-security/service-accounts"
        />
      </div>
    </div>
  );
}
