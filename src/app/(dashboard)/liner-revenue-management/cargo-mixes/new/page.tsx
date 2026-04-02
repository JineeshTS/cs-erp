import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewCargoMixPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lrm:create"))
  )
    redirect("/liner-revenue-management/cargo-mixes");

  const currencyOpts = await getCurrencyOptions();

  const CARGO_MIX_FIELDS: FieldConfig[] = [
    {
      name: "mixType",
      label: "Mix Type",
      type: "select",
      required: true,
      options: [
        { value: "commodity_analysis", label: "Commodity Analysis" },
        { value: "segment_allocation", label: "Segment Allocation" },
        { value: "weight_class", label: "Weight Class" },
        { value: "reefer_ratio", label: "Reefer Ratio" },
        { value: "special_cargo", label: "Special Cargo" },
      ],
    },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "commodityGroup", label: "Commodity Group", type: "text" },
    { name: "dryCargoTeu", label: "Dry Cargo TEU", type: "number" },
    { name: "reeferTeu", label: "Reefer TEU", type: "number" },
    { name: "specialCargoTeu", label: "Special Cargo TEU", type: "number" },
    { name: "totalTeu", label: "Total TEU", type: "number" },
    { name: "revenueContribution", label: "Revenue Contribution", type: "text" },
    { name: "marginPct", label: "Margin %", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-revenue-management/cargo-mixes"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Cargo Mix
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Cargo Mix"
          apiPath="/api/v1/liner-revenue-management/cargo-mixes"
          fields={CARGO_MIX_FIELDS}
          returnPath="/liner-revenue-management/cargo-mixes"
        />
      </div>
    </div>
  );
}
