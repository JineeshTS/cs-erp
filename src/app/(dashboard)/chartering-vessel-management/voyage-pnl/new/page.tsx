import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

const PNL_FIELDS: FieldConfig[] = [
  { name: "voyageEstimateId", label: "Voyage Estimate ID", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text", required: true },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "revenue", label: "Revenue", type: "number", required: true },
  { name: "hireCost", label: "Hire Cost", type: "number" },
  { name: "bunkerCost", label: "Bunker Cost", type: "number" },
  { name: "portCost", label: "Port Cost", type: "number" },
  { name: "canalCost", label: "Canal Cost", type: "number" },
  { name: "agencyCost", label: "Agency Cost", type: "number" },
  { name: "insuranceCost", label: "Insurance Cost", type: "number" },
  { name: "otherCosts", label: "Other Costs", type: "number" },
  { name: "totalCosts", label: "Total Costs", type: "number" },
  { name: "netResult", label: "Net Result", type: "number" },
  { name: "tceRate", label: "TCE Rate", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "periodFrom", label: "Period From", type: "datetime-local" },
  { name: "periodTo", label: "Period To", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewVoyagePnlPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:create")))
    redirect("/chartering-vessel-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/voyage-pnl"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Voyage P&amp;L
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Voyage P&L"
          apiPath="/api/v1/chartering-vessel-management/voyage-pnl"
          fields={PNL_FIELDS}
          returnPath="/chartering-vessel-management/voyage-pnl"
        />
      </div>
    </div>
  );
}
