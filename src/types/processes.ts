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
