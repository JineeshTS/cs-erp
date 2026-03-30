import * as XLSX from "xlsx";
import { z } from "zod";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface ImportRow {
  rowIndex: number;
  data: Record<string, unknown>;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: ImportRow[];
  errors: ImportError[];
}

/**
 * Parse a CSV, XLSX, or XLS file buffer into headers + rows.
 * Uses SheetJS (xlsx) for all formats.
 */
export function parseSpreadsheet(
  buffer: Buffer,
  fileName: string
): ParsedSpreadsheet {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
    throw new Error(
      `Unsupported file format: .${extension}. Supported: .csv, .xlsx, .xls`
    );
  }

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Spreadsheet contains no sheets");
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error("Failed to read first sheet");
  }

  // Convert to array of objects with string values
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  if (rawRows.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = Object.keys(rawRows[0] ?? {});
  const rows = rawRows.map((row) => {
    const stringRow: Record<string, string> = {};
    for (const key of headers) {
      stringRow[key] = String(row[key] ?? "");
    }
    return stringRow;
  });

  return { headers, rows, totalRows: rows.length };
}

/**
 * Validate import rows against a Zod schema after applying column mapping.
 *
 * columnMapping maps spreadsheet column names → target field names.
 * e.g. { "Port Name": "name", "UN Code": "unLocode" }
 */
export function validateImportData(
  rows: Record<string, string>[],
  columnMapping: Record<string, string>,
  zodSchema: z.ZodSchema
): ValidationResult {
  const valid: ImportRow[] = [];
  const errors: ImportError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Apply column mapping
    const mapped: Record<string, string> = {};
    for (const [sourceCol, targetField] of Object.entries(columnMapping)) {
      const value = row[sourceCol];
      if (value !== undefined) {
        mapped[targetField] = value;
      }
    }

    const result = zodSchema.safeParse(mapped);
    if (result.success) {
      valid.push({ rowIndex: i + 1, data: result.data as Record<string, unknown> });
    } else {
      for (const issue of result.error.issues) {
        errors.push({
          row: i + 2, // +2: 1-indexed + header row
          field: issue.path.join(".") || "unknown",
          message: issue.message,
        });
      }
    }
  }

  return { valid, errors };
}

/**
 * Batch-insert validated rows into a Drizzle table.
 * Injects tenantId, createdBy, and timestamps for each row.
 * Uses batches of 100 to avoid oversized queries.
 */
export async function executeImport(
  tenantId: string,
  table: PgTable,
  validRows: ImportRow[],
  userId: string
): Promise<number> {
  if (validRows.length === 0) return 0;

  const BATCH_SIZE = 100;
  let totalInserted = 0;

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    const insertData = batch.map((row) => ({
      ...row.data,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
    }));

    await db.insert(table).values(insertData);
    totalInserted += batch.length;
  }

  return totalInserted;
}
