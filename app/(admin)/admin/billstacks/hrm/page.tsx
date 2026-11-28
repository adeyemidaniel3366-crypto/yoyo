"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Plus, ArrowLeft, Search, DollarSign, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";

interface EmployeePayroll {
  id: string;
  name: string;
  role: string;
  department: string;
  salaryKobo: number;
  status: "ACTIVE" | "ON_LEAVE";
}

const EMPLOYEES: EmployeePayroll[] = [];

export default function BillstacksHrmPage() {
  const { recordTransaction } = usePlatformStore();
  const [employees] = useState<EmployeePayroll[]>(EMPLOYEES);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [payrollRun, setPayrollRun] = useState(false);

  const totalPayrollKobo = employees.reduce((acc, it) => acc + it.salaryKobo, 0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExecutePayroll = () => {
    recordTransaction({
      source: ServiceSlug.BILLSTACKS,
      activityType: "EXPENSE",
      activitySummary: `Staff Salary Payroll Disbursement for ${employees.length} personnel`,
      invoiceNo: `PAYROLL-${Date.now().toString().slice(-6)}`,
      customer: "Billstacks Staff Roster",
      amountKobo: totalPayrollKobo,
      location: "Corporate Finance Hub",
      status: "PAID",
    });

    setPayrollRun(true);
    setPayrollModalOpen(false);
    showToast(`Disbursed ${formatCurrency(totalPayrollKobo)} for ${employees.length} staff members! Synced to Financials.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-emerald-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/billstacks" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Billstacks Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">HRM &amp; Payroll Management</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Staff salary records, monthly payroll generation, and PAYE tax schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPayrollModalOpen(true)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition-opacity ${
            payrollRun ? "bg-emerald-600 hover:bg-emerald-700" : "bg-billstacks hover:opacity-90"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{payrollRun ? "Re-Run November Payroll" : "Run November Payroll"}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Staff Name</th>
                <th className="py-2.5">Designation</th>
                <th className="py-2.5">Department</th>
                <th className="py-2.5 text-right">Monthly Net (₦)</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{emp.name}</td>
                  <td className="py-3 text-muted">{emp.role}</td>
                  <td className="py-3 text-muted">{emp.department}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(emp.salaryKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll Modal */}
      {payrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-billstacks/10 flex items-center justify-center text-billstacks">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Run November 2026 Payroll</h3>
                  <p className="text-xs text-gray-500">Preview &amp; disburse monthly salary batch</p>
                </div>
              </div>
              <button
                onClick={() => setPayrollModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-2xl p-4 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Active Employees:</span>
                <span className="font-bold text-gray-900">{employees.length} Members</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Pay Period:</span>
                <span className="font-bold text-gray-900">01 Nov 2026 – 30 Nov 2026</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 border-t border-gray-200 pt-2">
                <span className="font-bold text-gray-900">Total Net Disbursement:</span>
                <span className="font-black text-sm text-billstacks">
                  {formatCurrency(totalPayrollKobo)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              Confirming will log the total disbursement as an operational expense under Billstacks and sync immediately to the executive dashboard summary.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPayrollModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePayroll}
                className="px-5 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold hover:opacity-95 shadow-sm"
              >
                Confirm &amp; Disburse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
