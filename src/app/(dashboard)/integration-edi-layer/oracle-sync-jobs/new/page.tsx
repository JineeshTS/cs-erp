import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IelForm } from "@/components/integration-edi-layer/iel-form";
import type { FieldConfig } from "@/components/integration-edi-layer/iel-form";

const SYNC_JOB_FIELDS: FieldConfig[] = [
  {
    name: "jobCode",
    label: "Job Code",
    type: "text",
    required: true,
    placeholder: "SYNC-ORACLE-001",
  },
  {
    name: "syncType",
    label: "Sync Type",
    type: "select",
    options: [
      { value: "full", label: "Full" },
      { value: "incremental", label: "Incremental" },
      { value: "delta", label: "Delta" },
      { value: "manual", label: "Manual" },
    ],
  },
  {
    name: "direction",
    label: "Direction",
    type: "select",
    options: [
      { value: "inbound", label: "Inbound" },
      { value: "outbound", label: "Outbound" },
      { value: "bidirectional", label: "Bidirectional" },
    ],
  },
  {
    name: "entityType",
    label: "Entity Type",
    type: "text",
    required: true,
    placeholder: "invoice",
  },
  {
    name: "scheduleCron",
    label: "Schedule Cron",
    type: "text",
    placeholder: "0 */6 * * *",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewOracleSyncJobPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "integration:create"))
  )
    redirect("/integration-edi-layer");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integration-edi-layer/oracle-sync-jobs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Oracle Sync Job
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IelForm
          entityType="Oracle Sync Job"
          apiPath="/api/v1/integration-edi-layer/oracle/jobs"
          fields={SYNC_JOB_FIELDS}
          returnPath="/integration-edi-layer/oracle-sync-jobs"
        />
      </div>
    </div>
  );
}
