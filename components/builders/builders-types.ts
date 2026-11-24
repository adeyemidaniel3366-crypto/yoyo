import { ServiceSlug } from "@/lib/constants";

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
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "09/11/26"
  dayHeader: string; // e.g. "Mon, 9 Nov 2026"
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: BuilderSaleLineItem[];
  totalAmountNaira: number;
  amountPaidNaira: number;
  outstandingNaira: number;
  paymentMethod: string; // "Cash" | "Moniepoint POS" | "UBA"
  fulfilment: "Self collection" | "Delivered" | "To deliver";
  remarks: string;
  salesRep: string;
  sign: string;
  status: "Paid" | "Unpaid" | "Part paid";
  createdAt: string;
}

export interface BuilderStockSheetRow {
  id: string;
  date: string; // "09/11/26"
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
  sheetNo: string; // "ST-00021"
  isoDate: string; // "2026-11-09"
  displayDate: string; // "Mon, 9 Nov 2026"
  shortDate: string; // "09/11/26"
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
  oldestInvoiceDate: string; // "13/07/2026"
  daysAgo: number;
  unpaidInvoicesCount: number;
  invoiceNumbers: string[];
}

export interface BuilderExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  amountNaira: number;
  paidFrom: string; // "Cash" | "Moniepoint POS" | "UBA"
  recordedBy: string;
}

