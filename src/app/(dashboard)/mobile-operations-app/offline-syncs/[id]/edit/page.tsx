import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOfflineSync } from "@/lib/mobile-operations-app/service";
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

export default async function EditOfflineSyncPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:edit")))
    redirect("/mobile-operations-app/offline-syncs");

  const { id } = await params;

  const record = await getOfflineSync(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/mobile-operations-app/offline-syncs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Offline Sync
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Offline Sync"
          apiPath={`/api/v1/mobile-operations-app/offline-syncs/${id}`}
          fields={OFFLINE_SYNC_FIELDS}
          initialData={{
            syncType: record.syncType,
            deviceId: record.deviceId ?? "",
            deviceName: record.deviceName ?? "",
            userName: record.userName ?? "",
            recordsSynced: record.recordsSynced ?? "",
            recordsFailed: record.recordsFailed ?? "",
            conflictsDetected: record.conflictsDetected ?? "",
            conflictsResolved: record.conflictsResolved ?? "",
            syncStartedAt: record.syncStartedAt
              ? record.syncStartedAt.toISOString().slice(0, 16)
              : "",
            syncCompletedAt: record.syncCompletedAt
              ? record.syncCompletedAt.toISOString().slice(0, 16)
              : "",
            dataSizeKb: record.dataSizeKb ?? "",
            syncDurationMs: record.syncDurationMs ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/mobile-operations-app/offline-syncs/${id}`}
        />
      </div>
    </div>
  );
}
