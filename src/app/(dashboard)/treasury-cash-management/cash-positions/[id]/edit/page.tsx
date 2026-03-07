import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCashPosition } from "@/lib/treasury-cash-management/service";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditCashPositionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:edit")))
    redirect("/treasury-cash-management/cash-positions");

  const currencyOpts = await getCurrencyOptions();

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
      type: "select", options: currencyOpts,
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
  const { id } = await params;

  const record = await getCashPosition(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/treasury-cash-management/cash-positions/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Cash Position
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Cash Position"
          apiPath={`/api/v1/treasury-cash-management/cash-positions/${id}`}
          fields={CASH_POSITION_FIELDS}
          initialData={{
            positionType: record.positionType,
            positionDate: record.positionDate
              ? new Date(record.positionDate).toISOString()
              : "",
            currency: record.currency ?? "",
            openingBalance: record.openingBalance ?? "",
            totalInflows: record.totalInflows ?? "",
            totalOutflows: record.totalOutflows ?? "",
            closingBalance: record.closingBalance ?? "",
            netCashFlow: record.netCashFlow ?? "",
            minimumBalance: record.minimumBalance ?? "",
            maximumBalance: record.maximumBalance ?? "",
            bankAccountId: record.bankAccountId ?? "",
            entityId: record.entityId ?? "",
            variance: record.variance ?? "",
            variancePercentage: record.variancePercentage ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/treasury-cash-management/cash-positions/${id}`}
        />
      </div>
    </div>
  );
}
