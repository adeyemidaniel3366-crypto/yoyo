"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserCheck,
  Calendar,
  Phone,
  Mail,
  User,
  Building,
  CheckCircle2,
  ArrowRight,
  QrCode,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { recordPlatformTransaction } from "@/lib/platform-store";

export default function VisitorKioskPage() {
  const [tab, setTab] = useState<"APPOINTMENT" | "RETURNING" | "NEW">("APPOINTMENT");
  const [phoneOrCode, setPhoneOrCode] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [hostEmployee, setHostEmployee] = useState("John Doe (Accounts Dept)");
  const [purpose, setPurpose] = useState("Business Meeting");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [badgeNumber, setBadgeNumber] = useState("");

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const badge = `PASS-${Math.floor(1000 + Math.random() * 9000)}`;
    recordPlatformTransaction({
      source: ServiceSlug.VISITORS,
      activityType: "VISIT",
      activitySummary: `Visitor Kiosk Check-In (${purpose} with ${hostEmployee})`,
      invoiceNo: badge,
      customer: visitorName.trim() || phoneOrCode.trim() || "Walk-In Visitor",
      amountKobo: 0,
      location: "HQ Reception Kiosk",
      status: "CHECKED_IN",
      actor: "Front Desk Kiosk",
    });
    setBadgeNumber(badge);
    setIsCheckedIn(true);
  };

  const handleReset = () => {
    setIsCheckedIn(false);
    setPhoneOrCode("");
    setVisitorName("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Kiosk Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden group-hover:scale-105 transition-transform">
            <Image
              src="/logos/zino-logo.png"
              alt="Zino Security Kiosk"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white leading-tight">Zino Security Kiosk</h1>
            <p className="text-[11px] text-slate-400 font-medium">Head Office Front Desk</p>
          </div>
        </Link>

        {/* Top Entry Points matching Screenshot media_1795026254021_4d0a38d1.jpg */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab("APPOINTMENT"); setIsCheckedIn(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === "APPOINTMENT" ? "bg-visitors text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Have Appointment
          </button>
          <button
            type="button"
            onClick={() => { setTab("RETURNING"); setIsCheckedIn(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === "RETURNING" ? "bg-visitors text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Been here Before
          </button>
          <button
            type="button"
            onClick={() => { setTab("NEW"); setIsCheckedIn(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === "NEW" ? "bg-visitors text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            New Visitor
          </button>
        </div>
      </header>

      {/* Main Kiosk Content */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        {!isCheckedIn ? (
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div>
              <SourceBadge source={ServiceSlug.VISITORS} size="sm" className="mb-2" />
              <h2 className="text-xl font-bold text-white">
                {tab === "APPOINTMENT"
                  ? "Check-In with Appointment"
                  : tab === "RETURNING"
                  ? "Returning Visitor Lookup"
                  : "Register as New Visitor"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {tab === "APPOINTMENT"
                  ? "Enter your pre-registration invite code or mobile number."
                  : tab === "RETURNING"
                  ? "Enter your phone number to pull up your profile."
                  : "Please provide your details to issue a visitor entry pass."}
              </p>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
              {tab === "APPOINTMENT" && (
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Appointment Code or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PR-802 or 080..."
                    value={phoneOrCode}
                    onChange={(e) => setPhoneOrCode(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-visitors focus:ring-1 focus:ring-visitors text-sm"
                  />
                </div>
              )}

              {tab === "RETURNING" && (
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="080 0000 0000"
                    value={phoneOrCode}
                    onChange={(e) => setPhoneOrCode(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-visitors focus:ring-1 focus:ring-visitors text-sm"
                  />
                </div>
              )}

              {tab === "NEW" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engr. Tunde Bakare"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-visitors"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="080..."
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-visitors"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Host Employee to Visit
                    </label>
                    <select
                      value={hostEmployee}
                      onChange={(e) => setHostEmployee(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-600 bg-slate-900 text-white focus:outline-none focus:border-visitors"
                    >
                      <option value="John Doe (Accounts Dept)">John Doe (Accounts Dept)</option>
                      <option value="Chioma Okoye (Operations)">Chioma Okoye (Operations)</option>
                      <option value="Babatunde Adeleke (IT Support)">Babatunde Adeleke (IT Support)</option>
                      <option value="Management Office">Management Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Purpose of Visit
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Construction supply delivery meeting"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-visitors"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-visitors hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                <span>Confirm & Issue Visitor Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Success Screen with Visitor Pass */
          <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Check-In Successful!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your entry has been recorded in the platform audit log.
              </p>
            </div>

            {/* Pass badge ticket */}
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                <span className="font-bold text-visitors">Zino Visitor Pass</span>
                <span className="font-mono font-bold text-slate-700">{badgeNumber}</span>
              </div>
              <div className="text-left text-xs space-y-1">
                <p className="text-slate-500">Host Employee:</p>
                <p className="font-bold text-slate-800">{hostEmployee}</p>
                <p className="text-slate-500 pt-1">Time of Check-In:</p>
                <p className="font-bold text-slate-800">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              Done / Return to Start
            </button>
          </div>
        )}
      </main>

      {/* Kiosk Footer */}
      <footer className="text-center text-xs text-slate-500">
        <p>© 2026 Zino One Enterprise Visitor Management System</p>
      </footer>
    </div>
  );
}
