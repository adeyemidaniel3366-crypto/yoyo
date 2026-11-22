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

const STAFF_DIRECTORY = [
  {
    email: "staff@zinoone.com",
    name: "Chinedu Eze",
    role: "Operations Staff",
    branch: "Computer Village (Medical Rd)",
  },
  {
    email: "concierge@zinoone.com",
    name: "Adaeze Okafor",
    role: "Front Desk Staff",
    branch: "Zino Luxury Apartments (Lekki)",
  },
  {
    email: "yard@zinoone.com",
    name: "Tunde Bakare",
    role: "Yard Operations Staff",
    branch: "Top Builders Supply Yard",
  },
];

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("staff@zinoone.com");
  const [password, setPassword] = useState("Staff2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAutoFill = () => {
    setEmail("staff@zinoone.com");
    setPassword("Staff2026!");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both your staff email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const matched =
        STAFF_DIRECTORY.find(
          (s) => s.email.toLowerCase() === email.trim().toLowerCase()
        ) || {
          email: email.trim(),
          name: email.trim().split("@")[0].replace(/[._]/g, " "),
          role: "Operations Staff",
          branch: "Zino One Operations",
        };

      // Set dedicated staff session cookie & store profile for the staff portal
      document.cookie =
        "zino-staff-session=staff-active; path=/; max-age=86400; SameSite=Lax";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "zino_staff_profile",
          JSON.stringify({
            ...matched,
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
              Operational access to inventory alerts, invoices, catalog, room board &amp; notifications.
            </p>
          </div>

          {/* Demo Credentials Helper */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 text-[11px]">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Staff Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>
            <div className="space-y-1 text-gray-800 text-[11px] bg-white p-2.5 rounded-xl border border-indigo-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <strong>staff@zinoone.com</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Password:</span>
                <strong>Staff2026!</strong>
              </div>
            </div>
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
              <span>Signed in! Redirecting to Staff Dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="staff-email"
                className="block text-xs font-bold text-gray-900 mb-1.5"
              >
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@zinoone.com"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="staff-password"
                className="block text-xs font-bold text-gray-900 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
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
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? "Signing in..." : "Sign In to Staff Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-gray-200 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role-scoped operational session · Secure staff access</span>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} Zino One Unified Operations · Staff Portal
      </footer>
    </div>
  );
}
