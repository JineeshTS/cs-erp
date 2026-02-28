import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsDocumentTemplates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "templates:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const template = await db
    .select()
    .from(dmsDocumentTemplates)
    .where(
      and(
        eq(dmsDocumentTemplates.id, id),
        eq(dmsDocumentTemplates.tenantId, session.tenantId),
        isNull(dmsDocumentTemplates.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!template) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "templates:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/templates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          <p className="text-sm text-gray-500">
            {template.slug} &middot; v{template.version}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/document-management-system/templates/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{template.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{template.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document Type</dt>
            <dd className="mt-1 text-gray-900">{template.documentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Template Format
            </dt>
            <dd className="mt-1 text-gray-900">{template.templateFormat}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Output Format</dt>
            <dd className="mt-1 text-gray-900">{template.outputFormat}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge
                variant={template.isActive ? "success" : "secondary"}
              >
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Version</dt>
            <dd className="mt-1 text-gray-900">{template.version}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category ID</dt>
            <dd className="mt-1 text-gray-900">
              {template.categoryId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {template.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {template.updatedAt.toLocaleString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {template.description || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Variables</dt>
            <dd className="mt-1 text-gray-900">
              {template.variables ? (
                <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs">
                  {JSON.stringify(template.variables, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Sample Data</dt>
            <dd className="mt-1 text-gray-900">
              {template.sampleData ? (
                <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs">
                  {JSON.stringify(template.sampleData, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Body Template
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <pre className="overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            {template.bodyTemplate}
          </pre>
        </div>
      </div>

      {template.headerTemplate && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Header Template
          </h2>
          <div className="rounded-lg border bg-white p-6">
            <pre className="overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-800">
              {template.headerTemplate}
            </pre>
          </div>
        </div>
      )}

      {template.footerTemplate && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Footer Template
          </h2>
          <div className="rounded-lg border bg-white p-6">
            <pre className="overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-800">
              {template.footerTemplate}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
