import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmOnboardingChecklists } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditOnboardingChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:edit")))
    redirect("/sales-crm");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const ONBOARDING_CHECKLIST_FIELDS: FieldConfig[] = [
    { name: "customerId", label: "Customer ID", type: "select", options: customerOpts, required: true },
    { name: "taskName", label: "Task Name", type: "text", required: true },
    { name: "taskCategory", label: "Task Category", type: "select", required: true, options: [
      { value: "kyc", label: "KYC" },
      { value: "credit_check", label: "Credit Check" },
      { value: "documentation", label: "Documentation" },
      { value: "system_setup", label: "System Setup" },
      { value: "rate_setup", label: "Rate Setup" },
      { value: "training", label: "Training" },
      { value: "other", label: "Other" },
    ]},
    { name: "description", label: "Description", type: "textarea" },
    { name: "assignedTo", label: "Assigned To", type: "text" },
    { name: "dueDate", label: "Due Date", type: "datetime-local" },
    { name: "sortOrder", label: "Sort Order", type: "number" },
    { name: "isRequired", label: "Required", type: "checkbox" },
    { name: "documentRequired", label: "Document Required", type: "checkbox" },
    { name: "documentUrl", label: "Document URL", type: "text" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "pending", label: "Pending" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "skipped", label: "Skipped" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await db
    .select()
    .from(scmOnboardingChecklists)
    .where(
      and(
        eq(scmOnboardingChecklists.id, id),
        eq(scmOnboardingChecklists.tenantId, session.tenantId),
        isNull(scmOnboardingChecklists.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    customerId: record.customerId,
    taskName: record.taskName,
    taskCategory: record.taskCategory ?? "",
    description: record.description ?? "",
    assignedTo: record.assignedTo ?? "",
    dueDate: record.dueDate ?? "",
    sortOrder: record.sortOrder ?? "",
    isRequired: record.isRequired ?? false,
    documentRequired: record.documentRequired ?? false,
    documentUrl: record.documentUrl ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/onboarding-checklists/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Checklist Item
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Onboarding Checklist"
          apiPath={`/api/v1/sales-crm/onboarding-checklists/${id}`}
          fields={ONBOARDING_CHECKLIST_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/onboarding-checklists/${id}`}
        />
      </div>
    </div>
  );
}
