import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLeaseCostAllocation } from "@/lib/container-leasing-management/service";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";

const LEASE_COST_ALLOCATION_FIELDS: FieldConfig[] = [
  {
    name: "allocationType",
    label: "Allocation Type",
    type: "select",
    required: true,
    options: [
      { value: "trade_route", label: "Trade Route" },
      { value: "voyage", label: "Voyage" },
      { value: "service_loop", label: "Service Loop" },
      { value: "cost_center", label: "Cost Center" },
      { value: "project", label: "Project" },
    ],
  },
  { name: "agreementId", label: "Agreement ID", type: "text" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "allocationPeriod", label: "Allocation Period", type: "text" },
  { name: "containerCount", label: "Container Count", type: "number" },
  { name: "totalLeaseDays", label: "Total Lease Days", type: "number" },
  { name: "dailyRate", label: "Daily Rate", type: "text" },
  { name: "totalCostAllocated", label: "Total Cost Allocated", type: "text" },
  { name: "allocationCurrency", label: "Allocation Currency", type: "text" },
  { name: "costPerTeu", label: "Cost Per TEU", type: "text" },
  { name: "revenueGenerated", label: "Revenue Generated", type: "text" },
  { name: "profitMargin", label: "Profit Margin", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditLeaseCostAllocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getLeaseCostAllocation(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/container-leasing-management/lease-cost-allocations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Lease Cost Allocation
          </h1>
          <p className="text-sm text-muted-foreground">
            Update allocation record {record.allocationRef}
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="Lease Cost Allocation"
          apiPath={`/api/v1/container-leasing-management/lease-cost-allocations/${id}`}
          returnPath={`/container-leasing-management/lease-cost-allocations/${id}`}
          fields={LEASE_COST_ALLOCATION_FIELDS}
          isEdit
          initialData={{
            allocationType: record.allocationType,
            agreementId: record.agreementId ?? "",
            tradeLane: record.tradeLane ?? "",
            voyageRef: record.voyageRef ?? "",
            allocationPeriod: record.allocationPeriod ?? "",
            containerCount: record.containerCount ?? "",
            totalLeaseDays: record.totalLeaseDays ?? "",
            dailyRate: record.dailyRate ?? "",
            totalCostAllocated: record.totalCostAllocated ?? "",
            allocationCurrency: record.allocationCurrency ?? "",
            costPerTeu: record.costPerTeu ?? "",
            revenueGenerated: record.revenueGenerated ?? "",
            profitMargin: record.profitMargin ?? "",
            notes: record.notes ?? "",
          }}
        />
      </div>
    </div>
  );
}
