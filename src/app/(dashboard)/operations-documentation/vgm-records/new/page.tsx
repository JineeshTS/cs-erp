import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";

const VGM_FIELDS: FieldConfig[] = [
  { name: "vgmReference", label: "VGM Reference", type: "text", required: true },
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
  { name: "blNumber", label: "BL Number", type: "text" },
  { name: "bookingReference", label: "Booking Reference", type: "text" },
  { name: "weighingMethod", label: "Weighing Method", type: "select", required: true, options: [
    { value: "method1", label: "Method 1" },
    { value: "method2", label: "Method 2" },
  ]},
  { name: "verifiedGrossMass", label: "Verified Gross Mass (kg)", type: "number", required: true },
  { name: "tareWeight", label: "Tare Weight", type: "number" },
  { name: "cargoWeight", label: "Cargo Weight", type: "number" },
  { name: "dunnageWeight", label: "Dunnage Weight", type: "number" },
  { name: "weighingDate", label: "Weighing Date", type: "date", required: true },
  { name: "weighingLocation", label: "Weighing Location", type: "text" },
  { name: "weighbridgeId", label: "Weighbridge ID", type: "text" },
  { name: "certifiedBy", label: "Certified By", type: "text", required: true },
  { name: "certificationNumber", label: "Certification Number", type: "text" },
  { name: "shipperName", label: "Shipper Name", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "pending", label: "Pending" },
    { value: "submitted", label: "Submitted" },
    { value: "verified", label: "Verified" },
    { value: "rejected", label: "Rejected" },
    { value: "discrepancy", label: "Discrepancy" },
  ]},
  { name: "discrepancyFlag", label: "Discrepancy Flag", type: "checkbox" },
  { name: "discrepancyNotes", label: "Discrepancy Notes", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewVgmRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:create")))
    redirect("/operations-documentation/vgm-records");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/operations-documentation/vgm-records" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New VGM Record</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="VGM Record"
          apiPath="/api/v1/operations-documentation/vgm-records"
          fields={VGM_FIELDS}
          returnPath="/operations-documentation/vgm-records"
        />
      </div>
    </div>
  );
}
