import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import { PdfStyles, PdfHeader, PdfFooter, PdfTable } from "../renderer";

// ── Data interface ──

export interface QuotationLineItemData {
  chargeCode: string;
  chargeName: string;
  chargeType: string;
  basis: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  currency: string;
}

export interface QuotationData {
  quotationNumber: string;
  status: string;
  companyName?: string;

  // Customer
  customerName: string;
  contactName?: string;

  // Route
  originPort: string;
  destinationPort: string;
  tradeLane?: string;
  serviceType?: string;

  // Container
  containerType?: string;
  containerSize?: string;
  estimatedTeu?: number;

  // Pricing
  totalAmount?: number;
  currency: string;
  validFrom: string;
  validTo: string;

  // Terms
  transitTimeDays?: number;
  freeTimeDays?: number;
  incoterm?: string;
  notes?: string;

  // Line items
  lineItems: QuotationLineItemData[];

  // Sales rep
  salesRepName?: string;
  approvedBy?: string;
  approvedAt?: string;
}

// ── Styles ──

const s = StyleSheet.create({
  badge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 6,
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: "#1e293b",
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  infoGrid: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoCol: {
    flex: 1,
    paddingRight: 8,
  },
  routeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  portCode: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
  },
  arrow: {
    fontSize: 12,
    color: "#64748b",
    marginHorizontal: 12,
  },
  termsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    padding: 8,
    marginTop: 10,
  },
});

// ── Helpers ──

