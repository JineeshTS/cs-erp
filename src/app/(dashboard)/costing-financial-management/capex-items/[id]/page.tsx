import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCapexItem } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function CapexItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const item = await getCapexItem(id, session.tenantId);
  if (!item) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "CAPEX Ref", value: item.capexRef },
    { label: "Asset Name", value: item.assetName },
    { label: "Asset Category", value: item.assetCategory },
    { label: "Cost Centre", value: item.costCentre },
    { label: "Currency", value: item.currency },
    { label: "Acquisition Cost", value: item.acquisitionCost?.toLocaleString() },
    { label: "Residual Value", value: item.residualValue?.toLocaleString() },
    { label: "Useful Life (Months)", value: item.usefulLifeMonths },
    { label: "Depreciation Method", value: item.depreciationMethod },
    { label: "Monthly Depreciation", value: item.monthlyDepreciation?.toLocaleString() },
    { label: "Accumulated Depreciation", value: item.accumulatedDepreciation?.toLocaleString() },
    { label: "Net Book Value", value: item.netBookValue?.toLocaleString() },
    {
      label: "Acquisition Date",
      value: item.acquisitionDate
        ? new Date(item.acquisitionDate).toLocaleDateString()
        : null,
    },
    {
      label: "In-Service Date",
      value: item.inServiceDate
        ? new Date(item.inServiceDate).toLocaleDateString()
        : null,
    },
    {
      label: "Disposal Date",
      value: item.disposalDate
        ? new Date(item.disposalDate).toLocaleDateString()
        : null,
    },
    { label: "Disposal Amount", value: item.disposalAmount?.toLocaleString() },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            item.status === "active"
              ? "success"
              : item.status === "disposed"
                ? "destructive"
                : "secondary"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    { label: "Notes", value: item.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/costing-financial-management/capex-items"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {item.capexRef}
            </h1>
            <p className="text-sm text-gray-500">CAPEX Item Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/costing-financial-management/capex-items/${item.id}/edit`}
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
