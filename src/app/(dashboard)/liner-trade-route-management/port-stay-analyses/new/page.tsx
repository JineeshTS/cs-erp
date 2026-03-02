import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";

const PORT_STAY_ANALYSIS_FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "portName", label: "Port Name", type: "text", required: true },
  { name: "portCountry", label: "Port Country", type: "text", required: true },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  {
    name: "arrivalDate",
    label: "Arrival Date",
    type: "datetime-local",
    required: true,
  },
  { name: "departureDate", label: "Departure Date", type: "datetime-local" },
  { name: "totalPortStayHours", label: "Total Port Stay Hours", type: "text" },
  { name: "waitingTimeHours", label: "Waiting Time Hours", type: "text" },
  { name: "berthingTimeHours", label: "Berthing Time Hours", type: "text" },
  { name: "cargoOpsHours", label: "Cargo Ops Hours", type: "text" },
  { name: "containersMoved", label: "Containers Moved", type: "number" },
  { name: "movesPerHour", label: "Moves Per Hour", type: "text" },
  { name: "totalDelayHours", label: "Total Delay Hours", type: "text" },
  { name: "bunkerConsumed", label: "Bunker Consumed", type: "text" },
  { name: "portCostEstimate", label: "Port Cost Estimate", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "productivityScore", label: "Productivity Score", type: "text" },
  { name: "benchmarkScore", label: "Benchmark Score", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPortStayAnalysisPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "liner:create"))
  )
    redirect("/liner-trade-route-management/port-stay-analyses");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/port-stay-analyses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Port Stay Analysis
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LtrForm
          entityType="Port Stay Analysis"
          apiPath="/api/v1/liner-trade-route-management/port-stay-analyses"
          fields={PORT_STAY_ANALYSIS_FIELDS}
          returnPath="/liner-trade-route-management/port-stay-analyses"
        />
      </div>
    </div>
  );
}
