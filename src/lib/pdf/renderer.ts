import React from "react";
import {
  renderToBuffer,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/* ────────────────────────────────────────────────────────
 * PdfStyles — shared style constants for consistent look
 * ──────────────────────────────────────────────────────── */

export const PdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  section: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
  },
  col: {
    flex: 1,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 10,
  },
  label: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 9,
    color: "#1e293b",
    marginBottom: 6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginVertical: 8,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#94a3b8",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
});

/* ────────────────────────────────────────────────────────
 * renderPdfToBuffer — takes a React-PDF document element
 *   and returns a Node.js Buffer
 * ──────────────────────────────────────────────────────── */

export async function renderPdfToBuffer(
  document: React.ReactElement
): Promise<Uint8Array> {
  const buffer = await renderToBuffer(document as never);
  return new Uint8Array(buffer);
}

/* ────────────────────────────────────────────────────────
 * PdfHeader — reusable document header
 * ──────────────────────────────────────────────────────── */

interface PdfHeaderProps {
  title: string;
  subtitle?: string;
  companyName?: string;
}

export function PdfHeader({ title, subtitle, companyName }: PdfHeaderProps) {
  return React.createElement(
    View,
    { style: { marginBottom: 16 } },
    companyName
      ? React.createElement(
          Text,
          { style: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#0f172a", marginBottom: 4 } },
          companyName
        )
      : null,
    React.createElement(Text, { style: PdfStyles.title }, title),
    subtitle
      ? React.createElement(Text, { style: PdfStyles.subtitle }, subtitle)
      : null,
    React.createElement(View, { style: PdfStyles.divider })
  );
}

/* ────────────────────────────────────────────────────────
 * PdfFooter — reusable page footer
 * ──────────────────────────────────────────────────────── */

interface PdfFooterProps {
  pageNumber?: number;
}

export function PdfFooter({ pageNumber }: PdfFooterProps) {
  return React.createElement(
    View,
    { style: PdfStyles.footer, fixed: true },
    React.createElement(
      Text,
      null,
      `Generated on ${new Date().toLocaleDateString("en-GB")}`
    ),
    pageNumber !== undefined
      ? React.createElement(Text, null, `Page ${pageNumber}`)
      : React.createElement(
          Text,
          {
            render: ({ pageNumber: pn, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Page ${pn} of ${totalPages}`,
          } as Record<string, unknown>
        )
  );
}

/* ────────────────────────────────────────────────────────
 * PdfTable — data table with headers and rows
 * ──────────────────────────────────────────────────────── */

interface PdfTableProps {
  headers: string[];
  rows: string[][];
  columnWidths?: number[];
}

export function PdfTable({ headers, rows, columnWidths }: PdfTableProps) {
  const colCount = headers.length;
  const widths = columnWidths ?? headers.map(() => 100 / colCount);

  const headerCells = headers.map((h, i) =>
    React.createElement(
      View,
      { key: `h-${i}`, style: { width: `${widths[i]}%`, paddingVertical: 4, paddingHorizontal: 4 } },
      React.createElement(
        Text,
        { style: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#475569", textTransform: "uppercase" as const } },
        h
      )
    )
  );

  const headerRow = React.createElement(
    View,
    {
      style: {
        flexDirection: "row" as const,
        backgroundColor: "#f1f5f9",
        borderBottomWidth: 1,
        borderBottomColor: "#cbd5e1",
      },
    },
    ...headerCells
  );

  const dataRows = rows.map((row, ri) => {
    const cells = row.map((cell, ci) =>
      React.createElement(
        View,
        { key: `c-${ri}-${ci}`, style: { width: `${widths[ci]}%`, paddingVertical: 3, paddingHorizontal: 4 } },
        React.createElement(Text, { style: { fontSize: 8 } }, cell ?? "")
      )
    );

    return React.createElement(
      View,
      {
        key: `r-${ri}`,
        style: {
          flexDirection: "row" as const,
          borderBottomWidth: 0.5,
          borderBottomColor: "#e2e8f0",
          backgroundColor: ri % 2 === 0 ? "#ffffff" : "#f8fafc",
        },
      },
      ...cells
    );
  });

  return React.createElement(
    View,
    { style: { marginVertical: 8 } },
    headerRow,
    ...dataRows
  );
}
