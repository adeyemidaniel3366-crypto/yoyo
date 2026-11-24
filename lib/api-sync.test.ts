import { describe, it, expect } from "vitest";
import { computeStoreFinancialTotals } from "./api-sync";
import { ServiceSlug } from "./constants";
import type { UnifiedInvoiceActivity, UnifiedProduct, UnifiedVisitorLog } from "./platform-store";

describe("api-sync store financial aggregation", () => {
  const sampleInvoices: UnifiedInvoiceActivity[] = [
    {
      id: "inv_1",
      source: ServiceSlug.SPARK,
      activityType: "SALE",
      activitySummary: "SSD Sale",
      invoiceNo: "SPK-001",
      customer: "Ada",
      amountKobo: 5000000, // ₦50,000
      amountDisplay: "₦50,000",
      status: "PAID",
      location: "Ikeja",
      createdAt: "2026-11-24",
    },
    {
      id: "inv_2",
      source: ServiceSlug.APARTMENTS,
      activityType: "BOOKING",
      activitySummary: "Suite 101",
      invoiceNo: "APT-001",
      customer: "Chidi",
      amountKobo: 12000000, // ₦120,000
      amountDisplay: "₦120,000",
      status: "PAID",
      location: "Lekki",
      createdAt: "2026-11-24",
    },
    {
      id: "inv_3",
      source: ServiceSlug.SPARK,
      activityType: "EXPENSE",
      activitySummary: "Diesel",
      invoiceNo: "EXP-001",
      customer: "Oando",
      amountKobo: 2000000, // ₦20,000
      amountDisplay: "₦20,000",
      status: "PAID",
      location: "Ikeja",
      createdAt: "2026-11-24",
    },
  ];

  const sampleProducts: UnifiedProduct[] = [
    {
      id: "p_1",
      source: ServiceSlug.SPARK,
      sku: "SKU-1",
      name: "SSD",
      label: "Storage",
      description: "",
      priceKobo: 5000000,
      priceDisplay: "₦50,000",
      imageUrl: "",
      images: [],
      status: "LOW_STOCK",
      totalStock: 2,
      lowStockAt: 5,
    },
  ];

  const sampleVisitors: UnifiedVisitorLog[] = [
    {
      id: "v_1",
      badgeNo: "VIS-01",
      name: "Tunde",
      phone: "08012345678",
      hostEmployee: "Admin",
      purpose: "Meeting",
      visitDate: "2026-11-24",
      visitTime: "10:00",
      checkIn: "2026-11-24, 10:00",
      checkOut: null,
      status: "CHECKED_IN",
    },
    {
      id: "v_2",
      badgeNo: "VIS-02",
      name: "Bola",
      phone: "08012345679",
      hostEmployee: "Admin",
      purpose: "Delivery",
      visitDate: "2026-11-24",
      visitTime: "09:00",
      checkIn: "2026-11-24, 09:00",
      checkOut: "09:30",
      status: "CHECKED_OUT",
    },
  ];

  it("computes consolidated revenue, expenses, net profit, bookings, visitors, and low stock", () => {
    const totals = computeStoreFinancialTotals(sampleInvoices, sampleProducts, sampleVisitors, "ALL");
    expect(totals.totalRevenueKobo).toBe(17000000);
    expect(totals.totalExpenseKobo).toBe(2000000);
    expect(totals.netProfitKobo).toBe(15000000);
    expect(totals.bookingsCount).toBe(1);
    expect(totals.visitorsCount).toBe(1);
    expect(totals.lowStockCount).toBe(1);
  });

  it("filters financials accurately by service scope", () => {
    const sparkTotals = computeStoreFinancialTotals(
      sampleInvoices,
      sampleProducts,
      sampleVisitors,
      ServiceSlug.SPARK
    );
    expect(sparkTotals.totalRevenueKobo).toBe(5000000);
    expect(sparkTotals.totalExpenseKobo).toBe(2000000);
    expect(sparkTotals.netProfitKobo).toBe(3000000);
    expect(sparkTotals.bookingsCount).toBe(0);
  });
});
