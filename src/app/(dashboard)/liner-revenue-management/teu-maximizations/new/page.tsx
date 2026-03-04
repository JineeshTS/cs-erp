import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";

const TEU_MAXIMIZATION_FIELDS: FieldConfig[] = [
  {
    name: "strategyType",
    label: "Strategy Type",
    type: "select",
    required: true,
    options: [
      { value: "rate_optimization", label: "Rate Optimization" },
      { value: "slot_utilization", label: "Slot Utilization" },
      { value: "cargo_prioritization", label: "Cargo Prioritization" },
      { value: "surcharge_review", label: "Surcharge Review" },
      { value: "yield_management", label: "Yield Management" },
    ],
  },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "currentRevenueTeu", label: "Current Revenue/TEU", type: "text" },
  { name: "targetRevenueTeu", label: "Target Revenue/TEU", type: "text" },
  { name: "achievedRevenueTeu", label: "Achieved Revenue/TEU", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "teuVolume", label: "TEU Volume", type: "number" },
  { name: "utilizationPct", label: "Utilization %", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewTeuMaximizationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lrm:create"))
  )
    redirect("/liner-revenue-management/teu-maximizations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-revenue-management/teu-maximizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New TEU Maximization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="TEU Maximization"
          apiPath="/api/v1/liner-revenue-management/teu-maximizations"
          fields={TEU_MAXIMIZATION_FIELDS}
          returnPath="/liner-revenue-management/teu-maximizations"
        />
      </div>
    </div>
  );
}
