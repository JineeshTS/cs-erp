import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewDeliveryReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "chartering:create"))
  )
    redirect("/chartering-vessel-management");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const DR_FIELDS: FieldConfig[] = [
    {
      name: "charterPartyId",
      label: "Charter Party ID",
      type: "text",
      required: true,
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      options: [
        { value: "delivery", label: "Delivery" },
        { value: "redelivery", label: "Redelivery" },
      ],
    },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    {
      name: "reportDate",
      label: "Report Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "vesselCondition",
      label: "Vessel Condition",
      type: "textarea",
    },
    { name: "surveyReference", label: "Survey Reference", type: "text" },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/delivery-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Delivery Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Delivery Report"
          apiPath="/api/v1/chartering-vessel-management/delivery-reports"
          fields={DR_FIELDS}
          returnPath="/chartering-vessel-management/delivery-reports"
        />
      </div>
    </div>
  );
}
