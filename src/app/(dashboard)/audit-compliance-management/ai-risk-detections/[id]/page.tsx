import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAiRiskDetection } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function riskLevelBadgeVariant(level: string | null | undefined) {
  if (!level) return "secondary" as const;
  if (level === "critical" || level === "high") return "destructive" as const;
  if (level === "medium") return "warning" as const;
  return "success" as const;
}

function statusBadgeVariant(status: string) {
  if (status === "resolved") return "success" as const;
  if (status === "dismissed") return "secondary" as const;
  if (status === "investigating") return "warning" as const;
  return "default" as const;
}

export default async function AiRiskDetectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "audit:edit"
  );

  const { id } = await params;
  const record = await getAiRiskDetection(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/audit-compliance-management/ai-risk-detections"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.title}
            </h1>
            <p className="text-sm text-gray-500">{record.detectionRef}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/audit-compliance-management/ai-risk-detections/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Detection Ref</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.detectionRef}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Title</p>
            <p className="mt-1 text-sm text-gray-900">{record.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Detection Type</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.detectionType || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Model Name</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.modelName || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Model Version</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.modelVersion || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Entity Type</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.entityType || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Entity Ref</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.entityRef || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Risk Score</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.riskScore ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Confidence Score
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.confidenceScore ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Risk Level</p>
            <div className="mt-1">
              {record.riskLevel ? (
                <Badge variant={riskLevelBadgeVariant(record.riskLevel)}>
                  {record.riskLevel}
                </Badge>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Threshold</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.threshold ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Above Threshold
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.isAboveThreshold ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Investigation Status
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.investigationStatus || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Investigated By
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.investigatedBy || "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">
              Resolution Notes
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.resolutionNotes || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Detected At</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.detectedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusBadgeVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
