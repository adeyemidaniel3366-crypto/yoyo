"use client";

import React, { useState, useRef } from "react";
import {
  Plus,
  Check,
  ChevronLeft,
  Trash2,
  Building2,
  Upload,
  Lock,
  ShieldCheck,
  Users,
  Bold,
  Italic,
  Underline,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Mail,
} from "lucide-react";
import { BILLSTACKS_COUNTRIES } from "./billstacks-countries";
import { BillstacksBusiness } from "./billstacks-onboarding";

export interface BillstacksTeamUser {
  id: string;
  name: string;
  email: string;
  position: string;
  role: "Admin" | "Editor" | "Viewer";
  permissions: Record<string, "Full Access" | "Edit Only" | "View Only" | "No Access">;
}

export interface BillstacksInvoiceCustomization {
  templateId: number;
  accentColor: string;
  enableQrCode: boolean;
  enableProductStock: boolean;
  enableUnit: boolean;
  defaultInvoiceTitle: string;
  defaultInvoiceSummary: string;
  defaultInvoiceFooter: string;
  defaultEstimateTitle: string;
  defaultEstimateSummary: string;
  defaultEstimateFooter: string;
  footerAlign: "left" | "center" | "right";
}

export const DEFAULT_INVOICE_CUSTOMIZATION: BillstacksInvoiceCustomization = {
  templateId: 1,
  accentColor: "#2563EB",
  enableQrCode: true,
  enableProductStock: false,
  enableUnit: false,
  defaultInvoiceTitle: "INVOICE",
  defaultInvoiceSummary: "",
  defaultInvoiceFooter: "Thank you for your business.",
  defaultEstimateTitle: "ESTIMATE",
  defaultEstimateSummary: "",
  defaultEstimateFooter: "This estimate is valid for 30 days.",
  footerAlign: "left",
};

const BUSINESS_CATEGORIES = [
  "Retail & E-Commerce",
  "Technology & SaaS",
  "Accounting & Finance",
  "Hospitality & Apartments",
  "Construction & Building Materials",
  "Wholesale & Distribution",
  "Consulting & Agency",
  "Healthcare & Services",
  "Manufacturing & Logistics",
];

const PERMISSION_MODULES = [
  "Customers",
  "Products",
  "Estimates",
  "Invoices",
  "Expenses",
  "Bills",
  "Reports",
];

/* ============================================================================
   IMAGE 4: MANAGE BUSINESS + ADD NEW BUSINESS
   ============================================================================ */
