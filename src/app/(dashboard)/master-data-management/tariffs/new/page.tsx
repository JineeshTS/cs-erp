import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const TARIFF_FIELDS = [
  {
    name: "code",
    label: "Tariff Code",
    type: "text" as const,
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    required: true,
  },
  {
    name: "rateType",
    label: "Rate Type",
    type: "select" as const,
    required: true,
    options: [
      { value: "flat", label: "Flat" },
      { value: "per_unit", label: "Per Unit" },
      { value: "percentage", label: "Percentage" },
      { value: "tiered", label: "Tiered" },
    ],
  },
  {
    name: "rateAmount",
    label: "Rate Amount",
    type: "number" as const,
    required: true,
  },
  {
    name: "currency",
    label: "Currency",
    type: "text" as const,
    placeholder: "USD",
  },
  {
    name: "perUnit",
    label: "Per Unit",
    type: "text" as const,
    placeholder: "TEU",
  },
  {
    name: "effectiveFrom",
    label: "Effective From",
    type: "date" as const,
    required: true,
  },
  {
    name: "effectiveTo",
    label: "Effective To",
    type: "date" as const,
  },
];

export default async function NewTariffCodePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:create")))
    redirect("/master-data-management/tariffs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/tariffs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Tariff Code</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Tariff Code"
          apiPath="/api/v1/master-data-management/tariffs"
          fields={TARIFF_FIELDS}
          returnPath="/master-data-management/tariffs"
        />
      </div>
    </div>
  );
}
