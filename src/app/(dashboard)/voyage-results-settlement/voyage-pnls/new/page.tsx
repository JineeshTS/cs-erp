import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewVoyagePnlPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:create")))
    redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/voyage-results-settlement/voyage-pnls"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <TrendingUp className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Voyage P&L</h1>
          <p className="text-sm text-muted-foreground">
            Create a new voyage P&L statement record
          </p>
        </div>
      </div>

      <VrsForm
        entityType="Voyage P&L"
        apiPath="/api/v1/voyage-results-settlement/voyage-pnls"
        fields={fields}
        returnPath="/voyage-results-settlement/voyage-pnls"
      />
    </div>
  );
}
