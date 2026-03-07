import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCargoMix } from "@/lib/liner-revenue-management/service";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditCargoMixPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:edit")))
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
  const { id } = await params;

  const record = await getCargoMix(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-revenue-management/cargo-mixes/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Cargo Mix
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Cargo Mix"
          apiPath={`/api/v1/liner-revenue-management/cargo-mixes/${id}`}
          fields={CARGO_MIX_FIELDS}
          initialData={{
            mixType: record.mixType,
            tradeLane: record.tradeLane ?? "",
            commodityGroup: record.commodityGroup ?? "",
            dryCargoTeu: record.dryCargoTeu ?? "",
            reeferTeu: record.reeferTeu ?? "",
            specialCargoTeu: record.specialCargoTeu ?? "",
            totalTeu: record.totalTeu ?? "",
            revenueContribution: record.revenueContribution ?? "",
            marginPct: record.marginPct ?? "",
            currency: record.currency ?? "",
            periodStart: record.periodStart ? new Date(record.periodStart).toISOString().slice(0, 16) : "",
            periodEnd: record.periodEnd ? new Date(record.periodEnd).toISOString().slice(0, 16) : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-revenue-management/cargo-mixes/${id}`}
        />
      </div>
    </div>
  );
}
