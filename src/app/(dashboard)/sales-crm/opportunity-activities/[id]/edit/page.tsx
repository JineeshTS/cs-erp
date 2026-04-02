import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmOpportunityActivities } from "@/db/schema";
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

export default async function EditOpportunityActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:edit")))
    redirect("/sales-crm");

  const { id } = await params;
  const record = await db
    .select()
    .from(scmOpportunityActivities)
    .where(
      and(
        eq(scmOpportunityActivities.id, id),
        eq(scmOpportunityActivities.tenantId, session.tenantId),
        isNull(scmOpportunityActivities.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    opportunityId: record.opportunityId,
    activityType: record.activityType,
    subject: record.subject,
    description: record.description ?? "",
    activityDate: record.activityDate ? new Date(record.activityDate).toISOString().slice(0, 16) : "",
    dueDate: record.dueDate ? new Date(record.dueDate).toISOString().slice(0, 16) : "",
    assignedTo: record.assignedTo ?? "",
    outcome: record.outcome ?? "",
    status: record.status,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/opportunity-activities/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Activity
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Activity"
          apiPath={`/api/v1/sales-crm/opportunity-activities/${id}`}
          fields={ACTIVITY_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/opportunity-activities/${id}`}
        />
      </div>
    </div>
  );
}
