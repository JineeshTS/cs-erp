import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ArccForm } from "@/components/accounts-receivable-credit-control/arcc-form";
import type { FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";

export default async function NewCollectionWorkflowPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:create"))) redirect("/");

  const fields: FieldConfig[] = [
    { name: "customerName", label: "Customer Name", type: "text", required: true },
    { name: "accountNumber", label: "Account Number", type: "text" },
    { name: "totalOutstanding", label: "Total Outstanding", type: "number", required: true },
    { name: "totalOverdue", label: "Total Overdue", type: "number" },
    { name: "oldestOverdueDays", label: "Oldest Overdue Days", type: "number" },
    { name: "invoiceCount", label: "Invoice Count", type: "number" },
    { name: "escalationLevel", label: "Escalation Level", type: "number" },
    { name: "escalationType", label: "Escalation Type", type: "select", required: true, options: [
      { label: "Standard", value: "standard" },
      { label: "Accelerated", value: "accelerated" },
      { label: "Legal", value: "legal" },
      { label: "External Agency", value: "external_agency" },
      { label: "Write-Off Review", value: "write_off_review" },
    ]},
    { name: "assignedToName", label: "Assigned To", type: "text" },
    { name: "nextActionDate", label: "Next Action Date", type: "datetime-local" },
    { name: "nextActionType", label: "Next Action Type", type: "select", options: [
      { label: "Reminder", value: "reminder" },
      { label: "Phone Call", value: "phone_call" },
      { label: "Demand Letter", value: "demand_letter" },
      { label: "Meeting", value: "meeting" },
      { label: "Legal Notice", value: "legal_notice" },
      { label: "Escalate", value: "escalate" },
    ]},
    { name: "promisedDate", label: "Promised Date", type: "datetime-local" },
    { name: "promisedAmount", label: "Promised Amount", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Collection Workflow</h1>
        <p className="text-sm text-gray-500">Create a new collection workflow</p>
      </div>
      <ArccForm
        entityType="Collection Workflow"
        fields={fields}
        apiPath="/api/v1/accounts-receivable-credit-control/collection-workflows"
        method="POST"
        returnPath="/accounts-receivable-credit-control/collection-workflows"
      />
    </div>
  );
}
