import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm, type FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

export default async function NewYieldTargetPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const fields: FieldConfig[] = [
    { name: "targetName", label: "Target Name", type: "text", required: true },
    { name: "tradeLane", label: "Trade Lane", type: "text", required: true },
    { name: "serviceType", label: "Service Type", type: "text" },
    { name: "fiscalYear", label: "Fiscal Year", type: "number", required: true },
    { name: "fiscalQuarter", label: "Fiscal Quarter", type: "number" },
    { name: "targetRevenuePerTeu", label: "Target Revenue/TEU", type: "number" },
    { name: "actualRevenuePerTeu", label: "Actual Revenue/TEU", type: "number" },
    { name: "targetUtilizationPercent", label: "Target Utilization %", type: "number" },
    { name: "actualUtilizationPercent", label: "Actual Utilization %", type: "number" },
    { name: "targetTeu", label: "Target TEU", type: "number" },
    { name: "actualTeu", label: "Actual TEU", type: "number" },
    { name: "minimumRateThreshold", label: "Minimum Rate Threshold", type: "number" },
    { name: "currency", label: "Currency", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Achieved", value: "achieved" },
        { label: "Missed", value: "missed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/yield-targets"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">New Yield Target</h1>
      </div>

      <CpmForm
        entityType="Yield Target"
        fields={fields}
        apiPath="/api/v1/commercial-pricing-management/yield-targets"
        returnPath="/commercial-pricing-management/yield-targets"
      />
    </div>
  );
}
