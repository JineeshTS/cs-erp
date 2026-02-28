import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm, type FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

export default async function NewDetentionDemurragePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const fields: FieldConfig[] = [
    { name: "tariffCode", label: "Tariff Code", type: "text", required: true },
    { name: "tariffName", label: "Tariff Name", type: "text", required: true },
    {
      name: "chargeType",
      label: "Charge Type",
      type: "select",
      options: [
        { label: "Detention", value: "detention" },
        { label: "Demurrage", value: "demurrage" },
        { label: "Combined", value: "combined" },
      ],
    },
    { name: "portCode", label: "Port Code", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "freeTimeDays", label: "Free Time (Days)", type: "number", required: true },
    { name: "dailyRate", label: "Daily Rate", type: "number", required: true },
    { name: "escalationRate", label: "Escalation Rate", type: "number" },
    { name: "escalationAfterDays", label: "Escalation After (Days)", type: "number" },
    { name: "maximumDays", label: "Maximum Days", type: "number" },
    { name: "currency", label: "Currency", type: "text" },
    { name: "customerSegment", label: "Customer Segment", type: "text" },
    { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
    { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Expired", value: "expired" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/detention-demurrage"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">New Detention &amp; Demurrage</h1>
      </div>

      <CpmForm
        entityType="Detention & Demurrage"
        fields={fields}
        apiPath="/api/v1/commercial-pricing-management/detention-demurrage"
        returnPath="/commercial-pricing-management/detention-demurrage"
      />
    </div>
  );
}
