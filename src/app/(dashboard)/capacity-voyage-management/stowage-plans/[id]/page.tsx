import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capStowagePlans } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function StowagePlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const sp = await db
    .select()
    .from(capStowagePlans)
    .where(
      and(
        eq(capStowagePlans.id, id),
        eq(capStowagePlans.tenantId, session.tenantId),
        isNull(capStowagePlans.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!sp) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/stowage-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {sp.containerNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Bay {sp.bayNumber ?? "-"} &middot; Row {sp.rowNumber ?? "-"}{" "}
            &middot; Tier {sp.tierNumber ?? "-"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/stowage-plans/${id}/edit`}
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
              {sp.vesselScheduleId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bay Plan ID</dt>
            <dd className="mt-1 text-gray-900">{sp.bayPlanId ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">{sp.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.containerType ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Size
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.containerSize ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ISO Code</dt>
            <dd className="mt-1 text-gray-900">{sp.isoCode ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Weight (kg)</dt>
            <dd className="mt-1 text-gray-900">{sp.weightKg ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bay Number</dt>
            <dd className="mt-1 text-gray-900">{sp.bayNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Row Number</dt>
            <dd className="mt-1 text-gray-900">{sp.rowNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tier Number</dt>
            <dd className="mt-1 text-gray-900">{sp.tierNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Is Hazmat</dt>
            <dd className="mt-1 text-gray-900">
              {sp.isHazmat ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hazmat Class</dt>
            <dd className="mt-1 text-gray-900">{sp.hazmatClass ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Is Reefer</dt>
            <dd className="mt-1 text-gray-900">
              {sp.isReefer ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reefer Temp
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.reeferTemp != null ? Number(sp.reeferTemp) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Is OOG</dt>
            <dd className="mt-1 text-gray-900">
              {sp.isOog ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              OOG Height (cm)
            </dt>
            <dd className="mt-1 text-gray-900">{sp.oogHeightCm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              OOG Width (cm)
            </dt>
            <dd className="mt-1 text-gray-900">{sp.oogWidthCm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">POL</dt>
            <dd className="mt-1 text-gray-900">{sp.pol ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">POD</dt>
            <dd className="mt-1 text-gray-900">{sp.pod ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Stacking Order
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.stackingOrder ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  sp.status === "loaded"
                    ? "success"
                    : sp.status === "discharged"
                      ? "default"
                      : sp.status === "shifted"
                        ? "destructive"
                        : "secondary"
                }
              >
                {sp.status}
              </Badge>
            </dd>
          </div>
          {sp.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {sp.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
