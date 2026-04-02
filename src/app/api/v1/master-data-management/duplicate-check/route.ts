import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiUser, unauthorizedResponse } from "@/lib/auth/api-auth";
import {
  detectDuplicates,
  type DuplicateEntityType,
} from "@/lib/duplicate-detection";

const duplicateCheckSchema = z.object({
  entityType: z.enum(["ports", "vessels", "customers"]),
  fields: z.record(z.string(), z.string().max(500)).refine(
    (obj) => Object.keys(obj).length > 0,
    { message: "At least one field must be provided" }
  ),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = duplicateCheckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { entityType, fields } = parsed.data;

    const result = await detectDuplicates(
      user.tenantId,
      entityType as DuplicateEntityType,
      fields
    );

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("Duplicate check error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to check for duplicates",
        },
      },
      { status: 500 }
    );
  }
}
