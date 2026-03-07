import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcmForm } from "@/components/cargo-claims-management/ccm-form";
import { getPortOptions, getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewClaimRegistrationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:create")))
    redirect("/");


  const [portOpts, vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const fields = [
    {
      name: "claimType",
      label: "Claim Type",
      type: "select" as const,
      options: [
        { value: "cargo_damage", label: "Cargo Damage" },
        { value: "cargo_loss", label: "Cargo Loss" },
        { value: "shortage", label: "Shortage" },
        { value: "contamination", label: "Contamination" },
        { value: "delay", label: "Delay" },
        { value: "misdelivery", label: "Misdelivery" },
      ],
    },
    { name: "claimantName", label: "Claimant Name", type: "select" as const, options: customerOpts },
    { name: "claimantEmail", label: "Claimant Email", type: "text" as const },
    { name: "claimantPhone", label: "Claimant Phone", type: "text" as const },
    { name: "vesselName", label: "Vessel Name", type: "select" as const, options: vesselOpts },
    { name: "voyageRef", label: "Voyage Ref", type: "text" as const },
    { name: "blNumber", label: "BL Number", type: "text" as const },
    {
      name: "containerNumbers",
      label: "Container Numbers",
      type: "textarea" as const,
    },
    { name: "portOfLoading", label: "Port of Loading", type: "select" as const, options: portOpts },
    {
      name: "portOfDischarge",
      label: "Port of Discharge",
      type: "select" as const, options: portOpts,
    },
    {
      name: "cargoDescription",
      label: "Cargo Description",
      type: "textarea" as const,
    },
    {
      name: "claimAmountUsd",
      label: "Claim Amount (USD)",
      type: "text" as const,
    },
    { name: "claimCurrency", label: "Claim Currency", type: "select" as const, options: currencyOpts },
    {
      name: "claimAmountOriginal",
      label: "Claim Amount (Original)",
      type: "text" as const,
    },
    {
      name: "dateOfLoss",
      label: "Date of Loss",
      type: "datetime-local" as const,
    },
    {
      name: "dateNotified",
      label: "Date Notified",
      type: "datetime-local" as const,
    },
    {
      name: "triagePriority",
      label: "Triage Priority",
      type: "select" as const,
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      name: "assignedHandler",
      label: "Assigned Handler",
      type: "text" as const,
    },
    { name: "notes", label: "Notes", type: "textarea" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cargo-claims-management/claim-registrations"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Claim Registration
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new cargo claim registration
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Claim Registration"
          apiPath="/api/v1/cargo-claims-management/claim-registrations"
          returnPath="/cargo-claims-management/claim-registrations"
          fields={fields}
        />
      </div>
    </div>
  );
}
