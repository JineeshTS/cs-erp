import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSeaCargoCharter } from "@/lib/sustainability-esg-reporting/service";
import { Badge } from "@/components/ui/badge";

export default async function SeaCargoCharterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const { id } = await params;

  const record = await getSeaCargoCharter(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ser:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sustainability-esg-reporting/sea-cargo-charters"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.charterRef}
          </h1>
          <p className="text-sm text-gray-500">Sea Cargo Charter</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/sustainability-esg-reporting/sea-cargo-charters/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Charter Ref</dt>
            <dd className="mt-1 text-gray-900">{record.charterRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active" ? "success" : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Charter Type</dt>
            <dd className="mt-1 text-gray-900">{record.charterType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Year
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingYear ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Voyages
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalVoyages ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Aligned Voyages
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.alignedVoyages ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Alignment Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.alignmentScore ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Climate Target
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.climateTarget || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Trajectory Year
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.trajectoryYear ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Required Intensity
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.requiredIntensity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Intensity
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.actualIntensity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gap to Target
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.gapToTarget ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Disclosure Level
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.disclosureLevel || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
