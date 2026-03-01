import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ArccForm } from "@/components/accounts-receivable-credit-control/arcc-form";
import type { FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";

export default async function NewAgingReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:create")))
    redirect("/");

  const fields: FieldConfig[] = [
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      required: true,
      options: [
        { label: "Summary", value: "summary" },
        { label: "Detailed", value: "detailed" },
        { label: "Customer", value: "customer" },
        { label: "Segment", value: "segment" },
        { label: "Currency", value: "currency" },
        { label: "Custom", value: "custom" },
      ],
    },
    {
      name: "reportDate",
      label: "Report Date",
      type: "datetime-local",
      required: true,
    },
    { name: "currency", label: "Currency", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Aging Report</h1>
        <p className="text-sm text-gray-500">
          Generate a new receivable aging report
        </p>
      </div>
      <ArccForm
        entityType="Aging Report"
        fields={fields}
        apiPath="/api/v1/accounts-receivable-credit-control/aging-reports"
        returnPath="/accounts-receivable-credit-control/aging-reports"
      />
    </div>
  );
}
