import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "vesselScheduleId",
    label: "Vessel Schedule ID",
    type: "text",
  },
  {
    name: "tradeLane",
    label: "Trade Lane",
    type: "text",
    required: true,
    placeholder: "Asia-Middle East",
  },
  {
    name: "originRegion",
    label: "Origin Region",
    type: "text",
    placeholder: "East Asia",
  },
  {
    name: "destinationRegion",
    label: "Destination Region",
    type: "text",
    placeholder: "Arabian Gulf",
  },
  {
    name: "allocatedTeu",
    label: "Allocated TEU",
    type: "number",
    required: true,
  },
  {
    name: "allocatedWeightMt",
    label: "Allocated Weight (MT)",
    type: "number",
  },
  {
    name: "utilizedTeu",
    label: "Utilized TEU",
    type: "number",
  },
  {
    name: "utilizedWeightMt",
    label: "Utilized Weight (MT)",
    type: "number",
  },
  {
    name: "allocationType",
    label: "Allocation Type",
    type: "select",
    options: [
      { value: "contract", label: "Contract" },
      { value: "spot", label: "Spot" },
      { value: "reserve", label: "Reserve" },
    ],
  },
  {
    name: "effectiveFrom",
    label: "Effective From",
    type: "datetime-local",
    required: true,
  },
  {
    name: "effectiveTo",
    label: "Effective To",
    type: "datetime-local",
  },
  {
    name: "priority",
    label: "Priority",
    type: "number",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
      { value: "expired", label: "Expired" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewTradeAllocationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "capacity:create"))
  )
    redirect("/capacity-voyage-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/trade-allocations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Trade Allocation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Trade Allocation"
          apiPath="/api/v1/capacity-voyage-management/trade-allocations"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/trade-allocations"
        />
      </div>
    </div>
  );
}
