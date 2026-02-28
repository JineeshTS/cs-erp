import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const TARIFF_FIELDS: FieldConfig[] = [
  { name: "tariffCode", label: "Tariff Code", type: "text", required: true, placeholder: "TRF-001" },
  { name: "tariffName", label: "Tariff Name", type: "text", required: true, placeholder: "Standard Import Tariff" },
  { name: "tariffType", label: "Tariff Type", type: "select", options: [
    { value: "standard", label: "Standard" },
    { value: "contract", label: "Contract" },
    { value: "promotional", label: "Promotional" },
    { value: "spot", label: "Spot" },
  ]},
  { name: "tradeLane", label: "Trade Lane", type: "text", placeholder: "Asia-Gulf" },
  { name: "originPort", label: "Origin Port", type: "text", placeholder: "CNSHA" },
  { name: "destinationPort", label: "Destination Port", type: "text", placeholder: "QADOH" },
  { name: "serviceType", label: "Service Type", type: "text", placeholder: "FCL" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "suspended", label: "Suspended" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewTariffPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "commercial:create")))
    redirect("/commercial-pricing-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/commercial-pricing-management" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Tariff</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Tariff"
          apiPath="/api/v1/commercial-pricing-management/tariffs"
          fields={TARIFF_FIELDS}
          returnPath="/commercial-pricing-management"
        />
      </div>
    </div>
  );
}
