import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortCallPlan } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  planned: "secondary",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
} as const;

export default async function PortCallPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const { id } = await params;

  const plan = await getPortCallPlan(id, session.tenantId);
  if (!plan) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "port_agency:edit"
  );

  function formatDate(d: Date | null | undefined): string {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/port-call-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{plan.planRef}</h1>
          <p className="text-sm text-gray-500">
            {plan.planType} &middot; {plan.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-agency-management/port-call-plans/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Plan Ref</dt>
            <dd className="mt-1 text-gray-900">{plan.planRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plan Type</dt>
            <dd className="mt-1 text-gray-900">{plan.planType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    plan.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {plan.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{plan.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{plan.imoNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">{plan.voyageRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{plan.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">{plan.portCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Berth Name</dt>
            <dd className="mt-1 text-gray-900">{plan.berthName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Terminal Name</dt>
            <dd className="mt-1 text-gray-900">{plan.terminalName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agent Name</dt>
            <dd className="mt-1 text-gray-900">{plan.agentName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Agent Contact Email
            </dt>
            <dd className="mt-1 text-gray-900">
              {plan.agentContactEmail || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Agent Contact Phone
            </dt>
            <dd className="mt-1 text-gray-900">
              {plan.agentContactPhone || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ETA</dt>
            <dd className="mt-1 text-gray-900">{formatDate(plan.eta)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ETD</dt>
            <dd className="mt-1 text-gray-900">{formatDate(plan.etd)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Pilot Required
            </dt>
            <dd className="mt-1 text-gray-900">
              {plan.pilotRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tug Required</dt>
            <dd className="mt-1 text-gray-900">
              {plan.tugRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tugs Count</dt>
            <dd className="mt-1 text-gray-900">{plan.tugsCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Charges Estimate
            </dt>
            <dd className="mt-1 text-gray-900">
              {plan.portChargesEstimate != null
                ? `${plan.portChargesEstimate} ${plan.portChargesCurrency || ""}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Charges Currency
            </dt>
            <dd className="mt-1 text-gray-900">
              {plan.portChargesCurrency || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Special Instructions
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {plan.specialInstructions || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {plan.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {plan.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {plan.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
