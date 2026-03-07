import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmDispute } from "@/lib/demurrage-detention-management/service";
import { DdmForm, FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditDisputePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:edit")))
    redirect("/");


  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const { id } = await params;
  const dispute = await getDdmDispute(id, session.tenantId);
  if (!dispute) notFound();

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

  const initialData: Record<string, unknown> = {
    invoiceRef: dispute.invoiceRef ?? "",
    customerName: dispute.customerName,
    containerNumber: dispute.containerNumber ?? "",
    disputeType: dispute.disputeType,
    disputeReason: dispute.disputeReason,
    disputedAmount: dispute.disputedAmount ?? "",
    originalAmount: dispute.originalAmount ?? "",
    currency: dispute.currency ?? "",
    filedDate: dispute.filedDate ? new Date(dispute.filedDate).toISOString() : "",
    filedByName: dispute.filedByName ?? "",
    assignedToName: dispute.assignedToName ?? "",
    resolutionNotes: dispute.resolutionNotes ?? "",
    resolvedAmount: dispute.resolvedAmount ?? "",
    resolvedDate: dispute.resolvedDate ? new Date(dispute.resolvedDate).toISOString() : "",
    resolvedByName: dispute.resolvedByName ?? "",
    escalationLevel: dispute.escalationLevel ?? "",
    slaDeadline: dispute.slaDeadline ? new Date(dispute.slaDeadline).toISOString() : "",
    notes: dispute.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Dispute</h1>
        <p className="text-sm text-gray-500">
          Update dispute {dispute.disputeRef}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Dispute"
          apiPath={`/api/v1/demurrage-detention-management/disputes/${id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/demurrage-detention-management/disputes"
        />
      </div>
    </div>
  );
}
