import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getFlagStateCompliance } from "@/lib/crew-management/service";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditFlagStateCompliancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:edit")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "flagState", label: "Flag State", type: "text", required: true },
    {
      name: "inspectionType",
      label: "Inspection Type",
      type: "select",
      required: true,
      options: [
        { label: "Port State", value: "port_state" },
        { label: "Flag State", value: "flag_state" },
        { label: "Vetting", value: "vetting" },
        { label: "Class", value: "class" },
        { label: "Internal", value: "internal" },
      ],
    },
    { name: "inspectionDate", label: "Inspection Date", type: "datetime-local", required: true },
    { name: "inspectorName", label: "Inspector Name", type: "text" },
    { name: "inspectionPort", label: "Inspection Port", type: "text" },
    { name: "deficienciesFound", label: "Deficiencies Found", type: "number" },
    { name: "detainable", label: "Detainable", type: "checkbox" },
    { name: "reportNumber", label: "Report Number", type: "text" },
    { name: "rectificationDeadline", label: "Rectification Deadline", type: "datetime-local" },
    { name: "nextInspectionDate", label: "Next Inspection Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getFlagStateCompliance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/crew-management/flag-state-compliance/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.complianceRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.complianceRef}
        </h1>
      </div>

      <CrmForm
        entityType="Flag State Compliance"
        apiPath={`/api/v1/crew-management/flag-state-compliance/${record.id}`}
        fields={fields}
        initialData={record as unknown as Record<string, unknown>}
        isEdit
        returnPath={`/crew-management/flag-state-compliance/${record.id}`}
      />
    </div>
  );
}
