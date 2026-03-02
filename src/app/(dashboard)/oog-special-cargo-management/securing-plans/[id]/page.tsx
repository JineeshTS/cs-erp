import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSecuringPlan } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function SecuringPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/oog-special-cargo-management");

  const { id } = await params;

  const record = await getSecuringPlan(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "oog_special:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/oog-special-cargo-management/securing-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.securingRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.containerNumber || "No container"} &middot;{" "}
            {record.lashingMethod || "No lashing method"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/oog-special-cargo-management/securing-plans/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Securing Ref</dt>
            <dd className="mt-1 text-gray-900">{record.securingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Acceptance Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.acceptanceRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerNumber || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Cargo Description
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.cargoDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Weight (kg)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.grossWeightKg ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Center of Gravity X
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.centerOfGravityX ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Center of Gravity Y
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.centerOfGravityY ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Center of Gravity Z
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.centerOfGravityZ ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Lashing Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lashingMethod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Lashing Material
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lashingMaterial || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Number of Lashings
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.numberOfLashings ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Blocking Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.blockingMethod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bracing Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.bracingMethod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Dunnage Required
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.dunnageRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Dunnage Material
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.dunnageMaterial || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Calculation Standard
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.calculationStandard || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Diagram URL</dt>
            <dd className="mt-1 text-gray-900">
              {record.diagramUrl || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified By</dt>
            <dd className="mt-1 text-gray-900">
              {record.verifiedByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified At</dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.verifiedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved" || record.status === "completed"
                    ? "success"
                    : record.status === "cancelled"
                      ? "destructive"
                      : record.status === "in_use"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {record.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
