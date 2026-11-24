export interface BillstacksModule {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string; // Lucide icon name
  features: string[];
  route?: string;
  category: "core" | "addon" | "premium";
  isPopular?: boolean;
}

export const BILLSTACKS_MODULES: BillstacksModule[] = [
  {
    id: "products",
    name: "Products & Inventory",
    shortName: "Products",
    description: "Manage your product catalog, stock levels, and inventory across multiple locations.",
    icon: "Package",
    features: [
      "Unlimited products & variants",
      "Stock alerts & low inventory warnings",
      "Multi-location inventory tracking",
      "Barcode/QR code support",
      "Import/export via CSV",
    ],
    category: "core",
    isPopular: true,
  },
  {
    id: "tax",
    name: "Tax Compliance (FIRS)",
    shortName: "Tax",
    description: "Automated Nigerian tax compliance with FIRS 7.5% VAT reporting and remittance.",
    icon: "Calculator",
    features: [
      "Auto-calculate 7.5% VAT on invoices",
      "FIRS-compliant VAT returns (VAT002)",
      "Withholding Tax (WHT) computation",
      "Tax exemption certificate management",
      "Audit-ready tax reports",
    ],
    category: "core",
  },
  {
    id: "hrm",
    name: "Human Resource Management",
    shortName: "HRM",
    description: "Complete HR suite for payroll, leave, attendance, and employee management.",
    icon: "Users",
    features: [
      "Employee database & profiles",
      "Automated payroll with tax deductions",
      "Leave management & approval workflows",
      "Attendance tracking (biometric/manual)",
      "Pension & NHF contributions",
      "Payslip generation & distribution",
    ],
    category: "addon",
  },
  {
    id: "affiliate",
    name: "Affiliate & Referral Program",
    shortName: "Affiliate",
    description: "Grow your business through partner referrals with automated commission tracking.",
    icon: "Gift",
    features: [
      "Custom commission structures",
      "Real-time referral tracking",
      "Automated payout calculations",
      "Partner dashboard & analytics",
      "Multi-tier referral support",
    ],
    category: "addon",
  },
  {
    id: "estimates",
    name: "Estimates & Quotes",
    shortName: "Estimates",
    description: "Professional quotes that convert to invoices with one click.",
    icon: "FileText",
    features: [
      "Beautiful quote templates",
      "One-click convert to invoice",
      "Version control & revision history",
      "Client approval workflow",
      "Validity periods & auto-expiry",
    ],
    category: "core",
    isPopular: true,
  },
  {
    id: "recurring-invoices",
    name: "Recurring Invoices",
    shortName: "Recurring",
    description: "Automate subscription billing with flexible schedules and payment retries.",
    icon: "RotateCcw",
    features: [
      "Daily, weekly, monthly, yearly schedules",
      "Automatic payment collection (Paystack)",
      "Smart retry on failed payments",
      "Proration for mid-cycle changes",
      "Customer self-service portal",
    ],
    category: "core",
    isPopular: true,
  },
  {
    id: "role-permissions",
    name: "Role-Based Access Control",
    shortName: "Roles",
    description: "Granular permissions for team collaboration and data security.",
    icon: "ShieldCheck",
    features: [
      "Pre-defined roles (Admin, Accountant, Cashier, etc.)",
      "Custom role creation",
      "Module-level permissions",
      "Field-level data access",
      "Audit trail for permission changes",
    ],
    category: "premium",
  },
];
