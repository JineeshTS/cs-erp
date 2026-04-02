import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { IcmForm } from "@/components/implementation-change-management/icm-form";
import type { FieldConfig } from "@/components/implementation-change-management/icm-form";

const fields: FieldConfig[] = [
  {
    name: "changeType",
    label: "Change Type",
    type: "select",
    required: true,
    options: [
      { value: "enhancement", label: "Enhancement" },
      { value: "bug_fix", label: "Bug Fix" },
      { value: "configuration", label: "Configuration" },
      { value: "process_change", label: "Process Change" },
      { value: "emergency", label: "Emergency" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "requestedBy", label: "Requested By", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "priority", label: "Priority", type: "text" },
  { name: "impactLevel", label: "Impact Level", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "justification", label: "Justification", type: "textarea" },
  { name: "estimatedEffortDays", label: "Estimated Effort Days", type: "text" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "approvedDate", label: "Approved Date", type: "datetime-local" },
  { name: "targetDate", label: "Target Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewChangeRequestPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:create")))
    redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/implementation-change-management/change-requests"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Settings className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Change Request</h1>
          <p className="text-sm text-muted-foreground">
            Create a new change request record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Change Request"
        apiPath="/api/v1/implementation-change-management/change-requests"
        fields={fields}
        returnPath="/implementation-change-management/change-requests"
      />
    </div>
  );
}
