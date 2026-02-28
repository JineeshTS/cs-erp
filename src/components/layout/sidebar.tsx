"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Ship,
  FileText,
  Container,
  Package,
  Users,
  DollarSign,
  FileCheck,
  FileArchive,
  Receipt,
  CreditCard,
  Bot,
  BarChart3,
  UserCog,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Database,
  Workflow,
  Bell,
  FolderOpen,
  SlidersHorizontal,
  Landmark,
  Anchor,
  Navigation,
  Boxes,
  Wrench,
  Snowflake,
  LayoutGrid,
  Target,
  Megaphone,
  Handshake,
  UserPlus,
  BadgeDollarSign,
  Scale,
  Timer,
  Brain,
  Clock,
  HeadphonesIcon,
  AlertOctagon,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import { NavItem, NavGroup } from "./nav-item";
import { cn } from "@/lib/utils";

interface SidebarProps {
  tenantName: string;
  permissions: string[];
}

function has(perms: string[], perm: string): boolean {
  return perms.includes(perm);
}

function hasAny(perms: string[], prefix: string): boolean {
  return perms.some((p) => p.startsWith(prefix));
}

export function Sidebar({ tenantName, permissions: perms }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-e bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b px-3">
        <Building2 className="h-6 w-6 shrink-0 text-gray-700" />
        {!collapsed && (
          <span className="ms-2 truncate text-sm font-bold text-gray-900">
            {tenantName}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <NavItem href="/" label="Dashboard" icon={LayoutDashboard} collapsed={collapsed} />

        {hasAny(perms, "vessels:") || hasAny(perms, "bookings:") || hasAny(perms, "containers:") || hasAny(perms, "cargo:") ? (
          <NavGroup label="Operations" collapsed={collapsed}>
            {hasAny(perms, "vessels:") && (
              <NavItem href="/vessels" label="Vessels" icon={Ship} collapsed={collapsed} />
            )}
            {hasAny(perms, "bookings:") && (
              <NavItem href="/bookings" label="Bookings" icon={FileText} collapsed={collapsed} />
            )}
            {hasAny(perms, "containers:") && (
              <NavItem href="/containers" label="Containers" icon={Container} collapsed={collapsed} />
            )}
            {hasAny(perms, "cargo:") && (
              <NavItem href="/cargo" label="Cargo" icon={Package} collapsed={collapsed} />
            )}
          </NavGroup>
        ) : null}

        {has(perms, "users:read") || hasAny(perms, "finance:") ? (
          <NavGroup label="Commercial" collapsed={collapsed}>
            {has(perms, "users:read") && (
              <NavItem href="/customers" label="Customers" icon={Users} collapsed={collapsed} />
            )}
            {hasAny(perms, "finance:") && (
              <NavItem href="/rates" label="Rates & Tariffs" icon={DollarSign} collapsed={collapsed} />
            )}
            {hasAny(perms, "finance:") && (
              <NavItem href="/contracts" label="Contracts" icon={FileCheck} collapsed={collapsed} />
            )}
          </NavGroup>
        ) : null}

        {hasAny(perms, "sales:") && (
          <NavGroup label="Sales & CRM" collapsed={collapsed}>
            <NavItem href="/sales-crm" label="Customers" icon={Users} collapsed={collapsed} />
            <NavItem href="/sales-crm/opportunities" label="Opportunities" icon={Target} collapsed={collapsed} />
            <NavItem href="/sales-crm/contracts" label="Contracts" icon={Handshake} collapsed={collapsed} />
            <NavItem href="/sales-crm/leads" label="Leads" icon={UserPlus} collapsed={collapsed} />
            <NavItem href="/sales-crm/campaigns" label="Campaigns" icon={Megaphone} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "customs:") ? (
          <NavGroup label="Customs & Compliance" collapsed={collapsed}>
            <NavItem href="/customs" label="Customs Declarations" icon={FileArchive} collapsed={collapsed} />
            <NavItem href="/documents" label="Documents" icon={FileText} collapsed={collapsed} />
          </NavGroup>
        ) : null}

        {hasAny(perms, "finance:") ? (
          <NavGroup label="Finance" collapsed={collapsed}>
            <NavItem href="/invoices" label="Invoices" icon={Receipt} collapsed={collapsed} />
            <NavItem href="/payments" label="Payments" icon={CreditCard} collapsed={collapsed} />
          </NavGroup>
        ) : null}

        {(hasAny(perms, "ai:") || hasAny(perms, "reports:")) && (
          <NavGroup label="Intelligence" collapsed={collapsed}>
            {hasAny(perms, "ai:") && (
              <NavItem href="/ai" label="AI Assistant" icon={Bot} collapsed={collapsed} />
            )}
            {hasAny(perms, "reports:") && (
              <NavItem href="/reports" label="Reports" icon={BarChart3} collapsed={collapsed} />
            )}
          </NavGroup>
        )}

        {(hasAny(perms, "workflows:") || hasAny(perms, "notifications:")) && (
          <NavGroup label="Automation" collapsed={collapsed}>
            {hasAny(perms, "workflows:") && (
              <NavItem href="/workflow-notification-engine" label="Workflows" icon={Workflow} collapsed={collapsed} />
            )}
            {hasAny(perms, "notifications:") && (
              <NavItem href="/workflow-notification-engine/notifications" label="Notifications" icon={Bell} collapsed={collapsed} />
            )}
          </NavGroup>
        )}

        {hasAny(perms, "documents:") && (
          <NavGroup label="Documents" collapsed={collapsed}>
            <NavItem href="/document-management-system" label="Document Hub" icon={FolderOpen} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "entities:") && (
          <NavGroup label="Corporate Structure" collapsed={collapsed}>
            <NavItem href="/multi-entity-legal-structure" label="Legal Entities" icon={Landmark} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "chartering:") && (
          <NavGroup label="Chartering & Vessels" collapsed={collapsed}>
            <NavItem href="/chartering-vessel-management" label="Charter Parties" icon={Anchor} collapsed={collapsed} />
            <NavItem href="/chartering-vessel-management/fixtures" label="Fixtures" icon={FileCheck} collapsed={collapsed} />
            <NavItem href="/chartering-vessel-management/tc-contracts" label="TC Contracts" icon={FileText} collapsed={collapsed} />
            <NavItem href="/chartering-vessel-management/coa-contracts" label="COA Contracts" icon={FileText} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "capacity:") && (
          <NavGroup label="Capacity & Voyage" collapsed={collapsed}>
            <NavItem href="/capacity-voyage-management" label="Vessel Schedules" icon={Navigation} collapsed={collapsed} />
            <NavItem href="/capacity-voyage-management/trade-allocations" label="Trade Allocations" icon={BarChart3} collapsed={collapsed} />
            <NavItem href="/capacity-voyage-management/space-controls" label="Space Controls" icon={Container} collapsed={collapsed} />
            <NavItem href="/capacity-voyage-management/stowage-plans" label="Stowage Plans" icon={Package} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "equipment:") && (
          <NavGroup label="Equipment & Yard" collapsed={collapsed}>
            <NavItem href="/equipment-control-yard-managem" label="Container Fleet" icon={Boxes} collapsed={collapsed} />
            <NavItem href="/equipment-control-yard-managem/maintenance-repairs" label="MNR" icon={Wrench} collapsed={collapsed} />
            <NavItem href="/equipment-control-yard-managem/reefer-containers" label="Reefer Mgmt" icon={Snowflake} collapsed={collapsed} />
            <NavItem href="/equipment-control-yard-managem/yard-slots" label="Yard Planning" icon={LayoutGrid} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "commercial:") && (
          <NavGroup label="Commercial & Pricing" collapsed={collapsed}>
            <NavItem href="/commercial-pricing-management" label="Tariffs" icon={BadgeDollarSign} collapsed={collapsed} />
            <NavItem href="/commercial-pricing-management/special-rates" label="Special Rates" icon={Scale} collapsed={collapsed} />
            <NavItem href="/commercial-pricing-management/surcharges" label="Surcharges" icon={DollarSign} collapsed={collapsed} />
            <NavItem href="/commercial-pricing-management/detention-demurrage" label="D&D Tariffs" icon={Timer} collapsed={collapsed} />
            <NavItem href="/commercial-pricing-management/ai-pricing-models" label="AI Pricing" icon={Brain} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "customer_service:") && (
          <NavGroup label="Customer Service" collapsed={collapsed}>
            <NavItem href="/customer-service-operations" label="Inquiries" icon={HeadphonesIcon} collapsed={collapsed} />
            <NavItem href="/customer-service-operations/complaints" label="Complaints" icon={AlertOctagon} collapsed={collapsed} />
            <NavItem href="/customer-service-operations/service-requests" label="Service Requests" icon={ClipboardList} collapsed={collapsed} />
            <NavItem href="/customer-service-operations/sla-policies" label="SLA Policies" icon={Clock} collapsed={collapsed} />
            <NavItem href="/customer-service-operations/knowledge-articles" label="Knowledge Base" icon={BookOpen} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "masterdata:") && (
          <NavGroup label="Master Data" collapsed={collapsed}>
            <NavItem href="/master-data-management" label="Master Data" icon={Database} collapsed={collapsed} />
          </NavGroup>
        )}

        {(hasAny(perms, "users:") || hasAny(perms, "roles:") || hasAny(perms, "tenants:") || hasAny(perms, "admin:")) && (
          <NavGroup label="Administration" collapsed={collapsed}>
            {hasAny(perms, "admin:") && (
              <NavItem href="/admin-portal" label="Admin Portal" icon={SlidersHorizontal} collapsed={collapsed} />
            )}
            {hasAny(perms, "users:") && (
              <NavItem href="/admin/users" label="Users" icon={UserCog} collapsed={collapsed} />
            )}
            {hasAny(perms, "roles:") && (
              <NavItem href="/admin/roles" label="Roles" icon={Shield} collapsed={collapsed} />
            )}
            {hasAny(perms, "tenants:") && (
              <NavItem href="/admin/settings" label="Settings" icon={Settings} collapsed={collapsed} />
            )}
          </NavGroup>
        )}
      </nav>

      {/* Collapse button */}
      <div className="border-t p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
