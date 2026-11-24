"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  ShoppingCart,
  Folder,
  Percent,
  PieChart,
  Link2,
  Clock,
  Flag,
  Lock,
  LogOut,
  Receipt,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle2,
  Package,
  Calculator,
  Users,
  FileText,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
  FileCheck,
  ArrowRight,
  ExternalLink,
  Share2,
  DollarSign,
  Check,
  Edit2,
  Trash2,
  Eye,
  Printer,
  Building2,
  Sparkles,
  Info,
  ChevronUp,
  Briefcase,
  Paintbrush,
  UserCircle,
  Mail,
  CheckSquare,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { NumberInput } from "@/components/ui/number-input";
import { BILLSTACKS_COUNTRIES } from "./billstacks-countries";
import {
  BillstacksAuthScreen,
  BillstacksBusinessSetupScreen,
  BillstacksLandingPage,
  BillstacksBusiness,
  BillstacksUserAccount,
} from "./billstacks-onboarding";
import {
  BusinessManagementView,
  UserRoleManagementView,
  InvoiceCustomizationView,
  RolePermissionsMatrixView,
  EmailSettingsView,
  BillstacksTeamUser,
  BillstacksInvoiceCustomization,
  DEFAULT_INVOICE_CUSTOMIZATION,
} from "./billstacks-settings-views";
import {
  CreateBillView,
  RecurringInvoiceView,
  CreateEstimateView,
  CategoriesListView,
  AddCategoryView,
  TaxManagementView,
  ProfitLossReportView,
  SalesTaxReportView,
  IncomeByCustomerReportView,
  PurchasesByVendorReportView,
  GeneralReportsView,
  AffiliateHomeView,
  AffiliateReferralsView,
  AffiliatePayoutsView,
  SubscriptionView,
  CountryView,
  ChangePasswordView,
} from "./billstacks-extended-views";
import { BillstacksPaymentModal } from "./billstacks-payment-modal";

export type BillstacksSection =
  | "dashboard"
  | "settings"
  | "payment-settings"
  | "sales-customers"
  | "sales-products"
  | "sales-estimates"
  | "sales-create-estimate"
  | "sales-invoices"
  | "sales-create-invoice"
  | "sales-recurring"
  | "purchases-bills"
  | "purchases-create-bill"
  | "purchases-vendors"
  | "purchases-expenses"
  | "purchases-products"
  | "categories"
  | "categories-add"
  | "tax"
  | "reports"
  | "reports-pl"
  | "reports-tax"
  | "reports-customer"
  | "reports-vendor"
  | "reports-general"
  | "affiliate"
  | "affiliate-home"
  | "affiliate-referrals"
  | "affiliate-payouts"
  | "subscription"
  | "country"
  | "change-password";

interface Customer {
  id: string;
  name: string;
  info: string;
  email: string;
  phone: string;
  address: string;
}

interface Vendor {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface ProductItem {
  id: string;
  name: string;
  priceNaira: number;
  type: string;
}

interface Estimate {
  id: string;
  number: string;
  customer: string;
  date: string;
  amountNaira: number;
  status: "Draft" | "Sent" | "Accepted" | "Declined";
}

interface InvoiceItem {
  id: string;
  number: string;
  customer: string;
  date: string;
  dueDate: string;
  amountNaira: number;
  status: "Unpaid" | "Draft" | "Paid" | "Recurring";
}

interface BillItem {
  id: string;
  number: string;
  vendor: string;
  date: string;
  amountNaira: number;
  amountDueNaira: number;
  status: "Paid" | "Unpaid" | "Overdue";
}

interface ExpenseItem {
  id: string;
  date: string;
  amountNaira: number;
  client: string;
  category: string;
  notes: string;
}

interface InvoiceLineRow {
  id: string;
  item: string;
  details: string;
  price: number;
  quantity: number;
  total: number;
}

const BILLSTACKS_SESSION_KEY = "zino_billstacks_workspace_v1";
const BILLSTACKS_CUSTOMERS_KEY = "zino_billstacks_customers_v2";
const BILLSTACKS_VENDORS_KEY = "zino_billstacks_vendors_v2";
const BILLSTACKS_PURCHASE_PRODUCTS_KEY = "zino_billstacks_purch_products_v2";
const BILLSTACKS_ESTIMATES_KEY = "zino_billstacks_estimates_v2";
const BILLSTACKS_INVOICES_KEY = "zino_billstacks_invoices_v2";
const BILLSTACKS_BILLS_KEY = "zino_billstacks_bills_v2";
const BILLSTACKS_EXPENSES_KEY = "zino_billstacks_expenses_v2";

export function BillstacksApp() {
  const {
    products: storeProducts,
    invoices: storeInvoices,
    saveProduct,
    deleteProduct,
    recordTransaction,
    paymentSettings,
    updatePaymentSettings,
  } = usePlatformStore();

  // Unified live Billstacks plans & products from Main Admin Dashboard
  const adminBillstacksPlans = useMemo(
    () =>
      storeProducts.filter(
        (p) =>
          p.source === ServiceSlug.BILLSTACKS &&
          p.status !== "INACTIVE" &&
          p.status !== "ARCHIVED"
      ),
    [storeProducts]
  );

  // Onboarding / Auth / Multi-business Workspace State
  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState<"auth" | "setup-business" | "landing" | "dashboard">("auth");
  const [authInitialMode, setAuthInitialMode] = useState<"signup" | "login">("signup");
  const [userAccount, setUserAccount] = useState<BillstacksUserAccount | null>(null);
  const [businesses, setBusinesses] = useState<BillstacksBusiness[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<string>("");
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [teamUsers, setTeamUsers] = useState<BillstacksTeamUser[]>([
    {
      id: "usr_owner",
      name: "Daniel Adeyemi",
      email: "adeyemidaniel3366@gmail.com",
      position: "Business Partner/Co-owner",
      role: "Admin",
      permissions: {
        Customers: "Full Access",
        Products: "Full Access",
        Estimates: "Full Access",
        Invoices: "Full Access",
        Expenses: "Full Access",
        Bills: "Full Access",
        Reports: "Full Access",
      },
    },
  ]);

  const [invoiceCustomization, setInvoiceCustomization] = useState<BillstacksInvoiceCustomization>(
    DEFAULT_INVOICE_CUSTOMIZATION
  );

  const activeBusiness = useMemo<BillstacksBusiness>(() => {
    const found = businesses.find((b) => b.id === activeBusinessId) || businesses[0];
    if (found) return found;
    return {
      id: "biz_default",
      name: "My Business",
      category: "Technology & SaaS",
      country: "Nigeria",
      currencyCode: "NGN",
      currencySymbol: "₦",
      priceFormat: "₦100",
      symbolDirection: "₦100 (Left)",
      priceSeparator: "₦ 1,000.00",
    };
  }, [businesses, activeBusinessId]);

  const [activeSection, setActiveSection] = useState<BillstacksSection>("dashboard");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accordion Sidebar Groups State
  const [salesOpen, setSalesOpen] = useState(true);
  const [purchasesOpen, setPurchasesOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [affiliateOpen, setAffiliateOpen] = useState(false);

  // Speed-dial Floating Action Button State (matching Image 1)
  const [fabOpen, setFabOpen] = useState(false);

  // Modals state
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productType, setProductType] = useState<"Sales" | "Purchases">("Sales");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Online Payment Checkout Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentTarget, setActivePaymentTarget] = useState<{
    title: string;
    subtitle?: string;
    amountNaira: number;
    customerName?: string;
    referenceNo?: string;
    itemType?: "Invoice" | "Subscription" | "Bill";
    invoiceId?: string;
  } | null>(null);

  // Settings State (matching Image 2)
  const [settingsTab, setSettingsTab] = useState<
    "general" | "password" | "business" | "customization" | "permissions" | "roles" | "email"
  >("general");
  const [profileForm, setProfileForm] = useState({
    name: "Daniel Adeyemi",
    email: "adeyemidaniel3366@gmail.com",
    country: "Nigeria",
    city: "Lagos",
    state: "Lagos State",
    postcode: "100001",
    address: "Adeyemi Crescent, Lekki Phase 1, Lagos",
  });

  // Restore Billstacks workspace session from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BILLSTACKS_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.userAccount) setUserAccount(parsed.userAccount);
        if (Array.isArray(parsed.businesses) && parsed.businesses.length > 0) {
          setBusinesses(parsed.businesses);
        }
        if (parsed.activeBusinessId) setActiveBusinessId(parsed.activeBusinessId);
        if (parsed.stage) setStage(parsed.stage);
        if (parsed.profileAvatar) setProfileAvatar(parsed.profileAvatar);
        if (parsed.profileForm) setProfileForm(parsed.profileForm);
        if (Array.isArray(parsed.teamUsers)) setTeamUsers(parsed.teamUsers);
        if (parsed.invoiceCustomization) setInvoiceCustomization(parsed.invoiceCustomization);
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist Billstacks workspace session
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        BILLSTACKS_SESSION_KEY,
        JSON.stringify({
          stage,
          userAccount,
          businesses,
          activeBusinessId,
          profileAvatar,
          profileForm,
          teamUsers,
          invoiceCustomization,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [
    hydrated,
    stage,
    userAccount,
    businesses,
    activeBusinessId,
    profileAvatar,
    profileForm,
    teamUsers,
    invoiceCustomization,
  ]);

  const handleSignOut = () => {
    setAccountDropdownOpen(false);
    setAuthInitialMode("login");
    setStage("auth");
    showToast("Signed out of Billstacks. Log in or sign up to continue.");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileAvatar(String(reader.result || ""));
      showToast("Profile picture uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  // Payment Gateways Settings State (matching Image 3) — Synced with unified store
  const [paymentGateways, setPaymentGateways] = useState(() => paymentSettings);

  useEffect(() => {
    if (paymentSettings) {
      setPaymentGateways(paymentSettings);
    }
  }, [paymentSettings]);

  // Customers (Image 4) — Loaded from localStorage, clean empty state when no data exists
  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(BILLSTACKS_CUSTOMERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    info: "",
    email: "",
    phone: "",
    address: "",
  });

  // Vendors (Image 10) — Loaded from localStorage, clean empty state when no data exists
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(BILLSTACKS_VENDORS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newVendor, setNewVendor] = useState({ name: "", phone: "", email: "" });

  // Products (Images 5 & 12)
  const [purchaseProducts, setPurchaseProducts] = useState<ProductItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(BILLSTACKS_PURCHASE_PRODUCTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newProduct, setNewProduct] = useState({ name: "", priceNaira: 0, type: "Service" });

  // Estimates (Image 6) — Clean empty default
  const [estimates, setEstimates] = useState<Estimate[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(BILLSTACKS_ESTIMATES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newEstimate, setNewEstimate] = useState({
    customer: "",
    amountNaira: 0,
    status: "Draft" as const,
  });

  // Invoices (Image 7) — Clean empty default
  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(BILLSTACKS_INVOICES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [invoiceStatusTab, setInvoiceStatusTab] = useState<"All" | "Unpaid" | "Draft" | "Recurring">("All");

  // Create New Invoice Form State (matching Image 8)
  const [createInvoiceCustomer, setCreateInvoiceCustomer] = useState("");
  const [createInvoiceNumber, setCreateInvoiceNumber] = useState(`2026-${Math.floor(100 + Math.random() * 900)}`);
  const [createInvoicePoNumber, setCreateInvoicePoNumber] = useState("");
  const [createInvoiceDate, setCreateInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [createInvoiceDueDate, setCreateInvoiceDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [createInvoiceTerms, setCreateInvoiceTerms] = useState("On Receipt");
  const [createInvoiceDiscountPct, setCreateInvoiceDiscountPct] = useState<number>(0);
  const [createInvoiceLines, setCreateInvoiceLines] = useState<InvoiceLineRow[]>([]);

  // Bills (Image 9) — Clean empty default
  const [bills, setBills] = useState<BillItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(BILLSTACKS_BILLS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Expenses (Image 11) — Clean empty default
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(BILLSTACKS_EXPENSES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().slice(0, 10),
    amountNaira: 0,
    client: "",
    category: "Hosting & Cloud",
    notes: "",
  });

  // Synchronize collections with localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(BILLSTACKS_CUSTOMERS_KEY, JSON.stringify(customers));
      window.localStorage.setItem(BILLSTACKS_VENDORS_KEY, JSON.stringify(vendors));
      window.localStorage.setItem(BILLSTACKS_PURCHASE_PRODUCTS_KEY, JSON.stringify(purchaseProducts));
      window.localStorage.setItem(BILLSTACKS_ESTIMATES_KEY, JSON.stringify(estimates));
      window.localStorage.setItem(BILLSTACKS_INVOICES_KEY, JSON.stringify(invoices));
      window.localStorage.setItem(BILLSTACKS_BILLS_KEY, JSON.stringify(bills));
      window.localStorage.setItem(BILLSTACKS_EXPENSES_KEY, JSON.stringify(expenses));
    } catch {
      // Ignore quota errors
    }
  }, [customers, vendors, purchaseProducts, estimates, invoices, bills, expenses]);

  // Categories
  const [categories, setCategories] = useState([
    { id: "cat1", name: "Hosting & Cloud", type: "Expense" },
    { id: "cat2", name: "Utilities", type: "Expense" },
    { id: "cat3", name: "Professional Fees", type: "Expense" },
    { id: "cat4", name: "Software Subscriptions", type: "Income" },
    { id: "cat5", name: "POS & Hardware Sales", type: "Income" },
    { id: "cat6", name: "Apartment Rentals", type: "Income" },
  ]);
  const [newCategory, setNewCategory] = useState({ name: "", type: "Expense" });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Line item helpers for Create New Invoice (Image 8)
  const addInvoiceLine = () => {
    const newId = `l_${Date.now()}`;
    setCreateInvoiceLines([
      ...createInvoiceLines,
      { id: newId, item: "", details: "", price: 0, quantity: 1, total: 0 },
    ]);
  };

  const updateInvoiceLine = (id: string, field: keyof InvoiceLineRow, val: any) => {
    setCreateInvoiceLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, [field]: val };
        if (field === "price" || field === "quantity") {
          updated.total = Number(updated.price || 0) * Number(updated.quantity || 1);
        }
        return updated;
      })
    );
  };

