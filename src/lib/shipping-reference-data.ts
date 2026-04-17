/**
 * Shipping Reference Data — Grounded computation functions
 *
 * All scoring, rating, and screening functions use deterministic logic
 * grounded in DB reference data or hardcoded industry benchmarks.
 * Claude AI orchestrates but does NOT invent numbers.
 */

import { db } from "@/lib/db";
import {
  cpmTariffs,
  cpmTariffRates,
  cpmSurcharges,
} from "@/db/schema";
import { eq, and, isNull, lte, gte, or } from "drizzle-orm";

// ════════════════════════════════════════════════════════════
// PART 1: BANT-S Lead Qualification
// ════════════════════════════════════════════════════════════

interface LeadData {
  companyName: string;
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  jobTitle?: string | null;
  country?: string | null;
  city?: string | null;
  industry?: string | null;
  estimatedTeu?: number | null;
  estimatedRevenue?: number | null;
  tradeLane?: string | null;
  notes?: string | null;
  source?: string | null;
}

export interface BantSBreakdown {
  budget: { score: number; reasoning: string };
  authority: { score: number; reasoning: string };
  need: { score: number; reasoning: string };
  timeline: { score: number; reasoning: string };
  shippingFit: { score: number; reasoning: string };
  composite: number;
  qualification: "auto_qualified" | "review" | "nurture";
  methodology: "BANT-S";
}

// Budget: estimated annual revenue from TEU × base rate
function scoreBudget(lead: LeadData, baseRatePerTeu: number): { score: number; reasoning: string } {
  const teu = lead.estimatedTeu ?? 0;
  const annualRevenue = teu * 12 * baseRatePerTeu;

  if (annualRevenue >= 2_000_000) return { score: 100, reasoning: `$${(annualRevenue/100).toLocaleString()} annual revenue (${teu} TEU/mo × $${(baseRatePerTeu/100).toFixed(0)}) — Major account` };
  if (annualRevenue >= 1_000_000) return { score: 80, reasoning: `$${(annualRevenue/100).toLocaleString()} annual revenue — Large account` };
  if (annualRevenue >= 500_000) return { score: 60, reasoning: `$${(annualRevenue/100).toLocaleString()} annual revenue — Medium account` };
  if (annualRevenue >= 200_000) return { score: 40, reasoning: `$${(annualRevenue/100).toLocaleString()} annual revenue — Small account` };
  if (teu > 0) return { score: 20, reasoning: `$${(annualRevenue/100).toLocaleString()} annual revenue — Micro account` };
  return { score: 10, reasoning: "No volume estimate provided" };
}

// Authority: deterministic from job title
const TITLE_TIERS: [RegExp, number, string][] = [
  [/\b(ceo|cfo|coo|cto|chairman|president|owner|founder|managing\s+director)\b/i, 100, "C-Suite / Owner"],
  [/\b(vp|vice\s+president|svp|evp)\b/i, 95, "VP-level"],
  [/\b(director|head\s+of|general\s+manager|gm)\b/i, 85, "Director / Head"],
  [/\b(senior\s+manager|sr\.?\s+manager)\b/i, 75, "Senior Manager"],
  [/\b(manager|team\s+lead)\b/i, 65, "Manager"],
  [/\b(supervisor|coordinator|specialist|executive|officer)\b/i, 50, "Coordinator / Specialist"],
  [/\b(analyst|associate|assistant)\b/i, 35, "Analyst / Assistant"],
  [/\b(intern|trainee|student)\b/i, 15, "Intern / Trainee"],
];

function scoreAuthority(lead: LeadData): { score: number; reasoning: string } {
  const title = lead.jobTitle?.trim() ?? "";
  if (!title) return { score: 30, reasoning: "No job title provided — assuming mid-level" };

  for (const [pattern, score, tier] of TITLE_TIERS) {
    if (pattern.test(title)) {
      return { score, reasoning: `"${title}" → ${tier} (score ${score})` };
    }
  }
  return { score: 45, reasoning: `"${title}" → Unclassified role (default 45)` };
}

// Need: completeness of concrete shipping requirements
function scoreNeed(lead: LeadData): { score: number; reasoning: string } {
  const checks: [boolean, number, string][] = [
    [!!lead.companyName, 5, "Company name"],
    [!!lead.tradeLane, 15, "Trade lane specified"],
    [!!lead.estimatedTeu && lead.estimatedTeu > 0, 15, "TEU volume stated"],
    [!!lead.contactEmail, 10, "Email provided"],
    [!!lead.country, 10, "Country identified"],
    [!!lead.industry, 10, "Industry specified"],
    [!!lead.contactPhone, 5, "Phone provided"],
    [hasCargoDetails(lead.notes), 15, "Cargo details in notes"],
    [hasPortDetails(lead.tradeLane, lead.notes), 15, "Specific ports mentioned"],
  ];

  let total = 0;
  const filled: string[] = [];
  const missing: string[] = [];

  for (const [met, points, label] of checks) {
    if (met) {
      total += points;
      filled.push(label);
    } else {
      missing.push(label);
    }
  }

  const score = Math.min(total, 100);
  const reasoning = `${filled.length}/9 requirements filled (${filled.join(", ")})${missing.length > 0 ? `. Missing: ${missing.join(", ")}` : ""}`;
  return { score, reasoning };
}

function hasCargoDetails(notes?: string | null): boolean {
  if (!notes) return false;
  return /\b(auto\s*parts|electronics|textiles|chemicals|fmcg|pharma|machinery|steel|grain|cement|oil|gas|petro|reefer|frozen|dg|dangerous|hazardous|container|fcl|lcl|dry|bulk)\b/i.test(notes);
}

