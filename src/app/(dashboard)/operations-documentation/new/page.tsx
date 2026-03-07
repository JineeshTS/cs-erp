import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewBillOfLadingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:create")))
    redirect("/operations-documentation");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const BL_FIELDS: FieldConfig[] = [
    { name: "blNumber", label: "BL Number", type: "text", required: true, placeholder: "BL-2026-001" },
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
    { name: "bookingReference", label: "Booking Reference", type: "text", placeholder: "BK-001" },
    { name: "shipperName", label: "Shipper Name", type: "text", required: true, placeholder: "Shipper Co." },
    { name: "shipperAddress", label: "Shipper Address", type: "textarea" },
    { name: "consigneeName", label: "Consignee Name", type: "text", required: true, placeholder: "Consignee Co." },
    { name: "consigneeAddress", label: "Consignee Address", type: "textarea" },
    { name: "notifyPartyName", label: "Notify Party", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "portOfLoading", label: "Port of Loading", type: "select", options: portOpts },
    { name: "portOfDischarge", label: "Port of Discharge", type: "select", options: portOpts },
    { name: "placeOfReceipt", label: "Place of Receipt", type: "text" },
    { name: "placeOfDelivery", label: "Place of Delivery", type: "text" },
    { name: "dateOfIssue", label: "Date of Issue", type: "date" },
    { name: "onBoardDate", label: "On Board Date", type: "date" },
    { name: "freightTerms", label: "Freight Terms", type: "select", options: [
      { value: "prepaid", label: "Prepaid" },
      { value: "collect", label: "Collect" },
    ]},
    { name: "numberOfOriginals", label: "Number of Originals", type: "number", placeholder: "3" },
    { name: "containerCount", label: "Container Count", type: "number" },
    { name: "grossWeight", label: "Gross Weight", type: "number" },
    { name: "volume", label: "Volume", type: "number" },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    { name: "specialInstructions", label: "Special Instructions", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/operations-documentation" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Bill of Lading</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Bill of Lading"
          apiPath="/api/v1/operations-documentation/bills-of-lading"
          fields={BL_FIELDS}
          returnPath="/operations-documentation"
        />
      </div>
    </div>
  );
}
