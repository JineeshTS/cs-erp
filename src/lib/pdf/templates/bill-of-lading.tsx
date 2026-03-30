import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfStyles, PdfHeader, PdfFooter, PdfTable } from "../renderer";

/* ────────── Types ────────── */

interface BillOfLadingContainer {
  containerNumber: string;
  sealNumber?: string;
  containerType?: string;
  containerSize?: string;
  grossWeight?: number;
  packageCount?: number;
  packageType?: string;
  cargoDescription?: string;
}

export interface BillOfLadingData {
  blNumber: string;
  shipper: string;
  shipperAddress?: string;
  consignee: string;
  consigneeAddress?: string;
  notifyParty?: string;
  notifyPartyAddress?: string;
  vessel?: string;
  voyage?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  placeOfReceipt?: string;
  placeOfDelivery?: string;
  containers: BillOfLadingContainer[];
  description?: string;
  weight?: number;
  weightUnit?: string;
  measurement?: number;
  measurementUnit?: string;
  freightTerms?: string;
  dateOfIssue?: string;
  placeOfIssue?: string;
  numberOfOriginals?: number;
  companyName?: string;
}

/* ────────── Styles ────────── */

const styles = StyleSheet.create({
  partiesRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  partyBox: {
    flex: 1,
    padding: 8,
    border: "0.5pt solid #cbd5e1",
    marginRight: 6,
  },
  partyBoxLast: {
    flex: 1,
    padding: 8,
    border: "0.5pt solid #cbd5e1",
  },
  routeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  routeCell: {
    flex: 1,
    paddingRight: 10,
  },
  termsBox: {
    padding: 8,
    border: "0.5pt solid #cbd5e1",
    marginBottom: 10,
  },
  signatureRow: {
    flexDirection: "row",
    marginTop: 30,
  },
  signatureBlock: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 6,
    marginRight: 20,
  },
  signatureBlockLast: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 6,
  },
});

/* ────────── Component ────────── */

