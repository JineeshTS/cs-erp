import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { peTaskInstances, peTaskDefinitions } from "@/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { GenericForm, type FieldConfig } from "@/components/ui/generic-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "tasks:update")))
    redirect("/tasks");

  const { id } = await params;

  // Fetch the task
  const [task] = await db
    .select()
    .from(peTaskInstances)
    .where(
      and(
        eq(peTaskInstances.id, id),
        eq(peTaskInstances.tenantId, session.tenantId),
        isNull(peTaskInstances.deletedAt)
      )
    )
    .limit(1);

  if (!task) notFound();

  // Load task definitions for the select dropdown
  const definitions = await db
    .select({
      id: peTaskDefinitions.id,
      taskCode: peTaskDefinitions.taskCode,
      name: peTaskDefinitions.name,
    })
    .from(peTaskDefinitions)
    .where(
      and(
        isNull(peTaskDefinitions.deletedAt),
        or(
          eq(peTaskDefinitions.source, "system"),
          eq(peTaskDefinitions.tenantId, session.tenantId)
        )
      )
    )
    .orderBy(peTaskDefinitions.name);

  const definitionOptions = definitions.map((d) => ({
    value: d.id,
    label: `${d.taskCode} - ${d.name}`,
  }));

  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Task Name",
      type: "text",
      required: true,
      placeholder: "e.g., Review Booking Documents",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "failed", label: "Failed" },
        { value: "blocked", label: "Blocked" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "normal", label: "Normal" },
        { value: "low", label: "Low" },
      ],
    },
    {
      name: "assignedRole",
      label: "Assigned Role",
      type: "text",
      placeholder: "e.g., Operations Manager",
    },
    {
      name: "dueAt",
      label: "Due Date",
      type: "datetime-local",
    },
    {
      name: "taskDefinitionId",
      label: "Task Definition",
      type: "select",
      options: definitionOptions,
      placeholder: "Select a template...",
      disabled: true,
      helpText:
        "Task definition cannot be changed after creation.",
    },
  ];

  const initialData: Record<string, unknown> = {
    name: task.name,
    status: task.status,
    priority: task.priority,
    assignedRole: task.assignedRole ?? "",
    dueAt: task.dueAt ? task.dueAt.toISOString() : "",
    taskDefinitionId: task.taskDefinitionId ?? "",
  };

  return (
    <GenericForm
      title="Edit Task"
      apiPath={`/api/v1/tasks/${id}`}
      method="PATCH"
      fields={fields}
      initialData={initialData}
      returnPath={`/tasks/${id}`}
      cancelPath={`/tasks/${id}`}
    />
  );
}