  const removeInvoiceLine = (id: string) => {
    if (createInvoiceLines.length <= 1) return;
    setCreateInvoiceLines((prev) => prev.filter((l) => l.id !== id));
  };

  const invoiceSubtotal = useMemo(() => {
    return createInvoiceLines.reduce((acc, curr) => acc + (curr.total || 0), 0);
  }, [createInvoiceLines]);

  const invoiceGrandTotal = useMemo(() => {
    const discount = (invoiceSubtotal * (Number(createInvoiceDiscountPct) || 0)) / 100;
    return Math.max(0, invoiceSubtotal - discount);
  }, [invoiceSubtotal, createInvoiceDiscountPct]);

  const handleSaveInvoiceSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!createInvoiceCustomer) {
      showToast("Please select a customer for this invoice.");
      return;
    }
    const newInvObj: InvoiceItem = {
      id: `inv_${Date.now()}`,
      number: createInvoiceNumber,
      customer: createInvoiceCustomer,
      date: createInvoiceDate,
      dueDate: createInvoiceDueDate,
      amountNaira: invoiceGrandTotal,
      status: "Unpaid",
    };
    setInvoices([newInvObj, ...invoices]);

    // Also record transaction in unified platform store
    recordTransaction({
      source: ServiceSlug.BILLSTACKS,
      activityType: "INVOICE",
      activitySummary: `Invoice ${createInvoiceNumber} issued to ${createInvoiceCustomer} (${createInvoiceTerms})`,
      customer: createInvoiceCustomer,
      amountKobo: invoiceGrandTotal * 100,
      location: "Billstacks Cloud Invoicing",
      status: "PENDING",
      invoiceNo: createInvoiceNumber,
    });

    showToast(`Invoice #${createInvoiceNumber} created successfully! Logged to unified ledger.`);
    setActiveSection("sales-invoices");
  };

  // Navigation Click Handler
  const handleNav = (section: BillstacksSection) => {
    setActiveSection(section);
    setFabOpen(false);
  };

  // Render Left Navigation Sidebar
  const renderSidebar = () => (
    <aside className="w-64 bg-[#111827] text-gray-300 flex flex-col shrink-0 min-h-screen border-r border-gray-800 text-xs select-none">
      {/* Top Organization Header + Image 1 Bill Stacks accounts dropdown */}
      <div className="p-4 border-b border-gray-800/80 relative">
        <button
          type="button"
          onClick={() => setAccountDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 cursor-pointer transition-colors border border-gray-700/50 text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {activeBusiness.logoUrl ? (
                <img
                  src={activeBusiness.logoUrl}
                  alt={activeBusiness.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src="/logos/billstacks-logo.png"
                  alt="Billstacks"
                  width={80}
                  height={35}
                  className="w-full h-auto object-contain"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm leading-none truncate">
                {activeBusiness.name}
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                {activeBusiness.currencyCode} · Billstacks
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
              accountDropdownOpen ? "rotate-90 text-emerald-400" : ""
            }`}
          />
        </button>

        {/* Floating Account Dropdown Popover matching Image 1 */}
        {accountDropdownOpen && (
          <div className="absolute left-3 top-16 z-50 w-72 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-200 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Image
                  src="/logos/billstacks-logo.png"
                  alt="Billstacks"
                  width={26}
                  height={20}
                  className="h-4 w-auto object-contain"
                />
                <span className="font-semibold text-gray-800 text-xs">
                  Bill Stacks accounts
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Businesses Switcher List */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {(businesses.length > 0 ? businesses : [activeBusiness]).map((biz) => {
                const isSelected = biz.id === activeBusiness.id;
                return (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => {
                      setActiveBusinessId(biz.id);
                      setAccountDropdownOpen(false);
                      showToast(`Switched active business to "${biz.name}"`);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? "bg-[#E8F6EC] text-[#1E7E34] font-bold"
                        : "hover:bg-gray-50 text-gray-700 font-medium"
                    }`}
                  >
                    <span className="truncate text-sm">{biz.name}</span>
                    {isSelected && <CheckSquare className="w-4 h-4 text-[#28A745] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-2 space-y-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveSection("settings");
                  setSettingsTab("business");
                  setAccountDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[#28A745] hover:bg-emerald-50 font-semibold transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                <span>Manage business</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection("settings");
                  setSettingsTab("roles");
                  setAccountDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                <Users className="w-4 h-4 text-gray-500" />
                <span>Manage Users</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection("settings");
                  setSettingsTab("customization");
                  setAccountDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                <Paintbrush className="w-4 h-4 text-gray-500" />
                <span>Invoice Customization</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection("settings");
                  setSettingsTab("general");
                  setAccountDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                <UserCircle className="w-4 h-4 text-gray-500" />
                <span>Manage profile</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-medium transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Nav Items List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => handleNav("dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "dashboard"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "hover:bg-gray-800/60 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => handleNav("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "settings"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "hover:bg-gray-800/60 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* Payment Settings */}
        <button
          type="button"
          onClick={() => handleNav("payment-settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "payment-settings"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "hover:bg-gray-800/60 hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Settings</span>
        </button>

        {/* Sales (Dropdown) */}
        <div>
          <button
            type="button"
            onClick={() => setSalesOpen(!salesOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection.startsWith("sales")
                ? "text-emerald-400 bg-gray-800/40"
                : "hover:bg-gray-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              <span>Sales</span>
            </div>
            {salesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {salesOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                type="button"
                onClick={() => handleNav("sales-customers")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "sales-customers" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Customers
              </button>
              <button
                type="button"
                onClick={() => handleNav("sales-products")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "sales-products" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Products &amp; Services
              </button>
              <button
                type="button"
                onClick={() => handleNav("sales-estimates")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "sales-estimates" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Estimates
              </button>
              <button
                type="button"
                onClick={() => handleNav("sales-invoices")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "sales-invoices" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Invoices
              </button>
              <button
                type="button"
                onClick={() => handleNav("sales-recurring")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "sales-recurring" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Recurring Invoice
              </button>
            </div>
          )}
        </div>

        {/* Purchases (Dropdown) */}
        <div>
          <button
            type="button"
            onClick={() => setPurchasesOpen(!purchasesOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection.startsWith("purchases")
                ? "text-emerald-400 bg-gray-800/40"
                : "hover:bg-gray-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4" />
              <span>Purchases</span>
            </div>
            {purchasesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {purchasesOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                type="button"
                onClick={() => handleNav("purchases-bills")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "purchases-bills" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Bills
              </button>
              <button
                type="button"
                onClick={() => handleNav("purchases-vendors")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "purchases-vendors" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Vendors
              </button>
              <button
                type="button"
                onClick={() => handleNav("purchases-expenses")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "purchases-expenses" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleNav("purchases-products")}
                className={`w-full text-left py-1.5 px-2 rounded font-medium ${
                  activeSection === "purchases-products" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                Products &amp; Services
              </button>
            </div>
          )}
        </div>

        {/* Categories */}
        <button
          type="button"
          onClick={() => handleNav("categories")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeSection.startsWith("categories")
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "hover:bg-gray-800/60 hover:text-white"
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Categories</span>
        </button>

        {/* Tax */}
        <button
          type="button"
          onClick={() => handleNav("tax")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "tax"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "hover:bg-gray-800/60 hover:text-white"
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Tax (7.5% VAT)</span>
        </button>

        {/* Reports (Dropdown - Image 13) */}
        <div>
          <button
            type="button"
            onClick={() => setReportsOpen(!reportsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection.startsWith("reports")
                ? "text-emerald-400 bg-gray-800/40"
                : "hover:bg-gray-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <PieChart className="w-4 h-4" />
              <span>Reports</span>
            </div>
            {reportsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {reportsOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
              <button
                type="button"
                onClick={() => handleNav("reports-pl")}
                className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-1.5 ${
                  activeSection === "reports-pl" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>→</span>
                <span>Profit &amp; Loss</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav("reports-tax")}
                className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-1.5 ${
                  activeSection === "reports-tax" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>→</span>
                <span>Sales Tax Report</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav("reports-customer")}
                className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-1.5 ${
                  activeSection === "reports-customer" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>→</span>
                <span>Income by Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav("reports-vendor")}
                className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-1.5 ${
                  activeSection === "reports-vendor" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>→</span>
                <span>Purchases by Vendor</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav("reports-general")}
                className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-1.5 ${
                  activeSection === "reports-general" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>→</span>
                <span>General Reports</span>
              </button>
            </div>
          )}
        </div>

        {/* Affiliate (Dropdown - Image 14) */}
        <div>
          <button
            type="button"
            onClick={() => setAffiliateOpen(!affiliateOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection.startsWith("affiliate")
                ? "text-emerald-400 bg-gray-800/40"
                : "hover:bg-gray-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Link2 className="w-4 h-4" />
              <span>Affiliate</span>
            </div>
            {affiliateOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {affiliateOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
              <button
                type="button"
                onClick={() => handleNav("affiliate-home")}
                className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-1.5 ${
                  activeSection === "affiliate-home" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>⌂</span>
                <span>Home</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav("affiliate-referrals")}
                className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-1.5 ${
                  activeSection === "affiliate-referrals" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>⑂</span>
                <span>Referrals</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav("affiliate-payouts")}
                className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-1.5 ${
                  activeSection === "affiliate-payouts" ? "text-emerald-400 font-bold bg-white/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>💳</span>
                <span>Payouts</span>
              </button>
            </div>
          )}
        </div>

        {/* Subscription */}
        <button
          type="button"
          onClick={() => handleNav("subscription")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "subscription"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "hover:bg-gray-800/60 hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Subscription</span>
        </button>

        {/* Country */}
        <button
          type="button"
          onClick={() => handleNav("country")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "country"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "hover:bg-gray-800/60 hover:text-white"
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Country</span>
        </button>

        {/* Change Password */}
        <button
          type="button"
          onClick={() => handleNav("change-password")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "change-password"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "hover:bg-gray-800/60 hover:text-white"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Change Password</span>
        </button>

        {/* Sign Out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </nav>

      {/* Bottom Controls: Upgrade & Language Switcher (Image 1, 13, 14) */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => handleNav("subscription")}
          className="flex-1 py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-gray-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Upgrade</span>
        </button>
        <div className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white cursor-pointer text-[11px] flex items-center gap-1">
          <span>文A</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </aside>
  );

  // Render Dashboard View (Image 1)
  const renderDashboardView = () => {
    const totalIncome = invoices
      .filter((i) => i.status === "Paid")
      .reduce((acc, curr) => acc + curr.amountNaira, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amountNaira, 0);
    const netIncome = totalIncome - totalExpense;

    const months = [
      "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026",
      "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026",
    ];

    const monthlyStats = months.map((m, idx) => {
      const monthPrefix = idx === 0 ? "2025-12" : `2026-${String(idx).padStart(2, "0")}`;
      const inc = invoices
        .filter((i) => i.status === "Paid" && i.date.startsWith(monthPrefix))
        .reduce((sum, i) => sum + i.amountNaira, 0);
      const exp = expenses
        .filter((e) => e.date.startsWith(monthPrefix))
        .reduce((sum, e) => sum + e.amountNaira, 0);
      return { m, inc, exp };
    });

    const maxVal = Math.max(...monthlyStats.map((s) => Math.max(s.inc, s.exp)), 1000);

    return (
      <div className="space-y-6">
        {/* Top Grid: Last 12 months Income & 3 status cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Last 12 months Income Chart Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Last 12 months Income</h3>
            <div className="w-full bg-[#1A1A1A] rounded-xl p-5 text-white space-y-4">
              <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-gray-800">
                {monthlyStats.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        style={{ height: item.inc > 0 ? `${Math.max((item.inc / maxVal) * 100, 5)}%` : "2px" }}
                        className={`w-2.5 rounded-t transition-all ${
                          item.inc > 0 ? "bg-blue-500 group-hover:bg-blue-400" : "bg-gray-800"
                        }`}
                        title={`Income: ₦${item.inc.toLocaleString()}`}
                      />
                      <div
                        style={{ height: item.exp > 0 ? `${Math.max((item.exp / maxVal) * 100, 5)}%` : "2px" }}
                        className={`w-2.5 rounded-t transition-all ${
                          item.exp > 0 ? "bg-orange-400 group-hover:bg-orange-300" : "bg-gray-800"
                        }`}
                        title={`Expense: ₦${item.exp.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono rotate-45 sm:rotate-0 mt-2 truncate">
                      {item.m.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Income</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <span>Expense</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
              <h4 className="font-bold text-gray-800 text-xs mb-3">Upcoming Recurring Payments</h4>
              {invoices.filter((i) => i.status === "Recurring").length === 0 ? (
                <p className="text-xs text-gray-400 italic">No data founds</p>
              ) : (
                <div className="space-y-2">
                  {invoices
                    .filter((i) => i.status === "Recurring")
                    .map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{rec.customer}</p>
                          <p className="text-[10px] text-gray-500">#{rec.number} · {rec.date}</p>
                        </div>
                        <span className="font-bold text-emerald-600">₦{rec.amountNaira.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
              <h4 className="font-bold text-gray-800 text-xs mb-3">Overdue Invoices</h4>
              {invoices.filter((i) => i.status === "Unpaid" && i.dueDate < new Date().toISOString().slice(0, 10)).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No data founds</p>
              ) : (
                <div className="space-y-2">
                  {invoices
                    .filter((i) => i.status === "Unpaid" && i.dueDate < new Date().toISOString().slice(0, 10))
                    .map((ov) => (
                      <div key={ov.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{ov.customer}</p>
                          <p className="text-[10px] text-rose-500 font-mono">Due: {ov.dueDate}</p>
                        </div>
                        <span className="font-bold text-rose-600">₦{ov.amountNaira.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
              <h4 className="font-bold text-gray-800 text-xs mb-3">Pending Invoices</h4>
              {invoices.filter((i) => i.status === "Unpaid").length === 0 ? (
                <p className="text-xs text-gray-400 italic">No data founds</p>
              ) : (
                <div className="space-y-2">
                  {invoices
                    .filter((i) => i.status === "Unpaid")
                    .map((pend) => (
                      <div key={pend.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{pend.customer}</p>
                          <p className="text-[10px] text-gray-500">#{pend.number}</p>
                        </div>
                        <span className="font-bold text-amber-600">₦{pend.amountNaira.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Net Income Card by Fiscal year (Image 1 bottom left) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs max-w-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Net Income</h3>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span>Fiscal year</span>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500 font-medium">Income</span>
              <span className="font-bold text-gray-900 tabular-nums">₦{totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-gray-50">
              <span className="text-gray-500 font-medium">Expense</span>
              <span className="font-bold text-rose-600 tabular-nums">₦{totalExpense.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-200 font-bold">
              <span className="text-gray-900">Net Income</span>
              <span className="text-emerald-600 tabular-nums text-sm">₦{netIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Settings View (Images 2, 4, 5, 6)
  const renderSettingsView = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Horizontal Settings Tabs matching Images 2, 4, 5, 6 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2.5">
        <button
          type="button"
          onClick={() => setSettingsTab("general")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            settingsTab === "general" ? "bg-[#28A745] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          ⚙ General Settings
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab("password")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            settingsTab === "password" ? "bg-[#28A745] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          🔒 Change Password
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab("business")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            settingsTab === "business" ? "bg-[#28A745] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          💼 Business
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab("customization")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            settingsTab === "customization" ? "bg-[#28A745] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          🖌 Invoice Customization
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab("permissions")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            settingsTab === "permissions" ? "bg-[#28A745] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          ✓ Role Permissions
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab("roles")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            settingsTab === "roles" ? "bg-[#28A745] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          👥 Role Management
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab("email")}
          title="Email & Delivery Settings"
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
            settingsTab === "email" ? "bg-[#28A745] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Mail className="w-4 h-4" />
        </button>
      </div>

      {settingsTab === "general" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-2xs space-y-6 max-w-3xl">
          <h3 className="font-bold text-gray-900 text-base">Personal Information</h3>

          {/* Real Profile Picture Upload Avatar (Image 2) */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 shadow-inner">
              {profileAvatar ? (
                <img
                  src={profileAvatar}
                  alt="Profile avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Users className="w-12 h-12 text-blue-600" />
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                title="Upload profile picture"
                className="absolute top-0 right-0 w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:text-emerald-600 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="font-semibold text-emerald-600 hover:underline"
              >
                Upload Photo
              </button>
              {profileAvatar && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileAvatar(null);
                    showToast("Profile picture removed.");
                  }}
                  className="font-semibold text-rose-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Settings Form with All 189 Countries */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast("Personal settings saved successfully!");
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Country ({BILLSTACKS_COUNTRIES.length} supported)
              </label>
              <select
                value={profileForm.country}
                onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select</option>
                {BILLSTACKS_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.currencyCode} {c.currencySymbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Postcode</label>
              <input
                type="text"
                value={profileForm.postcode}
                onChange={(e) => setProfileForm({ ...profileForm, postcode: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
              >
                ✓ Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {settingsTab === "password" && <ChangePasswordView showToast={showToast} />}

      {settingsTab === "business" && (
        <BusinessManagementView
          businesses={businesses.length > 0 ? businesses : [activeBusiness]}
          activeBusinessId={activeBusiness.id}
          onSelectActiveBusiness={(id) => {
            setActiveBusinessId(id);
            const target = businesses.find((b) => b.id === id);
            if (target) showToast(`Switched active business to "${target.name}"`);
          }}
          onAddBusiness={(biz) => {
            const next = businesses.length > 0 ? [...businesses, biz] : [activeBusiness, biz];
            setBusinesses(next);
            setActiveBusinessId(biz.id);
          }}
          onDeleteBusiness={(id) => {
            const remaining = businesses.filter((b) => b.id !== id);
            setBusinesses(remaining);
            if (activeBusinessId === id && remaining[0]) {
              setActiveBusinessId(remaining[0].id);
            }
            showToast("Business removed.");
          }}
          showToast={showToast}
        />
      )}

      {settingsTab === "customization" && (
        <InvoiceCustomizationView
          value={invoiceCustomization}
          onSave={(next) => {
            setInvoiceCustomization(next);
            showToast(`Invoice customization saved (Template ${next.templateId})!`);
          }}
        />
      )}

      {settingsTab === "permissions" && <RolePermissionsMatrixView showToast={showToast} />}

      {settingsTab === "roles" && (
        <UserRoleManagementView
          users={teamUsers}
          onAddUser={(u) => setTeamUsers([...teamUsers, u])}
          onDeleteUser={(id) => {
            setTeamUsers(teamUsers.filter((u) => u.id !== id));
            showToast("User removed from workspace.");
          }}
          showToast={showToast}
        />
      )}

      {settingsTab === "email" && <EmailSettingsView showToast={showToast} />}
    </div>
  );

  // Render Payment Settings View (Image 3)
  const renderPaymentSettingsView = () => (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paystack */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 text-sm">Paystack</h4>
            <button
              type="button"
              onClick={() =>
                setPaymentGateways({
                  ...paymentGateways,
                  paystack: { ...paymentGateways.paystack, enabled: !paymentGateways.paystack.enabled },
                })
              }
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                paymentGateways.paystack.enabled ? "bg-emerald-600 justify-end" : "bg-gray-200 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Publish Key</label>
              <input
                type="text"
                value={paymentGateways.paystack.publishKey}
                onChange={(e) =>
                  setPaymentGateways({
                    ...paymentGateways,
                    paystack: { ...paymentGateways.paystack, publishKey: e.target.value },
                  })
                }
                placeholder="pk_test_..."
                className="w-full h-9 px-3 rounded-lg border border-gray-200 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Secret Key</label>
              <input
                type="password"
                value={paymentGateways.paystack.secretKey}
                onChange={(e) =>
                  setPaymentGateways({
                    ...paymentGateways,
                    paystack: { ...paymentGateways.paystack, secretKey: e.target.value },
                  })
                }
                placeholder="sk_test_..."
                className="w-full h-9 px-3 rounded-lg border border-gray-200 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Razorpay */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 text-sm">Razorpay</h4>
            <button
              type="button"
              onClick={() =>
                setPaymentGateways({
                  ...paymentGateways,
                  razorpay: { ...paymentGateways.razorpay, enabled: !paymentGateways.razorpay.enabled },
                })
              }
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                paymentGateways.razorpay.enabled ? "bg-emerald-600 justify-end" : "bg-gray-200 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Key Id</label>
              <input
                type="text"
                value={paymentGateways.razorpay.keyId}
                onChange={(e) =>
                  setPaymentGateways({
                    ...paymentGateways,
                    razorpay: { ...paymentGateways.razorpay, keyId: e.target.value },
                  })
                }
                placeholder="rzp_test_..."
                className="w-full h-9 px-3 rounded-lg border border-gray-200 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Key Secret</label>
              <input
                type="password"
                value={paymentGateways.razorpay.keySecret}
                onChange={(e) =>
                  setPaymentGateways({
                    ...paymentGateways,
                    razorpay: { ...paymentGateways.razorpay, keySecret: e.target.value },
                  })
                }
                placeholder="secret_..."
                className="w-full h-9 px-3 rounded-lg border border-gray-200 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Stripe */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 text-sm">Stripe Payment</h4>
            <button
              type="button"
              onClick={() =>
                setPaymentGateways({
                  ...paymentGateways,
                  stripe: { ...paymentGateways.stripe, enabled: !paymentGateways.stripe.enabled },
                })
              }
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                paymentGateways.stripe.enabled ? "bg-emerald-600 justify-end" : "bg-gray-200 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Publish Key</label>
              <input
                type="text"
                value={paymentGateways.stripe.publishKey}
                onChange={(e) =>
                  setPaymentGateways({
                    ...paymentGateways,
                    stripe: { ...paymentGateways.stripe, publishKey: e.target.value },
                  })
                }
                placeholder="pk_live_..."
                className="w-full h-9 px-3 rounded-lg border border-gray-200 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Secret Key</label>
              <input
                type="password"
                value={paymentGateways.stripe.secretKey}
                onChange={(e) =>
                  setPaymentGateways({
                    ...paymentGateways,
                    stripe: { ...paymentGateways.stripe, secretKey: e.target.value },
                  })
                }
                placeholder="sk_live_..."
                className="w-full h-9 px-3 rounded-lg border border-gray-200 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* PayPal */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 text-sm">Paypal payment</h4>
            <button
              type="button"
              onClick={() =>
                setPaymentGateways({
                  ...paymentGateways,
                  paypal: { ...paymentGateways.paypal, enabled: !paymentGateways.paypal.enabled },
                })
              }
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                paymentGateways.paypal.enabled ? "bg-emerald-600 justify-end" : "bg-gray-200 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Paypal Merchant Account</label>
              <input
                type="email"
                value={paymentGateways.paypal.merchantAccount}
                onChange={(e) =>
                  setPaymentGateways({
                    ...paymentGateways,
                    paypal: { ...paymentGateways.paypal, merchantAccount: e.target.value },
                  })
                }
                placeholder="merchant@paypal.com"
                className="w-full h-9 px-3 rounded-lg border border-gray-200 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            updatePaymentSettings(paymentGateways);
            const activeList: string[] = [];
            if (paymentGateways.paystack.enabled) activeList.push("Paystack");
            if (paymentGateways.stripe.enabled) activeList.push("Stripe");
            if (paymentGateways.paypal.enabled) activeList.push("PayPal");
            if (paymentGateways.razorpay.enabled) activeList.push("Razorpay");
            showToast(
              `Payment configuration saved & synced! Active gateways: ${
                activeList.join(", ") || "None (Disabled)"
              }`
            );
          }}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors self-start"
        >
          ✓ Save Changes
        </button>

        <span className="text-[11px] text-gray-500 font-mono">
          Auto-synced with Online Invoices &amp; Subscription Checkout
        </span>
      </div>

      {/* Live Gateway Diagnostics & Webhook Sync Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-gray-900 text-xs">
              Live Gateway Synchronization &amp; Webhook Diagnostics
            </h4>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Platform Engine Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">Paystack</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  paymentGateways.paystack.enabled ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
            </div>
            <p className="text-[10px] text-gray-500">
              {paymentGateways.paystack.enabled ? "Active & Accepting NGN" : "Disabled"}
            </p>
            <p className="text-[9px] font-mono text-gray-400 truncate">
              {paymentGateways.paystack.publishKey || "No key set"}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">Razorpay</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  paymentGateways.razorpay.enabled ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
            </div>
            <p className="text-[10px] text-gray-500">
              {paymentGateways.razorpay.enabled ? "Active & Accepting UPI" : "Disabled"}
            </p>
            <p className="text-[9px] font-mono text-gray-400 truncate">
              {paymentGateways.razorpay.keyId || "No key set"}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">Stripe Payment</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  paymentGateways.stripe.enabled ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
            </div>
            <p className="text-[10px] text-gray-500">
              {paymentGateways.stripe.enabled ? "Active & Accepting Cards" : "Disabled"}
            </p>
            <p className="text-[9px] font-mono text-gray-400 truncate">
              {paymentGateways.stripe.publishKey || "No key set"}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">Paypal payment</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  paymentGateways.paypal.enabled ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
            </div>
            <p className="text-[10px] text-gray-500">
              {paymentGateways.paypal.enabled ? "Active & Synced" : "Disabled"}
            </p>
            <p className="text-[9px] font-mono text-gray-400 truncate">
              {paymentGateways.paypal.merchantAccount || "No account set"}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-gray-900">Live Webhook Listener Endpoint</p>
            <p className="font-mono text-[11px] text-gray-600">
              https://billstacks.zinoone.com/api/webhooks/payments
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText("https://billstacks.zinoone.com/api/webhooks/payments");
              showToast("Webhook endpoint URL copied to clipboard!");
            }}
            className="px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 font-semibold text-xs text-gray-700 shrink-0 shadow-2xs"
          >
            Copy URL
          </button>
        </div>
      </div>
    </div>
  );

  // Render Sales > Customers (Image 4)
  const renderCustomersView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 text-base">All customers</h3>
        <button
          type="button"
          onClick={() => setCustomerModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Info</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                    No data founds
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{c.name}</td>
                    <td className="py-3 px-4 text-gray-600">{c.info}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{c.email}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{c.phone}</td>
                    <td className="py-3 px-4 text-gray-500 truncate max-w-xs">{c.address}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomers(customers.filter((it) => it.id !== c.id));
                          showToast(`Removed customer "${c.name}"`);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Sales > Invoices (Image 7)
  const renderInvoicesView = () => {
    const filtered = invoices.filter((inv) => {
      if (invoiceStatusTab === "All") return true;
      return inv.status === invoiceStatusTab;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-base">Invoices</h3>
          <button
            type="button"
            onClick={() => setActiveSection("sales-create-invoice")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice</span>
          </button>
        </div>

        {/* Filters Bar (Image 7) */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
          <select className="h-9 px-3 rounded-lg border border-gray-200 bg-white">
            <option>All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="h-9 px-3 rounded-lg border border-gray-200 bg-white">
            <option>All status</option>
            <option>Unpaid</option>
            <option>Paid</option>
            <option>Draft</option>
          </select>
          <input type="date" defaultValue="2026-11-01" className="h-9 px-3 rounded-lg border border-gray-200" />
          <input type="date" defaultValue="2026-11-30" className="h-9 px-3 rounded-lg border border-gray-200" />
          <button type="button" className="h-9 px-4 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>

        {/* Status Tab Badges (Image 7) */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setInvoiceStatusTab("Unpaid")}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 border ${
              invoiceStatusTab === "Unpaid" ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <span>Unpaid</span>
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
              {invoices.filter((i) => i.status === "Unpaid").length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setInvoiceStatusTab("Draft")}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 border ${
              invoiceStatusTab === "Draft" ? "bg-gray-100 border-gray-300 text-gray-700" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <span>Draft</span>
            <span className="w-4 h-4 rounded-full bg-gray-500 text-white text-[10px] flex items-center justify-center">
              {invoices.filter((i) => i.status === "Draft").length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setInvoiceStatusTab("All")}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 border ${
              invoiceStatusTab === "All" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <span>All Invoices</span>
            <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
              {invoices.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setInvoiceStatusTab("Recurring")}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 border ${
              invoiceStatusTab === "Recurring" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <span>Recurring Invoice</span>
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center">
              {invoices.filter((i) => i.status === "Recurring").length}
            </span>
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-semibold">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                      No data founds
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            inv.status === "Paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : inv.status === "Unpaid"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">{inv.date}</td>
                      <td className="py-3 px-4 font-bold font-mono text-gray-900">{inv.number}</td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">{inv.customer}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">
                        ₦{inv.amountNaira.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => showToast(`Previewing Invoice #${inv.number}`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                          title="Preview Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {inv.status === "Unpaid" && (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePaymentTarget({
                                title: `Pay Invoice #${inv.number}`,
                                subtitle: `${inv.customer} · Due: ${inv.dueDate}`,
                                amountNaira: inv.amountNaira,
                                customerName: inv.customer,
                                referenceNo: inv.number,
                                itemType: "Invoice",
                                invoiceId: inv.id,
                              });
                              setPaymentModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs inline-flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay Online</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setInvoices(
                              invoices.map((it) => (it.id === inv.id ? { ...it, status: "Paid" } : it))
                            );
                            showToast(`Invoice #${inv.number} marked as Paid!`);
                          }}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]"
                        >
                          Mark Paid
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Sales > Create New Invoice View (Image 8)
  const renderCreateInvoiceView = () => (
    <div className="max-w-4xl space-y-6">
      {/* Top Banner (Image 8 top) */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Finish Setup! You haven't finished your setup yet. We recommend you to finish your setup before sending your invoice.</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveSection("settings")}
          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-bold text-xs hover:bg-amber-100 shrink-0 shadow-2xs"
        >
          Finish Setup Now
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-lg">Create New Invoice</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast("Invoice template preview generated!")}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs shadow-2xs"
          >
            👁 Preview
          </button>
          <button
            type="button"
            onClick={() => handleSaveInvoiceSubmit()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            ✓ Save and continue
          </button>
        </div>
      </div>

      {/* Accordion: Business Address & Logo */}
      <details className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs group text-xs">
        <summary className="font-bold text-gray-800 cursor-pointer flex items-center justify-between select-none">
          <span>Business address and contact details, title, summary, and logo</span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="pt-4 mt-3 border-t border-gray-100 space-y-3 text-gray-600">
          <p className="font-semibold text-gray-900">{activeBusiness.name} — Billstacks Cloud</p>
          <p>{activeBusiness.address || "Plot 14, Adeyemi Tower, Lekki Phase 1, Lagos, Nigeria"}</p>
          <p>TIN: {activeBusiness.taxVatNumber || "24890112-0001"} · FIRS VAT Registered</p>
        </div>
      </details>

      {/* Main Form Box (Image 8) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill To */}
          <div className="space-y-3">
            <label className="block font-bold text-gray-800 text-xs">Bill to</label>
            <select
              value={createInvoiceCustomer}
              onChange={(e) => setCreateInvoiceCustomer(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs bg-white font-semibold"
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
              onClick={() => setCustomerModalOpen(true)}
              className="w-full py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs font-bold transition-colors"
            >
              + Add a customer
            </button>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-1">Invoice number</label>
                <input
                  type="text"
                  value={createInvoiceNumber}
                  onChange={(e) => setCreateInvoiceNumber(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">P.O./S.O. number</label>
                <input
                  type="text"
                  value={createInvoicePoNumber}
                  onChange={(e) => setCreateInvoicePoNumber(e.target.value)}
                  placeholder="e.g. PO-9901"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-1">Invoice date</label>
                <input
                  type="date"
                  value={createInvoiceDate}
                  onChange={(e) => setCreateInvoiceDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Payment due date</label>
                <input
                  type="date"
                  value={createInvoiceDueDate}
                  onChange={(e) => setCreateInvoiceDueDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Payment terms</label>
              <select
                value={createInvoiceTerms}
                onChange={(e) => setCreateInvoiceTerms(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
              >
                <option value="On Receipt">On Receipt</option>
                <option value="Net 7">Net 7 Days</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items Table (Image 8) */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3 w-32">Price (₦)</th>
                  <th className="py-2.5 px-3 w-20">Quantity</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {createInvoiceLines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400 italic">
                      No items added yet. Click &quot;Add an item&quot; below.
                    </td>
                  </tr>
                ) : (
                  createInvoiceLines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={line.item}
                          onChange={(e) => updateInvoiceLine(line.id, "item", e.target.value)}
                          placeholder="Item name / service"
                          className="w-full h-8 px-2 rounded border border-gray-200"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={line.details}
                          onChange={(e) => updateInvoiceLine(line.id, "details", e.target.value)}
                          placeholder="Description..."
                          className="w-full h-8 px-2 rounded border border-gray-200"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <NumberInput
                          value={line.price}
                          onChange={(v) => updateInvoiceLine(line.id, "price", v as number)}
                          placeholder="0"
                          min={0}
                          prefix="₦"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <NumberInput
                          value={line.quantity}
                          onChange={(v) => updateInvoiceLine(line.id, "quantity", v as number)}
                          min={1}
                        />
                      </td>
                      <td className="py-2 px-3 font-bold text-gray-900 text-right tabular-nums">
                        ₦{line.total.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeInvoiceLine(line.id)}
                          className="text-gray-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addInvoiceLine}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add an item</span>
          </button>
        </div>

        {/* Subtotal, Discount & Grand Total (Image 8) */}
        <div className="flex justify-end pt-4 border-t border-gray-100 text-xs">
          <div className="w-72 space-y-2">
            <div className="flex items-center justify-between text-gray-600">
              <span>Sub Total</span>
              <span className="font-bold tabular-nums">₦{invoiceSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Discount</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={createInvoiceDiscountPct}
                  onChange={(e) => setCreateInvoiceDiscountPct(Number(e.target.value) || 0)}
                  className="w-16 h-7 px-2 rounded border border-gray-200 text-right font-mono text-xs"
                />
                <span>%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total</span>
              <span className="text-emerald-600 tabular-nums">₦{invoiceGrandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer accordion */}
        <details className="pt-2 text-xs text-gray-600 group">
          <summary className="font-semibold text-gray-700 cursor-pointer select-none">Footer Notes &amp; Bank Details</summary>
          <div className="pt-2 space-y-1 font-mono text-[11px] text-gray-500">
            <p>Account Name: Zino One Cloud Platforms Ltd</p>
            <p>Bank: Zenith Bank PLC · Account: 1019283746</p>
          </div>
        </details>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setActiveSection("sales-invoices")}
          className="px-5 py-2.5 rounded-lg border border-gray-300 font-bold text-xs hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSaveInvoiceSubmit()}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
        >
          ✓ Save and continue
        </button>
      </div>
    </div>
  );

  // Render Purchases > Bills (Image 9)
  const renderBillsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 text-base">Bills</h3>
        <button
          type="button"
          onClick={() => setActiveSection("purchases-create-bill")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bill</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-semibold">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Number</th>
                <th className="py-3 px-4">Vendors</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                    No data founds
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">{b.date}</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900">{b.number}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{b.vendor}</td>
                    <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">
                      ₦{b.amountNaira.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600 tabular-nums">
                      ₦{b.amountDueNaira.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Bill #${b.number} paid in full!`)}
                        className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]"
                      >
                        Settle Bill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Purchases > Vendors (Image 10)
  const renderVendorsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 text-base">Vendors</h3>
        <button
          type="button"
          onClick={() => setVendorModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add new vendor</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                    No data founds
                  </td>
                </tr>
              ) : (
                vendors.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{v.name}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{v.phone}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{v.email}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setVendors(vendors.filter((it) => it.id !== v.id));
                          showToast(`Removed vendor "${v.name}"`);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Purchases > Expenses (Image 11)
  const renderExpensesView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 text-base">Expenses</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors"
          >
            📁 Add new category
          </button>
          <button
            type="button"
            onClick={() => setExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Expenses</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                    No data founds
                  </td>
                </tr>
              ) : (
                expenses.map((exp, idx) => (
                  <tr key={exp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{exp.date}</td>
                    <td className="py-3 px-4 font-bold text-rose-600 tabular-nums">
                      ₦{exp.amountNaira.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-800">{exp.client}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{exp.notes}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setExpenses(expenses.filter((it) => it.id !== exp.id));
                          showToast("Expense entry deleted.");
                        }}
                        className="p-1.5 rounded text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Products & Services (Images 5 & 12) — Sales unified with Main Admin Dashboard
  const renderProductsView = (type: "Sales" | "Purchases") => {
    const list: ProductItem[] =
      type === "Sales"
        ? adminBillstacksPlans.map((p) => ({
            id: p.id,
            name: p.name,
            priceNaira: Math.round((p.priceKobo || 0) / 100),
            type: p.label || "Subscription",
          }))
        : purchaseProducts;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              ({type}) Products &amp; Services
            </h3>
            {type === "Sales" && (
              <p className="text-[11px] text-emerald-700 font-medium">
                Synced directly with Main Admin Dashboard &gt; Billstacks Studio ({list.length} active)
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setProductType(type);
              setProductModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-semibold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No active {type.toLowerCase()} products/plans found. Add one above or from the Main Admin Dashboard.
                    </td>
                  </tr>
                ) : (
                  list.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-gray-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{p.name}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 tabular-nums">
                        ₦{p.priceNaira.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{p.type}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (type === "Sales") {
                              deleteProduct(p.id);
                            } else {
                              setPurchaseProducts(purchaseProducts.filter((it) => it.id !== p.id));
                            }
                            showToast(`Deleted ${p.name}`);
                          }}
                          className="p-1.5 rounded text-gray-400 hover:text-rose-600"
                        >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Estimates View (Image 6)
  const renderEstimatesView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 text-base">Estimates</h3>
        <button
          type="button"
          onClick={() => setActiveSection("sales-create-estimate")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Estimate</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <select className="h-9 px-3 rounded-lg border border-gray-200 bg-white">
          <option>All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="date" defaultValue="2026-11-01" className="h-9 px-3 rounded-lg border border-gray-200" />
        <input type="date" defaultValue="2026-11-30" className="h-9 px-3 rounded-lg border border-gray-200" />
        <button type="button" className="h-9 px-4 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-semibold">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estimates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                    No data founds
                  </td>
                </tr>
              ) : (
                estimates.map((est) => (
                  <tr key={est.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] uppercase">
                        {est.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">{est.date}</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900">{est.number}</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">{est.customer}</td>
                    <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">
                      ₦{est.amountNaira.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const convertedInv: InvoiceItem = {
                            id: `inv_${Date.now()}`,
                            number: `2026-${Math.floor(10 + Math.random() * 90)}`,
                            customer: est.customer,
                            date: new Date().toISOString().slice(0, 10),
                            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                            amountNaira: est.amountNaira,
                            status: "Unpaid",
                          };
                          setInvoices([convertedInv, ...invoices]);
                          showToast(`Converted estimate ${est.number} to Invoice #${convertedInv.number}!`);
                          setActiveSection("sales-invoices");
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px]"
                      >
                        Convert to Invoice →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Reports & Affiliate Views (Images 13 & 14)
  const renderReportsView = () => {
    const grossRev = invoices
      .filter((i) => i.status === "Paid")
      .reduce((acc, i) => acc + i.amountNaira, 0);
    const firsVat = grossRev * 0.075;
    const totalExp = expenses.reduce((acc, e) => acc + e.amountNaira, 0);

    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-base">Financial &amp; Tax Reports</h3>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-50"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">FIRS 7.5% Sales VAT</p>
            <p className="text-2xl font-black text-gray-900 tabular-nums">
              ₦{firsVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">Eligible for monthly VAT002 remittance</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">Gross Billing Revenue</p>
            <p className="text-2xl font-black text-gray-900 tabular-nums">
              ₦{grossRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-blue-600 font-medium">Across active B2B clients</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">Purchases &amp; Expenses</p>
            <p className="text-2xl font-black text-rose-600 tabular-nums">
              ₦{totalExp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500">Cloud servers &amp; connectivity</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAffiliateView = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 text-base">Affiliate &amp; Partner Referrals</h3>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
          Tier 1: 15% Lifetime Commission
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <h4 className="font-bold text-gray-900 text-sm">Your Referral Link</h4>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value="https://billstacks.com/ref/adeyemiZino"
            className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText("https://billstacks.com/ref/adeyemiZino");
              showToast("Referral link copied to clipboard!");
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );

  // Main View Router
  const renderCurrentContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardView();
      case "settings":
        return renderSettingsView();
      case "change-password":
        return <ChangePasswordView showToast={showToast} />;
      case "payment-settings":
        return renderPaymentSettingsView();
      case "sales-customers":
        return renderCustomersView();
      case "sales-products":
        return renderProductsView("Sales");
      case "sales-estimates":
        return renderEstimatesView();
      case "sales-create-estimate":
        return (
          <CreateEstimateView
            businessName={activeBusiness.name}
            customers={customers}
            onOpenAddCustomer={() => setCustomerModalOpen(true)}
            onBackToEstimates={() => setActiveSection("sales-estimates")}
            showToast={showToast}
            onSaveEstimate={(est) => {
              const created: Estimate = {
                id: `est_${Date.now()}`,
                number: est.number,
                customer: est.customer,
                date: est.date,
                amountNaira: est.amountNaira,
                status: "Sent",
              };
              setEstimates([created, ...estimates]);
              showToast(`Estimate #${created.number} saved successfully!`);
              setActiveSection("sales-estimates");
            }}
          />
        );
      case "sales-invoices":
        return renderInvoicesView();
      case "sales-create-invoice":
        return renderCreateInvoiceView();
      case "sales-recurring":
        return (
          <RecurringInvoiceView
            businessName={activeBusiness.name}
            customers={customers}
            onOpenAddCustomer={() => setCustomerModalOpen(true)}
            showToast={showToast}
            onSaveRecurringInvoice={(inv) => {
              const created: InvoiceItem = {
                id: `inv_${Date.now()}`,
                number: inv.number,
                customer: inv.customer,
                date: inv.date,
                dueDate: inv.dueDate,
                amountNaira: inv.amountNaira,
                status: "Recurring",
              };
              setInvoices([created, ...invoices]);
              recordTransaction({
                source: ServiceSlug.BILLSTACKS,
                activityType: "INVOICE",
                activitySummary: `Recurring Invoice (${inv.frequency}) #${inv.number} for ${inv.customer}`,
                customer: inv.customer,
                amountKobo: inv.amountNaira * 100,
                location: "Billstacks Cloud Invoicing",
                status: "PENDING",
                invoiceNo: inv.number,
              });
              showToast(`Recurring Invoice #${inv.number} (${inv.frequency}) scheduled!`);
              setActiveSection("sales-invoices");
            }}
          />
        );
      case "purchases-bills":
        return renderBillsView();
      case "purchases-create-bill":
        return (
          <CreateBillView
            businessName={activeBusiness.name}
            vendors={vendors}
            onOpenAddVendor={() => setVendorModalOpen(true)}
            onBackToBills={() => setActiveSection("purchases-bills")}
            showToast={showToast}
            onSaveBill={(bill) => {
              const created: BillItem = {
                id: `b_${Date.now()}`,
                number: bill.number,
                vendor: bill.vendor,
                date: bill.date,
                amountNaira: bill.amountNaira,
                amountDueNaira: bill.amountNaira,
                status: "Unpaid",
              };
              setBills([created, ...bills]);
              recordTransaction({
                source: ServiceSlug.BILLSTACKS,
                activityType: "EXPENSE",
                activitySummary: `Vendor Bill #${bill.number} from ${bill.vendor}`,
                customer: bill.vendor,
                amountKobo: bill.amountNaira * 100,
                location: "Billstacks Cloud Purchases",
                status: "PENDING",
                invoiceNo: bill.number,
              });
              showToast(`Bill #${created.number} saved successfully!`);
              setActiveSection("purchases-bills");
            }}
          />
        );
      case "purchases-vendors":
        return renderVendorsView();
      case "purchases-expenses":
        return renderExpensesView();
      case "purchases-products":
        return renderProductsView("Purchases");
      case "categories":
        return (
          <CategoriesListView
            categories={categories}
            onAddNewClick={() => setActiveSection("categories-add")}
            onDeleteCategory={(id) => {
              setCategories(categories.filter((c) => c.id !== id));
              showToast("Category removed.");
            }}
          />
        );
      case "categories-add":
        return (
          <AddCategoryView
            onBack={() => setActiveSection("categories")}
            onSave={(name, type) => {
              setCategories([...categories, { id: `cat_${Date.now()}`, name, type }]);
              showToast(`Category "${name}" (${type}) saved!`);
              setActiveSection("categories");
            }}
          />
        );
      case "tax":
        return (
          <TaxManagementView
            onBack={() => setActiveSection("dashboard")}
            showToast={showToast}
          />
        );
      case "reports":
      case "reports-pl":
        return <ProfitLossReportView invoices={invoices} expenses={expenses} bills={bills} />;
      case "reports-tax":
        return <SalesTaxReportView invoices={invoices} bills={bills} />;
      case "reports-customer":
        return <IncomeByCustomerReportView customers={customers} invoices={invoices} />;
      case "reports-vendor":
        return <PurchasesByVendorReportView vendors={vendors} bills={bills} />;
      case "reports-general":
        return (
          <GeneralReportsView
            invoices={invoices}
            estimates={estimates}
            expenses={expenses}
          />
        );
      case "affiliate":
      case "affiliate-home":
        return <AffiliateHomeView showToast={showToast} />;
      case "affiliate-referrals":
        return <AffiliateReferralsView />;
      case "affiliate-payouts":
        return <AffiliatePayoutsView showToast={showToast} />;
      case "subscription":
        return (
          <SubscriptionView
            adminPlans={adminBillstacksPlans}
            showToast={showToast}
            onOpenCheckout={(plan) => {
              setActivePaymentTarget({
                title: `Subscribe: ${plan.name}`,
                subtitle: `${plan.billingCycle} cloud billing tier`,
                amountNaira: plan.amountNaira,
                customerName: activeBusiness.name,
                referenceNo: `SUB-${plan.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                itemType: "Subscription",
              });
              setPaymentModalOpen(true);
            }}
          />
        );
      case "country":
        return <CountryView showToast={showToast} />;
      default:
        return renderDashboardView();
    }
  };

  // Stage 1: Sign Up / Log In (Image 2)
  if (stage === "auth") {
    return (
      <BillstacksAuthScreen
        initialMode={authInitialMode}
        savedAccount={userAccount}
        onSignUpComplete={(acct) => {
          setUserAccount(acct);
          setProfileForm((prev) => ({
            ...prev,
            name: acct.fullName,
            email: acct.email,
          }));
          setStage("setup-business");
        }}
        onLoginComplete={(email) => {
          if (!userAccount) {
            setUserAccount({ fullName: email.split("@")[0] || "User", email, phone: "" });
            setProfileForm((prev) => ({
              ...prev,
              name: email.split("@")[0] || prev.name,
              email,
            }));
          }
          if (businesses.length === 0) {
            setStage("setup-business");
          } else {
            setStage("landing");
          }
        }}
      />
    );
  }

  // Stage 2: Setup Your First Business (Image 3)
  if (stage === "setup-business") {
    return (
      <BillstacksBusinessSetupScreen
        userName={userAccount?.fullName || profileForm.name}
        onCreateBusiness={(biz) => {
          const nextList = [biz, ...businesses.filter((b) => b.id !== biz.id)];
          setBusinesses(nextList);
          setActiveBusinessId(biz.id);
          setProfileForm((prev) => ({ ...prev, country: biz.country }));
          setStage("landing");
        }}
      />
    );
  }

  // Stage 3: Billstacks Landing Welcome Page (Video)
  if (stage === "landing") {
    return (
      <BillstacksLandingPage
        activeBusiness={activeBusiness}
        userEmail={userAccount?.email || profileForm.email}
        adminPlans={adminBillstacksPlans}
        onEnterDashboard={() => setStage("dashboard")}
        onLogout={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-gray-900 font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-20 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-gray-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar (Image 1, 13, 14) */}
      {renderSidebar()}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 overflow-y-auto">
        {renderCurrentContent()}
      </main>

      {/* Floating Action Button (+) Speed Dial (Image 1 bottom right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        {fabOpen && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              type="button"
              onClick={() => {
                setVendorModalOpen(true);
                setFabOpen(false);
              }}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <span>Add Vendor</span>
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomerModalOpen(true);
                setFabOpen(false);
              }}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <span>Add Customer</span>
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleNav("purchases-create-bill");
                setFabOpen(false);
              }}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <span>Create New Bill</span>
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleNav("sales-create-estimate");
                setFabOpen(false);
              }}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <span>Create new Estimate</span>
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleNav("sales-create-invoice");
                setFabOpen(false);
              }}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <span>Create new Invoice</span>
              <Receipt className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xl transition-transform ${
            fabOpen ? "rotate-45" : ""
          }`}
          title="Quick Actions Speed Dial"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Customer Modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add New Customer</h3>
              <button type="button" onClick={() => setCustomerModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCustomer.name) return;
                const added: Customer = {
                  id: `c_${Date.now()}`,
                  name: newCustomer.name,
                  info: newCustomer.info || "Client",
                  email: newCustomer.email,
                  phone: newCustomer.phone,
                  address: newCustomer.address,
                };
                setCustomers([...customers, added]);
                setNewCustomer({ name: "", info: "", email: "", phone: "", address: "" });
                setCustomerModalOpen(false);
                showToast(`Added customer "${added.name}"!`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold mb-1">Company / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Modal */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add New Vendor</h3>
              <button type="button" onClick={() => setVendorModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newVendor.name) return;
                const added: Vendor = {
                  id: `v_${Date.now()}`,
                  name: newVendor.name,
                  phone: newVendor.phone,
                  email: newVendor.email,
                };
                setVendors([...vendors, added]);
                setNewVendor({ name: "", phone: "", email: "" });
                setVendorModalOpen(false);
                showToast(`Added vendor "${added.name}"!`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVendorModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add ({productType}) Product</h3>
              <button type="button" onClick={() => setProductModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newProduct.name) return;
                const added: ProductItem = {
                  id: `p_${Date.now()}`,
                  name: newProduct.name,
                  priceNaira: Number(newProduct.priceNaira) || 0,
                  type: newProduct.type,
                };
                if (productType === "Sales") {
                  saveProduct({
                    source: ServiceSlug.BILLSTACKS,
                    name: added.name,
                    label: added.type,
                    description: `${added.type} created from Billstacks Cloud (${activeBusiness.name})`,
                    priceKobo: added.priceNaira * 100,
                    imageUrl: "",
                    status: "ACTIVE",
                    totalStock: 999,
                  });
                } else {
                  setPurchaseProducts([...purchaseProducts, added]);
                }
                setNewProduct({ name: "", priceNaira: 0, type: "Service" });
                setProductModalOpen(false);
                showToast(`Added product "${added.name}"!`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold mb-1">Product / Service Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Price (₦)</label>
                <NumberInput
                  value={newProduct.priceNaira}
                  onChange={(v) => setNewProduct({ ...newProduct, priceNaira: v as number })}
                  prefix="₦"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Type</label>
                <select
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="Service">Service</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Physical Good">Physical Good</option>
                  <option value="Utility">Utility</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add New Expense</h3>
              <button type="button" onClick={() => setExpenseModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newExpense.amountNaira) return;
                const added: ExpenseItem = {
                  id: `exp_${Date.now()}`,
                  date: newExpense.date,
                  amountNaira: Number(newExpense.amountNaira) || 0,
                  client: newExpense.client || "Operating Expense",
                  category: newExpense.category,
                  notes: newExpense.notes,
                };
                setExpenses([added, ...expenses]);
                setExpenseModalOpen(false);
                showToast(`Logged expense of ₦${added.amountNaira.toLocaleString()}`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Amount (₦) *</label>
                <NumberInput
                  value={newExpense.amountNaira}
                  onChange={(v) => setNewExpense({ ...newExpense, amountNaira: v as number })}
                  prefix="₦"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Client / Beneficiary</label>
                <input
                  type="text"
                  value={newExpense.client}
                  onChange={(e) => setNewExpense({ ...newExpense, client: e.target.value })}
                  placeholder="e.g. Server Hosting / Office"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
                >
                  {categories
                    .filter((c) => c.type === "Expense")
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="Reason for payment..."
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add New Category</h3>
              <button type="button" onClick={() => setCategoryModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCategory.name) return;
                const added = {
                  id: `cat_${Date.now()}`,
                  name: newCategory.name,
                  type: newCategory.type,
                };
                setCategories([...categories, added]);
                setNewCategory({ name: "", type: "Expense" });
                setCategoryModalOpen(false);
                showToast(`Created category "${added.name}"!`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Type</label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Online Payment Checkout Modal */}
      <BillstacksPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setActivePaymentTarget(null);
        }}
        title={activePaymentTarget?.title || "Online Payment"}
        subtitle={activePaymentTarget?.subtitle}
        amountNaira={activePaymentTarget?.amountNaira || 0}
        customerName={activePaymentTarget?.customerName || activeBusiness.name}
        referenceNo={activePaymentTarget?.referenceNo || "PAY-REF"}
        itemType={activePaymentTarget?.itemType || "Invoice"}
        onPaymentSuccess={({ gateway, reference, amountNaira }) => {
          if (activePaymentTarget?.itemType === "Invoice" && activePaymentTarget.invoiceId) {
            setInvoices((prev) =>
              prev.map((it) => (it.id === activePaymentTarget.invoiceId ? { ...it, status: "Paid" } : it))
            );
            recordTransaction({
              source: ServiceSlug.BILLSTACKS,
              activityType: "PAYMENT",
              activitySummary: `Invoice #${activePaymentTarget.referenceNo} paid via ${gateway} (Ref: ${reference})`,
              customer: activePaymentTarget.customerName || "Customer",
              amountKobo: amountNaira * 100,
              location: "Billstacks Cloud Invoicing",
              status: "CONFIRMED",
              invoiceNo: activePaymentTarget.referenceNo || reference,
            });
          } else if (activePaymentTarget?.itemType === "Subscription") {
            recordTransaction({
              source: ServiceSlug.BILLSTACKS,
              activityType: "PAYMENT",
              activitySummary: `${activePaymentTarget.title} confirmed via ${gateway} (Ref: ${reference})`,
              customer: activeBusiness.name,
              amountKobo: amountNaira * 100,
              location: "Billstacks Cloud Subscriptions",
              status: "CONFIRMED",
              invoiceNo: reference,
            });
          }
          showToast(`Payment of ₦${amountNaira.toLocaleString()} settled via ${gateway}!`);
        }}
      />
    </div>
  );
}
