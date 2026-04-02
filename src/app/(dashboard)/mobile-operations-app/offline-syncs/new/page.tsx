import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MobForm, type FieldConfig } from "@/components/mobile-operations-app/mob-form";

const OFFLINE_SYNC_FIELDS: FieldConfig[] = [
  {
    name: "syncType",
    label: "Sync Type",
    type: "select",
    required: true,
    options: [
      { value: "full_sync", label: "Full Sync" },
      { value: "incremental_sync", label: "Incremental Sync" },
      { value: "conflict_resolution", label: "Conflict Resolution" },
      { value: "data_push", label: "Data Push" },
      { value: "data_pull", label: "Data Pull" },
    ],
  },
  { name: "deviceId", label: "Device ID", type: "text" },
  { name: "deviceName", label: "Device Name", type: "text" },
  { name: "userName", label: "User Name", type: "text" },
  { name: "recordsSynced", label: "Records Synced", type: "number" },
  { name: "recordsFailed", label: "Records Failed", type: "number" },
  { name: "conflictsDetected", label: "Conflicts Detected", type: "number" },
  { name: "conflictsResolved", label: "Conflicts Resolved", type: "number" },
  { name: "syncStartedAt", label: "Sync Started At", type: "datetime-local" },
  { name: "syncCompletedAt", label: "Sync Completed At", type: "datetime-local" },
  { name: "dataSizeKb", label: "Data Size (KB)", type: "text" },
  { name: "syncDurationMs", label: "Sync Duration (ms)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewOfflineSyncPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "mob:create"))
  )
    redirect("/mobile-operations-app/offline-syncs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/offline-syncs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Offline Sync
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Offline Sync"
          apiPath="/api/v1/mobile-operations-app/offline-syncs"
          fields={OFFLINE_SYNC_FIELDS}
          returnPath="/mobile-operations-app/offline-syncs"
        />
      </div>
    </div>
  );
}
