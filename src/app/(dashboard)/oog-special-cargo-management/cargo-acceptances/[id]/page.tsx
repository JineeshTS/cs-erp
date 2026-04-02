import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCargoAcceptance } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";
import React from "react";

function statusVariant(
  s: string
): "success" | "destructive" | "secondary" | "warning" {
  switch (s) {
    case "accepted":
    case "completed":
      return "success";
    case "rejected":
    case "cancelled":
      return "destructive";
    case "pending":
      return "warning";
    default:
      return "secondary";
  }
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="grid grid-cols-3 gap-4 border-b px-4 py-3 last:border-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{children}</dd>
    </div>
  );
}

export default async function CargoAcceptanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/oog-special-cargo-management");

  const { id } = await params;
  const record = await getCargoAcceptance(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "oog_special:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/oog-special-cargo-management/cargo-acceptances"
            className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.acceptanceRef}
            </h1>
            <p className="text-sm text-gray-500">Cargo Acceptance Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          {canEdit && (
            <Link
              href={`/oog-special-cargo-management/cargo-acceptances/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <dl>
          <DetailRow label="Acceptance Ref">{record.acceptanceRef}</DetailRow>
          <DetailRow label="Booking Ref">
            {record.bookingRef || "-"}
          </DetailRow>
          <DetailRow label="Customer Name">{record.customerName}</DetailRow>
          <DetailRow label="Customer Code">
            {record.customerCode || "-"}
          </DetailRow>
          <DetailRow label="Cargo Description">
            {record.cargoDescription}
          </DetailRow>
          <DetailRow label="Cargo Type">{record.cargoType}</DetailRow>
          <DetailRow label="Container Type">{record.containerType}</DetailRow>
          <DetailRow label="Container Number">
            {record.containerNumber || "-"}
          </DetailRow>
          <DetailRow label="Length (cm)">
            {record.lengthCm ?? "-"}
          </DetailRow>
          <DetailRow label="Width (cm)">
            {record.widthCm ?? "-"}
          </DetailRow>
          <DetailRow label="Height (cm)">
            {record.heightCm ?? "-"}
          </DetailRow>
          <DetailRow label="Gross Weight (kg)">
            {record.grossWeightKg}
          </DetailRow>
          <DetailRow label="Over-Length (cm)">
            {record.overLengthCm ?? "-"}
          </DetailRow>
          <DetailRow label="Over-Width (cm)">
            {record.overWidthCm ?? "-"}
          </DetailRow>
          <DetailRow label="Over-Height (cm)">
            {record.overHeightCm ?? "-"}
          </DetailRow>
          <DetailRow label="Measurement Validated">
            {record.measurementValidated ? "Yes" : "No"}
          </DetailRow>
          <DetailRow label="Validated By">
            {record.validatedByName || "-"}
          </DetailRow>
          <DetailRow label="Validated At">
            {formatDate(record.validatedAt)}
          </DetailRow>
          <DetailRow label="Origin Port">{record.originPort}</DetailRow>
          <DetailRow label="Destination Port">
            {record.destinationPort}
          </DetailRow>
          <DetailRow label="Vessel Name">
            {record.vesselName || "-"}
          </DetailRow>
          <DetailRow label="Voyage Number">
            {record.voyageNumber || "-"}
          </DetailRow>
          <DetailRow label="Hazardous">
            {record.hazardous ? "Yes" : "No"}
          </DetailRow>
          <DetailRow label="Notes">{record.notes || "-"}</DetailRow>
          <DetailRow label="Status">
            <Badge variant={statusVariant(record.status)}>
              {record.status}
            </Badge>
          </DetailRow>
        </dl>
      </div>
    </div>
  );
}
