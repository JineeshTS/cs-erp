import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVarianceAnalysis } from "@/lib/port-disbursement-accounting/service";
import { PdaForm, type FieldConfig } from "@/components/port-disbursement-accounting/pda-form";
import { getPortOptions, getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditVarianceAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:edit")))
    redirect("/port-disbursement-accounting/variance-analyses");

  const [portOpts, vesselOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const VARIANCE_ANALYSIS_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts, required: true },
    { name: "portName", label: "Port Name", type: "select", options: portOpts, required: true },
    { name: "proformaRef", label: "Proforma Ref", type: "text" },
    { name: "fdaRef", label: "FDA Ref", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "pdaTotal", label: "PDA Total", type: "number", required: true },
    { name: "fdaTotal", label: "FDA Total", type: "number", required: true },
    { name: "deviationThreshold", label: "Deviation Threshold", type: "number" },
    {
      name: "rootCauseAnalysis",
      label: "Root Cause Analysis",
      type: "textarea",
    },
    { name: "recommendations", label: "Recommendations", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getVarianceAnalysis(id, session.tenantId);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-disbursement-accounting/variance-analyses/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Variance Analysis
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Variance Analysis"
          apiPath={`/api/v1/port-disbursement-accounting/variance-analyses/${id}`}
          fields={VARIANCE_ANALYSIS_FIELDS}
          initialData={{
            vesselName: record.vesselName,
            portCode: record.portCode,
            portName: record.portName,
            proformaRef: record.proformaRef ?? "",
            fdaRef: record.fdaRef ?? "",
            currency: record.currency,
            pdaTotal: record.pdaTotal,
            fdaTotal: record.fdaTotal,
            deviationThreshold: record.deviationThreshold,
            rootCauseAnalysis: record.rootCauseAnalysis ?? "",
            recommendations: record.recommendations ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/port-disbursement-accounting/variance-analyses/${id}`}
        />
      </div>
    </div>
  );
}
