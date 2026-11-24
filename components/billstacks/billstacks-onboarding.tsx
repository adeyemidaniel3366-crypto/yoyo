"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  LogOut,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  FileText,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Layers,
} from "lucide-react";
import { BILLSTACKS_COUNTRIES } from "./billstacks-countries";
import { UnifiedProduct } from "@/lib/platform-store";

export interface BillstacksUserAccount {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface BillstacksBusiness {
  id: string;
  name: string;
  title?: string;
  businessNumber?: string;
  taxVatNumber?: string;
  phone?: string;
  address?: string;
  category: string;
  country: string;
  currencyCode: string;
  currencySymbol: string;
  priceFormat: string;
  symbolDirection: string;
  priceSeparator: string;
  logoUrl?: string;
}

const BUSINESS_TYPES = [
  "Retail & E-Commerce",
  "Technology & SaaS",
  "Accounting & Finance",
  "Hospitality & Apartments",
  "Construction & Building Materials",
  "Wholesale & Distribution",
  "Consulting & Agency",
  "Healthcare & Wellness",
  "Logistics & Supply Chain",
  "Other Business",
];

/* ============================================================================
   IMAGE 2: BILLSTACKS SIGN UP / LOG IN SCREEN
   ============================================================================ */
export function BillstacksAuthScreen({
  initialMode = "signup",
  savedAccount,
  onSignUpComplete,
  onLoginComplete,
}: {
  initialMode?: "signup" | "login";
  savedAccount?: BillstacksUserAccount | null;
  onSignUpComplete: (account: BillstacksUserAccount) => void;
  onLoginComplete: (email: string) => void;
}) {
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(savedAccount?.email || "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your full name, email, and password.");
      return;
    }
    if (!agreedTerms) {
      setError("Please accept the Terms of service to continue.");
      return;
    }
    onSignUpComplete({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    onLoginComplete(email.trim());
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Top Brand Header matching Image 2 */}
      <div className="text-center mb-10 space-y-2">
        <div className="flex justify-center mb-3">
          <Image
            src="/logos/billstacks-logo.png"
            alt="Billstacks"
            width={160}
            height={64}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          SaaS Business &amp; Accounting Software
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          <strong className="text-gray-800">Bill Stacks</strong> helps Entrepreneurs to manage their
          business &amp; finances
        </p>
      </div>

      {/* Main Two-Column Auth Layout matching Image 2 */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Clean Vector Illustration */}
        <div className="lg:col-span-6 hidden lg:flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/50 border border-gray-100 p-8 flex flex-col items-center justify-center overflow-hidden">
            {/* Decorative Floating Cards */}
            <div className="absolute top-6 left-6 bg-white rounded-xl border border-blue-100 shadow-sm px-3 py-2 flex items-center gap-2 text-[11px] font-semibold text-gray-700">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Real-time Cashflow</span>
            </div>
            <div className="absolute top-10 right-6 bg-white rounded-xl border border-emerald-100 shadow-sm px-3 py-2 flex items-center gap-2 text-[11px] font-semibold text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
              <span>FIRS VAT Ready</span>
            </div>

            {/* Central Entrepreneur Launch Graphic */}
            <div className="w-36 h-36 rounded-full bg-blue-600/10 flex items-center justify-center relative my-4">
              <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl rotate-3">
                <Sparkles className="w-11 h-11" />
              </div>
              <div className="absolute -bottom-2 -right-3 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-md text-[10px] font-bold text-gray-800">
                189 Currencies
              </div>
            </div>

            <div className="mt-4 flex items-end gap-2">
              <div className="w-4 h-6 rounded-t bg-blue-300" />
              <div className="w-4 h-10 rounded-t bg-blue-400" />
              <div className="w-4 h-14 rounded-t bg-blue-500" />
              <div className="w-4 h-18 rounded-t bg-blue-600" />
              <div className="w-4 h-12 rounded-t bg-emerald-500" />
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-3">
              Create your workspace &amp; launch your first business in 30 seconds
            </p>
          </div>
        </div>

        {/* Right Sign Up / Log In Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-7 sm:p-8 space-y-5">
            <h2 className="text-center text-lg font-extrabold text-gray-900">
              {mode === "signup" ? "Sign Up" : "Log In"}
            </h2>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {mode === "signup" ? (
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full h-10 px-3.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 text-gray-800"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-10 px-3.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 text-gray-800"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full h-10 px-3.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 text-gray-800"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-10 px-3.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 text-gray-800"
                />

                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 accent-gray-900 rounded"
                  />
                  <span className="text-blue-600 underline font-medium">Terms of service</span>
                </label>

                <button
                  type="submit"
                  className="w-full h-10 rounded-md bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Get Started
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-10 px-3.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 text-gray-800"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-10 px-3.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 text-gray-800"
                />
                <button
                  type="submit"
                  className="w-full h-10 rounded-md bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Log In
                </button>
              </form>
            )}

            <div className="text-center text-xs text-gray-600 pt-1">
              {mode === "signup" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="hover:underline font-medium"
                >
                  Already have an account?{" "}
                  <span className="font-bold text-gray-900">Log In</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="hover:underline font-medium"
                >
                  Don&apos;t have an account?{" "}
                  <span className="font-bold text-blue-600">Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   IMAGE 3: SETUP YOUR FIRST BUSINESS SCREEN
   ============================================================================ */
export function BillstacksBusinessSetupScreen({
  userName,
  onCreateBusiness,
}: {
  userName: string;
  onCreateBusiness: (biz: BillstacksBusiness) => void;
}) {
  const [businessName, setBusinessName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!businessName.trim()) {
      setError("Please enter your Business Name.");
      return;
    }
    const countryObj =
      BILLSTACKS_COUNTRIES.find((c) => c.name === countryName) || BILLSTACKS_COUNTRIES[0];

    onCreateBusiness({
      id: `biz_${Date.now()}`,
      name: businessName.trim(),
      title: `${businessName.trim()} Billing`,
      category: businessType || "Retail & E-Commerce",
      country: countryObj.name,
      currencyCode: countryObj.currencyCode,
      currencySymbol: countryObj.currencySymbol,
      priceFormat: `${countryObj.currencySymbol}100`,
      symbolDirection: `${countryObj.currencySymbol}100 (Left)`,
      priceSeparator: `${countryObj.currencySymbol} 1,000.00`,
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Top Brand Header matching Image 3 */}
      <div className="text-center mb-10 space-y-2">
        <div className="flex justify-center mb-3">
          <Image
            src="/logos/billstacks-logo.png"
            alt="Billstacks"
            width={160}
            height={64}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          SaaS Business &amp; Accounting Software
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          <strong className="text-gray-800">Bill Stacks</strong> helps Entrepreneurs to manage their
          business &amp; finances
        </p>
      </div>

      {/* Main Two-Column Setup Layout matching Image 3 */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Team Illustration */}
        <div className="lg:col-span-6 hidden lg:flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md aspect-[4/3] rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 border border-gray-100 p-8 flex flex-col items-center justify-center space-y-5 relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm -rotate-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl">
                <Building2 className="w-11 h-11" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm rotate-6">
                <Layers className="w-8 h-8" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-gray-900">Welcome, {userName}!</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Tell us your business name, country currency, and industry to configure your cloud
                accounting workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Setup your first Business */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-7 sm:p-8 space-y-5">
            <h2 className="text-center text-lg font-extrabold text-gray-900">
              Setup your first Business
            </h2>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business Name"
                className="w-full h-10 px-3.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 text-gray-800"
              />

              <select
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-600 text-gray-700"
              >
                <option value="">Select country</option>
                {BILLSTACKS_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.currencyCode} {c.currencySymbol})
                  </option>
                ))}
              </select>

              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-600 text-gray-700"
              >
                <option value="">Select Business Type</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full h-10 rounded-md bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VIDEO SCREEN: POST-SETUP BILLSTACKS PUBLIC LANDING PAGE
   ============================================================================ */
export function BillstacksLandingPage({
  activeBusiness,
  userEmail,
  adminPlans,
  onEnterDashboard,
  onLogout,
}: {
  activeBusiness: BillstacksBusiness;
  userEmail: string;
  adminPlans: UnifiedProduct[];
  onEnterDashboard: () => void;
  onLogout: () => void;
}) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top Navbar matching the Screen Recording Video */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-100">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logos/billstacks-logo.png"
              alt="Billstacks"
              width={130}
              height={44}
              className="h-8 w-auto object-contain"
            />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-600">
            <button type="button" onClick={() => scrollTo("bs-home")} className="hover:text-[#28A745]">
              Home
            </button>
            <button type="button" onClick={() => scrollTo("bs-features")} className="hover:text-[#28A745]">
              Features
            </button>
            <button type="button" onClick={() => scrollTo("bs-pricing")} className="hover:text-[#28A745]">
              Pricing
            </button>
            <button type="button" onClick={() => scrollTo("bs-workflow")} className="hover:text-[#28A745]">
              Workflow
            </button>
            <button type="button" onClick={() => scrollTo("bs-footer")} className="hover:text-[#28A745]">
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-2.5 text-xs">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              type="button"
              onClick={onEnterDashboard}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Greeting Banner */}
      <section id="bs-home" className="max-w-5xl mx-auto px-4 sm:px-8 pt-12 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Workspace Ready: {activeBusiness.name}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Smart way to manage your money
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">
          Welcome <strong className="text-gray-800">{userEmail}</strong>! Your business{" "}
          <strong className="text-gray-900">{activeBusiness.name}</strong> ({activeBusiness.country} ·{" "}
          {activeBusiness.currencyCode}) is configured and ready.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onEnterDashboard}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <span>Open {activeBusiness.name} Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Alternating Feature Blocks matching the Screen Recording Video */}
      <section id="bs-features" className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-20">
        {/* Block 1: Income & Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-snug">
              Easy way to manage your Income &amp; Expenses using Billstacks
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Using Billstacks&apos;s platform you can easily track your income and expenses,
              generate instant invoices, and monitor unpaid bills and purchase orders in real time.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 border border-gray-100 p-8 flex items-center justify-center shadow-2xs">
            <div className="w-full max-w-xs bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span>Cashflow Overview</span>
                <span className="text-[#28A745]">+24.8%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-[#28A745] rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold">
                  Income Tracked
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800 font-bold">
                  Expenses Logged
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block 2: Manage your businesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-gray-100 p-8 flex items-center justify-center shadow-2xs">
            <div className="w-full max-w-xs bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs">{activeBusiness.name}</p>
                  <p className="text-[10px] text-gray-500">Multi-business switch enabled</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#28A745]" />
                  <span>Invoices, Estimates &amp; Receipts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#28A745]" />
                  <span>189 Global Currencies &amp; FIRS VAT</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-3">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-snug">
              Manage your businesses that works as hard as you do
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Create and manage your invoices and expenses, track every vendor bill, and switch
              seamlessly between multiple businesses — all in one unified package.
            </p>
          </div>
        </div>

        {/* Block 3: Automate Your Business Workflow */}
        <div id="bs-workflow" className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-snug">
              Automate Your business workflow using Billstacks
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Automate your billing cycle with recurring invoices, online payment links (Paystack,
              Stripe, PayPal), and automated tax reports.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-gray-100 p-8 flex items-center justify-center shadow-2xs">
            <div className="w-full max-w-xs bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <Clock className="w-4 h-4 text-[#28A745]" />
                <span>Automated Recurring Billing</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Schedule weekly, monthly, or annual invoices and collect online payments effortlessly.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Paystack</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">Stripe</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Live Pricing from Main Admin Dashboard */}
      <section id="bs-pricing" className="max-w-5xl mx-auto px-4 sm:px-8 py-12 w-full">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900">Active Subscription Plans</h2>
          <p className="text-xs text-gray-500">
            Live plans synced directly from the Main Admin Dashboard.
          </p>
        </div>

        {adminPlans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-xs text-gray-500">
            No active Billstacks subscription plans have been added in the Admin Dashboard yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
            {adminPlans.map((plan) => {
              const monthly = Math.round((plan.priceKobo || 0) / 100);
              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                      {plan.label || "SaaS Plan"}
                    </span>
                    <h3 className="text-lg font-extrabold text-gray-900">{plan.name}</h3>
                    <p className="text-2xl font-black text-gray-900 tabular-nums">
                      ₦{monthly.toLocaleString()}
                      <span className="text-xs font-medium text-gray-500"> / mo</span>
                    </p>
                    <p className="text-xs text-gray-500">{plan.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onEnterDashboard}
                    className="w-full py-2.5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    Manage in Dashboard
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Light Green CTA Banner matching the bottom of the Video ("Bill Stacks 3 Days") */}
      <section className="w-full bg-[#E8F6EC] py-14 px-4 text-center space-y-4 mt-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E7E34]">
          Bill Stacks 3 Days
        </h2>
        <p className="text-xs text-emerald-900/70">
          Start managing {activeBusiness.name} with your 3-day free trial right now.
        </p>
        <div>
          <button
            type="button"
            onClick={onEnterDashboard}
            className="inline-flex items-center justify-center w-10 h-9 rounded-md bg-[#28A745] hover:bg-emerald-700 text-white shadow-sm transition-transform hover:scale-105"
            title="Enter Dashboard"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Clean Footer matching the Video */}
      <footer id="bs-footer" className="bg-white border-t border-gray-100 py-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start justify-between gap-8 text-xs text-gray-500">
          <div className="space-y-3 max-w-xs">
            <Image
              src="/logos/billstacks-logo.png"
              alt="Billstacks"
              width={110}
              height={38}
              className="h-7 w-auto object-contain"
            />
            <p className="leading-relaxed">
              Simplifies invoices and expense tracking, helping you save time and money. Features
              that make it work the way you do.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-gray-800">Features</p>
            <ul className="space-y-1.5">
              <li>
                <button type="button" onClick={onEnterDashboard} className="hover:text-[#28A745]">
                  Invoicing &amp; Estimates
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo("bs-pricing")} className="hover:text-[#28A745]">
                  Pricing
                </button>
              </li>
              <li>
                <button type="button" onClick={onEnterDashboard} className="hover:text-[#28A745]">
                  FIRS Tax Reports
                </button>
              </li>
              <li>
                <button type="button" onClick={onEnterDashboard} className="hover:text-[#28A745]">
                  Dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-gray-100 text-center text-[11px] text-gray-400">
          © 2026 All rights reserved · Billstacks Cloud · Zino One Unified Ecosystem
        </div>
      </footer>
    </div>
  );
}
