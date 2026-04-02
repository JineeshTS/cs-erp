import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIncidentInvestigation } from "@/lib/loss-prevention-risk-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function IncidentInvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:read")))
    redirect("/loss-prevention-risk-management");

  const { id } = await params;

  const record = await getIncidentInvestigation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "lpr:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/loss-prevention-risk-management/incident-investigations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.investigationRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.investigationType?.replace(/_/g, " ")} &middot; {record.title || "Untitled"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/loss-prevention-risk-management/incident-investigations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Investigation Ref</dt>
            <dd className="mt-1 text-gray-900">{record.investigationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Investigation Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.investigationType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{record.title || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Location Name</dt>
            <dd className="mt-1 text-gray-900">{record.locationName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Incident Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.incidentDate ? record.incidentDate.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Investigator</dt>
            <dd className="mt-1 text-gray-900">{record.investigator || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Severity</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.severity?.replace(/_/g, " ") || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Injured Persons</dt>
            <dd className="mt-1 text-gray-900">{record.injuredPersons ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Root Cause Method</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.rootCauseMethod?.replace(/_/g, " ") || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Root Cause Findings</dt>
            <dd className="mt-1 text-gray-900">{record.rootCauseFindings || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Corrective Actions</dt>
            <dd className="mt-1 text-gray-900">{record.correctiveActions || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Cost</dt>
            <dd className="mt-1 text-gray-900">{record.estimatedCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closed Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.closedDate ? record.closedDate.toLocaleDateString() : "-"}
            </dd>
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
