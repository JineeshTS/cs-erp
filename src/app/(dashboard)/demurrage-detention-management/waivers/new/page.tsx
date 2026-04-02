import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DdmForm, FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewWaiverPage() {
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
      name: "waiverType",
      label: "Waiver Type",
      type: "select",
      required: true,
      options: [
        { value: "full", label: "Full" },
        { value: "partial", label: "Partial" },
        { value: "percentage", label: "Percentage" },
        { value: "time_extension", label: "Time Extension" },
      ],
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
      name: "invoiceRef",
      label: "Invoice Ref",
      type: "text",
      placeholder: "INV-XXXX",
    },
    {
      name: "originalAmount",
      label: "Original Amount",
      type: "text",
      required: true,
      placeholder: "0.00",
    },
    {
      name: "waivedAmount",
      label: "Waived Amount",
      type: "text",
      required: true,
      placeholder: "0.00",
    },
    {
      name: "waiverPercent",
      label: "Waiver Percent",
      type: "text",
      placeholder: "0",
    },
    {
      name: "remainingAmount",
      label: "Remaining Amount",
      type: "text",
      placeholder: "0.00",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "reason",
      label: "Reason",
      type: "textarea",
      required: true,
      placeholder: "Reason for the waiver request",
    },
    {
      name: "justification",
      label: "Justification",
      type: "textarea",
      placeholder: "Business justification",
    },
    {
      name: "requestedByName",
      label: "Requested By",
      type: "text",
      placeholder: "Requester name",
    },
    {
      name: "requestedDate",
      label: "Requested Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "approvedByName",
      label: "Approved By",
      type: "text",
      placeholder: "Approver name",
    },
    {
      name: "approvedDate",
      label: "Approved Date",
      type: "datetime-local",
    },
    {
      name: "approvalLevel",
      label: "Approval Level",
      type: "number",
      placeholder: "0",
    },
    {
      name: "conditions",
      label: "Conditions",
      type: "textarea",
      placeholder: "Any conditions attached to this waiver",
    },
    {
      name: "expiryDate",
      label: "Expiry Date",
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
        <h1 className="text-2xl font-bold text-gray-900">New Waiver</h1>
        <p className="text-sm text-gray-500">
          Request a new demurrage or detention waiver
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Waiver"
          apiPath="/api/v1/demurrage-detention-management/waivers"
          fields={fields}
          returnPath="/demurrage-detention-management/waivers"
        />
      </div>
    </div>
  );
}
