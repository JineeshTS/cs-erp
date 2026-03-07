import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getPortOptions, getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewVoyageEstimatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:create")))
    redirect("/chartering-vessel-management");

  const [portOpts, vesselOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const VE_FIELDS: FieldConfig[] = [
    { name: "charterPartyId", label: "Charter Party ID", type: "text", placeholder: "UUID" },
    { name: "voyageNumber", label: "Voyage Number", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "cargoType", label: "Cargo Type", type: "text" },
    { name: "cargoQuantity", label: "Cargo Quantity", type: "number" },
    { name: "cargoUnit", label: "Cargo Unit", type: "select", options: [
      { value: "MT", label: "MT" },
      { value: "TEU", label: "TEU" },
    ]},
    { name: "estimatedRevenue", label: "Estimated Revenue", type: "number" },
    { name: "bunkerCost", label: "Bunker Cost", type: "number" },
    { name: "portCost", label: "Port Cost", type: "number" },
    { name: "canalCost", label: "Canal Cost", type: "number" },
    { name: "otherCosts", label: "Other Costs", type: "number" },
    { name: "totalCost", label: "Total Cost", type: "number" },
    { name: "netResult", label: "Net Result", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "voyageDays", label: "Voyage Days", type: "number" },
    { name: "seaDays", label: "Sea Days", type: "number" },
    { name: "portDays", label: "Port Days", type: "number" },
    { name: "distanceNm", label: "Distance (NM)", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/voyage-estimates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Voyage Estimate
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Voyage Estimate"
          apiPath="/api/v1/chartering-vessel-management/voyage-estimates"
          fields={VE_FIELDS}
          returnPath="/chartering-vessel-management/voyage-estimates"
        />
      </div>
    </div>
  );
}
