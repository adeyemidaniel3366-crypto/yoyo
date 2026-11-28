"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Key,
  Search,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  X,
  Briefcase,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import {
  saveStaffCredential,
  getStaffCredentials,
  updateStaffLogin,
  StaffCredential,
} from "@/lib/auth-storage";

export interface StaffMember {
  id: string;
  staffCode: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  subsidiary: ServiceSlug | "ALL";
  branch: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "SHIFT";
  status: "ACTIVE" | "ON_LEAVE" | "OFF_DUTY" | "SUSPENDED";
  clockInToday: string | null;
  accessCardId: string;
  pinActive: boolean;
  joinedDate: string;
}

const SEED_STAFF: StaffMember[] = [];

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(SEED_STAFF);

  React.useEffect(() => {
    const creds = getStaffCredentials();
    if (creds.length > 0) {
      setStaffList(
        creds.map((c) => ({
          id: c.id,
          staffCode: c.staffCode,
          name: c.name,
          email: c.email,
          phone: "",
          role: c.role,
          department: c.department,
          subsidiary: c.subsidiary || "ALL",
          branch: c.branch,
          employmentType: "FULL_TIME",
          status: c.status,
          clockInToday: null,
          accessCardId: `CRD-${c.staffCode.slice(-4)}`,
          pinActive: Boolean(c.pin),
          joinedDate: c.createdAt ? c.createdAt.slice(0, 10) : "",
        }))
      );
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isKeycardModalOpen, setIsKeycardModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedStaffForKeycard, setSelectedStaffForKeycard] = useState<StaffMember | null>(null);
  const [selectedStaffForLogin, setSelectedStaffForLogin] = useState<StaffMember | null>(null);

  // Edit login credentials modal state
  const [editLoginUsername, setEditLoginUsername] = useState("");
  const [editLoginPassword, setEditLoginPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [copiedLogin, setCopiedLogin] = useState(false);

  // New staff form state
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "Executive & Operations",
    subsidiary: "ALL" as ServiceSlug | "ALL",
    branch: "Zino One Central HQ",
    employmentType: "FULL_TIME" as const,
    pin: "1234",
    loginUsername: "",
    loginPassword: "",
    joinedDate: new Date().toISOString().slice(0, 10),
  });

  const [editLoginSubsidiary, setEditLoginSubsidiary] = useState<ServiceSlug | "ALL">("ALL");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Manage Login Modal
  const handleOpenLoginModal = (staff: StaffMember) => {
    setSelectedStaffForLogin(staff);
    // Find if already saved in credentials
    const allCreds = getStaffCredentials();
    const existing = allCreds.find((c) => c.id === staff.id || c.email.toLowerCase() === staff.email.toLowerCase());
    setEditLoginUsername(existing?.username || staff.email);
    setEditLoginPassword(existing?.password || "Staff2026!");
    setEditLoginSubsidiary(existing?.subsidiary || staff.subsidiary || "ALL");
    setShowEditPassword(false);
    setCopiedLogin(false);
    setIsLoginModalOpen(true);
  };

  const handleSaveStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForLogin) return;
    if (!editLoginUsername.trim() || !editLoginPassword.trim()) {
      showToast("Username and password cannot be empty.");
      return;
    }

    saveStaffCredential({
      id: selectedStaffForLogin.id,
      staffCode: selectedStaffForLogin.staffCode,
      name: selectedStaffForLogin.name,
      username: editLoginUsername.trim(),
      email: selectedStaffForLogin.email,
      password: editLoginPassword.trim(),
      role: selectedStaffForLogin.role,
      department: selectedStaffForLogin.department,
      subsidiary: editLoginSubsidiary,
      branch: selectedStaffForLogin.branch,
      pin: "1234",
      status: selectedStaffForLogin.status,
      createdAt: new Date().toISOString(),
    });

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaffForLogin.id ? { ...s, subsidiary: editLoginSubsidiary } : s
      )
    );

    setIsLoginModalOpen(false);
    const scopeLabel =
      editLoginSubsidiary === "ALL"
        ? "All Companies"
        : SERVICE_CONFIG[editLoginSubsidiary]?.name || editLoginSubsidiary;
    showToast(`Portal credentials & ${scopeLabel} access updated for ${selectedStaffForLogin.name}!`);
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.staffCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.branch.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubsidiary =
        selectedSubsidiary === "ALL" || s.subsidiary === selectedSubsidiary;

      const matchesDepartment =
        selectedDepartment === "ALL" || s.department === selectedDepartment;

      const matchesStatus =
        selectedStatus === "ALL" || s.status === selectedStatus;

      return matchesSearch && matchesSubsidiary && matchesDepartment && matchesStatus;
    });
  }, [staffList, searchQuery, selectedSubsidiary, selectedDepartment, selectedStatus]);

  // Dynamic Departments
  const departments = useMemo(() => {
    const deps = new Set<string>();
    staffList.forEach((s) => deps.add(s.department));
    return Array.from(deps);
  }, [staffList]);

  // Metrics
  const metrics = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => s.status === "ACTIVE").length;
    const clockedInToday = staffList.filter((s) => Boolean(s.clockInToday)).length;
    const keycardsActive = staffList.filter((s) => s.pinActive).length;
    const onLeave = staffList.filter((s) => s.status === "ON_LEAVE").length;

    return { total, active, clockedInToday, keycardsActive, onLeave };
  }, [staffList]);

  // Handle Add Staff
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim()) return;

    const nextNumber = staffList.length + 1001;
    const created: StaffMember = {
      id: `stf_${Date.now()}`,
      staffCode: `ZNO-${nextNumber}`,
      name: newStaff.name.trim(),
      email: newStaff.email.trim() || `${newStaff.name.toLowerCase().replace(/\s+/g, ".")}@zinogroup.com`,
      phone: newStaff.phone.trim() || "+234 800 000 0000",
      role: newStaff.role.trim() || "Operations Staff",
      department: newStaff.department,
      subsidiary: newStaff.subsidiary,
      branch: newStaff.branch,
      employmentType: newStaff.employmentType,
      status: "ACTIVE",
      clockInToday: null,
      accessCardId: `CRD-${Math.floor(1000 + Math.random() * 9000)}`,
      pinActive: Boolean(newStaff.pin.trim()),
      joinedDate: newStaff.joinedDate || new Date().toISOString().slice(0, 10),
    };

    const assignedLogin =
      newStaff.loginUsername.trim() ||
      newStaff.email.trim() ||
      `${newStaff.name.toLowerCase().replace(/\s+/g, ".")}@zinogroup.com`;
    const assignedPassword = newStaff.loginPassword.trim() || "Staff2026!";

    // Save staff login credentials into persistent auth storage for /staff/login
    saveStaffCredential({
      id: created.id,
      staffCode: created.staffCode,
      name: created.name,
      username: assignedLogin,
      email: created.email,
      password: assignedPassword,
      role: created.role,
      department: created.department,
      subsidiary: created.subsidiary,
      branch: created.branch,
      pin: newStaff.pin.trim() || "1234",
      status: created.status,
      createdAt: new Date().toISOString(),
    });

    setStaffList([created, ...staffList]);
    setIsAddModalOpen(false);
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "Executive & Operations",
      subsidiary: "ALL",
      branch: "Zino One Central HQ",
      employmentType: "FULL_TIME",
      pin: "1234",
      loginUsername: "",
      loginPassword: "",
      joinedDate: new Date().toISOString().slice(0, 10),
    });
    showToast(
      `Staff member ${created.name} (${created.staffCode}) added! Login created: "${assignedLogin}" / Password: "${assignedPassword}"`
    );
  };

  // Delete Staff Member
  const handleDeleteStaff = (staff: StaffMember) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
    showToast(`Removed staff member ${staff.name} (${staff.staffCode}) and revoked access.`);
  };

  // Delete / Revoke Keycard & PIN
  const handleRevokeKeycard = (staff: StaffMember) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staff.id ? { ...s, accessCardId: "NONE", pinActive: false } : s
      )
    );
    setIsKeycardModalOpen(false);
    showToast(`Deleted Keycard & PIN for ${staff.name}.`);
  };

  // Handle Update Keycard
  const handleUpdateKeycard = (staffMember: StaffMember) => {
    setSelectedStaffForKeycard(staffMember);
    setIsKeycardModalOpen(true);
  };

  const handleSaveKeycardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForKeycard) return;

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaffForKeycard.id
          ? {
              ...s,
              accessCardId: selectedStaffForKeycard.accessCardId,
              pinActive: selectedStaffForKeycard.pinActive,
            }
          : s
      )
    );
    setIsKeycardModalOpen(false);
    showToast(
      `Access Badge ${selectedStaffForKeycard.accessCardId} updated for ${selectedStaffForKeycard.name}`
    );
  };

  // Toggle Staff Status
  const handleToggleStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === "ACTIVE" ? "ON_LEAVE" : "ACTIVE";
        showToast(`${s.name} status updated to ${nextStatus.replace("_", " ")}`);
        return { ...s, status: nextStatus };
      })
    );
  };

  // Export Roster (CSV)
  const handleExportCSV = () => {
    const headers = [
      "Staff Code",
      "Full Name",
      "Email",
      "Phone",
      "Role",
      "Department",
      "Subsidiary",
      "Branch Location",
      "Employment Type",
      "Status",
      "Access Card ID",
      "Clock-In Today",
    ];

    const rows = filteredStaff.map((s) => [
      `"${s.staffCode}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.role}"`,
      `"${s.department}"`,
      `"${s.subsidiary === "ALL" ? "All Companies (Full Access)" : SERVICE_CONFIG[s.subsidiary]?.name || s.subsidiary}"`,
      `"${s.branch}"`,
      `"${s.employmentType}"`,
      `"${s.status}"`,
      `"${s.accessCardId}"`,
      `"${s.clockInToday || "Not Clocked In"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Staff roster exported to CSV successfully.");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-semibold"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-700 font-bold">Staff Management</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Unified Staff Directory &amp; HR Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              All 6 Businesses
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Manage company personnel, branch location assignments, biometric clock-in status, and terminal POS security credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>
          <Link
            href="/admin/users/staff"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs shadow-2xs transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span>Keycards &amp; PINs</span>
          </Link>
          <Link
            href="/admin/visitors/attendance"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs shadow-2xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clock-In Log</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Roster Personnel
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics.total}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Across 6 subsidiaries</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Clocked-In Today
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {metrics.clockedInToday}
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Live on branch premises
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Security Keycards Active
            </p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">
              {metrics.keycardsActive}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">POS &amp; Biometric PIN verified</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              On Approved Leave
            </p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{metrics.onLeave}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Scheduled shift relief</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff member by name, code, role, email, or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Subsidiary Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSubsidiary}
              onChange={(e) => setSelectedSubsidiary(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Subsidiaries</option>
              <option value={ServiceSlug.SPARK}>Zino Spark (POS)</option>
              <option value={ServiceSlug.APARTMENTS}>Zino Apartments</option>
              <option value={ServiceSlug.BUILDERS}>Top Builders</option>
              <option value={ServiceSlug.GALAXY}>Device Galaxy</option>
              <option value={ServiceSlug.BILLSTACKS}>Billstacks</option>
              <option value={ServiceSlug.VISITORS}>Visitor Management</option>
            </select>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {(searchQuery ||
              selectedSubsidiary !== "ALL" ||
              selectedDepartment !== "ALL" ||
              selectedStatus !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSubsidiary("ALL");
                  setSelectedDepartment("ALL");
                  setSelectedStatus("ALL");
                }}
                className="h-9 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-extrabold text-gray-900">
              Staff Personnel List ({filteredStaff.length})
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            Showing records across all synchronized databases
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-700 font-bold">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Subsidiary &amp; Role</th>
                <th className="py-3 px-4">Assigned Location</th>
                <th className="py-3 px-4">Security Keycard</th>
                <th className="py-3 px-4 text-center">Clock-In Today</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No staff members match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Staff Member Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                          {staff.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{staff.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="font-mono text-indigo-600 font-semibold">
                              {staff.staffCode}
                            </span>
                            <span>•</span>
                            <span className="truncate">{staff.email}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{staff.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Subsidiary & Role */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {staff.subsidiary === "ALL" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                            <Shield className="w-3 h-3" />
                            All Companies
                          </span>
                        ) : (
                          <SourceBadge source={staff.subsidiary} size="sm" />
                        )}
                        <p className="font-semibold text-gray-900 text-xs">{staff.role}</p>
                        <p className="text-[11px] text-gray-500">{staff.department}</p>
                      </div>
                    </td>

                    {/* Assigned Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-1.5 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {staff.branch}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                            {staff.employmentType.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Security Keycard & PIN */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                          <Key className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{staff.accessCardId}</span>
                        </div>
                        <span
                          className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-sans",
                            staff.pinActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          )}
                        >
                          {staff.pinActive ? "PIN ACTIVE" : "PIN NOT SET"}
                        </span>
                      </div>
                    </td>

                    {/* Today's Clock-In */}
                    <td className="py-3.5 px-4 text-center">
                      {staff.clockInToday ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono font-bold text-gray-900 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {staff.clockInToday}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            Shift Active
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Not Clocked In</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold inline-block",
                          staff.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : staff.status === "ON_LEAVE"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        )}
                      >
                        {staff.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenLoginModal(staff)}
                          className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-600 text-[11px] font-bold text-indigo-700 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Manage Login Username & Password for Staff Portal"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Login &amp; Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateKeycard(staff)}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-700 transition-colors"
                          title="Manage Keycard & POS PIN"
                        >
                          Keycard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(staff.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors",
                            staff.status === "ACTIVE"
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          )}
                        >
                          {staff.status === "ACTIVE" ? "Set Leave" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(staff)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors"
                          title="Delete Staff & Keycard"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL 1: Add New Staff Member ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-gray-900">
                  Add New Staff Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Lawal"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. b.lawal@zinogroup.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 803 123 4567"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Business Subsidiary *
                  </label>
                  <select
                    value={newStaff.subsidiary}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        subsidiary: e.target.value as ServiceSlug | "ALL",
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="ALL">All Companies (Full Platform Access)</option>
                    <option value={ServiceSlug.SPARK}>Zino Spark (POS Retail)</option>
                    <option value={ServiceSlug.APARTMENTS}>Zino Apartments (Hospitality)</option>
                    <option value={ServiceSlug.BUILDERS}>Top Builders (Materials)</option>
                    <option value={ServiceSlug.GALAXY}>Device Galaxy (E-Commerce)</option>
                    <option value={ServiceSlug.BILLSTACKS}>Billstacks (Accounting)</option>
                    <option value={ServiceSlug.VISITORS}>Visitor Management</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Retail Sales or Concierge"
                    value={newStaff.department}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, department: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior POS Cashier"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Work Location / Branch *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Village (Medical Rd)"
                    value={newStaff.branch}
                    onChange={(e) => setNewStaff({ ...newStaff, branch: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={newStaff.employmentType}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        employmentType: e.target.value as any,
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="SHIFT">Shift Based</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Initial Terminal PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={newStaff.pin}
                    onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-mono tracking-widest focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Joined Date
                  </label>
                  <input
                    type="date"
                    value={newStaff.joinedDate}
                    onChange={(e) => setNewStaff({ ...newStaff, joinedDate: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Staff Portal Login Credentials Section */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>Staff Portal Login &amp; Password Assignment</span>
                </div>
                <p className="text-[11px] text-indigo-800/80 leading-tight">
                  Super Admin issues these credentials directly to the staff member to log in at /staff/login.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-800 mb-1">
                      Portal Login Username or Email
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. b.lawal@zinogroup.com or blawal"
                      value={newStaff.loginUsername}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, loginUsername: e.target.value })
                      }
                      className="w-full h-8 px-2.5 rounded-lg border border-indigo-200 bg-white text-gray-900 focus:outline-none focus:border-indigo-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-800 mb-1">
                      Portal Password (Min 4 chars)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Staff2026!"
                      value={newStaff.loginPassword}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, loginPassword: e.target.value })
                      }
                      className="w-full h-8 px-2.5 rounded-lg border border-indigo-200 bg-white text-gray-900 focus:outline-none focus:border-indigo-600 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
                >
                  Save &amp; Enroll Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Issue / Edit Security Keycard & PIN ── */}
      {isKeycardModalOpen && selectedStaffForKeycard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-gray-900">
                  Security Keycard &amp; POS PIN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKeycardModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKeycardSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <p className="font-bold text-gray-900 text-sm">
                  {selectedStaffForKeycard.name}
                </p>
                <p className="text-gray-500 text-[11px]">
                  {selectedStaffForKeycard.role} • {selectedStaffForKeycard.branch}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Access Keycard ID
                </label>
                <input
                  type="text"
                  required
                  value={selectedStaffForKeycard.accessCardId}
                  onChange={(e) =>
                    setSelectedStaffForKeycard({
                      ...selectedStaffForKeycard,
                      accessCardId: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white font-mono text-gray-900 font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Terminal PIN Status
                </label>
                <select
                  value={selectedStaffForKeycard.pinActive ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) =>
                    setSelectedStaffForKeycard({
                      ...selectedStaffForKeycard,
                      pinActive: e.target.value === "ACTIVE",
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="ACTIVE">PIN Active &amp; Verified</option>
                  <option value="INACTIVE">PIN Disabled / Requires Reset</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleRevokeKeycard(selectedStaffForKeycard)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Keycard &amp; PIN</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsKeycardModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
                  >
                    Update Keycard
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Manage Staff Portal Login & Password (Super Admin Control) ── */}
      {isLoginModalOpen && selectedStaffForLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-gray-900">
                  Staff Portal Login Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffLogin} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <p className="font-extrabold text-gray-900 text-sm">
                  {selectedStaffForLogin.name}
                </p>
                <p className="text-gray-600 text-[11px]">
                  Staff Code: <strong>{selectedStaffForLogin.staffCode}</strong> • {selectedStaffForLogin.role}
                </p>
                <p className="text-[10px] text-gray-500">
                  Branch: {selectedStaffForLogin.branch}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Assigned Business Subsidiary / Portal Access Scope<span className="text-rose-500">*</span>
                </label>
                <select
                  value={editLoginSubsidiary}
                  onChange={(e) => setEditLoginSubsidiary(e.target.value as ServiceSlug | "ALL")}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                >
                  <option value="ALL">All Companies (Full Platform Access)</option>
                  <option value={ServiceSlug.SPARK}>Zino Spark (POS Retail Only)</option>
                  <option value={ServiceSlug.APARTMENTS}>Zino Apartments (Hospitality Only)</option>
                  <option value={ServiceSlug.BUILDERS}>Top Builders (Materials Only)</option>
                  <option value={ServiceSlug.GALAXY}>Device Galaxy (E-Commerce Only)</option>
                  <option value={ServiceSlug.BILLSTACKS}>Billstacks (Accounting Only)</option>
                  <option value={ServiceSlug.VISITORS}>Visitor Management Only</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Staff will only see data, catalogs, and tools for the selected subsidiary. Select &quot;All Companies&quot; for full access.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Staff Login Identifier (Username or Email)<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editLoginUsername}
                  onChange={(e) => setEditLoginUsername(e.target.value)}
                  placeholder="e.g. chinedu.eze@zinogroup.com"
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white font-mono text-gray-900 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-gray-900">
                    Portal Login Password<span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = `Staff${Math.floor(1000 + Math.random() * 9000)}!`;
                      setEditLoginPassword(rand);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    required
                    value={editLoginPassword}
                    onChange={(e) => setEditLoginPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-9 px-3 pr-9 rounded-xl border border-gray-200 bg-white font-mono text-gray-900 text-xs focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Handover Credentials Card */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-gray-500 font-sans font-bold text-[10px] uppercase">
                  <span>Credentials To Hand Over To Staff</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Zino One Staff Portal Login\nUsername: ${editLoginUsername}\nPassword: ${editLoginPassword}\nLogin URL: http://localhost:3000/staff/login`
                      );
                      setCopiedLogin(true);
                      setTimeout(() => setCopiedLogin(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline cursor-pointer"
                  >
                    {copiedLogin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLogin ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Username:</span>
                  <strong className="text-gray-900">{editLoginUsername || "None"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Password:</span>
                  <strong className="text-gray-900">{editLoginPassword || "None"}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
                >
                  Save &amp; Activate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
