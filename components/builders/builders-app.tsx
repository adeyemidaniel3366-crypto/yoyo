"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Users,
  Wallet,
  Calculator,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  FileSpreadsheet,
  User,
  Lock,
  Eye,
  EyeOff,
  PanelLeft,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  SECURITY_QUESTIONS,
  registerBuilderAccount,
  verifyBuilderLogin,
  getBuilderByUsername,
  resetBuilderPassword,
} from "@/lib/auth-storage";
import { ServiceSlug } from "@/lib/constants";
import { usePlatformStore } from "@/lib/platform-store";
import {
  BuildersSection,
  BuilderProduct,
  BuilderSaleRecord,
  BuilderStockSheet,
  BuilderDebtorCustomer,
  BuilderExpenseRecord,
  BuilderUserRecord,
  BuilderBusinessSettings,
  BuilderAuditEntry,
  INITIAL_BUILDER_PRODUCTS,
  INITIAL_BUILDER_SALES,
  INITIAL_BUILDER_STOCK_SHEETS,
  INITIAL_BUILDER_DEBTORS,
  INITIAL_BUILDER_USERS,
  INITIAL_BUILDER_SETTINGS,
  INITIAL_BUILDER_AUDIT_LOGS,
} from "./builders-types";
import {
  SalesBookView,
  NewSaleView,
  ProductsStockView,
  AddProductView,
  StockInView,
  StockSheetView,
} from "./builders-sales-stock-views";
import {
  DebtorsView,
  AddCustomerView,
  ExpensesView,
  TodaysAccountView,
  ReportsView,
  UsersRolesView,
  BusinessSettingsView,
  AuditLogView,
} from "./builders-finance-settings-views";

const BUILDERS_STORAGE_KEY = "zino_top_builders_workspace_v1";
const TODAY_ISO = "2026-11-23";

