import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";

const CASH_POSITION_FIELDS: FieldConfig[] = [
  {
    name: "positionType",
    label: "Position Type",
    type: "select",
    required: true,
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "forecast", label: "Forecast" },
      { value: "actual", label: "Actual" },
    ],
  },
  {
    name: "positionDate",
    label: "Position Date",
    type: "datetime-local",
  },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "QAR",
  },
  { name: "openingBalance", label: "Opening Balance", type: "text" },
  { name: "totalInflows", label: "Total Inflows", type: "text" },
  { name: "totalOutflows", label: "Total Outflows", type: "text" },
  { name: "closingBalance", label: "Closing Balance", type: "text" },
  { name: "netCashFlow", label: "Net Cash Flow", type: "text" },
  { name: "minimumBalance", label: "Minimum Balance", type: "text" },
  { name: "maximumBalance", label: "Maximum Balance", type: "text" },
  { name: "bankAccountId", label: "Bank Account ID", type: "text" },
  { name: "entityId", label: "Entity ID", type: "text" },
  { name: "variance", label: "Variance", type: "text" },
  {
    name: "variancePercentage",
    label: "Variance Percentage",
    type: "text",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCashPositionPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "treasury:create"))
  )
    redirect("/treasury-cash-management/cash-positions");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/cash-positions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Cash Position
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Cash Position"
          apiPath="/api/v1/treasury-cash-management/cash-positions"
          fields={CASH_POSITION_FIELDS}
          returnPath="/treasury-cash-management/cash-positions"
        />
      </div>
    </div>
  );
}
