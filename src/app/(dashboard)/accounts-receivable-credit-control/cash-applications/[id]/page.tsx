import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCashApplication } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function CashApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "receivable:edit"
  );

  const { id } = await params;
  const application = await getCashApplication(id, session.tenantId);
  if (!application) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/accounts-receivable-credit-control/cash-applications"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {application.applicationRef}
            </h1>
            <p className="text-sm text-gray-500">Cash Application Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/accounts-receivable-credit-control/cash-applications/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Application Details
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Application Ref
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.applicationRef}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Customer Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.customerName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Account Number
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.accountNumber ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Payment Reference
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.paymentReference}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Payment Method
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.paymentMethod}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Payment Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.paymentDate
                ? new Date(application.paymentDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.currency ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Payment Amount
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {application.paymentAmount?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Applied Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.appliedAmount?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Unapplied Amount
            </dt>
            <dd className="mt-1 text-sm font-semibold text-orange-600">
              {application.unappliedAmount?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Bank Reference
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.bankReference ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Bank Account</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.bankAccount ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Auto Matched</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.autoMatched ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Match Confidence
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.matchConfidence != null
                ? `${application.matchConfidence}%`
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Applied By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {application.appliedByName ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  application.status === "fully_applied"
                    ? "success"
                    : application.status === "pending"
                      ? "secondary"
                      : application.status === "partially_applied"
                        ? "warning"
                        : application.status === "rejected" ||
                            application.status === "reversed"
                          ? "destructive"
                          : "default"
                }
              >
                {application.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {application.notes ?? "--"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
