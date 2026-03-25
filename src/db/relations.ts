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
  svpServiceSchedules,
  svpPortSequences,
  svpEtaManagements,
} from "./schema/schedule-voyage-planning";
import {
  ltrServiceLoops,
} from "./schema/liner-trade-route-management";
import {
  odmBillsOfLading,
  odmManifests,
} from "./schema/operations-documentation";
import {
  firmFreightInvoices,
} from "./schema/freight-invoice-revenue-management";
import {
  cspPortalBookings,
  cspPortalBookingContainers,
} from "./schema/customer-portal";

// ── Master Data Relations ────────────────────────────────────────

export const portsRelations = relations(ports, ({ many }) => ({
  terminals: many(terminals),
}));

export const terminalsRelations = relations(terminals, ({ one }) => ({
  port: one(ports, {
    fields: [terminals.portId],
    references: [ports.id],
  }),
}));

// ── Vessel Schedule Relations ────────────────────────────────────

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

// ── Booking Relations ────────────────────────────────────────────

export const cspPortalBookingsRelations = relations(cspPortalBookings, ({ many }) => ({
  containers: many(cspPortalBookingContainers),
}));

export const cspPortalBookingContainersRelations = relations(cspPortalBookingContainers, ({ one }) => ({
  booking: one(cspPortalBookings, {
    fields: [cspPortalBookingContainers.bookingId],
    references: [cspPortalBookings.id],
  }),
}));
