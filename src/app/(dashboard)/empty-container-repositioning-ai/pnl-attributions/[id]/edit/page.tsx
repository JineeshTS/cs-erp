import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getPnlAttribution } from "@/lib/empty-container-repositioning-ai/service";
import {
  EcrForm,
  type FieldConfig,
} from "@/components/empty-container-repositioning-ai/ecr-form";

export default async function EditPnlAttributionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getPnlAttribution(id, session.tenantId);
  if (!record) notFound();

  const fields: FieldConfig[] = [
    {
      name: "attributionType",
      label: "Attribution Type",
      type: "select",
      options: [
        { label: "Voyage Level", value: "voyage_level" },
        { label: "Trade Lane", value: "trade_lane" },
        { label: "Region", value: "region" },
        { label: "Container Type", value: "container_type" },
        { label: "Monthly Summary", value: "monthly_summary" },
      ],
      required: true,
    },
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "periodFrom",
      label: "Period From",
      type: "datetime-local",
      required: true,
    },
    {
      name: "periodTo",
      label: "Period To",
      type: "datetime-local",
      required: true,
    },
    { name: "tradeLane", label: "Trade Lane", type: "text", required: true },
    {
      name: "repositioningRevenue",
      label: "Repositioning Revenue",
      type: "text",
      required: true,
    },
    {
      name: "repositioningCost",
      label: "Repositioning Cost",
      type: "text",
      required: true,
    },
    { name: "netPnl", label: "Net P&L", type: "text", required: true },
    {
      name: "totalMoves",
      label: "Total Moves",
      type: "number",
      required: true,
    },
    {
      name: "costPerMove",
      label: "Cost Per Move",
      type: "text",
      required: true,
    },
    {
      name: "revenuePerMove",
      label: "Revenue Per Move",
      type: "text",
      required: true,
    },
    { name: "notes", label: "Notes", type: "textarea", required: false },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/empty-container-repositioning-ai/pnl-attributions/${id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit P&L Attribution
          </h1>
          <p className="text-muted-foreground">{record.attributionRef}</p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <EcrForm
          entityType="pnl-attributions"
          apiPath="/api/v1/empty-container-repositioning-ai/pnl-attributions"
          fields={fields}
          initialData={record}
          isEdit
          returnPath={`/empty-container-repositioning-ai/pnl-attributions/${id}`}
        />
      </div>
    </div>
  );
}
