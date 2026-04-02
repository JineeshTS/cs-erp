import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { validateCsrfToken } from "@/lib/csrf";
import {
  parseSpreadsheet,
  validateImportData,
  executeImport,
} from "@/lib/import-export/importer";
import {
  ports,
  vessels,
  customers,
  commodities,
  containerTypes,
  terminals,
} from "@/db/schema";
import type { PgTable } from "drizzle-orm/pg-core";

/**
 * Whitelist of importable entities with their target tables and validation schemas.
 */
const ENTITY_CONFIG: Record<
  string,
  { table: PgTable; schema: z.ZodSchema }
> = {
  ports: {
    table: ports,
    schema: z.object({
      unLocode: z.string().min(1, "UN/LOCODE is required").max(10),
      name: z.string().min(1, "Name is required").max(255),
      country: z.string().min(2).max(2),
      countryName: z.string().max(100).optional(),
      timezone: z.string().max(50).optional(),
      portType: z.string().max(30).optional(),
      status: z.string().max(20).optional(),
    }),
  },
  vessels: {
    table: vessels,
    schema: z.object({
      imoNumber: z.string().min(1, "IMO number is required").max(10),
      name: z.string().min(1, "Name is required").max(255),
      callSign: z.string().max(20).optional(),
      mmsi: z.string().max(15).optional(),
      flag: z.string().max(2).optional(),
      vesselType: z.string().max(50).optional(),
      status: z.string().max(20).optional(),
    }),
  },
  customers: {
    table: customers,
    schema: z.object({
      customerType: z.string().min(1, "Customer type is required").max(30),
      name: z.string().min(1, "Name is required").max(255),
      shortName: z.string().max(100).optional(),
      taxId: z.string().max(50).optional(),
      country: z.string().max(2).optional(),
      city: z.string().max(100).optional(),
      email: z.string().max(255).optional(),
      phone: z.string().max(30).optional(),
      status: z.string().max(20).optional(),
    }),
  },
  commodities: {
    table: commodities,
    schema: z.object({
      hsCode: z.string().min(1, "HS Code is required").max(12),
      description: z.string().min(1, "Description is required"),
      shortDescription: z.string().max(255).optional(),
      category: z.string().max(100).optional(),
      unitOfMeasure: z.string().max(20).optional(),
      status: z.string().max(20).optional(),
    }),
  },
  containerTypes: {
    table: containerTypes,
    schema: z.object({
      isoCode: z.string().min(1, "ISO code is required").max(10),
      description: z.string().min(1, "Description is required").max(255),
      sizeType: z.string().min(1, "Size type is required").max(10),
      status: z.string().max(20).optional(),
    }),
  },
  terminals: {
    table: terminals,
    schema: z.object({
      name: z.string().min(1, "Name is required").max(255),
      code: z.string().max(20).optional(),
      operatorName: z.string().max(255).optional(),
      terminalType: z.string().max(30).optional(),
      status: z.string().max(20).optional(),
    }),
  },
};

const entitySchema = z.enum(
  Object.keys(ENTITY_CONFIG) as [string, ...string[]]
);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const formData = await request.formData();
    const file = formData.get("file");
    const entityRaw = formData.get("entity");
    const columnMappingRaw = formData.get("columnMapping");

    // Validate file presence
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "A file must be uploaded",
          },
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "File size exceeds 5 MB limit",
          },
        },
        { status: 400 }
      );
    }

    // Validate entity
    const entityResult = entitySchema.safeParse(entityRaw);
    if (!entityResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid entity. Allowed: ${Object.keys(ENTITY_CONFIG).join(", ")}`,
          },
        },
        { status: 400 }
      );
    }
    const entity = entityResult.data;

    // Parse column mapping
    let columnMapping: Record<string, string>;
    try {
      if (typeof columnMappingRaw !== "string" || !columnMappingRaw) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "columnMapping must be a JSON string",
            },
          },
          { status: 400 }
        );
      }
      columnMapping = JSON.parse(columnMappingRaw);
      if (
        typeof columnMapping !== "object" ||
        columnMapping === null ||
        Array.isArray(columnMapping)
      ) {
        throw new Error("Must be an object");
      }
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message:
              "columnMapping must be a valid JSON object mapping source columns to target fields",
          },
        },
        { status: 400 }
      );
    }

    const config = ENTITY_CONFIG[entity];
    if (!config) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Unknown entity" } },
        { status: 400 }
      );
    }

    // Parse spreadsheet
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = parseSpreadsheet(buffer, file.name);

    if (parsed.totalRows === 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "File contains no data rows" } },
        { status: 400 }
      );
    }

    // Validate data
    const { valid, errors } = validateImportData(
      parsed.rows,
      columnMapping,
      config.schema
    );

    // Insert valid rows
    let imported = 0;
    if (valid.length > 0) {
      imported = await executeImport(
        user.tenantId,
        config.table,
        valid,
        user.id
      );
    }

    return NextResponse.json(
      {
        data: {
          imported,
          totalRows: parsed.totalRows,
          validCount: valid.length,
          errorCount: errors.length,
          errors: errors.slice(0, 100), // Cap errors at 100 for response size
        },
      },
      { status: imported > 0 ? 201 : 200 }
    );
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to process import",
        },
      },
      { status: 500 }
    );
  }
}
