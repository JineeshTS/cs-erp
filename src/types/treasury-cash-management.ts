import type {
  tcmBankAccounts,
  tcmCashPositions,
  tcmBankReconciliations,
  tcmCashPoolingSweeps,
  tcmFxHedgingExposures,
  tcmLettersOfCredit,
  tcmBankGuarantees,
  tcmIntercompanyLoans,
} from "@/db/schema";

export type TcmBankAccount = typeof tcmBankAccounts.$inferSelect;
export type NewTcmBankAccount = typeof tcmBankAccounts.$inferInsert;

export type TcmCashPosition = typeof tcmCashPositions.$inferSelect;
export type NewTcmCashPosition = typeof tcmCashPositions.$inferInsert;

export type TcmBankReconciliation = typeof tcmBankReconciliations.$inferSelect;
export type NewTcmBankReconciliation = typeof tcmBankReconciliations.$inferInsert;

export type TcmCashPoolingSweep = typeof tcmCashPoolingSweeps.$inferSelect;
export type NewTcmCashPoolingSweep = typeof tcmCashPoolingSweeps.$inferInsert;

export type TcmFxHedgingExposure = typeof tcmFxHedgingExposures.$inferSelect;
export type NewTcmFxHedgingExposure = typeof tcmFxHedgingExposures.$inferInsert;

export type TcmLetterOfCredit = typeof tcmLettersOfCredit.$inferSelect;
export type NewTcmLetterOfCredit = typeof tcmLettersOfCredit.$inferInsert;

export type TcmBankGuarantee = typeof tcmBankGuarantees.$inferSelect;
export type NewTcmBankGuarantee = typeof tcmBankGuarantees.$inferInsert;

export type TcmIntercompanyLoan = typeof tcmIntercompanyLoans.$inferSelect;
export type NewTcmIntercompanyLoan = typeof tcmIntercompanyLoans.$inferInsert;