export function BusinessManagementView({
  businesses,
  activeBusinessId,
  startInAddMode = false,
  onSelectActiveBusiness,
  onAddBusiness,
  onDeleteBusiness,
  showToast,
}: {
  businesses: BillstacksBusiness[];
  activeBusinessId: string;
  startInAddMode?: boolean;
  onSelectActiveBusiness: (id: string) => void;
  onAddBusiness: (biz: BillstacksBusiness) => void;
  onDeleteBusiness: (id: string) => void;
  showToast: (msg: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(startInAddMode);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    logoUrl: "",
    name: "",
    title: "",
    businessNumber: "",
    taxVatNumber: "",
    phone: "",
    address: "",
    category: "",
    country: "",
    priceFormat: "₦100",
    symbolDirection: "₦100 (Left)",
    priceSeparator: "₦ 1,000.00",
  });

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Please enter a Business Name.");
      return;
    }
    const cObj =
      BILLSTACKS_COUNTRIES.find((c) => c.name === form.country) || BILLSTACKS_COUNTRIES[0];
    const created: BillstacksBusiness = {
      id: `biz_${Date.now()}`,
      name: form.name.trim(),
      title: form.title.trim() || form.name.trim(),
      businessNumber: form.businessNumber.trim(),
      taxVatNumber: form.taxVatNumber.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      category: form.category || "General Business",
      country: cObj.name,
      currencyCode: cObj.currencyCode,
      currencySymbol: cObj.currencySymbol,
      priceFormat: form.priceFormat,
      symbolDirection: form.symbolDirection,
      priceSeparator: form.priceSeparator,
      logoUrl: form.logoUrl || undefined,
    };
    onAddBusiness(created);
    setForm({
      logoUrl: "",
      name: "",
      title: "",
      businessNumber: "",
      taxVatNumber: "",
      phone: "",
      address: "",
      category: "",
      country: "",
      priceFormat: "₦100",
      symbolDirection: "₦100 (Left)",
      priceSeparator: "₦ 1,000.00",
    });
    setIsAdding(false);
    showToast(`Business "${created.name}" created and ready!`);
  };

  if (isAdding) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-xs">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">Add New business</h3>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Upload Business Logo matching Image 4 */}
          <div className="flex justify-center">
            <div
              onClick={() => logoInputRef.current?.click()}
              className="relative w-52 h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center gap-1.5 bg-gray-50/50 transition-colors overflow-hidden"
            >
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Business logo preview"
                  className="max-h-24 max-w-44 object-contain"
                />
              ) : (
                <>
                  <Plus className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500 font-semibold">Upload Business logo</span>
                </>
              )}
              <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-600">
                <Upload className="w-3 h-3" />
              </span>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFile}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-gray-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Business Number</label>
              <input
                type="text"
                value={form.businessNumber}
                onChange={(e) => setForm({ ...form, businessNumber: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tax/Vat Number</label>
              <input
                type="text"
                value={form.taxVatNumber}
                onChange={(e) => setForm({ ...form, taxVatNumber: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-gray-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Address</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Categories</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
            >
              <option value="">Select business category</option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Country</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
            >
              <option value="">Select</option>
              {BILLSTACKS_COUNTRIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.currencyCode} - {c.currencySymbol})
                </option>
              ))}
            </select>
          </div>

          <div className="border-l-2 border-gray-200 pl-4 py-1 text-[11px] text-gray-500 leading-relaxed">
            This is your reporting currency and cannot be changed. You can still send invoices,
            track expenses and enter transactions in any currency and an exchange rate is applied
            for you.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Price Format</label>
              <select
                value={form.priceFormat}
                onChange={(e) => setForm({ ...form, priceFormat: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
              >
                <option value="₦100">₦100</option>
                <option value="₦100.00">₦100.00</option>
                <option value="$100">$100</option>
                <option value="$100.00">$100.00</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Symbol Direction</label>
              <select
                value={form.symbolDirection}
                onChange={(e) => setForm({ ...form, symbolDirection: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
              >
                <option value="₦100 (Left)">₦100 (Left)</option>
                <option value="100₦ (Right)">100₦ (Right)</option>
                <option value="$100 (Left)">$100 (Left)</option>
                <option value="100$ (Right)">100$ (Right)</option>
              </select>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block font-semibold text-gray-700 mb-1">Price Separator</label>
            <select
              value={form.priceSeparator}
              onChange={(e) => setForm({ ...form, priceSeparator: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
            >
              <option value="₦ 1,000.00">₦ 1,000.00</option>
              <option value="₦ 1.000,00">₦ 1.000,00</option>
              <option value="$ 1,000.00">$ 1,000.00</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-xs">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Manage Business</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Switch between your businesses or register a new company workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Business</span>
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {businesses.map((biz) => {
          const isActive = biz.id === activeBusinessId;
          return (
            <div
              key={biz.id}
              className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50/60"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  {biz.logoUrl ? (
                    <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm">{biz.name}</p>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {biz.category} · {biz.country} ({biz.currencyCode} {biz.currencySymbol})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => onSelectActiveBusiness(biz.id)}
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                  >
                    Switch Active
                  </button>
                )}
                {businesses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteBusiness(biz.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Business"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   IMAGE 5: MANAGE USERS / ROLE MANAGEMENT + ADD NEW USER
   ============================================================================ */
export function UserRoleManagementView({
  users,
  onAddUser,
  onDeleteUser,
  showToast,
}: {
  users: BillstacksTeamUser[];
  onAddUser: (user: BillstacksTeamUser) => void;
  onDeleteUser: (id: string) => void;
  showToast: (msg: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("Business Partner/Co-owner");
  const [role, setRole] = useState<"Admin" | "Editor" | "Viewer">("Admin");

  const defaultPermsForRole = (
    r: "Admin" | "Editor" | "Viewer"
  ): Record<string, "Full Access" | "Edit Only" | "View Only" | "No Access"> => {
    const level = r === "Admin" ? "Full Access" : r === "Editor" ? "Edit Only" : "View Only";
    return PERMISSION_MODULES.reduce(
      (acc, mod) => ({ ...acc, [mod]: level }),
      {} as Record<string, "Full Access" | "Edit Only" | "View Only" | "No Access">
    );
  };

  const [permissions, setPermissions] = useState<
    Record<string, "Full Access" | "Edit Only" | "View Only" | "No Access">
  >(() =>
    PERMISSION_MODULES.reduce(
      (acc, mod) => ({ ...acc, [mod]: "No Access" }),
      {} as Record<string, "Full Access" | "Edit Only" | "View Only" | "No Access">
    )
  );

  const handleRoleChange = (newRole: "Admin" | "Editor" | "Viewer") => {
    setRole(newRole);
    setPermissions(defaultPermsForRole(newRole));
  };

  const cyclePermission = (mod: string) => {
    const order: Array<"No Access" | "View Only" | "Edit Only" | "Full Access"> = [
      "No Access",
      "View Only",
      "Edit Only",
      "Full Access",
    ];
    const current = permissions[mod] || "No Access";
    const next = order[(order.indexOf(current) + 1) % order.length];
    setPermissions((prev) => ({ ...prev, [mod]: next }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter the user's name.");
      return;
    }
    const created: BillstacksTeamUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      position,
      role,
      permissions,
    };
    onAddUser(created);
    setName("");
    setEmail("");
    setIsAdding(false);
    showToast(`Added user "${created.name}" as ${created.role}!`);
  };

  if (isAdding) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-xs">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">Add new user</h3>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Column matching Image 5 */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Position at the business
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white"
              >
                <option value="Business Partner/Co-owner">Business Partner/Co-owner</option>
                <option value="Accountant">Accountant</option>
                <option value="Finance Manager">Finance Manager</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Operations Staff">Operations Staff</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block font-semibold text-gray-700">User Role</label>
              {(["Admin", "Editor", "Viewer"] as const).map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium"
                >
                  <input
                    type="radio"
                    name="userRole"
                    checked={role === r}
                    onChange={() => handleRoleChange(r)}
                    className="w-4 h-4 accent-[#28A745]"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Right Permissions Panel matching Image 5 */}
          <div className="lg:col-span-6 lg:border-l lg:border-gray-100 lg:pl-8 space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">{role} Permissions</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {role === "Admin"
                  ? "Best for a business partner, family member, or trusted accountant manager"
                  : role === "Editor"
                  ? "Can create and edit invoices, bills, products, and estimates"
                  : "Read-only visibility into reports and records (click any badge to customize)"}
              </p>
            </div>

            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {PERMISSION_MODULES.map((mod) => {
                const level = permissions[mod] || "No Access";
                return (
                  <div key={mod} className="py-3 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">{mod}</span>
                    <button
                      type="button"
                      onClick={() => cyclePermission(mod)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        level === "Full Access"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : level === "Edit Only"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : level === "View Only"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                      title="Click to toggle module access"
                    >
                      {level === "No Access" ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>{level}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-xs">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Manage Users</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Invite team members and assign role-based permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <th className="py-3 px-5">Name</th>
              <th className="py-3 px-5">Email</th>
              <th className="py-3 px-5">Position</th>
              <th className="py-3 px-5">Role</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/60">
                <td className="py-3 px-5 font-bold text-gray-900">{u.name}</td>
                <td className="py-3 px-5 text-gray-600">{u.email || "—"}</td>
                <td className="py-3 px-5 text-gray-700">{u.position}</td>
                <td className="py-3 px-5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === "Admin"
                        ? "bg-emerald-100 text-emerald-700"
                        : u.role === "Editor"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-5 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteUser(u.id)}
                    className="p-1.5 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Remove user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
   IMAGE 6: INVOICE CUSTOMIZATION VIEW
   ============================================================================ */
export function InvoiceCustomizationView({
  value,
  onSave,
}: {
  value: BillstacksInvoiceCustomization;
  onSave: (next: BillstacksInvoiceCustomization) => void;
}) {
  const [form, setForm] = useState<BillstacksInvoiceCustomization>(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-xs"
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm">Invoice Customization</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* 8 Visual Invoice Templates matching Image 6 */}
        <div className="space-y-3">
          <label className="block font-bold text-gray-700">Choose invoice templates</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((tpl) => {
              const selected = form.templateId === tpl;
              return (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setForm({ ...form, templateId: tpl })}
                  className={`p-2.5 rounded-xl border text-center transition-all space-y-2.5 ${
                    selected
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                  }`}
                >
                  {/* Miniature Invoice Visual Thumbnail */}
                  <div className="w-full aspect-[4/4.2] bg-white rounded-lg border border-gray-200 p-2 flex flex-col justify-between overflow-hidden shadow-2xs">
                    {tpl === 3 || tpl === 5 || tpl === 8 ? (
                      <div
                        className="h-4 rounded-xs w-full"
                        style={{ backgroundColor: form.accentColor }}
                      />
                    ) : tpl === 7 ? (
                      <div className="flex justify-between items-start">
                        <div className="w-6 h-2 rounded-xs bg-gray-200" />
                        <div
                          className="w-10 h-5 rounded-xs"
                          style={{ backgroundColor: form.accentColor }}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: form.accentColor }}
                        />
                        <div className="w-8 h-1.5 rounded bg-gray-200" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div
                        className="h-1.5 rounded-xs w-full"
                        style={{
                          backgroundColor:
                            tpl === 1 || tpl === 5 ? form.accentColor : "#E5E7EB",
                        }}
                      />
                      <div className="h-1 bg-gray-100 rounded w-5/6" />
                      <div className="h-1 bg-gray-100 rounded w-4/6" />
                      <div className="h-1 bg-gray-100 rounded w-full" />
                    </div>
                    <div className="flex justify-end">
                      <div className="w-7 h-1.5 rounded bg-gray-300" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 font-semibold text-gray-700">
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selected ? "border-[#28A745]" : "border-gray-400"
                      }`}
                    >
                      {selected && <span className="w-2 h-2 rounded-full bg-[#28A745]" />}
                    </span>
                    <span>Template {tpl}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color */}
        <div className="space-y-1.5">
          <label className="block font-bold text-gray-700">Accent color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
              className="w-24 h-9 rounded-lg border border-gray-200 cursor-pointer p-1 bg-white"
            />
            <span className="font-mono text-gray-600 uppercase">{form.accentColor}</span>
          </div>
        </div>

        {/* Feature Checkboxes matching Image 6 */}
        <div className="space-y-3.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enableQrCode}
              onChange={(e) => setForm({ ...form, enableQrCode: e.target.checked })}
              className="w-4 h-4 mt-0.5 accent-[#28A745]"
            />
            <div>
              <p className="font-semibold text-gray-800">Enable Invoice QR code</p>
              <p className="text-[11px] text-gray-500">
                Enable to generate and show QR code for all created invoices
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enableProductStock}
              onChange={(e) => setForm({ ...form, enableProductStock: e.target.checked })}
              className="w-4 h-4 mt-0.5 accent-[#28A745]"
            />
            <div>
              <p className="font-semibold text-gray-800">Enable product stock</p>
              <p className="text-[11px] text-gray-500">
                Enable this feature you will be able to manage your products stock in invoices.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enableUnit}
              onChange={(e) => setForm({ ...form, enableUnit: e.target.checked })}
              className="w-4 h-4 mt-0.5 accent-[#28A745]"
            />
            <div>
              <p className="font-semibold text-gray-800">Enable Unit</p>
              <p className="text-[11px] text-gray-500">
                Enable this feature you will be able to manage your products unit in invoices.
              </p>
            </div>
          </label>
        </div>

        {/* Default Invoice Settings & Default Estimate Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          {/* Left: Default Invoice Settings */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 pb-2 border-b border-gray-100">
              Default Invoice Settings
            </h4>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Invoice Title</label>
              <input
                type="text"
                value={form.defaultInvoiceTitle}
                onChange={(e) => setForm({ ...form, defaultInvoiceTitle: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Invoice Summary</label>
              <input
                type="text"
                value={form.defaultInvoiceSummary}
                onChange={(e) => setForm({ ...form, defaultInvoiceSummary: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Set default footer note for invoice
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-2.5 py-1.5 flex items-center gap-2 text-gray-600">
                  <Bold className="w-3.5 h-3.5" />
                  <Italic className="w-3.5 h-3.5" />
                  <Underline className="w-3.5 h-3.5" />
                  <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px]">
                    system-ui
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px]">
                    15
                  </span>
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <textarea
                  rows={4}
                  value={form.defaultInvoiceFooter}
                  onChange={(e) => setForm({ ...form, defaultInvoiceFooter: e.target.value })}
                  className="w-full p-3 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right: Default Estimate Settings */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 pb-2 border-b border-gray-100">
              Default Estimate Settings
            </h4>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Estimate Title</label>
              <input
                type="text"
                value={form.defaultEstimateTitle}
                onChange={(e) => setForm({ ...form, defaultEstimateTitle: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Estimate Summary</label>
              <input
                type="text"
                value={form.defaultEstimateSummary}
                onChange={(e) => setForm({ ...form, defaultEstimateSummary: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Set default footer note for estimate
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-2.5 py-1.5 flex items-center gap-2 text-gray-600">
                  <Bold className="w-3.5 h-3.5" />
                  <Italic className="w-3.5 h-3.5" />
                  <Underline className="w-3.5 h-3.5" />
                  <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px]">
                    system-ui
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px]">
                    15
                  </span>
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <textarea
                  rows={4}
                  value={form.defaultEstimateFooter}
                  onChange={(e) => setForm({ ...form, defaultEstimateFooter: e.target.value })}
                  className="w-full p-3 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer note text align matching Image 6 */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-700">Footer note text align</label>
          <div className="flex items-center gap-5">
            {(
              [
                { key: "left", icon: AlignLeft },
                { key: "center", icon: AlignCenter },
                { key: "right", icon: AlignRight },
              ] as const
            ).map(({ key, icon: Icon }) => (
              <label key={key} className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="footerAlign"
                  checked={form.footerAlign === key}
                  onChange={() => setForm({ ...form, footerAlign: key })}
                  className="w-4 h-4 accent-[#28A745]"
                />
                <Icon className="w-4 h-4 text-gray-600" />
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </form>
  );
}

/* ============================================================================
   ROLE PERMISSIONS MATRIX & EMAIL SETTINGS TABS
   ============================================================================ */
export function RolePermissionsMatrixView({ showToast }: { showToast: (msg: string) => void }) {
  const [matrix, setMatrix] = useState<Record<string, { admin: boolean; editor: boolean; viewer: boolean }>>(
    () =>
      PERMISSION_MODULES.reduce(
        (acc, m) => ({
          ...acc,
          [m]: { admin: true, editor: m !== "Reports", viewer: m === "Reports" || m === "Invoices" },
        }),
        {}
      )
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-xs">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-sm">Role Permissions Matrix</h3>
        </div>
        <button
          type="button"
          onClick={() => showToast("Role permissions matrix saved!")}
          className="px-4 py-1.5 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold"
        >
          Save Permissions
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
            <th className="py-3 px-6">Module</th>
            <th className="py-3 px-6 text-center">Admin</th>
            <th className="py-3 px-6 text-center">Editor</th>
            <th className="py-3 px-6 text-center">Viewer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {PERMISSION_MODULES.map((m) => (
            <tr key={m}>
              <td className="py-3 px-6 font-semibold text-gray-800">{m}</td>
              {(["admin", "editor", "viewer"] as const).map((r) => (
                <td key={r} className="py-3 px-6 text-center">
                  <input
                    type="checkbox"
                    checked={matrix[m][r]}
                    onChange={(e) =>
                      setMatrix((prev) => ({
                        ...prev,
                        [m]: { ...prev[m], [r]: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#28A745]"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmailSettingsView({ showToast }: { showToast: (msg: string) => void }) {
  const [senderName, setSenderName] = useState("Billstacks Billing");
  const [replyEmail, setReplyEmail] = useState("billing@zinoone.com");
  const [autoSend, setAutoSend] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-xs">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Mail className="w-4 h-4 text-emerald-600" />
        <h3 className="font-bold text-gray-900 text-sm">Email &amp; Invoice Delivery Settings</h3>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          showToast("Email delivery settings saved!");
        }}
        className="p-6 space-y-4 max-w-lg"
      >
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Sender Display Name</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Reply-To Email</label>
          <input
            type="email"
            value={replyEmail}
            onChange={(e) => setReplyEmail(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
          <input
            type="checkbox"
            checked={autoSend}
            onChange={(e) => setAutoSend(e.target.checked)}
            className="w-4 h-4 accent-[#28A745]"
          />
          <span>Automatically email PDF receipt to customer upon payment</span>
        </label>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#28A745] hover:bg-emerald-700 text-white font-bold shadow-xs"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Email Settings</span>
        </button>
      </form>
    </div>
  );
}
