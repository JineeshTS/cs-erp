import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSpendAnalytic } from "@/lib/accounts-payable-vendor-management/service";
import {
  ApvmForm,
  type FieldConfig,
} from "@/components/accounts-payable-vendor-management/apvm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditSpendAnalyticPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:edit")))
    redirect("/accounts-payable-vendor-management/spend-analytics");


  const currencyOpts = await getCurrencyOptions();
  const { id } = await params;
  const record = await getSpendAnalytic(id, session.tenantId);
  if (!record) notFound();

  const fields: FieldConfig[] = [
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      required: true,
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "annual", label: "Annual" },
        { value: "vendor", label: "Vendor" },
        { value: "category", label: "Category" },
        { value: "department", label: "Department" },
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

  const initialData: Record<string, unknown> = {
    reportType: record.reportType ?? "",
    reportPeriod: record.reportPeriod ?? "",
    reportYear: record.reportYear ?? "",
    reportMonth: record.reportMonth ?? "",
    currency: record.currency ?? "",
    aiModelVersion: record.aiModelVersion ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/accounts-payable-vendor-management/spend-analytics/${record.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {record.reportRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update spend analytics report details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Spend Analytics"
          apiPath={`/api/v1/accounts-payable-vendor-management/spend-analytics/${record.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath={`/accounts-payable-vendor-management/spend-analytics/${record.id}`}
        />
      </div>
    </div>
  );
}
