import { describe, it, expect } from "vitest";
import {
  toKobo,
  fromKobo,
  fromKoboToString,
  addKobo,
  subKobo,
  mulKobo,
  calcTaxKobo,
  lineTotalKobo,
  formatNGN,
} from "./money";

describe("lib/money.ts — integer kobo math (§5.2)", () => {
  it("converts naira to integer kobo accurately", () => {
    expect(toKobo("1300.00")).toBe(130000);
    expect(toKobo("1300.50")).toBe(130050);
    expect(toKobo(1300.5)).toBe(130050);
    expect(toKobo("0.05")).toBe(5);
    expect(toKobo("-50.25")).toBe(-5025);
  });

  it("converts kobo to 2-decimal string for payment gateways", () => {
    expect(fromKoboToString(130000)).toBe("1300.00");
    expect(fromKoboToString(130050)).toBe("1300.50");
    expect(fromKoboToString(5)).toBe("0.05");
  });

  it("adds and subtracts integer kobo without floats", () => {
    expect(addKobo(1000, 2500, 50)).toBe(3550);
    expect(subKobo(5000, 1250)).toBe(3750);
  });

  it("calculates line totals with fractional quantities", () => {
    // 2.5 kg at ₦1,200 (120,000 kobo) = 300,000 kobo
    expect(lineTotalKobo(2.5, 120000)).toBe(300000);
    // 0.33 units at ₦100 (10,000 kobo) = 3,300 kobo
    expect(lineTotalKobo("0.33", 10000)).toBe(3300);
  });

  it("computes per-line tax in integer kobo with half-up rounding", () => {
    // ₦100,000 (10,000,000 kobo) * 7.5% = 750,000 kobo
    expect(calcTaxKobo(10000000, 7.5)).toBe(750000);
    // 10% tax on ₦65,000 (6,500,000 kobo) = 650,000 kobo
    expect(calcTaxKobo(6500000, 10)).toBe(650000);
  });

  it("formats currency as Nigerian Naira string", () => {
    const formatted = formatNGN(130000);
    expect(formatted).toContain("1,300.00");
  });
});
