import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { glAccounts } from "@/db/schema";
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

export default async function EditGlAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:edit")))
    redirect("/master-data-management/gl-accounts");

  const { id } = await params;

  const account = await db
    .select()
    .from(glAccounts)
    .where(
      and(
        eq(glAccounts.id, id),
        eq(glAccounts.tenantId, session.tenantId),
        isNull(glAccounts.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!account) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/master-data-management/gl-accounts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit GL Account</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="GL Account"
          apiPath={`/api/v1/master-data-management/gl-accounts/${id}`}
          fields={GL_ACCOUNT_FIELDS}
          initialData={{
            accountCode: account.accountCode,
            name: account.name,
            accountType: account.accountType,
            normalBalance: account.normalBalance,
            description: account.description ?? "",
          }}
          isEdit
          returnPath={`/master-data-management/gl-accounts/${id}`}
        />
      </div>
    </div>
  );
}
