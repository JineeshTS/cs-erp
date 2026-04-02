import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDamageAssessment } from "@/lib/mobile-operations-app/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  detected: "success",
  confirmed: "success",
  in_review: "warning",
  rejected: "destructive",
} as const;

export default async function DamageAssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:read")))
    redirect("/mobile-operations-app");

  const { id } = await params;

  const record = await getDamageAssessment(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "mob:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/damage-assessments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.assessmentRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.assessmentType} &middot; {record.containerNumber || "No container"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/mobile-operations-app/damage-assessments/${id}/edit`}
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
              Assessment Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.assessmentRef}</dd>
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
            <dt className="text-sm font-medium text-gray-500">
              Assessment Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.assessmentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Damage Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.damageLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Damage Category
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.damageCategory || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Severity Level
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.severityLevel || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              AI Confidence
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.aiConfidence ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              AI Detected Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.aiDetectedType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Estimated Repair Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedRepairCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Repair Currency
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.repairCurrency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Photo URL</dt>
            <dd className="mt-1 text-gray-900">
              {record.photoUrl || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Photo Count</dt>
            <dd className="mt-1 text-gray-900">
              {record.photoCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assessed By</dt>
            <dd className="mt-1 text-gray-900">
              {record.assessedBy || "-"}
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
