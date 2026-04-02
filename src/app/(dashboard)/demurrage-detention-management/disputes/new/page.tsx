import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DdmForm, FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewDisputePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:create")))
    redirect("/");


  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const fields: FieldConfig[] = [
    {
      name: "invoiceRef",
      label: "Invoice Ref",
      type: "text",
      placeholder: "INV-XXXX",
    },
    {
      name: "customerName",
      label: "Customer Name",
      type: "select", options: customerOpts,
      required: true,
    },
    {
      name: "containerNumber",
      label: "Container Number",
      type: "text",
      placeholder: "ABCD1234567",
    },
    {
      name: "disputeType",
      label: "Dispute Type",
      type: "select",
      required: true,
      options: [
        { value: "free_time", label: "Free Time" },
        { value: "calculation_error", label: "Calculation Error" },
        { value: "gate_date", label: "Gate Date" },
        { value: "tariff_rate", label: "Tariff Rate" },
        { value: "waiver_request", label: "Waiver Request" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "disputeReason",
      label: "Dispute Reason",
      type: "textarea",
      required: true,
      placeholder: "Describe the reason for the dispute",
    },
    {
      name: "disputedAmount",
      label: "Disputed Amount",
      type: "text",
      required: true,
      placeholder: "0.00",
    },
    {
      name: "originalAmount",
      label: "Original Amount",
      type: "text",
      placeholder: "0.00",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "filedDate",
      label: "Filed Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "filedByName",
      label: "Filed By",
      type: "text",
      placeholder: "Name of filer",
    },
    {
      name: "assignedToName",
      label: "Assigned To",
      type: "text",
      placeholder: "Assignee name",
    },
    {
      name: "resolutionNotes",
      label: "Resolution Notes",
      type: "textarea",
      placeholder: "Notes about the resolution",
    },
    {
      name: "resolvedAmount",
      label: "Resolved Amount",
      type: "text",
      placeholder: "0.00",
    },
    {
      name: "resolvedDate",
      label: "Resolved Date",
      type: "datetime-local",
    },
    {
      name: "resolvedByName",
      label: "Resolved By",
      type: "text",
      placeholder: "Resolver name",
    },
    {
      name: "escalationLevel",
      label: "Escalation Level",
      type: "number",
      placeholder: "0",
    },
    {
      name: "slaDeadline",
      label: "SLA Deadline",
      type: "datetime-local",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Additional notes",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Dispute</h1>
        <p className="text-sm text-gray-500">
          File a new demurrage or detention dispute
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Dispute"
          apiPath="/api/v1/demurrage-detention-management/disputes"
          fields={fields}
          returnPath="/demurrage-detention-management/disputes"
        />
      </div>
    </div>
  );
}
