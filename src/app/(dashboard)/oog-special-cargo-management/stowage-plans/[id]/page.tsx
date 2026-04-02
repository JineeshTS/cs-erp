import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getStowagePlan } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";
import React from "react";

function statusVariant(
  s: string
): "success" | "destructive" | "secondary" | "warning" {
  switch (s) {
    case "approved":
      return "success";
    case "rejected":
    case "cancelled":
      return "destructive";
    case "draft":
      return "secondary";
    case "planned":
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

export default async function StowagePlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/oog-special-cargo-management");

  const { id } = await params;
  const record = await getStowagePlan(id, session.tenantId);
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
            href="/oog-special-cargo-management/stowage-plans"
            className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.stowageRef}
            </h1>
            <p className="text-sm text-gray-500">Stowage Plan Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          {canEdit && (
            <Link
              href={`/oog-special-cargo-management/stowage-plans/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <dl>
          <DetailRow label="Stowage Ref">{record.stowageRef}</DetailRow>
          <DetailRow label="Vessel Name">{record.vesselName}</DetailRow>
          <DetailRow label="Voyage Number">{record.voyageNumber}</DetailRow>
          <DetailRow label="Container Number">
            {record.containerNumber || "-"}
          </DetailRow>
          <DetailRow label="Container Type">{record.containerType}</DetailRow>
          <DetailRow label="Bay Position">
            {record.bayPosition || "-"}
          </DetailRow>
          <DetailRow label="Row Position">
            {record.rowPosition || "-"}
          </DetailRow>
          <DetailRow label="Tier Position">
            {record.tierPosition || "-"}
          </DetailRow>
          <DetailRow label="Weight (kg)">{record.weightKg ?? "-"}</DetailRow>
          <DetailRow label="Over-Length Fore (cm)">
            {record.overLengthFore ?? "-"}
          </DetailRow>
          <DetailRow label="Over-Length Aft (cm)">
            {record.overLengthAft ?? "-"}
          </DetailRow>
          <DetailRow label="Over-Width Port (cm)">
            {record.overWidthPort ?? "-"}
          </DetailRow>
          <DetailRow label="Over-Width Starboard (cm)">
            {record.overWidthStarboard ?? "-"}
          </DetailRow>
          <DetailRow label="Over-Height (cm)">
            {record.overHeight ?? "-"}
          </DetailRow>
          <DetailRow label="Stackable">
            {record.stackable ? "Yes" : "No"}
          </DetailRow>
          <DetailRow label="Clearance Required">
            {record.clearanceRequired ? "Yes" : "No"}
          </DetailRow>
          <DetailRow label="Lashing Points">
            {record.lashingPoints ?? "-"}
          </DetailRow>
          <DetailRow label="Plan Approved">
            {record.planApproved ? "Yes" : "No"}
          </DetailRow>
          <DetailRow label="Approved By">
            {record.approvedByName || "-"}
          </DetailRow>
          <DetailRow label="Approved At">
            {formatDate(record.approvedAt)}
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
