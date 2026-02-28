import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Blocks,
  Puzzle,
  Bot,
  ShieldCheck,
  Plug,
  Database,
  ScrollText,
  Activity,
  Flag,
  KeyRound,
  ArrowUpDown,
  Bell,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getAdminOverview } from "@/lib/admin-portal/service";

export default async function AdminPortalPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canRead = await hasPermission(
    session.id,
    session.tenantId,
    "admin:read"
  );
  if (!canRead) redirect("/");

  const overview = await getAdminOverview(session.tenantId);

  const sections = [
    {
      title: "Module Configs",
      description: "Enable and configure ERP modules",
      count: overview.moduleConfigs,
      href: "/admin-portal/module-configs",
      icon: Blocks,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Feature Configs",
      description: "Toggle and configure module features",
      count: overview.featureConfigs,
      href: "/admin-portal/feature-configs",
      icon: Puzzle,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      title: "AI Agent Configs",
      description: "Tune AI automation levels (95-5 model)",
      count: overview.aiAgentConfigs,
      href: "/admin-portal/ai-agent-configs",
      icon: Bot,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Approval Matrices",
      description: "Configure delegation of authority limits",
      count: overview.approvalMatrices,
      href: "/admin-portal/approval-matrices",
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Integration Endpoints",
      description: "Manage external API integrations",
      count: overview.integrationEndpoints,
      href: "/admin-portal/integration-endpoints",
      icon: Plug,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Master Data Admin",
      description: "Configure master data entity rules",
      count: overview.masterDataConfigs,
      href: "/admin-portal/master-data-configs",
      icon: Database,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Audit Logs",
      description: "View system audit trail and activity",
      count: overview.auditLogs ? 1 : 0,
      href: "/admin-portal/audit-logs",
      icon: ScrollText,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      title: "System Health",
      description: "Monitor performance and health metrics",
      count: overview.healthMetrics ? 1 : 0,
      href: "/admin-portal/system-health-metrics",
      icon: Activity,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Feature Flags",
      description: "Control feature rollouts and experiments",
      count: overview.featureFlags,
      href: "/admin-portal/feature-flags",
      icon: Flag,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Licenses",
      description: "Manage licenses and subscriptions",
      count: overview.licenses,
      href: "/admin-portal/licenses",
      icon: KeyRound,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Import / Export",
      description: "Bulk data import and export jobs",
      count: overview.importExportJobs,
      href: "/admin-portal/import-export-jobs",
      icon: ArrowUpDown,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Notification Configs",
      description: "Administer notification templates and channels",
      count: overview.notificationConfigs,
      href: "/admin-portal/notification-configs",
      icon: Bell,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
        <p className="mt-1 text-sm text-gray-500">
          System configuration, integrations, feature flags, and administration
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
