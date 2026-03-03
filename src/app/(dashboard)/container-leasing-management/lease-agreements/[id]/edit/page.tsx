import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLeaseAgreement } from "@/lib/container-leasing-management/service";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";

const LEASE_AGREEMENT_FIELDS: FieldConfig[] = [
  {
    name: "agreementType",
    label: "Agreement Type",
    type: "select",
    options: [
      { value: "master_lease", label: "Master Lease" },
      { value: "spot_lease", label: "Spot Lease" },
      { value: "long_term", label: "Long Term" },
      { value: "short_term", label: "Short Term" },
      { value: "sale_leaseback", label: "Sale Leaseback" },
    ],
  },
  { name: "lessorName", label: "Lessor Name", type: "text" },
  { name: "lessorCode", label: "Lessor Code", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "dailyRate", label: "Daily Rate", type: "text" },
  { name: "rateCurrency", label: "Rate Currency", type: "text" },
  { name: "minimumLeaseDays", label: "Minimum Lease Days", type: "number" },
  {
    name: "commencementDate",
    label: "Commencement Date",
    type: "datetime-local",
  },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "pickupLocation", label: "Pickup Location", type: "text" },
  { name: "dropoffLocation", label: "Dropoff Location", type: "text" },
  { name: "depositAmount", label: "Deposit Amount", type: "text" },
  {
    name: "insuranceRequired",
    label: "Insurance Required",
    type: "checkbox",
  },
  { name: "autoRenewal", label: "Auto Renewal", type: "checkbox" },
  {
    name: "terminationNoticeDays",
    label: "Termination Notice Days",
    type: "number",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditLeaseAgreementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getLeaseAgreement(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    agreementType: record.agreementType ?? "",
    lessorName: record.lessorName ?? "",
    lessorCode: record.lessorCode ?? "",
    containerType: record.containerType ?? "",
    containerSize: record.containerSize ?? "",
    quantity: record.quantity != null ? String(record.quantity) : "",
    dailyRate: record.dailyRate ?? "",
    rateCurrency: record.rateCurrency ?? "",
    minimumLeaseDays:
      record.minimumLeaseDays != null
        ? String(record.minimumLeaseDays)
        : "",
    commencementDate: record.commencementDate
      ? new Date(record.commencementDate).toISOString().slice(0, 16)
      : "",
    expiryDate: record.expiryDate
      ? new Date(record.expiryDate).toISOString().slice(0, 16)
      : "",
    pickupLocation: record.pickupLocation ?? "",
    dropoffLocation: record.dropoffLocation ?? "",
    depositAmount: record.depositAmount ?? "",
    insuranceRequired: record.insuranceRequired ? "true" : "",
    autoRenewal: record.autoRenewal ? "true" : "",
    terminationNoticeDays:
      record.terminationNoticeDays != null
        ? String(record.terminationNoticeDays)
        : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/container-leasing-management/lease-agreements/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.agreementRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update lease agreement details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="Lease Agreement"
          apiPath={`/api/v1/container-leasing-management/lease-agreements/${id}`}
          returnPath="/container-leasing-management/lease-agreements"
          fields={LEASE_AGREEMENT_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