export interface BuilderUserRecord {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: "Owner" | "Sales Rep" | "Storekeeper";
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

export const INITIAL_BUILDER_PRODUCTS: BuilderProduct[] = [
  {
    id: "bp_001",
    itemNo: "001",
    name: "Dangote Cement 50kg",
    category: "Cement",
    description: "50kg bag Portland limestone cement",
    baseUnit: "bag",
    baseUnitLabel: "Bag (bag)",
    reorderLevel: 30,
    stockOnHand: 118,
    costPriceNaira: 9100,
    sellingUnits: [
      { unit: "bag", label: "Bag (bag)", containsBase: 1, priceNaira: 9800, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_002",
    itemNo: "002",
    name: "BUA Cement 50kg",
    category: "Cement",
    description: "50kg bag BUA Portland cement",
    baseUnit: "bag",
    baseUnitLabel: "Bag (bag)",
    reorderLevel: 25,
    stockOnHand: 42,
    costPriceNaira: 8900,
    sellingUnits: [
      { unit: "bag", label: "Bag (bag)", containsBase: 1, priceNaira: 9600, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_003",
    itemNo: "003",
    name: "Iron Rod 12mm",
    category: "Iron Rods",
    description: "High-tensile 12mm steel reinforcement bar",
    baseUnit: "lgth",
    baseUnitLabel: "Length (lgth)",
    reorderLevel: 30,
    stockOnHand: 84,
    costPriceNaira: 11200,
    sellingUnits: [
      { unit: "lgth", label: "Length (lgth)", containsBase: 1, priceNaira: 12500, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_004",
    itemNo: "004",
    name: "Iron Rod 16mm",
    category: "Iron Rods",
    description: "Heavy structural 16mm TMT iron rod",
    baseUnit: "lgth",
    baseUnitLabel: "Length (lgth)",
    reorderLevel: 30,
    stockOnHand: 158,
    costPriceNaira: 19800,
    sellingUnits: [
      { unit: "lgth", label: "Length (lgth)", containsBase: 1, priceNaira: 21500, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_005",
    itemNo: "005",
    name: "Nails 3 inch",
    category: "Nails",
    description: "Galvanized 3-inch wire carpentry nails",
    baseUnit: "kg",
    baseUnitLabel: "Kilogram (kg)",
    reorderLevel: 50,
    stockOnHand: 22.5,
    costPriceNaira: 1500,
    sellingUnits: [
      { unit: "kg", label: "Kilogram (kg)", containsBase: 1, priceNaira: 1800, isDefault: true },
      { unit: "ctn", label: "Carton (ctn)", containsBase: 25, priceNaira: 42000, isDefault: false },
    ],
    active: true,
  },
  {
    id: "bp_006",
    itemNo: "006",
    name: "Nails 2 inch",
    category: "Nails",
    description: "2-inch steel nails",
    baseUnit: "kg",
    baseUnitLabel: "Kilogram (kg)",
    reorderLevel: 50,
    stockOnHand: 38,
    secondaryStockText: "1 ctn + 13 kg",
    costPriceNaira: 1600,
    sellingUnits: [
      { unit: "kg", label: "Kilogram (kg)", containsBase: 1, priceNaira: 1900, isDefault: true },
      { unit: "ctn", label: "Carton (ctn)", containsBase: 25, priceNaira: 44500, isDefault: false },
    ],
    active: true,
  },
  {
    id: "bp_007",
    itemNo: "007",
    name: "Binding Wire",
    category: "Binding Wire",
    description: "Flexible annealed tie wire for iron rods",
    baseUnit: "kg",
    baseUnitLabel: "Kilogram (kg)",
    reorderLevel: 40,
    stockOnHand: 32,
    secondaryStockText: "1 bdl + 12 kg",
    costPriceNaira: 1350,
    sellingUnits: [
      { unit: "kg", label: "Kilogram (kg)", containsBase: 1, priceNaira: 1600, isDefault: true },
      { unit: "bdl", label: "Bundle (bdl)", containsBase: 20, priceNaira: 30000, isDefault: false },
    ],
    active: true,
  },
  {
    id: "bp_008",
    itemNo: "008",
    name: "Aluminium Roofing Sheet 0.45mm",
    category: "Roofing",
    description: "Long-span 0.45mm gauge colour-coated roofing sheet",
    baseUnit: "sht",
    baseUnitLabel: "Sheet (sht)",
    reorderLevel: 25,
    stockOnHand: 123,
    costPriceNaira: 7800,
    sellingUnits: [
      { unit: "sht", label: "Sheet (sht)", containsBase: 1, priceNaira: 8500, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_009",
    itemNo: "009",
    name: "PVC Ceiling Panel 5.95m",
    category: "PVC Ceiling",
    description: "High-gloss tongue-and-groove PVC ceiling length",
    baseUnit: "lgth",
    baseUnitLabel: "Length (lgth)",
    reorderLevel: 20,
    stockOnHand: 8,
    costPriceNaira: 2750,
    sellingUnits: [
      { unit: "lgth", label: "Length (lgth)", containsBase: 1, priceNaira: 3200, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_010",
    itemNo: "010",
    name: "PVC Pipe 4 inch",
    category: "Plumbing",
    description: "Heavy pressure 4-inch uPVC drainage pipe",
    baseUnit: "lgth",
    baseUnitLabel: "Length (lgth)",
    reorderLevel: 20,
    stockOnHand: 88,
    costPriceNaira: 5100,
    sellingUnits: [
      { unit: "lgth", label: "Length (lgth)", containsBase: 1, priceNaira: 6000, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_011",
    itemNo: "011",
    name: "Floor Tiles 60×60 (1.44m²)",
    category: "Tiles",
    description: "Vitrified glazed porcelain floor tiles 60x60cm",
    baseUnit: "ctn",
    baseUnitLabel: "Carton (ctn)",
    reorderLevel: 25,
    stockOnHand: 15,
    costPriceNaira: 12800,
    sellingUnits: [
      { unit: "ctn", label: "Carton (ctn)", containsBase: 1, priceNaira: 14500, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_012",
    itemNo: "012",
    name: "Emulsion Paint 20L (White)",
    category: "Paints",
    description: "20-litre interior/exterior matt emulsion bucket",
    baseUnit: "bkt",
    baseUnitLabel: "Bucket (bkt)",
    reorderLevel: 10,
    stockOnHand: 24,
    costPriceNaira: 24500,
    sellingUnits: [
      { unit: "bkt", label: "Bucket (bkt)", containsBase: 1, priceNaira: 28000, isDefault: true },
    ],
    active: true,
  },
  {
    id: "bp_013",
    itemNo: "013",
    name: "Mortise Door Lock",
    category: "Door Locks",
    description: "Heavy security cylinder mortise handle lock set",
    baseUnit: "pc",
    baseUnitLabel: "Piece (pc)",
    reorderLevel: 12,
    stockOnHand: 43,
    secondaryStockText: "4 box + 3 pc",
    costPriceNaira: 7200,
    sellingUnits: [
      { unit: "pc", label: "Piece (pc)", containsBase: 1, priceNaira: 8500, isDefault: true },
      { unit: "box", label: "Box (box)", containsBase: 10, priceNaira: 80000, isDefault: false },
    ],
    active: true,
  },
  {
    id: "bp_014",
    itemNo: "014",
    name: "Wheelbarrow (Heavy Duty)",
    category: "Tools",
    description: "Reinforced steel tray site construction wheelbarrow",
    baseUnit: "pc",
    baseUnitLabel: "Piece (pc)",
    reorderLevel: 5,
    stockOnHand: 7,
    costPriceNaira: 43000,
    sellingUnits: [
      { unit: "pc", label: "Piece (pc)", containsBase: 1, priceNaira: 48000, isDefault: true },
    ],
    active: true,
  },
];

export const INITIAL_BUILDER_SALES: BuilderSaleRecord[] = [
  {
    id: "bs_106",
    invoiceNo: "INV-000106",
    date: "2026-11-09",
    displayDate: "09/11/26",
    dayHeader: "Mon, 9 Nov 2026",
    customerId: "cust_1",
    customerName: "Mama Bose Ventures",
    customerPhone: "08000000104",
    items: [
      {
        id: "li_1",
        productId: "bp_001",
        itemNo: "001",
        description: "Dangote Cement 50kg (bag)",
        unit: "bag",
        qty: 1,
        containsBase: 1,
        unitPriceNaira: 9800,
        totalAmountNaira: 9800,
      },
      {
        id: "li_2",
        productId: "bp_004",
        itemNo: "004",
        description: "Iron Rod 16mm (lgth)",
        unit: "lgth",
        qty: 1,
        containsBase: 1,
        unitPriceNaira: 21500,
        totalAmountNaira: 21500,
      },
    ],
    totalAmountNaira: 31300,
    amountPaidNaira: 0,
    outstandingNaira: 31300,
    paymentMethod: "Cash",
    fulfilment: "Self collection",
    remarks: "Self collection",
    salesRep: "Chima Ezenwa",
    sign: "Chima",
    status: "Unpaid",
    createdAt: "2026-11-09T10:15:00Z",
  },
  {
    id: "bs_105",
    invoiceNo: "INV-000105",
    date: "2026-10-30",
    displayDate: "30/10/26",
    dayHeader: "Fri, 30 Oct 2026",
    customerId: "cust_4",
    customerName: "Pastor Femi Adebayo",
    customerPhone: "08000000103",
    items: [
      {
        id: "li_105",
        productId: "bp_002",
        itemNo: "002",
        description: "BUA Cement 50kg (bag)",
        unit: "bag",
        qty: 5,
        containsBase: 1,
        unitPriceNaira: 9700,
        totalAmountNaira: 48500,
      },
    ],
    totalAmountNaira: 48500,
    amountPaidNaira: 48500,
    outstandingNaira: 0,
    paymentMethod: "Moniepoint POS",
    fulfilment: "Delivered",
    remarks: "Christ Grace Church site, Iba",
    salesRep: "Chima Ezenwa",
    sign: "Chima",
    status: "Paid",
    createdAt: "2026-10-30T14:20:00Z",
  },
  {
    id: "bs_104",
    invoiceNo: "INV-000104",
    date: "2026-10-21",
    displayDate: "21/10/26",
    dayHeader: "Wed, 21 Oct 2026",
    customerId: "cust_6",
    customerName: "Ibrahim & Sons Construction",
    customerPhone: "08000000102",
    items: [
      {
        id: "li_104",
        productId: "bp_001",
        itemNo: "001",
        description: "Dangote Cement 50kg (bag)",
        unit: "bag",
        qty: 10,
        containsBase: 1,
        unitPriceNaira: 9820,
        totalAmountNaira: 98200,
      },
    ],
    totalAmountNaira: 98200,
    amountPaidNaira: 88200,
    outstandingNaira: 10000,
    paymentMethod: "UBA",
    fulfilment: "Delivered",
    remarks: "Alaba Rago Road, Ojo",
    salesRep: "Chima Ezenwa",
    sign: "Chima",
    status: "Part paid",
    createdAt: "2026-10-21T11:10:00Z",
  },
  {
    id: "bs_103",
    invoiceNo: "INV-000103",
    date: "2026-10-16",
    displayDate: "16/10/26",
    dayHeader: "Fri, 16 Oct 2026",
    customerId: "cust_3",
    customerName: "Chief Okonkwo",
    customerPhone: "08000000105",
    items: [
      {
        id: "li_103",
        productId: "bp_008",
        itemNo: "008",
        description: "Aluminium Roofing Sheet 0.45mm (sht)",
        unit: "sht",
        qty: 13,
        containsBase: 1,
        unitPriceNaira: 8400,
        totalAmountNaira: 109200,
      },
    ],
    totalAmountNaira: 109200,
    amountPaidNaira: 109200,
    outstandingNaira: 0,
    paymentMethod: "UBA",
    fulfilment: "Delivered",
    remarks: "Lekki Phase 1 (site)",
    salesRep: "Chima Ezenwa",
    sign: "Chima",
    status: "Paid",
    createdAt: "2026-10-16T09:45:00Z",
  },
  {
    id: "bs_102",
    invoiceNo: "INV-000102",
    date: "2026-10-12",
    displayDate: "12/10/26",
    dayHeader: "Mon, 12 Oct 2026",
    customerId: "walkin",
    customerName: "Walk-in",
    customerPhone: "",
    items: [
      {
        id: "li_102",
        productId: "bp_004",
        itemNo: "004",
        description: "Iron Rod 16mm (lgth)",
        unit: "lgth",
        qty: 10,
        containsBase: 1,
        unitPriceNaira: 21360,
        totalAmountNaira: 213600,
      },
    ],
    totalAmountNaira: 213600,
    amountPaidNaira: 213600,
    outstandingNaira: 0,
    paymentMethod: "Cash",
    fulfilment: "Self collection",
    remarks: "",
    salesRep: "Chima Ezenwa",
    sign: "Chima",
    status: "Paid",
    createdAt: "2026-10-12T15:00:00Z",
  },
  {
    id: "bs_101",
    invoiceNo: "INV-000101",
    date: "2026-10-10",
    displayDate: "10/10/26",
    dayHeader: "Sat, 10 Oct 2026",
    customerId: "walkin",
    customerName: "Walk-in",
    customerPhone: "",
    items: [
      {
        id: "li_101",
        productId: "bp_012",
        itemNo: "012",
        description: "Emulsion Paint 20L (White) (bkt)",
        unit: "bkt",
        qty: 1,
        containsBase: 1,
        unitPriceNaira: 28000,
        totalAmountNaira: 28000,
      },
      {
        id: "li_101b",
        productId: "bp_005",
        itemNo: "005",
        description: "Nails 3 inch (kg)",
        unit: "kg",
        qty: 6,
        containsBase: 1,
        unitPriceNaira: 1883,
        totalAmountNaira: 11300,
      },
    ],
    totalAmountNaira: 39300,
    amountPaidNaira: 39300,
    outstandingNaira: 0,
    paymentMethod: "Cash",
    fulfilment: "Self collection",
    remarks: "",
    salesRep: "Chima Ezenwa",
    sign: "Chima",
    status: "Paid",
    createdAt: "2026-10-10T16:12:00Z",
  },
];

export const INITIAL_BUILDER_STOCK_SHEETS: BuilderStockSheet[] = [
  {
    id: "ss_21",
    sheetNo: "ST-00021",
    isoDate: "2026-11-09",
    displayDate: "Mon, 9 Nov 2026",
    shortDate: "09/11/26",
    itemsMoved: 2,
    unitsOut: 2,
    unitsIn: 0,
    countedBy: "",
    rows: [
      {
        id: "ssr_1",
        date: "09/11/26",
        itemNo: "001",
        description: "Dangote Cement 50kg (bag)",
        unitPriceNaira: 9800,
        cartonPriceNaira: null,
        openingBal: 119,
        stockOut: 1,
        stockIn: 0,
        closingBal: 118,
      },
      {
        id: "ssr_2",
        date: "09/11/26",
        itemNo: "004",
        description: "Iron Rod 16mm (lgth)",
        unitPriceNaira: 21500,
        cartonPriceNaira: null,
        openingBal: 159,
        stockOut: 1,
        stockIn: 0,
        closingBal: 158,
      },
    ],
  },
];

export const INITIAL_BUILDER_DEBTORS: BuilderDebtorCustomer[] = [
  {
    id: "cust_1",
    name: "Mama Bose Ventures",
    phone: "08000000104",
    address: "Iba Market, Lane 3",
    notes: "Regular cement and rod distributor",
    totalOwedNaira: 281300,
    oldestInvoiceDate: "13/07/2026",
    daysAgo: 133,
    unpaidInvoicesCount: 2,
    invoiceNumbers: ["INV-000089", "INV-000106"],
  },
  {
    id: "cust_2",
    name: "Adewumi Builders",
    phone: "08000000101",
    address: "Plot 14, Okokomaiko, Ojo",
    notes: "Site engineer account",
    totalOwedNaira: 237000,
    oldestInvoiceDate: "13/07/2026",
    daysAgo: 133,
    unpaidInvoicesCount: 1,
    invoiceNumbers: ["INV-000090"],
  },
  {
    id: "cust_3",
    name: "Chief Okonkwo",
    phone: "08000000105",
    address: "Lekki Phase 1 (site)",
    notes: "Duplex roofing project",
    totalOwedNaira: 167200,
    oldestInvoiceDate: "16/10/2026",
    daysAgo: 38,
    unpaidInvoicesCount: 1,
    invoiceNumbers: ["INV-000098"],
  },
  {
    id: "cust_4",
    name: "Pastor Femi Adebayo",
    phone: "08000000103",
    address: "Christ Grace Church site, Iba",
    notes: "Church auditorium expansion",
    totalOwedNaira: 101000,
    oldestInvoiceDate: "01/10/2026",
    daysAgo: 53,
    unpaidInvoicesCount: 1,
    invoiceNumbers: ["INV-000095"],
  },
  {
    id: "cust_5",
    name: "Kelechi & Co. Plumbing",
    phone: "08000000106",
    address: "LASU Gate, Ojo",
    notes: "Plumbing contractor",
    totalOwedNaira: 38000,
    oldestInvoiceDate: "06/09/2026",
    daysAgo: 78,
    unpaidInvoicesCount: 1,
    invoiceNumbers: ["INV-000092"],
  },
  {
    id: "cust_6",
    name: "Ibrahim & Sons Construction",
    phone: "08000000102",
    address: "Alaba Rago Road, Ojo",
    notes: "Balance on 10 bags Dangote cement",
    totalOwedNaira: 10000,
    oldestInvoiceDate: "21/10/2026",
    daysAgo: 33,
    unpaidInvoicesCount: 1,
    invoiceNumbers: ["INV-000104"],
  },
];

export const INITIAL_BUILDER_USERS: BuilderUserRecord[] = [
  {
    id: "bu_1",
    name: "Blessing Adeyemi",
    username: "@demo.blessing",
    phone: "08000000201",
    role: "Sales Rep",
    status: "Active",
    lastSignIn: "Never",
  },
  {
    id: "bu_2",
    name: "Chima Ezenwa",
    username: "@chimatop",
    phone: "—",
    role: "Owner",
    status: "Active",
    lastSignIn: "23/11/2026, 20:31",
    isCurrentUser: true,
  },
  {
    id: "bu_3",
    name: "Joseph Okoronkwo",
    username: "@jayking40",
    phone: "+2348068377129",
    role: "Owner",
    status: "Active",
    lastSignIn: "09/11/2026, 11:32",
  },
  {
    id: "bu_4",
    name: "Tunde Bello",
    username: "@demo.tunde",
    phone: "08000000202",
    role: "Sales Rep",
    status: "Active",
    lastSignIn: "Never",
  },
];

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
  rcNumber: "9082374",
  tagline: "Top Builders... Building A Solid Foundation...",
  dealsIn:
    "Dealers in all kinds of Building Materials such as PVC Ceiling, Iron Rod, Cements, Pipe, Tiles, Roofing Sheets, Door Locks, Binding Wires, Alumaco Doors & Windows, Paints, Razor & Binding Wires, BRC wires, etc.",
  address: "NAOWA Mega Plaza, Ojo Cantonement, Klm 4, LASU/Isheri Road, Iba, Ojo, Lagos.",
  phones: "08100044228, 09032771927",
  email: "topbuildingmaterials@gmail.com",
  logoUrl: "/logos/builders-logo.png",
  invoiceTerms: "Goods sold in good condition are not refundable. No refund of payment made.",
  receiptFooter: "Quality Guaranteed!",
  topBarMessage: "",
  allowNegativeStock: false,
  lastBackup: "Never",
  numbering: {
    invoicePrefix: "INV-",
    invoiceNext: 107,
    oldDebtPrefix: "OB-",
    oldDebtNext: 1,
    paymentPrefix: "PAY-",
    paymentNext: 116,
    stockSheetPrefix: "ST-",
    stockSheetNext: 22,
  },
  paymentAccounts: [
    {
      id: "pa_1",
      name: "Moniepoint POS",
      type: "POS terminal",
      accountNumber: "",
      active: true,
    },
    {
      id: "pa_2",
      name: "UBA",
      type: "Bank transfer",
      accountNumber: "1023948571",
      active: true,
    },
  ],
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

export const INITIAL_BUILDER_AUDIT_LOGS: BuilderAuditEntry[] = [
  {
    id: "aud_1",
    timestamp: "23/11/2026, 20:31",
    actor: "Chima Ezenwa (@chimatop)",
    role: "Owner",
    action: "Signed in to Top Builders Workspace",
    category: "Auth",
    details: "Session started from desktop browser",
  },
  {
    id: "aud_2",
    timestamp: "09/11/2026, 11:32",
    actor: "Chima Ezenwa (@chimatop)",
    role: "Owner",
    action: "Recorded credit sale INV-000106 (₦31,300)",
    category: "Sale",
    details: "Customer: Mama Bose Ventures · 1 bag Dangote Cement 50kg, 1 lgth Iron Rod 16mm",
  },
  {
    id: "aud_3",
    timestamp: "09/11/2026, 11:32",
    actor: "System Auto-Ledger",
    role: "Owner",
    action: "Updated Stock Sheet ST-00021",
    category: "Stock",
    details: "Moved 2 items (1 bag 001 out, 1 lgth 004 out)",
  },
];
