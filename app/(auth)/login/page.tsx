"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Users,
  UserCheck,
  Sparkles,
  UserPlus,
  KeyRound,
  ArrowLeft,
  HelpCircle,
  Lock,
  Mail,
  User,
} from "lucide-react";
import {
  SECURITY_QUESTIONS,
  registerAdminAccount,
  verifyAdminLogin,
  getAdminByUsername,
  resetAdminPassword,
  verifyStaffLogin,
} from "@/lib/auth-storage";

type AuthMode = "SIGN_IN" | "SIGN_UP" | "FORGOT_PASSWORD";
type LoginRole = "ADMIN" | "STAFF" | "RECEPTION";

export default function LoginPage() {
  const router = useRouter();

  // Mode: Sign In, Sign Up (Super Admin), Forgot Password
  const [mode, setMode] = useState<AuthMode>("SIGN_IN");
  const [activeRole, setActiveRole] = useState<LoginRole>("ADMIN");

  // Sign In inputs (No hardcoded demo autofill — starts empty!)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpQuestion, setSignUpQuestion] = useState<string>(SECURITY_QUESTIONS[0]);
  const [signUpAnswer, setSignUpAnswer] = useState("");
  const [signUpPin, setSignUpPin] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot Password state
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [retrievedQuestion, setRetrievedQuestion] = useState("");
  const [securityAnswerAttempt, setSecurityAnswerAttempt] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const handleAdminSuccess = (adminName: string) => {
    setStatusMessage(`Welcome, ${adminName}! Redirecting to Admin Dashboard...`);
    document.cookie =
      "authjs.session-token=admin-active; path=/; max-age=2592000; SameSite=Lax";
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 400);
  };

  const handleStaffSuccess = (staff: any) => {
    setStatusMessage(`Staff verified! Welcome ${staff.name}. Redirecting...`);
    document.cookie =
      "zino-staff-session=staff-active; path=/; max-age=86400; SameSite=Lax";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "zino_staff_profile",
        JSON.stringify({
          email: staff.email || staff.username,
          name: staff.name,
          role: staff.role || "Operations Staff",
          branch: staff.branch || "Zino One Central Hub",
          accessLevel: "STAFF",
          signedInAt: new Date().toISOString(),
        })
      );
    }
    setTimeout(() => {
      router.push("/staff/dashboard");
      router.refresh();
    }, 350);
  };

  // Sign In Submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError("Please enter your username/email and password.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. If user chose Staff role or entered staff-like username, check Staff directory
      if (activeRole === "STAFF") {
        const staffMatch = verifyStaffLogin(cleanId, cleanPass);
        if (staffMatch) {
          handleStaffSuccess(staffMatch);
          return;
        }
        throw new Error(
          "Invalid staff username or password. Check credentials or ask Super Admin in Staff Management."
        );
      }

      // 2. If Reception role
      if (activeRole === "RECEPTION") {
        setStatusMessage("Opening Reception & Visitor Check-In Kiosk...");
        setTimeout(() => {
          router.push("/visit");
          router.refresh();
        }, 300);
        return;
      }

      // 3. Super Admin verification against local account store
      const adminMatch = verifyAdminLogin(cleanId, cleanPass);
      if (adminMatch) {
        handleAdminSuccess(adminMatch.name);
        return;
      }

      // 4. Try API auth endpoint as backup
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanId, password: cleanPass }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.ok) {
        handleAdminSuccess(data.user?.firstName || "Admin");
        return;
      }

      // 5. Also check if it's a staff member attempting login under Admin tab
      const staffMatch = verifyStaffLogin(cleanId, cleanPass);
      if (staffMatch) {
        handleStaffSuccess(staffMatch);
        return;
      }

      throw new Error(
        data?.error?.message ||
          "Invalid username/email or password. Please check your credentials or reset your password."
      );
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Submission (Super Admin Registration)
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);

    if (!signUpName.trim()) {
      setError("Please enter your full name.");
      setIsLoading(false);
      return;
    }
    if (!signUpUsername.trim()) {
      setError("Please enter an administrative username or email.");
      setIsLoading(false);
      return;
    }
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      setIsLoading(false);
      return;
    }
    if (!signUpAnswer.trim()) {
      setError("Please provide an answer to your chosen security question.");
      setIsLoading(false);
      return;
    }

    const res = registerAdminAccount({
      name: signUpName.trim(),
      username: signUpUsername.trim(),
      email: signUpEmail.trim() || signUpUsername.trim(),
      password: signUpPassword,
      role: "SUPER_ADMIN",
      securityQuestion: signUpQuestion,
      securityAnswer: signUpAnswer.trim(),
      pin: signUpPin.trim() || "1234",
    });

    if (!res.success || !res.account) {
      setError(res.error || "Unable to register admin account.");
      setIsLoading(false);
      return;
    }

    // Success! Immediately sign in and redirect to /admin
    handleAdminSuccess(res.account.name);
  };

  // Forgot Password: Step 1 Find Account
  const handleFindAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const clean = forgotIdentifier.trim();
    if (!clean) {
      setError("Please enter your username or registered email.");
      return;
    }

    const admin = getAdminByUsername(clean);
    if (!admin) {
      setError("No super admin account found with that username or email.");
      return;
    }

    setRetrievedQuestion(
      admin.securityQuestion || "What is your mother's maiden name?"
    );
    setForgotStep(2);
    setStatusMessage("Account located. Please answer your security question below.");
  };

  // Forgot Password: Step 2 Verify Answer and Set New Password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!securityAnswerAttempt.trim()) {
      setError("Please enter your security answer.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    const res = resetAdminPassword(
      forgotIdentifier,
      securityAnswerAttempt,
      newPassword
    );

    if (!res.success) {
      setError(res.error || "Incorrect security answer or PIN.");
      return;
    }

    // Reset succeeded
    setStatusMessage("Password reset successfully! You can now sign in with your new password.");
    setIdentifier(forgotIdentifier);
    setPassword("");
    setForgotStep(1);
    setMode("SIGN_IN");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F6F8FF] flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-[620px] h-[620px] rounded-full border-[64px] border-blue-500/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 w-[520px] h-[520px] rounded-full bg-indigo-400/15 blur-3xl"
      />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
            <Image
              src="/logos/zino-logo.png"
              alt="Zino One logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-sm text-[#0A1F66] tracking-tight">
            Zino One
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-gray-600">
          <Link
            href="/visit"
            className="hover:text-[#002B99] transition-colors hidden sm:inline"
          >
            Visitor Kiosk
          </Link>
          <Link
            href="/staff/login"
            className="hover:text-[#002B99] transition-colors hidden md:inline"
          >
            Staff Portal
          </Link>
          <Link
            href="/builders"
            className="hover:text-[#002B99] transition-colors hidden sm:inline"
          >
            Top Builders
          </Link>
          <Link href="/" className="hover:text-[#002B99] transition-colors">
            Public Hub
          </Link>
        </nav>
      </header>

      {/* CENTERED CARD */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_24px_70px_-15px_rgba(10,31,102,0.18)] border border-blue-100/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* LEFT HALF: Form Area (7 Cols) */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5 bg-white">
            {/* Header with Title and Mode Switcher */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002B99] tracking-tight">
                  {mode === "SIGN_IN" && "Super Admin & Staff Sign In"}
                  {mode === "SIGN_UP" && "Create Super Admin Account"}
                  {mode === "FORGOT_PASSWORD" && "Reset Password with Security Question"}
                </h1>
              </div>
              <p className="text-xs text-gray-500">
                {mode === "SIGN_IN" &&
                  "Enter your administrative or staff credentials to access the command suite."}
                {mode === "SIGN_UP" &&
                  "Register a new Super Admin account with a secure recovery question."}
                {mode === "FORGOT_PASSWORD" &&
                  "Verify your security question or PIN to reset your account password."}
              </p>
            </div>

            {/* Role Tabs for Sign In */}
            {mode === "SIGN_IN" && (
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole("ADMIN");
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeRole === "ADMIN"
                      ? "bg-[#002B99] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole("STAFF");
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeRole === "STAFF"
                      ? "bg-[#F58634] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Staff Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole("RECEPTION");
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeRole === "RECEPTION"
                      ? "bg-[#8B42F5] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Reception</span>
                </button>
              </div>
            )}

            {/* Error & Status Alerts */}
            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {statusMessage && (
              <div
                role="status"
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* ─── 1. SIGN IN FORM ─── */}
            {mode === "SIGN_IN" && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs font-bold text-gray-800 mb-1"
                  >
                    {activeRole === "ADMIN"
                      ? "Admin Username or Email"
                      : activeRole === "STAFF"
                      ? "Staff Username or Email"
                      : "Reception Access ID"}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        activeRole === "ADMIN"
                          ? "Enter admin username or email"
                          : activeRole === "STAFF"
                          ? "Enter staff username (e.g. chinedu.eze)"
                          : "reception@zinoone.local"
                      }
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#002B99] focus:ring-2 focus:ring-blue-600/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-gray-800"
                    >
                      Password<span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("FORGOT_PASSWORD");
                        setError(null);
                        setStatusMessage(null);
                        setForgotIdentifier(identifier);
                        setForgotStep(1);
                      }}
                      className="text-[11px] font-bold text-[#002B99] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-10 pl-10 pr-10 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#002B99] focus:ring-2 focus:ring-blue-600/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-900"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="inline-flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#002B99] focus:ring-[#002B99]"
                    />
                    <span>Remember Me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-full bg-[#002B99] hover:bg-[#001E6C] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
                >
                  {isLoading ? "Signing in..." : "Sign In to Command Hub"}
                </button>

                {/* Bottom Toggle: Switch to Sign Up */}
                <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                  <span>Need a new Super Admin account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("SIGN_UP");
                      setError(null);
                      setStatusMessage(null);
                    }}
                    className="font-bold text-[#002B99] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Super Admin Account</span>
                  </button>
                </div>
              </form>
            )}

            {/* ─── 2. SIGN UP FORM (SUPER ADMIN) ─── */}
            {mode === "SIGN_UP" && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Full Name<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Chief Arinze Okoye"
                    className="w-full h-9 px-3 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Super Admin Username<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpUsername}
                      onChange={(e) => setSignUpUsername(e.target.value)}
                      placeholder="e.g. superadmin"
                      className="w-full h-9 px-3 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="e.g. admin@zinoone.com"
                      className="w-full h-9 px-3 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Password<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? "text" : "password"}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full h-9 px-3 pr-8 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
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
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Confirm Password<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type={showSignUpPassword ? "text" : "password"}
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-9 px-3 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                    />
                  </div>
                </div>

                {/* Security Question Section (Mandatory on password creation) */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#002B99]">
                    <HelpCircle className="w-4 h-4 text-[#002B99]" />
                    <span>Security Question (For Password Recovery)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Select Security Question:
                    </label>
                    <select
                      value={signUpQuestion}
                      onChange={(e) => setSignUpQuestion(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-blue-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-[#002B99]"
                    >
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Your Answer:
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpAnswer}
                      onChange={(e) => setSignUpAnswer(e.target.value)}
                      placeholder="e.g. Adeleke or my graduation day"
                      className="w-full h-9 px-3 rounded-xl border border-blue-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                    />
                    <p className="text-[10px] text-gray-500 pt-0.5">
                      Case-insensitive. This answer is required if you ever need to reset your password.
                    </p>
                  </div>

                  {signUpQuestion.includes("PIN") && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        4-Digit PIN:
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={signUpPin}
                        onChange={(e) => setSignUpPin(e.target.value)}
                        placeholder="e.g. 1234"
                        className="w-full h-9 px-3 rounded-xl border border-blue-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-full bg-[#002B99] hover:bg-[#001E6C] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  {isLoading ? "Creating Super Admin..." : "Register Super Admin Account"}
                </button>

                <div className="text-center text-xs text-slate-600 pt-1">
                  <span>Already registered? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("SIGN_IN");
                      setError(null);
                      setStatusMessage(null);
                    }}
                    className="font-bold text-[#002B99] hover:underline"
                  >
                    Sign In instead
                  </button>
                </div>
              </form>
            )}

            {/* ─── 3. FORGOT PASSWORD FLOW ─── */}
            {mode === "FORGOT_PASSWORD" && (
              <div className="space-y-4">
                {forgotStep === 1 ? (
                  <form onSubmit={handleFindAccount} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Enter Super Admin Username or Email
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. admin@zinoone.com or admin"
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 rounded-full bg-[#002B99] hover:bg-[#001E6C] text-white font-bold text-xs uppercase tracking-wider shadow-md"
                    >
                      Find Account &amp; Verify Identity
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                      <p className="text-[11px] font-bold text-slate-600">Your Security Question:</p>
                      <p className="text-xs font-extrabold text-[#002B99]">
                        &quot;{retrievedQuestion}&quot;
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Security Answer or PIN<span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={securityAnswerAttempt}
                        onChange={(e) => setSecurityAnswerAttempt(e.target.value)}
                        placeholder="Enter your registered answer"
                        className="w-full h-9 px-3 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 mb-1">
                          New Password<span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full h-9 px-3 pr-8 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 mb-1">
                          Confirm New Password<span className="text-rose-500">*</span>
                        </label>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full h-9 px-3 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#002B99]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 rounded-full bg-[#002B99] hover:bg-[#001E6C] text-white font-bold text-xs uppercase tracking-wider shadow-md"
                    >
                      Update Password &amp; Continue
                    </button>
                  </form>
                )}

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("SIGN_IN");
                      setError(null);
                      setStatusMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002B99] hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT HALF: Visual Hero (5 Cols) */}
          <div className="md:col-span-5 relative min-h-[260px] md:min-h-full bg-[#0A1F66] overflow-hidden flex flex-col justify-end p-6 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=85"
              alt="Zino One Command Center"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06123B] via-[#06123B]/60 to-transparent" />

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-200">
                <Sparkles className="w-3 h-3 text-blue-300" />
                <span>Enterprise Security Matrix</span>
              </div>
              <h3 className="text-base font-extrabold leading-snug">
                One Central Control Suite for All Operations
              </h3>
              <p className="text-[11px] text-blue-100/80 leading-relaxed">
                Super Admin authentication with custom security question recovery, staff credential
                issuance, and subsidiary command.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} Zino One Unified Operations · Super Admin &amp; Staff Access
      </footer>
    </div>
  );
}
