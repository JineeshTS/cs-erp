import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgingReport } from "@/lib/accounts-receivable-credit-control/service";
import { ArccForm } from "@/components/accounts-receivable-credit-control/arcc-form";
import type { FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";

export default async function EditAgingReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:edit")))
    redirect("/");

  const { id } = await params;
  const report = await getAgingReport(id, session.tenantId);
  if (!report) notFound();

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Aging Report</h1>
        <p className="text-sm text-gray-500">
          Update aging report {report.reportRef}
        </p>
      </div>
      <ArccForm
        entityType="Aging Report"
        fields={fields}
        initialData={report}
        isEdit
        apiPath={`/api/v1/accounts-receivable-credit-control/aging-reports/${id}`}
        returnPath="/accounts-receivable-credit-control/aging-reports"
        method="PUT"
      />
    </div>
  );
}
