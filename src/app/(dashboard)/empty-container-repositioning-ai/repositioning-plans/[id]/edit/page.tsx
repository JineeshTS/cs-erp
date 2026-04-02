import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getRepositioningPlan } from "@/lib/empty-container-repositioning-ai/service";
import { EcrForm, type FieldConfig } from "@/components/empty-container-repositioning-ai/ecr-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function EditRepositioningPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:edit")))
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

  const { id } = await params;
  const plan = await getRepositioningPlan(id, session.tenantId);
  if (!plan) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/empty-container-repositioning-ai/repositioning-plans/${id}`}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Repositioning Plan
          </h1>
          <p className="text-sm text-muted-foreground">
            {plan.planRef} — {plan.title}
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <EcrForm
          entityType="repositioning-plans"
          apiPath={`/api/v1/empty-container-repositioning-ai/repositioning-plans/${id}`}
          fields={fields}
          initialData={plan}
          isEdit
          returnPath={`/empty-container-repositioning-ai/repositioning-plans/${id}`}
        />
      </div>
    </div>
  );
}
