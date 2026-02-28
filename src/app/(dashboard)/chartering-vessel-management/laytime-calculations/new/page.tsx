import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

const LC_FIELDS: FieldConfig[] = [
  { name: "charterPartyId", label: "Charter Party ID", type: "text", placeholder: "UUID" },
  { name: "voyageEstimateId", label: "Voyage Estimate ID", type: "text", placeholder: "UUID" },
  { name: "portName", label: "Port Name", type: "text", required: true },
  { name: "operationType", label: "Operation Type", type: "select", options: [
    { value: "loading", label: "Loading" },
    { value: "discharging", label: "Discharging" },
  ]},
  { name: "allowedHours", label: "Allowed Hours", type: "number", required: true },
  { name: "usedHours", label: "Used Hours", type: "number", required: true },
  { name: "excessHours", label: "Excess Hours", type: "number" },
  { name: "demurrageRate", label: "Demurrage Rate", type: "number" },
  { name: "despatchRate", label: "Despatch Rate", type: "number" },
  { name: "demurrageAmount", label: "Demurrage Amount", type: "number" },
  { name: "despatchAmount", label: "Despatch Amount", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "commencedAt", label: "Commenced At", type: "datetime-local" },
  { name: "completedAt", label: "Completed At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewLaytimeCalculationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:create")))
    redirect("/chartering-vessel-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/laytime-calculations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Laytime Calculation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Laytime Calculation"
          apiPath="/api/v1/chartering-vessel-management/laytime-calculations"
          fields={LC_FIELDS}
          returnPath="/chartering-vessel-management/laytime-calculations"
        />
      </div>
    </div>
  );
}
