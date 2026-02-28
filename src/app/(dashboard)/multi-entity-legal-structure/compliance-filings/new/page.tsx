import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  {
    name: "complianceRuleId",
    label: "Compliance Rule ID",
    type: "text",
    required: true,
  },
  {
    name: "legalEntityId",
    label: "Legal Entity ID",
    type: "text",
    required: true,
  },
  {
    name: "filingPeriod",
    label: "Filing Period",
    type: "text",
    required: true,
    placeholder: "Q1-2026",
  },
  { name: "dueDate", label: "Due Date", type: "date", required: true },
  { name: "filedAt", label: "Filed At", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "in_progress", label: "In Progress" },
      { value: "submitted", label: "Submitted" },
      { value: "accepted", label: "Accepted" },
      { value: "rejected", label: "Rejected" },
      { value: "overdue", label: "Overdue" },
    ],
  },
  { name: "filingReference", label: "Filing Reference", type: "text" },
  {
    name: "submittedBy",
    label: "Submitted By (User ID)",
    type: "text",
  },
];

export default async function NewComplianceFilingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "entities:create"))
  )
    redirect("/multi-entity-legal-structure/compliance-filings");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/compliance-filings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Compliance Filing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Compliance Filing"
          apiPath="/api/v1/multi-entity-legal-structure/compliance-filings"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/compliance-filings"
        />
      </div>
    </div>
  );
}
