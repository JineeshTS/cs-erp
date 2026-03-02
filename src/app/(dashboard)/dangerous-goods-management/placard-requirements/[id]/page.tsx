import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPlacardRequirement } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function PlacardRequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { id } = await params;

  const placard = await getPlacardRequirement(id, session.tenantId);
  if (!placard) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/placard-requirements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {placard.placardRef}
          </h1>
          <p className="text-sm text-gray-500">
            Placard Requirement &middot; {placard.imdgClass || "Unknown Class"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/dangerous-goods-management/placard-requirements/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Placard Ref</dt>
            <dd className="mt-1 text-gray-900">{placard.placardRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">UN Number</dt>
            <dd className="mt-1 text-gray-900">{placard.unNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Class</dt>
            <dd className="mt-1 text-gray-900">{placard.imdgClass || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subsidiary Risk</dt>
            <dd className="mt-1 text-gray-900">{placard.subsidiaryRisk || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Placard Type</dt>
            <dd className="mt-1 text-gray-900">
              {placard.placardType
                ? placard.placardType.replace(/_/g, " ")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Label Code</dt>
            <dd className="mt-1 text-gray-900">{placard.labelCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Label Description</dt>
            <dd className="mt-1 text-gray-900">{placard.labelDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Placement Position</dt>
            <dd className="mt-1 text-gray-900">{placard.placementPosition || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Size Requirements</dt>
            <dd className="mt-1 text-gray-900">{placard.sizeRequirements || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Color Specification</dt>
            <dd className="mt-1 text-gray-900">{placard.colorSpecification || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Symbol Description</dt>
            <dd className="mt-1 text-gray-900">{placard.symbolDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applicable to Container</dt>
            <dd className="mt-1 text-gray-900">
              {placard.applicableToContainer ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applicable to Vehicle</dt>
            <dd className="mt-1 text-gray-900">
              {placard.applicableToVehicle ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applicable to Package</dt>
            <dd className="mt-1 text-gray-900">
              {placard.applicableToPackage ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Marine Pollutant Mark</dt>
            <dd className="mt-1 text-gray-900">
              {placard.marinePollutantMark ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Elevated Temperature</dt>
            <dd className="mt-1 text-gray-900">
              {placard.elevatedTemperature ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fumigation Warning</dt>
            <dd className="mt-1 text-gray-900">
              {placard.fumigationWarning ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Orientation Arrows</dt>
            <dd className="mt-1 text-gray-900">
              {placard.orientationArrows ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Reference</dt>
            <dd className="mt-1 text-gray-900">{placard.imdgReference || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Image URL</dt>
            <dd className="mt-1 text-gray-900">
              {placard.imageUrl ? (
                <a
                  href={placard.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Image
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  placard.status === "active"
                    ? "success"
                    : placard.status === "draft"
                      ? "secondary"
                      : "default"
                }
              >
                {placard.status}
              </Badge>
            </dd>
          </div>
          {placard.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {placard.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
