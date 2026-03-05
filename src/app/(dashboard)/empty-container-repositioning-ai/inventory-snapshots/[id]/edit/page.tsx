import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getInventorySnapshot } from "@/lib/empty-container-repositioning-ai/service";
import { EcrForm, type FieldConfig } from "@/components/empty-container-repositioning-ai/ecr-form";

const fields: FieldConfig[] = [
  {
    name: "snapshotType",
    label: "Snapshot Type",
    type: "select",
    required: true,
    options: [
      { label: "Daily Count", value: "daily_count" },
      { label: "Weekly Summary", value: "weekly_summary" },
      { label: "Location Audit", value: "location_audit" },
      { label: "Aging Report", value: "aging_report" },
      { label: "Type Breakdown", value: "type_breakdown" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "locationCode", label: "Location Code", type: "text", required: true },
  { name: "locationName", label: "Location Name", type: "text", required: true },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "availableCount", label: "Available Count", type: "number" },
  { name: "damagedCount", label: "Damaged Count", type: "number" },
  { name: "totalCount", label: "Total Count", type: "number" },
  { name: "avgDwellDays", label: "Avg Dwell Days", type: "text" },
  { name: "surplusDeficit", label: "Surplus / Deficit", type: "number" },
  { name: "snapshotDate", label: "Snapshot Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditInventorySnapshotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:edit")))
    redirect("/");

  const { id } = await params;
  const snapshot = await getInventorySnapshot(id, session.tenantId);
  if (!snapshot) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/empty-container-repositioning-ai/inventory-snapshots/${id}`}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Inventory Snapshot
          </h1>
          <p className="text-sm text-muted-foreground">
            {snapshot.snapshotRef} — {snapshot.title}
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <EcrForm
          entityType="inventory-snapshots"
          apiPath={`/api/v1/empty-container-repositioning-ai/inventory-snapshots/${id}`}
          fields={fields}
          initialData={snapshot}
          isEdit
          returnPath={`/empty-container-repositioning-ai/inventory-snapshots/${id}`}
        />
      </div>
    </div>
  );
}
