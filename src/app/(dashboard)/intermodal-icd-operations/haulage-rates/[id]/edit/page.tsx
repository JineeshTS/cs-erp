import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHaulageRate } from "@/lib/intermodal-icd-operations/service";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditHaulageRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:edit")))
    redirect("/intermodal-icd-operations/haulage-rates");

  const currencyOpts = await getCurrencyOptions();

  const HAULAGE_RATE_FIELDS: FieldConfig[] = [
    { name: "rateName", label: "Rate Name", type: "text", required: true },
    {
      name: "transportMode",
      label: "Transport Mode",
      type: "select",
      required: true,
      options: [
        { value: "road", label: "Road" },
        { value: "rail", label: "Rail" },
        { value: "barge", label: "Barge" },
        { value: "multimodal", label: "Multimodal" },
      ],
    },
    {
      name: "originLocation",
      label: "Origin",
      type: "text",
      required: true,
    },
    {
      name: "destinationLocation",
      label: "Destination",
      type: "text",
      required: true,
    },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    {
      name: "ratePerUnit",
      label: "Rate Per Unit",
      type: "text",
      required: true,
    },
    {
      name: "rateUnit",
      label: "Rate Unit",
      type: "select",
      required: true,
      options: [
        { value: "per_teu", label: "Per TEU" },
        { value: "per_feu", label: "Per FEU" },
        { value: "per_kg", label: "Per KG" },
        { value: "per_cbm", label: "Per CBM" },
        { value: "lump_sum", label: "Lump Sum" },
      ],
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
      required: true,
    },
    { name: "fuelSurchargePercent", label: "Fuel Surcharge %", type: "text" },
    { name: "tolls", label: "Tolls", type: "text" },
    { name: "carrierName", label: "Carrier Name", type: "text" },
    { name: "carrierCode", label: "Carrier Code", type: "text" },
    { name: "validFrom", label: "Valid From", type: "datetime-local" },
    { name: "validTo", label: "Valid To", type: "datetime-local" },
    { name: "minimumCharge", label: "Minimum Charge", type: "text" },
    { name: "transitTimeDays", label: "Transit Time (days)", type: "number" },
    {
      name: "termsAndConditions",
      label: "Terms & Conditions",
      type: "textarea",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await getHaulageRate(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/intermodal-icd-operations/haulage-rates/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Haulage Rate
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Haulage Rate"
          apiPath={`/api/v1/intermodal-icd-operations/haulage-rates/${id}`}
          fields={HAULAGE_RATE_FIELDS}
          initialData={{
            rateName: record.rateName ?? "",
            transportMode: record.transportMode ?? "",
            originLocation: record.originLocation ?? "",
            destinationLocation: record.destinationLocation ?? "",
            containerSize: record.containerSize ?? "",
            containerType: record.containerType ?? "",
            ratePerUnit: record.ratePerUnit ?? "",
            rateUnit: record.rateUnit ?? "",
            currency: record.currency ?? "",
            fuelSurchargePercent: record.fuelSurchargePercent ?? "",
            tolls: record.tolls ?? "",
            carrierName: record.carrierName ?? "",
            carrierCode: record.carrierCode ?? "",
            validFrom: record.validFrom
              ? new Date(record.validFrom).toISOString()
              : "",
            validTo: record.validTo
              ? new Date(record.validTo).toISOString()
              : "",
            minimumCharge: record.minimumCharge ?? "",
            transitTimeDays: record.transitTimeDays ?? "",
            termsAndConditions: record.termsAndConditions ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/intermodal-icd-operations/haulage-rates/${id}`}
        />
      </div>
    </div>
  );
}
