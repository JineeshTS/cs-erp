import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMnrDamageBilling } from "@/lib/container-leasing-management/service";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";

const MNR_DAMAGE_BILLING_FIELDS: FieldConfig[] = [
  {
    name: "billingType",
    label: "Billing Type",
    type: "select",
    required: true,
    options: [
      { value: "mnr_estimate", label: "MNR Estimate" },
      { value: "mnr_invoice", label: "MNR Invoice" },
      { value: "damage_claim", label: "Damage Claim" },
      { value: "repair_authorization", label: "Repair Authorization" },
      { value: "credit_note", label: "Credit Note" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "agreementId", label: "Agreement ID", type: "text" },
  { name: "lessorName", label: "Lessor Name", type: "text" },
  {
    name: "damageDescription",
    label: "Damage Description",
    type: "textarea",
  },
  { name: "damageLocation", label: "Damage Location", type: "text" },
  { name: "repairType", label: "Repair Type", type: "text" },
  { name: "materialCost", label: "Material Cost", type: "text" },
  { name: "laborCost", label: "Labor Cost", type: "text" },
  { name: "totalRepairCost", label: "Total Repair Cost", type: "text" },
  { name: "billingCurrency", label: "Billing Currency", type: "text" },
  { name: "responsibleParty", label: "Responsible Party", type: "text" },
  { name: "disputeRaised", label: "Dispute Raised", type: "checkbox" },
  { name: "approvedAmount", label: "Approved Amount", type: "text" },
  { name: "invoiceDate", label: "Invoice Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditMnrDamageBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getMnrDamageBilling(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/container-leasing-management/mnr-damage-billings/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit MNR Damage Billing
          </h1>
          <p className="text-sm text-muted-foreground">
            Update billing record {record.billingRef}
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="MNR Damage Billing"
          apiPath={`/api/v1/container-leasing-management/mnr-damage-billings/${id}`}
          returnPath={`/container-leasing-management/mnr-damage-billings/${id}`}
          fields={MNR_DAMAGE_BILLING_FIELDS}
          isEdit
          initialData={{
            billingType: record.billingType,
            containerNumber: record.containerNumber ?? "",
            agreementId: record.agreementId ?? "",
            lessorName: record.lessorName ?? "",
            damageDescription: record.damageDescription ?? "",
            damageLocation: record.damageLocation ?? "",
            repairType: record.repairType ?? "",
            materialCost: record.materialCost ?? "",
            laborCost: record.laborCost ?? "",
            totalRepairCost: record.totalRepairCost ?? "",
            billingCurrency: record.billingCurrency ?? "",
            responsibleParty: record.responsibleParty ?? "",
            disputeRaised: record.disputeRaised ?? false,
            approvedAmount: record.approvedAmount ?? "",
            invoiceDate: record.invoiceDate
              ? new Date(record.invoiceDate).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
        />
      </div>
    </div>
  );
}
