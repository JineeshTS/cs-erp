import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmShippingInstructions } from "@/db/schema";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditShippingInstructionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:edit")))
    redirect("/operations-documentation/shipping-instructions");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const SI_FIELDS: FieldConfig[] = [
    { name: "siReference", label: "SI Reference", type: "text", required: true },
    { name: "bookingReference", label: "Booking Reference", type: "text" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts },
    { name: "shipperName", label: "Shipper Name", type: "text", required: true },
    { name: "shipperAddress", label: "Shipper Address", type: "textarea" },
    { name: "consigneeName", label: "Consignee Name", type: "text", required: true },
    { name: "consigneeAddress", label: "Consignee Address", type: "textarea" },
    { name: "notifyPartyName", label: "Notify Party", type: "text" },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    { name: "specialInstructions", label: "Special Instructions", type: "textarea" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" },
      { value: "submitted", label: "Submitted" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await db
    .select()
    .from(odmShippingInstructions)
    .where(
      and(
        eq(odmShippingInstructions.id, id),
        eq(odmShippingInstructions.tenantId, session.tenantId),
        isNull(odmShippingInstructions.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    siReference: record.siReference,
    bookingReference: record.bookingReference ?? "",
    customerName: record.customerName ?? "",
    shipperName: record.shipperName,
    shipperAddress: record.shipperAddress ?? "",
    consigneeName: record.consigneeName,
    consigneeAddress: record.consigneeAddress ?? "",
    notifyPartyName: record.notifyPartyName ?? "",
    cargoDescription: record.cargoDescription ?? "",
    specialInstructions: record.specialInstructions ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/operations-documentation/shipping-instructions/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Shipping Instruction</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Shipping Instruction"
          apiPath={`/api/v1/operations-documentation/shipping-instructions/${id}`}
          fields={SI_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/operations-documentation/shipping-instructions/${id}`}
        />
      </div>
    </div>
  );
}
