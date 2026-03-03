import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getGhgReport } from "@/lib/sustainability-esg-reporting/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  calculated: "success",
  verified: "success",
  submitted: "warning",
  rejected: "destructive",
} as const;

export default async function GhgReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const { id } = await params;

  const record = await getGhgReport(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ser:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sustainability-esg-reporting/ghg-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.reportRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.reportType} &middot; {record.reportingYear ?? "No year"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/sustainability-esg-reporting/ghg-reports/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Report Ref</dt>
            <dd className="mt-1 text-gray-900">{record.reportRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Type</dt>
            <dd className="mt-1 text-gray-900">{record.reportType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Period
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingPeriod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Year
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingYear ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scope 1 Emissions (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.scope1EmissionsMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scope 2 Emissions (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.scope2EmissionsMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scope 3 Emissions (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.scope3EmissionsMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Emissions (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalEmissionsMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Baseline Year
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.baselineYear ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Baseline Emissions
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.baselineEmissions ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reduction (%)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reductionPct != null
                ? `${record.reductionPct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Verification Body
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.verificationBody || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified At</dt>
            <dd className="mt-1 text-gray-900">
              {record.verifiedAt
                ? new Date(record.verifiedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
