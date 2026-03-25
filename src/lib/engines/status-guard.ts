import { NextResponse } from "next/server";
import { validateEntityTransition } from "./state-machines";

/**
 * Status transition guard for API routes.
 *
 * Usage in PATCH handlers:
 * ```
 * const error = guardStatusTransition("booking", currentRecord.status, parsed.data.status);
 * if (error) return error;
 * ```
 *
 * Returns null if transition is valid, or a 422 NextResponse if invalid.
 */
export function guardStatusTransition(
  entityType: string,
  currentStatus: string,
  newStatus: string | undefined
): NextResponse | null {
  if (!newStatus || newStatus === currentStatus) return null;

  const error = validateEntityTransition(entityType, currentStatus, newStatus);
  if (error) {
    return NextResponse.json(
      { error: { code: "INVALID_TRANSITION", message: error } },
      { status: 422 }
    );
  }

  return null;
}
