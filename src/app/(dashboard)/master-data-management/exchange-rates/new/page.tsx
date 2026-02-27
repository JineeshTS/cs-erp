import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const EXCHANGE_RATE_FIELDS = [
  { name: "baseCurrency", label: "Base Currency", type: "text" as const, required: true, placeholder: "USD" },
  { name: "targetCurrency", label: "Target Currency", type: "text" as const, required: true, placeholder: "QAR" },
  { name: "rate", label: "Rate", type: "text" as const, required: true },
  { name: "inverseRate", label: "Inverse Rate", type: "text" as const },
  { name: "source", label: "Source", type: "text" as const, placeholder: "manual" },
  { name: "effectiveDate", label: "Effective Date", type: "date" as const, required: true },
  { name: "validUntil", label: "Valid Until", type: "date" as const },
];

export default async function NewExchangeRatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "finance:create")))
    redirect("/master-data-management/exchange-rates");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/exchange-rates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Exchange Rate</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Exchange Rate"
          apiPath="/api/v1/master-data-management/exchange-rates"
          fields={EXCHANGE_RATE_FIELDS}
          returnPath="/master-data-management/exchange-rates"
        />
      </div>
    </div>
  );
}
