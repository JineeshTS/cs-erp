import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";
import { getPortOptions, getTerminalOptions, getContainerTypeOptions } from "@/lib/lookups";

export default async function NewOnhireOffhirePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:create")))
    redirect("/");

  const [portOpts, terminalOpts, containerTypeOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getTerminalOptions(session.tenantId),
    getContainerTypeOptions(session.tenantId),
  ]);

  const ONHIRE_OFFHIRE_FIELDS: FieldConfig[] = [
    {
      name: "eventType",
      label: "Event Type",
      type: "select",
      options: [
        { value: "on_hire", label: "On Hire" },
        { value: "off_hire", label: "Off Hire" },
        { value: "interchange", label: "Interchange" },
        { value: "redelivery", label: "Redelivery" },
        { value: "pickup", label: "Pickup" },
      ],
    },
    { name: "agreementId", label: "Agreement ID", type: "text" },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "containerType", label: "Container Type", type: "select", options: containerTypeOpts },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "eventDate", label: "Event Date", type: "datetime-local" },
    { name: "eventLocation", label: "Event Location", type: "select", options: portOpts },
    { name: "depotName", label: "Depot Name", type: "select", options: terminalOpts },
    { name: "conditionGrade", label: "Condition Grade", type: "text" },
    { name: "surveyRequired", label: "Survey Required", type: "checkbox" },
    { name: "surveyDate", label: "Survey Date", type: "datetime-local" },
    { name: "dailyRate", label: "Daily Rate", type: "text" },
    { name: "daysOnHire", label: "Days On Hire", type: "number" },
    { name: "totalCost", label: "Total Cost", type: "text" },
    { name: "interchangeRef", label: "Interchange Ref", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/container-leasing-management/onhire-offhires"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New On-Hire / Off-Hire Event
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new on-hire or off-hire event
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="On-Hire / Off-Hire"
          apiPath="/api/v1/container-leasing-management/onhire-offhires"
          returnPath="/container-leasing-management/onhire-offhires"
          fields={ONHIRE_OFFHIRE_FIELDS}
        />
      </div>
    </div>
  );
}
