import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTransitProcedure } from "@/lib/customs-compliance-regulatory/service";
import { Badge } from "@/components/ui/badge";

export default async function TransitProcedureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:read")))
    redirect("/customs-compliance-regulatory");

  const { id } = await params;
  const record = await getTransitProcedure(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "customs:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/transit-procedures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.transitRef}
          </h1>
          <p className="text-sm text-gray-500">Transit Procedure</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/customs-compliance-regulatory/transit-procedures/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Transit Ref</dt>
            <dd className="mt-1 text-gray-900">{record.transitRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Procedure Type</dt>
            <dd className="mt-1 text-gray-900">{record.procedureType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Declaration Number</dt>
            <dd className="mt-1 text-gray-900">{record.declarationNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customs Office Origin</dt>
            <dd className="mt-1 text-gray-900">{record.customsOfficeOrigin || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customs Office Destination</dt>
            <dd className="mt-1 text-gray-900">{record.customsOfficeDestination || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Principal Name</dt>
            <dd className="mt-1 text-gray-900">{record.principalName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Principal Code</dt>
            <dd className="mt-1 text-gray-900">{record.principalCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Guarantee Type</dt>
            <dd className="mt-1 text-gray-900">{record.guaranteeType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Guarantee Amount</dt>
            <dd className="mt-1 text-gray-900">{record.guaranteeAmount || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Guarantee Currency</dt>
            <dd className="mt-1 text-gray-900">{record.guaranteeCurrency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Guarantee Reference</dt>
            <dd className="mt-1 text-gray-900">{record.guaranteeReference || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Seal Number</dt>
            <dd className="mt-1 text-gray-900">{record.sealNumber || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Cargo Description</dt>
            <dd className="mt-1 text-gray-900">{record.cargoDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">HS Code</dt>
            <dd className="mt-1 text-gray-900">{record.hsCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Weight (kg)</dt>
            <dd className="mt-1 text-gray-900">{record.grossWeightKg || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Country</dt>
            <dd className="mt-1 text-gray-900">{record.originCountry || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Country</dt>
            <dd className="mt-1 text-gray-900">{record.destinationCountry || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Route Description</dt>
            <dd className="mt-1 text-gray-900">{record.routeDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Transit Start</dt>
            <dd className="mt-1 text-gray-900">
              {record.transitStartAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Transit Deadline</dt>
            <dd className="mt-1 text-gray-900">
              {record.transitDeadlineAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Transit Completed</dt>
            <dd className="mt-1 text-gray-900">
              {record.transitCompletedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Discharged</dt>
            <dd className="mt-1 text-gray-900">
              {record.discharged ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "completed"
                    ? "success"
                    : record.status === "cancelled"
                      ? "destructive"
                      : record.status === "active"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
