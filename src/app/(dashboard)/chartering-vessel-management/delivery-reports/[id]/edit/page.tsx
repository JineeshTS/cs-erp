import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmDeliveryReports } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

const DR_FIELDS: FieldConfig[] = [
  {
    name: "charterPartyId",
    label: "Charter Party ID",
    type: "text",
    required: true,
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    options: [
      { value: "delivery", label: "Delivery" },
      { value: "redelivery", label: "Redelivery" },
    ],
  },
  { name: "portName", label: "Port Name", type: "text" },
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

export default async function EditDeliveryReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const dr = await db
    .select()
    .from(cvmDeliveryReports)
    .where(
      and(
        eq(cvmDeliveryReports.id, id),
        eq(cvmDeliveryReports.tenantId, session.tenantId),
        isNull(cvmDeliveryReports.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!dr) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/delivery-reports/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Delivery Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Delivery Report"
          apiPath={`/api/v1/chartering-vessel-management/delivery-reports/${id}`}
          fields={DR_FIELDS}
          initialData={{
            charterPartyId: dr.charterPartyId,
            vesselName: dr.vesselName ?? "",
            reportType: dr.reportType,
            portName: dr.portName ?? "",
            reportDate: dr.reportDate.toISOString(),
            vesselCondition: dr.vesselCondition ?? "",
            surveyReference: dr.surveyReference ?? "",
            remarks: dr.remarks ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/delivery-reports/${id}`}
        />
      </div>
    </div>
  );
}