function hasPortDetails(tradeLane?: string | null, notes?: string | null): boolean {
  const text = `${tradeLane ?? ""} ${notes ?? ""}`;
  return /\b(jebel\s*ali|mundra|nhava\s*sheva|jnpt|colombo|singapore|shanghai|dubai|doha|dammam|riyadh|chennai|kolkata|karachi)\b/i.test(text);
}

// Timeline: urgency from notes
const TIMELINE_PATTERNS: [RegExp, number, string][] = [
  [/\b(urgent|immediately|asap|this\s+week|emergency|critical)\b/i, 100, "Urgent (this week)"],
  [/\b(next\s+week|within\s+\d+\s+days?|next\s+shipment)\b/i, 90, "Very soon (next week)"],
  [/\b(next\s+month|this\s+month|starting\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))\b/i, 75, "Next month"],
  [/\b(q[1-4]\s*202[5-9]|quarter|next\s+quarter)\b/i, 60, "Next quarter"],
  [/\b(planning|budget|evaluate|assessing|reviewing|comparing)\b/i, 40, "Planning phase"],
  [/\b(exploring|future|long[\s-]term|maybe|possibly|considering)\b/i, 25, "Exploratory"],
];

function scoreTimeline(lead: LeadData): { score: number; reasoning: string } {
  const text = `${lead.notes ?? ""} ${lead.source ?? ""}`;
  if (!text.trim()) return { score: 30, reasoning: "No timeline indicators found" };

  for (const [pattern, score, label] of TIMELINE_PATTERNS) {
    if (pattern.test(text)) {
      return { score, reasoning: label };
    }
  }
  return { score: 35, reasoning: "No explicit timeline mentioned — assuming moderate" };
}

// Shipping Fit: trade lane coverage
const SERVED_TRADE_LANES = ["GIS", "IGX", "FEG", "IAS", "AE-EB", "AE-WB", "MED", "AFX", "TP-EB", "TP-WB", "TA-EB", "TA-WB"];

const TRADE_LANE_KEYWORDS: Record<string, string[]> = {
  GIS: ["gulf", "india", "isc", "mundra", "nhava", "jnpt", "chennai", "colombo", "jebel ali", "dubai"],
  IGX: ["indo", "gulf", "india", "middle east"],
  FEG: ["far east", "china", "shanghai", "ningbo", "gulf", "korea", "japan"],
  IAS: ["intra-asia", "asia", "singapore", "bangkok", "manila", "ho chi minh"],
  "AE-EB": ["asia", "europe", "rotterdam", "hamburg", "antwerp", "felixstowe"],
  MED: ["mediterranean", "piraeus", "istanbul", "barcelona", "genoa"],
};

function scoreShippingFit(lead: LeadData): { score: number; reasoning: string } {
  const text = `${lead.tradeLane ?? ""} ${lead.notes ?? ""} ${lead.country ?? ""}`.toLowerCase();
  if (!text.trim()) return { score: 30, reasoning: "No trade lane or route information provided" };

  // Direct code match
  for (const code of SERVED_TRADE_LANES) {
    if (text.includes(code.toLowerCase())) {
      return { score: 100, reasoning: `Exact trade lane match: ${code} — fully served` };
    }
  }

  // Keyword match
  for (const [code, keywords] of Object.entries(TRADE_LANE_KEYWORDS)) {
    const matches = keywords.filter(k => text.includes(k));
    if (matches.length >= 2) {
      return { score: 90, reasoning: `Strong match to ${code} trade lane (keywords: ${matches.join(", ")})` };
    }
    if (matches.length === 1) {
      return { score: 70, reasoning: `Partial match to ${code} trade lane (keyword: ${matches[0]})` };
    }
  }

  // Country-based inference
  const COUNTRY_TO_REGION: Record<string, string> = {
    AE: "Middle East", QA: "Middle East", SA: "Middle East", OM: "Middle East", BH: "Middle East", KW: "Middle East",
    IN: "Indian Subcontinent", PK: "Indian Subcontinent", BD: "Indian Subcontinent", LK: "Indian Subcontinent",
    CN: "Far East", JP: "Far East", KR: "Far East", TW: "Far East", HK: "Far East",
    SG: "Southeast Asia", MY: "Southeast Asia", TH: "Southeast Asia", VN: "Southeast Asia", PH: "Southeast Asia",
  };
  const country = lead.country?.toUpperCase() ?? "";
  if (COUNTRY_TO_REGION[country]) {
    return { score: 60, reasoning: `Country ${country} is in ${COUNTRY_TO_REGION[country]} — region served` };
  }

  return { score: 25, reasoning: "No identifiable route match to our network" };
}

// ── Main scoring function ──

