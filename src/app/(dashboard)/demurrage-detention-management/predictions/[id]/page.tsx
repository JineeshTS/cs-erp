import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmPrediction } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  active: "success",
  resolved: "secondary",
  expired: "warning",
  false_alarm: "destructive",
};

export default async function PredictionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { id } = await params;

  const prediction = await getDdmPrediction(id, session.tenantId);
  if (!prediction) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/predictions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {prediction.predictionRef}
          </h1>
          <p className="text-sm text-gray-500">Prediction Details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/demurrage-detention-management/predictions/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Prediction Ref</dt>
            <dd className="mt-1 text-gray-900">{prediction.predictionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{prediction.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{prediction.bookingRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{prediction.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{prediction.portName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Prediction Type</dt>
            <dd className="mt-1 text-gray-900">{prediction.predictionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Level</dt>
            <dd className="mt-1 text-gray-900">{prediction.riskLevel}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Predicted Demurrage Days</dt>
            <dd className="mt-1 text-gray-900">{prediction.predictedDemurrageDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Predicted Detention Days</dt>
            <dd className="mt-1 text-gray-900">{prediction.predictedDetentionDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Predicted Amount</dt>
            <dd className="mt-1 text-gray-900">
              {prediction.currency} {prediction.predictedAmount}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{prediction.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Confidence Score</dt>
            <dd className="mt-1 text-gray-900">{prediction.confidenceScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Version</dt>
            <dd className="mt-1 text-gray-900">{prediction.modelVersion || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">AI Insights</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {prediction.aiInsights || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alert Sent</dt>
            <dd className="mt-1 text-gray-900">{prediction.alertSent ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alert Sent At</dt>
            <dd className="mt-1 text-gray-900">
              {prediction.alertSentAt
                ? new Date(prediction.alertSentAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Actual Outcome</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {prediction.actualOutcome || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accuracy</dt>
            <dd className="mt-1 text-gray-900">{prediction.accuracy ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={STATUS_VARIANT[prediction.status] ?? "secondary"}>
                {prediction.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {prediction.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
