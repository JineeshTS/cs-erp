import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOnhireOffhire } from "@/lib/container-leasing-management/service";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";

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
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "eventDate", label: "Event Date", type: "datetime-local" },
  { name: "eventLocation", label: "Event Location", type: "text" },
  { name: "depotName", label: "Depot Name", type: "text" },
  { name: "conditionGrade", label: "Condition Grade", type: "text" },
  { name: "surveyRequired", label: "Survey Required", type: "checkbox" },
  { name: "surveyDate", label: "Survey Date", type: "datetime-local" },
  { name: "dailyRate", label: "Daily Rate", type: "text" },
  { name: "daysOnHire", label: "Days On Hire", type: "number" },
  { name: "totalCost", label: "Total Cost", type: "text" },
  { name: "interchangeRef", label: "Interchange Ref", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditOnhireOffhirePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getOnhireOffhire(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    eventType: record.eventType ?? "",
    agreementId: record.agreementId ?? "",
    containerNumber: record.containerNumber ?? "",
    containerType: record.containerType ?? "",
    containerSize: record.containerSize ?? "",
    eventDate: record.eventDate
      ? new Date(record.eventDate).toISOString().slice(0, 16)
      : "",
    eventLocation: record.eventLocation ?? "",
    depotName: record.depotName ?? "",
    conditionGrade: record.conditionGrade ?? "",
    surveyRequired: record.surveyRequired ? "true" : "",
    surveyDate: record.surveyDate
      ? new Date(record.surveyDate).toISOString().slice(0, 16)
      : "",
    dailyRate: record.dailyRate ?? "",
    daysOnHire:
      record.daysOnHire != null ? String(record.daysOnHire) : "",
    totalCost: record.totalCost ?? "",
    interchangeRef: record.interchangeRef ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/container-leasing-management/onhire-offhires/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.eventRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update on-hire / off-hire event details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="On-Hire / Off-Hire"
          apiPath={`/api/v1/container-leasing-management/onhire-offhires/${id}`}
          returnPath="/container-leasing-management/onhire-offhires"
          fields={ONHIRE_OFFHIRE_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
