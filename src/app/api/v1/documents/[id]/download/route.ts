import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { dmsDocuments } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:read")))
      return forbiddenResponse();

    const { id } = await params;

    const [record] = await db
      .select()
      .from(dmsDocuments)
      .where(
        and(
          eq(dmsDocuments.id, id),
          eq(dmsDocuments.tenantId, user.tenantId),
          isNull(dmsDocuments.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    const filePath = record.storagePath;
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: { code: "FILE_NOT_FOUND", message: "The file could not be found on storage" } },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);

    // Increment download count is not available in the dmsDocuments schema,
    // so we update the metadata field to track downloads instead.
    const currentMetadata = (record.metadata as Record<string, unknown>) ?? {};
    const currentDownloads = typeof currentMetadata.downloadCount === "number"
      ? currentMetadata.downloadCount
      : 0;

    await db
      .update(dmsDocuments)
      .set({
        metadata: { ...currentMetadata, downloadCount: currentDownloads + 1 },
        updatedBy: user.id,
      })
      .where(
        and(
          eq(dmsDocuments.id, id),
          eq(dmsDocuments.tenantId, user.tenantId)
        )
      );

    const safeFilename = record.fileName.replace(/[^\w.\-]/g, "_");

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": record.mimeType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": String(fileBuffer.byteLength),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Failed to download document:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
