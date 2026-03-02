import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDemurrageCalculation } from "@/lib/demurrage-detention-management/service";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";

const CALCULATION_FIELDS: FieldConfig[] = [
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
  {
    name: "containerSize",
    label: "Container Size",
    type: "select",
    required: true,
    options: [
      { value: "20", label: "20" },
      { value: "40", label: "40" },
      { value: "40HC", label: "40HC" },
      { value: "45", label: "45" },
    ],
  },
  {
    name: "containerType",
    label: "Container Type",
    type: "select",
    required: true,
    options: [
      { value: "dry", label: "Dry" },
      { value: "reefer", label: "Reefer" },
      { value: "open_top", label: "Open Top" },
      { value: "flat_rack", label: "Flat Rack" },
      { value: "tank", label: "Tank" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "blNumber", label: "BL Number", type: "text" },
  { name: "customerName", label: "Customer Name", type: "text", required: true },
  { name: "portName", label: "Port Name", type: "text", required: true },
  { name: "portCountry", label: "Port Country", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "dischargeDate", label: "Discharge Date", type: "datetime-local", required: true },
  { name: "gateOutDate", label: "Gate Out Date", type: "datetime-local" },
  { name: "freeTimeDays", label: "Free Time Days", type: "number", required: true },
  { name: "freeTimeExpiry", label: "Free Time Expiry", type: "datetime-local", required: true },
  { name: "demurrageDays", label: "Demurrage Days", type: "number" },
  { name: "dailyRate", label: "Daily Rate", type: "text", required: true },
  { name: "totalAmount", label: "Total Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "tariffName", label: "Tariff Name", type: "text" },
  { name: "autoCalculated", label: "Auto Calculated", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDemurrageCalculationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:edit")))
    redirect("/demurrage-detention-management/demurrage-calculations");

  const { id } = await params;

  const calc = await getDemurrageCalculation(id, session.tenantId);
  if (!calc) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/demurrage-detention-management/demurrage-calculations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Demurrage Calculation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Demurrage Calculation"
          apiPath={`/api/v1/demurrage-detention-management/demurrage-calculations/${id}`}
          fields={CALCULATION_FIELDS}
          initialData={{
            containerNumber: calc.containerNumber ?? "",
            containerSize: calc.containerSize ?? "",
            containerType: calc.containerType ?? "",
            bookingRef: calc.bookingRef ?? "",
            blNumber: calc.blNumber ?? "",
            customerName: calc.customerName ?? "",
            portName: calc.portName ?? "",
            portCountry: calc.portCountry ?? "",
            terminalName: calc.terminalName ?? "",
            dischargeDate: calc.dischargeDate
              ? new Date(calc.dischargeDate).toISOString()
              : "",
            gateOutDate: calc.gateOutDate
              ? new Date(calc.gateOutDate).toISOString()
              : "",
            freeTimeDays: calc.freeTimeDays ?? "",
            freeTimeExpiry: calc.freeTimeExpiry
              ? new Date(calc.freeTimeExpiry).toISOString()
              : "",
            demurrageDays: calc.demurrageDays ?? "",
            dailyRate: calc.dailyRate ?? "",
            totalAmount: calc.totalAmount ?? "",
            currency: calc.currency ?? "",
            tariffName: calc.tariffName ?? "",
            autoCalculated: calc.autoCalculated ?? false,
            notes: calc.notes ?? "",
          }}
          isEdit
          returnPath={`/demurrage-detention-management/demurrage-calculations/${id}`}
        />
      </div>
    </div>
  );
}
