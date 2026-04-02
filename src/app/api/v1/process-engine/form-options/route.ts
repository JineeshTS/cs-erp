/**
 * GET /api/v1/process-engine/form-options?fields=source,country,ports
 *
 * Returns dropdown options from master data tables for E2E flow step forms.
 * Each field maps to a specific DB query.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse } from "@/lib/auth/api-auth";
import { db } from "@/lib/db";
import { scmCustomers, scmLeads, vessels, ports } from "@/db/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";

const STATIC_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  source: [
    { value: "web_inquiry", label: "Web Inquiry" },
    { value: "email_parsed", label: "Email (AI Parsed)" },
    { value: "trade_show", label: "Trade Show" },
    { value: "agent_referral", label: "Agent Referral" },
    { value: "sales_rep", label: "Sales Rep" },
    { value: "platform_rfq", label: "Platform RFQ" },
    { value: "customer_portal", label: "Customer Portal" },
    { value: "advertisement", label: "Advertisement" },
    { value: "manual_entry", label: "Manual Entry" },
  ],
  cargo_type: [
    { value: "dry", label: "Dry Cargo" },
    { value: "reefer", label: "Reefer" },
    { value: "DG", label: "Dangerous Goods" },
    { value: "OOG", label: "Out of Gauge" },
    { value: "tank", label: "Tank Container" },
  ],
  rating: [
    { value: "green", label: "Green (Low Risk)" },
    { value: "amber", label: "Amber (Medium Risk)" },
    { value: "red", label: "Red (High Risk)" },
  ],
  incoterm: [
    { value: "FOB", label: "FOB — Free On Board" },
    { value: "CIF", label: "CIF — Cost, Insurance & Freight" },
    { value: "CFR", label: "CFR — Cost & Freight" },
    { value: "EXW", label: "EXW — Ex Works" },
    { value: "FCA", label: "FCA — Free Carrier" },
    { value: "DAP", label: "DAP — Delivered At Place" },
    { value: "DDP", label: "DDP — Delivered Duty Paid" },
  ],
  country: [
    { value: "QA", label: "Qatar" },
    { value: "AE", label: "UAE" },
    { value: "SA", label: "Saudi Arabia" },
    { value: "IN", label: "India" },
    { value: "CN", label: "China" },
    { value: "SG", label: "Singapore" },
    { value: "MY", label: "Malaysia" },
    { value: "OM", label: "Oman" },
    { value: "BH", label: "Bahrain" },
    { value: "KW", label: "Kuwait" },
    { value: "PK", label: "Pakistan" },
    { value: "BD", label: "Bangladesh" },
    { value: "LK", label: "Sri Lanka" },
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "DE", label: "Germany" },
    { value: "NL", label: "Netherlands" },
    { value: "TR", label: "Turkey" },
    { value: "KE", label: "Kenya" },
    { value: "TZ", label: "Tanzania" },
  ],
  industry: [
    { value: "oil_gas", label: "Oil & Gas" },
    { value: "petrochemicals", label: "Petrochemicals" },
    { value: "fmcg", label: "FMCG / Consumer Goods" },
    { value: "automotive", label: "Automotive" },
    { value: "construction", label: "Construction Materials" },
    { value: "agriculture", label: "Agriculture / Food" },
    { value: "electronics", label: "Electronics" },
    { value: "textiles", label: "Textiles & Garments" },
    { value: "pharmaceuticals", label: "Pharmaceuticals" },
    { value: "machinery", label: "Machinery & Equipment" },
    { value: "steel_metals", label: "Steel & Metals" },
    { value: "retail", label: "Retail / E-commerce" },
    { value: "logistics", label: "Logistics / 3PL" },
    { value: "government", label: "Government" },
    { value: "other", label: "Other" },
  ],
  schedule_type: [
    { value: "liner_service", label: "Liner Service" },
    { value: "feeder_service", label: "Feeder Service" },
    { value: "relay_service", label: "Relay Service" },
    { value: "pendulum_route", label: "Pendulum Route" },
    { value: "round_trip", label: "Round Trip" },
  ],
  vessel_ownership: [
    { value: "own", label: "Own Vessel" },
    { value: "charter", label: "Charter" },
    { value: "partner", label: "Partner / Cost Sharing" },
    { value: "third_party", label: "3rd Party Vessel" },
  ],
  frequency: [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-Weekly (14 days)" },
    { value: "monthly", label: "Monthly" },
  ],
  call_purpose: [
    { value: "loading", label: "Loading Only" },
    { value: "discharge", label: "Discharge Only" },
    { value: "both", label: "Loading & Discharge" },
    { value: "bunkering", label: "Bunkering" },
    { value: "transit", label: "Transit / Canal" },
  ],
  report_type: [
    { value: "noon", label: "Noon Report" },
    { value: "departure", label: "Departure Report" },
    { value: "arrival", label: "Arrival Report" },
    { value: "event", label: "Event Report" },
    { value: "bunker", label: "Bunker Report" },
  ],
  delay_reason: [
    { value: "weather", label: "Weather" },
    { value: "congestion", label: "Port Congestion" },
    { value: "eca_transit", label: "ECA Zone Transit" },
    { value: "war_zone", label: "WAR Zone Deviation" },
    { value: "mechanical", label: "Mechanical Issue" },
    { value: "port_operations", label: "Port Operations" },
    { value: "customs", label: "Customs Hold" },
    { value: "other", label: "Other" },
  ],
  modification_type: [
    { value: "skip", label: "Skip Port" },
    { value: "add", label: "Add Port" },
    { value: "swap", label: "Swap Port" },
    { value: "delete", label: "Delete Port" },
  ],
  wind_direction: [
    { value: "N", label: "North" }, { value: "NE", label: "North-East" },
    { value: "E", label: "East" }, { value: "SE", label: "South-East" },
    { value: "S", label: "South" }, { value: "SW", label: "South-West" },
    { value: "W", label: "West" }, { value: "NW", label: "North-West" },
    { value: "variable", label: "Variable" },
  ],
  sea_state: [
    { value: "calm", label: "Calm (Glassy)" }, { value: "smooth", label: "Smooth" },
    { value: "slight", label: "Slight" }, { value: "moderate", label: "Moderate" },
    { value: "rough", label: "Rough" }, { value: "very_rough", label: "Very Rough" },
    { value: "high", label: "High" }, { value: "very_high", label: "Very High" },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const requestedFields = (searchParams.get("fields") ?? "").split(",").filter(Boolean);

    const result: Record<string, Array<{ value: string; label: string }>> = {};

    for (const field of requestedFields) {
      if (STATIC_OPTIONS[field]) {
        result[field] = STATIC_OPTIONS[field];
        continue;
      }

      // DB-driven options
      if (field === "customers") {
        const customers = await db
          .select({ id: scmCustomers.id, name: scmCustomers.companyName })
          .from(scmCustomers)
          .where(eq(scmCustomers.tenantId, user.tenantId))
          .orderBy(scmCustomers.companyName)
          .limit(200);
        result.customers = customers.map((c) => ({ value: c.id, label: c.name }));
      }

      if (field === "recent_leads") {
        const leads = await db
          .select({ id: scmLeads.id, name: scmLeads.companyName })
          .from(scmLeads)
          .where(eq(scmLeads.tenantId, user.tenantId))
          .orderBy(desc(scmLeads.createdAt))
          .limit(50);
        result.recent_leads = leads.map((l) => ({ value: l.id, label: l.name }));
      }

      if (field === "trade_lanes") {
        // Distinct trade lanes from existing leads
        const lanes = await db
          .select({ lane: scmLeads.tradeLane })
          .from(scmLeads)
          .where(eq(scmLeads.tenantId, user.tenantId))
          .groupBy(scmLeads.tradeLane)
          .limit(50);
        result.trade_lanes = lanes
          .filter((l) => l.lane)
          .map((l) => ({ value: l.lane!, label: l.lane! }));
      }

      if (field === "vessels") {
        const rows = await db
          .select({ name: vessels.name, imoNumber: vessels.imoNumber })
          .from(vessels)
          .where(and(eq(vessels.tenantId, user.tenantId), eq(vessels.status, "active"), isNull(vessels.deletedAt)))
          .orderBy(asc(vessels.name))
          .limit(100);
        result.vessels = rows.map((r) => ({ value: r.name, label: `${r.name} (IMO ${r.imoNumber})` }));
      }

      if (field === "ports") {
        const rows = await db
          .select({ unLocode: ports.unLocode, name: ports.name })
          .from(ports)
          .where(and(eq(ports.tenantId, user.tenantId), eq(ports.status, "active"), isNull(ports.deletedAt)))
          .orderBy(asc(ports.name))
          .limit(200);
        result.ports = rows.map((r) => ({ value: r.unLocode, label: `${r.name} (${r.unLocode})` }));
      }
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("GET /api/v1/process-engine/form-options error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch form options" } },
      { status: 500 }
    );
  }
}
