import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRouteOptimization } from "@/lib/intermodal-icd-operations/service";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";

const ROUTE_OPTIMIZATION_FIELDS: FieldConfig[] = [
  { name: "requestedByName", label: "Requested By", type: "text" },
  {
    name: "originLocation",
    label: "Origin",
    type: "text",
    required: true,
  },
  {
    name: "destinationLocation",
    label: "Destination",
    type: "text",
    required: true,
  },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "containerCount", label: "Container Count", type: "number" },
  { name: "grossWeightKg", label: "Gross Weight (kg)", type: "text" },
  {
    name: "requiredDeliveryAt",
    label: "Required Delivery",
    type: "datetime-local",
  },
  {
    name: "optimizationCriteria",
    label: "Optimization Criteria",
    type: "select",
    required: true,
    options: [
      { value: "cost", label: "Cost" },
      { value: "time", label: "Time" },
      { value: "carbon", label: "Carbon" },
      { value: "balanced", label: "Balanced" },
    ],
  },
  {
    name: "selectedRouteIndex",
    label: "Selected Route Index",
    type: "number",
  },
  {
    name: "selectedRouteSummary",
    label: "Selected Route Summary",
    type: "textarea",
  },
  { name: "estimatedCost", label: "Estimated Cost", type: "text" },
  {
    name: "estimatedTransitDays",
    label: "Est. Transit Days",
    type: "number",
  },
  { name: "estimatedCarbonKg", label: "Est. Carbon (kg)", type: "text" },
  { name: "aiModelUsed", label: "AI Model Used", type: "text" },
  { name: "aiConfidenceScore", label: "AI Confidence Score", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRouteOptimizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:edit")))
    redirect("/intermodal-icd-operations/route-optimizations");

  const { id } = await params;
  const record = await getRouteOptimization(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/intermodal-icd-operations/route-optimizations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Route Optimization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Route Optimization"
          apiPath={`/api/v1/intermodal-icd-operations/route-optimizations/${id}`}
          fields={ROUTE_OPTIMIZATION_FIELDS}
          initialData={{
            requestedByName: record.requestedByName ?? "",
            originLocation: record.originLocation ?? "",
            destinationLocation: record.destinationLocation ?? "",
            cargoDescription: record.cargoDescription ?? "",
            containerSize: record.containerSize ?? "",
            containerCount: record.containerCount ?? "",
            grossWeightKg: record.grossWeightKg ?? "",
            requiredDeliveryAt: record.requiredDeliveryAt
              ? new Date(record.requiredDeliveryAt).toISOString()
              : "",
            optimizationCriteria: record.optimizationCriteria ?? "",
            selectedRouteIndex: record.selectedRouteIndex ?? "",
            selectedRouteSummary: record.selectedRouteSummary ?? "",
            estimatedCost: record.estimatedCost ?? "",
            estimatedTransitDays: record.estimatedTransitDays ?? "",
            estimatedCarbonKg: record.estimatedCarbonKg ?? "",
            aiModelUsed: record.aiModelUsed ?? "",
            aiConfidenceScore: record.aiConfidenceScore ?? "",
            currency: record.currency ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/intermodal-icd-operations/route-optimizations/${id}`}
        />
      </div>
    </div>
  );
}
