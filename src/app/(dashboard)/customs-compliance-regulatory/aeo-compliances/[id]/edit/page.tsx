import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAeoCompliance } from "@/lib/customs-compliance-regulatory/service";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";

const AEO_COMPLIANCE_FIELDS: FieldConfig[] = [
  {
    name: "aeoType",
    label: "AEO Type",
    type: "select",
    required: true,
    options: [
      { value: "aeo_c", label: "AEO-C (Customs)" },
      { value: "aeo_s", label: "AEO-S (Security)" },
      { value: "aeo_f", label: "AEO-F (Full)" },
      { value: "trusted_trader", label: "Trusted Trader" },
    ],
  },
  { name: "companyName", label: "Company Name", type: "text", required: true },
  { name: "companyRegistration", label: "Company Registration", type: "text" },
  { name: "authorityName", label: "Authority Name", type: "text" },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  { name: "certificateIssuedAt", label: "Certificate Issued At", type: "datetime-local" },
  { name: "certificateExpiresAt", label: "Certificate Expires At", type: "datetime-local" },
  {
    name: "auditFrequency",
    label: "Audit Frequency",
    type: "select",
    options: [
      { value: "annual", label: "Annual" },
      { value: "biannual", label: "Biannual" },
      { value: "triennial", label: "Triennial" },
    ],
  },
  { name: "lastAuditDate", label: "Last Audit Date", type: "datetime-local" },
  { name: "nextAuditDate", label: "Next Audit Date", type: "datetime-local" },
  {
    name: "auditResult",
    label: "Audit Result",
    type: "select",
    options: [
      { value: "passed", label: "Passed" },
      { value: "conditional", label: "Conditional" },
      { value: "failed", label: "Failed" },
    ],
  },
  { name: "complianceScore", label: "Compliance Score", type: "text", placeholder: "0.00" },
  {
    name: "riskCategory",
    label: "Risk Category",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  { name: "contactName", label: "Contact Name", type: "text" },
  { name: "contactEmail", label: "Contact Email", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAeoCompliancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:edit")))
    redirect("/customs-compliance-regulatory/aeo-compliances");

  const { id } = await params;
  const record = await getAeoCompliance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/customs-compliance-regulatory/aeo-compliances/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit AEO Compliance
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="AEO Compliance"
          apiPath={`/api/v1/customs-compliance-regulatory/aeo-compliances/${id}`}
          fields={AEO_COMPLIANCE_FIELDS}
          initialData={{
            aeoType: record.aeoType ?? "",
            companyName: record.companyName ?? "",
            companyRegistration: record.companyRegistration ?? "",
            authorityName: record.authorityName ?? "",
            certificateNumber: record.certificateNumber ?? "",
            certificateIssuedAt: record.certificateIssuedAt?.toISOString() ?? "",
            certificateExpiresAt: record.certificateExpiresAt?.toISOString() ?? "",
            auditFrequency: record.auditFrequency ?? "",
            lastAuditDate: record.lastAuditDate?.toISOString() ?? "",
            nextAuditDate: record.nextAuditDate?.toISOString() ?? "",
            auditResult: record.auditResult ?? "",
            complianceScore: record.complianceScore ?? "",
            riskCategory: record.riskCategory ?? "",
            contactName: record.contactName ?? "",
            contactEmail: record.contactEmail ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/customs-compliance-regulatory/aeo-compliances/${id}`}
        />
      </div>
    </div>
  );
}
