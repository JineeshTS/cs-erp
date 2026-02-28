import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  FolderTree,
  FileSignature,
  Layout,
  ScanSearch,
  AlertTriangle,
  Archive,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getDmsOverview } from "@/lib/document-management-system/service";

export default async function DocumentManagementSystemPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canRead = await hasPermission(
    session.id,
    session.tenantId,
    "documents:read"
  );
  if (!canRead) redirect("/");

  const overview = await getDmsOverview(session.tenantId);

  const sections = [
    {
      title: "Documents",
      description: "Upload, organize and manage all documents",
      count: overview.documents,
      href: "/document-management-system/documents",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Categories",
      description: "Organize documents into categories and subcategories",
      count: overview.categories,
      href: "/document-management-system/categories",
      icon: FolderTree,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Templates",
      description: "Document template library for standard formats",
      count: overview.templates,
      href: "/document-management-system/templates",
      icon: Layout,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Signatures",
      description: "Digital signatures and e-stamps awaiting action",
      count: overview.pendingSignatures,
      href: "/document-management-system/signatures",
      icon: FileSignature,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Expiry Alerts",
      description: "Documents approaching or past expiry dates",
      count: overview.pendingAlerts,
      href: "/document-management-system/expiry-alerts",
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Retention Policies",
      description: "Archive and retention rules for document lifecycle",
      count: overview.retentionPolicies,
      href: "/document-management-system/retention-policies",
      icon: Archive,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Document Management System
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage documents, templates, signatures, and retention policies
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${section.bg}`}
                >
                  <Icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {section.title}
                  </h2>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-gray-900">
                  {section.count}
                </span>
                <span className="ms-1 text-sm text-gray-500">records</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
