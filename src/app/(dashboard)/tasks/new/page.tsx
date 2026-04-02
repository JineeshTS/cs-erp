import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { peTaskDefinitions } from "@/db/schema";
import { and, or, eq, isNull } from "drizzle-orm";
import { GenericForm, type FieldConfig } from "@/components/ui/generic-form";

export default async function NewTaskPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "tasks:create")))
    redirect("/tasks");

  // Load task definitions for the select dropdown (system + tenant's own)
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
      name: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "normal", label: "Normal" },
        { value: "low", label: "Low" },
      ],
      placeholder: "Select priority...",
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
      placeholder: "Select a template (optional)...",
      helpText:
        "Choose a predefined task template to auto-populate steps.",
    },
  ];

  return (
    <GenericForm
      title="New Task"
      apiPath="/api/v1/tasks"
      fields={fields}
      returnPath="/tasks"
    />
  );
}
