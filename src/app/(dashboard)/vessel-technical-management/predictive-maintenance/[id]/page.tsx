import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPredictiveMaintenance } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "resolved":
      return <Badge variant="success">{status}</Badge>;
    case "alert":
    case "action_required":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-gray-100 py-3 dark:border-gray-800">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="col-span-2 text-sm text-gray-900 dark:text-gray-100">
        {value ?? "-"}
      </dd>
    </div>
  );
}

export default async function PredictiveMaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "technical:edit"
  );

  const { id } = await params;
  const record = await getPredictiveMaintenance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/vessel-technical-management/predictive-maintenance"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {record.predictionRef}
          </h1>
          {statusBadge(record.status)}
        </div>
        {canEdit && (
          <Link
            href={`/vessel-technical-management/predictive-maintenance/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <dl className="space-y-0">
          <DetailRow label="Vessel Name" value={record.vesselName} />
          <DetailRow label="Equipment Code" value={record.equipmentCode} />
          <DetailRow label="Equipment Name" value={record.equipmentName} />
          <DetailRow label="Model Type" value={record.modelType} />
          <DetailRow label="Model Version" value={record.modelVersion} />
          <DetailRow
            label="Prediction Date"
            value={
              record.predictionDate
                ? new Date(record.predictionDate).toLocaleDateString()
                : null
            }
          />
          <DetailRow
            label="Predicted Failure Date"
            value={
              record.predictedFailureDate
                ? new Date(record.predictedFailureDate).toLocaleDateString()
                : null
            }
          />
          <DetailRow label="Confidence Score" value={record.confidenceScore} />
          <DetailRow label="Risk Level" value={record.riskLevel} />
          <DetailRow label="Current Condition" value={record.currentCondition} />
          <DetailRow label="Degradation Rate" value={record.degradationRate} />
          <DetailRow label="AI Insights" value={record.aiInsights} />
          <DetailRow label="Alerts Generated" value={record.alertsGenerated} />
          <DetailRow label="Alerts Sent" value={record.alertsSent} />
          <DetailRow label="Action Taken" value={record.actionTaken} />
          <DetailRow
            label="Action Date"
            value={
              record.actionDate
                ? new Date(record.actionDate).toLocaleDateString()
                : null
            }
          />
          <DetailRow label="Accuracy" value={record.accuracy} />
          <DetailRow label="Status" value={statusBadge(record.status)} />
        </dl>
      </div>
    </div>
  );
}
