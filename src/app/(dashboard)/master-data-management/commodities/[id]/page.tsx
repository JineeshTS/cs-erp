import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { commodities } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CommodityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vessels:read")))
    redirect("/master-data-management");

  const { id } = await params;

  const commodity = await db
    .select()
    .from(commodities)
    .where(
      and(
        eq(commodities.id, id),
        eq(commodities.tenantId, session.tenantId),
        isNull(commodities.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!commodity) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vessels:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/commodities"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {commodity.hsCode}
          </h1>
          <p className="text-sm text-gray-500">
            {commodity.shortDescription || commodity.description}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/master-data-management/commodities/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">HS Code</dt>
            <dd className="mt-1 text-gray-900">{commodity.hsCode}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">{commodity.description}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Short Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {commodity.shortDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-gray-900">
              {commodity.category || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Chapter</dt>
            <dd className="mt-1 text-gray-900">
              {commodity.chapter || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hazard Class</dt>
            <dd className="mt-1 text-gray-900">
              {commodity.hazardClass || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">UN Number</dt>
            <dd className="mt-1 text-gray-900">
              {commodity.unNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Unit of Measure
            </dt>
            <dd className="mt-1 text-gray-900">{commodity.unitOfMeasure}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Duty Rate (%)
            </dt>
            <dd className="mt-1 text-gray-900">
              {commodity.dutyRate ? Number(commodity.dutyRate) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Requires Fumigation
            </dt>
            <dd className="mt-1 text-gray-900">
              {commodity.requiresFumigation ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Requires Inspection
            </dt>
            <dd className="mt-1 text-gray-900">
              {commodity.requiresInspection ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Is Restricted</dt>
            <dd className="mt-1 text-gray-900">
              {commodity.isRestricted ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  commodity.status === "active" ? "success" : "secondary"
                }
              >
                {commodity.status}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