export async function computeGroundedLeadScore(
  lead: LeadData,
  tenantId: string
): Promise<BantSBreakdown> {
  // Fetch base rate for budget calculation (use GIS 40' dry as default reference)
  let baseRate = 75000; // $750 default fallback in cents
  try {
    const tariff = await db
      .select({ unitPrice: cpmTariffRates.unitPrice })
      .from(cpmTariffRates)
      .innerJoin(cpmTariffs, eq(cpmTariffs.id, cpmTariffRates.tariffId))
      .where(
        and(
          eq(cpmTariffs.tenantId, tenantId),
          eq(cpmTariffRates.chargeType, "ocean_freight"),
          eq(cpmTariffRates.containerSize, "40"),
          isNull(cpmTariffs.deletedAt)
        )
      )
      .limit(1);
    if (tariff.length > 0) baseRate = tariff[0].unitPrice;
  } catch {
    // Use fallback
  }

  const budget = scoreBudget(lead, baseRate);
  const authority = scoreAuthority(lead);
  const need = scoreNeed(lead);
  const timeline = scoreTimeline(lead);
  const shippingFit = scoreShippingFit(lead);

  const composite = Math.round(
    budget.score * 0.25 +
    authority.score * 0.20 +
    need.score * 0.20 +
    timeline.score * 0.15 +
    shippingFit.score * 0.20
  );

  const qualification: BantSBreakdown["qualification"] =
    composite >= 70 ? "auto_qualified" :
    composite >= 40 ? "review" : "nurture";

  return {
    budget,
    authority,
    need,
    timeline,
    shippingFit,
    composite,
    qualification,
    methodology: "BANT-S",
  };
}

// ════════════════════════════════════════════════════════════
// PART 2: Grounded Credit Assessment
// ════════════════════════════════════════════════════════════

export interface CreditAssessment {
  countryRisk: { score: number; tier: string; reasoning: string };
  volumeCommitment: { score: number; reasoning: string };
  industryRisk: { score: number; reasoning: string };
  infoQuality: { score: number; reasoning: string };
  composite: number;
  riskRating: "green" | "amber" | "red";
  suggestedCreditLimit: number; // in cents
  paymentTermsDays: number;
  methodology: "4-factor deterministic";
}

const COUNTRY_RISK: Record<string, { tier: string; score: number }> = {
  AE: { tier: "A - Low Risk", score: 90 },
  QA: { tier: "A - Low Risk", score: 88 },
  SA: { tier: "A - Low Risk", score: 85 },
  KW: { tier: "A - Low Risk", score: 87 },
  BH: { tier: "B+ - Low-Medium", score: 75 },
  OM: { tier: "B+ - Low-Medium", score: 72 },
  SG: { tier: "A+ - Minimal Risk", score: 95 },
  HK: { tier: "A+ - Minimal Risk", score: 93 },
  JP: { tier: "A+ - Minimal Risk", score: 95 },
  KR: { tier: "A - Low Risk", score: 88 },
  CN: { tier: "A- - Low Risk", score: 80 },
  TW: { tier: "A - Low Risk", score: 85 },
  IN: { tier: "B - Medium Risk", score: 60 },
  LK: { tier: "B- - Medium-High", score: 50 },
  PK: { tier: "C - High Risk", score: 35 },
  BD: { tier: "C+ - Medium-High", score: 42 },
  GB: { tier: "A+ - Minimal Risk", score: 93 },
  DE: { tier: "A+ - Minimal Risk", score: 95 },
  NL: { tier: "A+ - Minimal Risk", score: 94 },
  US: { tier: "A+ - Minimal Risk", score: 92 },
  AU: { tier: "A+ - Minimal Risk", score: 93 },
};

const INDUSTRY_RISK: Record<string, number> = {
  "oil_gas": 85, "petrochemical": 80, "energy": 82,
  "fmcg": 90, "food_beverage": 88, "pharma": 92, "healthcare": 90,
  "automotive": 85, "electronics": 82, "technology": 80,
  "manufacturing": 70, "machinery": 72, "steel": 65,
  "textiles": 55, "apparel": 55, "fashion": 50,
  "agriculture": 52, "grain": 50, "commodities": 48,
  "construction": 50, "building_materials": 52,
  "trading": 42, "general_trading": 40,
  "container_shipping": 75, "logistics": 78, "freight_forwarding": 72,
  "chemicals": 68, "dangerous_goods": 60,
  "retail": 65, "ecommerce": 60,
};

function matchIndustry(industry?: string | null): number {
  if (!industry) return 50;
  const normalized = industry.toLowerCase().replace(/[\s&-]+/g, "_");
  // Direct match
  if (INDUSTRY_RISK[normalized]) return INDUSTRY_RISK[normalized];
  // Partial match
  for (const [key, score] of Object.entries(INDUSTRY_RISK)) {
    if (normalized.includes(key) || key.includes(normalized)) return score;
  }
  return 50; // Unknown industry
}

