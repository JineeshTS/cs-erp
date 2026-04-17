/**
 * CRM Tool Library (D-006 Phase 4)
 *
 * 14 tool implementations for E2E-01 (Lead-to-Quote),
 * E2E-02 (Negotiation-to-Contract), E2E-03 (Customer Onboarding).
 *
 * Real DB operations on: scm_leads, scm_rate_quotations,
 * scm_contracts, scm_customers, scm_opportunities,
 * scm_onboarding_checklists, acm_sanctions_screenings
 */

import { db } from "@/lib/db";
import {
  scmLeads,
  scmRateQuotations,
  scmQuotationLineItems,
  scmContracts,
  scmCustomers,
  scmOpportunities,
  scmOnboardingChecklists,
  acmSanctionsScreenings,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  computeGroundedLeadScore,
  computeGroundedCreditScore,
  calculateGroundedRate,
  screenSanctionsLocal,
} from "@/lib/shipping-reference-data";
import {
  createEntityBinding,
  resolveEntityInFlow,
} from "../entity-binding-service";
import type { ToolCallContext, ToolCallResult } from "./types";

// ═══════════════════════════════════════════════════════════
// E2E-01: LEAD-TO-QUOTE
// ═══════════════════════════════════════════════════════════

export async function executeScoreLead(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const leadBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_leads"
  );
  const leadId = (input.leadId as string) || leadBinding?.entityId;

  if (!leadId) {
    return { result: { error: "No lead found in flow to score" } };
  }

  // Fetch lead record
  const [lead] = await db
    .select()
    .from(scmLeads)
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .limit(1);

  if (!lead) {
    return { result: { error: "Lead not found in database" } };
  }

  // Compute grounded BANT-S score
  const breakdown = await computeGroundedLeadScore(lead, tenantId);

  const newStatus =
    breakdown.composite >= 70
      ? "qualified"
      : breakdown.composite >= 40
        ? "contacted"
        : "new";

  const existingMeta = (lead.metadata as Record<string, unknown>) ?? {};

  const [updated] = await db
    .update(scmLeads)
    .set({
      qualificationScore: breakdown.composite,
      status: newStatus,
      metadata: {
        ...existingMeta,
        scoreBreakdown: {
          budget: breakdown.budget,
          authority: breakdown.authority,
          need: breakdown.need,
          timeline: breakdown.timeline,
          shippingFit: breakdown.shippingFit,
        },
        qualification: breakdown.qualification,
        methodology: breakdown.methodology,
        scoredAt: new Date().toISOString(),
        scoredBy: "bants_scoring_engine",
      },
    })
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .returning();

  return {
    result: {
      leadId,
      compositeScore: breakdown.composite,
      methodology: "BANT-S",
      breakdown: {
        budget: `${breakdown.budget.score}/100 — ${breakdown.budget.reasoning}`,
        authority: `${breakdown.authority.score}/100 — ${breakdown.authority.reasoning}`,
        need: `${breakdown.need.score}/100 — ${breakdown.need.reasoning}`,
        timeline: `${breakdown.timeline.score}/100 — ${breakdown.timeline.reasoning}`,
        shippingFit: `${breakdown.shippingFit.score}/100 — ${breakdown.shippingFit.reasoning}`,
      },
      qualification: breakdown.qualification,
      status: newStatus,
    },
    entityTable: "scm_leads",
    entityId: leadId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

export async function executeGetLeadDetails(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const leadBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_leads"
  );
  const leadId = (input.leadId as string) || leadBinding?.entityId;

  if (!leadId) {
    return { result: { error: "No lead found" } };
  }

  const [lead] = await db
    .select()
    .from(scmLeads)
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .limit(1);

  if (!lead) {
    return { result: { error: "Lead not found in database" } };
  }

  return { result: lead as unknown as Record<string, unknown> };
}

