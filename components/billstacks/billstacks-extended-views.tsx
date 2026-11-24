"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Printer,
  Search,
  Copy,
  Send,
  UserPlus,
  Percent,
  Check,
  X,
  Eye,
  Save,
  ChevronLeft,
  Info,
  BarChart3,
  Lock,
  Globe,
} from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";
import { BILLSTACKS_COUNTRIES, CountryItem } from "./billstacks-countries";
import { UnifiedProduct } from "@/lib/platform-store";

export interface SimpleCustomer {
  id: string;
  name: string;
  email: string;
}

export interface SimpleVendor {
  id: string;
  name: string;
  email: string;
}

export interface SimpleInvoice {
  id: string;
  number: string;
  customer: string;
  date: string;
  dueDate: string;
  amountNaira: number;
  status: "Unpaid" | "Draft" | "Paid" | "Recurring";
}

export interface SimpleEstimate {
  id: string;
  number: string;
  customer: string;
  date: string;
  amountNaira: number;
  status: "Draft" | "Sent" | "Accepted" | "Declined";
}

export interface SimpleBill {
  id: string;
  number: string;
  vendor: string;
  date: string;
  amountNaira: number;
  amountDueNaira: number;
  status: "Paid" | "Unpaid" | "Overdue";
}

export interface SimpleExpense {
  id: string;
  date: string;
  amountNaira: number;
  client: string;
  category: string;
  notes: string;
}

export interface SimpleCategory {
  id: string;
  name: string;
  type: string;
}

interface LineRow {
  id: string;
  item: string;
  details?: string;
  price: number;
  quantity: number;
  total: number;
}

