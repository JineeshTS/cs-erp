import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewBlChargePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:create")))
    redirect("/operations-documentation/bl-charges");

  const currencyOpts = await getCurrencyOptions();

  const CHARGE_FIELDS: FieldConfig[] = [
    { name: "blId", label: "BL ID", type: "text", required: true },
    { name: "chargeCode", label: "Charge Code", type: "text", required: true },
    { name: "chargeName", label: "Charge Name", type: "text", required: true },
    { name: "chargeType", label: "Charge Type", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "prepaidCollect", label: "Prepaid/Collect", type: "select", options: [
      { value: "prepaid", label: "Prepaid" },
      { value: "collect", label: "Collect" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/operations-documentation/bl-charges" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New BL Charge</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="BL Charge"
          apiPath="/api/v1/operations-documentation/bl-charges"
          fields={CHARGE_FIELDS}
          returnPath="/operations-documentation/bl-charges"
        />
      </div>
    </div>
  );
}
