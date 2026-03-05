import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";

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
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text", required: true },
  { name: "disposalMethod", label: "Disposal Method", type: "text" },
  { name: "disposalDate", label: "Disposal Date", type: "datetime-local" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "quantityKg", label: "Quantity (kg)", type: "text" },
  { name: "receivingFacility", label: "Receiving Facility", type: "text" },
  { name: "receiptNumber", label: "Receipt Number", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewWasteManagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Waste Management</h1>
      <MecForm
        entityType="waste-management"
        apiPath="/api/v1/marpol-environmental-compliance/waste-managements"
        fields={fields}
        returnPath="/marpol-environmental-compliance/waste-managements"
      />
    </div>
  );
}
