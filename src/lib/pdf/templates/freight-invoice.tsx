import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfStyles, PdfHeader, PdfFooter, PdfTable } from "../renderer";

/* ────────── Types ────────── */

interface InvoiceLineItem {
  lineNumber: number;
  chargeCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export interface FreightInvoiceData {
  invoiceNumber: string;
  invoiceType: string;
  customerName: string;
  customerCode?: string;
  billingAddress?: string;
  currency: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentTerms?: string;
  dueDate?: string;
  issuedAt?: string;
  blNumber?: string;
  voyageRef?: string;
  bookingRef?: string;
  bankDetails?: string;
  notes?: string;
  companyName?: string;
}

/* ────────── Styles ────────── */

const styles = StyleSheet.create({
  customerBox: {
    padding: 8,
    border: "0.5pt solid #cbd5e1",
    marginBottom: 12,
    flexDirection: "row",
  },
  totalsBox: {
    alignSelf: "flex-end",
    width: "45%",
    padding: 8,
    border: "0.5pt solid #cbd5e1",
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 4,
    marginTop: 4,
  },
  bankBox: {
    padding: 8,
    border: "0.5pt solid #cbd5e1",
    marginTop: 12,
  },
});

/* ────────── Helpers ────────── */

function formatMoney(cents: number, currency: string): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

/* ────────── Component ────────── */

export function FreightInvoicePdf({ data }: { data: FreightInvoiceData }) {
  const lineHeaders = ["#", "Charge Code", "Description", "Qty", "Unit Price", "Tax", "Total"];
  const lineRows = data.lineItems.map((li) => [
    String(li.lineNumber),
    li.chargeCode,
    li.description,
    String(li.quantity),
    formatMoney(li.unitPrice, li.currency),
    formatMoney(li.taxAmount, li.currency),
    formatMoney(li.totalAmount, li.currency),
  ]);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: PdfStyles.page },

      // Header
      React.createElement(PdfHeader, {
        title: "FREIGHT INVOICE",
        subtitle: `Invoice No: ${data.invoiceNumber} | Type: ${data.invoiceType.toUpperCase()}`,
        companyName: data.companyName ?? "Shipping Company",
      }),

      // Customer + references
      React.createElement(
        View,
        { style: styles.customerBox },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "BILL TO"),
          React.createElement(Text, { style: { ...PdfStyles.value, fontFamily: "Helvetica-Bold" } }, data.customerName),
          data.customerCode
            ? React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, `Code: ${data.customerCode}`)
            : null,
          data.billingAddress
            ? React.createElement(Text, { style: { fontSize: 8, color: "#64748b", marginTop: 2 } }, data.billingAddress)
            : null
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(Text, { style: PdfStyles.label }, "INVOICE DATE"),
          React.createElement(Text, { style: PdfStyles.value }, data.issuedAt ?? "-"),
          React.createElement(Text, { style: PdfStyles.label }, "DUE DATE"),
          React.createElement(Text, { style: PdfStyles.value }, data.dueDate ?? "-"),
          React.createElement(Text, { style: PdfStyles.label }, "PAYMENT TERMS"),
          React.createElement(Text, { style: PdfStyles.value }, data.paymentTerms ?? "-")
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          data.blNumber
            ? React.createElement(
                View,
                null,
                React.createElement(Text, { style: PdfStyles.label }, "B/L NUMBER"),
                React.createElement(Text, { style: PdfStyles.value }, data.blNumber)
              )
            : null,
          data.voyageRef
            ? React.createElement(
                View,
                null,
                React.createElement(Text, { style: PdfStyles.label }, "VOYAGE REF"),
                React.createElement(Text, { style: PdfStyles.value }, data.voyageRef)
              )
            : null,
          data.bookingRef
            ? React.createElement(
                View,
                null,
                React.createElement(Text, { style: PdfStyles.label }, "BOOKING REF"),
                React.createElement(Text, { style: PdfStyles.value }, data.bookingRef)
              )
            : null
        )
      ),

      // Line items table
      React.createElement(PdfTable, {
        headers: lineHeaders,
        rows: lineRows,
        columnWidths: [5, 14, 30, 7, 14, 14, 16],
      }),

      // Totals
      React.createElement(
        View,
        { style: styles.totalsBox },
        React.createElement(
          View,
          { style: styles.totalRow },
          React.createElement(Text, { style: { fontSize: 8 } }, "Subtotal"),
          React.createElement(Text, { style: { fontSize: 8 } }, formatMoney(data.subtotal, data.currency))
        ),
        data.taxAmount > 0
          ? React.createElement(
              View,
              { style: styles.totalRow },
              React.createElement(Text, { style: { fontSize: 8 } }, "Tax"),
              React.createElement(Text, { style: { fontSize: 8 } }, formatMoney(data.taxAmount, data.currency))
            )
          : null,
        data.discountAmount > 0
          ? React.createElement(
              View,
              { style: styles.totalRow },
              React.createElement(Text, { style: { fontSize: 8 } }, "Discount"),
              React.createElement(Text, { style: { fontSize: 8 } }, `-${formatMoney(data.discountAmount, data.currency)}`)
            )
          : null,
        React.createElement(
          View,
          { style: styles.totalRowBold },
          React.createElement(Text, { style: { fontSize: 10, fontFamily: "Helvetica-Bold" } }, "TOTAL"),
          React.createElement(Text, { style: { fontSize: 10, fontFamily: "Helvetica-Bold" } }, formatMoney(data.totalAmount, data.currency))
        ),
        data.paidAmount > 0
          ? React.createElement(
              View,
              { style: { ...styles.totalRow, marginTop: 4 } },
              React.createElement(Text, { style: { fontSize: 8, color: "#16a34a" } }, "Paid"),
              React.createElement(Text, { style: { fontSize: 8, color: "#16a34a" } }, formatMoney(data.paidAmount, data.currency))
            )
          : null,
        data.outstandingAmount > 0
          ? React.createElement(
              View,
              { style: styles.totalRow },
              React.createElement(Text, { style: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#dc2626" } }, "Outstanding"),
              React.createElement(Text, { style: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#dc2626" } }, formatMoney(data.outstandingAmount, data.currency))
            )
          : null
      ),

      // Bank details
      data.bankDetails
        ? React.createElement(
            View,
            { style: styles.bankBox },
            React.createElement(Text, { style: PdfStyles.label }, "BANK DETAILS"),
            React.createElement(Text, { style: { fontSize: 8, lineHeight: 1.4 } }, data.bankDetails)
          )
        : null,

      // Notes
      data.notes
        ? React.createElement(
            View,
            { style: { marginTop: 10 } },
            React.createElement(Text, { style: PdfStyles.label }, "NOTES"),
            React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, data.notes)
          )
        : null,

      // Footer
      React.createElement(PdfFooter, {})
    )
  );
}
