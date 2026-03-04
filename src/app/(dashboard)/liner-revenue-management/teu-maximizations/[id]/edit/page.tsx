import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTeuMaximization } from "@/lib/liner-revenue-management/service";
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

export default async function EditTeuMaximizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:edit")))
    redirect("/liner-revenue-management/teu-maximizations");

  const { id } = await params;

  const record = await getTeuMaximization(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-revenue-management/teu-maximizations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit TEU Maximization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="TEU Maximization"
          apiPath={`/api/v1/liner-revenue-management/teu-maximizations/${id}`}
          fields={TEU_MAXIMIZATION_FIELDS}
          initialData={{
            strategyType: record.strategyType,
            tradeLane: record.tradeLane ?? "",
            originPort: record.originPort ?? "",
            destinationPort: record.destinationPort ?? "",
            currentRevenueTeu: record.currentRevenueTeu ?? "",
            targetRevenueTeu: record.targetRevenueTeu ?? "",
            achievedRevenueTeu: record.achievedRevenueTeu ?? "",
            currency: record.currency ?? "",
            teuVolume: record.teuVolume ?? "",
            utilizationPct: record.utilizationPct ?? "",
            effectiveFrom: record.effectiveFrom ? new Date(record.effectiveFrom).toISOString().slice(0, 16) : "",
            effectiveTo: record.effectiveTo ? new Date(record.effectiveTo).toISOString().slice(0, 16) : "",
            approvedBy: record.approvedBy ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-revenue-management/teu-maximizations/${id}`}
        />
      </div>
    </div>
  );
}
