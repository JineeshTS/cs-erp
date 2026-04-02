/**
 * Event handlers for sales & CRM cross-module wiring.
 *
 * LEAD_CREATED → notification for lead assignment
 * LEAD_QUALIFIED → notification for sales follow-up
 * LEAD_CONVERTED → notification for onboarding kick-off
 * OPPORTUNITY_CREATED → follow-up activity + notification for qualification review
 * OPPORTUNITY_WON → follow-up activity + notification for contract/booking prep
 * OPPORTUNITY_LOST → follow-up activity + notification for loss analysis
 * QUOTATION_CREATED → notification for pricing review
 * QUOTATION_APPROVED → notification for customer delivery
 * QUOTATION_ACCEPTED → follow-up activity + notification for contract preparation
 * CONTRACT_CREATED → notification for legal/compliance review
 * CONTRACT_ACTIVATED → notification for rate loading
 * CUSTOMER_CREATED → notification for KYC/credit onboarding
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications, scmOpportunityActivities } from "@/db/schema";

eventBus.on("LEAD_CREATED", async (event) => {
  try {
    console.log(`[SalesHandler] LEAD_CREATED: ${event.data.companyName} from ${event.data.source}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `New Lead: ${event.data.companyName}`,
      body: `Lead captured from ${event.data.source}.${event.data.tradeLane ? ` Trade lane: ${event.data.tradeLane}.` : ""} AI scoring and territory assignment in progress.`,
      entityType: "lead",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle LEAD_CREATED:", err);
  }
});

eventBus.on("LEAD_QUALIFIED", async (event) => {
  try {
    console.log(`[SalesHandler] LEAD_QUALIFIED: ${event.data.companyName}, score: ${event.data.qualificationScore}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.data.assignedTo ?? event.userId,
      channel: "in_app",
      title: `Lead Qualified: ${event.data.companyName}`,
      body: `Lead qualified with score ${event.data.qualificationScore}/100. Ready for opportunity conversion and sales outreach.`,
      entityType: "lead",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle LEAD_QUALIFIED:", err);
  }
});

eventBus.on("LEAD_CONVERTED", async (event) => {
  try {
    console.log(`[SalesHandler] LEAD_CONVERTED: ${event.data.companyName} → customer ${event.data.customerId}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Lead Converted: ${event.data.companyName}`,
      body: `Lead converted to customer. KYC verification, credit assessment, and portal provisioning initiated.`,
      entityType: "lead",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle LEAD_CONVERTED:", err);
  }
});

eventBus.on("OPPORTUNITY_CREATED", async (event) => {
  try {
    console.log(`[SalesHandler] OPPORTUNITY_CREATED: ${event.data.opportunityName} for customer ${event.data.customerId}`);

    // 1. Create qualification call activity
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    await db.insert(scmOpportunityActivities).values({
      tenantId: event.tenantId,
      opportunityId: event.entityId,
      activityType: "call",
      subject: `Qualification call — ${event.data.opportunityName}`,
      description: `Initial qualification call to assess cargo requirements, volume, and route feasibility.${event.data.tradeLane ? ` Trade lane: ${event.data.tradeLane}.` : ""}`,
      activityDate: event.timestamp,
      dueDate,
      status: "planned",
    });

    // 2. Notification
    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `New Opportunity: ${event.data.opportunityName}`,
      body: `Opportunity created.${event.data.expectedRevenue ? ` Expected revenue: $${event.data.expectedRevenue.toLocaleString()}.` : ""}${event.data.tradeLane ? ` Trade lane: ${event.data.tradeLane}.` : ""} Qualification call scheduled.`,
      entityType: "opportunity",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle OPPORTUNITY_CREATED:", err);
  }
});

eventBus.on("OPPORTUNITY_WON", async (event) => {
  try {
    console.log(`[SalesHandler] OPPORTUNITY_WON: ${event.data.opportunityName}`);

    // 1. Create contract preparation activity
    const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
    await db.insert(scmOpportunityActivities).values({
      tenantId: event.tenantId,
      opportunityId: event.entityId,
      activityType: "task",
      subject: `Contract preparation — ${event.data.opportunityName}`,
      description: `Deal closed. Prepare contract with negotiated rates and terms.${event.data.expectedRevenue ? ` Revenue: $${event.data.expectedRevenue.toLocaleString()}.` : ""} Coordinate with legal for compliance review.`,
      activityDate: event.timestamp,
      dueDate,
      status: "planned",
    });

    // 2. Notification
    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Opportunity Won: ${event.data.opportunityName}`,
      body: `Deal closed successfully.${event.data.expectedRevenue ? ` Revenue: $${event.data.expectedRevenue.toLocaleString()}.` : ""} Contract preparation task created.`,
      entityType: "opportunity",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle OPPORTUNITY_WON:", err);
  }
});

eventBus.on("OPPORTUNITY_LOST", async (event) => {
  try {
    console.log(`[SalesHandler] OPPORTUNITY_LOST: ${event.data.opportunityName} — reason: ${event.data.lostReason ?? "N/A"}`);

    // 1. Create loss analysis activity
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.insert(scmOpportunityActivities).values({
      tenantId: event.tenantId,
      opportunityId: event.entityId,
      activityType: "task",
      subject: `Loss analysis — ${event.data.opportunityName}`,
      description: `Deal lost.${event.data.lostReason ? ` Reason: ${event.data.lostReason}.` : ""}${event.data.competitorName ? ` Competitor: ${event.data.competitorName}.` : ""} Conduct loss review and identify win-back opportunities.`,
      activityDate: event.timestamp,
      dueDate,
      status: "planned",
    });

    // 2. Notification
    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Opportunity Lost: ${event.data.opportunityName}`,
      body: `Deal lost.${event.data.lostReason ? ` Reason: ${event.data.lostReason}.` : ""}${event.data.competitorName ? ` Competitor: ${event.data.competitorName}.` : ""} Loss analysis task created.`,
      entityType: "opportunity",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle OPPORTUNITY_LOST:", err);
  }
});

eventBus.on("QUOTATION_CREATED", async (event) => {
  try {
    console.log(`[SalesHandler] QUOTATION_CREATED: ${event.data.quotationNumber} (${event.data.originPort} → ${event.data.destinationPort})`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Quotation Created: ${event.data.quotationNumber}`,
      body: `Rate quotation generated for ${event.data.originPort} → ${event.data.destinationPort}.${event.data.totalAmount ? ` Total: $${event.data.totalAmount.toLocaleString()}.` : ""} Pricing review and approval required.`,
      entityType: "rate_quotation",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle QUOTATION_CREATED:", err);
  }
});

eventBus.on("QUOTATION_APPROVED", async (event) => {
  try {
    console.log(`[SalesHandler] QUOTATION_APPROVED: ${event.data.quotationNumber} by ${event.data.approvedBy}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Quotation Approved: ${event.data.quotationNumber}`,
      body: `Rate quotation approved. Ready for delivery to customer and acceptance tracking.`,
      entityType: "rate_quotation",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle QUOTATION_APPROVED:", err);
  }
});

eventBus.on("QUOTATION_ACCEPTED", async (event) => {
  try {
    console.log(`[SalesHandler] QUOTATION_ACCEPTED: ${event.data.quotationNumber}`);

    // 1. Create contract drafting activity (only if linked to opportunity)
    if (event.data.opportunityId) {
      const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
      await db.insert(scmOpportunityActivities).values({
        tenantId: event.tenantId,
        opportunityId: event.data.opportunityId,
        activityType: "task",
        subject: `Draft contract — quotation ${event.data.quotationNumber} accepted`,
        description: `Customer accepted quotation ${event.data.quotationNumber}. Prepare contract with accepted rates and load into booking system.`,
        activityDate: event.timestamp,
        dueDate,
        status: "planned",
      });
    }

    // 2. Notification
    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Quotation Accepted: ${event.data.quotationNumber}`,
      body: `Customer accepted the quotation. Contract creation and rate loading into booking system required.${event.data.opportunityId ? " Contract drafting task created." : ""}`,
      entityType: "rate_quotation",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle QUOTATION_ACCEPTED:", err);
  }
});

eventBus.on("CONTRACT_CREATED", async (event) => {
  try {
    console.log(`[SalesHandler] CONTRACT_CREATED: ${event.data.contractNumber} (${event.data.contractType})`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Contract Created: ${event.data.contractNumber}`,
      body: `${event.data.contractType} contract "${event.data.contractName}" created. Compliance validation and digital signature workflow initiated.`,
      entityType: "contract",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle CONTRACT_CREATED:", err);
  }
});

eventBus.on("CONTRACT_ACTIVATED", async (event) => {
  try {
    console.log(`[SalesHandler] CONTRACT_ACTIVATED: ${event.data.contractNumber} (${event.data.startDate} to ${event.data.endDate})`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Contract Activated: ${event.data.contractNumber}`,
      body: `Contract "${event.data.contractName}" is now active (${event.data.startDate} to ${event.data.endDate}). Rates loaded into booking system.`,
      entityType: "contract",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle CONTRACT_ACTIVATED:", err);
  }
});

eventBus.on("CUSTOMER_CREATED", async (event) => {
  try {
    console.log(`[SalesHandler] CUSTOMER_CREATED: ${event.data.customerCode} — ${event.data.companyName}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `New Customer: ${event.data.companyName}`,
      body: `Customer ${event.data.customerCode} (${event.data.customerType}) created. KYC screening, credit assessment, and portal provisioning initiated.`,
      entityType: "customer",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[SalesHandler] Failed to handle CUSTOMER_CREATED:", err);
  }
});
