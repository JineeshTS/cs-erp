import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPscPreparation } from "@/lib/customs-compliance-regulatory/service";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default async function PscPreparationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:read")))
    redirect("/customs-compliance-regulatory");

  const { id } = await params;

  const record = await getPscPreparation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "customs:edit"
  );

  function statusVariant(
    s: string
  ): "success" | "destructive" | "secondary" | "warning" {
    switch (s) {
      case "completed":
        return "success";
      case "detained":
        return "destructive";
      case "in_progress":
        return "warning";
      default:
        return "secondary";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/psc-preparations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.pscRef}
          </h1>
          <p className="text-sm text-gray-500">
            PSC Preparation &middot; {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/customs-compliance-regulatory/psc-preparations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">PSC Ref</dt>
            <dd className="mt-1 text-gray-900">{record.pscRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{record.imoNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Flag State</dt>
            <dd className="mt-1 text-gray-900">{record.flagState || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Classification Society
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.classificationSociety || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspection Port
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.inspectionPort || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspection Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.inspectionDate?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspector Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.inspectorName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspection Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.inspectionType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">MOU Regime</dt>
            <dd className="mt-1 text-gray-900">{record.mouRegime || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Target Factor
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.targetFactor || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Deficiencies Found
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.deficienciesFound ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Detention Issued
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.detentionIssued ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Detention Reason
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.detentionReason || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rectified At</dt>
            <dd className="mt-1 text-gray-900">
              {record.rectifiedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Overall Result
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.overallResult || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
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
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