export function computeGroundedCreditScore(
  lead: LeadData,
  annualEstRevenue: number // in cents
): CreditAssessment {
  // 1. Country Risk (30%)
  const countryCode = lead.country?.toUpperCase() ?? "";
  const cr = COUNTRY_RISK[countryCode] ?? { tier: "Unknown", score: 50 };
  const countryRisk = { score: cr.score, tier: cr.tier, reasoning: `${countryCode || "Unknown"} — ${cr.tier}` };

  // 2. Volume Commitment (25%)
  const teu = lead.estimatedTeu ?? 0;
  let volScore: number;
  let volReason: string;
  if (teu >= 1000) { volScore = 95; volReason = `${teu} TEU/month — Major shipper`; }
  else if (teu >= 500) { volScore = 80; volReason = `${teu} TEU/month — Large shipper`; }
  else if (teu >= 200) { volScore = 65; volReason = `${teu} TEU/month — Medium shipper`; }
  else if (teu >= 100) { volScore = 50; volReason = `${teu} TEU/month — Small regular`; }
  else if (teu >= 50) { volScore = 35; volReason = `${teu} TEU/month — Occasional`; }
  else if (teu > 0) { volScore = 20; volReason = `${teu} TEU/month — Minimal`; }
  else { volScore = 15; volReason = "No volume commitment stated"; }
  const volumeCommitment = { score: volScore, reasoning: volReason };

  // 3. Industry Risk (20%)
  const indScore = matchIndustry(lead.industry);
  const industryRisk = { score: indScore, reasoning: `Industry "${lead.industry ?? "Unknown"}" — risk score ${indScore}` };

  // 4. Information Quality (25%)
  let infoScore = 0;
  const reasons: string[] = [];
  if (lead.contactEmail) { infoScore += 20; reasons.push("Email"); }
  if (lead.contactPhone) { infoScore += 15; reasons.push("Phone"); }
  if (lead.jobTitle) { infoScore += 15; reasons.push("Job title"); }
  if (lead.companyName && lead.companyName.length > 5) { infoScore += 15; reasons.push("Company name"); }
  if (lead.estimatedTeu && lead.estimatedTeu > 0) { infoScore += 15; reasons.push("TEU estimate"); }
  if (lead.tradeLane) { infoScore += 10; reasons.push("Trade lane"); }
  if (lead.country) { infoScore += 10; reasons.push("Country"); }
  const infoQuality = { score: Math.min(infoScore, 100), reasoning: `${reasons.length}/7 data points: ${reasons.join(", ")}` };

  // Composite
  const composite = Math.round(
    countryRisk.score * 0.30 +
    volumeCommitment.score * 0.25 +
    industryRisk.score * 0.20 +
    infoQuality.score * 0.25
  );

  // Risk rating + terms
  let riskRating: CreditAssessment["riskRating"];
  let paymentTermsDays: number;
  let creditMultiplier: number;

  if (composite >= 75) {
    riskRating = "green";
    paymentTermsDays = 30;
    creditMultiplier = 2;
  } else if (composite >= 50) {
    riskRating = "amber";
    paymentTermsDays = 30;
    creditMultiplier = 1;
  } else {
    riskRating = "red";
    paymentTermsDays = 14;
    creditMultiplier = 0;
  }

  const suggestedCreditLimit = Math.round(annualEstRevenue * creditMultiplier);

  return {
    countryRisk,
    volumeCommitment,
    industryRisk,
    infoQuality,
    composite,
    riskRating,
    suggestedCreditLimit,
    paymentTermsDays,
    methodology: "4-factor deterministic",
  };
}

// ════════════════════════════════════════════════════════════
// PART 3: Grounded Rate Calculation
// ════════════════════════════════════════════════════════════

export interface RateLineItem {
  chargeCode: string;
  chargeName: string;
  chargeType: string;
  basis: string;
  unitPrice: number; // cents
  quantity: number;
  totalPrice: number; // cents
  currency: string;
}

export interface GroundedRateResult {
  tradeLane: string;
  tradeLaneName: string;
  transitTimeDays: number;
  lineItems: RateLineItem[];
  totalPerContainer: number; // cents
  currency: string;
  source: string;
}

// Port → trade lane mapping for rate lookup
const PORT_TO_TRADE_LANE: Record<string, string[]> = {
  AEJEA: ["GIS", "IGX", "FEG"],
  AEDXB: ["GIS", "IGX", "FEG"],
  INMUN: ["GIS", "IGX"],
  INNSA: ["GIS", "IGX"],
  INCHE: ["GIS", "IGX"],
  INCCU: ["GIS"],
  LKCMB: ["GIS", "IAS"],
  SGSIN: ["IAS", "FEG"],
  CNSHA: ["FEG", "AE-EB", "IAS"],
  CNNGB: ["FEG", "AE-EB", "IAS"],
  KRPUS: ["FEG", "IAS"],
  JPTYO: ["FEG"],
};

const TRANSIT_DAYS: Record<string, number> = {
  GIS: 4, IGX: 5, FEG: 15, IAS: 5, "AE-EB": 30, "AE-WB": 28, MED: 12, AFX: 18,
};

const TRADE_LANE_NAMES: Record<string, string> = {
  GIS: "Gulf-ISC Service", IGX: "Indo-Gulf Express", FEG: "Far East-Gulf",
  IAS: "Intra-Asia", "AE-EB": "Asia-Europe Eastbound", "AE-WB": "Asia-Europe Westbound",
  MED: "Mediterranean Loop", AFX: "Africa Express",
};

function findTradeLane(originPort: string, destPort: string): string | null {
  const originLanes = PORT_TO_TRADE_LANE[originPort] ?? [];
  const destLanes = PORT_TO_TRADE_LANE[destPort] ?? [];
  // Find intersection
  for (const lane of originLanes) {
    if (destLanes.includes(lane)) return lane;
  }
  // If no intersection, use origin's first lane
  return originLanes[0] ?? destLanes[0] ?? null;
}

