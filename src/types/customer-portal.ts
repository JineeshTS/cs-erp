import type {
  cspPortalBookings,
  cspPortalBookingContainers,
  cspShipmentTracking,
  cspTrackingEvents,
  cspPortalDocuments,
  cspPortalInvoices,
  cspPortalPayments,
  cspPaymentTransactions,
} from "@/db/schema";

export type PortalBooking = typeof cspPortalBookings.$inferSelect;
export type NewPortalBooking = typeof cspPortalBookings.$inferInsert;

export type PortalBookingContainer = typeof cspPortalBookingContainers.$inferSelect;
export type NewPortalBookingContainer = typeof cspPortalBookingContainers.$inferInsert;

export type ShipmentTracking = typeof cspShipmentTracking.$inferSelect;
export type NewShipmentTracking = typeof cspShipmentTracking.$inferInsert;

export type TrackingEvent = typeof cspTrackingEvents.$inferSelect;
export type NewTrackingEvent = typeof cspTrackingEvents.$inferInsert;

export type PortalDocument = typeof cspPortalDocuments.$inferSelect;
export type NewPortalDocument = typeof cspPortalDocuments.$inferInsert;

export type PortalInvoice = typeof cspPortalInvoices.$inferSelect;
export type NewPortalInvoice = typeof cspPortalInvoices.$inferInsert;

export type PortalPayment = typeof cspPortalPayments.$inferSelect;
export type NewPortalPayment = typeof cspPortalPayments.$inferInsert;

export type PaymentTransaction = typeof cspPaymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof cspPaymentTransactions.$inferInsert;
