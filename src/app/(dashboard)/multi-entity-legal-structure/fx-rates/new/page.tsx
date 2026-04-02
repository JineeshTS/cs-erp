import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MelsForm, type FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewFxRatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:create")))
    redirect("/multi-entity-legal-structure/fx-rates");

  const currencyOpts = await getCurrencyOptions();

  const FIELDS: FieldConfig[] = [
    { name: "sourceCurrency", label: "Source Currency", type: "text", required: true, placeholder: "USD" },
    { name: "targetCurrency", label: "Target Currency", type: "select", options: currencyOpts, required: true },
    { name: "rate", label: "Rate (integer)", type: "number", required: true },
    { name: "rateMultiplier", label: "Rate Multiplier", type: "number", placeholder: "1000000" },
    { name: "rateType", label: "Rate Type", type: "select", options: [
      { value: "spot", label: "Spot" }, { value: "forward", label: "Forward" },
      { value: "official", label: "Official" }, { value: "custom", label: "Custom" },
    ]},
    { name: "provider", label: "Provider", type: "text" },
    { name: "effectiveFrom", label: "Effective From", type: "date", required: true },
    { name: "effectiveTo", label: "Effective To", type: "date" },
    { name: "isActive", label: "Active", type: "checkbox" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/fx-rates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add FX Rate</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="FX Rate"
          apiPath="/api/v1/multi-entity-legal-structure/fx-rates"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/fx-rates"
        />
      </div>
    </div>
  );
}
