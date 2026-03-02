import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";

const TRANSIT_PROCEDURE_FIELDS: FieldConfig[] = [
  {
    name: "procedureType",
    label: "Procedure Type",
    type: "select",
    required: true,
    options: [
      { value: "transit", label: "Transit" },
      { value: "re_export", label: "Re-Export" },
      { value: "transshipment", label: "Transshipment" },
      { value: "bonded_movement", label: "Bonded Movement" },
    ],
  },
  { name: "declarationNumber", label: "Declaration Number", type: "text" },
  { name: "customsOfficeOrigin", label: "Customs Office Origin", type: "text" },
  { name: "customsOfficeDestination", label: "Customs Office Destination", type: "text" },
  { name: "principalName", label: "Principal Name", type: "text", required: true },
  { name: "principalCode", label: "Principal Code", type: "text" },
  {
    name: "guaranteeType",
    label: "Guarantee Type",
    type: "select",
    options: [
      { value: "bank_guarantee", label: "Bank Guarantee" },
      { value: "cash_deposit", label: "Cash Deposit" },
      { value: "customs_bond", label: "Customs Bond" },
      { value: "waiver", label: "Waiver" },
    ],
  },
  { name: "guaranteeAmount", label: "Guarantee Amount", type: "text", placeholder: "0.00" },
  { name: "guaranteeCurrency", label: "Guarantee Currency", type: "text", placeholder: "USD" },
  { name: "guaranteeReference", label: "Guarantee Reference", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "sealNumber", label: "Seal Number", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "hsCode", label: "HS Code", type: "text" },
  { name: "grossWeightKg", label: "Gross Weight (kg)", type: "text", placeholder: "0.00" },
  { name: "originCountry", label: "Origin Country", type: "text" },
  { name: "destinationCountry", label: "Destination Country", type: "text" },
  { name: "routeDescription", label: "Route Description", type: "textarea" },
  { name: "transitStartAt", label: "Transit Start", type: "datetime-local" },
  { name: "transitDeadlineAt", label: "Transit Deadline", type: "datetime-local" },
  { name: "transitCompletedAt", label: "Transit Completed", type: "datetime-local" },
  { name: "discharged", label: "Discharged", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewTransitProcedurePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "customs:create"))
  )
    redirect("/customs-compliance-regulatory/transit-procedures");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/transit-procedures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Transit Procedure
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="Transit Procedure"
          apiPath="/api/v1/customs-compliance-regulatory/transit-procedures"
          fields={TRANSIT_PROCEDURE_FIELDS}
          returnPath="/customs-compliance-regulatory/transit-procedures"
        />
      </div>
    </div>
  );
}