function fmt(cents: number | undefined, currency: string): string {
  if (cents === undefined || cents === null) return "-";
  return `${currency} ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CHARGE_TYPE_LABELS: Record<string, string> = {
  ocean_freight: "Ocean Freight",
  thc: "THC",
  documentation: "Documentation",
  customs: "Customs",
  inland: "Inland",
  surcharge: "Surcharge",
};

const BASIS_LABELS: Record<string, string> = {
  per_container: "Per Container",
  per_teu: "Per TEU",
  per_bl: "Per B/L",
  per_shipment: "Per Shipment",
  lumpsum: "Lump Sum",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#3b82f6",
  approved: "#22c55e",
  accepted: "#16a34a",
  rejected: "#ef4444",
  expired: "#f59e0b",
};

// ── Component ──

export function QuotationPdf({ data }: { data: QuotationData }) {
  const badgeBg = STATUS_COLORS[data.status] ?? "#94a3b8";

  const tableHeaders = ["Charge Code", "Description", "Type", "Basis", "Unit Price", "Qty", "Total"];
  const tableWidths = [12, 28, 12, 13, 13, 7, 15];
  const tableRows = data.lineItems.map((li) => [
    li.chargeCode,
    li.chargeName,
    CHARGE_TYPE_LABELS[li.chargeType] ?? li.chargeType,
    BASIS_LABELS[li.basis] ?? li.basis,
    fmt(li.unitPrice, li.currency),
    String(li.quantity),
    fmt(li.totalPrice, li.currency),
  ]);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: PdfStyles.page },

      // Header
      PdfHeader({
        title: `Rate Quotation ${data.quotationNumber}`,
        subtitle: `Prepared for ${data.customerName}`,
        companyName: data.companyName,
      }),

      // Status badge
      React.createElement(
        Text,
        { style: { ...s.badge, backgroundColor: badgeBg } },
        data.status.toUpperCase()
      ),

      // Route box
      React.createElement(
        View,
        { style: s.routeBox },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "ORIGIN"),
          React.createElement(Text, { style: s.portCode }, data.originPort)
        ),
        React.createElement(Text, { style: s.arrow }, "→"),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "DESTINATION"),
          React.createElement(Text, { style: s.portCode }, data.destinationPort)
        ),
        data.tradeLane
          ? React.createElement(
              View,
              { style: { flex: 1, alignItems: "flex-end" } },
              React.createElement(Text, { style: PdfStyles.label }, "TRADE LANE"),
              React.createElement(Text, { style: PdfStyles.value }, data.tradeLane)
            )
          : null
      ),

      // Info grid
      React.createElement(
        View,
        { style: s.infoGrid },
        // Col 1: Customer
        React.createElement(
          View,
          { style: s.infoCol },
          React.createElement(Text, { style: s.sectionTitle }, "Customer"),
          React.createElement(Text, { style: PdfStyles.label }, "COMPANY"),
          React.createElement(Text, { style: PdfStyles.value }, data.customerName),
          data.contactName
            ? React.createElement(
                View,
                null,
                React.createElement(Text, { style: PdfStyles.label }, "CONTACT"),
                React.createElement(Text, { style: PdfStyles.value }, data.contactName)
              )
            : null,
          data.salesRepName
            ? React.createElement(
                View,
                null,
                React.createElement(Text, { style: PdfStyles.label }, "SALES REP"),
                React.createElement(Text, { style: PdfStyles.value }, data.salesRepName)
              )
            : null
        ),
        // Col 2: Shipment
        React.createElement(
          View,
          { style: s.infoCol },
          React.createElement(Text, { style: s.sectionTitle }, "Shipment Details"),
          React.createElement(Text, { style: PdfStyles.label }, "SERVICE TYPE"),
          React.createElement(Text, { style: PdfStyles.value }, data.serviceType ?? "-"),
          React.createElement(Text, { style: PdfStyles.label }, "CONTAINER"),
          React.createElement(
            Text,
            { style: PdfStyles.value },
            [data.containerType, data.containerSize].filter(Boolean).join(" ") || "-"
          ),
          React.createElement(Text, { style: PdfStyles.label }, "ESTIMATED TEU"),
          React.createElement(Text, { style: PdfStyles.value }, data.estimatedTeu ? String(data.estimatedTeu) : "-")
        ),
        // Col 3: Validity
        React.createElement(
          View,
          { style: s.infoCol },
          React.createElement(Text, { style: s.sectionTitle }, "Validity"),
          React.createElement(Text, { style: PdfStyles.label }, "VALID FROM"),
          React.createElement(Text, { style: PdfStyles.value }, data.validFrom),
          React.createElement(Text, { style: PdfStyles.label }, "VALID TO"),
          React.createElement(Text, { style: PdfStyles.value }, data.validTo),
          React.createElement(Text, { style: PdfStyles.label }, "INCOTERM"),
          React.createElement(Text, { style: PdfStyles.value }, data.incoterm ?? "-")
        )
      ),

      React.createElement(View, { style: PdfStyles.divider }),

      // Charges table
      React.createElement(Text, { style: s.sectionTitle }, "Rate Breakdown"),
      data.lineItems.length > 0
        ? PdfTable({ headers: tableHeaders, rows: tableRows, columnWidths: tableWidths })
        : React.createElement(
            Text,
            { style: { ...PdfStyles.value, fontStyle: "italic" } },
            "No line items"
          ),

      // Total
      data.totalAmount !== undefined
        ? React.createElement(
            View,
            { style: s.totalRow },
            React.createElement(Text, { style: s.totalLabel }, "TOTAL AMOUNT"),
            React.createElement(
              Text,
              { style: s.totalValue },
              fmt(data.totalAmount, data.currency)
            )
          )
        : null,

      // Terms box
      React.createElement(
        View,
        { style: s.termsBox },
        React.createElement(Text, { style: { ...s.sectionTitle, marginTop: 0 } }, "Terms & Conditions"),
        React.createElement(
          View,
          { style: s.infoGrid },
          React.createElement(
            View,
            { style: s.infoCol },
            React.createElement(Text, { style: PdfStyles.label }, "TRANSIT TIME"),
            React.createElement(Text, { style: PdfStyles.value }, data.transitTimeDays ? `${data.transitTimeDays} days` : "-")
          ),
          React.createElement(
            View,
            { style: s.infoCol },
            React.createElement(Text, { style: PdfStyles.label }, "FREE TIME"),
            React.createElement(Text, { style: PdfStyles.value }, data.freeTimeDays ? `${data.freeTimeDays} days` : "-")
          )
        ),
        data.notes
          ? React.createElement(
              View,
              null,
              React.createElement(Text, { style: PdfStyles.label }, "NOTES"),
              React.createElement(Text, { style: { ...PdfStyles.value, lineHeight: 1.4 } }, data.notes)
            )
          : null
      ),

      // Approval info
      data.approvedBy
        ? React.createElement(
            View,
            { style: { marginTop: 10 } },
            React.createElement(Text, { style: PdfStyles.label }, "APPROVED BY"),
            React.createElement(Text, { style: PdfStyles.value }, `${data.approvedBy}${data.approvedAt ? ` on ${data.approvedAt}` : ""}`)
          )
        : null,

      // Footer
      PdfFooter({})
    )
  );
}
