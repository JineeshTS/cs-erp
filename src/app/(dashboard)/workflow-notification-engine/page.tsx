import Link from "next/link";
import { redirect } from "next/navigation";
import {
  GitBranch,
  Clock,
  ShieldCheck,
  Route,
  Mail,
  Bell,
  PenTool,
} from "lucide-react";
import { sql, eq, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import {
  wneWorkflows,
  wneSlaDefinitions,
  wneDoaMatrix,
  wneRoutingRules,
  wneNotificationTemplates,
  wneNotifications,
} from "@/db/schema";

export default async function WorkflowNotificationEnginePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canReadWorkflows = await hasPermission(
    session.id,
    session.tenantId,
    "workflows:read"
  );
  const canReadNotifications = await hasPermission(
    session.id,
    session.tenantId,
    "notifications:read"
  );

  if (!canReadWorkflows && !canReadNotifications) {
    redirect("/");
  }

  const [
    workflowCount,
    slaCount,
    doaCount,
    routingCount,
    templateCount,
    notificationCount,
  ] = await Promise.all([
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(wneWorkflows)
      .where(
        and(
          eq(wneWorkflows.tenantId, session.tenantId),
          isNull(wneWorkflows.deletedAt)
        )
      )
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(wneSlaDefinitions)
      .where(
        and(
          eq(wneSlaDefinitions.tenantId, session.tenantId),
          isNull(wneSlaDefinitions.deletedAt)
        )
      )
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(wneDoaMatrix)
      .where(
        and(
          eq(wneDoaMatrix.tenantId, session.tenantId),
          isNull(wneDoaMatrix.deletedAt)
        )
      )
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(wneRoutingRules)
      .where(
        and(
          eq(wneRoutingRules.tenantId, session.tenantId),
          isNull(wneRoutingRules.deletedAt)
        )
      )
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(wneNotificationTemplates)
      .where(
        and(
          eq(wneNotificationTemplates.tenantId, session.tenantId),
          isNull(wneNotificationTemplates.deletedAt)
        )
      )
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(wneNotifications)
      .where(
        and(
          eq(wneNotifications.tenantId, session.tenantId),
          isNull(wneNotifications.deletedAt)
        )
      )
      .then((r) => r[0]?.value ?? 0),
  ]);

  const sections = [
    {
      title: "Process Studio",
      description: "Visual BPMN workflow designer — drag and drop to build flows",
      count: workflowCount,
      href: "/workflow-notification-engine/workflows",
      icon: PenTool,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      permission: "workflows:read",
    },
    {
      title: "Approval Workflows",
      description: "Build and manage multi-step approval workflows",
      count: workflowCount,
      href: "/workflow-notification-engine/workflows",
      icon: GitBranch,
      color: "text-blue-600",
      bg: "bg-blue-50",
      permission: "workflows:read",
    },
    {
      title: "SLA Definitions",
      description: "Define service level agreements and escalation policies",
      count: slaCount,
      href: "/workflow-notification-engine/sla-definitions",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      permission: "sla:read",
    },
    {
      title: "DOA Matrix",
      description: "Configure delegation of authority limits",
      count: doaCount,
      href: "/workflow-notification-engine/doa-matrix",
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50",
      permission: "doa:read",
    },
    {
      title: "Routing Rules",
      description: "Auto-assign tasks based on conditions",
      count: routingCount,
      href: "/workflow-notification-engine/routing-rules",
      icon: Route,
      color: "text-purple-600",
      bg: "bg-purple-50",
      permission: "routing:read",
    },
    {
      title: "Notification Templates",
      description: "Email, WhatsApp, SMS, and in-app templates",
      count: templateCount,
      href: "/workflow-notification-engine/notification-templates",
      icon: Mail,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      permission: "notifications:read",
    },
    {
      title: "Notifications",
      description: "View all sent and pending notifications",
      count: notificationCount,
      href: "/workflow-notification-engine/notifications",
      icon: Bell,
      color: "text-rose-600",
      bg: "bg-rose-50",
      permission: "notifications:read",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Workflow & Notification Engine
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage approval workflows, SLAs, routing rules, and notification
          channels
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
