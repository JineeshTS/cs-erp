export type AutomationLevel = "full_auto" | "semi_auto" | "ai_assisted" | "manual_ai_insights";
export type TriggerType = "event" | "scheduled" | "manual" | "api";
export type ProcessDomain =
  | "sales_customer"
  | "booking_documentation"
  | "vessel_voyage"
  | "equipment_container"
  | "port_terminal"
  | "trade_route"
  | "financial"
  | "hr_procurement"
  | "compliance_risk"
  | "analytics_intelligence"
  | "platform_admin";

export interface OperationalProcess {
  id: string;
  name: string;
  description: string;
  domain: ProcessDomain;
  agentName: string;
  agentType: string;
  automationLevel: AutomationLevel;
  trigger: TriggerType;
  input: string;
  aiProcessingSteps: string[];
  output: string;
  humanTouchpoints: string[];
  connectedModules: string[];
  sla: string;
  crossDependencies: string[];
}

export interface E2EFlowStep {
  module: string;
  step: string;
  type: "ai" | "human" | "system";
}

export interface E2EProcessFlow {
  id: string;
  name: string;
  description: string;
  steps: E2EFlowStep[];
  participatingModules: string[];
  aiAgents: string[];
  handoffPoints: string[];
  typicalTimeline: string;
  kpis: string[];
}

export const DOMAIN_LABELS: Record<ProcessDomain, string> = {
  sales_customer: "Sales & Customer Management",
  booking_documentation: "Booking & Documentation",
  vessel_voyage: "Vessel & Voyage Operations",
  equipment_container: "Equipment & Container",
  port_terminal: "Port & Terminal",
  trade_route: "Trade & Route Management",
  financial: "Financial Management",
  hr_procurement: "HR & Procurement",
  compliance_risk: "Compliance & Risk",
  analytics_intelligence: "Analytics & Intelligence",
  platform_admin: "Platform & Administration",
};

export const AUTOMATION_LABELS: Record<AutomationLevel, { label: string; emoji: string; color: string }> = {
  full_auto: { label: "Full Auto", emoji: "🟢", color: "green" },
  semi_auto: { label: "Semi-Auto", emoji: "🟡", color: "yellow" },
  ai_assisted: { label: "AI-Assisted", emoji: "🔵", color: "blue" },
  manual_ai_insights: { label: "Manual + AI", emoji: "⚪", color: "gray" },
};

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  event: "Event-Driven",
  scheduled: "Scheduled",
  manual: "Manual",
  api: "API",
};

// ── Process Categories (functional grouping of domains) ──

export type ProcessCategory =
  | "core_operations"
  | "commercial_pricing"
  | "financial_accounting"
  | "compliance_regulatory"
  | "fleet_asset"
  | "analytics_intelligence"
  | "platform_admin";

export const PROCESS_CATEGORY_LABELS: Record<
  ProcessCategory,
  { label: string; description: string; icon: string }
> = {
  core_operations: {
    label: "Core Operations",
    description: "Booking, documentation, vessel scheduling, container handling, and port operations",
    icon: "Ship",
  },
  commercial_pricing: {
    label: "Commercial & Pricing",
    description: "Sales pipeline, rate management, revenue optimization, and customer relationships",
    icon: "BadgeDollarSign",
  },
  financial_accounting: {
    label: "Financial & Accounting",
    description: "Invoicing, receivables, payables, treasury, and general ledger operations",
    icon: "DollarSign",
  },
  compliance_regulatory: {
    label: "Compliance & Regulatory",
    description: "Customs, MARPOL, insurance, audits, risk management, and regulatory filings",
    icon: "ShieldCheck",
  },
  fleet_asset: {
    label: "Fleet & Asset Management",
    description: "Crew management, vessel maintenance, surveys, and HR/procurement operations",
    icon: "Users",
  },
  analytics_intelligence: {
    label: "Analytics & Intelligence",
    description: "KPI dashboards, market intelligence, ESG reporting, and predictive analytics",
    icon: "BarChart3",
  },
  platform_admin: {
    label: "Platform Administration",
    description: "Tenant setup, user management, workflows, integrations, and system operations",
    icon: "Settings",
  },
};

export const DOMAIN_TO_CATEGORY: Record<ProcessDomain, ProcessCategory> = {
  booking_documentation: "core_operations",
  vessel_voyage: "core_operations",
  equipment_container: "core_operations",
  port_terminal: "core_operations",
  trade_route: "core_operations",
  sales_customer: "commercial_pricing",
  financial: "financial_accounting",
  compliance_risk: "compliance_regulatory",
  hr_procurement: "fleet_asset",
  analytics_intelligence: "analytics_intelligence",
  platform_admin: "platform_admin",
};
