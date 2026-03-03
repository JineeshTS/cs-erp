import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDataLakeAnalytic } from "@/lib/real-time-iot-asset-tracking/service";
import {
  IotForm,
  type FieldConfig,
} from "@/components/real-time-iot-asset-tracking/iot-form";

const DATA_LAKE_ANALYTIC_FIELDS: FieldConfig[] = [
  {
    name: "analyticsType",
    label: "Analytics Type",
    type: "select",
    required: true,
    options: [
      { value: "fleet_overview", label: "Fleet Overview" },
      { value: "asset_utilization", label: "Asset Utilization" },
      { value: "sensor_health", label: "Sensor Health" },
      { value: "trend_analysis", label: "Trend Analysis" },
      { value: "compliance_report", label: "Compliance Report" },
    ],
  },
  { name: "reportName", label: "Report Name", type: "text" },
  { name: "reportingPeriod", label: "Reporting Period", type: "text" },
  { name: "dataSourceCount", label: "Data Source Count", type: "number" },
  { name: "recordsProcessed", label: "Records Processed", type: "number" },
  { name: "anomaliesDetected", label: "Anomalies Detected", type: "number" },
  { name: "avgResponseTime", label: "Avg Response Time", type: "text" },
  { name: "uptimePct", label: "Uptime %", type: "text" },
  {
    name: "lastRefreshedAt",
    label: "Last Refreshed At",
    type: "datetime-local",
  },
  { name: "scheduleCron", label: "Schedule Cron", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDataLakeAnalyticPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:edit")))
    redirect("/real-time-iot-asset-tracking/data-lake-analytics");

  const { id } = await params;

  const record = await getDataLakeAnalytic(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/real-time-iot-asset-tracking/data-lake-analytics/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Data Lake Analytic
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="Data Lake Analytic"
          apiPath={`/api/v1/real-time-iot-asset-tracking/data-lake-analytics/${id}`}
          fields={DATA_LAKE_ANALYTIC_FIELDS}
          initialData={{
            analyticsType: record.analyticsType,
            reportName: record.reportName ?? "",
            reportingPeriod: record.reportingPeriod ?? "",
            dataSourceCount: record.dataSourceCount ?? "",
            recordsProcessed: record.recordsProcessed ?? "",
            anomaliesDetected: record.anomaliesDetected ?? "",
            avgResponseTime: record.avgResponseTime ?? "",
            uptimePct: record.uptimePct ?? "",
            lastRefreshedAt: record.lastRefreshedAt
              ? record.lastRefreshedAt.toISOString()
              : "",
            scheduleCron: record.scheduleCron ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/real-time-iot-asset-tracking/data-lake-analytics/${id}`}
        />
      </div>
    </div>
  );
}
