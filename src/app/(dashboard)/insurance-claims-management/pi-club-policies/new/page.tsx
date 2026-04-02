import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewPiClubPolicyPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:create"))) redirect("/login");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "policyType",
      label: "Policy Type",
      type: "select",
      required: true,
      options: [
        { value: "pi_club", label: "P&I Club" },
        { value: "freight_demurrage", label: "Freight & Demurrage" },
        { value: "charterers_liability", label: "Charterers Liability" },
        { value: "war_risk", label: "War Risk" },
      ],
    },
    { name: "clubName", label: "Club Name", type: "text", required: true },
    { name: "clubContactName", label: "Club Contact Name", type: "text" },
    { name: "clubContactEmail", label: "Club Contact Email", type: "text" },
    { name: "clubContactPhone", label: "Club Contact Phone", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "coverageStart", label: "Coverage Start", type: "datetime-local" },
    { name: "coverageEnd", label: "Coverage End", type: "datetime-local" },
    { name: "premiumAmount", label: "Premium Amount", type: "text" },
    { name: "premiumCurrency", label: "Premium Currency", type: "text" },
    { name: "deductibleAmount", label: "Deductible Amount", type: "text" },
    { name: "coverageLimit", label: "Coverage Limit", type: "text" },
    { name: "renewalDate", label: "Renewal Date", type: "datetime-local" },
    {
      name: "renewalStatus",
      label: "Renewal Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "renewed", label: "Renewed" },
        { value: "lapsed", label: "Lapsed" },
      ],
    },
    { name: "brokerName", label: "Broker Name", type: "text" },
    { name: "brokerRef", label: "Broker Ref", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/insurance-claims-management/pi-club-policies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New P&I Club Policy</h1>
          <p className="text-sm text-muted-foreground">
            Create a new P&I club policy record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="P&I Club Policy"
        apiPath="/api/v1/insurance-claims-management/pi-club-policies"
        fields={fields}
        returnPath="/insurance-claims-management/pi-club-policies"
      />
    </div>
  );
}
