import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { tariffCodes } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TariffCodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read")))
    redirect("/master-data-management");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "masterdata:edit"
  );

  const [tariff] = await db
    .select()
    .from(tariffCodes)
    .where(
      and(
        eq(tariffCodes.id, id),
        eq(tariffCodes.tenantId, session.tenantId),
        isNull(tariffCodes.deletedAt)
      )
    )
    .limit(1);

  if (!tariff) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/master-data-management/tariffs"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tariff.code}
            </h1>
            <p className="text-sm text-gray-500">{tariff.description}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/master-data-management/tariffs/${tariff.id}/edit`}
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
            Tariff Details
          </h2>
        </div>
        <dl className="grid gap-4 px-6 py-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tariff Code</dt>
            <dd className="mt-1 text-sm text-gray-900">{tariff.code}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  tariff.status === "active" ? "success" : "secondary"
                }
              >
                {tariff.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.description}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rate Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{tariff.rateType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rate Amount</dt>
            <dd className="mt-1 text-sm text-gray-900">{tariff.rateAmount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">{tariff.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Per Unit</dt>
            <dd className="mt-1 text-sm text-gray-900">{tariff.perUnit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective From
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.effectiveFrom}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective To
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.effectiveTo ?? "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Origin Port ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.originPortId ?? "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Port ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.destinationPortId ?? "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Commodity ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.commodityId ?? "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Type ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.containerTypeId ?? "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {tariff.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