export function TopBuildersApp({ initialLoggedIn = false }: { initialLoggedIn?: boolean }) {
  const {
    products: platformProducts,
    saveProduct: savePlatformProduct,
    recordTransaction,
  } = usePlatformStore();

  const [hydrated, setHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  // Form fields start EMPTY — no hardcoded demo autofill!
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"SIGN_IN" | "SIGN_UP" | "FORGOT_PASSWORD">("SIGN_IN");
  const [authError, setAuthError] = useState<string | null>(null);

  // Sign up form state
  const [signUpName, setSignUpName] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpRole, setSignUpRole] = useState<"Owner" | "Manager" | "Sales Rep" | "Cashier">("Manager");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpQuestion, setSignUpQuestion] = useState<string>(SECURITY_QUESTIONS[0]);
  const [signUpAnswer, setSignUpAnswer] = useState("");
  const [signUpPin, setSignUpPin] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot password form state
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [retrievedQuestion, setRetrievedQuestion] = useState("");
  const [securityAnswerAttempt, setSecurityAnswerAttempt] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    name: "Chima Ezenwa",
    username: "@chimatop",
    initials: "CE",
    role: "Owner",
  });

  const [activeSection, setActiveSection] = useState<BuildersSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sidebar collapsible groups
  const [salesGroupOpen, setSalesGroupOpen] = useState(true);
  const [stockGroupOpen, setStockGroupOpen] = useState(true);
  const [settingsGroupOpen, setSettingsGroupOpen] = useState(false);

  // Core data collections
  const [products, setProducts] = useState<BuilderProduct[]>(INITIAL_BUILDER_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<BuilderProduct | null>(null);
  const [sales, setSales] = useState<BuilderSaleRecord[]>(INITIAL_BUILDER_SALES);
  const [stockSheets, setStockSheets] = useState<BuilderStockSheet[]>(
    INITIAL_BUILDER_STOCK_SHEETS
  );
  const [debtors, setDebtors] = useState<BuilderDebtorCustomer[]>(INITIAL_BUILDER_DEBTORS);
  const [expenses, setExpenses] = useState<BuilderExpenseRecord[]>([]);
  const [closedDays, setClosedDays] = useState<Record<string, boolean>>({});
  const [users, setUsers] = useState<BuilderUserRecord[]>(INITIAL_BUILDER_USERS);
  const [businessSettings, setBusinessSettings] =
    useState<BuilderBusinessSettings>(INITIAL_BUILDER_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<BuilderAuditEntry[]>(INITIAL_BUILDER_AUDIT_LOGS);
  const [showWeekSalesTable, setShowWeekSalesTable] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const logAudit = (
    action: string,
    category: BuilderAuditEntry["category"],
    details: string
  ) => {
    const now = new Date();
    const ts = `23/11/2026, ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const entry: BuilderAuditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: ts,
      actor: `${currentUser.name} (${currentUser.username})`,
      role: currentUser.role,
      action,
      category,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Restore workspace from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BUILDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.isLoggedIn === "boolean" && !initialLoggedIn) {
          setIsLoggedIn(parsed.isLoggedIn);
        }
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        }
        if (Array.isArray(parsed.sales)) setSales(parsed.sales);
        if (Array.isArray(parsed.stockSheets)) setStockSheets(parsed.stockSheets);
        if (Array.isArray(parsed.debtors)) setDebtors(parsed.debtors);
        if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
        if (parsed.closedDays) setClosedDays(parsed.closedDays);
        if (Array.isArray(parsed.users)) setUsers(parsed.users);
        if (parsed.businessSettings) setBusinessSettings(parsed.businessSettings);
        if (Array.isArray(parsed.auditLogs)) setAuditLogs(parsed.auditLogs);
      }
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, [initialLoggedIn]);

  // Persist workspace to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        BUILDERS_STORAGE_KEY,
        JSON.stringify({
          isLoggedIn,
          currentUser,
          products,
          sales,
          stockSheets,
          debtors,
          expenses,
          closedDays,
          users,
          businessSettings,
          auditLogs,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [
    hydrated,
    isLoggedIn,
    currentUser,
    products,
    sales,
    stockSheets,
    debtors,
    expenses,
    closedDays,
    users,
    businessSettings,
    auditLogs,
  ]);

  // Merge any extra Builders products created from the Main Admin Studio
  const unifiedProducts = useMemo(() => {
    const existingNames = new Set(products.map((p) => p.name.toLowerCase()));
    const extraFromAdmin: BuilderProduct[] = platformProducts
      .filter(
        (pp) =>
          pp.source === ServiceSlug.BUILDERS &&
          pp.status !== "ARCHIVED" &&
          !existingNames.has(pp.name.toLowerCase()) &&
          !products.some((bp) => bp.id === pp.id)
      )
      .map((pp, idx) => ({
        id: pp.id,
        itemNo: String(products.length + idx + 1).padStart(3, "0"),
        name: pp.name,
        category: pp.label || "Cement",
        description: pp.description,
        baseUnit: "bag",
        baseUnitLabel: "Bag (bag)",
        reorderLevel: pp.lowStockAt || 15,
        stockOnHand: pp.totalStock,
        costPriceNaira: Math.round((pp.costKobo || 0) / 100),
        sellingUnits: [
          {
            unit: "bag",
            label: "Bag (bag)",
            containsBase: 1,
            priceNaira: Math.round((pp.priceKobo || 0) / 100),
            isDefault: true,
          },
        ],
        active: pp.status !== "INACTIVE",
      }));
    return [...products, ...extraFromAdmin];
  }, [products, platformProducts]);

  // Today's metrics for Dashboard (Mon, 23 Nov 2026)
  const todaySales = useMemo(
    () => sales.filter((s) => s.date === TODAY_ISO),
    [sales]
  );
  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === TODAY_ISO),
    [expenses]
  );

  const todayPaidSalesVal = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.amountPaidNaira, 0),
    [todaySales]
  );
  const todayCreditSalesVal = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.outstandingNaira, 0),
    [todaySales]
  );
  const todayTotalSalesVal = todayPaidSalesVal + todayCreditSalesVal;

  const todayCashReceived = useMemo(
    () =>
      todaySales
        .filter((s) => s.paymentMethod === "Cash")
        .reduce((sum, s) => sum + s.amountPaidNaira, 0),
    [todaySales]
  );
  const todayBankPosReceived = useMemo(
    () =>
      todaySales
        .filter((s) => s.paymentMethod !== "Cash")
        .reduce((sum, s) => sum + s.amountPaidNaira, 0),
    [todaySales]
  );
  const todayTotalReceived = todayCashReceived + todayBankPosReceived;

  const todayTotalExpensesVal = useMemo(
    () => todayExpenses.reduce((sum, e) => sum + e.amountNaira, 0),
    [todayExpenses]
  );
  const todayCashExpensesVal = useMemo(
    () =>
      todayExpenses
        .filter((e) => e.paidFrom === "Cash")
        .reduce((sum, e) => sum + e.amountNaira, 0),
    [todayExpenses]
  );
  const todayBalanceAfterExpenses = todayCashReceived - todayCashExpensesVal;

  const activeDebtors = useMemo(
    () => debtors.filter((d) => d.totalOwedNaira > 0),
    [debtors]
  );
  const totalOutstandingDebt = useMemo(
    () => activeDebtors.reduce((sum, d) => sum + d.totalOwedNaira, 0),
    [activeDebtors]
  );

  const lowStockProducts = useMemo(
    () => unifiedProducts.filter((p) => p.active && p.stockOnHand <= p.reorderLevel),
    [unifiedProducts]
  );

  const expensesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.date] = (map[e.date] || 0) + e.amountNaira;
    });
    return map;
  }, [expenses]);

  /* ============================================================================
     IMAGE 1 — LOGIN SCREEN
     ============================================================================ */
  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8"
        style={{
          backgroundColor: "#F7FAFF",
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 35px, #E2ECFC 35px, #E2ECFC 36px)",
        }}
      >
        <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#173A80] bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Zino Hub</span>
          </Link>
        </div>

        <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto py-8">
          {/* Left Branding */}
          <div className="md:col-span-6 flex flex-col items-center text-center space-y-3 px-4">
            <div className="w-20 h-20 rounded-xl bg-white shadow-sm border border-slate-100 p-2 flex items-center justify-center">
              <Image
                src={businessSettings.logoUrl || "/logos/builders-logo.png"}
                alt={businessSettings.businessName}
                width={80}
                height={80}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-[#173A80] tracking-tight">
                TOP BUILDERS
              </h1>
              <h2 className="text-xl font-extrabold text-[#173A80]">Best Materials</h2>
              <p className="text-xs italic font-bold text-[#173A80] pt-0.5">
                Building A Solid Foundation...
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed pt-2">
              The sales book, stock sheet and cash sales invoices, on your phone and computer.
            </p>
          </div>

          {/* Right Auth Card: SIGN_IN / SIGN_UP / FORGOT_PASSWORD */}
          <div className="md:col-span-6 w-full">
            {authMode === "SIGN_IN" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const clean = loginUsername.replace(/^@/, "").trim();
                  if (!clean || !loginPassword) {
                    setAuthError("Please enter your username and password.");
                    return;
                  }

                  const matchedAccount = verifyBuilderLogin(clean, loginPassword);
                  if (matchedAccount) {
                    const initials = matchedAccount.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    setCurrentUser({
                      name: matchedAccount.name,
                      username: `@${matchedAccount.username}`,
                      initials: initials || "TB",
                      role: matchedAccount.role,
                    });
                    setIsLoggedIn(true);
                    setAuthError(null);
                    showToast(`Welcome back, ${matchedAccount.name}!`);
                    return;
                  }

                  // Fallback: check memory users list
                  const userInList = users.find(
                    (u) =>
                      u.username.toLowerCase() === `@${clean.toLowerCase()}` ||
                      u.username.toLowerCase() === clean.toLowerCase()
                  );
                  if (userInList) {
                    const initials = userInList.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    setCurrentUser({
                      name: userInList.name,
                      username: userInList.username.startsWith("@")
                        ? userInList.username
                        : `@${userInList.username}`,
                      initials: initials || "TB",
                      role: userInList.role,
                    });
                    setIsLoggedIn(true);
                    setAuthError(null);
                    showToast(`Welcome back, ${userInList.name}!`);
                    return;
                  }

                  setAuthError("Invalid username or password. Please verify your credentials.");
                }}
                className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-xl space-y-5 max-w-md mx-auto"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-[#12264A]">Sign in</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your Top Builders credentials to access the sales book & stock sheet.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#12264A] mb-1.5">Username</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => {
                          setLoginUsername(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        placeholder="e.g. chimatop"
                        className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-bold text-[#12264A]">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("FORGOT_PASSWORD");
                          setForgotStep(1);
                          setForgotUsername(loginUsername);
                          setAuthError(null);
                        }}
                        className="text-[11px] font-semibold text-[#1D63ED] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        placeholder="Enter your password"
                        className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  Sign in
                </button>

                <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("SIGN_UP");
                      setAuthError(null);
                    }}
                    className="text-[#1D63ED] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Sign up now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}

            {authMode === "SIGN_UP" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!signUpName.trim() || !signUpUsername.trim() || !signUpPassword) {
                    setAuthError("Please fill in all required fields.");
                    return;
                  }
                  if (signUpPassword.length < 6) {
                    setAuthError("Password must be at least 6 characters.");
                    return;
                  }
                  if (signUpPassword !== signUpConfirmPassword) {
                    setAuthError("Passwords do not match.");
                    return;
                  }
                  if (!signUpAnswer.trim()) {
                    setAuthError("Please provide an answer to your security question.");
                    return;
                  }

                  const reg = registerBuilderAccount({
                    name: signUpName.trim(),
                    username: signUpUsername.trim(),
                    password: signUpPassword,
                    role: signUpRole,
                    securityQuestion: signUpQuestion,
                    securityAnswer: signUpAnswer.trim(),
                    pin: signUpPin.trim() || signUpAnswer.trim(),
                  });

                  if (!reg.success || !reg.account) {
                    setAuthError(reg.error || "Failed to create account.");
                    return;
                  }

                  const cleanUser = reg.account.username;
                  if (
                    !users.some(
                      (u) => u.username.replace(/^@/, "").toLowerCase() === cleanUser.toLowerCase()
                    )
                  ) {
                    setUsers((prev) => [
                      ...prev,
                      {
                        id: `usr_${Date.now()}`,
                        name: reg.account!.name,
                        username: `@${cleanUser}`,
                        phone: "",
                        role: reg.account!.role,
                        status: "Active",
                        lastSignIn: "Just now",
                      },
                    ]);
                  }

                  const initials = reg.account.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  setCurrentUser({
                    name: reg.account.name,
                    username: `@${reg.account.username}`,
                    initials: initials || "TB",
                    role: reg.account.role,
                  });
                  setIsLoggedIn(true);
                  setAuthError(null);
                  showToast(`Account created! Welcome, ${reg.account.name}`);
                }}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xl space-y-4 max-w-md mx-auto"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#12264A]">Create Account</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Register your Top Builders login and recovery security question.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block font-bold text-[#12264A] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Chima Ezenwa"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-[#12264A] mb-1">Username *</label>
                      <input
                        type="text"
                        required
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value)}
                        placeholder="e.g. chimatop"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#12264A] mb-1">Role *</label>
                      <select
                        value={signUpRole}
                        onChange={(e) =>
                          setSignUpRole(e.target.value as "Owner" | "Manager" | "Sales Rep" | "Cashier")
                        }
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Manager">Manager</option>
                        <option value="Sales Rep">Sales Rep</option>
                        <option value="Cashier">Cashier</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-[#12264A] mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showSignUpPassword ? "text" : "password"}
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showSignUpPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-[#12264A] mb-1">Confirm *</label>
                      <input
                        type={showSignUpPassword ? "text" : "password"}
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="Re-type"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block font-bold text-[#12264A] mb-1">
                      Security Question (for password reset) *
                    </label>
                    <select
                      value={signUpQuestion}
                      onChange={(e) => setSignUpQuestion(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium text-xs focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                    >
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#12264A] mb-1">
                      Your Answer / PIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpAnswer}
                      onChange={(e) => setSignUpAnswer(e.target.value)}
                      placeholder="e.g. My memorable moment, 4-digit PIN, or mother's name"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Used to verify your identity if you ever forget your password.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  Create Account & Sign In
                </button>

                <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("SIGN_IN");
                      setAuthError(null);
                    }}
                    className="text-[#1D63ED] font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {authMode === "FORGOT_PASSWORD" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-xl space-y-5 max-w-md mx-auto">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#12264A]">Reset Password</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Recover your Top Builders access using your registered security question.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{authError}</span>
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const clean = forgotUsername.replace(/^@/, "").trim();
                      if (!clean) {
                        setAuthError("Please enter your username.");
                        return;
                      }
                      const acc = getBuilderByUsername(clean);
                      if (!acc) {
                        setAuthError("No Top Builders account found with that username.");
                        return;
                      }
                      setRetrievedQuestion(
                        acc.securityQuestion || "What is your security answer or PIN?"
                      );
                      setForgotStep(2);
                      setAuthError(null);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-bold text-[#12264A] mb-1.5">
                        Enter your Username
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={forgotUsername}
                          onChange={(e) => setForgotUsername(e.target.value)}
                          placeholder="e.g. chimatop"
                          className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      Find Account & Security Question
                    </button>

                    <div className="pt-2 text-center text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("SIGN_IN");
                          setAuthError(null);
                        }}
                        className="text-slate-500 hover:text-slate-700 font-semibold inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!securityAnswerAttempt.trim()) {
                        setAuthError("Please provide the answer to your security question.");
                        return;
                      }
                      if (!newPassword || newPassword.length < 6) {
                        setAuthError("New password must be at least 6 characters.");
                        return;
                      }
                      if (newPassword !== confirmNewPassword) {
                        setAuthError("Passwords do not match.");
                        return;
                      }

                      const res = resetBuilderPassword(
                        forgotUsername,
                        securityAnswerAttempt.trim(),
                        newPassword
                      );
                      if (!res.success) {
                        setAuthError(res.error || "Incorrect security answer or PIN.");
                        return;
                      }

                      showToast(
                        "Password reset successfully! Please sign in with your new password."
                      );
                      setLoginUsername(forgotUsername.replace(/^@/, ""));
                      setLoginPassword(newPassword);
                      setAuthMode("SIGN_IN");
                      setAuthError(null);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-[#173A80] space-y-1">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-[#1D63ED] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Security Question for @{forgotUsername.replace(/^@/, "")}</span>
                      </p>
                      <p className="font-bold text-sm text-[#12264A]">{retrievedQuestion}</p>
                    </div>

                    <div>
                      <label className="block font-bold text-[#12264A] mb-1.5">
                        Your Security Answer or PIN *
                      </label>
                      <div className="relative">
                        <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={securityAnswerAttempt}
                          onChange={(e) => setSecurityAnswerAttempt(e.target.value)}
                          placeholder="Enter your registered answer or PIN"
                          className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#12264A] mb-1">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#12264A] mb-1">Confirm New</label>
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-type"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#EEF3FB] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      Update Password & Sign In
                    </button>

                    <div className="pt-2 text-center text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("SIGN_IN");
                          setAuthError(null);
                        }}
                        className="text-slate-500 hover:text-slate-700 font-semibold inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-4" />
      </div>
    );
  }

  /* ============================================================================
     IMAGE 2 — DASHBOARD VIEW
     ============================================================================ */
  const renderDashboardView = () => {
    const todayStarted = todaySales.length > 0;

    return (
      <div className="space-y-4 text-xs">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Dashboard</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span>Mon, 23 Nov 2026</span>
              {todayStarted ? (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Open ({todaySales.length} {todaySales.length === 1 ? "sale" : "sales"})
                </span>
              ) : (
                <>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Not started
                  </span>
                  <span>The day opens with the first sale.</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection("new-sale")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New sale</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("sales-book")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>Sales book</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("stock-sheet")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Stock sheet</span>
            </button>
          </div>
        </div>

        {/* Row 1: 4 Blue-Header Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total sales */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
            <div className="bg-[#1D63ED] text-white px-4 py-2 font-bold text-[11px]">
              Total sales
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-2xl font-black text-[#12264A] tabular-nums">
                ₦{todayTotalSalesVal.toLocaleString()}
              </p>
              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2">
                <div className="flex justify-between text-slate-500">
                  <span>Paid sales</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ₦{todayPaidSalesVal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>On credit</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ₦{todayCreditSalesVal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#12264A] border-t border-slate-100 pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">₦{todayTotalSalesVal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Received */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
            <div className="bg-[#1D63ED] text-white px-4 py-2 font-bold text-[11px]">Received</div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-2xl font-black text-[#12264A] tabular-nums">
                ₦{todayTotalReceived.toLocaleString()}
              </p>
              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2">
                <div className="flex justify-between text-slate-500">
                  <span>Cash received</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ₦{todayCashReceived.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Bank / POS</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ₦{todayBankPosReceived.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#12264A] border-t border-slate-100 pt-1">
                  <span>Total received</span>
                  <span className="tabular-nums">₦{todayTotalReceived.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Transferred (POS + bank) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
            <div className="bg-[#1D63ED] text-white px-4 py-2 font-bold text-[11px]">
              Transferred (POS + bank)
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-2xl font-black text-[#12264A] tabular-nums">
                ₦{todayBankPosReceived.toLocaleString()}
              </p>
              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2">
                {todayBankPosReceived === 0 ? (
                  <p className="text-slate-400 py-1">None yet today</p>
                ) : (
                  <div className="flex justify-between text-slate-500">
                    <span>POS &amp; Transfers</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      ₦{todayBankPosReceived.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#12264A] border-t border-slate-100 pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">₦{todayBankPosReceived.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Expenses */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
            <div className="bg-[#1D63ED] text-white px-4 py-2 font-bold text-[11px]">Expenses</div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-2xl font-black text-[#12264A] tabular-nums">
                ₦{todayTotalExpensesVal.toLocaleString()}
              </p>
              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2">
                {todayExpenses.length === 0 ? (
                  <p className="text-slate-400 py-1">None yet today</p>
                ) : (
                  <div className="flex justify-between text-slate-500">
                    <span>{todayExpenses.length} recorded today</span>
                    <span className="font-semibold text-rose-600 tabular-nums">
                      ₦{todayTotalExpensesVal.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#12264A] border-t border-slate-100 pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">₦{todayTotalExpensesVal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Balance after expenses & Outstanding debts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Balance after expenses */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-[#1D63ED] text-white px-4 py-2 font-bold text-[11px]">
              Balance after expenses
            </div>
            <div className="p-4 space-y-1">
              <p className="text-2xl font-black text-[#12264A] tabular-nums">
                ₦{todayBalanceAfterExpenses.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400">
                Cash that should be in the drawer: ₦{todayBalanceAfterExpenses.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Outstanding debts (Red Card) */}
          <div className="bg-white rounded-xl border border-rose-300 overflow-hidden shadow-2xs">
            <div className="bg-[#D92D20] text-white px-4 py-2 font-bold text-[11px]">
              Outstanding debts
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#D92D20] tabular-nums">
                  ₦{totalOutstandingDebt.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500">
                  from {activeDebtors.length} customers
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection("debtors")}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 font-bold text-slate-800 text-xs"
              >
                View debtors
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Sales this week & Low stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
          {/* Sales this week */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-[#1D63ED] text-white px-4 py-2 font-bold text-[11px]">
              Sales this week
            </div>
            <div className="p-4 space-y-3">
              <div className="h-36 flex flex-col justify-end">
                <div className="flex items-end gap-2 border-b border-slate-200 pb-1">
                  <span className="text-[9px] text-slate-400">₦0</span>
                  <div className="flex-1 grid grid-cols-7 gap-2 items-end h-28">
                    {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map(
                      (dayName, idx) => {
                        const val = idx === 0 ? todayTotalSalesVal : 0;
                        const h = val > 0 ? Math.min(100, Math.max(12, Math.round(val / 1000))) : 0;
                        return (
                          <div
                            key={dayName}
                            className="flex flex-col items-center justify-end h-full"
                          >
                            {h > 0 && (
                              <div
                                style={{ height: `${h}%` }}
                                className="w-5 bg-[#1D63ED] rounded-t"
                              />
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 pl-5 pt-1.5 text-center text-[9px] text-slate-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWeekSalesTable(!showWeekSalesTable)}
                className="text-[11px] font-bold text-[#1D63ED] hover:underline"
              >
                {showWeekSalesTable ? "▾ Hide table" : "▸ Show as a table"}
              </button>

              {showWeekSalesTable && (
                <div className="pt-2 border-t border-slate-100 text-[11px]">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Mon, 23 Nov 2026</span>
                    <span className="font-bold">₦{todayTotalSalesVal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Low stock */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-[#1D63ED] text-white px-4 py-2 font-bold text-[11px]">Low stock</div>
            <div className="divide-y divide-slate-100">
              {lowStockProducts.length === 0 ? (
                <div className="p-4 text-slate-400 text-xs">All products are well stocked.</div>
              ) : (
                lowStockProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveSection("stock-products")}
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="font-semibold text-[#12264A]">{item.name}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>
                        {item.stockOnHand} {item.baseUnit} left
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Row 4: Recent sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-[#1D63ED] text-white px-4 py-2 font-bold text-[11px]">
              Recent sales
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-[11px]">
                    <th className="py-2.5 px-4">Invoice</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.slice(0, 6).map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setActiveSection("sales-book")}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-2.5 px-4 font-bold text-[#1D63ED]">{s.invoiceNo}</td>
                      <td className="py-2.5 px-4 text-[#12264A]">{s.customerName}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-[#12264A] tabular-nums">
                        ₦{s.totalAmountNaira.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            s.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : s.status === "Part paid"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ============================================================================
     MAIN ROUTER CONTENT
     ============================================================================ */
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardView();

      case "sales-book":
        return (
          <SalesBookView
            sales={sales}
            expensesByDate={expensesByDate}
            closedDays={closedDays}
            onCloseDay={(iso) => {
              setClosedDays((prev) => ({ ...prev, [iso]: !prev[iso] }));
              showToast(`Day ${iso} ${closedDays[iso] ? "re-opened" : "closed"}!`);
            }}
            onNewSaleClick={() => setActiveSection("new-sale")}
            businessSettings={businessSettings}
            showToast={showToast}
          />
        );

      case "new-sale":
        return (
          <NewSaleView
            products={unifiedProducts}
            customers={debtors}
            paymentAccounts={businessSettings.paymentAccounts}
            onCompleteSale={(data) => {
              const nextNum = businessSettings.numbering.invoiceNext;
              const invNo = `${businessSettings.numbering.invoicePrefix}${String(nextNum).padStart(
                6,
                "0"
              )}`;
              const totalNaira = data.items.reduce((s, i) => s + i.totalAmountNaira, 0);
              const outstanding = Math.max(0, totalNaira - data.amountPaidNaira);
              const status: BuilderSaleRecord["status"] =
                outstanding === 0
                  ? "Paid"
                  : data.amountPaidNaira > 0
                  ? "Part paid"
                  : "Unpaid";

              const newSale: BuilderSaleRecord = {
                id: `bs_${Date.now()}`,
                invoiceNo: invNo,
                date: TODAY_ISO,
                displayDate: "23/11/26",
                dayHeader: "Mon, 23 Nov 2026",
                customerId: data.customerId,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                items: data.items,
                totalAmountNaira: totalNaira,
                amountPaidNaira: data.amountPaidNaira,
                outstandingNaira: outstanding,
                paymentMethod: data.paymentMethod,
                fulfilment: data.fulfilment,
                remarks: data.remarks,
                salesRep: currentUser.name,
                sign: currentUser.name.split(" ")[0] || "Chima",
                status,
                createdAt: new Date().toISOString(),
              };

              setSales((prev) => [newSale, ...prev]);

              // Deduct stock
              setProducts((prev) =>
                prev.map((p) => {
                  const soldLines = data.items.filter((l) => l.productId === p.id);
                  if (soldLines.length === 0) return p;
                  const baseUnitsOut = soldLines.reduce(
                    (sum, l) => sum + l.qty * l.containsBase,
                    0
                  );
                  return {
                    ...p,
                    stockOnHand: Math.max(0, Number((p.stockOnHand - baseUnitsOut).toFixed(2))),
                  };
                })
              );

              // Update or create debtor if on credit
              if (outstanding > 0) {
                setDebtors((prev) => {
                  const found = prev.find(
                    (c) =>
                      c.id === data.customerId ||
                      c.name.toLowerCase() === data.customerName.toLowerCase()
                  );
                  if (found) {
                    return prev.map((c) =>
                      c.id === found.id
                        ? {
                            ...c,
                            totalOwedNaira: c.totalOwedNaira + outstanding,
                            unpaidInvoicesCount: c.unpaidInvoicesCount + 1,
                            invoiceNumbers: [invNo, ...c.invoiceNumbers],
                          }
                        : c
                    );
                  }
                  return [
                    {
                      id: `cust_${Date.now()}`,
                      name: data.customerName,
                      phone: data.customerPhone || "—",
                      address: data.remarks || "Walk-in credit customer",
                      notes: "Auto-added on credit purchase",
                      totalOwedNaira: outstanding,
                      oldestInvoiceDate: "23/11/2026",
                      daysAgo: 0,
                      unpaidInvoicesCount: 1,
                      invoiceNumbers: [invNo],
                    },
                    ...prev,
                  ];
                });
              }

              // Increment invoice number
              setBusinessSettings((prev) => ({
                ...prev,
                numbering: {
                  ...prev.numbering,
                  invoiceNext: prev.numbering.invoiceNext + 1,
                },
              }));

              // Sync to unified platform store
              recordTransaction({
                source: ServiceSlug.BUILDERS,
                activityType: "SALE",
                activitySummary: `Top Builders Sale ${invNo} (${data.items
                  .map((i) => `${i.qty} ${i.description}`)
                  .join(", ")})`,
                customer: data.customerName,
                amountKobo: totalNaira * 100,
                location: "Builders Yard Ojo",
                status: status === "Paid" ? "PAID" : "PENDING",
                invoiceNo: invNo,
              });

              logAudit(
                `Recorded sale ${invNo} (₦${totalNaira.toLocaleString()})`,
                "Sale",
                `Customer: ${data.customerName} · ${status}`
              );
              showToast(`Sale ${invNo} saved (₦${totalNaira.toLocaleString()})!`);
              setActiveSection("sales-book");
            }}
          />
        );

      case "stock-products":
        return (
          <ProductsStockView
            products={unifiedProducts}
            onStockInClick={() => setActiveSection("stock-in")}
            onAddProductClick={() => {
              setEditingProduct(null);
              setActiveSection("stock-add-product");
            }}
            onEditProductClick={(prod) => {
              setEditingProduct(prod);
              setActiveSection("stock-add-product");
            }}
          />
        );

      case "stock-add-product":
        return (
          <AddProductView
            nextItemNo={String(unifiedProducts.length + 1).padStart(3, "0")}
            initialProduct={editingProduct}
            onCancel={() => {
              setEditingProduct(null);
              setActiveSection("stock-products");
            }}
            onSaveProduct={(prod) => {
              setProducts((prev) => {
                const exists = prev.some((p) => p.id === prod.id);
                return exists
                  ? prev.map((p) => (p.id === prod.id ? prod : p))
                  : [...prev, prod];
              });

              const defUnit =
                prod.sellingUnits.find((u) => u.isDefault) || prod.sellingUnits[0];

              // Sync with Unified Platform Store
              savePlatformProduct({
                id: prod.id,
                source: ServiceSlug.BUILDERS,
                sku: `TB-${prod.itemNo}`,
                name: prod.name,
                label: prod.category,
                description: prod.description || `${prod.name} (${prod.baseUnitLabel})`,
                priceKobo: (defUnit?.priceNaira || 0) * 100,
                costKobo: (prod.costPriceNaira || 0) * 100,
                imageUrl: "",
                images: [],
                status:
                  prod.stockOnHand <= 0
                    ? "OUT_OF_STOCK"
                    : prod.stockOnHand <= prod.reorderLevel
                    ? "LOW_STOCK"
                    : "ACTIVE",
                totalStock: prod.stockOnHand,
                lowStockAt: prod.reorderLevel,
              });

              logAudit(
                `${editingProduct ? "Updated" : "Added"} product ${prod.itemNo} ${prod.name}`,
                "Stock",
                `Stock: ${prod.stockOnHand} ${prod.baseUnit}`
              );
              showToast(`Product "${prod.name}" saved!`);
              setEditingProduct(null);
              setActiveSection("stock-products");
            }}
          />
        );

      case "stock-in":
        return (
          <StockInView
            products={unifiedProducts}
            onCancel={() => setActiveSection("stock-products")}
            onSaveStockIn={(payload) => {
              let totalUnitsIn = 0;
              const newSheetRows: BuilderStockSheet["rows"] = [];

              setProducts((prev) =>
                prev.map((p) => {
                  const matching = payload.items.filter((it) => it.productId === p.id);
                  if (matching.length === 0) return p;
                  const addedBase = matching.reduce(
                    (sum, it) => sum + it.qty * it.containsBase,
                    0
                  );
                  totalUnitsIn += addedBase;
                  const defU = p.sellingUnits.find((u) => u.isDefault) || p.sellingUnits[0];
                  newSheetRows.push({
                    id: `ssr_${Date.now()}_${p.id}`,
                    date: "23/11/26",
                    itemNo: p.itemNo,
                    description: `${p.name} (${p.baseUnit})`,
                    unitPriceNaira: defU?.priceNaira || 0,
                    cartonPriceNaira: null,
                    openingBal: p.stockOnHand,
                    stockOut: 0,
                    stockIn: addedBase,
                    closingBal: p.stockOnHand + addedBase,
                  });
                  return {
                    ...p,
                    stockOnHand: Number((p.stockOnHand + addedBase).toFixed(2)),
                  };
                })
              );

              if (newSheetRows.length > 0) {
                const nextSheetNo = `${businessSettings.numbering.stockSheetPrefix}${String(
                  businessSettings.numbering.stockSheetNext
                ).padStart(5, "0")}`;
                const createdSheet: BuilderStockSheet = {
                  id: `ss_${Date.now()}`,
                  sheetNo: nextSheetNo,
                  isoDate: TODAY_ISO,
                  displayDate: "Mon, 23 Nov 2026",
                  shortDate: "23/11/26",
                  itemsMoved: newSheetRows.length,
                  unitsOut: 0,
                  unitsIn: totalUnitsIn,
                  countedBy: currentUser.name,
                  rows: newSheetRows,
                };
                setStockSheets((prev) => [createdSheet, ...prev]);
                setBusinessSettings((prev) => ({
                  ...prev,
                  numbering: {
                    ...prev.numbering,
                    stockSheetNext: prev.numbering.stockSheetNext + 1,
                  },
                }));
              }

              logAudit(
                `Stock In from ${payload.supplier}`,
                "Stock",
                `${payload.items.length} item(s) received ${
                  payload.waybillNo ? `· Waybill #${payload.waybillNo}` : ""
                }`
              );
              showToast(`Stock In recorded from ${payload.supplier}!`);
              setActiveSection("stock-sheet");
            }}
          />
        );

      case "stock-sheet":
        return (
          <StockSheetView
            sheets={stockSheets}
            products={unifiedProducts}
            onStockInClick={() => setActiveSection("stock-in")}
            onUpdateCountedBy={(sheetId, name) => {
              setStockSheets((prev) =>
                prev.map((s) => (s.id === sheetId ? { ...s, countedBy: name } : s))
              );
              showToast(`Saved counter name "${name}" on stock sheet!`);
            }}
            onRecordPhysicalCount={(prodId, counted) => {
              setProducts((prev) =>
                prev.map((p) => (p.id === prodId ? { ...p, stockOnHand: counted } : p))
              );
              logAudit("Recorded physical stock count", "Stock", `Product ID: ${prodId} -> ${counted}`);
              showToast("Physical stock count updated!");
            }}
            showToast={showToast}
          />
        );

      case "debtors":
        return (
          <DebtorsView
            customers={debtors}
            paymentAccounts={businessSettings.paymentAccounts}
            onAddCustomerClick={() => setActiveSection("debtors-add-customer")}
            onReceivePayment={(custId, amount, method) => {
              const target = debtors.find((d) => d.id === custId);
              setDebtors((prev) =>
                prev.map((d) => {
                  if (d.id !== custId) return d;
                  const nextOwed = Math.max(0, d.totalOwedNaira - amount);
                  return {
                    ...d,
                    totalOwedNaira: nextOwed,
                    unpaidInvoicesCount: nextOwed === 0 ? 0 : d.unpaidInvoicesCount,
                  };
                })
              );

              if (target) {
                recordTransaction({
                  source: ServiceSlug.BUILDERS,
                  activityType: "PAYMENT",
                  activitySummary: `Debtor payment received from ${target.name} via ${method}`,
                  customer: target.name,
                  amountKobo: amount * 100,
                  location: "Builders Yard Ojo",
                  status: "PAID",
                });
                logAudit(
                  `Received ₦${amount.toLocaleString()} from ${target.name}`,
                  "Debtor",
                  `Method: ${method}`
                );
                showToast(`Received ₦${amount.toLocaleString()} from ${target.name}!`);
              }
            }}
            showToast={showToast}
          />
        );

      case "debtors-add-customer":
        return (
          <AddCustomerView
            onCancel={() => setActiveSection("debtors")}
            onSaveCustomer={(c) => {
              const created: BuilderDebtorCustomer = {
                id: `cust_${Date.now()}`,
                name: c.name,
                phone: c.phone,
                address: c.address,
                notes: c.notes,
                totalOwedNaira: 0,
                oldestInvoiceDate: "—",
                daysAgo: 0,
                unpaidInvoicesCount: 0,
                invoiceNumbers: [],
              };
              setDebtors((prev) => [created, ...prev]);
              logAudit(`Added customer ${c.name}`, "Debtor", `Phone: ${c.phone}`);
              showToast(`Customer "${c.name}" added!`);
              setActiveSection("debtors");
            }}
          />
        );

      case "expenses":
        return (
          <ExpensesView
            expenses={expenses}
            categories={businessSettings.expenseCategories}
            paymentAccounts={businessSettings.paymentAccounts}
            onAddExpense={(exp) => {
              const created: BuilderExpenseRecord = {
                id: `bexp_${Date.now()}`,
                date: exp.date,
                category: exp.category,
                description: exp.description,
                amountNaira: exp.amountNaira,
                paidFrom: exp.paidFrom,
                recordedBy: currentUser.name,
              };
              setExpenses((prev) => [created, ...prev]);
              recordTransaction({
                source: ServiceSlug.BUILDERS,
                activityType: "EXPENSE",
                activitySummary: `Shop Expense (${exp.category}): ${exp.description}`,
                customer: exp.paidFrom,
                amountKobo: exp.amountNaira * 100,
                location: "Builders Yard Ojo",
                status: "PAID",
              });
              logAudit(
                `Logged expense ₦${exp.amountNaira.toLocaleString()}`,
                "Expense",
                `${exp.category}: ${exp.description}`
              );
              showToast(`Expense of ₦${exp.amountNaira.toLocaleString()} saved!`);
            }}
            onDeleteExpense={(id) => {
              setExpenses((prev) => prev.filter((e) => e.id !== id));
              showToast("Expense removed.");
            }}
          />
        );

      case "todays-account":
        return (
          <TodaysAccountView
            todaySales={todaySales}
            todayExpenses={todayExpenses}
            isTodayClosed={!!closedDays[TODAY_ISO]}
            onCloseToday={() => {
              setClosedDays((prev) => ({ ...prev, [TODAY_ISO]: !prev[TODAY_ISO] }));
              showToast(
                closedDays[TODAY_ISO]
                  ? "Today's account re-opened."
                  : "Today's account closed and reconciled!"
              );
            }}
          />
        );

      case "reports":
        return (
          <ReportsView
            sales={sales}
            products={unifiedProducts}
            debtors={debtors}
            expenses={expenses}
            onNavigateToDebtors={() => setActiveSection("debtors")}
            showToast={showToast}
          />
        );

      case "settings-users":
        return (
          <UsersRolesView
            users={users}
            onSaveUser={(u) => {
              setUsers((prev) => {
                const exists = prev.some((it) => it.id === u.id);
                return exists ? prev.map((it) => (it.id === u.id ? u : it)) : [...prev, u];
              });
              logAudit(`Saved user ${u.name} (${u.username})`, "Settings", `Role: ${u.role}`);
              showToast(`User "${u.name}" saved!`);
            }}
            onDeleteUser={(id) => {
              setUsers((prev) => prev.filter((u) => u.id !== id));
              showToast("User deleted.");
            }}
          />
        );

      case "settings-business":
        return (
          <BusinessSettingsView
            settings={businessSettings}
            onUpdateSettings={(next) => {
              setBusinessSettings(next);
              logAudit("Updated business settings", "Settings", next.businessName);
            }}
            onDownloadBackup={() => {
              const nowStr = "23/11/2026, 21:15";
              const updatedSettings = { ...businessSettings, lastBackup: nowStr };
              setBusinessSettings(updatedSettings);
              const payload = JSON.stringify(
                {
                  exportedAt: new Date().toISOString(),
                  businessSettings: updatedSettings,
                  products: unifiedProducts,
                  sales,
                  stockSheets,
                  debtors,
                  expenses,
                  users,
                },
                null,
                2
              );
              const blob = new Blob([payload], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `top-builders-backup-${TODAY_ISO}.json`;
              a.click();
              URL.revokeObjectURL(url);
              showToast("Full workspace backup downloaded!");
            }}
            showToast={showToast}
          />
        );

      case "settings-audit":
        return <AuditLogView logs={auditLogs} />;

      default:
        return renderDashboardView();
    }
  };

  const tickerText = businessSettings.topBarMessage.trim()
    ? businessSettings.topBarMessage
    : `${businessSettings.tagline}   ✦   ${businessSettings.dealsIn}`;

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex text-slate-800">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#12264A] text-white text-xs font-bold shadow-2xl border border-blue-400/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Left Sidebar (Matching Image 2) */}
      {sidebarOpen && (
        <aside className="w-52 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
          <div className="p-3 space-y-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 px-2 pt-1">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                <Image
                  src={businessSettings.logoUrl || "/logos/builders-logo.png"}
                  alt={businessSettings.businessName}
                  width={30}
                  height={30}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="font-black text-xs text-[#15357A] leading-tight truncate">
                  {businessSettings.businessName ? businessSettings.businessName.split(" ").slice(0, 2).join(" ") : "TOP BUILDERS"}
                </p>
                <p className="text-[10px] font-bold text-[#15357A] leading-tight truncate">
                  {businessSettings.businessName ? businessSettings.businessName.split(" ").slice(2).join(" ") || "Best Materials" : "Best Materials"}
                </p>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1 text-xs">
              {/* Dashboard */}
              <button
                type="button"
                onClick={() => setActiveSection("dashboard")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "dashboard"
                    ? "bg-[#1D63ED] text-white shadow-2xs"
                    : "text-[#12264A] hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {/* Sales Group */}
              <div>
                <button
                  type="button"
                  onClick={() => setSalesGroupOpen(!salesGroupOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold text-[#12264A] hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <span>Sales</span>
                  </span>
                  {salesGroupOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
                {salesGroupOpen && (
                  <div className="pl-7 pr-1 py-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => setActiveSection("sales-book")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        activeSection === "sales-book"
                          ? "bg-[#1D63ED] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Sales Book
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("new-sale")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        activeSection === "new-sale"
                          ? "bg-[#1D63ED] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      New Sale
                    </button>
                  </div>
                )}
              </div>

              {/* Stock Group */}
              <div>
                <button
                  type="button"
                  onClick={() => setStockGroupOpen(!stockGroupOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold text-[#12264A] hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-slate-600" />
                    <span>Stock</span>
                  </span>
                  {stockGroupOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
                {stockGroupOpen && (
                  <div className="pl-7 pr-1 py-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => setActiveSection("stock-products")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        activeSection === "stock-products" ||
                        activeSection === "stock-add-product"
                          ? "bg-[#1D63ED] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("stock-sheet")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        activeSection === "stock-sheet"
                          ? "bg-[#1D63ED] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Stock Sheet
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("stock-in")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        activeSection === "stock-in"
                          ? "bg-[#1D63ED] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Stock In
                    </button>
                  </div>
                )}
              </div>

              {/* Debtors */}
              <button
                type="button"
                onClick={() => setActiveSection("debtors")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "debtors" || activeSection === "debtors-add-customer"
                    ? "bg-[#1D63ED] text-white shadow-2xs"
                    : "text-[#12264A] hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Debtors</span>
              </button>

              {/* Expenses */}
              <button
                type="button"
                onClick={() => setActiveSection("expenses")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "expenses"
                    ? "bg-[#1D63ED] text-white shadow-2xs"
                    : "text-[#12264A] hover:bg-slate-100"
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Expenses</span>
              </button>

              {/* Today's Account */}
              <button
                type="button"
                onClick={() => setActiveSection("todays-account")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "todays-account"
                    ? "bg-[#1D63ED] text-white shadow-2xs"
                    : "text-[#12264A] hover:bg-slate-100"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Today&apos;s Account</span>
              </button>

              {/* Reports */}
              <button
                type="button"
                onClick={() => setActiveSection("reports")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "reports"
                    ? "bg-[#1D63ED] text-white shadow-2xs"
                    : "text-[#12264A] hover:bg-slate-100"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </button>

              {/* Settings (3 subpages: Users & Roles, Business Settings, Audit Log) */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsGroupOpen(!settingsGroupOpen);
                    if (!settingsGroupOpen && !activeSection.startsWith("settings-")) {
                      setActiveSection("settings-business");
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold text-[#12264A] hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-slate-600" />
                    <span>Settings</span>
                  </span>
                  {settingsGroupOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
                {settingsGroupOpen && (
                  <div className="pl-7 pr-1 py-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => setActiveSection("settings-users")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        activeSection === "settings-users"
                          ? "bg-[#1D63ED] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Users &amp; Roles
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("settings-business")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        activeSection === "settings-business"
                          ? "bg-[#1D63ED] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Business Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("settings-audit")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        activeSection === "settings-audit"
                          ? "bg-[#1D63ED] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Audit Log
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Bottom Return Links */}
          <div className="p-3 border-t border-slate-100 space-y-1 text-[11px]">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-500 hover:text-[#12264A] hover:bg-slate-50 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Zino Hub</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(false);
                showToast("Signed out of Top Builders.");
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Marquee Ticker & User Menu */}
        <header className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Scrolling Marquee Message */}
          <div className="flex-1 overflow-hidden whitespace-nowrap text-[11px] font-bold text-[#15357A]">
            <div className="inline-block animate-pulse truncate max-w-full">
              {tickerText} <span className="text-rose-500 mx-2">✦</span> {tickerText}
            </div>
          </div>

          {/* Right User Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 text-xs font-bold text-[#12264A] hover:bg-slate-50 px-2 py-1 rounded-lg"
            >
              <span className="w-6 h-6 rounded-full bg-[#1D63ED] text-white text-[10px] font-extrabold flex items-center justify-center">
                {currentUser.initials}
              </span>
              <span className="hidden sm:inline">{currentUser.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-[#12264A]">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {currentUser.username} · {currentUser.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setSettingsGroupOpen(true);
                    setActiveSection("settings-users");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Users &amp; Roles
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setSettingsGroupOpen(true);
                    setActiveSection("settings-business");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Business Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setSettingsGroupOpen(true);
                    setActiveSection("settings-audit");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Audit Log
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setIsLoggedIn(false);
                      showToast("Signed out of Top Builders.");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 font-bold"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{renderSection()}</main>
      </div>
    </div>
  );
}
