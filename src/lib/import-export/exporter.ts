import * as XLSX from "xlsx";

export interface ExportColumn {
  key: string;
  header: string;
}

/**
 * Export data to an XLSX buffer.
 * Converts an array of records into a workbook with a single named sheet.
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  sheetName = "Sheet1"
): Buffer {
  // Build header row + data rows using only the specified columns
  const headerRow = columns.map((col) => col.header);
  const dataRows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key];
      if (val === null || val === undefined) return "";
      if (val instanceof Date) return val.toISOString();
      return String(val);
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

  // Auto-size columns based on content
  worksheet["!cols"] = columns.map((col, idx) => {
    const maxLen = Math.max(
      col.header.length,
      ...dataRows.map((row) => String(row[idx] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buf);
}

/**
 * Export data to a CSV string.
 * Properly escapes fields containing commas, quotes, or newlines.
 */
export function exportToCsv(
  data: Record<string, unknown>[],
  columns: ExportColumn[]
): string {
  const escapeField = (val: string): string => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = columns.map((col) => escapeField(col.header)).join(",");

  const dataLines = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return "";
        if (val instanceof Date) return escapeField(val.toISOString());
        return escapeField(String(val));
      })
      .join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}
