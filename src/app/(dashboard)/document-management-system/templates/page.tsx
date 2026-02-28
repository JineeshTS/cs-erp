import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { dmsDocumentTemplates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TemplatesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "templates:read")))
    redirect("/document-management-system");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "templates:create"
  );

  const data = await db
    .select()
    .from(dmsDocumentTemplates)
    .where(
      and(
        eq(dmsDocumentTemplates.tenantId, session.tenantId),
        isNull(dmsDocumentTemplates.deletedAt)
      )
    )
    .orderBy(desc(dmsDocumentTemplates.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Templates
          </h1>
          <p className="text-sm text-gray-500">
            Manage document templates for generating shipping documents
          </p>
        </div>
        {canCreate && (
          <Link
            href="/document-management-system/templates/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Template
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No templates found.</p>
          {canCreate && (
            <Link
              href="/document-management-system/templates/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first template
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Slug
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Document Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Format
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Output
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Version
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((template) => (
                <tr
                  key={template.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/document-management-system/templates/${template.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {template.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{template.slug}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {template.documentType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {template.templateFormat}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {template.outputFormat}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={template.isActive ? "success" : "secondary"}
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    v{template.version}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
