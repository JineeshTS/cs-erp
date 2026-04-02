import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";
import React from "react";

const FIELDS: FieldConfig[] = [
  {
    name: "regulationType",
    label: "Regulation Type",
    type: "select",
    required: true,
    options: [
      { value: "circular", label: "Circular" },
      { value: "resolution", label: "Resolution" },
      { value: "amendment", label: "Amendment" },
      { value: "guideline", label: "Guideline" },
      { value: "convention", label: "Convention" },
    ],
  },
  { name: "imoReference", label: "IMO Reference", type: "text" },
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "issuingBody",
    label: "Issuing Body",
    type: "select",
    options: [
      { value: "MSC", label: "MSC" },
      { value: "MEPC", label: "MEPC" },
      { value: "FAL", label: "FAL" },
      { value: "LEG", label: "LEG" },
      { value: "TC", label: "TC" },
    ],
  },
  { name: "conventionName", label: "Convention Name", type: "text" },
  { name: "publishedAt", label: "Published At", type: "datetime-local" },
  { name: "effectiveAt", label: "Effective At", type: "datetime-local" },
  { name: "complianceDeadline", label: "Compliance Deadline", type: "datetime-local" },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "impactAssessment", label: "Impact Assessment", type: "textarea" },
  {
    name: "implementationProgress",
    label: "Implementation Progress",
    type: "text",
    placeholder: "0.00",
  },
  { name: "responsiblePerson", label: "Responsible Person", type: "text" },
  { name: "documentUrl", label: "Document URL", type: "text" },
  { name: "supersedes", label: "Supersedes", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewImoRegulationPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "customs:create"))
  )
    redirect("/customs-compliance-regulatory/imo-regulations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/imo-regulations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New IMO Regulation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="IMO Regulation"
          apiPath="/api/v1/customs-compliance-regulatory/imo-regulations"
          fields={FIELDS}
          returnPath="/customs-compliance-regulatory/imo-regulations"
        />
      </div>
    </div>
  );
}
