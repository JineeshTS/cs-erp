import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIspsCompliance } from "@/lib/customs-compliance-regulatory/service";
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

export default async function EditIspsCompliancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:edit")))
    redirect("/customs-compliance-regulatory/isps-compliances");

  const { id } = await params;
  const record = await getIspsCompliance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/customs-compliance-regulatory/isps-compliances/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit ISPS Compliance
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="ISPS Compliance"
          apiPath={`/api/v1/customs-compliance-regulatory/isps-compliances/${id}`}
          fields={ISPS_COMPLIANCE_FIELDS}
          initialData={{
            facilityType: record.facilityType ?? "",
            facilityName: record.facilityName ?? "",
            facilityCode: record.facilityCode ?? "",
            imoNumber: record.imoNumber ?? "",
            securityLevel: record.securityLevel ?? "",
            pfsoName: record.pfsoName ?? "",
            pfsoContact: record.pfsoContact ?? "",
            ssoName: record.ssoName ?? "",
            securityPlanRef: record.securityPlanRef ?? "",
            securityPlanApprovedAt: record.securityPlanApprovedAt?.toISOString() ?? "",
            lastDrillDate: record.lastDrillDate?.toISOString() ?? "",
            nextDrillDate: record.nextDrillDate?.toISOString() ?? "",
            lastAuditDate: record.lastAuditDate?.toISOString() ?? "",
            nextAuditDate: record.nextAuditDate?.toISOString() ?? "",
            auditResult: record.auditResult ?? "",
            isscNumber: record.isscNumber ?? "",
            isscExpiresAt: record.isscExpiresAt?.toISOString() ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/customs-compliance-regulatory/isps-compliances/${id}`}
        />
      </div>
    </div>
  );
}
