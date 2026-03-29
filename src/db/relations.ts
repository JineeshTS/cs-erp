/**
 * ERP-020: Drizzle ORM relations definitions.
 * Enables db.query.xxx.findMany({ with: { yyy: true } }) eager loading.
 * Covers the top 30 cross-module relationships.
 */
import { relations } from "drizzle-orm";
import {
  ports,
  terminals,
  vessels,
  customers,
  commodities,
  containerTypes,
} from "./schema/master-data-management";
import {
  capVesselSchedules,
  capPortRotations,
  capSpaceControls,
  capTradeAllocations,
  capLoadingLists,
  capBayPlans,
  capStowagePlans,
} from "./schema/capacity-voyage-management";
import {
  generatedVoyages,
  voyagePortCalls,
  proformaTemplates,
  proformaPortCalls,
} from "./schema/schedule-engine";
import {
  odmBillsOfLading,
  odmBlContainers,
  odmBlCharges,
  odmManifests,
  odmManifestItems,
} from "./schema/operations-documentation";
import {
  firmFreightInvoices,
  firmInvoiceLineItems,
  firmDebitCreditNotes,
} from "./schema/freight-invoice-revenue-management";
import {
  cspPortalBookings,
  cspPortalBookingContainers,
  cspShipmentTracking,
  cspPortalDocuments,
  cspPortalInvoices,
  cspPortalPayments,
  cspTrackingEvents,
} from "./schema/customer-portal";
import {
  scmCustomers,
  scmCustomerContacts,
  scmOpportunities,
  scmRateQuotations,
  scmContracts,
} from "./schema/sales-crm";
import {
  vtmPlannedMaintenanceTasks,
  vtmSurveyTrackings,
} from "./schema/vessel-technical-management";
import {
  arccCustomerAccounts,
  arccCreditLimits,
} from "./schema/accounts-receivable-credit-control";

// ── 1-2: Ports ↔ Terminals ─────────────────────────────────────

export const portsRelations = relations(ports, ({ many }) => ({
  terminals: many(terminals),
  proformaPortCalls: many(proformaPortCalls),
  voyagePortCalls: many(voyagePortCalls),
}));

export const terminalsRelations = relations(terminals, ({ one }) => ({
  port: one(ports, {
    fields: [terminals.portId],
    references: [ports.id],
  }),
}));

// ── 3: Vessels → maintenance, surveys, voyages ──────────────────

export const vesselsRelations = relations(vessels, ({ many }) => ({
  maintenanceTasks: many(vtmPlannedMaintenanceTasks),
  surveys: many(vtmSurveyTrackings),
  voyages: many(generatedVoyages),
}));

export const vtmPlannedMaintenanceTasksRelations = relations(vtmPlannedMaintenanceTasks, ({ one }) => ({
  vessel: one(vessels, {
    fields: [vtmPlannedMaintenanceTasks.vesselId],
    references: [vessels.id],
  }),
}));

export const vtmSurveyTrackingsRelations = relations(vtmSurveyTrackings, ({ one }) => ({
  vessel: one(vessels, {
    fields: [vtmSurveyTrackings.vesselId],
    references: [vessels.id],
  }),
}));

// ── 4-8: Schedule Engine ────────────────────────────────────────

export const generatedVoyagesRelations = relations(generatedVoyages, ({ one, many }) => ({
  vessel: one(vessels, {
    fields: [generatedVoyages.vesselId],
    references: [vessels.id],
  }),
  template: one(proformaTemplates, {
    fields: [generatedVoyages.templateId],
    references: [proformaTemplates.id],
  }),
  portCalls: many(voyagePortCalls),
}));

export const voyagePortCallsRelations = relations(voyagePortCalls, ({ one }) => ({
  voyage: one(generatedVoyages, {
    fields: [voyagePortCalls.voyageId],
    references: [generatedVoyages.id],
  }),
  port: one(ports, {
    fields: [voyagePortCalls.portId],
    references: [ports.id],
  }),
}));

export const proformaPortCallsRelations = relations(proformaPortCalls, ({ one }) => ({
  template: one(proformaTemplates, {
    fields: [proformaPortCalls.templateId],
    references: [proformaTemplates.id],
  }),
  port: one(ports, {
    fields: [proformaPortCalls.portId],
    references: [ports.id],
  }),
}));

export const proformaTemplatesRelations = relations(proformaTemplates, ({ many }) => ({
  portCalls: many(proformaPortCalls),
  generatedVoyages: many(generatedVoyages),
}));

// ── 9-13: Vessel Schedule & Capacity ────────────────────────────

export const capVesselSchedulesRelations = relations(capVesselSchedules, ({ many }) => ({
  portRotations: many(capPortRotations),
  spaceControls: many(capSpaceControls),
  tradeAllocations: many(capTradeAllocations),
  loadingLists: many(capLoadingLists),
  bayPlans: many(capBayPlans),
}));

export const capPortRotationsRelations = relations(capPortRotations, ({ one }) => ({
  vesselSchedule: one(capVesselSchedules, {
    fields: [capPortRotations.vesselScheduleId],
    references: [capVesselSchedules.id],
  }),
}));

