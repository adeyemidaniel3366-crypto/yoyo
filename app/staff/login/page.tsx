"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Users,
} from "lucide-react";
import { verifyStaffLogin, getStaffCredentials } from "@/lib/auth-storage";

export default function StaffLoginPage() {
  const router = useRouter();
  // Form fields start EMPTY — no hardcoded demo autofill!
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError("Please enter your staff username/email and password.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify against Staff Management persistent credentials
      const matched = verifyStaffLogin(cleanId, cleanPass);

      if (!matched) {
        setError(
          "Invalid staff credentials. Please check your username/email and password, or contact your Super Admin in Staff Management to assign or reset your credentials."
        );
        setIsLoading(false);
        return;
      }

      // 2. Set dedicated staff session cookie & store profile for the staff portal
      document.cookie =
        "zino-staff-session=staff-active; path=/; max-age=86400; SameSite=Lax";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "zino_staff_profile",
          JSON.stringify({
            id: matched.id,
            staffCode: matched.staffCode,
            name: matched.name,
            email: matched.email || matched.username,
            role: matched.role || "Operations Staff",
            department: matched.department || "Operations",
            branch: matched.branch || "Zino One Central Hub",
            accessLevel: "STAFF",
            signedInAt: new Date().toISOString(),
          })
        );
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/staff/dashboard");
        router.refresh();
      }, 350);
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans relative">
      {/* Top Minimal Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
            <Image
              src="/logos/zino-logo.png"
              alt="Zino One logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-sm text-gray-900 block leading-tight">
              Zino One
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              Staff Operations Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            href="/login"
            className="text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Admin Login
          </Link>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Public Hub
          </Link>
        </div>
      </header>

      {/* Main Sign-In Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 p-7 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Staff Portal Sign In
            </h1>
            <p className="text-xs text-gray-600">
              Enter your assigned staff login credentials issued from Super Admin Staff Management.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Signed in successfully! Redirecting to Staff Dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="staff-identifier"
                className="block text-xs font-bold text-gray-900 mb-1.5"
              >
                Staff Username or Email<span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. chinedu.eze@zinogroup.com"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="staff-password"
                className="block text-xs font-bold text-gray-900 mb-1.5"
              >
                Staff Password<span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter assigned password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? "Verifying..." : "Sign in to Staff Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
            <span>Need credentials? </span>
            <span className="font-semibold text-gray-700">
              Logins and passwords for staff must be assigned by Super Admin in the Staff Management console.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Zino One Staff Portal · All Rights Reserved
      </footer>
    </div>
  );
}
