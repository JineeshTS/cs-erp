import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getNetworkDesign } from "@/lib/fleet-deployment-planning/service";
import { Badge } from "@/components/ui/badge";

export default async function NetworkDesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "fdp:read")))
    redirect("/fleet-deployment-planning");

  const { id } = await params;

  const design = await getNetworkDesign(session.tenantId, id);

  if (!design) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "fdp:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet-deployment-planning/network-designs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{design.title}</h1>
          <p className="text-sm text-gray-500">{design.networkRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/fleet-deployment-planning/network-designs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Ref</dt>
            <dd className="mt-1 text-gray-900">{design.networkRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{design.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{design.networkType}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Service Name</dt>
            <dd className="mt-1 text-gray-900">{design.serviceName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vessel Count
            </dt>
            <dd className="mt-1 text-gray-900">{design.vesselCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Weekly Frequency
            </dt>
            <dd className="mt-1 text-gray-900">{design.weeklyFrequency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Round Trip Days
            </dt>
            <dd className="mt-1 text-gray-900">
              {design.roundTripDays || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-gray-900">{design.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Estimated Revenue
            </dt>
            <dd className="mt-1 text-gray-900">{design.estimatedRevenue}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Estimated Cost
            </dt>
            <dd className="mt-1 text-gray-900">{design.estimatedCost}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Net Contribution
            </dt>
            <dd className="mt-1 text-gray-900">{design.netContribution}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Port Rotation
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {design.portRotation || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {design.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
