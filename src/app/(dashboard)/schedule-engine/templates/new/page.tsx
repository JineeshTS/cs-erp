import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { GenericForm, type FieldConfig } from "@/components/ui/generic-form";

const fields: FieldConfig[] = [
  { name: "serviceName", label: "Service Name", type: "text", required: true, placeholder: "e.g., Indo-Gulf Express" },
  { name: "serviceCode", label: "Service Code", type: "text", required: true, placeholder: "e.g., IGX" },
  { name: "frequencyDays", label: "Frequency (Days)", type: "number", required: true, placeholder: "7", helpText: "How often the service sails (e.g., 7 for weekly)" },
  { name: "totalRotationDays", label: "Total Rotation (Days)", type: "number", required: true, placeholder: "14", helpText: "Total round-trip duration" },
  {
    name: "direction", label: "Direction", type: "select", required: true,
    options: [
      { value: "outbound", label: "Outbound" },
      { value: "inbound", label: "Inbound" },
      { value: "round_trip", label: "Round Trip" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea", fullWidth: true, placeholder: "Service description, route details..." },
];

export default async function NewTemplatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "schedule:create")))
    redirect("/schedule-engine");

  return (
    <GenericForm
      title="New Service Template"
      apiPath="/api/v1/schedule-engine/templates"
      fields={fields}
      returnPath="/schedule-engine"
    />
  );
}
