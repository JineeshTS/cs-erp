import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCrewRotation } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

export default async function CrewRotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const { id } = await params;

  const record = await getCrewRotation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "crew:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/crew-management/crew-rotations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.rotationRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.crewMemberName} &middot; {record.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/crew-management/crew-rotations/${id}/edit`}
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
              Crew Member Name
            </dt>
            <dd className="mt-1 text-gray-900">{record.crewMemberName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rank</dt>
            <dd className="mt-1 text-gray-900">{record.rank}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Nationality</dt>
            <dd className="mt-1 text-gray-900">
              {record.nationality || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Joining Date</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(record.joiningDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Relieving Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.relievingDate
                ? new Date(record.relievingDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contract Duration
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contractDuration
                ? `${record.contractDuration} months`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Rotation Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.rotationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Relieving Crew Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.relievingCrewName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Relief Port</dt>
            <dd className="mt-1 text-gray-900">
              {record.reliefPort || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Relief Country
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reliefCountry || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Approved By Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedByName || "-"}
            </dd>
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
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(record.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(record.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
