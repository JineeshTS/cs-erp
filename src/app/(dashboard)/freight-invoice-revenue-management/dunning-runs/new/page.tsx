import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewDunningRunPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:create")))
    redirect("/freight-invoice-revenue-management/dunning-runs");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "totalOutstanding", label: "Total Outstanding", type: "number" },
    { name: "invoicesTargeted", label: "Invoices Targeted", type: "number" },
    { name: "customersTargeted", label: "Customers Targeted", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/freight-invoice-revenue-management/dunning-runs"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Dunning Run
          </h1>
          <p className="text-sm text-gray-500">
            Create a new dunning collection run
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Dunning Run"
          apiPath="/api/v1/freight-invoice-revenue-management/dunning-runs"
          fields={DUNNING_RUN_FIELDS}
          returnPath="/freight-invoice-revenue-management/dunning-runs"
        />
      </div>
    </div>
  );
}
