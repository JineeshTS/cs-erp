import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PdaForm, type FieldConfig } from "@/components/port-disbursement-accounting/pda-form";

const EXPENSE_ALLOCATION_FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "portCode", label: "Port Code", type: "text", required: true },
  { name: "portName", label: "Port Name", type: "text", required: true },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "fdaRef", label: "FDA Ref", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  {
    name: "totalPortCost",
    label: "Total Port Cost",
    type: "number",
    required: true,
  },
  {
    name: "allocationMethod",
    label: "Allocation Method",
    type: "select",
    required: true,
    options: [
      { value: "pro_rata", label: "Pro Rata" },
      { value: "weight_based", label: "Weight Based" },
      { value: "teu_based", label: "TEU Based" },
      { value: "revenue_based", label: "Revenue Based" },
      { value: "equal", label: "Equal" },
      { value: "manual", label: "Manual" },
    ],
  },
  { name: "allocationBasis", label: "Allocation Basis", type: "text" },
  { name: "allocatedToCargo", label: "Allocated to Cargo", type: "number" },
  { name: "allocatedToVessel", label: "Allocated to Vessel", type: "number" },
  {
    name: "allocatedToOverhead",
    label: "Allocated to Overhead",
    type: "number",
  },
  { name: "costCentre", label: "Cost Centre", type: "text" },
  { name: "glAccountCode", label: "GL Account Code", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewExpenseAllocationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "disbursement:create"
    ))
  )
    redirect("/port-disbursement-accounting/expense-allocations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/expense-allocations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Expense Allocation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Expense Allocation"
          apiPath="/api/v1/port-disbursement-accounting/expense-allocations"
          fields={EXPENSE_ALLOCATION_FIELDS}
          returnPath="/port-disbursement-accounting/expense-allocations"
        />
      </div>
    </div>
  );
}
