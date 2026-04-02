import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getConsolidatedReport } from "@/lib/port-disbursement-accounting/service";
import { PdaForm } from "@/components/port-disbursement-accounting/pda-form";
import type { FieldConfig } from "@/components/port-disbursement-accounting/pda-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditConsolidatedReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "disbursement:edit"
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

  const { id } = await params;
  const record = await getConsolidatedReport(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    reportType: record.reportType,
    reportPeriod: record.reportPeriod,
    reportYear: record.reportYear,
    reportMonth: record.reportMonth,
    currency: record.currency ?? "",
    aiModelVersion: record.aiModelVersion ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-disbursement-accounting/consolidated-reports/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Consolidated Report
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Consolidated Report"
          apiPath={`/api/v1/port-disbursement-accounting/consolidated-reports/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/port-disbursement-accounting/consolidated-reports/${id}`}
        />
      </div>
    </div>
  );
}
