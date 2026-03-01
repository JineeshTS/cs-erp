import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function NewOverheadAllocationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");

  const fields: FieldConfig[] = [
    { name: "costCentre", label: "Cost Centre", type: "text", required: true },
    {
      name: "allocationPeriod",
      label: "Allocation Period",
      type: "text",
      required: true,
    },
    {
      name: "allocationMethod",
      label: "Allocation Method",
      type: "select",
      required: true,
      options: [
        { value: "pro_rata", label: "Pro Rata" },
        { value: "direct", label: "Direct" },
        { value: "activity_based", label: "Activity Based" },
        { value: "headcount", label: "Headcount" },
        { value: "revenue_based", label: "Revenue Based" },
        { value: "floor_space", label: "Floor Space" },
        { value: "manual", label: "Manual" },
      ],
    },
    {
      name: "currency",
      label: "Currency",
      type: "text",
      placeholder: "USD",
    },
    {
      name: "totalOverhead",
      label: "Total Overhead",
      type: "number",
      required: true,
    },
    {
      name: "allocatedAmount",
      label: "Allocated Amount",
      type: "number",
      required: true,
    },
    { name: "allocationBase", label: "Allocation Base", type: "text" },
    { name: "allocationFactor", label: "Allocation Factor", type: "number" },
    { name: "targetEntity", label: "Target Entity", type: "text" },
    { name: "targetRef", label: "Target Ref", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/costing-financial-management/overhead-allocations"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Overhead Allocation
          </h1>
          <p className="text-sm text-gray-500">
            Create a new overhead allocation
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Overhead Allocation"
          apiPath="/api/v1/costing-financial-management/overhead-allocations"
          fields={fields}
          returnPath="/costing-financial-management/overhead-allocations"
        />
      </div>
    </div>
  );
}
