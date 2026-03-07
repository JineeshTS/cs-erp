import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewDryDockPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:create")))
    redirect("/");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    {
      name: "dockYardName",
      label: "Dock Yard Name",
      type: "text",
      required: true,
    },
    { name: "dockYardLocation", label: "Dock Yard Location", type: "text" },
    { name: "dockYardCountry", label: "Dock Yard Country", type: "text" },
    {
      name: "plannedStartDate",
      label: "Planned Start Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "plannedEndDate",
      label: "Planned End Date",
      type: "datetime-local",
      required: true,
    },
    { name: "estimatedCost", label: "Estimated Cost", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "selectedContractor", label: "Selected Contractor", type: "text" },
    { name: "className", label: "Class Name", type: "text" },
    { name: "classApproval", label: "Class Approval", type: "checkbox" },
    { name: "projectManagerName", label: "Project Manager", type: "text" },
    { name: "scope", label: "Scope", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        New Dry Dock Plan
      </h1>
      <VtmForm
        entityType="Dry Dock Plan"
        apiPath="/api/v1/vessel-technical-management/dry-dock-plans"
        fields={fields}
        returnPath="/vessel-technical-management/dry-dock-plans"
      />
    </div>
  );
}
