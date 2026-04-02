import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { EcrForm, type FieldConfig } from "@/components/empty-container-repositioning-ai/ecr-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewRepositioningPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:create")))
    redirect("/");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "planType",
      label: "Plan Type",
      type: "select",
      required: true,
      options: [
        { label: "Cross Trade", value: "cross_trade" },
        { label: "Backhaul", value: "backhaul" },
        { label: "Street Turn", value: "street_turn" },
        { label: "Triangulation", value: "triangulation" },
        { label: "Seasonal Pre-Position", value: "seasonal_pre_position" },
      ],
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts, required: true },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts, required: true },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "etd", label: "ETD", type: "datetime-local" },
    { name: "eta", label: "ETA", type: "datetime-local" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    { name: "estimatedCost", label: "Estimated Cost", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/empty-container-repositioning-ai/repositioning-plans"
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Repositioning Plan
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new container repositioning plan
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <EcrForm
          entityType="repositioning-plans"
          apiPath="/api/v1/empty-container-repositioning-ai/repositioning-plans"
          fields={fields}
          returnPath="/empty-container-repositioning-ai/repositioning-plans"
        />
      </div>
    </div>
  );
}
