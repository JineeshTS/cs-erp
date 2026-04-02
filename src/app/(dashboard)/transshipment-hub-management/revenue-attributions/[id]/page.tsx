import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRevenueAttribution } from "@/lib/transshipment-hub-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function RevenueAttributionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:read")))
    redirect("/transshipment-hub-management");

  const { id } = await params;

  const record = await getRevenueAttribution(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "thm:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/revenue-attributions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.attributionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.attributionType?.replace(/_/g, " ")} &middot; {record.hubPort || "No hub port"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/transshipment-hub-management/revenue-attributions/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Attribution Ref</dt>
            <dd className="mt-1 text-gray-900">{record.attributionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Attribution Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.attributionType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{record.bookingRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hub Port</dt>
            <dd className="mt-1 text-gray-900">{record.hubPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Leg From</dt>
            <dd className="mt-1 text-gray-900">{record.legFrom || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Leg To</dt>
            <dd className="mt-1 text-gray-900">{record.legTo || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Freight Revenue</dt>
            <dd className="mt-1 text-gray-900">{record.freightRevenue ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Handling Cost</dt>
            <dd className="mt-1 text-gray-900">{record.handlingCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hub Cost</dt>
            <dd className="mt-1 text-gray-900">{record.hubCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Margin</dt>
            <dd className="mt-1 text-gray-900">{record.netMargin ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Margin %</dt>
            <dd className="mt-1 text-gray-900">{record.marginPct ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
