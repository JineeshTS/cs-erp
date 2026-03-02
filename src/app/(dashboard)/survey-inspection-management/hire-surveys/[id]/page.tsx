import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHireSurvey } from "@/lib/survey-inspection-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    case "in_progress":
      return "warning";
    default:
      return "secondary";
  }
}

export default async function HireSurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:read")))
    redirect("/survey-inspection-management");

  const { id } = await params;

  const record = await getHireSurvey(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "survey:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/survey-inspection-management/hire-surveys"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.surveyRef}
          </h1>
          <p className="text-sm text-gray-500">
            Hire Survey &middot; {record.vesselName}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/survey-inspection-management/hire-surveys/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Survey Ref</dt>
            <dd className="mt-1 text-gray-900">{record.surveyRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Survey Type</dt>
            <dd className="mt-1 text-gray-900">{record.surveyType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{record.imoNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Charterer Name</dt>
            <dd className="mt-1 text-gray-900">{record.chartererName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Owner Name</dt>
            <dd className="mt-1 text-gray-900">{record.ownerName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Charter Party Ref</dt>
            <dd className="mt-1 text-gray-900">{record.charterPartyRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{record.portName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hull Condition</dt>
            <dd className="mt-1 text-gray-900">{record.hullCondition || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Deck Condition</dt>
            <dd className="mt-1 text-gray-900">{record.deckCondition || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Engine Condition</dt>
            <dd className="mt-1 text-gray-900">{record.engineCondition || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accommodation Condition</dt>
            <dd className="mt-1 text-gray-900">{record.accommodationCondition || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Safety Equipment OK</dt>
            <dd className="mt-1 text-gray-900">
              {record.safetyEquipmentOk ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bunker ROB Fuel</dt>
            <dd className="mt-1 text-gray-900">{record.bunkerRobFuel || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bunker ROB Diesel</dt>
            <dd className="mt-1 text-gray-900">{record.bunkerRobDiesel || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bunker ROB Lube Oil</dt>
            <dd className="mt-1 text-gray-900">{record.bunkerRobLubeOil || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fresh Water ROB</dt>
            <dd className="mt-1 text-gray-900">{record.freshWaterRob || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Constants Weight</dt>
            <dd className="mt-1 text-gray-900">{record.constantsWeight || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Surveyor Name</dt>
            <dd className="mt-1 text-gray-900">{record.surveyorName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Surveyor Company</dt>
            <dd className="mt-1 text-gray-900">{record.surveyorCompany || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Scheduled At</dt>
            <dd className="mt-1 text-gray-900">
              {record.scheduledAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Completed At</dt>
            <dd className="mt-1 text-gray-900">
              {record.completedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.deliveryDate?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Redelivery Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.redeliveryDate?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
