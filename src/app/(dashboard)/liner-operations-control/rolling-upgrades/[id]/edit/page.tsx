import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRollingUpgrade } from "@/lib/liner-operations-control/service";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";

const UPGRADE_FIELDS: FieldConfig[] = [
  {
    name: "upgradeType",
    label: "Upgrade Type",
    type: "select",
    required: true,
    options: [
      { value: "container_upgrade", label: "Container Upgrade" },
      { value: "service_upgrade", label: "Service Upgrade" },
      { value: "equipment_swap", label: "Equipment Swap" },
      { value: "priority_loading", label: "Priority Loading" },
      { value: "express_release", label: "Express Release" },
    ],
  },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "customerName", label: "Customer Name", type: "text" },
  { name: "originalEquipment", label: "Original Equipment", type: "text" },
  { name: "upgradedEquipment", label: "Upgraded Equipment", type: "text" },
  { name: "originalService", label: "Original Service", type: "text" },
  { name: "upgradedService", label: "Upgraded Service", type: "text" },
  { name: "costDifference", label: "Cost Difference", type: "number" },
  { name: "upgradeCurrency", label: "Upgrade Currency", type: "text" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "approvalDate", label: "Approval Date", type: "datetime-local" },
  { name: "upgradeReason", label: "Upgrade Reason", type: "textarea" },
  { name: "revenueRecovered", label: "Revenue Recovered", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRollingUpgradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getRollingUpgrade(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    upgradeType: record.upgradeType ?? "",
    bookingRef: record.bookingRef ?? "",
    customerName: record.customerName ?? "",
    originalEquipment: record.originalEquipment ?? "",
    upgradedEquipment: record.upgradedEquipment ?? "",
    originalService: record.originalService ?? "",
    upgradedService: record.upgradedService ?? "",
    costDifference: record.costDifference ?? "",
    upgradeCurrency: record.upgradeCurrency ?? "",
    approvedBy: record.approvedBy ?? "",
    approvalDate: record.approvalDate
      ? new Date(record.approvalDate).toISOString().slice(0, 16)
      : "",
    upgradeReason: record.upgradeReason ?? "",
    revenueRecovered: record.revenueRecovered ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/liner-operations-control/rolling-upgrades/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.upgradeRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update rolling upgrade details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Rolling Upgrade"
          apiPath={`/api/v1/liner-operations-control/rolling-upgrades/${id}`}
          returnPath="/liner-operations-control/rolling-upgrades"
          fields={UPGRADE_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