export function BillOfLadingPdf({ data }: { data: BillOfLadingData }) {
  // Container table
  const containerHeaders = ["Container No", "Seal No", "Type/Size", "Packages", "Gross Wt (kg)", "Description"];
  const containerRows = data.containers.map((c) => [
    c.containerNumber,
    c.sealNumber ?? "",
    [c.containerType, c.containerSize].filter(Boolean).join(" / ") || "",
    c.packageCount ? `${c.packageCount} ${c.packageType ?? ""}`.trim() : "",
    c.grossWeight ? String(c.grossWeight) : "",
    c.cargoDescription ?? "",
  ]);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: PdfStyles.page },

      // Header
      React.createElement(PdfHeader, {
        title: "BILL OF LADING",
        subtitle: `B/L No: ${data.blNumber}`,
        companyName: data.companyName ?? "Shipping Company",
      }),

      // Parties section
      React.createElement(
        View,
        { style: styles.partiesRow },
        React.createElement(
          View,
          { style: styles.partyBox },
          React.createElement(Text, { style: PdfStyles.label }, "SHIPPER"),
          React.createElement(Text, { style: PdfStyles.value }, data.shipper),
          data.shipperAddress
            ? React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, data.shipperAddress)
            : null
        ),
        React.createElement(
          View,
          { style: styles.partyBox },
          React.createElement(Text, { style: PdfStyles.label }, "CONSIGNEE"),
          React.createElement(Text, { style: PdfStyles.value }, data.consignee),
          data.consigneeAddress
            ? React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, data.consigneeAddress)
            : null
        ),
        React.createElement(
          View,
          { style: styles.partyBoxLast },
          React.createElement(Text, { style: PdfStyles.label }, "NOTIFY PARTY"),
          React.createElement(Text, { style: PdfStyles.value }, data.notifyParty ?? "SAME AS CONSIGNEE"),
          data.notifyPartyAddress
            ? React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, data.notifyPartyAddress)
            : null
        )
      ),

      // Route / voyage section
      React.createElement(
        View,
        { style: styles.routeRow },
        React.createElement(
          View,
          { style: styles.routeCell },
          React.createElement(Text, { style: PdfStyles.label }, "VESSEL"),
          React.createElement(Text, { style: PdfStyles.value }, data.vessel ?? "-")
        ),
        React.createElement(
          View,
          { style: styles.routeCell },
          React.createElement(Text, { style: PdfStyles.label }, "VOYAGE NO"),
          React.createElement(Text, { style: PdfStyles.value }, data.voyage ?? "-")
        ),
        React.createElement(
          View,
          { style: styles.routeCell },
          React.createElement(Text, { style: PdfStyles.label }, "PORT OF LOADING"),
          React.createElement(Text, { style: PdfStyles.value }, data.portOfLoading ?? "-")
        ),
        React.createElement(
          View,
          { style: styles.routeCell },
          React.createElement(Text, { style: PdfStyles.label }, "PORT OF DISCHARGE"),
          React.createElement(Text, { style: PdfStyles.value }, data.portOfDischarge ?? "-")
        )
      ),

      // Place of receipt / delivery
      data.placeOfReceipt || data.placeOfDelivery
        ? React.createElement(
            View,
            { style: { ...styles.routeRow, marginBottom: 6 } },
            React.createElement(
              View,
              { style: styles.routeCell },
              React.createElement(Text, { style: PdfStyles.label }, "PLACE OF RECEIPT"),
              React.createElement(Text, { style: PdfStyles.value }, data.placeOfReceipt ?? "-")
            ),
            React.createElement(
              View,
              { style: styles.routeCell },
              React.createElement(Text, { style: PdfStyles.label }, "PLACE OF DELIVERY"),
              React.createElement(Text, { style: PdfStyles.value }, data.placeOfDelivery ?? "-")
            )
          )
        : null,

      // Goods description
      data.description
        ? React.createElement(
            View,
            { style: { marginBottom: 8 } },
            React.createElement(Text, { style: PdfStyles.label }, "DESCRIPTION OF GOODS"),
            React.createElement(Text, { style: { fontSize: 8, lineHeight: 1.4 } }, data.description)
          )
        : null,

      // Container table
      containerRows.length > 0
        ? React.createElement(PdfTable, {
            headers: containerHeaders,
            rows: containerRows,
            columnWidths: [18, 12, 12, 14, 12, 32],
          })
        : null,

      // Weight / measurement summary
      React.createElement(
        View,
        { style: { flexDirection: "row" as const, marginTop: 6, marginBottom: 10 } },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "TOTAL GROSS WEIGHT"),
          React.createElement(
            Text,
            { style: PdfStyles.value },
            data.weight ? `${data.weight} ${data.weightUnit ?? "KG"}` : "-"
          )
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "TOTAL MEASUREMENT"),
          React.createElement(
            Text,
            { style: PdfStyles.value },
            data.measurement ? `${data.measurement} ${data.measurementUnit ?? "CBM"}` : "-"
          )
        )
      ),

      // Terms section
      React.createElement(
        View,
        { style: styles.termsBox },
        React.createElement(
          View,
          { style: { flexDirection: "row" as const } },
          React.createElement(
            View,
            { style: { flex: 1 } },
            React.createElement(Text, { style: PdfStyles.label }, "FREIGHT TERMS"),
            React.createElement(Text, { style: PdfStyles.value }, (data.freightTerms ?? "PREPAID").toUpperCase())
          ),
          React.createElement(
            View,
            { style: { flex: 1 } },
            React.createElement(Text, { style: PdfStyles.label }, "NO. OF ORIGINALS"),
            React.createElement(Text, { style: PdfStyles.value }, String(data.numberOfOriginals ?? 3))
          ),
          React.createElement(
            View,
            { style: { flex: 1 } },
            React.createElement(Text, { style: PdfStyles.label }, "DATE OF ISSUE"),
            React.createElement(Text, { style: PdfStyles.value }, data.dateOfIssue ?? "-")
          ),
          React.createElement(
            View,
            { style: { flex: 1 } },
            React.createElement(Text, { style: PdfStyles.label }, "PLACE OF ISSUE"),
            React.createElement(Text, { style: PdfStyles.value }, data.placeOfIssue ?? "-")
          )
        )
      ),

      // Signature block
      React.createElement(
        View,
        { style: styles.signatureRow },
        React.createElement(
          View,
          { style: styles.signatureBlock },
          React.createElement(Text, { style: { fontSize: 7, color: "#64748b" } }, "Signed for the Carrier")
        ),
        React.createElement(
          View,
          { style: styles.signatureBlockLast },
          React.createElement(Text, { style: { fontSize: 7, color: "#64748b" } }, "Date and Place")
        )
      ),

      // Footer
      React.createElement(PdfFooter, {})
    )
  );
}
