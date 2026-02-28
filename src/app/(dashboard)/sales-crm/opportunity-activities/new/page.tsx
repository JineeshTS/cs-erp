import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const ACTIVITY_FIELDS: FieldConfig[] = [
  { name: "opportunityId", label: "Opportunity ID", type: "text", required: true, placeholder: "UUID of the opportunity" },
  { name: "activityType", label: "Activity Type", type: "select", required: true, options: [
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "demo", label: "Demo" },
    { value: "proposal", label: "Proposal" },
    { value: "follow_up", label: "Follow Up" },
    { value: "site_visit", label: "Site Visit" },
  ]},
  { name: "subject", label: "Subject", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "activityDate", label: "Activity Date", type: "datetime-local", required: true },
  { name: "dueDate", label: "Due Date", type: "datetime-local" },
  { name: "assignedTo", label: "Assigned To", type: "text" },
  { name: "outcome", label: "Outcome", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "planned", label: "Planned" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]},
];

export default async function NewOpportunityActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const sp = await searchParams;
  const opportunityId = sp.opportunityId ?? "";

  const initialData: Record<string, unknown> = {};
  if (opportunityId) {
    initialData.opportunityId = opportunityId;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/opportunity-activities"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Activity
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Activity"
          apiPath="/api/v1/sales-crm/opportunity-activities"
          fields={ACTIVITY_FIELDS}
          initialData={Object.keys(initialData).length > 0 ? initialData : undefined}
          returnPath="/sales-crm/opportunity-activities"
        />
      </div>
    </div>
  );
}
