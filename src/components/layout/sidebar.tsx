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
  ScrollText,
  Weight,
  FileWarning,
  MapPin,
  Cpu,
  Play,
  FileSearch2,
  GitBranch,
  Layers,
  AlertCircle,
  Server,
  Rocket,
  Key,
  Lock,
  ClipboardCheck,
  Activity,
  Cable,
  FileCode,
  RefreshCcw,
  ShoppingCart,
  Fuel,
  FlaskConical,
  AlertTriangle,
  Gauge,
  Leaf,
  Droplets,
  Calculator,
  TrendingUp,
  Banknote,
  PieChart,
  GitCompare,
  Building,
  Wallet,
  Zap,
  CheckSquare,
  Calendar,
  ScanLine,
  CheckCircle,
  Award,
  Plane,
  Heart,
  Globe,
  Route,
  Radiation,
  Flame,
  Thermometer,
  Plug,
  FileOutput,
  ArrowRightLeft,
  Ruler,
  DoorOpen,
  MessageSquare,
  ShieldCheck,
  FileBarChart,
  CalendarOff,
  Star,
  Stamp,
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

        {hasAny(perms, "ai:") && (
          <NavGroup label="AI & Agents" collapsed={collapsed}>
            <NavItem href="/ai-agent-framework" label="Agents" icon={Cpu} collapsed={collapsed} />
            <NavItem href="/ai-agent-framework/runs" label="Runs" icon={Play} collapsed={collapsed} />
            <NavItem href="/ai-agent-framework/escalations" label="Escalations" icon={AlertCircle} collapsed={collapsed} />
            <NavItem href="/ai-agent-framework/documents" label="Documents" icon={FileSearch2} collapsed={collapsed} />
            <NavItem href="/ai-agent-framework/workflows" label="Workflows" icon={GitBranch} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "infra:") && (
          <NavGroup label="Infrastructure & Security" collapsed={collapsed}>
            <NavItem href="/infrastructure-security" label="Clusters" icon={Server} collapsed={collapsed} />
            <NavItem href="/infrastructure-security/deployments" label="Deployments" icon={Rocket} collapsed={collapsed} />
            <NavItem href="/infrastructure-security/iam-policies" label="IAM Policies" icon={Shield} collapsed={collapsed} />
            <NavItem href="/infrastructure-security/service-accounts" label="Service Accounts" icon={Key} collapsed={collapsed} />
            <NavItem href="/infrastructure-security/encryption-keys" label="Encryption Keys" icon={Lock} collapsed={collapsed} />
            <NavItem href="/infrastructure-security/audit-events" label="Audit Log" icon={Activity} collapsed={collapsed} />
            <NavItem href="/infrastructure-security/compliance-reports" label="Compliance" icon={ClipboardCheck} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "bunker:") && (
          <NavGroup label="Bunker & Fuel" collapsed={collapsed}>
            <NavItem href="/bunker-fuel-management" label="Orders" icon={Fuel} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/stems" label="Stems" icon={Anchor} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/quality-tests" label="Quality Tests" icon={FlaskConical} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/quality-claims" label="Claims" icon={AlertTriangle} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/fuel-rob" label="Fuel ROB" icon={Gauge} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/reconciliations" label="Reconciliation" icon={Scale} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/emissions" label="Emissions" icon={Leaf} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/sulphur-records" label="Sulphur" icon={Droplets} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/cost-allocations" label="Cost Alloc." icon={Calculator} collapsed={collapsed} />
            <NavItem href="/bunker-fuel-management/optimization-runs" label="AI Optimize" icon={Brain} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "costing:") && (
          <NavGroup label="Costing & Financial" collapsed={collapsed}>
            <NavItem href="/costing-financial-management" label="Voyage Budgets" icon={DollarSign} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/port-disbursements" label="Disbursements" icon={Banknote} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/revenue-recognitions" label="Revenue" icon={TrendingUp} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/agency-commissions" label="Commissions" icon={Wallet} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/voyage-pnl" label="Voyage P&L" icon={PieChart} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/container-costs" label="Container Costs" icon={Container} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/overhead-allocations" label="Overhead Alloc." icon={Layers} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/variance-analyses" label="Variance" icon={GitCompare} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/cost-centres" label="Cost Centres" icon={Building} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/capex-items" label="CAPEX" icon={Landmark} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/anomaly-detections" label="Anomalies" icon={Zap} collapsed={collapsed} />
            <NavItem href="/costing-financial-management/kpi-reports" label="KPI Reports" icon={BarChart3} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "invoice:") && (
          <NavGroup label="Invoice & Revenue" collapsed={collapsed}>
            <NavItem href="/freight-invoice-revenue-management" label="Freight Invoices" icon={FileText} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/invoice-line-items" label="Line Items" icon={ClipboardList} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/debit-credit-notes" label="Debit/Credit Notes" icon={CreditCard} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/invoice-amendments" label="Amendments" icon={RefreshCcw} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/proforma-invoices" label="Proforma" icon={FileCheck} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/revenue-accruals" label="Revenue Accruals" icon={TrendingUp} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/invoice-disputes" label="Disputes" icon={AlertTriangle} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/dunning-runs" label="Dunning Runs" icon={Bell} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/dunning-actions" label="Dunning Actions" icon={Activity} collapsed={collapsed} />
            <NavItem href="/freight-invoice-revenue-management/revenue-forecast-entries" label="Forecasts" icon={BarChart3} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "receivable:") && (
          <NavGroup label="AR & Credit Control" collapsed={collapsed}>
            <NavItem href="/accounts-receivable-credit-control" label="Customer Accounts" icon={Users} collapsed={collapsed} />
            <NavItem href="/accounts-receivable-credit-control/credit-limits" label="Credit Limits" icon={Shield} collapsed={collapsed} />
            <NavItem href="/accounts-receivable-credit-control/aging-reports" label="Aging Reports" icon={BarChart3} collapsed={collapsed} />
            <NavItem href="/accounts-receivable-credit-control/cash-applications" label="Cash Application" icon={CreditCard} collapsed={collapsed} />
            <NavItem href="/accounts-receivable-credit-control/collection-workflows" label="Collections" icon={AlertTriangle} collapsed={collapsed} />
            <NavItem href="/accounts-receivable-credit-control/bad-debt-provisions" label="Bad Debt" icon={AlertOctagon} collapsed={collapsed} />
            <NavItem href="/accounts-receivable-credit-control/payment-predictions" label="AI Predictions" icon={Brain} collapsed={collapsed} />
            <NavItem href="/accounts-receivable-credit-control/cash-flow-forecasts" label="Cash Flow" icon={TrendingUp} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "payable:") && (
          <NavGroup label="AP & Vendor Mgmt" collapsed={collapsed}>
            <NavItem href="/accounts-payable-vendor-management" label="Vendors" icon={Users} collapsed={collapsed} />
            <NavItem href="/accounts-payable-vendor-management/purchase-orders" label="Purchase Orders" icon={ShoppingCart} collapsed={collapsed} />
            <NavItem href="/accounts-payable-vendor-management/vendor-invoices" label="Vendor Invoices" icon={FileText} collapsed={collapsed} />
            <NavItem href="/accounts-payable-vendor-management/three-way-matches" label="3-Way Match" icon={CheckSquare} collapsed={collapsed} />
            <NavItem href="/accounts-payable-vendor-management/payment-schedules" label="Payments" icon={Calendar} collapsed={collapsed} />
            <NavItem href="/accounts-payable-vendor-management/vendor-reconciliations" label="Reconciliation" icon={Scale} collapsed={collapsed} />
            <NavItem href="/accounts-payable-vendor-management/ocr-extractions" label="OCR Extraction" icon={ScanLine} collapsed={collapsed} />
            <NavItem href="/accounts-payable-vendor-management/spend-analytics" label="Spend Analytics" icon={PieChart} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "disbursement:") && (
          <NavGroup label="Port Disbursement" collapsed={collapsed}>
            <NavItem href="/port-disbursement-accounting" label="Proforma DAs" icon={FileText} collapsed={collapsed} />
            <NavItem href="/port-disbursement-accounting/final-das" label="Final DAs" icon={CheckCircle} collapsed={collapsed} />
            <NavItem href="/port-disbursement-accounting/port-costs" label="Port Costs" icon={DollarSign} collapsed={collapsed} />
            <NavItem href="/port-disbursement-accounting/agent-statements" label="Agent Statements" icon={ClipboardList} collapsed={collapsed} />
            <NavItem href="/port-disbursement-accounting/expense-allocations" label="Expense Alloc." icon={Layers} collapsed={collapsed} />
            <NavItem href="/port-disbursement-accounting/variance-analyses" label="Variance" icon={GitCompare} collapsed={collapsed} />
            <NavItem href="/port-disbursement-accounting/cost-benchmarks" label="Benchmarks" icon={BarChart3} collapsed={collapsed} />
            <NavItem href="/port-disbursement-accounting/consolidated-reports" label="Reports" icon={PieChart} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "technical:") && (
          <NavGroup label="Vessel Technical" collapsed={collapsed}>
            <NavItem href="/vessel-technical-management" label="PMS Tasks" icon={Wrench} collapsed={collapsed} />
            <NavItem href="/vessel-technical-management/dry-dock-plans" label="Dry Docks" icon={Anchor} collapsed={collapsed} />
            <NavItem href="/vessel-technical-management/survey-trackings" label="Surveys" icon={Shield} collapsed={collapsed} />
            <NavItem href="/vessel-technical-management/defect-repairs" label="Defect Repairs" icon={AlertTriangle} collapsed={collapsed} />
            <NavItem href="/vessel-technical-management/spare-parts" label="Spare Parts" icon={Package} collapsed={collapsed} />
            <NavItem href="/vessel-technical-management/technical-procurements" label="Procurement" icon={ShoppingCart} collapsed={collapsed} />
            <NavItem href="/vessel-technical-management/compliance-records" label="Compliance" icon={ClipboardCheck} collapsed={collapsed} />
            <NavItem href="/vessel-technical-management/predictive-maintenance" label="AI Predictive" icon={Brain} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "crew:") && (
          <NavGroup label="Crew Management" collapsed={collapsed}>
            <NavItem href="/crew-management" label="Rotations" icon={Users} collapsed={collapsed} />
            <NavItem href="/crew-management/certificate-trackings" label="Certificates" icon={Award} collapsed={collapsed} />
            <NavItem href="/crew-management/payroll-allotments" label="Payroll" icon={DollarSign} collapsed={collapsed} />
            <NavItem href="/crew-management/flag-state-compliance" label="Flag State" icon={Shield} collapsed={collapsed} />
            <NavItem href="/crew-management/manning-agencies" label="Manning Agencies" icon={Building} collapsed={collapsed} />
            <NavItem href="/crew-management/visa-travel-records" label="Visa & Travel" icon={Plane} collapsed={collapsed} />
            <NavItem href="/crew-management/welfare-medical-records" label="Welfare & Medical" icon={Heart} collapsed={collapsed} />
            <NavItem href="/crew-management/mlc-compliance" label="MLC Compliance" icon={FileCheck} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "liner:") && (
          <NavGroup label="Liner Trade Routes" collapsed={collapsed}>
            <NavItem href="/liner-trade-route-management" label="Service Loops" icon={Navigation} collapsed={collapsed} />
            <NavItem href="/liner-trade-route-management/port-pair-trade-lanes" label="Trade Lanes" icon={GitBranch} collapsed={collapsed} />
            <NavItem href="/liner-trade-route-management/trade-lane-pnl" label="Trade Lane P&L" icon={DollarSign} collapsed={collapsed} />
            <NavItem href="/liner-trade-route-management/slot-agreements" label="Slot Agreements" icon={Handshake} collapsed={collapsed} />
            <NavItem href="/liner-trade-route-management/alliance-agreements" label="Alliances" icon={Globe} collapsed={collapsed} />
            <NavItem href="/liner-trade-route-management/port-stay-analyses" label="Port Stay" icon={Anchor} collapsed={collapsed} />
            <NavItem href="/liner-trade-route-management/route-optimizations" label="AI Optimization" icon={Route} collapsed={collapsed} />
            <NavItem href="/liner-trade-route-management/market-intelligence" label="Market Intel" icon={BarChart3} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "demurrage:") && (
          <NavGroup label="Demurrage & Detention" collapsed={collapsed}>
            <NavItem href="/demurrage-detention-management" label="Calculations" icon={Calculator} collapsed={collapsed} />
            <NavItem href="/demurrage-detention-management/free-time-rules" label="Free Time Rules" icon={Clock} collapsed={collapsed} />
            <NavItem href="/demurrage-detention-management/detention-trackings" label="Detention Tracking" icon={Timer} collapsed={collapsed} />
            <NavItem href="/demurrage-detention-management/invoices" label="D&D Invoices" icon={Receipt} collapsed={collapsed} />
            <NavItem href="/demurrage-detention-management/disputes" label="Disputes" icon={FileWarning} collapsed={collapsed} />
            <NavItem href="/demurrage-detention-management/waivers" label="Waivers" icon={Scale} collapsed={collapsed} />
            <NavItem href="/demurrage-detention-management/predictions" label="AI Predictions" icon={Brain} collapsed={collapsed} />
            <NavItem href="/demurrage-detention-management/notifications" label="Notifications" icon={Bell} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "dangerous_goods:") && (
          <NavGroup label="Dangerous Goods" collapsed={collapsed}>
            <NavItem href="/dangerous-goods-management" label="IMDG Compliance" icon={Radiation} collapsed={collapsed} />
            <NavItem href="/dangerous-goods-management/booking-screenings" label="Booking Screening" icon={ScanLine} collapsed={collapsed} />
            <NavItem href="/dangerous-goods-management/segregation-rules" label="Segregation Rules" icon={Layers} collapsed={collapsed} />
            <NavItem href="/dangerous-goods-management/placard-requirements" label="Placards & Labels" icon={FileCheck} collapsed={collapsed} />
            <NavItem href="/dangerous-goods-management/manifests" label="DG Manifests" icon={FileText} collapsed={collapsed} />
            <NavItem href="/dangerous-goods-management/emergency-procedures" label="Emergency Procs" icon={Flame} collapsed={collapsed} />
            <NavItem href="/dangerous-goods-management/chemical-safety-data" label="Chemical Safety" icon={AlertTriangle} collapsed={collapsed} />
            <NavItem href="/dangerous-goods-management/incident-reports" label="Incidents" icon={AlertOctagon} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "reefer:") && (
          <NavGroup label="Reefer Containers" collapsed={collapsed}>
            <NavItem href="/reefer-container-management" label="Reefer Bookings" icon={Snowflake} collapsed={collapsed} />
            <NavItem href="/reefer-container-management/temp-monitorings" label="Temp Monitoring" icon={Thermometer} collapsed={collapsed} />
            <NavItem href="/reefer-container-management/pti-inspections" label="PTI Inspections" icon={ClipboardCheck} collapsed={collapsed} />
            <NavItem href="/reefer-container-management/power-management" label="Power Mgmt" icon={Plug} collapsed={collapsed} />
            <NavItem href="/reefer-container-management/cold-chain-docs" label="Cold Chain Docs" icon={FileCheck} collapsed={collapsed} />
            <NavItem href="/reefer-container-management/breakdown-responses" label="Breakdowns" icon={AlertTriangle} collapsed={collapsed} />
            <NavItem href="/reefer-container-management/temp-alerts" label="Temp Alerts" icon={Bell} collapsed={collapsed} />
            <NavItem href="/reefer-container-management/claim-analytics" label="Claim Analytics" icon={BarChart3} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "oog_special:") && (
          <NavGroup label="OOG & Special Cargo" collapsed={collapsed}>
            <NavItem href="/oog-special-cargo-management" label="Cargo Acceptances" icon={Package} collapsed={collapsed} />
            <NavItem href="/oog-special-cargo-management/stowage-plans" label="Stowage Plans" icon={LayoutGrid} collapsed={collapsed} />
            <NavItem href="/oog-special-cargo-management/special-equipment" label="Special Equipment" icon={Wrench} collapsed={collapsed} />
            <NavItem href="/oog-special-cargo-management/securing-plans" label="Securing Plans" icon={Lock} collapsed={collapsed} />
            <NavItem href="/oog-special-cargo-management/heavy-lifts" label="Heavy Lifts" icon={Weight} collapsed={collapsed} />
            <NavItem href="/oog-special-cargo-management/multi-modal-logistics" label="Multi-Modal" icon={Route} collapsed={collapsed} />
            <NavItem href="/oog-special-cargo-management/doc-permits" label="Docs & Permits" icon={FileWarning} collapsed={collapsed} />
            <NavItem href="/oog-special-cargo-management/port-approvals" label="Port Approvals" icon={Anchor} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "intermodal:") && (
          <NavGroup label="Intermodal & ICD" collapsed={collapsed}>
            <NavItem href="/intermodal-icd-operations" label="Dry Ports" icon={Landmark} collapsed={collapsed} />
            <NavItem href="/intermodal-icd-operations/rail-plans" label="Rail Plans" icon={Navigation} collapsed={collapsed} />
            <NavItem href="/intermodal-icd-operations/truck-bookings" label="Truck Bookings" icon={Boxes} collapsed={collapsed} />
            <NavItem href="/intermodal-icd-operations/bonded-warehouses" label="Warehouses" icon={Building} collapsed={collapsed} />
            <NavItem href="/intermodal-icd-operations/last-mile-deliveries" label="Last Mile" icon={MapPin} collapsed={collapsed} />
            <NavItem href="/intermodal-icd-operations/multimodal-bols" label="Multimodal B/L" icon={ScrollText} collapsed={collapsed} />
            <NavItem href="/intermodal-icd-operations/haulage-rates" label="Haulage Rates" icon={Calculator} collapsed={collapsed} />
            <NavItem href="/intermodal-icd-operations/route-optimizations" label="Route AI" icon={Brain} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "customs:") && (
          <NavGroup label="Customs & Regulatory" collapsed={collapsed}>
            <NavItem href="/customs-compliance-regulatory" label="Import Clearances" icon={ClipboardCheck} collapsed={collapsed} />
            <NavItem href="/customs-compliance-regulatory/export-filings" label="Export Filings" icon={FileOutput} collapsed={collapsed} />
            <NavItem href="/customs-compliance-regulatory/transit-procedures" label="Transit Procedures" icon={ArrowRightLeft} collapsed={collapsed} />
            <NavItem href="/customs-compliance-regulatory/duty-calculations" label="Duty Calculations" icon={Calculator} collapsed={collapsed} />
            <NavItem href="/customs-compliance-regulatory/aeo-compliances" label="AEO Compliance" icon={Shield} collapsed={collapsed} />
            <NavItem href="/customs-compliance-regulatory/isps-compliances" label="ISPS Compliance" icon={Anchor} collapsed={collapsed} />
            <NavItem href="/customs-compliance-regulatory/psc-preparations" label="PSC Preparations" icon={ClipboardList} collapsed={collapsed} />
            <NavItem href="/customs-compliance-regulatory/imo-regulations" label="IMO Regulations" icon={BookOpen} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "survey:") && (
          <NavGroup label="Survey & Inspection" collapsed={collapsed}>
            <NavItem href="/survey-inspection-management" label="Cargo Surveys" icon={Package} collapsed={collapsed} />
            <NavItem href="/survey-inspection-management/container-surveys" label="Container Surveys" icon={Container} collapsed={collapsed} />
            <NavItem href="/survey-inspection-management/draft-surveys" label="Draft Surveys" icon={Ruler} collapsed={collapsed} />
            <NavItem href="/survey-inspection-management/hire-surveys" label="Hire Surveys" icon={Ship} collapsed={collapsed} />
            <NavItem href="/survey-inspection-management/hatch-inspections" label="Hatch Inspections" icon={DoorOpen} collapsed={collapsed} />
            <NavItem href="/survey-inspection-management/reefer-pti-surveys" label="Reefer PTI" icon={Thermometer} collapsed={collapsed} />
            <NavItem href="/survey-inspection-management/classification-surveys" label="Classification" icon={Award} collapsed={collapsed} />
            <NavItem href="/survey-inspection-management/survey-reports" label="Survey Reports" icon={FileText} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "insurance:") && (
          <NavGroup label="Insurance & Claims" collapsed={collapsed}>
            <NavItem href="/insurance-claims-management" label="P&I Policies" icon={Shield} collapsed={collapsed} />
            <NavItem href="/insurance-claims-management/hull-machinery-insurances" label="H&M Insurance" icon={Anchor} collapsed={collapsed} />
            <NavItem href="/insurance-claims-management/cargo-insurance-policies" label="Cargo Insurance" icon={Package} collapsed={collapsed} />
            <NavItem href="/insurance-claims-management/survey-appointments" label="Survey Appts" icon={ClipboardList} collapsed={collapsed} />
            <NavItem href="/insurance-claims-management/claims-registrations" label="Claims" icon={AlertTriangle} collapsed={collapsed} />
            <NavItem href="/insurance-claims-management/claims-recoveries" label="Recoveries" icon={ArrowRightLeft} collapsed={collapsed} />
            <NavItem href="/insurance-claims-management/claims-predictions" label="Predictions" icon={Brain} collapsed={collapsed} />
            <NavItem href="/insurance-claims-management/loss-prevention-reports" label="Loss Prevention" icon={BarChart3} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "port_agency:") && (
          <NavGroup label="Port Agency" collapsed={collapsed}>
            <NavItem href="/port-agency-management" label="Port Calls" icon={Ship} collapsed={collapsed} />
            <NavItem href="/port-agency-management/husbandry-services" label="Husbandry" icon={Wrench} collapsed={collapsed} />
            <NavItem href="/port-agency-management/pre-arrival-checklists" label="Pre-Arrival" icon={ClipboardCheck} collapsed={collapsed} />
            <NavItem href="/port-agency-management/port-authority-communications" label="Port Comms" icon={MessageSquare} collapsed={collapsed} />
            <NavItem href="/port-agency-management/crew-change-coordinations" label="Crew Changes" icon={Users} collapsed={collapsed} />
            <NavItem href="/port-agency-management/cash-to-masters" label="Cash to Master" icon={Banknote} collapsed={collapsed} />
            <NavItem href="/port-agency-management/vessel-clearances" label="Clearances" icon={ShieldCheck} collapsed={collapsed} />
            <NavItem href="/port-agency-management/disbursement-accounts" label="Disbursements" icon={Receipt} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "analytics:") && (
          <NavGroup label="Analytics & BI" collapsed={collapsed}>
            <NavItem href="/analytics-business-intelligence" label="KPI Dashboards" icon={Gauge} collapsed={collapsed} />
            <NavItem href="/analytics-business-intelligence/voyage-analytics" label="Voyage Analytics" icon={Ship} collapsed={collapsed} />
            <NavItem href="/analytics-business-intelligence/trade-lane-analytics" label="Trade Lanes" icon={Route} collapsed={collapsed} />
            <NavItem href="/analytics-business-intelligence/customer-revenue-analytics" label="Customer Revenue" icon={Users} collapsed={collapsed} />
            <NavItem href="/analytics-business-intelligence/predictive-forecasts" label="Predictions" icon={Brain} collapsed={collapsed} />
            <NavItem href="/analytics-business-intelligence/market-intelligence-reports" label="Market Intel" icon={Globe} collapsed={collapsed} />
            <NavItem href="/analytics-business-intelligence/operational-efficiencies" label="Efficiency" icon={Activity} collapsed={collapsed} />
            <NavItem href="/analytics-business-intelligence/bi-reports" label="BI Reports" icon={FileBarChart} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "audit:") && (
          <NavGroup label="Audit & Compliance" collapsed={collapsed}>
            <NavItem href="/audit-compliance-management" label="Internal Audits" icon={ClipboardCheck} collapsed={collapsed} />
            <NavItem href="/audit-compliance-management/regulatory-compliance-calendars" label="Compliance Calendar" icon={Calendar} collapsed={collapsed} />
            <NavItem href="/audit-compliance-management/risk-registers" label="Risk Registers" icon={AlertTriangle} collapsed={collapsed} />
            <NavItem href="/audit-compliance-management/policy-procedures" label="Policies" icon={BookOpen} collapsed={collapsed} />
            <NavItem href="/audit-compliance-management/regulatory-reporting-submissions" label="Reg. Submissions" icon={FileText} collapsed={collapsed} />
            <NavItem href="/audit-compliance-management/sox-financial-controls" label="SOX Controls" icon={Shield} collapsed={collapsed} />
            <NavItem href="/audit-compliance-management/iso-certification-trackings" label="ISO Certifications" icon={Award} collapsed={collapsed} />
            <NavItem href="/audit-compliance-management/ai-risk-detections" label="AI Risk Detection" icon={Bot} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "hr:") && (
          <NavGroup label="HR & Payroll" collapsed={collapsed}>
            <NavItem href="/hr-payroll-shore-staff" label="Employees" icon={Users} collapsed={collapsed} />
            <NavItem href="/hr-payroll-shore-staff/leave-absences" label="Leave & Absence" icon={CalendarOff} collapsed={collapsed} />
            <NavItem href="/hr-payroll-shore-staff/attendance-time-trackings" label="Attendance" icon={Clock} collapsed={collapsed} />
            <NavItem href="/hr-payroll-shore-staff/performance-appraisals" label="Appraisals" icon={Star} collapsed={collapsed} />
            <NavItem href="/hr-payroll-shore-staff/payroll-processings" label="Payroll" icon={Banknote} collapsed={collapsed} />
            <NavItem href="/hr-payroll-shore-staff/social-insurance-records" label="Social Insurance" icon={Shield} collapsed={collapsed} />
            <NavItem href="/hr-payroll-shore-staff/gratuity-calculations" label="Gratuity" icon={Calculator} collapsed={collapsed} />
            <NavItem href="/hr-payroll-shore-staff/visa-residency-records" label="Visa & Residency" icon={Stamp} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "procurement:") && (
          <NavGroup label="Procurement & Supply" collapsed={collapsed}>
            <NavItem href="/procurement-supply-chain" label="Requisitions" icon={ClipboardList} collapsed={collapsed} />
            <NavItem href="/procurement-supply-chain/vendor-sourcings" label="Vendor Sourcing" icon={Users} collapsed={collapsed} />
            <NavItem href="/procurement-supply-chain/purchase-orders" label="Purchase Orders" icon={ShoppingCart} collapsed={collapsed} />
            <NavItem href="/procurement-supply-chain/procurement-contracts" label="Contracts" icon={Handshake} collapsed={collapsed} />
            <NavItem href="/procurement-supply-chain/inventory-stock-controls" label="Inventory" icon={Package} collapsed={collapsed} />
            <NavItem href="/procurement-supply-chain/goods-receipt-inspections" label="Goods Receipt" icon={ClipboardCheck} collapsed={collapsed} />
            <NavItem href="/procurement-supply-chain/spend-analytics" label="Spend Analytics" icon={TrendingUp} collapsed={collapsed} />
            <NavItem href="/procurement-supply-chain/supplier-scorecards" label="Scorecards" icon={Star} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "portal:") && (
          <NavGroup label="Customer Portal" collapsed={collapsed}>
            <NavItem href="/customer-portal" label="Portal Home" icon={ShoppingCart} collapsed={collapsed} />
            <NavItem href="/customer-portal/bookings" label="Bookings" icon={FileText} collapsed={collapsed} />
            <NavItem href="/customer-portal/tracking" label="Tracking" icon={MapPin} collapsed={collapsed} />
            <NavItem href="/customer-portal/documents" label="Documents" icon={FolderOpen} collapsed={collapsed} />
            <NavItem href="/customer-portal/invoices" label="Invoices" icon={Receipt} collapsed={collapsed} />
            <NavItem href="/customer-portal/payments" label="Payments" icon={CreditCard} collapsed={collapsed} />
          </NavGroup>
        )}

        {hasAny(perms, "integration:") && (
          <NavGroup label="Integrations & EDI" collapsed={collapsed}>
            <NavItem href="/integration-edi-layer" label="Connections" icon={Cable} collapsed={collapsed} />
            <NavItem href="/integration-edi-layer/edi-messages" label="EDI Messages" icon={FileCode} collapsed={collapsed} />
            <NavItem href="/integration-edi-layer/customs-filings" label="Customs Filings" icon={FileArchive} collapsed={collapsed} />
            <NavItem href="/integration-edi-layer/oracle-sync-jobs" label="Oracle Sync" icon={RefreshCcw} collapsed={collapsed} />
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

        {hasAny(perms, "operations:") && (
          <NavGroup label="Operations & Docs" collapsed={collapsed}>
            <NavItem href="/operations-documentation" label="Bills of Lading" icon={ScrollText} collapsed={collapsed} />
            <NavItem href="/operations-documentation/manifests" label="Manifests" icon={Ship} collapsed={collapsed} />
            <NavItem href="/operations-documentation/regulatory-filings" label="Regulatory Filings" icon={FileWarning} collapsed={collapsed} />
            <NavItem href="/operations-documentation/vgm-records" label="VGM Records" icon={Weight} collapsed={collapsed} />
            <NavItem href="/operations-documentation/cargo-tracking-events" label="Cargo Tracking" icon={MapPin} collapsed={collapsed} />
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