export async function calculateGroundedRate(
  tenantId: string,
  originPort: string,
  destinationPort: string,
  containerSize: string,
  containerType: string
): Promise<GroundedRateResult | null> {
  const tradeLane = findTradeLane(originPort, destinationPort);
  if (!tradeLane) return null;

  // Fetch base rate from cpm_tariff_rates
  const now = new Date();
  const tariffRows = await db
    .select({
      chargeCode: cpmTariffRates.chargeCode,
      chargeName: cpmTariffRates.chargeName,
      chargeType: cpmTariffRates.chargeType,
      basis: cpmTariffRates.basis,
      unitPrice: cpmTariffRates.unitPrice,
      currency: cpmTariffRates.currency,
    })
    .from(cpmTariffRates)
    .innerJoin(cpmTariffs, eq(cpmTariffs.id, cpmTariffRates.tariffId))
    .where(
      and(
        eq(cpmTariffs.tenantId, tenantId),
        eq(cpmTariffs.tradeLane, tradeLane),
        eq(cpmTariffs.status, "active"),
        lte(cpmTariffs.effectiveFrom, now),
        or(isNull(cpmTariffs.effectiveTo), gte(cpmTariffs.effectiveTo, now)),
        or(
          eq(cpmTariffRates.containerSize, containerSize),
          isNull(cpmTariffRates.containerSize)
        ),
        isNull(cpmTariffs.deletedAt),
        isNull(cpmTariffRates.deletedAt)
      )
    );

  // Fetch surcharges
  const surchargeRows = await db
    .select({
      surchargeCode: cpmSurcharges.surchargeCode,
      surchargeName: cpmSurcharges.surchargeName,
      surchargeType: cpmSurcharges.surchargeType,
      calculationBasis: cpmSurcharges.calculationBasis,
      amount: cpmSurcharges.amount,
      percentage: cpmSurcharges.percentage,
      containerSize: cpmSurcharges.containerSize,
    })
    .from(cpmSurcharges)
    .where(
      and(
        eq(cpmSurcharges.tenantId, tenantId),
        eq(cpmSurcharges.isActive, true),
        lte(cpmSurcharges.effectiveFrom, now),
        or(isNull(cpmSurcharges.effectiveTo), gte(cpmSurcharges.effectiveTo, now)),
        or(
          eq(cpmSurcharges.tradeLane, tradeLane),
          isNull(cpmSurcharges.tradeLane),
          eq(cpmSurcharges.applicableTo, "all")
        ),
        or(
          eq(cpmSurcharges.originPort, originPort),
          isNull(cpmSurcharges.originPort)
        ),
        or(
          eq(cpmSurcharges.destinationPort, destinationPort),
          isNull(cpmSurcharges.destinationPort)
        ),
        or(
          eq(cpmSurcharges.containerSize, containerSize),
          isNull(cpmSurcharges.containerSize)
        ),
        isNull(cpmSurcharges.deletedAt)
      )
    );

  // Build line items
  const lineItems: RateLineItem[] = [];
  let baseOceanFreight = 0;

  for (const row of tariffRows) {
    const item: RateLineItem = {
      chargeCode: row.chargeCode,
      chargeName: row.chargeName,
      chargeType: row.chargeType,
      basis: row.basis,
      unitPrice: row.unitPrice,
      quantity: 1,
      totalPrice: row.unitPrice,
      currency: row.currency ?? "USD",
    };
    lineItems.push(item);
    if (row.chargeType === "ocean_freight") baseOceanFreight = row.unitPrice;
  }

  for (const row of surchargeRows) {
    // Skip if container size doesn't match
    if (row.containerSize && row.containerSize !== containerSize) continue;

    let amount = row.amount ?? 0;
    if (row.calculationBasis === "percentage" && row.percentage) {
      amount = Math.round(baseOceanFreight * (row.percentage / 10000)); // percentage stored as basis points
    }

    lineItems.push({
      chargeCode: row.surchargeCode,
      chargeName: row.surchargeName,
      chargeType: "surcharge",
      basis: "per_container",
      unitPrice: amount,
      quantity: 1,
      totalPrice: amount,
      currency: "USD",
    });
  }

  const totalPerContainer = lineItems.reduce((sum, li) => sum + li.totalPrice, 0);

  return {
    tradeLane,
    tradeLaneName: TRADE_LANE_NAMES[tradeLane] ?? tradeLane,
    transitTimeDays: TRANSIT_DAYS[tradeLane] ?? 7,
    lineItems,
    totalPerContainer,
    currency: "USD",
    source: "cpm_tariff_rates + cpm_surcharges",
  };
}

// ════════════════════════════════════════════════════════════
// PART 4: Sanctions Pre-Screening
// ════════════════════════════════════════════════════════════

export interface SanctionsResult {
  result: "CLEAR" | "HIT" | "POSSIBLE_MATCH";
  matchedLists: string[];
  matchConfidence: number;
  screeningNotes: string;
  screeningSource: "local_reference_list";
  screeningId: string;
}

const SANCTIONED_COUNTRIES = new Set(["IR", "KP", "SY", "CU"]);
const ELEVATED_COUNTRIES = new Set(["RU", "BY", "IQ", "YE", "LB", "VE", "MM", "SD", "SO", "LY"]);

const SANCTIONED_PATTERNS: { pattern: RegExp; list: string; entity: string }[] = [
  { pattern: /\bIRISL\b/i, list: "OFAC_SDN", entity: "Islamic Republic of Iran Shipping Lines" },
  { pattern: /\bIRGC\b|islamic\s+revolutionary\s+guard/i, list: "OFAC_SDN", entity: "IRGC" },
  { pattern: /\bhizb[ao]llah\b|hezbollah/i, list: "OFAC_SDN", entity: "Hizballah" },
  { pattern: /\bKSTC\b|korea\s+shipping/i, list: "OFAC_SDN", entity: "Korea Shipping and Trading" },
  { pattern: /\bOcean\s+Maritime\s+Management\b/i, list: "OFAC_SDN", entity: "Ocean Maritime Management" },
  { pattern: /\bCOSCO\s+Shipping\s+Tanker\s+\(Dalian\)\b/i, list: "OFAC_SDN", entity: "COSCO Shipping Tanker (Dalian)" },
  { pattern: /\bSyria.*Petroleum\b|SPC\b/i, list: "EU_CONSOLIDATED", entity: "Syrian Petroleum Company" },
  { pattern: /\bRosneft\b/i, list: "EU_CONSOLIDATED", entity: "Rosneft" },
  { pattern: /\bGazprom\s+Neft\b/i, list: "EU_CONSOLIDATED", entity: "Gazprom Neft" },
  { pattern: /\bWagner\b/i, list: "EU_CONSOLIDATED", entity: "Wagner Group" },
];

