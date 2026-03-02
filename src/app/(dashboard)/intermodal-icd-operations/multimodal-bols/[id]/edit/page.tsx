import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMultimodalBol } from "@/lib/intermodal-icd-operations/service";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";

const MULTIMODAL_BOL_FIELDS: FieldConfig[] = [
  { name: "bolNumber", label: "B/L Number", type: "text" },
  {
    name: "bolType",
    label: "B/L Type",
    type: "select",
    required: true,
    options: [
      { value: "combined_transport", label: "Combined Transport" },
      { value: "through_bl", label: "Through B/L" },
      { value: "multimodal", label: "Multimodal" },
    ],
  },
  { name: "shipperName", label: "Shipper Name", type: "text", required: true },
  { name: "shipperAddress", label: "Shipper Address", type: "textarea" },
  { name: "consigneeName", label: "Consignee Name", type: "text", required: true },
  { name: "consigneeAddress", label: "Consignee Address", type: "textarea" },
  { name: "notifyPartyName", label: "Notify Party", type: "text" },
  { name: "notifyPartyAddress", label: "Notify Address", type: "textarea" },
  { name: "placeOfReceipt", label: "Place of Receipt", type: "text" },
  { name: "portOfLoading", label: "Port of Loading", type: "text" },
  { name: "portOfDischarge", label: "Port of Discharge", type: "text" },
  { name: "placeOfDelivery", label: "Place of Delivery", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "grossWeightKg", label: "Gross Weight (kg)", type: "text" },
  { name: "measurementCbm", label: "Measurement (CBM)", type: "text" },
  { name: "numberOfPackages", label: "Number of Packages", type: "number" },
  { name: "packageType", label: "Package Type", type: "text" },
  {
    name: "freightTerms",
    label: "Freight Terms",
    type: "select",
    options: [
      { value: "prepaid", label: "Prepaid" },
      { value: "collect", label: "Collect" },
    ],
  },
  { name: "freightAmount", label: "Freight Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "issuedAt", label: "Issued At", type: "datetime-local" },
  { name: "issuedByName", label: "Issued By", type: "text" },
  { name: "issuedAtPlace", label: "Issued At Place", type: "text" },
  { name: "numberOfOriginals", label: "Number of Originals", type: "number" },
  { name: "surrendered", label: "Surrendered", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditMultimodalBolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:edit")))
    redirect("/intermodal-icd-operations/multimodal-bols");

  const { id } = await params;
  const record = await getMultimodalBol(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/intermodal-icd-operations/multimodal-bols/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Multimodal B/L
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Multimodal B/L"
          apiPath={`/api/v1/intermodal-icd-operations/multimodal-bols/${id}`}
          fields={MULTIMODAL_BOL_FIELDS}
          initialData={{
            bolNumber: record.bolNumber ?? "",
            bolType: record.bolType ?? "",
            shipperName: record.shipperName ?? "",
            shipperAddress: record.shipperAddress ?? "",
            consigneeName: record.consigneeName ?? "",
            consigneeAddress: record.consigneeAddress ?? "",
            notifyPartyName: record.notifyPartyName ?? "",
            notifyPartyAddress: record.notifyPartyAddress ?? "",
            placeOfReceipt: record.placeOfReceipt ?? "",
            portOfLoading: record.portOfLoading ?? "",
            portOfDischarge: record.portOfDischarge ?? "",
            placeOfDelivery: record.placeOfDelivery ?? "",
            vesselName: record.vesselName ?? "",
            voyageNumber: record.voyageNumber ?? "",
            containerNumber: record.containerNumber ?? "",
            containerType: record.containerType ?? "",
            cargoDescription: record.cargoDescription ?? "",
            grossWeightKg: record.grossWeightKg ?? "",
            measurementCbm: record.measurementCbm ?? "",
            numberOfPackages: record.numberOfPackages ?? "",
            packageType: record.packageType ?? "",
            freightTerms: record.freightTerms ?? "",
            freightAmount: record.freightAmount ?? "",
            currency: record.currency ?? "",
            issuedAt: record.issuedAt
              ? new Date(record.issuedAt).toISOString()
              : "",
            issuedByName: record.issuedByName ?? "",
            issuedAtPlace: record.issuedAtPlace ?? "",
            numberOfOriginals: record.numberOfOriginals ?? "",
            surrendered: record.surrendered ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/intermodal-icd-operations/multimodal-bols/${id}`}
        />
      </div>
    </div>
  );
}
