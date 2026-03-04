import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVoyagePnl } from "@/lib/voyage-results-settlement/service";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";

const fields: FieldConfig[] = [
  {
    name: "pnlType",
    label: "P&L Type",
    type: "select",
    required: true,
    options: [
      { value: "preliminary", label: "Preliminary" },
      { value: "final", label: "Final" },
      { value: "restated", label: "Restated" },
      { value: "audited", label: "Audited" },
      { value: "management", label: "Management" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "freightRevenue", label: "Freight Revenue", type: "number" },
  { name: "demurrageRevenue", label: "Demurrage Revenue", type: "number" },
  { name: "otherRevenue", label: "Other Revenue", type: "number" },
  { name: "portCosts", label: "Port Costs", type: "number" },
  { name: "bunkerCosts", label: "Bunker Costs", type: "number" },
  { name: "canalCosts", label: "Canal Costs", type: "number" },
  { name: "otherCosts", label: "Other Costs", type: "number" },
  { name: "totalRevenue", label: "Total Revenue", type: "number" },
  { name: "totalCosts", label: "Total Costs", type: "number" },
  { name: "netPnl", label: "Net P&L", type: "number" },
  { name: "marginPct", label: "Margin %", type: "number" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "approvedDate", label: "Approved Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVoyagePnlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:edit")))
    redirect("/login");

  const { id } = await params;
  const record = await getVoyagePnl(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/voyage-results-settlement/voyage-pnls/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <TrendingUp className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Voyage P&L</h1>
          <p className="text-sm text-muted-foreground">
            Update voyage P&L statement record
          </p>
        </div>
      </div>

      <VrsForm
        entityType="Voyage P&L"
        apiPath={`/api/v1/voyage-results-settlement/voyage-pnls/${id}`}
        fields={fields}
        initialData={{
          pnlType: record.pnlType ?? "",
          title: record.title ?? "",
          voyageNumber: record.voyageNumber ?? "",
          vesselName: record.vesselName ?? "",
          freightRevenue: record.freightRevenue ?? "",
          demurrageRevenue: record.demurrageRevenue ?? "",
          otherRevenue: record.otherRevenue ?? "",
          portCosts: record.portCosts ?? "",
          bunkerCosts: record.bunkerCosts ?? "",
          canalCosts: record.canalCosts ?? "",
          otherCosts: record.otherCosts ?? "",
          totalRevenue: record.totalRevenue ?? "",
          totalCosts: record.totalCosts ?? "",
          netPnl: record.netPnl ?? "",
          marginPct: record.marginPct ?? "",
          approvedBy: record.approvedBy ?? "",
          approvedDate: record.approvedDate?.toISOString() ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/voyage-results-settlement/voyage-pnls/${id}`}
      />
    </div>
  );
}
