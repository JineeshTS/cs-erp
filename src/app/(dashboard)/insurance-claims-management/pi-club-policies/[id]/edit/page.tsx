import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getPiClubPolicy } from "@/lib/insurance-claims-management/service";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";

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
  { name: "vesselName", label: "Vessel Name", type: "text" },
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

export default async function EditPiClubPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:edit"))) redirect("/login");

  const { id } = await params;
  const record = await getPiClubPolicy(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/insurance-claims-management/pi-club-policies/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit P&I Club Policy</h1>
          <p className="text-sm text-muted-foreground">
            Update P&I club policy record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="P&I Club Policy"
        apiPath={`/api/v1/insurance-claims-management/pi-club-policies/${id}`}
        fields={fields}
        initialData={{
          policyType: record.policyType ?? "",
          clubName: record.clubName ?? "",
          clubContactName: record.clubContactName ?? "",
          clubContactEmail: record.clubContactEmail ?? "",
          clubContactPhone: record.clubContactPhone ?? "",
          vesselName: record.vesselName ?? "",
          imoNumber: record.imoNumber ?? "",
          coverageStart: record.coverageStart?.toISOString() ?? "",
          coverageEnd: record.coverageEnd?.toISOString() ?? "",
          premiumAmount: record.premiumAmount ?? "",
          premiumCurrency: record.premiumCurrency ?? "",
          deductibleAmount: record.deductibleAmount ?? "",
          coverageLimit: record.coverageLimit ?? "",
          renewalDate: record.renewalDate?.toISOString() ?? "",
          renewalStatus: record.renewalStatus ?? "",
          brokerName: record.brokerName ?? "",
          brokerRef: record.brokerRef ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/insurance-claims-management/pi-club-policies/${id}`}
      />
    </div>
  );
}
