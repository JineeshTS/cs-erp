import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getClaimRegistration } from "@/lib/cargo-claims-management/service";
import { CcmForm } from "@/components/cargo-claims-management/ccm-form";

export default async function EditClaimRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getClaimRegistration(id, session.tenantId);
  if (!record) notFound();

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
    { name: "claimantName", label: "Claimant Name", type: "text" as const },
    { name: "claimantEmail", label: "Claimant Email", type: "text" as const },
    { name: "claimantPhone", label: "Claimant Phone", type: "text" as const },
    { name: "vesselName", label: "Vessel Name", type: "text" as const },
    { name: "voyageRef", label: "Voyage Ref", type: "text" as const },
    { name: "blNumber", label: "BL Number", type: "text" as const },
    {
      name: "containerNumbers",
      label: "Container Numbers",
      type: "textarea" as const,
    },
    { name: "portOfLoading", label: "Port of Loading", type: "text" as const },
    {
      name: "portOfDischarge",
      label: "Port of Discharge",
      type: "text" as const,
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
    { name: "claimCurrency", label: "Claim Currency", type: "text" as const },
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

  const initialData: Record<string, string> = {
    claimType: record.claimType ?? "",
    claimantName: record.claimantName ?? "",
    claimantEmail: record.claimantEmail ?? "",
    claimantPhone: record.claimantPhone ?? "",
    vesselName: record.vesselName ?? "",
    voyageRef: record.voyageRef ?? "",
    blNumber: record.blNumber ?? "",
    containerNumbers: record.containerNumbers ?? "",
    portOfLoading: record.portOfLoading ?? "",
    portOfDischarge: record.portOfDischarge ?? "",
    cargoDescription: record.cargoDescription ?? "",
    claimAmountUsd: record.claimAmountUsd ?? "",
    claimCurrency: record.claimCurrency ?? "",
    claimAmountOriginal: record.claimAmountOriginal ?? "",
    dateOfLoss: record.dateOfLoss
      ? new Date(record.dateOfLoss).toISOString().slice(0, 16)
      : "",
    dateNotified: record.dateNotified
      ? new Date(record.dateNotified).toISOString().slice(0, 16)
      : "",
    triagePriority: record.triagePriority ?? "",
    assignedHandler: record.assignedHandler ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/cargo-claims-management/claim-registrations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.claimRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update claim registration details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Claim Registration"
          apiPath={`/api/v1/cargo-claims-management/claim-registrations/${id}`}
          returnPath="/cargo-claims-management/claim-registrations"
          fields={fields}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
