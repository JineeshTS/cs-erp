/**
 * Tool Library Types (D-006 Phase 4)
 *
 * Shared types for all domain tool implementations.
 */

export interface ToolCallContext {
  tenantId: string;
  flowInstanceId: string;
  stepInstanceId: string;
  userId: string;
}

export interface ToolCallResult {
  result: Record<string, unknown>;
  entityTable?: string;
  entityId?: string;
  entityAction?: string;
  entityData?: Record<string, unknown>;
}
