import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVarianceAnalysis } from "@/lib/port-disbursement-accounting/service";
import { Badge } from "@/components/ui/badge";

export default async function VarianceAnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:read")))
    redirect("/port-disbursement-accounting");

  const { id } = await params;
  const record = await getVarianceAnalysis(id, session.tenantId);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "disbursement:edit"
  );

  function statusVariant(status: string) {
    switch (status) {
      case "completed":
        return "success" as const;
      case "flagged":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/variance-analyses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.analysisRef}
          </h1>
          <p className="text-sm text-gray-500">Variance Analysis Details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-disbursement-accounting/variance-analyses/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Analysis Ref</dt>
            <dd className="mt-1 text-gray-900">{record.analysisRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Proforma Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.proformaRef || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">FDA Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.fdaRef || "--"}
            </dd>
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
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PDA Total</dt>
            <dd className="mt-1 text-gray-900">
              {record.pdaTotal.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">FDA Total</dt>
            <dd className="mt-1 text-gray-900">
              {record.fdaTotal.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Variance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalVariance.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Variance Percent
            </dt>
            <dd className="mt-1 text-gray-900">{record.variancePercent}%</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Deviation Threshold
            </dt>
            <dd className="mt-1 text-gray-900">{record.deviationThreshold}%</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Within Threshold
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.withinThreshold ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Root Cause Analysis
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.rootCauseAnalysis || "--"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Recommendations
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.recommendations || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Analysed By</dt>
            <dd className="mt-1 text-gray-900">
              {record.analysedByName || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reviewed By</dt>
            <dd className="mt-1 text-gray-900">
              {record.reviewedByName || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reviewed At</dt>
            <dd className="mt-1 text-gray-900">
              {record.reviewedAt
                ? new Date(record.reviewedAt).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
