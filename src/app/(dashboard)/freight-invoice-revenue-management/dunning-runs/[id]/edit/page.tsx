import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getDunningRun } from "@/lib/freight-invoice-revenue-management/service";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";

const DUNNING_RUN_FIELDS: FieldConfig[] = [
  {
    name: "runType",
    label: "Run Type",
    type: "select",
    required: true,
    options: [
      { value: "automated", label: "Automated" },
      { value: "manual", label: "Manual" },
      { value: "ai_recommended", label: "AI Recommended" },
      { value: "escalation", label: "Escalation" },
      { value: "final_notice", label: "Final Notice" },
    ],
  },
  { name: "targetSegment", label: "Target Segment", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "totalOutstanding", label: "Total Outstanding", type: "number" },
  { name: "invoicesTargeted", label: "Invoices Targeted", type: "number" },
  { name: "customersTargeted", label: "Customers Targeted", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDunningRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:edit")))
    redirect("/freight-invoice-revenue-management/dunning-runs");

  const { id } = await params;
  const run = await getDunningRun(id, session.tenantId);
  if (!run) notFound();

  const initialData: Record<string, unknown> = {
    runType: run.runType,
    targetSegment: run.targetSegment,
    currency: run.currency,
    totalOutstanding: run.totalOutstanding,
    invoicesTargeted: run.invoicesTargeted,
    customersTargeted: run.customersTargeted,
    notes: run.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/freight-invoice-revenue-management/dunning-runs/${run.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {run.runRef}
          </h1>
          <p className="text-sm text-gray-500">Update dunning run details</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Dunning Run"
          apiPath={`/api/v1/freight-invoice-revenue-management/dunning-runs/${run.id}`}
          fields={DUNNING_RUN_FIELDS}
          initialData={initialData}
          isEdit
          returnPath="/freight-invoice-revenue-management/dunning-runs"
        />
      </div>
    </div>
  );
}
