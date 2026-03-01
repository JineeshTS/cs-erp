import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getOverheadAllocation } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function OverheadAllocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const allocation = await getOverheadAllocation(id, session.tenantId);
  if (!allocation) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Allocation Ref", value: allocation.allocationRef },
    { label: "Cost Centre", value: allocation.costCentre },
    { label: "Allocation Period", value: allocation.allocationPeriod },
    { label: "Allocation Method", value: allocation.allocationMethod },
    { label: "Currency", value: allocation.currency },
    { label: "Total Overhead", value: allocation.totalOverhead },
    { label: "Allocated Amount", value: allocation.allocatedAmount },
    { label: "Allocation Base", value: allocation.allocationBase },
    { label: "Allocation Factor", value: allocation.allocationFactor },
    { label: "Target Entity", value: allocation.targetEntity },
    { label: "Target Ref", value: allocation.targetRef },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            allocation.status === "approved" || allocation.status === "posted"
              ? "success"
              : "secondary"
          }
        >
          {allocation.status}
        </Badge>
      ),
    },
    {
      label: "Approved At",
      value: allocation.approvedAt
        ? new Date(allocation.approvedAt).toLocaleString()
        : null,
    },
    { label: "Notes", value: allocation.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/costing-financial-management/overhead-allocations"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {allocation.allocationRef}
            </h1>
            <p className="text-sm text-gray-500">
              Overhead Allocation Details
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/costing-financial-management/overhead-allocations/${allocation.id}/edit`}
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
