import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyContainerSurveys } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function ContainerSurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem/container-surveys");

  const { id } = await params;

  const record = await db
    .select()
    .from(eqyContainerSurveys)
    .where(
      and(
        eq(eqyContainerSurveys.id, id),
        eq(eqyContainerSurveys.tenantId, session.tenantId),
        isNull(eqyContainerSurveys.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:edit"
  );

  const statusVariant = (s: string) => {
    switch (s) {
      case "completed":
        return "success" as const;
      case "in_progress":
        return "default" as const;
      case "reviewed":
        return "secondary" as const;
      case "scheduled":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  const conditionVariant = (c: string | null) => {
    switch (c) {
      case "good":
        return "success" as const;
      case "fair":
        return "default" as const;
      case "poor":
        return "destructive" as const;
      case "condemned":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/container-surveys"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.surveyReference}
          </h1>
          <p className="text-sm text-gray-500">
            Container Survey &middot; {record.containerNumber}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/equipment-control-yard-managem/container-surveys/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Survey Reference</dt>
            <dd className="mt-1 text-gray-900">{record.surveyReference}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Survey Type</dt>
            <dd className="mt-1 text-gray-900">
              {record.surveyType.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Surveyor Name</dt>
            <dd className="mt-1 text-gray-900">{record.surveyorName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Survey Company</dt>
            <dd className="mt-1 text-gray-900">{record.surveyCompany ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Survey Date</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(record.surveyDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Survey Location</dt>
            <dd className="mt-1 text-gray-900">{record.surveyLocation ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Overall Condition</dt>
            <dd className="mt-1">
              {record.overallCondition ? (
                <Badge variant={conditionVariant(record.overallCondition)}>
                  {record.overallCondition}
                </Badge>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Structural Grade</dt>
            <dd className="mt-1 text-gray-900">{record.structuralGrade ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Floor Grade</dt>
            <dd className="mt-1 text-gray-900">{record.floorGrade ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Roof Grade</dt>
            <dd className="mt-1 text-gray-900">{record.roofGrade ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Door Grade</dt>
            <dd className="mt-1 text-gray-900">{record.doorGrade ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Survey Due</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(record.nextSurveyDue)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status.replace(/_/g, " ")}
              </Badge>
            </dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {record.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