const fmtNaira = (val: number) =>
  `₦${val.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ============================================================================
   1. CREATE NEW BILL VIEW (Image 1)
   ============================================================================ */
export function CreateBillView({
  businessName = "My Business",
  vendors,
  onOpenAddVendor,
  onSaveBill,
  onBackToBills,
  showToast,
}: {
  businessName?: string;
  vendors: SimpleVendor[];
  onOpenAddVendor: () => void;
  onSaveBill: (bill: {
    number: string;
    vendor: string;
    date: string;
    amountNaira: number;
  }) => void;
  onBackToBills: () => void;
  showToast: (msg: string) => void;
}) {
  const [vendor, setVendor] = useState("");
  const [billNumber, setBillNumber] = useState("2026-1");
  const [billDate, setBillDate] = useState("2026-11-23");
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [footerNotes, setFooterNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([]);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: `bl_${Date.now()}_${prev.length}`, item: "", price: 0, quantity: 1, total: 0 },
    ]);
  };

  const updateLine = (id: string, field: keyof LineRow, val: string | number) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, [field]: val };
        if (field === "price" || field === "quantity") {
          next.total = Number(next.price || 0) * Number(next.quantity || 1);
        }
        return next;
      })
    );
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const subTotal = useMemo(() => lines.reduce((sum, l) => sum + (l.total || 0), 0), [lines]);
  const grandTotal = useMemo(() => {
    const disc = (subTotal * (Number(discountPct) || 0)) / 100;
    return Math.max(0, subTotal - disc);
  }, [subTotal, discountPct]);

  const handleSave = () => {
    if (!vendor) {
      showToast("Please select a vendor before saving the bill.");
      return;
    }
    onSaveBill({
      number: billNumber || `BILL-${Date.now().toString().slice(-4)}`,
      vendor,
      date: billDate,
      amountNaira: grandTotal,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Create New Bill</h2>
        <button
          type="button"
          onClick={onBackToBills}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 shadow-2xs transition-colors"
        >
          Bills
        </button>
      </div>

      {/* Business Accordion */}
      <details className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-2xs group">
        <summary className="font-semibold text-gray-700 cursor-pointer flex items-center justify-between select-none">
          <span>Business address and contact details, title, summary, and logo</span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="pt-4 mt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
          <div>
            <p className="font-bold text-gray-900">{businessName} — Billstacks Cloud</p>
            <p>Adeyemi Crescent, Lekki Phase 1, Lagos, Nigeria</p>
            <p>TIN: 24890112-0001</p>
          </div>
          <div className="space-y-2">
            <label className="block font-semibold text-gray-700">Bill Summary</label>
            <input
              type="text"
              placeholder="Purchase bill summary (optional)"
              className="w-full h-9 px-3 rounded-lg border border-gray-200"
            />
          </div>
        </div>
      </details>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Purchase from */}
          <div className="space-y-2.5 max-w-xs">
            <label className="block font-bold text-gray-700">Purchase from</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium"
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onOpenAddVendor}
              className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vendor</span>
            </button>
          </div>

          {/* Right: Bill Number & Date */}
          <div className="space-y-3 md:ml-auto md:w-80">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-right font-semibold text-gray-600">Bill Number</label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                className="col-span-2 h-9 px-3 rounded-lg border border-gray-200 font-mono"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-right font-semibold text-gray-600">Date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="col-span-2 h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Item Table */}
        <div className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700 font-bold">
                  <th className="py-2.5 px-2">Item</th>
                  <th className="py-2.5 px-2 w-36">Price</th>
                  <th className="py-2.5 px-2 w-28">Quantity</th>
                  <th className="py-2.5 px-2 w-36 text-right">Total</th>
                  <th className="py-2.5 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={line.item}
                        onChange={(e) => updateLine(line.id, "item", e.target.value)}
                        placeholder="Item or service name"
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <NumberInput
                        value={line.price}
                        onChange={(v) => updateLine(line.id, "price", v as number)}
                        placeholder="0"
                        min={0}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, "quantity", Number(e.target.value) || 1)}
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-bold tabular-nums text-gray-800">
                      {line.total.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="py-3 border-b border-gray-100 text-center">
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold"
            >
              <Plus className="w-4 h-4 rounded-full border border-emerald-600 p-0.5" />
              <span>Add an item</span>
            </button>
          </div>

          {/* Totals */}
          <div className="divide-y divide-gray-100 mt-1">
            <div className="flex items-center justify-end gap-8 py-3">
              <span className="font-bold text-gray-700">Sub Total</span>
              <span className="w-32 text-right font-semibold tabular-nums text-gray-700">
                {subTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-6 py-3">
              <span className="font-bold text-gray-700">Discount</span>
              <div className="w-32 flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                  className="w-full h-9 px-2.5 rounded-l-lg border border-gray-200 text-right"
                />
                <span className="h-9 px-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg flex items-center text-gray-600 font-bold">
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-8 py-3">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="w-32 text-right font-bold tabular-nums text-gray-900 text-sm">
                {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Accordion */}
      <details className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-2xs group">
        <summary className="font-semibold text-gray-700 cursor-pointer flex items-center justify-between select-none">
          <span>Footer</span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="pt-3 mt-2 border-t border-gray-100">
          <textarea
            rows={3}
            value={footerNotes}
            onChange={(e) => setFooterNotes(e.target.value)}
            placeholder="Enter bill notes, payment instructions, or vendor reference..."
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
      </details>

      {/* Bottom Save Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Save Bill</span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   2. RECURRING INVOICE BUILDER VIEW (Image 2)
   ============================================================================ */
export function RecurringInvoiceView({
  businessName = "My Business",
  customers,
  onOpenAddCustomer,
  onSaveRecurringInvoice,
  showToast,
}: {
  businessName?: string;
  customers: SimpleCustomer[];
  onOpenAddCustomer: () => void;
  onSaveRecurringInvoice: (inv: {
    number: string;
    customer: string;
    date: string;
    dueDate: string;
    amountNaira: number;
    frequency: string;
  }) => void;
  showToast: (msg: string) => void;
}) {
  const [customer, setCustomer] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("2026-1");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("2026-11-23");
  const [dueDate, setDueDate] = useState("2026-11-23");
  const [terms, setTerms] = useState("On Receipt");
  const [frequency, setFrequency] = useState("Monthly");
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [footerNotes, setFooterNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([]);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: `rl_${Date.now()}_${prev.length}`, item: "", details: "", price: 0, quantity: 1, total: 0 },
    ]);
  };

  const updateLine = (id: string, field: keyof LineRow, val: string | number) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, [field]: val };
        if (field === "price" || field === "quantity") {
          next.total = Number(next.price || 0) * Number(next.quantity || 1);
        }
        return next;
      })
    );
  };

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  const subTotal = useMemo(() => lines.reduce((sum, l) => sum + (l.total || 0), 0), [lines]);
  const grandTotal = useMemo(() => {
    const disc = (subTotal * (Number(discountPct) || 0)) / 100;
    return Math.max(0, subTotal - disc);
  }, [subTotal, discountPct]);

  const handleSave = () => {
    if (!customer) {
      showToast("Please select a customer for this recurring invoice.");
      return;
    }
    onSaveRecurringInvoice({
      number: invoiceNumber || `REC-${Date.now().toString().slice(-4)}`,
      customer,
      date: invoiceDate,
      dueDate,
      amountNaira: grandTotal,
      frequency,
    });
  };

  const actionButtons = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => showToast("Recurring invoice preview generated!")}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold shadow-2xs"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Preview</span>
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
      >
        <Save className="w-3.5 h-3.5" />
        <span>Save and continue</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-gray-800">Create New Invoice</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
            Recurring · {frequency}
          </span>
        </div>
        {actionButtons}
      </div>

      <details className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-2xs group">
        <summary className="font-semibold text-gray-700 cursor-pointer flex items-center justify-between select-none">
          <span>Business address and contact details, title, summary, and logo</span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="pt-4 mt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
          <div>
            <p className="font-bold text-gray-900">{businessName} — Billstacks Cloud</p>
            <p>Adeyemi Crescent, Lekki Phase 1, Lagos, Nigeria</p>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Recurring Schedule</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
            >
              <option value="Weekly">Repeat Weekly</option>
              <option value="Monthly">Repeat Monthly</option>
              <option value="Quarterly">Repeat Quarterly</option>
              <option value="Yearly">Repeat Yearly</option>
            </select>
          </div>
        </div>
      </details>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Bill to */}
          <div className="space-y-2.5 max-w-xs">
            <label className="block font-bold text-gray-700">Bill to</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onOpenAddCustomer}
              className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a customer</span>
            </button>
          </div>

          {/* Right: Invoice Meta */}
          <div className="space-y-3 md:ml-auto md:w-80">
            <div className="grid grid-cols-5 items-center gap-3">
              <label className="col-span-2 text-right font-semibold text-gray-600">Invoice number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200 font-mono"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-3">
              <label className="col-span-2 text-right font-semibold text-gray-600">P.O./S.O. number</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-3">
              <label className="col-span-2 text-right font-semibold text-gray-600">Invoice date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-3">
              <label className="col-span-2 text-right font-semibold text-gray-600">Payment due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-3 pt-1">
              <div className="col-span-2"></div>
              <select
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200 bg-white"
              >
                <option value="On Receipt">On Receipt</option>
                <option value="Net 7">Net 7 Days</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Item Table */}
        <div className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700 font-bold">
                  <th className="py-2.5 px-2">Item</th>
                  <th className="py-2.5 px-2">Details</th>
                  <th className="py-2.5 px-2 w-32">Price</th>
                  <th className="py-2.5 px-2 w-24">Quantity</th>
                  <th className="py-2.5 px-2 w-32 text-right">Total</th>
                  <th className="py-2.5 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={line.item}
                        onChange={(e) => updateLine(line.id, "item", e.target.value)}
                        placeholder="Item name"
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={line.details || ""}
                        onChange={(e) => updateLine(line.id, "details", e.target.value)}
                        placeholder="Description"
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <NumberInput
                        value={line.price}
                        onChange={(v) => updateLine(line.id, "price", v as number)}
                        placeholder="0"
                        min={0}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, "quantity", Number(e.target.value) || 1)}
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-bold tabular-nums text-gray-800">
                      {line.total.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="py-3 border-b border-gray-100 text-center">
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold"
            >
              <Plus className="w-4 h-4 rounded-full border border-emerald-600 p-0.5" />
              <span>Add an item</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100 mt-1">
            <div className="flex items-center justify-end gap-8 py-3">
              <span className="font-bold text-gray-700">Sub Total</span>
              <span className="w-32 text-right font-semibold tabular-nums text-gray-700">
                {subTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-6 py-3">
              <span className="font-bold text-gray-700">Discount</span>
              <div className="w-32 flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                  className="w-full h-9 px-2.5 rounded-l-lg border border-gray-200 text-right"
                />
                <span className="h-9 px-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg flex items-center text-gray-600 font-bold">
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-8 py-3">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="w-32 text-right font-bold tabular-nums text-gray-900 text-sm">
                {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <details className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-2xs group">
        <summary className="font-semibold text-gray-700 cursor-pointer flex items-center justify-between select-none">
          <span>Footer</span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="pt-3 mt-2 border-t border-gray-100">
          <textarea
            rows={3}
            value={footerNotes}
            onChange={(e) => setFooterNotes(e.target.value)}
            placeholder="Recurring invoice footer notes & terms..."
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
      </details>

      <div className="flex justify-end pt-1">{actionButtons}</div>
    </div>
  );
}

/* ============================================================================
   3. CREATE NEW ESTIMATE VIEW (Image 3)
   ============================================================================ */
export function CreateEstimateView({
  businessName = "My Business",
  customers,
  onOpenAddCustomer,
  onSaveEstimate,
  onBackToEstimates,
  showToast,
}: {
  businessName?: string;
  customers: SimpleCustomer[];
  onOpenAddCustomer: () => void;
  onSaveEstimate: (est: {
    number: string;
    customer: string;
    date: string;
    amountNaira: number;
  }) => void;
  onBackToEstimates: () => void;
  showToast: (msg: string) => void;
}) {
  const [customer, setCustomer] = useState("");
  const [estimateNumber, setEstimateNumber] = useState("2026-1");
  const [poNumber, setPoNumber] = useState("");
  const [estimateDate, setEstimateDate] = useState("2026-11-23");
  const [expiresOn, setExpiresOn] = useState("2026-11-23");
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [footerNotes, setFooterNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([]);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: `el_${Date.now()}_${prev.length}`, item: "", price: 0, quantity: 1, total: 0 },
    ]);
  };

  const updateLine = (id: string, field: keyof LineRow, val: string | number) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, [field]: val };
        if (field === "price" || field === "quantity") {
          next.total = Number(next.price || 0) * Number(next.quantity || 1);
        }
        return next;
      })
    );
  };

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  const subTotal = useMemo(() => lines.reduce((sum, l) => sum + (l.total || 0), 0), [lines]);
  const grandTotal = useMemo(() => {
    const disc = (subTotal * (Number(discountPct) || 0)) / 100;
    return Math.max(0, subTotal - disc);
  }, [subTotal, discountPct]);

  const handleSave = () => {
    if (!customer) {
      showToast("Please select a customer for this estimate.");
      return;
    }
    onSaveEstimate({
      number: estimateNumber || `EST-${Date.now().toString().slice(-4)}`,
      customer,
      date: estimateDate,
      amountNaira: grandTotal,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Create new Estimate</h2>
        <button
          type="button"
          onClick={onBackToEstimates}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 shadow-2xs"
        >
          All Estimates
        </button>
      </div>

      <details className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-2xs group">
        <summary className="font-semibold text-gray-700 cursor-pointer flex items-center justify-between select-none">
          <span>Business address and contact details, title, summary, and logo</span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="pt-4 mt-3 border-t border-gray-100 text-gray-600 space-y-1">
          <p className="font-bold text-gray-900">{businessName} — Billstacks Cloud</p>
          <p>Adeyemi Crescent, Lekki Phase 1, Lagos, Nigeria</p>
        </div>
      </details>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5 max-w-xs">
            <label className="block font-bold text-gray-700">Estimate to</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onOpenAddCustomer}
              className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a customer</span>
            </button>
          </div>

          <div className="space-y-3 md:ml-auto md:w-80">
            <div className="grid grid-cols-5 items-center gap-3">
              <label className="col-span-2 text-right font-semibold text-gray-600">Estimate number</label>
              <input
                type="text"
                value={estimateNumber}
                onChange={(e) => setEstimateNumber(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200 font-mono"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-3">
              <label className="col-span-2 text-right font-semibold text-gray-600">P.O./S.O. number</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-3">
              <label className="col-span-2 text-right font-semibold text-gray-600">Estimate date</label>
              <input
                type="date"
                value={estimateDate}
                onChange={(e) => setEstimateDate(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-3">
              <label className="col-span-2 text-right font-semibold text-gray-600">Expires on</label>
              <input
                type="date"
                value={expiresOn}
                onChange={(e) => setExpiresOn(e.target.value)}
                className="col-span-3 h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700 font-bold">
                  <th className="py-2.5 px-2">Item</th>
                  <th className="py-2.5 px-2 w-36">Price</th>
                  <th className="py-2.5 px-2 w-28">Quantity</th>
                  <th className="py-2.5 px-2 w-36 text-right">Total</th>
                  <th className="py-2.5 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={line.item}
                        onChange={(e) => updateLine(line.id, "item", e.target.value)}
                        placeholder="Item or service"
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <NumberInput
                        value={line.price}
                        onChange={(v) => updateLine(line.id, "price", v as number)}
                        placeholder="0"
                        min={0}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, "quantity", Number(e.target.value) || 1)}
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-bold tabular-nums text-gray-800">
                      {line.total.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="py-3 border-b border-gray-100 text-center">
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold"
            >
              <Plus className="w-4 h-4 rounded-full border border-emerald-600 p-0.5" />
              <span>Add an item</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100 mt-1">
            <div className="flex items-center justify-end gap-8 py-3">
              <span className="font-bold text-gray-700">Sub Total</span>
              <span className="w-32 text-right font-semibold tabular-nums text-gray-700">
                {subTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-6 py-3">
              <span className="font-bold text-gray-700">Discount</span>
              <div className="w-32 flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                  className="w-full h-9 px-2.5 rounded-l-lg border border-gray-200 text-right"
                />
                <span className="h-9 px-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg flex items-center text-gray-600 font-bold">
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-8 py-3">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="w-32 text-right font-bold tabular-nums text-gray-900 text-sm">
                {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <details className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-2xs group">
        <summary className="font-semibold text-gray-700 cursor-pointer flex items-center justify-between select-none">
          <span>Footer</span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="pt-3 mt-2 border-t border-gray-100">
          <textarea
            rows={3}
            value={footerNotes}
            onChange={(e) => setFooterNotes(e.target.value)}
            placeholder="Terms and conditions for this estimate..."
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
      </details>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-7 py-2.5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   4. CATEGORIES LIST & ADD NEW CATEGORY (Image 4)
   ============================================================================ */
export function CategoriesListView({
  categories,
  onAddNewClick,
  onDeleteCategory,
}: {
  categories: SimpleCategory[];
  onAddNewClick: () => void;
  onDeleteCategory: (id: string) => void;
}) {
  return (
    <div className="max-w-4xl space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 text-base">Categories</h3>
        <button
          type="button"
          onClick={onAddNewClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add new category</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-semibold">
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat, idx) => (
              <tr key={cat.id} className="hover:bg-gray-50/60">
                <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">{cat.name}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      cat.type === "Income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {cat.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-600"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AddCategoryView({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (name: string, type: "Income" | "Expense") => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"Income" | "Expense">("Income");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), type);
  };

  return (
    <div className="max-w-2xl mx-auto pt-4 text-xs">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">Add new category</h3>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Software Subscriptions"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-8">
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
              <input
                type="radio"
                name="catType"
                checked={type === "Income"}
                onChange={() => setType("Income")}
                className="w-4 h-4 accent-[#28A745]"
              />
              <span>Income</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
              <input
                type="radio"
                name="catType"
                checked={type === "Expense"}
                onChange={() => setType("Expense")}
                className="w-4 h-4 accent-[#28A745]"
              />
              <span>Expense</span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   5. TAX PAGE (Image 5) — Two-Column GST + Add New Tax
   ============================================================================ */
export function TaxManagementView({
  onBack,
  showToast,
}: {
  onBack: () => void;
  showToast: (msg: string) => void;
}) {
  const [gstList, setGstList] = useState([
    { id: "gst1", name: "FIRS Standard VAT" },
    { id: "gst2", name: "Withholding Tax (WHT)" },
    { id: "gst3", name: "Lagos Consumption Tax" },
  ]);
  const [gstName, setGstName] = useState("");

  const [taxList, setTaxList] = useState([
    {
      id: "tx1",
      group: "FIRS Standard VAT",
      name: "VAT 7.5%",
      rate: "7.5",
      taxNumber: "FIRS-VAT002",
      details: "Standard Nigerian Value Added Tax",
      showOnInvoices: true,
    },
  ]);

  const [taxForm, setTaxForm] = useState({
    group: "",
    name: "",
    rate: "",
    taxNumber: "",
    details: "",
    showOnInvoices: true,
  });

  const handleSaveGst = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstName.trim()) return;
    setGstList([...gstList, { id: `gst_${Date.now()}`, name: gstName.trim() }]);
    setGstName("");
    showToast(`GST type "${gstName.trim()}" saved!`);
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxForm.name.trim() || !taxForm.rate.trim()) return;
    setTaxList([
      ...taxList,
      {
        id: `tx_${Date.now()}`,
        group: taxForm.group || "Standard Tax",
        name: taxForm.name.trim(),
        rate: taxForm.rate.trim(),
        taxNumber: taxForm.taxNumber.trim(),
        details: taxForm.details.trim(),
        showOnInvoices: taxForm.showOnInvoices,
      },
    ]);
    showToast(`Tax "${taxForm.name}" (${taxForm.rate}%) saved!`);
    setTaxForm({
      group: "",
      name: "",
      rate: "",
      taxNumber: "",
      details: "",
      showOnInvoices: true,
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Add new GST */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm">Add new GST</h3>
          </div>
          <div className="p-5 space-y-5">
            <form onSubmit={handleSaveGst} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={gstName}
                  onChange={(e) => setGstName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </form>

            {/* GST Table */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gstList.map((g, i) => (
                    <tr key={g.id}>
                      <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-800">{g.name}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setGstList(gstList.filter((item) => item.id !== g.id))}
                          className="text-gray-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Card: Add new tax */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Add new tax</h3>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
          <form onSubmit={handleSaveTax} className="p-5 space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Tax <span className="text-rose-500">*</span>
              </label>
              <select
                value={taxForm.group}
                onChange={(e) => setTaxForm({ ...taxForm, group: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
              >
                <option value="">Select</option>
                {gstList.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Tax Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={taxForm.name}
                onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Tax Rate (%)<span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={taxForm.rate}
                onChange={(e) => setTaxForm({ ...taxForm, rate: e.target.value })}
                placeholder="7.5"
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Tax rate should be a number only, without a percent sign
              </p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tax Number / ID</label>
              <input
                type="text"
                value={taxForm.taxNumber}
                onChange={(e) => setTaxForm({ ...taxForm, taxNumber: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Details</label>
              <textarea
                rows={4}
                value={taxForm.details}
                onChange={(e) => setTaxForm({ ...taxForm, details: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200"
              />
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
              <input
                type="checkbox"
                checked={taxForm.showOnInvoices}
                onChange={(e) => setTaxForm({ ...taxForm, showOnInvoices: e.target.checked })}
                className="w-4 h-4 accent-[#28A745] rounded"
              />
              <span>Show the tax name on invoices</span>
            </label>

            <div className="pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Saved Tax Rates Summary */}
      {taxList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-gray-100 font-bold text-gray-800">
            Configured Tax Rules
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                <th className="py-2.5 px-4">Tax Group</th>
                <th className="py-2.5 px-4">Tax Name</th>
                <th className="py-2.5 px-4">Rate (%)</th>
                <th className="py-2.5 px-4">Tax ID</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {taxList.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2.5 px-4 text-gray-600">{tx.group}</td>
                  <td className="py-2.5 px-4 font-bold text-gray-900">{tx.name}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">{tx.rate}%</td>
                  <td className="py-2.5 px-4 font-mono text-gray-600">{tx.taxNumber || "—"}</td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setTaxList(taxList.filter((t) => t.id !== tx.id))}
                      className="text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   6. PROFIT & LOSS REPORT VIEW (Image 6)
   ============================================================================ */
export function ProfitLossReportView({
  invoices,
  expenses,
  bills,
}: {
  invoices: SimpleInvoice[];
  expenses: SimpleExpense[];
  bills: SimpleBill[];
}) {
  const [filterMode, setFilterMode] = useState("all");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-11-23");

  const { totalIncome, totalExpenses, netProfit } = useMemo(() => {
    const filteredInvs = invoices.filter((i) => {
      if (filterMode === "paid") return i.status === "Paid";
      if (filterMode === "unpaid") return i.status === "Unpaid";
      return true;
    });
    const inc = filteredInvs.reduce((acc, i) => acc + i.amountNaira, 0);
    const exp =
      expenses.reduce((acc, e) => acc + e.amountNaira, 0) +
      bills
        .filter((b) => (filterMode === "paid" ? b.status === "Paid" : true))
        .reduce((acc, b) => acc + b.amountNaira, 0);
    return { totalIncome: inc, totalExpenses: exp, netProfit: inc - exp };
  }, [invoices, expenses, bills, filterMode]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Profit &amp; Loss</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-wrap items-start gap-4 justify-between">
        <div className="flex flex-wrap items-start gap-3 flex-1">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 bg-white min-w-[260px]"
          >
            <option value="all">Paid &amp; Unpaid (Including paid &amp; unpaid invoices and bills)</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
          </select>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200"
            />
            <p className="text-[10px] text-gray-500 mt-1">Start date</p>
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200"
            />
            <p className="text-[10px] text-gray-500 mt-1">End date</p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Show Report</span>
        </button>
      </div>

      {/* Equation Row */}
      <div className="py-6 flex flex-wrap items-center justify-around gap-6 text-center">
        <div>
          <p className="font-bold text-gray-600 mb-1">Income</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmtNaira(totalIncome)}</p>
        </div>
        <span className="text-2xl font-bold text-gray-400">-</span>
        <div>
          <p className="font-bold text-gray-600 mb-1">Expenses</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmtNaira(totalExpenses)}</p>
        </div>
        <span className="text-2xl font-bold text-gray-400">=</span>
        <div>
          <p className="font-bold text-gray-600 mb-1">Net Profit</p>
          <p
            className={`text-3xl font-bold tabular-nums ${
              netProfit >= 0 ? "text-[#28A745]" : "text-rose-600"
            }`}
          >
            {fmtNaira(netProfit)}
          </p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs">
        <div className="flex items-end justify-between pb-3 border-b border-gray-100">
          <span className="font-bold text-gray-700 text-sm">Profit &amp; Loss Reports</span>
          <span className="text-right text-[11px] text-gray-500 font-semibold">
            {startDate}
            <br />
            to {endDate}
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3.5">
            <span className="text-gray-700 font-medium">Income</span>
            <span className="font-semibold text-gray-900 tabular-nums">{fmtNaira(totalIncome)}</span>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-gray-700 font-medium">Expense</span>
            <span className="font-semibold text-gray-900 tabular-nums">{fmtNaira(totalExpenses)}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="font-bold text-gray-900">Net Profit</span>
            <span
              className={`font-bold tabular-nums text-sm ${
                netProfit >= 0 ? "text-[#28A745]" : "text-rose-600"
              }`}
            >
              {fmtNaira(netProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   7. SALES TAX REPORT VIEW (Image 7)
   ============================================================================ */
export function SalesTaxReportView({
  invoices,
  bills,
}: {
  invoices: SimpleInvoice[];
  bills: SimpleBill[];
}) {
  const [filterMode, setFilterMode] = useState("all");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-11-23");

  const salesSubject = useMemo(
    () =>
      invoices
        .filter((i) => (filterMode === "paid" ? i.status === "Paid" : true))
        .reduce((acc, i) => acc + i.amountNaira, 0),
    [invoices, filterMode]
  );
  const taxOnSales = salesSubject * 0.075;
  const purchasesSubject = useMemo(
    () =>
      bills
        .filter((b) => (filterMode === "paid" ? b.status === "Paid" : true))
        .reduce((acc, b) => acc + b.amountNaira, 0),
    [bills, filterMode]
  );
  const taxOnPurchases = purchasesSubject * 0.075;
  const netTaxOwing = taxOnSales - taxOnPurchases;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Sales Tax Report</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-start gap-3">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 bg-white min-w-[160px]"
          >
            <option value="all">Paid &amp; Unpaid</option>
            <option value="paid">Paid Only</option>
          </select>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200"
            />
            <p className="text-[10px] text-gray-500 mt-1">Start date</p>
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200"
            />
            <p className="text-[10px] text-gray-500 mt-1">End date</p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Show Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-600 font-semibold">
                <th className="py-3.5 px-4">Tax</th>
                <th className="py-3.5 px-4">Sales Product to tax</th>
                <th className="py-3.5 px-4">Tax Amount on Sales</th>
                <th className="py-3.5 px-4">Purchases Subject to Tax</th>
                <th className="py-3.5 px-4">Tax Amount on Purchases</th>
                <th className="py-3.5 px-4">Net Tax Owing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-gray-800">FIRS VAT (7.5%)</td>
                <td className="py-3.5 px-4 tabular-nums">{fmtNaira(salesSubject)}</td>
                <td className="py-3.5 px-4 tabular-nums font-semibold">{fmtNaira(taxOnSales)}</td>
                <td className="py-3.5 px-4 tabular-nums">{fmtNaira(purchasesSubject)}</td>
                <td className="py-3.5 px-4 tabular-nums font-semibold">{fmtNaira(taxOnPurchases)}</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-gray-900">
                  {fmtNaira(netTaxOwing)}
                </td>
              </tr>
              <tr className="bg-gray-50/75 font-bold text-gray-900 text-sm">
                <td className="py-3.5 px-4">Total</td>
                <td className="py-3.5 px-4"></td>
                <td className="py-3.5 px-4 tabular-nums">{fmtNaira(taxOnSales)}</td>
                <td className="py-3.5 px-4"></td>
                <td className="py-3.5 px-4 tabular-nums">{fmtNaira(taxOnPurchases)}</td>
                <td className="py-3.5 px-4 tabular-nums">{fmtNaira(netTaxOwing)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   8. INCOME BY CUSTOMER REPORT VIEW (Image 8)
   ============================================================================ */
export function IncomeByCustomerReportView({
  customers,
  invoices,
}: {
  customers: SimpleCustomer[];
  invoices: SimpleInvoice[];
}) {
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-11-23");

  const rows = useMemo(() => {
    const list =
      selectedCustomer === "all"
        ? customers
        : customers.filter((c) => c.name === selectedCustomer);
    return list.map((c) => {
      const cInvs = invoices.filter((i) => i.customer === c.name);
      const allIncome = cInvs.reduce((acc, i) => acc + i.amountNaira, 0);
      const paidIncome = cInvs
        .filter((i) => i.status === "Paid")
        .reduce((acc, i) => acc + i.amountNaira, 0);
      return { name: c.name, allIncome, paidIncome };
    });
  }, [customers, invoices, selectedCustomer]);

  const totalAll = rows.reduce((acc, r) => acc + r.allIncome, 0);
  const totalPaid = rows.reduce((acc, r) => acc + r.paidIncome, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Income by Customer</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-start gap-3">
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 bg-white min-w-[200px]"
          >
            <option value="all">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200"
            />
            <p className="text-[10px] text-gray-500 mt-1">Start date</p>
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200"
            />
            <p className="text-[10px] text-gray-500 mt-1">End date</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Show Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-gray-600 font-semibold">
              <th className="py-3.5 px-5">Customers</th>
              <th className="py-3.5 px-5 text-right">All Income</th>
              <th className="py-3.5 px-5 text-right">Paid Income</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="py-3 px-5 font-semibold text-gray-800">{r.name}</td>
                <td className="py-3 px-5 text-right tabular-nums">{fmtNaira(r.allIncome)}</td>
                <td className="py-3 px-5 text-right tabular-nums text-emerald-700 font-semibold">
                  {fmtNaira(r.paidIncome)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50/75 font-bold text-gray-900 border-t-2 border-gray-300">
              <td className="py-3.5 px-5">Total Income</td>
              <td className="py-3.5 px-5 text-right tabular-nums">{fmtNaira(totalAll)}</td>
              <td className="py-3.5 px-5 text-right tabular-nums">{fmtNaira(totalPaid)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
   9. PURCHASES BY VENDOR REPORT VIEW (Image 9)
   ============================================================================ */
export function PurchasesByVendorReportView({
  vendors,
  bills,
}: {
  vendors: SimpleVendor[];
  bills: SimpleBill[];
}) {
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-11-23");

  const rows = useMemo(() => {
    const list =
      selectedVendor === "all" ? vendors : vendors.filter((v) => v.name === selectedVendor);
    return list.map((v) => {
      const vBills = bills.filter((b) => b.vendor === v.name);
      const allPurchase = vBills.reduce((acc, b) => acc + b.amountNaira, 0);
      const paidPurchase = vBills.reduce(
        (acc, b) => acc + Math.max(0, b.amountNaira - b.amountDueNaira),
        0
      );
      return { name: v.name, allPurchase, paidPurchase };
    });
  }, [vendors, bills, selectedVendor]);

  const totalAll = rows.reduce((acc, r) => acc + r.allPurchase, 0);
  const totalPaid = rows.reduce((acc, r) => acc + r.paidPurchase, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Purchases by Vendor</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-start gap-3">
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 bg-white min-w-[200px]"
          >
            <option value="all">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200"
            />
            <p className="text-[10px] text-gray-500 mt-1">Start date</p>
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200"
            />
            <p className="text-[10px] text-gray-500 mt-1">End date</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Show Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-gray-600 font-semibold">
              <th className="py-3.5 px-5">Vendors</th>
              <th className="py-3.5 px-5 text-right">All Purchase</th>
              <th className="py-3.5 px-5 text-right">Paid Purchase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="py-3 px-5 font-semibold text-gray-800">{r.name}</td>
                <td className="py-3 px-5 text-right tabular-nums">{fmtNaira(r.allPurchase)}</td>
                <td className="py-3 px-5 text-right tabular-nums text-emerald-700 font-semibold">
                  {fmtNaira(r.paidPurchase)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50/75 font-bold text-gray-900 border-t-2 border-gray-300">
              <td className="py-3.5 px-5">Total Purchase</td>
              <td className="py-3.5 px-5 text-right tabular-nums">{fmtNaira(totalAll)}</td>
              <td className="py-3.5 px-5 text-right tabular-nums">{fmtNaira(totalPaid)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
   10. GENERAL REPORTS VIEW (Image 10)
   ============================================================================ */
export function GeneralReportsView({
  invoices,
  estimates,
  expenses,
}: {
  invoices: SimpleInvoice[];
  estimates: SimpleEstimate[];
  expenses: SimpleExpense[];
}) {
  const [reportType, setReportType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [taxInfo, setTaxInfo] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const rows = useMemo(() => {
    if (reportType === "Invoices") {
      return invoices
        .filter((i) => statusFilter === "all" || i.status === statusFilter)
        .map((i) => ({
          id: i.id,
          ref: i.number,
          party: i.customer,
          date: i.date,
          amount: i.amountNaira,
          status: i.status,
        }));
    }
    if (reportType === "Estimates") {
      return estimates
        .filter((e) => statusFilter === "all" || e.status === statusFilter)
        .map((e) => ({
          id: e.id,
          ref: e.number,
          party: e.customer,
          date: e.date,
          amount: e.amountNaira,
          status: e.status,
        }));
    }
    if (reportType === "Expenses") {
      return expenses.map((ex) => ({
        id: ex.id,
        ref: ex.category,
        party: ex.client,
        date: ex.date,
        amount: ex.amountNaira,
        status: "Paid",
      }));
    }
    return [];
  }, [reportType, invoices, estimates, expenses, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto space-y-5 text-xs">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-800">Reports</h2>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-wrap items-center gap-3">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 bg-white min-w-[160px]"
        >
          <option value="">Report Types</option>
          <option value="Invoices">Invoices</option>
          <option value="Estimates">Estimates</option>
          <option value="Expenses">Expenses</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="From"
          className="h-10 px-3 rounded-lg border border-gray-200"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          placeholder="To"
          className="h-10 px-3 rounded-lg border border-gray-200"
        />

        <select
          value={taxInfo}
          onChange={(e) => setTaxInfo(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 bg-white min-w-[130px]"
        >
          <option value="all">Tax Info</option>
          <option value="with-tax">With 7.5% VAT</option>
          <option value="no-tax">Tax Exempt</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 bg-white min-w-[130px]"
        >
          <option value="all">All status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Results Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-semibold">No data founds</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Customer / Client</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">{r.ref}</td>
                  <td className="py-3 px-4 font-medium text-gray-700">{r.party}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{r.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px]">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums">
                    {fmtNaira(r.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   11. AFFILIATE HOME VIEW (Image 11)
   ============================================================================ */
export function AffiliateHomeView({ showToast }: { showToast: (msg: string) => void }) {
  const refUrl = "https://billstacks.com/?ref=CN1qp82852";

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-xs">
      {/* 4 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-cyan-300 p-4 shadow-2xs">
          <p className="text-xl font-bold text-emerald-600">0</p>
          <p className="text-gray-600 font-semibold mt-1">Total Referrals</p>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-purple-300 p-4 shadow-2xs">
            <p className="text-xl font-bold text-emerald-600">₦ 0.00</p>
            <p className="text-gray-600 font-semibold mt-1">Total Earnings</p>
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Commission 10%</span>
          </p>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-rose-300 p-4 shadow-2xs">
            <p className="text-xl font-bold text-rose-600">₦ 0.00</p>
            <p className="text-gray-600 font-semibold mt-1">Total Withdraw</p>
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Minimum Payout Amounts ₦ 50.00</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-cyan-300 p-4 shadow-2xs">
          <p className="text-xl font-bold text-emerald-600">₦ 0.00</p>
          <p className="text-gray-600 font-semibold mt-1">Balance</p>
        </div>
      </div>

      {/* Referral URL Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div>
          <label className="block font-bold text-gray-700 mb-2">Referral URL:</label>
          <div className="flex items-center">
            <input
              type="text"
              readOnly
              value={refUrl}
              className="flex-1 h-10 px-3 rounded-l-lg border border-gray-200 bg-gray-50 font-mono text-gray-700"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(refUrl);
                showToast("Referral URL copied to clipboard!");
              }}
              className="h-10 px-4 rounded-r-lg bg-[#28A745] hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
              title="Copy Referral Link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-2 space-y-1">
          <p className="font-bold text-gray-800">Referral guidelines</p>
          <p className="text-gray-600">
            Share your unique referral link with business owners and partners. Earn 10% commission
            on every paid Billstacks subscription they purchase.
          </p>
        </div>
      </div>

      {/* How It Works Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-2xs space-y-8">
        <h3 className="text-center font-bold text-gray-800 text-base">How It works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2.5 flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-gray-600 text-white flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-800 text-sm">Send Invitation</h4>
            <p className="text-gray-500 max-w-xs">
              Send your referral link to your friends and tell them how cool is this!
            </p>
          </div>
          <div className="space-y-2.5 flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-gray-600 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-800 text-sm">Registration</h4>
            <p className="text-gray-500 max-w-xs">
              Let them register using your referral link.
            </p>
          </div>
          <div className="space-y-2.5 flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-gray-600 text-white flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-800 text-sm">Get Commissions</h4>
            <p className="text-gray-500 max-w-xs">
              Earn commission for their first subscription plan payments!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   12. AFFILIATE REFERRALS VIEW (Image 12)
   ============================================================================ */
export function AffiliateReferralsView() {
  return (
    <div className="max-w-5xl mx-auto space-y-4 text-xs">
      <h2 className="text-lg font-bold text-gray-800">Referrals</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-bold">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Referrar Id</th>
                <th className="py-3.5 px-4">Order Id</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Commision(%)</th>
                <th className="py-3.5 px-4">Commision Amount</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400 font-medium">
                  No referrals recorded yet. Share your referral link from Affiliate Home to start earning.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   13. AFFILIATE PAYOUTS VIEW (Image 13)
   ============================================================================ */
export function AffiliatePayoutsView({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <div className="max-w-5xl mx-auto space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Payouts</h2>
        <button
          type="button"
          onClick={() => showToast("Minimum payout threshold is ₦50.00. Current balance: ₦0.00")}
          className="px-4 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          Request Payout
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-bold">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Transaction Id</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400 font-medium">
                  No payouts processed yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   14. SUBSCRIPTION & UPGRADE PLAN VIEW (Image 14 — UNIFIED WITH MAIN ADMIN DASHBOARD)
   ============================================================================ */
export function SubscriptionView({
  adminPlans = [],
  showToast,
  onOpenCheckout,
}: {
  adminPlans?: UnifiedProduct[];
  showToast: (msg: string) => void;
  onOpenCheckout?: (plan: {
    name: string;
    amountNaira: number;
    billingCycle: "Monthly" | "Yearly";
  }) => void;
}) {
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const [currentPlan, setCurrentPlan] = useState("Free trial of 3 Days");

  const handleUpgrade = (
    planName: string,
    priceFormatted: string,
    amountNaira: number
  ) => {
    if (onOpenCheckout) {
      onOpenCheckout({ name: planName, amountNaira, billingCycle });
    } else {
      setCurrentPlan(`${planName} (${billingCycle} — ${priceFormatted})`);
      showToast(`Upgraded subscription to ${planName} (${billingCycle} · ${priceFormatted})!`);
    }
  };

  const featureRows = [
    { label: "Invoices", render: () => "Unlimited" },
    { label: "Estimates", render: () => "Unlimited" },
    { label: "Customers", render: () => "Unlimited" },
    { label: "Business", render: (idx: number) => (idx === 0 ? "5" : "Unlimited") },
    { label: "Invoice templates", render: (idx: number) => (idx === 0 ? "4" : "8") },
    { label: "Get Invoice Payment Online", render: () => true },
    { label: "Multi User Roles", render: (idx: number) => (idx === 0 ? "5" : "12") },
    { label: "HRM", render: () => true },
  ];

  const renderCell = (val: string | boolean) => {
    if (val === true) return <Check className="w-4 h-4 text-[#28A745] mx-auto" />;
    if (val === false) return <X className="w-4 h-4 text-rose-600 mx-auto" />;
    return <span className="font-semibold text-gray-800">{val}</span>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
      {/* Left Card: Subscription Info */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">Subscription</h3>
        </div>
        <div className="p-5 space-y-3 text-gray-700">
          <p>
            Your subscription: <strong className="text-gray-900">{currentPlan}</strong>
          </p>
          <p>
            Billing Frequency :{" "}
            <strong className="text-gray-900">
              {currentPlan.includes("Free") ? "3 Days" : billingCycle}
            </strong>
          </p>
          <p>
            Created : <strong className="text-gray-900">23 Nov 2026</strong>{" "}
            <span className="text-rose-600 font-semibold">(2 Days left)</span>
          </p>
          <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 mt-2">
            Synced live with Main Admin Dashboard ({adminPlans.length} active{" "}
            {adminPlans.length === 1 ? "plan" : "plans"}).
          </p>
        </div>
      </div>

      {/* Right Card: Upgrade Plan Matrix — Strictly Driven by Admin Dashboard Plans */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">Upgrade Plan</h3>
          <span className="text-[11px] text-gray-500 font-medium">
            Prices synced from Admin Studio
          </span>
        </div>
        <div className="p-6 space-y-6">
          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
              <input
                type="radio"
                name="billingCycle"
                checked={billingCycle === "Monthly"}
                onChange={() => setBillingCycle("Monthly")}
                className="w-4 h-4 accent-[#28A745]"
              />
              <span>Monthly</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
              <input
                type="radio"
                name="billingCycle"
                checked={billingCycle === "Yearly"}
                onChange={() => setBillingCycle("Yearly")}
                className="w-4 h-4 accent-[#28A745]"
              />
              <span>Yearly (Save 5%)</span>
            </label>
          </div>

          {adminPlans.length === 0 ? (
            <div className="py-10 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
              No active Billstacks subscription plans found in the Main Admin Dashboard. Add a
              Billstacks plan in Admin &gt; Website Products &amp; Services Studio to display it
              here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-3 text-left min-w-[160px]"></th>
                    {adminPlans.map((plan) => {
                      const baseMonthly = Math.round((plan.priceKobo || 0) / 100);
                      const displayOrig =
                        billingCycle === "Monthly"
                          ? `₦${baseMonthly.toLocaleString()}`
                          : `₦${(baseMonthly * 12).toLocaleString()}`;
                      const displaySale =
                        billingCycle === "Monthly"
                          ? `₦${baseMonthly.toLocaleString()}`
                          : `₦${Math.round(baseMonthly * 12 * 0.95).toLocaleString()}`;
                      const unit = billingCycle === "Monthly" ? "per month" : "per year";

                      return (
                        <th key={plan.id} className="py-4 px-3 min-w-[150px]">
                          <p className="text-base font-bold text-gray-900">{plan.name}</p>
                          {billingCycle === "Yearly" && (
                            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                              5% Yearly Discount
                            </p>
                          )}
                          <p className="mt-1 space-x-1.5">
                            {billingCycle === "Yearly" && (
                              <span className="line-through text-rose-500 font-semibold">
                                {displayOrig}
                              </span>
                            )}
                            <span className="text-gray-900 font-bold text-sm tabular-nums">
                              {displaySale}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-500 font-normal mt-0.5">{unit}</p>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {featureRows.map((r) => (
                    <tr key={r.label}>
                      <td className="py-3 px-3 text-left font-medium text-gray-700">{r.label}</td>
                      {adminPlans.map((plan, idx) => (
                        <td key={plan.id} className="py-3 px-3">
                          {renderCell(r.render(idx))}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-4 px-3"></td>
                    {adminPlans.map((plan, idx) => {
                      const baseMonthly = Math.round((plan.priceKobo || 0) / 100);
                      const finalPrice =
                        billingCycle === "Monthly"
                          ? `₦${baseMonthly.toLocaleString()}/mo`
                          : `₦${Math.round(baseMonthly * 12 * 0.95).toLocaleString()}/yr`;
                      const amountNaira =
                        billingCycle === "Monthly"
                          ? baseMonthly
                          : Math.round(baseMonthly * 12 * 0.95);
                      return (
                        <td key={plan.id} className="py-4 px-3">
                          <button
                            type="button"
                            onClick={() => handleUpgrade(plan.name, finalPrice, amountNaira)}
                            className={`px-4 py-2 rounded-lg font-bold shadow-xs transition-colors ${
                              idx === 0 || plan.isFeatured
                                ? "bg-[#28A745] hover:bg-emerald-700 text-white"
                                : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            Upgrade
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   15. COUNTRIES & 189 CURRENCIES / LANGUAGES VIEW (Image 15)
   ============================================================================ */
export function CountryView({ showToast }: { showToast: (msg: string) => void }) {
  const [countries, setCountries] = useState<CountryItem[]>(BILLSTACKS_COUNTRIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCurrency, setActiveCurrency] = useState("NGN");
  const [createOpen, setCreateOpen] = useState(false);
  const [newCountry, setNewCountry] = useState({
    name: "",
    currencyCode: "",
    currencySymbol: "",
    language: "",
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q) ||
        c.language.toLowerCase().includes(q)
    );
  }, [countries, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * entriesPerPage;
  const pageItems = filtered.slice(startIdx, startIdx + entriesPerPage);

  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.name.trim() || !newCountry.currencyCode.trim()) return;
    const item: CountryItem = {
      id: countries.length + 1,
      name: newCountry.name.trim(),
      currencyCode: newCountry.currencyCode.trim().toUpperCase(),
      currencySymbol: newCountry.currencySymbol.trim() || "$",
      language: newCountry.language.trim() || "English",
      status: "Active",
    };
    setCountries([item, ...countries]);
    setNewCountry({ name: "", currencyCode: "", currencySymbol: "", language: "" });
    setCreateOpen(false);
    showToast(`Added ${item.name} (${item.currencyCode})!`);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-800 text-sm">
              Countries ({countries.length} Currencies &amp; Languages Supported)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New</span>
          </button>
        </div>

        {/* Controls */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-2 rounded border border-gray-200 bg-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <span>Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Country, currency, language..."
              className="h-8 px-3 rounded border border-gray-200 w-52"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-gray-100 bg-gray-50/60 text-gray-700 font-bold">
                <th className="py-3 px-5 w-14">#</th>
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Currency / Type</th>
                <th className="py-3 px-5">Languages</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((c, idx) => (
                <tr key={`${c.id}-${c.name}`} className="hover:bg-gray-50/50">
                  <td className="py-3 px-5 text-gray-500">{startIdx + idx + 1}</td>
                  <td className="py-3 px-5 font-semibold text-gray-800">{c.name}</td>
                  <td className="py-3 px-5 text-gray-700 font-mono">
                    {c.currencySymbol} - {c.currencyCode}
                  </td>
                  <td className="py-3 px-5 text-gray-600">{c.language}</td>
                  <td className="py-3 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCurrency(c.currencyCode);
                        showToast(`Workspace currency switched to ${c.name} (${c.currencyCode} ${c.currencySymbol})`);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        activeCurrency === c.currencyCode
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      {activeCurrency === c.currencyCode ? "Active Default" : "Set Default"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-gray-600">
          <span>
            Showing {filtered.length === 0 ? 0 : startIdx + 1} to{" "}
            {Math.min(startIdx + entriesPerPage, filtered.length)} of {filtered.length} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded font-bold ${
                    safePage === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-1">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-7 h-7 rounded font-bold ${
                    safePage === totalPages
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create Country Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add Country &amp; Currency</h3>
              <button type="button" onClick={() => setCreateOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddCountry} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Country Name *</label>
                <input
                  type="text"
                  required
                  value={newCountry.name}
                  onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Currency Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NGN"
                    value={newCountry.currencyCode}
                    onChange={(e) =>
                      setNewCountry({ ...newCountry, currencyCode: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₦"
                    value={newCountry.currencySymbol}
                    onChange={(e) =>
                      setNewCountry({ ...newCountry, currencySymbol: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Languages</label>
                <input
                  type="text"
                  placeholder="e.g. English, French"
                  value={newCountry.language}
                  onChange={(e) => setNewCountry({ ...newCountry, language: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#28A745] text-white font-bold"
                >
                  Save Country
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   16. CHANGE PASSWORD VIEW (Image 16)
   ============================================================================ */
export function ChangePasswordView({ showToast }: { showToast: (msg: string) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Please fill in all required password fields.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirmation do not match.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Account password updated successfully!");
  };

  return (
    <div className="max-w-xl mx-auto pt-4 text-xs">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-gray-800 text-sm">Change Password</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Old Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Change</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
