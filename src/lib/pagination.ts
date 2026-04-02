import { SQL, and, or, lt, eq } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Validates and parses a cursor string (ISO 8601 date) for cursor-based pagination.
 * Returns null if cursor is undefined/empty. Throws if cursor is malformed.
 */
export function parseCursor(cursor: string | undefined | null): Date | null {
  if (!cursor) return null;

  const date = new Date(cursor);
  if (isNaN(date.getTime())) {
    throw new CursorValidationError(`Invalid cursor: "${cursor}" is not a valid date`);
  }

  return date;
}

/**
 * Compound cursor for keyset pagination on (createdAt, id).
 * Format: "ISO-date|uuid". Falls back to date-only for backward compat.
 */
export function parseCompoundCursor(cursor: string | undefined | null): { date: Date; id: string } | null {
  if (!cursor) return null;

  if (cursor.includes("|")) {
    const [dateStr, id] = cursor.split("|", 2);
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || !id) {
      throw new CursorValidationError(`Invalid compound cursor: "${cursor}"`);
    }
    return { date, id };
  }

  // Legacy date-only cursor
  const date = new Date(cursor);
  if (isNaN(date.getTime())) {
    throw new CursorValidationError(`Invalid cursor: "${cursor}" is not a valid date`);
  }
  return { date, id: "" };
}

/**
 * Build a keyset pagination WHERE clause: (createdAt < date) OR (createdAt = date AND id < cursorId).
 * If cursorId is empty (legacy cursor), falls back to just (createdAt < date).
 */
export function cursorCondition(
  createdAtCol: PgColumn,
  idCol: PgColumn,
  cursor: { date: Date; id: string }
): SQL {
  if (!cursor.id) {
    return lt(createdAtCol, cursor.date);
  }
  return or(
    lt(createdAtCol, cursor.date),
    and(eq(createdAtCol, cursor.date), lt(idCol, cursor.id))
  )!;
}

/**
 * Encode a compound cursor from the last record in a page.
 */
export function encodeCompoundCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`;
}

export class CursorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CursorValidationError";
  }
}
