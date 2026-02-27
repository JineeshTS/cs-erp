import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { vessels } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VesselDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vessels:read")))
    redirect("/master-data-management");

  const { id } = await params;

  const vessel = await db
    .select()
    .from(vessels)
    .where(
      and(
        eq(vessels.id, id),
        eq(vessels.tenantId, session.tenantId),
        isNull(vessels.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!vessel) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vessels:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/vessels"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{vessel.name}</h1>
          <p className="text-sm text-gray-500">
            IMO {vessel.imoNumber} &middot; {vessel.vesselType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/master-data-management/vessels/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{vessel.imoNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Call Sign</dt>
            <dd className="mt-1 text-gray-900">{vessel.callSign || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">MMSI</dt>
            <dd className="mt-1 text-gray-900">{vessel.mmsi || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Flag</dt>
            <dd className="mt-1 text-gray-900">{vessel.flag || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Type</dt>
            <dd className="mt-1 text-gray-900">{vessel.vesselType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={vessel.status === "active" ? "success" : "secondary"}
              >
                {vessel.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">TEU Capacity</dt>
            <dd className="mt-1 text-gray-900">
              {vessel.teuCapacity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">DWT</dt>
            <dd className="mt-1 text-gray-900">{vessel.dwt || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Tonnage
            </dt>
            <dd className="mt-1 text-gray-900">
              {vessel.grossTonnage || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Tonnage</dt>
            <dd className="mt-1 text-gray-900">
              {vessel.netTonnage || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">LOA (m)</dt>
            <dd className="mt-1 text-gray-900">{vessel.loa || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Beam (m)</dt>
            <dd className="mt-1 text-gray-900">{vessel.beam || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Draft (m)</dt>
            <dd className="mt-1 text-gray-900">{vessel.draft || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Built Year</dt>
            <dd className="mt-1 text-gray-900">
              {vessel.builtYear ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Builder</dt>
            <dd className="mt-1 text-gray-900">{vessel.builder || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Owner</dt>
            <dd className="mt-1 text-gray-900">{vessel.ownerName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Operator</dt>
            <dd className="mt-1 text-gray-900">
              {vessel.operatorName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Classification Society
            </dt>
            <dd className="mt-1 text-gray-900">
              {vessel.classificationSociety || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