export function screenSanctionsLocal(companyName: string, country: string): SanctionsResult {
  const screeningId = `SCR-${Date.now().toString(36).toUpperCase()}`;
  const countryUpper = country?.toUpperCase() ?? "";

  // Check entity name against patterns
  for (const { pattern, list, entity } of SANCTIONED_PATTERNS) {
    if (pattern.test(companyName)) {
      return {
        result: "HIT",
        matchedLists: [list],
        matchConfidence: 95,
        screeningNotes: `Company name matches sanctioned entity "${entity}" on ${list}`,
        screeningSource: "local_reference_list",
        screeningId,
      };
    }
  }

  // Check sanctioned countries
  if (SANCTIONED_COUNTRIES.has(countryUpper)) {
    return {
      result: "HIT",
      matchedLists: ["OFAC_COUNTRY", "EU_COUNTRY", "UN_COUNTRY"],
      matchConfidence: 90,
      screeningNotes: `Country ${countryUpper} is under comprehensive sanctions`,
      screeningSource: "local_reference_list",
      screeningId,
    };
  }

  // Elevated risk countries
  if (ELEVATED_COUNTRIES.has(countryUpper)) {
    return {
      result: "POSSIBLE_MATCH",
      matchedLists: ["ELEVATED_JURISDICTION"],
      matchConfidence: 40,
      screeningNotes: `Country ${countryUpper} is an elevated-risk jurisdiction. Enhanced due diligence recommended.`,
      screeningSource: "local_reference_list",
      screeningId,
    };
  }

  return {
    result: "CLEAR",
    matchedLists: [],
    matchConfidence: 0,
    screeningNotes: `No matches found. Company "${companyName}" and country ${countryUpper || "Unknown"} cleared against local reference sanctions list.`,
    screeningSource: "local_reference_list",
    screeningId,
  };
}

// ════════════════════════════════════════════════════════════
// PART 5: Voyage Reference Data (E2E-18 Grounding)
// ════════════════════════════════════════════════════════════

// ── Port-to-Port Distances (Nautical Miles) ──

const PORT_DISTANCES: Record<string, Record<string, number>> = {
  AEJEA: { INMUN: 820, INNSA: 1100, LKCMB: 1880, INCCU: 3030, SGSIN: 3400, CNSHA: 5600, CNNGB: 5500, AEDXB: 15, KRPUS: 5800, JPTYO: 6400 },
  INMUN: { AEJEA: 820, INNSA: 280, LKCMB: 780, INCCU: 1930, SGSIN: 2580, CNSHA: 4780 },
  INNSA: { AEJEA: 1100, INMUN: 280, LKCMB: 780, INCCU: 1650, SGSIN: 2300, CNSHA: 4500 },
  LKCMB: { AEJEA: 1880, INMUN: 780, INNSA: 780, INCCU: 1150, SGSIN: 1560, CNSHA: 3760 },
  INCCU: { AEJEA: 3030, INMUN: 1930, INNSA: 1650, LKCMB: 1150, SGSIN: 1640, CNSHA: 3800 },
  SGSIN: { AEJEA: 3400, INMUN: 2580, INNSA: 2300, LKCMB: 1560, INCCU: 1640, CNSHA: 2200, CNNGB: 2100, HKHKG: 1450, KRPUS: 2600 },
  CNSHA: { AEJEA: 5600, SGSIN: 2200, HKHKG: 820, CNNGB: 100, KRPUS: 520, JPTYO: 1050 },
  CNNGB: { CNSHA: 100, SGSIN: 2100, HKHKG: 750, KRPUS: 450, JPTYO: 1000 },
  HKHKG: { CNSHA: 820, SGSIN: 1450, CNNGB: 750, KRPUS: 1100, LKCMB: 2700 },
  KRPUS: { CNSHA: 520, SGSIN: 2600, JPTYO: 650, HKHKG: 1100, AEJEA: 5800 },
  JPTYO: { CNSHA: 1050, KRPUS: 650, AEJEA: 6400, SGSIN: 3000 },
};

// ── Port Turnaround Hours by Call Purpose ──

const TURNAROUND_HOURS: Record<string, number> = {
  loading: 24,
  discharge: 18,
  loading_discharge: 36,
  both: 36,
  transshipment: 12,
  bunkering: 8,
};

// ── Known Ports (validation) ──

