import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect, notFound } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import { getWasteManagement } from "@/lib/marpol-environmental-compliance/service";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function EditWasteManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:edit")))
    redirect("/");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "wasteType",
      label: "Waste Type",
      type: "select",
      options: [
        { label: "Plastics", value: "plastics" },
        { label: "Food Waste", value: "food_waste" },
        { label: "Domestic Waste", value: "domestic_waste" },
        { label: "Cooking Oil", value: "cooking_oil" },
        { label: "Operational Waste", value: "operational_waste" },
        { label: "Cargo Residues", value: "cargo_residues" },
      ],
      required: true,
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text", required: true },
    { name: "disposalMethod", label: "Disposal Method", type: "text" },
    { name: "disposalDate", label: "Disposal Date", type: "datetime-local" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "quantityKg", label: "Quantity (kg)", type: "text" },
    { name: "receivingFacility", label: "Receiving Facility", type: "text" },
    { name: "receiptNumber", label: "Receipt Number", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getWasteManagement(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Waste Management</h1>
      <MecForm
        entityType="waste-management"
        apiPath={`/api/v1/marpol-environmental-compliance/waste-managements/${id}`}
        fields={fields}
        initialData={{
          wasteType: record.wasteType ?? "",
          title: record.title ?? "",
          vesselName: record.vesselName ?? "",
          imoNumber: record.imoNumber ?? "",
          disposalMethod: record.disposalMethod ?? "",
          disposalDate: record.disposalDate ?? "",
          portName: record.portName ?? "",
          quantityKg: record.quantityKg ?? "",
          receivingFacility: record.receivingFacility ?? "",
          receiptNumber: record.receiptNumber ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/marpol-environmental-compliance/waste-managements/${id}`}
      />
    </div>
  );
}
