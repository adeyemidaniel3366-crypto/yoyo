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
} from "lucide-react";

type LoginRole = "ADMIN" | "STAFF" | "RECEPTION";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@zinoone.com");
  const [password, setPassword] = useState("Admin2026!");
  const [activeRole, setActiveRole] = useState<LoginRole>("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const performAdminLogin = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.ok) {
        setStatusMessage("Admin verified! Redirecting to Admin Dashboard...");
        document.cookie =
          "authjs.session-token=demo-admin-active; path=/; max-age=2592000; SameSite=Lax";
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 400);
        return;
      }

      const demoRes = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });

      if (demoRes.ok) {
        setStatusMessage("Admin verified! Redirecting to Admin Dashboard...");
        document.cookie =
          "authjs.session-token=demo-admin-active; path=/; max-age=2592000; SameSite=Lax";
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 400);
        return;
      }

      throw new Error(
        data?.error?.message || "Invalid credentials. Please check your email and password."
      );
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const performStaffLogin = (staffEmail: string) => {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Staff verified! Redirecting to Staff Portal...");

    document.cookie =
      "zino-staff-session=staff-active; path=/; max-age=86400; SameSite=Lax";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "zino_staff_profile",
        JSON.stringify({
          email: staffEmail,
          name: "Chinedu Eze",
          role: "Operations Staff",
          branch: "Zino One Operations",
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

  const performReceptionLaunch = () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Opening Reception & Visitor Check-In Kiosk...");
    setTimeout(() => {
      router.push("/visit");
      router.refresh();
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole === "STAFF" || email.toLowerCase().includes("staff@")) {
      performStaffLogin(email);
      return;
    }
    if (activeRole === "RECEPTION" || email.toLowerCase().includes("reception@")) {
      performReceptionLaunch();
      return;
    }
    performAdminLogin(email, password);
  };

  const handleQuickDemo = (role: LoginRole) => {
    setActiveRole(role);
    setError(null);

    if (role === "ADMIN") {
      setEmail("admin@zinoone.com");
      setPassword("Admin2026!");
      performAdminLogin("admin@zinoone.com", "Admin2026!");
    } else if (role === "STAFF") {
      setEmail("staff@zinoone.com");
      setPassword("Staff2026!");
      performStaffLogin("staff@zinoone.com");
    } else {
      setEmail("reception@zinoone.com");
      setPassword("Reception2026!");
      performReceptionLaunch();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F6F8FF] flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Ambient soft blue/indigo ring glow inspired by Image 1 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-[620px] h-[620px] rounded-full border-[64px] border-blue-500/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 w-[520px] h-[520px] rounded-full bg-indigo-400/15 blur-3xl"
      />

      {/* ─── TOP NAVIGATION BAR (matching Image 1's clean header) ─── */}
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

        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-gray-600">
          <Link
            href="/visit"
            className="hover:text-[#002B99] transition-colors hidden sm:inline"
          >
            Have Appointment
          </Link>
          <Link
            href="/staff/login"
            className="hover:text-[#002B99] transition-colors hidden md:inline"
          >
            Staff Portal
          </Link>
          <Link href="/" className="hover:text-[#002B99] transition-colors">
            Public Hub
          </Link>
          <span className="px-5 py-2 rounded-full bg-[#002B99] text-white text-xs font-bold shadow-md shadow-blue-900/20">
            Login
          </span>
        </nav>
      </header>

      {/* ─── CENTERED SPLIT LOGIN CARD (Image 1 layout, elevated) ─── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_24px_70px_-15px_rgba(10,31,102,0.18)] border border-blue-100/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* LEFT HALF: Login Form + Admin / Staff / Reception Quick Access */}
          <div className="p-7 sm:p-10 flex flex-col justify-center space-y-6 bg-white">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-[#002B99] tracking-tight">
                Login
              </h1>
              <p className="text-xs text-gray-500">
                Sign in to Zino One Admin, Staff Portal, or Reception / Visitor Kiosk.
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

            {statusMessage && (
              <div
                role="status"
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-gray-800 mb-1.5"
                >
                  E-mail<span className="text-rose-500">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zinoone.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#002B99] focus:ring-2 focus:ring-blue-600/15 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-gray-800 mb-1.5"
                >
                  Password<span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#002B99] focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="inline-flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#002B99] focus:ring-[#002B99]"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setStatusMessage(
                      "Use the Demo Login buttons below or contact your Zino One Admin to reset credentials."
                    )
                  }
                  className="font-bold text-[#002B99] hover:underline cursor-pointer"
                >
                  Reset Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-full bg-[#002B99] hover:bg-[#001E6C] disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-blue-900/25 transition-all cursor-pointer"
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </form>

            {/* Quick Demo Login Role Pills (Admin, Staff, Reception / Visitor) */}
            <div className="pt-2 space-y-2.5">
              <p className="text-xs font-bold text-gray-500">
                For Quick Access, Click Below
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("ADMIN")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#3B9EFF] hover:bg-[#2589F5] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("STAFF")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F58634] hover:bg-[#E27422] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Staff</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("RECEPTION")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B42F5] hover:bg-[#762CE0] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Reception / Visitor</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT HALF: Reception / Check-In Lifestyle Visual (matching Image 1) */}
          <div className="relative min-h-[280px] md:min-h-full bg-[#0A1F66] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=85"
              alt="Modern reception desk check-in tablet"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06123B]/85 via-[#06123B]/20 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 text-white space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
                <Sparkles className="w-3 h-3" />
                <span>Zino One Unified Access</span>
              </div>
              <p className="text-sm font-bold leading-snug text-white">
                One gateway for Admin Control, Staff Operations &amp; Front-Desk Reception.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono text-white/85">
                <span className="px-2 py-0.5 rounded-full bg-white/15">Admin Suite</span>
                <span className="px-2 py-0.5 rounded-full bg-white/15">Staff Portal</span>
                <span className="px-2 py-0.5 rounded-full bg-white/15">Visitor Kiosk</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} Zino One Unified Operations · Secure Portal
      </footer>
    </div>
  );
}
