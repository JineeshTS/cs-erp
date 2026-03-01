import type {
  firmFreightInvoices,
  firmInvoiceLineItems,
  firmDebitCreditNotes,
  firmInvoiceAmendments,
  firmProformaInvoices,
  firmRevenueAccruals,
  firmInvoiceDisputes,
  firmDunningRuns,
  firmDunningActions,
  firmRevenueForecastEntries,
} from "@/db/schema";

export type FirmFreightInvoice = typeof firmFreightInvoices.$inferSelect;
export type FirmFreightInvoiceInsert = typeof firmFreightInvoices.$inferInsert;

export type FirmInvoiceLineItem = typeof firmInvoiceLineItems.$inferSelect;
export type FirmInvoiceLineItemInsert = typeof firmInvoiceLineItems.$inferInsert;

export type FirmDebitCreditNote = typeof firmDebitCreditNotes.$inferSelect;
export type FirmDebitCreditNoteInsert = typeof firmDebitCreditNotes.$inferInsert;

export type FirmInvoiceAmendment = typeof firmInvoiceAmendments.$inferSelect;
export type FirmInvoiceAmendmentInsert = typeof firmInvoiceAmendments.$inferInsert;

export type FirmProformaInvoice = typeof firmProformaInvoices.$inferSelect;
export type FirmProformaInvoiceInsert = typeof firmProformaInvoices.$inferInsert;

export type FirmRevenueAccrual = typeof firmRevenueAccruals.$inferSelect;
export type FirmRevenueAccrualInsert = typeof firmRevenueAccruals.$inferInsert;

export type FirmInvoiceDispute = typeof firmInvoiceDisputes.$inferSelect;
export type FirmInvoiceDisputeInsert = typeof firmInvoiceDisputes.$inferInsert;

export type FirmDunningRun = typeof firmDunningRuns.$inferSelect;
export type FirmDunningRunInsert = typeof firmDunningRuns.$inferInsert;

export type FirmDunningAction = typeof firmDunningActions.$inferSelect;
export type FirmDunningActionInsert = typeof firmDunningActions.$inferInsert;

export type FirmRevenueForecastEntry = typeof firmRevenueForecastEntries.$inferSelect;
export type FirmRevenueForecastEntryInsert = typeof firmRevenueForecastEntries.$inferInsert;
