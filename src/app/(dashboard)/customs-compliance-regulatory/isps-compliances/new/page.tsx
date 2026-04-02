import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";

const ISPS_COMPLIANCE_FIELDS: FieldConfig[] = [
  {
    name: "facilityType",
    label: "Facility Type",
    type: "select",
    required: true,
    options: [
      { value: "port_facility", label: "Port Facility" },
      { value: "vessel", label: "Vessel" },
      { value: "terminal", label: "Terminal" },
      { value: "offshore", label: "Offshore" },
    ],
  },
  { name: "facilityName", label: "Facility Name", type: "text", required: true },
  { name: "facilityCode", label: "Facility Code", type: "text" },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  {
    name: "securityLevel",
    label: "Security Level",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Level 1" },
      { value: "2", label: "Level 2" },
      { value: "3", label: "Level 3" },
    ],
  },
  { name: "pfsoName", label: "PFSO Name", type: "text" },
  { name: "pfsoContact", label: "PFSO Contact", type: "text" },
  { name: "ssoName", label: "SSO Name", type: "text" },
  { name: "securityPlanRef", label: "Security Plan Ref", type: "text" },
  { name: "securityPlanApprovedAt", label: "Security Plan Approved At", type: "datetime-local" },
  { name: "lastDrillDate", label: "Last Drill Date", type: "datetime-local" },
  { name: "nextDrillDate", label: "Next Drill Date", type: "datetime-local" },
  { name: "lastAuditDate", label: "Last Audit Date", type: "datetime-local" },
  { name: "nextAuditDate", label: "Next Audit Date", type: "datetime-local" },
  {
    name: "auditResult",
    label: "Audit Result",
    type: "select",
    options: [
      { value: "compliant", label: "Compliant" },
      { value: "non_compliant", label: "Non-Compliant" },
      { value: "observation", label: "Observation" },
    ],
  },
  { name: "isscNumber", label: "ISSC Number", type: "text" },
  { name: "isscExpiresAt", label: "ISSC Expires At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewIspsCompliancePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "customs:create"))
  )
    redirect("/customs-compliance-regulatory/isps-compliances");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/isps-compliances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New ISPS Compliance
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="ISPS Compliance"
          apiPath="/api/v1/customs-compliance-regulatory/isps-compliances"
          fields={ISPS_COMPLIANCE_FIELDS}
          returnPath="/customs-compliance-regulatory/isps-compliances"
        />
      </div>
    </div>
  );
}
