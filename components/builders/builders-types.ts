export type BuildersSection =
  | "dashboard"
  | "sales-book"
  | "new-sale"
  | "stock-products"
  | "stock-add-product"
  | "stock-sheet"
  | "stock-in"
  | "debtors"
  | "debtors-add-customer"
  | "expenses"
  | "todays-account"
  | "reports"
  | "settings-users"
  | "settings-business"
  | "settings-audit";

export interface SellingUnitPrice {
  unit: string;
  label: string;
  containsBase: number;
  priceNaira: number;
  isDefault: boolean;
}

export interface BuilderProduct {
  id: string;
  itemNo: string;
  name: string;
  category: string;
  description: string;
  baseUnit: string;
  baseUnitLabel: string;
  reorderLevel: number;
  stockOnHand: number;
  secondaryStockText?: string;
  costPriceNaira?: number;
  sellingUnits: SellingUnitPrice[];
  active: boolean;
}

export interface BuilderSaleLineItem {
  id: string;
  productId: string;
  itemNo: string;
  description: string;
  unit: string;
  qty: number;
  containsBase: number;
  unitPriceNaira: number;
  totalAmountNaira: number;
}

export interface BuilderSaleRecord {
  id: string;
  invoiceNo: string;
  date: string;
  displayDate: string;
  dayHeader: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: BuilderSaleLineItem[];
  totalAmountNaira: number;
  amountPaidNaira: number;
  outstandingNaira: number;
  paymentMethod: string;
  fulfilment: "Self collection" | "Delivered" | "To deliver";
  remarks: string;
  salesRep: string;
  sign: string;
  status: "Paid" | "Unpaid" | "Part paid";
  createdAt: string;
}

export interface BuilderStockSheetRow {
  id: string;
  date: string;
  itemNo: string;
  description: string;
  unitPriceNaira: number;
  cartonPriceNaira: number | null;
  openingBal: number;
  stockOut: number;
  stockIn: number;
  closingBal: number;
}

export interface BuilderStockSheet {
  id: string;
  sheetNo: string;
  isoDate: string;
  displayDate: string;
  shortDate: string;
  itemsMoved: number;
  unitsOut: number;
  unitsIn: number;
  countedBy: string;
  rows: BuilderStockSheetRow[];
}

export interface BuilderDebtorCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  totalOwedNaira: number;
  oldestInvoiceDate: string;
  daysAgo: number;
  unpaidInvoicesCount: number;
  invoiceNumbers: string[];
}

export interface BuilderExpenseRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amountNaira: number;
  paidFrom: string;
  recordedBy: string;
}

export interface BuilderUserRecord {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: "Owner" | "Manager" | "Sales Rep" | "Cashier" | "Storekeeper";
  status: "Active" | "Suspended";
  lastSignIn: string;
  isCurrentUser?: boolean;
}

export interface BuilderPaymentAccount {
  id: string;
  name: string;
  type: "POS terminal" | "Bank transfer";
  accountNumber: string;
  active: boolean;
}

export interface BuilderBusinessSettings {
  businessName: string;
  rcNumber: string;
  tagline: string;
  dealsIn: string;
  address: string;
  phones: string;
  email: string;
  logoUrl: string;
  invoiceTerms: string;
  receiptFooter: string;
  topBarMessage: string;
  allowNegativeStock: boolean;
  lastBackup: string;
  numbering: {
    invoicePrefix: string;
    invoiceNext: number;
    oldDebtPrefix: string;
    oldDebtNext: number;
    paymentPrefix: string;
    paymentNext: number;
    stockSheetPrefix: string;
    stockSheetNext: number;
  };
  paymentAccounts: BuilderPaymentAccount[];
  expenseCategories: string[];
}

export interface BuilderAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  category: "Sale" | "Stock" | "Debtor" | "Expense" | "Settings" | "Auth";
  details: string;
}

export const BUILDER_CATEGORIES = [
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
  "Doors & Windows",
  "Door Locks",
  "Tools",
  "Others",
];

export const INITIAL_BUILDER_PRODUCTS: BuilderProduct[] = [];
export const INITIAL_BUILDER_SALES: BuilderSaleRecord[] = [];
export const INITIAL_BUILDER_STOCK_SHEETS: BuilderStockSheet[] = [];
export const INITIAL_BUILDER_DEBTORS: BuilderDebtorCustomer[] = [];
export const INITIAL_BUILDER_USERS: BuilderUserRecord[] = [];
export const INITIAL_BUILDER_AUDIT_LOGS: BuilderAuditEntry[] = [];

export function formatNairaToWords(num: number): string {
  if (!num || isNaN(num) || num === 0) return "Zero Naira Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function group(n: number): string {
    let s = "";
    if (n >= 100) {
      s += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      s += b[Math.floor(n / 10)] + (n % 10 > 0 ? " " + a[n % 10] : "");
    } else if (n > 0) {
      s += a[n];
    }
    return s.trim();
  }

  const intPart = Math.floor(Math.abs(num));
  const billions = Math.floor(intPart / 1_000_000_000);
  const millions = Math.floor((intPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((intPart % 1_000_000) / 1_000);
  const remainder = intPart % 1_000;

  const parts: string[] = [];
  if (billions > 0) parts.push(group(billions) + " Billion");
  if (millions > 0) parts.push(group(millions) + " Million");
  if (thousands > 0) parts.push(group(thousands) + " Thousand");
  if (remainder > 0) parts.push(group(remainder));

  return (parts.join(" ") || "Zero") + " Naira Only";
}

export const INITIAL_BUILDER_SETTINGS: BuilderBusinessSettings = {
  businessName: "Top Builders Best Materials Ltd.",
  rcNumber: "",
  tagline: "Top Builders... Building A Solid Foundation...",
  dealsIn: "Building Materials & Construction Supplies",
  address: "",
  phones: "",
  email: "",
  logoUrl: "/logos/builders-logo.png",
  invoiceTerms: "Goods sold in good condition are not refundable.",
  receiptFooter: "Quality Guaranteed!",
  topBarMessage: "",
  allowNegativeStock: false,
  lastBackup: "Never",
  numbering: {
    invoicePrefix: "INV-",
    invoiceNext: 1,
    oldDebtPrefix: "OB-",
    oldDebtNext: 1,
    paymentPrefix: "PAY-",
    paymentNext: 1,
    stockSheetPrefix: "ST-",
    stockSheetNext: 1,
  },
  paymentAccounts: [],
  expenseCategories: [
    "Transport & delivery",
    "Loading & offloading",
    "Fuel & generator",
    "Food & refreshment",
    "Shop maintenance",
    "Wages",
    "Bank & POS charges",
    "Miscellaneous",
  ],
};
