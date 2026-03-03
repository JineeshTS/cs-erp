import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";

const STORAGE_DEMURRAGE_FIELDS: FieldConfig[] = [
  {
    name: "tariffType",
    label: "Tariff Type",
    type: "select",
    required: true,
    options: [
      { value: "import_storage", label: "Import Storage" },
      { value: "export_storage", label: "Export Storage" },
      { value: "demurrage", label: "Demurrage" },
      { value: "detention", label: "Detention" },
      { value: "combined", label: "Combined" },
    ],
  },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "freeDays", label: "Free Days", type: "number" },
  { name: "dailyRateTier1", label: "Daily Rate Tier 1", type: "number" },
  { name: "tier1DaysFrom", label: "Tier 1 Days From", type: "number" },
  { name: "tier1DaysTo", label: "Tier 1 Days To", type: "number" },
  { name: "dailyRateTier2", label: "Daily Rate Tier 2", type: "number" },
  { name: "tier2DaysFrom", label: "Tier 2 Days From", type: "number" },
  { name: "tier2DaysTo", label: "Tier 2 Days To", type: "number" },
  { name: "dailyRateTier3", label: "Daily Rate Tier 3", type: "number" },
  { name: "tariffCurrency", label: "Tariff Currency", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewStorageDemurrageTariffPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/port-tariff-terminal-billing/storage-demurrage-tariffs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Storage &amp; Demurrage Tariff
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new storage or demurrage tariff schedule
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Storage & Demurrage Tariff"
          apiPath="/api/v1/port-tariff-terminal-billing/storage-demurrage-tariffs"
          returnPath="/port-tariff-terminal-billing/storage-demurrage-tariffs"
          fields={STORAGE_DEMURRAGE_FIELDS}
        />
      </div>
    </div>
  );
}
