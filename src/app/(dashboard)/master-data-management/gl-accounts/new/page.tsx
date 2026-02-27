import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const GL_ACCOUNT_FIELDS = [
  {
    name: "accountCode",
    label: "Account Code",
    type: "text" as const,
    required: true,
  },
  {
    name: "name",
    label: "Account Name",
    type: "text" as const,
    required: true,
  },
  {
    name: "accountType",
    label: "Account Type",
    type: "select" as const,
    required: true,
    options: [
      { value: "asset", label: "Asset" },
      { value: "liability", label: "Liability" },
      { value: "equity", label: "Equity" },
      { value: "revenue", label: "Revenue" },
      { value: "expense", label: "Expense" },
    ],
  },
  {
    name: "normalBalance",
    label: "Normal Balance",
    type: "select" as const,
    options: [
      { value: "debit", label: "Debit" },
      { value: "credit", label: "Credit" },
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
  },
];

export default async function NewGlAccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "finance:create")))
    redirect("/master-data-management/gl-accounts");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/gl-accounts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add GL Account</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="GL Account"
          apiPath="/api/v1/master-data-management/gl-accounts"
          fields={GL_ACCOUNT_FIELDS}
          returnPath="/master-data-management/gl-accounts"
        />
      </div>
    </div>
  );
}
