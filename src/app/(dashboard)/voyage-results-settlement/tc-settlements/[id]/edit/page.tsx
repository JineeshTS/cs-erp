import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTcSettlement } from "@/lib/voyage-results-settlement/service";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditTcSettlementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:edit")))
    redirect("/");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "settlementType",
      label: "Settlement Type",
      type: "select",
      required: true,
      options: [
        { value: "hire_payment", label: "Hire Payment" },
        { value: "ballast_bonus", label: "Ballast Bonus" },
        { value: "redelivery", label: "Redelivery" },
        { value: "bunker_adjustment", label: "Bunker Adjustment" },
        { value: "off_hire_deduction", label: "Off Hire Deduction" },
      ],
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      required: false,
    },
    {
      name: "vesselName",
      label: "Vessel Name",
      type: "select", options: vesselOpts,
      required: false,
    },
    {
      name: "charterParty",
      label: "Charter Party",
      type: "text",
      required: false,
    },
    {
      name: "periodFrom",
      label: "Period From",
      type: "datetime-local",
      required: false,
    },
    {
      name: "periodTo",
      label: "Period To",
      type: "datetime-local",
      required: false,
    },
    {
      name: "hireRate",
      label: "Hire Rate",
      type: "number",
      required: false,
    },
    {
      name: "totalHireDays",
      label: "Total Hire Days",
      type: "number",
      required: false,
    },
    {
      name: "offHireDays",
      label: "Off Hire Days",
      type: "number",
      required: false,
    },
    {
      name: "grossHire",
      label: "Gross Hire",
      type: "number",
      required: false,
    },
    {
      name: "deductions",
      label: "Deductions",
      type: "number",
      required: false,
    },
    {
      name: "netPayable",
      label: "Net Payable",
      type: "number",
      required: false,
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
      required: false,
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      required: false,
    },
  ];

  const { id } = await params;
  const record = await getTcSettlement(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/voyage-results-settlement/tc-settlements/${id}`}
          className="rounded-md border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit TC Settlement</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <VrsForm
          entityType="TC Settlement"
          apiPath={`/api/v1/voyage-results-settlement/tc-settlements/${id}`}
          fields={fields}
          initialData={record as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/voyage-results-settlement/tc-settlements/${id}`}
        />
      </div>
    </div>
  );
}
