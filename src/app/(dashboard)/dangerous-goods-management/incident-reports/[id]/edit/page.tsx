import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIncidentReport } from "@/lib/dangerous-goods-management/service";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";

const INCIDENT_REPORT_FIELDS: FieldConfig[] = [
  {
    name: "incidentType",
    label: "Incident Type",
    type: "select",
    required: true,
    options: [
      { value: "leakage", label: "Leakage" },
      { value: "fire", label: "Fire" },
      { value: "explosion", label: "Explosion" },
      { value: "contamination", label: "Contamination" },
      { value: "spill", label: "Spill" },
      { value: "exposure", label: "Exposure" },
      { value: "structural_failure", label: "Structural Failure" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "severityLevel",
    label: "Severity Level",
    type: "select",
    required: true,
    options: [
      { value: "minor", label: "Minor" },
      { value: "moderate", label: "Moderate" },
      { value: "major", label: "Major" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "incidentDate", label: "Incident Date", type: "datetime-local", required: true },
  { name: "locationDescription", label: "Location Description", type: "text", required: true },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "unNumber", label: "UN Number", type: "text" },
  { name: "properShippingName", label: "Proper Shipping Name", type: "text" },
  { name: "imdgClass", label: "IMDG Class", type: "text" },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "immediateActions", label: "Immediate Actions", type: "textarea" },
  { name: "casualties", label: "Casualties", type: "number" },
  { name: "injuries", label: "Injuries", type: "number" },
  { name: "environmentalImpact", label: "Environmental Impact", type: "textarea" },
  { name: "propertyDamage", label: "Property Damage", type: "textarea" },
  { name: "estimatedCost", label: "Estimated Cost", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "reportedByName", label: "Reported By", type: "text" },
  { name: "reportedAt", label: "Reported At", type: "datetime-local" },
  { name: "investigatorName", label: "Investigator Name", type: "text" },
  { name: "investigationStarted", label: "Investigation Started", type: "datetime-local" },
  { name: "investigationFindings", label: "Investigation Findings", type: "textarea" },
  { name: "rootCause", label: "Root Cause", type: "textarea" },
  { name: "lessonsLearned", label: "Lessons Learned", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditIncidentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:edit")))
    redirect("/dangerous-goods-management/incident-reports");

  const { id } = await params;

  const report = await getIncidentReport(id, session.tenantId);
  if (!report) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dangerous-goods-management/incident-reports/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Incident Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="Incident Report"
          apiPath={`/api/v1/dangerous-goods-management/incident-reports/${id}`}
          fields={INCIDENT_REPORT_FIELDS}
          initialData={{
            incidentType: report.incidentType ?? "",
            severityLevel: report.severityLevel ?? "",
            incidentDate: report.incidentDate ? new Date(report.incidentDate).toISOString() : "",
            locationDescription: report.locationDescription ?? "",
            vesselName: report.vesselName ?? "",
            voyageNumber: report.voyageNumber ?? "",
            containerNumber: report.containerNumber ?? "",
            unNumber: report.unNumber ?? "",
            properShippingName: report.properShippingName ?? "",
            imdgClass: report.imdgClass ?? "",
            description: report.description ?? "",
            immediateActions: report.immediateActions ?? "",
            casualties: report.casualties ?? "",
            injuries: report.injuries ?? "",
            environmentalImpact: report.environmentalImpact ?? "",
            propertyDamage: report.propertyDamage ?? "",
            estimatedCost: report.estimatedCost ?? "",
            currency: report.currency ?? "",
            reportedByName: report.reportedByName ?? "",
            reportedAt: report.reportedAt ? new Date(report.reportedAt).toISOString() : "",
            investigatorName: report.investigatorName ?? "",
            investigationStarted: report.investigationStarted ? new Date(report.investigationStarted).toISOString() : "",
            investigationFindings: report.investigationFindings ?? "",
            rootCause: report.rootCause ?? "",
            lessonsLearned: report.lessonsLearned ?? "",
            notes: report.notes ?? "",
          }}
          isEdit
          returnPath={`/dangerous-goods-management/incident-reports/${id}`}
        />
      </div>
    </div>
  );
}
