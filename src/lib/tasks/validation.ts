import { z } from "zod/v4";

const taskPriority = z.enum(["critical", "high", "normal", "low"]);
const taskStatus = z.enum([
  "pending",
  "in_progress",
  "completed",
  "failed",
  "blocked",
  "cancelled",
]);

export const createTaskSchema = z.object({
  name: z.string().min(1, "Task name is required").max(200),
  taskDefinitionId: z.uuid("Invalid task definition ID").optional(),
  priority: taskPriority.optional(),
  assignedRole: z.string().max(100).optional(),
  assignedTo: z.uuid("Invalid user ID").optional(),
  dueAt: z.iso.datetime("Invalid datetime format").optional(),
  inputData: z.record(z.string(), z.unknown()).optional(),
  metadata: z
    .record(z.string(), z.unknown())
    .refine((val) => Object.keys(val).length <= 50, {
      message: "Metadata must have at most 50 keys",
    })
    .optional()
    .nullable(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  assignedRole: z.string().max(100).optional(),
  assignedTo: z.uuid("Invalid user ID").optional().nullable(),
  dueAt: z.iso.datetime("Invalid datetime format").optional().nullable(),
  inputData: z.record(z.string(), z.unknown()).optional(),
  errorMessage: z.string().optional().nullable(),
  metadata: z
    .record(z.string(), z.unknown())
    .refine((val) => Object.keys(val).length <= 50, {
      message: "Metadata must have at most 50 keys",
    })
    .optional()
    .nullable(),
});

export const completeStepSchema = z.object({
  outputData: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().max(5000).optional(),
});

export const createFromDefinitionSchema = z.object({
  taskDefinitionId: z.uuid("Task definition ID is required"),
  priority: taskPriority.optional(),
  assignedTo: z.uuid("Invalid user ID").optional(),
  dueAt: z.iso.datetime("Invalid datetime format").optional(),
});
