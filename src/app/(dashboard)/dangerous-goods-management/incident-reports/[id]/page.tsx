import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIncidentReport } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function IncidentReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { id } = await params;

  const report = await getIncidentReport(id, session.tenantId);
  if (!report) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:edit"
  );

  const statusVariant = (s: string) => {
    switch (s) {
      case "reported":
        return "secondary" as const;
      case "investigating":
        return "default" as const;
      case "resolved":
        return "success" as const;
      case "closed":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  const severityVariant = (s: string) => {
    switch (s) {
      case "critical":
        return "destructive" as const;
      case "major":
        return "default" as const;
      case "moderate":
        return "secondary" as const;
      case "minor":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return "-";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString();
  };

  const formatDateTime = (d: Date | string | null | undefined) => {
    if (!d) return "-";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/incident-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Incident Report
          </h1>
          <p className="text-sm text-gray-500">{report.incidentRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/dangerous-goods-management/incident-reports/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Incident Details
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Reference</dt>
            <dd className="mt-1 text-gray-900">{report.incidentRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Incident Type</dt>
            <dd className="mt-1 text-gray-900">{report.incidentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Severity Level</dt>
            <dd className="mt-1">
              <Badge variant={severityVariant(report.severityLevel)}>
                {report.severityLevel}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Incident Date</dt>
            <dd className="mt-1 text-gray-900">
              {formatDateTime(report.incidentDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-gray-900">{report.locationDescription}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(report.status)}>
                {report.status}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Cargo / Vessel Information
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{report.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-gray-900">{report.voyageNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{report.containerNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">UN Number</dt>
            <dd className="mt-1 text-gray-900">{report.unNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Proper Shipping Name</dt>
            <dd className="mt-1 text-gray-900">
              {report.properShippingName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Class</dt>
            <dd className="mt-1 text-gray-900">{report.imdgClass || "-"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Description and Actions
        </h2>
        <dl className="grid gap-4 sm:grid-cols-1">
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Immediate Actions</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.immediateActions || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Impact Assessment
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Casualties</dt>
            <dd className="mt-1 text-gray-900">
              {report.casualties != null ? report.casualties : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Injuries</dt>
            <dd className="mt-1 text-gray-900">
              {report.injuries != null ? report.injuries : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Cost</dt>
            <dd className="mt-1 text-gray-900">
              {report.estimatedCost
                ? `${report.estimatedCost} ${report.currency || ""}`
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Environmental Impact
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.environmentalImpact || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Property Damage</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.propertyDamage || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Reporting and Investigation
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Reported By</dt>
            <dd className="mt-1 text-gray-900">
              {report.reportedByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reported At</dt>
            <dd className="mt-1 text-gray-900">
              {formatDateTime(report.reportedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Investigator</dt>
            <dd className="mt-1 text-gray-900">
              {report.investigatorName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Investigation Started
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(report.investigationStarted)}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Investigation Findings
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.investigationFindings || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Root Cause</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.rootCause || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Lessons Learned</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.lessonsLearned || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
