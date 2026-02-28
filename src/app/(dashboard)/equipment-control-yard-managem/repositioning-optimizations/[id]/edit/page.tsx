import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyRepositioningOptimizations } from "@/db/schema";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const REPOSITIONING_OPTIMIZATION_FIELDS: FieldConfig[] = [
  { name: "optimizationRunId", label: "Optimization Run ID", type: "text" },
  { name: "planReference", label: "Plan Reference", type: "text" },
  { name: "originPort", label: "Origin Port", type: "text", required: true },
  { name: "destinationPort", label: "Destination Port", type: "text", required: true },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "select", options: [
    { value: "20", label: "20ft" },
    { value: "40", label: "40ft" },
    { value: "45", label: "45ft" },
  ]},
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "transportMode", label: "Transport Mode", type: "select", options: [
    { value: "vessel", label: "Vessel" },
    { value: "truck", label: "Truck" },
    { value: "rail", label: "Rail" },
    { value: "barge", label: "Barge" },
  ]},
  { name: "estimatedCost", label: "Estimated Cost", type: "number" },
  { name: "estimatedDays", label: "Estimated Days", type: "number" },
  { name: "estimatedCarbon", label: "Estimated Carbon", type: "number" },
  { name: "currency", label: "Currency", type: "select", options: [
    { value: "USD", label: "USD" },
    { value: "QAR", label: "QAR" },
    { value: "AED", label: "AED" },
    { value: "SAR", label: "SAR" },
    { value: "INR", label: "INR" },
  ]},
  { name: "aiScore", label: "AI Score", type: "number" },
  { name: "aiModel", label: "AI Model", type: "text" },
  { name: "algorithm", label: "Algorithm", type: "text" },
  { name: "selectedForExecution", label: "Selected for Execution", type: "checkbox" },
  { name: "executionDate", label: "Execution Date", type: "datetime-local" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "pending", label: "Pending" },
    { value: "running", label: "Running" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "approved", label: "Approved" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRepositioningOptimizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;
  const record = await db
    .select()
    .from(eqyRepositioningOptimizations)
    .where(
      and(
        eq(eqyRepositioningOptimizations.id, id),
        eq(eqyRepositioningOptimizations.tenantId, session.tenantId),
        isNull(eqyRepositioningOptimizations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    optimizationRunId: record.optimizationRunId ?? "",
    planReference: record.planReference ?? "",
    originPort: record.originPort,
    destinationPort: record.destinationPort,
    containerType: record.containerType ?? "",
    containerSize: record.containerSize ?? "",
    quantity: record.quantity ?? "",
    transportMode: record.transportMode ?? "",
    estimatedCost: record.estimatedCost ?? "",
    estimatedDays: record.estimatedDays ?? "",
    estimatedCarbon: record.estimatedCarbon ? Number(record.estimatedCarbon) : "",
    currency: record.currency,
    aiScore: record.aiScore ? Number(record.aiScore) : "",
    aiModel: record.aiModel ?? "",
    algorithm: record.algorithm ?? "",
    selectedForExecution: record.selectedForExecution ?? false,
    executionDate: record.executionDate?.toISOString() ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/repositioning-optimizations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Repositioning Optimization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Repositioning Optimization"
          apiPath={`/api/v1/equipment-control-yard-managem/repositioning-optimizations/${id}`}
          fields={REPOSITIONING_OPTIMIZATION_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/repositioning-optimizations/${id}`}
        />
      </div>
    </div>
  );
}
