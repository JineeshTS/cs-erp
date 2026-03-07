import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewIncidentReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "dangerous_goods:create"))
  )
    redirect("/dangerous-goods-management/incident-reports");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "reportedByName", label: "Reported By", type: "text" },
    { name: "reportedAt", label: "Reported At", type: "datetime-local" },
    { name: "investigatorName", label: "Investigator Name", type: "text" },
    { name: "investigationStarted", label: "Investigation Started", type: "datetime-local" },
    { name: "investigationFindings", label: "Investigation Findings", type: "textarea" },
    { name: "rootCause", label: "Root Cause", type: "textarea" },
    { name: "lessonsLearned", label: "Lessons Learned", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/incident-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Incident Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="Incident Report"
          apiPath="/api/v1/dangerous-goods-management/incident-reports"
          fields={INCIDENT_REPORT_FIELDS}
          returnPath="/dangerous-goods-management/incident-reports"
        />
      </div>
    </div>
  );
}