export const capSpaceControlsRelations = relations(capSpaceControls, ({ one }) => ({
  vesselSchedule: one(capVesselSchedules, {
    fields: [capSpaceControls.vesselScheduleId],
    references: [capVesselSchedules.id],
  }),
}));

export const capBayPlansRelations = relations(capBayPlans, ({ one, many }) => ({
  vesselSchedule: one(capVesselSchedules, {
    fields: [capBayPlans.vesselScheduleId],
    references: [capVesselSchedules.id],
  }),
  stowagePlans: many(capStowagePlans),
}));

export const capStowagePlansRelations = relations(capStowagePlans, ({ one }) => ({
  bayPlan: one(capBayPlans, {
    fields: [capStowagePlans.bayPlanId],
    references: [capBayPlans.id],
  }),
}));

// ── 14-19: Customer Portal (Booking chain) ──────────────────────

export const cspPortalBookingsRelations = relations(cspPortalBookings, ({ many }) => ({
  containers: many(cspPortalBookingContainers),
  tracking: many(cspShipmentTracking),
  documents: many(cspPortalDocuments),
  invoices: many(cspPortalInvoices),
}));

export const cspPortalBookingContainersRelations = relations(cspPortalBookingContainers, ({ one }) => ({
  booking: one(cspPortalBookings, {
    fields: [cspPortalBookingContainers.bookingId],
    references: [cspPortalBookings.id],
  }),
}));

export const cspShipmentTrackingRelations = relations(cspShipmentTracking, ({ one, many }) => ({
  booking: one(cspPortalBookings, {
    fields: [cspShipmentTracking.bookingId],
    references: [cspPortalBookings.id],
  }),
  events: many(cspTrackingEvents),
}));

export const cspTrackingEventsRelations = relations(cspTrackingEvents, ({ one }) => ({
  tracking: one(cspShipmentTracking, {
    fields: [cspTrackingEvents.trackingId],
    references: [cspShipmentTracking.id],
  }),
}));

export const cspPortalInvoicesRelations = relations(cspPortalInvoices, ({ one, many }) => ({
  booking: one(cspPortalBookings, {
    fields: [cspPortalInvoices.bookingId],
    references: [cspPortalBookings.id],
  }),
  payments: many(cspPortalPayments),
}));

export const cspPortalPaymentsRelations = relations(cspPortalPayments, ({ one }) => ({
  invoice: one(cspPortalInvoices, {
    fields: [cspPortalPayments.invoiceId],
    references: [cspPortalInvoices.id],
  }),
}));

// ── 20-23: Sales CRM ────────────────────────────────────────────

export const scmCustomersRelations = relations(scmCustomers, ({ many }) => ({
  contacts: many(scmCustomerContacts),
  opportunities: many(scmOpportunities),
  quotations: many(scmRateQuotations),
  contracts: many(scmContracts),
}));

export const scmCustomerContactsRelations = relations(scmCustomerContacts, ({ one }) => ({
  customer: one(scmCustomers, {
    fields: [scmCustomerContacts.customerId],
    references: [scmCustomers.id],
  }),
}));

export const scmOpportunitiesRelations = relations(scmOpportunities, ({ one }) => ({
  customer: one(scmCustomers, {
    fields: [scmOpportunities.customerId],
    references: [scmCustomers.id],
  }),
}));

// ── 24-26: Operations Documentation ─────────────────────────────

export const odmBillsOfLadingRelations = relations(odmBillsOfLading, ({ many }) => ({
  containers: many(odmBlContainers),
  charges: many(odmBlCharges),
  manifestItems: many(odmManifestItems),
}));

export const odmBlContainersRelations = relations(odmBlContainers, ({ one }) => ({
  billOfLading: one(odmBillsOfLading, {
    fields: [odmBlContainers.blId],
    references: [odmBillsOfLading.id],
  }),
}));

export const odmBlChargesRelations = relations(odmBlCharges, ({ one }) => ({
  billOfLading: one(odmBillsOfLading, {
    fields: [odmBlCharges.blId],
    references: [odmBillsOfLading.id],
  }),
}));

// ── 27-28: Freight Invoices ─────────────────────────────────────

export const firmFreightInvoicesRelations = relations(firmFreightInvoices, ({ many }) => ({
  lineItems: many(firmInvoiceLineItems),
  debitCreditNotes: many(firmDebitCreditNotes),
}));

export const firmInvoiceLineItemsRelations = relations(firmInvoiceLineItems, ({ one }) => ({
  invoice: one(firmFreightInvoices, {
    fields: [firmInvoiceLineItems.invoiceId],
    references: [firmFreightInvoices.id],
  }),
}));

// ── 29-30: AR Credit Control ────────────────────────────────────

export const arccCustomerAccountsRelations = relations(arccCustomerAccounts, ({ many }) => ({
  creditLimits: many(arccCreditLimits),
}));

export const arccCreditLimitsRelations = relations(arccCreditLimits, ({ one }) => ({
  account: one(arccCustomerAccounts, {
    fields: [arccCreditLimits.accountId],
    references: [arccCustomerAccounts.id],
  }),
}));
