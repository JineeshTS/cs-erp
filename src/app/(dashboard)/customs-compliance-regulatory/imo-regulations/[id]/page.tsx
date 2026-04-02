import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getImoRegulation } from "@/lib/customs-compliance-regulatory/service";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default async function ImoRegulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:read")))
    redirect("/customs-compliance-regulatory");

  const { id } = await params;

  const record = await getImoRegulation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "customs:edit"
  );

  function statusVariant(
    s: string
  ): "success" | "destructive" | "secondary" | "warning" {
    switch (s) {
      case "active":
        return "success";
      case "superseded":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/imo-regulations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.regulationRef}
          </h1>
          <p className="text-sm text-gray-500">
            IMO Regulation &middot; {record.title || "Untitled"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/customs-compliance-regulatory/imo-regulations/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Regulation Ref</dt>
            <dd className="mt-1 text-gray-900">{record.regulationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Regulation Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.regulationType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              IMO Reference
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.imoReference || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{record.title || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issuing Body</dt>
            <dd className="mt-1 text-gray-900">{record.issuingBody || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Convention Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.conventionName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Published At</dt>
            <dd className="mt-1 text-gray-900">
              {record.publishedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.effectiveAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Compliance Deadline
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.complianceDeadline?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Summary</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.summary || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Impact Assessment
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.impactAssessment || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Implementation Progress
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.implementationProgress || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Responsible Person
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.responsiblePerson || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document URL</dt>
            <dd className="mt-1 text-gray-900">
              {record.documentUrl || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Supersedes</dt>
            <dd className="mt-1 text-gray-900">{record.supersedes || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
