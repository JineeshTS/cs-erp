import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFinalDa } from "@/lib/port-disbursement-accounting/service";
import { Badge } from "@/components/ui/badge";

export default async function FinalDaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:read")))
    redirect("/port-disbursement-accounting");

  const { id } = await params;

  const record = await getFinalDa(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "disbursement:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/final-das"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.fdaRef}
          </h1>
          <p className="text-sm text-gray-500">
            Final DA &middot; {record.vesselName}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/port-disbursement-accounting/final-das/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">FDA Ref</dt>
            <dd className="mt-1 text-gray-900">{record.fdaRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Proforma Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.proformaRef || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">{record.voyageRef || "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">{record.portCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{record.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agent Name</dt>
            <dd className="mt-1 text-gray-900">{record.agentName || "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Dues</dt>
            <dd className="mt-1 text-gray-900">
              {record.portDues.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Pilotage</dt>
            <dd className="mt-1 text-gray-900">
              {record.pilotage.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Towage</dt>
            <dd className="mt-1 text-gray-900">
              {record.towage.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Berth Hire</dt>
            <dd className="mt-1 text-gray-900">
              {record.berthHire.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cargo Handling
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.cargoHandling.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agency Fees</dt>
            <dd className="mt-1 text-gray-900">
              {record.agencyFees.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customs</dt>
            <dd className="mt-1 text-gray-900">
              {record.customs.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Miscellaneous
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.miscellaneous.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Actual</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalActual.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Estimate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalEstimate.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Variance Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.varianceAmount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Variance Percent
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.variancePercent !== null
                ? `${record.variancePercent}%`
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Exchange Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.exchangeRate !== null
                ? record.exchangeRate.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Base Currency Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.baseCurrencyAmount !== null
                ? record.baseCurrencyAmount.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.invoiceRef || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.invoiceDate
                ? new Date(record.invoiceDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Received Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.receivedDate
                ? new Date(record.receivedDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedByName || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedAt
                ? new Date(record.approvedAt).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved"
                    ? "success"
                    : record.status === "pending"
                      ? "secondary"
                      : "destructive"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {record.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
