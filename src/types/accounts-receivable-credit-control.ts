import type {
  arccCustomerAccounts,
  arccCreditLimits,
  arccAgingReports,
  arccCashApplications,
  arccCollectionWorkflows,
  arccBadDebtProvisions,
  arccPaymentPredictions,
  arccCashFlowForecasts,
} from "@/db/schema";

export type ArccCustomerAccount = typeof arccCustomerAccounts.$inferSelect;
export type ArccCustomerAccountInsert = typeof arccCustomerAccounts.$inferInsert;

export type ArccCreditLimit = typeof arccCreditLimits.$inferSelect;
export type ArccCreditLimitInsert = typeof arccCreditLimits.$inferInsert;

export type ArccAgingReport = typeof arccAgingReports.$inferSelect;
export type ArccAgingReportInsert = typeof arccAgingReports.$inferInsert;

export type ArccCashApplication = typeof arccCashApplications.$inferSelect;
export type ArccCashApplicationInsert = typeof arccCashApplications.$inferInsert;

export type ArccCollectionWorkflow = typeof arccCollectionWorkflows.$inferSelect;
export type ArccCollectionWorkflowInsert = typeof arccCollectionWorkflows.$inferInsert;

export type ArccBadDebtProvision = typeof arccBadDebtProvisions.$inferSelect;
export type ArccBadDebtProvisionInsert = typeof arccBadDebtProvisions.$inferInsert;

export type ArccPaymentPrediction = typeof arccPaymentPredictions.$inferSelect;
export type ArccPaymentPredictionInsert = typeof arccPaymentPredictions.$inferInsert;

export type ArccCashFlowForecast = typeof arccCashFlowForecasts.$inferSelect;
export type ArccCashFlowForecastInsert = typeof arccCashFlowForecasts.$inferInsert;
