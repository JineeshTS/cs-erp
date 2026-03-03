import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCiiRating } from "@/lib/vessel-performance-efficiency/service";
import { Badge } from "@/components/ui/badge";

export default async function CiiRatingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:read")))
    redirect("/vessel-performance-efficiency");

  const { id } = await params;

  const record = await getCiiRating(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vpe:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/cii-ratings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.ratingRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.ratingType} &middot;{" "}
            {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-performance-efficiency/cii-ratings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Rating Ref</dt>
            <dd className="mt-1 text-gray-900">{record.ratingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rating Type</dt>
            <dd className="mt-1 text-gray-900">{record.ratingType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel ID</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">
              {record.imoNumber ?? "-"}
            </dd>
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
              Attained CII
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.attainedCii ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Required CII
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.requiredCii ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reduction Factor
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reductionFactor ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rating</dt>
            <dd className="mt-1 text-gray-900">{record.rating ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total CO2 Emissions
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalCo2Emissions ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Distance NM
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalDistanceNm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">DWT</dt>
            <dd className="mt-1 text-gray-900">{record.dwt ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Compliance Status
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.complianceStatus ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "verified"
                    ? "success"
                    : record.status === "published"
                      ? "default"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Corrective Action Plan
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.correctiveActionPlan || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
