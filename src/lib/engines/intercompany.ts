/**
 * Intercompany Mirror Journal Engine (ERP-117)
 *
 * Creates mirror journal entries for intercompany transactions:
 * one debit for the source entity, one credit for the target entity.
 * Both records are inserted into mels_intercompany_transactions.
 */

import { db } from "@/lib/db";
import { melsIntercompanyTransactions } from "@/db/schema";
import { generateNextNumber } from "@/lib/number-sequence";

export interface MirrorJournalResult {
  debitTransactionId: string;
  creditTransactionId: string;
  debitTransactionNumber: string;
  creditTransactionNumber: string;
  amount: number;
  currency: string;
}

/**
 * Create a mirror journal: debit on source entity, credit on target entity.
 * Both transactions share a reference link via metadata.
 */
export async function createMirrorJournal(
  tenantId: string,
  sourceEntityId: string,
  targetEntityId: string,
  amount: number,
  currency: string,
  description: string
): Promise<MirrorJournalResult> {
  const debitNumber = await generateNextNumber("intercompany", tenantId);
  const creditNumber = await generateNextNumber("intercompany", tenantId);
  const amountCents = Math.round(amount * 100);

  // Insert debit (source entity owes)
  const [debit] = await db
    .insert(melsIntercompanyTransactions)
    .values({
      tenantId,
      transactionNumber: debitNumber,
      sourceEntityId,
      targetEntityId,
      transactionType: "debit",
      description: `[DEBIT] ${description}`,
      currency,
      amount: amountCents,
      status: "draft",
      metadata: { mirrorRef: creditNumber, direction: "debit" },
    })
    .returning();

  // Insert credit (target entity is owed)
  const [credit] = await db
    .insert(melsIntercompanyTransactions)
    .values({
      tenantId,
      transactionNumber: creditNumber,
      sourceEntityId: targetEntityId,
      targetEntityId: sourceEntityId,
      transactionType: "credit",
      description: `[CREDIT] ${description}`,
      currency,
      amount: amountCents,
      status: "draft",
      metadata: { mirrorRef: debitNumber, direction: "credit" },
    })
    .returning();

  return {
    debitTransactionId: debit.id,
    creditTransactionId: credit.id,
    debitTransactionNumber: debitNumber,
    creditTransactionNumber: creditNumber,
    amount,
    currency,
  };
}