export async function executeCalculateCreditScore(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const leadBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_leads"
  );
  const leadId = (input.leadId as string) || leadBinding?.entityId;

  if (!leadId) {
    return { result: { error: "No lead found for credit assessment" } };
  }

  // Fetch lead record
  const [lead] = await db
    .select()
    .from(scmLeads)
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .limit(1);

  if (!lead) {
    return { result: { error: "Lead not found in database" } };
  }

  // Estimate annual revenue from TEU and base rate ($750 * 12 months)
  const teu = lead.estimatedTeu ?? 0;
  const annualEstRevenue = teu * 12 * 75000; // cents

  // Compute grounded credit score
  const assessment = computeGroundedCreditScore(lead, annualEstRevenue);

  const existingMeta = (lead.metadata as Record<string, unknown>) ?? {};

  const [updated] = await db
    .update(scmLeads)
    .set({
      metadata: {
        ...existingMeta,
        creditAssessment: {
          composite: assessment.composite,
          riskRating: assessment.riskRating,
          suggestedCreditLimit: assessment.suggestedCreditLimit,
          paymentTermsDays: assessment.paymentTermsDays,
          methodology: assessment.methodology,
          breakdown: {
            countryRisk: assessment.countryRisk,
            volumeCommitment: assessment.volumeCommitment,
            industryRisk: assessment.industryRisk,
            infoQuality: assessment.infoQuality,
          },
          assessedAt: new Date().toISOString(),
          assessedBy: "deterministic_credit_engine",
        },
      },
    })
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .returning();

  return {
    result: {
      leadId,
      creditScore: assessment.composite,
      riskRating: assessment.riskRating,
      suggestedCreditLimit: `$${(assessment.suggestedCreditLimit / 100).toLocaleString()}`,
      paymentTermsDays: assessment.paymentTermsDays,
      methodology: assessment.methodology,
      breakdown: {
        countryRisk: `${assessment.countryRisk.score}/100 — ${assessment.countryRisk.reasoning}`,
        volumeCommitment: `${assessment.volumeCommitment.score}/100 — ${assessment.volumeCommitment.reasoning}`,
        industryRisk: `${assessment.industryRisk.score}/100 — ${assessment.industryRisk.reasoning}`,
        infoQuality: `${assessment.infoQuality.score}/100 — ${assessment.infoQuality.reasoning}`,
      },
    },
    entityTable: "scm_leads",
    entityId: leadId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

export async function executeScreenSanctions(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const leadBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_leads"
  );
  const leadId = (input.leadId as string) || leadBinding?.entityId;

  if (!leadId) {
    return { result: { error: "No lead found for sanctions screening" } };
  }

  // Fetch lead record
  const [lead] = await db
    .select()
    .from(scmLeads)
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .limit(1);

  if (!lead) {
    return { result: { error: "Lead not found in database" } };
  }

  // Run grounded sanctions pre-screening
  const screening = screenSanctionsLocal(
    lead.companyName,
    lead.country ?? ""
  );

  const existingMeta = (lead.metadata as Record<string, unknown>) ?? {};

  const [updated] = await db
    .update(scmLeads)
    .set({
      metadata: {
        ...existingMeta,
        sanctionsScreening: {
          result: screening.result,
          matchedLists: screening.matchedLists,
          matchConfidence: screening.matchConfidence,
          screeningNotes: screening.screeningNotes,
          screeningSource: screening.screeningSource,
          screeningId: screening.screeningId,
          screenedAt: new Date().toISOString(),
          screenedBy: "local_sanctions_engine",
        },
      },
    })
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .returning();

  return {
    result: {
      leadId,
      screeningResult: screening.result,
      matchedLists: screening.matchedLists,
      matchConfidence: screening.matchConfidence,
      screeningNotes: screening.screeningNotes,
      screeningSource: screening.screeningSource,
    },
    entityTable: "scm_leads",
    entityId: leadId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

export async function executeCalculateRate(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, userId } = ctx;

  const originPort = (input.originPort as string) ?? "AEJEA";
  const destinationPort = (input.destinationPort as string) ?? "INMUN";
  const containerSize = (input.containerSize as string) ?? "40";
  const containerType = (input.containerType as string) ?? "dry";
  const estimatedTeu = (input.estimatedTeu as number) ?? 1;
  const validityDays = (input.validityDays as number) ?? 30;

  // Calculate grounded rate from tariff DB
  const rateResult = await calculateGroundedRate(
    tenantId, originPort, destinationPort, containerSize, containerType
  );

  if (!rateResult || rateResult.lineItems.length === 0) {
    return { result: { error: `No tariff data found for ${originPort} → ${destinationPort} (${containerSize}')` } };
  }

  const validFrom = new Date();
  const validTo = new Date();
  validTo.setDate(validTo.getDate() + validityDays);

  const oppBinding = await resolveEntityInFlow(
    flowInstanceId, tenantId, "scm_opportunities"
  );
  const oppData = oppBinding?.entityData as Record<string, unknown> | null;

  // Create quotation header
  const [quotation] = await db
    .insert(scmRateQuotations)
    .values({
      tenantId,
      quotationNumber: `QT-${Date.now().toString(36).toUpperCase()}`,
      customerId: (oppData?.customerId as string) ?? tenantId,
      opportunityId: oppBinding?.entityId,
      salesRepId: userId,
      originPort,
      destinationPort,
      tradeLane: rateResult.tradeLaneName,
      containerType,
      containerSize,
      estimatedTeu,
      totalAmount: rateResult.totalPerContainer,
      currency: rateResult.currency,
      validFrom,
      validTo,
      transitTimeDays: rateResult.transitTimeDays,
      status: "draft",
      metadata: {
        rateBreakdown: rateResult.lineItems.map(li => ({
          code: li.chargeCode,
          name: li.chargeName,
          amount: li.unitPrice,
        })),
        totalPerContainer: rateResult.totalPerContainer,
        tradeLane: rateResult.tradeLane,
        source: rateResult.source,
        calculatedBy: "tariff_rate_engine",
        calculatedAt: new Date().toISOString(),
      },
    })
    .returning();

  // Create line items
  if (quotation) {
    const lineItemValues = rateResult.lineItems.map(li => ({
      tenantId,
      quotationId: quotation.id,
      chargeCode: li.chargeCode,
      chargeName: li.chargeName,
      chargeType: li.chargeType,
      basis: li.basis,
      unitPrice: li.unitPrice,
      quantity: li.quantity,
      totalPrice: li.totalPrice,
      currency: li.currency,
      isMandatory: true,
      createdBy: userId,
      updatedBy: userId,
    }));

    await db.insert(scmQuotationLineItems).values(lineItemValues);
  }

  return {
    result: {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      tradeLane: rateResult.tradeLaneName,
      transitTimeDays: rateResult.transitTimeDays,
      rateBreakdown: rateResult.lineItems.map(li => ({
        charge: li.chargeName,
        amount: `$${(li.unitPrice / 100).toFixed(2)}`,
      })),
      totalPerContainer: `$${(rateResult.totalPerContainer / 100).toFixed(2)}`,
      totalForVolume: `$${((rateResult.totalPerContainer * estimatedTeu) / 100).toFixed(2)}`,
      source: rateResult.source,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
    },
    entityTable: "scm_rate_quotations",
    entityId: quotation.id,
    entityAction: "create",
    entityData: quotation as unknown as Record<string, unknown>,
  };
}

export async function executeLookupTariffRates(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId } = ctx;
  const originPort = (input.originPort as string) ?? "AEJEA";
  const destinationPort = (input.destinationPort as string) ?? "INMUN";
  const containerSize = (input.containerSize as string) ?? "40";

  const rateResult = await calculateGroundedRate(
    tenantId, originPort, destinationPort, containerSize, "dry"
  );

  if (!rateResult) {
    return { result: { error: `No tariff data for ${originPort} → ${destinationPort}` } };
  }

  return {
    result: {
      tradeLane: rateResult.tradeLaneName,
      transitTimeDays: rateResult.transitTimeDays,
      lineItems: rateResult.lineItems.map(li => ({
        charge: li.chargeName,
        code: li.chargeCode,
        type: li.chargeType,
        amount: `$${(li.unitPrice / 100).toFixed(2)}`,
      })),
      totalPerContainer: `$${(rateResult.totalPerContainer / 100).toFixed(2)}`,
      currency: rateResult.currency,
      source: rateResult.source,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// E2E-02: NEGOTIATION-TO-CONTRACT
// ═══════════════════════════════════════════════════════════

export async function executeAnalyzeCustomerResponse(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const oppBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_opportunities"
  );
  const oppId = (input.opportunityId as string) || oppBinding?.entityId;

  if (!oppId) {
    return { result: { error: "No opportunity found for response analysis" } };
  }

  const sentiment = (input.sentiment as string) ?? "neutral";
  const priceObjection = (input.priceObjection as boolean) ?? false;
  const competitorMention = (input.competitorMention as string) ?? null;
  const urgencyLevel = (input.urgencyLevel as string) ?? "medium";
  const keyRequirements = (input.keyRequirements as string[]) ?? [];

  // H8 fix: merge metadata instead of overwriting
  const existingOpp = oppBinding?.entityData as Record<string, unknown> | null;
  const existingMeta = (existingOpp?.metadata as Record<string, unknown>) ?? {};

  const [updated] = await db
    .update(scmOpportunities)
    .set({
      metadata: {
        ...existingMeta,
        responseAnalysis: {
          sentiment,
          priceObjection,
          competitorMention,
          urgencyLevel,
          keyRequirements,
          analyzedAt: new Date().toISOString(),
          analyzedBy: "ai_negotiation_agent",
        },
      },
      updatedAt: new Date(),
    })
    .where(
      and(eq(scmOpportunities.id, oppId), eq(scmOpportunities.tenantId, tenantId))
    )
    .returning();

  return {
    result: {
      opportunityId: oppId,
      sentiment,
      priceObjection,
      competitorMention,
      urgencyLevel,
      keyRequirements,
    },
    entityTable: "scm_opportunities",
    entityId: oppId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

export async function executeGenerateNegotiationStrategy(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const oppBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_opportunities"
  );
  const oppId = (input.opportunityId as string) || oppBinding?.entityId;

  if (!oppId) {
    return { result: { error: "No opportunity found for strategy generation" } };
  }

  const strategy = (input.strategy as string) ?? "value_based";
  const maxDiscount = (input.maxDiscountPercent as number) ?? 5;
  const alternativeOffers = (input.alternativeOffers as string[]) ?? [];
  const walkAwayThreshold = (input.walkAwayThreshold as number) ?? 0;
  const bundlingOptions = (input.bundlingOptions as string[]) ?? [];

  // H8 fix: merge metadata instead of overwriting
  const existingOppStrat = oppBinding?.entityData as Record<string, unknown> | null;
  const existingMetaStrat = (existingOppStrat?.metadata as Record<string, unknown>) ?? {};

  const [updated] = await db
    .update(scmOpportunities)
    .set({
      metadata: {
        ...existingMetaStrat,
        negotiationStrategy: {
          strategy,
          maxDiscountPercent: maxDiscount,
          alternativeOffers,
          walkAwayThreshold,
          bundlingOptions,
          generatedAt: new Date().toISOString(),
          generatedBy: "ai_negotiation_agent",
        },
      },
      updatedAt: new Date(),
    })
    .where(
      and(eq(scmOpportunities.id, oppId), eq(scmOpportunities.tenantId, tenantId))
    )
    .returning();

  return {
    result: {
      opportunityId: oppId,
      strategy,
      maxDiscountPercent: maxDiscount,
      alternativeOffers,
      walkAwayThreshold,
      bundlingOptions,
    },
    entityTable: "scm_opportunities",
    entityId: oppId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

export async function executeActivateContract(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, userId } = ctx;

  const oppBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_opportunities"
  );
  const customerId =
    (input.customerId as string) ??
    ((oppBinding?.entityData as Record<string, unknown>)?.customerId as string) ??
    tenantId;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const [contract] = await db
    .insert(scmContracts)
    .values({
      tenantId,
      contractNumber: `CTR-${Date.now().toString(36).toUpperCase()}`,
      contractName: (input.contractName as string) ?? `Contract for ${customerId}`,
      customerId,
      contractType: (input.contractType as string) ?? "volume_commitment",
      status: "active",
      startDate,
      endDate,
      tradeLane: (input.tradeLane as string) ?? null,
      minimumCommitmentTeu: (input.commitmentTeu as number) ?? null,
      paymentTermsDays: (input.paymentTermsDays as number) ?? 30,
      currency: "USD",
      autoRenew: (input.autoRenew as boolean) ?? false,
      metadata: {
        activatedBy: userId,
        activatedAt: new Date().toISOString(),
        opportunityId: oppBinding?.entityId,
        terms: input.terms,
      },
    })
    .returning();

  if (contract) {
    await createEntityBinding({
      tenantId,
      stepInstanceId: ctx.stepInstanceId,
      flowInstanceId,
      entityTable: "scm_contracts",
      entityId: contract.id,
      entityAction: "create",
      entityData: contract as unknown as Record<string, unknown>,
    });
  }

  return {
    result: {
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: "active",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      customerId,
    },
    entityTable: "scm_contracts",
    entityId: contract.id,
    entityAction: "create",
    entityData: contract as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// E2E-03: CUSTOMER ONBOARDING
// ═══════════════════════════════════════════════════════════

export async function executeExtractKycData(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const custBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_customers"
  );
  const customerId = (input.customerId as string) || custBinding?.entityId;

  if (!customerId) {
    return { result: { error: "No customer found for KYC extraction" } };
  }

  const companyName = (input.companyName as string) ?? "";
  const registrationNumber = (input.registrationNumber as string) ?? "";
  const taxId = (input.taxId as string) ?? "";
  const incorporationCountry = (input.incorporationCountry as string) ?? "";
  const beneficialOwners = (input.beneficialOwners as string[]) ?? [];
  const riskLevel = (input.riskLevel as string) ?? "standard";

  // H8 fix: merge metadata instead of overwriting
  const existingCust = custBinding?.entityData as Record<string, unknown> | null;
  const existingCustMeta = (existingCust?.metadata as Record<string, unknown>) ?? {};

  const [updated] = await db
    .update(scmCustomers)
    .set({
      metadata: {
        ...existingCustMeta,
        kyc: {
          companyName,
          registrationNumber,
          taxId,
          incorporationCountry,
          beneficialOwners,
          riskLevel,
          extractedAt: new Date().toISOString(),
          extractedBy: "ai_kyc_agent",
        },
      },
      updatedAt: new Date(),
    })
    .where(
      and(eq(scmCustomers.id, customerId), eq(scmCustomers.tenantId, tenantId))
    )
    .returning();

  return {
    result: {
      customerId,
      companyName,
      registrationNumber,
      taxId,
      incorporationCountry,
      beneficialOwners,
      riskLevel,
    },
    entityTable: "scm_customers",
    entityId: customerId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

export async function executeValidateDocuments(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const custBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_customers"
  );
  const customerId = (input.customerId as string) || custBinding?.entityId;

  if (!customerId) {
    return { result: { error: "No customer found for document validation" } };
  }

  const documents = (input.documents as Array<Record<string, unknown>>) ?? [];
  const allValid = documents.every((d) => d.valid !== false);
  const validationSummary = documents.map((d) => ({
    type: d.documentType ?? "unknown",
    valid: d.valid ?? true,
    expiryDate: d.expiryDate ?? null,
    issues: d.issues ?? [],
  }));

  // H8 fix: merge metadata instead of overwriting
  const existingCustDoc = custBinding?.entityData as Record<string, unknown> | null;
  const existingCustDocMeta = (existingCustDoc?.metadata as Record<string, unknown>) ?? {};

  const [updated] = await db
    .update(scmCustomers)
    .set({
      metadata: {
        ...existingCustDocMeta,
        documentValidation: {
          allValid,
          documents: validationSummary,
          validatedAt: new Date().toISOString(),
          validatedBy: "ai_document_validator",
        },
      },
      updatedAt: new Date(),
    })
    .where(
      and(eq(scmCustomers.id, customerId), eq(scmCustomers.tenantId, tenantId))
    )
    .returning();

  return {
    result: {
      customerId,
      allValid,
      documentsChecked: validationSummary.length,
      validationSummary,
    },
    entityTable: "scm_customers",
    entityId: customerId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

export async function executeScreenEntity(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId } = ctx;

  const entityName = (input.entityName as string) ?? "";
  const entityType = (input.entityType as string) ?? "entity";
  const entityId = (input.entityId as string) ?? null;
  const entityTable = (input.entityTable as string) ?? "scm_customers";

  const listsChecked = (input.listsChecked as string[]) ?? [
    "OFAC_SDN",
    "EU_CONSOLIDATED",
    "UN_CONSOLIDATED",
  ];
  const matchStatus = (input.matchStatus as string) ?? "clear";
  const riskScore = (input.riskScore as number) ?? 0;

  const [screening] = await db
    .insert(acmSanctionsScreenings)
    .values({
      tenantId,
      screeningRef: `SANC-${Date.now().toString(36).toUpperCase()}`,
      entityName,
      entityType,
      entityId,
      entityTable,
      screeningType: "onboarding",
      listsChecked,
      matchStatus,
      matchDetails: (input.matchDetails as Record<string, unknown>) ?? {},
      riskScore,
      status: "completed",
      metadata: {
        screenedAt: new Date().toISOString(),
        screenedBy: "ai_sanctions_agent",
      },
    })
    .returning();

  return {
    result: {
      screeningId: screening.id,
      screeningRef: screening.screeningRef,
      entityName,
      matchStatus,
      riskScore,
      listsChecked,
    },
    entityTable: "acm_sanctions_screenings",
    entityId: screening.id,
    entityAction: "create",
    entityData: screening as unknown as Record<string, unknown>,
  };
}

export async function executeCheckPepStatus(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId } = ctx;

  const personName = (input.personName as string) ?? "";
  const country = (input.country as string) ?? "";
  const isPep = (input.isPep as boolean) ?? false;
  const pepLevel = (input.pepLevel as string) ?? "none";
  const pepDetails = (input.pepDetails as string) ?? "";

  const [screening] = await db
    .insert(acmSanctionsScreenings)
    .values({
      tenantId,
      screeningRef: `PEP-${Date.now().toString(36).toUpperCase()}`,
      entityName: personName,
      entityType: "individual",
      screeningType: "pep_check",
      listsChecked: ["PEP_DATABASE", "NATIONAL_REGISTERS"],
      matchStatus: isPep ? "match" : "clear",
      matchDetails: { pepLevel, pepDetails, country },
      riskScore: isPep ? 75 : 5,
      status: "completed",
      metadata: {
        checkedAt: new Date().toISOString(),
        checkedBy: "ai_pep_checker",
      },
    })
    .returning();

  return {
    result: {
      screeningId: screening.id,
      personName,
      country,
      isPep,
      pepLevel,
      pepDetails,
    },
    entityTable: "acm_sanctions_screenings",
    entityId: screening.id,
    entityAction: "create",
    entityData: screening as unknown as Record<string, unknown>,
  };
}

export async function executeAssessCountryRisk(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const custBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_customers"
  );
  const customerId = (input.customerId as string) || custBinding?.entityId;

  const country = (input.country as string) ?? "";
  const riskLevel = (input.riskLevel as string) ?? "standard";
  const riskFactors = (input.riskFactors as string[]) ?? [];
  const sanctionsPrograms = (input.sanctionsPrograms as string[]) ?? [];
  const fatfStatus = (input.fatfStatus as string) ?? "compliant";
  const cpiScore = (input.cpiScore as number) ?? 50;

  if (customerId) {
    // H8 fix: merge metadata instead of overwriting
    const existingCustRisk = custBinding?.entityData as Record<string, unknown> | null;
    const existingCustRiskMeta = (existingCustRisk?.metadata as Record<string, unknown>) ?? {};

    await db
      .update(scmCustomers)
      .set({
        metadata: {
          ...existingCustRiskMeta,
          countryRisk: {
            country,
            riskLevel,
            riskFactors,
            sanctionsPrograms,
            fatfStatus,
            cpiScore,
            assessedAt: new Date().toISOString(),
            assessedBy: "ai_country_risk_agent",
          },
        },
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(scmCustomers.id, customerId),
          eq(scmCustomers.tenantId, tenantId)
        )
      );
  }

  return {
    result: {
      customerId,
      country,
      riskLevel,
      riskFactors,
      sanctionsPrograms,
      fatfStatus,
      cpiScore,
    },
    entityTable: customerId ? "scm_customers" : undefined,
    entityId: customerId ?? undefined,
    entityAction: customerId ? "update" : undefined,
  };
}

export async function executeCompleteOnboarding(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, userId } = ctx;

  const custBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "scm_customers"
  );
  const customerId = (input.customerId as string) || custBinding?.entityId;

  if (!customerId) {
    return { result: { error: "No customer found for onboarding completion" } };
  }

  const [checklist] = await db
    .insert(scmOnboardingChecklists)
    .values({
      tenantId,
      customerId,
      taskCategory: "complete_onboarding",
      taskName: "Full Onboarding Completion",
      status: "completed",
      assignedTo: userId,
      completedBy: userId,
      completedAt: new Date(),
      metadata: {
        kycVerified: (input.kycVerified as boolean) ?? true,
        sanctionsCleared: (input.sanctionsCleared as boolean) ?? true,
        documentsValidated: (input.documentsValidated as boolean) ?? true,
        creditApproved: (input.creditApproved as boolean) ?? true,
        completedAt: new Date().toISOString(),
        completedBy: "ai_onboarding_agent",
      },
    })
    .returning();

  // Activate the customer
  const [activatedCustomer] = await db
    .update(scmCustomers)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(
      and(eq(scmCustomers.id, customerId), eq(scmCustomers.tenantId, tenantId))
    )
    .returning();

  return {
    result: {
      customerId,
      checklistId: checklist.id,
      status: "completed",
      customerStatus: "active",
    },
    entityTable: "scm_customers",
    entityId: customerId,
    entityAction: "update",
    entityData: activatedCustomer as Record<string, unknown>,
  };
}
