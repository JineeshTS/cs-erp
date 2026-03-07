import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { PdaForm } from "@/components/port-disbursement-accounting/pda-form";
import type { FieldConfig } from "@/components/port-disbursement-accounting/pda-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewConsolidatedReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "disbursement:create"
    ))
  )
    redirect("/port-disbursement-accounting/consolidated-reports");

  const currencyOpts = await getCurrencyOptions();

  const FIELDS: FieldConfig[] = [
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      required: true,
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "annual", label: "Annual" },
        { value: "voyage", label: "Voyage" },
        { value: "port", label: "Port" },
        { value: "agent", label: "Agent" },
        { value: "custom", label: "Custom" },
      ],
    },
    {
      name: "reportPeriod",
      label: "Report Period",
      type: "text",
      required: true,
    },
    {
      name: "reportYear",
      label: "Report Year",
      type: "number",
      required: true,
    },
    {
      name: "reportMonth",
      label: "Report Month",
      type: "number",
      required: true,
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "aiModelVersion", label: "AI Model Version", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/consolidated-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Consolidated Report
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Consolidated Report"
          apiPath="/api/v1/port-disbursement-accounting/consolidated-reports"
          fields={FIELDS}
          returnPath="/port-disbursement-accounting/consolidated-reports"
        />
      </div>
    </div>
  );
}
