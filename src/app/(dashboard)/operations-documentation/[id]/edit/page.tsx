import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmBillsOfLading } from "@/db/schema";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";

const BL_FIELDS: FieldConfig[] = [
  { name: "blNumber", label: "BL Number", type: "text", required: true },
  { name: "blType", label: "BL Type", type: "select", options: [
    { value: "original", label: "Original" },
    { value: "seaway", label: "Seaway" },
    { value: "switch", label: "Switch" },
    { value: "express", label: "Express" },
    { value: "house", label: "House" },
  ]},
  { name: "blStatus", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "confirmed", label: "Confirmed" },
    { value: "printed", label: "Printed" },
    { value: "released", label: "Released" },
    { value: "surrendered", label: "Surrendered" },
    { value: "accomplished", label: "Accomplished" },
  ]},
  { name: "bookingReference", label: "Booking Reference", type: "text" },
  { name: "shipperName", label: "Shipper Name", type: "text", required: true },
  { name: "shipperAddress", label: "Shipper Address", type: "textarea" },
  { name: "consigneeName", label: "Consignee Name", type: "text", required: true },
  { name: "consigneeAddress", label: "Consignee Address", type: "textarea" },
  { name: "notifyPartyName", label: "Notify Party", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "portOfLoading", label: "Port of Loading", type: "text" },
  { name: "portOfDischarge", label: "Port of Discharge", type: "text" },
  { name: "placeOfReceipt", label: "Place of Receipt", type: "text" },
  { name: "placeOfDelivery", label: "Place of Delivery", type: "text" },
  { name: "dateOfIssue", label: "Date of Issue", type: "date" },
  { name: "onBoardDate", label: "On Board Date", type: "date" },
  { name: "freightTerms", label: "Freight Terms", type: "select", options: [
    { value: "prepaid", label: "Prepaid" },
    { value: "collect", label: "Collect" },
  ]},
  { name: "numberOfOriginals", label: "Number of Originals", type: "number" },
  { name: "containerCount", label: "Container Count", type: "number" },
  { name: "grossWeight", label: "Gross Weight", type: "number" },
  { name: "volume", label: "Volume", type: "number" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "specialInstructions", label: "Special Instructions", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditBillOfLadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:edit")))
    redirect("/operations-documentation");

  const { id } = await params;
  const record = await db
    .select()
    .from(odmBillsOfLading)
    .where(
      and(
        eq(odmBillsOfLading.id, id),
        eq(odmBillsOfLading.tenantId, session.tenantId),
        isNull(odmBillsOfLading.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    blNumber: record.blNumber,
    blType: record.blType,
    blStatus: record.blStatus,
    bookingReference: record.bookingReference ?? "",
    shipperName: record.shipperName,
    shipperAddress: record.shipperAddress ?? "",
    consigneeName: record.consigneeName,
    consigneeAddress: record.consigneeAddress ?? "",
    notifyPartyName: record.notifyPartyName ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    portOfLoading: record.portOfLoading ?? "",
    portOfDischarge: record.portOfDischarge ?? "",
    placeOfReceipt: record.placeOfReceipt ?? "",
    placeOfDelivery: record.placeOfDelivery ?? "",
    dateOfIssue: record.dateOfIssue ?? "",
    onBoardDate: record.onBoardDate ?? "",
    freightTerms: record.freightTerms ?? "",
    numberOfOriginals: record.numberOfOriginals ?? "",
    containerCount: record.containerCount ?? "",
    grossWeight: record.grossWeight ?? "",
    volume: record.volume ?? "",
    cargoDescription: record.cargoDescription ?? "",
    specialInstructions: record.specialInstructions ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/operations-documentation/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Bill of Lading</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Bill of Lading"
          apiPath={`/api/v1/operations-documentation/bills-of-lading/${id}`}
          fields={BL_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/operations-documentation/${id}`}
        />
      </div>
    </div>
  );
}