export const KNOWN_PORTS: Record<string, string> = {
  AEJEA: "Jebel Ali",
  AEDXB: "Dubai",
  AESHJ: "Sharjah",
  AERKT: "Ras Al Khaimah",
  QADOH: "Doha",
  QAHAM: "Hamad Port",
  SADMM: "Dammam",
  SAJED: "Jeddah",
  OMMUS: "Muscat",
  OMSLL: "Salalah",
  BHMNA: "Mina Salman",
  KWKWI: "Kuwait",
  IQBSR: "Basra",
  INMUN: "Mundra",
  INNSA: "Nhava Sheva (JNPT)",
  INCHE: "Chennai",
  INCCU: "Kolkata",
  INTUT: "Tuticorin",
  INCOK: "Kochi",
  INBLR: "Bengaluru ICD",
  PKKAR: "Karachi",
  PKQCT: "Qasim",
  BDCGP: "Chittagong",
  LKCMB: "Colombo",
  SGSIN: "Singapore",
  MYPKG: "Port Klang",
  MYTPP: "Tanjung Pelepas",
  THBKK: "Bangkok (Laem Chabang)",
  VNSGN: "Ho Chi Minh City",
  VNHPH: "Haiphong",
  PHMNS: "Manila",
  IDTPP: "Tanjung Priok (Jakarta)",
  CNSHA: "Shanghai",
  CNNGB: "Ningbo",
  CNTAO: "Qingdao",
  CNSZX: "Shenzhen (Shekou)",
  CNYTN: "Yantian",
  HKHKG: "Hong Kong",
  TWHSQ: "Kaohsiung",
  KRPUS: "Busan",
  KRINC: "Incheon",
  JPTYO: "Tokyo",
  JPYOK: "Yokohama",
  JPOSA: "Osaka",
  JPKOB: "Kobe",
  NLRTM: "Rotterdam",
  DEHAM: "Hamburg",
  BEANR: "Antwerp",
  GBFXT: "Felixstowe",
  GBLGP: "London Gateway",
  FRFOS: "Fos-sur-Mer",
  ITGOA: "Genoa",
  GRPIR: "Piraeus",
  TRIST: "Istanbul (Ambarli)",
  ESLPA: "Las Palmas",
  ESVLC: "Valencia",
  USNYC: "New York/New Jersey",
  USSAV: "Savannah",
  USHOU: "Houston",
  USLAX: "Los Angeles",
  USLGB: "Long Beach",
  PAONX: "Colon (Panama)",
  JMKIN: "Kingston",
  BRSSZ: "Santos",
  AUPKL: "Port Kembla",
  AUMEL: "Melbourne",
  NZAKL: "Auckland",
  ZADUR: "Durban",
  MAPTM: "Tanger Med",
  DJJIB: "Djibouti",
  EGPSD: "Port Said",
};

export function validatePortCode(portCode: string): { valid: boolean; portName?: string; error?: string } {
  const name = KNOWN_PORTS[portCode];
  if (name) return { valid: true, portName: name };
  return { valid: false, error: `Unknown port code "${portCode}". Not in reference port database.` };
}

// ── Port Distance Lookup ──

export function getPortDistance(fromPort: string, toPort: string): number | null {
  return PORT_DISTANCES[fromPort]?.[toPort] ?? PORT_DISTANCES[toPort]?.[fromPort] ?? null;
}

// ── ETA Calculator ──

interface PortCall {
  portCode: string;
  portName: string;
  callPurpose: string;
}

export interface CalculatedPortETA {
  portCode: string;
  portName: string;
  callPurpose: string;
  arrivalEta: Date;
  departureEtd: Date;
  transitFromPrevNm: number | null;
  transitHours: number | null;
  turnaroundHours: number;
}

export function calculatePortRotationETAs(
  departureDate: Date,
  ports: PortCall[],
  vesselSpeedKnots: number = 14
): CalculatedPortETA[] {
  const result: CalculatedPortETA[] = [];
  let currentTime = new Date(departureDate);

  for (let i = 0; i < ports.length; i++) {
    const port = ports[i];
    const turnaroundHours = TURNAROUND_HOURS[port.callPurpose] ?? 24;

    if (i === 0) {
      // First port: vessel is already there, just add turnaround
      result.push({
        portCode: port.portCode,
        portName: port.portName,
        callPurpose: port.callPurpose,
        arrivalEta: new Date(currentTime),
        departureEtd: new Date(currentTime.getTime() + turnaroundHours * 3600000),
        transitFromPrevNm: null,
        transitHours: null,
        turnaroundHours,
      });
      currentTime = new Date(currentTime.getTime() + turnaroundHours * 3600000);
    } else {
      const prevPort = ports[i - 1].portCode;
      const distance = getPortDistance(prevPort, port.portCode);
      const transitHours = distance ? distance / vesselSpeedKnots : 48; // fallback 48h if unknown
      const transitMs = transitHours * 3600000;

      const arrivalEta = new Date(currentTime.getTime() + transitMs);
      const departureEtd = new Date(arrivalEta.getTime() + turnaroundHours * 3600000);

      result.push({
        portCode: port.portCode,
        portName: port.portName,
        callPurpose: port.callPurpose,
        arrivalEta,
        departureEtd,
        transitFromPrevNm: distance,
        transitHours: Math.round(transitHours * 10) / 10,
        turnaroundHours,
      });
      currentTime = departureEtd;
    }
  }

  return result;
}

// ── Vessel Specs for Physics Validation ──

interface VesselClassSpec {
  minSpeed: number;
  maxSpeed: number;
  dailyConsumptionMin: number; // MT
  dailyConsumptionMax: number; // MT
}

