import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getClaimAnalytic } from "@/lib/reefer-container-management/service";
import { Badge } from "@/components/ui/badge";

const riskLevelVariant = {
  low: "success",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
} as const;

export default async function ClaimAnalyticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/reefer-container-management");

  const { id } = await params;

  const record = await getClaimAnalytic(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "reefer:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/claim-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.analyticsRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.analysisType} analysis &middot; Risk: {record.riskLevel}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/reefer-container-management/claim-analytics/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Analytics Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.analyticsRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container</dt>
            <dd className="mt-1 text-gray-900">
              {record.containerNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.bookingRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer</dt>
            <dd className="mt-1 text-gray-900">
              {record.customerName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commodity</dt>
            <dd className="mt-1 text-gray-900">
              {record.commodityName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Analysis Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.analysisType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Level</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  riskLevelVariant[
                    record.riskLevel as keyof typeof riskLevelVariant
                  ] ?? "secondary"
                }
              >
                {record.riskLevel}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Score</dt>
            <dd className="mt-1 text-gray-900">
              {record.riskScore ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Temp Exceedance Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.tempExceedanceCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Exceedance (min)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalExceedanceMinutes ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Max Deviation (&deg;C)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.maxDeviationC ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Claim Probability
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.claimProbability ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Estimated Claim Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedClaimAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">
              {record.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Model Version
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.modelVersion || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confidence Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.confidenceScore ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Claim Filed
            </dt>
            <dd className="mt-1">
              <Badge variant={record.actualClaimFiled ? "destructive" : "success"}>
                {record.actualClaimFiled ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Claim Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.actualClaimAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Prediction Accuracy
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.predictionAccuracy ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              AI Recommendations
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.aiRecommendations || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "completed"
                    ? "success"
                    : record.status === "archived"
                      ? "secondary"
                      : "warning"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
