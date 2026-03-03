import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBankAccount } from "@/lib/treasury-cash-management/service";
import { Badge } from "@/components/ui/badge";

export default async function BankAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:read")))
    redirect("/treasury-cash-management");

  const { id } = await params;

  const record = await getBankAccount(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "treasury:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/bank-accounts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.accountRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.bankName} &middot; {record.accountType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/treasury-cash-management/bank-accounts/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Account Ref</dt>
            <dd className="mt-1 text-gray-900">{record.accountRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Account Type</dt>
            <dd className="mt-1 text-gray-900">{record.accountType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
            <dd className="mt-1 text-gray-900">{record.bankName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Account Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.accountNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IBAN</dt>
            <dd className="mt-1 text-gray-900">{record.iban || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">SWIFT Code</dt>
            <dd className="mt-1 text-gray-900">{record.swiftCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Branch Name</dt>
            <dd className="mt-1 text-gray-900">{record.branchName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Branch Code</dt>
            <dd className="mt-1 text-gray-900">{record.branchCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.currentBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Available Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.availableBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Overdraft Limit
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.overdraftLimit ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Interest Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.interestRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Account Holder
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.accountHolder || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
            <dd className="mt-1 text-gray-900">{record.entityId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              GL Account Code
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.glAccountCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Opening Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.openingDate
                ? new Date(record.openingDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closing Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.closingDate
                ? new Date(record.closingDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "closed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
