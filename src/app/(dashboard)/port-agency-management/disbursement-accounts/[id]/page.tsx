import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDisbursementAccount } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  issued: "default",
  paid: "success",
  overdue: "destructive",
  cancelled: "outline",
} as const;

export default async function DisbursementAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const { id } = await params;

  const account = await getDisbursementAccount(id, session.tenantId);
  if (!account) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "port_agency:edit"
  );

  function formatDate(d: Date | null | undefined): string {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/disbursement-accounts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {account.accountRef}
          </h1>
          <p className="text-sm text-gray-500">
            {account.accountType} &middot; {account.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-agency-management/disbursement-accounts/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{account.accountRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Account Type</dt>
            <dd className="mt-1 text-gray-900">{account.accountType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    account.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {account.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{account.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">
              {account.imoNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Call Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {account.portCallRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">
              {account.portName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">
              {account.voyageRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Principal Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {account.principalName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Principal Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {account.principalRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
            <dd className="mt-1 text-gray-900">
              {account.subtotal != null ? account.subtotal : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agency Fee</dt>
            <dd className="mt-1 text-gray-900">
              {account.agencyFee != null ? account.agencyFee : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
            <dd className="mt-1 text-gray-900">
              {account.taxAmount != null ? account.taxAmount : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-gray-900">
              {account.totalAmount != null
                ? `${account.totalAmount} ${account.currency || ""}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">
              {account.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Advance Received
            </dt>
            <dd className="mt-1 text-gray-900">
              {account.advanceReceived != null
                ? account.advanceReceived
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Balance Due</dt>
            <dd className="mt-1 text-gray-900">
              {account.balanceDue != null ? account.balanceDue : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Proforma Ref</dt>
            <dd className="mt-1 text-gray-900">
              {account.proformaRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Proforma Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {account.proformaAmount != null ? account.proformaAmount : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Variance Explanation
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {account.varianceExplanation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(account.dueDate)}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {account.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(account.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(account.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
