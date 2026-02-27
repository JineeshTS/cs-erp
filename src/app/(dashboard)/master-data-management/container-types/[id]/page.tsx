import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { containerTypes } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ContainerTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "containers:read")))
    redirect("/master-data-management");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "containers:edit"
  );

  const [containerType] = await db
    .select()
    .from(containerTypes)
    .where(
      and(
        eq(containerTypes.id, id),
        eq(containerTypes.tenantId, session.tenantId),
        isNull(containerTypes.deletedAt)
      )
    )
    .limit(1);

  if (!containerType) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/master-data-management/container-types"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {containerType.isoCode}
            </h1>
            <p className="text-sm text-gray-500">{containerType.description}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/master-data-management/container-types/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            General Information
          </h2>
        </div>
        <dl className="grid gap-4 px-6 py-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">ISO Code</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.isoCode}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.description}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Size Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.sizeType}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  containerType.status === "active" ? "success" : "secondary"
                }
              >
                {containerType.status}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Dimensions</h2>
        </div>
        <dl className="grid gap-4 px-6 py-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Length</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.lengthFt ? `${containerType.lengthFt} ft` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Width</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.widthFt ? `${containerType.widthFt} ft` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Height</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.heightFt ? `${containerType.heightFt} ft` : "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Weight & Capacity
          </h2>
        </div>
        <dl className="grid gap-4 px-6 py-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tare Weight</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.tareWeightKg
                ? `${containerType.tareWeightKg} kg`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Max Payload</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.maxPayloadKg
                ? `${containerType.maxPayloadKg} kg`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cubic Capacity
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.cubicCapacityCbm
                ? `${containerType.cubicCapacityCbm} cbm`
                : "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Container Features
          </h2>
        </div>
        <dl className="grid gap-4 px-6 py-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Reefer</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.isReefer ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Open Top</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.isOpenTop ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Flat Rack</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.isFlatRack ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tank</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {containerType.isTank ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
