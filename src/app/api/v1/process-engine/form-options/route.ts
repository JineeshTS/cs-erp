/**
 * GET /api/v1/process-engine/form-options?fields=source,country,ports
 *
 * Returns dropdown options from master data tables for E2E flow step forms.
 * Each field maps to a specific DB query.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse } from "@/lib/auth/api-auth";
import { db } from "@/lib/db";
import { scmCustomers, scmLeads } from "@/db/schema";
import { eq, isNull, desc, sql } from "drizzle-orm";

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
