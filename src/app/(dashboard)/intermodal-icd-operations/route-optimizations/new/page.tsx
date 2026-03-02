import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewRouteOptimizationPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "intermodal:create"))
  )
    redirect("/intermodal-icd-operations/route-optimizations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/intermodal-icd-operations/route-optimizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Route Optimization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Route Optimization"
          apiPath="/api/v1/intermodal-icd-operations/route-optimizations"
          fields={ROUTE_OPTIMIZATION_FIELDS}
          returnPath="/intermodal-icd-operations/route-optimizations"
        />
      </div>
    </div>
  );
}
