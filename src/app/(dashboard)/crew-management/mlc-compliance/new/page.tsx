import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewMlcCompliancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:create")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "flagState", label: "Flag State", type: "text", required: true },
    { name: "mlcStandard", label: "MLC Standard", type: "text", required: true },
    {
      name: "complianceArea",
      label: "Compliance Area",
      type: "select",
      required: true,
      options: [
        { value: "employment_agreements", label: "Employment Agreements" },
        { value: "wages", label: "Wages" },
        { value: "hours_rest", label: "Hours of Rest" },
        { value: "repatriation", label: "Repatriation" },
        { value: "recruitment", label: "Recruitment" },
        { value: "accommodation", label: "Accommodation" },
        { value: "food", label: "Food" },
        { value: "medical", label: "Medical" },
        { value: "onboard_complaint", label: "Onboard Complaint" },
        { value: "social_security", label: "Social Security" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "dmlcPartI", label: "DMLC Part I", type: "checkbox" },
    { name: "dmlcPartII", label: "DMLC Part II", type: "checkbox" },
    { name: "lastInspectionDate", label: "Last Inspection Date", type: "datetime-local" },
    { name: "nextInspectionDate", label: "Next Inspection Date", type: "datetime-local" },
    { name: "inspectorName", label: "Inspector Name", type: "text" },
    { name: "closureDeadline", label: "Closure Deadline", type: "datetime-local" },
    { name: "certificateNumber", label: "Certificate Number", type: "text" },
    { name: "certificateIssueDate", label: "Certificate Issue Date", type: "datetime-local" },
    { name: "certificateExpiryDate", label: "Certificate Expiry Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/crew-management/mlc-compliance"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to MLC Compliance
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          New MLC Compliance Record
        </h1>
      </div>

      <CrmForm
        entityType="MLC Compliance"
        apiPath="/api/v1/crew-management/mlc-compliance"
        fields={fields}
        returnPath="/crew-management/mlc-compliance"
      />
    </div>
  );
}
