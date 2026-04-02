import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  getPayment,
  listPaymentTransactions,
} from "@/lib/customer-portal/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "pending":
      return "secondary" as const;
    default:
      return "default" as const;
  }
}

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:read")))
    redirect("/customer-portal");

  const { id } = await params;

  const payment = await getPayment(id, session.tenantId);
  if (!payment) notFound();

  const transactions = await listPaymentTransactions(session.tenantId, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customer-portal/payments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {payment.paymentRef}
          </h1>
          <p className="text-sm text-gray-500">Payment Details</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Payment Ref</dt>
            <dd className="mt-1 text-gray-900">{payment.paymentRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice ID</dt>
            <dd className="mt-1 text-gray-900">{payment.invoiceId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-gray-900">{payment.amount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{payment.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Payment Method
            </dt>
            <dd className="mt-1 text-gray-900">{payment.paymentMethod}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gateway Provider
            </dt>
            <dd className="mt-1 text-gray-900">
              {payment.gatewayProvider ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gateway Ref</dt>
            <dd className="mt-1 text-gray-900">
              {payment.gatewayRef ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusBadgeVariant(payment.status)}>
                {payment.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Processed At</dt>
            <dd className="mt-1 text-gray-900">
              {payment.processedAt
                ? payment.processedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Failed At</dt>
            <dd className="mt-1 text-gray-900">
              {payment.failedAt ? payment.failedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Failure Reason
            </dt>
            <dd className="mt-1 text-gray-900">
              {payment.failureReason ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Refunded At</dt>
            <dd className="mt-1 text-gray-900">
              {payment.refundedAt ? payment.refundedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Refund Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {payment.refundAmount != null ? payment.refundAmount : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{payment.notes ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {payment.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {payment.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Transactions
        </h2>
        {transactions.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No transactions found for this payment.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Transaction Ref
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Error Code
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Error Message
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Processed At
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {txn.transactionRef}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {txn.transactionType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{txn.amount}</td>
                    <td className="px-4 py-3 text-gray-600">{txn.currency}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(txn.status)}>
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {txn.errorCode ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {txn.errorMessage ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {txn.processedAt
                        ? txn.processedAt.toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
