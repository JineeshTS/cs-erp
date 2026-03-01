import type {
  apvmVendorMasters,
  apvmPurchaseOrders,
  apvmVendorInvoices,
  apvmThreeWayMatches,
  apvmPaymentSchedules,
  apvmVendorReconciliations,
  apvmOcrExtractions,
  apvmSpendAnalytics,
} from "@/db/schema";

export type ApvmVendorMaster = typeof apvmVendorMasters.$inferSelect;
export type ApvmVendorMasterInsert = typeof apvmVendorMasters.$inferInsert;

export type ApvmPurchaseOrder = typeof apvmPurchaseOrders.$inferSelect;
export type ApvmPurchaseOrderInsert = typeof apvmPurchaseOrders.$inferInsert;

export type ApvmVendorInvoice = typeof apvmVendorInvoices.$inferSelect;
export type ApvmVendorInvoiceInsert = typeof apvmVendorInvoices.$inferInsert;

export type ApvmThreeWayMatch = typeof apvmThreeWayMatches.$inferSelect;
export type ApvmThreeWayMatchInsert = typeof apvmThreeWayMatches.$inferInsert;

export type ApvmPaymentSchedule = typeof apvmPaymentSchedules.$inferSelect;
export type ApvmPaymentScheduleInsert = typeof apvmPaymentSchedules.$inferInsert;

export type ApvmVendorReconciliation = typeof apvmVendorReconciliations.$inferSelect;
export type ApvmVendorReconciliationInsert = typeof apvmVendorReconciliations.$inferInsert;

export type ApvmOcrExtraction = typeof apvmOcrExtractions.$inferSelect;
export type ApvmOcrExtractionInsert = typeof apvmOcrExtractions.$inferInsert;

export type ApvmSpendAnalytic = typeof apvmSpendAnalytics.$inferSelect;
export type ApvmSpendAnalyticInsert = typeof apvmSpendAnalytics.$inferInsert;
