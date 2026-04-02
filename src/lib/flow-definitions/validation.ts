/**
 * Flow Definition Validation Schemas
 *
 * Zod schemas for create, update, and clone operations on flow definitions.
 */

import { z } from "zod";

export const createFlowDefinitionSchema = z.object({
  flowCode: z
    .string()
    .min(1, "Flow code is required")
    .max(20, "Flow code must be 20 characters or less")
    .regex(/^[A-Z0-9_-]+$/, "Flow code must be uppercase alphanumeric with hyphens/underscores"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),
  description: z.string().max(5000).optional(),
  category: z
    .string()
    .max(30)
    .optional(),
  triggerEvent: z.string().max(100).optional(),
  entityType: z.string().max(100).optional(),
});

export const updateFlowDefinitionSchema = z.object({
  flowCode: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "Flow code must be uppercase alphanumeric with hyphens/underscores")
    .optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  category: z.string().max(30).optional(),
  triggerEvent: z.string().max(100).optional(),
  entityType: z.string().max(100).optional(),
});

export const cloneFlowDefinitionSchema = z.object({});
