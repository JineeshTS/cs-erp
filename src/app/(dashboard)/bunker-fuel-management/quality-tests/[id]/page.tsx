import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getQualityTest } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function QualityTestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/bunker-fuel-management");

  const { id } = await params;

  const test = await getQualityTest(id, session.tenantId);
  if (!test) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bunker:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/quality-tests"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{test.testRef}</h1>
          <p className="text-sm text-gray-500">
            {test.vesselName} &middot; {test.fuelType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/bunker-fuel-management/quality-tests/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Test Ref</dt>
            <dd className="mt-1 text-gray-900">{test.testRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Stem ID</dt>
            <dd className="mt-1 text-gray-900">{test.stemId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Order ID</dt>
            <dd className="mt-1 text-gray-900">{test.orderId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{test.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sample Date</dt>
            <dd className="mt-1 text-gray-900">
              {test.sampleDate
                ? new Date(test.sampleDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lab Name</dt>
            <dd className="mt-1 text-gray-900">{test.labName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
            <dd className="mt-1 text-gray-900">{test.fuelType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Density</dt>
            <dd className="mt-1 text-gray-900">{test.density ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Viscosity</dt>
            <dd className="mt-1 text-gray-900">{test.viscosity ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sulphur Content
            </dt>
            <dd className="mt-1 text-gray-900">
              {test.sulphurContent ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Flash Point</dt>
            <dd className="mt-1 text-gray-900">{test.flashPoint ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Water Content
            </dt>
            <dd className="mt-1 text-gray-900">{test.waterContent ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Ash Content</dt>
            <dd className="mt-1 text-gray-900">{test.ashContent ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Calorific Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {test.calorificValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              ISO Compliant
            </dt>
            <dd className="mt-1 text-gray-900">
              {test.isoCompliant ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              MARPOL Compliant
            </dt>
            <dd className="mt-1 text-gray-900">
              {test.marpolCompliant ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  test.status === "passed"
                    ? "success"
                    : test.status === "failed"
                      ? "destructive"
                      : test.status === "in_progress"
                        ? "warning"
                        : "secondary"
                }
              >
                {test.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{test.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
