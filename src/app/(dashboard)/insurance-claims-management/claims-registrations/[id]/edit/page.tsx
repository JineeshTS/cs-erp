import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getClaimsRegistration } from "@/lib/insurance-claims-management/service";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";
import { getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditClaimsRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:edit"))) redirect("/login");

  const [vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "claimType",
      label: "Claim Type",
      type: "select",
      required: true,
      options: [
        { value: "cargo_damage", label: "Cargo Damage" },
        { value: "collision", label: "Collision" },
        { value: "pi_liability", label: "P&I Liability" },
        { value: "hull_damage", label: "Hull Damage" },
        { value: "crew_injury", label: "Crew Injury" },
        { value: "pollution", label: "Pollution" },
        { value: "theft", label: "Theft" },
        { value: "general_average", label: "General Average" },
      ],
    },
    { name: "policyRef", label: "Policy Ref", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "incidentDate", label: "Incident Date", type: "datetime-local" },
    { name: "incidentLocation", label: "Incident Location", type: "text" },
    { name: "incidentDescription", label: "Incident Description", type: "textarea" },
    { name: "claimantName", label: "Claimant Name", type: "select", options: customerOpts },
    { name: "claimantContact", label: "Claimant Contact", type: "text" },
    {
      name: "claimantType",
      label: "Claimant Type",
      type: "select",
      options: [
        { value: "owner", label: "Owner" },
        { value: "charterer", label: "Charterer" },
        { value: "cargo_interest", label: "Cargo Interest" },
        { value: "third_party", label: "Third Party" },
        { value: "crew", label: "Crew" },
      ],
    },
    { name: "estimatedAmount", label: "Estimated Amount", type: "text" },
    { name: "reserveAmount", label: "Reserve Amount", type: "text" },
    { name: "settledAmount", label: "Settled Amount", type: "text" },
    { name: "claimCurrency", label: "Claim Currency", type: "select", options: currencyOpts },
    { name: "investigatorName", label: "Investigator Name", type: "text" },
    { name: "investigationFindings", label: "Investigation Findings", type: "textarea" },
    { name: "timeBarDate", label: "Time Bar Date", type: "datetime-local" },
    { name: "registeredAt", label: "Registered At", type: "datetime-local" },
    { name: "closedAt", label: "Closed At", type: "datetime-local" },
    {
      name: "closureReason",
      label: "Closure Reason",
      type: "select",
      options: [
        { value: "settled", label: "Settled" },
        { value: "denied", label: "Denied" },
        { value: "withdrawn", label: "Withdrawn" },
        { value: "time_barred", label: "Time Barred" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getClaimsRegistration(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/insurance-claims-management/claims-registrations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <AlertTriangle className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Claims Registration</h1>
          <p className="text-sm text-muted-foreground">
            Update claims registration record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Claims Registration"
        apiPath={`/api/v1/insurance-claims-management/claims-registrations/${id}`}
        fields={fields}
        initialData={{
          claimType: record.claimType ?? "",
          policyRef: record.policyRef ?? "",
          vesselName: record.vesselName ?? "",
          imoNumber: record.imoNumber ?? "",
          voyageNumber: record.voyageNumber ?? "",
          incidentDate: record.incidentDate?.toISOString() ?? "",
          incidentLocation: record.incidentLocation ?? "",
          incidentDescription: record.incidentDescription ?? "",
          claimantName: record.claimantName ?? "",
          claimantContact: record.claimantContact ?? "",
          claimantType: record.claimantType ?? "",
          estimatedAmount: record.estimatedAmount ?? "",
          reserveAmount: record.reserveAmount ?? "",
          settledAmount: record.settledAmount ?? "",
          claimCurrency: record.claimCurrency ?? "",
          investigatorName: record.investigatorName ?? "",
          investigationFindings: record.investigationFindings ?? "",
          timeBarDate: record.timeBarDate?.toISOString() ?? "",
          registeredAt: record.registeredAt?.toISOString() ?? "",
          closedAt: record.closedAt?.toISOString() ?? "",
          closureReason: record.closureReason ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/insurance-claims-management/claims-registrations/${id}`}
      />
    </div>
  );
}
