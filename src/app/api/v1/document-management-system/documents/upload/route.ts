import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { z } from "zod";
import { db } from "@/lib/db";
import { dmsDocuments } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-excel": ".xls",
  "text/csv": ".csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/msword": ".doc",
  "image/png": ".png",
  "image/jpeg": ".jpeg",
  "image/webp": ".webp",
  "text/plain": ".txt",
};

const uploadMetaSchema = z.object({
  category: z.string().min(1).max(100),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const formData = await request.formData();
    const file = formData.get("file");
    const category = formData.get("category");
    const entityType = formData.get("entityType");
    const entityId = formData.get("entityId");

    // Validate file presence
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "A file must be provided in the 'file' field",
          },
        },
        { status: 422 }
      );
    }

    // Validate metadata
    const metaParsed = uploadMetaSchema.safeParse({
      category: category?.toString() ?? "",
      entityType: entityType?.toString() || undefined,
      entityId: entityId?.toString() || undefined,
    });
    if (!metaParsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid upload metadata",
            details: formatZodErrors(metaParsed.error),
          },
        },
        { status: 422 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          },
        },
        { status: 422 }
      );
    }

    // Validate MIME type
    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES[mimeType]) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `File type '${mimeType}' is not allowed. Allowed types: ${Object.values(ALLOWED_MIME_TYPES).join(", ")}`,
          },
        },
        { status: 422 }
      );
    }

    const meta = metaParsed.data;
    const fileId = randomUUID();
    const ext = extname(file.name) || ALLOWED_MIME_TYPES[mimeType];
    const sanitizedCategory = meta.category.replace(/[^a-zA-Z0-9_-]/g, "_");

    // Build storage path: uploads/documents/{tenantId}/{category}/{uuid}.{ext}
    const relativeDir = join(
      "uploads",
      "documents",
      user.tenantId,
      sanitizedCategory
    );
    const fileName = `${fileId}${ext}`;
    const relativePath = join(relativeDir, fileName);
    const absoluteDir = join(process.cwd(), relativeDir);

    // Ensure directory exists
    await mkdir(absoluteDir, { recursive: true });

    // Write file to disk
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(join(absoluteDir, fileName), bytes);

    // Create document record
    const [created] = await db
      .insert(dmsDocuments)
      .values({
        tenantId: user.tenantId,
        uploadedBy: user.id,
        title: file.name,
        documentType: sanitizedCategory,
        entityType: meta.entityType ?? null,
        entityId: meta.entityId ?? null,
        fileName: file.name,
        fileSize: file.size,
        mimeType,
        storagePath: relativePath,
        storageProvider: "local",
        status: "active",
      })
      .returning();

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "upload",
      entityType: "documents",
      entityId: created.id,
      module: "document-management-system",
      newData: created as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload document:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
