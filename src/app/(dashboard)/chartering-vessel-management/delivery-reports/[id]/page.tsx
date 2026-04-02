import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmDeliveryReports } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function DeliveryReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const dr = await db
    .select()
    .from(cvmDeliveryReports)
    .where(
      and(
        eq(cvmDeliveryReports.id, id),
        eq(cvmDeliveryReports.tenantId, session.tenantId),
        isNull(cvmDeliveryReports.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!dr) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/delivery-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Delivery Report - {dr.reportType}
          </h1>
          <p className="text-sm text-gray-500">
            {dr.vesselName || "Unknown vessel"} &middot;{" "}
            {dr.portName || "Unknown port"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/delivery-reports/${id}/edit`}
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
              Charter Party ID
            </dt>
            <dd className="mt-1 text-gray-900">{dr.charterPartyId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{dr.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Type</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{dr.reportType}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{dr.portName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Date</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(dr.reportDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={dr.status === "final" ? "success" : "secondary"}
              >
                {dr.status}
              </Badge>
            </dd>
          </div>
          {dr.bunkerRob != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Bunker ROB
              </dt>
              <dd className="mt-1">
                <pre className="overflow-x-auto rounded-md bg-gray-50 p-3 text-xs text-gray-900">
                  {JSON.stringify(dr.bunkerRob as Record<string, unknown>, null, 2)}
                </pre>
              </dd>
            </div>
          )}
          {dr.vesselCondition && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Vessel Condition
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {dr.vesselCondition}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Survey Reference
            </dt>
            <dd className="mt-1 text-gray-900">
              {dr.surveyReference || "-"}
            </dd>
          </div>
          {dr.remarks && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Remarks</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {dr.remarks}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
