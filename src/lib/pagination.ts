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

export class CursorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CursorValidationError";
  }
}
