"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Receipt,
  UserCheck,
  X,
  CheckCircle2,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { SourceBadge } from "@/components/ui/source-badge";
import { Drawer } from "@/components/ui/drawer";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";
import { NumberInput } from "@/components/ui/number-input";

interface ContactRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  types: string[]; // Customer, Supplier, Guest, Visitor, Employee
  sources: ServiceSlug[];
  location: string;
  totalSpentKobo: number;
  totalOwedKobo: number;
  lastActivity: string;
}

export default function ContactsDirectoryPage() {
  const { recordTransaction } = usePlatformStore();
  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmountNaira, setPaymentAmountNaira] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    type: "Customer",
    location: "Lagos",
    source: ServiceSlug.BUILDERS,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Seed Contacts data from Top Builders, Spark, Apartments, Galaxy, Visitors
  const initialContactsData: ContactRow[] = [
    {
      id: "cnt_1",
      name: "Mama Bose Ventures",
      phone: "08000000104",
      email: "mamabose@venture.ng",
      types: ["Customer"],
      sources: [ServiceSlug.BUILDERS],
      location: "Iba Market, Lane 3",
      totalSpentKobo: 95000000,
      totalOwedKobo: 28130000, // ₦281,300 seed debtor
      lastActivity: "13/07/2026",
    },
    {
      id: "cnt_2",
      name: "Adewumi Builders",
      phone: "08000000101",
      email: "adewumi@builders.ng",
      types: ["Customer"],
      sources: [ServiceSlug.BUILDERS],
      location: "Plot 14, Okokomaiko, Ojo",
      totalSpentKobo: 184000000,
      totalOwedKobo: 14000000,
      lastActivity: "Today",
    },
    {
      id: "cnt_3",
      name: "Ibrahim & Sons Construction",
      phone: "08000000102",
      email: "ibrahim@sonsbuild.ng",
      types: ["Customer"],
      sources: [ServiceSlug.BUILDERS],
      location: "Alaba Rago Road, Ojo",
      totalSpentKobo: 320000000,
      totalOwedKobo: 12500000,
      lastActivity: "16 Nov 2026",
    },
    {
      id: "cnt_4",
      name: "Pastor Femi Adebayo",
      phone: "08000000103",
      email: "femi@christgrace.org",
      types: ["Customer", "Guest"],
      sources: [ServiceSlug.BUILDERS, ServiceSlug.APARTMENTS],
      location: "Christ Grace Church site, Iba",
      totalSpentKobo: 84000000,
      totalOwedKobo: 7200000,
      lastActivity: "04 Nov 2026",
    },
    {
      id: "cnt_5",
      name: "Chief Okonkwo",
      phone: "08000000105",
      email: "chief@okonkwo.ng",
      types: ["Customer", "Guest"],
      sources: [ServiceSlug.BUILDERS, ServiceSlug.APARTMENTS, ServiceSlug.GALAXY],
      location: "Lekki Phase 1 (site)",
      totalSpentKobo: 480000000,
      totalOwedKobo: 19500000,
      lastActivity: "17 Nov 2026",
    },
    {
      id: "cnt_6",
      name: "Kelechi & Co. Plumbing",
      phone: "08000000106",
      email: "kelechi@plumb.ng",
      types: ["Customer"],
      sources: [ServiceSlug.BUILDERS],
      location: "LASU Gate, Ojo",
      totalSpentKobo: 45000000,
      totalOwedKobo: 2200000,
      lastActivity: "10 Nov 2026",
    },
    {
      id: "cnt_7",
      name: "SanDisk Official West Africa",
      phone: "08011223344",
      email: "orders@sandisk-wa.com",
      types: ["Supplier"],
      sources: [ServiceSlug.SPARK],
      location: "Asset Corps Plaza, Ikeja",
      totalSpentKobo: 1240000000,
      totalOwedKobo: 32000000,
      lastActivity: "Yesterday",
    },
    {
      id: "cnt_8",
      name: "Engr. Tunde Bakare",
      phone: "08022334455",
      email: "tunde.bakare@structural.ng",
      types: ["Visitor", "Customer"],
      sources: [ServiceSlug.VISITORS, ServiceSlug.GALAXY],
      location: "Victoria Island",
      totalSpentKobo: 24500000,
      totalOwedKobo: 0,
      lastActivity: "1 hr ago",
    },
    {
      id: "cnt_9",
      name: "Dr. Chioma Nnadi",
      phone: "08033445566",
      email: "chioma.nnadi@medlag.org",
      types: ["Guest"],
      sources: [ServiceSlug.APARTMENTS],
      location: "Lekki Phase 1",
      totalSpentKobo: 15000000,
      totalOwedKobo: 0,
      lastActivity: "09 Nov 2026",
    },
    {
      id: "cnt_10",
      name: "John Doe",
      phone: "08099887766",
      email: "john.doe@zinoone.local",
      types: ["Employee"],
      sources: [ServiceSlug.VISITORS, ServiceSlug.BILLSTACKS],
      location: "HQ Office",
      totalSpentKobo: 0,
      totalOwedKobo: 0,
      lastActivity: "Today",
    },
  ];

  const columns: ColumnDef<ContactRow>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="sm" />
          <div>
            <span className="font-bold text-heading block leading-tight">{row.name}</span>
            <span className="text-[11px] text-muted block truncate max-w-[160px]">{row.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: "types",
      header: "Type",
      cell: (row) => (
        <div className="flex items-center flex-wrap gap-1">
          {row.types.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (row) => (
        <a
          href={`tel:${row.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-heading hover:text-active hover:underline"
        >
          {row.phone}
        </a>
      ),
    },
    {
      key: "sources",
      header: "Source(s)",
      cell: (row) => (
        <div className="flex items-center flex-wrap gap-1">
          {row.sources.map((s) => (
            <SourceBadge key={s} source={s} size="sm" />
          ))}
        </div>
      ),
    },
    {
      key: "totalSpentKobo",
      header: "Total Spent",
      align: "right",
      sortable: true,
      cell: (row) => formatCurrency(row.totalSpentKobo),
    },
    {
      key: "totalOwedKobo",
      header: "Total Owed",
      align: "right",
      sortable: true,
      cell: (row) => (
        <span
          className={
            row.totalOwedKobo > 0
              ? "text-rose-600 font-bold"
              : "text-muted"
          }
        >
          {formatCurrency(row.totalOwedKobo)}
        </span>
      ),
    },
    {
      key: "lastActivity",
      header: "Last Activity",
      sortable: true,
    },
  ];

  const [contactsList, setContactsList] = useState<ContactRow[]>(initialContactsData);

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    const created: ContactRow = {
      id: `cnt_${Date.now()}`,
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      email: newContact.email.trim() || `${newContact.name.toLowerCase().replace(/\s+/g, ".")}@client.ng`,
      types: [newContact.type],
      sources: [newContact.source],
      location: newContact.location || "Lagos",
      totalSpentKobo: 0,
      totalOwedKobo: 0,
      lastActivity: "Just now",
    };
    setContactsList([created, ...contactsList]);
    setAddModalOpen(false);
    setNewContact({ name: "", phone: "", email: "", type: "Customer", location: "Lagos", source: ServiceSlug.BUILDERS });
    showToast(`Added contact "${created.name}" successfully.`);
  };

  const handleReceivePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    const amountKobo = Math.round(Number(paymentAmountNaira || 0) * 100);
    if (amountKobo <= 0) return;

    const remainingOwed = Math.max(0, selectedContact.totalOwedKobo - amountKobo);
    const updated = {
      ...selectedContact,
      totalOwedKobo: remainingOwed,
      totalSpentKobo: selectedContact.totalSpentKobo + amountKobo,
      lastActivity: "Payment Today",
    };

    setContactsList(contactsList.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedContact(updated);

    recordTransaction({
      source: selectedContact.sources[0] || ServiceSlug.BUILDERS,
      activityType: "PAYMENT",
      activitySummary: `Debt settlement received from ${selectedContact.name}`,
      customer: selectedContact.name,
      amountKobo,
      location: selectedContact.location || "Accounts Desk",
      status: "PAID",
    });

    setPaymentModalOpen(false);
    setPaymentAmountNaira("");
    showToast(`Recorded payment of ${formatCurrency(amountKobo)} for ${selectedContact.name}.`);
  };

  const filteredData = contactsList.filter((c) => {
    if (filterType === "ALL") return true;
    if (filterType === "DEBTORS") return c.totalOwedKobo > 0;
    return c.types.includes(filterType);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-active" />
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Unified Contacts Directory
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Customers, suppliers, guests, visitors, and employees unified in one directory tagged with their sources.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-active text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {["ALL", "Customer", "Supplier", "Guest", "Visitor", "Employee", "DEBTORS"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterType === tab
                ? tab === "DEBTORS"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-heading text-white shadow-2xs"
                : "bg-white border border-border text-heading hover:bg-gray-50"
            }`}
          >
            {tab === "DEBTORS" ? "Debtors (Unpaid)" : tab === "ALL" ? "All Contacts" : `${tab}s`}
          </button>
        ))}
      </div>

      {/* Contacts Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        showSourceColumn={false}
        searchPlaceholder="Search by name, phone, or location..."
        onRowClick={(row) => setSelectedContact(row)}
      />

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={selectedContact?.name || "Contact Details"}
        description={selectedContact ? `Registered on ${selectedContact.sources.join(", ")}` : undefined}
      >
        {selectedContact && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-border">
              <Avatar name={selectedContact.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-heading text-base truncate">{selectedContact.name}</h4>
                <p className="text-xs text-muted truncate">{selectedContact.location}</p>
                <div className="flex items-center flex-wrap gap-1 mt-2">
                  {selectedContact.sources.map((s) => (
                    <SourceBadge key={s} source={s} size="sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <a
                href={`tel:${selectedContact.phone}`}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-border hover:bg-gray-50 font-semibold text-heading transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-active" />
                <span>Call Phone</span>
              </a>
              <a
                href={`mailto:${selectedContact.email}`}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-border hover:bg-gray-50 font-semibold text-heading transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-active" />
                <span>Send Email</span>
              </a>
            </div>

            {/* Financial summary */}
            <div className="p-4 rounded-xl border border-border bg-white space-y-2 text-xs">
              <h5 className="font-bold text-heading uppercase tracking-wider text-[11px]">
                Financial Summary
              </h5>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Total Spent Across Units:</span>
                <span className="font-bold text-heading">{formatCurrency(selectedContact.totalSpentKobo)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Outstanding Debt (Owed):</span>
                <span className={selectedContact.totalOwedKobo > 0 ? "font-bold text-rose-600" : "font-semibold text-muted"}>
                  {formatCurrency(selectedContact.totalOwedKobo)}
                </span>
              </div>
              {selectedContact.totalOwedKobo > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentAmountNaira(String(selectedContact.totalOwedKobo / 100));
                    setPaymentModalOpen(true);
                  }}
                  className="w-full mt-2 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                >
                  Receive Payment
                </button>
              )}
            </div>

            {/* Linked Records Grouped by Service */}
            <div className="space-y-4 text-xs">
              <h5 className="font-bold text-heading uppercase tracking-wider text-[11px]">
                Linked Activity Records
              </h5>

              {/* Builders Invoices */}
              {selectedContact.sources.includes(ServiceSlug.BUILDERS) && (
                <div className="p-3.5 rounded-xl border border-border bg-white space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-bold text-heading">Top Builders Invoices</span>
                    <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
                  </div>
                  <div className="flex items-center justify-between py-1 text-muted">
                    <span>INV-000104 · 13/07/2026</span>
                    <span className="font-bold text-rose-600">₦281,300 (Unpaid)</span>
                  </div>
                </div>
              )}

              {/* Apartments Bookings */}
              {selectedContact.sources.includes(ServiceSlug.APARTMENTS) && (
                <div className="p-3.5 rounded-xl border border-border bg-white space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-bold text-heading">Apartment Bookings</span>
                    <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
                  </div>
                  <div className="flex items-center justify-between py-1 text-muted">
                    <span>ZINO-482091 · Deluxe Studio</span>
                    <span className="font-bold text-emerald-600">₦30,000 (Paid)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Add Contact Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-heading space-y-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-extrabold text-base">Add New Contact</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-muted hover:text-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-heading mb-1">Full Name / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alaba Hardware Supplies"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-heading mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="080 1234 5678"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                  />
                </div>
                <div>
                  <label className="block font-bold text-heading mb-1">Contact Type</label>
                  <select
                    value={newContact.type}
                    onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                    className="w-full h-9 px-2 rounded-xl border border-border outline-none focus:border-active bg-white text-gray-900"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Guest">Guest</option>
                    <option value="Visitor">Visitor</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-heading mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@business.ng"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                />
              </div>
              <div>
                <label className="block font-bold text-heading mb-1">Associated Business Unit</label>
                <select
                  value={newContact.source}
                  onChange={(e) => setNewContact({ ...newContact, source: e.target.value as ServiceSlug })}
                  className="w-full h-9 px-2 rounded-xl border border-border outline-none focus:border-active bg-white text-gray-900"
                >
                  <option value={ServiceSlug.BUILDERS}>Top Builders (Yard)</option>
                  <option value={ServiceSlug.SPARK}>Zino Spark (Retail POS)</option>
                  <option value={ServiceSlug.APARTMENTS}>Zino Apartments (Hospitality)</option>
                  <option value={ServiceSlug.GALAXY}>Device Galaxy (Storefront)</option>
                  <option value={ServiceSlug.BILLSTACKS}>Billstacks (Cloud Invoicing)</option>
                  <option value={ServiceSlug.VISITORS}>Visitor Management (Front Desk)</option>
                </select>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-border font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-active text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-heading space-y-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-extrabold text-base">Record Debt Payment</h3>
                <p className="text-xs text-muted mt-0.5">{selectedContact.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-muted hover:text-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReceivePaymentSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <p className="text-[11px] font-bold uppercase">Current Outstanding Balance</p>
                <p className="text-lg font-black">{formatCurrency(selectedContact.totalOwedKobo)}</p>
              </div>
              <div>
                <label className="block font-bold text-heading mb-1">Amount to Receive (₦) *</label>
                <NumberInput
                  required
                  min={1}
                  allowDecimal
                  prefix="₦"
                  value={paymentAmountNaira}
                  onChange={(v) => setPaymentAmountNaira(v === "" ? "" : String(v))}
                  className="h-10 rounded-xl font-mono font-bold text-sm focus:border-emerald-600"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-border font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
