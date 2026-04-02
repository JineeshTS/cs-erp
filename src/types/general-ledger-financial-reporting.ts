import type {
  glfrChartOfAccounts,
  glfrJournalEntries,
  glfrPeriodClosures,
  glfrFinancialStatements,
  glfrSegmentReports,
  glfrConsolidatedStatements,
  glfrBudgets,
  glfrVarianceAnalyses,
} from "@/db/schema";

export type GlfrChartOfAccount = typeof glfrChartOfAccounts.$inferSelect;
export type NewGlfrChartOfAccount = typeof glfrChartOfAccounts.$inferInsert;

export type GlfrJournalEntry = typeof glfrJournalEntries.$inferSelect;
export type NewGlfrJournalEntry = typeof glfrJournalEntries.$inferInsert;

export type GlfrPeriodClosure = typeof glfrPeriodClosures.$inferSelect;
export type NewGlfrPeriodClosure = typeof glfrPeriodClosures.$inferInsert;

export type GlfrFinancialStatement = typeof glfrFinancialStatements.$inferSelect;
export type NewGlfrFinancialStatement = typeof glfrFinancialStatements.$inferInsert;

export type GlfrSegmentReport = typeof glfrSegmentReports.$inferSelect;
export type NewGlfrSegmentReport = typeof glfrSegmentReports.$inferInsert;

export type GlfrConsolidatedStatement = typeof glfrConsolidatedStatements.$inferSelect;
export type NewGlfrConsolidatedStatement = typeof glfrConsolidatedStatements.$inferInsert;

export type GlfrBudget = typeof glfrBudgets.$inferSelect;
export type NewGlfrBudget = typeof glfrBudgets.$inferInsert;

export type GlfrVarianceAnalysis = typeof glfrVarianceAnalyses.$inferSelect;
export type NewGlfrVarianceAnalysis = typeof glfrVarianceAnalyses.$inferInsert;
