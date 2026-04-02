import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, isNull, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ports,
  vessels,
  customers,
  commodities,
  containerTypes,
  terminals,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { exportToExcel, exportToCsv } from "@/lib/import-export/exporter";
import type { ExportColumn } from "@/lib/import-export/exporter";
import type { PgTable } from "drizzle-orm/pg-core";

/**
 * Entity export configurations: table reference, display columns, and
 * which column supports text filtering.
 */
interface EntityExportConfig {
  table: PgTable;
  columns: ExportColumn[];
  tenantIdCol: unknown;
  deletedAtCol: unknown;
  nameCol: unknown; // column for ILIKE text filter
}

const ENTITY_CONFIG: Record<string, EntityExportConfig> = {
  ports: {
    table: ports,
    columns: [
      { key: "unLocode", header: "UN/LOCODE" },
      { key: "name", header: "Port Name" },
      { key: "country", header: "Country" },
      { key: "countryName", header: "Country Name" },
      { key: "timezone", header: "Timezone" },
      { key: "portType", header: "Port Type" },
      { key: "status", header: "Status" },
    ],
    tenantIdCol: ports.tenantId,
    deletedAtCol: ports.deletedAt,
    nameCol: ports.name,
  },
  vessels: {
    table: vessels,
    columns: [
      { key: "imoNumber", header: "IMO Number" },
      { key: "name", header: "Vessel Name" },
      { key: "callSign", header: "Call Sign" },
      { key: "flag", header: "Flag" },
      { key: "vesselType", header: "Vessel Type" },
      { key: "teuCapacity", header: "TEU Capacity" },
      { key: "status", header: "Status" },
    ],
    tenantIdCol: vessels.tenantId,
    deletedAtCol: vessels.deletedAt,
    nameCol: vessels.name,
  },
  customers: {
    table: customers,
    columns: [
      { key: "name", header: "Customer Name" },
      { key: "shortName", header: "Short Name" },
      { key: "customerType", header: "Type" },
      { key: "country", header: "Country" },
      { key: "city", header: "City" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
      { key: "status", header: "Status" },
    ],
    tenantIdCol: customers.tenantId,
    deletedAtCol: customers.deletedAt,
    nameCol: customers.name,
  },
  commodities: {
    table: commodities,
    columns: [
      { key: "hsCode", header: "HS Code" },
      { key: "description", header: "Description" },
      { key: "shortDescription", header: "Short Description" },
      { key: "category", header: "Category" },
      { key: "unitOfMeasure", header: "Unit" },
      { key: "status", header: "Status" },
    ],
    tenantIdCol: commodities.tenantId,
    deletedAtCol: commodities.deletedAt,
    nameCol: commodities.description,
  },
  containerTypes: {
    table: containerTypes,
    columns: [
      { key: "isoCode", header: "ISO Code" },
      { key: "description", header: "Description" },
      { key: "sizeType", header: "Size Type" },
      { key: "tareWeightKg", header: "Tare Weight (kg)" },
      { key: "maxPayloadKg", header: "Max Payload (kg)" },
      { key: "status", header: "Status" },
    ],
    tenantIdCol: containerTypes.tenantId,
    deletedAtCol: containerTypes.deletedAt,
    nameCol: containerTypes.description,
  },
  terminals: {
    table: terminals,
    columns: [
      { key: "name", header: "Terminal Name" },
      { key: "code", header: "Code" },
      { key: "operatorName", header: "Operator" },
      { key: "terminalType", header: "Type" },
      { key: "status", header: "Status" },
    ],
    tenantIdCol: terminals.tenantId,
    deletedAtCol: terminals.deletedAt,
    nameCol: terminals.name,
  },
};

const exportRequestSchema = z.object({
  entity: z.enum(Object.keys(ENTITY_CONFIG) as [string, ...string[]]),
  format: z.enum(["xlsx", "csv"]),
  filters: z
    .object({
      search: z.string().max(255).optional(),
      status: z.string().max(20).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:read")))
      return forbiddenResponse();

    const body = await request.json();
    const parsed = exportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid export request",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { entity, format, filters } = parsed.data;
    const config = ENTITY_CONFIG[entity];
    if (!config) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Unknown entity" } },
        { status: 400 }
      );
    }

    // Build query conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [
      eq(config.tenantIdCol as any, user.tenantId),
      isNull(config.deletedAtCol as any),
    ];

    if (filters?.search) {
      conditions.push(
        ilike(config.nameCol as any, `%${filters.search}%`)
      );
    }

    // Query up to 10,000 rows for export
    const rows = await db
      .select()
      .from(config.table)
      .where(and(...conditions))
      .limit(10000);

    const fileName = `${entity}-export-${new Date().toISOString().slice(0, 10)}`;

    if (format === "xlsx") {
      const buffer = exportToExcel(
        rows as Record<string, unknown>[],
        config.columns,
        entity
      );
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${fileName}.xlsx"`,
        },
      });
    }

    // CSV
    const csvContent = exportToCsv(
      rows as Record<string, unknown>[],
      config.columns
    );
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}.csv"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to process export",
        },
      },
      { status: 500 }
    );
  }
}
