import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import * as XLSX from "xlsx";

/**
 * Column headers per entity, matching the Zod create schemas
 * from @/lib/master-data-management/validation.ts
 */
const ENTITY_HEADERS: Record<string, string[]> = {
  ports: [
    "unLocode",
    "name",
    "country",
    "countryName",
    "timezone",
    "latitude",
    "longitude",
    "portType",
    "isMajorPort",
  ],
  vessels: [
    "imoNumber",
    "name",
    "callSign",
    "mmsi",
    "flag",
    "vesselType",
    "teuCapacity",
    "dwt",
    "grossTonnage",
    "netTonnage",
    "loa",
    "beam",
    "draft",
    "builtYear",
    "builder",
    "ownerName",
    "operatorName",
    "classificationSociety",
  ],
  customers: [
    "customerType",
    "name",
    "shortName",
    "taxId",
    "registrationNumber",
    "country",
    "city",
    "address",
    "postalCode",
    "phone",
    "email",
    "website",
    "creditLimitAmount",
    "creditLimitCurrency",
    "paymentTermsDays",
  ],
  commodities: [
    "hsCode",
    "description",
    "shortDescription",
    "category",
    "chapter",
    "hazardClass",
    "unNumber",
    "unitOfMeasure",
    "requiresFumigation",
    "requiresInspection",
    "isRestricted",
    "dutyRate",
  ],
  "container-types": [
    "isoCode",
    "description",
    "sizeType",
    "lengthFt",
    "widthFt",
    "heightFt",
    "tareWeightKg",
    "maxPayloadKg",
    "cubicCapacityCbm",
    "isReefer",
    "isOpenTop",
    "isFlatRack",
    "isTank",
  ],
  terminals: [
    "portId",
    "name",
    "code",
    "operatorName",
    "capacity",
    "terminalType",
  ],
};

const VALID_ENTITIES = Object.keys(ENTITY_HEADERS);

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const entity = url.searchParams.get("entity");

    if (!entity || !VALID_ENTITIES.includes(entity)) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid entity. Must be one of: ${VALID_ENTITIES.join(", ")}`,
          },
        },
        { status: 422 }
      );
    }

    const headers = ENTITY_HEADERS[entity];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);

    // Set reasonable column widths based on header length
    worksheet["!cols"] = headers.map((h) => ({
      wch: Math.max(h.length + 4, 14),
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, entity);

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${entity}-import-template.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate import template:", error);
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
