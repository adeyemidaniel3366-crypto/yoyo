import { describe, it, expect } from "vitest";
import { deriveSaleStatus } from "./sales";
import { computeExpectedDrawerCash } from "./drawer";
import { deriveInvoiceStatus } from "./invoicing";
import { rangesOverlap } from "./bookings";
import { canTransitionOrderStatus, computeCouponDiscount } from "./orders";
import { InvoiceStatus, OrderStatus, SaleStatus } from "@prisma/client";

describe("Domain Business Rules (§9)", () => {
  it("derives sale status strictly from money (§9.1)", () => {
    expect(deriveSaleStatus(100000, 100000)).toBe(SaleStatus.PAID);
    expect(deriveSaleStatus(100000, 150000)).toBe(SaleStatus.PAID);
    expect(deriveSaleStatus(100000, 50000)).toBe(SaleStatus.PART_PAID);
    expect(deriveSaleStatus(100000, 0)).toBe(SaleStatus.UNPAID);
  });

  it("computes expected cash drawer balance accurately (§9.7)", () => {
    const expected = computeExpectedDrawerCash({
      openingKobo: 5000000, // ₦50,000
      cashSalesKobo: 12000000, // ₦120,000
      cashReceivedKobo: 3000000, // ₦30,000
      cashExpensesKobo: 1500000, // ₦15,000
      cashRefundsKobo: 500000, // ₦5,000
    });
    // (50k + 120k + 30k) - (15k + 5k) = 200k - 20k = ₦180,000 = 18,000,000 kobo
    expect(expected).toBe(18000000);
  });

  it("derives invoice status from payments and dueDate (§9.2)", () => {
    expect(deriveInvoiceStatus(200000, 200000, InvoiceStatus.SENT)).toBe(InvoiceStatus.PAID);
    expect(deriveInvoiceStatus(200000, 50000, InvoiceStatus.SENT)).toBe(InvoiceStatus.PART_PAID);
    expect(deriveInvoiceStatus(200000, 0, InvoiceStatus.OVERDUE)).toBe(InvoiceStatus.OVERDUE);
    expect(deriveInvoiceStatus(200000, 200000, InvoiceStatus.OVERDUE)).toBe(InvoiceStatus.PAID);
    expect(deriveInvoiceStatus(200000, 50000, InvoiceStatus.CANCELLED)).toBe(InvoiceStatus.CANCELLED);
  });

  it("evaluates booking date range overlap logic (§9.4)", () => {
    const aStart = new Date("2026-11-20");
    const aEnd = new Date("2026-11-25");

    // Overlapping: 22nd to 28th
    expect(rangesOverlap(aStart, aEnd, new Date("2026-11-22"), new Date("2026-11-28"))).toBe(true);
    // Overlapping: 18th to 22nd
    expect(rangesOverlap(aStart, aEnd, new Date("2026-11-18"), new Date("2026-11-22"))).toBe(true);
    // Non-overlapping: strictly before
    expect(rangesOverlap(aStart, aEnd, new Date("2026-11-10"), new Date("2026-11-20"))).toBe(false);
    // Non-overlapping: strictly after
    expect(rangesOverlap(aStart, aEnd, new Date("2026-11-25"), new Date("2026-11-30"))).toBe(false);
  });

  it("enforces Galaxy order state machine transitions (§9.5)", () => {
    expect(canTransitionOrderStatus(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true);
    expect(canTransitionOrderStatus(OrderStatus.CONFIRMED, OrderStatus.PROCESSING)).toBe(true);
    expect(canTransitionOrderStatus(OrderStatus.PROCESSING, OrderStatus.SHIPPED)).toBe(true);
    expect(canTransitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(true);
    expect(canTransitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.REFUNDED)).toBe(true);

    // Illegal transitions rejected
    expect(canTransitionOrderStatus(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(false);
    expect(canTransitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
    expect(canTransitionOrderStatus(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toBe(false);
  });

  it("evaluates coupon discounts and validity rules (§9.5)", () => {
    const coupon = {
      discountPct: 10,
      discountKobo: null,
      minSpendKobo: 5000000, // ₦50,000
      maxUses: 10,
      usedCount: 2,
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2026-12-31"),
      isActive: true,
    };

    // Valid: ₦100,000 subtotal -> 10% = ₦10,000
    const check1 = computeCouponDiscount(coupon, 10000000);
    expect(check1.valid).toBe(true);
    expect(check1.discountKobo).toBe(1000000);

    // Invalid: below min spend (₦30,000 < ₦50,000)
    const check2 = computeCouponDiscount(coupon, 3000000);
    expect(check2.valid).toBe(false);

    // Invalid: usage limit reached
    const check3 = computeCouponDiscount({ ...coupon, usedCount: 10 }, 10000000);
    expect(check3.valid).toBe(false);
  });
});