const VESSEL_CLASS_SPECS: Record<string, VesselClassSpec> = {
  feeder:          { minSpeed: 8,  maxSpeed: 16, dailyConsumptionMin: 12, dailyConsumptionMax: 30 },
  feedrmax:        { minSpeed: 10, maxSpeed: 18, dailyConsumptionMin: 18, dailyConsumptionMax: 40 },
  handysize:       { minSpeed: 10, maxSpeed: 20, dailyConsumptionMin: 25, dailyConsumptionMax: 55 },
  container:       { minSpeed: 10, maxSpeed: 22, dailyConsumptionMin: 25, dailyConsumptionMax: 70 },
  sub_panamax:     { minSpeed: 12, maxSpeed: 22, dailyConsumptionMin: 40, dailyConsumptionMax: 80 },
  panamax:         { minSpeed: 12, maxSpeed: 24, dailyConsumptionMin: 50, dailyConsumptionMax: 100 },
  neo_panamax:     { minSpeed: 14, maxSpeed: 24, dailyConsumptionMin: 60, dailyConsumptionMax: 120 },
  ulcv:            { minSpeed: 14, maxSpeed: 24, dailyConsumptionMin: 80, dailyConsumptionMax: 180 },
};

export interface PhysicsValidation {
  speedValid: boolean;
  consumptionValid: boolean;
  distanceSpeedConsistent: boolean;
  warnings: string[];
}

export function validateVesselPhysics(
  vesselType: string,
  speedActual: number,
  fuelConsumedMt: number,
  distanceTraveled: number,
  hoursElapsed: number = 24
): PhysicsValidation {
  const spec = VESSEL_CLASS_SPECS[vesselType] ?? VESSEL_CLASS_SPECS.container;
  const warnings: string[] = [];

  // Speed validation
  const speedValid = speedActual >= spec.minSpeed && speedActual <= spec.maxSpeed;
  if (!speedValid) {
    warnings.push(`Speed ${speedActual} kn outside ${vesselType} range (${spec.minSpeed}-${spec.maxSpeed} kn)`);
  }

  // Consumption validation (scale by hours)
  const scaleFactor = hoursElapsed / 24;
  const minConsumption = spec.dailyConsumptionMin * scaleFactor * 0.7; // 30% tolerance
  const maxConsumption = spec.dailyConsumptionMax * scaleFactor * 1.3;
  const consumptionValid = fuelConsumedMt >= minConsumption && fuelConsumedMt <= maxConsumption;
  if (!consumptionValid) {
    warnings.push(`Consumption ${fuelConsumedMt} MT outside expected range (${minConsumption.toFixed(1)}-${maxConsumption.toFixed(1)} MT for ${hoursElapsed}h)`);
  }

  // Distance-speed consistency: expected distance = speed * hours
  const expectedDistance = speedActual * hoursElapsed;
  const distanceRatio = distanceTraveled > 0 ? expectedDistance / distanceTraveled : 1;
  const distanceSpeedConsistent = distanceRatio >= 0.7 && distanceRatio <= 1.3;
  if (!distanceSpeedConsistent) {
    warnings.push(`Distance ${distanceTraveled} NM inconsistent with speed ${speedActual} kn × ${hoursElapsed}h = ${expectedDistance.toFixed(0)} NM expected`);
  }

  return { speedValid, consumptionValid, distanceSpeedConsistent, warnings };
}

// ── ECA & War Risk Zone Geofencing ──

interface ZoneBoundary {
  name: string;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

const ECA_ZONES: ZoneBoundary[] = [
  { name: "North Sea ECA", latMin: 48, latMax: 62, lonMin: -5, lonMax: 13 },
  { name: "Baltic Sea ECA", latMin: 53, latMax: 66, lonMin: 9, lonMax: 30 },
  { name: "North American ECA", latMin: 25, latMax: 50, lonMin: -130, lonMax: -60 },
  { name: "US Caribbean ECA", latMin: 18, latMax: 30, lonMin: -90, lonMax: -60 },
  { name: "Singapore Strait", latMin: 0.5, latMax: 1.8, lonMin: 103, lonMax: 104.5 },
  { name: "China Domestic ECA", latMin: 20, latMax: 40, lonMin: 110, lonMax: 125 },
];

const WAR_RISK_ZONES: ZoneBoundary[] = [
  { name: "Red Sea / Gulf of Aden (Houthi)", latMin: 10, latMax: 16, lonMin: 40, lonMax: 52 },
  { name: "Black Sea", latMin: 40, latMax: 47, lonMin: 27, lonMax: 42 },
  { name: "Persian Gulf (elevated)", latMin: 24, latMax: 30, lonMin: 48, lonMax: 56 },
];

function isInZone(lat: number, lon: number, zone: ZoneBoundary): boolean {
  return lat >= zone.latMin && lat <= zone.latMax && lon >= zone.lonMin && lon <= zone.lonMax;
}

export interface ZoneCheckResult {
  inEcaZone: boolean;
  ecaZoneName: string | null;
  fuelRequirement: string;
  inWarZone: boolean;
  warZoneName: string | null;
  insuranceImpact: string;
}

export function checkPositionInZones(lat: number, lon: number): ZoneCheckResult {
  let ecaMatch: string | null = null;
  let warMatch: string | null = null;

  for (const zone of ECA_ZONES) {
    if (isInZone(lat, lon, zone)) {
      ecaMatch = zone.name;
      break;
    }
  }

  for (const zone of WAR_RISK_ZONES) {
    if (isInZone(lat, lon, zone)) {
      warMatch = zone.name;
      break;
    }
  }

  return {
    inEcaZone: ecaMatch !== null,
    ecaZoneName: ecaMatch,
    fuelRequirement: ecaMatch ? "0.1% sulphur (VLSFO/LSMGO required)" : "Standard (0.5% sulphur VLSFO)",
    inWarZone: warMatch !== null,
    warZoneName: warMatch,
    insuranceImpact: warMatch ? `Additional War Risk Premium required for ${warMatch}` : "Standard P&I cover",
  };
}
