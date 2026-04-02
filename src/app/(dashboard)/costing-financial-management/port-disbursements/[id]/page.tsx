import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getPortDisbursement } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function PortDisbursementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const disbursement = await getPortDisbursement(id, session.tenantId);
  if (!disbursement) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Disbursement Ref", value: disbursement.disbursementRef },
    { label: "Voyage Ref", value: disbursement.voyageRef },
    { label: "Vessel Name", value: disbursement.vesselName },
    { label: "Port", value: disbursement.port },
    { label: "Agent Name", value: disbursement.agentName },
    { label: "Disbursement Type", value: disbursement.disbursementType },
    { label: "Currency", value: disbursement.currency },
    { label: "PDA Amount", value: disbursement.pdaAmount },
    { label: "FDA Amount", value: disbursement.fdaAmount },
    { label: "Variance Amount", value: disbursement.varianceAmount },
    { label: "Port Dues", value: disbursement.portDues },
    { label: "Pilotage", value: disbursement.pilotage },
    { label: "Towage", value: disbursement.towage },
    { label: "Berth", value: disbursement.berth },
    { label: "Cargo Handling", value: disbursement.cargoHandling },
    { label: "Agency Fee", value: disbursement.agencyFee },
    { label: "Other Charges", value: disbursement.otherCharges },
    { label: "Total Amount", value: disbursement.totalAmount },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            disbursement.status === "approved" || disbursement.status === "paid"
              ? "success"
              : "secondary"
          }
        >
          {disbursement.status}
        </Badge>
      ),
    },
    {
      label: "Submitted At",
      value: disbursement.submittedAt
        ? new Date(disbursement.submittedAt).toLocaleString()
        : null,
    },
    {
      label: "Approved At",
      value: disbursement.approvedAt
        ? new Date(disbursement.approvedAt).toLocaleString()
        : null,
    },
    { label: "Notes", value: disbursement.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/costing-financial-management/port-disbursements"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {disbursement.disbursementRef}
            </h1>
            <p className="text-sm text-gray-500">
              Port Disbursement Details
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/costing-financial-management/port-disbursements/${disbursement.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
