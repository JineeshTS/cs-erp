import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyageClose } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

export default async function VoyageCloseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vrs:edit"
  );

  const { id } = await params;
  const record = await getVoyageClose(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/voyage-results-settlement/voyage-closes"
            className="rounded-md border p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.closeRef}
            </h1>
            <p className="text-sm text-gray-500">{record.title || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          {canEdit && (
            <Link
              href={`/voyage-results-settlement/voyage-closes/${record.id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Close Ref</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.closeRef || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Close Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {record.closeType?.replace(/_/g, " ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.title || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.voyageNumber || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.vesselName || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Voyage Start Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.voyageStartDate
                ? new Date(record.voyageStartDate).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Voyage End Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.voyageEndDate
                ? new Date(record.voyageEndDate).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Sign Off By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.signOffBy || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Sign Off Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.signOffDate
                ? new Date(record.signOffDate).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Revenue</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.totalRevenue !== null && record.totalRevenue !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.totalRevenue))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.totalCost !== null && record.totalCost !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.totalCost))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Net Result</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.netResult !== null && record.netResult !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.netResult))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Is Signed Off</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.isSignedOff ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.notes || "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
