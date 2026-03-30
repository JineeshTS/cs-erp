import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfStyles, PdfHeader, PdfFooter, PdfTable } from "../renderer";

/* ────────── Types ────────── */

interface ManifestCargoItem {
  blNumber?: string;
  containerNumber?: string;
  shipperName?: string;
  consigneeName?: string;
  cargoDescription?: string;
  hsCode?: string;
  packageCount?: number;
  packageType?: string;
  grossWeight?: number;
  volumeCbm?: number;
}

export interface ManifestData {
  manifestNumber: string;
  manifestType: string;
  vessel: string;
  voyage: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  cargoItems: ManifestCargoItem[];
  totalBls: number;
  totalContainers: number;
  totalWeight?: number;
  weightUnit?: string;
  status: string;
  submittedTo?: string;
  companyName?: string;
}

/* ────────── Component ────────── */

export function ManifestPdf({ data }: { data: ManifestData }) {
  // Cargo items table
  const cargoHeaders = ["B/L No", "Container", "Shipper", "Consignee", "HS Code", "Pkgs", "Weight (kg)", "Vol (CBM)"];
  const cargoRows = data.cargoItems.map((item) => [
    item.blNumber ?? "",
    item.containerNumber ?? "",
    item.shipperName ?? "",
    item.consigneeName ?? "",
    item.hsCode ?? "",
    item.packageCount ? `${item.packageCount} ${item.packageType ?? ""}`.trim() : "",
    item.grossWeight ? String(item.grossWeight) : "",
    item.volumeCbm ? String(item.volumeCbm) : "",
  ]);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: { ...PdfStyles.page, padding: 30 } },

      // Header
      React.createElement(PdfHeader, {
        title: `${data.manifestType.toUpperCase()} MANIFEST`,
        subtitle: `Manifest No: ${data.manifestNumber} | Status: ${data.status.toUpperCase()}`,
        companyName: data.companyName ?? "Shipping Company",
      }),

      // Vessel / Voyage details
      React.createElement(
        View,
        { style: { flexDirection: "row" as const, marginBottom: 10 } },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "VESSEL"),
          React.createElement(Text, { style: PdfStyles.value }, data.vessel)
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "VOYAGE NUMBER"),
          React.createElement(Text, { style: PdfStyles.value }, data.voyage)
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "PORT OF LOADING"),
          React.createElement(Text, { style: PdfStyles.value }, data.portOfLoading ?? "-")
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "PORT OF DISCHARGE"),
          React.createElement(Text, { style: PdfStyles.value }, data.portOfDischarge ?? "-")
        )
      ),

      // Dates
      React.createElement(
        View,
        { style: { flexDirection: "row" as const, marginBottom: 10 } },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "ETD"),
          React.createElement(Text, { style: PdfStyles.value }, data.estimatedDeparture ?? "-")
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "ETA"),
          React.createElement(Text, { style: PdfStyles.value }, data.estimatedArrival ?? "-")
        ),
        data.submittedTo
          ? React.createElement(
              View,
              { style: { flex: 2 } },
              React.createElement(Text, { style: PdfStyles.label }, "SUBMITTED TO"),
              React.createElement(Text, { style: PdfStyles.value }, data.submittedTo)
            )
          : React.createElement(View, { style: { flex: 2 } })
      ),

      React.createElement(View, { style: PdfStyles.divider }),

      // Cargo items table
      React.createElement(PdfTable, {
        headers: cargoHeaders,
        rows: cargoRows,
        columnWidths: [12, 12, 14, 14, 10, 10, 12, 10],
      }),

      // Summary totals
      React.createElement(
        View,
        {
          style: {
            flexDirection: "row" as const,
            marginTop: 12,
            padding: 8,
            backgroundColor: "#f1f5f9",
            border: "0.5pt solid #cbd5e1",
          },
        },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "TOTAL B/Ls"),
          React.createElement(Text, { style: { fontSize: 11, fontFamily: "Helvetica-Bold" } }, String(data.totalBls))
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "TOTAL CONTAINERS"),
          React.createElement(Text, { style: { fontSize: 11, fontFamily: "Helvetica-Bold" } }, String(data.totalContainers))
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "TOTAL WEIGHT"),
          React.createElement(
            Text,
            { style: { fontSize: 11, fontFamily: "Helvetica-Bold" } },
            data.totalWeight ? `${data.totalWeight} ${data.weightUnit ?? "KG"}` : "-"
          )
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "CARGO ITEMS"),
          React.createElement(Text, { style: { fontSize: 11, fontFamily: "Helvetica-Bold" } }, String(data.cargoItems.length))
        )
      ),

      // Footer
      React.createElement(PdfFooter, {})
    )
  );
}
