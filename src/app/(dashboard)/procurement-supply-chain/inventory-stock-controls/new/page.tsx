import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";

const INVENTORY_FIELDS: FieldConfig[] = [
  {
    name: "inventoryType",
    label: "Inventory Type",
    type: "select",
    required: true,
    options: [
      { value: "raw_material", label: "Raw Material" },
      { value: "spare_part", label: "Spare Part" },
      { value: "consumable", label: "Consumable" },
      { value: "finished_goods", label: "Finished Goods" },
      { value: "safety_stock", label: "Safety Stock" },
    ],
  },
  { name: "itemCode", label: "Item Code", type: "text", required: true },
  { name: "itemName", label: "Item Name", type: "text", required: true },
  { name: "category", label: "Category", type: "text" },
  { name: "uom", label: "Unit of Measure", type: "text" },
  { name: "currentStock", label: "Current Stock", type: "text" },
  { name: "reorderLevel", label: "Reorder Level", type: "text" },
  { name: "reorderQuantity", label: "Reorder Quantity", type: "text" },
  { name: "safetyStock", label: "Safety Stock", type: "text" },
  { name: "maxStock", label: "Max Stock", type: "text" },
  { name: "unitCost", label: "Unit Cost", type: "text" },
  { name: "totalValue", label: "Total Value", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "warehouseLocation", label: "Warehouse Location", type: "text" },
  { name: "binNumber", label: "Bin Number", type: "text" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "batchNumber", label: "Batch Number", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewInventoryStockControlPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "procurement:create"))
  )
    redirect("/procurement-supply-chain/inventory-stock-controls");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/procurement-supply-chain/inventory-stock-controls"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Inventory Stock Control
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Inventory Stock Control"
          apiPath="/api/v1/procurement-supply-chain/inventory-stock-controls"
          fields={INVENTORY_FIELDS}
          returnPath="/procurement-supply-chain/inventory-stock-controls"
        />
      </div>
    </div>
  );
}
