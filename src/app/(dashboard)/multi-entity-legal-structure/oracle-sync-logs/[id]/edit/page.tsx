import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsOracleSyncLogs } from "@/db/schema";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  {
    name: "integrationConfigId",
    label: "Integration Config ID",
    type: "text",
    required: true,
  },
  {
    name: "syncType",
    label: "Sync Type",
    type: "select",
    required: true,
    options: [
      { value: "full", label: "Full" },
      { value: "incremental", label: "Incremental" },
      { value: "manual", label: "Manual" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "running", label: "Running" },
      { value: "completed", label: "Completed" },
      { value: "failed", label: "Failed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  { name: "recordsProcessed", label: "Records Processed", type: "number" },
  { name: "recordsFailed", label: "Records Failed", type: "number" },
];

export default async function EditOracleSyncLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/oracle-sync-logs");

  const { id } = await params;

  const log = await db
    .select()
    .from(melsOracleSyncLogs)
    .where(
      and(
        eq(melsOracleSyncLogs.id, id),
        eq(melsOracleSyncLogs.tenantId, session.tenantId),
        isNull(melsOracleSyncLogs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!log) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/oracle-sync-logs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Oracle Sync Log
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Oracle Sync Log"
          apiPath={`/api/v1/multi-entity-legal-structure/oracle-sync-logs/${id}`}
          fields={FIELDS}
          initialData={{
            integrationConfigId: log.integrationConfigId,
            syncType: log.syncType,
            status: log.status,
            recordsProcessed: log.recordsProcessed,
            recordsFailed: log.recordsFailed,
          }}
          isEdit
          returnPath={`/multi-entity-legal-structure/oracle-sync-logs/${id}`}
        />
      </div>
    </div>
  );
}
