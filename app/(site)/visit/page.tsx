"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserCheck,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Building,
  CheckCircle2,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Briefcase,
  MapPin,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { recordVisitorCheckIn } from "@/lib/platform-store";

const getSafeTime24 = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function VisitorKioskPage() {
  const [tab, setTab] = useState<"APPOINTMENT" | "RETURNING" | "NEW">("APPOINTMENT");
  const [phoneOrCode, setPhoneOrCode] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [hostEmployee, setHostEmployee] = useState("John Doe (Accounts Dept)");
  const [purpose, setPurpose] = useState("Business Meeting");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [visitTime, setVisitTime] = useState(getSafeTime24());
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [badgeNumber, setBadgeNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isServerConfirmed, setIsServerConfirmed] = useState(false);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    let passId = `VIS-${Math.floor(10000 + Math.random() * 90000)}`;
    let serverOk = false;

    try {
      if (tab === "APPOINTMENT") {
        const res = await fetch("/api/visitors/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: phoneOrCode.trim() }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.ok && data?.data) {
            passId = data.data.token || data.data.id || passId;
            serverOk = true;
          }
        }
      } else {
        const res = await fetch("/api/visitors/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: visitorName.trim() || "Visitor",
            phone: visitorPhone.trim() || phoneOrCode.trim() || "+2348000000000",
            email: visitorEmail.trim() || null,
            purpose,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.ok && data?.data) {
            passId = data.data.token || data.data.id || passId;
            serverOk = true;
          }
        }
      }
    } catch {
      // Offline kiosk mode
    }

    const finalBadge = passId.startsWith("VIS-") || passId.startsWith("PASS-")
      ? passId
      : `VIS-${passId.slice(0, 6).toUpperCase()}`;

    const recorded = recordVisitorCheckIn({
      badgeNo: finalBadge,
      name:
        tab === "NEW"
          ? visitorName.trim() || "Walk-In Visitor"
          : visitorName.trim() || `Visitor (${phoneOrCode.trim()})`,
      phone: tab === "NEW" ? visitorPhone.trim() : phoneOrCode.trim(),
      email: visitorEmail.trim() || undefined,
      hostEmployee,
      purpose: tab === "APPOINTMENT" ? "Scheduled Appointment" : purpose,
      visitDate,
      visitTime,
      appointmentDate,
      appointmentTime,
    });

    setBadgeNumber(recorded.badgeNo);
    setIsServerConfirmed(serverOk);
    setIsCheckedIn(true);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setIsCheckedIn(false);
    setPhoneOrCode("");
    setVisitorName("");
    setVisitorPhone("");
    setVisitorEmail("");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Clean Minimalist Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-2 sm:py-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/logos/visitor-management.png"
                alt="Zino Security Kiosk"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Zino Corporate Reception &amp; Appointments
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Executive Front Desk &amp; Digital Visitor Pass Kiosk
              </p>
            </div>
          </Link>

          {/* Navigation Mode Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab("APPOINTMENT");
                setIsCheckedIn(false);
              }}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                tab === "APPOINTMENT"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Have Appointment
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("RETURNING");
                setIsCheckedIn(false);
              }}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                tab === "RETURNING"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Been Here Before
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("NEW");
                setIsCheckedIn(false);
              }}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                tab === "NEW"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              New Visitor
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Editorial & Form Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Minimalist Business Photography & Corporate Atmosphere (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Headquarters Concierge · Lagos</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Seamless Executive Appointments &amp; Visitor Access.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Welcome to Zino One Group Headquarters. Check in with your appointment invite, verify your returning profile, or register as a new guest to receive an instant digital security pass.
              </p>
            </div>

            {/* Minimalist Single Business Image */}
            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80"
                alt="Minimalist Corporate Executive Concierge"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-300 font-bold block mb-1">
                  Executive Concierge &amp; Front Desk
                </span>
                <p className="text-base font-extrabold">Zino One Headquarters · Victoria Island &amp; Lekki</p>
                <p className="text-xs text-slate-300 mt-0.5">Automated guest badges, verified appointments, and live security sync.</p>
              </div>
            </div>

            {/* Info Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Instant Pass</span>
                <span className="text-[11px] text-slate-500">Digital badge ID</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="font-bold text-slate-900 block">Live Sync</span>
                <span className="text-[11px] text-slate-500">Staff &amp; Admin desk</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="font-bold text-slate-900 block">Verified Access</span>
                <span className="text-[11px] text-slate-500">Audit log timestamp</span>
              </div>
            </div>
          </div>

          {/* Right Column: Check-In / New Visitor Form Card (6 cols) */}
          <div className="lg:col-span-6 flex items-center">
            {!isCheckedIn ? (
              <div className="w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <SourceBadge source={ServiceSlug.VISITORS} size="sm" className="mb-2" />
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {tab === "APPOINTMENT"
                        ? "Check-In with Appointment"
                        : tab === "RETURNING"
                        ? "Returning Visitor Lookup"
                        : "Register as New Visitor"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tab === "APPOINTMENT"
                        ? "Enter your pre-registration invite code or phone number."
                        : tab === "RETURNING"
                        ? "Enter your registered mobile number to pull up your visitor record."
                        : "Fill in your visitor details, time of visit, and appointment time."}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
                  {tab === "APPOINTMENT" && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Appointment Code or Phone Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. PASS-7721 or +234 80..."
                          value={phoneOrCode}
                          onChange={(e) => setPhoneOrCode(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Date of Visit *
                            </label>
                            <input
                              type="date"
                              required
                              value={visitDate}
                              onChange={(e) => setVisitDate(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Time of Visit *
                            </label>
                            <input
                              type="time"
                              step="60"
                              required
                              value={visitTime}
                              onChange={(e) => setVisitTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold"
                            />
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {["09:00", "10:30", "12:00", "14:00", "16:00"].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setVisitTime(t)}
                                  className="px-2 py-0.5 rounded text-[10px] bg-slate-200/80 hover:bg-blue-600 hover:text-white font-mono font-bold transition-colors cursor-pointer"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                          <div>
                            <label className="block font-bold text-blue-900 mb-1">
                              Date of Appointment *
                            </label>
                            <input
                              type="date"
                              required
                              value={appointmentDate}
                              onChange={(e) => setAppointmentDate(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-blue-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-blue-900 mb-1">
                              Time of Appointment *
                            </label>
                            <input
                              type="time"
                              step="60"
                              required
                              value={appointmentTime}
                              onChange={(e) => setAppointmentTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-blue-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold"
                            />
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {["09:00", "10:00", "11:30", "13:00", "15:00"].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setAppointmentTime(t)}
                                  className="px-2 py-0.5 rounded text-[10px] bg-blue-100 hover:bg-blue-600 hover:text-white font-mono font-bold text-blue-800 transition-colors cursor-pointer"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {tab === "RETURNING" && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Registered Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="080 0000 0000"
                          value={phoneOrCode}
                          onChange={(e) => setPhoneOrCode(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Date of Visit *
                            </label>
                            <input
                              type="date"
                              required
                              value={visitDate}
                              onChange={(e) => setVisitDate(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Time of Visit *
                            </label>
                            <input
                              type="time"
                              step="60"
                              required
                              value={visitTime}
                              onChange={(e) => setVisitTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold"
                            />
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {["09:00", "10:30", "12:00", "14:00", "16:00"].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setVisitTime(t)}
                                  className="px-2 py-0.5 rounded text-[10px] bg-slate-200/80 hover:bg-blue-600 hover:text-white font-mono font-bold transition-colors cursor-pointer"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                          <div>
                            <label className="block font-bold text-blue-900 mb-1">
                              Date of Appointment *
                            </label>
                            <input
                              type="date"
                              required
                              value={appointmentDate}
                              onChange={(e) => setAppointmentDate(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-blue-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-blue-900 mb-1">
                              Time of Appointment *
                            </label>
                            <input
                              type="time"
                              step="60"
                              required
                              value={appointmentTime}
                              onChange={(e) => setAppointmentTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-blue-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold"
                            />
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {["09:00", "10:00", "11:30", "13:00", "15:00"].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setAppointmentTime(t)}
                                  className="px-2 py-0.5 rounded text-[10px] bg-blue-100 hover:bg-blue-600 hover:text-white font-mono font-bold text-blue-800 transition-colors cursor-pointer"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {tab === "NEW" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Engr. Tunde Bakare"
                            value={visitorName}
                            onChange={(e) => setVisitorName(e.target.value)}
                            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+234 80..."
                            value={visitorPhone}
                            onChange={(e) => setVisitorPhone(e.target.value)}
                            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            placeholder="guest@company.com"
                            value={visitorEmail}
                            onChange={(e) => setVisitorEmail(e.target.value)}
                            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Host Employee / Office *
                          </label>
                          <select
                            value={hostEmployee}
                            onChange={(e) => setHostEmployee(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                          >
                            <option value="John Doe (Accounts Dept)">John Doe (Accounts Dept)</option>
                            <option value="Chioma Okoye (Operations)">Chioma Okoye (Operations)</option>
                            <option value="Babatunde Adeleke (IT Support)">Babatunde Adeleke (IT Support)</option>
                            <option value="Mr. Femi Adeleke (Finance)">Mr. Femi Adeleke (Finance)</option>
                            <option value="Management Office">Management Office</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Date of Visit *
                            </label>
                            <input
                              type="date"
                              required
                              value={visitDate}
                              onChange={(e) => setVisitDate(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Time of Visit *
                            </label>
                            <input
                              type="time"
                              step="60"
                              required
                              value={visitTime}
                              onChange={(e) => setVisitTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold"
                            />
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {["09:00", "10:30", "12:00", "14:00", "16:00"].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setVisitTime(t)}
                                  className="px-2 py-0.5 rounded text-[10px] bg-slate-200/80 hover:bg-blue-600 hover:text-white font-mono font-bold transition-colors cursor-pointer"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                          <div>
                            <label className="block font-bold text-blue-900 mb-1">
                              Date of Appointment *
                            </label>
                            <input
                              type="date"
                              required
                              value={appointmentDate}
                              onChange={(e) => setAppointmentDate(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-blue-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-blue-900 mb-1">
                              Time of Appointment *
                            </label>
                            <input
                              type="time"
                              step="60"
                              required
                              value={appointmentTime}
                              onChange={(e) => setAppointmentTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-blue-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold"
                            />
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {["09:00", "10:00", "11:30", "13:00", "15:00"].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setAppointmentTime(t)}
                                  className="px-2 py-0.5 rounded text-[10px] bg-blue-100 hover:bg-blue-600 hover:text-white font-mono font-bold text-blue-800 transition-colors cursor-pointer"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Purpose of Visit *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Executive consultation or supply delivery meeting"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? "Issuing Pass..." : "Confirm & Issue Visitor Pass"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              /* Success Screen with Visitor Pass */
              <div className="w-full bg-white text-slate-900 rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900">Check-In Confirmed!</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Your visitor entry has been synced to the Staff &amp; Admin Visitor Management dashboards.
                  </p>
                </div>

                {/* Pass badge ticket */}
                <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-blue-600">Zino Corporate Visitor Pass</span>
                    <span className="font-mono font-bold text-slate-900">{badgeNumber}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div>
                      <p className="text-slate-500">Visitor:</p>
                      <p className="font-bold text-slate-900">
                        {visitorName || phoneOrCode || "Walk-In Guest"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Host Employee:</p>
                      <p className="font-bold text-slate-900">{hostEmployee}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Date &amp; Time of Visit:</p>
                      <p className="font-bold text-slate-900">
                        {visitDate} · {visitTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Scheduled Appointment:</p>
                      <p className="font-bold text-blue-700">
                        {appointmentDate} · {appointmentTime}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Done / Return to Kiosk
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Kiosk Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Zino One Enterprise Visitor &amp; Appointment Management System</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-blue-600 font-semibold">
              Staff &amp; Admin Login
            </Link>
            <Link href="/" className="hover:text-blue-600 font-semibold">
              Main Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
