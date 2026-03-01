import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getAnomalyDetection } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function AnomalyDetectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const anomaly = await getAnomalyDetection(id, session.tenantId);
  if (!anomaly) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  function severityVariant(severity: string) {
    switch (severity) {
      case "critical":
      case "high":
        return "destructive" as const;
      case "medium":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  }

  function statusVariant(s: string) {
    switch (s) {
      case "resolved":
        return "success" as const;
      case "dismissed":
        return "outline" as const;
      case "detected":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  }

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Anomaly Ref", value: anomaly.anomalyRef },
    { label: "Detected Entity", value: anomaly.detectedEntity },
    { label: "Entity Ref", value: anomaly.entityRef },
    { label: "Anomaly Type", value: anomaly.anomalyType },
    {
      label: "Severity",
      value: (
        <Badge variant={severityVariant(anomaly.severity)}>
          {anomaly.severity}
        </Badge>
      ),
    },
    { label: "Currency", value: anomaly.currency },
    {
      label: "Expected Amount",
      value: anomaly.expectedAmount?.toLocaleString(),
    },
    { label: "Actual Amount", value: anomaly.actualAmount?.toLocaleString() },
    {
      label: "Deviation %",
      value:
        anomaly.deviationPercent != null
          ? `${anomaly.deviationPercent}%`
          : null,
    },
    { label: "Description", value: anomaly.description },
    {
      label: "AI Confidence",
      value:
        anomaly.aiConfidence != null ? `${anomaly.aiConfidence}%` : null,
    },
    { label: "Model Version", value: anomaly.modelVersion },
    { label: "Suggested Action", value: anomaly.suggestedAction },
    {
      label: "Status",
      value: (
        <Badge variant={statusVariant(anomaly.status)}>
          {anomaly.status}
        </Badge>
      ),
    },
    {
      label: "Acknowledged At",
      value: anomaly.acknowledgedAt
        ? new Date(anomaly.acknowledgedAt).toLocaleString()
        : null,
    },
    {
      label: "Resolved At",
      value: anomaly.resolvedAt
        ? new Date(anomaly.resolvedAt).toLocaleString()
        : null,
    },
    { label: "Resolution Notes", value: anomaly.resolutionNotes },
    { label: "Notes", value: anomaly.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/costing-financial-management/anomaly-detections"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {anomaly.anomalyRef}
            </h1>
            <p className="text-sm text-gray-500">
              Anomaly Detection Details
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/costing-financial-management/anomaly-detections/${anomaly.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
