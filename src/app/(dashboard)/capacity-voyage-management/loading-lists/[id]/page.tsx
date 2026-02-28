import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capLoadingLists } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function LoadingListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const [record] = await db
    .select()
    .from(capLoadingLists)
    .where(
      and(
        eq(capLoadingLists.id, id),
        eq(capLoadingLists.tenantId, session.tenantId),
        isNull(capLoadingLists.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/loading-lists"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Loading List</h1>
          <p className="text-sm text-gray-500">
            {record.listReference} &middot; {record.listType}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/loading-lists/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Vessel Schedule ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselScheduleId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Rotation ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.portRotationId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              List Reference
            </dt>
            <dd className="mt-1 text-gray-900">{record.listReference}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">List Type</dt>
            <dd className="mt-1 text-gray-900">{record.listType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Containers
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalContainers ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total TEU</dt>
            <dd className="mt-1 text-gray-900">{record.totalTeu ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Weight (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalWeightMt ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hazmat Count</dt>
            <dd className="mt-1 text-gray-900">{record.hazmatCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reefer Count</dt>
            <dd className="mt-1 text-gray-900">{record.reeferCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">OOG Count</dt>
            <dd className="mt-1 text-gray-900">{record.oogCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cut-Off Cargo
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.cutOffCargo)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cut-Off Documentation
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.cutOffDocumentation)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cut-Off VGM</dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.cutOffVgm)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Published At</dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.publishedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "final" || record.status === "closed"
                    ? "success"
                    : record.status === "preliminary"
                      ? "default"
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
