"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Printer,
  FileText,
  Trash2,
  Check,
  Info,
  PackagePlus,
  ClipboardCheck,
  Banknote,
  CreditCard,
  Building2,
  ShoppingBag,
  Truck,
  Clock,
  X,
  Save,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";
import {
  BuilderProduct,
  BuilderSaleRecord,
  BuilderSaleLineItem,
  BuilderStockSheet,
  BuilderDebtorCustomer,
  BuilderBusinessSettings,
  SellingUnitPrice,
  BUILDER_CATEGORIES,
  formatNairaToWords,
} from "./builders-types";

/* ============================================================================
   IMAGE 3 — DAILY SALES BOOK VIEW
   ============================================================================ */
export function SalesBookView({
  sales,
  expensesByDate,
  closedDays,
  onCloseDay,
  onNewSaleClick,
  businessSettings,
  showToast,
}: {
  sales: BuilderSaleRecord[];
  expensesByDate: Record<string, number>;
  closedDays: Record<string, boolean>;
  onCloseDay: (isoDate: string) => void;
  onNewSaleClick: () => void;
  businessSettings: BuilderBusinessSettings;
  showToast: (msg: string) => void;
}) {
  const [fromDate, setFromDate] = useState("2026-10-25");
  const [toDate, setToDate] = useState("2026-11-23");
  const [expandedDate, setExpandedDate] = useState<string>("2026-11-09");
  const [previewInvoice, setPreviewInvoice] = useState<{
    sale: BuilderSaleRecord;
    mode: "Receipt" | "Invoice";
  } | null>(null);

  // Group sales by date
  const daySummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        isoDate: string;
        dayHeader: string;
        salesList: BuilderSaleRecord[];
        salesCount: number;
        salesValue: number;
        cashReceived: number;
        transferredAmount: number;
        totalIncome: number;
        totalExpenses: number;
        balance: number;
      }
    >();

    sales.forEach((s) => {
      if (fromDate && s.date < fromDate) return;
      if (toDate && s.date > toDate) return;

      const existing = map.get(s.date) || {
        isoDate: s.date,
        dayHeader: s.dayHeader,
        salesList: [],
        salesCount: 0,
        salesValue: 0,
        cashReceived: 0,
        transferredAmount: 0,
        totalIncome: 0,
        totalExpenses: expensesByDate[s.date] || 0,
        balance: 0,
      };

      existing.salesList.push(s);
      existing.salesCount += 1;
      existing.salesValue += s.totalAmountNaira;
      if (s.paymentMethod === "Cash") {
        existing.cashReceived += s.amountPaidNaira;
      } else {
        existing.transferredAmount += s.amountPaidNaira;
      }
      existing.totalIncome = existing.cashReceived + existing.transferredAmount;
      existing.balance = existing.cashReceived - existing.totalExpenses;
      map.set(s.date, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  }, [sales, fromDate, toDate, expensesByDate]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">
            Daily Sales Book
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            One page per day, like the paper sales book. Open a day to see its sales, debts paid and
            expenses.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewSaleClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New sale</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-end gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs"
          />
        </div>
        <button
          type="button"
          onClick={() => showToast(`Showing sales book from ${fromDate} to ${toDate}`)}
          className="h-9 px-4 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 font-bold text-slate-800"
        >
          Show
        </button>
        <button
          type="button"
          onClick={() => {
            setFromDate("2026-10-25");
            setToDate("2026-11-23");
          }}
          className="h-9 px-2 text-[#1D63ED] hover:underline font-semibold"
        >
          Last 30 days
        </button>
      </div>

      {/* Days Accordion & Ledger Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-[#EEF4FF] border-b border-slate-200 px-4 py-2.5 text-[11px] font-bold text-[#12264A]">
          <div className="col-span-4">Date</div>
          <div className="col-span-1 text-center">Sales</div>
          <div className="col-span-2 text-right">Sales value (₦)</div>
          <div className="col-span-2 text-right">Income (₦)</div>
          <div className="col-span-1 text-right">Expenses (₦)</div>
          <div className="col-span-2 text-right">Balance (₦)</div>
        </div>

        {daySummaries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No sales recorded in this date range. Click &quot;+ New sale&quot; to open a day.
          </div>
        ) : (
          daySummaries.map((day) => {
            const isOpen = expandedDate === day.isoDate;
            const isClosed = !!closedDays[day.isoDate];

            // Flatten rows for paper ledger display
            const blankRowCount = Math.max(0, 11 - day.salesList.reduce((s, r) => s + r.items.length + 1, 0));

            return (
              <div key={day.isoDate} className="border-b border-slate-200 last:border-b-0">
                {/* Summary Row */}
                <button
                  type="button"
                  onClick={() => setExpandedDate(isOpen ? "" : day.isoDate)}
                  className={`w-full grid grid-cols-12 items-center px-4 py-3 text-xs text-left transition-colors ${
                    isOpen ? "bg-[#F5F8FF] font-bold" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-2 text-[#12264A]">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-[#1D63ED]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{day.dayHeader}</span>
                    {isClosed && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 text-center tabular-nums">{day.salesCount}</div>
                  <div className="col-span-2 text-right tabular-nums">
                    {day.salesValue.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right tabular-nums">
                    {day.totalIncome.toLocaleString()}
                  </div>
                  <div className="col-span-1 text-right tabular-nums">
                    {day.totalExpenses.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right font-bold tabular-nums">
                    {day.balance.toLocaleString()}
                  </div>
                </button>

                {/* Expanded Paper Sales Book Page (Image 3) */}
                {isOpen && (
                  <div className="p-4 sm:p-6 bg-white border-t border-slate-200">
                    <div className="rounded-xl border border-[#BFD3F8] p-5 sm:p-6 space-y-5 bg-white shadow-inner">
                      {/* Top Header of the Paper Sheet */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-3 max-w-md w-full">
                          <div>
                            <h2 className="text-lg font-black text-[#15357A] tracking-wide border-b-2 border-[#15357A] inline-block pb-0.5">
                              DAILY SALES BOOK
                            </h2>
                            <p className="text-[11px] text-slate-500 mt-1">{day.dayHeader}</p>
                          </div>

                          {/* Dotted Leader Summary Lines */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-slate-600 shrink-0">Cash Received (₦)</span>
                              <span className="flex-1 border-b border-dashed border-slate-300" />
                              <span className="font-bold text-[#12264A] tabular-nums">
                                ₦{day.cashReceived.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-slate-600 shrink-0">Transferred Amount (₦)</span>
                              <span className="flex-1 border-b border-dashed border-slate-300" />
                              <span className="font-bold text-[#12264A] tabular-nums">
                                ₦{day.transferredAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-slate-600 shrink-0">Total Income (₦)</span>
                              <span className="flex-1 border-b border-dashed border-slate-300" />
                              <span className="font-bold text-[#12264A] tabular-nums">
                                ₦{day.totalIncome.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-slate-600 shrink-0">Total Expenses (₦)</span>
                              <span className="flex-1 border-b border-dashed border-slate-300" />
                              <span className="font-bold text-[#12264A] tabular-nums">
                                ₦{day.totalExpenses.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-slate-600 shrink-0">
                                Balance After Expenses (₦)
                              </span>
                              <span className="flex-1 border-b border-dashed border-slate-300" />
                              <span className="font-bold text-[#12264A] tabular-nums">
                                ₦{day.balance.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 pt-1">
                              Sales value ₦{day.salesValue.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Top Right Brand & Close Day */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Image
                              src={businessSettings.logoUrl || "/logos/builders-logo.png"}
                              alt={businessSettings.businessName}
                              width={28}
                              height={28}
                              className="object-contain"
                              unoptimized
                            />
                            <div className="text-right">
                              <p className="text-xs font-black text-[#15357A] leading-none">
                                {businessSettings.businessName
                                  ? businessSettings.businessName.split(" ").slice(0, 2).join(" ")
                                  : "TOP BUILDERS"}
                              </p>
                              <p className="text-[10px] font-semibold text-slate-600">
                                {businessSettings.businessName
                                  ? businessSettings.businessName.split(" ").slice(2).join(" ") ||
                                    "Best Materials"
                                  : "Best Materials"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onCloseDay(day.isoDate)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isClosed ? "Day Closed ✓" : "Close day"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Ruled Paper Ledger Table */}
                      <div className="overflow-x-auto border border-[#8FB2F0] rounded">
                        <table className="w-full text-[11px] border-collapse">
                          <thead>
                            <tr className="bg-[#15357A] text-white font-bold">
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-center w-20">
                                Date
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-left min-w-[200px]">
                                Description
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-20">
                                Qty
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-24">
                                Unit Price (₦)
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-28">
                                Total Amount (₦)
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-20">
                                Deposit
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-left w-36">
                                Out Standing
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-24">
                                Expenses (₦)
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-left w-28">
                                Remarks
                              </th>
                              <th className="py-2 px-2.5 border border-[#8FB2F0] text-left w-20">
                                Sign
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.salesList.map((sale) => (
                              <React.Fragment key={sale.id}>
                                {sale.items.map((item, idx) => (
                                  <tr key={item.id} className="hover:bg-blue-50/30">
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-center font-mono text-slate-700 align-top">
                                      {idx === 0 ? sale.displayDate : ""}
                                    </td>
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-slate-800 align-top">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <p className="font-semibold text-[#12264A]">
                                            {item.description}
                                          </p>
                                          {idx === 0 && (
                                            <div className="mt-1 space-y-1">
                                              <p className="text-[10px] font-bold text-[#1D63ED]">
                                                📄 {sale.invoiceNo}
                                              </p>
                                              <div className="flex items-center gap-1.5">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setPreviewInvoice({ sale, mode: "Receipt" })
                                                  }
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700"
                                                >
                                                  <Printer className="w-2.5 h-2.5" />
                                                  <span>Receipt</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setPreviewInvoice({ sale, mode: "Invoice" })
                                                  }
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700"
                                                >
                                                  <FileText className="w-2.5 h-2.5" />
                                                  <span>Invoice</span>
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {idx + 1}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-right tabular-nums align-top">
                                      {item.qty} {item.unit}
                                    </td>
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-right tabular-nums align-top">
                                      {item.unitPriceNaira.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-right font-semibold tabular-nums align-top">
                                      {item.totalAmountNaira.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-right tabular-nums align-top">
                                      {idx === 0 && sale.amountPaidNaira > 0
                                        ? `₦${sale.amountPaidNaira.toLocaleString()}`
                                        : ""}
                                    </td>
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] align-top">
                                      {idx === 0 && sale.outstandingNaira > 0 && (
                                        <div className="text-[10px] font-bold text-rose-600 leading-tight">
                                          <p>{sale.customerName}</p>
                                          <p>₦{sale.outstandingNaira.toLocaleString()}</p>
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-right align-top" />
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-slate-700 align-top">
                                      {idx === 0 ? sale.remarks || sale.fulfilment : ""}
                                    </td>
                                    <td className="py-2 px-2.5 border border-[#BFD3F8] text-slate-700 align-top">
                                      {idx === 0 ? sale.sign : ""}
                                    </td>
                                  </tr>
                                ))}
                                {sale.items.length > 1 && (
                                  <tr className="bg-[#F2F6FF] font-bold text-[#12264A]">
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8]" />
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8]">
                                      Subtotal ({sale.items.length} items)
                                    </td>
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8]" />
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8]" />
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8] text-right tabular-nums">
                                      {sale.totalAmountNaira.toLocaleString()}
                                    </td>
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8] text-center text-slate-400">
                                      —
                                    </td>
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8]" />
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8]" />
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8]" />
                                    <td className="py-1.5 px-2.5 border border-[#BFD3F8]" />
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}

                            {/* Blank Ruled Ledger Lines like Image 3 */}
                            {Array.from({ length: blankRowCount }).map((_, bIdx) => (
                              <tr key={`blank_${bIdx}`} className="h-7">
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                                <td className="border border-[#BFD3F8]" />
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Receipt / Invoice Modal (Matching Image 1 & Image 2) */}
      {previewInvoice && (() => {
        const handlePrintDocument = () => {
          const printable = document.getElementById("builders-printable-document");
          if (!printable) {
            window.print();
            return;
          }

          // Create an invisible iframe for isolated printing
          let printFrame = document.getElementById("builders-isolated-print-frame") as HTMLIFrameElement;
          if (printFrame) {
            printFrame.remove();
          }
          printFrame = document.createElement("iframe");
          printFrame.id = "builders-isolated-print-frame";
          printFrame.style.position = "fixed";
          printFrame.style.top = "-9999px";
          printFrame.style.left = "-9999px";
          printFrame.style.width = "0";
          printFrame.style.height = "0";
          printFrame.style.border = "none";
          document.body.appendChild(printFrame);

          const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
          if (!frameDoc) {
            window.print();
            return;
          }

          // Collect all stylesheets and styles from document
          let stylesHtml = "";
          document.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
            stylesHtml += node.outerHTML;
          });

          frameDoc.open();
          frameDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${previewInvoice.mode} - ${previewInvoice.sale.invoiceNo}</title>
                ${stylesHtml}
                <style>
                  @page {
                    size: auto;
                    margin: 8mm;
                  }
                  html, body {
                    background: #ffffff !important;
                    color: #000000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  #print-root {
                    width: 100% !important;
                    display: flex !important;
                    justify-content: center !important;
                    padding: 10px !important;
                    background: #ffffff !important;
                  }
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                </style>
              </head>
              <body>
                <div id="print-root">
                  ${printable.outerHTML}
                </div>
              </body>
            </html>
          `);
          frameDoc.close();

          // Allow fonts/images to settle before invoking native print
          setTimeout(() => {
            try {
              printFrame.contentWindow?.focus();
              printFrame.contentWindow?.print();
            } catch {
              window.print();
            }
          }, 350);
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 overflow-y-auto builders-print-backdrop">
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden my-auto builders-print-card">
              {/* Modal Control Bar (Hidden in print) */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#12264A] text-white border-b border-slate-700 shrink-0 builders-no-print">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewInvoice({ ...previewInvoice, mode: "Receipt" })
                      }
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                        previewInvoice.mode === "Receipt"
                          ? "bg-[#1D63ED] text-white shadow-xs"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      Thermal Receipt (Image 1)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewInvoice({ ...previewInvoice, mode: "Invoice" })
                      }
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                        previewInvoice.mode === "Invoice"
                          ? "bg-[#1D63ED] text-white shadow-xs"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      Cash Sales Invoice (Image 2)
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {previewInvoice.sale.invoiceNo} · {previewInvoice.sale.customerName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintDocument}
                    className="px-3.5 py-1.5 rounded-lg bg-[#1D63ED] hover:bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print {previewInvoice.mode}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewInvoice(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Document Canvas */}
              <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-slate-800/40 builders-print-canvas">
                <div
                  id="builders-printable-document"
                  className="bg-white text-slate-900 shadow-xl rounded-lg overflow-hidden transition-all"
                >
                {previewInvoice.mode === "Receipt" ? (
                  /* =========================================================
                     IMAGE 1 — THERMAL CASH SALES RECEIPT VIEW
                     ========================================================= */
                  <div className="w-full max-w-[380px] p-5 sm:p-6 font-mono text-black text-xs leading-tight bg-white mx-auto select-text">
                    {/* Centered Business Header */}
                    <div className="text-center space-y-1 mb-2">
                      <div className="w-14 h-14 mx-auto mb-1 flex items-center justify-center">
                        <Image
                          src={businessSettings.logoUrl || "/logos/builders-logo.png"}
                          alt={businessSettings.businessName}
                          width={52}
                          height={52}
                          className="object-contain max-h-14 max-w-14"
                          unoptimized
                        />
                      </div>
                      <h2 className="font-black text-[13px] tracking-wide uppercase leading-snug">
                        {businessSettings.businessName}
                      </h2>
                      <p className="text-[11px] font-bold">RC: {businessSettings.rcNumber}</p>
                      <p className="text-[10px] leading-tight text-slate-800">
                        NAOWA Mega Plaza, Ojo Cantonement, Klm 4,
                      </p>
                      <p className="text-[10px] leading-tight text-slate-800">
                        LASU/Isheri Road, Iba, Ojo, Lagos.
                      </p>
                      <p className="text-[10px] font-bold pt-0.5">{businessSettings.phones}</p>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-b border-dashed border-black/80 my-2.5" />

                    {/* Receipt Title & Invoice Number */}
                    <div className="text-center space-y-0.5 py-0.5">
                      <h3 className="font-black text-sm tracking-widest uppercase">
                        CASH SALES RECEIPT
                      </h3>
                      <p className="font-black text-xs">
                        No: &nbsp;{previewInvoice.sale.invoiceNo}
                      </p>
                    </div>

                    {/* Sale Metadata */}
                    <div className="space-y-0.5 text-[11px] pt-1">
                      <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {previewInvoice.sale.date
                          ? previewInvoice.sale.date.split("-").reverse().join("/")
                          : "09/11/2026"}
                        ,{" "}
                        {previewInvoice.sale.createdAt
                          ? new Date(previewInvoice.sale.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "13:34"}
                      </p>
                      <p>
                        <span className="font-semibold">Customer:</span>{" "}
                        {previewInvoice.sale.customerName}
                      </p>
                      <p>
                        <span className="font-semibold">Tel:</span>{" "}
                        {previewInvoice.sale.customerPhone || "08000000104"}
                      </p>
                      <p>
                        <span className="font-semibold">Served by:</span>{" "}
                        {previewInvoice.sale.salesRep || previewInvoice.sale.sign || "Chima Ezenwa"}
                      </p>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-b border-dashed border-black/80 my-2.5" />

                    {/* Item Table Header */}
                    <div className="flex justify-between font-black text-[11px] pb-1">
                      <span>QTY &nbsp;ITEM</span>
                      <span>AMOUNT</span>
                    </div>

                    {/* Item Rows */}
                    <div className="space-y-2 text-[11px]">
                      {previewInvoice.sale.items.map((item) => (
                        <div key={item.id} className="space-y-0.5">
                          <div className="flex justify-between items-baseline gap-2">
                            <div className="flex items-baseline gap-2.5 min-w-0">
                              <span className="w-3 font-bold shrink-0">{item.qty}</span>
                              <span className="font-medium truncate">{item.description}</span>
                            </div>
                            <span className="font-bold tabular-nums shrink-0">
                              {item.totalAmountNaira.toLocaleString()}
                            </span>
                          </div>
                          <div className="pl-5 text-[10px] text-slate-700">
                            @ {item.unitPriceNaira.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-b border-dashed border-black/80 my-2.5" />

                    {/* Totals */}
                    <div className="space-y-1 text-right text-xs">
                      <div className="flex justify-end gap-6 font-black">
                        <span>TOTAL (₦)</span>
                        <span className="tabular-nums w-24 text-right">
                          {previewInvoice.sale.totalAmountNaira.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-end gap-6 font-black">
                        <span>BALANCE (₦)</span>
                        <span className="tabular-nums w-24 text-right">
                          {(
                            previewInvoice.sale.outstandingNaira ??
                            Math.max(
                              0,
                              previewInvoice.sale.totalAmountNaira -
                                previewInvoice.sale.amountPaidNaira
                            )
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-b border-dashed border-black/80 my-2.5" />

                    {/* Amount in words */}
                    <div className="text-[11px] space-y-0.5">
                      <p className="font-black">Amount in words:</p>
                      <p className="font-semibold text-slate-900 leading-snug">
                        {formatNairaToWords(previewInvoice.sale.totalAmountNaira)}
                      </p>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-b border-dashed border-black/80 my-2.5" />

                    {/* Receipt Footers */}
                    <div className="text-center space-y-1 text-[10px] pt-1">
                      <p>Goods sold in good condition are not refundable.</p>
                      <p>No refund of payment made.</p>
                      <p className="font-black italic text-xs pt-1">Quality Guaranteed!</p>
                      <p className="pt-0.5 font-medium">Thank you for your patronage!</p>
                    </div>
                  </div>
                ) : (
                  /* =========================================================
                     IMAGE 2 — FORMAL CASH SALES INVOICE VIEW
                     ========================================================= */
                  <div className="w-full max-w-2xl sm:max-w-3xl p-6 sm:p-8 bg-white text-slate-900 space-y-5 select-text">
                    {/* Top Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      {/* Left: Logo & Business Branding */}
                      <div className="md:col-span-5 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 flex items-center justify-center shrink-0">
                            <Image
                              src={businessSettings.logoUrl || "/logos/builders-logo.png"}
                              alt={businessSettings.businessName}
                              width={64}
                              height={64}
                              className="object-contain max-h-16 max-w-16"
                              unoptimized
                            />
                          </div>
                          <p className="text-xs font-black text-[#1D63ED]">
                            RC: {businessSettings.rcNumber}
                          </p>
                        </div>

                        <div>
                          <h1 className="text-2xl sm:text-3xl font-black text-[#15357A] tracking-tight leading-none uppercase">
                            TOP BUILDERS
                          </h1>
                          <div className="inline-block bg-[#1D63ED] text-white px-2.5 py-0.5 text-xs font-black tracking-widest uppercase rounded-xs mt-1">
                            BEST MATERIALS LTD.
                          </div>
                          <p className="text-xs italic font-bold text-[#1D63ED] mt-1.5">
                            {businessSettings.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Right: Vertical Line & Company Contact Information */}
                      <div className="md:col-span-7 border-l-4 border-[#1D63ED] pl-3.5 space-y-1.5 text-[11px] leading-tight text-[#1D63ED] font-semibold">
                        <p className="leading-snug">
                          {businessSettings.dealsIn}
                        </p>
                        <div className="flex items-start gap-1.5 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{businessSettings.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-bold">{businessSettings.phones}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>{businessSettings.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Customer Details & Cash Sales Invoice Title */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
                      {/* Left: Rounded Blue Box Customer Card */}
                      <div className="md:col-span-6 border-2 border-[#1D63ED] rounded-2xl p-3.5 space-y-2 bg-white">
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-xs text-[#1D63ED] w-12 shrink-0">
                            Name:
                          </span>
                          <span className="flex-1 border-b border-[#1D63ED] pb-0.5 px-1 font-bold text-slate-900 text-xs truncate">
                            {previewInvoice.sale.customerName}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-xs text-[#1D63ED] w-12 shrink-0">
                            Tel:
                          </span>
                          <span className="flex-1 border-b border-[#1D63ED] pb-0.5 px-1 font-bold text-slate-900 text-xs">
                            {previewInvoice.sale.customerPhone || "08000000104"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Invoice Number, CASH SALES INVOICE & Date */}
                      <div className="md:col-span-6 flex flex-col items-center md:items-end text-center md:text-right space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-black text-[#1D63ED]">Nº.</span>
                          <span className="font-black text-rose-600 text-base">
                            {previewInvoice.sale.invoiceNo}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#1D63ED] tracking-wide uppercase border-b-4 border-[#1D63ED] pb-0.5 inline-block">
                          CASH SALES INVOICE
                        </h2>
                        <div className="flex items-baseline gap-2 pt-1 text-xs">
                          <span className="font-black text-[#1D63ED]">Date:</span>
                          <span className="border-b-2 border-[#1D63ED] px-4 font-bold text-slate-900">
                            {previewInvoice.sale.displayDate || "09/11/26"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Table: Blue Solid Header & Grid Lines (Image 2) */}
                    <div className="overflow-x-auto border border-[#8FB2F0] rounded">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#1D63ED] text-white font-black text-center text-[11px] uppercase tracking-wide">
                            <th className="py-2 px-2 border border-[#8FB2F0] w-16">QTY</th>
                            <th className="py-2 px-3 border border-[#8FB2F0] text-left min-w-[220px]">
                              DESCRIPTION OF GOODS
                            </th>
                            <th className="py-2 px-2 border border-[#8FB2F0] w-16">QTY</th>
                            <th className="py-2 px-3 border border-[#8FB2F0] text-right w-24">
                              RATE
                            </th>
                            <th className="py-2 px-3 border border-[#8FB2F0] text-right w-28">
                              AMOUNT
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Active Item Rows */}
                          {previewInvoice.sale.items.map((item) => (
                            <tr key={item.id} className="h-7 text-[11px]">
                              <td className="py-1 px-2 border border-[#8FB2F0] text-center font-bold">
                                {item.qty}
                              </td>
                              <td className="py-1 px-3 border border-[#8FB2F0] font-semibold text-slate-800">
                                {item.description}
                              </td>
                              <td className="py-1 px-2 border border-[#8FB2F0] text-center font-bold">
                                {item.qty}
                              </td>
                              <td className="py-1 px-3 border border-[#8FB2F0] text-right tabular-nums font-semibold">
                                {item.unitPriceNaira.toLocaleString()}
                              </td>
                              <td className="py-1 px-3 border border-[#8FB2F0] text-right tabular-nums font-bold">
                                {item.totalAmountNaira.toLocaleString()}
                              </td>
                            </tr>
                          ))}

                          {/* Empty Ruled Lines down the page like Image 2 */}
                          {Array.from({
                            length: Math.max(9, 12 - previewInvoice.sale.items.length),
                          }).map((_, rIdx) => (
                            <tr key={`blank_row_${rIdx}`} className="h-6 sm:h-7">
                              <td className="border border-[#8FB2F0]" />
                              <td className="border border-[#8FB2F0]" />
                              <td className="border border-[#8FB2F0]" />
                              <td className="border border-[#8FB2F0]" />
                              <td className="border border-[#8FB2F0]" />
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom Summary & Total Section */}
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Non-refundable terms */}
                        <p className="text-xs italic text-[#1D63ED] font-medium max-w-md">
                          Goods sold in good condition are not refundable. No refund of payment made.
                        </p>

                        {/* TOTAL ₦ Box */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="text-lg font-black text-[#1D63ED] tracking-wide">
                            TOTAL ₦
                          </span>
                          <div className="border-2 border-[#1D63ED] px-4 py-1.5 text-right font-black text-lg text-slate-900 min-w-[150px] bg-white">
                            {previewInvoice.sale.totalAmountNaira.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Amount in words */}
                      <div className="flex items-baseline gap-2 text-xs">
                        <span className="italic font-bold text-[#1D63ED] shrink-0">
                          Amount in words
                        </span>
                        <span className="flex-1 border-b-2 border-[#1D63ED] pb-0.5 px-2 font-bold text-slate-900 leading-tight">
                          {formatNairaToWords(previewInvoice.sale.totalAmountNaira)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Signatures & Quality Pill Badge (Image 2) */}
                    <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-center">
                      {/* Customer's Signature */}
                      <div className="space-y-1">
                        <div className="border-b-2 border-[#1D63ED] w-full" />
                        <p className="text-[11px] italic text-[#1D63ED] font-semibold">
                          Customer&apos;s Signature
                        </p>
                      </div>

                      {/* Center Pill Button */}
                      <div className="flex justify-center pb-1">
                        <div className="px-6 py-2 rounded-full bg-[#1D63ED] text-white font-black text-xs uppercase tracking-wider shadow-sm">
                          Quality Guaranteed!
                        </div>
                      </div>

                      {/* Company Signature */}
                      <div className="space-y-1">
                        <div className="border-b-2 border-[#1D63ED] w-full" />
                        <p className="text-[11px] italic text-[#1D63ED] font-semibold">
                          For: {businessSettings.businessName ? businessSettings.businessName.replace(/ Ltd\.?/i, "") : "Top Builders Best Materials"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    })()}
  </div>
);
}

/* ============================================================================
   IMAGE 4 — NEW SALE (CASH SALES INVOICE) VIEW
   ============================================================================ */
export function NewSaleView({
  products,
  customers,
  paymentAccounts,
  onCompleteSale,
}: {
  products: BuilderProduct[];
  customers: BuilderDebtorCustomer[];
  paymentAccounts: { name: string; active: boolean }[];
  onCompleteSale: (saleData: {
    items: BuilderSaleLineItem[];
    customerId: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    amountPaidNaira: number;
    fulfilment: "Self collection" | "Delivered" | "To deliver";
    remarks: string;
  }) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<BuilderSaleLineItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("walkin");
  const [customName, setCustomName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [amountPaidTouched, setAmountPaidTouched] = useState(false);
  const [fulfilment, setFulfilment] = useState<"Self collection" | "Delivered" | "To deliver">(
    "Self collection"
  );
  const [remarks, setRemarks] = useState("");

  const saleCategories = [
    "All",
    "Cement",
    "Iron Rods",
    "Nails",
    "Binding Wire",
    "Roofing",
    "PVC Ceiling",
    "Plumbing",
    "Tiles",
    "Paints",
    "Door Locks",
    "Tools",
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (
        search.trim() &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.itemNo.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [products, activeCategory, search]);

  const totalNaira = useMemo(
    () => cart.reduce((sum, item) => sum + item.totalAmountNaira, 0),
    [cart]
  );

  const effectiveAmountPaid = amountPaidTouched ? amountPaid : totalNaira;
  const balanceOwed = Math.max(0, totalNaira - effectiveAmountPaid);

  const handleAddProductToInvoice = (product: BuilderProduct) => {
    const defaultUnit =
      product.sellingUnits.find((u) => u.isDefault) || product.sellingUnits[0];
    if (!defaultUnit) return;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.productId === product.id && it.unit === defaultUnit.unit
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        const updatedQty = next[existingIdx].qty + 1;
        next[existingIdx] = {
          ...next[existingIdx],
          qty: updatedQty,
          totalAmountNaira: updatedQty * next[existingIdx].unitPriceNaira,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          productId: product.id,
          itemNo: product.itemNo,
          description: `${product.name} (${defaultUnit.unit})`,
          unit: defaultUnit.unit,
          qty: 1,
          containsBase: defaultUnit.containsBase,
          unitPriceNaira: defaultUnit.priceNaira,
          totalAmountNaira: defaultUnit.priceNaira,
        },
      ];
    });
  };

  const handleUpdateQty = (lineId: string, nextQty: number) => {
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((l) => l.id !== lineId));
      return;
    }
    setCart((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? { ...l, qty: nextQty, totalAmountNaira: nextQty * l.unitPriceNaira }
          : l
      )
    );
  };

  const activeAccountNames = [
    "Cash",
    ...paymentAccounts.filter((a) => a.active).map((a) => a.name),
  ];

  const handleSaveAndPrint = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let finalName = "Walk-in";
    let finalPhone = customPhone.trim();

    if (selectedCustomerId !== "walkin") {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (found) {
        finalName = found.name;
        finalPhone = found.phone;
      }
    } else if (customName.trim()) {
      finalName = customName.trim();
    }

    onCompleteSale({
      items: cart,
      customerId: selectedCustomerId,
      customerName: finalName,
      customerPhone: finalPhone,
      paymentMethod,
      amountPaidNaira: effectiveAmountPaid,
      fulfilment,
      remarks: remarks.trim(),
    });

    setCart([]);
    setAmountPaid(0);
    setAmountPaidTouched(false);
    setCustomName("");
    setCustomPhone("");
    setRemarks("");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">New Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product Picker (Image 4 Left) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or item no."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs text-slate-800 focus:outline-none focus:border-[#1D63ED]"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {saleCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  activeCategory === cat
                    ? "bg-[#1D63ED] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 2-Column Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredProducts.map((prod) => {
              const defUnit =
                prod.sellingUnits.find((u) => u.isDefault) || prod.sellingUnits[0];
              const isLow = prod.stockOnHand <= prod.reorderLevel;

              return (
                <div
                  key={prod.id}
                  onClick={() => handleAddProductToInvoice(prod)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-[#1D63ED] bg-white hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#12264A] truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      <strong className="text-slate-900">
                        ₦{(defUnit?.priceNaira || 0).toLocaleString()}
                      </strong>{" "}
                      /{defUnit?.unit || prod.baseUnit} ·{" "}
                      <span
                        className={
                          isLow
                            ? "text-emerald-700 font-medium"
                            : "text-emerald-700 font-medium"
                        }
                      >
                        {prod.stockOnHand} {prod.baseUnit} in stock
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Add ${prod.name}`}
                    className="w-7 h-7 rounded-full bg-[#1D63ED] group-hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Cash Sales Invoice Panel (Image 4 Right) */}
        <form
          onSubmit={handleSaveAndPrint}
          className="lg:col-span-6 bg-white rounded-xl border-2 border-[#7CA6F5] p-5 space-y-4 shadow-2xs text-xs"
        >
          <h2 className="text-lg font-extrabold text-[#12264A]">Cash Sales Invoice</h2>

          {/* Items Box */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              Items ({cart.length})
            </label>
            {cart.length === 0 ? (
              <div className="h-14 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                Tap a product to add it.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {cart.map((line) => (
                  <div
                    key={line.id}
                    className="p-2.5 flex items-center justify-between gap-2 bg-slate-50/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#12264A] truncate">{line.description}</p>
                      <p className="text-[11px] text-slate-500">
                        ₦{line.unitPriceNaira.toLocaleString()} × {line.qty} {line.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(line.id, line.qty - 1)}
                        className="w-6 h-6 rounded border border-slate-300 bg-white font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold tabular-nums">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(line.id, line.qty + 1)}
                        className="w-6 h-6 rounded border border-slate-300 bg-white font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="w-24 text-right font-bold text-[#12264A] tabular-nums">
                      ₦{line.totalAmountNaira.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(line.id, 0)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOTAL ₦ Bar */}
          <div className="bg-[#EEF4FF] rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="font-extrabold text-[#12264A] text-xs uppercase">TOTAL ₦</span>
            <span className="text-lg font-black text-[#12264A] tabular-nums">
              {totalNaira.toLocaleString()}
            </span>
          </div>

          {/* Customer */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-[#12264A]">Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
            >
              <option value="walkin">Walk-in / new customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
            {selectedCustomerId === "walkin" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Name (optional)"
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/80 text-xs"
                />
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Phone"
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/80 text-xs"
                />
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-[#12264A]">Payment</label>
            <div className="grid grid-cols-3 gap-2">
              {activeAccountNames.slice(0, 3).map((accName) => (
                <button
                  key={accName}
                  type="button"
                  onClick={() => setPaymentMethod(accName)}
                  className={`h-9 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-colors ${
                    paymentMethod === accName
                      ? "bg-[#1D63ED] border-[#1D63ED] text-white shadow-2xs"
                      : "bg-[#F4F7FC] border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {accName === "Cash" ? (
                    <Banknote className="w-3.5 h-3.5" />
                  ) : accName.includes("POS") ? (
                    <CreditCard className="w-3.5 h-3.5" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate">{accName}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end pt-1">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Amount paid (₦)</label>
                <NumberInput
                  value={effectiveAmountPaid}
                  onChange={(val) => {
                    setAmountPaidTouched(true);
                    setAmountPaid(Number(val) || 0);
                  }}
                  min={0}
                  className="h-10 bg-slate-50/80"
                />
              </div>
              <div
                className={`h-10 px-3 rounded-lg flex flex-col justify-center ${
                  balanceOwed === 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {balanceOwed === 0 ? (
                  <>
                    <span className="text-[10px] font-bold">Fully paid</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold">On credit / owing</span>
                    <span className="font-extrabold text-xs">
                      ₦{balanceOwed.toLocaleString()} unpaid
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fulfilment */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-[#12264A]">Fulfilment</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Self collection", "Delivered", "To deliver"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFulfilment(mode)}
                  className={`h-9 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-colors ${
                    fulfilment === mode
                      ? "bg-[#1D63ED] border-[#1D63ED] text-white shadow-2xs"
                      : "bg-[#F4F7FC] border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {mode === "Self collection" ? (
                    <ShoppingBag className="w-3.5 h-3.5" />
                  ) : mode === "Delivered" ? (
                    <Truck className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate">{mode}</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Remarks (optional), e.g. deliver to Ojo site"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/80 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={cart.length === 0}
            className="w-full h-10 rounded-lg bg-[#1D63ED] hover:bg-blue-700 disabled:bg-[#8BAEF5] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save &amp; print</span>
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   IMAGE 5 — PRODUCTS & STOCK VIEW
   ============================================================================ */
export function ProductsStockView({
  products,
  onStockInClick,
  onAddProductClick,
  onEditProductClick,
}: {
  products: BuilderProduct[];
  onStockInClick: () => void;
  onAddProductClick: () => void;
  onEditProductClick: (product: BuilderProduct) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All active");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter === "All active" && !p.active) return false;
      if (statusFilter === "Low stock" && p.stockOnHand > p.reorderLevel) return false;
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (
        search.trim() &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.itemNo.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [products, statusFilter, selectedCategory, search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">
            Products &amp; Stock
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your products, their prices and how much is in stock.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStockInClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs"
          >
            <PackagePlus className="w-3.5 h-3.5 text-slate-600" />
            <span>Stock in</span>
          </button>
          <button
            type="button"
            onClick={onAddProductClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Product</span>
          </button>
        </div>
      </div>

      {/* Search & Status Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or item no."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-100/80 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 min-w-[140px]"
        >
          <option value="All active">All active</option>
          <option value="Low stock">Low stock only</option>
          <option value="All">All products</option>
        </select>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {BUILDER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
              selectedCategory === cat
                ? "bg-[#1D63ED] border-[#1D63ED] text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#EEF4FF] border-b border-slate-200 text-[#12264A] font-bold text-[11px]">
                <th className="py-3 px-4 w-24">Item No.</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">
                  Stock on hand <span className="font-normal text-slate-500">(base unit)</span>
                </th>
                <th className="py-3 px-4">Price per selling unit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => {
                const isLow = prod.stockOnHand <= prod.reorderLevel;
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 font-semibold">
                      {prod.itemNo}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#12264A]">{prod.name}</p>
                      <p className="text-[11px] text-slate-400">{prod.category}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p
                        className={`font-bold tabular-nums ${
                          isLow ? "text-rose-600" : "text-slate-900"
                        }`}
                      >
                        {prod.stockOnHand} {prod.baseUnit}
                      </p>
                      {prod.secondaryStockText && (
                        <p className="text-[10px] text-slate-400">{prod.secondaryStockText}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      {prod.sellingUnits.map((su) => (
                        <p key={su.unit} className="text-slate-600 tabular-nums">
                          <span className="text-slate-400">{su.unit}:</span>{" "}
                          <strong className="text-slate-900">
                            ₦{su.priceNaira.toLocaleString()}
                          </strong>
                        </p>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          Low stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          In stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onEditProductClick(prod)}
                        className="px-3 py-1 rounded border border-[#95B6F7] text-[#1D63ED] hover:bg-blue-50 font-bold text-[11px]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">{filtered.length} products</p>
    </div>
  );
}

/* ============================================================================
   IMAGE 6 — ADD / EDIT PRODUCT VIEW
   ============================================================================ */
export function AddProductView({
  nextItemNo,
  initialProduct,
  onCancel,
  onSaveProduct,
}: {
  nextItemNo: string;
  initialProduct?: BuilderProduct | null;
  onCancel: () => void;
  onSaveProduct: (product: BuilderProduct) => void;
}) {
  const [itemNo, setItemNo] = useState(initialProduct?.itemNo || nextItemNo);
  const [name, setName] = useState(initialProduct?.name || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [category, setCategory] = useState(initialProduct?.category || "");
  const [baseUnit, setBaseUnit] = useState(initialProduct?.baseUnit || "pc");
  const [reorderLevel, setReorderLevel] = useState<number>(initialProduct?.reorderLevel ?? 10);
  const [openingStock, setOpeningStock] = useState<number>(initialProduct?.stockOnHand ?? 0);
  const [costPrice, setCostPrice] = useState<number>(initialProduct?.costPriceNaira ?? 0);

  const unitOptions = [
    { unit: "pc", label: "Piece (pc)" },
    { unit: "bag", label: "Bag (bag)" },
    { unit: "lgth", label: "Length (lgth)" },
    { unit: "kg", label: "Kilogram (kg)" },
    { unit: "sht", label: "Sheet (sht)" },
    { unit: "ctn", label: "Carton (ctn)" },
    { unit: "bkt", label: "Bucket (bkt)" },
    { unit: "bdl", label: "Bundle (bdl)" },
    { unit: "box", label: "Box (box)" },
  ];

  const currentBaseLabel =
    unitOptions.find((u) => u.unit === baseUnit)?.label || `Piece (${baseUnit})`;

  const [sellingUnits, setSellingUnits] = useState<SellingUnitPrice[]>(
    initialProduct?.sellingUnits || [
      {
        unit: "pc",
        label: "Piece (pc)",
        containsBase: 1,
        priceNaira: 0,
        isDefault: true,
      },
    ]
  );

  const handleBaseUnitChange = (newBase: string) => {
    const lbl = unitOptions.find((u) => u.unit === newBase)?.label || newBase;
    setBaseUnit(newBase);
    setSellingUnits((prev) =>
      prev.map((su, idx) => (idx === 0 ? { ...su, unit: newBase, label: lbl, containsBase: 1 } : su))
    );
  };

  const handleAddSellingUnit = () => {
    setSellingUnits((prev) => [
      ...prev,
      {
        unit: "ctn",
        label: "Carton (ctn)",
        containsBase: 25,
        priceNaira: 0,
        isDefault: false,
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const product: BuilderProduct = {
      id: initialProduct?.id || `bp_${Date.now()}`,
      itemNo: itemNo.trim() || nextItemNo,
      name: name.trim(),
      category: category.trim() || "Others",
      description: description.trim(),
      baseUnit,
      baseUnitLabel: currentBaseLabel,
      reorderLevel: Number(reorderLevel) || 0,
      stockOnHand: Number(openingStock) || 0,
      costPriceNaira: Number(costPrice) || undefined,
      sellingUnits,
      active: true,
    };
    onSaveProduct(product);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5 text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">
          {initialProduct ? `Edit product (${initialProduct.itemNo})` : "Add product"}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Details, selling units, prices and opening stock.
        </p>
      </div>

      {/* Card 1: Product details */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-[#EEF4FF] px-5 py-3 border-b border-slate-200">
          <h2 className="font-extrabold text-[#12264A] text-sm">Product details</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-[#12264A] mb-1">Item no.</label>
            <input
              type="text"
              value={itemNo}
              onChange={(e) => setItemNo(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 font-semibold text-slate-800"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              The number on his stock sheet, e.g. 004
            </p>
          </div>
          <div>
            <label className="block font-bold text-[#12264A] mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dangote Cement 50kg"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-[#12264A] mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 50kg bag, mild steel"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
            />
            <p className="text-[10px] text-slate-400 mt-1">e.g. 50kg bag, mild steel</p>
          </div>
          <div>
            <label className="block font-bold text-[#12264A] mb-1">Category</label>
            <input
              type="text"
              list="builder-category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Cement"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
            />
            <datalist id="builder-category-list">
              {BUILDER_CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="text-[10px] text-slate-400 mt-1">Pick one, or type a new category.</p>
          </div>

          <div>
            <label className="block font-bold text-[#12264A] mb-1">
              Base unit (stock is counted in this)
            </label>
            <select
              value={baseUnit}
              onChange={(e) => handleBaseUnitChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800"
            >
              {unitOptions.map((u) => (
                <option key={u.unit} value={u.unit}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#12264A] mb-1">
              Reorder level ({baseUnit})
            </label>
            <NumberInput
              value={reorderLevel}
              onChange={(v) => setReorderLevel(Number(v) || 0)}
              min={0}
              className="h-10 bg-slate-100/80"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Shown as low stock when it gets to this or below. Leave empty for none.
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#12264A] mb-1">
              Opening stock ({baseUnit})
            </label>
            <NumberInput
              value={openingStock}
              onChange={(v) => setOpeningStock(Number(v) || 0)}
              min={0}
              className="h-10 bg-slate-100/80"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              How many are in the shop right now. Leave empty if none.
            </p>
          </div>
          <div>
            <label className="block font-bold text-[#12264A] mb-1">
              Cost price per {baseUnit} (₦, optional)
            </label>
            <NumberInput
              value={costPrice}
              onChange={(v) => setCostPrice(Number(v) || 0)}
              min={0}
              className="h-10 bg-slate-100/80"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Selling units and prices */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-[#EEF4FF] px-5 py-3 border-b border-slate-200">
          <h2 className="font-extrabold text-[#12264A] text-sm">Selling units and prices</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-12 gap-3 text-[11px] font-semibold text-slate-500">
            <div className="col-span-5">Selling unit</div>
            <div className="col-span-3">Contains (in {baseUnit})</div>
            <div className="col-span-3">Price (₦)</div>
            <div className="col-span-1 text-center">Default</div>
          </div>

          {sellingUnits.map((su, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5">
                {idx === 0 ? (
                  <div className="h-10 px-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{su.label}</span>
                    <span className="text-[10px] font-bold text-[#1D63ED]">Base unit</span>
                  </div>
                ) : (
                  <select
                    value={su.unit}
                    onChange={(e) => {
                      const nextUnit = e.target.value;
                      const lbl =
                        unitOptions.find((u) => u.unit === nextUnit)?.label || nextUnit;
                      setSellingUnits((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, unit: nextUnit, label: lbl } : item
                        )
                      );
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white"
                  >
                    {unitOptions.map((u) => (
                      <option key={u.unit} value={u.unit}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="col-span-3">
                <NumberInput
                  value={su.containsBase}
                  disabled={idx === 0}
                  onChange={(v) =>
                    setSellingUnits((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, containsBase: Number(v) || 1 } : item
                      )
                    )
                  }
                  min={1}
                  className="h-10 bg-slate-100/80"
                />
              </div>
              <div className="col-span-3">
                <NumberInput
                  value={su.priceNaira}
                  onChange={(v) =>
                    setSellingUnits((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, priceNaira: Number(v) || 0 } : item
                      )
                    )
                  }
                  min={0}
                  className="h-10 bg-slate-100/80"
                />
              </div>
              <div className="col-span-1 flex items-center justify-center gap-1">
                <input
                  type="radio"
                  name="defaultSellingUnit"
                  checked={su.isDefault}
                  onChange={() =>
                    setSellingUnits((prev) =>
                      prev.map((item, i) => ({ ...item, isDefault: i === idx }))
                    )
                  }
                  className="w-4 h-4 accent-[#1D63ED]"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddSellingUnit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D63ED] hover:underline"
          >
            <Plus className="w-3.5 h-3.5 rounded-full border border-[#1D63ED]" />
            <span>Add selling unit</span>
          </button>

          <div className="p-3 rounded-lg bg-[#EEF4FF] text-[#15357A] text-[11px] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#1D63ED] shrink-0" />
            <span>
              Stock is always counted in the base unit. Example: nails counted in kg, sold by the kg
              or by the carton that contains 25 kg.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold shadow-xs"
        >
          {initialProduct ? "Save changes" : "Add product"}
        </button>
      </div>
    </form>
  );
}

/* ============================================================================
   IMAGE 7 — STOCK IN VIEW
   ============================================================================ */
export function StockInView({
  products,
  onCancel,
  onSaveStockIn,
}: {
  products: BuilderProduct[];
  onCancel: () => void;
  onSaveStockIn: (payload: {
    supplier: string;
    waybillNo: string;
    date: string;
    note: string;
    items: {
      productId: string;
      unit: string;
      containsBase: number;
      qty: number;
      costPerUnit: number;
    }[];
  }) => void;
}) {
  const [supplier, setSupplier] = useState("");
  const [waybillNo, setWaybillNo] = useState("");
  const [date, setDate] = useState("2026-11-23");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<
    {
      id: string;
      productId: string;
      unit: string;
      containsBase: number;
      qty: number;
      costPerUnit: number;
    }[]
  >([
    {
      id: "si_1",
      productId: "",
      unit: "",
      containsBase: 1,
      qty: 0,
      costPerUnit: 0,
    },
  ]);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `si_${Date.now()}`,
        productId: "",
        unit: "",
        containsBase: 1,
        qty: 0,
        costPerUnit: 0,
      },
    ]);
  };

  const handleProductSelect = (rowId: string, prodId: string) => {
    const found = products.find((p) => p.id === prodId);
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              productId: prodId,
              unit: found?.baseUnit || "",
              containsBase: 1,
              costPerUnit: found?.costPriceNaira || 0,
            }
          : r
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = rows.filter((r) => r.productId && r.qty > 0);
    if (validItems.length === 0) return;

    onSaveStockIn({
      supplier: supplier.trim() || "Supplier Delivery",
      waybillNo: waybillNo.trim(),
      date,
      note: note.trim(),
      items: validItems,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-5 text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Stock In</h1>
        <p className="text-xs text-slate-500 mt-0.5">Record goods received from a supplier.</p>
      </div>

      {/* Top Supplier & Date Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-2xs">
        <div>
          <label className="block font-bold text-[#12264A] mb-1">Supplier</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="e.g. Dangote Depot, Ijora"
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
          />
        </div>
        <div>
          <label className="block font-bold text-[#12264A] mb-1">
            Invoice / waybill no. (optional)
          </label>
          <input
            type="text"
            value={waybillNo}
            onChange={(e) => setWaybillNo(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
          />
        </div>
        <div>
          <label className="block font-bold text-[#12264A] mb-1">Date</label>
          <input
            type="text"
            value={date === "2026-11-23" ? "23/11/2026 (today)" : date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 font-semibold text-slate-800"
          />
        </div>
      </div>

      {/* Items Received Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-[#EEF4FF] px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-extrabold text-[#12264A] text-sm">Items received</h2>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add item</span>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {rows.map((row) => {
            const selectedProd = products.find((p) => p.id === row.productId);
            const totalCost = row.qty > 0 && row.costPerUnit > 0 ? row.qty * row.costPerUnit : 0;

            return (
              <div
                key={row.id}
                className="p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-4">
                  <label className="block text-[11px] text-slate-500 mb-1">Product</label>
                  <select
                    value={row.productId}
                    onChange={(e) => handleProductSelect(row.id, e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800"
                  >
                    <option value="">Choose a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.itemNo} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-500 mb-1">Unit</label>
                  <select
                    value={row.unit}
                    onChange={(e) => {
                      const nextU = e.target.value;
                      const su = selectedProd?.sellingUnits.find((u) => u.unit === nextU);
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, unit: nextU, containsBase: su?.containsBase || 1 }
                            : r
                        )
                      );
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800"
                  >
                    {!selectedProd ? (
                      <option value=""></option>
                    ) : (
                      selectedProd.sellingUnits.map((su) => (
                        <option key={su.unit} value={su.unit}>
                          {su.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-500 mb-1">Quantity</label>
                  <NumberInput
                    value={row.qty}
                    onChange={(v) =>
                      setRows((prev) =>
                        prev.map((r) => (r.id === row.id ? { ...r, qty: Number(v) || 0 } : r))
                      )
                    }
                    min={0}
                    className="h-10 bg-slate-100/80"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Cost per unit (₦, optional)
                  </label>
                  <NumberInput
                    value={row.costPerUnit}
                    onChange={(v) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, costPerUnit: Number(v) || 0 } : r
                        )
                      )
                    }
                    min={0}
                    className="h-10 bg-slate-100/80"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between pb-2">
                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">Total cost</span>
                    <span className="font-bold text-slate-800">
                      {totalCost > 0 ? `₦${totalCost.toLocaleString()}` : "—"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      rows.length > 1 && setRows((prev) => prev.filter((r) => r.id !== row.id))
                    }
                    className="p-2 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block font-bold text-[#12264A] mb-1">Note (optional)</label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Delivered by truck LSD 123 XY"
          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save stock in</span>
        </button>
      </div>
    </form>
  );
}

/* ============================================================================
   IMAGE 8 — STOCK SHEET VIEW
   ============================================================================ */
export function StockSheetView({
  sheets,
  products,
  onStockInClick,
  onUpdateCountedBy,
  onRecordPhysicalCount,
  showToast,
}: {
  sheets: BuilderStockSheet[];
  products: BuilderProduct[];
  onStockInClick: () => void;
  onUpdateCountedBy: (sheetId: string, name: string) => void;
  onRecordPhysicalCount: (productId: string, countedStock: number) => void;
  showToast: (msg: string) => void;
}) {
  const [fromDate, setFromDate] = useState("2026-10-25");
  const [toDate, setToDate] = useState("2026-11-23");
  const [expandedSheetId, setExpandedSheetId] = useState<string>(sheets[0]?.id || "ss_21");
  const [showEveryItem, setShowEveryItem] = useState(false);
  const [countedByDraft, setCountedByDraft] = useState<Record<string, string>>({});
  const [countModalOpen, setCountModalOpen] = useState(false);
  const [countProductId, setCountProductId] = useState(products[0]?.id || "");
  const [countedQty, setCountedQty] = useState<number>(0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Stock Sheet</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            One sheet per day, numbered like the paper stock sheet. It fills itself as stock moves.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStockInClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Stock in</span>
          </button>
          <button
            type="button"
            onClick={() => setCountModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Record count</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-end gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs"
          />
        </div>
        <button
          type="button"
          onClick={() => showToast(`Filtered stock sheets from ${fromDate} to ${toDate}`)}
          className="h-9 px-4 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 font-bold text-slate-800"
        >
          Show
        </button>
        <button
          type="button"
          onClick={() => {
            setFromDate("2026-10-25");
            setToDate("2026-11-23");
          }}
          className="h-9 px-2 text-[#1D63ED] hover:underline font-semibold"
        >
          Last 30 days
        </button>
      </div>

      {/* Sheets List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="grid grid-cols-12 bg-[#EEF4FF] border-b border-slate-200 px-4 py-2.5 text-[11px] font-bold text-[#12264A]">
          <div className="col-span-3">Sheet</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2 text-right">Items moved</div>
          <div className="col-span-2 text-right">Units out</div>
          <div className="col-span-1 text-right">Units in</div>
          <div className="col-span-1 text-right">Counted by</div>
        </div>

        {sheets.map((sheet) => {
          const isOpen = expandedSheetId === sheet.id;
          const draftName = countedByDraft[sheet.id] ?? sheet.countedBy;

          const displayRows = showEveryItem
            ? products.map((p) => {
                const movedRow = sheet.rows.find((r) => r.itemNo === p.itemNo);
                if (movedRow) return movedRow;
                const defU = p.sellingUnits.find((u) => u.isDefault) || p.sellingUnits[0];
                const ctnU = p.sellingUnits.find((u) => u.unit === "ctn" || u.unit === "bdl" || u.unit === "box");
                return {
                  id: `static_${p.id}`,
                  date: sheet.shortDate,
                  itemNo: p.itemNo,
                  description: `${p.name} (${p.baseUnit})`,
                  unitPriceNaira: defU?.priceNaira || 0,
                  cartonPriceNaira: ctnU?.priceNaira || null,
                  openingBal: p.stockOnHand,
                  stockOut: 0,
                  stockIn: 0,
                  closingBal: p.stockOnHand,
                };
              })
            : sheet.rows;

          const blankLines = Math.max(0, 10 - displayRows.length);

          return (
            <div key={sheet.id} className="border-b border-slate-200 last:border-b-0">
              <button
                type="button"
                onClick={() => setExpandedSheetId(isOpen ? "" : sheet.id)}
                className={`w-full grid grid-cols-12 items-center px-4 py-3 text-xs text-left ${
                  isOpen ? "bg-[#F5F8FF] font-bold" : "hover:bg-slate-50"
                }`}
              >
                <div className="col-span-3 flex items-center gap-2 text-[#1D63ED] font-bold">
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span>{sheet.sheetNo}</span>
                </div>
                <div className="col-span-3 text-[#12264A]">{sheet.displayDate}</div>
                <div className="col-span-2 text-right tabular-nums">{sheet.itemsMoved}</div>
                <div className="col-span-2 text-right tabular-nums">{sheet.unitsOut}</div>
                <div className="col-span-1 text-right tabular-nums">{sheet.unitsIn}</div>
                <div className="col-span-1 text-right text-slate-500">
                  {sheet.countedBy || "—"}
                </div>
              </button>

              {isOpen && (
                <div className="p-4 sm:p-6 bg-white border-t border-slate-200">
                  <div className="rounded-xl border border-[#BFD3F8] p-5 sm:p-6 space-y-4">
                    {/* Stock Sheet Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-xl font-black text-[#1D63ED]">Stock Sheet</h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Sheet Number</span>
                          <span className="px-2.5 py-1 rounded border border-[#BFD3F8] bg-[#F5F8FF] font-bold text-[#12264A]">
                            {sheet.sheetNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Counted by</span>
                          <input
                            type="text"
                            value={draftName}
                            onChange={(e) =>
                              setCountedByDraft({ ...countedByDraft, [sheet.id]: e.target.value })
                            }
                            placeholder="Name"
                            className="w-24 border-b border-dashed border-slate-400 px-1 py-0.5 text-xs focus:outline-none focus:border-[#1D63ED]"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateCountedBy(sheet.id, draftName)}
                            className="text-[#1D63ED] font-bold hover:underline"
                          >
                            Save
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Date</span>
                          <span className="font-bold text-[#12264A] border-b border-slate-400 pb-0.5">
                            {sheet.shortDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ruled Paper Stock Sheet Grid */}
                    <div className="overflow-x-auto border border-[#8FB2F0] rounded">
                      <table className="w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-[#15357A] text-white font-bold uppercase">
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-center w-20">
                              DATE
                            </th>
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-center w-20">
                              ITEM NO.
                            </th>
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-left">
                              DESCRIPTION
                            </th>
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-28">
                              UNIT PRICE (₦)
                            </th>
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-28">
                              CARTON PRICE (₦)
                            </th>
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-24">
                              OPENING BAL.
                            </th>
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-24">
                              STOCK-OUT
                            </th>
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-24">
                              STOCK-IN
                            </th>
                            <th className="py-2 px-2.5 border border-[#8FB2F0] text-right w-24">
                              CLOSING BAL.
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayRows.map((r) => (
                            <tr key={r.id} className="hover:bg-blue-50/30">
                              <td className="py-2 px-2.5 border border-[#BFD3F8] text-center font-mono text-slate-700">
                                {r.date}
                              </td>
                              <td className="py-2 px-2.5 border border-[#BFD3F8] text-center font-mono font-semibold text-slate-700">
                                {r.itemNo}
                              </td>
                              <td className="py-2 px-2.5 border border-[#BFD3F8] font-medium text-[#12264A]">
                                {r.description}
                              </td>
                              <td className="py-2 px-2.5 border border-[#BFD3F8] text-right tabular-nums">
                                {r.unitPriceNaira.toLocaleString()}
                              </td>
                              <td className="py-2 px-2.5 border border-[#BFD3F8] text-right tabular-nums text-slate-400">
                                {r.cartonPriceNaira ? r.cartonPriceNaira.toLocaleString() : "—"}
                              </td>
                              <td className="py-2 px-2.5 border border-[#BFD3F8] text-right tabular-nums">
                                {r.openingBal}
                              </td>
                              <td className="py-2 px-2.5 border border-[#BFD3F8] text-right tabular-nums">
                                {r.stockOut > 0 ? r.stockOut : "—"}
                              </td>
                              <td className="py-2 px-2.5 border border-[#BFD3F8] text-right tabular-nums">
                                {r.stockIn > 0 ? r.stockIn : "—"}
                              </td>
                              <td className="py-2 px-2.5 border border-[#BFD3F8] text-right font-bold text-[#12264A] bg-[#F2F6FF] tabular-nums">
                                {r.closingBal}
                              </td>
                            </tr>
                          ))}

                          {Array.from({ length: blankLines }).map((_, idx) => (
                            <tr key={`ss_blank_${idx}`} className="h-7">
                              <td className="border border-[#BFD3F8]" />
                              <td className="border border-[#BFD3F8]" />
                              <td className="border border-[#BFD3F8]" />
                              <td className="border border-[#BFD3F8]" />
                              <td className="border border-[#BFD3F8]" />
                              <td className="border border-[#BFD3F8]" />
                              <td className="border border-[#BFD3F8]" />
                              <td className="border border-[#BFD3F8]" />
                              <td className="border border-[#BFD3F8] bg-[#F2F6FF]" />
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showEveryItem}
                        onChange={(e) => setShowEveryItem(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-[#1D63ED]"
                      />
                      <span>Show every item, not just those that moved</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Physical Stock Count Modal */}
      {countModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#12264A]">Record Physical Count</h3>
              <button
                type="button"
                onClick={() => setCountModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#12264A] mb-1">Product</label>
                <select
                  value={countProductId}
                  onChange={(e) => {
                    setCountProductId(e.target.value);
                    const p = products.find((it) => it.id === e.target.value);
                    if (p) setCountedQty(p.stockOnHand);
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.itemNo} — {p.name} (Current: {p.stockOnHand} {p.baseUnit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#12264A] mb-1">Actual Counted Stock</label>
                <NumberInput
                  value={countedQty}
                  onChange={(v) => setCountedQty(Number(v) || 0)}
                  min={0}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCountModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (countProductId) {
                    onRecordPhysicalCount(countProductId, countedQty);
                    setCountModalOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#1D63ED] text-white font-bold"
              >
                Save Count
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
