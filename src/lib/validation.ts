import { z } from "zod";

export const emailSchema = z.email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  tenantName: z.string().min(2, "Organization name must be at least 2 characters").max(255),
  displayName: z.string().min(1, "Display name is required").max(255).optional(),
  country: z.enum(["QA", "AE", "SA", "IN"]).optional(),
  timezone: z.string().max(50).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema,
});

/**
 * Escape LIKE/ILIKE metacharacters (%, _) in user input to prevent
 * broader-than-intended pattern matching. Backslash is the default
 * escape character in PostgreSQL LIKE expressions.
 */
export function escapeIlike(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Constrained metadata schema — accepts a JSON object with max 50 keys.
 * Prevents unbounded payload sizes in metadata fields.
 */
export const metadataSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (val) => Object.keys(val).length <= 50,
    { message: "Metadata must have at most 50 keys" }
  )
  .optional()
  .nullable();

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }
  return errors;
}
